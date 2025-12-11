import { useState } from 'react';
import FileUpload from './components/FileUpload';
import ExamConfig from './components/ExamConfig';
import ExamTaker from './components/ExamTaker';
import ResultsView from './components/ResultsView';
import Library from './components/Library';
import { extractTextFromPDF } from './services/pdfHandler';
import { generateExam } from './services/gemini';
import { saveExam, addAttempt } from './services/storage'; // Import storage
import type { ExamConfigData, Question, SavedExam } from './types';

type AppStep = 'upload' | 'config' | 'exam' | 'result' | 'library';

function App() {
  const [step, setStep] = useState<AppStep>('upload');
  const [pdfText, setPdfText] = useState<string>('');
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  
  // Track if we are taking a saved exam to update its history
  const [activeExamId, setActiveExamId] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const text = await extractTextFromPDF(file);
      setPdfText(text);
      setCurrentFileName(file.name);
      setStep('config');
    } catch (error) {
      alert("Failed to read PDF.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateExam = async (config: ExamConfigData) => {
    setIsLoading(true);
    try {
      const generatedQuestions = await generateExam(pdfText, config);
      setQuestions(generatedQuestions);
      setActiveExamId(null); // This is a fresh exam, not saved yet
      setStep('exam');
    } catch (error: any) {
      alert(`Generation failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetake = (exam: SavedExam) => {
    setQuestions(exam.questions);
    setActiveExamId(exam.id); // We are taking an existing exam
    setUserAnswers({});
    setStep('exam');
  };

  const handleSubmitExam = (answers: Record<number, string>) => {
    setUserAnswers(answers);
    
    // Calculate score immediately to save history
    if (activeExamId) {
       let correct = 0;
       questions.forEach(q => {
         if (answers[q.id]?.toLowerCase() === q.correctAnswer.toLowerCase()) correct++;
       });
       addAttempt(activeExamId, correct, questions.length);
    }

    setStep('result');
  };

  // Logic to save a NEW exam from the results screen
  const handleSaveResult = () => {
    if (activeExamId) return; // Already saved
    const saved = saveExam(currentFileName, questions);
    setActiveExamId(saved.id);
    alert("Reviewer saved to Library! You can now track your progress.");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => setStep('upload')}
          >
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              T
            </div>
            <span className="text-xl font-bold tracking-tight">TALAS</span>
          </div>
          
          <div className="flex gap-4">
             <button 
               onClick={() => setStep('upload')}
               className={`text-sm font-medium ${step === 'upload' || step === 'config' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
             >
               New Reviewer
             </button>
             <button 
               onClick={() => setStep('library')}
               className={`text-sm font-medium ${step === 'library' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
             >
               Library
             </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {step === 'upload' && (
          <div className="animate-fade-in">
             <div className="text-center mb-10">
               <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                 Sharpen Your Mind.
               </h1>
               <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                 Turn any PDF into an interactive reviewer instantly.
               </p>
             </div>
             <FileUpload onFileSelect={handleFileUpload} isLoading={isLoading} />
          </div>
        )}

        {step === 'library' && (
          <Library onRetake={handleRetake} />
        )}

        {step === 'config' && (
          <ExamConfig onStartExam={handleGenerateExam} isGenerating={isLoading} />
        )}

        {step === 'exam' && (
          <ExamTaker questions={questions} onSubmit={handleSubmitExam} />
        )}

        {step === 'result' && (
          <ResultsView 
            questions={questions} 
            userAnswers={userAnswers} 
            onReset={() => setStep('upload')}
            onSave={!activeExamId ? handleSaveResult : undefined} 
          />
        )}
      </main>
    </div>
  );
}

export default App;