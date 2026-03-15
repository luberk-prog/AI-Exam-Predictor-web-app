import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3, HelpCircle, ListOrdered, BookOpen, Clock, CheckCircle2, Share2, Download, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SampleAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_DATA = {
  courseName: "Operating Systems",
  university: "Ghana Communication Technology University",
  updatedAt: new Date().toISOString(),
  topics: [
    { name: "CPU Scheduling", probability: 92, priority: "High", reasoning: "Appeared in 4 out of the last 5 exams. Key focus in lecture slides 4-6." },
    { name: "Memory Management", probability: 85, priority: "High", reasoning: "Paging and Segmentation are recurring themes in past papers." },
    { name: "Deadlocks", probability: 65, priority: "Medium", reasoning: "Banker's algorithm is a common practical question." },
    { name: "Process Sync", probability: 45, priority: "Medium", reasoning: "Semaphores often appear as short-answer questions." },
    { name: "File Systems", probability: 25, priority: "Low", reasoning: "Lower frequency in recent years, but still mentioned in slides." }
  ],
  repeatedQuestions: [
    { question: "Explain the difference between Paging and Segmentation.", frequency: 4 },
    { question: "What is the Banker's Algorithm used for?", frequency: 3 },
    { question: "Define a Race Condition and how to prevent it.", frequency: 2 }
  ],
  questions: [
    { question: "Compare and contrast FCFS and Round Robin scheduling algorithms with examples.", explanation: "CPU scheduling is a high-priority topic with consistent appearance in past papers." },
    { question: "Describe the steps taken by the OS to handle a Page Fault.", explanation: "Memory management is a core concept that is frequently tested in detail." },
    { question: "What are the four necessary conditions for a Deadlock to occur?", explanation: "Deadlock conditions are a fundamental theoretical concept often asked in Section A." }
  ],
  studyPriority: [
    "Master CPU Scheduling Algorithms (FCFS, SJF, RR)",
    "Understand Paging and Virtual Memory concepts",
    "Practice Banker's Algorithm calculations",
    "Review Process Synchronization and Semaphores",
    "Briefly look over File System structures"
  ]
};

