import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import EvaluationReportView from './components/EvaluationReportView';
import Dashboard from './components/Dashboard';
import { UploadedFile, EvaluationReport, HistoryItem } from './types';
import { evaluateAnswerSheet } from './services/geminiService';

const MAX_FILE_SIZE_MB = 3;
const STORAGE_KEY = 'edugrade_history_v3';

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

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setHistory(parsed);
      }
    } catch (e) {
      console.warn("Could not load history", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn("Could not save history", e);
    }
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

    for (let p = 0; p <= 100; p += 25) {
      updateProgress(p);
      await new Promise(r => setTimeout(r, 60));
    }
  };

  const handleFileSelection = (type: 'qp' | 'key' | 'student') => async (files: File[]) => {
    setError(null);
    const validFiles = files.filter(f => {
      if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(`"${f.name}" is too large (Max ${MAX_FILE_SIZE_MB}MB).`);
        return false;
      }
      return true;
    });

    const newFiles = await Promise.all(validFiles.map(async (file) => {
      const preview = await fileToBase64(file);
      return { file, preview, progress: 0, status: 'uploading' as const };
    }));

    if (type === 'qp') setQpFiles(prev => [...prev, ...newFiles]);
    if (type === 'key') setKeyFiles(prev => [...prev, ...newFiles]);
    if (type === 'student') setStudentFiles(prev => [...prev, ...newFiles]);

    newFiles.forEach(f => simulateProgress(f.file.name, type));
  };

  const runEvaluation = async () => {
    if (qpFiles.length === 0 || studentFiles.length === 0) {
      setError("Please upload Question Paper and Student Answer Sheets.");
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
      console.error("Evaluation Error:", err);
      // Catch common API key issues thrown by the SDK
      if (err.message?.toLowerCase().includes('apikey') || err.message?.toLowerCase().includes('invalid')) {
        setError("API Key Error: The browser cannot access your API_KEY. Verify it is set in Netlify Environment Variables AND that you have performed a 'Clear cache and deploy' to inject it into the production build.");
      } else {
        setError(err.message || "An unexpected error occurred during evaluation. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
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
    <div className="min-h-screen bg-[#14213D] text-white selection:bg-[#FCA311]/40">
      <nav className="border-b border-white/5 px-8 py-5 flex justify-between items-center sticky top-0 bg-[#000000]/80 backdrop-blur-xl z-50 no-print">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={startNew}>
          <div className="w-10 h-10 bg-[#FCA311] rounded flex items-center justify-center text-black font-black text-xl shadow-[0_0_15px_rgba(252,163,17,0.4)] transition-transform group-hover:rotate-3">E</div>
          <div>
            <span className="text-lg font-black tracking-tight block leading-none">EduGrade AI</span>
            <span className="text-[10px] text-[#FCA311] font-bold uppercase tracking-[0.2em]">Academic Analytics</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
          <button 
            onClick={() => setViewMode('uploader')}
            className={`px-5 py-2 text-[10px] font-black rounded-lg transition-all tracking-widest ${viewMode === 'uploader' || viewMode === 'report' ? 'bg-[#FCA311] text-black shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
          >
            NEW
          </button>
          <button 
            onClick={() => setViewMode('dashboard')}
            className={`px-5 py-2 text-[10px] font-black rounded-lg transition-all tracking-widest ${viewMode === 'dashboard' ? 'bg-[#FCA311] text-black shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
          >
            HISTORY
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-16">
        {viewMode === 'uploader' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-1.5 bg-[#FCA311]/10 text-[#FCA311] rounded-full text-[9px] font-black uppercase tracking-[0.4em] mb-6 border border-[#FCA311]/20">
                Next-Gen Grading Engine
              </div>
              <h1 className="text-6xl font-black text-white mb-6 tracking-tighter leading-none">
                Elite Academic <br/> <span className="text-[#FCA311]">Evaluation.</span>
              </h1>
              <p className="text-white/50 font-medium max-w-lg mx-auto leading-relaxed">
                Using Gemini 3 Pro reasoning to analyze handwriting and assess knowledge with unprecedented accuracy.
              </p>
            </div>

            <div className="bg-black/20 backdrop-blur-md rounded-[32px] p-10 border border-white/5 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <FileUpload label="Question Paper" required files={qpFiles} onFilesSelected={handleFileSelection('qp')} />
                <FileUpload label="Answer Key (Optional)" files={keyFiles} onFilesSelected={handleFileSelection('key')} />
              </div>
              
              <FileUpload label="Student Answer Sheet(s)" required files={studentFiles} onFilesSelected={handleFileSelection('student')} />

              {error && (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold flex items-center gap-4 animate-shake">
                   <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                   </div>
                   <span className="leading-tight">{error}</span>
                </div>
              )}

              <div className="pt-6">
                <button
                  onClick={runEvaluation}
                  disabled={isLoading || qpFiles.length === 0 || studentFiles.length === 0}
                  className={`group w-full py-6 rounded-2xl font-black text-xl tracking-tighter transition-all relative overflow-hidden flex items-center justify-center gap-4 ${
                    isLoading 
                    ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5' 
                    : 'bg-[#FCA311] text-black hover:bg-white hover:shadow-[0_0_30px_rgba(252,163,17,0.3)] active:scale-[0.98]'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                      DECODING HANDWRITING...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      GENERATE TRANSCRIPT
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'dashboard' && (
          <Dashboard 
            history={history} 
            onViewReport={(item) => { setCurrentReport(item.report); setViewMode('report'); }} 
            onDeleteReport={(id) => setHistory(prev => prev.filter(item => item.id !== id))}
            onNewEvaluation={startNew}
          />
        )}

        {viewMode === 'report' && currentReport && (
          <EvaluationReportView report={currentReport} onReset={startNew} />
        )}
      </main>

      <footer className="border-t border-white/5 py-20 mt-20 text-center no-print opacity-50">
        <p className="text-[#FCA311] text-[10px] font-black uppercase tracking-[0.5em] mb-4">Powered by Gemini 3 Pro • Global Evaluation Network</p>
        <p className="text-white/20 text-[9px] font-medium tracking-widest uppercase">&copy; 2025 EduGrade AI</p>
      </footer>
    </div>
  );
};

export default App;