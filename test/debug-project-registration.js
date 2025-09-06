const { ethers } = require('ethers');

const CONTRACT_ADDRESS = "0x2aE943E41947954CD782698F906d95B7104562A1";
const RPC_URL = "https://1rpc.io/sepolia";

async function debugProjectRegistration() {
  try {
    console.log("Connecting to Sepolia network...");
    
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      console.error("Please set PRIVATE_KEY environment variable");
      return;
    }
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    const contract = new ethers.Contract(CONTRACT_ADDRESS, [
      "function registerProject(uint256 hackathonId, string name, string description) external",
      "function hackathons(uint256) external view returns (string name, string description, uint256 startTime, uint256 endTime, bool isActive, bool scoresAggregated, bool rankingsPublished, address organizer, uint256 projectCount, uint256 judgeCount, uint256 totalProjects, uint256 totalJudges)",
      "function getHackathonCount() external view returns (uint256)"
    ], wallet);
    
    console.log("Connected with wallet:", wallet.address);
    
    // Check all hackathons
    console.log("\n=== Checking All Hackathons ===");
    const count = await contract.getHackathonCount();
    console.log("Total hackathons:", count.toString());
    
    for (let i = 0; i < Number(count); i++) {
      console.log(`\n--- Hackathon ${i} ---`);
      try {
        const hackathonData = await contract.hackathons(i);
        const startTime = Number(hackathonData[2]) * 1000;
        const endTime = Number(hackathonData[3]) * 1000;
        const currentTime = Date.now();
        
        console.log("Name:", hackathonData[0]);
        console.log("Organizer:", hackathonData[7]);
        console.log("Is Active (contract):", hackathonData[4]);
        console.log("Is Active (calculated):", currentTime >= startTime && currentTime <= endTime);
        console.log("Scores Aggregated:", hackathonData[5]);
        console.log("Rankings Published:", hackathonData[6]);
        console.log("Project Count:", hackathonData[10].toString());
        console.log("Judge Count:", hackathonData[11].toString());
        console.log("Current wallet:", wallet.address);
        console.log("Is organizer:", hackathonData[7].toLowerCase() === wallet.address.toLowerCase());
        
        // Check if we can register projects
        const canRegister = currentTime >= startTime && currentTime <= endTime && 
                           !hackathonData[5] && !hackathonData[6] &&
                           hackathonData[7].toLowerCase() === wallet.address.toLowerCase();
        console.log("Can register projects:", canRegister);
        
        if (canRegister) {
          console.log(`\n=== Attempting to register project in hackathon ${i} ===`);
          try {
            // Try with a very simple project first
            const tx = await contract.registerProject(
              i,
              "Test Project",
              "A simple test project"
            );
            console.log("Transaction sent:", tx.hash);
            const receipt = await tx.wait();
            console.log("✅ Project registered successfully!");
            console.log("Gas used:", receipt.gasUsed.toString());
            break; // If successful, stop trying other hackathons
          } catch (error) {
            console.error("❌ Failed to register project:", error.message);
            
            // Try to get more details about the error
            if (error.data) {
              console.log("Error data:", error.data);
            }
            if (error.reason) {
              console.log("Error reason:", error.reason);
            }
          }
        }
      } catch (error) {
        console.error(`Error getting hackathon ${i}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error("Error:", error);
  }
}

debugProjectRegistration();
