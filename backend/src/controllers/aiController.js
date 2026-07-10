const geminiService = require('../services/geminiService');
const subjectService = require('../services/subjectService');
const User = require('../models/User');
const ApiResponse = require('../utils/ApiResponse');
const HTTP = require('../constants/http');
const asyncWrapper = require('../utils/asyncWrapper');

const getSubjectAdvice = asyncWrapper(async (req, res) => {
  const { subjectId } = req.params;

  // 1. Fetch subject with its compiled stats (verifies existence and ownership)
  const subject = await subjectService.getSubjectById(req.user._id, subjectId);

  // 2. Query Gemini for subject-specific advice
  const advice = await geminiService.getSubjectAdvice(req.user._id, subject, req.user.name);

  return ApiResponse.success(res, HTTP.OK, 'Subject advice generated successfully', { advice });
});

const regenerateInsight = asyncWrapper(async (req, res) => {
  // Clear the user's AI insight cache hash to trigger cache-miss recalculation on next load
  await User.updateOne(
    { _id: req.user._id },
    { $set: { aiInsightHash: null } }
  );

  return ApiResponse.success(res, HTTP.OK, 'AI insights queue reset. Recalculation will occur on next reload.');
});

module.exports = {
  getSubjectAdvice,
  regenerateInsight,
};
