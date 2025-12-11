export interface ExamConfig {
  totalItems: number;
  distribution: {
    multipleChoice: number;
    identification: number;
    fillInTheBlanks: number;
  };
}

export interface Question {
  id: number;
  type: 'multiple-choice' | 'identification' | 'fill-in-the-blanks';
  question: string;
  options?: string[]; // Only for multiple choice
  correctAnswer: string;
  userAnswer?: string;
}