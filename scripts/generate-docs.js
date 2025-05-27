
const fs = require('fs');
const path = require('path');

function generateModuleDocs(dir, depth = 0) {
  let docs = '';
  const indent = '  '.repeat(depth);
  
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      docs += `${indent}### ${item}/\n`;
      docs += generateModuleDocs(fullPath, depth + 1);
    } else if (item.endsWith('.js') || item.endsWith('.ts') || item.endsWith('.jsx')) {
      docs += `${indent}- ${item}\n`;
    }
  });
  
  return docs;
}

function generateFrameworkDocs() {
  const srcPath = path.join(__dirname, '../src');
  const docs = generateModuleDocs(srcPath);
  
  fs.writeFileSync(
    path.join(__dirname, '../docs/ARCHITECTURE.md'),
    `# Framework Architecture\n\n${docs}`
  );
}

generateFrameworkDocs();
