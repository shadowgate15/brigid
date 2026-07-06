---
name: gtd-connectors
description: >
  This skill should be used when the user asks "what connectors are
  active", "check my GTD connectors", "is Todoist connected", "what's
  connected right now", or wants to know which tool integrations this
  GTD plugin will actually use in the current environment before
  running a workflow.
metadata:
  version: "0.1.0"
---

# GTD Connector Status

Report which connector categories this plugin can currently use, without creating or modifying anything.

## How detection works

This plugin never bundles its own MCP servers. Instead, each GTD skill checks the list of tools already available in the current session for known naming signatures, and only then loads the matching connector-specific reference. "On" and "off" are controlled entirely by whatever the user has connected in their environment's own connector settings (e.g. Cowork), not by this plugin.

## Step 1: Check known signatures

- **Task manager (Todoist)**: look for tool names containing `add-tasks`, `find-tasks`, `complete-tasks` under an `mcp__*__` prefix. If present, report "Task manager: Todoist connected."
- **Calendar**: no connector is implemented in this plugin version yet. Report "Calendar: not yet supported by this plugin."
- **Notes app**: no connector is implemented in this plugin version yet. Report "Notes app: not yet supported by this plugin."
- **Email**: no connector is implemented in this plugin version yet. Report "Email: not yet supported by this plugin."

If a task-manager-like tool is present but doesn't match the Todoist signature, report it as "Task manager: an unrecognized tool is connected — this plugin doesn't have a reference file for it yet, so GTD skills will fall back to manual mode for task management."

## Step 2: Present a short status table

Category | Status
--- | ---
Task manager | connected/not connected (name if known)
Calendar | not yet supported
Notes app | not yet supported
Email | not yet supported

## Step 3: Explain what this means practically

If task manager is not connected, mention that `process-inbox`, `weekly-review`, `next-actions`, and `plan-day` will still work, just conversationally instead of writing to a tool. Don't frame a missing connector as an error.
