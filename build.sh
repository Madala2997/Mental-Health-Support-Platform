#!/bin/bash

echo "🚀 Building MindMitra Full-Stack Application..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create client directory if it doesn't exist
if [ ! -d "client" ]; then
    echo "📁 Creating client directory..."
    mkdir -p client
fi

# Ensure all frontend files are in client directory
echo "📋 Verifying frontend files..."
if [ ! -f "client/index.html" ]; then
    echo "⚠️  Frontend files not found in client directory"
    if [ -f "public/index.html" ]; then
        echo "📂 Moving files from public to client..."
        cp -r public/* client/
    fi
fi

echo "✅ Build completed successfully!"
echo "🌐 Frontend files served from: ./client/"
echo "🔧 Backend API available at: /api/"
