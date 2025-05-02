// exportHandler.js

/**
 * Exports the current thoughts array to a downloadable JSON file.
 * 
 * This version includes:
 * - Schema-compliant keys (e.g., `thought_bubble_id`, `fields`)
 * - Optional embedding vectors per segment
 * - An `export_metadata` block for versioning and auditability
 * 
 * Future-ready for use with AI parsing, vector clustering, and schema evolution.
 */

export function exportToJsonFile(thoughts) {
  // Prepare export object with metadata
  const exportPayload = {
    export_metadata: {
      version: "0.5",
      exported_at: new Date().toISOString(),
      author: "Josh Hickson",
      tool: "ThoughtWeb"
    },
    thoughts: thoughts
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
    JSON.stringify(exportPayload, null, 2)
  );

  const downloadAnchorNode = document.createElement('a');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", `thoughtweb_export_v0.5_${timestamp}.json`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}
