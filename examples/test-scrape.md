# Testing Spider MCP Server

## Prerequisites

1. Set your Spider API key:
```bash
export SPIDER_API_KEY="your_api_key_here"
# or on Windows:
set SPIDER_API_KEY=your_api_key_here
```

2. Build the project:
```bash
npm install
npm run build
```

## Test Examples

### 1. Basic Scrape Test

After configuring the server in Claude Desktop, you can test with:

```
Please use the spider_scrape tool to get the content from https://example.com in markdown format
```

Expected result: The tool should return the content of example.com formatted as markdown.

### 2. Search Test

```
Use the spider_search tool to search for "web scraping best practices" and return the top 3 results
```

Expected result: The tool should return search results with titles, URLs, and snippets.

### 3. Crawl Test

```
Use the spider_crawl tool to crawl https://example.com with a limit of 5 pages
```

Expected result: The tool should return content from multiple pages of the website.

### 4. Screenshot Test

```
Use the spider_screenshot tool to take a screenshot of https://example.com
```

Expected result: The tool should return a base64-encoded image.

### 5. Transform Test

```
Use the spider_transform tool to convert this HTML to markdown:
<html><body><h1>Hello World</h1><p>This is a test.</p></body></html>
```

Expected result: The tool should return markdown formatted text.

## Manual Testing with curl

You can also test the API directly:

```bash
# Test scraping
curl -X POST https://api.spider.cloud/scrape \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "return_format": "markdown"}'

# Test search
curl -X POST https://api.spider.cloud/search \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"search": "web scraping", "search_limit": 5}'
```

## Troubleshooting

1. **API Key Issues**: Make sure your API key is valid and has credits
2. **Connection Issues**: Ensure the server path in Claude Desktop config is correct
3. **Build Issues**: Run `npm run build` before testing
4. **Rate Limits**: Check your Spider Cloud dashboard for usage limits