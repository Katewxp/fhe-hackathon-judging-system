import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contracts";

export interface Hackathon {
  id: number;
  name: string;
  description: string;
  startDay: number;
  endDay: number;
  isActive: boolean;
  scoresAggregated: boolean;
  rankingsPublished: boolean;
  organizer: string;
  projectCount: number;
  judgeCount: number;
  totalProjects: number;
  totalJudges: number;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  githubUrl: string;
  demoUrl: string;
  teamLead: string;
  isRegistered: boolean;
  publicRank: number;
}

export interface Judge {
  address: string;
  isRegistered: boolean;
  hasSubmittedAllScores: boolean;
  projectsScored: number;
}

class ContractService {
  private contract: any;
  private signer: ethers.Signer | null = null;

  constructor() {
    // Initialize with a default provider for read operations
    const provider = new ethers.JsonRpcProvider("https://1rpc.io/sepolia");
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  }

  setSigner(signer: ethers.Signer) {
    this.signer = signer;
    this.contract = this.contract.connect(signer);
  }

  // Convert days since epoch to Date
  private daysToDate(days: number): Date {
    return new Date(days * 24 * 60 * 60 * 1000);
  }

  // Convert Date to days since epoch
  private dateToDays(date: Date): number {
    return Math.floor(date.getTime() / (24 * 60 * 60 * 1000));
  }

  // Get all hackathons
  async getHackathons(): Promise<Hackathon[]> {
    try {
      console.log("ContractService: Getting hackathon count...");
      const count = await this.contract.getHackathonCount();
      console.log("ContractService: Hackathon count:", count.toString());
      
      const hackathons: Hackathon[] = [];

      for (let i = 0; i < Number(count); i++) {
        try {
          console.log(`ContractService: Accessing hackathon ${i}...`);
          // Direct access to hackathons mapping instead of getHackathon function
          const hackathonData = await this.contract.hackathons(i);
          console.log(`ContractService: Hackathon ${i} data:`, hackathonData);
          
          const hackathon: Hackathon = {
            id: i,
            name: hackathonData[0],
            description: hackathonData[1],
            startDay: Math.floor(Number(hackathonData[2]) / (24 * 60 * 60)), // Convert Unix timestamp to days
            endDay: Math.floor(Number(hackathonData[3]) / (24 * 60 * 60)), // Convert Unix timestamp to days
            isActive: hackathonData[4],
            scoresAggregated: hackathonData[5],
            rankingsPublished: hackathonData[6],
            organizer: hackathonData[7],
            projectCount: Number(hackathonData[10]), // Use totalProjects instead of projectCount
            judgeCount: Number(hackathonData[11]), // Use totalJudges instead of judgeCount
            totalProjects: Number(hackathonData[10]),
            totalJudges: Number(hackathonData[11])
          };
          hackathons.push(hackathon);
          console.log(`ContractService: Successfully processed hackathon ${i}:`, hackathon);
        } catch (error) {
          console.error(`ContractService: Failed to get hackathon ${i}:`, error);
          continue;
        }
      }

      console.log("ContractService: Returning hackathons:", hackathons);
      return hackathons;
    } catch (error) {
      console.error("ContractService: Failed to get hackathons:", error);
      return [];
    }
  }

  // Get hackathon by ID
  async getHackathon(id: number): Promise<Hackathon | null> {
    try {
      // Direct access to hackathons mapping instead of getHackathon function
      const hackathonData = await this.contract.hackathons(id);
      const hackathon: Hackathon = {
        id,
        name: hackathonData[0],
        description: hackathonData[1],
        startDay: Math.floor(Number(hackathonData[2]) / (24 * 60 * 60)), // Convert Unix timestamp to days
        endDay: Math.floor(Number(hackathonData[3]) / (24 * 60 * 60)), // Convert Unix timestamp to days
        isActive: hackathonData[4],
        scoresAggregated: hackathonData[5],
        rankingsPublished: hackathonData[6],
        organizer: hackathonData[7],
        projectCount: Number(hackathonData[10]), // Use totalProjects instead of projectCount
        judgeCount: Number(hackathonData[11]), // Use totalJudges instead of judgeCount
        totalProjects: Number(hackathonData[10]),
        totalJudges: Number(hackathonData[11])
      };
      return hackathon;
    } catch (error) {
      console.error("Failed to get hackathon:", error);
      return null;
    }
  }

