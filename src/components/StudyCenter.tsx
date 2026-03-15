import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { StudyMaterial, ChatMessage } from '../types';
import { BookOpen, Brain, MessageSquare, Play, ChevronRight, ChevronLeft, Sparkles, Loader2, Send, CheckCircle2, XCircle } from 'lucide-react';
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
              <div className="bg-white dark:bg-[#1C1C1C] p-5 md:p-6 rounded-2xl md:rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm space-y-4 md:space-y-6">
                <h3 className="text-base md:text-lg font-bold dark:text-white">Generation Settings</h3>
                
                <div className="space-y-2">
                  <label className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold opacity-40 dark:text-white">Items Count ({itemCount})</label>
                  <input 
                    type="range" 
                    min="15" 
                    max="75" 
                    step="5"
                    value={itemCount}
                    onChange={(e) => setItemCount(parseInt(e.target.value))}
                    className="w-full accent-[#5A5A40] dark:accent-[#A8A878]"
                  />
                  <div className="flex justify-between text-[9px] md:text-[10px] font-bold opacity-40 dark:text-white">
                    <span>15</span>
                    <span>75</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold opacity-40 dark:text-white">Difficulty</label>
                  <div className="flex gap-2">
                    {['Easy', 'Medium', 'Hard'].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setDifficulty(lvl)}
                        className={`flex-1 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-bold transition-all ${
                          difficulty === lvl ? 'bg-[#5A5A40] dark:bg-[#A8A878] text-white' : 'bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40 hover:bg-black/10 dark:hover:bg-white/10'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3 md:space-y-4">
                <h3 className="text-base md:text-lg font-bold dark:text-white px-1">Predicted Topics</h3>
              <div className="space-y-2">
                {topics.map((topic) => {
                  const material = materials.find(m => m.topic === topic);
                  const isGenerating = generatingTopic === topic;

                  return (
                    <div
                      key={topic}
                      className={`p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all ${
                        selectedMaterial?.topic === topic
                          ? 'bg-[#5A5A40] dark:bg-[#A8A878] text-white border-[#5A5A40] dark:border-[#A8A878]'
                          : 'bg-white dark:bg-[#1C1C1C] border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 dark:text-white'
                      }`}
                    >
                      <div className="flex justify-between items-center gap-3">
                        <span className="font-sans font-medium text-xs md:text-sm line-clamp-1">{topic}</span>
                        {material ? (
                          <button
                            onClick={() => setSelectedMaterial(material)}
                            className={`p-1.5 md:p-2 rounded-full transition-colors ${
                              selectedMaterial?.topic === topic ? 'bg-white/20 hover:bg-white/30' : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'
                            }`}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            disabled={isGenerating}
                            onClick={() => handleGenerate(topic)}
                            className="flex items-center gap-2 text-[9px] md:text-[10px] uppercase tracking-widest font-bold bg-[#5A5A40] dark:bg-[#A8A878] text-white px-2.5 md:px-3 py-1 md:py-1.5 rounded-full hover:bg-[#4A4A30] dark:hover:bg-[#8A8A58] disabled:opacity-50"
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
            className="bg-white dark:bg-[#1C1C1C] rounded-[1.5rem] md:rounded-[2.5rem] border border-black/5 dark:border-white/5 overflow-hidden flex flex-col h-[500px] md:h-[600px]"
          >
            <div className="p-4 md:p-6 border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-[#5A5A40] dark:bg-[#A8A878] rounded-xl md:rounded-2xl flex items-center justify-center text-white">
                <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div>
                <h3 className="text-sm md:text-base font-bold dark:text-white">Study Assistant</h3>
                <p className="text-[8px] md:text-[10px] uppercase tracking-widest opacity-40 dark:text-white/40 font-bold">Powered by Gemini AI</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30 dark:text-white">
                  <Sparkles className="w-10 h-10 md:w-12 md:h-12" />
                  <p className="font-sans text-xs md:text-sm max-w-[200px] md:max-w-xs">Ask me anything about your course or the predicted topics!</p>
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[80%] p-3 md:p-4 rounded-2xl md:rounded-3xl font-sans text-xs md:text-sm ${
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
                  <div className="bg-black/5 dark:bg-white/5 p-3 md:p-4 rounded-2xl md:rounded-3xl rounded-tl-none">
                    <Loader2 className="w-4 h-4 animate-spin opacity-30 dark:text-white" />
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 md:p-6 border-t border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
              <div className="relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="w-full bg-white dark:bg-[#2A2A2A] border border-black/10 dark:border-white/10 rounded-full py-3 md:py-4 pl-5 md:pl-6 pr-12 md:pr-14 font-sans text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 dark:focus:ring-[#A8A878]/20 transition-all dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || chatLoading}
                  className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-[#5A5A40] dark:bg-[#A8A878] text-white rounded-full flex items-center justify-center hover:bg-[#4A4A30] dark:hover:bg-[#8A8A58] transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
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
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const nextCard = () => {
    if (currentCardIndex < material.flashcards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1C1C1C] rounded-[1.5rem] md:rounded-[2.5rem] border border-black/5 dark:border-white/5 overflow-hidden flex flex-col min-h-[500px] md:min-h-[600px]">
      <div className="p-6 md:p-8 border-b border-black/5 dark:border-white/5 space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="space-y-1">
            <h3 className="text-xl md:text-2xl font-bold dark:text-white">{material.topic}</h3>
            <div className="flex items-center gap-2">
              <p className="text-xs md:text-sm text-black/40 dark:text-white/40 font-sans">Study materials generated</p>
              <span className="text-[9px] md:text-[10px] font-bold bg-[#5A5A40]/10 dark:bg-[#A8A878]/10 text-[#5A5A40] dark:text-[#A8A878] px-2 py-0.5 rounded-full uppercase tracking-tighter">
                {material.difficulty || 'Medium'}
              </span>
            </div>
          </div>
          {material.youtubeUrl && (
            <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
              <a
                href={material.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-full font-sans text-[10px] md:text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
              >
                <Play className="w-3 h-3 fill-current" />
                Watch Video
              </a>
              {material.youtubeVideoTitle && (
                <p className="text-[9px] md:text-[10px] font-sans font-medium opacity-40 dark:text-white/40 max-w-[200px] sm:text-right truncate hidden sm:block">
                  {material.youtubeVideoTitle}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-1.5 md:gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-xl md:rounded-2xl w-fit overflow-x-auto no-scrollbar">
          <button
            onClick={() => setView('notes')}
            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-sans font-bold transition-all whitespace-nowrap ${
              view === 'notes' ? 'bg-white dark:bg-[#2A2A2A] shadow-sm text-[#5A5A40] dark:text-[#A8A878]' : 'text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/60'
            }`}
          >
            <BookOpen className="w-3 h-3" />
            Notes
          </button>
          <button
            onClick={() => setView('flashcards')}
            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-sans font-bold transition-all whitespace-nowrap ${
              view === 'flashcards' ? 'bg-white dark:bg-[#2A2A2A] shadow-sm text-[#5A5A40] dark:text-[#A8A878]' : 'text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/60'
            }`}
          >
            <Brain className="w-3 h-3" />
            Flashcards
          </button>
          <button
            onClick={() => setView('quiz')}
            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-sans font-bold transition-all whitespace-nowrap ${
              view === 'quiz' ? 'bg-white dark:bg-[#2A2A2A] shadow-sm text-[#5A5A40] dark:text-[#A8A878]' : 'text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/60'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            Quiz
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
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
              className="h-full flex flex-col items-center justify-center space-y-8"
            >
              <div className="relative w-full max-w-md aspect-[4/3]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentCardIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <FlashcardItem 
                      card={material.flashcards[currentCardIndex]} 
                      onNext={nextCard}
                      isLast={currentCardIndex === material.flashcards.length - 1}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-6">
                <button
                  disabled={currentCardIndex === 0}
                  onClick={prevCard}
                  className="p-3 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 transition-all dark:text-white"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="text-sm font-sans font-bold opacity-40 dark:text-white">
                  {currentCardIndex + 1} / {material.flashcards.length}
                </div>
                <button
                  disabled={currentCardIndex === material.flashcards.length - 1}
                  onClick={nextCard}
                  className="p-3 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 transition-all dark:text-white"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          )}

          {view === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <QuizCarousel quiz={material.quiz} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function QuizCarousel({ quiz }: { quiz: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (option: string) => {
    setAnswers(prev => ({ ...prev, [currentIndex]: option }));
    if (currentIndex < quiz.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 500);
    } else {
      setTimeout(() => setShowResults(true), 500);
    }
  };

  const score = quiz.reduce((acc, q, i) => {
    return acc + (answers[i] === q.correctAnswer ? 1 : 0);
  }, 0);

  if (showResults) {
    const percentage = Math.round((score / quiz.length) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-full space-y-8 text-center"
      >
        <div className="relative w-32 h-32 md:w-48 md:h-48 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="50%" cy="50%" r="45%"
              className="stroke-black/5 dark:stroke-white/5 fill-none"
              strokeWidth="8"
            />
            <motion.circle
              cx="50%" cy="50%" r="45%"
              className="stroke-[#5A5A40] dark:stroke-[#A8A878] fill-none"
              strokeWidth="8"
              strokeDasharray="283"
              initial={{ strokeDashoffset: 283 }}
              animate={{ strokeDashoffset: 283 - (283 * percentage) / 100 }}
              transition={{ duration: 1, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl md:text-5xl font-bold dark:text-white">{percentage}%</span>
            <span className="text-[10px] md:text-xs font-sans font-bold opacity-40 uppercase tracking-widest dark:text-white">Score</span>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl md:text-2xl font-bold dark:text-white">Quiz Completed!</h3>
          <p className="text-sm md:text-base text-black/40 dark:text-white/40 font-sans">
            You got <span className="font-bold text-[#5A5A40] dark:text-[#A8A878]">{score}</span> out of <span className="font-bold">{quiz.length}</span> questions correct.
          </p>
        </div>

        <button
          onClick={() => {
            setAnswers({});
            setCurrentIndex(0);
            setShowResults(false);
          }}
          className="bg-[#5A5A40] dark:bg-[#A8A878] text-white dark:text-black px-8 py-3 rounded-full font-sans font-bold hover:opacity-90 transition-all flex items-center gap-2"
        >
          Try Again
          <Sparkles className="w-4 h-4" />
        </button>
      </motion.div>
    );
  }

  const currentQuestion = quiz[currentIndex];

  return (
    <div className="h-full flex flex-col space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[10px] md:text-xs font-sans font-bold text-[#5A5A40] dark:text-[#A8A878] uppercase tracking-widest">
            Question {currentIndex + 1} of {quiz.length}
          </span>
          <div className="h-1.5 w-48 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / quiz.length) * 100}%` }}
              className="h-full bg-[#5A5A40] dark:bg-[#A8A878]"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full space-y-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <h4 className="text-lg md:text-2xl font-bold leading-tight dark:text-white">
              {currentQuestion.question}
            </h4>

            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options.map((option: string) => {
                const isSelected = answers[currentIndex] === option;
                const isCorrect = option === currentQuestion.correctAnswer;
                const showFeedback = answers[currentIndex] !== undefined;

                return (
                  <button
                    key={option}
                    disabled={showFeedback}
                    onClick={() => handleAnswer(option)}
                    className={`
                      p-4 md:p-6 rounded-2xl border text-left font-sans text-sm md:text-base transition-all relative overflow-hidden
                      ${!showFeedback ? 'bg-white dark:bg-[#2A2A2A] border-black/5 dark:border-white/5 hover:border-[#5A5A40] dark:hover:border-[#A8A878] dark:text-white' : ''}
                      ${showFeedback && isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400' : ''}
                      ${showFeedback && isSelected && !isCorrect ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400' : ''}
                      ${showFeedback && !isSelected && !isCorrect ? 'bg-black/5 dark:bg-white/5 border-transparent opacity-40 dark:text-white' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {showFeedback && isCorrect && <CheckCircle2 className="w-5 h-5" />}
                      {showFeedback && isSelected && !isCorrect && <XCircle className="w-5 h-5" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {answers[currentIndex] !== undefined && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 md:p-6 rounded-2xl font-sans text-xs md:text-sm leading-relaxed ${
                  answers[currentIndex] === currentQuestion.correctAnswer 
                    ? 'bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400' 
                    : 'bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400'
                }`}
              >
                <p className="font-bold mb-1">
                  {answers[currentIndex] === currentQuestion.correctAnswer ? 'Correct!' : 'Incorrect'}
                </p>
                {currentQuestion.explanation}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between items-center pt-8 border-t border-black/5 dark:border-white/5">
        <button
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(prev => prev - 1)}
          className="flex items-center gap-2 text-xs font-sans font-bold opacity-40 hover:opacity-100 disabled:opacity-10 transition-all dark:text-white"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        <div className="text-[10px] font-sans font-bold opacity-20 dark:text-white uppercase tracking-widest">
          {currentIndex + 1} / {quiz.length}
        </div>
        <button
          disabled={currentIndex === quiz.length - 1 || answers[currentIndex] === undefined}
          onClick={() => setCurrentIndex(prev => prev + 1)}
          className="flex items-center gap-2 text-xs font-sans font-bold opacity-40 hover:opacity-100 disabled:opacity-10 transition-all dark:text-white"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function FlashcardItem({ card, onNext, isLast }: { card: any, onNext: () => void, isLast: boolean }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      onClick={() => setIsFlipped(!isFlipped)}
      className="w-full h-full cursor-pointer perspective-1000"
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        className="relative w-full h-full preserve-3d"
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden bg-white dark:bg-[#2A2A2A] border border-black/5 dark:border-white/5 rounded-2xl md:rounded-3xl p-6 md:p-10 flex flex-col items-center justify-center text-center shadow-sm">
          <span className="text-[10px] uppercase tracking-widest font-bold opacity-30 mb-4 dark:text-white">Question</span>
          <p className="font-sans font-bold text-sm md:text-lg dark:text-white">{card.front}</p>
          <p className="mt-8 text-[10px] font-sans font-bold opacity-20 dark:text-white">Click to flip</p>
        </div>
        {/* Back */}
        <div className="absolute inset-0 backface-hidden bg-[#5A5A40] dark:bg-[#A8A878] text-white border border-[#5A5A40] dark:border-[#A8A878] rounded-2xl md:rounded-3xl p-6 md:p-10 flex flex-col items-center justify-center text-center rotate-y-180 shadow-xl">
          <span className="text-[10px] uppercase tracking-widest font-bold opacity-50 mb-4">Answer</span>
          <p className="font-sans font-bold text-sm md:text-lg mb-8">{card.back}</p>
          
          {!isLast && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
                setIsFlipped(false);
              }}
              className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2"
            >
              Got it, next!
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

