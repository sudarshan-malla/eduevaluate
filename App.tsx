import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import EvaluationReportView from './components/EvaluationReportView';
import Dashboard from './components/Dashboard';
import { UploadedFile, EvaluationReport, HistoryItem } from './types';
import { evaluateAnswerSheet } from './services/geminiService';

const MAX_FILE_SIZE_MB = 3;
const STORAGE_KEY = 'edugrade_history_v3';

type ViewMode = 'uploader' | 'dashboard' | 'report' | 'setup';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('uploader');
  const [qpFiles, setQpFiles] = useState<UploadedFile[]>([]);
  const [keyFiles, setKeyFiles] = useState<UploadedFile[]>([]);
  const [studentFiles, setStudentFiles] = useState<UploadedFile[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentReport, setCurrentReport] = useState<EvaluationReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Safety check for API Key on mount
  useEffect(() => {
    const checkKey = async () => {
      let isKeySet = false;
      try {
        if (typeof process !== 'undefined' && process.env.API_KEY) {
          isKeySet = true;
        } else if ((window as any).aistudio && await (window as any).aistudio.hasSelectedApiKey()) {
          isKeySet = true;
        }
      } catch (e) {
        console.warn("Key check encountered an issue", e);
      }
      
      if (!isKeySet) {
        setViewMode('setup');
      }
    };
    
    checkKey();
  }, []);

  const handleOpenKeySelector = async () => {
    try {
      if ((window as any).aistudio) {
        await (window as any).aistudio.openSelectKey();
        setViewMode('uploader');
        setError(null);
      } else {
        setError("Key selector is unavailable. Please set the API_KEY environment variable manually.");
      }
    } catch (e) {
      console.error("Failed to open key selector", e);
    }
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setHistory(parsed);
      }
    } catch (e) {
      console.warn("Could not load history from storage", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn("Could not save history to storage", e);
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

    for (let p = 0; p <= 100; p += 20) {
      updateProgress(p);
      await new Promise(r => setTimeout(r, 80));
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
      if (err.message === 'API_KEY_MISSING') {
        setError("API configuration not found. Please select a project key.");
        setViewMode('setup');
      } else if (err.message.includes("Requested entity was not found")) {
        setError("Project session expired or invalid. Please re-select your key.");
        setViewMode('setup');
      } else {
        setError(err.message || "Failed to process evaluation.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const viewHistoricReport = (item: HistoryItem) => {
    setCurrentReport(item.report);
    setViewMode('report');
  };

  const deleteFromHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
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
      {/* Premium Navbar */}
      <nav className="border-b border-white/5 px-8 py-5 flex justify-between items-center sticky top-0 bg-[#000000]/80 backdrop-blur-xl z-50 no-print">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setViewMode('uploader')}>
          <div className="w-10 h-10 bg-[#FCA311] rounded flex items-center justify-center text-black font-black text-xl shadow-[0_0_15px_rgba(252,163,17,0.4)] transition-transform group-hover:rotate-3">E</div>
          <div>
            <span className="text-lg font-black tracking-tight block leading-none">EduGrade AI</span>
            <span className="text-[10px] text-[#FCA311] font-bold uppercase tracking-[0.2em]">Academic Analytics</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
          <button 
            onClick={() => setViewMode('uploader')}
            className={`px-5 py-2 text-[10px] font-black rounded-lg transition-all tracking-widest ${viewMode === 'uploader' ? 'bg-[#FCA311] text-black shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
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
        {viewMode === 'setup' && (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="w-24 h-24 bg-[#FCA311]/10 rounded-[32px] flex items-center justify-center mb-10 border border-[#FCA311]/20 shadow-2xl">
                <svg className="w-12 h-12 text-[#FCA311]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
             </div>
             <h2 className="text-4xl font-black text-white mb-4 tracking-tighter">AUTHENTICATION REQUIRED</h2>
             <p className="text-white/50 text-center max-w-md mb-12 leading-relaxed">
               To activate the Gemini Pro multimodal engine on this platform, you must authorize this application session with a project key.
             </p>
             <button 
               onClick={handleOpenKeySelector}
               className="bg-[#FCA311] text-black px-12 py-5 rounded-2xl font-black text-sm tracking-[0.2em] shadow-[0_0_30px_rgba(252,163,17,0.3)] hover:bg-white hover:scale-105 active:scale-95 transition-all uppercase"
             >
               Authorize Session Key
             </button>
             <p className="mt-10 text-[9px] text-white/20 font-black tracking-[0.4em] uppercase">
               Secured Academic Pipeline
             </p>
             {error && (
               <div className="mt-12 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold animate-shake text-center max-w-sm">
                 {error}
               </div>
             )}
          </div>
        )}

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
                Analyze handwriting and assess knowledge with industrial precision using our pro-tier multimodal analysis engine.
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
                   <span>{error}</span>
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
                      PROCESSING ARCHIVES...
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
            onViewReport={viewHistoricReport} 
            onDeleteReport={deleteFromHistory}
            onNewEvaluation={startNew}
          />
        )}

        {viewMode === 'report' && currentReport && (
          <EvaluationReportView report={currentReport} onReset={startNew} />
        )}
      </main>

      <footer className="border-t border-white/5 py-20 mt-20 text-center no-print opacity-50">
        <div className="flex items-center justify-center gap-2 mb-6 grayscale brightness-200">
           <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center text-white font-black">E</div>
           <span className="text-xl font-black tracking-tight">EduGrade AI</span>
        </div>
        <p className="text-[#FCA311] text-[10px] font-black uppercase tracking-[0.5em] mb-4">The Gold Standard of Evaluation</p>
        <p className="text-white/20 text-[9px] font-medium tracking-widest uppercase">&copy; 2025 Premium Academic Services • Global AI Network</p>
      </footer>
    </div>
  );
};

export default App;