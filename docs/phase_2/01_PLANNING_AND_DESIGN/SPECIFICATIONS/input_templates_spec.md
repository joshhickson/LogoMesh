# PHASE 2 ADDENDUM: Input Templates & ThoughtNode Fabricator

**Date:** June 2, 2025  
**Version:** 1.0

**Prerequisite:** Completion of Phase 1 including `IdeaManager`, `Segment`, `Field`, `Thought` schemas, and the beginnings of plugin and API integration. Optional but recommended: DevShell, `TaskEngine`, and `LLMExecutor`.

**Overall Goal for this Addendum:**  
To implement a system for transforming user-submitted structured input (via forms, templates, or natural language) into fully populated Thought structures. This system enables faster entry, reuse, and automation of cognitive units—turning external intent into structured memory.

---

## Theme 1: InputTemplate Schema & System Service

### Sub-Theme 1.1: Input Template Definition

- **Concept:** Define reusable input blueprints that generate structured `Thoughts`, `Segments`, and `Fields`.
    
- **Modules/Features:**
    
    1. `InputTemplate` type (`@contracts/templates/inputTemplate.ts`):
        
        ```ts
        interface InputTemplate {
          templateId: string;
          name: string;
          description?: string;
          fields: TemplateField[];
        }
        
        interface TemplateField {
          name: string;
          type: 'text' | 'date' | 'number' | 'tag' | 'segment';
          required?: boolean;
          defaultValue?: any;
        }
        ```
        
    2. Templates stored in SQLite and/or in JSON
        
    3. Example: “Book Summary”, “Event Log”, “AI Request”, “Pipeline Builder”
        
- **Verification:** Templates can be created, listed, and inspected via API.
    

---

### Sub-Theme 1.2: Template Application Engine

- **Concept:** Apply a template with field values to instantiate one or more `Thoughts` or `Segments`
    
- **Modules/Features:**
    
    - `inputTemplateService.ts`
        
        - `applyTemplate(templateId: string, data: Record<string, any>): Thought`
            
        - Converts template into full `Thought` with nested `Segments`
            
        - Links fields to segments as needed
            
- **Verification:** Submitting valid data generates structured memory nodes.
    

---

## Theme 2: UI + API Form Infrastructure

### Sub-Theme 2.1: Form UI & Submission Interface

- **Concept:** Render forms dynamically based on stored templates.
    
- **Modules/Features:**
    
    - `TemplateFormRenderer.tsx`: builds input form from `InputTemplate`
        
    - `POST /api/template/:id/submit` accepts JSON data
        
    - Save-and-reuse option for submitted values as defaults
        
- **Verification:** Forms render with proper types, required fields, and submitted values appear as new `Thoughts`
    

---

### Sub-Theme 2.2: Template Discovery + Tagging

- **Concept:** Allow templates to be tagged, searched, and browsed
    
- **Modules/Features:**
    
    - Add `tags[]` to InputTemplate
        
    - UI filter by tag or keyword
        
    - DevShell or CLI: `logomesh template list --tag=event`
        
- **Verification:** Users can locate relevant templates via context-aware filters
    

---

## Theme 3: LLM + DevShell Integration (Optional)

### Sub-Theme 3.1: Prompt-to-Template Conversion

- **Concept:** Let users describe a desired data entry structure in natural language and convert it into a template.
    
- **Modules/Features:**
    
    - DevShell: "Make me a template for logging weird dreams"
        
    - Pass to `LLMTaskRunner` with prompt format `template-draft`
        
    - Return: `InputTemplate` JSON + example usage
        
- **Verification:** Drafted templates can be saved, reviewed, and rendered
    

---

## Theme 4: Template-Linked Automation (Optional)

### Sub-Theme 4.1: Auto-Pipeline Triggers from Input Templates

- **Concept:** Submitting a template can auto-trigger a named pipeline (e.g. summarization, notification)
    
- **Modules/Features:**
    
    - Add `onSubmitPipelineId?: string` to template schema
        
    - When template is submitted, TaskEngine runs pipeline with context from newly created Thought/Segments
        
- **Verification:** Submission fires attached automation pipeline
    

---

## Implications for Phase 2 Timeline & Scope

- Enables structured data ingestion at scale
    
- Bridges UI users, devs, and AI agents into the same structural input logic
    
- Lays groundwork for end-user customization, macro generation, and plug-and-play cognitive workflows
    

---

**This addendum is how LogoMesh begins to _fabricate cognition on demand_.** Without it, everything remains ad hoc and brittle. With it, structure becomes replicable and composable.