class GraphService {
  constructor() {
    this.loadState();
    this.fieldTypes = new Map(); // Cache field types
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

  inferFieldType(value) {
    if (!isNaN(Date.parse(value))) return 'date';
    if (!isNaN(value)) return 'numeric';
    if (/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(value)) {
      return 'location';
    }
    return 'text';
  }

  updateFieldType(fieldName, value) {
    const type = this.inferFieldType(value);
    this.fieldTypes.set(fieldName, type);
    this._persistState();
    return type;
  }

  getFieldType(fieldName) {
    return this.fieldTypes.get(fieldName) || 'text';
  }

  async initializeDb() {
    // No-op for in-memory implementation
    return Promise.resolve();
  }

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

  segmentToNode(segment, thoughtId) {
    return {
      node: {
        id: segment.segment_id,
        labels: ['Segment'],
        properties: {
          title: segment.title,
          content: segment.content,
          fields: segment.fields || []
        }
      },
      relationship: {
        from: thoughtId,
        to: segment.segment_id,
        type: 'CONTAINS'
      }
    };
  }

  async addThought(thought) {
    const node = this.thoughtToNode(thought);
    this.nodes.set(node.id, node);
    this._persistState();

    if (thought.segments) {
      for (const segment of thought.segments) {
        const { node: segmentNode, relationship } = this.segmentToNode(segment, thought.thought_bubble_id);
        this.nodes.set(segmentNode.id, segmentNode);
        this.relationships.set(`${relationship.from}-${relationship.to}`, relationship);
      }
    }
    return Promise.resolve();
  }

  async findThoughtsByTag(tag) {
    const matches = Array.from(this.nodes.values())
      .filter(node => 
        node.labels.includes('Thought') && 
        node.properties.tags.some(t => t === tag) //Corrected this line.  Assuming tags are strings, not objects with a 'name' property
      );
    return Promise.resolve(matches);
  }

  async findConnectedSegments(thoughtId) {
    const segments = Array.from(this.relationships.values())
      .filter(rel => rel.from === thoughtId)
      .map(rel => this.nodes.get(rel.to))
      .filter(node => node.labels.includes('Segment'));
    return Promise.resolve(segments);
  }

  async updateSegment(segmentId, field, value) {
    const node = this.nodes.get(segmentId);
    if (!node) return;

    if (field.startsWith('fields.')) {
      const fieldName = field.split('.')[1];
      node.properties.fields[fieldName] = value;
    } else {
      node.properties[field] = value;
    }
    
    this._persistState();
    return Promise.resolve();
  }

  async close() {
    // No-op for in-memory implementation
    return Promise.resolve();
  }
}

export const graphService = new GraphService();