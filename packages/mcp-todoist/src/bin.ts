#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './index.js';

/**
 * Executable entry point: runs the Todoist MCP server over stdio.
 * Registered as the package `bin`, so it can be launched via `npx @brigid/mcp-todoist`.
 */
async function main(): Promise<void> {
  if (!process.env['TODOIST_API_TOKEN']) {
    console.error(
      'TODOIST_API_TOKEN is not set. Export a Todoist API token before starting mcp-todoist.',
    );
    process.exit(1);
  }
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  // stderr only — stdout is reserved for the JSON-RPC protocol stream.
  console.error('Fatal error running mcp-todoist server:', error);
  process.exit(1);
});
