#!/bin/bash

echo "Installing Spider MCP Server locally..."
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the project
echo "Building project..."
npm run build

# Create global link
echo "Creating global link..."
npm link

echo ""
echo "✅ Installation complete!"
echo ""
echo "You can now use 'spider-mcp' command globally."
echo ""
echo "Add this to your Claude Desktop config:"
echo '{'
echo '  "mcpServers": {'
echo '    "spider": {'
echo '      "command": "spider-mcp",'
echo '      "env": {'
echo '        "SPIDER_API_KEY": "your_api_key_here"'
echo '      }'
echo '    }'
echo '  }'
echo '}'
echo ""