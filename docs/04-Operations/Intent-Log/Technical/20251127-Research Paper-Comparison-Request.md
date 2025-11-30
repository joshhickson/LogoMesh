# **Advancements in Automated Software Traceability and Program Comprehension: A Comprehensive Comparative Analysis of Information Retrieval, Deep Learning, and Semantic Evaluation Methodologies**

## **Executive Summary**

The discipline of software engineering is currently navigating a profound transformation in how it manages the lifecycle of software artifacts. Central to this transformation is the challenge of the "semantic gap"—the disconnect between the high-level intent expressed in requirements documentation and the low-level implementation details found in source code. This report presents an exhaustive comparative analysis of the seminal and state-of-the-art research aimed at bridging this gap through Automated Traceability Link Recovery (TLR) and Program Comprehension.

The analysis synthesizes findings from over two decades of research, tracing the trajectory from the **Information Retrieval (IR) Era**—characterized by the foundational works of Antoniol et al. (2002) and Marcus and Maletic (2003) using Vector Space Models (VSM) and Latent Semantic Indexing (LSI)—to the **Deep Learning (DL) & Semantic Era**, exemplified by Guo et al. (2018) and Haque et al. (2022). We explore how the field has moved from syntactic surface matching to deep semantic understanding using Word Embeddings, Recurrent Neural Networks (RNNs), and Transformer-based architectures.

Furthermore, we integrate the emerging theoretical framework of **"Contextual Debt"**—a systemic form of technical debt where the loss of semantic linkage between artifacts leads to organizational amnesia and "idiotic" code generation by AI agents. This analysis reveals that while early IR methods provided a low-cost baseline for traceability, they were fundamentally limited by the "vocabulary mismatch problem." Modern deep learning approaches, specifically Bidirectional Gated Recurrent Units (BI-GRU) and Transformer-based models, have significantly outperformed these baselines by learning context and semantics rather than relying on exact lexical overlap. However, the evaluation of these semantic systems remains a critical challenge, as traditional n-gram metrics (like BLEU) fail to capture the true semantic validity of generated links or code summaries, necessitating a shift toward embedding-based evaluation metrics like BERTScore.

---

## **1\. The Traceability Imperative in Modern Software Engineering**

### **1.1 The Complexity Crisis and the Need for Linkage**

Software development is fundamentally an exercise in translation. It involves translating vague human needs into precise requirements, requirements into architectural designs, designs into code, and code into executable machine instructions. In small-scale projects, this translation chain is maintained in the heads of a few developers. However, as systems scale to millions of lines of code and involve distributed teams, this mental model fractures. The result is a sprawling repository of disconnected artifacts: requirements documents in Word or DOORS, design diagrams in Visio or Enterprise Architect, source code in Git, and test cases in Selenium or JUnit.

**Traceability** is the discipline of creating and maintaining associations between these artifacts. It is defined as the ability to describe and follow the life of a requirement in both a forward and backward direction (i.e., from its origins, through its development and specification, to its subsequent deployment and use, and through periods of ongoing refinement and iteration).1

The necessity of traceability is driven by two primary forces:

1. **Change Management:** When a requirement changes, which classes need to be modified? Conversely, if a bug is found in a specific class, which requirements are impacted? Without traceability, answering these questions requires expensive manual analysis, often referred to as impact analysis.  
2. **Compliance and Safety:** In safety-critical domains such as avionics (DO-178C), automotive (ISO 26262), and medical devices (FDA Title 21 CFR Part 11), traceability is not optional; it is a regulatory mandate. Certifying bodies require proof that every line of code traces back to a requirement (no "gold plating") and every requirement is implemented in code (completeness).1

### **1.2 The Traceability Decay Problem**

Despite its importance, traceability is rarely maintained effectively in practice. The primary reason is cost. Manually creating links between thousands of requirements and tens of thousands of classes is prohibitively expensive and tedious. Furthermore, even if links are created during the initial development phase, they suffer from **Traceability Decay**.4

As developers refactor code, split classes, or rename methods, the static traceability links stored in a separate matrix become obsolete. The documentation and the code drift apart, creating a "synchronization gap." This phenomenon forces developers to rely on keyword searches or memory to navigate the system, leading to errors and inefficiencies. The research papers analyzed in this report all share a common goal: to automate the creation and maintenance of these links to prevent decay and reduce the cost of compliance.

### **1.3 Theoretical Framework: The Emergence of Contextual Debt**

A critical insight emerging from the intersection of software engineering and organizational psychology is the concept of **Contextual Debt**. While "Technical Debt" is a well-understood metaphor describing the implied cost of additional rework caused by choosing an easy solution now instead of a better approach that would take longer, Contextual Debt is more insidious. It refers to the cumulative loss of *meaning* and *intent* surrounding the software artifacts.5

