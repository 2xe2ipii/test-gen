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
  options?: string[]; // Only for multiple choice
  correctAnswer: string;
}

export interface UserAnswer {
  questionId: number;
  answer: string;
  isCorrect: boolean;
}