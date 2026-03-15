import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Brain, Zap, Share2, ArrowRight } from 'lucide-react';

export default function LandingPage({ onStart, onViewSample }: { onStart: () => void, onViewSample: () => void }) {
  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="text-center space-y-6 md:space-y-8 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full bg-[#5A5A40]/10 dark:bg-[#A8A878]/10 text-[#5A5A40] dark:text-[#A8A878] text-xs md:text-sm font-sans font-medium"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5A5A40] dark:bg-[#A8A878] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5A5A40] dark:bg-[#A8A878]"></span>
          </span>
          Trusted by GCTU Students
        </motion.div>
        
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-tight leading-[1.1] md:leading-[0.9] max-w-4xl mx-auto dark:text-white">
          Study Smarter, <br />
          <span className="italic serif text-[#5A5A40] dark:text-[#A8A878]">Predict</span> Your Exams.
        </h1>
        
        <p className="text-base md:text-xl text-[#1a1a1a]/60 dark:text-white/60 max-w-2xl mx-auto font-sans leading-relaxed px-4 md:px-0">
          Stop studying everything. Our AI analyzes your past papers and lecture slides to predict exactly what will appear in your next exam.
        </p>

        <div className="flex flex-col items-center gap-4 pt-4 px-4 sm:px-0">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <button 
              onClick={onStart}
              className="w-full sm:w-auto group bg-[#1a1a1a] dark:bg-[#A8A878] text-white dark:text-black px-8 py-4 rounded-full font-sans font-semibold flex items-center justify-center gap-2 hover:bg-[#333] dark:hover:bg-[#8A8A58] transition-all shadow-lg"
            >
              Sign Up for Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={onStart}
              className="w-full sm:w-auto px-8 py-4 rounded-full font-sans font-semibold border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all dark:text-white"
            >
              Sign In
            </button>
          </div>
          <button 
            onClick={onViewSample}
            className="text-xs md:text-sm font-sans font-bold opacity-40 hover:opacity-100 transition-opacity dark:text-white underline underline-offset-4"
          >
            Or view a sample analysis first
          </button>
        </div>

        <div className="pt-8 md:pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-3xl mx-auto opacity-40 grayscale dark:invert">
          <div className="flex items-center justify-center gap-2 font-bold text-lg md:text-xl">GCTU</div>
          <div className="flex items-center justify-center gap-2 font-bold text-lg md:text-xl">KNUST</div>
          <div className="flex items-center justify-center gap-2 font-bold text-lg md:text-xl">UG</div>
          <div className="flex items-center justify-center gap-2 font-bold text-lg md:text-xl">UPSA</div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-4 sm:px-0">
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
      <section className="bg-white dark:bg-[#1C1C1C] rounded-[2rem] p-8 md:p-12 border border-black/5 dark:border-white/5 shadow-sm overflow-hidden relative mx-4 sm:mx-0">
        <div className="relative z-10 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight dark:text-white">Built for the modern student.</h2>
            <p className="text-[#1a1a1a]/60 dark:text-white/60 font-sans text-sm md:text-base">
              We know you're busy. AI Exam Predictor helps you prioritize your limited study time for maximum impact.
            </p>
            <div className="flex gap-8 md:gap-12 pt-2 md:pt-4">
              <div>
                <div className="text-2xl md:text-3xl font-bold dark:text-white">94%</div>
                <div className="text-xs md:text-sm font-sans opacity-50 dark:text-white/40 uppercase tracking-wider">Accuracy</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold dark:text-white">10k+</div>
                <div className="text-xs md:text-sm font-sans opacity-50 dark:text-white/40 uppercase tracking-wider">Students</div>
              </div>
            </div>
          </div>
          <div className="bg-[#F5F5F0] dark:bg-white/5 rounded-2xl p-5 md:p-6 border border-black/5 dark:border-white/5 md:rotate-2 shadow-inner">
            <div className="space-y-3 md:space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm md:text-base dark:text-white">Operating Systems</span>
                <span className="text-[10px] md:text-xs font-sans bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded">High Priority</span>
              </div>
              <div className="h-2 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#5A5A40] dark:bg-[#A8A878] w-[87%]" />
              </div>
              <div className="text-xs md:text-sm font-sans opacity-60 dark:text-white/60 italic">
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
    <div className="p-6 md:p-8 bg-white dark:bg-[#1C1C1C] rounded-2xl md:rounded-3xl border border-black/5 dark:border-white/5 hover:shadow-md transition-all space-y-3 md:space-y-4">
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[#F5F5F0] dark:bg-white/5 flex items-center justify-center text-[#5A5A40] dark:text-[#A8A878]">
        {icon}
      </div>
      <h3 className="text-lg md:text-xl font-bold dark:text-white">{title}</h3>
      <p className="text-[#1a1a1a]/60 dark:text-white/60 font-sans text-xs md:text-sm leading-relaxed">{description}</p>
    </div>
  );
}
