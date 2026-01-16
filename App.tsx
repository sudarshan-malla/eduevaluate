
import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import EvaluationReportView from './components/EvaluationReportView';
import { UploadedFile, EvaluationReport } from './types';
import { evaluateAnswerSheet } from './services/geminiService';

// Reduced to 3MB to stay within safe Base64 limits for multiple files
const MAX_FILE_SIZE_MB = 3;

const App: React.FC = () => {
  const [qpFiles, setQpFiles] = useState<UploadedFile[]>([]);
  const [keyFiles, setKeyFiles] = useState<UploadedFile[]>([]);
  const [studentFiles, setStudentFiles] = useState<UploadedFile[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileSelection = (type: 'qp' | 'key' | 'student') => async (files: File[]) => {
    setError(null);
    const validFiles = files.filter(f => {
      if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(`File "${f.name}" is too large. Please keep each file under ${MAX_FILE_SIZE_MB}MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const uploaded = await Promise.all(validFiles.map(async (file) => ({
      file,
      preview: await fileToBase64(file)
    })));

    if (type === 'qp') setQpFiles(prev => [...prev, ...uploaded]);
    if (type === 'key') setKeyFiles(prev => [...prev, ...uploaded]);
    if (type === 'student') setStudentFiles(prev => [...prev, ...uploaded]);
  };

  const runEvaluation = async () => {
    if (qpFiles.length === 0 || studentFiles.length === 0) {
      setError("Please upload both the Question Paper and the Student Answer Sheet.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const qpBase64 = qpFiles.map(f => f.preview);
      const keyBase64 = keyFiles.map(f => f.preview);
      const studentBase64 = studentFiles.map(f => f.preview);

      const result = await evaluateAnswerSheet(qpBase64, keyBase64, studentBase64);
      setReport(result);
    } catch (err: any) {
      console.error("Evaluation error:", err);
      setError(err.message || "An unexpected error occurred during processing.");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setQpFiles([]);
    setKeyFiles([]);
    setStudentFiles([]);
    setReport(null);
    setError(null);
  };

  if (report) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          <EvaluationReportView report={report} onReset={reset} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="border-b border-slate-100 px-6 py-4 flex justify-between items-center sticky top-0 bg-white z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">E</div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">EduGrade AI</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Flash Engine Active</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Answer Sheet Evaluation
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Upload scans of question papers and student handwriting for instant, fair, and detailed grading.
          </p>
        </div>

        <div className="space-y-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FileUpload 
              label="Question Paper" 
              required 
              files={qpFiles} 
              onFilesSelected={handleFileSelection('qp')} 
            />
            <FileUpload 
              label="Answer Key (Optional)" 
              files={keyFiles} 
              onFilesSelected={handleFileSelection('key')} 
            />
          </div>
          
          <FileUpload 
            label="Student Answer Sheet(s)" 
            required 
            files={studentFiles} 
            onFilesSelected={handleFileSelection('student')} 
          />

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-start gap-3 animate-pulse">
               <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               <span>{error}</span>
            </div>
          )}

          <div className="pt-4">
            <button
              onClick={runEvaluation}
              disabled={isLoading || qpFiles.length === 0 || studentFiles.length === 0}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                isLoading 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 active:scale-[0.98]'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Evaluating Documents...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                  Generate Evaluation Report
                </>
              )}
            </button>
            <p className="text-center text-slate-400 text-xs mt-4">
              Large files or multiple pages may take up to 30 seconds to process.
            </p>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-4">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path></svg>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Multimodal Support</h3>
              <p className="text-sm text-slate-500">Easily handles PDF, JPG, and PNG inputs simultaneously.</p>
            </div>
            <div className="p-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">High-Speed OCR</h3>
              <p className="text-sm text-slate-500">Optimized Flash engine reads messy handwriting at lightning speed.</p>
            </div>
            <div className="p-4">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Verified Accuracy</h3>
              <p className="text-sm text-slate-500">Grading logic cross-references standard academic curricula.</p>
            </div>
        </div>
      </main>

      <footer className="border-t border-slate-100 py-12 mt-20 text-center">
        <p className="text-slate-400 text-sm">Powered by Gemini 2.5/3.0 &bull; Build 1042</p>
      </footer>
    </div>
  );
};

export default App;
