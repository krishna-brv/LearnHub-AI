const groqService = require('./groqService');
const Note = require('../../models/Note');
const Lesson = require('../../models/Lesson');
const AppError = require('../../utils/AppError');

class SmartNotesService {
  /**
   * Generate AI Summary & Key Takeaways for a Note or Lesson Content
   */
  async generateSmartNote({ userId, content, lessonId, noteId }) {
    let sourceContent = content;

    if (!sourceContent && lessonId) {
      const lesson = await Lesson.findById(lessonId);
      if (lesson && lesson.content) {
        sourceContent = lesson.content.text || lesson.description || lesson.title;
      }
    }

    if (!sourceContent) {
      throw new AppError('Content or lesson text is required to generate smart notes.', 400);
    }

    const messages = [
      {
        role: 'system',
        content: `You are an AI Knowledge Base Summarizer.
Analyze the text and return ONLY a valid JSON object:
{
  "title": "Concise Note Title",
  "summary": "High-level summary paragraph",
  "keyTakeaways": ["Bullet point 1", "Bullet point 2"],
  "codeSnippet": "Key code snippet if applicable or empty string",
  "tags": ["JavaScript", "Async"]
}`
      },
      {
        role: 'user',
        content: `Summarize this learning content:\n\n${sourceContent}`
      }
    ];

    const result = await groqService.chatCompletion({
      messages,
      tier: 'fast',
      feature: 'smart_notes',
      userId,
      jsonMode: true
    });

    let noteData = {};
    try {
      noteData = JSON.parse(result.content);
    } catch (parseErr) {
      noteData = {
        title: 'Learning Notes Summary',
        summary: 'Key concepts summary.',
        keyTakeaways: ['Review core material'],
        tags: ['Study']
      };
    }

    // Save as Note in User Knowledge Base if noteId not provided
    let note;
    if (noteId) {
      note = await Note.findOneAndUpdate(
        { _id: noteId, user: userId },
        {
          aiSummary: noteData.summary,
          aiSummaryGeneratedAt: new Date()
        },
        { new: true }
      );
    } else {
      note = await Note.create({
        user: userId,
        title: noteData.title || 'AI Smart Note',
        content: `## Summary\n${noteData.summary}\n\n## Key Takeaways\n${(noteData.keyTakeaways || []).map((k) => `- ${k}`).join('\n')}\n\n${noteData.codeSnippet ? '```javascript\n' + noteData.codeSnippet + '\n```' : ''}`,
        tags: noteData.tags || ['ai-generated'],
        folder: 'AI Summaries',
        lesson: lessonId || null,
        aiSummary: noteData.summary,
        aiSummaryGeneratedAt: new Date()
      });
    }

    return { note, noteData };
  }
}

module.exports = new SmartNotesService();
