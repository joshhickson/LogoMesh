
# Day 35: Storage & Networking Foundation Implementation
*Date: June 22, 2025*

## Objective
Implement the foundational storage and networking layer with CRDT-based conflict resolution, distributed state synchronization, and cross-device coordination protocols to enable seamless data consistency across the LogoMesh ecosystem.

## Key Deliverables

### 1. CRDT-Based Conflict Resolution System
```typescript
// Location: core/storage/crdtResolver.ts
- Implement Last-Writer-Wins (LWW) CRDT for simple conflicts
- Add PN-Counter CRDT for numerical data synchronization
- Implement OR-Set CRDT for collaborative collections
- Add conflict resolution policies and merge strategies
```

### 2. Distributed State Synchronization Protocol
```typescript
// Location: core/storage/syncProtocol.ts
- Implement vector clock synchronization
- Add delta-state CRDT synchronization
- Create network partition handling
- Add offline-first synchronization queuing
```

### 3. Local Storage Optimization
```typescript
// Location: core/storage/sqliteAdapter.ts (Enhanced)
- Add CRDT metadata storage and indexing
- Implement efficient delta storage
- Add write-ahead logging for durability
- Create storage compaction and cleanup
```

### 4. Cross-Device Networking Layer
```typescript
// Location: core/networking/meshNetwork.ts
- Implement WebRTC P2P connections
- Add device discovery via mDNS/Bonjour
- Create network health monitoring
- Add bandwidth optimization and compression
```

## Implementation Tasks

### Phase 1: CRDT Infrastructure (Hours 1-4)

#### 1.1 Core CRDT Implementation Framework
**File: `core/storage/crdtResolver.ts` (New)**
```typescript
import { EventEmitter } from 'events';

export interface CRDTTimestamp {
  nodeId: string;
  counter: number;
  wallClock: number;
}

export interface CRDTMetadata {
  id: string;
  type: CRDTType;
  timestamp: CRDTTimestamp;
  vectorClock: Map<string, number>;
  checksum: string;
}

export type CRDTType = 'LWW_REGISTER' | 'PN_COUNTER' | 'OR_SET' | 'G_SET' | 'RGA_TEXT';

export abstract class CRDT<T = any> extends EventEmitter {
  protected metadata: CRDTMetadata;
  protected nodeId: string;
  protected localCounter: number = 0;

  constructor(id: string, nodeId: string, type: CRDTType) {
    super();
    this.nodeId = nodeId;
    this.metadata = {
      id,
      type,
      timestamp: this.createTimestamp(),
      vectorClock: new Map(),
      checksum: ''
    };
  }

  abstract merge(other: CRDT<T>): CRDT<T>;
  abstract getValue(): T;
  abstract update(operation: any): void;
  abstract serialize(): string;
  abstract deserialize(data: string): void;

  protected createTimestamp(): CRDTTimestamp {
    return {
      nodeId: this.nodeId,
      counter: ++this.localCounter,
      wallClock: Date.now()
    };
  }

  protected updateVectorClock(nodeId: string, counter: number): void {
    const currentClock = this.metadata.vectorClock.get(nodeId) || 0;
    this.metadata.vectorClock.set(nodeId, Math.max(currentClock, counter));
  }

  protected compareTimestamps(a: CRDTTimestamp, b: CRDTTimestamp): number {
    // First compare wall clock times
    if (a.wallClock !== b.wallClock) {
      return a.wallClock - b.wallClock;
    }
    // Then compare logical counters
    if (a.counter !== b.counter) {
      return a.counter - b.counter;
    }
    // Finally, use nodeId for deterministic ordering
    return a.nodeId.localeCompare(b.nodeId);
  }

  getMetadata(): CRDTMetadata {
    return { ...this.metadata };
  }

  updateChecksum(): void {
    const data = this.serialize();
    this.metadata.checksum = this.calculateChecksum(data);
  }

  private calculateChecksum(data: string): string {
    // Simple hash function for demonstration
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }
}

export class LWWRegister<T> extends CRDT<T> {
  private value: T;
  private lastWriteTimestamp: CRDTTimestamp;

  constructor(id: string, nodeId: string, initialValue: T) {
    super(id, nodeId, 'LWW_REGISTER');
    this.value = initialValue;
    this.lastWriteTimestamp = this.createTimestamp();
  }

  update(newValue: T): void {
    this.value = newValue;
    this.lastWriteTimestamp = this.createTimestamp();
    this.updateVectorClock(this.nodeId, this.lastWriteTimestamp.counter);
    this.updateChecksum();
    this.emit('updated', { value: newValue, timestamp: this.lastWriteTimestamp });
  }

  merge(other: LWWRegister<T>): LWWRegister<T> {
    const merged = new LWWRegister<T>(this.metadata.id, this.nodeId, this.value);
    
    // Merge vector clocks
    for (const [nodeId, counter] of other.metadata.vectorClock) {
      merged.updateVectorClock(nodeId, counter);
    }
    for (const [nodeId, counter] of this.metadata.vectorClock) {
      merged.updateVectorClock(nodeId, counter);
    }

    // Use last-writer-wins policy
    if (this.compareTimestamps(other.lastWriteTimestamp, this.lastWriteTimestamp) > 0) {
      merged.value = other.value;
      merged.lastWriteTimestamp = other.lastWriteTimestamp;
    } else {
      merged.value = this.value;
      merged.lastWriteTimestamp = this.lastWriteTimestamp;
    }

    merged.updateChecksum();
    return merged;
  }

  getValue(): T {
    return this.value;
  }

  serialize(): string {
    return JSON.stringify({
      metadata: {
        ...this.metadata,
        vectorClock: Array.from(this.metadata.vectorClock.entries())
      },
      value: this.value,
      lastWriteTimestamp: this.lastWriteTimestamp
    });
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.metadata = {
      ...parsed.metadata,
      vectorClock: new Map(parsed.metadata.vectorClock)
    };
    this.value = parsed.value;
    this.lastWriteTimestamp = parsed.lastWriteTimestamp;
  }
}

export class PNCounter extends CRDT<number> {
  private increments: Map<string, number> = new Map();
  private decrements: Map<string, number> = new Map();

  constructor(id: string, nodeId: string) {
    super(id, nodeId, 'PN_COUNTER');
    this.increments.set(nodeId, 0);
    this.decrements.set(nodeId, 0);
  }

  increment(amount: number = 1): void {
    if (amount <= 0) throw new Error('Increment amount must be positive');
    
    const current = this.increments.get(this.nodeId) || 0;
    this.increments.set(this.nodeId, current + amount);
    
    const timestamp = this.createTimestamp();
    this.updateVectorClock(this.nodeId, timestamp.counter);
    this.updateChecksum();
    
    this.emit('incremented', { amount, total: this.getValue() });
  }

  decrement(amount: number = 1): void {
    if (amount <= 0) throw new Error('Decrement amount must be positive');
    
    const current = this.decrements.get(this.nodeId) || 0;
    this.decrements.set(this.nodeId, current + amount);
    
    const timestamp = this.createTimestamp();
    this.updateVectorClock(this.nodeId, timestamp.counter);
    this.updateChecksum();
    
    this.emit('decremented', { amount, total: this.getValue() });
  }

  update(operation: { type: 'increment' | 'decrement'; amount: number }): void {
    if (operation.type === 'increment') {
      this.increment(operation.amount);
    } else if (operation.type === 'decrement') {
      this.decrement(operation.amount);
    }
  }

  merge(other: PNCounter): PNCounter {
    const merged = new PNCounter(this.metadata.id, this.nodeId);
    
    // Merge increments
    const allNodes = new Set([
      ...this.increments.keys(),
      ...other.increments.keys()
    ]);
    
    for (const nodeId of allNodes) {
      const thisInc = this.increments.get(nodeId) || 0;
      const otherInc = other.increments.get(nodeId) || 0;
      merged.increments.set(nodeId, Math.max(thisInc, otherInc));
    }

    // Merge decrements
    const allDecrementNodes = new Set([
      ...this.decrements.keys(),
      ...other.decrements.keys()
    ]);
    
    for (const nodeId of allDecrementNodes) {
      const thisDec = this.decrements.get(nodeId) || 0;
      const otherDec = other.decrements.get(nodeId) || 0;
      merged.decrements.set(nodeId, Math.max(thisDec, otherDec));
    }

    // Merge vector clocks
    for (const [nodeId, counter] of other.metadata.vectorClock) {
      merged.updateVectorClock(nodeId, counter);
    }
    for (const [nodeId, counter] of this.metadata.vectorClock) {
      merged.updateVectorClock(nodeId, counter);
    }

    merged.updateChecksum();
    return merged;
  }

  getValue(): number {
    const totalIncrements = Array.from(this.increments.values()).reduce((sum, val) => sum + val, 0);
    const totalDecrements = Array.from(this.decrements.values()).reduce((sum, val) => sum + val, 0);
    return totalIncrements - totalDecrements;
  }

  serialize(): string {
    return JSON.stringify({
      metadata: {
        ...this.metadata,
        vectorClock: Array.from(this.metadata.vectorClock.entries())
      },
      increments: Array.from(this.increments.entries()),
      decrements: Array.from(this.decrements.entries())
    });
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.metadata = {
      ...parsed.metadata,
      vectorClock: new Map(parsed.metadata.vectorClock)
    };
    this.increments = new Map(parsed.increments);
    this.decrements = new Map(parsed.decrements);
  }
}

export class ORSet<T> extends CRDT<Set<T>> {
  private added: Map<T, Set<string>> = new Map();
  private removed: Map<T, Set<string>> = new Map();

  constructor(id: string, nodeId: string) {
    super(id, nodeId, 'OR_SET');
  }

  add(element: T): void {
    const elementId = this.generateElementId();
    
    if (!this.added.has(element)) {
      this.added.set(element, new Set());
    }
    this.added.get(element)!.add(elementId);
    
    const timestamp = this.createTimestamp();
    this.updateVectorClock(this.nodeId, timestamp.counter);
    this.updateChecksum();
    
    this.emit('elementAdded', { element, elementId });
  }

  remove(element: T): void {
    if (!this.added.has(element)) {
      return; // Can't remove what wasn't added
    }

    const elementIds = this.added.get(element)!;
    if (!this.removed.has(element)) {
      this.removed.set(element, new Set());
    }
    
    // Remove all instances of this element
    for (const elementId of elementIds) {
      this.removed.get(element)!.add(elementId);
    }
    
    const timestamp = this.createTimestamp();
    this.updateVectorClock(this.nodeId, timestamp.counter);
    this.updateChecksum();
    
    this.emit('elementRemoved', { element });
  }

  update(operation: { type: 'add' | 'remove'; element: T }): void {
    if (operation.type === 'add') {
      this.add(operation.element);
    } else if (operation.type === 'remove') {
      this.remove(operation.element);
    }
  }

  merge(other: ORSet<T>): ORSet<T> {
    const merged = new ORSet<T>(this.metadata.id, this.nodeId);
    
    // Merge added elements
    const allAddedElements = new Set([
      ...this.added.keys(),
      ...other.added.keys()
    ]);
    
    for (const element of allAddedElements) {
      const thisIds = this.added.get(element) || new Set();
      const otherIds = other.added.get(element) || new Set();
      merged.added.set(element, new Set([...thisIds, ...otherIds]));
    }

    // Merge removed elements
    const allRemovedElements = new Set([
      ...this.removed.keys(),
      ...other.removed.keys()
    ]);
    
    for (const element of allRemovedElements) {
      const thisIds = this.removed.get(element) || new Set();
      const otherIds = other.removed.get(element) || new Set();
      merged.removed.set(element, new Set([...thisIds, ...otherIds]));
    }

    // Merge vector clocks
    for (const [nodeId, counter] of other.metadata.vectorClock) {
      merged.updateVectorClock(nodeId, counter);
    }
    for (const [nodeId, counter] of this.metadata.vectorClock) {
      merged.updateVectorClock(nodeId, counter);
    }

    merged.updateChecksum();
    return merged;
  }

  getValue(): Set<T> {
    const result = new Set<T>();
    
    for (const [element, addedIds] of this.added) {
      const removedIds = this.removed.get(element) || new Set();
      
      // Element is in the set if any added ID is not in removed IDs
      const hasNonRemovedId = Array.from(addedIds).some(id => !removedIds.has(id));
      if (hasNonRemovedId) {
        result.add(element);
      }
    }
    
    return result;
  }

  private generateElementId(): string {
    return `${this.nodeId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  serialize(): string {
    return JSON.stringify({
      metadata: {
        ...this.metadata,
        vectorClock: Array.from(this.metadata.vectorClock.entries())
      },
      added: Array.from(this.added.entries()).map(([element, ids]) => [element, Array.from(ids)]),
      removed: Array.from(this.removed.entries()).map(([element, ids]) => [element, Array.from(ids)])
    });
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.metadata = {
      ...parsed.metadata,
      vectorClock: new Map(parsed.metadata.vectorClock)
    };
    this.added = new Map(parsed.added.map(([element, ids]) => [element, new Set(ids)]));
    this.removed = new Map(parsed.removed.map(([element, ids]) => [element, new Set(ids)]));
  }
}

