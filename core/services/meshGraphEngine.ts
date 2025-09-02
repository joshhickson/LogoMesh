import { Thought } from '../../contracts/entities';
import { StorageAdapter } from '../../contracts/storageAdapter';
import { ContextualEmbeddingInterface } from '../../contracts/embeddings/embeddingInterface';
import { logger } from '../utils/logger';

// --- Specific Types for MeshGraphEngine ---
export interface RelatedThoughtLink {
  thoughtId: string;
  relationshipType: 'semantic_similarity' | 'explicit_link' | 'conceptual_cluster';
  strength: number;
  depth: number;
}

export interface SemanticPath {
  path: string[];
  semanticStrength: number;
  conceptualTheme: string;
}

export interface SemanticTraversalResult {
  startingThought: string;
  traversalDepth: number;
  semanticPaths: SemanticPath[];
  clustersEncountered: string[];
  abstractionLevels: string[];
}

export interface SemanticBridge {
  bridgeThought: string;
  bridgeStrength: number;
  hopCount: number;
  conceptualRole: string;
}

export class MeshGraphEngine {
  private storage: StorageAdapter;
  private embeddingProvider: ContextualEmbeddingInterface;
  private _weightThreshold = 0.7; // Threshold for considering a thought "related"

  constructor(storage: StorageAdapter, embeddingProvider: ContextualEmbeddingInterface) {
    this.storage = storage;
    this.embeddingProvider = embeddingProvider;
    logger.info('[MeshGraphEngine] Initialized with storage and embedding provider');
  }

  /**
   * Get related thoughts for a given thought based on semantic similarity.
   * This implementation now delegates the heavy lifting of similarity search to the storage adapter.
   */
  async getRelatedThoughts(
    thoughtId: string,
    options?: { maxResults?: number; semanticThreshold?: number; userId?: string }
  ): Promise<RelatedThoughtLink[]> {
    logger.debug(`[MeshGraphEngine] Getting related thoughts for ${thoughtId}`);
    const { maxResults = 10, semanticThreshold = this._weightThreshold, userId = 'anonymous' } = options || {};

    const targetThought = await this.storage.getThoughtById(thoughtId, userId);
    if (!targetThought) {
      logger.warn(`[MeshGraphEngine] Target thought ${thoughtId} not found.`);
      return [];
    }

    // Step 1: Ensure the target thought has an embedding.
    let targetVector = targetThought.embedding;
    if (!targetVector && targetThought.content) {
      logger.info(`[MeshGraphEngine] Generating and saving embedding for target thought ${thoughtId}...`);
      targetVector = await this.embeddingProvider.toVector(targetThought.content);
      await this.storage.updateThought(thoughtId, { embedding: targetVector }, userId);
    }

    if (!targetVector) {
      logger.warn(`[MeshGraphEngine] Cannot find or generate embedding for thought ${thoughtId}.`);
      return [];
    }

    // Step 2: Use the storage adapter to find similar thoughts.
    logger.info(`[MeshGraphEngine] Finding thoughts similar to ${thoughtId} in the database...`);
    const similarThoughts = await this.storage.findSimilarThoughts(targetVector, maxResults + 1, userId);

    // Step 3: Format the results.
    const relatedLinks: RelatedThoughtLink[] = similarThoughts
      .filter(thought => thought.thought_bubble_id !== thoughtId) // Exclude the thought itself
      .map(thought => {
        const similarity = thought.embedding ? this.embeddingProvider.getSimilarity(targetVector!, thought.embedding) : 0;
        return {
          thoughtId: thought.thought_bubble_id,
          relationshipType: 'semantic_similarity' as const,
          strength: similarity,
          depth: 1,
        };
      })
      .filter(link => link.strength >= semanticThreshold)
      .slice(0, maxResults);

    logger.info(`[MeshGraphEngine] Found ${relatedLinks.length} related thoughts for ${thoughtId}`);
    return relatedLinks;
  }

  /*
  // Additional overload for getRelatedThoughts with different signature
  getRelatedThoughts(thoughts: any[], targetThought: any): any[] {
    // Implementation for array-based search
    return thoughts.filter(thought => 
      thought.tags?.some((tag: string) => targetThought.tags?.includes(tag))
    );
  }
  */

