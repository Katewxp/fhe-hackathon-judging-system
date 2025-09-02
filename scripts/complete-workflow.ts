import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting Complete Hackathon Workflow Test...\n");

  const contractAddress = "0x2aE943E41947954CD782698F906d95B7104562A1";
  
  try {
    // Get contract instance
    const HackathonJudging = await ethers.getContractFactory("HackathonJudging");
    const contract = HackathonJudging.attach(contractAddress);

    console.log("📋 Contract address:", contractAddress);
    
    // Step 1: Check current state
    console.log("\n📊 Step 1: Checking Current State");
    const hackathonCount = await contract.getHackathonCount();
    console.log("✅ Total hackathons:", hackathonCount.toString());
    
    // Use the first hackathon for testing
    const hackathonId = 0;
    
    // Step 2: Register Projects
    console.log("\n🚀 Step 2: Registering Projects");
    try {
      const project1Tx = await contract.registerProject(
        hackathonId,
        "FHE Privacy Wallet",
        "A privacy-preserving wallet using FHE for transaction amounts",
        "https://github.com/example/fhe-wallet",
        "https://demo.example.com/fhe-wallet"
      );
      await project1Tx.wait();
      console.log("✅ Project 1 registered: FHE Privacy Wallet");

      const project2Tx = await contract.registerProject(
        hackathonId,
        "Confidential Voting System",
        "A voting system where votes remain encrypted until final tally",
        "https://github.com/example/confidential-voting",
        "https://demo.example.com/confidential-voting"
      );
      await project2Tx.wait();
      console.log("✅ Project 2 registered: Confidential Voting System");

      const project3Tx = await contract.registerProject(
        hackathonId,
        "Private ML Training",
        "Machine learning training on encrypted data using FHE",
        "https://github.com/example/private-ml",
        "https://demo.example.com/private-ml"
      );
      await project3Tx.wait();
      console.log("✅ Project 3 registered: Private ML Training");
    } catch (error) {
      console.log("❌ Failed to register projects:", error.message);
    }

    // Step 3: Register Judges
    console.log("\n👨‍⚖️ Step 3: Registering Judges");
    try {
      // Register some judge addresses (using deployer as judge for demo)
      const judgeAddresses = [
        "0x92F82BAed449a7D7E43832Dac0718af378F72f51", // Organizer
        "0xb7459BB281578880d0c80A3c183bfE11De0aB98A", // Another address
      ];

      for (let i = 0; i < judgeAddresses.length; i++) {
        try {
          const judgeTx = await contract.registerJudge(hackathonId, judgeAddresses[i]);
          await judgeTx.wait();
          console.log(`✅ Judge ${i + 1} registered: ${judgeAddresses[i]}`);
        } catch (error) {
          console.log(`⚠️ Judge ${i + 1} registration failed:`, error.message);
        }
      }
    } catch (error) {
      console.log("❌ Failed to register judges:", error.message);
    }

    // Step 4: Submit Scores (Mock FHE)
    console.log("\n📝 Step 4: Submitting Scores (Mock FHE)");
    try {
      const projects = 3;
      const judges = 2;
      
      for (let judgeIndex = 0; judgeIndex < judges; judgeIndex++) {
        for (let projectIndex = 0; projectIndex < projects; projectIndex++) {
          try {
            // Mock encrypted score (in real scenario, this would be FHE encrypted)
            const mockScore = Math.floor(Math.random() * 10) + 1; // 1-10 score
            const encryptedScore = ethers.toUtf8Bytes(`encrypted_${mockScore}_${Date.now()}`);
            const proof = ethers.toUtf8Bytes(`proof_${mockScore}_${Date.now()}`);
            
            const scoreTx = await contract.submitScore(
              hackathonId,
              projectIndex,
              encryptedScore,
              proof
            );
            await scoreTx.wait();
            console.log(`✅ Judge ${judgeIndex + 1} submitted score ${mockScore} for Project ${projectIndex + 1}`);
          } catch (error) {
            console.log(`⚠️ Score submission failed for Judge ${judgeIndex + 1}, Project ${projectIndex + 1}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.log("❌ Failed to submit scores:", error.message);
    }

    // Step 5: Check if scores are ready for aggregation
    console.log("\n🔍 Step 5: Checking Score Readiness");
    try {
      const scoresReady = await contract.areScoresReadyForAggregation(hackathonId);
      console.log("✅ Scores ready for aggregation:", scoresReady);
    } catch (error) {
      console.log("❌ Failed to check score readiness:", error.message);
    }

    // Step 6: Aggregate Scores
    console.log("\n⚡ Step 6: Aggregating Scores");
    try {
      for (let projectIndex = 0; projectIndex < 3; projectIndex++) {
        try {
          const aggregateTx = await contract.aggregateScores(hackathonId, projectIndex);
          await aggregateTx.wait();
          console.log(`✅ Scores aggregated for Project ${projectIndex + 1}`);
        } catch (error) {
          console.log(`⚠️ Score aggregation failed for Project ${projectIndex + 1}:`, error.message);
        }
      }
    } catch (error) {
      console.log("❌ Failed to aggregate scores:", error.message);
    }

    // Step 7: Publish Rankings
    console.log("\n🏆 Step 7: Publishing Final Rankings");
    try {
      // Create ranking array (project IDs in order for demo)
      const projectIds = [0, 1, 2]; // This would be the actual ranking order
      
      const publishTx = await contract.publishRankings(hackathonId, projectIds);
      await publishTx.wait();
      console.log("✅ Final rankings published!");
    } catch (error) {
      console.log("❌ Failed to publish rankings:", error.message);
    }

    // Step 8: Final State Check
    console.log("\n📊 Step 8: Final State Check");
    try {
      const finalHackathon = await contract.hackathons(hackathonId);
      console.log("✅ Final hackathon state:");
      console.log("  Name:", finalHackathon[0]);
      console.log("  Is active:", finalHackathon[4]);
      console.log("  Scores aggregated:", finalHackathon[5]);
      console.log("  Rankings published:", finalHackathon[6]);
      console.log("  Project count:", finalHackathon[8].toString());
      console.log("  Judge count:", finalHackathon[9].toString());
    } catch (error) {
      console.log("❌ Failed to get final state:", error.message);
    }

    console.log("\n🎉 Complete Workflow Test Finished!");
    
  } catch (error) {
    console.error("❌ Error in workflow test:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
