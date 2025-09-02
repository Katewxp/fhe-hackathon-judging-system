import { ethers } from "hardhat";

async function main() {
  console.log("🎯 Demo: FHE Score Submission (Mock)...\n");

  const contractAddress = "0x2aE943E41947954CD782698F906d95B7104562A1";
  
  try {
    // Get contract instance
    const HackathonJudging = await ethers.getContractFactory("HackathonJudging");
    const contract = HackathonJudging.attach(contractAddress);

    console.log("📋 Contract address:", contractAddress);
    
    const hackathonId = 0;
    
    // Check current state
    console.log("\n📊 Current State:");
    const hackathon = await contract.hackathons(hackathonId);
    console.log("  Projects:", hackathon[8].toString());
    console.log("  Judges:", hackathon[9].toString());
    
    // Get judge addresses
    const judgeAddresses = await contract.getJudgeAddresses(hackathonId);
    console.log("  Judge addresses:", judgeAddresses);
    
    // Demo: Show what FHE score submission would look like
    console.log("\n🔐 FHE Score Submission Demo:");
    console.log("In a real FHE implementation, scores would be:");
    console.log("1. Encrypted using FHE client (e.g., Zama SDK)");
    console.log("2. Submitted as externalEuint8 type");
    console.log("3. Include cryptographic proof of encryption");
    
    // Mock scores for demonstration
    const mockScores = [
      [8, 7, 9], // Judge 1 scores for 3 projects
      [9, 8, 7]  // Judge 2 scores for 3 projects
    ];
    
    console.log("\n📝 Mock Scores (for demonstration):");
    for (let judgeIndex = 0; judgeIndex < mockScores.length; judgeIndex++) {
      console.log(`  Judge ${judgeIndex + 1}:`);
      for (let projectIndex = 0; projectIndex < mockScores[judgeIndex].length; projectIndex++) {
        console.log(`    Project ${projectIndex + 1}: ${mockScores[judgeIndex][projectIndex]}/10`);
      }
    }
    
    // Calculate mock aggregated scores
    console.log("\n⚡ Mock Aggregated Scores:");
    for (let projectIndex = 0; projectIndex < 3; projectIndex++) {
      const totalScore = mockScores[0][projectIndex] + mockScores[1][projectIndex];
      const avgScore = totalScore / 2;
      console.log(`  Project ${projectIndex + 1}: ${totalScore} total, ${avgScore.toFixed(1)} average`);
    }
    
    // Mock ranking
    console.log("\n🏆 Mock Final Rankings:");
    const projectScores = [0, 1, 2].map(i => mockScores[0][i] + mockScores[1][i]);
    const rankings = projectScores
      .map((score, index) => ({ score, index }))
      .sort((a, b) => b.score - a.score);
    
    rankings.forEach((item, rank) => {
      console.log(`  ${rank + 1}. Project ${item.index + 1}: ${item.score} points`);
    });
    
    console.log("\n💡 Note: This is a demonstration of the workflow.");
    console.log("Real implementation would use FHE encryption for privacy.");
    
  } catch (error) {
    console.error("❌ Error in demo:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
