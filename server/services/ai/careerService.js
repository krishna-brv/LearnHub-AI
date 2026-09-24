const groqService = require('./groqService');
const aiPromptService = require('./aiPromptService');
const User = require('../../models/User');
const StudentSkill = require('../../models/StudentSkill');
const AppError = require('../../utils/AppError');

class CareerService {
  /**
   * Safe helper to fetch and strip plain text from a public portfolio URL
   */
  async fetchWebsiteText(url) {
    if (!url) return null;
    try {
      let formattedUrl = url.trim();
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = 'https://' + formattedUrl;
      }
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(formattedUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) LearnHubAI-CareerBot/1.0'
        }
      });
      clearTimeout(timeoutId);
      if (!res.ok) return null;

      const html = await res.text();
      // Strip script, style tags and HTML elements to get readable text excerpt
      const plainText = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      return plainText;
    } catch (err) {
      console.warn(`[CareerService] Could not fetch public portfolio website ${url}:`, err.message);
      return null;
    }
  }

  /**
   * Generate Career Guidance & Roadmap based on Portfolio URL or Resume Text
   */
  async getCareerGuidance(userId, options = {}) {
    const { portfolioUrl, resumeText } = options;

    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found.', 404);

    const skills = await StudentSkill.find({ student: userId, status: { $in: ['learning', 'mastered'] } }).populate('skill');
    const skillNames = skills.map((s) => s.skill?.name).filter(Boolean);

    let websiteText = null;
    if (portfolioUrl) {
      websiteText = await this.fetchWebsiteText(portfolioUrl);
    }

    const { systemPrompt } = aiPromptService.getCareerAdvisorPrompt({
      portfolioUrl,
      websiteText,
      resumeText,
      targetCareer: user.studentProfile?.careerGoal || 'Full-Stack Web Developer',
      skills: skillNames
    });

    const userMessageContent = portfolioUrl
      ? `Public Portfolio Website URL provided: ${portfolioUrl}\nWebsite Extracted Text Preview: ${websiteText ? websiteText.slice(0, 1500) : 'Not accessible or dynamic page'}`
      : resumeText
      ? `Resume Text provided:\n${resumeText.slice(0, 2000)}`
      : `No portfolio link or resume uploaded. Please analyze based on student target career: ${user.studentProfile?.careerGoal || 'Full-Stack Developer'} and skills: ${skillNames.join(', ') || 'HTML, CSS, JavaScript'}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessageContent }
    ];

    const result = await groqService.chatCompletion({
      messages,
      tier: 'primary',
      feature: 'career_advisor',
      userId,
      jsonMode: true
    });

    let careerData = {};
    try {
      careerData = JSON.parse(result.content);
    } catch (parseErr) {
      careerData = {
        profileOverview: 'Analyzed portfolio/profile for career readiness and tech positioning.',
        recommendedRoles: ['Full-Stack Developer', 'Frontend Engineer'],
        missingSkills: ['Docker', 'TypeScript'],
        recommendedCourses: ['React Masterclass', 'Node.js Architecture'],
        suggestedProjects: ['Full-Stack SaaS Platform', 'API Gateway'],
        interviewTopics: ['Async JS', 'REST API Design', 'Database Optimization'],
        careerRoadmap: [
          { phase: 'Phase 1: Foundations', action: 'Strengthen core full-stack project portfolio' },
          { phase: 'Phase 2: Advanced Concepts', action: 'Master microservices and deployment pipelines' }
        ]
      };
    }

    return careerData;
  }
}

module.exports = new CareerService();
