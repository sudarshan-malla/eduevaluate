
import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import EvaluationReportView from './components/EvaluationReportView';
import Dashboard from './components/Dashboard';
import { UploadedFile, EvaluationReport, HistoryItem } from './types';
import { evaluateAnswerSheet } from './services/geminiService';

const MAX_FILE_SIZE_MB = 3;
const STORAGE_KEY = 'nextgen_eval_history_v1';

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
  const [hasApiKey, setHasApiKey] = useState(!!process.env.API_KEY);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const selected = await window.aistudio.hasSelectedApiKey();
        if (selected) setHasApiKey(true);
      }
    };
    checkKey();
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setHistory(parsed);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {}
  }, [history]);

  const handleOpenKeySelector = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
      setError(null);
    }
  };

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
          status: (p === 100 ? 'complete' : 'uploading') as any 
        } : f);
      
      if (type === 'qp') setQpFiles(updater);
      else if (type === 'key') setKeyFiles(updater);
      else setStudentFiles(updater);
    };

    for (let p = 0; p <= 100; p += 25) {
      updateProgress(p);
      await new Promise(r => setTimeout(r, 40));
    }
  };

  const handleFileSelection = (type: 'qp' | 'key' | 'student') => async (files: File[]) => {
    setError(null);
    const validFiles = files.filter(f => {
      if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(`"${f.name}" exceeds 3MB limit.`);
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
      if (err.message === 'API_KEY_MISSING') {
        setError("API Key Error: Variable not found. Use the 'Setup API Key' button in the navigation bar.");
      } else if (err.message === 'API_KEY_INVALID') {
        setError("Invalid Key: Please check your API key project and billing.");
      } else if (err.status === 429 || err.message?.includes('429')) {
        setError("AI Quota Exceeded: Too many requests. Please wait a minute and try again.");
      } else {
        setError(err.message || "An error occurred during evaluation.");
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
    <div className="min-h-screen bg-[#fafafa] text-[#001219] selection:bg-[#00cc99]/30">
      <nav className="border-b border-slate-200 px-8 py-5 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-xl z-50 no-print">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={startNew}>
          <div className="w-10 h-10 bg-[#001219] rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:bg-[#006a4e] transition-colors">N</div>
          <div className="leading-tight">
            <span className="text-lg font-black text-[#001219] block tracking-tight">Next-Gen Eval</span>
            <span className="text-[10px] text-[#006a4e] font-bold uppercase tracking-widest">Premium Evaluator</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {!hasApiKey && (
            <button 
              onClick={handleOpenKeySelector}
              className="px-4 py-2.5 text-[10px] font-black text-white bg-[#001219] rounded-lg hover:bg-[#006a4e] transition-all flex items-center gap-2 shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              SETUP API KEY
            </button>
          )}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
            <button 
              onClick={() => setViewMode('uploader')}
              className={`px-5 py-2 text-[10px] font-black rounded-lg transition-all tracking-wider ${viewMode === 'uploader' || viewMode === 'report' ? 'bg-white text-[#001219] shadow-sm' : 'text-slate-500 hover:text-[#001219]'}`}
            >
              EVALUATE
            </button>
            <button 
              onClick={() => setViewMode('dashboard')}
              className={`px-5 py-2 text-[10px] font-black rounded-lg transition-all tracking-wider ${viewMode === 'dashboard' ? 'bg-white text-[#001219] shadow-sm' : 'text-slate-500 hover:text-[#001219]'}`}
            >
              RECORDS
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        {viewMode === 'uploader' && (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-700">
            <div className="text-center mb-16">
              <h1 className="text-5xl font-black text-[#001219] mb-6 tracking-tighter leading-none">
                Academic Answer <br/> <span className="text-[#00cc99]">Evaluation System.</span>
              </h1>
              <p className="text-slate-500 font-medium max-w-xl mx-auto leading-relaxed text-lg">
                Utilize advanced vision AI to evaluate handwritten student work with professional precision and instant grading.
              </p>
            </div>

            <div className="bg-white shadow-2xl rounded-3xl p-10 border border-slate-100 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <FileUpload label="Question Paper" required files={qpFiles} onFilesSelected={handleFileSelection('qp')} />
                <FileUpload label="Answer Key (Optional)" files={keyFiles} onFilesSelected={handleFileSelection('key')} />
              </div>
              
              <FileUpload label="Student Answer Sheet(s)" required files={studentFiles} onFilesSelected={handleFileSelection('student')} />

              {error && (
                <div className="p-5 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-4 animate-shake">
                   <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   </div>
                   <div className="flex flex-col leading-tight">
                      <span>{error}</span>
                      {!hasApiKey && (
                        <button onClick={handleOpenKeySelector} className="text-[11px] underline mt-1.5 font-black uppercase tracking-wider text-red-700">Configure API Key</button>
                      )}
                   </div>
                </div>
              )}

              <div className="pt-6">
                <button
                  onClick={runEvaluation}
                  disabled={isLoading || qpFiles.length === 0 || studentFiles.length === 0}
                  className={`w-full py-6 rounded-2xl font-black text-xl transition-all flex items-center justify-center gap-4 shadow-xl ${
                    isLoading 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                    : 'bg-[#001219] text-white hover:bg-[#006a4e] active:scale-[0.98] shadow-green-100'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-6 h-6 border-3 border-slate-300 border-t-[#00cc99] rounded-full animate-spin"></div>
                      PROCESSING EVALUATION...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      START EVALUATION
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

      <footer className="py-20 mt-20 text-center no-print border-t border-slate-100">
        <div className="w-12 h-1 bg-slate-200 mx-auto mb-8 rounded-full"></div>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mb-2">&copy; 2025 Next-Gen Eval</p>
        <p className="text-slate-300 text-[9px] font-bold uppercase tracking-widest mb-4">Professional Academic Solutions</p>
        <p className="text-[#006a4e] text-[10px] font-black uppercase tracking-[0.2em]">Developed From the minds of Aarshiv AI</p>
      </footer>
    </div>
  );
};

export default App;
