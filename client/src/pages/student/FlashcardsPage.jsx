import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { Sparkles, RotateCw, CheckCircle, BrainCircuit } from 'lucide-react';

export default function FlashcardsPage() {
  const [topic, setTopic] = useState('Data Structures & Big-O Notation');
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosClient.post('/ai/flashcards/generate', { topic, count: 5 });
      setCards(res.data?.data?.cards || []);
      setCurrentIndex(0);
      setIsFlipped(false);
      toast.success('Flashcard Deck Generated!');
    } catch (err) {
      toast.error('Flashcard generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRate = (quality) => {
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      toast.success('Flashcard Deck Review Completed!');
    }
  };

  const currentCard = cards[currentIndex];

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="card-paper bg-[#0B5D3B] text-white p-8 space-y-3 rounded-3xl shadow-soft border border-[#06452C]">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#DDF1E5] px-3.5 py-1 text-xs font-black text-[#0B5D3B]">
          <BrainCircuit className="h-3.5 w-3.5" />
          <span>SPACED REPETITION ENGINE</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">AI Flashcard Reviewer</h1>
        <p className="text-xs font-medium text-[#DDF1E5]">Generate flashcard decks automatically and review with SM-2 spaced repetition.</p>
      </div>

      <div className="card-paper p-6 bg-white border border-[#E2E5DF] rounded-3xl space-y-4 shadow-soft">
        <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Topic (e.g. JavaScript Async Closures)"
            className="flex-1 rounded-2xl border border-[#E2E5DF] bg-[#F8F7F0] p-3 text-xs font-semibold outline-none focus:border-[#0B5D3B] focus:bg-white transition"
          />
          <button type="submit" disabled={loading} className="btn-primary py-3 px-6 text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs">
            <Sparkles className="h-4 w-4" />
            <span>{loading ? 'Building...' : 'Generate Deck'}</span>
          </button>
        </form>
      </div>

      {cards.length > 0 && currentCard && (
        <div className="space-y-6">
          <div className="flex justify-between text-xs text-gray-500 font-bold">
            <span>Card {currentIndex + 1} of {cards.length}</span>
            <span className="capitalize badge-soft-info">{currentCard.difficulty || 'medium'}</span>
          </div>

          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="card-paper h-64 flex flex-col items-center justify-center text-center p-8 cursor-pointer hover:shadow-dropdown transition bg-white border-2 border-primary-main/30 space-y-4"
          >
            <span className="badge-soft-success text-xs font-bold uppercase">
              {isFlipped ? 'Back (Answer)' : 'Front (Question - Click to Flip)'}
            </span>
            <p className="text-xl font-extrabold text-gray-900 leading-snug">
              {isFlipped ? currentCard.back : currentCard.front}
            </p>
          </div>

          {isFlipped && (
            <div className="flex justify-center gap-3 pt-2">
              <button onClick={() => handleRate(1)} className="btn-secondary text-xs bg-error-light text-error-dark border-none hover:bg-error-light/80">
                Hard (Again)
              </button>
              <button onClick={() => handleRate(3)} className="btn-secondary text-xs bg-warning-light text-warning-dark border-none hover:bg-warning-light/80">
                Good
              </button>
              <button onClick={() => handleRate(5)} className="btn-primary text-xs bg-success-dark hover:bg-success-main border-none">
                Easy (Mastered)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
