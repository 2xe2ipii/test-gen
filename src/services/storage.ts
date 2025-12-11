import type { SavedExam, Question, ExamAttempt } from '../types';

const STORAGE_KEY = 'talas_exams_v1';

export const getSavedExams = (): SavedExam[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveExam = (
  pdfName: string, 
  questions: Question[], 
  customName?: string
): SavedExam => {
  const exams = getSavedExams();
  
  const newExam: SavedExam = {
    id: crypto.randomUUID(),
    name: customName || `Reviewer for ${pdfName}`,
    originalPdfName: pdfName,
    questions,
    attempts: [],
    createdDate: new Date().toISOString(),
  };

  exams.push(newExam);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(exams));
  return newExam;
};

export const updateExamName = (id: string, newName: string) => {
  const exams = getSavedExams();
  const index = exams.findIndex(e => e.id === id);
  if (index !== -1) {
    exams[index].name = newName;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exams));
  }
};

export const addAttempt = (examId: string, score: number, total: number) => {
  const exams = getSavedExams();
  // FIX: Used 'examId' instead of the undefined 'id'
  const index = exams.findIndex(e => e.id === examId); 
  if (index !== -1) {
    const attempt: ExamAttempt = {
      date: new Date().toISOString(),
      score,
      total
    };
    exams[index].attempts.push(attempt);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exams));
  }
};

export const deleteExam = (id: string) => {
  const exams = getSavedExams().filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(exams));
};