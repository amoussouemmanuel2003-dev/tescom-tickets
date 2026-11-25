const dashboardService = require('../services/dashboardService');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getStats(req.user);
  return sendSuccess(res, 200, 'Statistiques du tableau de bord récupérées.', stats);
});

module.exports = {
  getStats,
};
