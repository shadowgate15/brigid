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

The task manager is not a single on/off switch. It is defined by the
[task-manager capability contract](../../../../docs/contracts/task-manager.md), which is **tiered**: a
required **core** group plus optional groups (`projects-labels`, `filters`, `analytics`) that a server
advertises — and that skills detect and degrade — independently. Report the task manager at that
granularity.

## Step 1: Detect the task-manager groups

Look for these canonical tool-name suffixes under an `mcp__*__` prefix (the server prefix varies):

- **core**: `add-tasks`, `find-tasks`, `update-tasks`, `complete-tasks`, `uncomplete-tasks`, `reschedule-tasks`. Present if the core signature (e.g. `find-tasks`) is there.
- **projects-labels**: `find-projects`, `add-projects`, `find-labels`, `add-labels`.
- **filters**: `find-filters`, `find-completed-tasks`.
- **analytics**: `get-overview`, `get-project-health`, `get-productivity-stats`.

Two overall cases for the task manager:

- **core absent** → no conforming task manager. If some task-manager-like tools are present but the core signature isn't among them, say an unrecognized tool is connected and skills will use manual mode.
- **core present** → a conforming task manager is connected; report each optional group as present or absent.

The other connector categories are unchanged: **Calendar**, **Notes app**, and **Email** have no connector in this plugin version yet.

## Step 2: Present a short status table

If core is present, report the groups:

Task-manager group | Status
--- | ---
core | connected
projects-labels | connected / not present
filters | connected / not present
analytics | connected / not present (the brigid Todoist server doesn't implement it)

If core is absent, replace that table with a single line: "Task manager: not connected — skills will use manual mode."

Then the other categories:

Category | Status
--- | ---
Calendar | not yet supported
Notes app | not yet supported
Email | not yet supported

## Step 3: Explain what this means practically

- If **core** is absent, `process-inbox`, `weekly-review`, `next-actions`, and `plan-day` still work — just conversationally instead of writing to a tool.
- If an **optional group** is absent, name the practical effect rather than calling it an error: without `projects-labels`, `process-inbox` skips project filing and label reuse and `next-actions` can't confirm exact label names; without `filters`, `next-actions` can't reuse saved views and `weekly-review` asks what got done instead of pulling completed tasks; without `analytics`, `weekly-review` computes its snapshot and trends from core data.

A missing group is never an error — every skill degrades to still deliver its outcome.
