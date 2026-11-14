# Phase 1 — findings to act on later

Recorded during Phase 0 so they survive past the chat. Nothing here has been changed; each item is a decision for Phase 1.

## 1. Seven tables in `prisma/schema.prisma` do not exist in the database

Verified by probing PostgREST for every model name plus likely extras: 35 present, 7 absent.

| Missing table | Consequence |
|---|---|
| `Notification` | `/api/notifications` synthesises notifications from `Homework`, `Badge`, `ParentChild` and `LearnerProfile` — so nothing is broken today, but the model is dead weight |
| `StudentBadge` | no table; badges live in `Badge` |
| `LearnerBadge` | no table; same |
| `StudentJourneyDraft` | no table — journeys are code-defined (`grade4-journeys.ts`) and stored in `Lesson.contentBlocks`. There is no draft/publish staging table for journeys, despite earlier work assuming one |
| `ThemeProgress` | no table; progress lives in `Progress` |
| `AuditLog` | no table — there is no audit trail of admin mutations |
| `_prisma_migrations` | **never created**: `prisma migrate deploy` has never run against this database. The 4 committed migrations in `prisma/migrations/` are unapplied history |

Two related facts:

- `vercel.json` sets `buildCommand: "npx prisma generate && next build"`, which overrides the `vercel-build` script in `package.json` (that one runs `migrate deploy`). So migrations do not run on deploy even if the table existed.
- The database password in `.env` is wrong (`password authentication failed for user "postgres"`). This does not affect the app — no route uses Prisma — but it means nobody can apply migrations until it is reset.

## 2. `ContentStatus` and `isAvailable` have drifted apart

Live counts:

| | |
|---|---|
| `PUBLISHED` | 9 |
| `DRAFT` | 1,534 |
| `isAvailable: true` | 1,405 |
| `isAvailable: false` | 138 |

So 1,396 lessons are reachable by learners while nominally `DRAFT`. The app gates on `isAvailable` and ignores `status` for visibility, which means the publish workflow is decorative. Phase 1 item 2 (define one coherent meaning) should decide which field is authoritative before any admin UI is trusted.

## 3. Trunk divergence

- `deploy-to-merge` (production) is **272 commits ahead / 7 behind** `origin/master`
- `master` is not a clean trunk: its 7 unique commits are older content work (Grade 4 Math wiring, route-conflict fix, `xlsx` curriculum upload)
- **The CSV/XLSX importer on `master` is xlsx-capable; the production branch is CSV-only.** `vercel.json`-era work never got the xlsx hotfix. Porting it is Phase 1 item 1.

## 4. Content coverage (context for "curated visibility")

- Grade 4 has 11 subject themes in the DB; **only Mathematics has content** — 1 quest, 5 lessons. The other ten (English, Kiswahili, Science and Technology, Social Studies, CRE, Agriculture, Art and Craft, Music, HPE, Digital Literacy) have zero quests and zero lessons.
- Grade 2 English is fully hidden (138 lessons, all `isAvailable: false`).
- Grades 1 and 3 have no lessons at all.
- 5 Grade 4 Mathematics lessons, all `PUBLISHED`, all adaptive-config-backed and correctly slug-wired.

## 5. Schema drift from Prisma

`Theme` carries `grade` as an integer column; there is no `Grade` or `Subject` table. Several SQL files in the repo root (`SEED_ALL_GRADES.sql`, `scripts/seed-curriculum.sql`) reference `Grade`, `Subject`, `guild_id` and `"order"` — a schema shape that no longer exists. They will fail if run. `prisma/seed.ts` is also unrunnable: it imports `./grade2-math`, `./grade2-english` and `./grade2-kiswahili`, none of which were ever committed on any branch.