export class CRDTResolver extends EventEmitter {
  private crdts: Map<string, CRDT> = new Map();
  private nodeId: string;
  private syncProtocol: SyncProtocol;

  constructor(nodeId: string, syncProtocol: SyncProtocol) {
    super();
    this.nodeId = nodeId;
    this.syncProtocol = syncProtocol;
  }

  createLWWRegister<T>(id: string, initialValue: T): LWWRegister<T> {
    const crdt = new LWWRegister(id, this.nodeId, initialValue);
    this.crdts.set(id, crdt);
    this.setupCRDTEventHandlers(crdt);
    return crdt;
  }

  createPNCounter(id: string): PNCounter {
    const crdt = new PNCounter(id, this.nodeId);
    this.crdts.set(id, crdt);
    this.setupCRDTEventHandlers(crdt);
    return crdt;
  }

  createORSet<T>(id: string): ORSet<T> {
    const crdt = new ORSet<T>(id, this.nodeId);
    this.crdts.set(id, crdt);
    this.setupCRDTEventHandlers(crdt);
    return crdt;
  }

  getCRDT<T extends CRDT>(id: string): T | undefined {
    return this.crdts.get(id) as T;
  }

  async mergeCRDTs(incomingCRDTs: Map<string, string>): Promise<ConflictResolutionResult> {
    const conflicts: ConflictInfo[] = [];
    const mergedCRDTs: string[] = [];

    for (const [id, serializedCRDT] of incomingCRDTs) {
      const localCRDT = this.crdts.get(id);
      
      if (!localCRDT) {
        // Create new CRDT from incoming data
        await this.deserializeAndStoreCRDT(id, serializedCRDT);
        mergedCRDTs.push(id);
        continue;
      }

      try {
        // Create temporary CRDT to merge with
        const tempCRDT = this.createCRDTFromSerialized(localCRDT.getMetadata().type, id, serializedCRDT);
        
        // Perform merge
        const mergedCRDT = localCRDT.merge(tempCRDT);
        
        // Replace local CRDT with merged version
        this.crdts.set(id, mergedCRDT);
        this.setupCRDTEventHandlers(mergedCRDT);
        
        mergedCRDTs.push(id);
        
        this.emit('crdtMerged', {
          id,
          type: localCRDT.getMetadata().type,
          hasConflict: false
        });

      } catch (error) {
        conflicts.push({
          crdtId: id,
          conflictType: 'MERGE_ERROR',
          details: error.message,
          resolution: 'KEEP_LOCAL'
        });
      }
    }

    return {
      mergedCRDTs,
      conflicts,
      success: conflicts.length === 0
    };
  }

  private createCRDTFromSerialized(type: CRDTType, id: string, serializedData: string): CRDT {
    let crdt: CRDT;
    
    switch (type) {
      case 'LWW_REGISTER':
        crdt = new LWWRegister(id, this.nodeId, null);
        break;
      case 'PN_COUNTER':
        crdt = new PNCounter(id, this.nodeId);
        break;
      case 'OR_SET':
        crdt = new ORSet(id, this.nodeId);
        break;
      default:
        throw new Error(`Unsupported CRDT type: ${type}`);
    }
    
    crdt.deserialize(serializedData);
    return crdt;
  }

  private async deserializeAndStoreCRDT(id: string, serializedData: string): Promise<void> {
    const parsed = JSON.parse(serializedData);
    const type = parsed.metadata.type;
    
    const crdt = this.createCRDTFromSerialized(type, id, serializedData);
    this.crdts.set(id, crdt);
    this.setupCRDTEventHandlers(crdt);
  }

  private setupCRDTEventHandlers(crdt: CRDT): void {
    crdt.on('updated', (data) => {
      this.emit('crdtUpdated', {
        id: crdt.getMetadata().id,
        type: crdt.getMetadata().type,
        data
      });
      
      // Trigger synchronization
      this.syncProtocol.scheduleCRDTSync(crdt.getMetadata().id);
    });

    crdt.on('incremented', (data) => this.emit('crdtModified', { crdt, operation: 'increment', data }));
    crdt.on('decremented', (data) => this.emit('crdtModified', { crdt, operation: 'decrement', data }));
    crdt.on('elementAdded', (data) => this.emit('crdtModified', { crdt, operation: 'add', data }));
    crdt.on('elementRemoved', (data) => this.emit('crdtModified', { crdt, operation: 'remove', data }));
  }

  getAllCRDTs(): Map<string, string> {
    const serializedCRDTs = new Map<string, string>();
    
    for (const [id, crdt] of this.crdts) {
      serializedCRDTs.set(id, crdt.serialize());
    }
    
    return serializedCRDTs;
  }

  getVectorClock(): Map<string, number> {
    const vectorClock = new Map<string, number>();
    
    for (const crdt of this.crdts.values()) {
      const crdtVectorClock = crdt.getMetadata().vectorClock;
      for (const [nodeId, counter] of crdtVectorClock) {
        const currentCounter = vectorClock.get(nodeId) || 0;
        vectorClock.set(nodeId, Math.max(currentCounter, counter));
      }
    }
    
    return vectorClock;
  }
}

interface ConflictResolutionResult {
  mergedCRDTs: string[];
  conflicts: ConflictInfo[];
  success: boolean;
}

interface ConflictInfo {
  crdtId: string;
  conflictType: 'MERGE_ERROR' | 'TYPE_MISMATCH' | 'CORRUPTION';
  details: string;
  resolution: 'KEEP_LOCAL' | 'KEEP_REMOTE' | 'MANUAL_REQUIRED';
}

// Forward declaration for SyncProtocol
interface SyncProtocol {
  scheduleCRDTSync(crdtId: string): void;
}
```

#### 1.2 Vector Clock Implementation
**File: `core/storage/vectorClock.ts` (New)**
```typescript
export class VectorClock {
  private clock: Map<string, number>;
  private nodeId: string;

  constructor(nodeId: string, initialClock?: Map<string, number>) {
    this.nodeId = nodeId;
    this.clock = new Map(initialClock);
    
    // Ensure this node exists in the clock
    if (!this.clock.has(nodeId)) {
      this.clock.set(nodeId, 0);
    }
  }

  tick(): VectorClock {
    const newClock = new Map(this.clock);
    const currentValue = newClock.get(this.nodeId) || 0;
    newClock.set(this.nodeId, currentValue + 1);
    return new VectorClock(this.nodeId, newClock);
  }

  update(otherClock: VectorClock): VectorClock {
    const newClock = new Map(this.clock);
    
    // Merge with other clock (take maximum for each node)
    for (const [nodeId, timestamp] of otherClock.clock) {
      const currentValue = newClock.get(nodeId) || 0;
      newClock.set(nodeId, Math.max(currentValue, timestamp));
    }
    
    // Increment our own counter
    const ourValue = newClock.get(this.nodeId) || 0;
    newClock.set(this.nodeId, ourValue + 1);
    
    return new VectorClock(this.nodeId, newClock);
  }

