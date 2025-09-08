# Spider Cloud MCP Server

A high-performance Model Context Protocol (MCP) server that provides comprehensive web scraping, crawling, and data extraction capabilities through the Spider Cloud API. This server enables AI assistants like Claude to interact with web content using Spider Cloud's advanced scraping infrastructure.

## 🌟 Features

### Core Tools

- **`spider_scrape`** - Advanced single-page scraping with JavaScript rendering and anti-bot bypass
- **`spider_crawl`** - Intelligent website crawling with depth control and filtering
- **`spider_search`** - Google-like web search with content fetching capabilities
- **`spider_links`** - Comprehensive link extraction and analysis
- **`spider_screenshot`** - High-quality webpage screenshots with customization
- **`spider_transform`** - HTML to markdown/text conversion with readability processing

### Advanced Capabilities

- 🛡️ **Anti-bot Detection Bypass** - Stealth mode and advanced evasion techniques
- 🌐 **Premium Proxy Support** - Geographic targeting with country-specific proxies
- 🎭 **JavaScript Rendering** - Full browser emulation for dynamic content
- 📊 **Metadata Extraction** - Comprehensive page metadata and analytics
- 🔍 **CSS Selectors** - Precise content targeting and extraction
- 💾 **Cloud Storage** - Optional data persistence in Spider Cloud
- ⚡ **High Performance** - Optimized for speed with configurable timeouts
- 🔒 **Secure Authentication** - Bearer token authentication with API key
- 📈 **Cost Tracking** - Real-time API usage cost monitoring
- 🐛 **Debug Mode** - Comprehensive logging for troubleshooting

## 📋 Prerequisites

