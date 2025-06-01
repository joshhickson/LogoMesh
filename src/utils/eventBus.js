import { EventEmitter } from 'events';

// Simple ID generation utilities (local implementation)
const generateThoughtId = () => `thought_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateSegmentId = () => `segment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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