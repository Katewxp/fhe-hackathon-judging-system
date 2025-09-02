#!/bin/bash

echo "🚀 Starting Hackathon Judging System..."
echo "========================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp env.example .env
    echo "📝 Please edit .env file with your configuration:"
    echo "   - SEPOLIA_RPC_URL: Your Sepolia RPC endpoint"
    echo "   - PRIVATE_KEY: Your deployment private key"
    echo "   - ETHERSCAN_API_KEY: Your Etherscan API key"
    echo ""
    echo "After editing .env, run this script again."
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing smart contract dependencies..."
    npm install
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

# Compile contracts
echo "🔨 Compiling smart contracts..."
npm run compile

if [ $? -eq 0 ]; then
    echo "✅ Smart contracts compiled successfully"
else
    echo "❌ Smart contract compilation failed"
    exit 1
fi

# Start frontend development server
echo "🌐 Starting frontend development server..."
echo "📱 Frontend will be available at: http://localhost:3000"
echo "🔗 Smart contract artifacts are ready for deployment"
echo ""
echo "Next steps:"
echo "1. Deploy to Sepolia: npm run deploy:sepolia"
echo "2. Run tests: npm run test"
echo "3. View example usage: npm run example-usage"
echo ""

cd frontend
npm run dev
