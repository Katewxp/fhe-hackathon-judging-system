import { ethers } from "hardhat";

async function main() {
  console.log("Deploying HackathonJudging contract...");

  const HackathonJudging = await ethers.getContractFactory("HackathonJudging");
  const hackathonJudging = await HackathonJudging.deploy();

  await hackathonJudging.waitForDeployment();

  const address = await hackathonJudging.getAddress();
  console.log(`HackathonJudging deployed to: ${address}`);

  // Verify deployment
  const deployedContract = await ethers.getContractAt("HackathonJudging", address);
  const hackathonCount = await deployedContract.getHackathonCount();
  console.log(`Initial hackathon count: ${hackathonCount}`);

  console.log("Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
