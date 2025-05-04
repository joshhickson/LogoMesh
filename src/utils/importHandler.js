
// importHandler.js
import { ulid } from 'ulid';
import { newBubbleId, newSegmentId } from './eventBus';

const validateThought = (thought) => {
  if (!thought.title || !thought.segments) return false;
  return thought.segments.every(segment => 
    segment.title && 
    typeof segment.fields === 'object'
  );
};

const normalizeThought = (thought) => ({
  thought_bubble_id: thought.thought_bubble_id || newBubbleId(),
  title: thought.title,
  description: thought.description || '',
  created_at: thought.created_at || new Date().toISOString(),
  tags: (thought.tags || []).map(tag => 
    typeof tag === 'string' 
      ? { name: tag, color: '#10b981' }
      : tag
  ),
  color: thought.color || '#10b981',
  position: thought.position || { x: Math.random() * 500, y: Math.random() * 500 },
  segments: thought.segments.map(segment => ({
    segment_id: segment.segment_id || newSegmentId(),
    title: segment.title,
    content: segment.content || '',
    fields: segment.fields || {},
    embedding_vector: segment.embedding_vector || []
  }))
});

export function importFromJsonFile(callback) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';

  input.onchange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        let thoughts;

        // Handle new schema with metadata
        if (parsed.thoughts && Array.isArray(parsed.thoughts)) {
          thoughts = parsed.thoughts;
        } 
        // Handle legacy array format
        else if (Array.isArray(parsed)) {
          thoughts = parsed;
        } else {
          throw new Error('Invalid file format: Could not find thoughts array');
        }

        // Validate and normalize
        const validThoughts = thoughts
          .filter(validateThought)
          .map(normalizeThought);

        if (validThoughts.length === 0) {
          throw new Error('No valid thoughts found in file');
        }

        callback(validThoughts);
      } catch (error) {
        alert('Error processing file: ' + error.message);
      }
    };

    reader.readAsText(file);
  };

  input.click();
}