  // Get projects for a hackathon
  async getProjects(hackathonId: number): Promise<Project[]> {
    try {
      const hackathon = await this.getHackathon(hackathonId);
      if (!hackathon) return [];

      const projects: Project[] = [];
      for (let i = 0; i < hackathon.totalProjects; i++) {
        try {
          // Direct access to projects mapping instead of getProject function
          const projectData = await this.contract.projects(hackathonId, i);
          const project: Project = {
            id: i,
            name: projectData[0],
            description: projectData[1],
            githubUrl: projectData[2],
            demoUrl: projectData[3],
            teamLead: projectData[4],
            isRegistered: projectData[5],
            publicRank: Number(projectData[6])
          };
          projects.push(project);
        } catch (error) {
          // Project might not exist yet
          continue;
        }
      }

      return projects;
    } catch (error) {
      console.error("Failed to get projects:", error);
      return [];
    }
  }

  // Get judges for a hackathon
  async getJudges(hackathonId: number): Promise<Judge[]> {
    try {
      const judgeAddresses = await this.contract.getJudgeAddresses(hackathonId);
      const judges: Judge[] = [];

      for (const address of judgeAddresses) {
        try {
          // Direct access to judges mapping instead of getJudge function
          const judgeData = await this.contract.judges(hackathonId, address);
          const judge: Judge = {
            address: judgeData[0],
            isRegistered: judgeData[1],
            hasSubmittedAllScores: judgeData[2],
            projectsScored: Number(judgeData[3])
          };
          judges.push(judge);
        } catch (error) {
          continue;
        }
      }

      return judges;
    } catch (error) {
      console.error("Failed to get judges:", error);
      return [];
    }
  }

  // Create a new hackathon
  async createHackathon(
    name: string,
    description: string,
    startDate: Date,
    endDate: Date
  ): Promise<boolean> {
    try {
      if (!this.signer) throw new Error("No signer available");

      const startTime = Math.floor(startDate.getTime() / 1000);
      const endTime = Math.floor(endDate.getTime() / 1000);

      const tx = await this.contract.createHackathon(name, description, startTime, endTime);
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Failed to create hackathon:", error);
      return false;
    }
  }

  // Register a project
  async registerProject(
    hackathonId: number,
    name: string,
    description: string,
    githubUrl: string,
    demoUrl: string
  ): Promise<boolean> {
    try {
      if (!this.signer) throw new Error("No signer available");

      const tx = await this.contract.registerProject(hackathonId, name, description, githubUrl, demoUrl);
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Failed to register project:", error);
      return false;
    }
  }

  // Register a judge
  async registerJudge(hackathonId: number, judgeAddress: string): Promise<boolean> {
    try {
      if (!this.signer) throw new Error("No signer available");

      const tx = await this.contract.registerJudge(hackathonId, judgeAddress);
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Failed to register judge:", error);
      return false;
    }
  }

  // Submit encrypted score (mock for now - replace with real FHE)
  async submitScore(
    hackathonId: number,
    projectId: number,
    score: number
  ): Promise<boolean> {
    try {
      if (!this.signer) throw new Error("No signer available");

      // Mock encrypted score and proof - replace with real FHE encryption
      const encryptedScore = ethers.toUtf8Bytes(`encrypted_${score}_${Date.now()}`);
      const proof = ethers.toUtf8Bytes(`proof_${score}_${Date.now()}`);

      const tx = await this.contract.submitScore(hackathonId, projectId, encryptedScore, proof);
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Failed to submit score:", error);
      return false;
    }
  }

  // Aggregate scores
  async aggregateScores(hackathonId: number, projectId: number): Promise<boolean> {
    try {
      if (!this.signer) throw new Error("No signer available");

      const tx = await this.contract.aggregateScores(hackathonId, projectId);
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Failed to aggregate scores:", error);
      return false;
    }
  }

  // Publish rankings
  async publishRankings(hackathonId: number, projectIds: number[]): Promise<boolean> {
    try {
      if (!this.signer) throw new Error("No signer available");

      const tx = await this.contract.publishRankings(hackathonId, projectIds);
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Failed to publish rankings:", error);
      return false;
    }
  }

  // Check if scores are ready for aggregation
  async areScoresReadyForAggregation(hackathonId: number): Promise<boolean> {
    try {
      return await this.contract.areScoresReadyForAggregation(hackathonId);
    } catch (error) {
      console.error("Failed to check scores readiness:", error);
      return false;
    }
  }

  // Check if judge has submitted all scores
  async hasJudgeSubmittedAllScores(hackathonId: number, judgeAddress: string): Promise<boolean> {
    try {
      return await this.contract.hasJudgeSubmittedAllScores(hackathonId, judgeAddress);
    } catch (error) {
      console.error("Failed to check judge scores:", error);
      return false;
    }
  }

  // Get project rankings
  async getProjectRankings(hackathonId: number): Promise<number[]> {
    try {
      return await this.contract.getProjectRankings(hackathonId);
    } catch (error) {
      console.error("Failed to get project rankings:", error);
      return [];
    }
  }
}

export const contractService = new ContractService();
