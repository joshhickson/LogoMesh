"use strict";
/**
 * Utility for validating Mermaid diagram syntax
 * This is a stub implementation for Phase 1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMermaidSyntax = exports.isValidMermaid = void 0;
function isValidMermaid(mermaidCode) {
    // Basic validation stub - in a real implementation this would parse the mermaid syntax
    if (!mermaidCode || typeof mermaidCode !== 'string') {
        return false;
    }
    // Check for basic mermaid keywords
    const mermaidKeywords = [
        'graph', 'flowchart', 'sequenceDiagram', 'classDiagram',
        'stateDiagram', 'erDiagram', 'journey', 'gantt', 'pie'
    ];
    const trimmed = mermaidCode.trim().toLowerCase();
    // Must start with a mermaid diagram type
    const startsWithKeyword = mermaidKeywords.some(keyword => trimmed.startsWith(keyword));
    // Basic structure validation
    const hasValidStructure = trimmed.includes('-->') ||
        trimmed.includes('->') ||
        trimmed.includes(':::') ||
        trimmed.includes('[') ||
        trimmed.includes('(');
    return startsWithKeyword && (hasValidStructure || trimmed.split('\n').length > 1);
}
exports.isValidMermaid = isValidMermaid;
function validateMermaidSyntax(mermaidCode) {
    const errors = [];
    if (!isValidMermaid(mermaidCode)) {
        errors.push('Invalid mermaid diagram structure');
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
exports.validateMermaidSyntax = validateMermaidSyntax;
//# sourceMappingURL=mermaidAuditor.js.map