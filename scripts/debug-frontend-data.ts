import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Debugging Frontend Data Reading...\n");

  const contractAddress = "0x2aE943E41947954CD782698F906d95B7104562A1";
  
  try {
    // Get contract instance
    const HackathonJudging = await ethers.getContractFactory("HackathonJudging");
    const contract = HackathonJudging.attach(contractAddress);

    console.log("📋 Contract address:", contractAddress);
    
    const hackathonId = 0;
    
    // Step 1: Get raw hackathon data
    console.log("\n📊 Step 1: Raw Hackathon Data");
    try {
      const hackathonData = await contract.hackathons(hackathonId);
      console.log("✅ Raw hackathon data array:");
      for (let i = 0; i < hackathonData.length; i++) {
        console.log(`  [${i}]: ${hackathonData[i]} (type: ${typeof hackathonData[i]})`);
      }
    } catch (error) {
      console.log("❌ Failed to get raw hackathon data:", error.message);
    }
    
    // Step 2: Check specific fields that frontend reads
    console.log("\n🔍 Step 2: Frontend Data Fields");
    try {
      const hackathonData = await contract.hackathons(hackathonId);
      
      // Fields that frontend reads
      const frontendFields = {
        name: hackathonData[0],
        description: hackathonData[1],
        startTime: hackathonData[2],
        endTime: hackathonData[3],
        isActive: hackathonData[4],
        scoresAggregated: hackathonData[5],
        rankingsPublished: hackathonData[6],
        organizer: hackathonData[7],
        projectCount: hackathonData[8],
        judgeCount: hackathonData[9],
        totalProjects: hackathonData[10],
        totalJudges: hackathonData[11]
      };
      
      console.log("✅ Frontend field mapping:");
      Object.entries(frontendFields).forEach(([key, value]) => {
        console.log(`  ${key}: ${value} (type: ${typeof value})`);
      });
      
      // Check if projectCount and judgeCount are correct
      console.log("\n📈 Count Analysis:");
      console.log(`  projectCount: ${hackathonData[8]} (should match actual projects)`);
      console.log(`  judgeCount: ${hackathonData[9]} (should match actual judges)`);
      console.log(`  totalProjects: ${hackathonData[10]} (should match actual projects)`);
      console.log(`  totalJudges: ${hackathonData[11]} (should match actual judges)`);
      
    } catch (error) {
      console.log("❌ Failed to analyze frontend fields:", error.message);
    }
    
    // Step 3: Check actual projects and judges
    console.log("\n🚀 Step 3: Actual Projects and Judges");
    try {
      // Check projects
      console.log("  Projects:");
      for (let i = 0; i < 5; i++) { // Check more than expected
        try {
          const project = await contract.projects(hackathonId, i);
          if (project[5]) { // isRegistered
            console.log(`    Project ${i}: ${project[0]} (registered: ${project[5]})`);
          }
        } catch (error) {
          // Project doesn't exist
          break;
        }
      }
      
      // Check judges
      console.log("  Judges:");
      try {
        const judgeAddresses = await contract.getJudgeAddresses(hackathonId);
        console.log(`    Judge addresses: ${judgeAddresses}`);
        
        for (let i = 0; i < judgeAddresses.length; i++) {
          const judge = await contract.judges(hackathonId, judgeAddresses[i]);
          console.log(`    Judge ${i}: ${judgeAddresses[i]} (registered: ${judge[1]})`);
        }
      } catch (error) {
        console.log("    Failed to get judge addresses:", error.message);
      }
      
    } catch (error) {
      console.log("❌ Failed to check actual projects/judges:", error.message);
    }
    
    // Step 4: Compare with expected values
    console.log("\n📊 Step 4: Expected vs Actual");
    try {
      const hackathonData = await contract.hackathons(hackathonId);
      const expectedProjects = 3;
      const expectedJudges = 2;
      
      console.log("✅ Expected values:");
      console.log(`  Projects: ${expectedProjects}`);
      console.log(`  Judges: ${expectedJudges}`);
      
      console.log("✅ Actual values from contract:");
      console.log(`  projectCount: ${hackathonData[8]}`);
      console.log(`  judgeCount: ${hackathonData[9]}`);
      console.log(`  totalProjects: ${hackathonData[10]}`);
      console.log(`  totalJudges: ${hackathonData[11]}`);
      
      if (Number(hackathonData[8]) !== expectedProjects) {
        console.log("⚠️  projectCount mismatch! Frontend will show 0 projects.");
      }
      
      if (Number(hackathonData[9]) !== expectedJudges) {
        console.log("⚠️  judgeCount mismatch! Frontend will show 0 judges.");
      }
      
    } catch (error) {
      console.log("❌ Failed to compare values:", error.message);
    }
    
  } catch (error) {
    console.error("❌ Error in debug script:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
