---
name: process-inbox
description: >
  This skill should be used when the user asks to "process my inbox",
  "clarify my capture list", "help me get to inbox zero", "clear my head",
  "process what I've captured", or wants to turn raw notes, forwarded
  emails, or scattered ideas into clarified next actions, projects, or
  reference items following GTD (Getting Things Done) methodology.
metadata:
  version: "0.1.0"
---

# Process Inbox (GTD Capture & Clarify)

Walk the user through the GTD clarify step: convert raw, unprocessed inputs into concrete outcomes. Process one item at a time. Never leave an item half-clarified.

## Step 1: Detect the active task manager

Check the list of currently available tools for names matching known connector signatures:

- **Todoist**: tool names containing `add-tasks`, `find-tasks`, `add-projects`, `add-labels` under an `mcp__*__` prefix.

If a match is found, read `references/todoist.md` for the exact tool-calling contract before creating or moving anything. If no task-manager connector is detected, read `references/manual-fallback.md` and continue the workflow conversationally — do not block or error.

## Step 2: Gather the raw items

Ask the user what they want to process: pasted notes, a brain dump, forwarded emails, voice memo transcripts, or just "everything on my mind right now." Capture is manual — don't assume an existing inbox exists in a connected tool unless the user says so.

If the user has an actual inbox in their task manager (an unsorted project/list), check it via the connector.

## Step 3: Clarify each item using the GTD flowchart

For every item, ask in order:

1. **What is it?** Get a concrete description if the raw item is vague.
2. **Is it actionable?**
   - **No** →
     - **Trash**: no longer relevant, discard it.
     - **Someday/Maybe**: not actionable now but might be later. Store with no due date, tagged so it surfaces during weekly review.
     - **Reference**: information worth keeping but not an action. Note that this plugin doesn't yet have a notes/reference connector — tell the user where to park it (their own notes app) rather than losing it.
   - **Yes** →
     - **2-Minute Rule**: if it takes less than two minutes, tell the user to just do it now instead of tracking it.
     - **Delegate**: if someone else should do it, record it as a "waiting for" item — who it's delegated to, what was asked, and when to follow up.
     - **Project**: if it requires more than one action step, create a project and define its very next physical action. A project without a next action is stalled — never leave one that way.
     - **Single next action**: one clear physical action. Assign a context (e.g. `@calls`, `@computer`, `@errands`, `@home`, `@agenda`) so it surfaces correctly later. Only attach a due date if there's a real external deadline — don't invent one just to make the item feel urgent.

## Step 4: Confirm and summarize

After processing the batch, summarize what was created: how many next actions, which projects were started (with their first action), what was delegated, what went to someday/maybe, and what was discarded. Flag any project you weren't able to give a clear next action to.
