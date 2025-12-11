import { useState } from 'react';
import FileUpload from './components/FileUpload';
import ExamConfig from './components/ExamConfig';
import ExamTaker from './components/ExamTaker';
import ResultsView from './components/ResultsView';
import { extractTextFromPDF } from './services/pdfHandler';
import { generateExam } from './services/gemini';
import type { ExamConfigData, Question } from './types';

type AppStep = 'upload' | 'config' | 'exam' | 'result';

function App() {
  const [step, setStep] = useState<AppStep>('upload');
  const [pdfText, setPdfText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});

  // 1. Handle File Upload
  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const text = await extractTextFromPDF(file);
      setPdfText(text);
      setStep('config');
    } catch (error) {
      console.error("Failed to parse PDF", error);
      alert("Failed to read PDF. Please try a different file.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Generate Exam using Gemini
  const handleGenerateExam = async (config: ExamConfigData) => {
    setIsLoading(true);
    try {
      const generatedQuestions = await generateExam(pdfText, config);
      setQuestions(generatedQuestions);
      setStep('exam');
    } catch (error: any) {
      console.error("Gemini Error:", error);
      // Alert the specific error message to see what's wrong
      alert(`Failed to generate exam: ${error.message}`); 
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Submit Exam
  const handleSubmitExam = (answers: Record<number, string>) => {
    setUserAnswers(answers);
    setStep('result');
  };

  // 4. Reset
  const handleReset = () => {
    setStep('upload');
    setPdfText('');
    setQuestions([]);
    setUserAnswers({});
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
            AI Exam Generator
          </h1>
          <p className="text-lg text-gray-600">
            Upload a PDF and instantly generate a practice test.
          </p>
        </div>

        {/* Main Content Area */}
        <div className="transition-all duration-300 ease-in-out">
          {step === 'upload' && (
            <FileUpload 
              onFileSelect={handleFileUpload} 
              isLoading={isLoading} 
            />
          )}

          {step === 'config' && (
            <ExamConfig 
              onStartExam={handleGenerateExam} 
              isGenerating={isLoading} 
            />
          )}

          {step === 'exam' && (
            <ExamTaker 
              questions={questions} 
              onSubmit={handleSubmitExam} 
            />
          )}

          {step === 'result' && (
            <ResultsView 
              questions={questions} 
              userAnswers={userAnswers} 
              onReset={handleReset} 
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;