---
status: ACTIVE
type: Research
---
> **Context:**
> *   [2026-01-14]: Research request for C-NEW-001 model selection (Model Diversity Test)
> **Purpose:** Autonomous research prompt for Gemini 3 Pro Deep Research mode
> **Target Outcome:** Curated list of 3-5 LLM models spanning quality spectrum for CIS validation
> **Parent Document:** [MASTER-ACTION-ITEM-INDEX.md](./MASTER-ACTION-ITEM-INDEX.md)

---

# Research Request: Model Selection for CIS Validation Diversity Test

## Research Mission

**Identify 3-5 code-generation LLM models that span a quality spectrum (weak → baseline → strong) and are compatible with our infrastructure for a model diversity validation experiment.**

---

## Project Context

### What is LogoMesh?
LogoMesh is a research project validating **CIS (Code Integrity Score)**, a novel holistic code quality metric for AI-generated code. CIS measures code quality across 4 dimensions:
- **R (Requirements):** Intent-rationale alignment
- **A (Architecture):** Structural soundness & constraint compliance
- **T (Testing):** Test quality & edge case coverage
- **L (Logic):** Correctness & code review approval

**Formula:** CIS = 0.25×R + 0.25×A + 0.25×T + 0.25×L (equal weighting, 0.00-1.00 scale)

### Current State
- **Stage 2 Complete:** 77 battles with Qwen/Qwen2.5-Coder-32B-Instruct-AWQ (baseline model)
- **Stage 3 Pending:** 200+ battles for publication-ready dataset
- **Competition Target:** Berkeley AgentX (AgentBeats track) — requires validation that CIS correlates with agent performance
- **Blocking Item:** C-NEW-001 (Model Diversity Test) — must prove CIS differentiates model quality before Stage 3 launch

### Infrastructure
- **Hardware:** 1x NVIDIA H100 GPU (Lambda Labs cloud instance, 80GB VRAM)
- **Serving:** vLLM (currently serving Qwen-2.5-Coder-32B-Instruct-AWQ on port 8000)
- **Quantization:** AWQ/MXFP4 quantization preferred (faster inference, lower memory)
- **Max Model Length:** 16,384 tokens (128k context models preferred for agentic loops)
- **API Compatibility:** OpenAI-compatible endpoint (OPENAI_BASE_URL, OPENAI_API_KEY)
- **Competition Requirement:** AgentX AgentBeats track — models must support agentic workflows (multi-step reasoning, tool use, A2A protocol)

### Code Tasks (4 types)
1. **Email Validator:** Regex pattern matching (syntax validation, no network calls)
2. **Rate Limiter:** Timing-based request throttling (concurrency, time module required)
3. **LRU Cache:** Data structure with eviction policy (OrderedDict, capacity management)
4. **Fibonacci:** Recursive computation (must use recursion, not iteration)

---

## Research Objective

### Primary Goal: Model Diversity Test (C-NEW-001)
**Hypothesis:** If CIS is a valid quality metric, then better models → higher CIS scores, weaker models → lower CIS scores.

**Experimental Design:**
1. Load 3-5 models spanning quality spectrum into vLLM
2. Run identical 50+ battles per model (same tasks, same prompts) — scaled up for AgentX competition rigor
3. Compute CIS scores for each model's submissions
4. Compare CIS distributions by model
5. Validate that CIS correlates with agentic workflow performance (multi-step reasoning, tool use)

**Expected Pattern:**
```
Weaker Model:    CIS_avg = 0.45-0.55 (struggles with architecture/testing)
Baseline Model:  CIS_avg = 0.60-0.65 (Qwen-2.5-Coder-32B, dense architecture)
Stronger Model:  CIS_avg = 0.70-0.80 (excellent across all dimensions)

Note: MoE models (like gpt-oss-20b) may show different patterns due to active parameter efficiency
```

**Success Criteria:** Clear CIS differentiation between model quality tiers (statistically significant variance).

---

## Required Model Characteristics