  compare(other: VectorClock): VectorClockComparison {
    const allNodes = new Set([...this.clock.keys(), ...other.clock.keys()]);
    
    let thisGreater = false;
    let otherGreater = false;
    
    for (const nodeId of allNodes) {
      const thisValue = this.clock.get(nodeId) || 0;
      const otherValue = other.clock.get(nodeId) || 0;
      
      if (thisValue > otherValue) {
        thisGreater = true;
      } else if (otherValue > thisValue) {
        otherGreater = true;
      }
    }
    
    if (thisGreater && !otherGreater) {
      return VectorClockComparison.GREATER;
    } else if (otherGreater && !thisGreater) {
      return VectorClockComparison.LESS;
    } else if (!thisGreater && !otherGreater) {
      return VectorClockComparison.EQUAL;
    } else {
      return VectorClockComparison.CONCURRENT;
    }
  }

  isGreaterThan(other: VectorClock): boolean {
    return this.compare(other) === VectorClockComparison.GREATER;
  }

  isLessThan(other: VectorClock): boolean {
    return this.compare(other) === VectorClockComparison.LESS;
  }

  isEqual(other: VectorClock): boolean {
    return this.compare(other) === VectorClockComparison.EQUAL;
  }

  isConcurrent(other: VectorClock): boolean {
    return this.compare(other) === VectorClockComparison.CONCURRENT;
  }

  serialize(): string {
    return JSON.stringify(Array.from(this.clock.entries()));
  }

  static deserialize(nodeId: string, serialized: string): VectorClock {
    const entries = JSON.parse(serialized);
    return new VectorClock(nodeId, new Map(entries));
  }

  getClock(): Map<string, number> {
    return new Map(this.clock);
  }

  getTimestamp(nodeId: string): number {
    return this.clock.get(nodeId) || 0;
  }

  getAllNodes(): string[] {
    return Array.from(this.clock.keys());
  }

  clone(): VectorClock {
    return new VectorClock(this.nodeId, new Map(this.clock));
  }
}

export enum VectorClockComparison {
  GREATER = 'GREATER',
  LESS = 'LESS',
  EQUAL = 'EQUAL',
  CONCURRENT = 'CONCURRENT'
}
```

### Phase 2: Distributed Synchronization Protocol (Hours 5-8)

#### 2.1 Synchronization Protocol Implementation
**File: `core/storage/syncProtocol.ts` (New)**
```typescript
import { EventEmitter } from 'events';
import { CRDTResolver } from './crdtResolver';
import { VectorClock } from './vectorClock';

export class SyncProtocol extends EventEmitter {
  private nodeId: string;
  private crdtResolver: CRDTResolver;
  private peers: Map<string, PeerConnection>;
  private syncQueue: Map<string, SyncOperation>;
  private vectorClock: VectorClock;
  private syncIntervals: Map<string, NodeJS.Timeout>;
  private offlineQueue: OfflineOperationQueue;

  constructor(nodeId: string) {
    super();
    this.nodeId = nodeId;
    this.peers = new Map();
    this.syncQueue = new Map();
    this.vectorClock = new VectorClock(nodeId);
    this.syncIntervals = new Map();
    this.offlineQueue = new OfflineOperationQueue();
    
    // Initialize CRDT resolver with sync protocol reference
    this.crdtResolver = new CRDTResolver(nodeId, this);
  }

  async addPeer(peerId: string, connection: PeerConnection): Promise<void> {
    this.peers.set(peerId, connection);
    
    // Setup connection event handlers
    this.setupPeerEventHandlers(peerId, connection);
    
    // Start periodic sync with this peer
    this.startPeriodicSync(peerId);
    
    // Perform initial sync
    await this.performInitialSync(peerId);
    
    this.emit('peerAdded', { peerId, connection });
  }

  async removePeer(peerId: string): Promise<void> {
    const connection = this.peers.get(peerId);
    if (connection) {
      await connection.close();
      this.peers.delete(peerId);
      
      // Stop periodic sync
      this.stopPeriodicSync(peerId);
      
      this.emit('peerRemoved', { peerId });
    }
  }

  scheduleCRDTSync(crdtId: string): void {
    if (this.syncQueue.has(crdtId)) {
      // Update existing sync operation
      const existing = this.syncQueue.get(crdtId)!;
      existing.priority = Math.min(existing.priority + 1, 10);
      existing.lastModified = Date.now();
    } else {
      // Create new sync operation
      this.syncQueue.set(crdtId, {
        crdtId,
        priority: 1,
        lastModified: Date.now(),
        attempts: 0,
        targetPeers: Array.from(this.peers.keys())
      });
    }

    // Trigger immediate sync for high priority changes
    if (this.syncQueue.get(crdtId)!.priority >= 5) {
      this.processImmediateSync(crdtId);
    }
  }

  private async performInitialSync(peerId: string): Promise<void> {
    try {
      const connection = this.peers.get(peerId);
      if (!connection) return;

      // Send our vector clock to determine what needs syncing
      const ourVectorClock = this.crdtResolver.getVectorClock();
      const syncRequest: SyncRequest = {
        type: 'INITIAL_SYNC',
        vectorClock: ourVectorClock,
        nodeId: this.nodeId,
        timestamp: Date.now()
      };

      const response = await connection.sendMessage(syncRequest);
      
      if (response.type === 'SYNC_RESPONSE') {
        await this.processSyncResponse(peerId, response);
      }

    } catch (error) {
      this.emit('syncError', {
        peerId,
        error: error.message,
        type: 'INITIAL_SYNC_FAILED'
      });
    }
  }

  private async processSyncResponse(peerId: string, response: SyncResponse): Promise<void> {
    const { crdts, vectorClock } = response;
    
    // Update our vector clock
    this.vectorClock = this.vectorClock.update(VectorClock.deserialize(this.nodeId, JSON.stringify(vectorClock)));
    
    // Merge incoming CRDTs
    if (crdts.size > 0) {
      const mergeResult = await this.crdtResolver.mergeCRDTs(crdts);
      
      this.emit('syncCompleted', {
        peerId,
        mergedCRDTs: mergeResult.mergedCRDTs.length,
        conflicts: mergeResult.conflicts.length,
        success: mergeResult.success
      });
      
      // Handle conflicts if any
      if (mergeResult.conflicts.length > 0) {
        await this.handleSyncConflicts(peerId, mergeResult.conflicts);
      }
    }
  }

  private async handleSyncConflicts(peerId: string, conflicts: any[]): Promise<void> {
    for (const conflict of conflicts) {
      this.emit('syncConflict', {
        peerId,
        conflict,
        timestamp: Date.now()
      });
      
      // Apply conflict resolution strategy
      await this.applyConflictResolution(conflict);
    }
  }

  private async applyConflictResolution(conflict: any): Promise<void> {
    // Default conflict resolution strategies
    switch (conflict.resolution) {
      case 'KEEP_LOCAL':
        // Do nothing, keep local version
        break;
      case 'KEEP_REMOTE':
        // This should be handled during merge
        break;
      case 'MANUAL_REQUIRED':
        this.emit('manualConflictResolutionRequired', conflict);
        break;
    }
  }

  private startPeriodicSync(peerId: string): void {
    const interval = setInterval(async () => {
      await this.performPeriodicSync(peerId);
    }, this.getSyncInterval(peerId));
    
    this.syncIntervals.set(peerId, interval);
  }

  private stopPeriodicSync(peerId: string): void {
    const interval = this.syncIntervals.get(peerId);
    if (interval) {
      clearInterval(interval);
      this.syncIntervals.delete(peerId);
    }
  }

  private getSyncInterval(peerId: string): number {
    // Adaptive sync interval based on peer activity and connection quality
    const baseSyncInterval = 30000; // 30 seconds
    const connection = this.peers.get(peerId);
    
    if (connection && connection.getQuality) {
      const quality = connection.getQuality();
      return Math.max(5000, baseSyncInterval * (2 - quality)); // 5s to 60s range
    }
    
    return baseSyncInterval;
  }

  private async performPeriodicSync(peerId: string): Promise<void> {
    try {
      // Check if we have pending sync operations for this peer
      const pendingOps = this.getPendingSyncOperations(peerId);
      
      if (pendingOps.length === 0) {
        // Perform lightweight heartbeat sync
        await this.performHeartbeatSync(peerId);
      } else {
        // Perform delta sync for pending operations
        await this.performDeltaSync(peerId, pendingOps);
      }

    } catch (error) {
      this.emit('syncError', {
        peerId,
        error: error.message,
        type: 'PERIODIC_SYNC_FAILED'
      });
    }
  }

  private async performHeartbeatSync(peerId: string): Promise<void> {
    const connection = this.peers.get(peerId);
    if (!connection) return;

    const heartbeat: HeartbeatMessage = {
      type: 'HEARTBEAT',
      nodeId: this.nodeId,
      vectorClock: this.vectorClock.serialize(),
      timestamp: Date.now()
    };

    await connection.sendMessage(heartbeat);
  }

  private async performDeltaSync(peerId: string, operations: SyncOperation[]): Promise<void> {
    const connection = this.peers.get(peerId);
    if (!connection) return;

    // Collect CRDTs that need syncing
    const crdtsToSync = new Map<string, string>();
    
    for (const op of operations) {
      const crdt = this.crdtResolver.getCRDT(op.crdtId);
      if (crdt) {
        crdtsToSync.set(op.crdtId, crdt.serialize());
      }
    }

    const deltaSync: DeltaSyncMessage = {
      type: 'DELTA_SYNC',
      nodeId: this.nodeId,
      vectorClock: this.vectorClock.serialize(),
      crdts: crdtsToSync,
      timestamp: Date.now()
    };

    const response = await connection.sendMessage(deltaSync);
    
    if (response.type === 'SYNC_RESPONSE') {
      await this.processSyncResponse(peerId, response);
      
      // Mark operations as completed
      for (const op of operations) {
        this.syncQueue.delete(op.crdtId);
      }
    }
  }

