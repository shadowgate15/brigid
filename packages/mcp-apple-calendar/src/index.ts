import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { findEvents } from './eventkit.js';

/**
 * Package version, kept in sync with package.json by `nx release`.
 * Bump lives in package.json; this constant is the runtime source.
 */
export const version = '0.0.1';

/** Serialize a successful tool result as JSON text (skills read the JSON). */
function ok(value: unknown): CallToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] };
}

/** Turn a thrown error into a readable, non-fatal tool error for the skill to handle. */
function fail(error: unknown): CallToolResult {
  const message = error instanceof Error ? error.message : String(error);
  return { content: [{ type: 'text', text: message }], isError: true };
}

/**
 * Create and configure the Apple Calendar MCP server — the reference implementation of the
 * calendar capability contract. Registers the Core (read-only) tool under its canonical name; no
 * transport is attached here, so callers (bin, tests) decide how to run it.
 */
export function createServer(): McpServer {
  const server = new McpServer({ name: 'mcp-apple-calendar', version });

  server.registerTool(
    'find-events',
    {
      title: 'Find events',
      description: 'Query calendar events overlapping a date window.',
      inputSchema: {
        date: z.string().optional().describe('YYYY-MM-DD — mutually exclusive with dateRange'),
        dateRange: z
          .object({ from: z.string(), to: z.string() })
          .optional()
          .describe('Inclusive YYYY-MM-DD span — mutually exclusive with date'),
      },
    },
    async ({ date, dateRange }) => {
      try {
        // Fail fast at the tool boundary — reject an ambiguous window before spawning the subprocess.
        if (Boolean(date) === Boolean(dateRange)) {
          throw new Error('Provide exactly one of "date" or "dateRange".');
        }
        return ok({ events: await findEvents({ date, dateRange }) });
      } catch (error) {
        return fail(error);
      }
    },
  );

  return server;
}