The literature suggests that Contextual Debt accumulates when the "why" behind the code is lost. When an AI assistant or a new human developer looks at a piece of legacy code without access to the original requirements or design rationale, they are operating in a deficit of context. They can see *what* the code does (syntax), but not *why* it does it (semantics). This deficit leads to several critical failures:

* **Implicit Assumptions:** Decisions are made based on general programming knowledge rather than domain-specific constraints. For example, an AI might optimize a loop for speed, unaware of a requirement that mandates constant-time execution to prevent timing attacks.5  
* **Systemic Drift:** The codebase gradually drifts away from the actual business requirements. The "Contextual Debt" concept highlights that this is not just a code quality issue but a failure of organizational memory.7  
* **Organizational Amnesia:** When the original authors leave, the "memory" of the system is shattered across disconnected tools. The loss of traceability links represents the severance of the neural pathways of the organization's collective brain.7

Automated Traceability Link Recovery (TLR) is the primary engineering solution to mitigate Contextual Debt. By automatically reconstructing the links between requirements (intent) and source code (implementation), TLR tools attempt to restore the "organizational memory" that prevents Contextual Debt from compounding.

---

## **2\. The Information Retrieval Paradigm (2002–2010): Establishing the Baseline**

The early 2000s marked the genesis of automated traceability research. The prevailing hypothesis was that software artifacts could be treated essentially as text documents, and therefore, standard Information Retrieval (IR) techniques used by search engines could be adapted to find links between them. This era focused on statistical methods to measure the similarity between the vocabulary used in documentation and the vocabulary used in source code.

### **2.1 The Vector Space Model (VSM)**

The foundational work in this era is represented by the research of Antoniol et al. (2002) in "Recovery of Traceability Links between Software Documentation and Source Code".8 This work established the **Vector Space Model (VSM)** as the baseline for the field.

#### **2.1.1 Mechanics of VSM**

In the VSM approach, the collection of software artifacts is treated as a corpus of documents. The unique words across all artifacts form the vocabulary. Each artifact (e.g., a requirement text or a source code file) is represented as a vector in a high-dimensional space, where the number of dimensions equals the size of the vocabulary.

The magnitude of each component in the vector is not merely a count of the word's appearance (Term Frequency or TF) but is weighted by the Inverse Document Frequency (IDF). The IDF weight penalizes common words (like "the", "class", "void") that appear in many documents and thus have little discriminatory power. The weight $w\_{i,j}$ of term $i$ in document $j$ is calculated as:

$$w\_{i,j} \= tf\_{i,j} \\times \\log\\left(\\frac{N}{df\_i}\\right)$$

where $N$ is the total number of documents and $df\_i$ is the number of documents containing term $i$.  
The similarity between a source artifact vector ($d\_1$) and a target artifact vector ($d\_2$) is calculated using the Cosine Similarity, which measures the cosine of the angle between the two vectors:

$$\\text{sim}(d\_1, d\_2) \= \\frac{d\_1 \\cdot d\_2}{\\|d\_1\\| \\|d\_2\\|}$$

A value of 1 indicates the vectors are identical (perfect alignment), while 0 indicates they are orthogonal (no shared vocabulary).10

#### **2.1.2 Limitations and The Vocabulary Mismatch**

While VSM provided a "low cost, highly flexible" method that required no complex parsing of the source code grammar 11, it suffered severely from the **Vocabulary Mismatch Problem**. Developers often use different terminology than requirements engineers.

* **Synonymy:** If a requirement uses the word "modify" and the code uses the function name update(), VSM assigns a similarity of zero for that term, failing to detect the link.  
* **Polysemy:** If the word "window" is used in the GUI context in requirements but refers to a time window or a sliding buffer in the code logic, VSM falsely assumes a high similarity, leading to false positives.8

Antoniol et al.'s experiments on the **Albergate** and **LEDA** datasets showed that while VSM could recover links, it required significant manual effort to filter through false positives. The method relied entirely on the assumption that programmers would use meaningful identifiers that matched the documentation—a precarious assumption in legacy or outsourced projects.13

### **2.2 Latent Semantic Indexing (LSI): The Breakthrough**

To address the brittleness of exact keyword matching in VSM, Marcus and Maletic (2003) introduced **Latent Semantic Indexing (LSI)** to the traceability domain in their seminal paper "Recovering documentation-to-source-code traceability links using latent semantic indexing".11

#### **2.2.1 The Dimensionality Reduction Mechanism**

LSI operates on the premise that there is an underlying "latent" semantic structure in the usage of words that is obscured by the randomness of word choice. It employs a linear algebra technique called **Singular Value Decomposition (SVD)** to reduce the noise.

The Term-Document matrix $A$ (constructed as in VSM) is decomposed into three matrices:

$$A \= U \\Sigma V^T$$

* $U$: The term-concept matrix.  
* $\\Sigma$: A diagonal matrix of singular values (representing the strength of each concept).  
* $V^T$: The concept-document matrix.

