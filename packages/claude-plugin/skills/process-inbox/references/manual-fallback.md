# Manual fallback for process-inbox

No task-manager connector was detected. Don't block the clarify workflow — run it conversationally instead:

- Ask the user to describe or paste their raw items directly in chat.
- As each item is clarified, restate the outcome back to them in a clean list (next actions grouped by context, projects with their first action, waiting-for items, someday/maybe items) rather than writing to any external tool.
- At the end, offer the full clarified list as text they can paste into whatever system they use, and mention that connecting a task manager (e.g. Todoist) in their environment's connector settings would let this plugin manage the list automatically next time.