export default function SampleAnalysisModal({ isOpen, onClose }: SampleAnalysisModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'priority'>('overview');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="relative bg-[#F5F5F0] dark:bg-[#0A0A0A] w-full max-w-6xl h-full max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-black/10 dark:border-white/10"
          >
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-black/5 dark:border-white/10 flex justify-between items-center bg-white dark:bg-[#111]">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#5A5A40] dark:bg-[#A8A878] rounded-xl md:rounded-2xl flex items-center justify-center text-white dark:text-black">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg md:text-2xl font-bold dark:text-white leading-tight">{SAMPLE_DATA.courseName}</h2>
                    <span className="text-[8px] md:text-[10px] font-sans font-bold bg-[#5A5A40]/10 dark:bg-[#A8A878]/10 text-[#5A5A40] dark:text-[#A8A878] px-1.5 md:py-0.5 rounded uppercase tracking-wider">Sample</span>
                  </div>
                  <p className="text-[10px] md:text-sm font-sans opacity-50 dark:text-white/60 truncate max-w-[150px] md:max-w-none">{SAMPLE_DATA.university}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 md:p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors dark:text-white"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-4 md:space-y-6">
                  <div className="bg-white dark:bg-[#1C1C1C] rounded-2xl md:rounded-[2rem] p-2 md:p-4 border border-black/5 dark:border-white/5 shadow-sm flex lg:flex-col gap-2 overflow-x-auto no-scrollbar">
                    <TabButton 
                      active={activeTab === 'overview'} 
                      onClick={() => setActiveTab('overview')}
                      icon={<BarChart3 className="w-4 h-4 md:w-5 md:h-5" />}
                      label="Heatmap"
                    />
                    <TabButton 
                      active={activeTab === 'questions'} 
                      onClick={() => setActiveTab('questions')}
                      icon={<HelpCircle className="w-4 h-4 md:w-5 md:h-5" />}
                      label="Questions"
                    />
                    <TabButton 
                      active={activeTab === 'priority'} 
                      onClick={() => setActiveTab('priority')}
                      icon={<ListOrdered className="w-4 h-4 md:w-5 md:h-5" />}
                      label="Priority"
                    />
                  </div>

                  <div className="bg-[#1a1a1a] dark:bg-[#5A5A40] text-white rounded-2xl md:rounded-[2rem] p-6 md:p-8 space-y-4 md:space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-lg md:text-xl font-bold">Try it yourself</h3>
                      <p className="text-white/60 text-xs md:text-sm font-sans leading-relaxed">This is just a sample. Upload your own materials to get personalized predictions.</p>
                    </div>
                    <button 
                      onClick={onClose}
                      className="w-full bg-white dark:bg-[#A8A878] text-black py-3 md:py-4 rounded-xl md:rounded-2xl font-sans font-bold hover:opacity-90 transition-all text-sm md:text-base"
                    >
                      Get Started Now
                    </button>
                  </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6 md:space-y-8">
                  <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                      <motion.div 
                        key="overview"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6 md:space-y-8"
                      >
                        {/* Heatmap Chart */}
                        <div className="bg-white dark:bg-[#1C1C1C] rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 border border-black/5 dark:border-white/5 shadow-sm space-y-6 md:space-y-8">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg md:text-2xl font-bold dark:text-white">Probability Heatmap</h3>
                            <div className="flex items-center gap-2 text-[10px] md:text-xs font-sans opacity-50 dark:text-white">
                              <Clock className="w-3 h-3 md:w-4 md:h-4" />
                              Sample
                            </div>
                          </div>

                          <div className="h-[250px] md:h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={SAMPLE_DATA.topics} layout="vertical" margin={{ left: 0, right: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" className="dark:opacity-10" />
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis 
                                  dataKey="name" 
                                  type="category" 
                                  width={100} 
                                  tick={{ fontSize: 10, fontFamily: 'sans-serif', fontWeight: 600, fill: 'currentColor' }}
                                  className="dark:text-white/60"
                                />
                                <Tooltip 
                                  cursor={{ fill: '#f5f5f0', opacity: 0.1 }}
                                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#fff', color: '#000', fontSize: '12px' }}
                                />
                                <Bar dataKey="probability" radius={[0, 8, 8, 0]} barSize={24}>
                                  {SAMPLE_DATA.topics.map((entry, index) => (
                                    <Cell 
                                      key={`cell-${index}`} 
                                      fill={entry.priority === 'High' ? '#5A5A40' : entry.priority === 'Medium' ? '#8E8E6E' : '#C2C2B2'} 
                                    />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Topic Details */}
                        <div className="grid gap-3 md:gap-4">
                          {SAMPLE_DATA.topics.map((topic, idx) => (
                            <div key={idx} className="bg-white dark:bg-[#1C1C1C] p-4 md:p-6 rounded-2xl md:rounded-3xl border border-black/5 dark:border-white/5 flex items-start gap-4 md:gap-6">
                              <div className={`
                                w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex flex-col items-center justify-center flex-shrink-0
                                ${topic.priority === 'High' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : topic.priority === 'Medium' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'}
                              `}>
                                <span className="text-base md:text-xl font-bold leading-none">{topic.probability}%</span>
                                <span className="text-[7px] md:text-[8px] font-sans font-bold uppercase tracking-widest mt-1">Chance</span>
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-sm md:text-lg font-bold dark:text-white">{topic.name}</h4>
                                <p className="text-xs md:text-sm font-sans text-[#1a1a1a]/60 dark:text-white/60 leading-relaxed line-clamp-2 md:line-clamp-none">{topic.reasoning}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Repeated Questions */}
                        <div className="bg-white dark:bg-[#1C1C1C] rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 border border-black/5 dark:border-white/5 shadow-sm space-y-4 md:space-y-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg md:rounded-xl flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <h3 className="text-lg md:text-2xl font-bold dark:text-white">Repeated Questions</h3>
                          </div>
                          <div className="space-y-3 md:space-y-4">
                            {SAMPLE_DATA.repeatedQuestions.map((rq, idx) => (
                              <div key={idx} className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-[#F5F5F0] dark:bg-white/5 border border-black/5 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <span className="font-sans text-xs md:text-sm font-medium italic dark:text-white/80">"{rq.question}"</span>
                                <span className="text-[8px] md:text-[10px] font-sans font-bold bg-white dark:bg-[#2A2A2A] dark:text-white px-2 md:px-3 py-1 rounded-full shadow-sm border border-black/5 dark:border-white/5 whitespace-nowrap">
                                  {rq.frequency} TIMES
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'questions' && (
                      <motion.div 
                        key="questions"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4 md:space-y-6"
                      >
                        <div className="space-y-1 md:space-y-2">
                          <h3 className="text-xl md:text-3xl font-bold dark:text-white">Predicted Questions</h3>
                          <p className="text-xs md:text-sm text-[#1a1a1a]/60 dark:text-white/60 font-sans">Realistic exam questions generated by AI.</p>
                        </div>
                        <div className="grid gap-4 md:gap-6">
                          {SAMPLE_DATA.questions.map((q, idx) => (
                            <div key={idx} className="bg-white dark:bg-[#1C1C1C] p-6 md:p-8 rounded-2xl md:rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm space-y-3 md:space-y-4">
                              <div className="flex justify-between items-start">
                                <span className="text-[9px] md:text-xs font-sans font-bold text-[#5A5A40] dark:text-[#A8A878] uppercase tracking-widest bg-[#5A5A40]/5 dark:bg-[#A8A878]/5 px-2 md:px-3 py-1 rounded-full">
                                  Q{idx + 1}
                                </span>
                              </div>
                              <h4 className="text-base md:text-xl font-bold leading-tight dark:text-white">"{q.question}"</h4>
                              <div className="pt-3 md:pt-4 border-t border-black/5 dark:border-white/5">
                                <p className="text-xs md:text-sm font-sans text-[#1a1a1a]/60 dark:text-white/60 italic">
                                  <span className="font-bold not-italic text-[#5A5A40] dark:text-[#A8A878] mr-2">Why?</span>
                                  {q.explanation}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'priority' && (
                      <motion.div 
                        key="priority"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6 md:space-y-8"
                      >
                        <div className="bg-white dark:bg-[#1C1C1C] rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 border border-black/5 dark:border-white/5 shadow-sm space-y-6 md:space-y-8">
                          <div className="space-y-1 md:space-y-2">
                            <h3 className="text-xl md:text-3xl font-bold dark:text-white">Study Priority</h3>
                            <p className="text-xs md:text-sm text-[#1a1a1a]/60 dark:text-white/60 font-sans">Ranked study plan optimized for your exam.</p>
                          </div>
                          <div className="space-y-3 md:space-y-4">
                            {SAMPLE_DATA.studyPriority.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-3 md:gap-6 group">
                                <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-2xl bg-[#F5F5F0] dark:bg-white/5 group-hover:bg-[#5A5A40] dark:group-hover:bg-[#A8A878] group-hover:text-white transition-all flex items-center justify-center font-bold text-sm md:text-xl dark:text-white shrink-0">
                                  {idx + 1}
                                </div>
                                <div className="flex-1 p-3 md:p-5 rounded-xl md:rounded-2xl border border-black/5 dark:border-white/5 group-hover:border-[#5A5A40]/30 dark:group-hover:border-[#A8A878]/30 transition-all font-bold text-sm md:text-lg dark:text-white">
                                  {item}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`
        flex-shrink-0 lg:w-full flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl transition-all font-sans font-bold text-xs md:text-sm whitespace-nowrap
        ${active ? 'bg-[#5A5A40] dark:bg-[#A8A878] text-white shadow-lg' : 'hover:bg-black/5 dark:hover:bg-white/5 text-[#1a1a1a]/60 dark:text-white/60'}
      `}
    >
      {icon}
      {label}
    </button>
  );
}
