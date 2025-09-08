#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const SPIDER_API_KEY = process.env.SPIDER_API_KEY;
const SPIDER_API_BASE_URL = process.env.SPIDER_API_BASE_URL || 'https://api.spider.cloud';
const REQUEST_TIMEOUT = parseInt(process.env.SPIDER_REQUEST_TIMEOUT || '60000');
const DEBUG_MODE = process.env.DEBUG === 'true';

if (!SPIDER_API_KEY) {
  console.error('Error: SPIDER_API_KEY environment variable is required');
  console.error('Please set your Spider Cloud API key in the environment or .env file');
  console.error('Get your API key at: https://spider.cloud');
  process.exit(1);
}

// Enhanced parameter schemas with all Spider API options
const ScrapeParamsSchema = z.object({
  url: z.string().url().describe('The URL to scrape'),
  return_format: z.enum(['markdown', 'raw', 'text', 'html', 'screenshot', 'links']).optional()
    .describe('Format to return the content in (default: markdown)'),
  wait_for: z.number().min(0).max(60000).optional()
    .describe('Time to wait for page load in milliseconds (0-60000)'),
  timeout: z.number().min(1000).max(180000).optional()
    .describe('Request timeout in milliseconds (1000-180000)'),
  proxy_enabled: z.boolean().optional()
    .describe('Enable premium proxy for the request'),
  proxy_country: z.string().length(2).optional()
    .describe('Proxy country code (e.g., "US", "GB", "DE")'),
  store_data: z.boolean().optional()
    .describe('Store the scraped data in Spider Cloud'),
  metadata: z.boolean().optional()
    .describe('Include metadata in the response'),
  css_selector: z.string().optional()
    .describe('CSS selector to extract specific content'),
  js: z.boolean().optional()
    .describe('Enable JavaScript rendering'),
  stealth: z.boolean().optional()
    .describe('Enable stealth mode to avoid detection'),
  headers: z.record(z.string()).optional()
    .describe('Custom HTTP headers to send with request'),
  anti_bot: z.boolean().optional()
    .describe('Enable advanced anti-bot detection bypass'),
  clean_html: z.boolean().optional()
    .describe('Clean and sanitize HTML output'),
  media: z.boolean().optional()
    .describe('Include media elements (images, videos) in output'),
  cookies: z.string().optional()
    .describe('Cookie string to use for the request')
});

const CrawlParamsSchema = z.object({
  url: z.string().url().describe('The URL to start crawling from'),
  limit: z.number().min(1).max(10000).optional()
    .describe('Maximum number of pages to crawl (1-10000)'),
  depth: z.number().min(0).max(10).optional()
    .describe('Maximum crawl depth (0-10)'),
  return_format: z.enum(['markdown', 'raw', 'text', 'html', 'links']).optional()
    .describe('Format to return the content in (default: markdown)'),
  proxy_enabled: z.boolean().optional()
    .describe('Enable premium proxy for the request'),
  proxy_country: z.string().length(2).optional()
    .describe('Proxy country code'),
  store_data: z.boolean().optional()
    .describe('Store the crawled data in Spider Cloud'),
  metadata: z.boolean().optional()
    .describe('Include metadata in the response'),
  whitelist: z.array(z.string()).optional()
    .describe('URL patterns to include (supports wildcards)'),
  blacklist: z.array(z.string()).optional()
    .describe('URL patterns to exclude (supports wildcards)'),
  budget: z.object({
    max_pages: z.number().optional(),
    max_depth: z.number().optional(),
    max_time: z.number().optional()
  }).optional().describe('Crawl budget configuration'),
  js: z.boolean().optional()
    .describe('Enable JavaScript rendering for all pages'),
  stealth: z.boolean().optional()
    .describe('Enable stealth mode to avoid detection'),
  headers: z.record(z.string()).optional()
    .describe('Custom HTTP headers to send with requests'),
  anti_bot: z.boolean().optional()
    .describe('Enable advanced anti-bot detection bypass'),
  subdomains: z.boolean().optional()
    .describe('Include subdomains in crawl'),
  sitemap: z.boolean().optional()
    .describe('Use sitemap.xml if available'),
  respect_robots: z.boolean().optional()
    .describe('Respect robots.txt rules')
});

