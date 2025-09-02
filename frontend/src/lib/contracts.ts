export const CONTRACT_ADDRESS = "0x2aE943E41947954CD782698F906d95B7104562A1";
export const CONTRACT_ABI = [
  // HackathonJudging ABI - matching deployed contract
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

export const NETWORK_CONFIG = {
  chainId: "0xaa36a7", // Sepolia: 11155111
  chainName: "Sepolia Testnet",
  nativeCurrency: {
    name: "Sepolia Ether",
    symbol: "SEP",
    decimals: 18,
  },
  rpcUrls: ["https://1rpc.io/sepolia"],
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
};
