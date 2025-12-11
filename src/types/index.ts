export type QuestionType = 'multiple-choice' | 'identification' | 'fill-in-the-blanks';

export interface ExamConfigData {
  totalItems: number;
  distribution: {
    multipleChoice: number;
    identification: number;
    fillInTheBlanks: number;
  };
}

export interface Question {
  id: number;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
}

// NEW: For tracking history
export interface ExamAttempt {
  date: string; // ISO string
  score: number;
  total: number;
}

// NEW: The saved exam object
export interface SavedExam {
  id: string; // Unique UUID
  name: string; // User-editable name (e.g., "Data Structures Midterm")
  originalPdfName: string;
  questions: Question[];
  attempts: ExamAttempt[];
  createdDate: string;
}