### ✅ Must Have
1. **Code Generation Capability:** Proven track record on HumanEval, MBPP, or similar benchmarks
2. **Agentic Workflow Support:** Ability to handle multi-step reasoning, tool calls, A2A protocol (critical for AgentX competition)
3. **H100 GPU Compatibility:** Must fit in ~80GB VRAM (AWQ/MXFP4 quantization preferred)
4. **vLLM Support:** Model must be servable via vLLM (check vLLM 0.10+ compatibility, MXFP4 support)
5. **Quality Diversity:** Need models at 3 distinct quality levels:
   - **Tier 1 (Weak):** 7B-13B models, HumanEval <50%, basic coding capability
   - **Tier 2 (Baseline):** Qwen-2.5-Coder-32B (HumanEval ~60-70%, dense architecture)
   - **Tier 3 (Strong):** MoE models (gpt-oss-20b) or high-parameter models (HumanEval >75%)
6. **Throughput Efficiency:** MoE architectures preferred for faster inference (3.6B active vs 32B dense)
7. **Permissive Licensing:** Must allow research use on cloud GPU

### ⚠️ Constraints
- **Memory Budget:** 80GB VRAM (H100) — larger models need AWQ/GPTQ/MXFP4 quantization
- **No API-only Models:** Must be self-hostable (no Claude API, GPT-4 API) — we need identical prompts/temperature for fair comparison
- **Latency Preference:** Faster inference preferred (AgentX requires throughput for 200+ battles) — MoE models advantageous
- **Agentic Format Support:** Must cleanly separate reasoning, tool calls, and responses (Harmony protocol or equivalent)
- **No Fine-Tuned Models:** Prefer base/instruct models (not domain-specific fine-tunes)
- **Competition Rigor:** Models must handle multi-step agentic loops, not just single-shot code generation

### 🎯 Ideal Candidates (Research These)
- **Tier 1 (Weak):** CodeLlama-7B, StarCoder-7B, Phi-2, DeepSeek-Coder-6.7B, Mistral-7B-Instruct
- **Tier 2 (Baseline):** Qwen-2.5-Coder-32B-AWQ (current, dense), CodeLlama-34B, WizardCoder-33B
- **Tier 3 (Strong - MoE Priority):** 
  - **openai/gpt-oss-20b** (21B total, 3.6B active, MXFP4, Harmony protocol native, AgentX recommended)
  - Qwen-2.5-Coder-72B-AWQ (dense, high quality)
  - DeepSeek-Coder-V2-236B-GPTQ (if fits)
  - Mixtral-8x7B-Instruct (MoE architecture)

**Critical Note:** `gpt-oss-20b` is the Berkeley AgentX recommended model for agentic benchmarks due to MoE efficiency + native Harmony protocol support. Prioritize this for Tier 3 research.

---

## Research Questions to Answer

### 1. Model Availability & Compatibility
- **Which code-generation models are available on Hugging Face with permissive licenses?**
- **Which models are vLLM-compatible?** (Check vLLM 0.10+ docs, GitHub issues, MXFP4 support)
- **Do AWQ/GPTQ/MXFP4 quantized versions exist?** (Critical for fitting larger models in 80GB VRAM)
- **Which models support Harmony protocol or A2A format?** (Native support reduces format failures in agentic loops)
- **Are there MoE (Mixture-of-Experts) models available?** (3.6B active vs 32B dense = 5-10x throughput)

### 2. Model Performance Benchmarks
- **HumanEval scores:** What are the pass@1 rates for candidate models?
- **MBPP scores:** What are the pass@1 rates for candidate models?
- **LiveCodeBench / EvalPlus:** Any additional code generation benchmarks?
- **Agentic Benchmarks:** Codeforces Elo, AIME 2024 scores, SWE-bench (measures multi-step reasoning)
- **MoE vs Dense:** How do MoE models (gpt-oss-20b) compare to dense models (Qwen-32B) on agentic tasks?
- **Comparative rankings:** Which models are clearly stronger/weaker than Qwen-2.5-Coder-32B?

### 3. Infrastructure Feasibility
- **Memory requirements:** What is the VRAM footprint for each model (FP16, AWQ, GPTQ, MXFP4)?
- **MoE Active Parameters:** For MoE models, what are active vs total parameters? (e.g., gpt-oss-20b = 3.6B active / 21B total)
- **Throughput Estimates:** Tokens/sec on H100 for MoE vs dense models (expect 5-10x difference)
- **vLLM compatibility issues:** Any known bugs or limitations with specific models? (Check vLLM 0.10+ for MXFP4 support)
- **Quantization availability:** Where can we download pre-quantized versions (AWQ/MXFP4 preferred)?
- **Harmony Protocol Support:** Does vLLM expose native reasoning tokens for verification?
- **License restrictions:** Any commercial-use or cloud deployment restrictions?

