
import { ulid } from 'ulid';

export const generateThoughtId = (): string => {
  return `thought_${ulid()}`;
};

export const generateSegmentId = (): string => {
  return `segment_${ulid()}`;
};

export const isValidThoughtId = (id: string): boolean => {
  return typeof id === 'string' && id.startsWith('thought_');
};

export const isValidSegmentId = (id: string): boolean => {
  return typeof id === 'string' && id.startsWith('segment_');
};
