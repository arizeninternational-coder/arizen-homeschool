# Journey Generator Subject Guard Test Report

**Date**: 2026-06-21T11:55:03.095Z
**Total**: 16
**Passed**: 16
**Failed**: 0

## Results

| # | Test | Result |
|---|------|--------|
| 1 | Math lesson cannot get reading comprehension skill type | PASS |
| 2 | Math lesson with "Reading" in title must NOT get reading comprehension | PASS |
| 3 | Math lesson with "reading" in strand must NOT get reading comprehension | PASS |
| 4 | Unknown Math topic returns unsupported_needs_source_pack | PASS |
| 5 | English lesson CAN get reading comprehension | PASS |
| 6 | English lesson with "read" in title gets reading comprehension | PASS |
| 7 | Kiswahili lesson cannot get reading comprehension | PASS |
| 8 | Environmental lesson cannot get reading comprehension | PASS |
| 9 | Hygiene lesson cannot get reading comprehension | PASS |
| 10 | Movement lesson cannot get reading comprehension | PASS |
| 11 | Contamination phrase detection catches "reading comprehension" | PASS |
| 12 | Contamination phrase detection catches "good readers" | PASS |
| 13 | Clean Math text passes contamination check | PASS |
| 14 | English goal detection catches "Read a short text about" | PASS |
| 15 | Clean Math goal passes English goal check | PASS |
| 16 | Exact contaminated text from 27 lessons is caught | PASS |

## Summary

All subject-guard tests passed. The generator can no longer apply English reading-comprehension content to non-English lessons.
