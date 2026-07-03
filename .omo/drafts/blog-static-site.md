---
slug: blog-static-site
status: in-review
intent: clear
review_required: true
pending-action: high-accuracy dual review (Momus + Oracle)
approach: React 19 + Vite 6 static blog, feature-layered architecture, auto-discovery categories, 25 todos / 6 waves
---

# Draft: blog-static-site

## Components (topology ledger)
| id | outcome | status | evidence path |
| --- | --- | --- | --- |
| C1 | Project scaffolding | active | .omo/plans/blog-static-site.md T1-T4 |
| C2 | Post data layer | active | .omo/plans/blog-static-site.md T5-T7 |
| C3 | Layout & navigation | active | .omo/plans/blog-static-site.md T8-T11 |
| C4 | Home page | active | .omo/plans/blog-static-site.md T12-T16 |
| C5 | Post detail page | active | .omo/plans/blog-static-site.md T17-T21 |
| C6 | Assembly & deploy | active | .omo/plans/blog-static-site.md T22-T25 |

## Open assumptions (announced defaults)
| assumption | adopted default | rationale | reversible? |
| --- | --- | --- | --- |
| Package manager | npm | standard Vite/React default | yes |
| Deploy branch | main | GitHub default | yes |
| Commit message format | English, conventional commits | user's CLAUDE.md preference | yes |

## Findings (cited - path:lines)
- Metis gap analysis identified 4 blockers (fixed): posts dir placement, Router basename bug, missing gray-matter, plugin ordering
- All 4 blockers resolved in plan

## Decisions (with rationale)
30 decisions recorded in plan, all confirmed by user interview

## Scope IN
See plan Must have section

## Scope OUT (Must NOT have)
See plan Must NOT have section

## Open questions
None remaining

## High-accuracy review
- **Round 1**: Momus → OKAY | Oracle → REJECT (2B+5M+5m)
- **Round 2**: Momus → OKAY | Oracle → REJECT (3 new: T1 deps, T5 draft filter, T24 closeBundle)
- **Round 3**: Momus → OKAY ✅ | Oracle → APPROVE ✅
- **Final**: Dual APPROVE — plan is executable with zero remaining issues

## Approval gate
status: approved
review_required: true — dual review passed (3 rounds)
