import express from 'express';
import { limiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import postRouter from './routes/postRoutes.js';
import userRouter from './routes/userRoutes.js';
import { stats } from './utils/cache.js';

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());

// Rate limiting applies to the whole /api surface — protects both
// this server and the upstream JSONPlaceholder API from abuse.
app.use('/api', limiter);

// Health check 
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Simple observability endpoint — cache hit/miss stats.
app.get('/api/_cache-stats', (req, res) => {
  res.json(stats());
});

app.use('/api/posts', postRouter);
app.use('/api/users', userRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorHandler);


app.listen(PORT, () => {
  console.log(`Middleware running on http://localhost:${PORT}`);
});