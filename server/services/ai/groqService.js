const Groq = require('groq-sdk');
const AIUsageLog = require('../../models/AIUsageLog');
const AppError = require('../../utils/AppError');

class GroqService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.primaryModel = process.env.GROQ_PRIMARY_MODEL || 'groq/compound';
    this.fastModel = process.env.GROQ_FAST_MODEL || 'groq/compound-mini';

    if (this.apiKey && this.apiKey !== 'gsk_placeholder_key') {
      this.groq = new Groq({ apiKey: this.apiKey });
    } else {
      this.groq = null;
    }
  }

  /**
   * Get active Groq client instance
   */
  getClient() {
    if (!this.groq && process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'gsk_placeholder_key') {
      this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    return this.groq;
  }

  /**
   * Select model based on requested tier
   * @param {string} tier - 'primary' or 'fast'
   */
  selectModel(tier = 'fast') {
    if (tier === 'primary') {
      return process.env.GROQ_PRIMARY_MODEL || 'groq/compound';
    }
    return process.env.GROQ_FAST_MODEL || 'groq/compound-mini';
  }

  /**
   * Execute Chat Completion request to Groq API
   */
  async chatCompletion({
    messages,
    tier = 'fast',
    feature = 'general',
    userId = null,
    jsonMode = false,
    temperature = 0.7,
    maxTokens = 2048
  }) {
    const client = this.getClient();
    const model = this.selectModel(tier);
    const startTime = Date.now();

    // Fallback if Groq API key is missing or invalid
    if (!client) {
      console.warn('⚠️ Groq API key not configured. Returning graceful fallback response.');
      return {
        content: jsonMode
          ? JSON.stringify({ message: 'AI service is temporarily unavailable. Please try again later.' })
          : 'AI service is temporarily unavailable. Please try again later.',
        isFallback: true,
        model
      };
    }

    try {
      const options = {
        messages,
        model,
        temperature,
        max_tokens: maxTokens
      };

      if (jsonMode) {
        options.response_format = { type: 'json_object' };
      }

      const response = await client.chat.completions.create(options);
      const latencyMs = Date.now() - startTime;
      const content = response.choices[0]?.message?.content || '';
      const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

      // Async usage log
      if (userId) {
        AIUsageLog.create({
          user: userId,
          feature,
          model,
          inputTokens: usage.prompt_tokens,
          outputTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
          latencyMs,
          status: 'success',
          promptVersion: process.env.AI_PROMPT_VERSION || 'v1.0'
        }).catch((err) => console.warn('Usage log error:', err.message));
      }

      return {
        content,
        usage,
        latencyMs,
        model,
        isFallback: false
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      console.error(`💥 Groq API Error (${feature}):`, error.message);

      if (userId) {
        AIUsageLog.create({
          user: userId,
          feature,
          model,
          latencyMs,
          status: 'error',
          error: error.message
        }).catch(() => {});
      }

      // Graceful fallback — DO NOT CRASH APP
      return {
        content: jsonMode
          ? JSON.stringify({ message: 'AI service is temporarily unavailable. Please try again.' })
          : 'AI service is temporarily unavailable. Please try again.',
        isFallback: true,
        error: error.message,
        model
      };
    }
  }
}

module.exports = new GroqService();
