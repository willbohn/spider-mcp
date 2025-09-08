@echo off
echo Installing Spider MCP Server locally...
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: npm is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Install dependencies
echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

REM Build the project
echo Building project...
call npm run build
if %errorlevel% neq 0 (
    echo Error: Failed to build project
    pause
    exit /b 1
)

REM Create global link
echo Creating global link...
call npm link
if %errorlevel% neq 0 (
    echo Error: Failed to create global link
    pause
    exit /b 1
)

echo.
echo ========================================
echo Installation complete!
echo ========================================
echo.
echo You can now use 'spider-mcp' command globally.
echo.
echo Add this to your Claude Desktop config at:
echo %%APPDATA%%\Claude\claude_desktop_config.json
echo.
echo {
echo   "mcpServers": {
echo     "spider": {
echo       "command": "spider-mcp",
echo       "env": {
echo         "SPIDER_API_KEY": "your_api_key_here"
echo       }
echo     }
echo   }
echo }
echo.
echo Or use with npx:
echo {
echo   "mcpServers": {
echo     "spider": {
echo       "command": "npx",
echo       "args": ["@willbohn/spider-mcp"],
echo       "env": {
echo         "SPIDER_API_KEY": "your_api_key_here"
echo       }
echo     }
echo   }
echo }
echo.
pause