
import { ulid } from 'ulid';

export const newBubbleId = (): string => `tb_${ulid()}`;
export const newSegmentId = (): string => `seg_${ulid()}`;

export const generateThoughtId = newBubbleId; // Alias for consistency if used elsewhere
export const generateSegmentId = newSegmentId; // Alias

export const isValidThoughtId = (id: string): boolean => {
  // Basic check, can be improved later
  return typeof id === 'string' && id.startsWith('tb_');
};

export const isValidSegmentId = (id: string): boolean => {
  // Basic check, can be improved later
  return typeof id === 'string' && id.startsWith('seg_');
};