The crucial step in LSI is the **truncation**. By keeping only the top $k$ singular values in $\\Sigma$ and setting the rest to zero, the matrix is reconstructed in a lower-dimensional subspace ($k$ is typically 200–300). This process eliminates the "noise" (insignificant variations in word usage) and forces terms that co-occur in similar contexts to be merged into the same semantic dimension.14

#### **2.2.2 Comparative Performance: LSI vs. VSM**

Marcus and Maletic's experiments demonstrated that LSI could achieve significantly higher **Recall** than VSM. Because LSI captures the latent structure, it can match a query for "graph" to a document containing "node" and "edge," even if the word "graph" is missing, provided that these words frequently co-occur in other documents in the corpus.

* **Case Studies:** The method was validated on the LEDA library (C++) and the Albergate system (Java). The results showed that LSI was robust against the synonymy problem, recovering links that VSM missed entirely.10  
* **Trade-offs:** However, LSI introduces a computational overhead due to the SVD calculation ($O(N^3)$ complexity). Furthermore, determining the optimal value for $k$ (the number of dimensions) is an empirical challenge; too few dimensions lose information, while too many retain noise.15

Despite its success, LSI remains a **Bag-of-Words** model. It completely ignores the order of words. The sentence "Class A calls Class B" is treated identically to "Class B calls Class A," losing vital structural information inherent in code execution flow and requirements logic. This structural blindness would remain a limitation until the advent of Deep Learning approaches.16

---

## **3\. The Linguistic Turn: Vocabulary Normalization (2010–2013)**

As research moved beyond the initial proofs of concept, practitioners realized that the quality of the input data was a major bottleneck. Source code is not natural language; it is a constructed language full of abbreviations, compound identifiers, and technical jargon. The IR methods (VSM and LSI) assume that the "words" in the matrix are meaningful linguistic units. However, a token like str\_buffer\_sz or getAccountInfo is treated as a unique, meaningless string by a standard tokenizer.

The research by Lawrie et al. (2010) in "Normalizing source code vocabulary" 18 addresses this critical preprocessing step, arguing that effectively "reading" source code requires sophisticated splitting and expansion algorithms.

### **3.1 The "Hard Words" vs. "Soft Words" Distinction**

Lawrie et al. formalized the distinction between two types of tokens found in source code:

* **Hard Words:** The explicit tokens as they appear in the source code text (e.g., distSq, fp\_check). These are the units recognized by the compiler.  
* **Soft Words:** The constituent natural language terms embedded within the hard words (e.g., distance, square, floating, point, check). These are the units of meaning.

The goal of vocabulary normalization is to transform Hard Words into their constituent Soft Words so that they can be matched against the natural language found in requirements.

### **3.2 The GenTest Splitting Algorithm**

Simple splitting heuristics—such as "split on underscore" or "split on camelCase"—are insufficient. They fail on cases like J2EEserver (is it J, 2, EE, server? or J2EE, server?) or newrtype (is it new, r, type? or new, rtype?).

Lawrie et al. proposed the **GenTest** algorithm, which outperforms simple heuristic splitters.

1. **Generate:** The algorithm generates all possible splits of a given identifier.  
2. Test: It scores each candidate split based on a vocabulary metric (e.g., do the resulting soft words appear in a dictionary or elsewhere in the corpus?).  
   The split with the highest score is selected as the normalized form.

### **3.3 Impact on Traceability and Feature Location**

The empirical results from Lawrie et al. (2010) and subsequent validations by Guerrouj (2013) show that vocabulary normalization is not merely a cosmetic step but a fundamental requirement for high-performance traceability.21

* **Metric Improvement:** Normalization improved the performance of feature location techniques (a sibling task to traceability) significantly. For example, the relevant code retrieval score for the **FLAT^3** feature locator improved from 0.60 to 0.95 after applying normalization.19  
* **Legacy Code:** The technique is particularly vital for legacy C/C++ code where short, cryptic abbreviations (e.g., memcpy, atoi, ptr) are common. Without expansion, these tokens are invisible to semantic search.

This era established that **preprocessing is as critical as the retrieval algorithm itself**. No amount of mathematical sophistication in LSI can recover a link if the input tokens are effectively gibberish to the model.

---

## **4\. The Deep Learning Paradigm Shift (2018–Present)**

The most significant leap in the field, as documented in the provided papers, is the transition from statistical IR methods to Deep Learning (DL) techniques. This shift mirrors the broader revolution in Natural Language Processing (NLP) and is epitomized by the work of Guo et al. (2018) in "Semantically Enhanced Software Traceability Using Deep Learning Techniques".16

### **4.1 From Bag-of-Words to Word Embeddings**

The fundamental innovation introduced in this era is the **Word Embedding** (e.g., Word2Vec, GloVe). Unlike the atomic terms in VSM/LSI, word embeddings represent words as dense vectors in a continuous vector space where semantic proximity equates to geometric proximity.23

