import React from 'react';

interface Props {
  onUploadSuccess: (file: File) => void;
}

const FileUpload: React.FC<Props> = ({ onUploadSuccess }) => {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center hover:bg-gray-50 transition cursor-pointer">
      <div className="text-6xl mb-4">📄</div>
      <p className="text-gray-500 text-lg">Upload PDF</p>
      <input 
        type="file" 
        accept=".pdf"
        className="opacity-0 absolute w-full h-full cursor-pointer"
        onChange={(e) => {
          if (e.target.files?.[0]) onUploadSuccess(e.target.files[0]);
        }}
      />
    </div>
  );
};

export default FileUpload;