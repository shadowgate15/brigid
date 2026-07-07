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

## Step 1: Detect connectors

The weekly review uses two connectors — a task manager and a calendar — detected **independently**
by tool-name signature under an `mcp__*__` prefix. A missing one never blocks the other, and a
missing connector is never an error.

### Task manager

The weekly review touches every capability group in the
[task-manager contract](../../../../docs/contracts/task-manager.md). Detect each independently and
degrade per group:

- **core** (required here): `find-tasks`. Detect by its presence.
- **projects-labels** (optional): `find-projects` — the project-list review step.
- **filters** (optional): `find-completed-tasks` — reviewing what actually got done.
- **analytics** (optional): `get-overview`, `get-project-health`, `get-productivity-stats`. Often
  **absent** (the brigid Todoist server doesn't implement it). When absent, **compute the equivalent
  from Core data**: derive the orientation snapshot and stalled-project flags from `find-projects` +
  `find-tasks`, and completion trends from `find-completed-tasks`. Never claim missing analytics —
  reconstruct or ask.

If **core** is present, read `references/task-manager.md`. If it is absent, read
`references/manual-fallback.md` and run the review conversationally.

### Calendar

The calendar has a single required, read-only **Core** group (see the
[calendar contract](../../../../docs/contracts/calendar.md)). Check the session for the `find-events`
signature. If present, read `references/calendar.md` for how the previous- and upcoming-calendar
review steps use it. If absent, or if `find-events` returns an explicit error (permission not
granted, etc.), ask the user to summarize their past and upcoming week directly — a missing or
unreadable calendar is never framed as an error, and never assumed to mean the week is clear.

## Step 2: Get Clear

- **Collect loose ends**: ask if there's anything sitting around unprocessed — notes, forwarded emails, physical papers, browser tabs.
- **Empty the head**: ask "what's been on your mind this week that isn't captured anywhere?" Capture anything mentioned as a new item.
- **Get to zero**: if there's an actual inbox with unprocessed items, offer to run the `process-inbox` skill before continuing.

## Step 3: Get Current

- **Review next actions**: pull the current next-action lists. Flag anything stale (sitting untouched a long time) or already done but not marked complete.
- **Review the previous calendar**: look back over the past week's events for any follow-up actions that haven't been captured yet. With Calendar detected, pull the past week via `find-events` per `references/calendar.md`; without it (absent or unreadable), ask the user to recap their past week.
- **Review the upcoming calendar**: look ahead for commitments that need prep, and surface any obvious conflicts. With Calendar detected, pull the coming week via `find-events` per `references/calendar.md`; without it, ask the user about the week ahead.
- **Review waiting-for items**: check on anything delegated. Anything overdue for a follow-up nudge?
- **Review project list**: for every active project, confirm it has a clear next action. A project with no next action is stalled — flag it and help define one.

## Step 4: Get Creative

- **Review someday/maybe**: go through the list and ask if anything should be activated into a real project now, or if anything should be dropped entirely.
- **Bigger picture**: ask if there's anything new the user wants to capture — ideas, goals, changes in direction — that hasn't come up yet.

## Step 5: Wrap up

Summarize: what changed, what got activated, what got dropped, what's stalled and needs attention, and anything the user should follow up on before the next review.