const SearchParamsSchema = z.object({
  query: z.string().min(1).describe('The search query'),
  search_limit: z.number().min(1).max(100).optional()
    .describe('Maximum number of search results (1-100)'),
  fetch_page_content: z.boolean().optional()
    .describe('Fetch full page content for each result'),
  return_format: z.enum(['markdown', 'raw', 'text', 'html']).optional()
    .describe('Format for fetched page content'),
  proxy_enabled: z.boolean().optional()
    .describe('Enable premium proxy for the request'),
  proxy_country: z.string().length(2).optional()
    .describe('Proxy country code'),
  store_data: z.boolean().optional()
    .describe('Store the search results in Spider Cloud'),
  metadata: z.boolean().optional()
    .describe('Include metadata in the response'),
  tbs: z.string().optional()
    .describe('Time-based search (e.g., "qdr:d" for past day, "qdr:w" for past week)'),
  gl: z.string().length(2).optional()
    .describe('Country for search (e.g., "us", "uk", "de")'),
  hl: z.string().optional()
    .describe('Language for search (e.g., "en", "es", "fr")'),
  num: z.number().min(1).max(100).optional()
    .describe('Number of results per page'),
  start: z.number().min(0).optional()
    .describe('Starting result offset'),
  safe: z.enum(['off', 'medium', 'high']).optional()
    .describe('SafeSearch filter level')
});

const LinksParamsSchema = z.object({
  url: z.string().url().describe('The URL to extract links from'),
  limit: z.number().min(1).max(5000).optional()
    .describe('Maximum number of links to return (1-5000)'),
  depth: z.number().min(0).max(5).optional()
    .describe('Maximum depth for link extraction (0-5)'),
  return_format: z.enum(['markdown', 'raw', 'text', 'html', 'json']).optional()
    .describe('Format to return the links in'),
  proxy_enabled: z.boolean().optional()
    .describe('Enable premium proxy for the request'),
  proxy_country: z.string().length(2).optional()
    .describe('Proxy country code'),
  store_data: z.boolean().optional()
    .describe('Store the extracted links in Spider Cloud'),
  metadata: z.boolean().optional()
    .describe('Include metadata in the response'),
  subdomains: z.boolean().optional()
    .describe('Include subdomain links'),
  external: z.boolean().optional()
    .describe('Include external domain links'),
  unique: z.boolean().optional()
    .describe('Return only unique links')
});

const ScreenshotParamsSchema = z.object({
  url: z.string().url().describe('The URL to take a screenshot of'),
  fullpage: z.boolean().optional()
    .describe('Take a full page screenshot'),
  viewport_width: z.number().min(320).max(3840).optional()
    .describe('Viewport width in pixels (320-3840)'),
  viewport_height: z.number().min(240).max(2160).optional()
    .describe('Viewport height in pixels (240-2160)'),
  wait_for: z.number().min(0).max(60000).optional()
    .describe('Time to wait before taking screenshot (0-60000ms)'),
  timeout: z.number().min(1000).max(180000).optional()
    .describe('Request timeout in milliseconds'),
  proxy_enabled: z.boolean().optional()
    .describe('Enable premium proxy for the request'),
  proxy_country: z.string().length(2).optional()
    .describe('Proxy country code'),
  format: z.enum(['png', 'jpeg', 'webp']).optional()
    .describe('Image format (default: png)'),
  quality: z.number().min(0).max(100).optional()
    .describe('Image quality for jpeg/webp (0-100)'),
  omit_background: z.boolean().optional()
    .describe('Make background transparent (png only)'),
  clip: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number()
  }).optional().describe('Clip screenshot to specific region')
});

const TransformParamsSchema = z.object({
  data: z.string().describe('The HTML/text data to transform'),
  return_format: z.enum(['markdown', 'text', 'raw', 'clean_html'])
    .describe('Format to transform the data to'),
  readability: z.boolean().optional()
    .describe('Apply readability processing for cleaner output'),
  clean: z.boolean().optional()
    .describe('Remove unnecessary elements and clean the output'),
  include_links: z.boolean().optional()
    .describe('Include hyperlinks in the output'),
  include_images: z.boolean().optional()
    .describe('Include image references in the output')
});

interface SpiderResponse {
  status?: number;
  error?: string | null;
  content?: string;
  markdown?: string;
  text?: string;
  html?: string;
  url?: string;
  costs?: {
    total_cost: number;
    [key: string]: number;
  };
  metadata?: Record<string, any>;
  [key: string]: any;
}

class SpiderMCPServer {
  private server: Server;
  private axiosInstance: AxiosInstance;
  private requestCount = 0;
  private errorCount = 0;

