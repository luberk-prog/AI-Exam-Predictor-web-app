import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Info, Target, Zap, Eye, Rocket, GraduationCap } from 'lucide-react';

interface AboutPageProps {
  onBack: () => void;
}

export default function AboutPage({ onBack }: AboutPageProps) {
  return (
    <div className="max-w-4xl mx-auto py-8 md:py-12 space-y-12 md:space-y-16 px-4 sm:px-6">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-[#5A5A40] dark:text-[#A8A878] font-sans font-bold hover:opacity-70 transition-opacity"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to App
      </button>

      <div className="space-y-4 md:space-y-6">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-[#5A5A40]/10 dark:bg-[#A8A878]/10 rounded-2xl md:rounded-3xl flex items-center justify-center text-[#5A5A40] dark:text-[#A8A878]">
          <GraduationCap className="w-8 h-8 md:w-10 md:h-10" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold dark:text-white tracking-tight">About AI Exam Predictor</h1>
        <p className="text-lg md:text-xl text-[#1a1a1a]/70 dark:text-white/70 leading-relaxed font-sans">
          AI Exam Predictor is an intelligent study platform designed to help students prepare for exams more efficiently.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        <div className="space-y-4 md:space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold dark:text-white">The Problem We Solve</h2>
          <p className="text-[#1a1a1a]/70 dark:text-white/70 leading-relaxed font-sans text-sm md:text-base">
            Traditional studying often involves reviewing large amounts of material without knowing which topics are most important. AI Exam Predictor solves this problem by using artificial intelligence to analyze past exam papers, lecture slides, course outlines, and study notes to identify patterns and predict the topics most likely to appear in upcoming exams.
          </p>
          <p className="text-[#1a1a1a]/70 dark:text-white/70 leading-relaxed font-sans text-sm md:text-base">
            By highlighting high-probability topics, repeated questions, and study priorities, the platform allows students to focus their time and energy where it matters most.
          </p>
        </div>
        <div className="bg-[#5A5A40]/5 dark:bg-[#A8A878]/5 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-[#5A5A40]/10 dark:border-[#A8A878]/10 flex flex-col justify-center">
          <Target className="w-10 h-10 md:w-12 md:h-12 text-[#5A5A40] dark:text-[#A8A878] mb-4 md:mb-6" />
          <h3 className="text-xl md:text-2xl font-bold dark:text-white mb-3 md:mb-4">Our Mission</h3>
          <p className="text-[#1a1a1a]/70 dark:text-white/70 font-sans italic text-sm md:text-base">
            "Our mission is simple: help students study smarter, save time, and perform better in exams."
          </p>
        </div>
      </div>

      <div className="space-y-8 md:space-y-12">
        <div className="text-center space-y-3 md:space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold dark:text-white">What Makes Us Different</h2>
          <p className="text-[#1a1a1a]/60 dark:text-white/60 font-sans text-sm md:text-base">AI Exam Predictor is designed to provide insights that traditional study tools cannot offer.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature, idx) => (
            <div key={idx} className="p-6 md:p-8 bg-white dark:bg-white/5 rounded-2xl md:rounded-3xl border border-black/5 dark:border-white/5 space-y-3 md:space-y-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#F5F5F0] dark:bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center text-[#5A5A40] dark:text-[#A8A878]">
                {feature.icon}
              </div>
              <h3 className="text-lg md:text-xl font-bold dark:text-white">{feature.title}</h3>
              <p className="text-xs md:text-sm font-sans opacity-60 dark:text-white/60 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6 md:space-y-8">
        <div className="flex items-center gap-3 md:gap-4">
          <Rocket className="w-6 h-6 md:w-8 md:h-8 text-[#5A5A40] dark:text-[#A8A878]" />
          <h2 className="text-3xl md:text-4xl font-bold dark:text-white">Our Vision</h2>
        </div>
        <div className="prose prose-slate dark:prose-invert max-w-none font-sans space-y-4 md:space-y-6 text-[#1a1a1a]/70 dark:text-white/70 text-sm md:text-base">
          <p>
            We believe technology can transform how students learn and prepare for exams.
          </p>
          <p>
            AI Exam Predictor is part of a larger vision to build AI-powered academic tools that help students learn faster, study more efficiently, and achieve better results.
          </p>
          <p>
            As the platform grows, we aim to introduce additional features such as:
          </p>
          <ul className="grid sm:grid-cols-2 gap-3 md:gap-4 list-none p-0">
            <li className="flex items-center gap-3 bg-black/5 dark:bg-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl">
              <Zap className="w-4 h-4 text-[#5A5A40] dark:text-[#A8A878]" />
              <span>AI-powered study planners</span>
            </li>
            <li className="flex items-center gap-3 bg-black/5 dark:bg-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl">
              <Zap className="w-4 h-4 text-[#5A5A40] dark:text-[#A8A878]" />
              <span>Automatic flashcard generation</span>
            </li>
            <li className="flex items-center gap-3 bg-black/5 dark:bg-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl">
              <Zap className="w-4 h-4 text-[#5A5A40] dark:text-[#A8A878]" />
              <span>Exam simulation tools</span>
            </li>
            <li className="flex items-center gap-3 bg-black/5 dark:bg-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl">
              <Zap className="w-4 h-4 text-[#5A5A40] dark:text-[#A8A878]" />
              <span>Collaborative study features</span>
            </li>
          </ul>
          <p className="text-lg md:text-xl font-bold text-[#1a1a1a] dark:text-white pt-4">
            Our long-term goal is to create the smartest study assistant for students worldwide.
          </p>
        </div>
      </div>

      <div className="pt-12 md:pt-16 border-t border-black/5 dark:border-white/5 space-y-8 md:space-y-12">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold dark:text-white">About the Founder</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none font-sans space-y-3 md:space-y-4 text-[#1a1a1a]/70 dark:text-white/70 text-sm md:text-base">
              <p>
                AI Exam Predictor was created by <span className="font-bold text-[#1a1a1a] dark:text-white">Emmanuel Amoh-Dawo</span>, a computer science student and technology enthusiast passionate about building tools that solve real-world problems.
              </p>
              <p>
                While preparing for exams, Emmanuel realized that students often spend countless hours studying without knowing which topics are most important. This inspired the creation of AI Exam Predictor — a platform designed to help students make better study decisions using data and artificial intelligence.
              </p>
              <p>
                The goal is to make studying more strategic, less stressful, and more effective for students everywhere.
              </p>
            </div>
          </div>
          <div className="relative group max-w-sm mx-auto md:max-w-none w-full">
            <div className="absolute -inset-4 bg-[#5A5A40]/10 dark:bg-[#A8A878]/10 rounded-[2.5rem] md:rounded-[3rem] blur-2xl group-hover:blur-3xl transition-all opacity-50"></div>
            <div className="relative aspect-[3/4] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-black/5 dark:border-white/10 shadow-2xl">
              <img 
                src="/founder.jpg" 
                alt="Emmanuel Amoh-Dawo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/founder/800/1067';
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-black dark:bg-white/5 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 text-white space-y-6 md:space-y-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4">Contact</h2>
          <p className="text-white/60 font-sans text-sm md:text-base">
            If you have questions, feedback, or collaboration opportunities, feel free to reach out. We're always looking for ways to improve the student experience.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-8 md:gap-12">
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-xs md:text-sm font-sans uppercase tracking-widest opacity-50">Phone</h3>
            <div className="space-y-1 md:space-y-2 text-xl md:text-2xl font-bold">
              <p>0205224056</p>
              <p>0534664043</p>
              <p>0558670560</p>
            </div>
          </div>
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-xs md:text-sm font-sans uppercase tracking-widest opacity-50">Email</h3>
            <div className="text-xl md:text-2xl font-bold">
              <p className="break-all">amohdawo123@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    title: "Exam Probability Analysis",
    description: "Identify the topics most likely to appear in an exam based on historical data.",
    icon: <Target className="w-6 h-6" />
  },
  {
    title: "Repeated Question Detection",
    description: "Discover questions that have appeared multiple times in past exams.",
    icon: <Zap className="w-6 h-6" />
  },
  {
    title: "Predicted Exam Questions",
    description: "AI-generated predictions based on historical exam patterns and course scope.",
    icon: <Eye className="w-6 h-6" />
  },
  {
    title: "Smart Study Priority List",
    description: "Know exactly what to study first to maximize your score potential.",
    icon: <Info className="w-6 h-6" />
  },
  {
    title: "Course Material Analysis",
    description: "Upload lecture slides, notes, and past questions for deep AI analysis.",
    icon: <GraduationCap className="w-6 h-6" />
  }
];
