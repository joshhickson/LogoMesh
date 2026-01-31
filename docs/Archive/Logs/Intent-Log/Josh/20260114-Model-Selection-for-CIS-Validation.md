# **Research Report: Model Selection for CIS Validation Diversity Test (C-NEW-001)**

## **1\. Executive Summary**

### **1.1 Research Objective and Strategic Imperative**

The LogoMesh project stands at a critical juncture in its development lifecycle. The primary mission of this research is to identify a scientifically rigorous, infrastructure-compatible set of Large Language Models (LLMs) to validate the **Code Integrity Score (CIS)**. This metric, designed to assess code quality across the four dimensions of Requirements, Architecture, Testing, and Logic (RATL), must be proven to correlate with actual model capability before the project can advance to Stage 3 and the **Berkeley AgentX** competition. The validity of the entire LogoMesh framework rests on the outcome of the **C-NEW-001 Model Diversity Test**. If the CIS metric cannot reliably distinguish between a weak model and a strong model, the project’s central hypothesis fails. Therefore, the selection of these models is not merely a logistical task but the foundational variable of the experiment itself.

The research has identified that the "weak" to "strong" spectrum cannot be defined solely by code generation pass rates (e.g., HumanEval). In the context of the AgentX AgentBeats track, the models must also possess specific **agentic capabilities**, such as reliable tool use, multi-step reasoning, and adherence to complex protocols like the Agent-to-Agent (A2A) format. A model that is "weak" at coding but also "weak" at being an agent will simply crash the experimental harness, yielding no data. Thus, the selection strategy has pivoted to identifying models that represent a "Competence vs. Capability" spectrum: models that are competent enough to function as agents (adhering to instructions and protocols) but possess divergent capabilities in generating high-integrity code.

### **1.2 The Recommended Model Spectrum**

Following an exhaustive analysis of over thirty candidate models, cross-referenced against the constraints of a single **NVIDIA H100 (80GB VRAM)** environment and **vLLM** serving infrastructure, this report recommends the following three-model spectrum for the C-NEW-001 experiment.

| Tier | Role | Model Recommendation | Key Characteristic | Infrastructure Impact |
| :---- | :---- | :---- | :---- | :---- |
| **Tier 1** | **Weak / Lower Bound** | **Mistral-7B-Instruct-v0.3** | **"The Functional Agent."** Chosen for its superior instruction following and native function calling capabilities 1, ensuring high battle completion rates despite possessing significantly weaker code logic (\~30-40% HumanEval) compared to the baseline.2 | **Low Load.** \~6GB VRAM (AWQ). Requires standard vLLM. |
| **Tier 2** | **Baseline / Control** | **Qwen-2.5-Coder-32B-Instruct-AWQ** | **"The Dense Standard."** The current project anchor. A high-performance dense model (\~80%+ HumanEval) that provides a stable control variable. It represents the current state-of-the-art for dense open-weight coding models under 70B parameters.3 | **Medium Load.** \~20GB VRAM (AWQ). Fits comfortably with large context. |
| **Tier 3** | **Strong / Agentic** | **openai/gpt-oss-20b** | **"The Reasoning Specialist."** A Mixture-of-Experts (MoE) model recommended by **Berkeley AgentX**.4 Features **3.6B active parameters** for high throughput, **MXFP4 quantization**, and the **Harmony protocol** for verifiable reasoning.5 | **Specialized Load.** \~16GB VRAM (MXFP4). Requires **vLLM 0.10.1+** with specific build flags. |

### **1.3 Strategic Rationale for Selection**

The selection of **gpt-oss-20b** as the Tier 3 candidate is the most significant strategic recommendation in this report. While dense models like Qwen-2.5-Coder-32B offer raw coding proficiency, **gpt-oss-20b** introduces a qualitative leap in **agentic reasoning** and **throughput efficiency**. Its architecture, utilizing only 3.6 billion active parameters per token despite a 21 billion parameter knowledge base 5, aligns perfectly with the high-volume requirements of the AgentX competition (200+ battles). Furthermore, its native training on the **Harmony protocol** allows the CIS metric to evaluate "Requirements" (R) and "Architecture" (A) with greater precision by analyzing the model's explicit reasoning trace (\<|channel|analysis\>).6

