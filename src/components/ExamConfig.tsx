import React, { useState, useEffect } from 'react';
// import { ExamConfigData } from '../types';
// Change the import line to this:
import type { ExamConfigData } from '../types';

interface ExamConfigProps {
  onStartExam: (config: ExamConfigData) => void;
  isGenerating: boolean;
}

const ExamConfig: React.FC<ExamConfigProps> = ({ onStartExam, isGenerating }) => {
  const [totalItems, setTotalItems] = useState<number>(10);
  const [mcCount, setMcCount] = useState<number>(10);
  const [identCount, setIdentCount] = useState<number>(0);
  const [blanksCount, setBlanksCount] = useState<number>(0);

  // Auto-balance logic: If user changes total, reset distribution
  useEffect(() => {
    setMcCount(totalItems);
    setIdentCount(0);
    setBlanksCount(0);
  }, [totalItems]);

  const currentTotal = mcCount + identCount + blanksCount;
  const isValid = currentTotal === totalItems;

  const handleSubmit = () => {
    if (!isValid) return;
    onStartExam({
      totalItems,
      distribution: {
        multipleChoice: mcCount,
        identification: identCount,
        fillInTheBlanks: blanksCount,
      },
    });
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Configure Exam</h2>

      <div className="space-y-6">
        {/* Total Items Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Number of Items (Max 50)
          </label>
          <input
            type="number"
            min="1"
            max="50"
            value={totalItems}
            onChange={(e) => setTotalItems(Math.min(50, Math.max(1, parseInt(e.target.value) || 0)))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="border-t pt-4">
          <p className="text-sm text-gray-500 mb-4">Distribute the {totalItems} items below:</p>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-gray-700">Multiple Choice</label>
              <input
                type="number"
                min="0"
                value={mcCount}
                onChange={(e) => setMcCount(parseInt(e.target.value) || 0)}
                className="w-20 px-3 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-gray-700">Identification</label>
              <input
                type="number"
                min="0"
                value={identCount}
                onChange={(e) => setIdentCount(parseInt(e.target.value) || 0)}
                className="w-20 px-3 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center">
              <label className="text-gray-700">Fill in the Blanks</label>
              <input
                type="number"
                min="0"
                value={blanksCount}
                onChange={(e) => setBlanksCount(parseInt(e.target.value) || 0)}
                className="w-20 px-3 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Validation Message */}
        <div className={`text-sm text-center ${isValid ? 'text-green-600' : 'text-red-500'}`}>
          Current Total: {currentTotal} / {totalItems}
          {!isValid && <span> (Please adjust counts)</span>}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!isValid || isGenerating}
          className={`w-full py-3 rounded-lg text-white font-medium transition-colors
            ${isValid && !isGenerating ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}
          `}
        >
          {isGenerating ? 'Generating Exam with AI...' : 'Generate Exam'}
        </button>
      </div>
    </div>
  );
};

export default ExamConfig;