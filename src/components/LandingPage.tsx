import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Brain, Zap, Share2, ArrowRight } from 'lucide-react';

export default function LandingPage({ onStart, onViewSample }: { onStart: () => void, onViewSample: () => void }) {
  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="text-center space-y-8 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#5A5A40]/10 dark:bg-[#A8A878]/10 text-[#5A5A40] dark:text-[#A8A878] text-sm font-sans font-medium"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5A5A40] dark:bg-[#A8A878] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5A5A40] dark:bg-[#A8A878]"></span>
          </span>
          Trusted by GCTU Students
        </motion.div>
        
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-[0.9] max-w-4xl mx-auto dark:text-white">
          Study Smarter, <br />
          <span className="italic serif text-[#5A5A40] dark:text-[#A8A878]">Predict</span> Your Exams.
        </h1>
        
        <p className="text-xl text-[#1a1a1a]/60 dark:text-white/60 max-w-2xl mx-auto font-sans leading-relaxed">
          Stop studying everything. Our AI analyzes your past papers and lecture slides to predict exactly what will appear in your next exam.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button 
            onClick={onStart}
            className="group bg-[#1a1a1a] dark:bg-[#A8A878] text-white px-8 py-4 rounded-full font-sans font-semibold flex items-center gap-2 hover:bg-[#333] dark:hover:bg-[#8A8A58] transition-all shadow-lg"
          >
            Start Predicting Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={onViewSample}
            className="px-8 py-4 rounded-full font-sans font-semibold border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all dark:text-white"
          >
            View Sample Analysis
          </button>
        </div>

        <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto opacity-40 grayscale dark:invert">
          <div className="flex items-center justify-center gap-2 font-bold text-xl">GCTU</div>
          <div className="flex items-center justify-center gap-2 font-bold text-xl">KNUST</div>
          <div className="flex items-center justify-center gap-2 font-bold text-xl">UG</div>
          <div className="flex items-center justify-center gap-2 font-bold text-xl">UPSA</div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-3 gap-8">
        <FeatureCard 
          icon={<Brain className="w-6 h-6" />}
          title="AI Pattern Recognition"
          description="Detects recurring themes in past papers and emphasizes topics from your lecture slides."
        />
        <FeatureCard 
          icon={<Zap className="w-6 h-6" />}
          title="Probability Heatmap"
          description="Instantly see which topics have an 80%+ chance of appearing in your next paper."
        />
        <FeatureCard 
          icon={<Share2 className="w-6 h-6" />}
          title="Viral Sharing"
          description="Share your predictions with classmates via WhatsApp or direct link with one click."
        />
      </section>

      {/* Social Proof / Stats */}
      <section className="bg-white dark:bg-[#1C1C1C] rounded-[2rem] p-12 border border-black/5 dark:border-white/5 shadow-sm overflow-hidden relative">
        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold leading-tight dark:text-white">Built for the modern student.</h2>
            <p className="text-[#1a1a1a]/60 dark:text-white/60 font-sans">
              We know you're busy. AI Exam Predictor helps you prioritize your limited study time for maximum impact.
            </p>
            <div className="flex gap-12 pt-4">
              <div>
                <div className="text-3xl font-bold dark:text-white">94%</div>
                <div className="text-sm font-sans opacity-50 dark:text-white/40 uppercase tracking-wider">Accuracy</div>
              </div>
              <div>
                <div className="text-3xl font-bold dark:text-white">10k+</div>
                <div className="text-sm font-sans opacity-50 dark:text-white/40 uppercase tracking-wider">Students</div>
              </div>
            </div>
          </div>
          <div className="bg-[#F5F5F0] dark:bg-white/5 rounded-2xl p-6 border border-black/5 dark:border-white/5 rotate-2 shadow-inner">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-bold dark:text-white">Operating Systems</span>
                <span className="text-xs font-sans bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded">High Priority</span>
              </div>
              <div className="h-2 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#5A5A40] dark:bg-[#A8A878] w-[87%]" />
              </div>
              <div className="text-sm font-sans opacity-60 dark:text-white/60 italic">
                "CPU Scheduling has appeared in 4 out of the last 5 exams."
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 bg-white dark:bg-[#1C1C1C] rounded-3xl border border-black/5 dark:border-white/5 hover:shadow-md transition-all space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-[#F5F5F0] dark:bg-white/5 flex items-center justify-center text-[#5A5A40] dark:text-[#A8A878]">
        {icon}
      </div>
      <h3 className="text-xl font-bold dark:text-white">{title}</h3>
      <p className="text-[#1a1a1a]/60 dark:text-white/60 font-sans text-sm leading-relaxed">{description}</p>
    </div>
  );
}
