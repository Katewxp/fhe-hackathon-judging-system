import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Hackathon Judging System - Example Usage");
  console.log("============================================\n");

  // Get the contract factory
  const HackathonJudging = await ethers.getContractFactory("HackathonJudging");
  
  // Deploy the contract
  console.log("📝 Deploying HackathonJudging contract...");
  const hackathonJudging = await HackathonJudging.deploy();
  await hackathonJudging.waitForDeployment();
  
  const contractAddress = await hackathonJudging.getAddress();
  console.log(`✅ Contract deployed to: ${contractAddress}\n`);

  // Get signers for different roles
  const [organizer, judge1, judge2, judge3, teamLead1, teamLead2, teamLead3] = await ethers.getSigners();
  
  console.log("👥 Participants:");
  console.log(`   Organizer: ${organizer.address}`);
  console.log(`   Judge 1: ${judge1.address}`);
  console.log(`   Judge 2: ${judge2.address}`);
  console.log(`   Judge 3: ${judge3.address}`);
  console.log(`   Team Lead 1: ${teamLead1.address}`);
  console.log(`   Team Lead 2: ${teamLead2.address}`);
  console.log(`   Team Lead 3: ${teamLead3.address}\n`);

  // Create a hackathon
  console.log("🏆 Creating hackathon...");
  const currentTime = Math.floor(Date.now() / 1000);
  const startTime = currentTime + 3600; // 1 hour from now
  const endTime = currentTime + 7200;   // 2 hours from now
  
  const createTx = await hackathonJudging.createHackathon(
    "Web3 Privacy Hackathon",
    "Build privacy-preserving applications using FHE",
    startTime,
    endTime
  );
  await createTx.wait();
  
  const hackathonId = 0;
  console.log(`✅ Hackathon created with ID: ${hackathonId}\n`);

  // Register judges
  console.log("👨‍⚖️ Registering judges...");
  const registerJudge1Tx = await hackathonJudging.registerJudge(hackathonId, judge1.address);
  await registerJudge1Tx.wait();
  
  const registerJudge2Tx = await hackathonJudging.registerJudge(hackathonId, judge2.address);
  await registerJudge2Tx.wait();
  
  const registerJudge3Tx = await hackathonJudging.registerJudge(hackathonId, judge3.address);
  await registerJudge3Tx.wait();
  
  console.log("✅ All judges registered\n");

  // Register projects
  console.log("🚀 Registering projects...");
  const registerProject1Tx = await hackathonJudging.connect(teamLead1).registerProject(
    hackathonId,
    "PrivacySwap",
    "Decentralized exchange with privacy-preserving order matching",
    "https://github.com/team1/privacyswap",
    "https://privacyswap.demo.com"
  );
  await registerProject1Tx.wait();
  
  const registerProject2Tx = await hackathonJudging.connect(teamLead2).registerProject(
    hackathonId,
    "SecureVote",
    "Voting system with encrypted ballots using FHE",
    "https://github.com/team2/securevote",
    "https://securevote.demo.com"
  );
  await registerProject2Tx.wait();
  
  const registerProject3Tx = await hackathonJudging.connect(teamLead3).registerProject(
    hackathonId,
    "ConfidentialDAO",
    "DAO governance with private voting and encrypted proposals",
    "https://github.com/team3/confidentialdao",
    "https://confidentialdao.demo.com"
  );
  await registerProject3Tx.wait();
  
  console.log("✅ All projects registered\n");

  // Get hackathon info
  const hackathon = await hackathonJudging.getHackathon(hackathonId);
  console.log("📊 Hackathon Information:");
  console.log(`   Name: ${hackathon.name}`);
  console.log(`   Description: ${hackathon.description}`);
  console.log(`   Total Projects: ${hackathon.totalProjects}`);
  console.log(`   Total Judges: ${hackathon.totalJudges}`);
  console.log(`   Start Time: ${new Date(Number(hackathon.startTime) * 1000).toLocaleString()}`);
  console.log(`   End Time: ${new Date(Number(hackathon.endTime) * 1000).toLocaleString()}`);
  console.log(`   Is Active: ${hackathon.isActive}\n`);

  // Get project info
  console.log("📋 Project Information:");
  for (let i = 0; i < hackathon.totalProjects; i++) {
    const project = await hackathonJudging.getProject(hackathonId, i);
    console.log(`   Project ${i}:`);
    console.log(`     Name: ${project.name}`);
    console.log(`     Description: ${project.description}`);
    console.log(`     Team Lead: ${project.teamLead}`);
    console.log(`     GitHub: ${project.githubUrl}`);
    console.log(`     Demo: ${project.demoUrl}\n`);
  }

  // Get judge info
  console.log("👨‍⚖️ Judge Information:");
  const judgeAddresses = await hackathonJudging.getJudgeAddresses(hackathonId);
  for (let i = 0; i < judgeAddresses.length; i++) {
    const judge = await hackathonJudging.getJudge(hackathonId, judgeAddresses[i]);
    console.log(`   Judge ${i + 1}:`);
    console.log(`     Address: ${judge.judgeAddress}`);
    console.log(`     Is Registered: ${judge.isRegistered}`);
    console.log(`     Projects Scored: ${judge.projectsScored}`);
    console.log(`     Has Submitted All Scores: ${judge.hasSubmittedAllScores}\n`);
  }

  // Note about FHE score submission
  console.log("🔒 FHE Score Submission:");
  console.log("   In a real implementation, judges would submit encrypted scores using FHE.");
  console.log("   The current demo shows the contract structure and management functions.");
  console.log("   To test score submission, you would need to integrate with FHE client libraries.\n");

  console.log("🎉 Example usage completed successfully!");
  console.log(`📝 Contract address: ${contractAddress}`);
  console.log("🔗 You can now interact with the contract using this address");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
