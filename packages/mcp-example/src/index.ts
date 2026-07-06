import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

/**
 * Package version, kept in sync with package.json by `nx release`.
 * Bump lives in package.json; this constant is the runtime source.
 */
export const version = '0.0.1';

/**
 * Create and configure the example MCP server.
 *
 * This is the reusable, testable entry point: it wires up the server and its
 * tools but does NOT attach a transport, so callers (the bin, or tests) decide
 * how to run it. Copy this file as the starting point for a new MCP server.
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: 'mcp-example',
    version,
  });

  // A minimal tool demonstrating input validation with zod and a text result.
  server.registerTool(
    'greet',
    {
      title: 'Greet',
      description: 'Return a friendly greeting for the given name.',
      inputSchema: {
        name: z.string().min(1).describe('The name of the person to greet'),
      },
    },
    async ({ name }) => ({
      content: [{ type: 'text', text: `Hello, ${name}! 👋` }],
    }),
  );

  return server;
}
