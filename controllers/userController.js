import {getUserSummary as getUserData} from "../services/jsonPlaceholderService.js";

async function getUserSummary(req, res) {
  const { data, fromCache } = await getUserData(req.params.id);
  res.set('X-Cache', fromCache ? 'HIT' : 'MISS');
  res.json(data);
}

export default getUserSummary;