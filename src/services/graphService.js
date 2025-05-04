class GraphService {
  constructor() {
    this.loadState();
  }

  thoughtToNode(thought) {
    return {
      id: thought.thought_bubble_id,
      labels: ['Thought'],
      properties: thought
    };
  }

  segmentToNode(segment, thoughtId) {
    const node = {
      id: segment.segment_id,
      labels: ['Segment'],
      properties: segment
    };
    
    const relationship = {
      from: thoughtId,
      to: segment.segment_id,
      type: 'HAS_SEGMENT'
    };

    return { node, relationship };
  }

  async initializeDb() {
    // Initialize in-memory graph
    await this.loadState();
    return Promise.resolve();
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

  async addThought(thought) {
    const node = this.thoughtToNode(thought);
    this.nodes.set(node.id, node);

    if (thought.segments) {
      for (const segment of thought.segments) {
        const { node: segmentNode, relationship } = this.segmentToNode(segment, thought.thought_bubble_id);
        this.nodes.set(segmentNode.id, segmentNode);
        this.relationships.set(`${relationship.from}-${relationship.to}`, relationship);
      }
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

  async findThoughtsByTag(tag) {
    return Array.from(this.nodes.values())
      .filter(node => node.labels.includes('Thought') && node.properties.tags.includes(tag))
      .map(node => ({ properties: node }));
  }

  async findConnectedSegments(thoughtId) {
    return Array.from(this.relationships.values())
      .filter(rel => rel.from === thoughtId)
      .map(rel => this.nodes.get(rel.to))
      .filter(node => node.labels.includes('Segment'));
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
  }
}

export const graphService = new GraphService();