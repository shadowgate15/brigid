# Calendar usage for weekly-review

Requires: **Core** (the calendar's one required, read-only capability group).

Tool shapes and guarantees live in the [calendar contract](../../../../../docs/contracts/calendar.md).
This file only records how weekly-review uses them.

## Review the previous calendar — reflection (Step 3)

- Call `find-events` with `dateRange` covering the just-completed review window (the past week —
  `{ from, to }` as inclusive `YYYY-MM-DD` bounds, e.g. the last 7 days through today). The returned
  events are the week's actual **hard landscape** — what the user was actually committed to.
- Reflect on them alongside what got done: surface follow-up actions the week's meetings and
  appointments implied but that were never captured, and note where the committed schedule and the
  completed work diverged. This is reflection, not planning.

## Review the upcoming calendar — prep and conflicts (Step 3)

- Call `find-events` with a second `dateRange` covering the coming week. These events are the
  upcoming hard landscape.
- Surface commitments that need preparation before they arrive, and flag obvious conflicts
  (overlapping timed events, or prep that competes for the same block). Do not schedule next actions
  here — that is `plan-day`'s job; weekly-review only surfaces what needs attention.

## The task/event boundary

Events are the hard landscape; never synthesize them from task due dates, and never merge task due
dates into the calendar output. A task due this week is a task, not an event — even when it looks
similar to a commitment (a "Call dentist" task vs. a "Dentist appt 14:00" event are different
things).

## On absence or failure (Step 1 degrade)

`find-events` returns an explicit tool error (never a silent empty list) when the calendar can't be
read — permission not granted, prompt unresolved, or no calendars available. Treat that error
exactly like Calendar being undetected: for both the previous- and upcoming-calendar steps, fall
back to asking the user to summarize their past and upcoming week directly. A missing or unreadable
calendar is never framed as an error, and `events: []` from a successful read means the window is
genuinely empty — never assume a week is clear because a read failed.
