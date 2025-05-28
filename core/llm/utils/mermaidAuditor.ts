
export function isValidMermaid(content: string): boolean {
  // Stub implementation for Phase 1
  // Future implementation will validate Mermaid syntax
  if (!content || typeof content !== 'string') {
    return false;
  }
  
  // Basic check for common Mermaid keywords
  const mermaidKeywords = ['graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'gitgraph'];
  const hasKeyword = mermaidKeywords.some(keyword => 
    content.toLowerCase().includes(keyword.toLowerCase())
  );
  
  return hasKeyword;
}
