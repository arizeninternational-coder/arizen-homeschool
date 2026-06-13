# OPERATING_SYSTEM.md — Arizen School Workflow Engine

> **How work actually gets done.** This file defines the workflows that connect profiles into pipelines. Every major task follows one of these workflows.

---

## How to Use This File

1. **Classify the task** using the Task Classification Key below
2. **Activate the primary profile** for that workflow
3. **Follow the workflow steps** in order
4. **Do not skip steps.** Each gate must be passed before proceeding.
5. **If blocked**, escalate to the profile listed in the stop condition

---

## Task Classification Key

| # | Task Signal | Classification |
|---|---|---|
| 1 | "Should we build X?" | Product Planning |
| 2 | "What should come next?" | Product Planning |
| 3 | "Is X aligned with CBC?" | Curriculum |
| 4 | "Are these lesson titles correct?" | Curriculum |
| 5 | "Regenerate/fix journeys for subject X" | Journey Generation |
| 6 | "Design the X screen" | UI/UX |
| 7 | "Fix the X button/layout" | UI/UX |
| 8 | "Implement X feature" | Frontend |
| 9 | "Fix X bug in the UI" | Frontend |
| 10 | "Add/fix API endpoint" | Backend/Data |
| 11 | "Import CSV / migrate data" | Backend/Data |
| 12 | "Test X flow" | QA |
| 13 | "Does X work correctly?" | QA |
| 14 | "Deploy X" | Release |
| 15 | "Is the build ready?" | Release |
| 16 | "Something broke" | Recovery |
| 17 | "We need a backup" | Recovery |
| 18 | "What happened in the last session?" | Documentation |
| 19 | "Update the status/docs" | Documentation |

**Default Rule:** If the task is unclear, do NOT start coding. Classify first. If it spans multiple classifications, start with Product Architect to scope it.

---

## A. New Feature Workflow

**Example:** Parent messaging, leaderboard, avatar editor, student calendar.

```
Step 1: PRODUCT ARCHITECT
  → Write feature brief with success criteria
  → Define scope (in / out)
  → Identify affected user roles (student, parent, admin, teacher)
  → Output: Feature brief document
  → GATE: Victor approves the brief

Step 2: UI/UX DESIGNER (parallel with Step 3)
  → Design the user flows
  → Create design prompts / wireframes
  → Identify needed API endpoints
  → Output: UI prompts, design notes
  → GATE: Design reviewed and approved

Step 3: BACKEND/DATA ENGINEER (parallel with Step 2)
  → Define data model changes
  → Write API endpoints
  → Create migration plan (if schema changes needed)
  → Run SAFETY AGENT review on any migration
  → Output: API report, migration plan
  → GATE: Migration reviewed, dry-run passed

Step 4: SAFETY AGENT
  → Review all migration scripts and write operations
  → Verify backups exist
  → Output: Safety clearance
  → GATE: Safety checklist passed

Step 5: FRONTEND ENGINEER
  → Implement screens and components
  → Connect to APIs
  → Handle loading/error states
  → Output: Changed files, build result
  → GATE: Build passes

Step 6: QA TESTER
  → Test all user flows for the feature
  → Test edge cases (empty states, errors, permissions)
  → Output: QA report
  → GATE: QA PASS

Step 7: RELEASE MANAGER
  → Verify all checklist items
  → Prepare release notes
  → Recommend deployment
  → Output: Release readiness report
  → GATE: Victor approves deployment

Step 8: DOCUMENTATION AGENT
  → Update WORK_SESSION_STATUS.md
  → Record decision log entry
  → Output: Updated docs
```

**What must be true before moving forward:**
- Victor approved the feature brief
- Design reviewed and approved
- Safety review cleared
- Build passes
- QA passes
- Victor approves deployment

---

## B. Curriculum/Journey Generation Workflow

**Example:** Regenerate Grade 2 English, Kiswahili, Hygiene, Movement.