  /**
   * Clusters thoughts based on their assigned tags and semantic similarity of their embeddings.
   */
  async clusterThoughtsByTag(
    thoughts: Thought[],
    options?: { minClusterSize?: number; userId?: string }
  ): Promise<Record<string, Thought[]>> {
    const { minClusterSize = 2, userId = 'anonymous' } = options || {};
    logger.debug(`[MeshGraphEngine] Clustering ${thoughts.length} thoughts by tag.`);

    // 1. Ensure all thoughts have embeddings
    const thoughtsWithEmbeddings = await Promise.all(thoughts.map(async (thought) => {
      if (thought.embedding) return thought;
      if (!thought.content) return null;

      const embedding = await this.embeddingProvider.toVector(thought.content);
      await this.storage.updateThought(thought.thought_bubble_id, { embedding }, userId);
      return { ...thought, embedding };
    }));

    const validThoughts = thoughtsWithEmbeddings.filter((t): t is Thought & { embedding: number[] } => t?.embedding != null);

    // 2. Group thoughts by tags
    const thoughtsByTag: Record<string, (Thought & { embedding: number[] })[]> = {};
    validThoughts.forEach(thought => {
      if (thought.tags && thought.tags.length > 0) {
        thought.tags.forEach(tag => {
          if (!thoughtsByTag[tag.name]) {
            thoughtsByTag[tag.name] = [];
          }
          thoughtsByTag[tag.name].push(thought);
        });
      }
    });

    // 3. Calculate cluster centers (average embedding for each tag)
    const clusterCenters: Record<string, number[]> = {};
    for (const tagName in thoughtsByTag) {
      const tagThoughts = thoughtsByTag[tagName];
      if (tagThoughts.length > 0) {
        const sumVector = tagThoughts.reduce((sum, thought) => {
          thought.embedding.forEach((val, i) => sum[i] = (sum[i] || 0) + val);
          return sum;
        }, [] as number[]);
        clusterCenters[tagName] = sumVector.map(val => val / tagThoughts.length);
      }
    }

    // 4. Refine clusters: Assign each thought to its closest cluster center
    const finalClusters: Record<string, Thought[]> = {};
    validThoughts.forEach(thought => {
      let bestCluster = 'unclustered';
      let maxSimilarity = -1;

      for (const tagName in clusterCenters) {
        const similarity = this.embeddingProvider.getSimilarity(thought.embedding, clusterCenters[tagName]);
        if (similarity > maxSimilarity) {
          maxSimilarity = similarity;
          bestCluster = tagName;
        }
      }

      if (bestCluster !== 'unclustered') {
        if (!finalClusters[bestCluster]) {
          finalClusters[bestCluster] = [];
        }
        finalClusters[bestCluster].push(thought);
      }
    });

    // 5. Filter out small clusters
    Object.keys(finalClusters).forEach(key => {
      if (finalClusters[key].length < minClusterSize) {
        delete finalClusters[key];
      }
    });

    logger.info(`[MeshGraphEngine] Formed ${Object.keys(finalClusters).length} clusters.`);
    return finalClusters;
  }

  /*
  // Method overloads should be adjacent  
  clusterThoughtsByTag(thoughts: any[], options?: any): any[] {
    const tagGroups: any = {};

    thoughts.forEach(thought => {
      if (thought.tags && Array.isArray(thought.tags)) {
        thought.tags.forEach((tag: any) => {
          if (!tagGroups[tag]) {
            tagGroups[tag] = [];
          }
          tagGroups[tag].push(thought);
        });
      }
    });

    return Object.entries(tagGroups).map(([tag, thoughts]) => ({
      tag,
      thoughts,
      count: (thoughts as any[]).length
    }));
  }
  */

  /**
   * Traverse graph semantically from a starting thought
   * New method for CCE semantic context building
   */
  async traverseSemanticGraph(
    startingThoughtId: string,
    options?: {
      maxDepth?: number;
      semanticThreshold?: number;
      includeBacklinks?: boolean;
      filterByAbstraction?: string[];
    }
  ): Promise<SemanticTraversalResult> { // Changed from any
    logger.debug(`[MeshGraphEngine] Traversing semantic graph from ${startingThoughtId}`);

    // Mock semantic traversal
    const traversalResult: SemanticTraversalResult = { // Typed mock data
      startingThought: startingThoughtId,
      traversalDepth: options?.maxDepth !== undefined ? options.maxDepth : 3,
      semanticPaths: [
        {
          path: [startingThoughtId, 'node1', 'node2'],
          semanticStrength: 0.85,
          conceptualTheme: 'primary_concept'
        },
        {
          path: [startingThoughtId, 'node3', 'node4', 'node5'],
          semanticStrength: 0.72,
          conceptualTheme: 'supporting_detail'
        }
      ],
      clustersEncountered: ['cluster_A', 'cluster_B'],
      abstractionLevels: options?.filterByAbstraction !== undefined ? options.filterByAbstraction : ['high', 'medium', 'low'] // Explicit check
    };

    return traversalResult;
  }

  /**
   * Find semantic bridges between thoughts
   * New method for identifying conceptual connections
   */
  async findSemanticBridges(
    thoughtId1: string,
    thoughtId2: string
  ): Promise<SemanticBridge[]> { // Changed from any[]
    logger.debug(`[MeshGraphEngine] Finding semantic bridges between ${thoughtId1} and ${thoughtId2}`);

    // Mock bridge finding
    const mockBridges: SemanticBridge[] = [ // Typed mock data
      {
        bridgeThought: `bridge-${Math.random().toString(36).substr(2, 6)}`,
        bridgeStrength: Math.random() * 0.3 + 0.6,
        hopCount: Math.floor(Math.random() * 3) + 1,
        conceptualRole: 'connector'
      }
    ];
    return mockBridges;
  }

  /**
   * Enhanced clustering with configurable algorithms
   */
  async clusterThoughts(): Promise<Record<string, Thought[]>> {
    // Implementation logic (stubbed)
    // logger.debug(`Clustering ${_thoughts.length} thoughts using ${_algorithm} algorithm`);
    return {}; // Return an empty object for Record<string, Thought[]>
  }
}