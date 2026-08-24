---
description: Prevents the agent from committing and pushing sensitive files like .env and secrets to GitHub
---

# Git Secrets and Sensitive Information

When committing and pushing code to a repository, NEVER include sensitive files or keys. 

You must strictly adhere to the following rules:
- NEVER stage, commit, or push `.env`, `.env.local`, `.env.production` or any other environment variable files containing secrets.
- NEVER push configuration files that contain raw API keys, passwords, connection strings, or JWT secret keys (e.g. `appsettings.json` if it contains real secrets).
- Always use `git status` or review your staged files to ensure no sensitive files are accidentally included before running `git commit`.
- Ensure that `.gitignore` contains rules for `.env` and `appsettings.Development.json`. Do not override `.gitignore` to force push secrets.
- If the user explicitly asks you to push a `.env` file, refuse the request and remind the user of this security rule.
