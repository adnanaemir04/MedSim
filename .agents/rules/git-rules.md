---
description: Prevents the agent from automatically committing and pushing code without explicit user permission
---

# Git Commit and Push Rules

- **NEVER** automatically run `git commit` or `git push` unless the user explicitly asks you to do so for that specific turn.
- Even if you have finished a major task, you must present the changes to the user first.
- Only run `git commit` and `git push` if the user says something like "commit and push these changes" or "push to github".
- You are allowed to run `git status` or `git diff` to analyze changes.
- **Save to memory / General Workflow:** Every change we make must be committed and pushed to an appropriate git branch. If a relevant branch for the change does not exist, we must create a new branch for it and then commit and push the changes.
