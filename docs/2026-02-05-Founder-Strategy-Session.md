# Founder Strategy Session — February 5, 2026

Session between Oleksander and Claude. Covers market research, product direction, competition analysis, team dynamics, and next steps.

---

## 1. Market Research Summary

### Market Size
- AI Code Tools market: $4.86B (2023) → $26.03B (2030), 27.1% CAGR
- Strong demand for AI code quality tools
- Gap exists: lots of tools check if code "looks good" (LLM vibes), few actually run and test it

### Competition Landscape
Existing players (CodeRabbit, Codacy, Snyk, SonarQube) mostly do static analysis or LLM-based review. None do:
- Actual sandbox execution with ground-truth test results
- Adversarial MCTS-based attacks
- Self-improving evaluation via UCB1 bandit

**LogoMesh's actual moat:** We run the code. Everyone else just reads it.

---

## 2. Product Direction Recommendation

### Recommended: GitHub PR App (Phase 1)

| Factor | GitHub PR App | CLI | VS Code Extension |
|--------|--------------|-----|-------------------|
| Fits our tech | Perfect — PR review can wait 30-60s | Okay — devs expect instant | Bad — too slow for real-time |
| Distribution | One-click install | Hard — CLI fatigue | Medium |
| Monetization | Easy — per-seat SaaS | Hard — OSS expectation | Medium |
| Virality | High — badges visible | None | None |

**Why PR App wins:** Our tech is slow by design (Docker sandbox, MCTS attacks). That's annoying for a CLI but perfect for PR checks where devs already wait for CI.

### Proposed Pricing
- Free: Public repos
- Pro: $29/seat/month for private repos
- Enterprise: Custom

### Phase Roadmap
1. **Phase 1 (0-3 months):** GitHub PR App MVP
2. **Phase 2 (3-6 months):** CLI for local deep scans
3. **Phase 3 (6+ months):** VS Code extension (only if traction)

---

## 3. Josh's Role (Team Dynamics)

### The Split
- **Josh (CEO/Business):** Customers, sales, marketing, partnerships, demo video, pitch deck, talking to people, figuring out what market wants
- **Oleksander (CTO/Technical):** Architecture, code decisions, what we build and how

### The Process
Josh brings customer problems, not solutions. The flow should be:
1. Josh talks to customers/devs
2. Josh brings back "5 people told me X is painful"
3. We figure out solution together
4. Oleksander decides how to build it

**Not:** "Gemini said CLI is the move so we're doing CLI"

### Josh's Valid Points
He raised two legitimate technical concerns that need answers:
1. **Cloud TOS:** OpenAI/Anthropic prohibit "red teaming" — does our MCTS Red Agent violate this? May need self-hosted models.
2. **CodeRabbit moat:** If they can just add sandbox execution, what stops them? Need clear answer.

---

## 4. AgentBeats Competition Analysis

### Multi-Agent Category: 20 Agents Total

**Top Competitors Identified:**

| Agent | What It Does | Strength |
|-------|-------------|----------|
| **CAR-bench** | Automotive voice assistant eval, 254 tasks, epistemic reliability | Published paper, clear "when to refuse" angle |
| **CRMArena+** | Enterprise CRM tasks, Salesforce backing | NAACL 2025, corporate credibility |
| **LogoMesh** | AI code quality, ground-truth scoring, MCTS Red Agent | Most technically sophisticated, self-improving |

### LogoMesh Technical Depth (After Code Review)

Features nobody else has:
- MCTS Red Agent with Tree of Thoughts + UCB1
- Dynamic tool creation at runtime (AGI-level)
- UCB1 Strategy Evolver (self-improving)
- Battle Memory (cross-run learning)
- Ground-truth scoring (sandbox drives scores, LLM bounded ±0.10)
- Intent mismatch detection
- Prompt injection hardening

### Probability Assessment

| Outcome | Probability | Reasoning |
|---------|-------------|-----------|
| **Top 3** | 60-70% | Strong tech, good form answers, working code |
| **Win** | 25-35% | Possible if judges dig into code depth |
| **Nothing** | 10-15% | Too much substance to ignore |

### Submission Strengths
- Form answers: Concrete numbers (0.825 Fibonacci, 0.19 factorial-for-LRU, 0.356 ERC-20)
- Calibration: 10+ runs, variance < 0.05
- Video: "Agent cheated its own tests" moment is memorable
- Code: 4000+ lines, well-documented, actually works
- arXiv paper: Academic credibility

### Submission Weaknesses
- Video opens too academic ("contextual debt, a failure of the why")
- Video is outdated (mentions Red Agent V2, code is V3/V4 with MCTS)
- Self-improvement features (UCB1, memory) never mentioned in video

---

## 5. Immediate Action Items

### For Oleksander

**Priority 1: Learn the codebase**
- Week 1: Read `server.py`, draw the pipeline flowchart
- Week 2: Read `scoring.py`, understand CIS formula without asking Claude
- Week 3: Read `orchestrator.py`, understand MCTS/UCB1
- Week 4: Read `memory.py` and `strategy_evolver.py`

Rule: Every time you want to ask Claude "what does this do" — read the code first, form your own answer, THEN verify.

**Priority 2: Talk to real users**
- Find 5-10 developers who use Copilot/Cursor daily
- Ask: "When AI writes code for you, how do you know it's actually good?"
- Shut up and listen. Write down responses word for word.
- Post in r/ExperiencedDevs, DevTwitter, or DM people

**Priority 3: Answer Josh's challenges**
- Research actual OpenAI/Anthropic TOS on red teaming
- Sign up for CodeRabbit, run it on a repo, document gaps vs LogoMesh

### For Josh
- Customer discovery calls (not Gemini research)
- Landing page setup for email capture
- Prepare announcement drafts for both competition outcomes
- Demo video improvements (if time before judging)

### What NOT to Do
- Don't build new features yet
- Don't start GitHub App or CLI without user evidence
- Don't let Josh vibe technical direction with AI
- Don't ask Claude for more market research

---

## 6. Response to Josh (Draft)

```
yo i read through ur docs. the TOS point about cloud APIs and red teaming is legit — we need to figure that out before we commit to github app or anything. probably self-hosted models for the MCTS attack loop or careful prompt framing. the coderabbit moat question is also real, our actual edge is sandbox execution + adversarial attacks not just static review. lemme dig deeper into both and ill come back with specifics. lets also wait and see how we do in agentbeats before we commit to a product direction
```

---

## 7. Key Quotes to Remember

**The pitch (simple version):**
> "We don't ask if code looks good. We run it, attack it, and learn from every battle."

**The irony:**
> You are literally living your own paper's thesis. Your paper defines "comprehension debt" as what happens when someone accepts AI-generated code without building the mental model. That's you right now with your own product.

**On the competition:**
> You're not the underdog. You have genuinely superior technical depth. The question is whether judges have time to see it.

---

*Last updated: 2026-02-05*