* **Mechanism:** The model learns that "student" and "pupil" are similar not because they appear in the same document (LSI), but because they share similar surrounding contexts in a massive corpus (e.g., Wikipedia or a large code base).  
* **Domain Specificity:** Guo et al. (2018) utilized domain-specific embeddings. For a specific project (e.g., a train control system), they trained embeddings on the project documentation itself. This allowed the model to learn that "beacon" and "transponder" were synonyms *in that specific domain*, even if they aren't synonyms in general English.23

### **4.2 The Recurrent Neural Network (RNN) Architecture**

Guo et al. (2018) argued that traceability is not just about keyword matching but about understanding the **semantics of the sequence**. To capture this, they employed Recurrent Neural Networks (RNNs), specifically **Bidirectional Gated Recurrent Units (BI-GRU)**.16

#### **4.2.1 Why BI-GRU?**

Standard RNNs suffer from the "vanishing gradient" problem, making them forget early parts of long sentences (a critical flaw given the length of detailed requirements). GRUs (Gated Recurrent Units) introduce gates (update gate and reset gate) to control information flow, allowing the network to retain long-term dependencies.

* **Bidirectional Processing:** The "Bidirectional" aspect means the model reads the artifact text both forwards (start to end) and backwards (end to start). This captures the full context of a word based on what comes before *and* after it. For example, in the phrase "server failure," the meaning of "server" is contextualized by the subsequent word "failure."  
* **Trace Linking as Classification:** The BI-GRU takes the vector representations of a source artifact and a target artifact and outputs a probability score indicating the likelihood of a link. This transforms traceability from a similarity search problem into a supervised binary classification problem.

### **4.3 Experimental Victory: The "Statistical Win"**

Guo et al. (2018) compared their BI-GRU model against the state-of-the-art VSM and LSI baselines (which were optimized using Genetic Algorithms to ensure a fair fight). The results were statistically significant and marked a turning point in the field:

* **MAP (Mean Average Precision):** BI-GRU significantly outperformed VSM and LSI. In scenarios requiring 100% recall (critical for safety-critical systems), the BI-GRU maintained much higher precision than the IR methods. This means that to find all valid links, a developer using BI-GRU would have to review far fewer false positives than one using LSI.16  
* **F-Measure:** The Deep Learning approach achieved F1 scores up to 0.749 (with 100% recall), whereas LSI and VSM struggled to balance precision and recall, often requiring manual threshold tuning that sacrificed one for the other.17

### **4.4 The Transformer Future (2024 and Beyond)**

Following the success of RNNs, the field has rapidly adopted Transformer-based models (e.g., BERT, RoBERTa), as noted in the 2024 review by Guo.1 Transformers rely on the "Self-Attention" mechanism, which allows the model to weigh the importance of every word in relation to every other word simultaneously, rather than sequentially.

* **TraceBERT:** Recent adaptations fine-tune BERT for traceability. By feeding a Requirement-Code pair into BERT, the model uses its massive pre-trained knowledge of English and Code (e.g., CodeBERT) to determine relevance.  
* **Performance:** These models typically yield a further \+5–10% improvement in F1 score over RNN/GRU architectures.25

---

## **5\. The Evaluation Crisis: Semantic Similarity Metrics (2022)**

As generation and retrieval techniques became more sophisticated, a secondary crisis emerged: **How do we evaluate success?** In the IR era, simple Precision and Recall against a "Gold Standard" matrix were sufficient. However, as research expanded into **Code Summarization** (generating natural language descriptions from code—a reverse traceability task), the evaluation became complex.

Haque et al. (2022) addressed this in "Semantic Similarity Metrics for Evaluating Source Code Summarization".27

### **5.1 The Failure of N-Gram Metrics (BLEU, METEOR)**

For years, the software engineering community borrowed metrics from Machine Translation (NLP), specifically **BLEU** (Bilingual Evaluation Understudy). BLEU measures the n-gram overlap (sequences of n words) between the machine-generated summary and a human-written reference summary.28

**The Problem:** Haque et al. demonstrated that BLEU scores do not correlate with human judgment of summary quality.

* **Example:**  
  * *Reference:* "Initialize the database connection."  
  * *Generated:* "Start the DB link."  
  * *BLEU Score:* Near zero (no shared words).  
  * *Human Score:* Perfect (semantic equivalence).

Haque et al. conducted a human study with programmers and found that BLEU, METEOR, and ROUGE failed to capture the semantic accuracy of the summaries. They essentially measure "lexical similarity," not "semantic similarity".27 This implies that years of research claiming improvements based on small BLEU score increases may have been optimizing for the wrong target.

### **5.2 The Solution: Semantic Metrics (BERTScore)**

Haque et al. proposed and validated the use of semantic similarity metrics:

