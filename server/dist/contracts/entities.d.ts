export interface Thought {
    thought_bubble_id: string;
    title: string;
    description?: string | null;
    created_at: string;
    updated_at: string;
    color?: string | null;
    position?: {
        x: number;
        y: number;
    };
    fields?: Record<string, any>;
    metadata?: Record<string, any>;
    tags?: Tag[];
    segments?: Segment[];
}
export interface Segment {
    segment_id: string;
    thought_bubble_id: string;
    title?: string | null;
    content: string;
    content_type?: string;
    fields?: Record<string, any>;
    metadata?: Record<string, any>;
    created_at: string;
    updated_at: string;
    abstraction_level?: string;
    local_priority?: number;
    cluster_id?: string;
    sort_order?: number;
}
export interface Tag {
    tag_id?: string;
    name: string;
    color?: string;
    created_at?: string;
}
export interface Edge {
    edge_id: string;
    source_thought_id: string;
    target_thought_id: string;
    label?: string;
    created_at: string;
    updated_at: string;
}
export interface UserSettings {
    user_id: string;
    settings: Record<string, any>;
}
export interface GraphState {
    zoom_level?: number;
    viewport_position?: {
        x: number;
        y: number;
    };
}
export interface NodePosition {
    node_id: string;
    x: number;
    y: number;
}
//# sourceMappingURL=entities.d.ts.map