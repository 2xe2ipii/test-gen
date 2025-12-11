import React, { useState } from 'react';
// import { Question } from '../types';
// Change the import line to this:
import type { Question } from '../types';

interface ExamTakerProps {
  questions: Question[];
  onSubmit: (answers: Record<number, string>) => void;
}

const ExamTaker: React.FC<ExamTakerProps> = ({ questions, onSubmit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  const handleAnswerChange = (val: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: val
    }));
  };

  const isLastQuestion = currentIndex === totalQuestions - 1;

  const renderInput = () => {
    switch (currentQuestion.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-3 mt-4">
            {currentQuestion.options?.map((option, idx) => (
              <label 
                key={idx} 
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors
                  ${answers[currentQuestion.id] === option ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}
                `}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={option}
                  checked={answers[currentQuestion.id] === option}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3 text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );
      
      case 'identification':
      case 'fill-in-the-blanks':
        return (
          <div className="mt-4">
            <input
              type="text"
              placeholder="Type your answer here..."
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              autoComplete="off"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Question {currentIndex + 1} of {totalQuestions}</span>
          <span className="capitalize">{currentQuestion.type.replace(/-/g, ' ')}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 min-h-[400px] flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-medium text-gray-800 leading-relaxed">
            {currentQuestion.question}
          </h3>
          {renderInput()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-6 py-2 text-gray-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:text-blue-600"
          >
            Previous
          </button>
          
          {isLastQuestion ? (
            <button
              onClick={() => onSubmit(answers)}
              className="px-8 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-sm"
            >
              Submit Exam
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
              className="px-8 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-sm"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamTaker;