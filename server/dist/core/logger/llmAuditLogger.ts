// Placeholder LLM Audit Logger
// TODO: Implement a real LLM audit logging solution
import { v4 as generateId } from 'uuid';
import { logger } from '../utils/logger';

export interface LLMAuditEntry {
  id: string;
  timestamp: Date;
  prompt: string;
  response: string | null;
  model: string;
  metadata?: Record<string, any>;
  duration: number;
  success: boolean;
  error?: string;
}

export interface PipelineAuditEntry {
  id: string;
  pipelineId: string;
  pipelineName: string;
  stepId?: string;
  stepType?: 'llm' | 'plugin' | 'system';
  executorId?: string;
  timestamp: Date;
  event: 'created' | 'started' | 'step_started' | 'step_completed' | 'step_failed' | 'completed' | 'failed' | 'cancelled';
  details?: Record<string, any>;
  duration?: number;
}

const auditLogs: LLMAuditEntry[] = [];

export async function logLLMInteraction(entry: Omit<LLMAuditEntry, 'id' | 'timestamp'>): Promise<void> {
  const auditEntry: LLMAuditEntry = {
    id: generateId(),
    timestamp: new Date(),
    ...entry
  };

  auditLogs.push(auditEntry);

  // Log to console for immediate visibility
  logger.info('[LLM Audit]', {
    id: auditEntry.id,
    model: auditEntry.model,
    promptLength: auditEntry.prompt.length,
    responseLength: auditEntry.response?.length || 0,
    duration: auditEntry.duration,
    success: auditEntry.success
  });

  // TODO: Store in SQLite database for persistence
}

// Pipeline audit logging
const pipelineAuditLogs: PipelineAuditEntry[] = [];

export async function logPipelineEvent(entry: Omit<PipelineAuditEntry, 'id' | 'timestamp'>): Promise<void> {
  const auditEntry: PipelineAuditEntry = {
    id: generateId(),
    timestamp: new Date(),
    ...entry
  };

  pipelineAuditLogs.push(auditEntry);

  // Log to console for immediate visibility
  logger.info('[Pipeline Audit]', {
    id: auditEntry.id,
    pipelineId: auditEntry.pipelineId,
    pipelineName: auditEntry.pipelineName,
    event: auditEntry.event,
    stepType: auditEntry.stepType,
    executorId: auditEntry.executorId,
    duration: auditEntry.duration
  });

  // TODO: Store in SQLite database for persistence
}

export function getAuditLogs(filter?: {
  model?: string;
  success?: boolean;
  since?: Date;
  limit?: number;
}): LLMAuditEntry[] {
  let filtered = auditLogs;

  if (filter) {
    if (filter.model) {
      filtered = filtered.filter(log => log.model === filter.model);
    }
    if (filter.success !== undefined) {
      filtered = filtered.filter(log => log.success === filter.success);
    }
    if (filter.since) {
      filtered = filtered.filter(log => log.timestamp >= filter.since!);
    }
  }

  // Sort by timestamp, most recent first
  filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  if (filter?.limit) {
    filtered = filtered.slice(0, filter.limit);
  }

  return filtered;
}

export function getPipelineAuditLogs(filter?: {
  pipelineId?: string;
  event?: string;
  since?: Date;
  limit?: number;
}): PipelineAuditEntry[] {
  let filtered = pipelineAuditLogs;

  if (filter) {
    if (filter.pipelineId) {
      filtered = filtered.filter(log => log.pipelineId === filter.pipelineId);
    }
    if (filter.event) {
      filtered = filtered.filter(log => log.event === filter.event);
    }
    if (filter.since) {
      filtered = filtered.filter(log => log.timestamp >= filter.since!);
    }
  }

  // Sort by timestamp, most recent first
  filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  if (filter?.limit) {
    filtered = filtered.slice(0, filter.limit);
  }

  return filtered;
}