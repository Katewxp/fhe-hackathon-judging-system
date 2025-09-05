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

  // Sort hackathons by priority: Active > Judging > Upcoming > Ended > Completed
  sortHackathons(hackathons: Hackathon[]): Hackathon[] {
    return hackathons.sort((a, b) => {
      const getPriority = (hackathon: Hackathon) => {
        if (hackathon.isActive) return 1;
        if (hackathon.scoresAggregated && !hackathon.rankingsPublished) return 2;
        if (hackathon.rankingsPublished) return 5;
        
        // For ended hackathons, sort by end date (most recent first)
        const currentTime = Date.now();
        const endTimeMs = hackathon.endDay * 24 * 60 * 60 * 1000;
        if (currentTime > endTimeMs) return 4;
        
        // For upcoming hackathons, sort by start date (soonest first)
        return 3;
      };

      const priorityA = getPriority(a);
      const priorityB = getPriority(b);

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // If same priority, sort by start date (most recent first)
      return b.startDay - a.startDay;
    });
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
          
          // Convert Unix timestamps to milliseconds
          const startTime = Number(hackathonData[2]) * 1000;
          const endTime = Number(hackathonData[3]) * 1000;
          const currentTime = Date.now();
          
          // Calculate if hackathon should be active based on current time
          const shouldBeActive = currentTime >= startTime && currentTime <= endTime;
          
          const hackathon: Hackathon = {
            id: i,
            name: hackathonData[0],
            description: hackathonData[1],
            startDay: Math.floor(startTime / (24 * 60 * 60 * 1000)), // Convert to days since epoch
            endDay: Math.floor(endTime / (24 * 60 * 60 * 1000)), // Convert to days since epoch
            isActive: shouldBeActive && hackathonData[4], // Check both time and contract state
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
      
      // Convert Unix timestamps to milliseconds
      const startTime = Number(hackathonData[2]) * 1000;
      const endTime = Number(hackathonData[3]) * 1000;
      const currentTime = Date.now();
      
      // Calculate if hackathon should be active based on current time
      const shouldBeActive = currentTime >= startTime && currentTime <= endTime;
      
      const hackathon: Hackathon = {
        id,
        name: hackathonData[0],
        description: hackathonData[1],
        startDay: Math.floor(startTime / (24 * 60 * 60 * 1000)), // Convert to days since epoch
        endDay: Math.floor(endTime / (24 * 60 * 60 * 1000)), // Convert to days since epoch
        isActive: shouldBeActive && hackathonData[4], // Check both time and contract state
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


      // If no projects found from contract, use mock data for demonstration
      if (projects.length === 0 && (hackathonId === 2 || hackathonId === 3)) {
        const { getMockProjects } = await import('./mockData');
        return getMockProjects(hackathonId);
      }

      return projects;
    } catch (error) {
      console.error("Failed to get projects:", error);
      
      // Fallback to mock data for demonstration
      if (hackathonId === 2 || hackathonId === 3) {
        try {
          const { getMockProjects } = await import('./mockData');
          return getMockProjects(hackathonId);
        } catch (mockError) {
          console.error("Failed to load mock data:", mockError);
        }
      }
      
      return [];
    }
  }

  // Get a specific judge for a hackathon
  async getJudge(hackathonId: number, judgeAddress: string): Promise<Judge> {
    try {
      const judgeData = await this.contract.getJudge(hackathonId, judgeAddress);
      return {
        address: judgeData[0],
        isRegistered: judgeData[1],
        hasSubmittedAllScores: judgeData[2],
        projectsScored: Number(judgeData[3])
      };
    } catch (error) {
      console.error("Failed to get judge:", error);
      return {
        address: judgeAddress,
        isRegistered: false,
        hasSubmittedAllScores: false,
        projectsScored: 0
      };
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

      // Get current nonce to avoid nonce conflicts
      const currentNonce = await this.signer.getNonce();
      console.log("ContractService: Current nonce for createHackathon:", currentNonce);
      
      const tx = await this.contract.createHackathon(name, description, startTime, endTime, {
        nonce: currentNonce
      });
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
    githubUrl: string = "",
    demoUrl: string = ""
  ): Promise<boolean> {
    try {
      console.log("ContractService: Registering project:", { hackathonId, name, description, githubUrl, demoUrl });
      
      if (!this.signer) {
        console.error("ContractService: No signer available for project registration");
        throw new Error("No signer available");
      }

      console.log("ContractService: Calling contract.registerProject...");
      
      // Get current nonce to avoid nonce conflicts
      const currentNonce = await this.signer.getNonce();
      console.log("ContractService: Current nonce for registerProject:", currentNonce);
      
      const tx = await this.contract.registerProject(hackathonId, name, description, githubUrl, demoUrl, {
        nonce: currentNonce
      });
      console.log("ContractService: Transaction sent:", tx.hash);
      
      const receipt = await tx.wait();
      console.log("ContractService: Transaction confirmed:", receipt);
      
      return true;
    } catch (error: any) {
      console.error("ContractService: Failed to register project:", error);
      
      // Provide more specific error messages
      if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        console.error("ContractService: Gas estimation failed - contract may not exist or function may fail");
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        console.error("ContractService: Insufficient funds for transaction");
      } else if (error.code === 'USER_REJECTED') {
        console.error("ContractService: User rejected the transaction");
      }
      
      throw error; // Re-throw to let the calling code handle it
    }
  }


  // Register a judge
  async registerJudge(hackathonId: number, judgeAddress: string): Promise<boolean> {
    try {
      console.log("ContractService: Registering judge:", { hackathonId, judgeAddress });
      
      if (!this.signer) {
        console.error("ContractService: No signer available for judge registration");
        throw new Error("No signer available");
      }

      // Validate address format
      if (!judgeAddress.startsWith('0x') || judgeAddress.length !== 42) {
        console.error("ContractService: Invalid address format:", judgeAddress);
        throw new Error("Invalid address format");
      }

      console.log("ContractService: Calling contract.registerJudge...");
      
      // Get current nonce to avoid nonce conflicts
      const currentNonce = await this.signer.getNonce();
      console.log("ContractService: Current nonce:", currentNonce);
      
      const tx = await this.contract.registerJudge(hackathonId, judgeAddress, {
        nonce: currentNonce
      });
      console.log("ContractService: Transaction sent:", tx.hash);
      
      const receipt = await tx.wait();
      console.log("ContractService: Transaction confirmed:", receipt);
      
      return true;
    } catch (error: any) {
      console.error("ContractService: Failed to register judge:", error);
      
      // Provide more specific error messages
      if (error.message?.includes("ENS name")) {
        console.error("ContractService: ENS name error - invalid address format");
      } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        console.error("ContractService: Gas estimation failed - contract may not exist or function may fail");
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        console.error("ContractService: Insufficient funds for transaction");
      } else if (error.code === 'USER_REJECTED') {
        console.error("ContractService: User rejected the transaction");
      } else if (error.code === 'NONCE_EXPIRED') {
        console.error("ContractService: Nonce expired - please try again");
      }
      
      throw error; // Re-throw to let the calling code handle it
    }
  }

  // Submit encrypted score (mock for now - replace with real FHE)
  async submitScore(
    hackathonId: number,
    projectId: number,
    score: number
  ): Promise<boolean> {
    try {
      console.log("Submitting score:", { hackathonId, projectId, score, hasSigner: !!this.signer });
      
      if (!this.signer) {
        console.error("No signer available for score submission");
        throw new Error("No signer available");
      }

      // Mock encrypted score and proof - replace with real FHE encryption
      // For FHE contracts, externalEuint8 is represented as bytes32 in the ABI
      const encryptedScore = ethers.zeroPadValue(ethers.toUtf8Bytes(`encrypted_${score}_${Date.now()}`), 32);
      const proof = ethers.toUtf8Bytes(`proof_${score}_${Date.now()}`);

      console.log("Calling contract.submitScore with:", { hackathonId, projectId, encryptedScore: encryptedScore.length, proof: proof.length });
      
      // Get current nonce to avoid nonce conflicts
      const currentNonce = await this.signer.getNonce();
      console.log("ContractService: Current nonce for submitScore:", currentNonce);
      
      // Note: The contract expects externalEuint8 (bytes32) and bytes proof
      // This is a mock implementation - in production, use proper FHE encryption
      const tx = await this.contract.submitScore(hackathonId, projectId, encryptedScore, proof, {
        nonce: currentNonce
      });
      console.log("Transaction sent:", tx.hash);
      
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      
      return true;
    } catch (error: any) {
      console.error("Failed to submit score:", error);
      
      // Provide more specific error messages
      if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        console.error("Gas estimation failed - contract may not exist or function may fail");
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        console.error("Insufficient funds for transaction");
      } else if (error.code === 'USER_REJECTED') {
        console.error("User rejected the transaction");
      }
      
      throw error; // Re-throw to let the calling code handle it
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
