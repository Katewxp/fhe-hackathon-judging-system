const { ethers } = require('ethers');

const CONTRACT_ADDRESS = "0x2aE943E41947954CD782698F906d95B7104562A1";
const RPC_URL = "https://1rpc.io/sepolia";

async function debugContractLimits() {
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
      "function hackathons(uint256) external view returns (string name, string description, uint256 startTime, uint256 endTime, bool isActive, bool scoresAggregated, bool rankingsPublished, address organizer, uint256 projectCount, uint256 judgeCount, uint256 totalProjects, uint256 totalJudges)",
      "function getHackathonCount() external view returns (uint256)",
      "function registerProject(uint256 hackathonId, string name, string description) external",
      // Try to find any constants or limits
      "function MAX_PROJECTS_PER_HACKATHON() external view returns (uint256)",
      "function MAX_JUDGES_PER_HACKATHON() external view returns (uint256)",
      "function registrationFee() external view returns (uint256)",
      "function isRegistrationOpen(uint256 hackathonId) external view returns (bool)"
    ], wallet);
    
    console.log("Connected with wallet:", wallet.address);
    
    // Check hackathon 2 in detail
    console.log("\n=== Detailed Analysis of Hackathon 2 ===");
    const hackathonData = await contract.hackathons(2);
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
    console.log("Total Projects:", hackathonData[10].toString());
    console.log("Total Judges:", hackathonData[11].toString());
    
    // Check if we're the organizer
    const isOrganizer = hackathonData[7].toLowerCase() === wallet.address.toLowerCase();
    console.log("Is organizer:", isOrganizer);
    
    // Check various contract constants/limits
    console.log("\n=== Checking Contract Limits ===");
    try {
      const maxProjects = await contract.MAX_PROJECTS_PER_HACKATHON();
      console.log("Max projects per hackathon:", maxProjects.toString());
    } catch (error) {
      console.log("MAX_PROJECTS_PER_HACKATHON not found or not accessible");
    }
    
    try {
      const maxJudges = await contract.MAX_JUDGES_PER_HACKATHON();
      console.log("Max judges per hackathon:", maxJudges.toString());
    } catch (error) {
      console.log("MAX_JUDGES_PER_HACKATHON not found or not accessible");
    }
    
    try {
      const fee = await contract.registrationFee();
      console.log("Registration fee:", ethers.formatEther(fee), "ETH");
    } catch (error) {
      console.log("registrationFee not found or not accessible");
    }
    
    try {
      const isOpen = await contract.isRegistrationOpen(2);
      console.log("Is registration open:", isOpen);
    } catch (error) {
      console.log("isRegistrationOpen not found or not accessible");
    }
    
    // Check wallet balance
    const balance = await provider.getBalance(wallet.address);
    console.log("Wallet balance:", ethers.formatEther(balance), "ETH");
    
    // Try to understand why registration fails
    console.log("\n=== Analysis ===");
    const canRegister = currentTime >= startTime && currentTime <= endTime && 
                       !hackathonData[5] && !hackathonData[6] &&
                       isOrganizer;
    console.log("Should be able to register:", canRegister);
    
    if (!canRegister) {
      console.log("Reasons why registration might fail:");
      if (currentTime < startTime) console.log("- Hackathon hasn't started yet");
      if (currentTime > endTime) console.log("- Hackathon has ended");
      if (hackathonData[5]) console.log("- Scores already aggregated");
      if (hackathonData[6]) console.log("- Rankings already published");
      if (!isOrganizer) console.log("- Not the organizer");
    }
    
  } catch (error) {
    console.error("Error:", error);
  }
}

debugContractLimits();