  constructor() {
    this.server = new Server(
      {
        name: 'spider-mcp-server',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    this.axiosInstance = axios.create({
      baseURL: SPIDER_API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${SPIDER_API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Spider-MCP-Server/1.0.0'
      },
      timeout: REQUEST_TIMEOUT,
      validateStatus: (status) => status < 500
    });

    this.setupInterceptors();
    this.setupHandlers();
  }

  private setupInterceptors() {
    // Request interceptor for debugging
    if (DEBUG_MODE) {
      this.axiosInstance.interceptors.request.use(
        (config) => {
          this.requestCount++;
          console.error(`[Spider API] Request #${this.requestCount}: ${config.method?.toUpperCase()} ${config.url}`);
          return config;
        },
        (error) => {
          this.errorCount++;
          console.error(`[Spider API] Request Error:`, error.message);
          return Promise.reject(error);
        }
      );

      this.axiosInstance.interceptors.response.use(
        (response) => {
          console.error(`[Spider API] Response: ${response.status} - ${response.config.url}`);
          return response;
        },
        (error) => {
          this.errorCount++;
          console.error(`[Spider API] Response Error:`, error.message);
          return Promise.reject(error);
        }
      );
    }
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'spider_scrape',
          description: 'Scrape content from a single URL with advanced options for JavaScript rendering, anti-bot bypass, and content extraction',
          inputSchema: {
            type: 'object',
            properties: ScrapeParamsSchema.shape as any,
            required: ['url']
          }
        },
        {
          name: 'spider_crawl',
          description: 'Crawl an entire website with configurable depth, limits, and filtering options',
          inputSchema: {
            type: 'object',
            properties: CrawlParamsSchema.shape as any,
            required: ['url']
          }
        },
        {
          name: 'spider_search',
          description: 'Search the web with Google-like results and optional page content fetching',
          inputSchema: {
            type: 'object',
            properties: SearchParamsSchema.shape as any,
            required: ['query']
          }
        },
        {
          name: 'spider_links',
          description: 'Extract and analyze all links from a webpage with filtering options',
          inputSchema: {
            type: 'object',
            properties: LinksParamsSchema.shape as any,
            required: ['url']
          }
        },
        {
          name: 'spider_screenshot',
          description: 'Capture high-quality screenshots of webpages with customizable viewport and options',
          inputSchema: {
            type: 'object',
            properties: ScreenshotParamsSchema.shape as any,
            required: ['url']
          }
        },
        {
          name: 'spider_transform',
          description: 'Transform HTML content to clean markdown, text, or formatted output',
          inputSchema: {
            type: 'object',
            properties: TransformParamsSchema.shape as any,
            required: ['data', 'return_format']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        if (DEBUG_MODE) {
          console.error(`[MCP] Tool called: ${name}`);
        }

        switch (name) {
          case 'spider_scrape':
            return await this.handleScrape(args);
          case 'spider_crawl':
            return await this.handleCrawl(args);
          case 'spider_search':
            return await this.handleSearch(args);
          case 'spider_links':
            return await this.handleLinks(args);
          case 'spider_screenshot':
            return await this.handleScreenshot(args);
          case 'spider_transform':
            return await this.handleTransform(args);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Tool ${name} not found`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        
        const errorMessage = this.formatError(error);
        throw new McpError(
          ErrorCode.InternalError,
          errorMessage
        );
      }
    });
  }

  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Don't retry on client errors (4xx except 429)
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          if (status && status >= 400 && status < 500 && status !== 429) {
            throw error;
          }
        }
        
        // Wait before retrying with exponential backoff
        if (i < maxRetries - 1) {
          const delay = initialDelay * Math.pow(2, i);
          if (DEBUG_MODE) {
            console.error(`[Spider API] Retrying after ${delay}ms (attempt ${i + 2}/${maxRetries})`);
          }
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  private formatError(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      
      if (axiosError.response?.data?.error) {
        return `Spider API: ${axiosError.response.data.error}`;
      }
      
      if (axiosError.response?.status === 402) {
        return 'Spider API: Payment required - Please add credits to your account at https://spider.cloud';
      }
      
      if (axiosError.response?.status === 429) {
        return 'Spider API: Rate limit exceeded - Please wait before making more requests';
      }
      
      if (axiosError.response?.status === 401) {
        return 'Spider API: Invalid API key - Please check your SPIDER_API_KEY';
      }
      
      if (axiosError.code === 'ECONNABORTED') {
        return `Spider API: Request timeout after ${REQUEST_TIMEOUT}ms`;
      }
      
      return `Spider API: ${axiosError.message}`;
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    return 'An unknown error occurred';
  }

  private formatResponse(data: any): any {
    // Handle array responses (common for scrape/crawl)
    if (Array.isArray(data)) {
      return {
        results: data,
        count: data.length,
        success: true
      };
    }
    
    // Handle direct response objects
    if (typeof data === 'object' && data !== null) {
      return {
        ...data,
        success: true
      };
    }
    
    // Handle string responses (like transform)
    return {
      content: data,
      success: true
    };
  }

  private async handleScrape(args: unknown) {
    const params = ScrapeParamsSchema.parse(args);
    
    try {
      const response = await this.retryWithBackoff(async () => 
        await this.axiosInstance.post('/scrape', {
          ...params,
          return_format: params.return_format || 'markdown'
        })
      );
      
      const formatted = this.formatResponse(response.data);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(formatted, null, 2)
          }
        ]
      };
    } catch (error) {
      throw this.handleApiError(error, 'Scrape');
    }
  }

  private async handleCrawl(args: unknown) {
    const params = CrawlParamsSchema.parse(args);
    
    try {
      const response = await this.axiosInstance.post('/crawl', {
        ...params,
        return_format: params.return_format || 'markdown'
      });
      
      const formatted = this.formatResponse(response.data);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(formatted, null, 2)
          }
        ]
      };
    } catch (error) {
      throw this.handleApiError(error, 'Crawl');
    }
  }

  private async handleSearch(args: unknown) {
    const params = SearchParamsSchema.parse(args);
    
    try {
      const requestBody: any = {
        search: params.query,
        ...params
      };
      delete requestBody.query;
      
      // Search operations can be slow, use longer timeout and retry
      const response = await this.retryWithBackoff(async () =>
        await this.axiosInstance.post('/search', requestBody, {
          timeout: 120000 // 2 minutes for search
        })
      );
      
      const formatted = this.formatResponse(response.data);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(formatted, null, 2)
          }
        ]
      };
    } catch (error) {
      throw this.handleApiError(error, 'Search');
    }
  }

  private async handleLinks(args: unknown) {
    const params = LinksParamsSchema.parse(args);
    
    try {
      const response = await this.axiosInstance.post('/links', {
        ...params,
        return_format: params.return_format || 'json'
      });
      
      const formatted = this.formatResponse(response.data);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(formatted, null, 2)
          }
        ]
      };
    } catch (error) {
      throw this.handleApiError(error, 'Links extraction');
    }
  }

  private async handleScreenshot(args: unknown) {
    const params = ScreenshotParamsSchema.parse(args);
    
    try {
      const response = await this.axiosInstance.post('/screenshot', params);
      
      // Handle base64 image response
      if (typeof response.data === 'string' && response.data.startsWith('data:image')) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                screenshot: response.data,
                format: params.format || 'png',
                url: params.url
              }, null, 2)
            }
          ]
        };
      }
      
      const formatted = this.formatResponse(response.data);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(formatted, null, 2)
          }
        ]
      };
    } catch (error) {
      throw this.handleApiError(error, 'Screenshot');
    }
  }

  private async handleTransform(args: unknown) {
    const params = TransformParamsSchema.parse(args);
    
    try {
      const response = await this.axiosInstance.post('/transform', params);
      
      // Transform often returns direct string content
      if (typeof response.data === 'string') {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                content: response.data,
                format: params.return_format
              }, null, 2)
            }
          ]
        };
      }
      
      const formatted = this.formatResponse(response.data);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(formatted, null, 2)
          }
        ]
      };
    } catch (error) {
      throw this.handleApiError(error, 'Transform');
    }
  }

  private handleApiError(error: unknown, operation: string): Error {
    const errorMessage = this.formatError(error);
    
    if (DEBUG_MODE) {
      console.error(`[Spider API] ${operation} failed:`, errorMessage);
    }
    
    throw new McpError(
      ErrorCode.InternalError,
      `${operation} failed: ${errorMessage}`
    );
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    if (DEBUG_MODE) {
      console.error('Spider MCP server running in DEBUG mode on stdio');
      console.error(`API Base URL: ${SPIDER_API_BASE_URL}`);
      console.error(`Request timeout: ${REQUEST_TIMEOUT}ms`);
    } else {
      console.error('Spider MCP server running on stdio');
    }
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.error('\nShutting down Spider MCP server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('\nShutting down Spider MCP server...');
  process.exit(0);
});

// Start the server
const server = new SpiderMCPServer();
server.run().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});