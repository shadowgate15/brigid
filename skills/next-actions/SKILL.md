---
name: next-actions
description: >
  This skill should be used when the user asks "what should I work on
  next", "show me my next actions", "what can I do right now",
  "give me my @calls list", or wants a short, context-filtered list of
  GTD next actions rather than their entire task backlog.
metadata:
  version: "0.1.0"
---

# Next Actions (GTD)

Surface a short, realistic list of next actions filtered by the context the user is actually in right now — never dump the entire backlog.

## Step 1: Detect the active task manager

Check available tools for known connector signatures:

- **Todoist**: tool names containing `find-tasks`, `find-filters` under an `mcp__*__` prefix.

If detected, read `references/todoist.md` for the exact query contract. If not detected, read `references/manual-fallback.md` and work from what the user tells you.

## Step 2: Establish context

Ask only what's missing (don't ask if the user already stated it):

- **Where/what tools**: `@calls`, `@computer`, `@errands`, `@home`, `@office`, `@agenda`, etc.
- **Time available**: a rough bucket (5 minutes, 30 minutes, 2+ hours).
- **Energy level**: low, medium, high — low energy calls for smaller/easier items, not the hardest thing on the list.

## Step 3: Query and filter

Pull next actions matching the stated context. Exclude:

- Waiting-for items (not actionable by the user right now).
- Someday/maybe items (not active).
- Items that clearly need more time/energy than the user has available — mention them exist but don't lead with them.

## Step 4: Present a short ranked list

Show at most 5-7 items, ranked by priority within the filtered context, each with a one-line reason if not obvious. If nothing matches the stated context, say so plainly and suggest the closest adjacent context rather than showing an empty or irrelevant list.