  private getPendingSyncOperations(peerId: string): SyncOperation[] {
    return Array.from(this.syncQueue.values())
      .filter(op => op.targetPeers.includes(peerId))
      .sort((a, b) => b.priority - a.priority);
  }

  private async processImmediateSync(crdtId: string): Promise<void> {
    const operation = this.syncQueue.get(crdtId);
    if (!operation) return;

    // Send to all target peers immediately
    const syncPromises = operation.targetPeers.map(peerId => 
      this.performDeltaSync(peerId, [operation])
    );

    try {
      await Promise.allSettled(syncPromises);
    } catch (error) {
      this.emit('syncError', {
        crdtId,
        error: error.message,
        type: 'IMMEDIATE_SYNC_FAILED'
      });
    }
  }

  private setupPeerEventHandlers(peerId: string, connection: PeerConnection): void {
    connection.on('message', async (message) => {
      await this.handlePeerMessage(peerId, message);
    });

    connection.on('disconnect', () => {
      this.handlePeerDisconnect(peerId);
    });

    connection.on('error', (error) => {
      this.emit('syncError', {
        peerId,
        error: error.message,
        type: 'CONNECTION_ERROR'
      });
    });
  }

  private async handlePeerMessage(peerId: string, message: any): Promise<void> {
    switch (message.type) {
      case 'SYNC_REQUEST':
        await this.handleSyncRequest(peerId, message);
        break;
      case 'DELTA_SYNC':
        await this.handleDeltaSync(peerId, message);
        break;
      case 'HEARTBEAT':
        await this.handleHeartbeat(peerId, message);
        break;
      default:
        this.emit('unknownMessage', { peerId, message });
    }
  }

  private async handleSyncRequest(peerId: string, request: SyncRequest): Promise<void> {
    const connection = this.peers.get(peerId);
    if (!connection) return;

    // Determine what CRDTs need to be sent based on vector clocks
    const theirVectorClock = new Map(request.vectorClock);
    const ourVectorClock = this.crdtResolver.getVectorClock();
    
    const crdtsToSend = new Map<string, string>();
    
    // Find CRDTs that are newer than what the peer has
    const allCRDTs = this.crdtResolver.getAllCRDTs();
    for (const [crdtId, serializedCRDT] of allCRDTs) {
      // Simplified logic - in practice, this would be more sophisticated
      const shouldSend = this.shouldSendCRDT(crdtId, theirVectorClock, ourVectorClock);
      if (shouldSend) {
        crdtsToSend.set(crdtId, serializedCRDT);
      }
    }

    const response: SyncResponse = {
      type: 'SYNC_RESPONSE',
      nodeId: this.nodeId,
      vectorClock: ourVectorClock,
      crdts: crdtsToSend,
      timestamp: Date.now()
    };

    await connection.sendMessage(response);
  }

  private shouldSendCRDT(
    crdtId: string, 
    theirVectorClock: Map<string, number>, 
    ourVectorClock: Map<string, number>
  ): boolean {
    // Simplified logic - send if we have updates they don't
    for (const [nodeId, ourTimestamp] of ourVectorClock) {
      const theirTimestamp = theirVectorClock.get(nodeId) || 0;
      if (ourTimestamp > theirTimestamp) {
        return true;
      }
    }
    return false;
  }

  private async handleDeltaSync(peerId: string, message: DeltaSyncMessage): Promise<void> {
    // Process incoming delta sync
    if (message.crdts.size > 0) {
      const mergeResult = await this.crdtResolver.mergeCRDTs(message.crdts);
      
      // Send response with our updates
      await this.handleSyncRequest(peerId, {
        type: 'SYNC_REQUEST',
        nodeId: message.nodeId,
        vectorClock: new Map(JSON.parse(message.vectorClock)),
        timestamp: message.timestamp
      });
    }
  }

  private async handleHeartbeat(peerId: string, message: HeartbeatMessage): Promise<void> {
    // Update peer's vector clock information
    const theirVectorClock = VectorClock.deserialize(this.nodeId, message.vectorClock);
    
    // Check if we need to sync anything
    if (this.vectorClock.isConcurrent(theirVectorClock)) {
      await this.performInitialSync(peerId);
    }
  }

  private handlePeerDisconnect(peerId: string): void {
    // Queue operations for this peer for later sync
    const pendingOps = this.getPendingSyncOperations(peerId);
    for (const op of pendingOps) {
      this.offlineQueue.addOperation(peerId, op);
    }
    
    this.stopPeriodicSync(peerId);
    this.emit('peerDisconnected', { peerId });
  }

  async handleNetworkPartition(): Promise<void> {
    // Switch to offline mode
    this.emit('networkPartition', { timestamp: Date.now() });
    
    // Queue all operations for offline processing
    for (const [crdtId, operation] of this.syncQueue) {
      this.offlineQueue.addOperation('*', operation);
    }
    
    this.syncQueue.clear();
  }

  async handleNetworkReconnection(): Promise<void> {
    this.emit('networkReconnection', { timestamp: Date.now() });
    
    // Process offline queue
    const offlineOperations = this.offlineQueue.getAllOperations();
    
    for (const [peerId, operations] of offlineOperations) {
      if (peerId === '*') {
        // Operations for all peers
        for (const [actualPeerId] of this.peers) {
          for (const op of operations) {
            this.syncQueue.set(op.crdtId, op);
          }
        }
      } else if (this.peers.has(peerId)) {
        // Operations for specific peer
        for (const op of operations) {
          this.syncQueue.set(op.crdtId, op);
        }
      }
    }
    
    this.offlineQueue.clear();
    
    // Trigger sync with all peers
    for (const peerId of this.peers.keys()) {
      await this.performInitialSync(peerId);
    }
  }

  getCRDTResolver(): CRDTResolver {
    return this.crdtResolver;
  }

  getVectorClock(): VectorClock {
    return this.vectorClock.clone();
  }

  getPeerCount(): number {
    return this.peers.size;
  }

  getSyncQueueSize(): number {
    return this.syncQueue.size;
  }
}

class OfflineOperationQueue {
  private operations: Map<string, SyncOperation[]> = new Map();

  addOperation(peerId: string, operation: SyncOperation): void {
    if (!this.operations.has(peerId)) {
      this.operations.set(peerId, []);
    }
    this.operations.get(peerId)!.push(operation);
  }

  getAllOperations(): Map<string, SyncOperation[]> {
    return new Map(this.operations);
  }

  clear(): void {
    this.operations.clear();
  }
}

interface SyncOperation {
  crdtId: string;
  priority: number;
  lastModified: number;
  attempts: number;
  targetPeers: string[];
}

interface SyncRequest {
  type: 'SYNC_REQUEST' | 'INITIAL_SYNC';
  nodeId: string;
  vectorClock: Map<string, number>;
  timestamp: number;
}

interface SyncResponse {
  type: 'SYNC_RESPONSE';
  nodeId: string;
  vectorClock: Map<string, number>;
  crdts: Map<string, string>;
  timestamp: number;
}

interface DeltaSyncMessage {
  type: 'DELTA_SYNC';
  nodeId: string;
  vectorClock: string;
  crdts: Map<string, string>;
  timestamp: number;
}

interface HeartbeatMessage {
  type: 'HEARTBEAT';
  nodeId: string;
  vectorClock: string;
  timestamp: number;
}

interface PeerConnection extends EventEmitter {
  sendMessage(message: any): Promise<any>;
  close(): Promise<void>;
  getQuality?(): number; // 0-1 range
}
```

### Phase 3: Enhanced Local Storage (Hours 9-12)

#### 3.1 Enhanced SQLite Adapter with CRDT Support
**File: `core/storage/sqliteAdapter.ts` (Update existing)**
```typescript
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { StorageAdapter, StorageResult, QueryOptions } from '../../contracts/storageAdapter';

export class SQLiteAdapter implements StorageAdapter {
  private db: Database | null = null;
  private dbPath: string;
  private writeAheadLog: WriteAheadLog;
  private storageCompactor: StorageCompactor;
  private crdtMetadataCache: Map<string, CRDTStorageMetadata> = new Map();

  constructor(dbPath: string = './data/logomesh.db') {
    this.dbPath = dbPath;
    this.writeAheadLog = new WriteAheadLog(dbPath + '.wal');
    this.storageCompactor = new StorageCompactor(this);
  }

  async initialize(): Promise<void> {
    this.db = await open({
      filename: this.dbPath,
      driver: sqlite3.Database
    });

    await this.createTables();
    await this.createIndexes();
    await this.writeAheadLog.initialize();
    
    // Start background compaction
    this.storageCompactor.start();
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Original tables
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS thoughts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT,
        type TEXT DEFAULT 'text',
        tags TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        parent_id TEXT,
        metadata TEXT,
        FOREIGN KEY (parent_id) REFERENCES thoughts(id)
      );

      CREATE TABLE IF NOT EXISTS thought_relationships (
        id TEXT PRIMARY KEY,
        source_id TEXT NOT NULL,
        target_id TEXT NOT NULL,
        relationship_type TEXT NOT NULL,
        weight REAL DEFAULT 1.0,
        created_at INTEGER NOT NULL,
        metadata TEXT,
        FOREIGN KEY (source_id) REFERENCES thoughts(id),
        FOREIGN KEY (target_id) REFERENCES thoughts(id)
      );

