import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import getUserSummary from '../controllers/userController.js';

const userRouter = express.Router();

// GET /api/users/:id/summary
// Aggregation endpoint: user + their posts + comment counts, in one call...
userRouter.get('/:id/summary', asyncHandler(getUserSummary));

export default router;