"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPipelineAuditLogs = exports.getAuditLogs = exports.logPipelineEvent = exports.logLLMInteraction = void 0;
// Placeholder LLM Audit Logger
// TODO: Implement a real LLM audit logging solution
const uuid_1 = require("uuid");
const logger_1 = require("../utils/logger");
const auditLogs = [];
async function logLLMInteraction(entry) {
    const auditEntry = {
        id: (0, uuid_1.v4)(),
        timestamp: new Date(),
        ...entry
    };
    auditLogs.push(auditEntry);
    // Log to console for immediate visibility
    logger_1.logger.info('[LLM Audit]', {
        id: auditEntry.id,
        model: auditEntry.model,
        promptLength: auditEntry.prompt.length,
        responseLength: auditEntry.response?.length || 0,
        duration: auditEntry.duration,
        success: auditEntry.success
    });
    // TODO: Store in SQLite database for persistence
}
exports.logLLMInteraction = logLLMInteraction;
// Pipeline audit logging
const pipelineAuditLogs = [];
async function logPipelineEvent(entry) {
    const auditEntry = {
        id: (0, uuid_1.v4)(),
        timestamp: new Date(),
        ...entry
    };
    pipelineAuditLogs.push(auditEntry);
    // Log to console for immediate visibility
    logger_1.logger.info('[Pipeline Audit]', {
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
exports.logPipelineEvent = logPipelineEvent;
function getAuditLogs(filter) {
    let filtered = auditLogs;
    if (filter) {
        if (filter.model) {
            filtered = filtered.filter(log => log.model === filter.model);
        }
        if (filter.success !== undefined) {
            filtered = filtered.filter(log => log.success === filter.success);
        }
        if (filter.since) {
            filtered = filtered.filter(log => log.timestamp >= filter.since);
        }
    }
    // Sort by timestamp, most recent first
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    if (filter?.limit) {
        filtered = filtered.slice(0, filter.limit);
    }
    return filtered;
}
exports.getAuditLogs = getAuditLogs;
function getPipelineAuditLogs(filter) {
    let filtered = pipelineAuditLogs;
    if (filter) {
        if (filter.pipelineId) {
            filtered = filtered.filter(log => log.pipelineId === filter.pipelineId);
        }
        if (filter.event) {
            filtered = filtered.filter(log => log.event === filter.event);
        }
        if (filter.since) {
            filtered = filtered.filter(log => log.timestamp >= filter.since);
        }
    }
    // Sort by timestamp, most recent first
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    if (filter?.limit) {
        filtered = filtered.slice(0, filter.limit);
    }
    return filtered;
}
exports.getPipelineAuditLogs = getPipelineAuditLogs;
//# sourceMappingURL=llmAuditLogger.js.map