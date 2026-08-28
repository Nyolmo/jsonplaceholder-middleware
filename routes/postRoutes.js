import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateBody, validateIdParam } from '../middleware/validation.js';
import { fetchPosts, getPostById, createPost } from '../controllers/postController.js';

const postsRouter = express.Router();

postsRouter.get('/', asyncHandler(fetchPosts));

postsRouter.get(
  '/:id',
  validateIdParam('id'),          
  asyncHandler(getPostById)
);

postsRouter.post(
  '/',
  validateBody({                 
    title: (v) => typeof v === 'string' && v.trim().length > 0,
    body: (v) => typeof v === 'string' && v.trim().length > 0,
    userId: (v) => Number.isInteger(v) && v > 0,
  }),
  asyncHandler(createPost)
);

export default postsRouter;