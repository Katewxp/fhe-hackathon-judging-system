// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint8, externalEuint8} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title HackathonJudging
 * @dev A smart contract for managing hackathon judging with encrypted scores using FHE
 * @notice Judges submit encrypted scores, scores are aggregated homomorphically, and final rankings are decrypted
 */
contract HackathonJudging is SepoliaConfig {
    using FHE for *;

    // Events
    event HackathonCreated(uint256 indexed hackathonId, string name, uint256 startDay, uint256 endDay);
    event ProjectRegistered(uint256 indexed hackathonId, uint256 indexed projectId, string name, string description);
    event JudgeRegistered(uint256 indexed hackathonId, address indexed judge);
    event ScoreSubmitted(uint256 indexed hackathonId, uint256 indexed projectId, address indexed judge);
    event ScoresAggregated(uint256 indexed hackathonId, uint256 indexed projectId);
    event FinalRankingsPublished(uint256 indexed hackathonId);

    // Structs
    struct Hackathon {
        string name;
        string description;
        uint256 startDay; // Days since epoch
        uint256 endDay;   // Days since epoch
        bool isActive;
        bool scoresAggregated;
        bool rankingsPublished;
        address organizer;
        uint256 projectCount;
        uint256 judgeCount;
        uint256 totalProjects;
        uint256 totalJudges;
    }

    struct Project {
        string name;
        string description;
        string githubUrl;
        string demoUrl;
        address teamLead;
        bool isRegistered;
        euint8 totalScore;
        uint8 publicRank;
    }

    struct Judge {
        address judgeAddress;
        bool isRegistered;
        bool hasSubmittedAllScores;
        uint256 projectsScored;
    }

    // State variables
    Hackathon[] public hackathons;
    mapping(uint256 => mapping(uint256 => Project)) public projects; // hackathonId => projectId => Project
    mapping(uint256 => mapping(address => Judge)) public judges; // hackathonId => judgeAddress => Judge
    mapping(uint256 => address[]) public judgeAddresses; // hackathonId => array of judge addresses
    mapping(uint256 => mapping(uint256 => mapping(address => euint8))) public encryptedScores; // hackathonId => projectId => judgeAddress => encryptedScore
    mapping(uint256 => mapping(uint256 => mapping(address => bool))) public scoreSubmitted; // hackathonId => projectId => judgeAddress => submitted
    mapping(uint256 => mapping(uint256 => euint8)) public aggregatedScores; // hackathonId => projectId => aggregatedScore
    mapping(uint256 => uint256[]) public projectRankings; // hackathonId => sorted projectIds by rank

    // Modifiers
    modifier onlyOrganizer(uint256 hackathonId) {
        require(hackathons[hackathonId].organizer == msg.sender, "Only organizer can call this function");
        _;
    }

    modifier onlyJudge(uint256 hackathonId) {
        require(judges[hackathonId][msg.sender].isRegistered, "Only registered judges can call this function");
        _;
    }

    modifier hackathonExists(uint256 hackathonId) {
        require(hackathonId < hackathons.length, "Hackathon does not exist");
        _;
    }

    modifier hackathonActive(uint256 hackathonId) {
        require(hackathonId < hackathons.length, "Hackathon does not exist");
        require(block.timestamp / 1 days >= hackathons[hackathonId].startDay, "Hackathon has not started");
        require(block.timestamp / 1 days <= hackathons[hackathonId].endDay, "Hackathon has ended");
        _;
    }

    modifier projectExists(uint256 hackathonId, uint256 projectId) {
        require(projectId < hackathons[hackathonId].totalProjects, "Project does not exist");
        _;
    }

    /**
     * @dev Create a new hackathon
     * @param name Name of the hackathon
     * @param description Description of the hackathon
     * @param startDay Start day of the hackathon (days since epoch)
     * @param endDay End day of the hackathon (days since epoch)
     */
    function createHackathon(
        string memory name,
        string memory description,
        uint256 startDay,
        uint256 endDay
    ) external {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(startDay >= block.timestamp / 1 days, "Start day must be in the future");
        require(endDay > startDay, "End day must be after start day");

        uint256 hackathonId = hackathons.length;
        hackathons.push(Hackathon({
            name: name,
            description: description,
            startDay: startDay,
            endDay: endDay,
            isActive: true,
            scoresAggregated: false,
            rankingsPublished: false,
            organizer: msg.sender,
            projectCount: 0,
            judgeCount: 0,
            totalProjects: 0,
            totalJudges: 0
        }));

        emit HackathonCreated(hackathonId, name, startDay, endDay);
    }

    /**
     * @dev Register a new project for a hackathon
     * @param hackathonId ID of the hackathon
     * @param name Name of the project
     * @param description Description of the project
     * @param githubUrl GitHub URL of the project
     * @param demoUrl Demo URL of the project
     */
    function registerProject(
        uint256 hackathonId,
        string memory name,
        string memory description,
        string memory githubUrl,
        string memory demoUrl
    ) external hackathonExists(hackathonId) hackathonActive(hackathonId) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");

        uint256 projectId = hackathons[hackathonId].totalProjects;
        projects[hackathonId][projectId] = Project({
            name: name,
            description: description,
            githubUrl: githubUrl,
            demoUrl: demoUrl,
            teamLead: msg.sender,
            isRegistered: true,
            totalScore: FHE.asEuint8(0),
            publicRank: 0
        });

        hackathons[hackathonId].totalProjects++;
        hackathons[hackathonId].projectCount++;

        emit ProjectRegistered(hackathonId, projectId, name, description);
    }

    /**
     * @dev Register a judge for a hackathon
     * @param hackathonId ID of the hackathon
     * @param judgeAddress Address of the judge
     */
    function registerJudge(
        uint256 hackathonId,
        address judgeAddress
    ) external hackathonExists(hackathonId) onlyOrganizer(hackathonId) {
        require(judgeAddress != address(0), "Invalid judge address");
        require(!judges[hackathonId][judgeAddress].isRegistered, "Judge already registered");

        judges[hackathonId][judgeAddress] = Judge({
            judgeAddress: judgeAddress,
            isRegistered: true,
            hasSubmittedAllScores: false,
            projectsScored: 0
        });

        judgeAddresses[hackathonId].push(judgeAddress);
        hackathons[hackathonId].judgeCount++;

        emit JudgeRegistered(hackathonId, judgeAddress);
    }

    /**
     * @dev Submit an encrypted score for a project
     * @param hackathonId ID of the hackathon
     * @param projectId ID of the project
     * @param encryptedScore Encrypted score using FHE
     * @param proof Proof for the encrypted score
     */
    function submitScore(
        uint256 hackathonId,
        uint256 projectId,
        externalEuint8 encryptedScore,
        bytes calldata proof
    ) external hackathonExists(hackathonId) onlyJudge(hackathonId) projectExists(hackathonId, projectId) {
        require(!scoreSubmitted[hackathonId][projectId][msg.sender], "Score already submitted for this project");

        euint8 score = FHE.fromExternal(encryptedScore, proof);
        encryptedScores[hackathonId][projectId][msg.sender] = score;
        scoreSubmitted[hackathonId][projectId][msg.sender] = true;

        // Update judge's project count
        judges[hackathonId][msg.sender].projectsScored++;
        
        // Check if judge has submitted all scores
        if (judges[hackathonId][msg.sender].projectsScored == hackathons[hackathonId].totalProjects) {
            judges[hackathonId][msg.sender].hasSubmittedAllScores = true;
        }

        // Critical FHE permissions - must be set for the score to be usable
        FHE.allow(score, msg.sender);
        FHE.allowThis(score);

        emit ScoreSubmitted(hackathonId, projectId, msg.sender);
    }

    /**
     * @dev Check if all judges have submitted scores and aggregation is ready
     * @param hackathonId ID of the hackathon
     * @return True if ready for aggregation
     */
    function areScoresReadyForAggregation(
        uint256 hackathonId
    ) internal view hackathonExists(hackathonId) returns (bool) {
        if (hackathons[hackathonId].judgeCount == 0) return false;
        
        address[] memory judgeList = judgeAddresses[hackathonId];
        for (uint256 i = 0; i < judgeList.length; i++) {
            if (!judges[hackathonId][judgeList[i]].hasSubmittedAllScores) {
                return false;
            }
        }
        return true;
    }

    /**
     * @dev Aggregate scores for a project using FHE
     * @param hackathonId ID of the hackathon
     * @param projectId ID of the project
     */
    function aggregateScores(
        uint256 hackathonId,
        uint256 projectId
    ) external hackathonExists(hackathonId) projectExists(hackathonId, projectId) {
        require(areScoresReadyForAggregation(hackathonId), "Not all judges have submitted scores");
        require(!hackathons[hackathonId].scoresAggregated, "Scores already aggregated");

        euint8 totalScore = FHE.asEuint8(0);
        
        // Iterate through all registered judges
        address[] memory judgeList = judgeAddresses[hackathonId];
        for (uint256 i = 0; i < judgeList.length; i++) {
            address judge = judgeList[i];
            if (scoreSubmitted[hackathonId][projectId][judge]) {
                totalScore = FHE.add(totalScore, encryptedScores[hackathonId][projectId][judge]);
            }
        }

        aggregatedScores[hackathonId][projectId] = totalScore;
        projects[hackathonId][projectId].totalScore = totalScore;
        
        // Critical FHE permissions - must be set for the aggregated score to be usable
        FHE.allowThis(totalScore);

        emit ScoresAggregated(hackathonId, projectId);
    }

    /**
     * @dev Publish final rankings for a hackathon
     * @param hackathonId ID of the hackathon
     * @param projectIds Array of project IDs in ranking order
     */
    function publishRankings(
        uint256 hackathonId,
        uint256[] calldata projectIds
    ) external hackathonExists(hackathonId) onlyOrganizer(hackathonId) {
        require(hackathons[hackathonId].scoresAggregated, "Scores must be aggregated first");
        require(!hackathons[hackathonId].rankingsPublished, "Rankings already published");
        require(projectIds.length == hackathons[hackathonId].totalProjects, "Invalid number of projects");

        projectRankings[hackathonId] = projectIds;
        
        // Set public ranks for projects
        for (uint256 i = 0; i < projectIds.length; i++) {
            require(projectIds[i] < hackathons[hackathonId].totalProjects, "Invalid project ID");
            projects[hackathonId][projectIds[i]].publicRank = uint8(i + 1);
        }

        hackathons[hackathonId].rankingsPublished = true;
        hackathons[hackathonId].isActive = false;

        emit FinalRankingsPublished(hackathonId);
    }

    /**
     * @dev Get judge's encrypted score for a project
     * @param hackathonId ID of the hackathon
     * @param projectId ID of the project
     * @param judgeAddress Address of the judge
     * @return Encrypted score
     */
    function getJudgeScore(
        uint256 hackathonId,
        uint256 projectId,
        address judgeAddress
    ) external view hackathonExists(hackathonId) projectExists(hackathonId, projectId) returns (euint8) {
        require(judges[hackathonId][judgeAddress].isRegistered, "Judge not registered");
        return encryptedScores[hackathonId][projectId][judgeAddress];
    }

    /**
     * @dev Get aggregated score for a project
     * @param hackathonId ID of the hackathon
     * @param projectId ID of the project
     * @return Aggregated score
     */
    function getAggregatedScore(
        uint256 hackathonId,
        uint256 projectId
    ) external view hackathonExists(hackathonId) projectExists(hackathonId, projectId) returns (euint8) {
        return aggregatedScores[hackathonId][projectId];
    }

    /**
     * @dev Get project rankings for a hackathon
     * @param hackathonId ID of the hackathon
     * @return Array of project IDs in ranking order
     */
    function getProjectRankings(
        uint256 hackathonId
    ) external view hackathonExists(hackathonId) returns (uint256[] memory) {
        return projectRankings[hackathonId];
    }

    /**
     * @dev Get hackathon details
     * @param hackathonId ID of the hackathon
     * @return name Hackathon name
     * @return description Hackathon description
     * @return startDay Start day of the hackathon
     * @return endDay End day of the hackathon
     * @return isActive Whether the hackathon is active
     * @return scoresAggregated Whether scores have been aggregated
     * @return rankingsPublished Whether rankings have been published
     * @return organizer Address of the organizer
     * @return projectCount Number of registered projects
     * @return judgeCount Number of registered judges
     * @return totalProjects Total number of projects
     * @return totalJudges Total number of judges
     */
    function getHackathon(
        uint256 hackathonId
    ) external view hackathonExists(hackathonId) returns (
        string memory name,
        string memory description,
        uint256 startDay,
        uint256 endDay,
        bool isActive,
        bool scoresAggregated,
        bool rankingsPublished,
        address organizer,
        uint256 projectCount,
        uint256 judgeCount,
        uint256 totalProjects,
        uint256 totalJudges
    ) {
        Hackathon memory hackathon = hackathons[hackathonId];
        return (
            hackathon.name,
            hackathon.description,
            hackathon.startDay,
            hackathon.endDay,
            hackathon.isActive,
            hackathon.scoresAggregated,
            hackathon.rankingsPublished,
            hackathon.organizer,
            hackathon.projectCount,
            hackathon.judgeCount,
            hackathon.totalProjects,
            hackathon.totalJudges
        );
    }

    /**
     * @dev Get project details
     * @param hackathonId ID of the hackathon
     * @param projectId ID of the project
     * @return name Project name
     * @return description Project description
     * @return githubUrl GitHub URL
     * @return demoUrl Demo URL
     * @return teamLead Team lead address
     * @return isRegistered Whether the project is registered
     * @return publicRank Public ranking of the project
     */
    function getProject(
        uint256 hackathonId,
        uint256 projectId
    ) external view hackathonExists(hackathonId) projectExists(hackathonId, projectId) returns (
        string memory name,
        string memory description,
        string memory githubUrl,
        string memory demoUrl,
        address teamLead,
        bool isRegistered,
        uint8 publicRank
    ) {
        Project memory project = projects[hackathonId][projectId];
        return (
            project.name,
            project.description,
            project.githubUrl,
            project.demoUrl,
            project.teamLead,
            project.isRegistered,
            project.publicRank
        );
    }

    /**
     * @dev Get judge details
     * @param hackathonId ID of the hackathon
     * @param judgeAddress Address of the judge
     * @return judgeAddr Judge address
     * @return isRegistered Whether the judge is registered
     * @return hasSubmittedAllScores Whether the judge has submitted all scores
     * @return projectsScored Number of projects scored by the judge
     */
    function getJudge(
        uint256 hackathonId,
        address judgeAddress
    ) external view hackathonExists(hackathonId) returns (
        address judgeAddr,
        bool isRegistered,
        bool hasSubmittedAllScores,
        uint256 projectsScored
    ) {
        Judge memory judge = judges[hackathonId][judgeAddress];
        return (
            judge.judgeAddress,
            judge.isRegistered,
            judge.hasSubmittedAllScores,
            judge.projectsScored
        );
    }

    /**
     * @dev Get all judge addresses for a hackathon
     * @param hackathonId ID of the hackathon
     * @return Array of judge addresses
     */
    function getJudgeAddresses(
        uint256 hackathonId
    ) external view hackathonExists(hackathonId) returns (address[] memory) {
        return judgeAddresses[hackathonId];
    }

    /**
     * @dev Get total number of hackathons
     * @return Total hackathon count
     */
    function getHackathonCount() external view returns (uint256) {
        return hackathons.length;
    }

    /**
     * @dev Check if a judge has submitted all scores for a hackathon
     * @param hackathonId ID of the hackathon
     * @param judgeAddress Address of the judge
     * @return True if all scores submitted
     */
    function hasJudgeSubmittedAllScores(
        uint256 hackathonId,
        address judgeAddress
    ) external view hackathonExists(hackathonId) returns (bool) {
        return judges[hackathonId][judgeAddress].hasSubmittedAllScores;
    }
}
