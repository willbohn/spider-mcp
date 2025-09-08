# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
# Build the TypeScript project
npm run build

# Run in development mode with auto-reload
npm run dev

# Run the compiled server
npm start

# Run test suites
npm test                    # Basic test suite
npm run test:quick         # Quick smoke tests only  
npm run test:full          # Comprehensive test suite (100+ tests)
npm run test:linkedin      # LinkedIn-specific tests (28 tests)
npm run test:category      # Run tests by category

# Run benchmark tests
npm run benchmark

# Install locally for global use
./install-local.sh         # Creates global 'spider-mcp' command
```

## Architecture Overview

This is a Model Context Protocol (MCP) server that bridges AI assistants with the Spider Cloud web scraping API. The server implements the MCP specification using JSON-RPC 2.0 protocol.

### Core Components

**src/index.ts** - Main server implementation (663 lines)
- `SpiderMCPServer` class extends MCP SDK Server
- Implements 6 Spider Cloud tools: scrape, crawl, search, links, screenshot, transform
- HTTP client with Bearer token authentication via Axios
- Retry logic with exponential backoff for transient failures
- Dynamic timeout adjustment (30s default, 120s for search operations)
- Comprehensive error handling with normalized error codes

### Key Design Patterns

**API Integration**
- All Spider API calls go through `makeSpiderRequest()` method with retry logic
- Responses normalized to consistent format with success, results, count, costs, metadata
- Cost tracking integrated into every response
- Debug mode available via DEBUG environment variable

**Parameter Validation**
- Zod schemas for runtime type validation
- Comprehensive parameter schemas matching Spider API capabilities
- Parameter normalization (e.g., `waitFor` → `wait_for`)

**Error Handling Strategy**
- 4xx errors (except 429) fail immediately - client errors
- 429 and 5xx errors trigger exponential backoff retry
- Network/timeout errors also trigger retry
- Maximum 3 retries with delays: 1s, 2s, 4s

### Testing Infrastructure

**test-runner.js** - Main test orchestrator
- Spawns MCP server as child process
- Sends JSON-RPC requests via stdio
- Supports filtering by category, test name, or test suite
- Detailed reporting with timing and cost tracking

**Test Suites**
- test.js - Basic functionality tests
- test-comprehensive.js - 100+ tests across 10 categories
- test-linkedin.js - 28 LinkedIn-specific tests
- benchmark.js - Performance benchmarking

## Critical Implementation Details

### Timeout Handling
Search operations require longer timeouts (120s) due to Spider API processing time. The server dynamically adjusts timeout based on operation type in `makeSpiderRequest()`.

### LinkedIn Scraping
LinkedIn requires specific parameters for success:
- `js: true` - JavaScript rendering required
- `stealth: true` - Stealth mode to avoid detection  
- `anti_bot: true` - Anti-bot bypass mechanisms

### API Response Normalization
All tools return consistent structure regardless of Spider API response format:
```javascript
{
  success: boolean,
  results: array,
  count: number,
  costs: { total_cost, compute_cost, bandwidth_cost },
  metadata: { duration, status }
}
```

### Environment Configuration
Required: `SPIDER_API_KEY`
Optional: `SPIDER_API_BASE_URL`, `SPIDER_REQUEST_TIMEOUT`, `DEBUG`

## Common Issues and Solutions

**"Payment required" errors**: API key needs credits at spider.cloud
**Search timeouts**: Normal - searches take 15-30s, timeout set to 120s
**LinkedIn 403 errors**: Ensure js, stealth, and anti_bot are all enabled
**Rate limiting**: Implemented exponential backoff automatically handles 429s