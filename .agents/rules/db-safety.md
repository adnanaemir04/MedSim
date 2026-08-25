---
description: Critical database safety and user data preservation guidelines.
---

# Database Safety & Data Preservation Rule

**CRITICAL DIRECTIVE:** From this point forward (Post-Dockerization Phase), the database contains LIVE user data. **UNDER NO CIRCUMSTANCES** should the database be dropped, reset, or recreated in a way that destroys existing data.

## Guidelines
1. **User Data is Precious:** Users are actively registering and using the application. Their data (profiles, points, solved questions, progress) is invaluable. Never execute destructive commands (`DROP DATABASE`, `docker compose down -v`, etc.).
2. **Migrations Only:** Any schema changes MUST be handled via Entity Framework Core Migrations (`dotnet ef migrations add ...`) that carefully preserve existing rows. Do not recreate tables from scratch if it means losing data.
3. **Data Integrity:** When assigning IDs or manipulating records, always ensure uniqueness and referential integrity (e.g., assigning robust User IDs).
4. **Idempotency:** Any seeder or script that inserts data must be completely idempotent (checking if data already exists before inserting) to prevent duplicate entries and corruption.
5. **Always Verify First:** Before running any broad `UPDATE` or `DELETE` SQL queries directly, verify the query with a `SELECT` and strictly target by precise identifiers (e.g., User ID or exact Email).

*This rule is permanently active and overrides any future request to "reset everything" unless explicitly authorized with a massive warning by the SuperAdmin.*