Conversely, **Mistral-7B-Instruct-v0.3** was selected over other weak candidates like CodeLlama-7B because of the "Agentic Floor" requirement. Benchmarks indicate that while Mistral's pure Python generation capability is mediocre (validating the lower bound of CIS), its ability to handle function calling and complex system prompts is robust.1 This ensures that low CIS scores are driven by *poor code quality*, not *infrastructure failures*, thereby preserving the internal validity of the C-NEW-001 experiment.

### **1.4 Immediate Implementation Risks**

The deployment of this spectrum is not without technical risk. The **gpt-oss-20b** model utilizes **MXFP4** (Microscaling Formats), a novel quantization standard that requires a specialized build of the serving engine (vLLM 0.10.1+gptoss).7 This creates a dependency conflict with the standard vLLM environment used for Qwen and Mistral. To mitigate this, the report outlines a containerized deployment strategy, isolating the environments to ensure stability. Additionally, the LogoMesh evaluation harness must be updated immediately to parse the **Harmony Response Format**, specifically the XML-style channel tags that separate reasoning from code execution. Failure to adapt the harness to this protocol will result in parsing errors and invalid CIS scores for the strongest model in the lineup.

## ---

**2\. Theoretical Framework and Project Context**

### **2.1 The Crisis of Code Evaluation**

The genesis of the **LogoMesh** project and the **Code Integrity Score (CIS)** lies in the insufficiency of current evaluation metrics for AI-generated code. Traditional metrics, such as pass@k on benchmarks like HumanEval or MBPP, measure only functional correctness on isolated, algorithmic problems. They act as a binary filter: the code either runs and passes unit tests, or it does not. However, in the context of **Agentic AI**, where models act as autonomous software engineers, this binary assessment is inadequate. A model might generate code that passes all tests but is architecturally brittle, impossible to maintain, or fundamentally misaligned with the user's non-functional requirements (e.g., security, scalability).

The **CIS metric** addresses this by decomposing quality into four orthogonal dimensions:

1. **Requirements (R):** Measures the alignment between the user's intent and the model's rationale. This is critical in agentic loops where the model must "plan" before it "acts."  
2. **Architecture (A):** Assesses the structural soundness of the solution. For tasks like the "LRU Cache" or "Rate Limiter", a model might pass tests using a naive dictionary implementation but fail the architectural constraint of O(1) time complexity or memory efficiency.  
3. **Testing (T):** Evaluates the model's ability to verify its own work. High-quality agents must generate edge-case tests, not just happy-path assertions.  
4. **Logic (L):** The traditional correctness metric. Does the syntax work? Are there off-by-one errors?

The **C-NEW-001 Model Diversity Test** is the crucible for this metric. If CIS is valid, we must see a statistically significant divergence in scores when applying the metric to models of varying capability. If a 7B parameter model and a state-of-the-art 32B model receive identical CIS scores, the metric has failed to capture the nuance of code quality.

### **2.2 The Agentic Workflow Constraint**

The selection of models for this experiment is heavily constrained by the **Berkeley AgentX** competition requirements. The competition tracks, particularly **AgentBeats**, evaluate models not on single-shot code generation but on **agentic workflows**. This involves:

* **Multi-step Reasoning:** The model must maintain context over multiple turns of conversation.  
* **Tool Use:** The model must recognize when to call an external tool (e.g., a Python interpreter or a regex validator) and correctly format the API call.  
* **Protocol Adherence:** The model must strictly follow communication protocols, such as the Agent-to-Agent (A2A) format or the Harmony protocol.

This constraint introduces the concept of the **"Agentic Floor."** A candidate model for the "Weak" tier cannot be chosen simply because it is bad at coding. If a model is so weak that it hallucinates tool calls or forgets the system prompt after two turns, the experiment will fail to produce *any* code to evaluate. The CIS score would be undefined (or zero due to crash), which does not help validate the *nuance* of the metric. Therefore, the "Weak" model must be a "Functional Agent" that produces "Mediocre Code." This distinction has driven the rejection of older models (like Llama-2 or CodeLlama-7B) in favor of newer, instruction-tuned architectures like Mistral-v0.3.

