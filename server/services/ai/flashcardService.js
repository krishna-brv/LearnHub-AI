const groqService = require('./groqService');
const FlashcardDeck = require('../../models/FlashcardDeck');
const Flashcard = require('../../models/Flashcard');
const Lesson = require('../../models/Lesson');
const AppError = require('../../utils/AppError');

class FlashcardService {
  /**
   * Generate AI Flashcard Deck from Topic or Lesson
   */
  async generateDeck({ userId, topic, lessonId, count = 10 }) {
    let sourceTopic = topic;

    if (lessonId) {
      const lesson = await Lesson.findById(lessonId);
      if (lesson) sourceTopic = `${lesson.title} - ${lesson.description || ''}`;
    }

    if (!sourceTopic) {
      throw new AppError('Topic or lesson ID is required to generate flashcards.', 400);
    }

    const messages = [
      {
        role: 'system',
        content: `You are an AI Spaced Repetition Study Assistant.
Generate ${count} concise, effective flashcards for the topic "${topic || sourceTopic}".

Return ONLY a valid JSON object matching this schema:
{
  "deckTitle": "Flashcard Deck Title",
  "cards": [
    {
      "front": "Front question/prompt?",
      "back": "Clear, concise back answer.",
      "difficulty": "medium",
      "tags": ["TopicTag"]
    }
  ]
}`
      },
      {
        role: 'user',
        content: `Generate ${count} flashcards for: ${sourceTopic}`
      }
    ];

    const result = await groqService.chatCompletion({
      messages,
      tier: 'fast',
      feature: 'flashcards',
      userId,
      jsonMode: true
    });

    let generatedData = { deckTitle: 'AI Generated Deck', cards: [] };
    try {
      generatedData = JSON.parse(result.content);
      if (!generatedData.cards || !Array.isArray(generatedData.cards) || generatedData.cards.length === 0) {
        throw new Error('Invalid cards array in AI response');
      }
    } catch (parseErr) {
      generatedData = {
        deckTitle: `Study Deck: ${topic}`,
        cards: [{ front: `What is ${topic}?`, back: 'Core definition and principles.', difficulty: 'medium' }]
      };
    }

    // Create Deck Document
    const deck = await FlashcardDeck.create({
      user: userId,
      title: generatedData.deckTitle || `Flashcard Deck: ${topic}`,
      source: 'ai_generated',
      sourceId: lessonId || null,
      sourceModel: lessonId ? 'Lesson' : null,
      cardCount: generatedData.cards ? generatedData.cards.length : 0,
      dueCards: generatedData.cards ? generatedData.cards.length : 0
    });

    // Create Individual Flashcards with initial SM-2 defaults
    const cardsToInsert = (generatedData.cards || []).map((card) => ({
      deck: deck._id,
      user: userId,
      front: card.front,
      back: card.back,
      difficulty: card.difficulty || 'medium',
      tags: card.tags || [],
      nextReviewAt: new Date(),
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
      status: 'new'
    }));

    const createdCards = await Flashcard.insertMany(cardsToInsert);

    return { deck, cardCount: createdCards.length, cards: createdCards };
  }
}

module.exports = new FlashcardService();
