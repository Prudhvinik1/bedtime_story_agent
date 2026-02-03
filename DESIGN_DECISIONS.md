# Introduction

This section is dedicated for my design decisions. I have a mental model of how I want to develop this application. I am iteratively refining my approach , by pair designing this with ChatGPT 5.2

## Mental Model
- Ingestion – Accept a user’s bedtime story request
- Classification – Categorize the request (theme, tone, genre, age band)
- Retrieval – Inject static storytelling and safety context
- Validation (Pre-generation) – Ensure the request is safe and appropriate
- Execution – Generate and refine the story using LLM agents
- Post-Generation Validation – Enforce output invariants
- Safety – Cross-cutting guardrails at multiple layers
- Logging – Enable traceability and auditability
- Human Oversight – Allow feedback and manual intervention

## 3. Ingestion

### Design Choice

* Accept free-form natural language input describing the desired bedtime story.

### Rationale

* Storytelling is a creative task and benefits from flexible input.
* Avoids premature schema enforcement.
* Allows both children and parents to easily interact with the system.

---

## 4. Classification

### What We Classify

The request is softly categorized into:

* Theme (e.g., friendship, courage, kindness)
* Tone (e.g., calm, playful, adventurous)
* Genre (e.g., animals, fantasy, robots)

### Design Choice

* Lightweight, LLM-based classification (or prompt-based inference)
* No hard routing or complex taxonomy

### Rationale

* Enables tailored prompting strategies
* Keeps the system flexible and extensible
* Avoids overfitting or brittle rule-based routing

---

## 5. Retrieval (Context Injection)

### Design Choice

* Use **static prompt context**, not external RAG or vector databases.

Injected context includes:

* Story arc template (beginning → challenge → resolution → moral)
* Age-appropriate storytelling rules
* Safety constraints

### Rationale

* The task is creative, not factual
* No external knowledge grounding is required
* Reduces complexity and failure modes
* Keeps the system deterministic and explainable

---

## 6. Validation (Pre-Generation)

### Design Choice

* Validate user requests before generation to ensure they are appropriate for children.

### Checks

* No adult themes
* No violence, fear, or harmful content
* Appropriate for ages 5–10

### Rationale

* Prevents unsafe prompts from entering the generation pipeline
* Aligns with safety-first design principles

---

## 7. Execution: Agent Design

### Agents Used

1. **Storyteller Agent**

   * Generates a bedtime story using structured prompts
   * Explicit constraints on age, tone, safety, and story arc

2. **Judge Agent**

   * Evaluates the generated story using a rubric
   * Scores on:

     * Age appropriateness
     * Clarity
     * Emotional warmth
     * Safety
     * Narrative coherence

### Design Pattern

* Generator–Critic (Self-Refinement Loop)

### Refinement Strategy

* If the judge score is below a defined threshold:

  * Judge feedback is injected back into the storyteller
  * Story is regenerated
* Refinement loops are **bounded** to avoid infinite retries

### Rationale

* Mirrors how human editors review and improve writing
* Improves quality without requiring training or fine-tuning
* Encourages controlled autonomy rather than free-form generation

---

## 8. Post-Generation Validation

### Design Choice

Add a lightweight, deterministic validation layer after generation.

### Checks

* Story length within defined bounds
* Presence of a clear ending
* Absence of banned terms
* Judge score meets minimum quality threshold

### Rationale

* LLMs handle semantics well; rules handle invariants well
* Prevents malformed or incomplete outputs from reaching users
* Increases system robustness

---

## 9. Safety (Cross-Cutting Concern)

Safety is enforced at multiple layers:

* Prompt constraints
* Pre-generation validation
* Judge rubric
* Post-generation validation
* Bounded retries with safe fallback behavior

### Philosophy

* Prefer correction over rejection
* Always attempt to return a safe, positive story

---

## 10. Logging & Auditability

### What Is Logged

* User request (non-PII)
* Classification output
* Story versions
* Judge scores and feedback
* Final decision path

### Rationale

* Enables debugging and quality monitoring
* Supports auditability and system improvement
* Logs are anonymized and non-sensitive

---

## 11. Human Oversight

### Design Choice

* Allow users (e.g., parents) to provide feedback or request changes
* Enable manual review of low-scoring or flagged outputs

### Rationale

* AI acts as an assistive system, not an authority
* Human-in-the-loop is especially important for child-facing applications

---

## 12. Explicit Non-Goals (Intentional Omissions)

The following were intentionally scoped out:

* External RAG / vector databases
* Multiple LLM models
* Model fine-tuning or RLHF
* Hard-coded safety classifiers

These were excluded to:

* Keep the system simple and explainable
* Stay within the 2–3 hour time constraint
* Avoid unnecessary complexity for a creative task

---

## 13. Key Tradeoffs

* **Simplicity over completeness**
* **Explainability over sophistication**
* **Safety over creativity**
* **Deterministic structure over uncontrolled generation**

---

## 14. Summary

This system demonstrates:

* Structured problem decomposition
* Thoughtful agent and prompt design
* Safety-first principles
* Practical engineering judgment
* Ability to operate effectively in an open-ended environment

The design is intentionally minimal yet extensible, making it suitable both as a prototype and as a foundation for more advanced systems.