### 4. Quality Spectrum Validation
- **Clear differentiation:** Can you identify 3-5 models with distinct quality tiers?
- **Benchmark gaps:** Are the HumanEval differences significant enough (>10% between tiers)?
- **Benchmark reliability:** Do the benchmarks correlate with real-world code quality (per literature)?

---

## Deliverable Format (Your Research Report Should Include)

### Section 1: Executive Summary
- **Recommended Models (3-5 total):**
  - Tier 1 (Weak): [Model Name, HumanEval %, Memory (AWQ), License]
  - Tier 2 (Baseline): Qwen-2.5-Coder-32B-Instruct-AWQ (current, HumanEval ~65%)
  - Tier 3 (Strong): [Model Name, HumanEval %, Memory (AWQ), License]
- **Rationale:** Why these models span quality spectrum
- **Risk Assessment:** Any infrastructure compatibility concerns

### Section 2: Model Profiles (Per Candidate)
For each recommended model, provide:
- **Model Name & Hugging Face ID:** (e.g., `Qwen/Qwen2.5-Coder-32B-Instruct-AWQ`)
- **Parameter Count:** (e.g., 32B)
- **Quantization:** (FP16, AWQ, GPTQ)
- **VRAM Requirement:** (e.g., ~21GB for 32B-AWQ)
- **vLLM Compatibility:** ✅ Native / ⚠️ Requires config / ❌ Not supported
- **Benchmark Scores:**
  - HumanEval pass@1: [%]
  - MBPP pass@1: [%]
  - Other relevant benchmarks: [if available]
- **License:** (MIT, Apache 2.0, Llama 2 Community, etc.)
- **Download Source:** (Hugging Face URL)
- **Known Issues:** (Any vLLM bugs, inference quirks, etc.)

### Section 3: Benchmark Comparison Table
| Model | Params (Active) | Quantization | VRAM | HumanEval | MBPP | Codeforces Elo | vLLM Support | License |
|:---|:---|:---|:---|:---|:---|:---|:---|:---|
| [Weak Tier Model] | ... | ... | ... | ... | ... | ... | ... | ... |
| Qwen-2.5-Coder-32B (baseline) | 32B (32B) | AWQ | ~21GB | ~65% | ~70% | ~2300 | ✅ | Apache 2.0 |
| gpt-oss-20b (MoE) | 21B (3.6B) | MXFP4 | ~12-16GB | ~75%+ | TBD | ~2230 | ✅ (0.10+) | Apache 2.0 |
| [Strong Tier Model] | ... | ... | ... | ... | ... | ... | ... | ... |

**Note:** Include "Active Parameters" for MoE models to show throughput advantage (3.6B active = 5-10x faster than 32B dense)

### Section 4: Infrastructure Deployment Notes
- **Loading Commands:** Example vLLM serve commands for each model
- **Expected Inference Speed:** Tokens/sec estimates for H100
- **Quantization Sources:** Where to download AWQ/GPTQ versions
- **Fallback Options:** If primary candidates fail, what are alternatives?

### Section 5: References & Sources
- Links to benchmark leaderboards (HumanEval, MBPP, EvalPlus, etc.)
- Links to vLLM documentation & GitHub issues
- Links to Hugging Face model cards
- Links to research papers (if models have published evaluations)

---

## Critical Success Factors

### What Makes a "Good" Recommendation?
1. **Clear Quality Tiers:** HumanEval scores must differ by ≥10% between tiers
2. **Agentic Capability:** Models must excel at multi-step reasoning (Codeforces Elo, AIME scores)
3. **Throughput Efficiency:** MoE models preferred for 200+ battle experiment (5-10x faster inference)
4. **Proven Compatibility:** Models must have documented vLLM success (community reports, GitHub issues, vLLM 0.10+ support)
5. **Memory Feasibility:** Must fit in 80GB VRAM (provide exact VRAM requirements)
6. **AgentX Alignment:** At least one model should be Berkeley AgentX recommended (gpt-oss-20b)
7. **Benchmark Credibility:** HumanEval/MBPP/Codeforces Elo from reputable sources (official papers, leaderboards)
8. **License Compliance:** Must allow research use on cloud GPUs

