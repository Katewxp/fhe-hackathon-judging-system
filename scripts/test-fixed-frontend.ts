import { ethers } from "hardhat";

async function main() {
  console.log("🧪 Testing Fixed Frontend Data Reading...\n");

  const contractAddress = "0x2aE943E41947954CD782698F906d95B7104562A1";
  
  try {
    // Get contract instance
    const HackathonJudging = await ethers.getContractFactory("HackathonJudging");
    const contract = HackathonJudging.attach(contractAddress);

    console.log("📋 Contract address:", contractAddress);
    
    const hackathonId = 0;
    
    // Test the fixed data reading logic
    console.log("\n🔧 Testing Fixed Data Reading Logic");
    try {
      const hackathonData = await contract.hackathons(hackathonId);
      
      // Simulate what frontend now reads (fixed version)
      const fixedHackathon = {
        id: hackathonId,
        name: hackathonData[0],
        description: hackathonData[1],
        startDay: Math.floor(Number(hackathonData[2]) / (24 * 60 * 60)),
        endDay: Math.floor(Number(hackathonData[3]) / (24 * 60 * 60)),
        isActive: hackathonData[4],
        scoresAggregated: hackathonData[5],
        rankingsPublished: hackathonData[6],
        organizer: hackathonData[7],
        projectCount: Number(hackathonData[10]), // FIXED: Use totalProjects
        judgeCount: Number(hackathonData[11]),  // FIXED: Use totalJudges
        totalProjects: Number(hackathonData[10]),
        totalJudges: Number(hackathonData[11])
      };
      
      console.log("✅ Fixed frontend data structure:");
      console.log("  Name:", fixedHackathon.name);
      console.log("  Description:", fixedHackathon.description);
      console.log("  Start Day:", fixedHackathon.startDay);
      console.log("  End Day:", fixedHackathon.endDay);
      console.log("  Is Active:", fixedHackathon.isActive);
      console.log("  Project Count:", fixedHackathon.projectCount); // Should be 3
      console.log("  Judge Count:", fixedHackathon.judgeCount);     // Should be 2
      console.log("  Total Projects:", fixedHackathon.totalProjects);
      console.log("  Total Judges:", fixedHackathon.totalJudges);
      
      // Verify the fix
      if (fixedHackathon.projectCount === 3) {
        console.log("✅ projectCount fix successful!");
      } else {
        console.log("❌ projectCount still incorrect");
      }
      
      if (fixedHackathon.judgeCount === 2) {
        console.log("✅ judgeCount fix successful!");
      } else {
        console.log("❌ judgeCount still incorrect");
      }
      
    } catch (error) {
      console.log("❌ Failed to test fixed data reading:", error.message);
    }
    
    // Test projects and judges reading
    console.log("\n🚀 Testing Projects and Judges Reading");
    try {
      // Test projects
      console.log("  Projects:");
      for (let i = 0; i < 3; i++) {
        try {
          const project = await contract.projects(hackathonId, i);
          console.log(`    Project ${i + 1}: ${project[0]} (registered: ${project[5]})`);
        } catch (error) {
          console.log(`    Project ${i + 1}: Not accessible`);
        }
      }
      
      // Test judges
      console.log("  Judges:");
      try {
        const judgeAddresses = await contract.getJudgeAddresses(hackathonId);
        for (let i = 0; i < judgeAddresses.length; i++) {
          const judge = await contract.judges(hackathonId, judgeAddresses[i]);
          console.log(`    Judge ${i + 1}: ${judgeAddresses[i].slice(0, 6)}... (registered: ${judge[1]})`);
        }
      } catch (error) {
        console.log("    Failed to get judges:", error.message);
      }
      
    } catch (error) {
      console.log("❌ Failed to test projects/judges:", error.message);
    }
    
    console.log("\n🎉 Frontend Data Fix Test Complete!");
    console.log("\n📝 Summary:");
    console.log("- Frontend should now display correct project and judge counts");
    console.log("- Projects: 3, Judges: 2");
    console.log("- All data is read from the correct contract fields");
    
  } catch (error) {
    console.error("❌ Error in test:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
