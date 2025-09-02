import { expect } from "chai";
import { ethers } from "hardhat";

describe("HackathonJudging", function () {
  let hackathonJudging: any;
  let owner: any;
  let judge1: any;
  let judge2: any;
  let teamLead: any;

  beforeEach(async function () {
    [owner, judge1, judge2, teamLead] = await ethers.getSigners();
    
    const HackathonJudging = await ethers.getContractFactory("HackathonJudging");
    hackathonJudging = await HackathonJudging.deploy();
    await hackathonJudging.waitForDeployment();
  });

  describe("Contract Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await hackathonJudging.getAddress()).to.not.equal(ethers.ZeroAddress);
    });

    it("Should have correct initial state", async function () {
      const hackathonCount = await hackathonJudging.getHackathonCount();
      expect(hackathonCount).to.equal(0);
    });
  });

  describe("Hackathon Creation", function () {
    it("Should create a hackathon successfully", async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      const startTime = currentTime + 3600; // 1 hour from now
      const endTime = currentTime + 7200;   // 2 hours from now
      
      await hackathonJudging.createHackathon(
        "Test Hackathon",
        "A test hackathon for testing",
        startTime,
        endTime
      );

      const hackathon = await hackathonJudging.getHackathon(0);
      expect(hackathon.name).to.equal("Test Hackathon");
      expect(hackathon.organizer).to.equal(owner.address);
      expect(hackathon.isActive).to.be.true;
    });

    it("Should increment hackathon count", async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      const startTime = currentTime + 3600;
      const endTime = currentTime + 7200;
      
      await hackathonJudging.createHackathon(
        "Test Hackathon",
        "A test hackathon for testing",
        startTime,
        endTime
      );

      const count = await hackathonJudging.getHackathonCount();
      expect(count).to.equal(1);
    });
  });

  describe("Judge Registration", function () {
    beforeEach(async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      const startTime = currentTime + 3600;
      const endTime = currentTime + 7200;
      
      await hackathonJudging.createHackathon(
        "Test Hackathon",
        "A test hackathon for testing",
        startTime,
        endTime
      );
    });

    it("Should register judges successfully", async function () {
      await hackathonJudging.registerJudge(0, judge1.address);
      await hackathonJudging.registerJudge(0, judge2.address);
      
      const judge1Info = await hackathonJudging.getJudge(0, judge1.address);
      const judge2Info = await hackathonJudging.getJudge(0, judge2.address);
      
      expect(judge1Info.isRegistered).to.be.true;
      expect(judge2Info.isRegistered).to.be.true;
    });

    it("Should only allow organizer to register judges", async function () {
      await expect(
        hackathonJudging.connect(judge1).registerJudge(0, ethers.Wallet.createRandom().address)
      ).to.be.revertedWith("Only organizer can call this function");
    });
  });

  describe("Project Registration", function () {
    beforeEach(async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      const startTime = currentTime + 3600;
      const endTime = currentTime + 7200;
      
      await hackathonJudging.createHackathon(
        "Test Hackathon",
        "A test hackathon for testing",
        startTime,
        endTime
      );
    });

    it("Should register projects successfully", async function () {
      await hackathonJudging.connect(teamLead).registerProject(
        0,
        "Test Project",
        "A test project",
        "https://github.com/test/project",
        "https://demo.test.com"
      );

      const project = await hackathonJudging.getProject(0, 0);
      expect(project.name).to.equal("Test Project");
      expect(project.teamLead).to.equal(teamLead.address);
      expect(project.isRegistered).to.be.true;
    });

    it("Should increment project count", async function () {
      await hackathonJudging.connect(teamLead).registerProject(
        0,
        "Test Project",
        "A test project",
        "https://github.com/test/project",
        "https://demo.test.com"
      );

      const hackathon = await hackathonJudging.getHackathon(0);
      expect(hackathon.totalProjects).to.equal(1);
    });
  });

  describe("Judge Management", function () {
    beforeEach(async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      const startTime = currentTime + 3600;
      const endTime = currentTime + 7200;
      
      await hackathonJudging.createHackathon(
        "Test Hackathon",
        "A test hackathon for testing",
        startTime,
        endTime
      );

      await hackathonJudging.registerJudge(0, judge1.address);
      await hackathonJudging.registerJudge(0, judge2.address);
    });

    it("Should return correct judge addresses", async function () {
      const judgeAddresses = await hackathonJudging.getJudgeAddresses(0);
      expect(judgeAddresses).to.include(judge1.address);
      expect(judgeAddresses).to.include(judge2.address);
      expect(judgeAddresses.length).to.equal(2);
    });
  });

  describe("Access Control", function () {
    beforeEach(async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      const startTime = currentTime + 3600;
      const endTime = currentTime + 7200;
      
      await hackathonJudging.createHackathon(
        "Test Hackathon",
        "A test hackathon for testing",
        startTime,
        endTime
      );
    });

    it("Should only allow organizer to call organizer functions", async function () {
      await expect(
        hackathonJudging.connect(judge1).registerJudge(0, ethers.Wallet.createRandom().address)
      ).to.be.revertedWith("Only organizer can call this function");
    });
  });

  describe("Contract State", function () {
    beforeEach(async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      const startTime = currentTime + 3600;
      const endTime = currentTime + 7200;
      
      await hackathonJudging.createHackathon(
        "Test Hackathon",
        "A test hackathon for testing",
        startTime,
        endTime
      );

      await hackathonJudging.registerJudge(0, judge1.address);
      await hackathonJudging.registerJudge(0, judge2.address);

      await hackathonJudging.connect(teamLead).registerProject(
        0,
        "Test Project",
        "A test project",
        "https://github.com/test/project",
        "https://demo.test.com"
      );
    });

    it("Should maintain correct state after operations", async function () {
      const hackathon = await hackathonJudging.getHackathon(0);
      expect(hackathon.totalJudges).to.equal(2);
      expect(hackathon.totalProjects).to.equal(1);
      expect(hackathon.scoresAggregated).to.be.false;
      expect(hackathon.rankingsPublished).to.be.false;
    });
  });
});
