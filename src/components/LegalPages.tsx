import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Shield, FileText, Lock, Eye, Scale, AlertCircle } from 'lucide-react';

interface LegalPageProps {
  onBack: () => void;
  type: 'privacy' | 'terms';
}

interface LegalSection {
  title: string;
  content: string[];
  list?: string[];
}

interface LegalContent {
  title: string;
  sections: LegalSection[];
}

export default function LegalPage({ onBack, type }: LegalPageProps) {
  const content: LegalContent = type === 'privacy' ? privacyContent : termsContent;

  return (
    <div className="max-w-4xl mx-auto py-12 space-y-12">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-[#5A5A40] dark:text-[#A8A878] font-sans font-bold hover:opacity-70 transition-opacity"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to App
      </button>

      <div className="space-y-4">
        <div className="w-16 h-16 bg-[#5A5A40]/10 dark:bg-[#A8A878]/10 rounded-2xl flex items-center justify-center text-[#5A5A40] dark:text-[#A8A878]">
          {type === 'privacy' ? <Shield className="w-8 h-8" /> : <FileText className="w-8 h-8" />}
        </div>
        <h1 className="text-5xl font-bold dark:text-white">{content.title}</h1>
        <p className="text-sm font-sans opacity-50 dark:text-white/60 uppercase tracking-widest">Last Updated: March 14, 2026</p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none font-sans space-y-8">
        {content.sections.map((section, idx) => (
          <section key={idx} className="space-y-4">
            <h2 className="text-2xl font-bold dark:text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-sm">
                {idx + 1}
              </span>
              {section.title}
            </h2>
            <div className="text-[#1a1a1a]/70 dark:text-white/70 leading-relaxed space-y-4">
              {section.content.map((paragraph, pIdx) => (
                <p key={pIdx}>{paragraph}</p>
              ))}
              {section.list && (
                <ul className="list-disc pl-6 space-y-2">
                  {section.list.map((item, iIdx) => (
                    <li key={iIdx}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}
      </div>

      <div className="p-8 bg-[#5A5A40]/5 dark:bg-[#A8A878]/5 rounded-[2rem] border border-[#5A5A40]/10 dark:border-[#A8A878]/10 text-center space-y-4">
        <AlertCircle className="w-8 h-8 mx-auto text-[#5A5A40] dark:text-[#A8A878]" />
        <h3 className="text-xl font-bold dark:text-white">Questions about our {type === 'privacy' ? 'Privacy Policy' : 'Terms'}?</h3>
        <p className="text-sm font-sans opacity-60 dark:text-white/60">
          If you have any questions or concerns, please contact us at <br />
          <a href="mailto:support@aiexampredictor.com" className="font-bold text-[#5A5A40] dark:text-[#A8A878] hover:underline">support@aiexampredictor.com</a>
        </p>
      </div>
    </div>
  );
}

const privacyContent = {
  title: "Privacy Policy",
  sections: [
    {
      title: "Information We Collect",
      content: [
        "We collect information to provide better services to all our users. The types of information we collect include:",
      ],
      list: [
        "Account Information: When you sign in with Google, we receive your name, email address, and profile picture.",
        "Course Materials: We process the documents you upload (PDFs, DOCX, etc.) to generate exam predictions.",
        "Usage Data: We collect information about how you interact with our service, such as the features you use and the time spent on the app."
      ]
    },
    {
      title: "How We Use Your Information",
      content: [
        "Your information is used solely for the following purposes:",
      ],
      list: [
        "To provide and maintain our Service, including generating AI-driven exam predictions.",
        "To personalize your experience and remember your preferences.",
        "To improve our AI models and overall application performance.",
        "To communicate with you about updates or support requests."
      ]
    },
    {
      title: "Data Security",
      content: [
        "We prioritize the security of your data. We implement industry-standard security measures to protect your personal information and uploaded materials from unauthorized access, disclosure, or destruction.",
        "All uploaded documents are processed securely and are only accessible to you through your authenticated account."
      ]
    },
    {
      title: "Data Retention",
      content: [
        "We retain your personal information and course materials for as long as your account is active or as needed to provide you with our services.",
        "You can delete your uploaded materials or your entire account at any time through the application settings."
      ]
    },
    {
      title: "Third-Party Services",
      content: [
        "We use Google Firebase for authentication and database management, and Google Gemini AI for processing and analyzing course materials. These services have their own privacy policies which we encourage you to review."
      ]
    }
  ]
};

const termsContent = {
  title: "Terms of Service",
  sections: [
    {
      title: "Acceptance of Terms",
      content: [
        "By accessing or using the AI Exam Predictor application, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, you may not use the service."
      ]
    },
    {
      title: "Description of Service",
      content: [
        "AI Exam Predictor is an AI-powered tool designed to help students analyze course materials and predict potential exam topics. The predictions generated are based on patterns identified by AI and are not guaranteed to be accurate."
      ]
    },
    {
      title: "User Responsibilities",
      content: [
        "You are responsible for the materials you upload. You must ensure that you have the right to upload and process these materials.",
        "You agree not to use the service for any illegal or unauthorized purpose."
      ]
    },
    {
      title: "Disclaimer of Accuracy",
      content: [
        "The predictions provided by this service are for educational and study-aid purposes only. We do not guarantee that the predicted topics or questions will appear in your actual exams.",
        "Users should not rely solely on these predictions for their exam preparation and are encouraged to study their entire course syllabus."
      ]
    },
    {
      title: "Limitation of Liability",
      content: [
        "In no event shall AI Exam Predictor or its creators be liable for any direct, indirect, incidental, or consequential damages arising out of your use or inability to use the service, including but not limited to academic results."
      ]
    },
    {
      title: "Changes to Terms",
      content: [
        "We reserve the right to modify these terms at any time. We will notify users of any significant changes by updating the 'Last Updated' date at the top of this page."
      ]
    }
  ]
};
