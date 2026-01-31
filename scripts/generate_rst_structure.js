const fs = require('fs');
const path = require('path');

// Target dir is the first arg, or default to docs
const targetPath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(__dirname, '../docs');

function generateRstForDir(dir) {
    // Skip hidden dirs, node_modules, _build, etc.
    const dirName = path.basename(dir);
    if (dirName.startsWith('.') || dirName === 'node_modules' || dirName === '_build' || dirName === 'assets') return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    // Filter for MD files and subdirectories
    const mdFiles = entries.filter(e => e.isFile() && e.name.endsWith('.md') && e.name.toLowerCase() !== 'readme.md');
    const subDirs = entries.filter(e => e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules' && e.name !== '_build' && e.name !== 'assets');

    // Check if there is a README.md (often acts as the index content)
    const hasReadme = entries.some(e => e.isFile() && e.name.toLowerCase() === 'readme.md');

    // If no content, skip (unless root)
    if (mdFiles.length === 0 && subDirs.length === 0 && !hasReadme) return;

    // Build the RST content
    let rstContent = '';

    // Title based on directory name (or custom logic)
    const title = dirName === 'docs' ? 'Documentation Root' : dirName.replace(/-/g, ' ').replace(/^\d+-/, ''); // Remove leading numbers
    const underline = '='.repeat(title.length);

    rstContent += `${title}\n${underline}\n\n`;

    // Include README content if it exists (via include directive or just linking it)
    // Sphinx recommends using `.. include:: README.md` with parser: markdown, but linking is safer for pure structure.
    // Better strategy: Add README to the toctree if it exists.

    rstContent += `.. toctree::\n   :maxdepth: 1\n   :caption: Contents:\n   :glob:\n\n`;

    // Add README first if it exists
    if (hasReadme) {
        rstContent += `   README.md\n`;
    }

    // Add other MD files
    mdFiles.forEach(f => {
        rstContent += `   ${f.name}\n`;
    });

    // Add Subdirectories (must contain index.rst themselves)
    subDirs.forEach(d => {
        // Recursively generate index.rst for subdirs first
        generateRstForDir(path.join(dir, d.name));

        // Only add to toctree if the subdir actually got an index.rst
        if (fs.existsSync(path.join(dir, d.name, 'index.rst'))) {
             rstContent += `   ${d.name}/index.rst\n`;
        }
    });

    // Write index.rst
    const rstPath = path.join(dir, 'index.rst');
    console.log(`Generating: ${rstPath}`);
    fs.writeFileSync(rstPath, rstContent);
}

console.log(`Generating index.rst files starting from ${targetPath}...`);
generateRstForDir(targetPath);
console.log('RST Generation complete.');
