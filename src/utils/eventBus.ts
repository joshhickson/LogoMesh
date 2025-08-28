import { EventEmitter } from 'events';
import { ulid } from 'ulid';

// Simple ID generation utilities (local implementation)
const generateThoughtId = (): string => `thought_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateSegmentId = (): string => `segment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const eventBus = new EventEmitter();

export const ThoughtEvents: { [key: string]: string } = {
  THOUGHT_CREATED: 'thought:created',
  THOUGHT_UPDATED: 'thought:updated',
  TAG_ADDED: 'tag:added',
  SEGMENT_CREATED: 'segment:created',
};

export const newBubbleId = (): string => {
  return `seg_${ulid()}`;
};
export const newSegmentId = (): string => {
  return `seg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export default eventBus;