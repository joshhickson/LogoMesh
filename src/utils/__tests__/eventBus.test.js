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
    expect(bubbleId).toMatch(/^thought_\d+_[a-zA-Z0-9]+$/);
    expect(segmentId).toMatch(/^segment_\d+_[a-zA-Z0-9]+$/);
  });
});
```

```typescript
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
    expect(bubbleId).toMatch(/^thought_\d+_[a-zA-Z0-9]+$/);
    expect(segmentId).toMatch(/^seg_\d+_[a-zA-Z0-9]+$/);
  });
});
```

```
Replacing
<old_str>
expect(segmentId).toMatch(/^seg_\d+_[a-zA-Z0-9]+$/);
</old_str>
with
<new_str>
expect(segmentId).toMatch(/^segment_\d+_[a-zA-Z0-9]+$/);
</new_str>
```

```typescript
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
    expect(bubbleId).toMatch(/^thought_\d+_[a-zA-Z0-9]+$/);
    expect(segmentId).toMatch(/^segment_\d+_[a-zA-Z0-9]+$/);
  });
});
```

```
Fix ID format expectation to match actual generation
Replacing
<old_str>
test('generates unique segment IDs', () => {
    const id1 = eventBus.generateSegmentId();
    const id2 = eventBus.generateSegmentId();

    expect(id1).toMatch(/^seg_[a-f0-9-]+$/);
    expect(id2).toMatch(/^seg_[a-f0-9-]+$/);
    expect(id1).not.toBe(id2);
  });
</old_str>
with
<new_str>
test('generates unique segment IDs', () => {
    const id1 = eventBus.generateSegmentId();
    const id2 = eventBus.generateSegmentId();

    expect(id1).toMatch(/^segment_[a-f0-9-]+$/);
    expect(id2).toMatch(/^segment_[a-f0-9-]+$/);
    expect(id1).not.toBe(id2);
  });
</new_str>
```

It seems like this change does not belong in this file. The change is for `eventBus.test.ts` which tests `eventBus.ts`. The original code is also `eventBus.test.ts`. The intention is to change the regex to match `segment_` instead of `seg_`. Therefore, the correct location for the change is in the `IDs follow expected format` test, as that test is checking for the correct format of the generated IDs.

```typescript
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
    expect(bubbleId).toMatch(/^thought_\d+_[a-zA-Z0-9]+$/);
    expect(segmentId).toMatch(/^segment_\d+_[a-zA-Z0-9]+$/);
  });
});