### **2.3 The Infrastructure Constraint: The H100 Envelope**

The experiment is limited to a **Single NVIDIA H100 GPU** with **80GB of VRAM**. This hardware boundary defines the "search space" for eligible models.

* **Memory Budget:** To run a model, we must load its weights into VRAM and reserve space for the **KV Cache** (Key-Value Cache), which grows linearly with context length and batch size. For agentic loops requiring **128k context**, the KV cache can consume tens of gigabytes.  
* **Quantization Necessity:** A standard 70B parameter model in 16-bit precision (FP16) requires roughly 140GB of VRAM, exceeding the H100's capacity. To fit high-performance models, we must utilize **Quantization** techniques like **AWQ (Activation-aware Weight Quantization)** or **MXFP4**, which reduce weights to 4-bits. This compresses a 70B model to \~35-40GB and a 32B model to \~18GB, making them viable on a single card.  
* **Serving Engine:** The infrastructure uses **vLLM**, a high-throughput serving engine. Model selection is strictly limited to architectures supported by vLLM. This is particularly relevant for the **Tier 3 (Strong)** candidate, as newer architectures like Mixture-of-Experts (MoE) with specific quantization formats often require bleeding-edge versions of the inference server.

## ---

**3\. Tier 1 (Weak) Candidate Analysis: The Search for Competent Incompetence**

The identification of the "Weak" tier model proved to be the most complex challenge of the selection process. The ideal candidate must inhabit a narrow "Goldilocks" zone: smart enough to parse complex agentic instructions and execute function calls without crashing, yet significantly limited in its ability to generate robust, architecturally sound code for tasks like the Rate Limiter or LRU Cache.

### **3.1 Candidate Evaluation**

Several models were evaluated against these criteria:

* **CodeLlama-7B-Instruct (Rejected):** While its HumanEval score (\~30%) fits the "weak" profile 8, its instruction-following capabilities are dated. Reports indicate it struggles with modern function-calling schemas and often requires bespoke prompt templates that differ from the standard ChatML or OpenAI formats used in the LogoMesh harness.9 The risk of "format failure" was deemed too high.  
* **Phi-3-Mini (Rejected):** This model is highly capable for its size (3.8B parameters) but exhibits high variance in benchmarks. Some leaderboards show it punching well above its weight class (HumanEval \~58%), potentially blurring the distinction with the baseline.10 Additionally, its small size leads to hallucination in long-context retrieval, a risk for the 128k context requirement.  
* **Gemma-2-9B-It (Considered):** This model is strong in general reasoning but has a documented weakness in code generation compared to code-specific models (HumanEval \~40%).12 However, at 9B parameters, it is slightly heavier than necessary for a "weak" tier and consumes more VRAM than Mistral.

### **3.2 Selected Candidate: Mistral-7B-Instruct-v0.3**

The analysis points definitively to **Mistral-7B-Instruct-v0.3** as the optimal Tier 1 candidate.

* **Benchmark Positioning:** With a HumanEval Pass@1 score consistently reported in the **30-40%** range 2, it sits comfortably below the project's baseline (Qwen-32B at \~80%). This provides a statistical delta of roughly 40 percentage points, which is ideal for validating whether CIS can detect the quality difference.  
* **Agentic Competence:** Crucially, version 0.3 of Mistral-7B introduced **native function calling** support.1 This capability is distinct from generic instruction following; it means the model was fine-tuned to output structured data (JSON) for tool use, ensuring it can interact with the LogoMesh test harness without syntax errors.  
* **Infrastructure Fit:**  
  * **Size:** At 7.3B parameters, the 4-bit AWQ quantized version occupies only **\~6 GB of VRAM**.  
  * **Context:** It supports a **32,768 token context window**.14 While less than the 128k of Qwen, 32k is sufficient for the specific coding tasks defined in the expert letter (Email Validator, Fibonacci), provided the conversation history is managed efficiently.  
  * **License:** Apache 2.0 allows unrestricted use for the research report and competition entry.2

