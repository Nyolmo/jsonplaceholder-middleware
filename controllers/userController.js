import {getUserSummaryService} from "../services/jsonPlaceholderService.js";

async function getUserSummary(req, res) {
  const { data, fromCache } = await getUserSummaryService(req.params.id);
  res.set('X-Cache', fromCache ? 'HIT' : 'MISS');
  res.json(data);
}

export default getUserSummary;