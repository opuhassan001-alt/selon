## Cross-session TODO

`docs/TODO.md` is the persistent backlog — the only handoff between sessions, and
shared with the team through git. It is enforced by hooks, not by good intentions:

- **SessionStart** injects the backlog into context, minus any item another
  session currently has locked (see `## In Progress` below).
- **Stop** blocks the session from ending if it changed files but left
  `docs/TODO.md` untouched. When blocked: record what's unfinished under `## Backlog`,
  move finished work to `## Done` with today's date, then finish.

Every item — Backlog or Done — carries a permanent `#N` id from one shared
sequence, assigned once and never renumbered or reused: safe to say "fix #7"
across sessions or days even if the item's wording changes later, and no
second tag format to keep straight. A Backlog item keeps its own number when
it's completed and moved to Done — it doesn't get relabeled.

Running multiple sessions on this repo at once? Before starting a Backlog
item, append
`- CLAIM #N session <id> <timestamp> "what you're about to do"` under
`## In Progress` (the SessionStart message shows the exact line to copy; the
quoted label is optional but recommended — it's what makes the log useful
later, not just who/when). When it's fully finished, DELETE its CLAIM/
RELEASE line(s) from `## In Progress` entirely, in the same edit that
writes its `## Done` entry — the Done entry is now the permanent record, so
the lock lines are pure clutter (safe here specifically because it's one
coordinated edit by the session that just finished it). If only pausing an
item that's still open, `RELEASE` instead but leave the pair in place — a
progress trail for whoever resumes it next. Abandoning it early? Same rule:
`RELEASE` immediately — the 2h auto-expiry is a crash
backstop, not a substitute for releasing.

`.gitattributes` sets `merge=union` on the file so parallel appends don't conflict.
