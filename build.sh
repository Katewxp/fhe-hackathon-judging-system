#!/bin/bash

echo "🚀 Building Hackathon Judging System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing smart contract dependencies..."
npm install

echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Compile smart contracts
echo "🔨 Compiling smart contracts..."
npm run compile

if [ $? -eq 0 ]; then
    echo "✅ Smart contracts compiled successfully"
else
    echo "❌ Smart contract compilation failed"
    exit 1
fi

# Run tests
echo "🧪 Running tests..."
npm run test

if [ $? -eq 0 ]; then
    echo "✅ All tests passed"
else
    echo "❌ Some tests failed"
    exit 1
fi

# Build frontend
echo "🌐 Building frontend..."
cd frontend
npm run build
cd ..

if [ $? -eq 0 ]; then
    echo "✅ Frontend built successfully"
else
    echo "❌ Frontend build failed"
    exit 1
fi

echo ""
echo "🎉 Build completed successfully!"
echo ""
echo "Next steps:"
echo "1. Deploy smart contract: npm run deploy:sepolia"
echo "2. Deploy frontend to Vercel: git push origin main"
echo "3. Update frontend environment variables with contract address"
echo ""
echo "Happy coding! 🚀"
