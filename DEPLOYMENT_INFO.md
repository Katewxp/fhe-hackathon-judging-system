# Deployment Information

## Contract Deployment Details

### HackathonJudging Contract
- **Contract Address**: `0x2aE943E41947954CD782698F906d95B7104562A1`
- **Network**: Sepolia Testnet
- **Deployment Date**: September 2, 2025
- **Deployment Status**: ✅ Successfully Deployed

### Network Configuration
- **RPC URL**: https://1rpc.io/sepolia
- **Chain ID**: 11155111
- **Explorer**: https://sepolia.etherscan.io

### Contract Functions
The deployed contract includes the following main functions:

#### Organizer Functions
- `createHackathon(string name, string description, uint256 startTime, uint256 endTime)`
- `registerProject(uint256 hackathonId, string name, string description)`
- `registerJudge(uint256 hackathonId, address judgeAddress)`
- `publishRankings(uint256 hackathonId)`

#### Judge Functions
- `submitScore(uint256 hackathonId, uint256 projectId, externalEuint8 encryptedScore, bytes proof)`

#### Public Functions
- `aggregateScores(uint256 hackathonId, uint256 projectId)`
- `getHackathon(uint256 hackathonId)`
- `getProject(uint256 hackathonId, uint256 projectId)`
- `getJudge(uint256 hackathonId, address judgeAddress)`

### FHE Integration
- **FHE Library**: @fhevm/solidity
- **Encrypted Types**: euint8, externalEuint8
- **Privacy Features**: Encrypted score submission and aggregation

### Next Steps
1. **Frontend Integration**: Connect frontend to deployed contract
2. **FHE Client Setup**: Configure FHE client for score encryption
3. **Testing**: Test encrypted score submission and aggregation
4. **Demo**: Run end-to-end hackathon judging workflow

### Verification
Contract verification on Etherscan can be done manually using the contract address and source code.