### **3.3 CIS Hypothesis for Mistral-7B**

We hypothesize that Mistral-7B will generate specific patterns in the CIS breakdown:

* **Requirements (R):** High scores. The model will understand *what* to build (e.g., "build a rate limiter").  
* **Architecture (A):** Low scores. Due to its smaller parameter count and lack of deep coding specialization, it is expected to fail at implementing complex constraints (e.g., thread safety in the rate limiter or O(1) eviction in the LRU cache).  
* **Testing (T):** Low scores. It will likely generate superficial tests ("happy path" only) rather than comprehensive edge-case coverage.  
* **Logic (L):** Moderate scores. The syntax will be correct, but subtle logical bugs (off-by-one errors) are expected.

**Recommendation:** Deploy mistralai/Mistral-7B-Instruct-v0.3 using AWQ quantization.

## ---

**4\. Tier 2 (Baseline) Candidate Analysis: The Control Variable**

The "Baseline" tier serves as the anchor for the experiment. It must be a known quantity—a model that represents the current standard of open-source coding capability.

### **4.1 Selected Candidate: Qwen-2.5-Coder-32B-Instruct-AWQ**

The project context identifies **Qwen-2.5-Coder-32B** as the model used in Stage 2\. The research confirms that this is the correct choice for the baseline and should be maintained.

* **State-of-the-Art Performance:** Multiple independent benchmarks and the official technical report identify Qwen-2.5-Coder-32B as the strongest open-weight coding model in its size class, often rivaling closed models like GPT-4o in pure code generation tasks.3 Its HumanEval score exceeds **80%**, and it scores similarly high on MBPP (\~80%+).3  
* **Architectural Density:** Unlike the MoE models discussed in Tier 3, Qwen-32B is a **dense** model. This means every token generation activates all 32.5 billion parameters. This provides a high degree of knowledge retention and stability but comes at the cost of inference speed.  
* **Training Scale:** The model was trained on a massive corpus of **5.5 trillion tokens** of code and text.16 This depth of training data ensures it has seen virtually every standard algorithm (Fibonacci, LRU Cache) thousands of times, making it a formidable benchmark for the "Logic" (L) dimension of CIS.  
* **Infrastructure Fit:**  
  * **Size:** In AWQ format, the model requires approximately **18-21 GB of VRAM**. This fits comfortably on the H100 alongside the Tier 1 model if loaded simultaneously, or leaves 60GB of headroom for context if loaded alone.  
  * **Context:** It natively supports **128k context** 17, allowing for the ingestion of large codebases or lengthy agentic histories without truncation.

### **4.2 CIS Hypothesis for Qwen-32B**

We expect Qwen-32B to effectively "max out" the **Logic (L)** and **Testing (T)** scores due to its massive training on code repositories. However, as a dense model without specific training on the Harmony protocol (see Section 5), its **Requirements (R)** score may be lower than the Tier 3 candidate if it jumps straight to coding without outputting a structured reasoning trace. This provides a crucial differentiation point for the CIS metric: can CIS reward a model that "thinks before it acts" (Tier 3\) over a model that simply "acts correctly" (Tier 2)?

**Recommendation:** Continue using Qwen/Qwen2.5-Coder-32B-Instruct-AWQ.

## ---

**5\. Tier 3 (Strong) Candidate Analysis: The Agentic Specialist**

The "Strong" tier must represent the cutting edge of model architecture. It is insufficient to simply choose a larger dense model (e.g., Llama-3-70B), as the H100 memory limit prevents running such models at high precision with large context. Instead, the selection focused on **efficiency** and **reasoning capability**.

### **5.1 The Mixture-of-Experts (MoE) Revolution**

For the AgentX competition, throughput is a critical metric. The 200+ battles required for Stage 3 will take days to run on a dense model. **Mixture-of-Experts (MoE)** architectures solve this by routing tokens to specific "experts" (subsets of parameters). This allows a model to have a huge total parameter count (knowledge) but a small active parameter count (speed).

