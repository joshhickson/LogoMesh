// importHandler.js

/**
 * Imports a ThoughtWeb JSON file and extracts the thoughts array.
 * 
 * Supports:
 * - New format (with export_metadata + thoughts[])
 * - Backward compatibility with older array-only exports
 * 
 * @param {Function} callback - Called with the imported thoughts array
 */

export function importFromJsonFile(callback) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';

  input.onchange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);

        // New schema: full object with thoughts[]
        if (parsed.thoughts && Array.isArray(parsed.thoughts)) {
          callback(parsed.thoughts);
        }
        // Old schema: direct array
        else if (Array.isArray(parsed)) {
          callback(parsed);
        } else {
          alert('Invalid file format: Could not find a valid thoughts array.');
        }
      } catch (error) {
        alert('Error reading the JSON file: ' + error.message);
      }
    };

    reader.readAsText(file);
  };

  input.click();
}
