import { Thought, Segment } from '@contracts/entities';
import {
  generateThoughtId,
  generateSegmentId,
  isValidThoughtId,
  isValidSegmentId,
} from '@core/utils/idUtils';
import { logger } from '@core/utils/logger';

// Helper function for debouncing (void return for synchronous localStorage)
function debounceVoid<F extends (...args: any[]) => void>(func: F, delay: number): (...args: Parameters<F>) => void {
  let timeoutId: number | null = null; // Using number for browser setTimeout/clearTimeout
  return function(this: any, ...args: Parameters<F>) {
    const context = this;
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => func.apply(context, args), delay) as any; // 'as any' to handle browser/Node timer type diff
  };
}

/**
 * Manages thought data and operations, providing a centralized interface
 * for data manipulation while abstracting storage details.
 */
export class IdeaManager {
  private thoughts: Thought[] = [];
  public persistToStorage: () => void; // Public debounced method

  constructor() {
    this.loadFromStorage(); // loadFromStorage should not be debounced

    // Initialize the debounced persistToStorage method
    // Binding `this` to `_actualPersistToStorage` is crucial
    this.persistToStorage = debounceVoid(this._actualPersistToStorage.bind(this), 300);
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
        const processThoughts = (thoughtsToProcess: any[], formatLabel: string) => {
          const seenIds = new Set<string>();
          const uniqueThoughts: Thought[] = [];
          if (Array.isArray(thoughtsToProcess)) {
            for (const thought of thoughtsToProcess) {
              if (thought && typeof thought.thought_bubble_id === 'string') {
                if (seenIds.has(thought.thought_bubble_id)) {
                  logger.error(`Duplicate thought_bubble_id found and skipped during load (${formatLabel}): ${thought.thought_bubble_id}`);
                } else {
                  seenIds.add(thought.thought_bubble_id);
                  uniqueThoughts.push(thought as Thought);
                }
              } else {
                logger.warn(`Skipping invalid thought object during load (${formatLabel}):`, thought);
              }
            }
            this.thoughts = uniqueThoughts;
            logger.log(`Loaded ${uniqueThoughts.length} unique thoughts from storage (${formatLabel} format)`);
          } else {
            logger.error(`Loaded "${formatLabel}" thoughts data is not an array. Initializing with empty thoughts.`);
            this.thoughts = [];
          }
        };

        if (parsed.export_metadata && parsed.thoughts) {
          processThoughts(parsed.thoughts, 'v0.5+');
        } else if (Array.isArray(parsed)) {
          processThoughts(parsed, 'legacy');
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
   * Actual persistence logic, now private and renamed.
   */
  private _actualPersistToStorage(): void {
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
      // Updated log message for clarity
      logger.log(`Persisted ${this.thoughts.length} thoughts to storage (debounced)`);
    } catch (error) {
      logger.error('Failed to persist thoughts to storage:', error);
    }
  }

  public addThought(
    thoughtData: Omit<
      Thought,
      'thought_bubble_id' | 'created_at' | 'updated_at'
    >
  ): Thought | undefined {
    if (!thoughtData.title || thoughtData.title.trim() === '') {
      logger.error('Attempted to add thought with empty or missing title.');
      return undefined;
    }
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

    if (updates.title !== undefined && updates.title.trim() === '') {
      logger.warn(`Attempted to update thought ID ${thoughtId} with an empty title. Title update will be skipped.`);
      delete updates.title; // Prevent empty title from being set
    }

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

    if ((!segmentData.title || segmentData.title.trim() === '') && (!segmentData.content || segmentData.content.trim() === '')) {
      logger.error(`Attempted to add segment to thought ID ${thoughtId} with empty or missing title and content.`);
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

    const currentSegment = thought.segments[segmentIndex];
    const newTitle = updates.title !== undefined ? updates.title : currentSegment.title;
    const newContent = updates.content !== undefined ? updates.content : currentSegment.content;

    if ((!newTitle || newTitle.trim() === '') && (!newContent || newContent.trim() === '')) {
      logger.warn(`Attempted to update segment ID ${segmentId} in thought ID ${thoughtId} to have empty title and content. Update skipped.`);
      return undefined;
    }

    // Specific handling for empty title or content if the other is not empty:
    // If trying to set title to empty string, ensure newContent (or current content if newContent is not being updated) is not empty.
    if (updates.title !== undefined && updates.title.trim() === '') {
        const contentToCheck = updates.content !== undefined ? (updates.content || '').trim() : (currentSegment.content || '').trim();
        if (contentToCheck === '') {
            logger.warn(`Attempted to update segment ID ${segmentId} to have empty title while content is also empty. Title update skipped.`);
            delete updates.title; // Skip making title empty if content would also be empty
        }
    }
    // If trying to set content to empty string, ensure newTitle (or current title if newTitle is not being updated) is not empty.
     if (updates.content !== undefined && updates.content.trim() === '') {
        const titleToCheck = updates.title !== undefined ? (updates.title || '').trim() : (currentSegment.title || '').trim();
        if (titleToCheck === '') {
            logger.warn(`Attempted to update segment ID ${segmentId} to have empty content while title is also empty. Content update skipped.`);
            delete updates.content; // Skip making content empty if title would also be empty
        }
    }

    const segment = thought.segments[segmentIndex]; // Re-fetch segment in case it was modified by other logic (though not in this specific flow)
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

  /**
   * Replaces all thoughts with a new set of thoughts.
   * @param newThoughts The array of thoughts to replace the current ones.
   */
  public replaceAllThoughts(newThoughts: Thought[]): void {
    this.thoughts = newThoughts;
    this.persistToStorage();
    logger.log(`Replaced all thoughts with ${newThoughts.length} new thoughts from import.`);
  }

  /**
   * Clears all thoughts from the manager.
   */
  public clearAllThoughts(): void {
    this.thoughts = [];
    this.persistToStorage();
    logger.log('Cleared all thoughts from memory and storage.');
  }

  /**
   * Links two thoughts together.
   * @param sourceThoughtId The ID of the source thought.
   * @param targetThoughtId The ID of the target thought.
   * @returns True if the link was successfully created or already existed, false otherwise.
   */
  public linkThoughts(sourceThoughtId: string, targetThoughtId: string): boolean {
    if (sourceThoughtId === targetThoughtId) {
      logger.warn(`Attempted to link thought ID ${sourceThoughtId} to itself. Self-linking is not allowed.`);
      return false;
    }

    const sourceThought = this.getThoughtById(sourceThoughtId);
    const targetThought = this.getThoughtById(targetThoughtId);

    if (!sourceThought || !targetThought) {
      logger.error(`Attempted to link non-existent thought. Source: ${sourceThoughtId}, Target: ${targetThoughtId}`);
      return false;
    }

    sourceThought.related_thought_ids = sourceThought.related_thought_ids || [];
    targetThought.related_thought_ids = targetThought.related_thought_ids || [];

    let changed = false;

    if (!sourceThought.related_thought_ids.includes(targetThoughtId)) {
      sourceThought.related_thought_ids.push(targetThoughtId);
      sourceThought.updated_at = new Date().toISOString();
      changed = true;
    }

    if (!targetThought.related_thought_ids.includes(sourceThoughtId)) {
      targetThought.related_thought_ids.push(sourceThoughtId);
      targetThought.updated_at = new Date().toISOString();
      changed = true;
    }

    if (changed) {
      this.persistToStorage();
      logger.log(`Linked thought ID ${sourceThoughtId} and ${targetThoughtId}`);
      return true;
    } else {
      logger.warn(`Link between thought ID ${sourceThoughtId} and ${targetThoughtId} already exists or no change made.`);
      return true; // Success if link already existed
    }
  }

  /**
   * Unlinks two thoughts.
   * @param sourceThoughtId The ID of the source thought.
   * @param targetThoughtId The ID of the target thought.
   * @returns True if the link was successfully removed, false otherwise.
   */
  public unlinkThoughts(sourceThoughtId: string, targetThoughtId: string): boolean {
    const sourceThought = this.getThoughtById(sourceThoughtId);
    const targetThought = this.getThoughtById(targetThoughtId);

    if (!sourceThought || !targetThought) {
      logger.warn(`Attempted to unlink thoughts where one or both do not exist. Source: ${sourceThoughtId}, Target: ${targetThoughtId}`);
      return false;
    }

    let linkRemoved = false;

    if (sourceThought.related_thought_ids && sourceThought.related_thought_ids.includes(targetThoughtId)) {
      sourceThought.related_thought_ids = sourceThought.related_thought_ids.filter(id => id !== targetThoughtId);
      sourceThought.updated_at = new Date().toISOString();
      linkRemoved = true;
    }

    if (targetThought.related_thought_ids && targetThought.related_thought_ids.includes(sourceThoughtId)) {
      targetThought.related_thought_ids = targetThought.related_thought_ids.filter(id => id !== sourceThoughtId);
      targetThought.updated_at = new Date().toISOString();
      linkRemoved = true;
    }

    if (linkRemoved) {
      this.persistToStorage();
      logger.log(`Unlinked thought ID ${sourceThoughtId} and ${targetThoughtId}`);
      return true;
    } else {
      logger.warn(`No link found to remove between thought ID ${sourceThoughtId} and ${targetThoughtId}.`);
      return false;
    }
  }

  /**
   * Retrieves all thoughts linked to a given thought.
   * @param thoughtId The ID of the thought.
   * @returns An array of Thought objects that are linked to the given thought. Returns empty array if none.
   */
  public getLinkedThoughts(thoughtId: string): Thought[] {
    const thought = this.getThoughtById(thoughtId);

    if (!thought || !thought.related_thought_ids || thought.related_thought_ids.length === 0) {
      return [];
    }

    return thought.related_thought_ids
      .map(relatedId => this.getThoughtById(relatedId))
      .filter(relatedThought => relatedThought !== undefined) as Thought[];
  }
}