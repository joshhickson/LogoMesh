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
    } else {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function listRecentDocs() {
  try {
    const allFiles = getFiles(DOCS_DIR);

    // Filter for files with YYYYMMDD prefix
    // Matches YYYYMMDD at the start of the filename
    const datedFiles = allFiles.filter(filePath => {
      const filename = path.basename(filePath);
      return /^\d{8}/.test(filename);
    });

    // Sort descending by the date in the filename
    datedFiles.sort((a, b) => {
      const nameA = path.basename(a);
      const nameB = path.basename(b);
      const dateA = nameA.match(/^(\d{8})/)[1];
      const dateB = nameB.match(/^(\d{8})/)[1];
      return dateB.localeCompare(dateA);
    });

    console.log(`Found ${datedFiles.length} dated documents in docs/ (Newest First):\n`);

    datedFiles.forEach(filePath => {
      const relativePath = path.relative(path.join(__dirname, '..'), filePath);
      console.log(relativePath);
    });

  } catch (error) {
    console.error('Error scanning docs:', error);
    process.exit(1);
  }
}

listRecentDocs();
