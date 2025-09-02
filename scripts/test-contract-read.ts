import { ethers } from "hardhat";

async function main() {
  console.log("Testing contract read operations...");

  // Contract address from deployment
  const contractAddress = "0x2aE943E41947954CD782698F906d95B7104562A1";
  
  // Get contract instance
  const HackathonJudging = await ethers.getContractFactory("HackathonJudging");
  const contract = HackathonJudging.attach(contractAddress);

  try {
    // Test basic contract calls
    console.log("Contract address:", contractAddress);
    
    // Get hackathon count
    const hackathonCount = await contract.getHackathonCount();
    console.log("Hackathon count:", hackathonCount.toString());
    
    if (hackathonCount > 0) {
      // Get first hackathon details using direct mapping access
      const hackathon = await contract.hackathons(0);
      console.log("First hackathon details:");
      console.log("  Name:", hackathon[0]);
      console.log("  Description:", hackathon[1]);
      console.log("  Start time:", new Date(Number(hackathon[2]) * 1000).toISOString());
      console.log("  End time:", new Date(Number(hackathon[3]) * 1000).toISOString());
      console.log("  Is active:", hackathon[4]);
      console.log("  Scores aggregated:", hackathon[5]);
      console.log("  Rankings published:", hackathon[6]);
      console.log("  Organizer:", hackathon[7]);
      console.log("  Project count:", hackathon[8].toString());
      console.log("  Judge count:", hackathon[9].toString());
      console.log("  Total projects:", hackathon[10].toString());
      console.log("  Total judges:", hackathon[11].toString());
    }
    
  } catch (error) {
    console.error("Error reading contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
