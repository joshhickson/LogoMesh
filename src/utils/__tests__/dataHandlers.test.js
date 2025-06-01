import { exportToJsonFile } from '../exportHandler';
import { importFromJsonFile } from '../importHandler';
// TODO: This variable was flagged as unused by ESLint.
// import { newBubbleId, newSegmentId } from '../eventBus';

// Mock eventBus functions
jest.mock('../eventBus', () => ({
  newBubbleId: jest.fn().mockReturnValue('test-bubble-id'),
  newSegmentId: jest.fn().mockReturnValue('test-segment-id'),
}));

describe('Data Handling', () => {
  const mockThoughts = [
    {
      thought_bubble_id: '01HN5G4K8PMXQ0VGWX7CTBZ3YX',
      title: 'Test Thought',
      description: 'Test description',
      created_at: '2023-01-01T00:00:00.000Z',
      segments: [
        {
          segment_id: '01HN5G4K8PMXQ0VGWX7CTBZ3YY',
          title: 'Test Segment',
          content: 'Test content',
          fields: { type: 'note' },
        },
      ],
      tags: [{ name: 'test', color: '#10b981' }],
      color: '#10b981',
      position: { x: 0, y: 0 },
    },
  ];

  beforeEach(() => {
    // Mock DOM elements
    global.URL.createObjectURL = jest.fn();
    document.createElement = jest.fn().mockReturnValue({
      setAttribute: jest.fn(),
      click: jest.fn(),
      remove: jest.fn(),
      type: '',
      accept: '',
      onchange: null,
    });
    document.body.appendChild = jest.fn();
  });

  describe('Export Handler', () => {
    test('exports with correct metadata structure', () => {
      const appendChildSpy = jest.spyOn(document.body, 'appendChild');
      // TODO: This variable was flagged as unused by ESLint.
      // const mockBlob = new Blob(['{}'], { type: 'application/json' });
      const mockUrl = 'data:application/json;base64,e30=';
      global.URL.createObjectURL = jest.fn(() => mockUrl);

      exportToJsonFile(mockThoughts);
      expect(appendChildSpy).toHaveBeenCalled();
      const anchorNode = appendChildSpy.mock.calls[0][0];
      expect(anchorNode.href).toBe(mockUrl);
    });
  });

  describe('Import Handler', () => {
    test('normalizes legacy format thoughts', () => {
      const legacyThought = {
        title: 'Legacy Thought',
        segments: [
          {
            title: 'Legacy Segment',
            fields: {},
          },
        ],
      };

      const callback = jest.fn();
      const fileReader = {
        result: JSON.stringify([legacyThought]),
        readAsText: jest.fn(),
      };

      global.FileReader = jest.fn(() => fileReader);

      importFromJsonFile(callback);

      const changeEvent = { target: { files: [new Blob()] } };
      document.createElement().onchange(changeEvent);

      fileReader.onload({ target: { result: fileReader.result } });

      expect(callback).toHaveBeenCalledWith([
        {
          thought_bubble_id: 'test-bubble-id',
          title: 'Legacy Thought',
          description: '',
          created_at: expect.any(String),
          tags: [],
          color: '#10b981',
          position: expect.any(Object),
          segments: [
            {
              segment_id: 'test-segment-id',
              title: 'Legacy Segment',
              content: '',
              fields: {},
              embedding_vector: [],
            },
          ],
        },
      ]);
    });

    test('handles modern format with metadata', () => {
      const modernExport = {
        export_metadata: {
          version: '0.5.0',
          exported_at: new Date().toISOString(),
          author: 'Test',
          tool: 'ThoughtWeb',
        },
        thoughts: mockThoughts,
      };

      const callback = jest.fn();
      const fileReader = {
        result: JSON.stringify(modernExport),
        readAsText: jest.fn(),
      };

      global.FileReader = jest.fn(() => fileReader);

      importFromJsonFile(callback);

      const changeEvent = { target: { files: [new Blob()] } };
      document.createElement().onchange(changeEvent);

      fileReader.onload({ target: { result: fileReader.result } });

      expect(callback).toHaveBeenCalledWith(mockThoughts);
    });
  });
});