### What to Avoid
- API-only models (Claude, GPT-4) — we need self-hosting for fair comparison
- Models with known vLLM compatibility issues (especially for vLLM 0.10+ MXFP4 support)
- Dense models >40B without quantization (won't fit in 80GB VRAM)
- Models optimized for single-shot code generation only (not agentic loops)
- Models with restrictive licenses (non-commercial, research-only)
- Models without agentic benchmarks (Codeforces Elo, AIME) — competition requires reasoning capability
- Models with only informal benchmark claims (need official results)

---

## Attached Documents (Read These Before Research)

**Please review these 4 documents to understand project context. Note:** Gemini 3 Pro will only see the attached files themselves; any links inside those files will not resolve. Treat them as context summaries, not live repository navigation.

1. **[EXPERT-LETTER.md](./EXPERT-LETTER.md)** (569 lines)
   - Purpose: Shows CIS evaluation rubric (R, A, T, L dimensions)
   - Contains: Task descriptions (Email Validator, Rate Limiter, LRU Cache, Fibonacci)
   - Why it matters: Models must be capable of these specific coding tasks

2. **[MASTER-ACTION-ITEM-INDEX.md](./MASTER-ACTION-ITEM-INDEX.md)** (289 lines)
   - Purpose: Shows project status & validation strategy
   - Contains: C-NEW-001 details, expected outcomes, success criteria
   - Why it matters: Explains experimental design and decision gates

3. **[00_CURRENT_TRUTH_SOURCE.md](../../00_CURRENT_TRUTH_SOURCE.md)** (if available)
   - Purpose: Single source of truth for project architecture
   - Contains: CIS formula derivation, Stage 2 results, Stage 3 goals
   - Why it matters: Provides full strategic context

4. **[20251118-Copyright-Edition-Contextual-Debt-Paper.md](../../00-Strategy/IP/20251118-Copyright-Edition-Contextual-Debt-Paper.md)**
   - Purpose: Latest paper version (most recent edition) providing overarching research narrative
   - Why it matters: Aligns model selection with publication-ready framing and prior findings

---

## Research Strategy Suggestions

### Phase 1: Benchmark Discovery (20 websites)
- HumanEval leaderboard (Papers with Code)
- MBPP leaderboard
- EvalPlus leaderboard (HumanEval+)
- LiveCodeBench leaderboard
- Hugging Face Open LLM Leaderboard (code tasks)

### Phase 2: Model Compatibility Research (30 websites)
- vLLM GitHub repository (supported models list)
- vLLM GitHub issues (search for specific model names)
- Hugging Face model cards (check for AWQ/GPTQ versions)
- Reddit r/LocalLLaMA (community deployment reports)
- vLLM Discord / community forums

### Phase 3: Infrastructure Validation (30 websites)
- VRAM calculators (estimate memory usage)
- Quantization benchmarks (AWQ vs GPTQ quality loss)
- H100 inference benchmarks (tokens/sec for various models)
- License verification (read official model licenses)

### Phase 4: Comparative Analysis (20 websites)
- Model comparison articles (DeepSeek vs Qwen vs CodeLlama)
- Research papers (code generation model evaluations)
- Blog posts from AI labs (model release announcements)
- GitHub repositories (community quantization efforts)

---

## Expected Timeline

- **Gemini Deep Research Duration:** 5-15 minutes (autonomous)
- **Report Generation:** 2-5 minutes
- **Josh Review:** 10-15 minutes
- **Decision:** Select 3-5 models for C-NEW-001 experiment
- **Next Step:** Load models into vLLM and run diversity test

---

## Questions for Follow-Up (After Report)

After reading your research report, I (Josh) will need to decide:
1. **Which specific models to test?** (3-5 from your recommendations)
2. **Which quantization to use?** (AWQ preferred, GPTQ fallback)
3. **What order to test?** (Load weak → baseline → strong sequentially)
4. **Any infrastructure changes needed?** (vLLM version upgrade, special configs)

---

**Gemini Deep Research Mode:** Please research autonomously across ~100 websites, prioritize official sources (benchmark leaderboards, model cards, vLLM docs), and synthesize findings into a structured markdown report following the deliverable format above.

**Goal:** Enable Josh to confidently select 3-5 models for C-NEW-001 (Model Diversity Test) that will prove CIS differentiates code quality objectively.

---

**Status:** Ready for Gemini 3 Pro Deep Research submission
**Date Created:** 2026-01-14
**Next Action:** Josh submits this prompt + 3 attached documents to Gemini Deep Research
