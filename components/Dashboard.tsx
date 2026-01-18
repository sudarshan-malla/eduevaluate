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
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Evaluation Vault</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">Archive of Academic Assessments</p>
        </div>
        <button 
          onClick={onNewEvaluation}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-md transition-all active:scale-95 flex items-center gap-2 uppercase text-[10px] tracking-wide"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
          New Analysis
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Records</p>
          <p className="text-3xl font-black text-slate-900">{history?.length || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Average Percentage</p>
          <p className="text-3xl font-black text-slate-900">
            {history?.length > 0 
              ? (history.reduce((acc, h) => acc + h.report.percentage, 0) / history.length).toFixed(1) 
              : 0}%
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Last Activity</p>
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mt-2">
            {history?.length > 0 ? new Date(history[0].timestamp).toLocaleDateString() : 'No activity'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Academic Record Ledger</h2>
        </div>
        
        {!history || history.length === 0 ? (
          <div className="p-16 text-center">
            <svg className="w-12 h-12 text-slate-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No evaluation records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-8 py-4">Student</th>
                  <th className="px-8 py-4">Subject</th>
                  <th className="px-8 py-4">Performance</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/30 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center font-bold text-sm shadow-sm">
                          {item.report.studentInfo.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-xs tracking-tight leading-none mb-1 uppercase">{item.report.studentInfo.name}</p>
                          <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Roll: {item.report.studentInfo.rollNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-2 py-0.5 bg-blue-50 border border-blue-100 rounded text-[9px] font-bold text-blue-600 uppercase tracking-widest">
                        {item.report.studentInfo.subject}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className={`font-bold text-[11px] ${item.report.percentage >= 40 ? 'text-slate-700' : 'text-red-500'}`}>
                          {item.report.totalScore} / {item.report.maxScore}
                        </span>
                        <div className="w-12 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                           <div className={`h-full ${item.report.percentage >= 40 ? 'bg-blue-600' : 'bg-red-500'}`} style={{ width: `${item.report.percentage}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => onViewReport(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <button onClick={() => onDeleteReport(item.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-all">
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