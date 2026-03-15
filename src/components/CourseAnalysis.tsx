import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, collection, query, where, onSnapshot, addDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { Course, ExamAnalysis, PredictedQuestion, TopicProbability } from '../types';
import { ChevronLeft, Sparkles, AlertCircle, CheckCircle2, Share2, Download, Clock, BarChart3, ListOrdered, HelpCircle, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FileUpload from './FileUpload';
import StudyCenter from './StudyCenter';
import { extractTextFromFile } from '../services/fileService';
import { analyzeCourseMaterials } from '../services/aiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function CourseAnalysis({ courseId, onBack }: { courseId: string, onBack: () => void }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [analysis, setAnalysis] = useState<ExamAnalysis | null>(null);
  const [questions, setQuestions] = useState<PredictedQuestion[]>([]);
  const [lectureFiles, setLectureFiles] = useState<File[]>([]);
  const [assessmentFiles, setAssessmentFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'priority' | 'study'>('overview');

  useEffect(() => {
    const fetchCourse = async () => {
      const snap = await getDoc(doc(db, 'courses', courseId));
      if (snap.exists()) setCourse({ id: snap.id, ...snap.data() } as Course);
    };
    fetchCourse();

    const analysisUnsub = onSnapshot(doc(db, 'courses', courseId, 'analysis', 'latest'), (snap) => {
      if (snap.exists()) setAnalysis(snap.data() as ExamAnalysis);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `courses/${courseId}/analysis/latest`);
    });

    const questionsUnsub = onSnapshot(collection(db, 'courses', courseId, 'questions'), (snap) => {
      const qList = snap.docs.map(d => ({ id: d.id, ...d.data() } as PredictedQuestion));
      setQuestions(qList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `courses/${courseId}/questions`);
    });

    return () => {
      analysisUnsub();
      questionsUnsub();
    };
  }, [courseId]);

  const handleRunAnalysis = async () => {
    if (lectureFiles.length === 0 && assessmentFiles.length === 0) {
      setError('Please upload at least one file to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      let combinedText = '';
      
      if (lectureFiles.length > 0) {
        combinedText += "\n=== LECTURE MATERIALS & NOTES ===\n";
        for (const file of lectureFiles) {
          const text = await extractTextFromFile(file);
          combinedText += `\n--- FILE: ${file.name} ---\n${text}\n`;
        }
      }

      if (assessmentFiles.length > 0) {
        combinedText += "\n=== PAST PAPERS, ASSIGNMENTS & MIDSEMS ===\n";
        for (const file of assessmentFiles) {
          const text = await extractTextFromFile(file);
          combinedText += `\n--- FILE: ${file.name} ---\n${text}\n`;
        }
      }

      const result = await analyzeCourseMaterials(course?.name || 'Course', combinedText);

      // Save analysis
      await setDoc(doc(db, 'courses', courseId, 'analysis', 'latest'), {
        ...result.analysis,
        courseId,
        updatedAt: new Date().toISOString(),
      });

      // Clear old questions and save new ones
      for (const q of result.questions) {
        await addDoc(collection(db, 'courses', courseId, 'questions'), {
          ...q,
          courseId,
          createdAt: new Date().toISOString(),
        });
      }

      setLectureFiles([]);
      setAssessmentFiles([]);
    } catch (err: any) {
      console.error(err);
      setError('Analysis failed. Please try again later.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sharePrediction = () => {
    const text = `Check out my AI Exam Predictions for ${course?.name}! 🚀\nTop Topic: ${analysis?.topics[0]?.name} (${analysis?.topics[0]?.probability}% probability)`;
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({ title: 'AI Exam Predictions', text, url });
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`);
      alert('Link copied to clipboard!');
    }
  };

  const downloadAnalysis = () => {
    if (!analysis) return;

    let content = `EXAM PREDICTION ANALYSIS: ${course?.name}\n`;
    content += `University: ${course?.university}\n`;
    content += `Generated on: ${new Date(analysis.updatedAt).toLocaleString()}\n\n`;
    
    content += `=== TOP TOPICS ===\n`;
    analysis.topics.forEach((t, i) => {
      content += `${i + 1}. ${t.name} (${t.probability}% Probability)\n`;
      content += `   Priority: ${t.priority}\n`;
      content += `   Reasoning: ${t.reasoning}\n\n`;
    });

    content += `=== PREDICTED QUESTIONS ===\n`;
    questions.forEach((q, i) => {
      content += `Q${i + 1}: ${q.question}\n`;
      content += `Explanation: ${q.explanation}\n\n`;
    });

    content += `=== REPEATED QUESTIONS ===\n`;
    analysis.repeatedQuestions.forEach((rq) => {
      content += `- "${rq.question}" (Appeared ${rq.frequency} times)\n`;
    });

    content += `\n=== STUDY PRIORITY ===\n`;
    analysis.studyPriority.forEach((p, i) => {
      content += `${i + 1}. ${p}\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${course?.name.replace(/\s+/g, '_')}_Exam_Analysis.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!course) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors dark:text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold dark:text-white">{course.name}</h1>
            <p className="text-[10px] md:text-sm font-sans opacity-50 uppercase tracking-widest dark:text-white">{course.university}</p>
          </div>
        </div>
      </div>

      {!analysis && !isAnalyzing ? (
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 py-6 md:py-12">
          <div className="text-center space-y-2 md:space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold dark:text-white">Ready to Predict?</h2>
            <p className="text-sm md:text-base text-[#1a1a1a]/60 dark:text-white/60 font-sans">Upload your materials and let our AI find the patterns.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-3 md:space-y-4">
              <h3 className="text-[10px] md:text-sm font-sans font-bold uppercase tracking-widest opacity-50 dark:text-white/50 px-2">Lecture Resources</h3>
              <FileUpload 
                files={lectureFiles} 
                onFilesAdded={(newFiles) => setLectureFiles([...lectureFiles, ...newFiles])}
                onRemoveFile={(idx) => setLectureFiles(lectureFiles.filter((_, i) => i !== idx))}
                label="Lecture Notes & Slides"
                description="Upload your handouts, slides, and personal notes."
                icon={<BookOpen className="w-6 h-6" />}
              />
            </div>

            <div className="space-y-3 md:space-y-4">
              <h3 className="text-[10px] md:text-sm font-sans font-bold uppercase tracking-widest opacity-50 dark:text-white/50 px-2">Assessment Resources</h3>
              <FileUpload 
                files={assessmentFiles} 
                onFilesAdded={(newFiles) => setAssessmentFiles([...assessmentFiles, ...newFiles])}
                onRemoveFile={(idx) => setAssessmentFiles(assessmentFiles.filter((_, i) => i !== idx))}
                label="Past Papers & Assignments"
                description="Upload past questions, midsems, and assignments."
                icon={<ListOrdered className="w-6 h-6" />}
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-3 font-sans text-sm border border-red-100 dark:border-red-800">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <button 
            onClick={handleRunAnalysis}
            disabled={isAnalyzing || (lectureFiles.length === 0 && assessmentFiles.length === 0)}
            className="w-full bg-[#1a1a1a] dark:bg-[#A8A878] text-white py-4 md:py-5 rounded-2xl md:rounded-[2rem] font-sans font-bold text-base md:text-lg flex items-center justify-center gap-3 hover:bg-[#333] dark:hover:bg-[#8A8A58] transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
            Analyze Exam Materials
          </button>
        </div>
      ) : isAnalyzing ? (
        <div className="max-w-2xl mx-auto py-12 md:py-24 text-center space-y-6 md:space-y-8">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 md:w-24 md:h-24 bg-[#5A5A40]/10 dark:bg-[#A8A878]/10 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center mx-auto text-[#5A5A40] dark:text-[#A8A878]"
          >
            <Sparkles className="w-10 h-10 md:w-12 md:h-12" />
          </motion.div>
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold dark:text-white">Analyzing Patterns...</h2>
            <p className="text-sm md:text-base text-[#1a1a1a]/60 dark:text-white/60 font-sans">Our AI is scanning past papers and lecture notes.</p>
          </div>
          <div className="max-w-xs mx-auto space-y-4">
            <div className="h-2 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="h-full bg-[#5A5A40] dark:bg-[#A8A878] w-1/2"
              />
            </div>
            <div className="flex justify-between text-[8px] md:text-[10px] font-sans font-bold uppercase tracking-widest opacity-40 dark:text-white/40">
              <span>Extracting Text</span>
              <span>Predicting Topics</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-[#1C1C1C] rounded-[1.5rem] md:rounded-[2rem] p-2 md:p-4 border border-black/5 dark:border-white/5 shadow-sm flex lg:flex-col overflow-x-auto lg:overflow-x-visible no-scrollbar gap-2">
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
              <TabButton 
                active={activeTab === 'study'} 
                onClick={() => setActiveTab('study')}
                icon={<BookOpen className="w-4 h-4 md:w-5 md:h-5" />}
                label="Study"
              />
            </div>

            <div className="bg-[#1a1a1a] dark:bg-[#5A5A40] text-white rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 space-y-4 md:space-y-6">
              <div className="space-y-1 md:space-y-2">
                <h3 className="text-lg md:text-xl font-bold">Share Predictions</h3>
                <p className="text-white/60 text-xs md:text-sm font-sans">Help your classmates study smarter too.</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={sharePrediction}
                  className="flex-1 bg-white/10 hover:bg-white/20 p-3 md:p-4 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 transition-all"
                >
                  <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-xs md:text-sm font-sans font-bold">Share</span>
                </button>
                <button 
                  onClick={downloadAnalysis}
                  className="p-3 md:p-4 bg-white/10 hover:bg-white/20 rounded-xl md:rounded-2xl transition-all"
                  title="Download Analysis"
                >
                  <Download className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div 
                  key="overview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  {/* Heatmap Chart */}
                  <div className="bg-white dark:bg-[#1C1C1C] rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 border border-black/5 dark:border-white/5 shadow-sm space-y-6 md:space-y-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <h3 className="text-xl md:text-2xl font-bold dark:text-white">Exam Probability Heatmap</h3>
                      <div className="flex items-center gap-2 text-[10px] md:text-xs font-sans opacity-50 dark:text-white">
                        <Clock className="w-3 h-3 md:w-4 md:h-4" />
                        Updated {new Date(analysis?.updatedAt || '').toLocaleDateString()}
                      </div>
                    </div>

                    <div className="h-[250px] md:h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analysis?.topics} layout="vertical" margin={{ left: 0, right: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" className="dark:opacity-10" />
                          <XAxis type="number" domain={[0, 100]} hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={80} 
                            tick={{ fontSize: 10, fontFamily: 'sans-serif', fontWeight: 600, fill: 'currentColor' }}
                            className="dark:text-white/60"
                          />
                          <Tooltip 
                            cursor={{ fill: '#f5f5f0', opacity: 0.1 }}
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tooltip-bg, #fff)', color: 'var(--tooltip-text, #000)' }}
                          />
                          <Bar dataKey="probability" radius={[0, 10, 10, 0]} barSize={32}>
                            {analysis?.topics.map((entry, index) => (
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
                    {analysis?.topics.map((topic, idx) => (
                      <div key={idx} className="bg-white dark:bg-[#1C1C1C] p-4 md:p-6 rounded-2xl md:rounded-3xl border border-black/5 dark:border-white/5 flex items-start gap-4 md:gap-6">
                        <div className={`
                          w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex flex-col items-center justify-center flex-shrink-0
                          ${topic.priority === 'High' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : topic.priority === 'Medium' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'}
                        `}>
                          <span className="text-lg md:text-xl font-bold leading-none">{topic.probability}%</span>
                          <span className="text-[7px] md:text-[8px] font-sans font-bold uppercase tracking-widest mt-1">Chance</span>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-base md:text-lg font-bold dark:text-white">{topic.name}</h4>
                          <p className="text-xs md:text-sm font-sans text-[#1a1a1a]/60 dark:text-white/60 leading-relaxed">{topic.reasoning}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Repeated Questions */}
                  <div className="bg-white dark:bg-[#1C1C1C] rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 border border-black/5 dark:border-white/5 shadow-sm space-y-4 md:space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg md:rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold dark:text-white">Repeated Question Detector</h3>
                    </div>
                    <div className="space-y-3 md:space-y-4">
                      {analysis?.repeatedQuestions.map((rq, idx) => (
                        <div key={idx} className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-[#F5F5F0] dark:bg-white/5 border border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                          <span className="font-sans text-xs md:text-sm font-medium italic dark:text-white/80">"{rq.question}"</span>
                          <span className="text-[8px] md:text-[10px] font-sans font-bold bg-white dark:bg-[#2A2A2A] dark:text-white px-3 py-1 rounded-full shadow-sm border border-black/5 dark:border-white/5 self-start sm:self-auto">
                            APPEARED {rq.frequency} TIMES
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
                    <h3 className="text-2xl md:text-3xl font-bold dark:text-white">Predicted Exam Questions</h3>
                    <p className="text-xs md:text-sm text-[#1a1a1a]/60 dark:text-white/60 font-sans">Realistic questions generated by AI based on your materials.</p>
                  </div>
                  <div className="grid gap-4 md:gap-6">
                    {questions.map((q, idx) => (
                      <div key={idx} className="bg-white dark:bg-[#1C1C1C] p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm space-y-3 md:space-y-4">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] md:text-xs font-sans font-bold text-[#5A5A40] dark:text-[#A8A878] uppercase tracking-widest bg-[#5A5A40]/5 dark:bg-[#A8A878]/5 px-3 py-1 rounded-full">
                            Question {idx + 1}
                          </span>
                        </div>
                        <h4 className="text-lg md:text-xl font-bold leading-tight dark:text-white">"{q.question}"</h4>
                        <div className="pt-3 md:pt-4 border-t border-black/5 dark:border-white/5">
                          <p className="text-xs md:text-sm font-sans text-[#1a1a1a]/60 dark:text-white/60 italic">
                            <span className="font-bold not-italic text-[#5A5A40] dark:text-[#A8A878] mr-2">Why this?</span>
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
                  <div className="bg-white dark:bg-[#1C1C1C] rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 border border-black/5 dark:border-white/5 shadow-sm space-y-6 md:space-y-8">
                    <div className="space-y-1 md:space-y-2">
                      <h3 className="text-2xl md:text-3xl font-bold dark:text-white">Study Priority Engine</h3>
                      <p className="text-xs md:text-sm text-[#1a1a1a]/60 dark:text-white/60 font-sans">A ranked study plan optimized for your exam.</p>
                    </div>
                    <div className="space-y-3 md:space-y-4">
                      {analysis?.studyPriority.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 md:gap-6 group">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex-shrink-0 bg-[#F5F5F0] dark:bg-white/5 group-hover:bg-[#5A5A40] dark:group-hover:bg-[#A8A878] group-hover:text-white transition-all flex items-center justify-center font-bold text-lg md:text-xl dark:text-white">
                            {idx + 1}
                          </div>
                          <div className="flex-1 p-4 md:p-5 rounded-xl md:rounded-2xl border border-black/5 dark:border-white/5 group-hover:border-[#5A5A40]/30 dark:group-hover:border-[#A8A878]/30 transition-all font-bold text-base md:text-lg dark:text-white">
                            {item}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'study' && (
                <motion.div 
                  key="study"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <StudyCenter 
                    courseId={courseId} 
                    topics={analysis?.topics.map(t => t.name) || []} 
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
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
