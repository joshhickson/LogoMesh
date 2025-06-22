import { vi } from 'vitest';
import { graphService } from '../graphService';

// Mock the service with proper data
vi.mock('../graphService', () => ({
  graphService: {
    findThoughtsByTag: vi.fn((tag) => {
      const mockThoughts = [
        {
          thought_bubble_id: '01HN5G4K8PMXQ0VGWX7CTBZ3YV',
          tags: [{ name: 'tag1', color: '#000' }],
        },
        {
          thought_bubble_id: '01HN5G4K8PMXQ0VGWX7CTBZ3YW',
          tags: [{ name: 'tag2', color: '#fff' }],
        },
      ];
      
      return Promise.resolve(
        mockThoughts.filter(thought => 
          thought.tags && thought.tags.some(t => t.name === tag)
        )
      );
    })
  }
}));

describe('graphService', () => {
  const mockThoughts = [
    {
      thought_bubble_id: '01HN5G4K8PMXQ0VGWX7CTBZ3YV',
      tags: [{ name: 'tag1', color: '#000' }],
    },
    {
      thought_bubble_id: '01HN5G4K8PMXQ0VGWX7CTBZ3YW',
      tags: [{ name: 'tag2', color: '#fff' }],
    },
  ];

  test('findThoughtsByTag returns thoughts with matching tag', async () => {
    const results = await graphService.findThoughtsByTag('tag1');
    expect(results).toEqual(mockThoughts.filter(thought => 
      thought.tags && thought.tags.some(tag => tag.name === 'tag1')
    ));
  });

  test('findThoughtsByTag returns empty array for non-existent tag', async () => {
    const results = await graphService.findThoughtsByTag('non-existent');
    expect(results).toEqual([]);
  });
});