1. **BERTScore:** Uses contextual embeddings from BERT to match words. It would recognize that "Initialize" $\\approx$ "Start" and "connection" $\\approx$ "link" in the vector space, yielding a high score despite the lexical mismatch.27  
2. **USE (Universal Sentence Encoder):** Encodes the entire sentence into a vector and calculates cosine similarity.

**Key Finding:** The study showed that **BERTScore and cosine similarity of SentenceBERT embeddings** had a much stronger correlation with human evaluators than BLEU or ROUGE.27 This finding mandates a shift in how the community evaluates progress: automated traceability and summarization tools must be judged by their ability to capture meaning, not just key phrases.

---

## **6\. Benchmarking: The Ecosystem of Datasets**

The validity of the comparative analysis rests on the datasets used. The research corpus consistently relies on a set of open-source benchmarks (often referred to as the COEST datasets).32 Understanding the characteristics of these datasets is crucial for interpreting the results.

### **6.1 Core Datasets Overview**

The following table summarizes the key datasets discussed in the reports (e.g., eTour, EasyClinic, Albergate).24

| Dataset | Domain | Source Artifacts | Target Artifacts | \# Links | Characteristics & Challenges |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **EasyClinic** | Healthcare | Use Cases (30), Interaction Diagrams (20), Test Cases (63) | Code Classes (47) | 1,388 | **Richness:** This dataset is unique because it contains multiple artifact types (Diagrams, Tests), allowing for transitive traceability research (e.g., tracing Requirement $\\to$ Test $\\to$ Code). It is small but dense. 24 |
| **eTour** | Tourism | Use Cases (English) | Java Code | \~300-500 | **The Standard:** This is the most common benchmark. It features clean English requirements and Java code with a reliable ground truth. It was the primary battleground for the Guo (2018) comparison of LSI vs. BI-GRU. 36 |
| **Albergate** | Hospitality | Functional Reqs (Italian) | Java Classes (55) | 54 | **Language Gap:** The requirements are in Italian, while the code (Java) uses English keywords. This dataset highlights the failure of VSM/LSI in cross-lingual settings without translation. 13 |
| **iTrust** | Medical | Requirements | Java/JSP Code | \>500 | **Realism:** This dataset includes JSP (Java Server Pages) and web artifacts, making it larger and "messier" than the others. It tests a model's ability to handle web frameworks and noise. 33 |
| **eAnci** | Gov/Admin | Use Cases (Italian) | Code Classes (55) | 567 | **Imbalance:** This dataset has a high ratio of source artifacts to target artifacts, making it prone to "query expansion" errors where models hallucinate links due to the sheer volume of text. 34 |

### **6.2 Analytical Insights on Dataset Bias**

* **The Java Bias:** Almost all major benchmarks (eTour, iTrust, Albergate) rely on Java. This creates a potential bias in the research; models might be overfitting to Java's verbose naming conventions (public static void main). The performance of these models on more terse languages (like C, Go, or Python) or dynamic languages (JavaScript) is less well-supported by the provided evidence.  
* **Granularity:** EasyClinic offers fine-grained traces (Use Case $\\to$ Class Description), whereas others are coarser. LSI typically struggles with fine-grained tasks because the documents are shorter, leading to sparse vectors. DL models, which rely on context, tend to handle short text segments better if they have been pre-trained on large corpora.  
* **Ground Truth Reliability:** The "Oracle" or "Gold Standard" is manually created by humans. The research acknowledges that even the oracle might contain errors or subjective links. This sets a theoretical ceiling on the accuracy of any automated method—if the human oracle is only 95% consistent, a model achieving 99% accuracy might actually be overfitting or modeling noise.15

---

## **7\. Comparative Analysis of Methodologies**

The following comparison synthesizes the performance, cost, and applicability of the three primary paradigms discussed.

| Feature | VSM (Antoniol 2002\) | LSI (Marcus 2003\) | Deep Learning (Guo 2018 / BERT) |
| :---- | :---- | :---- | :---- |
| **Core Mechanism** | Exact term matching (Cosine Similarity) | Dimensionality Reduction (SVD) | Neural Embeddings & Sequence Learning |
| **Handling Synonyms** | Poor (Fails completely) | Good (Latent associations) | Excellent (Learned semantic proximity) |
| **Handling Polysemy** | Poor | Moderate (Context via co-occurrence) | Excellent (Context via attention/gates) |
| **Structure Awareness** | None (Bag of Words) | None (Bag of Words) | High (Sequence/Attention aware) |
| **Preprocessing Need** | High (Stemming, Stop words) | High (Stemming, Normalization) | Moderate (Tokenization, though less brittle) |
| **Computational Cost** | Very Low | Low/Medium (SVD is $O(N^3)$) | High (Training GPUs) / Low (Inference) |
| **Data Requirement** | Minimal (Works on small projects) | Moderate (Needs corpus for SVD) | High (Needs large training data for embeddings) |
| **Performance (MAP)** | Low Baseline | Medium (+10-15% over VSM) | High (significantly \> LSI/VSM) 16 |

