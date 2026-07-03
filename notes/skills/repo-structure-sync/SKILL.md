---
name: repo-structure-sync
description: Use this skill when you need a current repo tree snapshot for P2026, want to refresh the structure document after files move, or want a compact repo map without bloating AGENTS.md.
---

# Repo Structure Sync

Use this skill when the repo structure needs to be documented or refreshed.

## Workflow

1. Read `notes/repo-structure.md` first if you only need the current snapshot.
2. If the structure changed or the snapshot looks stale, run `python3 notes/skills/repo-structure-sync/scripts/update_repo_structure.py`.
3. Keep the generated file as the source of truth for the repo tree instead of expanding `AGENTS.md`.
4. If major directories changed, update any nearby docs that point at old paths.

## Notes

- The generated snapshot is intentionally high-signal, not exhaustive.
- It excludes build output, dependency folders, zip archives, and other bulky artifacts.
- Keep `AGENTS.md` focused on operating context; keep the full tree here.
