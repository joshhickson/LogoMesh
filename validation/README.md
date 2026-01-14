# Validation Framework

## Directory Structure

```
validation/
├── samples/           # Selected battles for expert review (25 battles)
├── packets/           # Anonymized review packets for distribution
├── responses/         # Expert rating responses (JSON format)
├── analysis/          # Analysis outputs (correlations, agreement metrics)
├── reports/           # Final validation reports
└── scripts/           # Validation automation scripts
```

## Workflow

1. **Sample Selection (C-002):** Select 25 battles stratified by CIS score range
2. **Packet Generation (C-003):** Generate anonymized review packets with battle data
3. **Expert Rating (C-004):** Experts rate R/A/T/L dimensions on 5-point scale
4. **Distribution (C-006):** Send packets to 2+ expert reviewers
5. **Collection (C-007):** Gather completed rating responses
6. **Analysis (C-008, C-009, C-010):** Correlation, agreement, failure mode analysis
7. **Reporting (C-011):** Generate validation report with recommendations

## Success Criteria

- **Correlation:** Pearson r ≥ 0.70 between expert ratings and CIS components
- **Agreement:** Cohen's Kappa ≥ 0.60 (substantial agreement between experts)
- **Error Analysis:** MAE ≤ 0.15 per component
- **Failure Modes:** Documented patterns where CIS diverges from expert judgment

## Expert Requirements

- 5+ years software engineering experience
- Familiarity with code review best practices
- No prior knowledge of CIS formula
- Anonymized to battle metadata (no agent/model names)

## Timeline

- Sample selection: 30 min
- Packet generation: 1 hour
- Expert review: 2-3 days (parallel)
- Analysis: 2 hours
- Reporting: 1 hour

**Total:** ~3 days including expert review time
