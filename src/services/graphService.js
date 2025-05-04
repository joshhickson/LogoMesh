class GraphService {
  constructor() {
    this.loadState();
  }

  loadState() {
    const savedState = localStorage.getItem('thoughtweb-state');
    if (savedState) {
      const state = JSON.parse(savedState);
      this.nodes = new Map(state.nodes);
      this.relationships = new Map(state.relationships);
      this.fieldTypes = new Map(state.fieldTypes);
    } else {
      this.nodes = new Map();
      this.relationships = new Map();
      this.fieldTypes = new Map();
    }
  }

  _persistState() {
    const state = {
      nodes: Array.from(this.nodes.entries()),
      relationships: Array.from(this.relationships.entries()),
      fieldTypes: Array.from(this.fieldTypes.entries())
    };
    localStorage.setItem('thoughtweb-state', JSON.stringify(state));
  }

  async initializeDb() {
    this.loadState();
    return Promise.resolve();
  }

  async findThoughtsByTag(tagName) {
    return Array.from(this.nodes.values())
      .filter(node => 
        node.labels?.includes('Thought') && 
        node.properties.tags?.some(tag => tag.name === tagName)
      )
      .map(node => ({ properties: node.properties }));
  }

  async addThought(thought) {
    const node = {
      id: thought.thought_bubble_id,
      labels: ['Thought'],
      properties: thought
    };
    this.nodes.set(node.id, node);

    if (thought.segments) {
      thought.segments.forEach(segment => {
        const segmentNode = {
          id: segment.segment_id,
          labels: ['Segment'],
          properties: segment
        };
        this.nodes.set(segmentNode.id, segmentNode);

        const relationship = {
          from: thought.thought_bubble_id,
          to: segment.segment_id,
          type: 'HAS_SEGMENT'
        };
        this.relationships.set(`${relationship.from}-${relationship.to}`, relationship);
      });
    }

    this._persistState();
  }

  inferFieldType(value) {
    if (!isNaN(Date.parse(value))) return 'date';
    if (!isNaN(value)) return 'numeric';
    if (/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(value)) {
      return 'location';
    }
    return 'text';
  }
}

export const graphService = new GraphService();