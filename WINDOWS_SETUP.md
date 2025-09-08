# Windows Setup Guide for Spider MCP Server

This guide provides detailed instructions for Windows users to set up and use the Spider MCP Server with various MCP clients.

## Prerequisites

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: Open PowerShell or Command Prompt and run `node --version`

2. **Spider Cloud API Key**
   - Get your free API key at: https://spider.cloud
   - Keep it handy for configuration

## Installation Methods

### Method 1: Using npm (Simplest)

Open PowerShell or Command Prompt as Administrator:

```powershell
# Install globally
npm install -g @willbohn/spider-mcp

# Verify installation
spider-mcp --version
```

### Method 2: Clone from GitHub

```powershell
# Clone the repository
git clone https://github.com/willbohn/spider-mcp.git
cd spider-mcp

# Option A: Use PowerShell installer
.\install-windows.ps1

# Option B: Use batch installer
install-windows.bat

# Option C: Manual installation
npm install
npm run build
npm link
```

## Claude Desktop Configuration

### Step 1: Locate Configuration File

The configuration file is located at:
```
%APPDATA%\Claude\claude_desktop_config.json
```

To find it:
1. Press `Win + R`
2. Type `%APPDATA%\Claude`
3. Press Enter
4. Open or create `claude_desktop_config.json`

### Step 2: Add Spider MCP Configuration

Add this configuration to the file:

```json
{
  "mcpServers": {
    "spider": {
      "command": "npx",
      "args": ["@willbohn/spider-mcp"],
      "env": {
        "SPIDER_API_KEY": "your_spider_api_key_here"
      }
    }
  }
}
```

### Alternative: Direct Path Configuration

If npm doesn't work, use a direct path:

```json
{
  "mcpServers": {
    "spider": {
      "command": "node",
      "args": ["C:\\Users\\YourUsername\\spider-mcp\\dist\\index.js"],
      "env": {
        "SPIDER_API_KEY": "your_spider_api_key_here"
      }
    }
  }
}
```

**Important:** Replace `YourUsername` with your actual Windows username.

### Step 3: Restart Claude Desktop

After saving the configuration:
1. Completely quit Claude Desktop (right-click system tray icon → Exit)
2. Start Claude Desktop again
3. The Spider tools should now be available

## Testing Your Setup

### PowerShell

```powershell
# Set API key for current session
$env:SPIDER_API_KEY = "your_api_key_here"

# Run basic test
node test.js

# Run with debug output
$env:DEBUG = "true"
node test.js

# Run specific test suite
npm run test:quick
```

### Command Prompt

```cmd
REM Set API key
set SPIDER_API_KEY=your_api_key_here

REM Run basic test
node test.js

REM Run with debug output
set DEBUG=true
node test.js
```

### Windows Terminal

Windows Terminal supports both PowerShell and Command Prompt. Use the appropriate commands based on your shell.

## Troubleshooting

### Common Issues

#### "npm is not recognized as a command"
- Node.js is not installed or not in PATH
- Solution: Reinstall Node.js and ensure "Add to PATH" is checked during installation

#### "SPIDER_API_KEY environment variable is required"
- API key not set correctly
- Solution: Set the environment variable before running:
  ```powershell
  $env:SPIDER_API_KEY = "your_key"
  ```

#### "Cannot find module" errors
- Dependencies not installed properly
- Solution: Run `npm install` in the project directory

#### Claude Desktop doesn't show Spider tools
- Configuration file syntax error or wrong location
- Solution: 
  1. Verify JSON syntax (no trailing commas)
  2. Check file location: `%APPDATA%\Claude\claude_desktop_config.json`
  3. Restart Claude Desktop completely

#### Permission errors during installation
- Insufficient privileges
- Solution: Run PowerShell or Command Prompt as Administrator

### Path Issues

Windows paths in JSON require either:
- Double backslashes: `"C:\\Users\\Name\\folder"`
- Forward slashes: `"C:/Users/Name/folder"`

### Environment Variables

Set persistent environment variables:

1. **Via System Properties:**
   - Right-click "This PC" → Properties
   - Click "Advanced system settings"
   - Click "Environment Variables"
   - Add new User variable: `SPIDER_API_KEY` with your key

2. **Via PowerShell (persistent):**
   ```powershell
   [System.Environment]::SetEnvironmentVariable('SPIDER_API_KEY', 'your_key', 'User')
   ```

3. **Via Command Prompt (persistent):**
   ```cmd
   setx SPIDER_API_KEY "your_key"
   ```

## Using with Other MCP Clients

### Claude Code

Claude Code auto-detects MCP servers. Just ensure Spider MCP is installed globally:

```powershell
npm install -g @willbohn/spider-mcp
```

### VS Code with Continue Extension

Add to your Continue configuration:

```json
{
  "mcpServers": [
    {
      "name": "spider",
      "command": "npx",
      "args": ["@willbohn/spider-mcp"],
      "env": {
        "SPIDER_API_KEY": "your_key"
      }
    }
  ]
}
```

### Cursor IDE

Add to Cursor settings:

```json
{
  "mcp.servers": {
    "spider": {
      "command": "npx",
      "args": ["@willbohn/spider-mcp"],
      "env": {
        "SPIDER_API_KEY": "your_key"
      }
    }
  }
}
```

## Advanced Usage

### Running Multiple Instances

You can run multiple Spider MCP instances with different API keys:

```json
{
  "mcpServers": {
    "spider-prod": {
      "command": "npx",
      "args": ["@willbohn/spider-mcp"],
      "env": {
        "SPIDER_API_KEY": "production_key"
      }
    },
    "spider-dev": {
      "command": "npx",
      "args": ["@willbohn/spider-mcp"],
      "env": {
        "SPIDER_API_KEY": "development_key",
        "DEBUG": "true"
      }
    }
  }
}
```

### Custom Timeout Configuration

For slow connections or large scraping operations:

```json
{
  "mcpServers": {
    "spider": {
      "command": "npx",
      "args": ["@willbohn/spider-mcp"],
      "env": {
        "SPIDER_API_KEY": "your_key",
        "SPIDER_REQUEST_TIMEOUT": "180000"
      }
    }
  }
}
```

## Security Notes

1. **Never commit API keys** to version control
2. **Use environment variables** instead of hardcoding keys
3. **Restrict API key permissions** in Spider Cloud dashboard
4. **Rotate keys regularly** for production use

## Getting Help

- **GitHub Issues:** https://github.com/willbohn/spider-mcp/issues
- **Spider Cloud Support:** https://spider.cloud/support
- **MCP Documentation:** https://modelcontextprotocol.io

## Quick Reference

| Task | PowerShell | Command Prompt |
|------|------------|----------------|
| Set API Key | `$env:SPIDER_API_KEY="key"` | `set SPIDER_API_KEY=key` |
| Install Package | `npm install -g @willbohn/spider-mcp` | `npm install -g @willbohn/spider-mcp` |
| Run Tests | `node test.js` | `node test.js` |
| Debug Mode | `$env:DEBUG="true"` | `set DEBUG=true` |
| Config Location | `$env:APPDATA\Claude\` | `%APPDATA%\Claude\` |