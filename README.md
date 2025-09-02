# Hackathon Judging System

A decentralized hackathon judging system that uses Fully Homomorphic Encryption (FHE) to ensure complete privacy during the judging process. Judges submit encrypted scores, which are aggregated homomorphically on-chain without revealing individual scores.

## 🚀 Features

- **Privacy-Preserving**: All scores are encrypted using FHE, ensuring complete privacy
- **Real-time Aggregation**: Scores are aggregated homomorphically on-chain
- **Decentralized**: Built on blockchain technology for transparency and immutability
- **Secure**: Uses advanced cryptographic techniques to protect sensitive data
- **User-Friendly**: Modern web interface with wallet integration

## 🏗️ Architecture

### Smart Contract (Solidity + FHEVM)
- `HackathonJudging.sol`: Main contract managing hackathons, projects, judges, and encrypted scoring
- Uses FHEVM for encrypted score aggregation
- Supports multiple hackathons with separate project and judge management

### Frontend (Next.js + TypeScript)
- Modern React application with TypeScript
- Wallet integration (MetaMask support)
- FHE score encryption simulation
- Responsive design with Tailwind CSS

## 🛠️ Technology Stack

### Backend
- **Solidity**: Smart contract development
- **FHEVM**: Fully Homomorphic Encryption on Ethereum
- **Hardhat**: Development and testing framework
- **TypeScript**: Type-safe development

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Ethers.js**: Ethereum library for wallet integration
- **Lucide React**: Icon library

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- MetaMask or compatible Web3 wallet
- Access to Sepolia testnet (for deployment)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd hackathon-judging-system
```

### 2. Install Dependencies

```bash
# Install smart contract dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Environment Setup

Copy the environment example file and configure your settings:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
FHE_NETWORK=sepolia
```

### 4. Compile Smart Contracts

```bash
npm run compile
```

### 5. Run Tests

```bash
npm run test
```

### 6. Deploy to Sepolia Testnet

```bash
npm run deploy:sepolia
```

### 7. Start Frontend Development Server

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Smart Contract Functions

### Organizer Functions
- `createHackathon()`: Create a new hackathon
- `registerJudge()`: Register judges for a hackathon
- `aggregateScores()`: Aggregate encrypted scores for projects
- `publishRankings()`: Publish final project rankings

### Judge Functions
- `submitScore()`: Submit encrypted score for a project

### View Functions
- `getHackathon()`: Get hackathon information
- `getProject()`: Get project details
- `getJudge()`: Get judge information
- `getJudgeScore()`: Get encrypted score for a judge
- `getAggregatedScore()`: Get aggregated score for a project

## 🔒 FHE Implementation

The system uses FHEVM to implement privacy-preserving scoring:

1. **Score Encryption**: Judges encrypt their scores using FHE before submission
2. **Homomorphic Aggregation**: Scores are aggregated on-chain without decryption
3. **Result Decryption**: Final aggregated scores are decrypted only when needed

### Current Implementation
- Mock FHE encryption for demonstration purposes
- Ready for integration with actual FHE client libraries
- Supports score range 1-10 with euint8 encoding

## 🎯 Usage Workflow

### 1. Create Hackathon
Organizer creates a hackathon with name, description, and time parameters.

### 2. Register Projects
Teams register their projects with details like name, description, and URLs.

### 3. Register Judges
Organizer registers judges who will evaluate the projects.

### 4. Submit Scores
Judges submit encrypted scores for each project using FHE.

### 5. Aggregate Scores
Organizer triggers score aggregation using FHEVM.

### 6. Publish Rankings
Final project rankings are published after aggregation.

## 🧪 Testing

Run the test suite to verify smart contract functionality:

```bash
npm run test
```

Tests cover:
- Hackathon creation and management
- Project registration
- Judge registration
- Score submission (mock FHE)
- Access control
- Contract state management

## 🚀 Deployment

### Local Development
```bash
npm run deploy:local
```

### Sepolia Testnet
```bash
npm run deploy:sepolia
```

### Production
1. Update environment variables
2. Run deployment script
3. Verify contract on Etherscan
4. Update frontend configuration

## 🌐 Frontend Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/.next`
3. Deploy automatically on push to main branch

### Environment Variables
Set these in Vercel:
- `NEXT_PUBLIC_CONTRACT_ADDRESS`: Deployed contract address
- `NEXT_PUBLIC_NETWORK_ID`: Network ID (11155111 for Sepolia)

## 🔧 Configuration

### Smart Contract
- Update `hardhat.config.ts` for different networks
- Configure FHE parameters in contract
- Set access control and permissions

### Frontend
- Update contract addresses in configuration
- Customize UI components and styling
- Configure wallet connection options

## 📚 API Reference

### Smart Contract Events
- `HackathonCreated`: Emitted when a hackathon is created
- `ProjectRegistered`: Emitted when a project is registered
- `JudgeRegistered`: Emitted when a judge is registered
- `ScoreSubmitted`: Emitted when a score is submitted
- `ScoresAggregated`: Emitted when scores are aggregated
- `FinalRankingsPublished`: Emitted when rankings are published

### Frontend Hooks
- `useWallet()`: Wallet connection and management
- `useFHE()`: FHE operations and score encryption

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Review the test files for examples

## 🔮 Future Enhancements

- Integration with actual FHE client libraries
- Support for different scoring scales
- Advanced aggregation algorithms
- Multi-chain deployment
- Mobile application
- API for third-party integrations

## ⚠️ Security Notes

- This is a demonstration implementation
- FHE encryption is currently mocked
- Production use requires security audit
- Private key management is critical
- Test thoroughly before mainnet deployment

## 📊 Performance

- Smart contract optimized for gas efficiency
- Frontend optimized for fast loading
- Responsive design for all devices
- Efficient state management

---

Built with ❤️ using FHEVM and Next.js | Secure • Private • Transparent
