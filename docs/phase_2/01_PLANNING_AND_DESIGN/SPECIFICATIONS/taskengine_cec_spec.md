# PHASE 2 ADDENDUM: TaskEngine & Cognitive Execution Core

**Date:** June 2, 2025  
**Version:** 1.0

**Prerequisite:** Completion of Phase 1, including `LLMExecutor`, `LLMTaskRunner`, `IdeaManager`, `PluginHost`, and stubbed `TaskEngine`, `MetaExecutor`, and `ExecutorRegistry`. Embedding and basic plugin execution paths must be functional.

**Overall Goal for this Addendum:**  
To finalize and activate the TaskEngine and execution infrastructure within LogoMesh, enabling structured pipeline execution, plugin and AI orchestration, and the groundwork for intelligent, cost-aware cognitive automation.

---

## Theme 1: Task & Pipeline Schema Finalization

### Sub-Theme 1.1: Task Definitions & Validation

- **Concept:** Define and validate task objects with inputs, type, executor label, and optional metadata.
    
- **Modules/Features:**
    
    1. `Task` type (`@contracts/tasks.ts`):
        
        ```ts
        interface Task {
          taskId: string;
          executorId: string;
          input: any;
          config?: TaskExecutionConfig;
        }
        ```
        
    2. `TaskExecutionConfig` includes `priority`, `expectedDuration`, `maxRetries`, and `tags[]`
        
    3. Task validation on submission using `zod` or schema validator
        
- **Verification:** Tasks submitted to `TaskEngine` are verified, rejected on schema mismatch.
    

---

### Sub-Theme 1.2: Pipeline Definitions & Composition

- **Concept:** Allow chained task sequences with dependency resolution and data passing.
    
- **Modules/Features:**
    
    1. `Pipeline` type:
        
        ```ts
        interface Pipeline {
          pipelineId: string;
          tasks: Task[];
          meta?: PipelineMeta;
        }
        ```
        
    2. `PipelineMeta`: defines retry policy, timeout behavior, and optionally cognitive goals or tags
        
- **Verification:** Pipeline execution preserves task order, handles dependencies, and logs output per task.
    

---

## Theme 2: Core Execution Infrastructure

### Sub-Theme 2.1: ExecutorRegistry Activation

- **Concept:** Dynamically register and retrieve available executors by label.
    
- **Modules/Features:**
    
    1. `ExecutorRegistry.register(id: string, executor: TaskExecutor)`
        
    2. `ExecutorRegistry.get(id: string): TaskExecutor | undefined`
        
    3. Support for:
        
        - `LLMExecutor`
            
        - `TTSExecutor`
            
        - Plugin-based executors (e.g., from `PluginHost`)
            
- **Verification:** Registered executors are callable by ID. Errors are thrown on missing executors.
    

---

### Sub-Theme 2.2: TaskEngine Full Implementation

- **Concept:** Core loop that pulls in a `Pipeline`, resolves each `Task`, executes via appropriate executor, and handles state transitions.
    
- **Modules/Features:**
    
    1. `TaskEngine.executePipeline(pipeline: Pipeline)`
        
    2. Emit events (`taskStarted`, `taskCompleted`, `taskFailed`, `pipelineCompleted`, etc.)
        
    3. Store task/pipeline status in `ExecutionStateService`
        
    4. Basic retry/rescue logic (respect `maxRetries`)
        
- **Verification:** Tasks execute in order. Logs show executor use, task outcome, pipeline status.
    

---

## Theme 3: MetaExecutor & Cognitive Load Routing

### Sub-Theme 3.1: Dynamic Routing by Cost Profile

- **Concept:** MetaExecutor inspects tasks, checks cognitive load or task metadata, and chooses optimal executor path (e.g., local vs. cloud).
    
- **Modules/Features:**
    
    1. `MetaExecutor.routeTask(task: Task): Promise<TaskResult>`
        
    2. Consult `CognitiveLoadProfile` and `TaskCostMetadata`
        
    3. Example: Prefer `MockExecutor` for dev, fallback to cloud if local model is busy/unavailable
        
- **Verification:** Route logs show executor decision logic and fallback path when needed.
    

---

## Theme 4: UI and Plugin Integration

### Sub-Theme 4.1: Pipeline Submission & History UI

- **Concept:** Let users build and submit pipelines from a UI or via plugin API.
    
- **Modules/Features:**
    
    - UI form to define `Pipeline` with drag-drop or JSON entry
        
    - API route `POST /api/pipeline/submit`
        
    - Display pipeline run history, per-task status, executor used
        
- **Verification:** Pipelines submitted from UI trigger execution and logs update in real-time.
    

---

## Theme 5: Audit Trail & Error Handling

### Sub-Theme 5.1: Pipeline Execution Logs

- **Concept:** Store each task/pipeline run in a persistent SQLite table with input/output/error.
    
- **Modules/Features:**
    
    - `pipeline_execution_log (id, pipeline_id, task_id, executor_id, input, output, error, timestamp)`
        
    - Toggle: `[TOGGLE_TASK_EXECUTION_LOGGING]`
        
- **Verification:** All executed tasks are traceable with clear logs for replay or debugging.
    

---

## Implications for Phase 2 Timeline & Scope

- Essential for **DevShell integration**, AI-assisted workflows, plugin orchestration, and cognitive autonomy
    
- Enables **self-repair**, **multi-step AI behavior**, and **context-aware task resolution**
    
- Lays the base for Phase 3: **IntentRouter**, **Self-Evolving Workflows**, and **Agent Memory**
    

---

**This addendum activates the cognitive nervous system of LogoMesh.** Without this, there is no structured intelligence—only raw data and isolated AI calls.