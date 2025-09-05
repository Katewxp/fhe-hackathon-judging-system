const { ethers } = require('ethers');

const CONTRACT_ADDRESS = "0x2aE943E41947954CD782698F906d95B7104562A1";
const RPC_URL = "https://1rpc.io/sepolia";

async function testCreateHackathon() {
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
      "function createHackathon(string name, string description, uint256 startTime, uint256 endTime) external",
      "function getHackathonCount() external view returns (uint256)"
    ], wallet);
    
    console.log("Connected with wallet:", wallet.address);
    
    // Check current hackathon count
    const count = await contract.getHackathonCount();
    console.log("Current hackathon count:", count.toString());
    
    // Create a new hackathon
    console.log("\n=== Creating New Hackathon ===");
    const startTime = Math.floor(Date.now() / 1000); // Current time
    const endTime = startTime + (30 * 24 * 60 * 60); // 30 days from now
    
    try {
      const tx = await contract.createHackathon(
        "Test Hackathon for Projects",
        "A test hackathon to test project registration",
        startTime,
        endTime
      );
      console.log("Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("✅ Hackathon created successfully!");
      console.log("Gas used:", receipt.gasUsed.toString());
      
      // Check new count
      const newCount = await contract.getHackathonCount();
      console.log("New hackathon count:", newCount.toString());
      console.log("New hackathon ID:", (Number(newCount) - 1).toString());
      
    } catch (error) {
      console.error("❌ Failed to create hackathon:", error.message);
      
      if (error.data) {
        console.log("Error data:", error.data);
      }
      if (error.reason) {
        console.log("Error reason:", error.reason);
      }
      if (error.code) {
        console.log("Error code:", error.code);
      }
    }
    
  } catch (error) {
    console.error("Error:", error);
  }
}

testCreateHackathon();
