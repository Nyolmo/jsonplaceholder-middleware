import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { fetchPosts, getPostById } from '../controllers/postController.js';

const postRouter = express.Router();

postRouter.get('/', asyncHandler(fetchPosts));
postRouter.get('/:id', asyncHandler(getPostById));

export default postRouter;