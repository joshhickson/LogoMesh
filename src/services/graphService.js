
import neo4j from 'neo4j-driver';

class GraphService {
  constructor() {
    // Keep in-memory graph as cache
    this.thoughts = new Map();
    this.relationships = new Map();
    
    // Initialize Neo4j connection
    const uri = process.env.NEO4J_URI || 'neo4j://0.0.0.0:7687';
    const user = process.env.NEO4J_USER || 'neo4j';
    const password = process.env.NEO4J_PASSWORD || 'password';
    
    this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  }

  async initializeDb() {
    const session = this.driver.session();
    try {
      // Create constraints
      await session.run('CREATE CONSTRAINT thought_id IF NOT EXISTS FOR (t:Thought) REQUIRE t.id IS UNIQUE');
      await session.run('CREATE CONSTRAINT segment_id IF NOT EXISTS FOR (s:Segment) REQUIRE s.id IS UNIQUE');
    } finally {
      await session.close();
    }
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
    const session = this.driver.session();
    try {
      const node = this.thoughtToNode(thought);
      
      // Create thought node
      await session.run(
        `CREATE (t:Thought {
          id: $id,
          title: $title,
          description: $description,
          tags: $tags,
          color: $color,
          created_at: $created_at
        })`,
        node.properties
      );

      // Add segments if they exist
      if (thought.segments) {
        for (const segment of thought.segments) {
          const { node: segmentNode, relationship } = this.segmentToNode(segment, thought.thought_bubble_id);
          
          await session.run(
            `CREATE (s:Segment {
              id: $id,
              title: $title,
              content: $content,
              fields: $fields
            })`,
            segmentNode.properties
          );

          await session.run(
            `MATCH (t:Thought {id: $fromId}), (s:Segment {id: $toId})
             CREATE (t)-[:CONTAINS]->(s)`,
            { fromId: relationship.from, toId: relationship.to }
          );
        }
      }

      // Update in-memory cache
      this.thoughts.set(node.id, node);
    } finally {
      await session.close();
    }
  }

  async executeCypher(query, params = {}) {
    const session = this.driver.session();
    try {
      const result = await session.run(query, params);
      return result.records.map(record => record.toObject());
    } finally {
      await session.close();
    }
  }

  async findThoughtsByTag(tag) {
    return this.executeCypher(
      "MATCH (t:Thought) WHERE $tag IN t.tags RETURN t",
      { tag }
    );
  }

  async findConnectedSegments(thoughtId) {
    return this.executeCypher(
      "MATCH (t:Thought {id: $thoughtId})-[:CONTAINS]->(s:Segment) RETURN s",
      { thoughtId }
    );
  }

  async close() {
    await this.driver.close();
  }
}

export const graphService = new GraphService();
