export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
}

export interface Course {
  id: string;
  name: string;
  university: string;
  level: string;
  semester: string;
  ownerId: string;
  createdAt: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  extractedText: string;
  courseId: string;
  ownerId: string;
  createdAt: string;
}

export interface TopicProbability {
  name: string;
  probability: number;
  priority: 'High' | 'Medium' | 'Low';
  reasoning: string;
}

export interface RepeatedQuestion {
  question: string;
  frequency: number;
}

export interface ExamAnalysis {
  courseId: string;
  topics: TopicProbability[];
  repeatedQuestions: RepeatedQuestion[];
  studyPriority: string[];
  updatedAt: string;
}

export interface PredictedQuestion {
  id: string;
  courseId: string;
  question: string;
  explanation: string;
  createdAt: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface StudyMaterial {
  id: string;
  courseId: string;
  topic: string;
  notes: string;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  youtubeUrl?: string;
  youtubeVideoTitle?: string;
  difficulty?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  courseId: string;
  role: 'user' | 'model';
  text: string;
  createdAt: string;
}
