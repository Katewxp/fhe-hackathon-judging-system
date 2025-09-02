import { ethers } from "hardhat";

async function main() {
  console.log("Testing deployed HackathonJudging contract...");
  
  // Contract address on Sepolia
  const contractAddress = "0x2aE943E41947954CD782698F906d95B7104562A1";
  
  // Get the contract factory
  const HackathonJudging = await ethers.getContractFactory("HackathonJudging");
  
  // Attach to deployed contract
  const contract = HackathonJudging.attach(contractAddress);
  
  try {
    // Test basic contract interaction
    console.log("Contract address:", contractAddress);
    
    // Get initial hackathon count
    const hackathonCount = await contract.getHackathonCount();
    console.log("Initial hackathon count:", hackathonCount.toString());
    
    console.log("✅ Contract is working correctly on Sepolia!");
    
    // Test creating a hackathon
    console.log("\nTesting hackathon creation...");
    const currentTime = Math.floor(Date.now() / 1000);
    const startTime = currentTime + 3600; // 1 hour from now
    const endTime = startTime + 86400; // 24 hours later
    
    const tx = await contract.createHackathon(
      "Test Hackathon 2025",
      "A test hackathon for FHE judging system",
      startTime,
      endTime
    );
    
    console.log("Hackathon creation transaction hash:", tx.hash);
    await tx.wait();
    console.log("✅ Hackathon created successfully!");
    
    // Check hackathon count again
    const newHackathonCount = await contract.getHackathonCount();
    console.log("New hackathon count:", newHackathonCount.toString());
    
  } catch (error) {
    console.error("❌ Error testing contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
