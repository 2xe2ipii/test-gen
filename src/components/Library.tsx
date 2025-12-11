import React, { useState, useEffect } from 'react';
// FIX: Added 'type' keyword
import type { SavedExam } from '../types';
import { getSavedExams, updateExamName, deleteExam } from '../services/storage';

interface LibraryProps {
  onRetake: (exam: SavedExam) => void;
}

const Library: React.FC<LibraryProps> = ({ onRetake }) => {
  const [exams, setExams] = useState<SavedExam[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    setExams(getSavedExams());
  }, []);

  const handleRename = (id: string) => {
    updateExamName(id, editName);
    setExams(getSavedExams());
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this reviewer?')) {
      deleteExam(id);
      setExams(getSavedExams());
    }
  };

  const getHighScore = (exam: SavedExam) => {
    if (exam.attempts.length === 0) return 0;
    return Math.max(...exam.attempts.map(a => Math.round((a.score / a.total) * 100)));
  };

  if (exams.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
        <p className="text-gray-500 text-lg">No saved reviewers yet.</p>
        <p className="text-sm text-gray-400">Generate one from a PDF to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {exams.map((exam) => (
        <div key={exam.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          {/* Header & Rename */}
          <div className="flex justify-between items-start mb-4">
            {editingId === exam.id ? (
              <div className="flex gap-2 w-full">
                <input 
                  autoFocus
                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <button onClick={() => handleRename(exam.id)} className="text-green-600 text-sm font-bold">✓</button>
              </div>
            ) : (
              <div className="group flex items-center gap-2">
                <h3 className="font-bold text-gray-800 text-lg truncate" title={exam.name}>{exam.name}</h3>
                <button 
                  onClick={() => { setEditingId(exam.id); setEditName(exam.name); }}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-500"
                >
                  ✏️
                </button>
              </div>
            )}
            <button onClick={() => handleDelete(exam.id)} className="text-gray-300 hover:text-red-500 ml-2">×</button>
          </div>

          {/* Stats */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Items</span>
              <span className="font-medium">{exam.questions.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Attempts</span>
              <span className="font-medium">{exam.attempts.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Best Score</span>
              <span className={`font-bold ${getHighScore(exam) >= 75 ? 'text-green-600' : 'text-orange-500'}`}>
                {getHighScore(exam)}%
              </span>
            </div>
            
            {/* Mini History Graph */}
            <div className="h-10 flex items-end gap-1 mt-2 border-b border-gray-100 pb-1">
              {exam.attempts.slice(-10).map((attempt, i) => {
                const pct = (attempt.score / attempt.total) * 100;
                return (
                  <div 
                    key={i} 
                    className="flex-1 bg-blue-100 hover:bg-blue-300 transition-colors rounded-t-sm relative group"
                    style={{ height: `${pct}%` }}
                  >
                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-black text-white text-xs px-1 rounded">
                       {Math.round(pct)}%
                     </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button 
            onClick={() => onRetake(exam)}
            className="w-full py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Review Now
          </button>
        </div>
      ))}
    </div>
  );
};

export default Library;