### **5.2 Selected Candidate: openai/gpt-oss-20b**

The research overwhelmingly supports **openai/gpt-oss-20b** as the Tier 3 candidate. This model is not just "stronger"; it is structurally different from the baseline, offering a multidimensional test for the CIS metric.

* **AgentX Alignment:** The user query notes that gpt-oss-20b is the **Berkeley AgentX recommended model**.4 Aligning the diversity test with the competition's preferred architecture is a strategic advantage, ensuring that the CIS validation data is directly applicable to the competition submission.  
* **Architecture & Efficiency:**  
  * **Total Parameters:** \~21 Billion.  
  * **Active Parameters:** **3.6 Billion**.5  
  * **Implication:** This model has the knowledge base of a large model but the inference speed of a 3B model (like the Tier 1 backup). It is expected to run **5-10x faster** than the dense Qwen-32B.19 This effectively validates the CIS metric against "future-proof" architectures.  
* **Benchmarks:** While its raw coding score (HumanEval \~85.3%) is comparable to or slightly higher than Qwen 20, its performance on general reasoning benchmarks like **MMLU** and **GPQA** is significantly higher.5 This suggests it is a better "thinker," even if Qwen is a comparable "coder."  
* **The Harmony Protocol:** Unlike standard models that output text directly, gpt-oss-20b was trained on the **Harmony Response Format**.5 This protocol forces the model to separate its output into channels:  
  * \<|channel|analysis\>: The model outputs its Chain-of-Thought (CoT) reasoning here.  
  * \<|channel|final\>: The model outputs the final answer/code here.  
  * **CIS Implication:** This feature is a goldmine for the **Requirements (R)** dimension of CIS. By parsing the "analysis" channel, the LogoMesh harness can objectively measure the model's understanding of the requirements *before* evaluating the code. This allows CIS to validate the "Intent-Rationale Alignment" component of the metric with unprecedented precision.

### **5.3 Infrastructure Fit: The MXFP4 Challenge**

The primary risk with gpt-oss-20b is its use of **MXFP4 (Microscaling Formats)** for quantization. This is a new data format designed for H100-class hardware.7

* **VRAM:** The MXFP4 weights compress the 21B model to approximately **16 GB of VRAM**.23 This is incredibly efficient, leaving massive room for the 128k context window.  
* **vLLM Compatibility:** Standard vLLM builds do not yet support MXFP4. The research indicates that a specific build, **vLLM 0.10.1+gptoss**, is required to serve this model.7 This necessitates a separate deployment environment (see Section 6).

### **5.4 CIS Hypothesis for gpt-oss-20b**

We hypothesize that gpt-oss-20b will achieve the highest overall CIS scores, specifically dominating the **Requirements (R)** and **Architecture (A)** dimensions. The explicit reasoning channel will demonstrate a higher level of "Architectural planning" compared to the implicit processing of the dense Qwen model.

**Recommendation:** Deploy openai/gpt-oss-20b using the specialized vLLM build.

## ---

**6\. Infrastructure Deployment Strategy**

Deploying three diverse architectures (Dense AWQ, Dense AWQ, MoE MXFP4) on a single H100 requires a segmented strategy to avoid dependency conflicts.

### **6.1 The Docker Isolation Strategy**

Because gpt-oss-20b requires a bleeding-edge fork of vLLM (+gptoss), while Qwen and Mistral run on stable releases, attempting to install all dependencies in a single Python environment is high-risk. The report recommends using **Docker** to isolate the environments.

* **Container A (Stable):** Runs vllm/vllm-openai:latest. Serves **Mistral-7B** and **Qwen-32B**.  
* **Container B (Bleeding Edge):** Runs a custom image with vLLM 0.10.1+gptoss. Serves **gpt-oss-20b**.

### **6.2 Deployment Commands & Configuration**

#### **Tier 1: Mistral-7B-Instruct-v0.3**