### **7.1 The "Data Hunger" Trade-off**

A critical second-order insight is the **Data Hunger** of modern methods.

* Marcus & Maletic (2003) could run LSI on a single project (e.g., LEDA) and get results. The latent semantics were derived *internal* to that project.  
* Guo (2018) and Haque (2022) rely on models pre-trained on massive corpora (Wikipedia, GitHub). While DL performs better, it introduces a dependency on **external knowledge**. If a project uses highly proprietary, non-standard jargon that doesn't exist in the pre-training data, DL models might actually underperform LSI unless fine-tuned (which requires expensive labeled data).

### **7.2 The Precision-Recall Tension**

In safety-critical domains (avionics, medical), **Recall is king**. Missing a link between a safety requirement and a line of code is catastrophic.

* LSI was favored in 2003 because it improved Recall.15  
* DL models (BI-GRU) have shown the ability to maintain 100% Recall while significantly boosting Precision (reducing false positives).17 This reduction in false positives is the "killer feature" for industry adoption, as it reduces the manual effort required to vet the tool's output.

---

## **8\. Conclusion and Future Outlook**

The comparison of the provided research papers reveals a clear trajectory in software traceability research: a movement from **syntactic surface matching** to **deep semantic understanding**.

1. **The Victory of Semantics:** The debate is settled. Deep Learning approaches (BI-GRU, BERT) unequivocally outperform traditional Information Retrieval (VSM, LSI) by effectively bridging the semantic gap. The "Vocabulary Mismatch" problem, which plagued the field for a decade, has been largely solved by word embeddings and neural contextualization.  
2. **The Preprocessing Constant:** Despite the power of DL, the work of Lawrie et al. remains relevant. Source code is a distinct modality. Proper segmentation (splitting) and normalization of identifiers remain critical preprocessing steps to feed high-quality tokens into neural models.  
3. **The Metric Crisis:** The community must abandon BLEU and ROUGE for traceability and summarization tasks. As Haque et al. (2022) demonstrated, these metrics are misleading. Future research must adopt semantic metrics (BERTScore) or human-in-the-loop evaluation to gauge true progress.  
4. **Contextual Debt as a Driver:** The theoretical framing of "Contextual Debt" provides the business case for these technologies. As AI agents (LLMs) increasingly co-develop software, the need for explicit, machine-readable traceability links becomes existential. Without them, AI agents hallucinate, and the system succumbs to entropy.

**Final Recommendation:** For modern software artifact management systems 39, the integration of **Transformer-based retrieval models** (replacing LSI) and **BERTScore-based evaluation** is the scientifically supported path forward. However, these systems must retain the **vocabulary normalization pipelines** designed in the 2010s to handle the idiosyncrasies of source code naming conventions. The ultimate goal is to transform the software repository from a graveyard of text files into a living, interconnected knowledge graph that actively resists Contextual Debt.

#### **Works cited**

