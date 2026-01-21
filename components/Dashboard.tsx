import React from 'react';
import { HistoryItem } from '../types';

interface DashboardProps {
  history: HistoryItem[];
  onViewReport: (item: HistoryItem) => void;
  onDeleteReport: (id: string) => void;
  onNewEvaluation: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ history, onViewReport, onDeleteReport, onNewEvaluation }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#001219] tracking-tighter">Academic Vault</h1>
          <p className="text-[#006a4e] text-[11px] font-black uppercase tracking-[0.2em] mt-1.5">Archive of Secure Assessments</p>
        </div>
        <button 
          onClick={onNewEvaluation}
          className="bg-[#001219] hover:bg-[#006a4e] text-white px-8 py-3.5 rounded-2xl font-black shadow-xl transition-all active:scale-95 flex items-center gap-3 uppercase text-[11px] tracking-[0.1em]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 4v16m8-8H4" /></svg>
          New Analysis
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl group hover:border-[#00cc99]/20 transition-colors">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 group-hover:text-[#006a4e] transition-colors">Total Evaluated</p>
          <p className="text-4xl font-black text-[#001219] tracking-tighter">{history?.length || 0}</p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl group hover:border-[#00cc99]/20 transition-colors">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 group-hover:text-[#006a4e] transition-colors">Avg Performance</p>
          <p className="text-4xl font-black text-[#001219] tracking-tighter">
            {history?.length > 0 
              ? (history.reduce((acc, h) => acc + h.report.percentage, 0) / history.length).toFixed(1) 
              : 0}<span className="text-xl">%</span>
          </p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl group hover:border-[#00cc99]/20 transition-colors">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 group-hover:text-[#006a4e] transition-colors">Latest Record</p>
          <p className="text-sm font-black text-slate-600 uppercase tracking-widest mt-2">
            {history?.length > 0 ? new Date(history[0].timestamp).toLocaleDateString() : 'No Activity'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden">
        <div className="px-10 py-6 border-b border-slate-50 bg-slate-50/50">
          <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Validated Academic Records</h2>
        </div>
        
        {!history || history.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.4em]">Vault is currently empty</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <th className="px-10 py-5">Candidate</th>
                  <th className="px-10 py-5">Module</th>
                  <th className="px-10 py-5">Performance</th>
                  <th className="px-10 py-5 text-right">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/40 transition-all group">
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#001219] text-white rounded-xl flex items-center justify-center font-black text-base shadow-lg group-hover:bg-[#006a4e] transition-colors">
                          {item.report.studentInfo.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-black text-[#001219] text-[13px] tracking-tight leading-none mb-1.5 uppercase">{item.report.studentInfo.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold tracking-[0.1em] uppercase">UID: {item.report.studentInfo.rollNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <span className="px-3 py-1 bg-[#00cc99]/5 border border-[#00cc99]/10 rounded-lg text-[10px] font-black text-[#006a4e] uppercase tracking-widest">
                        {item.report.studentInfo.subject}
                      </span>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex flex-col">
                        <span className={`font-black text-[12px] tracking-tighter ${item.report.percentage >= 40 ? 'text-[#001219]' : 'text-red-500'}`}>
                          {item.report.totalScore} / {item.report.maxScore}
                        </span>
                        <div className="w-16 h-2 bg-slate-100 rounded-full mt-2.5 overflow-hidden">
                           <div className={`h-full ${item.report.percentage >= 40 ? 'bg-[#006a4e]' : 'bg-red-500'}`} style={{ width: `${item.report.percentage}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7 text-right">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => onViewReport(item)} className="p-2.5 text-slate-400 hover:text-[#006a4e] hover:bg-[#00cc99]/5 rounded-xl transition-all">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <button onClick={() => onDeleteReport(item.id)} className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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