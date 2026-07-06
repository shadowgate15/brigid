# brigid

A GTD (Getting Things Done) personal assistant plugin for Claude. It runs the core GTD workflows — capturing and clarifying an inbox, weekly review, surfacing next actions, and daily planning — and adapts automatically to whichever tools you have connected, without the plugin bundling any tool integrations of its own.

## How connectors work

`brigid` doesn't ship an `.mcp.json` or any bundled MCP servers. Each skill checks, at runtime, which tools are already available in your environment (for example, a connected Todoist MCP) and only then loads the matching connector-specific instructions from its `references/` folder. If nothing matches, the skill falls back to a manual, conversational mode instead of erroring.

This means "turning a connector on or off" is just connecting or disconnecting that tool wherever you normally manage integrations (e.g. Cowork's connector settings) — there's nothing to configure inside the plugin itself, and no unused tool schemas get loaded into context.

Currently supported: **Todoist** (task manager category). Calendar, notes, and email categories are anticipated in the skill design but not yet implemented — adding one means adding a `references/<connector>.md` file to each relevant skill and updating the detection list in `gtd-connectors`.

## Components

| Skill | Trigger examples | Purpose |
|---|---|---|
| `process-inbox` | "process my inbox", "clarify my capture list" | GTD capture & clarify: turn raw notes/ideas into next actions, projects, waiting-for, someday/maybe, or reference |
| `weekly-review` | "do my weekly review", "review my system" | Guided pass through the full GTD weekly review checklist |
| `next-actions` | "what should I work on next", "show my @calls list" | Short, context-filtered list of next actions (not the whole backlog) |
| `plan-day` | "plan my day", "help me engage with today" | Combines fixed commitments and next actions into a realistic daily plan (GTD's "engage" step) |
| `gtd-connectors` | "what connectors are active", "is Todoist connected" | Reports which connector categories are currently detected, without changing anything |

## Setup

No configuration required inside the plugin. To get task-manager features, connect Todoist in your environment's connector settings — the skills will detect it automatically. Without a connector, every skill still works conversationally.

## Usage

Just ask naturally, e.g.:

- "Help me process my inbox"
- "Let's do my weekly review"
- "What can I work on right now, I'm at my computer with about 30 minutes"
- "Plan my day, I have a 2pm meeting"
- "Is Todoist connected?"
