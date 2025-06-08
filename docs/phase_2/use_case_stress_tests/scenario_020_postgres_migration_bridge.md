
# Scenario 020: "Postgres Migration Bridge - Legacy Data Liberation"

**Story Type:** External Database Integration  
**Complexity:** High (Multi-system coordination)  
**Phase 2 Focus:** Database adapter extensibility, connection management, data migration workflows

## Story Context

**Setup:** Dr. Sarah Chen, a research professor at MIT, has been using LogoMesh for her cognitive research lab for 6 months. Her team has accumulated 2.3GB of thought networks, research notes, and cross-referenced literature in their local SQLite instances. However, her department just mandated that all research data must be stored on their central PostgreSQL server (running on `db.research.mit.edu:5432`) for backup, compliance, and collaboration requirements.

Sarah needs to:
1. **Connect LogoMesh to the existing departmental PostgreSQL server** without losing any local data
2. **Migrate existing SQLite data** to PostgreSQL seamlessly 
3. **Enable team collaboration** through the shared database while maintaining individual thought spaces
4. **Maintain offline capability** for when she's working remotely without VPN access

## Cast & Environment

**Primary User:**
- Dr. Sarah Chen - Research Professor, MIT Cognitive Science Dept
- Device: MacBook Pro M3 (16GB RAM, excellent network in lab)
- LogoMesh Config: Local SQLite with 847 thoughts, 3,200+ segments

**Infrastructure:**
- **Target Database:** PostgreSQL 15 on `db.research.mit.edu:5432`
  - Database: `cognitive_research_lab` 
  - Schema: `logomesh_production`
  - Credentials: Provided via department's credential management system
  - Extensions: `pgvector` already installed for embeddings
- **Network:** MIT campus network with occasional VPN connectivity issues

## User Journey

### Phase 1: Connection Setup
1. **Database Configuration Panel**
   - Sarah opens LogoMesh settings → "Database Configuration"
   - Current: "Local SQLite" (`/Users/sarah/.logomesh/thoughts.db`)
   - New Option: "Connect to PostgreSQL Server"
   - Input fields: Host, Port, Database, Schema, Username, Password
   - Connection test button with detailed error reporting

2. **Connection Validation**
   - LogoMesh tests connection to PostgreSQL server
   - Validates that required tables exist (auto-creates if missing)
   - Checks for `pgvector` extension availability
   - Reports compatible schema version or migration requirements

### Phase 2: Data Migration Strategy Selection
3. **Migration Options Presented**
   - **Option A:** "Full Migration" - Move all data to PostgreSQL, keep SQLite as backup
   - **Option B:** "Hybrid Mode" - Keep local SQLite, sync to PostgreSQL periodically
   - **Option C:** "Gradual Migration" - Move thoughts by tag/date range selectively

4. **Sarah chooses Option B (Hybrid Mode)** for maximum flexibility

### Phase 3: Schema Mapping & Data Transfer
5. **Automated Schema Translation**
   - LogoMesh maps SQLite schema to PostgreSQL equivalents
   - Handles UUID generation differences
   - Maps JSON fields to PostgreSQL JSONB
   - Sets up proper indexing for performance

6. **Incremental Data Sync**
   - Initial bulk transfer: 847 thoughts → PostgreSQL (estimated 15 minutes)
   - Real-time sync established for new thoughts/segments
   - Conflict resolution strategy for concurrent edits

### Phase 4: Multi-User Collaboration Setup
7. **Team Workspace Configuration**
   - Sarah creates shared "MIT Cognitive Lab" workspace in PostgreSQL
   - Individual thought spaces remain private unless explicitly shared
   - Team members can connect their LogoMesh instances to same database
   - Role-based access controls for different research projects

## Technical Requirements

### Database Adapter Enhancement
- **PostgreSQL StorageAdapter** implementing same `StorageAdapter` interface
- **Connection pooling** for efficient resource management
- **Migration utilities** for SQLite → PostgreSQL data transfer
- **Conflict resolution** for concurrent multi-user edits

### Configuration Management
- **Database connection profiles** stored securely
- **Credential management** integration (environment variables, keychain)
- **Fallback mechanisms** when PostgreSQL unavailable (offline mode)
- **Health monitoring** for connection status

### Data Synchronization
- **Bidirectional sync** between local SQLite cache and PostgreSQL
- **Change tracking** with timestamps and conflict detection
- **Selective sync** options (by tag, project, date range)
- **Bandwidth optimization** for large datasets

## Phase 2 Implementation Strategy

### Core Infrastructure
```typescript
// Enhanced StorageAdapter interface supporting connection profiles
interface DatabaseConnectionProfile {
  id: string;
  name: string;
  type: 'sqlite' | 'postgresql';
  connectionString: string;
  isDefault: boolean;
  syncMode: 'local-only' | 'hybrid' | 'remote-only';
}

interface PostgreSQLStorageAdapter extends StorageAdapter {
  connect(profile: DatabaseConnectionProfile): Promise<void>;
  migrateFromSQLite(sourcePath: string): Promise<MigrationResult>;
  enableHybridSync(localPath: string): Promise<void>;
  resolveConflicts(conflicts: DataConflict[]): Promise<void>;
}
```

### Migration Workflow
```typescript
interface MigrationWorkflow {
  validateConnection(): Promise<ValidationResult>;
  assessDataCompatibility(): Promise<CompatibilityReport>;
  executeMigration(strategy: MigrationStrategy): Promise<MigrationResult>;
  setupSynchronization(): Promise<SyncConfiguration>;
}
```

## Gap Analysis

### Current Phase 2 Gaps
- **GAP-020A:** No PostgreSQL adapter implementation
- **GAP-020B:** No multi-database connection management
- **GAP-020C:** No data migration utilities between database types
- **GAP-020D:** No conflict resolution for concurrent edits
- **GAP-020E:** No offline/online sync state management

### Mock Implementation Strategy
- **DatabaseConnectionManager:** Manages multiple connection profiles
- **PostgreSQLStorageAdapter:** Full implementation with connection pooling
- **DataMigrationService:** SQLite ↔ PostgreSQL transfer utilities
- **SyncConflictResolver:** Handles concurrent edit scenarios
- **OfflineStateManager:** Manages fallback to local SQLite when needed

## Success Criteria

### Technical Validation
- [ ] Successfully connect to external PostgreSQL server
- [ ] Migrate 847 thoughts from SQLite to PostgreSQL without data loss
- [ ] Enable real-time sync between local cache and remote database
- [ ] Handle network interruptions gracefully (offline mode)
- [ ] Support multiple team members connecting to same database

### User Experience Validation  
- [ ] Sarah can work offline for 2+ hours, sync when reconnected
- [ ] Team collaboration works without conflicts or data loss
- [ ] Migration completes in <30 minutes for 2.3GB dataset
- [ ] No performance degradation compared to local SQLite
- [ ] Clear error messages for connection/migration issues

## Architecture Implications

### Database Abstraction Enhancement
This scenario validates that LogoMesh's `StorageAdapter` pattern can seamlessly support multiple database backends without changing business logic.

### Network Resilience
Hybrid sync mode ensures LogoMesh remains functional even with unreliable network connectivity, crucial for real-world deployment.

### Multi-User Foundation
Sets groundwork for true collaborative features while maintaining individual privacy controls.

## Implementation Priority

**Phase 2 Priority: High** - This scenario tests core architectural decisions about database abstraction and prepares for enterprise/institutional deployment scenarios common in academic and research environments.

The PostgreSQL connection capability would significantly expand LogoMesh's deployment flexibility without compromising its local-first philosophy.
