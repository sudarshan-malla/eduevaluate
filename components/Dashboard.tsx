
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
    // This is a placeholder for direct download, usually we'd re-trigger window.print or generate a PDF blob
    onViewReport(item);
    setTimeout(() => window.print(), 500);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Evaluations Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage and track your student performance history.</p>
        </div>
        <button 
          onClick={onNewEvaluation}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          New Evaluation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Reports</p>
          <p className="text-3xl font-black text-slate-900">{history.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Avg. Score</p>
          <p className="text-3xl font-black text-blue-600">
            {history.length > 0 
              ? (history.reduce((acc, h) => acc + h.report.percentage, 0) / history.length).toFixed(1) 
              : 0}%
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Last Evaluation</p>
          <p className="text-sm font-bold text-slate-700">
            {history.length > 0 ? new Date(history[0].timestamp).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/30">
          <h2 className="text-lg font-bold text-slate-800">Recent Evaluations</h2>
        </div>
        
        {history.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <p className="text-slate-500 font-medium">No evaluations found yet.</p>
            <button onClick={onNewEvaluation} className="text-blue-600 font-bold mt-2 hover:underline">Start your first evaluation</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <th className="px-8 py-4">Student</th>
                  <th className="px-8 py-4">Subject</th>
                  <th className="px-8 py-4">Score</th>
                  <th className="px-8 py-4">Date</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
                          {item.report.studentInfo.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-none mb-1">{item.report.studentInfo.name}</p>
                          <p className="text-xs text-slate-400 font-medium">Roll: {item.report.studentInfo.rollNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-slate-100 rounded-full text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        {item.report.studentInfo.subject}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className={`font-black ${item.report.percentage >= 40 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.report.totalScore}/{item.report.maxScore}
                        </span>
                        <div className="w-16 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                           <div className={`h-full ${item.report.percentage >= 40 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${item.report.percentage}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-500 font-medium">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onViewReport(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Report">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <button onClick={() => downloadReport(item)} className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors" title="Download PDF">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </button>
                        <button onClick={() => onDeleteReport(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
