#!/usr/bin/env python3
"""
C-011: Validation Report Generator
Combines correlation, agreement, and failure mode analyses into final validation report.

Usage:
    python validation/scripts/generate_report.py \
        --correlation validation/analysis/correlation_report.json \
        --agreement validation/analysis/agreement_metrics.json \
        --failure-modes validation/analysis/failure_modes.json \
        --output validation/reports/validation_report.md

Output:
    - Comprehensive validation report (Markdown)
    - Overall PASS/FAIL determination
    - Recommendations for next steps
"""

import argparse
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, Any


def load_json(file_path: str) -> Dict[str, Any]:
    """Load JSON file."""
    with open(file_path, 'r') as f:
        return json.load(f)


def generate_report_header() -> str:
    """Generate report header with metadata."""
    return f"""---
status: SNAPSHOT
type: Report
---
> **Context:**
> *   [{datetime.now().strftime('%Y-%m-%d')}]: CIS Validation Study - Expert Review Results
> **Parent Document:** [Phase1-Yin-Campaign-20260113.md](../../docs/04-Operations/Intent-Log/Josh/Phase1-Yin-Campaign-20260113.md)

---

# CIS Validation Report

**Date:** {datetime.now().strftime('%Y-%m-%d')}  
**Study Type:** Expert Human Validation  
**Sample Size:** 25 battles (Stage 2 Campaign)  
**Expert Reviewers:** Multiple senior software engineers (5+ years experience)

---

## Executive Summary

"""


def generate_pass_fail_section(correlation: Dict[str, Any], 
                               agreement: Dict[str, Any]) -> tuple[str, bool]:
    """Generate pass/fail section and return (text, overall_pass)."""
    corr_results = correlation["results"]
    agree_results = agreement["results"]
    
    # Check correlation thresholds
    corr_assessment = corr_results["overall_assessment"]
    corr_pass = corr_assessment["meets_threshold"]
    
    # Check agreement thresholds
    agree_assessment = agree_results["overall_assessment"]
    kappa_pass = agree_assessment["kappa_threshold_met"]
    icc_pass = agree_assessment["icc_threshold_met"]
    
    overall_pass = corr_pass and kappa_pass and icc_pass
    
    status = "✅ VALIDATION PASSED" if overall_pass else "❌ VALIDATION FAILED"
    
    text = f"""### Validation Status: {status}

**Success Criteria:**

| Metric | Threshold | Result | Status |
|:---|:---|:---|:---|
| Pearson Correlation (R, A, T, L) | ≥ 0.70 | {corr_assessment['min_correlation']:.3f} (min) | {'✅ PASS' if corr_pass else '❌ FAIL'} |
| Cohen's Kappa (Inter-rater) | ≥ 0.60 | {agree_assessment['mean_kappa']:.3f} | {'✅ PASS' if kappa_pass else '❌ FAIL'} |
| ICC (Intraclass Correlation) | ≥ 0.70 | {agree_assessment['mean_icc']:.3f} | {'✅ PASS' if icc_pass else '❌ FAIL'} |

"""
    
    if overall_pass:
        text += """
**Interpretation:** The CIS formula demonstrates strong correlation with expert human judgment 
and experts show substantial agreement with each other. The metric is valid for use in 
Stage 3 Campaign and paper publication.

"""
    else:
        text += """
**Interpretation:** CIS does not meet validation criteria. Further refinement needed before 
Stage 3 Campaign. Review failure modes and revise formula/constraints.

"""
    
    return text, overall_pass


def generate_correlation_section(correlation: Dict[str, Any]) -> str:
    """Generate detailed correlation analysis section."""
    corr_results = correlation["results"]
    components = corr_results["component_correlations"]
    sig_tests = corr_results["significance_tests"]
    sample_sizes = corr_results["sample_sizes"]
    
    text = """## Correlation Analysis

**Research Question:** Do CIS component scores correlate with expert ratings?

### Component-wise Correlations

| Component | Pearson r | Sample Size | p-value | Significance |
|:---|:---|:---|:---|:---|
"""
    
    for dim in ["R", "A", "T", "L"]:
        r = components[dim]
        n = sample_sizes[dim]
        p = sig_tests[dim]["p_value"]
        sig = "✓" if sig_tests[dim]["significant"] else "✗"
        
        text += f"| {dim} | {r:.3f} | {n} | {p:.4f} | {sig} |\n"
    
    text += f"""
**Overall:**
- Mean correlation: {corr_results['overall_assessment']['mean_correlation']:.3f}
- Range: [{corr_results['overall_assessment']['min_correlation']:.3f}, {corr_results['overall_assessment']['max_correlation']:.3f}]
- Threshold: ≥ 0.70 (strong correlation)

"""
    
    return text


