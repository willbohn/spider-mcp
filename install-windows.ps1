#!/usr/bin/env pwsh

Write-Host "Installing Spider MCP Server locally..." -ForegroundColor Cyan
Write-Host ""

# Check if npm is installed
try {
    $null = Get-Command npm -ErrorAction Stop
} catch {
    Write-Host "Error: npm is not installed" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Green
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Build the project
Write-Host "Building project..." -ForegroundColor Green
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to build project" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Create global link
Write-Host "Creating global link..." -ForegroundColor Green
npm link
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to create global link" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Installation complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "You can now use 'spider-mcp' command globally." -ForegroundColor Cyan
Write-Host ""
Write-Host "Add this to your Claude Desktop config at:" -ForegroundColor Yellow
Write-Host "$env:APPDATA\Claude\claude_desktop_config.json" -ForegroundColor White
Write-Host ""
Write-Host @"
{
  "mcpServers": {
    "spider": {
      "command": "spider-mcp",
      "env": {
        "SPIDER_API_KEY": "your_api_key_here"
      }
    }
  }
}
"@ -ForegroundColor Cyan
Write-Host ""
Write-Host "Or use with npx:" -ForegroundColor Yellow
Write-Host @"
{
  "mcpServers": {
    "spider": {
      "command": "npx",
      "args": ["@willbohn/spider-mcp"],
      "env": {
        "SPIDER_API_KEY": "your_api_key_here"
      }
    }
  }
}
"@ -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"