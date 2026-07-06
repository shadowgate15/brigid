---
name: weekly-review
description: >
  This skill should be used when the user asks to "do my weekly review",
  "run my GTD review", "review my system", "let's do the weekly review",
  or wants a guided pass over projects, next actions, waiting-for items,
  someday/maybe, and calendar following GTD (Getting Things Done)
  methodology.
metadata:
  version: "0.1.0"
---

# Weekly Review (GTD)

Guide the user through the full GTD Weekly Review checklist. This is a ritual, not a quick check — go through each section in order, don't skip sections just because they seem empty, and give the user a chance to add anything that surfaces along the way.

## Step 1: Detect the active task manager

Check available tools for known connector signatures:

- **Todoist**: tool names containing `find-tasks`, `find-projects`, `get-overview` under an `mcp__*__` prefix.

If detected, read `references/todoist.md` for the exact query contract. If not detected, read `references/manual-fallback.md` and run the review conversationally from what the user tells you.

## Step 2: Get Clear

- **Collect loose ends**: ask if there's anything sitting around unprocessed — notes, forwarded emails, physical papers, browser tabs.
- **Empty the head**: ask "what's been on your mind this week that isn't captured anywhere?" Capture anything mentioned as a new item.
- **Get to zero**: if there's an actual inbox with unprocessed items, offer to run the `process-inbox` skill before continuing.

## Step 3: Get Current

- **Review next actions**: pull the current next-action lists. Flag anything stale (sitting untouched a long time) or already done but not marked complete.
- **Review the previous calendar**: look back over the past week's events for any follow-up actions that haven't been captured yet.
- **Review the upcoming calendar**: look ahead for commitments that need prep, and surface any obvious conflicts.
- **Review waiting-for items**: check on anything delegated. Anything overdue for a follow-up nudge?
- **Review project list**: for every active project, confirm it has a clear next action. A project with no next action is stalled — flag it and help define one.

## Step 4: Get Creative

- **Review someday/maybe**: go through the list and ask if anything should be activated into a real project now, or if anything should be dropped entirely.
- **Bigger picture**: ask if there's anything new the user wants to capture — ideas, goals, changes in direction — that hasn't come up yet.

## Step 5: Wrap up

Summarize: what changed, what got activated, what got dropped, what's stalled and needs attention, and anything the user should follow up on before the next review.