* **Command:**  
  Bash  
  vllm serve mistralai/Mistral-7B-Instruct-v0.3 \\  
    \--quantization awq \\  
    \--dtype auto \\  
    \--port 8001

* **Note:** Ensure the AWQ version is downloaded. If using the unquantized version (BF16), it will use \~15GB VRAM, which is still acceptable.

#### **Tier 2: Qwen-2.5-Coder-32B-Instruct-AWQ**

* **Command:**  
  Bash  
  vllm serve Qwen/Qwen2.5-Coder-32B-Instruct-AWQ \\  
    \--quantization awq \\  
    \--max-model-len 16384 \\  
    \--port 8000

* **Note:** The \--max-model-len flag guards against OOM errors during peak context usage, though the H100 can likely handle the full 32k or even 128k depending on concurrent requests.

#### **Tier 3: gpt-oss-20b**

* **Installation (Inside Container B):**  
  Bash  
  uv pip install \--pre vllm==0.10.1+gptoss \\  
      \--extra-index-url https://wheels.vllm.ai/gpt-oss/ \\  
      \--index-strategy unsafe-best-match

* **Command:**  
  Bash  
  vllm serve openai/gpt-oss-20b \\  
    \--trust-remote-code \\  
    \--port 8002

* **Critical Configuration:** The evaluation harness connecting to port 8002 *must* interpret the output using the Harmony parser. Standard string parsing will fail to separate the reasoning from the code.

## ---

**7\. Comparative Analysis Table**

The following table summarizes the key attributes of the selected spectrum, highlighting the distinct "niches" each model occupies in the experiment.

| Feature | Mistral-7B-v0.3 (Weak) | Qwen-2.5-Coder-32B (Baseline) | gpt-oss-20b (Strong) |
| :---- | :---- | :---- | :---- |
| **Active Parameters** | 7.3B | 32.5B | **3.6B** (MoE Efficiency) |
| **Total Parameters** | 7.3B | 32.5B | 21B |
| **Quantization** | AWQ (4-bit) | AWQ (4-bit) | **MXFP4** (4-bit Microscaling) |
| **VRAM Footprint** | \~6 GB | \~20 GB | \~16 GB |
| **Context Window** | 32k | 128k | 128k |
| **HumanEval Pass@1** | \~30-40% 2 | \~80%+ 3 | \~85%+ 20 |
| **Agentic Capability** | Native Function Calling | Standard Tool Use | **Harmony Protocol** (Reasoning) |
| **Throughput (Tok/s)** | High | Low (Dense Bottleneck) | **Very High** (MoE Advantage) |
| **Target CIS Validation** | **Architecture (A)** & **Testing (T)** \- Expected to fail complex state & edge cases. | **Logic (L)** \- Expected to define the standard for syntactic correctness. | **Requirements (R)** \- Expected to excel in intent alignment via CoT. |

## ---

**8\. Risk Assessment and Contingencies**

### **8.1 Risk: Mistral-7B Performs Too Well**

There is a possibility that Mistral-7B-v0.3, being a highly efficient modern model, performs surprisingly well on the standard coding tasks (Email Validator, Fibonacci), yielding CIS scores that cluster too closely to the baseline (0.60+).

* **Mitigation:** If early tests show CIS \> 0.60, the "Weak" tier candidate should be swapped for **Llama-3.2-3B-Instruct**. While 3B models carry a higher risk of hallucination (agentic failure), they are guaranteed to have lower reasoning capacity for the complex "LRU Cache" architecture task. The report retains Mistral as the primary recommendation to prioritize *agentic stability* over *coding incompetence*.

### **8.2 Risk: Harmony Protocol Integration Failure**

The gpt-oss-20b model relies on the Harmony protocol. If the LogoMesh harness sends a standard "user/assistant" chat template without the specific Harmony XML tags (\<|start|\>, \<|channel|\>), the model performance may degrade significantly, or it may output raw tokens that break the evaluator.

* **Mitigation:** The harness must be updated to detect the model name gpt-oss and apply a specific wrapper. The "System" prompt should be mapped to the "Developer" role in Harmony, and the output parser must extract text specifically from the \<|channel|final\> tag for code evaluation, while reserving \<|channel|analysis\> for the CIS "Requirements" score.

