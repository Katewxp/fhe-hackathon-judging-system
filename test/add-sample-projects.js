const { ethers } = require('ethers');

const CONTRACT_ADDRESS = "0x2aE943E41947954CD782698F906d95B7104562A1";
const RPC_URL = "https://1rpc.io/sepolia";

// Sample projects for hackathon 2 (the only active one we can add to)
const sampleProjects = {
  2: [ // Third hackathon - the only active one
    {
      name: "Healthcare Data Privacy Protocol",
      description: "A secure protocol for sharing medical data while maintaining patient privacy using homomorphic encryption.",
      githubUrl: "https://github.com/example/healthcare-privacy",
      demoUrl: "https://healthcare-demo.example.com"
    },
    {
      name: "Supply Chain Transparency System", 
      description: "A blockchain-based system that tracks products from origin to consumer, ensuring authenticity and ethical sourcing.",
      githubUrl: "https://github.com/example/supply-chain",
      demoUrl: "https://supply-chain-demo.example.com"
    },
    {
      name: "Decentralized Identity Solution",
      description: "A self-sovereign identity system that allows users to control their personal data and prove their identity without revealing sensitive information.",
      githubUrl: "https://github.com/example/decentralized-identity",
      demoUrl: "https://identity-demo.example.com"
    },
    {
      name: "DeFi Yield Optimizer",
      description: "A smart contract system that automatically finds and invests in the highest yield DeFi protocols while managing risk through diversification.",
      githubUrl: "https://github.com/example/defi-optimizer",
      demoUrl: "https://defi-demo.example.com"
    },
    {
      name: "NFT Marketplace with Privacy",
      description: "A decentralized NFT marketplace that uses zero-knowledge proofs to enable private trading and ownership verification.",
      githubUrl: "https://github.com/example/nft-marketplace",
      demoUrl: "https://nft-demo.example.com"
    },
    {
      name: "Cross-Chain Bridge Protocol",
      description: "A secure and efficient bridge protocol that enables seamless asset transfers between different blockchain networks.",
      githubUrl: "https://github.com/example/cross-chain-bridge",
      demoUrl: "https://bridge-demo.example.com"
    }
  ]
};

async function addSampleProjects() {
  try {
    console.log("Connecting to Sepolia network...");
    
    // You'll need to provide your private key here
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      console.error("Please set PRIVATE_KEY environment variable");
      return;
    }
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    const contract = new ethers.Contract(CONTRACT_ADDRESS, [
      "function registerProject(uint256 hackathonId, string name, string description, string githubUrl, string demoUrl) external"
    ], wallet);
    
    console.log("Connected with wallet:", wallet.address);
    
    for (const [hackathonId, projects] of Object.entries(sampleProjects)) {
      console.log(`\nAdding projects for hackathon ${hackathonId}...`);
      
      for (const project of projects) {
        try {
          console.log(`  Adding project: ${project.name}`);
          const tx = await contract.registerProject(
            hackathonId,
            project.name,
            project.description,
            project.githubUrl || "",
            project.demoUrl || ""
          );
          
          console.log(`    Transaction sent: ${tx.hash}`);
          await tx.wait();
          console.log(`    ✅ Project added successfully`);
          
          // Wait a bit between transactions
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`    ❌ Failed to add project ${project.name}:`, error.message);
        }
      }
    }
    
    console.log("\n🎉 Sample projects added successfully!");
    
  } catch (error) {
    console.error("Error adding sample projects:", error);
  }
}

// Check if running directly
if (require.main === module) {
  addSampleProjects();
}

module.exports = { addSampleProjects };
