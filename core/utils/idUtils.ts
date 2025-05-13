
import { ulid } from 'ulid';

export const generateThoughtId = (): string => `thought_${ulid()}`;
export const generateSegmentId = (): string => `segment_${ulid()}`;
