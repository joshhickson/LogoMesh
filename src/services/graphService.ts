import { Thought, Segment, Tag } from '@contracts/entities';

interface Node {
  id: string;
  labels: string[];
  properties: Thought | Segment;
}

interface Relationship {
  from: string;
  to: string;
  type: string;
}

class GraphService {
  private nodes: Map<string, Node>;
  private relationships: Map<string, Relationship>;
  private fieldTypes: Map<string, string>;

  constructor() {
    this.nodes = new Map();
    this.relationships = new Map();
    this.fieldTypes = new Map();
    this.loadState();
  }

  loadState(): void {
    const savedState = localStorage.getItem('thoughtweb-state');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        this.nodes = new Map(state.nodes);
        this.relationships = new Map(state.relationships);
        this.fieldTypes = new Map(state.fieldTypes);
      } catch (e) {
        console.error("Failed to parse saved state:", e);
      }
    }
  }

  _persistState(): void {
    const state = {
      nodes: Array.from(this.nodes.entries()),
      relationships: Array.from(this.relationships.entries()),
      fieldTypes: Array.from(this.fieldTypes.entries()),
    };
    localStorage.setItem('thoughtweb-state', JSON.stringify(state));
  }

  async initializeDb(): Promise<void> {
    this.loadState();
  }

  async findThoughtsByTag(tagName: string): Promise<{ properties: Thought }[]> {
    return Array.from(this.nodes.values())
      .filter((node): node is Node & { properties: Thought } => {
        if (!node.labels?.includes('Thought')) {
          return false;
        }
        const thought = node.properties as Thought;
        return !!thought.tags?.some((tag: Tag) => tag.name === tagName);
      })
      .map((node) => ({ properties: node.properties }));
  }

  async addThought(thought: Thought): Promise<void> {
    const node: Node = {
      id: thought.id,
      labels: ['Thought'],
      properties: thought,
    };
    this.nodes.set(node.id, node);

    if (thought.segments) {
      thought.segments.forEach((segment) => {
        const segmentNode: Node = {
          id: segment.segment_id,
          labels: ['Segment'],
          properties: segment,
        };
        this.nodes.set(segmentNode.id, segmentNode);

        const relationship: Relationship = {
          from: thought.id,
          to: segment.segment_id,
          type: 'HAS_SEGMENT',
        };
        this.relationships.set(
          `${relationship.from}-${relationship.to}`,
          relationship
        );
      });
    }

    this._persistState();
  }

  inferFieldType(value: any): string {
    if (typeof value === 'string' && !isNaN(Date.parse(value))) return 'date';
    if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))) return 'numeric';
    if (
      typeof value === 'string' &&
      /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(
        value
      )
    ) {
      return 'location';
    }
    return 'text';
  }

  getFieldType(fieldName: string): string {
    if (this.fieldTypes.has(fieldName)) {
      return this.fieldTypes.get(fieldName)!;
    }
    return 'text';
  }
}

export const graphService = new GraphService();