```
Step 1: CURRICULUM ARCHITECT
  → Inspect lesson shells for the target subject
  → Verify lesson count and IDs
  → Identify any malformed titles or data issues
  → Output: Curriculum audit for the subject
  → GATE: Audit complete, no blocking data issues

Step 2: CURRICULUM ARCHITECT
  → Define subject-specific journey logic
  → Identify what makes this subject's journeys unique
  → Output: Subject adapter spec
  → GATE: Curriculum Architect sign-off

Step 3: JOURNEY DESIGNER
  → Write/create subject adapter
  → Generate 3-5 PROOF-OF-CONCEPT journeys (local files only)
  → Output: POC journeys
  → GATE: POC quality check PASS

Step 4: CURRICULUM ARCHITECT (review)
  → Review POC journeys for curriculum accuracy
  → Check for: title-copying, answer leaks, generic content, repeated greetings
  → Output: POC approval
  → GATE: Curriculum Architect approves POC

Step 5: QA TESTER
  → Browser-test POC journeys in the actual UI
  → Verify all 10 steps render correctly
  → Output: POC browser verification
  → GATE: QA PASS on POC

Step 6: SAFETY AGENT
  → Review the generation script
  → Verify: explicit questId/themeId targeting, no weak filters
  → Verify: dry-run report with count + sample titles
  → Verify: backup of existing journey data
  → Output: Safety clearance
  → GATE: Safety checklist passed

Step 7: BACKEND/DATA ENGINEER
  → Run dry-run: print count + 5 sample titles
  → Confirm count matches expected
  → Write to studentJourneyDraft ONLY (never studentJourney directly)
  → Output: Dry-run report, write confirmation
  → GATE: Count confirmed, write complete

Step 8: QA TESTER
  → Browser-test a sample of the generated journeys (min 5)
  → Check for rendering issues, wrong content, broken steps
  → Output: QA report on generated journeys
  → GATE: QA PASS

Step 9: VICTOR APPROVAL REQUIRED
  → Present results: count, samples, QA report
  → Option A: approve draft → publish (update studentJourney)
  → Option B: request fixes → return to Step 3
  → Option C: reject → halt
  → GATE: Victor explicitly approves publishing

Step 10: DOCUMENTATION AGENT
  → Update WORK_SESSION_STATUS.md
  → Record generation details (script, filters, counts)
  → Output: Updated docs
```

**What must be true before moving forward:**
- Curriculum audit clean
- POC journeys pass quality review
- POC browser verification passes
- Safety review cleared (no weak filters, backup exists)
- Dry-run count matches expected
- QA passes on sample
- **Victor explicitly approves before any publishing**

---

## C. UI Redesign Workflow

**Example:** Student dashboard, emotion check-in, lesson player.

```
Step 1: UI/UX DESIGNER
  → Audit current state (screenshots, usability issues)
  → Define redesign goals
  → Create design prompts / wireframes
  → Output: UI audit + redesign plan
  → GATE: Design direction approved

Step 2: FRONTEND ENGINEER
  → Implement the redesign
  → Update components, layouts, styles
  → Output: Changed files, build result
  → GATE: Build passes

Step 3: UI/UX DESIGNER (review)
  → Review implemented design against original prompts
  → Screenshot comparison
  → Output: Design review report
  → GATE: Design matches intent

Step 4: QA TESTER
  → Test all affected routes
  → Test responsive behavior
  → Test loading/error states
  → Output: QA report
  → GATE: QA PASS

Step 5: RELEASE MANAGER
  → Standard release checklist
  → Output: Release readiness
  → GATE: Victor approves deployment

Step 6: DOCUMENTATION AGENT
  → Update docs, record design decisions
  → Output: Updated docs
```

---

## D. Data/Migration Workflow

**Example:** Importing CSV lessons, fixing subject records, adding childFriendlyTitle.

```
Step 1: CURRICULUM ARCHITECT
  → Inspect source data (CSV, records)
  → Identify data quality issues
  → Define validation rules
  → Output: Source data audit
  → GATE: Audit complete

Step 2: BACKEND/DATA ENGINEER
  → Write migration/import script
  → Include: dry-run mode, count validation, explicit filters
  → Output: Migration script
  → GATE: Script reviewed

Step 3: SAFETY AGENT
  → Audit the script for dangerous patterns
  → Verify: explicit targeting, no broad filters
  → Verify: backup plan exists
  → Output: Safety clearance
  → GATE: Safety checklist passed

Step 4: BACKEND/DATA ENGINEER
  → Create backup of affected records
  → Run dry-run: print count + affected record samples
  → Output: Backup confirmation, dry-run report
  → GATE: Dry-run count approved

Step 5: BACKEND/DATA ENGINEER
  → Execute the migration
  → Output: Execution report (records changed)
  → GATE: Count matches dry-run

Step 6: QA TESTER
  → Verify affected records in the UI
  → Spot-check data accuracy
  → Output: QA report
  → GATE: QA PASS

Step 7: DOCUMENTATION AGENT
  → Update WORK_SESSION_STATUS.md
  → Record migration details
  → Output: Updated docs
```

---

## E. Release Workflow

**Example:** Moving from local → preview → production.

