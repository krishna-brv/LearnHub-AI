const Groq = require('groq-sdk');
const AIUsageLog = require('../../models/AIUsageLog');
const AppError = require('../../utils/AppError');

class GroqService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.primaryModel = process.env.GROQ_PRIMARY_MODEL || 'llama-3.3-70b-versatile';
    this.fastModel = process.env.GROQ_FAST_MODEL || 'llama-3.1-8b-instant';

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
    const key = process.env.GROQ_API_KEY;
    if (!this.groq && key && key !== 'gsk_placeholder_key') {
      this.groq = new Groq({ apiKey: key });
    }
    return this.groq;
  }

  /**
   * Select model based on requested tier
   * @param {string} tier - 'primary' or 'fast'
   */
  selectModel(tier = 'fast') {
    let model = tier === 'primary'
      ? (process.env.GROQ_PRIMARY_MODEL || 'llama-3.3-70b-versatile')
      : (process.env.GROQ_FAST_MODEL || 'llama-3.1-8b-instant');

    if (!model || model.includes('groq/compound')) {
      model = tier === 'primary' ? 'llama-3.3-70b-versatile' : 'llama-3.1-8b-instant';
    }
    return model;
  }

  /**
   * Smart local AI fallback generator for offline or API errors
   */
  generateSmartFallback(messages = [], jsonMode = false) {
    const lastUserMsg = Array.isArray(messages)
      ? ([...messages].reverse().find((m) => m.role === 'user')?.content || '')
      : '';
    const query = lastUserMsg.toLowerCase().trim();

    if (jsonMode) {
      if (query.includes('quiz') || query.includes('question')) {
        return JSON.stringify({
          title: 'Practice Quiz',
          questions: [
            {
              text: 'What is the time complexity of accessing an element in an array by index?',
              options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
              correctOption: 0,
              tip: 'Direct index access in arrays takes constant O(1) time.'
            },
            {
              text: 'Which hook is used for managing side effects in React components?',
              options: ['useState', 'useEffect', 'useContext', 'useReducer'],
              correctOption: 1,
              tip: 'useEffect runs side effects after component rendering.'
            },
            {
              text: 'What does REST stand for in web API architecture?',
              options: ['Representational State Transfer', 'Remote Execution State Tech', 'Response Transfer Protocol', 'Realtime Embedded State Token'],
              correctOption: 0,
              tip: 'REST is an architectural style for stateless, client-server web services.'
            }
          ]
        });
      }

      if (query.includes('learning') || query.includes('path') || query.includes('roadmap') || query.includes('skill')) {
        return JSON.stringify({
          title: 'Software Developer Mastery Path',
          description: 'A structured, step-by-step roadmap designed for industry skill building.',
          steps: [
            { stage: '1', title: 'HTML5, CSS3 & Responsive UI', description: 'Master flexbox, grid, semantic HTML, and modern styling libraries.' },
            { stage: '2', title: 'JavaScript Fundamentals & ES6+', description: 'Understand closures, scope, event loop, promises, and async/await.' },
            { stage: '3', title: 'React & Frontend Architecture', description: 'Components, hooks, global state management, and SPA router.' },
            { stage: '4', title: 'Backend APIs with Node.js & Express', description: 'Build REST APIs, middleware, security, and JWT auth.' },
            { stage: '5', title: 'Database Architecture & MongoDB', description: 'Document modeling, Mongoose schemas, queries, and indexing.' }
          ]
        });
      }

      return JSON.stringify({
        summary: 'Career & Skill Evaluation Complete',
        feedback: 'Solid foundational background! Continue building hands-on projects, practicing algorithms, and refining system design concepts.',
        score: 88,
        strengths: ['Structured problem solving', 'Clean modular design', 'Core JS understanding'],
        improvements: ['Deepen system architecture knowledge', 'Practice automated unit testing']
      });
    }

    if (query === 'hi' || query === 'hello' || query === 'hey' || query.startsWith('hi ') || query.startsWith('hello ')) {
      return `Hello! 👋 Welcome to **LearnHub AI Tutor**!\n\nI'm ready to help you with your courses, code debugging, complex concepts, or exam preparation. What topic would you like to explore today?`;
    }

    if (query.includes('closure')) {
      return `### 💡 What is a JavaScript Closure?\n\nA **closure** is created when an inner function retains access to its outer function's scope even after the outer function has returned.\n\n\`\`\`javascript\nfunction createCounter() {\n  let count = 0;\n  return function() {\n    count++;\n    return count;\n  };\n}\nconst counter = createCounter();\nconsole.log(counter()); // 1\nconsole.log(counter()); // 2\n\`\`\`\n\n**Key Use Cases:**\n- Data privacy & encapsulation\n- Maintaining state across async calls or event handlers\n- Partial application and currying`;
    }

    if (query.includes('async') || query.includes('promise') || query.includes('await')) {
      return `### ⚡ Async/Await & Promises in JavaScript\n\n- **Promise**: Represents an operation that hasn't completed yet, but is expected in the future.\n- **Async/Await**: Clean syntax built on Promises that reads like synchronous code.\n\n\`\`\`javascript\nasync function fetchCourseData(id) {\n  try {\n    const response = await fetch(\`/api/courses/\${id}\`);\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Fetch error:', error);\n  }\n}\n\`\`\``;
    }

    return `### 📚 LearnHub AI Tutor\n\nThank you for asking about **"${lastUserMsg || 'this concept'}"**!\n\n**Core Highlights:**\n- **Understanding the Problem**: Break down complex requirements into smaller, modular components.\n- **Best Practices**: Focus on readability, performance, and clean architectural separation.\n- **Next Step**: Try generating an interactive quiz or flashcards deck to solidify your mastery!`;
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
      console.warn('⚠️ Groq API client not initialized. Using smart local AI fallback.');
      return {
        content: this.generateSmartFallback(messages, jsonMode),
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

      // Smart Fallback — Never crash or show ugly raw error strings
      return {
        content: this.generateSmartFallback(messages, jsonMode),
        isFallback: true,
        error: error.message,
        model
      };
    }
  }
}

module.exports = new GroqService();