      CREATE TABLE IF NOT EXISTS thought_embeddings (
        thought_id TEXT NOT NULL,
        embedding_type TEXT NOT NULL,
        embedding_vector BLOB NOT NULL,
        dimension INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        PRIMARY KEY (thought_id, embedding_type),
        FOREIGN KEY (thought_id) REFERENCES thoughts(id)
      );
    `);

    // CRDT-specific tables
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS crdt_storage (
        crdt_id TEXT PRIMARY KEY,
        crdt_type TEXT NOT NULL,
        crdt_data TEXT NOT NULL,
        node_id TEXT NOT NULL,
        vector_clock TEXT NOT NULL,
        checksum TEXT NOT NULL,
        last_modified INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS crdt_deltas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        crdt_id TEXT NOT NULL,
        delta_data TEXT NOT NULL,
        vector_clock TEXT NOT NULL,
        node_id TEXT NOT NULL,
        operation_type TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        applied BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (crdt_id) REFERENCES crdt_storage(crdt_id)
      );

      CREATE TABLE IF NOT EXISTS crdt_metadata (
        crdt_id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        sync_status TEXT DEFAULT 'PENDING',
        last_sync INTEGER,
        conflict_count INTEGER DEFAULT 0,
        storage_size INTEGER DEFAULT 0,
        FOREIGN KEY (crdt_id) REFERENCES crdt_storage(crdt_id)
      );

      CREATE TABLE IF NOT EXISTS wal_operations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        operation_type TEXT NOT NULL,
        table_name TEXT NOT NULL,
        operation_data TEXT NOT NULL,
        transaction_id TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        committed BOOLEAN DEFAULT FALSE
      );
    `);
  }

  private async createIndexes(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_thoughts_created_at ON thoughts(created_at);
      CREATE INDEX IF NOT EXISTS idx_thoughts_updated_at ON thoughts(updated_at);
      CREATE INDEX IF NOT EXISTS idx_thoughts_type ON thoughts(type);
      CREATE INDEX IF NOT EXISTS idx_thoughts_parent_id ON thoughts(parent_id);
      
      CREATE INDEX IF NOT EXISTS idx_relationships_source ON thought_relationships(source_id);
      CREATE INDEX IF NOT EXISTS idx_relationships_target ON thought_relationships(target_id);
      CREATE INDEX IF NOT EXISTS idx_relationships_type ON thought_relationships(relationship_type);
      
      CREATE INDEX IF NOT EXISTS idx_embeddings_thought_id ON thought_embeddings(thought_id);
      CREATE INDEX IF NOT EXISTS idx_embeddings_type ON thought_embeddings(embedding_type);
      
      CREATE INDEX IF NOT EXISTS idx_crdt_storage_type ON crdt_storage(crdt_type);
      CREATE INDEX IF NOT EXISTS idx_crdt_storage_node_id ON crdt_storage(node_id);
      CREATE INDEX IF NOT EXISTS idx_crdt_storage_modified ON crdt_storage(last_modified);
      
      CREATE INDEX IF NOT EXISTS idx_crdt_deltas_crdt_id ON crdt_deltas(crdt_id);
      CREATE INDEX IF NOT EXISTS idx_crdt_deltas_timestamp ON crdt_deltas(timestamp);
      CREATE INDEX IF NOT EXISTS idx_crdt_deltas_applied ON crdt_deltas(applied);
      
      CREATE INDEX IF NOT EXISTS idx_crdt_metadata_entity ON crdt_metadata(entity_type, entity_id);
      CREATE INDEX IF NOT EXISTS idx_crdt_metadata_sync_status ON crdt_metadata(sync_status);
      
      CREATE INDEX IF NOT EXISTS idx_wal_transaction ON wal_operations(transaction_id);
      CREATE INDEX IF NOT EXISTS idx_wal_committed ON wal_operations(committed);
    `);
  }

  // CRDT-specific methods
  async storeCRDT(crdtId: string, crdtData: CRDTStorageData): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transactionId = this.generateTransactionId();
    
    try {
      await this.writeAheadLog.logOperation({
        type: 'STORE_CRDT',
        crdtId,
        data: crdtData,
        transactionId,
        timestamp: Date.now()
      });

      await this.db.run(`
        INSERT OR REPLACE INTO crdt_storage 
        (crdt_id, crdt_type, crdt_data, node_id, vector_clock, checksum, last_modified, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        crdtId,
        crdtData.type,
        crdtData.serializedData,
        crdtData.nodeId,
        crdtData.vectorClock,
        crdtData.checksum,
        Date.now(),
        Date.now()
      ]);

      // Update metadata
      await this.updateCRDTMetadata(crdtId, {
        entityType: crdtData.entityType || 'unknown',
        entityId: crdtData.entityId || crdtId,
        syncStatus: 'PENDING',
        storageSize: crdtData.serializedData.length
      });

      await this.writeAheadLog.commitTransaction(transactionId);
      
      // Update cache
      this.crdtMetadataCache.set(crdtId, {
        crdtId,
        entityType: crdtData.entityType || 'unknown',
        entityId: crdtData.entityId || crdtId,
        syncStatus: 'PENDING',
        lastSync: null,
        conflictCount: 0,
        storageSize: crdtData.serializedData.length
      });

    } catch (error) {
      await this.writeAheadLog.rollbackTransaction(transactionId);
      throw error;
    }
  }

  async getCRDT(crdtId: string): Promise<CRDTStorageData | null> {
    if (!this.db) throw new Error('Database not initialized');

    const row = await this.db.get(`
      SELECT crdt_id, crdt_type, crdt_data, node_id, vector_clock, checksum, last_modified
      FROM crdt_storage 
      WHERE crdt_id = ?
    `, [crdtId]);

    if (!row) return null;

    return {
      type: row.crdt_type,
      serializedData: row.crdt_data,
      nodeId: row.node_id,
      vectorClock: row.vector_clock,
      checksum: row.checksum,
      lastModified: row.last_modified
    };
  }

  async storeCRDTDelta(crdtId: string, delta: CRDTDelta): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.run(`
      INSERT INTO crdt_deltas 
      (crdt_id, delta_data, vector_clock, node_id, operation_type, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      crdtId,
      delta.deltaData,
      delta.vectorClock,
      delta.nodeId,
      delta.operationType,
      delta.timestamp
    ]);
  }

  async getCRDTDeltas(crdtId: string, since?: number): Promise<CRDTDelta[]> {
    if (!this.db) throw new Error('Database not initialized');

    let query = `
      SELECT delta_data, vector_clock, node_id, operation_type, timestamp
      FROM crdt_deltas 
      WHERE crdt_id = ? AND applied = FALSE
    `;
    const params: any[] = [crdtId];

    if (since) {
      query += ' AND timestamp > ?';
      params.push(since);
    }

    query += ' ORDER BY timestamp ASC';

    const rows = await this.db.all(query, params);
    
    return rows.map(row => ({
      deltaData: row.delta_data,
      vectorClock: row.vector_clock,
      nodeId: row.node_id,
      operationType: row.operation_type,
      timestamp: row.timestamp
    }));
  }

  async markDeltasApplied(crdtId: string, timestamps: number[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const placeholders = timestamps.map(() => '?').join(',');
    await this.db.run(`
      UPDATE crdt_deltas 
      SET applied = TRUE 
      WHERE crdt_id = ? AND timestamp IN (${placeholders})
    `, [crdtId, ...timestamps]);
  }

  private async updateCRDTMetadata(crdtId: string, metadata: Partial<CRDTStorageMetadata>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const fields = [];
    const values = [];

    if (metadata.syncStatus) {
      fields.push('sync_status = ?');
      values.push(metadata.syncStatus);
    }
    if (metadata.lastSync) {
      fields.push('last_sync = ?');
      values.push(metadata.lastSync);
    }
    if (metadata.conflictCount !== undefined) {
      fields.push('conflict_count = ?');
      values.push(metadata.conflictCount);
    }
    if (metadata.storageSize !== undefined) {
      fields.push('storage_size = ?');
      values.push(metadata.storageSize);
    }

    if (fields.length > 0) {
      values.push(crdtId);
      await this.db.run(`
        INSERT OR REPLACE INTO crdt_metadata 
        (crdt_id, entity_type, entity_id, sync_status, last_sync, conflict_count, storage_size)
        VALUES (
          ?, 
          COALESCE((SELECT entity_type FROM crdt_metadata WHERE crdt_id = ?), ?),
          COALESCE((SELECT entity_id FROM crdt_metadata WHERE crdt_id = ?), ?),
          ?, ?, ?, ?
        )
      `, [
        crdtId, crdtId, metadata.entityType || 'unknown',
        crdtId, metadata.entityId || crdtId,
        metadata.syncStatus, metadata.lastSync, metadata.conflictCount, metadata.storageSize
      ]);
    }
  }

  async getCRDTsByType(crdtType: string): Promise<string[]> {
    if (!this.db) throw new Error('Database not initialized');

    const rows = await this.db.all(`
      SELECT crdt_id FROM crdt_storage WHERE crdt_type = ?
    `, [crdtType]);

    return rows.map(row => row.crdt_id);
  }

  async getCRDTsModifiedSince(timestamp: number): Promise<string[]> {
    if (!this.db) throw new Error('Database not initialized');

    const rows = await this.db.all(`
      SELECT crdt_id FROM crdt_storage WHERE last_modified > ?
    `, [timestamp]);

    return rows.map(row => row.crdt_id);
  }

  async getStorageStats(): Promise<StorageStats> {
    if (!this.db) throw new Error('Database not initialized');

    const stats = await this.db.get(`
      SELECT 
        COUNT(*) as total_crdts,
        SUM(storage_size) as total_size,
        COUNT(CASE WHEN sync_status = 'PENDING' THEN 1 END) as pending_sync,
        COUNT(CASE WHEN conflict_count > 0 THEN 1 END) as with_conflicts
      FROM crdt_metadata
    `);

    const deltaStats = await this.db.get(`
      SELECT COUNT(*) as pending_deltas
      FROM crdt_deltas WHERE applied = FALSE
    `);

    return {
      totalCRDTs: stats.total_crdts || 0,
      totalSize: stats.total_size || 0,
      pendingSync: stats.pending_sync || 0,
      withConflicts: stats.with_conflicts || 0,
      pendingDeltas: deltaStats.pending_deltas || 0
    };
  }

  // Enhanced cleanup and compaction
  async cleanupOldDeltas(olderThan: number): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.run(`
      DELETE FROM crdt_deltas 
      WHERE applied = TRUE AND timestamp < ?
    `, [olderThan]);

    return result.changes || 0;
  }

  async compactStorage(): Promise<CompactionResult> {
    return await this.storageCompactor.performCompaction();
  }

  private generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Original methods remain unchanged
  async create(entity: any): Promise<StorageResult<any>> {
    // Implementation remains the same
    throw new Error('Method not implemented.');
  }

  async read(id: string): Promise<StorageResult<any>> {
    // Implementation remains the same
    throw new Error('Method not implemented.');
  }

  async update(id: string, updates: any): Promise<StorageResult<any>> {
    // Implementation remains the same
    throw new Error('Method not implemented.');
  }

  async delete(id: string): Promise<StorageResult<boolean>> {
    // Implementation remains the same
    throw new Error('Method not implemented.');
  }

  async query(options: QueryOptions): Promise<StorageResult<any[]>> {
    // Implementation remains the same
    throw new Error('Method not implemented.');
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.storageCompactor.stop();
      await this.writeAheadLog.close();
      await this.db.close();
      this.db = null;
    }
  }
}

class WriteAheadLog {
  private logPath: string;
  private operations: Map<string, WALOperation[]> = new Map();

  constructor(logPath: string) {
    this.logPath = logPath;
  }

  async initialize(): Promise<void> {
    // Initialize WAL system
  }

  async logOperation(operation: WALOperation): Promise<void> {
    if (!this.operations.has(operation.transactionId)) {
      this.operations.set(operation.transactionId, []);
    }
    this.operations.get(operation.transactionId)!.push(operation);
  }

  async commitTransaction(transactionId: string): Promise<void> {
    this.operations.delete(transactionId);
  }

  async rollbackTransaction(transactionId: string): Promise<void> {
    const ops = this.operations.get(transactionId);
    if (ops) {
      // Perform rollback operations
      this.operations.delete(transactionId);
    }
  }

  async close(): Promise<void> {
    // Close WAL system
  }
}

class StorageCompactor {
  private adapter: SQLiteAdapter;
  private compactionInterval: NodeJS.Timeout | null = null;

  constructor(adapter: SQLiteAdapter) {
    this.adapter = adapter;
  }

  start(): void {
    this.compactionInterval = setInterval(async () => {
      await this.performCompaction();
    }, 60000 * 60); // Every hour
  }

  stop(): void {
    if (this.compactionInterval) {
      clearInterval(this.compactionInterval);
      this.compactionInterval = null;
    }
  }

  async performCompaction(): Promise<CompactionResult> {
    const startTime = Date.now();
    let reclaimedSpace = 0;

    try {
      // Clean up old deltas (older than 24 hours)
      const cleanedDeltas = await this.adapter.cleanupOldDeltas(Date.now() - 24 * 60 * 60 * 1000);
      
      // Vacuum database to reclaim space
      // Note: This would need access to the underlying database
      // reclaimedSpace = await this.vacuumDatabase();

      return {
        success: true,
        reclaimedSpace,
        cleanedDeltas,
        duration: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        reclaimedSpace: 0,
        cleanedDeltas: 0,
        duration: Date.now() - startTime
      };
    }
  }
}

// Type definitions
interface CRDTStorageData {
  type: string;
  serializedData: string;
  nodeId: string;
  vectorClock: string;
  checksum: string;
  lastModified?: number;
  entityType?: string;
  entityId?: string;
}

interface CRDTDelta {
  deltaData: string;
  vectorClock: string;
  nodeId: string;
  operationType: string;
  timestamp: number;
}

interface CRDTStorageMetadata {
  crdtId: string;
  entityType: string;
  entityId: string;
  syncStatus: 'PENDING' | 'SYNCED' | 'CONFLICT';
  lastSync: number | null;
  conflictCount: number;
  storageSize: number;
}

interface WALOperation {
  type: string;
  crdtId?: string;
  data?: any;
  transactionId: string;
  timestamp: number;
}

interface StorageStats {
  totalCRDTs: number;
  totalSize: number;
  pendingSync: number;
  withConflicts: number;
  pendingDeltas: number;
}

interface CompactionResult {
  success: boolean;
  reclaimedSpace: number;
  cleanedDeltas: number;
  duration: number;
  error?: string;
}
```

### Phase 4: Mesh Networking Layer (Hours 13-16)

#### 4.1 WebRTC Mesh Network Implementation
**File: `core/networking/meshNetwork.ts` (New)**
```typescript
import { EventEmitter } from 'events';

export class MeshNetwork extends EventEmitter {
  private nodeId: string;
  private peers: Map<string, MeshPeer>;
  private discoveryService: DeviceDiscoveryService;
  private networkMonitor: NetworkHealthMonitor;
  private compressionManager: CompressionManager;
  private connectionPool: RTCConnectionPool;
  private routingTable: MeshRoutingTable;

  constructor(nodeId: string) {
    super();
    this.nodeId = nodeId;
    this.peers = new Map();
    this.discoveryService = new DeviceDiscoveryService(nodeId);
    this.networkMonitor = new NetworkHealthMonitor();
    this.compressionManager = new CompressionManager();
    this.connectionPool = new RTCConnectionPool();
    this.routingTable = new MeshRoutingTable(nodeId);

    this.setupEventHandlers();
  }

  async initialize(): Promise<void> {
    await this.discoveryService.start();
    await this.networkMonitor.start();
    
    this.emit('networkInitialized', { nodeId: this.nodeId });
  }

  async discoverPeers(): Promise<DiscoveredPeer[]> {
    return await this.discoveryService.discoverPeers();
  }

  async connectToPeer(peerId: string, discoveryInfo: DiscoveryInfo): Promise<MeshPeer> {
    if (this.peers.has(peerId)) {
      return this.peers.get(peerId)!;
    }

    const connection = await this.connectionPool.createConnection(peerId, discoveryInfo);
    const peer = new MeshPeer(peerId, connection, this.compressionManager);
    
    this.peers.set(peerId, peer);
    this.routingTable.addPeer(peerId, 1); // Direct connection has cost 1
    
    this.setupPeerEventHandlers(peer);
    
    this.emit('peerConnected', { peerId, peer });
    return peer;
  }

  async disconnectFromPeer(peerId: string): Promise<void> {
    const peer = this.peers.get(peerId);
    if (peer) {
      await peer.disconnect();
      this.peers.delete(peerId);
      this.routingTable.removePeer(peerId);
      
      this.emit('peerDisconnected', { peerId });
    }
  }

  async sendMessage(targetPeerId: string, message: MeshMessage): Promise<MessageResponse> {
    const route = this.routingTable.findRoute(targetPeerId);
    
    if (!route) {
      throw new Error(`No route to peer ${targetPeerId}`);
    }

    const nextHop = route.nextHop;
    const peer = this.peers.get(nextHop);
    
    if (!peer) {
      throw new Error(`Next hop peer ${nextHop} not connected`);
    }

    // Add routing information if not direct connection
    const routedMessage: RoutedMessage = {
      ...message,
      sourceId: this.nodeId,
      targetId: targetPeerId,
      routeHops: route.hops,
      ttl: message.ttl || 10
    };

    return await peer.sendMessage(routedMessage);
  }

  async broadcastMessage(message: BroadcastMessage): Promise<Map<string, MessageResponse>> {
    const responses = new Map<string, MessageResponse>();
    
    const broadcastId = this.generateBroadcastId();
    const routedMessage: RoutedMessage = {
      ...message,
      sourceId: this.nodeId,
      targetId: '*',
      broadcastId,
      routeHops: [],
      ttl: message.ttl || 5
    };

    // Send to all direct peers
    const sendPromises = Array.from(this.peers.entries()).map(async ([peerId, peer]) => {
      try {
        const response = await peer.sendMessage(routedMessage);
        responses.set(peerId, response);
      } catch (error) {
        responses.set(peerId, {
          success: false,
          error: error.message,
          timestamp: Date.now()
        });
      }
    });

    await Promise.allSettled(sendPromises);
    return responses;
  }

  async optimizeMeshTopology(): Promise<TopologyOptimizationResult> {
    const currentTopology = this.analyzeCurrentTopology();
    const optimization = await this.calculateOptimalTopology(currentTopology);
    
    if (optimization.shouldOptimize) {
      await this.applyTopologyChanges(optimization.changes);
    }

    return {
      optimized: optimization.shouldOptimize,
      changes: optimization.changes,
      metrics: {
        avgLatency: currentTopology.avgLatency,
        redundancy: currentTopology.redundancy,
        efficiency: currentTopology.efficiency
      }
    };
  }

  private setupEventHandlers(): void {
    this.discoveryService.on('peerDiscovered', async (discoveryInfo: DiscoveryInfo) => {
      this.emit('peerDiscovered', discoveryInfo);
    });

    this.networkMonitor.on('qualityChanged', (qualityReport: NetworkQualityReport) => {
      this.handleNetworkQualityChange(qualityReport);
    });

    this.networkMonitor.on('partitionDetected', () => {
      this.handleNetworkPartition();
    });

    this.networkMonitor.on('partitionResolved', () => {
      this.handlePartitionResolution();
    });
  }

  private setupPeerEventHandlers(peer: MeshPeer): void {
    peer.on('message', (message: RoutedMessage) => {
      this.handleIncomingMessage(peer.getId(), message);
    });

    peer.on('disconnected', () => {
      this.disconnectFromPeer(peer.getId());
    });

    peer.on('error', (error: Error) => {
      this.emit('peerError', {
        peerId: peer.getId(),
        error: error.message
      });
    });

    peer.on('qualityChanged', (quality: ConnectionQuality) => {
      this.routingTable.updatePeerQuality(peer.getId(), quality);
    });
  }

  private async handleIncomingMessage(fromPeerId: string, message: RoutedMessage): Promise<void> {
    // Check if message is for us
    if (message.targetId === this.nodeId || message.targetId === '*') {
      this.emit('messageReceived', {
        message,
        fromPeerId,
        timestamp: Date.now()
      });
      return;
    }

    // Route message to target
    if (message.ttl > 0) {
      message.ttl--;
      message.routeHops.push(this.nodeId);
      
      try {
        await this.sendMessage(message.targetId, message);
      } catch (error) {
        // Message routing failed, emit error
        this.emit('routingError', {
          message,
          error: error.message,
          fromPeerId
        });
      }
    }
  }

  private handleNetworkQualityChange(qualityReport: NetworkQualityReport): void {
    // Update routing costs based on network quality
    for (const [peerId, quality] of qualityReport.peerQualities) {
      this.routingTable.updatePeerCost(peerId, this.calculateRoutingCost(quality));
    }

    this.emit('networkQualityChanged', qualityReport);
  }

  private calculateRoutingCost(quality: ConnectionQuality): number {
    // Calculate routing cost based on latency, bandwidth, and reliability
    const latencyCost = Math.min(quality.latency / 100, 10); // Max cost 10 for 1s+ latency
    const bandwidthCost = Math.max(1, 10 - (quality.bandwidth / 1000000)); // Lower cost for higher bandwidth
    const reliabilityCost = Math.max(1, 5 * (1 - quality.reliability)); // Higher cost for lower reliability
    
    return latencyCost + bandwidthCost + reliabilityCost;
  }

  private handleNetworkPartition(): void {
    // Switch to partition-tolerant mode
    this.emit('networkPartition', {
      timestamp: Date.now(),
      connectedPeers: Array.from(this.peers.keys())
    });
  }

  private handlePartitionResolution(): void {
    // Resume normal operation and sync with rejoined peers
    this.emit('partitionResolved', {
      timestamp: Date.now(),
      connectedPeers: Array.from(this.peers.keys())
    });
  }

  private analyzeCurrentTopology(): TopologyAnalysis {
    const peers = Array.from(this.peers.keys());
    const connections = peers.length;
    const avgLatency = this.calculateAverageLatency();
    const redundancy = this.calculateRedundancy();
    const efficiency = this.calculateEfficiency();

    return {
      peerCount: peers.length,
      connectionCount: connections,
      avgLatency,
      redundancy,
      efficiency,
      isOptimal: redundancy > 0.7 && efficiency > 0.8
    };
  }

  private calculateAverageLatency(): number {
    let totalLatency = 0;
    let count = 0;

    for (const peer of this.peers.values()) {
      const quality = peer.getConnectionQuality();
      if (quality) {
        totalLatency += quality.latency;
        count++;
      }
    }

    return count > 0 ? totalLatency / count : 0;
  }

  private calculateRedundancy(): number {
    // Calculate network redundancy based on alternative paths
    const peerCount = this.peers.size;
    if (peerCount <= 1) return 0;

    let redundantPaths = 0;
    const totalPossiblePaths = peerCount * (peerCount - 1) / 2;

    for (const peerId of this.peers.keys()) {
      const routes = this.routingTable.findAllRoutes(peerId);
      if (routes.length > 1) {
        redundantPaths++;
      }
    }

    return redundantPaths / totalPossiblePaths;
  }

  private calculateEfficiency(): number {
    // Calculate network efficiency based on path lengths
    let totalEfficiency = 0;
    let count = 0;

    for (const peerId of this.peers.keys()) {
      const route = this.routingTable.findRoute(peerId);
      if (route) {
        const efficiency = 1 / route.hops.length; // Shorter paths are more efficient
        totalEfficiency += efficiency;
        count++;
      }
    }

    return count > 0 ? totalEfficiency / count : 0;
  }

  private async calculateOptimalTopology(current: TopologyAnalysis): Promise<TopologyOptimization> {
    // Determine if optimization is needed and what changes to make
    const shouldOptimize = !current.isOptimal;
    const changes: TopologyChange[] = [];

    if (current.redundancy < 0.5) {
      // Need more redundant connections
      changes.push({
        type: 'ADD_CONNECTION',
        details: 'Increase redundancy by adding backup connections'
      });
    }

    if (current.avgLatency > 500) {
      // Need better routing
      changes.push({
        type: 'OPTIMIZE_ROUTING',
        details: 'Optimize routing to reduce average latency'
      });
    }

    if (current.efficiency < 0.7) {
      // Need topology restructuring
      changes.push({
        type: 'RESTRUCTURE',
        details: 'Restructure mesh to improve efficiency'
      });
    }

    return {
      shouldOptimize,
      changes
    };
  }

  private async applyTopologyChanges(changes: TopologyChange[]): Promise<void> {
    for (const change of changes) {
      switch (change.type) {
        case 'ADD_CONNECTION':
          await this.addRedundantConnections();
          break;
        case 'OPTIMIZE_ROUTING':
          await this.optimizeRouting();
          break;
        case 'RESTRUCTURE':
          await this.restructureTopology();
          break;
      }
    }
  }

  private async addRedundantConnections(): Promise<void> {
    // Discover and connect to additional peers for redundancy
    const discovered = await this.discoverPeers();
    const currentPeerIds = new Set(this.peers.keys());
    
    for (const peer of discovered) {
      if (!currentPeerIds.has(peer.id) && this.peers.size < 10) { // Limit connections
        try {
          await this.connectToPeer(peer.id, peer.discoveryInfo);
        } catch (error) {
          // Continue to next peer if connection fails
        }
      }
    }
  }

  private async optimizeRouting(): Promise<void> {
    // Rebuild routing table with current network state
    await this.routingTable.rebuild();
  }

  private async restructureTopology(): Promise<void> {
    // More complex topology changes would go here
    // For now, just optimize routing
    await this.optimizeRouting();
  }

  private generateBroadcastId(): string {
    return `broadcast_${this.nodeId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public getters
  getPeerCount(): number {
    return this.peers.size;
  }

  getConnectedPeers(): string[] {
    return Array.from(this.peers.keys());
  }

  getNetworkTopology(): NetworkTopology {
    return {
      nodeId: this.nodeId,
      peers: Array.from(this.peers.keys()),
      routingTable: this.routingTable.getRoutes(),
      quality: this.networkMonitor.getCurrentQuality()
    };
  }

  async close(): Promise<void> {
    // Disconnect from all peers
    const disconnectPromises = Array.from(this.peers.keys()).map(peerId => 
      this.disconnectFromPeer(peerId)
    );
    
    await Promise.allSettled(disconnectPromises);
    
    await this.discoveryService.stop();
    await this.networkMonitor.stop();
    await this.connectionPool.close();
    
    this.emit('networkClosed');
  }
}

// Supporting classes would be implemented in separate files
class MeshPeer extends EventEmitter {
  private id: string;
  private connection: RTCPeerConnection;
  private compressionManager: CompressionManager;
  private dataChannel: RTCDataChannel | null = null;
  private connectionQuality: ConnectionQuality | null = null;

  constructor(id: string, connection: RTCPeerConnection, compressionManager: CompressionManager) {
    super();
    this.id = id;
    this.connection = connection;
    this.compressionManager = compressionManager;
    this.setupConnection();
  }

  private setupConnection(): void {
    this.dataChannel = this.connection.createDataChannel('mesh', {
      ordered: true,
      maxRetransmits: 3
    });

    this.dataChannel.onopen = () => {
      this.emit('connected');
    };

    this.dataChannel.onmessage = (event) => {
      const message = this.compressionManager.decompress(event.data);
      this.emit('message', JSON.parse(message));
    };

    this.dataChannel.onclose = () => {
      this.emit('disconnected');
    };

    this.dataChannel.onerror = (error) => {
      this.emit('error', error);
    };
  }

  async sendMessage(message: any): Promise<MessageResponse> {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      throw new Error('Peer connection not ready');
    }

    const compressed = await this.compressionManager.compress(JSON.stringify(message));
    this.dataChannel.send(compressed);

    return {
      success: true,
      timestamp: Date.now()
    };
  }

  async disconnect(): Promise<void> {
    if (this.dataChannel) {
      this.dataChannel.close();
    }
    this.connection.close();
  }

  getId(): string {
    return this.id;
  }

  getConnectionQuality(): ConnectionQuality | null {
    return this.connectionQuality;
  }
}

