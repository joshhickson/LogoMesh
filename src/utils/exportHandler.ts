import { Thought } from '@contracts/entities';

export function exportToJsonFile(thoughts: Thought[]) {
  const exportPayload = {
    export_metadata: {
      version: '0.5.0',
      exported_at: new Date().toISOString(),
      author: 'ThoughtWeb User',
      tool: 'ThoughtWeb React',
    },
    thoughts: thoughts.map((thought) => ({
      ...thought,
      segments: thought.segments?.map((segment) => ({
        ...segment,
        embedding_vector: (segment as any).embedding_vector || [],
      })) || [],
    })),
  };

  const dataStr =
    'data:text/json;charset=utf-8,' +
    encodeURIComponent(JSON.stringify(exportPayload, null, 2));

  const downloadAnchorNode = document.createElement('a');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  downloadAnchorNode.setAttribute('href', dataStr);
  downloadAnchorNode.setAttribute(
    'download',
    `thoughtweb_export_${timestamp}.json`
  );
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}
