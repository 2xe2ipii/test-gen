import React, { useMemo } from 'react';
import type { Question } from '../types';
import { jsPDF } from 'jspdf';

interface ResultsViewProps {
  questions: Question[];
  userAnswers: Record<number, string>;
  onReset: () => void;
  onSave?: () => void; // Added optional save handler
}

const ResultsView: React.FC<ResultsViewProps> = ({ questions, userAnswers, onReset, onSave }) => {
  
  // Calculate Score
  const scoreData = useMemo(() => {
    let correctCount = 0;
    const details = questions.map(q => {
      const uAns = (userAnswers[q.id] || '').trim().toLowerCase();
      const cAns = q.correctAnswer.trim().toLowerCase();
      const isCorrect = uAns === cAns;
      if (isCorrect) correctCount++;
      return { ...q, userAnswer: userAnswers[q.id], isCorrect };
    });
    return { correctCount, details };
  }, [questions, userAnswers]);

  const percentage = Math.round((scoreData.correctCount / questions.length) * 100);

  // Generate PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Header
    doc.setFontSize(20);
    doc.text('Review Results', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(12);
    doc.text(`Score: ${scoreData.correctCount} / ${questions.length} (${percentage}%)`, 20, yPos);
    yPos += 20;

    // Content
    doc.setFontSize(10);
    scoreData.details.forEach((item, index) => {
      // Check if we need a new page
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      // Question Text (Wrapped)
      const questionText = `${index + 1}. ${item.question}`;
      const splitQuestion = doc.splitTextToSize(questionText, pageWidth - 40);
      doc.text(splitQuestion, 20, yPos);
      yPos += (splitQuestion.length * 5) + 2;

      // Answers
      const isCorrect = item.isCorrect;
      
      // User Answer
      if (isCorrect) {
          doc.setTextColor(0, 150, 0); // Green
          doc.text(`Your Answer: ${item.userAnswer || '(No Answer)'} (Correct)`, 25, yPos);
      } else {
          doc.setTextColor(200, 0, 0); // Red
          doc.text(`Your Answer: ${item.userAnswer || '(No Answer)'} (Wrong)`, 25, yPos);
      }
      doc.setTextColor(0, 0, 0); // Reset to black
      
      // Correct Answer (if wrong)
      if (!isCorrect) {
        yPos += 5;
        doc.text(`Correct Answer: ${item.correctAnswer}`, 25, yPos);
      }
      
      yPos += 10; // Spacing between items
    });

    doc.save('talas-results.pdf');
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Review Complete</h2>
        <div className="text-6xl font-extrabold text-blue-600 my-6">
          {percentage}%
        </div>
        <p className="text-xl text-gray-600 mb-8">
          You got <span className="font-bold text-gray-900">{scoreData.correctCount}</span> out of <span className="font-bold text-gray-900">{questions.length}</span> correct.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          {onSave && (
            <button
              onClick={onSave}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-sm flex items-center gap-2"
            >
              <span>💾</span> Save to Library
            </button>
          )}
          
          <button
            onClick={handleDownloadPDF}
            className="px-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 flex items-center gap-2"
          >
            <span>⬇️</span> Download PDF
          </button>
          
          <button
            onClick={onReset}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
          >
            Create New
          </button>
        </div>
      </div>

      {/* Detailed Review Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800 ml-2">Detailed Review</h3>
        {scoreData.details.map((q, idx) => (
          <div 
            key={q.id} 
            className={`p-6 rounded-lg border ${q.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
          >
            <div className="flex gap-3">
              <span className="font-bold text-gray-600">{idx + 1}.</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900 mb-2">{q.question}</p>
                
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 w-24">Your Answer:</span>
                    <span className={`font-medium ${q.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      {q.userAnswer || '(No Answer)'}
                    </span>
                    {q.isCorrect && <span>✅</span>}
                  </div>
                  
                  {!q.isCorrect && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 w-24">Correct Answer:</span>
                      <span className="font-medium text-gray-900">{q.correctAnswer}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsView;