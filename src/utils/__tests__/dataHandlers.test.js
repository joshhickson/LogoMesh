
import { exportToJsonFile } from '../exportHandler';
import { importFromJsonFile } from '../importHandler';

describe('Data Handling', () => {
  const mockThoughts = [{
    thought_bubble_id: 'test-123',
    title: 'Test Thought',
    description: 'Test description',
    created_at: '2023-01-01T00:00:00.000Z',
    segments: [],
    tags: [],
    color: '#000000',
    position: { x: 0, y: 0 }
  }];

  // Mock DOM elements for file operations
  beforeEach(() => {
    global.URL.createObjectURL = jest.fn();
    document.createElement = jest.fn().mockReturnValue({
      setAttribute: jest.fn(),
      click: jest.fn(),
      remove: jest.fn()
    });
    document.body.appendChild = jest.fn();
  });

  test('exportToJsonFile creates correct payload structure', () => {
    const appendChildSpy = jest.spyOn(document.body, 'appendChild');
    exportToJsonFile(mockThoughts);
    
    expect(appendChildSpy).toHaveBeenCalled();
    const anchorNode = appendChildSpy.mock.calls[0][0];
    const exportData = decodeURIComponent(anchorNode.href).split(',')[1];
    const parsedData = JSON.parse(exportData);
    
    expect(parsedData).toHaveProperty('export_metadata');
    expect(parsedData).toHaveProperty('thoughts');
    expect(parsedData.thoughts).toEqual(mockThoughts);
  });
});
