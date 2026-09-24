const groqService = require('./groqService');
const aiPromptService = require('./aiPromptService');
const AILearningPath = require('../../models/AILearningPath');
const User = require('../../models/User');
const AppError = require('../../utils/AppError');

class LearningPathService {
  /**
   * Generate or Get Active Learning Path for Student
   */
  async generateLearningPath(userId, requestData = {}) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    const careerGoal = requestData.careerGoal || user.studentProfile?.careerGoal || 'Full-Stack Software Engineer';
    const currentSkills = requestData.currentSkills || user.studentProfile?.skills || ['HTML', 'CSS', 'JavaScript'];
    const targetSkills = requestData.targetSkills || user.studentProfile?.targetSkills || [];
    const hoursPerDay = requestData.availableHoursPerDay || user.learningPreferences?.dailyStudyTime / 60 || 2;
    const difficultyPreference = requestData.difficultyPreference || user.learningPreferences?.difficultyPreference || 'mixed';

    const { systemPrompt } = aiPromptService.getLearningPathPrompt({
      careerGoal,
      currentSkills,
      targetSkills,
      hoursPerDay,
      difficultyPreference
    });

    const messages = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Target Career: ${careerGoal}
Current Skills: ${currentSkills.join(', ')}
Target Skills to Learn: ${targetSkills.length > 0 ? targetSkills.join(', ') : 'Core required skills for ' + careerGoal}
Available Daily Study Hours: ${hoursPerDay} hours/day
Difficulty Preference: ${difficultyPreference}`
      }
    ];

    // Request Groq Completion using PRIMARY_MODEL for complex reasoning
    const result = await groqService.chatCompletion({
      messages,
      tier: 'primary',
      feature: 'learning_path',
      userId,
      jsonMode: true
    });

    let pathData = {};
    try {
      let rawContent = (result.content || '').trim();
      rawContent = rawContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      
      // If there's extra text before/after the first '{' and last '}'
      const firstBrace = rawContent.indexOf('{');
      const lastBrace = rawContent.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        rawContent = rawContent.substring(firstBrace, lastBrace + 1);
      }

      pathData = JSON.parse(rawContent);
      if (!pathData || !pathData.roadmap || !Array.isArray(pathData.roadmap.phases) || pathData.roadmap.phases.length === 0) {
        throw new Error('AI output missing valid roadmap phases');
      }
    } catch (parseErr) {
      console.warn('⚠️ Could not parse Groq JSON response or missing phases, using domain-tailored fallback roadmap.');
      
      const isCsOrAlgo = /dsa|data structure|algorithm|cs|computer science/i.test(careerGoal);

      pathData = {
        roadmap: {
          phases: isCsOrAlgo ? [
            {
              name: `Phase 1: Foundations & Time/Space Complexity`,
              duration: '2 weeks',
              topics: [
                {
                  name: 'Big-O Notation & Analysis',
                  description: 'Understanding Time vs Space complexity, asymptotic notation, and recursion fundamentals.',
                  priority: 'must_learn',
                  estimatedHours: 15,
                  resources: ['CLRS Textbook', 'MIT OpenCourseWare']
                },
                {
                  name: 'Arrays, Strings & Pointers',
                  description: 'Two pointers, sliding window technique, matrix operations, and memory layouts.',
                  priority: 'must_learn',
                  estimatedHours: 15,
                  resources: ['LeetCode Pattern Guides']
                }
              ]
            },
            {
              name: `Phase 2: Linear Data Structures & Recursion`,
              duration: '3 weeks',
              topics: [
                {
                  name: 'Linked Lists, Stacks & Queues',
                  description: 'Singly/doubly linked lists, stack applications, monotonic stacks, and queues.',
                  priority: 'must_learn',
                  estimatedHours: 20,
                  resources: ['GeeksforGeeks', 'NeetCode']
                },
                {
                  name: 'Sorting & Searching Algorithms',
                  description: 'Binary search, merge sort, quicksort, heap sort, and custom comparator usage.',
                  priority: 'must_learn',
                  estimatedHours: 20,
                  resources: ['Algorithms Handbook']
                }
              ]
            },
            {
              name: `Phase 3: Non-Linear Structures (Trees, Graphs & Heaps)`,
              duration: '4 weeks',
              topics: [
                {
                  name: 'Binary Trees, BSTs & Tries',
                  description: 'Traversals (DFS/BFS), balance principles, BST operations, and prefix trees.',
                  priority: 'must_learn',
                  estimatedHours: 25,
                  resources: ['VisuAlgo', 'NeetCode 150']
                },
                {
                  name: 'Graph Traversal & Shortest Path',
                  description: 'BFS, DFS, Dijkstra, Bellman-Ford, Topological Sort, and Disjoint Set Union (DSU).',
                  priority: 'must_learn',
                  estimatedHours: 30,
                  resources: ['Graph Algorithms Guide']
                }
              ]
            },
            {
              name: `Phase 4: Advanced Problem Solving & Dynamic Programming`,
              duration: '3 weeks',
              topics: [
                {
                  name: 'Dynamic Programming & Memoization',
                  description: '1D/2D DP, 0/1 Knapsack, Longest Common Subsequence, and state transitions.',
                  priority: 'must_learn',
                  estimatedHours: 35,
                  resources: ['Dynamic Programming Patterns']
                },
                {
                  name: 'Greedy, Backtracking & Bit Manipulation',
                  description: 'N-Queens, Subset Generation, Greedy choices, and bitwise tricks.',
                  priority: 'should_learn',
                  estimatedHours: 20,
                  resources: ['Competitive Programming Handbook']
                }
              ]
            }
          ] : [
            {
              name: `Phase 1: Foundations & Core Environment for ${careerGoal}`,
              duration: '2 weeks',
              topics: [
                {
                  name: `Core ${careerGoal} Principles`,
                  description: `Essential foundational concepts, language features, and setup for ${careerGoal}.`,
                  priority: 'must_learn',
                  estimatedHours: 15,
                  resources: ['MDN Web Docs', 'Official Documentation']
                }
              ]
            },
            {
              name: `Phase 2: Key Frameworks & Practical Development`,
              duration: '3 weeks',
              topics: [
                {
                  name: `Primary ${careerGoal} Toolkits`,
                  description: `Deep dive into primary development libraries, APIs, and key patterns.`,
                  priority: 'must_learn',
                  estimatedHours: 25,
                  resources: ['Official Guides']
                }
              ]
            },
            {
              name: `Phase 3: Advanced Optimization & Best Practices`,
              duration: '4 weeks',
              topics: [
                {
                  name: 'Architecture & Performance Optimization',
                  description: 'Scalable structural patterns, security standards, and performance tuning.',
                  priority: 'should_learn',
                  estimatedHours: 30,
                  resources: ['Architecture Handbook']
                }
              ]
            }
          ]
        },
        weeklyMilestones: [
          { week: 1, goals: [`Master ${careerGoal} Foundations`], checkpoints: ['Fundamentals Quiz'] },
          { week: 2, goals: ['Solve Core Problems'], checkpoints: ['Problem Set 1'] },
          { week: 3, goals: ['Master Advanced Patterns'], checkpoints: ['Assessment 2'] }
        ],
        dailySchedule: { recommended: [{ day: 'Monday', topics: [`${careerGoal} Topic`], duration: 60 }] },
        revisionPlan: { intervals: ['Day 1', 'Day 7', 'Day 14'], weakTopicFocus: ['Core Patterns'] },
        practiceRecommendations: [`Solve practice problems in ${careerGoal}`]
      };
    }

    // Match roadmap.sh URLs strictly based on careerGoal
    const roadmapUrls = this.getRoadmapShUrls(careerGoal);

    // Set previous paths to regenerated
    await AILearningPath.updateMany({ user: userId, status: 'active' }, { status: 'regenerated' });

    // Save to Database
    const learningPathDoc = await AILearningPath.create({
      user: userId,
      careerGoal,
      currentSkills,
      targetSkills,
      availableHoursPerDay: hoursPerDay,
      difficultyPreference,
      roadmap: pathData.roadmap || {},
      weeklyMilestones: pathData.weeklyMilestones || [],
      dailySchedule: pathData.dailySchedule || {},
      revisionPlan: pathData.revisionPlan || {},
      practiceRecommendations: pathData.practiceRecommendations || [],
      roadmapUrl: roadmapUrls.directUrl,
      roadmapSearchUrl: roadmapUrls.searchUrl,
      status: 'active',
      progress: 0,
      promptVersion: process.env.AI_PROMPT_VERSION || 'v1.0',
      model: result.model
    });

    return learningPathDoc;
  }

  /**
   * Helper to derive valid roadmap.sh direct resource link strictly by career goal
   */
  getRoadmapShUrls(careerGoal = '') {
    const goal = (careerGoal || '').toLowerCase().trim();
    if (!goal) return { directUrl: 'https://roadmap.sh/roadmaps', searchUrl: 'https://roadmap.sh/roadmaps' };

    let directUrl = 'https://roadmap.sh/roadmaps'; // Official Dashboard fallback

    // 1. Role-based matching (specific order)
    if (goal.includes('backend') || goal.includes('back end') || goal.includes('node') || goal.includes('express') || goal.includes('java') || goal.includes('spring') || goal.includes('django') || goal.includes('fastapi') || goal.includes('nest')) {
      directUrl = 'https://roadmap.sh/backend';
    } else if (goal.includes('frontend') || goal.includes('front end') || goal.includes('react') || goal.includes('vue') || goal.includes('angular') || goal.includes('html') || goal.includes('css')) {
      directUrl = 'https://roadmap.sh/frontend';
    } else if (goal.includes('fullstack') || goal.includes('full-stack') || goal.includes('full stack') || goal.includes('mern') || goal.includes('mean') || goal.includes('software engineer') || goal.includes('software developer') || goal.includes('web developer')) {
      directUrl = 'https://roadmap.sh/full-stack';
    } else if (goal.includes('devops') || goal.includes('cloud') || goal.includes('aws') || goal.includes('kubernetes') || goal.includes('sre')) {
      directUrl = 'https://roadmap.sh/devops';
    } else if (goal.includes('ai') || goal.includes('data science') || goal.includes('machine learning') || goal.includes('data scientist') || goal.includes('artificial intelligence') || goal.includes('deep learning')) {
      directUrl = 'https://roadmap.sh/ai-data-scientist';
    } else if (goal.includes('data engineer') || goal.includes('etl') || goal.includes('big data')) {
      directUrl = 'https://roadmap.sh/data-engineer';
    } else if (goal.includes('android') || goal.includes('kotlin')) {
      directUrl = 'https://roadmap.sh/android';
    } else if (goal.includes('ios') || goal.includes('swift')) {
      directUrl = 'https://roadmap.sh/ios';
    } else if (goal.includes('cyber') || goal.includes('security') || goal.includes('hacker')) {
      directUrl = 'https://roadmap.sh/cyber-security';
    } else if (goal.includes('computer science') || goal.includes('cs') || goal.includes('dsa') || goal.includes('algorithm')) {
      directUrl = 'https://roadmap.sh/computer-science';
    } else if (goal.includes('system design') || goal.includes('architect')) {
      directUrl = 'https://roadmap.sh/system-design';
    } else if (goal.includes('qa') || goal.includes('test') || goal.includes('automation')) {
      directUrl = 'https://roadmap.sh/qa';
    } else if (goal.includes('ux') || goal.includes('ui') || goal.includes('design')) {
      directUrl = 'https://roadmap.sh/ux-design';
    } else if (goal.includes('game') || goal.includes('unity') || goal.includes('unreal')) {
      directUrl = 'https://roadmap.sh/game-developer';
    } else if (goal.includes('blockchain') || goal.includes('web3') || goal.includes('solidity')) {
      directUrl = 'https://roadmap.sh/blockchain';
    } else if (goal.includes('python')) {
      directUrl = 'https://roadmap.sh/python';
    } else if (goal.includes('javascript') || goal.includes('js')) {
      directUrl = 'https://roadmap.sh/javascript';
    } else if (goal.includes('typescript') || goal.includes('ts')) {
      directUrl = 'https://roadmap.sh/typescript';
    } else if (goal.includes('golang') || goal.includes('go')) {
      directUrl = 'https://roadmap.sh/golang';
    } else if (goal.includes('docker')) {
      directUrl = 'https://roadmap.sh/docker';
    } else if (goal.includes('sql') || goal.includes('postgres') || goal.includes('database')) {
      directUrl = 'https://roadmap.sh/sql';
    }

    return { directUrl, searchUrl: 'https://roadmap.sh' };
  }

  /**
   * Get Active Learning Path for User
   */
  async getActiveLearningPath(userId) {
    const pathDoc = await AILearningPath.findOne({ user: userId, status: 'active' })
      .sort({ generatedAt: -1 });

    return pathDoc;
  }
}

module.exports = new LearningPathService();