- Node.js 18 or higher
- Spider Cloud API key ([Get one free at spider.cloud](https://spider.cloud))
- MCP-compatible client (Claude Desktop, Claude Code, Cursor, etc.)

## 🚀 Quick Start

### Option 1: Direct from GitHub (Recommended)

```bash
# Clone and install
git clone https://github.com/spider-rs/spider-mcp.git
cd spider-mcp
npm install
npm link

# Test the installation
SPIDER_API_KEY=your_key node test.js
```

### Option 2: Direct Path Configuration

Skip installation and point directly to the built files in your MCP client configuration.

## ⚙️ Configuration

### Claude Desktop Setup

Add to your Claude Desktop configuration file:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`  
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

#### For Global Installation:
```json
{
  "mcpServers": {
    "spider": {
      "command": "spider-mcp",
      "env": {
        "SPIDER_API_KEY": "your_spider_api_key_here"
      }
    }
  }
}
```

#### For Direct Path:
```json
{
  "mcpServers": {
    "spider": {
      "command": "node",
      "args": ["C:\\path\\to\\spider-mcp\\dist\\index.js"],
      "env": {
        "SPIDER_API_KEY": "your_spider_api_key_here"
      }
    }
  }
}
```

### Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `SPIDER_API_KEY` | Yes | Your Spider Cloud API key | - |
| `SPIDER_API_BASE_URL` | No | API endpoint URL | `https://api.spider.cloud` |
| `SPIDER_REQUEST_TIMEOUT` | No | Request timeout in milliseconds | `60000` |
| `DEBUG` | No | Enable debug logging | `false` |

## 🛠️ Tool Documentation

### spider_scrape

Scrape content from a single URL with advanced options.

**Parameters:**
- `url` (required): Target URL to scrape
- `return_format`: Output format (`markdown`, `raw`, `text`, `html`, `screenshot`, `links`)
- `js`: Enable JavaScript rendering
- `wait_for`: Wait time for page load (0-60000ms)
- `css_selector`: CSS selector for specific content
- `proxy_enabled`: Use premium proxy
- `proxy_country`: Two-letter country code
- `stealth`: Enable stealth mode
- `anti_bot`: Advanced anti-bot bypass
- `headers`: Custom HTTP headers
- `cookies`: Cookie string
- `metadata`: Include metadata
- `clean_html`: Clean and sanitize HTML
- `media`: Include media elements

**Example:**
```json
{
  "url": "https://example.com",
  "return_format": "markdown",
  "js": true,
  "stealth": true,
  "css_selector": ".main-content"
}
```

### spider_crawl

Crawl an entire website with intelligent navigation.

**Parameters:**
- `url` (required): Starting URL
- `limit`: Max pages to crawl (1-10000)
- `depth`: Max crawl depth (0-10)
- `return_format`: Output format
- `whitelist`: URL patterns to include
- `blacklist`: URL patterns to exclude
- `budget`: Crawl budget configuration
- `subdomains`: Include subdomains
- `sitemap`: Use sitemap.xml
- `respect_robots`: Respect robots.txt
- Plus all proxy and rendering options from scrape

**Example:**
```json
{
  "url": "https://docs.example.com",
  "limit": 50,
  "depth": 3,
  "whitelist": ["*/api/*"],
  "return_format": "markdown"
}
```

### spider_search

Search the web with Google-like results.

**Parameters:**
- `query` (required): Search query
- `search_limit`: Max results (1-100)
- `fetch_page_content`: Fetch full content
- `tbs`: Time-based search (`qdr:d`, `qdr:w`, `qdr:m`, `qdr:y`)
- `gl`: Country code (e.g., `us`, `uk`)
- `hl`: Language code (e.g., `en`, `es`)
- `safe`: SafeSearch level (`off`, `medium`, `high`)
- Plus content fetching options

**Example:**
```json
{
  "query": "artificial intelligence news",
  "search_limit": 10,
  "tbs": "qdr:w",
  "gl": "us",
  "fetch_page_content": true
}
```

### spider_links

Extract and analyze links from a webpage.

**Parameters:**
- `url` (required): Target URL
- `limit`: Max links (1-5000)
- `depth`: Extraction depth (0-5)
- `unique`: Return only unique links
- `subdomains`: Include subdomain links
- `external`: Include external links
- Plus standard options

### spider_screenshot

Capture webpage screenshots.

**Parameters:**
- `url` (required): Target URL
- `fullpage`: Full page screenshot
- `viewport_width`: Width in pixels (320-3840)
- `viewport_height`: Height in pixels (240-2160)
- `format`: Image format (`png`, `jpeg`, `webp`)
- `quality`: JPEG/WebP quality (0-100)
- `omit_background`: Transparent background (PNG only)
- `clip`: Region to capture

### spider_transform

Transform HTML to clean, readable formats.

**Parameters:**
- `data` (required): HTML/text to transform
- `return_format` (required): Target format (`markdown`, `text`, `raw`, `clean_html`)
- `readability`: Apply readability processing
- `clean`: Remove unnecessary elements
- `include_links`: Include hyperlinks
- `include_images`: Include images

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Set your API key
export SPIDER_API_KEY=your_api_key_here

# Run tests
node test.js

# With debug output
DEBUG=true node test.js
```

## 📊 API Response Format

All tools return responses in a consistent format:

```json
{
  "success": true,
  "results": [...],
  "count": 10,
  "costs": {
    "total_cost": 0.00012,
    "compute_cost": 0.00008,
    "bandwidth_cost": 0.00004
  },
  "metadata": {
    "duration": 1234,
    "status": 200
  }
}
```

## 🔧 Development

### Building from Source

```bash
npm install
npm run build
```

### Running in Development Mode

```bash
npm run dev
```

### Project Structure

```
spider-mcp/
├── src/
│   └── index.ts        # Main server implementation
├── dist/               # Compiled JavaScript
├── examples/           # Configuration examples
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── README.md          # This file
```

## 🐛 Troubleshooting

### Common Issues

#### "SPIDER_API_KEY environment variable is required"
- Ensure your API key is set in the environment or configuration
- Check the key is valid at [spider.cloud](https://spider.cloud)

#### "Payment required" error
- Your API key needs credits
- Add credits at [spider.cloud](https://spider.cloud)

#### "Rate limit exceeded"
- You've hit the API rate limit
- Wait a few minutes or upgrade your plan

#### Search tool timeout
- Search operations can take 15-30 seconds
- This is normal behavior for comprehensive searches

### Debug Mode

Enable detailed logging:

```bash
DEBUG=true SPIDER_API_KEY=your_key node dist/index.js
```

## 📝 Error Handling

The server provides detailed error messages:

- **401**: Invalid API key
- **402**: Payment required (add credits)
- **429**: Rate limit exceeded
- **500+**: Server errors (contact support)

## 🔒 Security

- API keys are never logged or stored
- All requests use HTTPS
- Bearer token authentication
- Input validation on all parameters
- Sanitized error messages

## 📈 Performance

- Configurable timeouts (default: 60s)
- Automatic retry logic for transient failures
- Connection pooling for efficiency
- Response caching at API level
- Optimized for concurrent requests

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🔗 Resources

- [Spider Cloud Documentation](https://spider.cloud/docs)
- [API Reference](https://spider.cloud/docs/api)
- [MCP Specification](https://modelcontextprotocol.io)
- [GitHub Repository](https://github.com/spider-rs/spider-mcp)

## 💬 Support

- **MCP Server Issues**: [GitHub Issues](https://github.com/spider-rs/spider-mcp/issues)
- **Spider API Support**: [spider.cloud/support](https://spider.cloud/support)
- **API Status**: [status.spider.cloud](https://status.spider.cloud)

---

Built with ❤️ for the MCP ecosystem