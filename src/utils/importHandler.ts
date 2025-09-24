import { newBubbleId, newSegmentId } from './eventBus';
import { Thought, Segment, Tag } from '@contracts/entities';

const validateThought = (thought: Partial<Thought>): thought is Thought => {
  if (!thought.title || !thought.segments) return false;
  return thought.segments.every(
    (segment: Partial<Segment>) => segment.title && typeof segment.fields === 'object'
  );
};

const normalizeThought = (thought: Partial<Thought>): Thought => ({
  id: thought.id || newBubbleId(),
  title: thought.title!,
  description: thought.description || '',
  created_at: thought.created_at || new Date().toISOString(),
  updated_at: thought.updated_at || new Date().toISOString(),
  tags: (thought.tags || []).map((tag: Partial<Tag> | string) =>
    typeof tag === 'string' ? { name: tag, color: '#10b981' } : tag
  ) as Tag[],
  color: thought.color || '#10b981',
  position: thought.position || {
    x: Math.random() * 500,
    y: Math.random() * 500,
  },
  segments: (thought.segments || []).map((segment: Partial<Segment>) => ({
    segment_id: segment.segment_id || newSegmentId(),
    thought_bubble_id: thought.id || '',
    title: segment.title!,
    content: segment.content || '',
    created_at: segment.created_at || new Date().toISOString(),
    updated_at: segment.updated_at || new Date().toISOString(),
    fields: segment.fields || {},
  })),
});

export function importFromJsonFile(callback: (thoughts: Thought[]) => void) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';

  input.onchange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const result = e.target?.result;
        if (typeof result !== 'string') {
          throw new Error('File could not be read as text');
        }
        const parsed = JSON.parse(result);
        let thoughts: Partial<Thought>[];

        if (parsed.thoughts && Array.isArray(parsed.thoughts)) {
          thoughts = parsed.thoughts;
        } else if (Array.isArray(parsed)) {
          thoughts = parsed;
        } else {
          throw new Error('Invalid file format: Could not find thoughts array');
        }

        const validThoughts = thoughts
          .filter(validateThought)
          .map(normalizeThought);

        if (validThoughts.length === 0) {
          throw new Error('No valid thoughts found in file');
        }

        callback(validThoughts);
      } catch (error) {
        alert('Error processing file: ' + (error as Error).message);
      }
    };

    reader.readAsText(file);
  };

  input.click();
}
