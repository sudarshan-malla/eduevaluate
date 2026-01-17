
import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import EvaluationReportView from './components/EvaluationReportView';
import Dashboard from './components/Dashboard';
import { UploadedFile, EvaluationReport, HistoryItem } from './types';
import { evaluateAnswerSheet } from './services/geminiService';

const MAX_FILE_SIZE_MB = 3;
const STORAGE_KEY = 'edugrade_history';

type ViewMode = 'uploader' | 'dashboard' | 'report';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('uploader');
  const [qpFiles, setQpFiles] = useState<UploadedFile[]>([]);
  const [keyFiles, setKeyFiles] = useState<UploadedFile[]>([]);
  const [studentFiles, setStudentFiles] = useState<UploadedFile[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentReport, setCurrentReport] = useState<EvaluationReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });
  };

  const simulateProgress = async (fileId: string, type: 'qp' | 'key' | 'student') => {
    const updateProgress = (p: number) => {
      // Fix: Added explicit return type and cast status property to satisfy the union type defined in UploadedFile
      const updater = (prev: UploadedFile[]): UploadedFile[] => 
        prev.map(f => f.file.name === fileId ? { 
          ...f, 
          progress: p, 
          status: (p === 100 ? 'complete' : 'uploading') as 'uploading' | 'complete' | 'error' 
        } : f);
      
      if (type === 'qp') setQpFiles(updater);
      else if (type === 'key') setKeyFiles(updater);
      else setStudentFiles(updater);
    };

    for (let p = 0; p <= 100; p += 10) {
      updateProgress(p);
      await new Promise(r => setTimeout(r, 100));
    }
  };

  const handleFileSelection = (type: 'qp' | 'key' | 'student') => async (files: File[]) => {
    setError(null);
    const validFiles = files.filter(f => {
      if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(`File "${f.name}" exceeds ${MAX_FILE_SIZE_MB}MB.`);
        return false;
      }
      return true;
    });

    const newUploaded = await Promise.all(validFiles.map(async (file) => {
      const preview = await fileToBase64(file);
      return {
        file,
        preview,
        progress: 0,
        status: 'uploading' as const
      };
    }));

    if (type === 'qp') setQpFiles(prev => [...prev, ...newUploaded]);
    if (type === 'key') setKeyFiles(prev => [...prev, ...newUploaded]);
    if (type === 'student') setStudentFiles(prev => [...prev, ...newUploaded]);

    newUploaded.forEach(f => simulateProgress(f.file.name, type));
  };

  const runEvaluation = async () => {
    if (qpFiles.length === 0 || studentFiles.length === 0) {
      setError("Please upload Question Paper and Student Answer Sheet.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const qpBase64 = qpFiles.map(f => f.preview);
      const keyBase64 = keyFiles.map(f => f.preview);
      const studentBase64 = studentFiles.map(f => f.preview);

      const result = await evaluateAnswerSheet(qpBase64, keyBase64, studentBase64);
      
      const newHistoryItem: HistoryItem = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        report: result
      };

      setHistory(prev => [newHistoryItem, ...prev]);
      setCurrentReport(result);
      setViewMode('report');
    } catch (err: any) {
      setError(err.message || "Processing failed. Check file clarity.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFromHistory = (id: string) => {
    if (confirm("Delete this report permanently?")) {
      setHistory(prev => prev.filter(h => h.id !== id));
    }
  };

  const viewHistoricReport = (item: HistoryItem) => {
    setCurrentReport(item.report);
    setViewMode('report');
  };

  const startNew = () => {
    setQpFiles([]);
    setKeyFiles([]);
    setStudentFiles([]);
    setCurrentReport(null);
    setViewMode('uploader');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-100 selection:text-blue-900">
      <nav className="border-b border-slate-200/60 px-8 py-5 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setViewMode('uploader')}>
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200 transform group-hover:rotate-6 transition-transform">E</div>
          <div>
            <span className="text-lg font-black text-slate-900 tracking-tight block leading-none">EduGrade AI</span>
            <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Examiner v3.0</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl no-print">
          <button 
            onClick={() => setViewMode('uploader')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 'uploader' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            New
          </button>
          <button 
            onClick={() => setViewMode('dashboard')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 'dashboard' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Dashboard
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {viewMode === 'uploader' && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-[11px] font-black uppercase tracking-[0.2em] mb-4">
                Smart Answer Evaluation
              </div>
              <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1]">
                Grade with Confidence. <br/> <span className="text-blue-600">Instantly.</span>
              </h1>
              <p className="text-lg text-slate-500 font-medium">
                Our advanced multimodal AI analyzes handwriting, understands context, and provides fair grading for students.
              </p>
            </div>

            <div className="bg-white rounded-[40px] p-10 shadow-2xl shadow-slate-200 border border-slate-100 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <FileUpload label="Question Paper" required files={qpFiles} onFilesSelected={handleFileSelection('qp')} />
                <FileUpload label="Answer Key" files={keyFiles} onFilesSelected={handleFileSelection('key')} />
              </div>
              
              <FileUpload label="Student Answer Sheets" required files={studentFiles} onFilesSelected={handleFileSelection('student')} />

              {error && (
                <div className="p-5 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-4 animate-shake">
                   <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                   </div>
                   <span>{error}</span>
                </div>
              )}

              <div className="pt-6">
                <button
                  onClick={runEvaluation}
                  disabled={isLoading || qpFiles.length === 0 || studentFiles.length === 0}
                  className={`group w-full py-5 rounded-2xl font-black text-xl transition-all relative overflow-hidden flex items-center justify-center gap-3 ${
                    isLoading 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-slate-900 text-white hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-200 active:scale-[0.98]'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      Evaluating Insights...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      Generate Smart Report
                    </>
                  )}
                </button>
                <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest mt-6">
                  Powered by Gemini Flash Multi-modal Engine
                </p>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'dashboard' && (
          <Dashboard 
            history={history} 
            onViewReport={viewHistoricReport} 
            onDeleteReport={deleteFromHistory}
            onNewEvaluation={startNew}
          />
        )}

        {viewMode === 'report' && currentReport && (
          <EvaluationReportView 
            report={currentReport} 
            onReset={startNew} 
          />
        )}
      </main>

      <footer className="border-t border-slate-200/50 py-16 mt-20 text-center bg-white no-print">
        <div className="flex items-center justify-center gap-3 mb-6 grayscale opacity-40">
           <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold">E</div>
           <span className="text-xl font-bold text-slate-900 tracking-tight">EduGrade AI</span>
        </div>
        <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em] mb-2">Designed for Educators</p>
        <p className="text-slate-300 text-[10px] font-medium">&copy; 2025 AI Academic Services • All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default App;
