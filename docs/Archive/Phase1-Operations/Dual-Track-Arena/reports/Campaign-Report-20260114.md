# Campaign Report: 2026-01-14

**Status:** AUTOMATED REPORT
**Context:** Operations / Green Agent Analysis

## 1. Census
**Total Battles:** 77

### Breakdown by Task
| task_title          |   count |
|:--------------------|--------:|
| LRU Cache           |      27 |
| Rate Limiter        |      25 |
| Recursive Fibonacci |      25 |

## 2. Scoreboard (Averages)
| task_title          |   cis_score |   logic_score | sandbox_success   |   security_issues |
|:--------------------|------------:|--------------:|:------------------|------------------:|
| LRU Cache           |     0.53437 |      0.516667 | 100.0%            |                 0 |
| Rate Limiter        |     0.67904 |      0.626    | 100.0%            |                 0 |
| Recursive Fibonacci |     0.76776 |      0.808    | 100.0%            |                 0 |

## 3. Hall of Shame

### The "Hallucination" Trap (High Rationale, Broken Code)
*Potential candidates where the agent lied about its reasoning.*
**Count:** 0

*No clear hallucinations detected yet.*

### The "Silent Failure" Trap (Working Code, Poor Rationale)
*Potential candidates where the agent got lucky or plagiarized without understanding.*
**Count:** 3

| Battle ID | Task | CIS Score | Rationale |
|---|---|---|---|
| `auto_1768359509_7967` | LRU Cache | 0.48 | 0.40 |
| `auto_1768360952_8362` | LRU Cache | 0.42 | 0.40 |
| `auto_1768363861_1457` | LRU Cache | 0.38 | 0.40 |
