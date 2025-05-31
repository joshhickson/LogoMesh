import { IdeaManager } from '../IdeaManager';
import { Thought, Segment } from '@contracts/entities';
import { logger } from '@core/utils/logger';

// Mock logger
jest.mock('@core/utils/logger', () => ({
  logger: {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock idUtils to return predictable IDs for some tests
jest.mock('@core/utils/idUtils', () => ({
  ...jest.requireActual('@core/utils/idUtils'), // Import and retain default behavior
  generateThoughtId: jest.fn(() => `mock-thought-${Math.random().toString(36).substr(2, 9)}`),
  generateSegmentId: jest.fn(() => `mock-segment-${Math.random().toString(36).substr(2, 9)}`),
}));


describe('IdeaManager', () => {
  let ideaManager: IdeaManager;
  let store: { [key: string]: string } = {};

  const mockLocalStorage = {
    getItem: (key: string): string | null => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };

  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
  });

  beforeEach(() => {
    store = {}; // Clear localStorage mock before each test
    jest.clearAllMocks(); // Clear all jest mocks including logger and idUtils
    ideaManager = new IdeaManager();
    // Spy on the actual internal persistence method for debounce tests
    jest.spyOn(ideaManager as any, '_actualPersistToStorage');
  });

  afterEach(() => {
    jest.useRealTimers(); // Restore real timers after each test if fake timers were used
  });

  describe('Initialization & Loading', () => {
    it('should initialize with empty thoughts if localStorage is empty', () => {
      expect(ideaManager.getThoughts()).toEqual([]);
    });

    it('should initialize with empty thoughts if localStorage data is invalid JSON', () => {
      localStorage.setItem('thought-web-data', 'invalid-json');
      const newManager = new IdeaManager();
      expect(newManager.getThoughts()).toEqual([]);
      expect(logger.error).toHaveBeenCalledWith('Failed to load thoughts from storage:', expect.any(Error));
    });

    it('should load valid v0.5+ data correctly', () => {
      const thoughts: Thought[] = [{ thought_bubble_id: 't1', title: 'Test 1', created_at: '', updated_at: '', segments: [], tags: [], color: '', position: {x:0, y:0}, description: '' }];
      localStorage.setItem('thought-web-data', JSON.stringify({ export_metadata: {}, thoughts }));
      const newManager = new IdeaManager();
      expect(newManager.getThoughts()).toEqual(thoughts);
      expect(logger.log).toHaveBeenCalledWith(`Loaded ${thoughts.length} unique thoughts from storage (v0.5+ format)`);
    });

    it('should load valid legacy array data correctly', () => {
      const thoughts: Thought[] = [{ thought_bubble_id: 't1', title: 'Test 1', created_at: '', updated_at: '', segments: [], tags: [], color: '', position: {x:0, y:0}, description: '' }];
      localStorage.setItem('thought-web-data', JSON.stringify(thoughts));
      const newManager = new IdeaManager();
      expect(newManager.getThoughts()).toEqual(thoughts);
      expect(logger.log).toHaveBeenCalledWith(`Loaded ${thoughts.length} unique thoughts from storage (legacy format)`);
    });

    it('should handle malformed JSON by initializing with empty thoughts', () => {
      localStorage.setItem('thought-web-data', '{"bad": json}');
      const newManager = new IdeaManager();
      expect(newManager.getThoughts()).toEqual([]);
      expect(logger.error).toHaveBeenCalledWith("Failed to load thoughts from storage:", expect.any(SyntaxError));
    });

    it('should handle "thoughts" property not being an array by initializing with empty thoughts', () => {
      localStorage.setItem('thought-web-data', JSON.stringify({ export_metadata: {}, thoughts: { not: "an array" } }));
      const newManager = new IdeaManager();
      expect(newManager.getThoughts()).toEqual([]);
      expect(logger.error).toHaveBeenCalledWith('Loaded "v0.5+" thoughts data is not an array. Initializing with empty thoughts.');
    });

    it('should filter out thoughts with duplicate thought_bubble_ids during load, keeping first occurrence', () => {
      const thoughts: Thought[] = [
        { thought_bubble_id: 't1', title: 'First t1', created_at: '1', updated_at: '1', segments: [], tags: [], color: '', position: {x:0, y:0}, description: '' },
        { thought_bubble_id: 't2', title: 'Test t2', created_at: '2', updated_at: '2', segments: [], tags: [], color: '', position: {x:0, y:0}, description: '' },
        { thought_bubble_id: 't1', title: 'Duplicate t1', created_at: '3', updated_at: '3', segments: [], tags: [], color: '', position: {x:0, y:0}, description: '' },
      ];
      localStorage.setItem('thought-web-data', JSON.stringify({ export_metadata: {}, thoughts }));
      const newManager = new IdeaManager();
      const loadedThoughts = newManager.getThoughts();
      expect(loadedThoughts.length).toBe(2);
      expect(loadedThoughts.find(t => t.thought_bubble_id === 't1')?.title).toBe('First t1');
      expect(logger.error).toHaveBeenCalledWith("Duplicate thought_bubble_id found and skipped during load (v0.5+): t1");
    });
  });

  describe('Thoughts CRUD', () => {
    describe('addThought()', () => {
      it('should add a new thought and return it', () => {
        const thoughtData = { title: 'New Thought', description: 'A test thought' };
        const newThought = ideaManager.addThought(thoughtData);
        expect(newThought).toBeDefined();
        expect(newThought?.title).toBe('New Thought');
        expect(ideaManager.getThoughts().length).toBe(1);
        expect(ideaManager.getThoughts()[0]).toEqual(expect.objectContaining(thoughtData));
        expect(newThought?.thought_bubble_id).toMatch(/^mock-thought-/);
      });

      it('should return undefined and log an error if title is empty', () => {
        const thoughtData = { title: '', description: 'A test thought' };
        const newThought = ideaManager.addThought(thoughtData);
        expect(newThought).toBeUndefined();
        expect(logger.error).toHaveBeenCalledWith('Attempted to add thought with empty or missing title.');
        expect(ideaManager.getThoughts().length).toBe(0);
      });
    });

    describe('getThoughts() & getThoughtById()', () => {
      it('should return all current thoughts', () => {
        ideaManager.addThought({ title: 'T1' , description: ''});
        ideaManager.addThought({ title: 'T2' , description: ''});
        expect(ideaManager.getThoughts().length).toBe(2);
      });

      it('should return the correct thought if ID exists', () => {
        const thought = ideaManager.addThought({ title: 'Find Me', description: '' });
        const found = ideaManager.getThoughtById(thought!.thought_bubble_id);
        expect(found).toEqual(thought);
      });

      it('should return undefined if ID does not exist', () => {
        expect(ideaManager.getThoughtById('non-existent-id')).toBeUndefined();
      });
    });

    describe('updateThought()', () => {
      it('should update an existing thought\'s properties and updated_at', () => {
        const thought = ideaManager.addThought({ title: 'Original Title', description: 'Original Desc' })!;
        const originalUpdateTimestamp = thought.updated_at;

        // Ensure a slight delay for timestamp comparison
        return new Promise(resolve => setTimeout(() => {
            const updates = { title: 'Updated Title', color: '#FF0000' };
            const updatedThought = ideaManager.updateThought(thought.thought_bubble_id, updates);

            expect(updatedThought).toBeDefined();
            expect(updatedThought?.title).toBe('Updated Title');
            expect(updatedThought?.color).toBe('#FF0000');
            expect(updatedThought?.description).toBe('Original Desc'); // Unchanged
            expect(updatedThought?.updated_at).not.toBe(originalUpdateTimestamp);
            resolve(null);
        }, 10));
      });

      it('should not update title if the new title is an empty string, and log a warning', () => {
        const thought = ideaManager.addThought({ title: 'Valid Title', description: '' })!;
        const updatedThought = ideaManager.updateThought(thought.thought_bubble_id, { title: ' ' });
        expect(updatedThought?.title).toBe('Valid Title');
        expect(logger.warn).toHaveBeenCalledWith(`Attempted to update thought ID ${thought.thought_bubble_id} with an empty title. Title update will be skipped.`);
      });

      it('should return undefined if the thought ID does not exist', () => {
        const result = ideaManager.updateThought('non-existent-id', { title: 'New Title' });
        expect(result).toBeUndefined();
      });
    });

    describe('deleteThought()', () => {
      it('should remove the thought with the given ID and return true', () => {
        const thought = ideaManager.addThought({ title: 'To Delete', description: '' })!;
        const result = ideaManager.deleteThought(thought.thought_bubble_id);
        expect(result).toBe(true);
        expect(ideaManager.getThoughts().length).toBe(0);
      });

      it('should return false if thought ID does not exist', () => {
        const result = ideaManager.deleteThought('non-existent-id');
        expect(result).toBe(false);
      });
    });

    describe('upsertThought()', () => {
        it('should add a thought if it does not exist', () => {
            const newThoughtData: Thought = { thought_bubble_id: 'upsert-1', title: 'New Upsert', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), segments: [], tags: [], color: '', position: {x:0,y:0}, description: ''};
            ideaManager.upsertThought(newThoughtData);
            expect(ideaManager.getThoughtById('upsert-1')).toEqual(newThoughtData);
            expect(ideaManager.getThoughts().length).toBe(1);
        });

        it('should update a thought if it already exists', () => {
            const initialThoughtData: Thought = { thought_bubble_id: 'upsert-2', title: 'Initial Upsert', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), segments: [], tags: [], color: 'blue', position: {x:0,y:0}, description: ''};
            ideaManager.addThought({title: initialThoughtData.title, description: ''}); // Add it first normally to get it into the list
            const addedThought = ideaManager.getThoughts()[0]; // Get the actual added thought with its generated ID

            const updatedData = { ...addedThought, title: 'Updated Upsert Title', color: 'red' };
            ideaManager.upsertThought(updatedData);

            const finalThought = ideaManager.getThoughtById(addedThought.thought_bubble_id);
            expect(finalThought?.title).toBe('Updated Upsert Title');
            expect(finalThought?.color).toBe('red');
            expect(ideaManager.getThoughts().length).toBe(1); // Still only one thought
        });
    });
  });

  describe('Segments CRUD', () => {
    let thoughtId: string;

    beforeEach(() => {
      const thought = ideaManager.addThought({ title: 'Parent Thought', description: '' })!;
      thoughtId = thought.thought_bubble_id;
    });

    describe('addSegment()', () => {
      it('should add a new segment to a specified thought and return it', () => {
        const segmentData = { title: 'New Segment', content: 'Some content' };
        const newSegment = ideaManager.addSegment(thoughtId, segmentData);
        expect(newSegment).toBeDefined();
        expect(newSegment?.title).toBe('New Segment');
        expect(newSegment?.segment_id).toMatch(/^mock-segment-/);
        const parentThought = ideaManager.getThoughtById(thoughtId);
        expect(parentThought?.segments?.length).toBe(1);
        expect(parentThought?.segments?.[0]).toEqual(expect.objectContaining(segmentData));
      });

      it('should return undefined and log an error if both title and content are empty', () => {
        const segment = ideaManager.addSegment(thoughtId, { title: ' ', content: '' });
        expect(segment).toBeUndefined();
        expect(logger.error).toHaveBeenCalledWith(`Attempted to add segment to thought ID ${thoughtId} with empty or missing title and content.`);
      });

      it('should return undefined if the parent thought ID does not exist', () => {
        const segment = ideaManager.addSegment('non-existent-thought-id', { title: 'Title', content: 'Content' });
        expect(segment).toBeUndefined();
        expect(logger.error).toHaveBeenCalledWith('Thought not found with ID: non-existent-thought-id');
      });
    });

    describe('updateSegment()', () => {
      let segmentId: string;

      beforeEach(() => {
        const segment = ideaManager.addSegment(thoughtId, { title: 'Original Seg Title', content: 'Original Seg Content' })!;
        segmentId = segment.segment_id;
      });

      it('should update an existing segment\'s properties and updated_at', () => {
        const parentThoughtBefore = ideaManager.getThoughtById(thoughtId)!;
        const segmentBefore = parentThoughtBefore.segments!.find(s => s.segment_id === segmentId)!;
        const originalUpdateTimestamp = segmentBefore.updated_at;

        return new Promise(resolve => setTimeout(() => {
            const updates = { title: 'Updated Seg Title', abstraction_level: 'Idea' as const };
            const updatedSegment = ideaManager.updateSegment(thoughtId, segmentId, updates);

            expect(updatedSegment).toBeDefined();
            expect(updatedSegment?.title).toBe('Updated Seg Title');
            expect(updatedSegment?.abstraction_level).toBe('Idea');
            expect(updatedSegment?.content).toBe('Original Seg Content'); // Unchanged
            expect(updatedSegment?.updated_at).not.toBe(originalUpdateTimestamp);
            resolve(null);
        }, 10));
      });

      it('should return undefined and log warning if update makes both title and content empty', () => {
        const result = ideaManager.updateSegment(thoughtId, segmentId, { title: '', content: '' });
        expect(result).toBeUndefined();
        expect(logger.warn).toHaveBeenCalledWith(`Attempted to update segment ID ${segmentId} in thought ID ${thoughtId} to have empty title and content. Update skipped.`);
      });

      it('should skip updating title if it becomes empty AND content is also/becomes empty', () => {
        // First make content empty
        ideaManager.updateSegment(thoughtId, segmentId, { content: '' });
        // Now try to make title empty
        const segment = ideaManager.updateSegment(thoughtId, segmentId, { title: '' });
        // This should be prevented by the overall "both empty" check if content was already empty,
        // or by specific title-empty check if content becomes empty in same update.
        const finalSegment = ideaManager.getThoughtById(thoughtId)?.segments?.find(s => s.segment_id === segmentId);
        expect(finalSegment?.title).not.toBe(''); // Title should not have been emptied because content is already empty
        if(!finalSegment?.title) { // if title was not empty before, and content was, then this update should have been skipped
             expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining(`Attempted to update segment ID ${segmentId}`));
        }
      });

      it('should skip updating content if it becomes empty AND title is also/becomes empty', () => {
        ideaManager.updateSegment(thoughtId, segmentId, { title: '' }); // Make title empty first
        const segment = ideaManager.updateSegment(thoughtId, segmentId, { content: '' });
        const finalSegment = ideaManager.getThoughtById(thoughtId)?.segments?.find(s => s.segment_id === segmentId);
        expect(finalSegment?.content).not.toBe('');
        if(!finalSegment?.content){
            expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining(`Attempted to update segment ID ${segmentId}`));
        }
      });


      it('should return undefined if thought or segment ID does not exist', () => {
        expect(ideaManager.updateSegment('bad-thought', segmentId, { title: 'New' })).toBeUndefined();
        expect(ideaManager.updateSegment(thoughtId, 'bad-segment', { title: 'New' })).toBeUndefined();
      });
    });

    describe('deleteSegment()', () => {
      it('should remove the segment and return true', () => {
        const segment = ideaManager.addSegment(thoughtId, { title: 'To Delete Seg', content: '...' })!;
        const result = ideaManager.deleteSegment(thoughtId, segment.segment_id);
        expect(result).toBe(true);
        const parentThought = ideaManager.getThoughtById(thoughtId);
        expect(parentThought?.segments?.length).toBe(0);
      });

      it('should return false if segment or thought ID does not exist', () => {
        expect(ideaManager.deleteSegment(thoughtId, 'non-existent-segment')).toBe(false);
        expect(ideaManager.deleteSegment('non-existent-thought', 'any-segment')).toBe(false);
      });
    });
  });

  describe('Bulk Operations', () => {
    it('replaceAllThoughts() should replace all existing thoughts', () => {
      ideaManager.addThought({ title: 'Old Thought 1', description: '' });
      const newThoughts: Thought[] = [
        { thought_bubble_id: 'new1', title: 'New Thought 1', created_at: '1', updated_at: '1', segments: [], tags: [], color: '', position: {x:0, y:0}, description: '' },
        { thought_bubble_id: 'new2', title: 'New Thought 2', created_at: '2', updated_at: '2', segments: [], tags: [], color: '', position: {x:0, y:0}, description: '' },
      ];
      ideaManager.replaceAllThoughts(newThoughts);
      expect(ideaManager.getThoughts()).toEqual(newThoughts);
      expect(logger.log).toHaveBeenCalledWith(`Replaced all thoughts with ${newThoughts.length} new thoughts from import.`);
    });

    it('replaceAllThoughts() should handle an empty array, clearing all thoughts', () => {
      ideaManager.addThought({ title: 'Old Thought 1', description: '' });
      ideaManager.replaceAllThoughts([]);
      expect(ideaManager.getThoughts()).toEqual([]);
      expect(logger.log).toHaveBeenCalledWith(`Replaced all thoughts with 0 new thoughts from import.`);
    });

    it('clearAllThoughts() should remove all thoughts', () => {
      ideaManager.addThought({ title: 'Thought 1', description: '' });
      ideaManager.clearAllThoughts();
      expect(ideaManager.getThoughts()).toEqual([]);
      expect(logger.log).toHaveBeenCalledWith('Cleared all thoughts from memory and storage.');
    });
  });

  describe('Persistence (Debounce & localStorage interaction)', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    it('should call _actualPersistToStorage after debounce when a thought is added', () => {
      ideaManager.addThought({ title: 'Debounce Test', description: '' });
      expect((ideaManager as any)._actualPersistToStorage).not.toHaveBeenCalled();
      jest.runAllTimers();
      expect((ideaManager as any)._actualPersistToStorage).toHaveBeenCalledTimes(1);
    });

    it('should call _actualPersistToStorage only once for multiple rapid additions', () => {
      ideaManager.addThought({ title: 'Rapid 1', description: '' });
      ideaManager.addThought({ title: 'Rapid 2', description: '' });
      ideaManager.addThought({ title: 'Rapid 3', description: '' });
      expect((ideaManager as any)._actualPersistToStorage).not.toHaveBeenCalled();
      jest.runAllTimers();
      expect((ideaManager as any)._actualPersistToStorage).toHaveBeenCalledTimes(1);
    });

    it('_actualPersistToStorage should call localStorage.setItem with the correct data structure', () => {
      const thoughtData = { title: 'Persist Structure Test', description: 'Test' };
      ideaManager.addThought(thoughtData);
      jest.runAllTimers(); // Trigger the debounced save

      const expectedThought = ideaManager.getThoughts()[0];
      const expectedStorageData = {
        export_metadata: {
          version: '0.5.0',
          exported_at: expect.any(String), // Date will be dynamic
          thought_count: 1,
        },
        thoughts: [expectedThought],
      };

      // Check that setItem was called
      expect(localStorage.setItem).toHaveBeenCalled();

      // Get the actual call arguments
      const setItemCall = (localStorage.setItem as jest.Mock).mock.calls[0];
      expect(setItemCall[0]).toBe('thought-web-data');

      // Parse the stringified data and compare
      const actualStoredData = JSON.parse(setItemCall[1]);
      expect(actualStoredData.export_metadata.version).toBe(expectedStorageData.export_metadata.version);
      expect(actualStoredData.export_metadata.thought_count).toBe(expectedStorageData.export_metadata.thought_count);
      expect(actualStoredData.thoughts).toEqual(expectedStorageData.thoughts); // Compare the thoughts array
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });
  });
});
