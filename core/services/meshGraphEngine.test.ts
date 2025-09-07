import { describe, it, expect, beforeEach } from 'vitest';
import { MeshGraphEngine } from './meshGraphEngine';
import { Thought, Tag } from '../../contracts/entities';

// Helper to create mock thoughts
const createMockThought = (id: string, tags: string[]): Thought => ({
  id,
  title: `Thought ${id}`,
  description: `Description for ${id}`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  tags: tags.map(tag => ({ name: tag, color: '#ffffff' }) as Tag),
  segments: [],
});

describe('MeshGraphEngine', () => {
  let engine: MeshGraphEngine;

  beforeEach(() => {
    engine = new MeshGraphEngine();
  });

  describe('clusterThoughtsByTag', () => {
    it('should cluster thoughts correctly based on shared tags', async () => {
      const thoughts: Thought[] = [
        createMockThought('1', ['tech', 'ai']),
        createMockThought('2', ['philosophy']),
        createMockThought('3', ['tech', 'javascript']),
        createMockThought('4', ['ai']),
      ];

      // The current implementation only clusters by the *first* tag.
      // This test is written against the current implementation.
      const clusters = await engine.clusterThoughtsByTag(thoughts);

      expect(clusters).toHaveProperty('cluster_tech');
      expect(clusters).toHaveProperty('cluster_philosophy');
      expect(clusters).toHaveProperty('cluster_ai');

      expect(clusters['cluster_tech']).toHaveLength(2);
      expect(clusters['cluster_tech'].map(t => t.id)).toEqual(['1', '3']);

      expect(clusters['cluster_philosophy']).toHaveLength(1);
      expect(clusters['cluster_philosophy'][0].id).toBe('2');

      expect(clusters['cluster_ai']).toHaveLength(1);
      expect(clusters['cluster_ai'][0].id).toBe('4');
    });

    it('should return an empty object if no thoughts are provided', async () => {
      const clusters = await engine.clusterThoughtsByTag([]);
      expect(Object.keys(clusters)).toHaveLength(0);
    });

    it('should handle thoughts with no tags by grouping them into a misc cluster', async () => {
      const thoughts: Thought[] = [
        createMockThought('1', []),
        createMockThought('2', ['tech']),
        createMockThought('3', []),
      ];

      const clusters = await engine.clusterThoughtsByTag(thoughts);

      expect(clusters).toHaveProperty('cluster_misc_0');
      expect(clusters['cluster_misc_0']).toHaveLength(2);
      expect(clusters['cluster_misc_0'].map(t => t.id)).toEqual(['1', '3']);

      expect(clusters).toHaveProperty('cluster_tech');
      expect(clusters['cluster_tech']).toHaveLength(1);
    });

    it('should filter out clusters smaller than the minClusterSize option', async () => {
        const thoughts: Thought[] = [
            createMockThought('1', ['tech', 'ai']),
            createMockThought('2', ['philosophy']),
            createMockThought('3', ['tech', 'javascript']),
        ];

        const options = { minClusterSize: 2 };
        const clusters = await engine.clusterThoughtsByTag(thoughts, options);

        expect(clusters).toHaveProperty('cluster_tech');
        expect(clusters['cluster_tech']).toHaveLength(2);

        // The 'philosophy' cluster should be filtered out because it only has 1 member.
        expect(clusters).not.toHaveProperty('cluster_philosophy');
    });

    it('should not filter any clusters if minClusterSize is 1', async () => {
        const thoughts: Thought[] = [
            createMockThought('1', ['tech']),
            createMockThought('2', ['philosophy']),
        ];

        const options = { minClusterSize: 1 };
        const clusters = await engine.clusterThoughtsByTag(thoughts, options);

        expect(clusters).toHaveProperty('cluster_tech');
        expect(clusters).toHaveProperty('cluster_philosophy');
        expect(Object.keys(clusters)).toHaveLength(2);
    });
  });
});