// Type definitions for mesh networking
interface MeshMessage {
  type: string;
  data: any;
  timestamp: number;
  ttl?: number;
}

interface RoutedMessage extends MeshMessage {
  sourceId: string;
  targetId: string;
  routeHops: string[];
  broadcastId?: string;
}

interface BroadcastMessage extends MeshMessage {
  broadcastId?: string;
}

interface MessageResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: number;
}

interface DiscoveredPeer {
  id: string;
  discoveryInfo: DiscoveryInfo;
}

interface DiscoveryInfo {
  address: string;
  port: number;
  capabilities: string[];
  timestamp: number;
}

interface ConnectionQuality {
  latency: number;
  bandwidth: number;
  reliability: number;
  packetLoss: number;
}

interface NetworkQualityReport {
  overall: ConnectionQuality;
  peerQualities: Map<string, ConnectionQuality>;
  timestamp: number;
}

interface TopologyAnalysis {
  peerCount: number;
  connectionCount: number;
  avgLatency: number;
  redundancy: number;
  efficiency: number;
  isOptimal: boolean;
}

interface TopologyOptimization {
  shouldOptimize: boolean;
  changes: TopologyChange[];
}

interface TopologyChange {
  type: 'ADD_CONNECTION' | 'REMOVE_CONNECTION' | 'OPTIMIZE_ROUTING' | 'RESTRUCTURE';
  details: string;
}

