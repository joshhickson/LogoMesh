"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidSegmentId = exports.isValidThoughtId = exports.generateSegmentId = exports.generateThoughtId = exports.newSegmentId = exports.newBubbleId = void 0;
const ulid_1 = require("ulid");
const newBubbleId = () => `tb_${(0, ulid_1.ulid)()}`;
exports.newBubbleId = newBubbleId;
const newSegmentId = () => `seg_${(0, ulid_1.ulid)()}`;
exports.newSegmentId = newSegmentId;
exports.generateThoughtId = exports.newBubbleId; // Alias for consistency if used elsewhere
exports.generateSegmentId = exports.newSegmentId; // Alias
const isValidThoughtId = (id) => {
    // Basic check, can be improved later
    return typeof id === 'string' && id.startsWith('tb_');
};
exports.isValidThoughtId = isValidThoughtId;
const isValidSegmentId = (id) => {
    // Basic check, can be improved later
    return typeof id === 'string' && id.startsWith('seg_');
};
exports.isValidSegmentId = isValidSegmentId;
//# sourceMappingURL=idUtils.js.map