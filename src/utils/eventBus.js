import { EventEmitter } from 'events';
import { generateThoughtId, generateSegmentId } from '@core/utils/idUtils';

const eventBus = new EventEmitter();

export const ThoughtEvents = {
  THOUGHT_CREATED: 'thought:created',
  THOUGHT_UPDATED: 'thought:updated',
  TAG_ADDED: 'tag:added',
  SEGMENT_CREATED: 'segment:created',
};

export const newBubbleId = generateThoughtId;
export const newSegmentId = generateSegmentId;

export default eventBus;
