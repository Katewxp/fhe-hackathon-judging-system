import { ethers } from "hardhat";

async function main() {
  console.log("Testing frontend ABI...");

  const contractAddress = "0x2aE943E41947954CD782698F906d95B7104562A1";
  
  // Frontend ABI
  const frontendABI = [
    "function createHackathon(string name, string description, uint256 startTime, uint256 endTime) external",
    "function registerProject(uint256 hackathonId, string name, string description) external",
    "function registerJudge(uint256 hackathonId, address judgeAddress) external",
    "function submitScore(uint256 hackathonId, uint256 projectId, bytes calldata encryptedScore, bytes calldata proof) external",
    "function aggregateScores(uint256 hackathonId, uint256 projectId) external",
    "function publishRankings(uint256 hackathonId, uint256[] calldata projectIds) external",
    "function getHackathonCount() external view returns (uint256)",
    "function getHackathon(uint256 hackathonId) external view returns (string name, string description, uint256 startTime, uint256 endTime, bool isActive, bool scoresAggregated, bool rankingsPublished, address organizer, uint256 projectCount, uint256 judgeCount, uint256 totalProjects, uint256 totalJudges)",
    "function getProject(uint256 hackathonId, uint256 projectId) external view returns (string name, string description, string githubUrl, string demoUrl, address teamLead, bool isRegistered, uint8 publicRank)",
    "function getJudge(uint256 hackathonId, address judgeAddress) external view returns (address judgeAddr, bool isRegistered, bool hasSubmittedAllScores, uint256 projectsScored)",
    "function getJudgeAddresses(uint256 hackathonId) external view returns (address[])",
    "function areScoresReadyForAggregation(uint256 hackathonId) external view returns (bool)",
    "function hasJudgeSubmittedAllScores(uint256 hackathonId, address judgeAddress) external view returns (bool)",
    // Public mapping accessors
    "function hackathons(uint256) external view returns (string name, string description, uint256 startTime, uint256 endTime, bool isActive, bool scoresAggregated, bool rankingsPublished, address organizer, uint256 projectCount, uint256 judgeCount, uint256 totalProjects, uint256 totalJudges)",
    "function projects(uint256, uint256) external view returns (string name, string description, string githubUrl, string demoUrl, address teamLead, bool isRegistered, uint8 publicRank)",
    "function judges(uint256, address) external view returns (address judgeAddr, bool isRegistered, bool hasSubmittedAllScores, uint256 projectsScored)"
  ];
  
  try {
    // Create contract instance with frontend ABI
    const provider = new ethers.JsonRpcProvider("https://1rpc.io/sepolia");
    const contract = new ethers.Contract(contractAddress, frontendABI, provider);

    console.log("Contract address:", contractAddress);
    
    // Test 1: Get hackathon count
    console.log("\n1. Testing getHackathonCount...");
    const hackathonCount = await contract.getHackathonCount();
    console.log("✅ Hackathon count:", hackathonCount.toString());
    
    if (hackathonCount > 0) {
      // Test 2: Try to access hackathons mapping
      console.log("\n2. Testing hackathons mapping access...");
      try {
        const hackathonData = await contract.hackathons(0);
        console.log("✅ hackathons(0) works:", {
          name: hackathonData[0],
          description: hackathonData[1],
          startTime: hackathonData[2].toString(),
          endTime: hackathonData[3].toString()
        });
      } catch (error) {
        console.log("❌ hackathons(0) failed:", error.message);
      }
      
      // Test 3: Try getHackathon function
      console.log("\n3. Testing getHackathon function...");
      try {
        const hackathonData = await contract.getHackathon(0);
        console.log("✅ getHackathon(0) works:", {
          name: hackathonData[0],
          description: hackathonData[1],
          startTime: hackathonData[2].toString(),
          endTime: hackathonData[3].toString()
        });
      } catch (error) {
        console.log("❌ getHackathon(0) failed:", error.message);
      }
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
