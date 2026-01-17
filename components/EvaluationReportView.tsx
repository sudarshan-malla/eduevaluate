
import React from 'react';
import { EvaluationReport } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface EvaluationReportViewProps {
  report: EvaluationReport;
  onReset: () => void;
}

const EvaluationReportView: React.FC<EvaluationReportViewProps> = ({ report, onReset }) => {
  const chartData = [
    { name: 'Obtained', value: report.totalScore },
    { name: 'Remaining', value: Math.max(0, report.maxScore - report.totalScore) },
  ];

  const COLORS = ['#2563eb', '#f1f5f9'];

  const barData = report.grades.map(g => ({
    name: `Q${g.questionNumber}`,
    score: g.marksObtained,
    total: g.totalMarks
  }));

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6 no-print">
        <div>
          <button 
            onClick={onReset}
            className="text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Home
          </button>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Report Summary</h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => window.print()}
            className="bg-white border-2 border-slate-100 text-slate-700 px-6 py-3 rounded-2xl hover:border-blue-100 hover:bg-blue-50 transition-all shadow-sm font-bold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </button>
          <button 
            onClick={onReset}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-bold"
          >
            New Evaluation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Student Info Card */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </div>
            <h2 className="text-xl font-black text-slate-900">Student Profile</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</p>
              <p className="text-slate-900 font-bold text-lg">{report.studentInfo.name || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Number</p>
              <p className="text-slate-900 font-bold text-lg">{report.studentInfo.rollNumber || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</p>
              <p className="text-blue-600 font-bold text-lg">{report.studentInfo.subject || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assessment</p>
              <p className="text-slate-900 font-bold">{report.studentInfo.examName || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Class</p>
              <p className="text-slate-900 font-bold">{report.studentInfo.class || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
              <p className="text-slate-900 font-bold">{report.studentInfo.date || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Score Card */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Aggregate Result</h2>
          <div className="relative w-48 h-48">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-black text-slate-900">{report.totalScore}</span>
              <div className="h-[2px] w-8 bg-slate-100 my-1"></div>
              <span className="text-lg font-bold text-slate-400">{report.maxScore}</span>
            </div>
          </div>
          <div className={`mt-8 px-6 py-2 rounded-2xl text-xs font-black tracking-widest ${report.percentage >= 40 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {report.percentage >= 40 ? 'QUALIFIED' : 'DISQUALIFIED'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Analysis Bar Chart */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-3">
             <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
             </div>
             Question-wise Performance
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}} />
                <Bar dataKey="score" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Feedback */}
        <div className="bg-slate-900 p-8 rounded-[32px] shadow-sm text-white flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <h2 className="text-lg font-bold mb-6 flex items-center gap-3 relative z-10">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
            </div>
            AI Counselor's Notes
          </h2>
          <p className="text-slate-300 leading-relaxed italic text-lg relative z-10">
            "{report.generalFeedback}"
          </p>
          <div className="mt-auto pt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 relative z-10">
             <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
             Analysis by Gemini Flash
          </div>
        </div>
      </div>

      {/* Detailed Question Table */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden mb-12">
        <div className="p-8 border-b border-slate-50">
           <h2 className="text-xl font-black text-slate-900">Comprehensive Itemized List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-5">#</th>
                <th className="px-8 py-5">Submissions</th>
                <th className="px-8 py-5">Reference</th>
                <th className="px-8 py-5">Score</th>
                <th className="px-8 py-5">Observations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {report.grades.map((grade, idx) => (
                <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-8 py-6 font-black text-slate-900">{grade.questionNumber}</td>
                  <td className="px-8 py-6 text-slate-600 max-w-sm leading-relaxed">{grade.studentAnswer}</td>
                  <td className="px-8 py-6 text-slate-400 italic max-w-sm leading-relaxed">{grade.correctAnswer}</td>
                  <td className="px-8 py-6">
                    <div className={`px-3 py-1.5 rounded-xl font-black inline-block ${grade.marksObtained === grade.totalMarks ? 'bg-green-50 text-green-600' : grade.marksObtained === 0 ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                      {grade.marksObtained}/{grade.totalMarks}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-slate-500 font-medium leading-relaxed">{grade.feedback}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="hidden print:block text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest py-10">
        EduGrade AI Official Transcript • {new Date().toLocaleString()}
      </div>
    </div>
  );
};

export default EvaluationReportView;