```
Step 1: RELEASE MANAGER
  → Check git status (clean working tree)
  → Verify branch is correct
  → Run build
  → Verify environment variables
  → Output: Pre-flight checklist
  → GATE: All pre-flight checks pass

Step 2: QA TESTER
  → Run full QA checklist on current build
  → Test critical paths: login, dashboard, lesson player, admin
  → Output: QA report
  → GATE: QA PASS

Step 3: RELEASE MANAGER
  → Push to feature/staging branch
  → Verify preview deployment URL
  → Verify commit hash matches
  → Output: Preview deployment report
  → GATE: Preview is live and correct

Step 4: VICTOR APPROVAL REQUIRED
  → Present: preview URL, commit hash, QA report
  → Do NOT deploy to production without explicit approval
  → GATE: Victor explicitly approves production deployment

Step 5: RELEASE MANAGER
  → Deploy to production
  → Verify production URL
  → Output: Production deployment confirmation
  → GATE: Production is live

Step 6: QA TESTER
  → Smoke test production
  → Verify critical paths
  → Output: Production smoke test report
  → GATE: Smoke test PASS

Step 7: DOCUMENTATION AGENT
  → Update WORK_SESSION_STATUS.md
  → Create release notes entry
  → Output: Updated docs
```

---

## F. Recovery Workflow

**Example:** Accidental script damage, broken build, wrong data written.

```
Step 1: SAFETY AGENT (IMMEDIATE)
  → STOP all write operations
  → Assess the damage: what was affected, how many records
  → Determine if the issue is ongoing (script still running?)
  → If ongoing: KILL the process immediately
  → Output: Initial damage assessment
  → GATE: Issue contained

Step 2: SAFETY AGENT
  → Identify available backups (database exports, git history)
  → Evaluate recovery options
  → Define rollback procedure
  → Output: Recovery plan with options
  → GATE: Recovery plan approved by Victor

Step 3: BACKEND/DATA ENGINEER
  → Execute approved recovery plan
  → If re-generation: follow Workflow B (Journey Generation)
  → If rollback from backup: restore affected records
  → Output: Recovery execution report
  → GATE: Recovery complete

Step 4: QA TESTER
  → Verify recovered data in the UI
  → Spot-check affected records
  → Output: Post-recovery QA report
  → GATE: QA PASS

Step 5: SAFETY AGENT
  → Identify root cause
  → Update safety guards to prevent recurrence
  → Output: Incident report + updated safety guards
  → GATE: Safety guards in place

Step 6: DOCUMENTATION AGENT
  → Update WORK_SESSION_STATUS.md
  → Create incident report entry
  → Update decision log with lessons learned
  → Output: Updated docs
```

---

## Workflow Decision Tree

```
START
  │
  ├─ "What should we build / what's next?"
  │   └─▶ A. New Feature Workflow
  │
  ├─ "Fix/regenerate journeys for subject X"
  │   └─▶ B. Curriculum/Journey Generation Workflow
  │
  ├─ "Redesign/improve the UI for X"
  │   └─▶ C. UI Redesign Workflow
  │
  ├─ "Import/fix/migrate data"
  │   └─▶ D. Data/Migration Workflow
  │
  ├─ "Deploy/release X"
  │   └─▶ E. Release Workflow
  │
  ├─ "Something broke / we have a problem"
  │   └─▶ F. Recovery Workflow
  │
  └─ "I'm not sure what this task is"
      └─▶ Ask: What user problem does this solve?
          ├─ Planning problem → Product Architect
          ├─ Content problem → Curriculum Architect
          ├─ Journey quality problem → Journey Designer
          ├─ Visual/UX problem → UI/UX Designer
          ├─ Code problem → Frontend/Backend Engineer
          ├─ Confidence problem → QA Tester
          └─ Release problem → Release Manager
```

---

## Workflow Rules (Non-Negotiable)

1. **No profile skips its gate.** If the gate fails, go back or escalate.
2. **Victor approval is required before:** production deployment, publishing journeys, any irreversible DB change.
3. **Safety Agent review is required before:** any database write, migration, or mass operation.
4. **Dry-run is required before:** any bulk write, generation script, or migration.
5. **Backup is required before:** any write to production data.
6. **QA is required before:** any deployment or publishing.
7. **Documentation is updated after:** every completed workflow.
8. **Math and Grade 5 require explicit assignment.** No profile touches Math or Grade 5 without Victor's direct instruction.
9. **Title pattern filters are banned.** All operations must target by questId, themeId, or explicit ID list.
10. **When in doubt, stop and classify.** A misclassified task is more dangerous than a delayed task.
