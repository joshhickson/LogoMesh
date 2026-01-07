const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '../docs');

function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getFiles(filePath, fileList);
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function migrateHeaders() {
  const allFiles = getFiles(DOCS_DIR);
  let updatedCount = 0;
  let errors = 0;

  console.log('Starting header migration...');

  allFiles.forEach(filePath => {
    try {
      let content = fs.readFileSync(filePath, 'utf8');

      // Regex to detect old blockquote header
      // Matches:
      // > **Status:** VALUE
      // > **Type:** VALUE
      const statusRegex = /> \*\*Status:\*\* (.*)/i;
      const typeRegex = /> \*\*Type:\*\* (.*)/i;

      const hasOldHeader = statusRegex.test(content) && typeRegex.test(content);
      const hasYamlHeader = content.startsWith('---');

      if (hasOldHeader && !hasYamlHeader) {
        const statusMatch = content.match(statusRegex);
        const typeMatch = content.match(typeRegex);

        if (statusMatch && typeMatch) {
          const status = statusMatch[1].trim();
          const type = typeMatch[1].trim();

          // Construct new YAML header
          const newHeader = `---\nstatus: ${status}\ntype: ${type}\n---`;

          // Remove the specific old lines
          // We use replace with the exact match string to be safe
          let newContent = content.replace(statusMatch[0] + '\n', '');
          newContent = newContent.replace(typeMatch[0] + '\n', '');

          // If the lines were not followed by \n (e.g. EOF), try without
          if (newContent === content) {
             newContent = content.replace(statusMatch[0], '');
             newContent = newContent.replace(typeMatch[0], '');
          }

          // Prepend the YAML header
          newContent = newHeader + '\n' + newContent;

          // Clean up potential extra newlines at start if the file started with the blockquotes
          // But carefully, we want to keep the "Context" blockquote if it exists.

          fs.writeFileSync(filePath, newContent, 'utf8');
          console.log(`Updated: ${path.relative(path.join(__dirname, '..'), filePath)}`);
          updatedCount++;
        }
      }
    } catch (err) {
      console.error(`Error processing ${filePath}:`, err);
      errors++;
    }
  });

  console.log(`\nMigration complete. Updated ${updatedCount} files. Errors: ${errors}`);
}

migrateHeaders();
