
import { Thought } from '@contracts/entities';

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
        } else if (Array.isArray(parsed)) {
          this.thoughts = parsed; // legacy array format
        } else {
          console.warn('Invalid data format in localStorage');
          this.thoughts = [];
        }
      }
    } catch (error) {
      console.error('Failed to load thoughts from storage:', error);
      this.thoughts = [];
    }
  }

  /**
   * Returns all thoughts
   */
  getThoughts(): Thought[] {
    return this.thoughts;
  }

  /**
   * Returns a specific thought by ID
   */
  getThoughtById(id: string): Thought | undefined {
    return this.thoughts.find(t => t.thought_bubble_id === id);
  }

  /**
   * Updates or adds a thought
   */
  upsertThought(thought: Thought): void {
    const index = this.thoughts.findIndex(t => t.thought_bubble_id === thought.thought_bubble_id);
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
    this.thoughts = this.thoughts.filter(t => t.thought_bubble_id !== id);
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
          thought_count: this.thoughts.length
        },
        thoughts: this.thoughts
      };
      localStorage.setItem('thought-web-data', JSON.stringify(persistData));
    } catch (error) {
      console.error('Failed to persist thoughts to storage:', error);
    }
  }
}
