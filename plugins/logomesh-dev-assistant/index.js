const fs = require('fs');
const path = require('path');

class LogoMeshDevAssistant {
  constructor(api) {
    this.api = api;
    this.logger = api.getLogger();
    this.storage = api.getStorageAdapter();
    this.logger.info('[LogoMeshDevAssistant] Plugin initialized');
  }

  async onCommand(command, payload) {
    this.logger.info(`[LogoMeshDevAssistant] Executing command: ${command}`);

    switch (command) {
      case 'analyzeCode':
        return await this.analyzeCode(payload);
      case 'suggestImprovement':
        return await this.suggestImprovement(payload);
      case 'generateCode':
        return await this.generateCode(payload);
      case 'createDocumentation':
        return await this.createDocumentation(payload);
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  }

  async analyzeCode(payload) {
    const { filePath, analysisType = 'general' } = payload;

    try {
      // Read the actual file content if it exists
      const fs = require('fs');
      let fileContent = '';

      if (fs.existsSync(filePath)) {
        fileContent = fs.readFileSync(filePath, 'utf8');
      } else {
        return { error: `File not found: ${filePath}` };
      }

      // Use LLM to analyze the code
      const prompt = `Analyze this ${analysisType} code and provide specific feedback:

File: ${filePath}
Code:
\`\`\`
${fileContent.substring(0, 2000)} // Limit content for LLM
\`\`\`

Please provide:
1. Specific issues found
2. Improvement suggestions
3. A quality score (1-10)

Focus on: ${analysisType}`;

      // Make LLM call via API (this should connect to your OllamaExecutor)
      const response = await fetch('http://localhost:5000/api/v1/llm/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, metadata: { type: 'code_analysis' } })
      });

      if (!response.ok) {
        throw new Error(`LLM API failed: ${response.status}`);
      }

      const llmResult = await response.json();

      return {
        file: filePath,
        analysis: {
          type: analysisType,
          llmResponse: llmResult.response,
          issues: this.extractIssues(llmResult.response),
          suggestions: this.extractSuggestions(llmResult.response),
          score: this.extractScore(llmResult.response) || 7.0
        }
      };

    } catch (error) {
      this.logger.error('Code analysis failed:', error);
      return { error: error.message };
    }
  }

