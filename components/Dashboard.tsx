import React from 'react';
import { HistoryItem } from '../types';

interface DashboardProps {
  history: HistoryItem[];
  onViewReport: (item: HistoryItem) => void;
  onDeleteReport: (id: string) => void;
  onNewEvaluation: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ history, onViewReport, onDeleteReport, onNewEvaluation }) => {
  const downloadReport = (item: HistoryItem) => {
    onViewReport(item);
    setTimeout(() => {
      window.print();
    }, 800);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter">EVALUATION VAULT</h1>
          <p className="text-[#FCA311] text-[10px] font-black uppercase tracking-[0.4em] mt-2">ARCHIVED PERFORMANCE RECORDS</p>
        </div>
        <button 
          onClick={onNewEvaluation}
          className="bg-[#FCA311] hover:bg-white text-black px-8 py-4 rounded-xl font-black shadow-2xl transition-all active:scale-95 flex items-center gap-3 uppercase text-[10px] tracking-widest"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
          NEW ASSESSMENT
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-black/40 backdrop-blur-md p-8 rounded-[24px] border border-white/5">
          <p className="text-[9px] font-black text-[#FCA311] uppercase tracking-[0.3em] mb-3">TOTAL REPORTS</p>
          <p className="text-4xl font-black text-white">{history?.length || 0}</p>
        </div>
        <div className="bg-black/40 backdrop-blur-md p-8 rounded-[24px] border border-white/5">
          <p className="text-[9px] font-black text-[#FCA311] uppercase tracking-[0.3em] mb-3">AVG. PROFICIENCY</p>
          <p className="text-4xl font-black text-white">
            {history?.length > 0 
              ? (history.reduce((acc, h) => acc + h.report.percentage, 0) / history.length).toFixed(1) 
              : 0}%
          </p>
        </div>
        <div className="bg-black/40 backdrop-blur-md p-8 rounded-[24px] border border-white/5">
          <p className="text-[9px] font-black text-[#FCA311] uppercase tracking-[0.3em] mb-3">LATEST UPDATE</p>
          <p className="text-xs font-black text-white uppercase tracking-widest mt-2">
            {history?.length > 0 ? new Date(history[0].timestamp).toLocaleDateString() : 'NO RECORDS'}
          </p>
        </div>
      </div>

      <div className="bg-black/40 backdrop-blur-md rounded-[32px] border border-white/10 overflow-hidden shadow-2xl">
        <div className="px-10 py-8 border-b border-white/5 bg-white/5">
          <h2 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">ACADEMIC LEDGER</h2>
        </div>
        
        {!history || history.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
              <svg className="w-8 h-8 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <p className="text-white/20 font-black uppercase text-[10px] tracking-widest">Repository is currently empty.</p>
            <button onClick={onNewEvaluation} className="text-[#FCA311] font-black text-[10px] uppercase tracking-widest mt-4 hover:underline">Start First Evaluation</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-[8px] font-black text-white/30 uppercase tracking-[0.4em]">
                  <th className="px-10 py-6">STUDENT PROFILE</th>
                  <th className="px-10 py-6">DISCIPLINE</th>
                  <th className="px-10 py-6">METRIC</th>
                  <th className="px-10 py-6">DATE</th>
                  <th className="px-10 py-6 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-all group">
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#FCA311] text-black rounded-lg flex items-center justify-center font-black text-base shadow-lg shadow-black/40">
                          {item.report.studentInfo.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-black text-white uppercase text-xs tracking-widest leading-none mb-1">{item.report.studentInfo.name}</p>
                          <p className="text-[8px] text-white/30 font-black uppercase tracking-widest">ID: {item.report.studentInfo.rollNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded text-[9px] font-black text-[#FCA311] uppercase tracking-widest">
                        {item.report.studentInfo.subject}
                      </span>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex flex-col">
                        <span className={`font-black text-xs ${item.report.percentage >= 40 ? 'text-white' : 'text-red-500'}`}>
                          {item.report.totalScore} / {item.report.maxScore}
                        </span>
                        <div className="w-16 h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                           <div className={`h-full ${item.report.percentage >= 40 ? 'bg-[#FCA311]' : 'bg-red-500'}`} style={{ width: `${item.report.percentage}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7 text-[9px] text-white/30 font-black uppercase tracking-widest">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-10 py-7 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => onViewReport(item)} className="p-2.5 text-white/60 hover:text-white bg-white/5 rounded-lg border border-white/10 hover:border-[#FCA311] transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <button onClick={() => downloadReport(item)} className="p-2.5 text-[#FCA311] hover:text-white bg-white/5 rounded-lg border border-white/10 hover:border-[#FCA311] transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </button>
                        <button onClick={() => onDeleteReport(item.id)} className="p-2.5 text-red-500/60 hover:text-red-500 bg-white/5 rounded-lg border border-white/10 hover:border-red-500 transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;