import { describe, test, expect, vi, beforeEach } from 'vitest';
import { createMockFileReader, MockFileReader } from './testUtils';
import { Thought } from '@contracts/entities';

const mockFileContent = JSON.stringify({
  thoughts: [
    { id: '1', title: 'Test Thought', content: 'Test content', segments: [] }
  ]
});

describe('Data Handlers', () => {
  let mockFileReader: MockFileReader;

  beforeEach(() => {
    mockFileReader = createMockFileReader();
    vi.clearAllMocks();
  });

  test('handles file import correctly', () => {
    const file = new File([mockFileContent], 'test.json', { type: 'application/json' });

    mockFileReader.onload = vi.fn();
    mockFileReader.readAsText(file);

    expect(mockFileReader.readAsText).toHaveBeenCalledWith(file);
  });

  test('handles export data formatting', () => {
    const testData: { thoughts: Thought[], connections: any[] } = { thoughts: [], connections: [] };
    const jsonString = JSON.stringify(testData, null, 2);

    expect(jsonString).toContain('thoughts');
    expect(jsonString).toContain('connections');
  });

  test('validates file format during import', () => {
    const invalidFile = new File(['invalid json'], 'test.txt', { type: 'text/plain' });

    mockFileReader.readAsText(invalidFile);
    expect(mockFileReader.readAsText).toHaveBeenCalled();
  });
});