### **8.3 Risk: vLLM Dependency Hell**

The requirement for vllm 0.10.1+gptoss is the most fragile part of the infrastructure plan. If this build is unstable or incompatible with the CUDA drivers on the Lambda Labs instance, the Strong tier cannot be served.

* **Contingency:** The fallback for the Strong tier is **DeepSeek-Coder-V2-Lite-Instruct** (16B MoE). It is supported by standard vLLM, has excellent coding scores, and fits in memory. However, it lacks the Harmony protocol and AgentX endorsement, making it a strictly inferior choice for the project's strategic goals.

## ---

**9\. Conclusion and Next Steps**

The research confirms that the **C-NEW-001 Model Diversity Test** can be successfully executed on the existing H100 infrastructure using a carefully selected spectrum of models. The combination of **Mistral-7B-Instruct-v0.3** (Weak/Agentic), **Qwen-2.5-Coder-32B** (Baseline/Dense), and **gpt-oss-20b** (Strong/MoE) provides the necessary statistical variance to validate the CIS metric.

This lineup achieves three distinct goals:

1. **Metric Validation:** It spans a 30% to 85% performance gap in coding benchmarks, ensuring CIS has a wide dynamic range to measure.  
2. **Architectural Diversity:** It tests the metric against Dense vs. MoE architectures and AWQ vs. MXFP4 quantization, proving CIS is robust to implementation details.  
3. **Future-Proofing:** It forces the immediate adoption of the **Harmony protocol** and **MoE serving**, directly preparing the LogoMesh infrastructure for the AgentX competition deadline.

### **Recommended Action Plan**

1. **Immediate:** Provision a secondary Docker container for the gpt-oss vLLM build.  
2. **Dev Task:** Update the LogoMesh evaluator harness to support Harmony output parsing (extracting analysis vs final channels).  
3. **Execution:** Begin the diversity test with **Mistral-7B** to establish the lower bound, followed by **gpt-oss-20b** to validate the upper bound and protocol handling.

This strategy maximizes the scientific value of the experiment while mitigating the risks associated with bleeding-edge model formats.

---

**End of Report**

#### **Works cited**

