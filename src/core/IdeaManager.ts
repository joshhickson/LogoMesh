import { Thought, Segment } from '@contracts/entities';
import {
  generateThoughtId,
  generateSegmentId,
  isValidThoughtId,
  isValidSegmentId,
} from '@core/utils/idUtils';
import { logger } from '@core/utils/logger';

/**
 * Manages thought data and operations, providing a centralized interface
 * for data manipulation while abstracting storage details.
 */
export class IdeaManager {
  private thoughts: Thought[] = [];

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Attempts to load thoughts from localStorage on initialization
   */
  private loadFromStorage(): void {
    try {
      const savedData = localStorage.getItem('thought-web-data');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        // Handle both current and legacy data formats
        if (parsed.export_metadata && parsed.thoughts) {
          this.thoughts = parsed.thoughts; // v0.5+ structure
          logger.log('Loaded thoughts from storage (v0.5+ format)');
        } else if (Array.isArray(parsed)) {
          this.thoughts = parsed; // legacy array format
          logger.warn('Loading thoughts from legacy format');
        } else {
          logger.warn('Invalid data format in localStorage');
          this.thoughts = [];
        }
      }
    } catch (error) {
      logger.error('Failed to load thoughts from storage:', error);
      this.thoughts = [];
    }
  }

  /**
   * Returns all thoughts
   */
  /**
   * Returns all thoughts
   */
  getThoughts(): Thought[] {
    return [...this.thoughts];
  }

  /**
   * Returns a specific thought by ID
   */
  getThoughtById(id: string): Thought | undefined {
    return this.thoughts.find((t) => t.thought_bubble_id === id);
  }

  /**
   * Updates or adds a thought
   */
  upsertThought(thought: Thought): void {
    const index = this.thoughts.findIndex(
      (t) => t.thought_bubble_id === thought.thought_bubble_id
    );
    if (index >= 0) {
      this.thoughts[index] = thought;
    } else {
      this.thoughts.push(thought);
    }
    this.persistToStorage();
  }

  /**
   * Removes a thought by ID
   */
  removeThought(id: string): void {
    this.thoughts = this.thoughts.filter((t) => t.thought_bubble_id !== id);
    this.persistToStorage();
  }

  /**
   * Persists current state to localStorage
   */
  private persistToStorage(): void {
    try {
      const persistData = {
        export_metadata: {
          version: '0.5.0',
          exported_at: new Date().toISOString(),
          thought_count: this.thoughts.length,
        },
        thoughts: this.thoughts,
      };
      localStorage.setItem('thought-web-data', JSON.stringify(persistData));
      logger.log(`Persisted ${this.thoughts.length} thoughts to storage`);
    } catch (error) {
      logger.error('Failed to persist thoughts to storage:', error);
    }
  }

  public addThought(
    thoughtData: Omit<
      Thought,
      'thought_bubble_id' | 'created_at' | 'updated_at'
    >
  ): Thought {
    let thoughtId = generateThoughtId();
    while (this.thoughts.some((t) => t.thought_bubble_id === thoughtId)) {
      console.warn(
        `Generated duplicate thought ID ${thoughtId}, regenerating...`
      );
      thoughtId = generateThoughtId();
    }

    const thought: Thought = {
      ...thoughtData,
      thought_bubble_id: thoughtId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      segments: [],
      tags: [],
    };
    this.thoughts.push(thought);
    this.persistToStorage();
    return thought;
  }

  public updateThought(
    thoughtId: string,
    updates: Partial<Omit<Thought, 'thought_bubble_id' | 'created_at'>>
  ): Thought | undefined {
    const index = this.thoughts.findIndex(
      (t) => t.thought_bubble_id === thoughtId
    );
    if (index === -1) return undefined;

    const thought = this.thoughts[index];
    this.thoughts[index] = {
      ...thought,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.persistToStorage();
    return this.thoughts[index];
  }

  public deleteThought(thoughtId: string): boolean {
    const initialLength = this.thoughts.length;
    this.thoughts = this.thoughts.filter(
      (t) => t.thought_bubble_id !== thoughtId
    );
    const deleted = this.thoughts.length < initialLength;
    if (deleted) this.persistToStorage();
    return deleted;
  }

  public addSegment(
    thoughtId: string,
    segmentData: Omit<
      Segment,
      'segment_id' | 'thought_bubble_id' | 'created_at' | 'updated_at'
    >
  ): Segment | undefined {
    if (!isValidThoughtId(thoughtId)) {
      console.error(`Invalid thought ID format: ${thoughtId}`);
      return undefined;
    }

    const thought = this.getThoughtById(thoughtId);
    if (!thought) {
      console.error(`Thought not found with ID: ${thoughtId}`);
      return undefined;
    }

    let segmentId = generateSegmentId();
    while (thought.segments?.some((s) => s.segment_id === segmentId)) {
      console.warn(
        `Generated duplicate segment ID ${segmentId}, regenerating...`
      );
      segmentId = generateSegmentId();
    }

    const segment: Segment = {
      ...segmentData,
      segment_id: segmentId,
      thought_bubble_id: thoughtId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      abstraction_level: segmentData.abstraction_level || 'Fact',
      cluster_id: segmentData.cluster_id || 'uncategorized',
    };

    thought.segments = thought.segments || [];
    thought.segments.push(segment);
    this.persistToStorage();
    return segment;
  }

  public updateSegment(
    thoughtId: string,
    segmentId: string,
    updates: Partial<
      Omit<Segment, 'segment_id' | 'thought_bubble_id' | 'created_at'>
    >
  ): Segment | undefined {
    const thought = this.getThoughtById(thoughtId);
    if (!thought || !thought.segments) return undefined;

    const segmentIndex = thought.segments.findIndex(
      (s) => s.segment_id === segmentId
    );
    if (segmentIndex === -1) return undefined;

    const segment = thought.segments[segmentIndex];
    thought.segments[segmentIndex] = {
      ...segment,
      ...updates,
      abstraction_level: updates.abstraction_level || segment.abstraction_level,
      cluster_id: updates.cluster_id || segment.cluster_id,
      updated_at: new Date().toISOString(),
    };

    this.persistToStorage();
    return thought.segments[segmentIndex];
  }

  public deleteSegment(thoughtId: string, segmentId: string): boolean {
    const thought = this.getThoughtById(thoughtId);
    if (!thought || !thought.segments) return false;

    const initialLength = thought.segments.length;
    thought.segments = thought.segments.filter(
      (s) => s.segment_id !== segmentId
    );
    const deleted = thought.segments.length < initialLength;
    if (deleted) this.persistToStorage();
    return deleted;
  }
}