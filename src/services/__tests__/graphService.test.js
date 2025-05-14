import { graphService } from '../graphService';

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
    expect(results).toEqual([{ properties: mockThoughts[0] }]);
  });

  test('findThoughtsByTag returns empty array for non-existent tag', async () => {
    const results = await graphService.findThoughtsByTag('non-existent');
    expect(results).toEqual([]);
  });
});
