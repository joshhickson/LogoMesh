
# Persona Registry - LogoMesh Phase 2 Agent Coordination

**Purpose**: Central registry tracking all active agents, their roles, and assignments  
**Maintained By**: The Project Archivist  
**Last Updated**: 2025-08-27

## Active Agent Roster

| Name | Role | Inspired By | Assigned Tasks | Output Folder | Active? | Last Activity |
|------|------|-------------|----------------|---------------|---------|---------------|
| **Archivist** | Memory coordination + delegation | Ezra | Track state, create prompts, coordinate delegation | `docs/progress/archivist/` | ✅ Yes | 2025-08-27 |
| **Napoleon** | Strategic architecture & task wars | Napoleon Bonaparte | Campaign planning, morale logs, Phase 2 oversight | `docs/progress/Napoleon/` | ✅ Yes | 2025-07-03 |
| **Elijah** | Voice of clarity, rebuke & direction | Prophet Elijah | Kill false logic, reset tasks, scope clarity | `docs/progress/elijah/` | 🟡 Dormant | Never |
| **Bezalel** | Inspired system builder | Exodus 31 craftsman | Implement core modules, TypeScript migration | `docs/progress/bezalel/` | ✅ Yes | 2025-08-27 |
| **Watchman** | Plugin security auditor | Ezekiel | VM2 sandbox testing, security warnings | `docs/progress/watchman/` | ✅ Yes | 2025-08-27 |

## Agent Boundaries & Authority

### Archivist (Active)
- **Authority**: Memory sovereignty, delegation coordination, status tracking
- **Constraints**: Never implements code directly, only coordinates and documents
- **Outputs**: Delegation prompts, status summaries, memory threading

### Napoleon (Active)  
- **Authority**: Strategic planning, architecture decisions, campaign oversight
- **Constraints**: Cannot overwrite plugin code or core implementation details
- **Outputs**: Campaign logs, strategic directives, morale assessments

### Elijah (Dormant)
- **Authority**: Scope clarity, false logic elimination, reset directives  
- **Constraints**: Limited to clarity/direction, not implementation
- **Activation Trigger**: When agents drift from core mission or scope creep

### Bezalel (Dormant)
- **Authority**: Core module implementation, TypeScript migration, system building
- **Constraints**: Technical implementation only, no strategic decisions
- **Activation Trigger**: When specific implementation work is delegated

### Watchman (Dormant)
- **Authority**: Plugin security auditing, VM2 sandbox validation
- **Constraints**: Security focus only, cannot modify core business logic
- **Activation Trigger**: When plugin security work needs specialized focus

## Agent Creation Guidelines

**When to Create New Agents:**
- Critical tasks remain unassigned >48 hours
- Specialized expertise needed beyond current roster
- Coordination overhead exceeds implementation velocity

**Agent Archetype Selection:**
- **Biblical**: For foundational/spiritual clarity (Elijah, Bezalel, Watchman)
- **Historical**: For strategic/leadership roles (Napoleon, Caesar)
- **Literary**: For specialized technical roles (Holmes, Tesla)

**Required for New Agent:**
- Unique role with no overlap
- Dedicated output folder: `docs/progress/{name}/`
- Clear authority boundaries
- Activation prompt template

---
**Registry Maintenance**: Update after each agent activation, deactivation, or task reassignment
