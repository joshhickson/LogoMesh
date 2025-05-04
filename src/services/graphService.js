
const Memgraph = require('memgraph');

class GraphService {
  constructor() {
    this.loadState();
    this.fieldTypes = new Map();
    this.memgraph = new Memgraph({ host: '0.0.0.0', port: 7687 });
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
    try {
      await this.memgraph.connect();
      // Create indexes and constraints
      await this.memgraph.executeQuery('CREATE INDEX ON :Thought(thought_bubble_id)');
      await this.memgraph.executeQuery('CREATE INDEX ON :Segment(segment_id)');
    } catch (error) {
      console.error('Failed to initialize graph database:', error);
    }
  }

  async addThought(thought) {
    const node = this.thoughtToNode(thought);
    this.nodes.set(node.id, node);
    
    try {
      await this.memgraph.executeQuery(
        'CREATE (t:Thought {id: $id, title: $title, description: $description, tags: $tags, color: $color, created_at: $created_at})',
        node.properties
      );

      if (thought.segments) {
        for (const segment of thought.segments) {
          const { node: segmentNode, relationship } = this.segmentToNode(segment, thought.thought_bubble_id);
          this.nodes.set(segmentNode.id, segmentNode);
          this.relationships.set(`${relationship.from}-${relationship.to}`, relationship);
          
          await this.memgraph.executeQuery(
            'MATCH (t:Thought {id: $thoughtId}) CREATE (s:Segment {id: $id, title: $title, content: $content, fields: $fields}) CREATE (t)-[:CONTAINS]->(s)',
            { thoughtId: thought.thought_bubble_id, ...segmentNode.properties }
          );
        }
      }
    } catch (error) {
      console.error('Failed to add thought to graph:', error);
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
    try {
      const result = await this.memgraph.executeQuery(
        'MATCH (t:Thought) WHERE $tag IN t.tags RETURN t',
        { tag }
      );
      return result.records.map(record => record.get('t').properties);
    } catch (error) {
      console.error('Failed to query thoughts by tag:', error);
      return Array.from(this.nodes.values())
        .filter(node => node.labels.includes('Thought') && node.properties.tags.includes(tag));
    }
  }

  async findConnectedSegments(thoughtId) {
    try {
      const result = await this.memgraph.executeQuery(
        'MATCH (t:Thought {id: $thoughtId})-[:CONTAINS]->(s:Segment) RETURN s',
        { thoughtId }
      );
      return result.records.map(record => record.get('s').properties);
    } catch (error) {
      console.error('Failed to query connected segments:', error);
      return Array.from(this.relationships.values())
        .filter(rel => rel.from === thoughtId)
        .map(rel => this.nodes.get(rel.to))
        .filter(node => node.labels.includes('Segment'));
    }
  }

  async updateSegment(segmentId, field, value) {
    const node = this.nodes.get(segmentId);
    if (!node) return;

    if (field.startsWith('fields.')) {
      const fieldName = field.split('.')[1];
      node.properties.fields[fieldName] = value;
      
      try {
        await this.memgraph.executeQuery(
          'MATCH (s:Segment {id: $id}) SET s.fields = $fields',
          { id: segmentId, fields: node.properties.fields }
        );
      } catch (error) {
        console.error('Failed to update segment field:', error);
      }
    } else {
      node.properties[field] = value;
      
      try {
        await this.memgraph.executeQuery(
          'MATCH (s:Segment {id: $id}) SET s[$field] = $value',
          { id: segmentId, field, value }
        );
      } catch (error) {
        console.error('Failed to update segment:', error);
      }
    }
    
    this._persistState();
  }

  async close() {
    try {
      await this.memgraph.close();
    } catch (error) {
      console.error('Failed to close graph connection:', error);
    }
  }
}

export const graphService = new GraphService();