interface TopologyOptimizationResult {
  optimized: boolean;
  changes: TopologyChange[];
  metrics: {
    avgLatency: number;
    redundancy: number;
    efficiency: number;
  };
}

interface NetworkTopology {
  nodeId: string;
  peers: string[];
  routingTable: any;
  quality: ConnectionQuality;
}

// Forward declarations for supporting services
class DeviceDiscoveryService extends EventEmitter {
  constructor(nodeId: string) {
    super();
  }
  async start(): Promise<void> {}
  async stop(): Promise<void> {}
  async discoverPeers(): Promise<DiscoveredPeer[]> { return []; }
}

class NetworkHealthMonitor extends EventEmitter {
  constructor() {
    super();
  }
  async start(): Promise<void> {}
  async stop(): Promise<void> {}
  getCurrentQuality(): ConnectionQuality {
    return { latency: 0, bandwidth: 0, reliability: 0, packetLoss: 0 };
  }
}

class CompressionManager {
  async compress(data: string): Promise<ArrayBuffer> {
    return new TextEncoder().encode(data);
  }
  decompress(data: ArrayBuffer): string {
    return new TextDecoder().decode(data);
  }
}

class RTCConnectionPool {
  async createConnection(peerId: string, discoveryInfo: DiscoveryInfo): Promise<RTCPeerConnection> {
    return new RTCPeerConnection();
  }
  async close(): Promise<void> {}
}