def generate_agreement_section(agreement: Dict[str, Any]) -> str:
    """Generate inter-rater agreement section."""
    agree_results = agreement["results"]
    num_experts = agree_results["num_experts"]
    
    text = f"""## Inter-Rater Agreement

**Research Question:** Do expert reviewers agree with each other?

**Number of Experts:** {num_experts}

### Dimension-wise Agreement

| Dimension | Cohen's Kappa | ICC | Exact Agreement | Within 1 Step |
|:---|:---|:---|:---|:---|
"""
    
    for dim in ["R", "A", "T", "L"]:
        dim_results = agree_results["dimensions"][dim]
        
        if num_experts == 2:
            kappa = dim_results["cohen_kappa"]
            icc = dim_results["icc"]
            exact = dim_results["exact_agreement"]
            within = dim_results["within_one_step"]
        else:
            kappa = dim_results.get("cohen_kappa_mean", 0.0)
            icc = dim_results["icc"]
            exact = dim_results.get("exact_agreement_mean", 0.0)
            within = dim_results.get("within_one_step_mean", 0.0)
        
        text += f"| {dim} | {kappa:.3f} | {icc:.3f} | {exact:.1%} | {within:.1%} |\n"
    
    overall = agree_results["overall_assessment"]
    
    text += f"""
**Overall:**
- Mean Cohen's Kappa: {overall['mean_kappa']:.3f} (threshold: ≥ 0.60)
- Mean ICC: {overall['mean_icc']:.3f} (threshold: ≥ 0.70)

**Interpretation:**
- Kappa 0.60-0.80: Substantial agreement
- Kappa 0.80-1.00: Almost perfect agreement
- ICC 0.70-0.90: Good to excellent reliability

"""
    
    return text


def generate_failure_modes_section(failure_modes: Dict[str, Any]) -> str:
    """Generate failure mode analysis section."""
    summary = failure_modes["summary"]
    dim_stats = failure_modes["dimension_statistics"]
    patterns = failure_modes["common_patterns"]
    recommendations = failure_modes["recommendations"]
    
    text = f"""## Failure Mode Analysis

**Research Question:** Where does CIS diverge from expert judgment?

### Summary

- Total battles analyzed: {summary['total_battles_analyzed']}
- Flagged battles: {summary['flagged_battles']} ({summary['flagged_rate']:.1%})
- Divergence threshold: {summary['threshold_used']}

### Dimension-wise Failure Modes

| Dimension | False Positives | False Negatives | Matches |
|:---|:---|:---|:---|
"""
    
    for dim in ["R", "A", "T", "L"]:
        stats = dim_stats[dim]
        text += f"| {dim} | {stats['false_pos']} | {stats['false_neg']} | {stats['match']} |\n"
    
    text += f"""
**Definitions:**
- **False Positive:** CIS overestimates quality (CIS > Expert by > {summary['threshold_used']})
- **False Negative:** CIS underestimates quality (CIS < Expert by > {summary['threshold_used']})
- **Match:** CIS and Expert within {summary['threshold_used']} of each other

### Common Patterns

"""
    
    for i, pattern in enumerate(patterns[:5], 1):
        text += f"{i}. **{pattern['pattern']}**: {pattern['count']} cases\n"
    
    text += "\n### Recommendations\n\n"
    
    for i, rec in enumerate(recommendations, 1):
        text += f"{i}. {rec}\n"
    
    text += "\n"
    
    return text


