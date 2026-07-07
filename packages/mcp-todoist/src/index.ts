import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { TodoistClient } from './todoist.js';

/**
 * Package version, kept in sync with package.json by `nx release`.
 * Bump lives in package.json; this constant is the runtime source.
 */
export const version = '0.0.1';

const priority = z.enum(['p1', 'p2', 'p3', 'p4']);

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
 * Create and configure the Todoist MCP server — the reference implementation of the
 * task-manager capability contract. Registers the Core tools under their canonical names; no
 * transport is attached here, so callers (bin, tests) decide how to run it.
 */
export function createServer(): McpServer {
  const server = new McpServer({ name: 'mcp-todoist', version });
  const todoist = new TodoistClient();

  server.registerTool(
    'add-tasks',
    {
      title: 'Add tasks',
      description: 'Create one or more tasks in a single call.',
      inputSchema: {
        tasks: z
          .array(
            z.object({
              content: z.string().min(1).describe('The concrete, verb-first next action'),
              description: z.string().optional(),
              priority: priority.optional().describe('p1 (highest) .. p4 (default)'),
              labels: z.array(z.string()).optional().describe('Context labels, e.g. @calls'),
              dueString: z.string().optional().describe('Natural-language movable due date'),
              deadlineDate: z.string().optional().describe('YYYY-MM-DD immovable deadline'),
              project: z.string().optional().describe('Project id or name'),
            }),
          )
          .min(1),
      },
    },
    async ({ tasks }) => {
      try {
        const created = [];
        for (const task of tasks) created.push(await todoist.createTask(task));
        return ok({ created });
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    'find-tasks',
    {
      title: 'Find tasks',
      description: 'Query open tasks with a backend-neutral structured filter.',
      inputSchema: {
        labels: z.array(z.string()).optional().describe('Include tasks with ALL of these labels'),
        excludeLabels: z.array(z.string()).optional().describe('Exclude tasks with ANY of these'),
        project: z.string().optional().describe('Project id or name'),
        date: z.string().optional().describe('YYYY-MM-DD — due/scheduled on this day'),
        dateRange: z
          .object({ from: z.string(), to: z.string() })
          .optional()
          .describe('Inclusive YYYY-MM-DD span'),
        sort: z.literal('priority').optional().describe('p1 first'),
      },
    },
    async (filter) => {
      try {
        return ok({ tasks: await todoist.findTasks(filter) });
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    'update-tasks',
    {
      title: 'Update tasks',
      description: "Modify a task's non-schedule fields. Never moves due dates — use reschedule-tasks.",
      inputSchema: {
        id: z.string().describe('Task id'),
        content: z.string().optional(),
        description: z.string().optional(),
        priority: priority.optional(),
        labels: z.array(z.string()).optional(),
        deadlineDate: z.string().optional().describe('YYYY-MM-DD'),
      },
    },
    async (patch) => {
      try {
        return ok({ updated: await todoist.updateTask(patch) });
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    'complete-tasks',
    {
      title: 'Complete tasks',
      description: 'Mark tasks done. Recurring tasks advance to their next occurrence.',
      inputSchema: { ids: z.array(z.string()).min(1) },
    },
    async ({ ids }) => {
      try {
        for (const id of ids) await todoist.completeTask(id);
        return ok({ completed: ids });
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    'uncomplete-tasks',
    {
      title: 'Uncomplete tasks',
      description: 'Reopen tasks completed by mistake.',
      inputSchema: { ids: z.array(z.string()).min(1) },
    },
    async ({ ids }) => {
      try {
        for (const id of ids) await todoist.uncompleteTask(id);
        return ok({ reopened: ids });
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    'reschedule-tasks',
    {
      title: 'Reschedule tasks',
      description:
        'Move tasks to a new due date, preserving recurrence and time-of-day. The only tool that changes due dates.',
      inputSchema: {
        ids: z.array(z.string()).min(1),
        date: z.string().describe('YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS'),
      },
    },
    async ({ ids, date }) => {
      try {
        const rescheduled = [];
        for (const id of ids) rescheduled.push(await todoist.rescheduleTask(id, date));
        return ok({ rescheduled });
      } catch (error) {
        return fail(error);
      }
    },
  );

  // --- projects-labels group ---

  server.registerTool(
    'find-projects',
    {
      title: 'Find projects',
      description: 'List the active projects.',
      inputSchema: {},
    },
    async () => {
      try {
        return ok({ projects: await todoist.findProjects() });
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    'add-projects',
    {
      title: 'Add projects',
      description: 'Create one or more projects.',
      inputSchema: {
        projects: z
          .array(
            z.object({
              name: z.string().min(1),
              parent: z.string().optional().describe('Parent project id or name'),
            }),
          )
          .min(1),
      },
    },
    async ({ projects }) => {
      try {
        const created = [];
        for (const project of projects) created.push(await todoist.createProject(project));
        return ok({ created });
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    'find-labels',
    {
      title: 'Find labels',
      description: 'List the existing context labels.',
      inputSchema: {},
    },
    async () => {
      try {
        return ok({ labels: await todoist.findLabels() });
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    'add-labels',
    {
      title: 'Add labels',
      description: "Create one or more context labels. Use only after find-labels shows it's missing.",
      inputSchema: {
        names: z.array(z.string().min(1)).min(1),
      },
    },
    async ({ names }) => {
      try {
        const created = [];
        for (const name of names) created.push(await todoist.createLabel(name));
        return ok({ created });
      } catch (error) {
        return fail(error);
      }
    },
  );

  return server;
}
