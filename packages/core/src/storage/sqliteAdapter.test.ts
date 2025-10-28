import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SQLiteAdapter } from './sqliteAdapter';
import { ulid } from 'ulid';

describe('SQLiteAdapter Integration Tests', () => {
  let adapter: SQLiteAdapter;

  beforeEach(async () => {
    // Use an in-memory database for fast, isolated tests
    adapter = new SQLiteAdapter(':memory:');
    await adapter.initialize();
  });

  afterEach(async () => {
    await adapter.close();
  });

  it('should initialize the database with the correct tables', async () => {
    const thoughtTable = await (adapter as any).db?.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='thoughts';"
    );
    const segmentTable = await (adapter as any).db?.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='segments';"
    );
    expect(thoughtTable).toBeDefined();
    expect(segmentTable).toBeDefined();
  });

  it('should create a new thought successfully', async () => {
    const thoughtData = { title: 'Test Thought' };
    const thought = await adapter.createThought(thoughtData);

    expect(thought).toBeDefined();
    expect(thought.title).toBe('Test Thought');
    expect(thought.id).toBeTypeOf('string');
  });

  it('should enforce foreign key constraints on segments (Negative Test)', async () => {
    const nonExistentThoughtId = ulid();
    const segmentData = { content: 'This should fail' };

    // This MUST throw an error because the thoughtId does not exist.
    // This proves our schema is normalized and relational integrity is enforced.
    await expect(
      adapter.createSegment(nonExistentThoughtId, segmentData)
    ).rejects.toThrow();
  });

  it('should successfully create a segment for an existing thought', async () => {
    const thought = await adapter.createThought({ title: 'Parent Thought' });
    const segmentData = { content: 'Valid segment' };
    const segment = await adapter.createSegment(thought.id, segmentData);

    expect(segment).toBeDefined();
    expect(segment.thoughtId).toBe(thought.id);
    expect(segment.content).toBe('Valid segment');
  });

  it('should retrieve a thought by its ID with all its segments', async () => {
    const thought = await adapter.createThought({ title: 'Parent Thought' });
    await adapter.createSegment(thought.id, { content: 'Segment 1' });
    await adapter.createSegment(thought.id, { content: 'Segment 2' });

    const retrievedThought = await adapter.getThoughtById(thought.id);
    expect(retrievedThought).toBeDefined();
    expect(retrievedThought?.id).toBe(thought.id);
    expect(retrievedThought?.segments).toHaveLength(2);
    expect(retrievedThought?.segments[0].content).toBe('Segment 1');
  });

  it('should retrieve all thoughts with their segments', async () => {
    const thought1 = await adapter.createThought({ title: 'Thought 1' });
    await adapter.createSegment(thought1.id, { content: 'T1-S1' });
    const thought2 = await adapter.createThought({ title: 'Thought 2' });
    await adapter.createSegment(thought2.id, { content: 'T2-S1' });
    await adapter.createSegment(thought2.id, { content: 'T2-S2' });

    const allThoughts = await adapter.getAllThoughts();
    expect(allThoughts).toHaveLength(2);

    const retrievedThought1 = allThoughts.find(t => t.id === thought1.id);
    const retrievedThought2 = allThoughts.find(t => t.id === thought2.id);

    expect(retrievedThought1?.segments).toHaveLength(1);
    expect(retrievedThought2?.segments).toHaveLength(2);
  });
});