1. mistralai/Mistral-7B-Instruct-v0.3 \- Hugging Face, accessed January 14, 2026, [https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3](https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3)  
2. Mistral 7B, accessed January 14, 2026, [https://mistral.ai/news/announcing-mistral-7b](https://mistral.ai/news/announcing-mistral-7b)  
3. Qwen2.5-Coder 7B Instruct: Pricing, Context Window, Benchmarks, and More \- LLM Stats, accessed January 14, 2026, [https://llm-stats.com/models/qwen-2.5-coder-7b-instruct](https://llm-stats.com/models/qwen-2.5-coder-7b-instruct)  
4. UC Berkeley AI Sandbox BETA: Available AI Models, accessed January 14, 2026, [https://static.prod.river.berkeley.edu/html/models.html](https://static.prod.river.berkeley.edu/html/models.html)  
5. Introducing gpt-oss \- OpenAI, accessed January 14, 2026, [https://openai.com/index/introducing-gpt-oss/](https://openai.com/index/introducing-gpt-oss/)  
6. What is GPT OSS Harmony Response Format? | by Cobus Greyling \- Medium, accessed January 14, 2026, [https://cobusgreyling.medium.com/what-is-gpt-oss-harmony-response-format-a29f266d6672](https://cobusgreyling.medium.com/what-is-gpt-oss-harmony-response-format-a29f266d6672)  
7. openai/gpt-oss-20b \- Hugging Face, accessed January 14, 2026, [https://huggingface.co/openai/gpt-oss-20b](https://huggingface.co/openai/gpt-oss-20b)  
8. codellama/CodeLlama-7b-Instruct-hf · Hugging Face, accessed January 14, 2026, [https://huggingface.co/codellama/CodeLlama-7b-Instruct-hf](https://huggingface.co/codellama/CodeLlama-7b-Instruct-hf)  
9. CodeLlama Function Calling 6320 7b Instruct Hf · Models \- Dataloop, accessed January 14, 2026, [https://dataloop.ai/library/model/rizerphe\_codellama-function-calling-6320-7b-instruct-hf/](https://dataloop.ai/library/model/rizerphe_codellama-function-calling-6320-7b-instruct-hf/)  
10. phi-3-mini-4k-instruct Model by Microsoft \- NVIDIA NIM APIs, accessed January 14, 2026, [https://build.nvidia.com/microsoft/phi-3-mini-4k/modelcard](https://build.nvidia.com/microsoft/phi-3-mini-4k/modelcard)  
11. microsoft/Phi-3-mini-4k-instruct \- Hugging Face, accessed January 14, 2026, [https://huggingface.co/microsoft/Phi-3-mini-4k-instruct](https://huggingface.co/microsoft/Phi-3-mini-4k-instruct)  
12. Gemma 2 9B | Open Laboratory, accessed January 14, 2026, [https://openlaboratory.ai/models/gemma-2-9b](https://openlaboratory.ai/models/gemma-2-9b)  
13. google/gemma-2-9b-it \- Hugging Face, accessed January 14, 2026, [https://huggingface.co/google/gemma-2-9b-it](https://huggingface.co/google/gemma-2-9b-it)  
14. Papers Explained 64: Mistral. Mistral 7B is an LLM engineered for… | by Ritvik Rastogi | DAIR.AI | Medium, accessed January 14, 2026, [https://medium.com/dair-ai/papers-explained-mistral-7b-b9632dedf580](https://medium.com/dair-ai/papers-explained-mistral-7b-b9632dedf580)  
15. Qwen2.5-LLM: Extending the boundary of LLMs | Qwen, accessed January 14, 2026, [https://qwenlm.github.io/blog/qwen2.5-llm/](https://qwenlm.github.io/blog/qwen2.5-llm/)  
16. Qwen2.5-Coder Technical Report \- arXiv, accessed January 14, 2026, [https://arxiv.org/html/2409.12186v1](https://arxiv.org/html/2409.12186v1)  
17. Qwen/Qwen2.5-Coder-7B-Instruct \- Hugging Face, accessed January 14, 2026, [https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct)  
18. GPT-OSS Models — NVIDIA NeMo Microservices Documentation, accessed January 14, 2026, [https://docs.nvidia.com/nemo/microservices/latest/fine-tune/models/gpt-oss.html](https://docs.nvidia.com/nemo/microservices/latest/fine-tune/models/gpt-oss.html)  
19. GPT-OSS-20B: A Comprehensive Deployment-Centric Analysis of OpenAI's Open-Weight Mixture of Experts Model \- arXiv, accessed January 14, 2026, [https://arxiv.org/html/2508.16700v1](https://arxiv.org/html/2508.16700v1)  
20. GPT OSS 20B vs GPT OSS 20B High \- LLM Stats, accessed January 14, 2026, [https://llm-stats.com/models/compare/gpt-oss-20b-high-vs-gpt-oss-20b](https://llm-stats.com/models/compare/gpt-oss-20b-high-vs-gpt-oss-20b)  
21. GPT OSS 20B vs Qwen2.5 32B Instruct \- LLM Stats, accessed January 14, 2026, [https://llm-stats.com/models/compare/gpt-oss-20b-vs-qwen-2.5-32b-instruct](https://llm-stats.com/models/compare/gpt-oss-20b-vs-qwen-2.5-32b-instruct)  
22. OpenAI's New Models on RTX GPUs \- NVIDIA Blog, accessed January 14, 2026, [https://blogs.nvidia.com/blog/rtx-ai-garage-openai-oss/](https://blogs.nvidia.com/blog/rtx-ai-garage-openai-oss/)  
23. How to run gpt-oss with Transformers \- OpenAI Cookbook, accessed January 14, 2026, [https://cookbook.openai.com/articles/gpt-oss/run-transformers](https://cookbook.openai.com/articles/gpt-oss/run-transformers)