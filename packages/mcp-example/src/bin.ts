#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './index.js';

/**
 * Executable entry point: runs the example MCP server over stdio.
 * Registered as the package `bin`, so it can be launched via `npx @brigid/mcp-example`.
 */
async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  // stderr only — stdout is reserved for the JSON-RPC protocol stream.
  console.error('Fatal error running mcp-example server:', error);
  process.exit(1);
});