  async suggestImprovement(payload) {
    const { filePath, focus = 'general' } = payload;

    try {
      const fs = require('fs');
      let fileContent = '';

      if (fs.existsSync(filePath)) {
        fileContent = fs.readFileSync(filePath, 'utf8');
      } else {
        return { error: `File not found: ${filePath}` };
      }

      const prompt = `Review this code and suggest specific improvements focusing on ${focus}:

File: ${filePath}
Code:
\`\`\`
${fileContent.substring(0, 2000)}
\`\`\`

Focus area: ${focus}
Please provide actionable improvement suggestions with priority levels.`;

      const response = await fetch('http://localhost:5000/api/v1/llm/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, metadata: { type: 'code_improvement' } })
      });

      if (!response.ok) {
        throw new Error(`LLM API failed: ${response.status}`);
      }

      const llmResult = await response.json();

      return {
        file: filePath,
        focus,
        improvements: this.extractImprovements(llmResult.response),
        llmResponse: llmResult.response,
        priority: 'medium'
      };

    } catch (error) {
      this.logger.error('Improvement suggestion failed:', error);
      return { error: error.message };
    }
  }

  async generateCode(payload) {
    const { description, fileType = 'javascript' } = payload;

    try {
      const prompt = `Generate ${fileType} code based on this description:
"${description}"

Requirements:
- Write clean, readable code
- Include appropriate comments
- Follow best practices for ${fileType}
- Make it production-ready

Provide just the code with brief explanation.`;

      const response = await fetch('http://localhost:5000/api/v1/llm/prompt', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, metadata: { type: 'code_generation' } })
      });

      if (!response.ok) {
        throw new Error(`LLM API failed: ${response.status}`);
      }

      const llmResult = await response.json();

      return {
        description,
        fileType,
        generatedCode: this.extractCode(llmResult.response),
        explanation: llmResult.response
      };

    } catch (error) {
      this.logger.error('Code generation failed:', error);
      return { error: error.message };
    }
  }

  async createDocumentation(payload) {
    const { filePath, docType = 'api' } = payload;

    try {
      const content = fs.readFileSync(path.resolve(filePath), 'utf8');

      const prompt = `
Create comprehensive ${docType} documentation for this file:

File: ${filePath}
Content:
\`\`\`
${content}
\`\`\`

Generate documentation including:
- Purpose and overview
- API/interface documentation
- Usage examples
- Parameters and return values
- Integration notes
- Markdown format suitable for docs/

Make it clear and developer-friendly.
`;

      const documentation = await this.callLLM(prompt);

      return {
        success: true,
        filePath,
        docType,
        documentation,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`[LogoMeshDevAssistant] Documentation generation failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  buildAnalysisPrompt(content, filePath, analysisType) {
    return `
Analyze this LogoMesh codebase file for ${analysisType} insights:

File: ${filePath}
Analysis Type: ${analysisType}

Content:
\`\`\`
${content}
\`\`\`

Focus on:
- Code quality and patterns
- Potential bugs or issues
- Architecture alignment with LogoMesh goals
- Improvement opportunities
- Dependencies and relationships

Provide structured, actionable analysis.
`;
  }

  async callLLM(prompt) {
    try {
      // Call the LLM via your server's API
      const response = await fetch('/api/llm/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          metadata: {
            plugin: 'logomesh-dev-assistant',
            timestamp: new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        throw new Error(`LLM API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response || 'No response received';
    } catch (error) {
      this.logger.error(`[LogoMeshDevAssistant] LLM call failed: ${error.message}`);
      return `[ERROR] LLM unavailable: ${error.message}`;
    }
  }

  async createAnalysisThought(filePath, analysis) {
    try {
      const thoughts = await this.api.getThoughts();
      const thoughtId = `analysis_${Date.now()}_${path.basename(filePath)}`;

      // This would integrate with your thought creation system
      this.logger.info(`[LogoMeshDevAssistant] Created analysis thought for ${filePath}`);

      return thoughtId;
    } catch (error) {
      this.logger.error(`[LogoMeshDevAssistant] Failed to create thought: ${error.message}`);
    }
  }

  async onShutdown() {
    this.logger.info('[LogoMeshDevAssistant] Plugin shutting down');
  }

  // Helper methods to parse LLM responses
  extractIssues(response) {
    const issues = [];
    const lines = response.split('\n');
    lines.forEach(line => {
      if (line.includes('issue') || line.includes('problem') || line.includes('bug')) {
        issues.push(line.trim());
      }
    });
    return issues.length > 0 ? issues : ['See LLM response for details'];
  }

  extractSuggestions(response) {
    const suggestions = [];
    const lines = response.split('\n');
    lines.forEach(line => {
      if (line.includes('suggest') || line.includes('recommend') || line.includes('consider')) {
        suggestions.push(line.trim());
      }
    });
    return suggestions.length > 0 ? suggestions : ['See LLM response for details'];
  }

  extractScore(response) {
    const match = response.match(/(\d+(?:\.\d+)?)\s*(?:\/\s*10|out of 10|score)/i);
    return match ? parseFloat(match[1]) : null;
  }

  extractCode(response) {
    const codeMatch = response.match(/```[\w]*\n([\s\S]*?)```/);
    return codeMatch ? codeMatch[1].trim() : response;
  }

  extractImprovements(response) {
    const improvements = [];
    const lines = response.split('\n');
    lines.forEach(line => {
      if (line.match(/^\d+\.|\-|\•/) && line.length > 10) {
        improvements.push(line.trim());
      }
    });
    return improvements.length > 0 ? improvements : ['See LLM response for details'];
  }
}

module.exports = LogoMeshDevAssistant;