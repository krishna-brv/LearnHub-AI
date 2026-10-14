const Groq = require('groq-sdk');
const AIUsageLog = require('../../models/AIUsageLog');
const AppError = require('../../utils/AppError');

class GroqService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.primaryModel = process.env.GROQ_PRIMARY_MODEL || 'openai/gpt-oss-120b';
    this.fastModel = process.env.GROQ_FAST_MODEL || 'openai/gpt-oss-20b';

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
      ? (process.env.GROQ_PRIMARY_MODEL || 'openai/gpt-oss-120b')
      : (process.env.GROQ_FAST_MODEL || 'openai/gpt-oss-20b');

    if (!model || model.includes('groq/compound') || model.includes('llama-3.')) {
      model = tier === 'primary' ? 'openai/gpt-oss-120b' : 'openai/gpt-oss-20b';
    }
    return model;
  }

  /**
   * Smart local AI fallback generator for offline or API errors
   */
  generateSmartFallback(messages = [], jsonMode = false) {
    const rawMsg = Array.isArray(messages)
      ? ([...messages].reverse().find((m) => m.role === 'user')?.content || '')
      : '';

    // Strip learning mode prefix e.g. "[Learning Mode: Simple Explanation - Clear and concise] "
    const cleanMsg = rawMsg.replace(/^\[Learning Mode:[^\]]+\]\s*/i, '').trim();
    const query = cleanMsg.toLowerCase();

    if (jsonMode) {
      if (query.includes('quiz') || query.includes('question')) {
        return JSON.stringify({
          title: 'Practice Quiz',
          questions: [
            {
              text: 'What is the time complexity of accessing an element in an array by index?',
              options: [
                { text: 'O(1)', isCorrect: true, explanation: 'Direct index access takes O(1) time.' },
                { text: 'O(n)', isCorrect: false, explanation: 'Linear search is O(n), not direct indexing.' },
                { text: 'O(log n)', isCorrect: false, explanation: 'Binary search is O(log n).' },
                { text: 'O(n²)', isCorrect: false, explanation: 'Quadratic time is incorrect.' }
              ],
              explanation: 'Direct index access in contiguous array memory takes constant O(1) time.'
            },
            {
              text: 'Which hook is used for managing side effects in React components?',
              options: [
                { text: 'useState', isCorrect: false, explanation: 'useState is for state management.' },
                { text: 'useEffect', isCorrect: true, explanation: 'useEffect handles side effects.' },
                { text: 'useContext', isCorrect: false, explanation: 'useContext consumes context.' },
                { text: 'useReducer', isCorrect: false, explanation: 'useReducer is for complex state transitions.' }
              ],
              explanation: 'useEffect runs side effects after component rendering.'
            },
            {
              text: 'What does REST stand for in web API architecture?',
              options: [
                { text: 'Representational State Transfer', isCorrect: true, explanation: 'Standard REST definition.' },
                { text: 'Remote Execution State Tech', isCorrect: false, explanation: 'Incorrect.' },
                { text: 'Response Transfer Protocol', isCorrect: false, explanation: 'Incorrect.' },
                { text: 'Realtime Embedded State Token', isCorrect: false, explanation: 'Incorrect.' }
              ],
              explanation: 'REST is an architectural style for stateless, client-server web services.'
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

    // Topic Matchers
    if (query.includes('what is learnhub') || query.includes('learnhub ai') || query.includes('about learnhub') || query === 'learnhub') {
      return `### 🌿 Welcome to LearnHub AI!\n\n**LearnHub AI** is an advanced, production-grade AI-powered Learning Management Platform designed to help students master Web Development, Computer Science, and Software Engineering effortlessly.\n\n### 🌟 Key Features of LearnHub AI:\n1. **Groq Dual-Model AI Engine**: Powered by \`llama-3.3-70b-versatile\` for deep reasoning & \`llama-3.1-8b-instant\` for instant tutoring.\n2. **100% Free Course Access**: No paywalls or subscriptions. Learn HTML, CSS, JavaScript, React, Node.js, and DSA for free.\n3. **Interactive Quiz Arena**: Practice 7 question types (MCQ, Coding, Fill-in-blanks) with real-time scoring & explanation tips.\n4. **Personalized Study Studio**: Upload notes, generate instant flashcards, track study streaks, and earn completion certificates.`;
    }

    if (query.includes('chatgpt') || query.includes('compare') || query.includes('difference') || query.includes('versus')) {
      return `### ⚔️ LearnHub AI vs ChatGPT\n\nWhile ChatGPT is a general-purpose conversational LLM, **LearnHub AI** is a specialized, course-aware Learning Management System designed specifically for students and developer education.\n\n| Feature | LearnHub AI 🌿 | ChatGPT 🤖 |\n| :--- | :--- | :--- |\n| **Course Context** | Directly tied to your enrolled courses & lessons | General knowledge base |\n| **Interactive Quiz Arena** | Auto-generates 7 question types with live timer & scoring | Text-based QA only |\n| **Flashcards & Spaced Repetition** | Built-in SM-2 review engine | Manual prompt creation required |\n| **Career & Resume Analysis** | Integrated ATS resume & portfolio scanner | Generic text feedback |\n| **100% Free LMS Access** | Free structured courses, modules & certificates | Requires Plus subscription for top models |\n\n**Summary:** Use LearnHub AI for structured, course-driven learning and skill building!`;
    }

    if (query.includes('dsa') || query.includes('data structure') || query.includes('algorithm')) {
      return `### 🌳 Data Structures & Algorithms (DSA) Overview\n\n**Data Structures and Algorithms (DSA)** form the backbone of computer science, efficient software design, and technical coding interviews.\n\n#### 1. Core Data Structures:\n- **Arrays & Vectors**: Contiguous memory, $O(1)$ random access, $O(n)$ search.\n- **Linked Lists**: Node-based pointers, $O(1)$ insertion/deletion at head.\n- **Stacks & Queues**: LIFO (Stack) and FIFO (Queue) access principles.\n- **Hash Tables**: Key-value mapping with average $O(1)$ lookup time.\n- **Trees & Graphs**: Hierarchical & network nodes (BST, Binary Heap, Trie, Graph Adjacency Lists).\n\n#### 2. Key Algorithm Paradigms:\n- **Sorting & Searching**: Binary Search ($O(\\log n)$), QuickSort, MergeSort ($O(n \\log n)$).\n- **Two Pointers & Sliding Window**: Optimized array scanning ($O(n)$).\n- **Recursion & Dynamic Programming**: Memoization and tabulation for overlapping subproblems.\n\n#### 💡 Recommendation:\nTry the **AI Quiz Arena** to test your DSA knowledge with practice questions!`;
    }

    if (query.includes('closure')) {
      return `### 💡 JavaScript Closures\n\nA **closure** gives an inner function access to its outer function's scope even after the outer function has executed.\n\n\`\`\`js\nfunction outer() {\n  let count = 0;\n  return function inner() {\n    count++;\n    return count;\n  };\n}\nconst counter = outer();\nconsole.log(counter()); // 1\nconsole.log(counter()); // 2\n\`\`\`\n\n**Why Use Closures?**\n- Encapsulation & private data variables\n- Event handlers & callback state retention\n- Functional programming (currying, memoization)`;
    }

    if (query.includes('async') || query.includes('promise') || query.includes('await')) {
      return `### ⚡ Async/Await & Promises in JavaScript\n\n- **Promises**: Objects representing asynchronous completion or failure.\n- **Async/Await**: Syntactic sugar making asynchronous code read like synchronous code.\n\n\`\`\`js\nasync function loadData() {\n  try {\n    const response = await fetch('/api/courses');\n    const data = await response.json();\n    console.log('Courses loaded:', data);\n  } catch (error) {\n    console.error('Failed to load:', error);\n  }\n}\n\`\`\``;
    }

    if (query.includes('react') || query.includes('hook') || query.includes('state')) {
      return `### ⚛️ React & State Management\n\nReact is a component-based UI library powered by a Virtual DOM.\n\n- **useState**: Manages local component state.\n- **useEffect**: Handles side effects (fetching data, subscriptions, DOM updates).\n- **useContext / Redux**: Manages global application state.\n\n\`\`\`jsx\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;\n}\n\`\`\``;
    }

    if (query === 'hi' || query === 'hello' || query === 'hey' || query.startsWith('hi') || query.startsWith('hello')) {
      return `Hello! 👋 Welcome to **LearnHub AI Tutor**!\n\nI'm ready to help you with your courses, code debugging, complex concepts, or exam preparation. Ask me anything!`;
    }

    // Dynamic fallback for any other unique topic
    return `### 💡 LearnHub AI Tutor — Guide on "${cleanMsg || 'this topic'}"\n\nHere is a structured explanation of **${cleanMsg || 'your topic'}**:\n\n1. **Core Concept**: Understanding ${cleanMsg || 'this topic'} involves breaking down requirements into clean, modular building blocks.\n2. **Key Best Practice**: Focus on clean syntax, high performance, and proper error handling.\n3. **Practical Tip**: Test your mastery using our **AI Quiz Arena** or generate instant **Flashcards**!`;
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

    const fallbackModels = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.8-27b'];
    const modelsToTry = [model, ...fallbackModels.filter((m) => m !== model)];

    let lastError = null;

    for (const currentModel of modelsToTry) {
      try {
        const options = {
          messages,
          model: currentModel,
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
            model: currentModel,
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
          model: currentModel,
          isFallback: false
        };
      } catch (error) {
        lastError = error;
        console.warn(`Groq request failed with model ${currentModel}: ${error.message}`);
        // If not a model error (e.g. rate limit, bad request, auth error), don't try other models
        if (!error.message?.includes('model') && !error.message?.includes('404')) {
          break;
        }
      }
    }

    const latencyMs = Date.now() - startTime;
    console.error(`💥 Groq API Error (${feature}):`, lastError?.message);

    if (userId) {
      AIUsageLog.create({
        user: userId,
        feature,
        model,
        latencyMs,
        status: 'error',
        error: lastError?.message
      }).catch(() => {});
    }

    // Smart Fallback — Dynamic topic answers
    return {
      content: this.generateSmartFallback(messages, jsonMode),
      isFallback: true,
      error: lastError?.message,
      model
    };
  }
}

module.exports = new GroqService();
