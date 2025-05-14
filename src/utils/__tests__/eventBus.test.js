import { newBubbleId, newSegmentId } from '../eventBus';

describe('eventBus', () => {
  test('newBubbleId generates unique IDs', () => {
    const id1 = newBubbleId();
    const id2 = newBubbleId();
    expect(id1).not.toBe(id2);
    expect(typeof id1).toBe('string');
  });

  test('newSegmentId generates unique IDs', () => {
    const id1 = newSegmentId();
    const id2 = newSegmentId();
    expect(id1).not.toBe(id2);
    expect(typeof id1).toBe('string');
  });

  test('IDs follow expected format', () => {
    const bubbleId = newBubbleId();
    const segmentId = newSegmentId();
    expect(bubbleId).toMatch(/^tb_[a-zA-Z0-9]+$/);
    expect(segmentId).toMatch(/^seg_[a-zA-Z0-9]+$/);
  });
});
