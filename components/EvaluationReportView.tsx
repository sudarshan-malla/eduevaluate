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

  const handleDownload = () => window.print();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 print-container">
      <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6 no-print">
        <div>
          <button 
            onClick={onReset}
            className="text-slate-400 hover:text-blue-600 font-bold text-[10px] uppercase tracking-wider mb-2 flex items-center gap-2 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            BACK TO UPLOADER
          </button>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Academic Performance Report</h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleDownload}
            className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-lg hover:bg-slate-50 transition-all shadow-sm font-bold text-[11px] uppercase tracking-wide flex items-center gap-2"
          >
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            PRINT
          </button>
          <button 
            onClick={onReset}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all shadow-sm font-bold text-[11px] uppercase tracking-wide"
          >
            NEW ANALYSIS
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Student Profile</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-8">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student Name</p>
              <p className="text-sm font-bold text-slate-800 uppercase">{report.studentInfo.name || '---'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Roll Number</p>
              <p className="text-sm font-bold text-slate-800">{report.studentInfo.rollNumber || '---'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subject</p>
              <p className="text-sm font-bold text-blue-600 uppercase">{report.studentInfo.subject || '---'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Exam Name</p>
              <p className="text-sm font-medium text-slate-600 uppercase">{report.studentInfo.examName || '---'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class/Grade</p>
              <p className="text-sm font-medium text-slate-600">{report.studentInfo.class || '---'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</p>
              <p className="text-sm font-medium text-slate-600">{report.studentInfo.date || '---'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-6">Aggregate Score</h2>
          <div className="relative w-40 h-40">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={65}
                  outerRadius={80}
                  paddingAngle={5}
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
              <span className="text-3xl font-black text-slate-900 leading-none">{report.totalScore}</span>
              <div className="h-[1px] w-6 bg-slate-200 my-1"></div>
              <span className="text-sm font-bold text-slate-400">{report.maxScore}</span>
            </div>
          </div>
          <div className={`mt-6 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider border uppercase ${report.percentage >= 40 ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-red-50 border-red-200 text-red-600'}`}>
            {report.percentage >= 40 ? 'Qualified' : 'Requires Review'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-8">Question Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '10px'}} />
                <Bar dataKey="score" fill="#2563eb" radius={[3, 3, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-blue-600 p-8 rounded-2xl text-white flex flex-col shadow-lg">
          <h2 className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mb-4">Evaluator Summary</h2>
          <p className="text-sm leading-relaxed italic font-medium">
            "{report.generalFeedback}"
          </p>
          <div className="mt-auto pt-6 flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-blue-200">
             <div className="w-1.5 h-1.5 rounded-full bg-blue-100"></div>
             AI Certified Analysis
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-12">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
           <h2 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Question Wise Analysis</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                <th className="px-8 py-4">No.</th>
                <th className="px-8 py-4">Student Answer</th>
                <th className="px-8 py-4">Model Answer</th>
                <th className="px-8 py-4">Score</th>
                <th className="px-8 py-4">Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {report.grades.map((grade, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-6 font-bold text-slate-900">{grade.questionNumber}</td>
                  <td className="px-8 py-6 text-slate-600 max-w-xs leading-relaxed">{grade.studentAnswer}</td>
                  <td className="px-8 py-6 text-slate-400 italic max-w-xs leading-relaxed">{grade.correctAnswer}</td>
                  <td className="px-8 py-6">
                    <div className="font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100 inline-block text-[10px]">
                      {grade.marksObtained} / {grade.totalMarks}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-slate-500 italic text-[11px]">{grade.feedback}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="hidden print:block text-center text-slate-200 text-[8px] font-bold uppercase tracking-[0.5em] py-10">
        EduGrade AI Transcript • Certified Record • {new Date().toLocaleDateString()}
      </div>
    </div>
  );
};

export default EvaluationReportView;