def generate_next_steps(overall_pass: bool) -> str:
    """Generate next steps section."""
    if overall_pass:
        return """## Next Steps

### ✅ Validation Passed - Proceed to Stage 3

1. **Update CURRENT_TRUTH_SOURCE.md** (C-012)
   - Document validation results
   - Mark CIS formula as validated
   - Record validation date and expert count

2. **Configure Stage 3 Campaign** (E-001)
   - Set target: 100+ battles
   - Include all 4 tasks
   - Deploy all agent types

3. **Launch Stage 3** (E-004)
   - Monitor for stability
   - Collect comprehensive dataset
   - Prepare for final paper analysis

4. **Post-Campaign Analysis** (Phase F)
   - Generate comparison reports
   - Extract insights for paper
   - Finalize LaTeX paper

### Long-term

- Consider publishing validation methodology
- Expand to additional programming languages
- Validate on real-world codebases

"""
    else:
        return """## Next Steps

### ❌ Validation Failed - Refinement Required

1. **Review Failure Modes**
   - Identify systematic biases
   - Check dimension-specific issues
   - Analyze task/agent patterns

2. **Refine CIS Formula**
   - Adjust component weights if needed
   - Tighten/loosen architectural constraints
   - Improve test specificity patterns
   - Consider LLM prompt tuning for Logic Score

3. **Re-score Stage 2** (Phase D)
   - Apply revised formula to existing battles
   - Verify improvements in component correlations

4. **Repeat Validation** (Phase C)
   - Same expert reviewers for consistency
   - Focus on previously problematic dimensions
   - Target: All metrics above thresholds

5. **Document Iteration**
   - Update paper with refinement rationale
   - Include ablation study results
   - Version control all formula changes

### Do NOT Proceed to Stage 3 Until Validation Passes

"""


def main():
    parser = argparse.ArgumentParser(description="Generate validation report")
    parser.add_argument("--correlation", required=True, help="Correlation analysis JSON")
    parser.add_argument("--agreement", required=True, help="Agreement metrics JSON")
    parser.add_argument("--failure-modes", required=True, help="Failure modes JSON")
    parser.add_argument("--output", required=True, help="Output Markdown file")
    args = parser.parse_args()
    
    print("Loading analysis results...")
    correlation = load_json(args.correlation)
    agreement = load_json(args.agreement)
    failure_modes = load_json(args.failure_modes)
    
    print("Generating validation report...")
    
    # Build report sections
    report_sections = []
    
    # Header
    report_sections.append(generate_report_header())
    
    # Pass/Fail
    pass_fail_text, overall_pass = generate_pass_fail_section(correlation, agreement)
    report_sections.append(pass_fail_text)
    
    # Detailed sections
    report_sections.append(generate_correlation_section(correlation))
    report_sections.append(generate_agreement_section(agreement))
    report_sections.append(generate_failure_modes_section(failure_modes))
    
    # Next steps
    report_sections.append(generate_next_steps(overall_pass))
    
    # Appendix
    report_sections.append("""## Appendix

### Methodology

**Sample Selection:**
- Stratified sampling across CIS score ranges (0.00-1.00)
- 5 battles per bucket (very low, low, medium, high, very high)
- Diverse task and agent coverage

**Expert Criteria:**
- 5+ years professional software engineering experience
- Code review proficiency
- No prior CIS knowledge

**Rating Scale:**
- 0.00-1.00 in 0.25 increments
- 4 dimensions: R (Rationale), A (Architecture), T (Testing), L (Logic)
- Independent rating per dimension

**Analysis Methods:**
- Pearson correlation (CIS vs Expert)
- Cohen's Kappa (inter-rater agreement, categorical)
- ICC (intraclass correlation, continuous)
- Failure mode extraction (divergence > 0.30 threshold)

### Data Files

- Sample selection: `validation/samples/selected_battles.json`
- Expert packets: `validation/packets/B001.json` through `B025.json`
- Expert responses: `validation/responses/expert*_ratings.json`
- Correlation analysis: `validation/analysis/correlation_report.json`
- Agreement metrics: `validation/analysis/agreement_metrics.json`
- Failure modes: `validation/analysis/failure_modes.json`

### Contact

For questions about this validation study, contact [Your contact information here].

---

**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
""")
    
    # Combine all sections
    full_report = "\n".join(report_sections)
    
    # Save report
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w') as f:
        f.write(full_report)
    
    print(f"\n{'='*50}")
    print(f"Validation Report Generated: {output_path}")
    print(f"{'='*50}")
    print(f"Overall Status: {'✅ PASS' if overall_pass else '❌ FAIL'}")
    print(f"{'='*50}\n")
    
    if overall_pass:
        print("✅ CIS validation passed! Ready for Stage 3 Campaign.")
    else:
        print("❌ CIS validation failed. Review failure modes and refine formula.")
    
    print(f"\nFull report saved to: {output_path}")


if __name__ == "__main__":
    main()
