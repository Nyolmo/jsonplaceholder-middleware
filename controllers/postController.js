import { getPostService,getPostsService,createPostService} from "../services/jsonPlaceholderService.js";


async function fetchPosts(req, res) {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const userId = req.query.userId ? parseInt(req.query.userId, 10) : undefined;
  const sortBy = req.query.sortBy; // 'title' | 'id' | undefined
  const order = req.query.order === 'desc' ? 'desc' : 'asc';

  const { data, fromCache } = await getPostsService({ page, limit });
  res.set('X-Cache', fromCache ? 'HIT' : 'MISS');
  res.json(data);
}

async function getPostById(req, res) {
  const { data, fromCache } = await getPostService(req.params.id);
  res.set('X-Cache', fromCache ? 'HIT' : 'MISS');
  res.json(data);
}

// req.body is already validated by validateBody() middleware before this runs.
async function createPost(req, res) {
  const { title, body, userId } = req.body;
  const created = await createPostService({ title, body, userId });
  res.status(201).json(created);
}

export { fetchPosts, getPostById, createPost };
