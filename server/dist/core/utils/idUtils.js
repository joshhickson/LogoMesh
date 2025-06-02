"use strict";
// Placeholder for ID generation utilities
// TODO: Implement robust ID generation
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSegmentId = exports.generateThoughtId = exports.generateShortUUID = exports.generateUUID = void 0;
function generateUUID() {
    // Basic UUID v4 generation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
exports.generateUUID = generateUUID;
function generateShortUUID() {
    return Math.random().toString(36).substring(2, 10);
}
exports.generateShortUUID = generateShortUUID;
// Specific ID generators based on usage in sqliteAdapter.ts
function generateThoughtId() {
    return `thought_${generateUUID()}`;
}
exports.generateThoughtId = generateThoughtId;
function generateSegmentId() {
    return `segment_${generateUUID()}`;
}
exports.generateSegmentId = generateSegmentId;
//# sourceMappingURL=idUtils.js.map