
import neo4j from 'neo4j-driver';

class GraphService {
  constructor() {
    // Initialize with in-memory graph for now
    this.thoughts = new Map();
    this.relationships = new Map();
  }

  // Convert thought bubble to graph node
  thoughtToNode(thought) {
    return {
      id: thought.thought_bubble_id,
      labels: ['Thought'],
      properties: {
        title: thought.title,
        description: thought.description,
        tags: thought.tags || [],
        color: thought.color,
        created_at: thought.created_at
      }
    };
  }

  // Convert segment to node and create relationship
  segmentToNode(segment, thoughtId) {
    const segmentNode = {
      id: segment.segment_id,
      labels: ['Segment'],
      properties: {
        title: segment.title,
        content: segment.content,
        fields: segment.fields || []
      }
    };

    const relationship = {
      from: thoughtId,
      to: segment.segment_id,
      type: 'CONTAINS'
    };

    return { node: segmentNode, relationship };
  }

  // Execute Cypher query on in-memory graph
  async executeCypher(query, params = {}) {
    if (query.includes('MATCH (t:Thought)')) {
      if (query.includes('WHERE')) {
        const tagMatch = query.match(/t.properties.tags CONTAINS '(.+?)'/);
        if (tagMatch) {
          const targetTag = tagMatch[1];
          return Array.from(this.thoughts.values())
            .filter(thought => thought.properties.tags.includes(targetTag));
        }
      }
      return Array.from(this.thoughts.values());
    }
    
    if (query.includes('MATCH (s:Segment)')) {
      const segments = [];
      this.thoughts.forEach(thought => {
        if (thought.segments) {
          segments.push(...thought.segments);
        }
      });
      return segments;
    }

    if (query.includes('MATCH (t:Thought)-[r:CONTAINS]->(s:Segment)')) {
      const relationships = Array.from(this.relationships.values());
      return relationships.map(rel => ({
        thought: this.thoughts.get(rel.from),
        segment: this.thoughts.get(rel.to)
      }));
    }
    
    return [];
  }

  // Helper methods for common queries
  async findThoughtsByTag(tag) {
    return this.executeCypher(
      "MATCH (t:Thought) WHERE t.properties.tags CONTAINS $tag RETURN t",
      { tag }
    );
  }

  async findConnectedSegments(thoughtId) {
    return this.executeCypher(
      "MATCH (t:Thought)-[r:CONTAINS]->(s:Segment) WHERE t.id = $thoughtId RETURN s",
      { thoughtId }
    );
  }

  // Add thought to graph
  addThought(thought) {
    const node = this.thoughtToNode(thought);
    this.thoughts.set(node.id, node);

    thought.segments?.forEach(segment => {
      const { node: segmentNode, relationship } = this.segmentToNode(segment, thought.thought_bubble_id);
      this.thoughts.set(segmentNode.id, segmentNode);
      this.relationships.set(`${relationship.from}-${relationship.to}`, relationship);
    });
  }
}

export const graphService = new GraphService();
