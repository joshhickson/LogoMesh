"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logger_1 = require("../../../core/utils/logger");
const router = express_1.default.Router();
// Get current user info
router.get('/me', (req, res) => {
    try {
        if (!req.user?.isAuthenticated) {
            return res.status(401).json({
                error: 'Not authenticated',
                message: 'Please log in to access this resource'
            });
        }
        res.json({
            user: {
                id: req.user.id,
                name: req.user.name,
                roles: req.user.roles,
                isAuthenticated: req.user.isAuthenticated
            }
        });
    }
    catch (error) {
        logger_1.logger.error('[UserRoutes] Error getting user info:', error);
        res.status(500).json({
            error: 'Failed to get user info',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Health check for user services
router.get('/health', (req, res) => {
    res.json({
        service: 'user-auth',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        authenticated: req.user?.isAuthenticated || false
    });
});
exports.default = router;
//# sourceMappingURL=userRoutes.js.map