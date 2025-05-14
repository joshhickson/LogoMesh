import { ulid } from 'ulid';

export const generateThoughtId = (): string => `thought_${ulid()}`;
export const generateSegmentId = (): string => `segment_${ulid()}`;

// For validation
export const isValidThoughtId = (id: string): boolean =>
  typeof id === 'string' && id.startsWith('thought_');

export const isValidSegmentId = (id: string): boolean =>
  typeof id === 'string' && id.startsWith('segment_');
import { ulid } from 'ulid';

export const generateId = (): string => {
  return ulid();
};

export const isValidId = (id: string): boolean => {
  return typeof id === 'string' && id.length > 0;
};
