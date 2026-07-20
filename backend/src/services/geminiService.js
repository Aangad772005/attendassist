const crypto = require('crypto');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/env');
const User = require('../models/User');
const calculatorService = require('./calculatorService');
const promptBuilder = require('../utils/promptBuilder');

// Initialize Gemini SDK if API key exists
let genAI = null;
let model = null;

if (config.gemini.apiKey) {
  try {
    genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  } catch (err) {
    console.error('❌ Failed to initialize Google Gemini SDK:', err.message);
  }
} else {
  console.warn('⚠️  Gemini SDK: API Key is missing. Falling back to static warnings.');
}

class GeminiService {
  /**
   * Safe wrapper to call Gemini API with a timeout
   * @param {string} prompt - Constructed prompt.
   * @param {number} timeoutMs - Timeout limit (default 10s).
   * @returns {Promise<string>} Generative text.
   */
  async _generateContentWithTimeout(prompt, timeoutMs = 10000) {
    if (!model) {
      throw new Error('Gemini API client not initialized.');
    }

    const apiCallPromise = (async () => {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    })();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API call timed out.')), timeoutMs)
    );

    // Race the API call against the timeout limit
    return Promise.race([apiCallPromise, timeoutPromise]);
  }

  /**
   * Resolves or generates the cached dashboard greeting insight
   */
  async getOrCachedInsight(userId, overallStats, subjects, userName) {
    const slackingSubjects = subjects.filter(
      s => s.stats.status !== 'safe' && s.stats.status !== 'no_data'
    );
    
    const greetingPeriod = calculatorService.getGreetingPeriod();

    // 1. Construct content-hash (keys: overall percentage, slacking subject list, period)
    const slackingIds = slackingSubjects.map(s => s._id || s.id).sort().join(',');
    const hashSource = `overallPct:${overallStats.overallPercentage}|slacking:${slackingIds}|period:${greetingPeriod}`;
    const calculatedHash = crypto.createHash('md5').update(hashSource).digest('hex');

    // 2. Fetch User database config
    const user = await User.findById(userId);
    if (!user) {
      return {
        insight: calculatorService.getFallbackMessage(userName),
        generatedAt: null,
        cached: false,
      };
    }

    // 3. Cache check: If hashes match, return cached insight immediately
    if (user.aiInsightHash === calculatedHash && user.aiInsightCache) {
      return {
        insight: user.aiInsightCache,
        generatedAt: user.aiInsightGeneratedAt,
        cached: true,
      };
    }

    // 4. Cache miss: Request Gemini
    try {
      const prompt = promptBuilder.buildDashboardPrompt(
        overallStats,
        slackingSubjects,
        userName,
        greetingPeriod
      );

      const generatedText = await this._generateContentWithTimeout(prompt);

      // Save to cache
      user.aiInsightCache = generatedText;
      user.aiInsightHash = calculatedHash;
      user.aiInsightGeneratedAt = new Date();
      await user.save();

      return {
        insight: generatedText,
        generatedAt: user.aiInsightGeneratedAt,
        cached: false,
      };
    } catch (error) {
      console.warn(`⚠️  Gemini Insight generation failed: ${error.message}. Returning fallback greeting.`);
      
      // Fallback greeting logic (always available)
      return {
        insight: calculatorService.getFallbackMessage(userName),
        generatedAt: null,
        cached: false,
      };
    }
  }

  /**
   * Generates motivational advice for a single subject
   */
  async getSubjectAdvice(userId, subjectDoc, userName) {
    try {
      const prompt = promptBuilder.buildSubjectAdvicePrompt(subjectDoc, userName);
      const generatedText = await this._generateContentWithTimeout(prompt);
      return generatedText;
    } catch (error) {
      console.warn(`⚠️  Gemini Subject Advice failed: ${error.message}. Returning fallback advice.`);
      
      // Build safe fallback advice based on attendance status
      const stats = subjectDoc.stats;
      if (stats.status === 'safe') {
        return `Your attendance in ${subjectDoc.name} is currently safe at ${stats.percentage}%. Keep attending regularly to maintain this buffer!`;
      }
      if (stats.status === 'no_data') {
        return `No attendance records logged for ${subjectDoc.name} yet. Log your first class session to start tracking your progress.`;
      }
      return `Your attendance in ${subjectDoc.name} is slacking at ${stats.percentage}%. Make sure to attend the next ${stats.classesNeededToReachRequired} lecture(s) consecutively to recover.`;
    }
  }
}

module.exports = new GeminiService();
