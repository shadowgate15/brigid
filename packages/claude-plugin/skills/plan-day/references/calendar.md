# Calendar usage for plan-day

Requires: **Core** (the calendar's one required, read-only capability group).

Tool shapes and guarantees live in the [calendar contract](../../../../../docs/contracts/calendar.md).
This file only records how plan-day uses them.

## Establishing fixed points (Step 2)

- Call `find-events` with `date` set to today (`YYYY-MM-DD`). The returned events are the day's
  **hard landscape** — immovable scaffolding the plan is built around, never candidates competing
  for a slot.
- `allDay: true` events are day-specific commitments with no fixed time; `allDay: false` events
  have a real `start`/`end` and anchor the schedule at that time. Treat both as fixed, but only
  timed events carve out a specific gap in the day.
- Use `location` (when present) as context signal for the four-fold model's **context** filter —
  e.g. a timed event with a location away from home rules out `@computer` actions around it.
- **Never merge task due dates into the hard landscape.** A task due today is a candidate pulled
  in Step 3, not a fixed point — even if it looks similar to a calendar event (e.g. "Call dentist"
  due today vs. a "Dentist appt 14:00" calendar event are handled completely differently).

## On failure (Step 1 degrade)

`find-events` returns an explicit tool error (never a silent empty list) when the calendar can't
be read — permission not granted, prompt unresolved, or no calendars available. Treat that error
exactly like Calendar being undetected: fall back to asking the user for today's fixed commitments
rather than assuming the day is clear.
