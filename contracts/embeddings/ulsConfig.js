"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ULS_CONFIG = void 0;
/**
 * Default ULS configuration
 */
exports.DEFAULT_ULS_CONFIG = {
    dimension: parseInt(process.env.ULS_DIMENSION || '768', 10),
    normalization: 'l2',
    quantization: {
        enabled: false,
        bits: 32,
        method: 'uniform'
    },
    supportedModalities: ['text'],
    version: '1.0.0'
};
//# sourceMappingURL=ulsConfig.js.map