const { ethers } = require('ethers');

const CONTRACT_ADDRESS = "0x2aE943E41947954CD782698F906d95B7104562A1";
const RPC_URL = "https://1rpc.io/sepolia";

async function debugContract() {
  try {
    console.log("Connecting to Sepolia network...");
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    const contract = new ethers.Contract(CONTRACT_ADDRESS, [
      "function getHackathonCount() external view returns (uint256)",
      "function hackathons(uint256) external view returns (string name, string description, uint256 startTime, uint256 endTime, bool isActive, bool scoresAggregated, bool rankingsPublished, address organizer, uint256 projectCount, uint256 judgeCount, uint256 totalProjects, uint256 totalJudges)",
      "function registerProject(uint256 hackathonId, string name, string description) external"
    ], provider);
    
    console.log("Getting hackathon count...");
    const count = await contract.getHackathonCount();
    console.log("Hackathon count:", count.toString());
    
    for (let i = 0; i < Number(count); i++) {
      console.log(`\n=== Hackathon ${i} ===`);
      try {
        const hackathonData = await contract.hackathons(i);
        
        const startTime = Number(hackathonData[2]) * 1000;
        const endTime = Number(hackathonData[3]) * 1000;
        const currentTime = Date.now();
        
        console.log("Name:", hackathonData[0]);
        console.log("Description:", hackathonData[1]);
        console.log("Start Time:", new Date(startTime).toISOString());
        console.log("End Time:", new Date(endTime).toISOString());
        console.log("Current Time:", new Date(currentTime).toISOString());
        console.log("Is Active (contract):", hackathonData[4]);
        console.log("Is Active (calculated):", currentTime >= startTime && currentTime <= endTime);
        console.log("Scores Aggregated:", hackathonData[5]);
        console.log("Rankings Published:", hackathonData[6]);
        console.log("Organizer:", hackathonData[7]);
        console.log("Project Count:", hackathonData[10].toString());
        console.log("Judge Count:", hackathonData[11].toString());
        
        // Check if hackathon is still accepting projects
        const isInRegistrationPeriod = currentTime >= startTime && currentTime <= endTime;
        console.log("Can register projects:", isInRegistrationPeriod && !hackathonData[5] && !hackathonData[6]);
        
      } catch (error) {
        console.error(`Error getting hackathon ${i}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error("Error debugging contract:", error);
  }
}

debugContract();
