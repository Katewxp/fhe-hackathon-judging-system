import { Project } from './contractService';

// Mock project data for demonstration purposes
export const mockProjects: Project[] = [
  {
    id: 0,
    name: "Healthcare Data Privacy Protocol",
    description: "A secure protocol for sharing medical data while maintaining patient privacy using homomorphic encryption.\n\nGitHub: https://github.com/example/healthcare-privacy\nDemo: https://healthcare-demo.example.com",
    githubUrl: "https://github.com/example/healthcare-privacy",
    demoUrl: "https://healthcare-demo.example.com",
    teamLead: "0x1234567890123456789012345678901234567890",
    isRegistered: true,
    publicRank: 0
  },
  {
    id: 1,
    name: "Supply Chain Transparency System",
    description: "A blockchain-based system that tracks products from origin to consumer, ensuring authenticity and ethical sourcing.\n\nGitHub: https://github.com/example/supply-chain\nDemo: https://supply-chain-demo.example.com",
    githubUrl: "https://github.com/example/supply-chain",
    demoUrl: "https://supply-chain-demo.example.com",
    teamLead: "0x2345678901234567890123456789012345678901",
    isRegistered: true,
    publicRank: 0
  },
  {
    id: 2,
    name: "Decentralized Identity Solution",
    description: "A self-sovereign identity system that allows users to control their personal data and prove their identity without revealing sensitive information.\n\nGitHub: https://github.com/example/decentralized-identity\nDemo: https://identity-demo.example.com",
    githubUrl: "https://github.com/example/decentralized-identity",
    demoUrl: "https://identity-demo.example.com",
    teamLead: "0x3456789012345678901234567890123456789012",
    isRegistered: true,
    publicRank: 0
  },
  {
    id: 3,
    name: "DeFi Yield Optimizer",
    description: "A smart contract system that automatically finds and invests in the highest yield DeFi protocols while managing risk through diversification.\n\nGitHub: https://github.com/example/defi-optimizer\nDemo: https://defi-demo.example.com",
    githubUrl: "https://github.com/example/defi-optimizer",
    demoUrl: "https://defi-demo.example.com",
    teamLead: "0x4567890123456789012345678901234567890123",
    isRegistered: true,
    publicRank: 0
  },
  {
    id: 4,
    name: "NFT Marketplace with Privacy",
    description: "A decentralized NFT marketplace that uses zero-knowledge proofs to enable private trading and ownership verification.\n\nGitHub: https://github.com/example/nft-marketplace\nDemo: https://nft-demo.example.com",
    githubUrl: "https://github.com/example/nft-marketplace",
    demoUrl: "https://nft-demo.example.com",
    teamLead: "0x5678901234567890123456789012345678901234",
    isRegistered: true,
    publicRank: 0
  },
  {
    id: 5,
    name: "Cross-Chain Bridge Protocol",
    description: "A secure and efficient bridge protocol that enables seamless asset transfers between different blockchain networks.\n\nGitHub: https://github.com/example/cross-chain-bridge\nDemo: https://bridge-demo.example.com",
    githubUrl: "https://github.com/example/cross-chain-bridge",
    demoUrl: "https://bridge-demo.example.com",
    teamLead: "0x6789012345678901234567890123456789012345",
    isRegistered: true,
    publicRank: 0
  }
];

// Function to get mock projects for a specific hackathon
export function getMockProjects(hackathonId: number): Project[] {
  // Return different projects based on hackathon ID
  switch (hackathonId) {
    case 2: // Zama Developer Program
      return mockProjects;
    case 3: // Test Hackathon for Projects
      return mockProjects.slice(0, 3); // Return first 3 projects
    default:
      return [];
  }
}
