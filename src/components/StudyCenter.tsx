import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { StudyMaterial, ChatMessage } from '../types';
import { BookOpen, Brain, MessageSquare, Play, ChevronRight, Sparkles, Loader2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { generateStudyMaterial, sendChatMessage } from '../services/studyService';

interface Props {
  courseId: string;
  topics: string[];
}

export default function StudyCenter({ courseId, topics }: Props) {
  const [activeTab, setActiveTab] = useState<'materials' | 'chat'>('materials');
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingTopic, setGeneratingTopic] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Generation Settings
  const [itemCount, setItemCount] = useState(15);
  const [difficulty, setDifficulty] = useState('Medium');

  useEffect(() => {
    const matUnsub = onSnapshot(
      query(collection(db, 'courses', courseId, 'studyMaterials'), orderBy('createdAt', 'desc')),
      (snap) => {
        setMaterials(snap.docs.map(d => ({ id: d.id, ...d.data() } as StudyMaterial)));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `courses/${courseId}/studyMaterials`)
    );

    const chatUnsub = onSnapshot(
      query(collection(db, 'courses', courseId, 'chat'), orderBy('createdAt', 'asc')),
      (snap) => {
        setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage)));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `courses/${courseId}/chat`)
    );

    return () => {
      matUnsub();
      chatUnsub();
    };
  }, [courseId]);

  const handleGenerate = async (topic: string) => {
    setGeneratingTopic(topic);
    try {
      await generateStudyMaterial(courseId, topic, "Context from exam papers provided in the course.", itemCount, difficulty);
    } catch (error) {
      console.error(error);
    } finally {
      setGeneratingTopic(null);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const text = chatInput;
    setChatInput('');
    setChatLoading(true);
    try {
      await sendChatMessage(courseId, text, messages);
    } catch (error) {
      console.error(error);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex gap-4 border-b border-black/10 dark:border-white/10">
        <button
          onClick={() => setActiveTab('materials')}
          className={`pb-4 px-2 text-sm font-sans font-bold transition-all relative ${
            activeTab === 'materials' ? 'text-[#5A5A40] dark:text-[#A8A878]' : 'text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/60'
          }`}
        >
          Study Materials
          {activeTab === 'materials' && (
            <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5A5A40] dark:bg-[#A8A878]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`pb-4 px-2 text-sm font-sans font-bold transition-all relative ${
            activeTab === 'chat' ? 'text-[#5A5A40] dark:text-[#A8A878]' : 'text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/60'
          }`}
        >
          Study Assistant
          {activeTab === 'chat' && (
            <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5A5A40] dark:bg-[#A8A878]" />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'materials' ? (
          <motion.div
            key="materials"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Topic List */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-[#1C1C1C] p-6 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm space-y-6">
                <h3 className="text-lg font-bold dark:text-white">Generation Settings</h3>
                
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 dark:text-white">Items Count ({itemCount})</label>
                  <input 
                    type="range" 
                    min="15" 
                    max="75" 
                    step="5"
                    value={itemCount}
                    onChange={(e) => setItemCount(parseInt(e.target.value))}
                    className="w-full accent-[#5A5A40] dark:accent-[#A8A878]"
                  />
                  <div className="flex justify-between text-[10px] font-bold opacity-40 dark:text-white">
                    <span>15</span>
                    <span>75</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 dark:text-white">Difficulty</label>
                  <div className="flex gap-2">
                    {['Easy', 'Medium', 'Hard'].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setDifficulty(lvl)}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all ${
                          difficulty === lvl ? 'bg-[#5A5A40] dark:bg-[#A8A878] text-white' : 'bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40 hover:bg-black/10 dark:hover:bg-white/10'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold dark:text-white">Predicted Topics</h3>
              <div className="space-y-2">
                {topics.map((topic) => {
                  const material = materials.find(m => m.topic === topic);
                  const isGenerating = generatingTopic === topic;

                  return (
                    <div
                      key={topic}
                      className={`p-4 rounded-2xl border transition-all ${
                        selectedMaterial?.topic === topic
                          ? 'bg-[#5A5A40] dark:bg-[#A8A878] text-white border-[#5A5A40] dark:border-[#A8A878]'
                          : 'bg-white dark:bg-[#1C1C1C] border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 dark:text-white'
                      }`}
                    >
                      <div className="flex justify-between items-center gap-3">
                        <span className="font-sans font-medium text-sm line-clamp-1">{topic}</span>
                        {material ? (
                          <button
                            onClick={() => setSelectedMaterial(material)}
                            className={`p-2 rounded-full transition-colors ${
                              selectedMaterial?.topic === topic ? 'bg-white/20 hover:bg-white/30' : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'
                            }`}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            disabled={isGenerating}
                            onClick={() => handleGenerate(topic)}
                            className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold bg-[#5A5A40] dark:bg-[#A8A878] text-white px-3 py-1.5 rounded-full hover:bg-[#4A4A30] dark:hover:bg-[#8A8A58] disabled:opacity-50"
                          >
                            {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            Generate
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Material Content */}
            <div className="lg:col-span-2">
              {selectedMaterial ? (
                <MaterialView material={selectedMaterial} />
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white/50 dark:bg-white/5 rounded-[2.5rem] border border-dashed border-black/10 dark:border-white/10 p-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-black/20 dark:text-white/20" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold dark:text-white">Select a topic to study</h3>
                    <p className="text-sm text-black/40 dark:text-white/40 font-sans max-w-xs">
                      Generate study materials for your predicted topics to start your exam preparation.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-[#1C1C1C] rounded-[2.5rem] border border-black/5 dark:border-white/5 overflow-hidden flex flex-col h-[600px]"
          >
            <div className="p-6 border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] flex items-center gap-3">
              <div className="w-10 h-10 bg-[#5A5A40] dark:bg-[#A8A878] rounded-2xl flex items-center justify-center text-white">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold dark:text-white">Study Assistant</h3>
                <p className="text-[10px] uppercase tracking-widest opacity-40 dark:text-white/40 font-bold">Powered by Gemini AI</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30 dark:text-white">
                  <Sparkles className="w-12 h-12" />
                  <p className="font-sans text-sm max-w-xs">Ask me anything about your course or the predicted topics!</p>
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-3xl font-sans text-sm ${
                      msg.role === 'user'
                        ? 'bg-[#5A5A40] dark:bg-[#A8A878] text-white rounded-tr-none'
                        : 'bg-black/5 dark:bg-white/5 text-[#1a1a1a] dark:text-white rounded-tl-none'
                    }`}
                  >
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed">
                      <ReactMarkdown>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-black/5 dark:bg-white/5 p-4 rounded-3xl rounded-tl-none">
                    <Loader2 className="w-4 h-4 animate-spin opacity-30 dark:text-white" />
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-6 border-t border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
              <div className="relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="w-full bg-white dark:bg-[#2A2A2A] border border-black/10 dark:border-white/10 rounded-full py-4 pl-6 pr-14 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 dark:focus:ring-[#A8A878]/20 transition-all dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || chatLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#5A5A40] dark:bg-[#A8A878] text-white rounded-full flex items-center justify-center hover:bg-[#4A4A30] dark:hover:bg-[#8A8A58] transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MaterialView({ material }: { material: StudyMaterial }) {
  const [view, setView] = useState<'notes' | 'flashcards' | 'quiz'>('notes');

  return (
    <div className="bg-white dark:bg-[#1C1C1C] rounded-[2.5rem] border border-black/5 dark:border-white/5 overflow-hidden flex flex-col min-h-[600px]">
      <div className="p-8 border-b border-black/5 dark:border-white/5 space-y-6">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold dark:text-white">{material.topic}</h3>
            <div className="flex items-center gap-2">
              <p className="text-sm text-black/40 dark:text-white/40 font-sans">Study materials generated for this topic</p>
              <span className="text-[10px] font-bold bg-[#5A5A40]/10 dark:bg-[#A8A878]/10 text-[#5A5A40] dark:text-[#A8A878] px-2 py-0.5 rounded-full uppercase tracking-tighter">
                {material.difficulty || 'Medium'}
              </span>
            </div>
          </div>
          {material.youtubeUrl && (
            <div className="flex flex-col items-end gap-2">
              <a
                href={material.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-full font-sans text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
              >
                <Play className="w-3 h-3 fill-current" />
                Watch Recommended Video
              </a>
              {material.youtubeVideoTitle && (
                <p className="text-[10px] font-sans font-medium opacity-40 dark:text-white/40 max-w-[200px] text-right truncate">
                  {material.youtubeVideoTitle}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-2xl w-fit">
          <button
            onClick={() => setView('notes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-sans font-bold transition-all ${
              view === 'notes' ? 'bg-white dark:bg-[#2A2A2A] shadow-sm text-[#5A5A40] dark:text-[#A8A878]' : 'text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/60'
            }`}
          >
            <BookOpen className="w-3 h-3" />
            Notes
          </button>
          <button
            onClick={() => setView('flashcards')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-sans font-bold transition-all ${
              view === 'flashcards' ? 'bg-white dark:bg-[#2A2A2A] shadow-sm text-[#5A5A40] dark:text-[#A8A878]' : 'text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/60'
            }`}
          >
            <Brain className="w-3 h-3" />
            Flashcards
          </button>
          <button
            onClick={() => setView('quiz')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-sans font-bold transition-all ${
              view === 'quiz' ? 'bg-white dark:bg-[#2A2A2A] shadow-sm text-[#5A5A40] dark:text-[#A8A878]' : 'text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/60'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            Quiz
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          {view === 'notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="prose prose-slate dark:prose-invert max-w-none font-sans">
                <ReactMarkdown>{material.notes}</ReactMarkdown>
              </div>
            </motion.div>
          )}

          {view === 'flashcards' && (
            <motion.div
              key="flashcards"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {material.flashcards.map((card) => (
                <FlashcardItem key={card.id} card={card} />
              ))}
            </motion.div>
          )}

          {view === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {material.quiz.map((q, i) => (
                <QuizItem key={q.id} question={q} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function FlashcardItem({ card }: { card: any }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      onClick={() => setIsFlipped(!isFlipped)}
      className="h-48 cursor-pointer perspective-1000"
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        className="relative w-full h-full preserve-3d"
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden bg-white dark:bg-[#2A2A2A] border border-black/5 dark:border-white/5 rounded-3xl p-6 flex items-center justify-center text-center">
          <p className="font-sans font-medium text-sm dark:text-white">{card.front}</p>
        </div>
        {/* Back */}
        <div className="absolute inset-0 backface-hidden bg-[#5A5A40] dark:bg-[#A8A878] text-white border border-[#5A5A40] dark:border-[#A8A878] rounded-3xl p-6 flex items-center justify-center text-center rotate-y-180">
          <p className="font-sans font-medium text-sm">{card.back}</p>
        </div>
      </motion.div>
    </div>
  );
}

function QuizItem({ question, index }: { question: any; index: number }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const isCorrect = selected === question.correctAnswer;

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <span className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center font-bold text-xs shrink-0 dark:text-white">
          {index + 1}
        </span>
        <p className="font-sans font-medium dark:text-white">{question.question}</p>
      </div>

      <div className="grid grid-cols-1 gap-2 pl-12">
        {question.options.map((option: string) => (
          <button
            key={option}
            onClick={() => {
              setSelected(option);
              setShowExplanation(true);
            }}
            className={`p-4 rounded-2xl border text-left font-sans text-sm transition-all ${
              selected === option
                ? option === question.correctAnswer
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                : 'bg-white dark:bg-[#2A2A2A] border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 dark:text-white'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {showExplanation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="pl-12"
        >
          <div className={`p-4 rounded-2xl font-sans text-xs leading-relaxed ${
            isCorrect ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
          }`}>
            <p className="font-bold mb-1">{isCorrect ? 'Correct!' : 'Incorrect'}</p>
            {question.explanation}
          </div>
        </motion.div>
      )}
    </div>
  );
}
