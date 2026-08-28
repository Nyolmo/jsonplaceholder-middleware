import { getPost,getPosts,getUserSummary } from "../services/jsonPlaceholderService.js";


async function fetchPosts(req, res) {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  const { data, fromCache } = await getPosts({ page, limit });
  res.set('X-Cache', fromCache ? 'HIT' : 'MISS');
  res.json(data);
}

async function getPostById(req, res) {
  const { data, fromCache } = await getPost(req.params.id);
  res.set('X-Cache', fromCache ? 'HIT' : 'MISS');
  res.json(data);
}

export { fetchPosts, getPostById };