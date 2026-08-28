import * as jsonPlaceholderService from "../services/jsonPlaceholderService.js";

async function getUserSummary(req, res) {
  const { data, fromCache } = await jsonPlaceholderService.getUserSummary(req.params.id);
  res.set('X-Cache', fromCache ? 'HIT' : 'MISS');
  res.json(data);
}

export { getUserSummary };