class MeshRoutingTable {
  constructor(nodeId: string) {}
  addPeer(peerId: string, cost: number): void {}
  removePeer(peerId: string): void {}
  updatePeerCost(peerId: string, cost: number): void {}
  updatePeerQuality(peerId: string, quality: ConnectionQuality): void {}
  findRoute(targetId: string): any { return null; }
  findAllRoutes(targetId: string): any[] { return []; }
  async rebuild(): Promise<void> {}
  getRoutes(): any { return {}; }
}
```

## Technical Specifications

### CRDT System Architecture
```typescript
interface CRDTSystemArchitecture {
  // Core CRDT types
  supportedTypes: ['LWW_REGISTER', 'PN_COUNTER', 'OR_SET', 'G_SET', 'RGA_TEXT'];
  
  // Conflict resolution strategies
  conflictResolution: {
    timestampComparison: 'wall-clock + logical-counter + node-id';
    mergePolicies: 'operation-based + state-based hybrid';
    consistencyModel: 'eventual-consistency';
  };
  
  // Vector clock synchronization
  vectorClocks: {
    implementation: 'Lamport timestamps + node identification';
    synchronization: 'delta-state propagation';
    partitionTolerance: 'offline-first with operation queuing';
  };
}

interface StorageLayerArchitecture {
  // SQLite enhancements
  sqliteOptimizations: {
    writeAheadLogging: 'durability + performance';
    deltaStorage: 'incremental sync + storage efficiency';
    metadataIndexing: 'CRDT discovery + conflict tracking';
    compaction: 'automated cleanup + space reclamation';
  };
  
  // CRDT-specific tables
  crdtTables: {
    crdtStorage: 'main CRDT data with checksums';
    crdtDeltas: 'incremental changes for sync';
    crdtMetadata: 'sync status + conflict tracking';
    walOperations: 'write-ahead logging for durability';
  };
}

interface NetworkingArchitecture {
  // Mesh networking
  meshTopology: {
    peerDiscovery: 'mDNS/Bonjour + manual connection';
    routingProtocol: 'distance-vector with quality metrics';
    redundancy: 'multiple paths + automatic failover';
    optimization: 'adaptive topology + load balancing';
  };
  
  // WebRTC implementation
  webrtcFeatures: {
    dataChannels: 'reliable + ordered messaging';
    compression: 'adaptive compression based on bandwidth';
    qualityMonitoring: 'latency + bandwidth + reliability tracking';
    connectionPooling: 'efficient resource management';
  };
}
```

## Testing Framework

### CRDT Testing
```typescript
// File: tests/storage/crdt.test.ts
describe('CRDT Implementation', () => {
  test('LWW register resolves conflicts correctly', async () => {
    const node1 = new LWWRegister('test-reg', 'node1', 'initial');
    const node2 = new LWWRegister('test-reg', 'node2', 'initial');
    
    // Concurrent updates
    node1.update('value1');
    await sleep(10); // Ensure different timestamps
    node2.update('value2');
    
    // Merge and verify last writer wins
    const merged = node1.merge(node2);
    expect(merged.getValue()).toBe('value2'); // node2 wrote later
  });

  test('PN counter maintains convergence', async () => {
    const counter1 = new PNCounter('test-counter', 'node1');
    const counter2 = new PNCounter('test-counter', 'node2');
    
    // Concurrent operations
    counter1.increment(5);
    counter2.increment(3);
    counter1.decrement(2);
    
    // Merge and verify sum
    const merged = counter1.merge(counter2);
    expect(merged.getValue()).toBe(6); // 5 + 3 - 2
  });

  test('OR set handles add/remove correctly', async () => {
    const set1 = new ORSet('test-set', 'node1');
    const set2 = new ORSet('test-set', 'node2');
    
    // Concurrent operations
    set1.add('item1');
    set2.add('item2');
    set1.remove('item2'); // Remove before merge
    
    const merged = set1.merge(set2);
    const result = merged.getValue();
    
    expect(result.has('item1')).toBe(true);
    expect(result.has('item2')).toBe(true); // Remove doesn't affect other node's add
  });
});
```

### Synchronization Testing
```typescript
// File: tests/storage/sync.test.ts
describe('Synchronization Protocol', () => {
  test('handles network partition gracefully', async () => {
    const sync1 = new SyncProtocol('node1');
    const sync2 = new SyncProtocol('node2');
    
    // Establish connection
    await connectSyncNodes(sync1, sync2);
    
    // Create CRDT and sync
    const crdt1 = sync1.getCRDTResolver().createLWWRegister('test', 'value1');
    await waitForSync(sync1, sync2);
    
    // Partition network
    await partitionNodes(sync1, sync2);
    
    // Make changes during partition
    crdt1.update('partitioned-value');
    
    // Verify offline queue
    expect(sync1.getSyncQueueSize()).toBeGreaterThan(0);
    
    // Reconnect and verify sync
    await reconnectNodes(sync1, sync2);
    await waitForSync(sync1, sync2);
    
    const crdt2 = sync2.getCRDTResolver().getCRDT('test');
    expect(crdt2.getValue()).toBe('partitioned-value');
  });

  test('processes delta sync efficiently', async () => {
    const sync1 = new SyncProtocol('node1');
    const sync2 = new SyncProtocol('node2');
    
    await connectSyncNodes(sync1, sync2);
    
    // Create large dataset
    const counter = sync1.getCRDTResolver().createPNCounter('large-counter');
    for (let i = 0; i < 1000; i++) {
      counter.increment(1);
    }
    
    // Measure sync performance
    const startTime = Date.now();
    await waitForSync(sync1, sync2);
    const syncTime = Date.now() - startTime;
    
    expect(syncTime).toBeLessThan(1000); // Should sync in under 1 second
    
    const counter2 = sync2.getCRDTResolver().getCRDT('large-counter');
    expect(counter2.getValue()).toBe(1000);
  });
});
```

### Mesh Network Testing
```typescript
// File: tests/networking/mesh.test.ts
describe('Mesh Network', () => {
  test('establishes peer connections', async () => {
    const mesh1 = new MeshNetwork('node1');
    const mesh2 = new MeshNetwork('node2');
    
    await mesh1.initialize();
    await mesh2.initialize();
    
    // Mock discovery
    const discoveryInfo = createMockDiscoveryInfo('node2');
    const peer = await mesh1.connectToPeer('node2', discoveryInfo);
    
    expect(mesh1.getPeerCount()).toBe(1);
    expect(peer.getId()).toBe('node2');
  });

  test('routes messages through mesh', async () => {
    const nodes = await createMeshNetwork(['node1', 'node2', 'node3']);
    
    // Connect in line: node1 -> node2 -> node3
    await connectNodes(nodes.node1, nodes.node2);
    await connectNodes(nodes.node2, nodes.node3);
    
    // Send message from node1 to node3 (should route through node2)
    const message = { type: 'test', data: 'hello' };
    const response = await nodes.node1.sendMessage('node3', message);
    
    expect(response.success).toBe(true);
  });

  test('optimizes topology automatically', async () => {
    const mesh = new MeshNetwork('node1');
    await mesh.initialize();
    
    // Connect to several peers with poor quality
    const peers = await connectMultiplePeersWithQuality(mesh, [
      { id: 'node2', quality: { latency: 1000, bandwidth: 1000, reliability: 0.5 } },
      { id: 'node3', quality: { latency: 100, bandwidth: 10000, reliability: 0.9 } }
    ]);
    
    const result = await mesh.optimizeMeshTopology();
    
    expect(result.optimized).toBe(true);
    expect(result.metrics.avgLatency).toBeLessThan(600); // Improved from initial
  });
});
```

## Success Criteria

### Functional Requirements
- [ ] CRDT conflict resolution maintains data consistency
- [ ] Vector clock synchronization handles concurrent updates
- [ ] SQLite adapter stores/retrieves CRDTs efficiently
- [ ] Mesh network establishes P2P connections reliably

### Performance Requirements
- [ ] CRDT merge operations complete within 100ms
- [ ] Delta synchronization latency < 500ms
- [ ] SQLite operations maintain >1000 ops/sec throughput
- [ ] Mesh network supports 50+ concurrent connections

### Reliability Requirements
- [ ] Network partition handling preserves data integrity
- [ ] Storage corruption detection and recovery functional
- [ ] Mesh topology optimization improves network efficiency
- [ ] All operations are transaction-safe and atomic

## Risk Mitigation

### Technical Risks
1. **CRDT Complexity (HIGH RISK)**
   - Comprehensive unit testing for all CRDT types
   - Fallback to simpler LWW strategy for complex conflicts
   - Extensive property-based testing

2. **WebRTC Compatibility (MEDIUM RISK)**
   - Progressive enhancement with fallback protocols
   - Comprehensive browser/platform testing
   - Connection pool management for resource efficiency

3. **Storage Performance (MEDIUM RISK)**
   - SQLite optimization with proper indexing
   - Automated compaction and cleanup routines
   - Performance monitoring and alerting

## Next Day Preview
Day 36 will focus on comprehensive integration testing of the storage and networking layer, followed by the final Phase 2 infrastructure diagram creation.

## Notes for Implementation
- Prioritize data consistency and partition tolerance
- Ensure storage layer is optimized for CRDT operations
- Design mesh network for scalability and reliability
- Create comprehensive monitoring and health checks