1. Natural Language Processing for Requirements Traceability | Request PDF \- ResearchGate, accessed November 27, 2025, [https://www.researchgate.net/publication/380719740\_Natural\_Language\_Processing\_for\_Requirements\_Traceability](https://www.researchgate.net/publication/380719740_Natural_Language_Processing_for_Requirements_Traceability)  
2. Recovering Trace Links Between Software Documentation And Code \- dokumen.pub, accessed November 27, 2025, [https://dokumen.pub/download/recovering-trace-links-between-software-documentation-and-code.html](https://dokumen.pub/download/recovering-trace-links-between-software-documentation-and-code.html)  
3. Precision-Recall Curve on test set-10% total data. \- ResearchGate, accessed November 27, 2025, [https://www.researchgate.net/figure/Precision-Recall-Curve-on-test-set-10-total-data\_fig2\_324387649](https://www.researchgate.net/figure/Precision-Recall-Curve-on-test-set-10-total-data_fig2_324387649)  
4. arXiv:2405.10845v1 \[cs.SE\] 17 May 2024, accessed November 27, 2025, [https://arxiv.org/pdf/2405.10845](https://arxiv.org/pdf/2405.10845)  
5. Your AI Assistant is a Genius with Amnesia: How to Onboard It | by Krzyś | Generative AI, accessed November 27, 2025, [https://generativeai.pub/why-your-ai-assistant-writes-idiotic-code-and-how-to-fix-it-4512b2b5ceb5](https://generativeai.pub/why-your-ai-assistant-writes-idiotic-code-and-how-to-fix-it-4512b2b5ceb5)  
6. Use of ACVIP Containment of the Accumulation of Program Technical Debt using AADL, accessed November 27, 2025, [https://www.sei.cmu.edu/library/use-of-acvip-containment-of-the-accumulation-of-program-technical-debt-using-aadl/](https://www.sei.cmu.edu/library/use-of-acvip-containment-of-the-accumulation-of-program-technical-debt-using-aadl/)  
7. Our Systems Have No Memory. I Call It Contextual Debt | by Yvan Callaou \- Medium, accessed November 27, 2025, [https://medium.com/@yvan.callaou/our-systems-have-no-memory-i-call-it-contextual-debt-d656af68d80b](https://medium.com/@yvan.callaou/our-systems-have-no-memory-i-call-it-contextual-debt-d656af68d80b)  
8. Recovery of Traceability Links between Software Documentation and Source Code. | Request PDF \- ResearchGate, accessed November 27, 2025, [https://www.researchgate.net/publication/220344380\_Recovery\_of\_Traceability\_Links\_between\_Software\_Documentation\_and\_Source\_Code](https://www.researchgate.net/publication/220344380_Recovery_of_Traceability_Links_between_Software_Documentation_and_Source_Code)  
9. Recovering traceability links between code and documentation | IEEE Journals & Magazine, accessed November 27, 2025, [https://ieeexplore.ieee.org/document/1041053/](https://ieeexplore.ieee.org/document/1041053/)  
10. Recovering Traceability Links Between Code and Documentation: A Retrospective, accessed November 27, 2025, [https://www.computer.org/csdl/journal/ts/2025/03/10855629/23QQVxBVRqU](https://www.computer.org/csdl/journal/ts/2025/03/10855629/23QQVxBVRqU)  
11. Recovering documentation-to-source-code traceability links using latent semantic indexing, accessed November 27, 2025, [http://ieeexplore.ieee.org/abstract/document/1201194/](http://ieeexplore.ieee.org/abstract/document/1201194/)  
12. Recovering Documentation-to-Source-Code Traceability Links using Latent Semantic Indexing | Request PDF \- ResearchGate, accessed November 27, 2025, [https://www.researchgate.net/publication/2561356\_Recovering\_Documentation-to-Source-Code\_Traceability\_Links\_using\_Latent\_Semantic\_Indexing](https://www.researchgate.net/publication/2561356_Recovering_Documentation-to-Source-Code_Traceability_Links_using_Latent_Semantic_Indexing)  
13. Recovering traceability links between code and documentation \- Software Engineering, IEEE Transactions on, accessed November 27, 2025, [https://hiper.cis.udel.edu/lp/lib/exe/fetch.php/courses/other-traceability-antonioltse.pdf](https://hiper.cis.udel.edu/lp/lib/exe/fetch.php/courses/other-traceability-antonioltse.pdf)  
14. An Information Retrieval Approach to Concept Location in Source Code, accessed November 27, 2025, [https://www.eecis.udel.edu/\~pollock/879tainsef13/lsi-marcus2004.pdf](https://www.eecis.udel.edu/~pollock/879tainsef13/lsi-marcus2004.pdf)  
15. Recovery of traceability links between software documentation and source code \- SciSpace, accessed November 27, 2025, [https://scispace.com/pdf/recovery-of-traceability-links-between-software-2q9nn3g1wg.pdf](https://scispace.com/pdf/recovery-of-traceability-links-between-software-2q9nn3g1wg.pdf)  
16. \[1804.02438\] Semantically Enhanced Software Traceability Using Deep Learning Techniques \- arXiv, accessed November 27, 2025, [https://arxiv.org/abs/1804.02438](https://arxiv.org/abs/1804.02438)  
17. Semantically Enhanced Software Traceability Using Deep Learning Techniques \- arXiv, accessed November 27, 2025, [https://arxiv.org/pdf/1804.02438](https://arxiv.org/pdf/1804.02438)  
18. Normalizing source code vocabulary to support program, accessed November 27, 2025, [https://www.researchgate.net/publication/261297577\_Normalizing\_source\_code\_vocabulary\_to\_support\_program\_comprehension\_and\_software\_quality](https://www.researchgate.net/publication/261297577_Normalizing_source_code_vocabulary_to_support_program_comprehension_and_software_quality)  
19. Normalizing Source Code Vocabulary | IEEE Conference Publication, accessed November 27, 2025, [http://ieeexplore.ieee.org/document/5645479/](http://ieeexplore.ieee.org/document/5645479/)  
20. An Empirical Study of Identifier Splitting Techniques \- University of Delaware, accessed November 27, 2025, [https://www.eecis.udel.edu/\~pollock/879tainsef13/idsplittjournal.pdf](https://www.eecis.udel.edu/~pollock/879tainsef13/idsplittjournal.pdf)  
21. Normalizing source code vocabulary to support program comprehension and software quality \- IEEE Xplore, accessed November 27, 2025, [https://ieeexplore.ieee.org/document/6606723/](https://ieeexplore.ieee.org/document/6606723/)  
22. An Empirical Study of Abbreviations and Expansions in Software Artifacts \- NSF Public Access Repository, accessed November 27, 2025, [https://par.nsf.gov/servlets/purl/10132767](https://par.nsf.gov/servlets/purl/10132767)  
23. Semantically Enhanced Software Traceability Using Deep Learning Techniques | Request PDF \- ResearchGate, accessed November 27, 2025, [https://www.researchgate.net/publication/386703108\_Semantically\_Enhanced\_Software\_Traceability\_Using\_Deep\_Learning\_Techniques](https://www.researchgate.net/publication/386703108_Semantically_Enhanced_Software_Traceability_Using_Deep_Learning_Techniques)  
24. EVALUATING WORD EMBEDDING MODELS FOR TRACEABILITY \- LSU Scholarly Repository, accessed November 27, 2025, [https://repository.lsu.edu/cgi/viewcontent.cgi?article=6439\&context=gradschool\_theses](https://repository.lsu.edu/cgi/viewcontent.cgi?article=6439&context=gradschool_theses)  
25. Requirements Traceability Matrix \- Emergent Mind, accessed November 27, 2025, [https://www.emergentmind.com/topics/requirements-traceability-matrix-rtm](https://www.emergentmind.com/topics/requirements-traceability-matrix-rtm)  
26. \[2405.10845\] Natural Language Processing for Requirements Traceability \- arXiv, accessed November 27, 2025, [https://arxiv.org/abs/2405.10845](https://arxiv.org/abs/2405.10845)  
27. Semantic similarity metrics for evaluating source code summarization \- ResearchGate, accessed November 27, 2025, [https://www.researchgate.net/publication/364599087\_Semantic\_similarity\_metrics\_for\_evaluating\_source\_code\_summarization](https://www.researchgate.net/publication/364599087_Semantic_similarity_metrics_for_evaluating_source_code_summarization)  
28. Semantic Similarity Metrics for Evaluating Source Code Summarization, accessed November 27, 2025, [https://par.nsf.gov/servlets/purl/10341575](https://par.nsf.gov/servlets/purl/10341575)  
29. Evaluating Code Summarization Techniques: A New Metric and an Empirical Characterization \- arXiv, accessed November 27, 2025, [https://arxiv.org/html/2312.15475v1](https://arxiv.org/html/2312.15475v1)  
30. Semantic Similarity Metrics for Evaluating Source Code Summarization \- ResearchGate, accessed November 27, 2025, [https://www.researchgate.net/publication/359728933\_Semantic\_Similarity\_Metrics\_for\_Evaluating\_Source\_Code\_Summarization](https://www.researchgate.net/publication/359728933_Semantic_Similarity_Metrics_for_Evaluating_Source_Code_Summarization)  
31. Assertion-Aware Test Code Summarization with Large Language Models \- arXiv, accessed November 27, 2025, [https://arxiv.org/html/2511.06227v1](https://arxiv.org/html/2511.06227v1)  
32. Natural Language Processing for Requirements Traceability \- arXiv, accessed November 27, 2025, [https://arxiv.org/html/2405.10845v1](https://arxiv.org/html/2405.10845v1)  
33. Traceability link recovery approach utilizing fine-grained, word embedding-based relations \- GitHub, accessed November 27, 2025, [https://github.com/tobhey/finegrained-traceability](https://github.com/tobhey/finegrained-traceability)  
34. Combining Machine Learning and Logical Reasoning to Improve Requirements Traceability Recovery \- MDPI, accessed November 27, 2025, [https://www.mdpi.com/2076-3417/10/20/7253](https://www.mdpi.com/2076-3417/10/20/7253)  
35. Enhancing Traceability Link Recovery with Unlabeled Data \- Guanping Xiao, accessed November 27, 2025, [https://guanpingxiao.github.io/publications/ISSRE22.pdf](https://guanpingxiao.github.io/publications/ISSRE22.pdf)  
36. Requirements Classification for Traceability Link Recovery, accessed November 27, 2025, [https://publikationen.bibliothek.kit.edu/1000170117/152716343](https://publikationen.bibliothek.kit.edu/1000170117/152716343)  
37. Enhancing Traceability Link Recovery with Fine-Grained Query Expansion Analysis \- MDPI, accessed November 27, 2025, [https://www.mdpi.com/2078-2489/14/5/270](https://www.mdpi.com/2078-2489/14/5/270)  
38. Source Code Indexing for Automated Tracing \- UC Homepages, accessed November 27, 2025, [https://homepages.uc.edu/\~niunn/papers/TEFSE11.pdf](https://homepages.uc.edu/~niunn/papers/TEFSE11.pdf)  
39. Recovering Traceability Links in Software Artifact ... \- Semantic Scholar, accessed November 27, 2025, [https://pdfs.semanticscholar.org/499c/19ed522778023b4485b28d0502c4ca1ae6f5.pdf](https://pdfs.semanticscholar.org/499c/19ed522778023b4485b28d0502c4ca1ae6f5.pdf)