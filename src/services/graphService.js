
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
    // Basic query parser for demonstration
    if (query.includes('MATCH (t:Thought)')) {
      return Array.from(this.thoughts.values());
    }
    return [];
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
