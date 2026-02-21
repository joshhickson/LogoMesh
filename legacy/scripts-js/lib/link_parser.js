const path = require('path');

/**
 * Replaces the content of fenced code blocks with whitespace, preserving newlines.
 * This ensures that regex scans do not match content inside code blocks,
 * but line numbers in the original text remain accurate.
 *
 * @param {string} text - The file content.
 * @returns {string} - The content with fenced code blocks masked.
 */
function stripFencedCodeBlocks(text) {
    // Match fenced code blocks: ```...```
    // We use a regex that matches start fence, content, and end fence.
    // [^]*? lazy match for content.
    const fencedRegex = /^```[^]*?^```/gm;

    return text.replace(fencedRegex, (match) => {
        // Replace all non-newline characters with space
        return match.replace(/[^\n]/g, ' ');
    });
}

/**
 * Parses explicit links from a line of text.
 * Handles:
 * - Standard Markdown: [text](url)
 * - Reference: [text][id]
 * - Wiki: [[Page]]
 * - HTML: <a href="url">
 *
 * @param {string} line - The line to parse.
 * @param {number} lineNum - The line number.
 * @returns {Array} - Array of link objects { type, text, rawTarget, lineNum }
 */
function parseExplicitLinks(line, lineNum) {
    const links = [];

    // 1. Standard Markdown: [text](url)
    // Avoid matching ![] for images if they are just images, but sometimes images link to things.
    // The previous script matched images too, so we'll match `[...]` which covers `![...]` too.
    // Regex explanation:
    // \[([^\]]+)\] : Match [text]
    // \(([^)]+)\) : Match (url)
    const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    while ((match = mdLinkRegex.exec(line)) !== null) {
        links.push({
            type: 'MARKDOWN',
            text: match[1],
            rawTarget: match[2].trim(),
            lineNum: lineNum
        });
    }

    // 2. Reference Links: [text][id] or [id]
    const refLinkRegex = /\[([^\]]+)\]\[([^\]]*)\]/g;
    while ((match = refLinkRegex.exec(line)) !== null) {
        links.push({
            type: 'REFERENCE',
            text: match[1],
            rawTarget: match[2] || match[1], // If id is empty, use text
            lineNum: lineNum
        });
    }

    // 3. Wiki Links: [[Page]] or [[Page|Text]]
    const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
    while ((match = wikiLinkRegex.exec(line)) !== null) {
        const content = match[1];
        const parts = content.split('|');
        const target = parts[0].trim();
        const text = parts.length > 1 ? parts[1].trim() : target;
        links.push({
            type: 'WIKI',
            text: text,
            rawTarget: target,
            lineNum: lineNum
        });
    }

    // 4. HTML Anchors: <a href="...">
    const htmlLinkRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/g;
    while ((match = htmlLinkRegex.exec(line)) !== null) {
        links.push({
            type: 'HTML',
            text: 'HTML Link', // Capturing inner text is hard with regex, simplified for now
            rawTarget: match[2],
            lineNum: lineNum
        });
    }

    return links;
}

/**
 * Scans a line for implicit links (file paths) using strict matching.
 *
 * @param {string} line - The line to scan.
 * @param {number} lineNum - The line number.
 * @param {Set<string>} validFilePaths - Set of known relative file paths in the repo.
 * @returns {Array} - Array of link objects { type, text, rawTarget, lineNum }
 */
function findImplicitLinks(line, lineNum, validFilePaths) {
    const links = [];
    const foundTargets = new Set(); // Prevent duplicates per line

    // 1. Extension Strategy: Look for filenames with extensions
    // Pattern: word chars, dashes, dots, ending in .md, .ts, .js, .json
    // We strictly look for extensions we care about to reduce noise.
    const extRegex = /[\w\-\.\/]+\.(md|ts|js|json|png|jpg|yml|yaml|css|html)\b/g;

    let match;
    while ((match = extRegex.exec(line)) !== null) {
        const candidate = match[0];
        // Verify against census
        // Check if the candidate matches any known file exactly OR
        // if a known file ends with this candidate (partial path match)
        // Note: The prompt implies "Strict" means verify it exists.

        if (isValidPath(candidate, validFilePaths)) {
            if (!foundTargets.has(candidate)) {
                links.push({
                    type: 'IMPLICIT',
                    text: candidate,
                    rawTarget: candidate,
                    lineNum: lineNum
                });
                foundTargets.add(candidate);
            }
        }
    }

    // 2. CamelCase Strategy: Look for potential class/file names
    // Pattern: Word starting with Uppercase, containing letters/numbers.
    // Exclude common words? The "Verification" step handles this.
    // If "ContextualDebtSpec" is not a file, it won't be added.
    const camelRegex = /\b[A-Z][a-zA-Z0-9]+\b/g;
    while ((match = camelRegex.exec(line)) !== null) {
        const candidate = match[0];
        if (foundTargets.has(candidate)) continue;

        // Check exact match (e.g. README) or if it matches a filename without extension
        // This is tricky. If we have "MyFile.md" and text says "MyFile", we want to catch it.
        // We will check if any valid path *includes* this CamelCase word as the basename.

        // But the requirements say: "verify that the detected token actually exists in the Census"
        // This implies the token ITSELF (or a simple variant) must be the path.
        // Let's allow:
        // - Exact match of a full path
        // - Exact match of a basename (with or without extension)

        if (isValidPath(candidate, validFilePaths)) {
             links.push({
                type: 'IMPLICIT',
                text: candidate,
                rawTarget: candidate,
                lineNum: lineNum
            });
            foundTargets.add(candidate);
        }
    }

    return links;
}

/**
 * Checks if a candidate string maps to a valid file in the census.
 * Logic:
 * 1. Exact match (relative to root)
 * 2. Exact match of basename (e.g. "README.md")
 * 3. Exact match of basename without extension (e.g. "README" -> "README.md")
 */
function isValidPath(candidate, validFilePaths) {
    // 1. Direct match
    if (validFilePaths.has(candidate)) return true;

    // 2. Basename match (scan census)
    // This iteration might be slow if census is huge, but census is ~few hundred files.
    // Optimization: Pre-process census into a Set of basenames if needed.
    // For now, linear scan is okay for < 1000 files.

    for (const validPath of validFilePaths) {
        const basename = path.basename(validPath);
        // "README.md" === "README.md"
        if (basename === candidate) return true;

        // "README" === "README" (from README.md)
        const nameNoExt = path.parse(validPath).name;
        if (nameNoExt === candidate) return true;
    }

    return false;
}

module.exports = {
    stripFencedCodeBlocks,
    parseExplicitLinks,
    findImplicitLinks
};
