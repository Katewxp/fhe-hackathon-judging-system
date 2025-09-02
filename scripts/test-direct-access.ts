import { ethers } from "hardhat";

async function main() {
  console.log("Testing direct contract access...");

  const contractAddress = "0x2aE943E41947954CD782698F906d95B7104562A1";
  
  try {
    // Get contract instance
    const HackathonJudging = await ethers.getContractFactory("HackathonJudging");
    const contract = HackathonJudging.attach(contractAddress);

    console.log("Contract address:", contractAddress);
    
    // Get hackathon count
    const hackathonCount = await contract.getHackathonCount();
    console.log("Hackathon count:", hackathonCount.toString());
    
    if (hackathonCount > 0) {
      // Direct access to hackathons mapping
      console.log("\nDirect access to hackathons mapping:");
      for (let i = 0; i < Math.min(Number(hackathonCount), 3); i++) {
        try {
          const hackathonData = await contract.hackathons(i);
          console.log(`\nHackathon ${i}:`);
          console.log("  Name:", hackathonData[0]);
          console.log("  Description:", hackathonData[1]);
          console.log("  Start time:", new Date(Number(hackathonData[2]) * 1000).toISOString());
          console.log("  End time:", new Date(Number(hackathonData[3]) * 1000).toISOString());
          console.log("  Is active:", hackathonData[4]);
          console.log("  Scores aggregated:", hackathonData[5]);
          console.log("  Rankings published:", hackathonData[6]);
          console.log("  Organizer:", hackathonData[7]);
          console.log("  Project count:", hackathonData[8].toString());
          console.log("  Judge count:", hackathonData[9].toString());
          console.log("  Total projects:", hackathonData[10].toString());
          console.log("  Total judges:", hackathonData[11].toString());
        } catch (error) {
          console.log(`  Error accessing hackathon ${i}:`, error.message);
        }
      }
    }
    
  } catch (error) {
    console.error("Error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
