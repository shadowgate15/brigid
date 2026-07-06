# Manual fallback for weekly-review

No task-manager connector was detected. Run the review conversationally:

- For each checklist section (next actions, waiting-for, projects, someday/maybe), ask the user to describe their current state rather than querying a tool.
- Keep a running summary in the conversation of what's stalled, what's active, and what changed.
- At the end, offer the summary as text, and mention that connecting a task manager (e.g. Todoist) would let this plugin pull these lists automatically next time.
