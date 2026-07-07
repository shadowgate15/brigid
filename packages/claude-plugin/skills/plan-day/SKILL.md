---
name: plan-day
description: >
  This skill should be used when the user asks to "plan my day", "what
  should I focus on today", "help me engage with my day", or wants a
  realistic daily plan combining calendar commitments and GTD next
  actions (the "engage" step of Getting Things Done).
metadata:
  version: "0.1.0"
---

# Plan Day (GTD Engage)

Build a realistic plan for today by combining fixed commitments with the best available next actions, using the GTD four-fold model for choosing what to do in the moment: context, time available, energy available, priority.

## Step 1: Detect the active task manager

This skill needs the task manager's **Core** capability group (see the
[task-manager contract](../../../../docs/contracts/task-manager.md)). Check the session for the Core
signature: tool names `find-tasks` and `reschedule-tasks` under an `mcp__*__` prefix.

If Core is present, read `references/task-manager.md` for how this skill uses it. If it is not
present, read `references/manual-fallback.md` and build the plan from what the user tells you — a
missing task manager is not an error.

There is no calendar connector in this plugin version — ask the user directly for any fixed commitments today rather than assuming access to a calendar.

## Step 2: Establish fixed points

Ask the user for today's fixed commitments (meetings, appointments) if not already known. These are the scaffolding the plan builds around — don't schedule next actions on top of them.

## Step 3: Pull candidate next actions

Get tasks due or scheduled today, plus any high-priority next actions not yet scheduled. Don't include the entire backlog.

## Step 4: Apply the four-fold model

For the open time between fixed commitments, order candidate actions by:

1. **Context** — what's actually doable given where the user will be.
2. **Time available** — fits the size of the gap.
3. **Energy available** — ask if unknown; don't put the hardest task in a known low-energy slot.
4. **Priority** — among items that pass the first three filters, highest priority first.

## Step 5: Present a committed plan, not a wishlist

Give an ordered plan for the day, anchored to the fixed commitments, with realistic slack — not an overstuffed list. If something clearly won't fit today, say so and offer to move it rather than silently dropping it.

## Step 6: Handle in-the-moment updates

If the user reports finishing or dropping something mid-conversation, update the underlying task manager accordingly (complete or reschedule) rather than just acknowledging it conversationally.
