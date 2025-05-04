import { ulid } from 'ulid';
import { EventEmitter } from 'events';

const eventBus = new EventEmitter();

export const ThoughtEvents = {
  THOUGHT_CREATED: 'thought:created',
  THOUGHT_UPDATED: 'thought:updated',
  TAG_ADDED: 'tag:added',
  SEGMENT_CREATED: 'segment:created'
};

export const newBubbleId = () => `tb_${ulid()}`;
export const newSegmentId = () => `seg_${ulid()}`;

export default eventBus;