import { useState } from 'react';
import FileUpload from './components/FileUpload';

function App() {
  const [step, setStep] = useState<'upload' | 'config' | 'exam' | 'result'>('upload');

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          PDF to Exam Generator
        </h1>
        
        {step === 'upload' && (
          <FileUpload onUploadSuccess={() => setStep('config')} />
        )}

        {step === 'config' && (
           <div className="text-center">Config Component Placeholder</div>
        )}

        {/* Add other steps as we build them */}
      </div>
    </div>
  );
}

export default App;