
import React from 'react';
import { EvaluationReport } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface EvaluationReportViewProps {
  report: EvaluationReport;
  onReset: () => void;
}

const EvaluationReportView: React.FC<EvaluationReportViewProps> = ({ report, onReset }) => {
  const chartData = [
    { name: 'Obtained', value: report.totalScore },
    { name: 'Remaining', value: report.maxScore - report.totalScore },
  ];

  const COLORS = ['#3b82f6', '#e2e8f0'];

  const barData = report.grades.map(g => ({
    name: `Q${g.questionNumber}`,
    score: g.marksObtained,
    total: g.totalMarks
  }));

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Evaluation Report</h1>
          <p className="text-slate-500">Analysis completed successfully.</p>
        </div>
        <button 
          onClick={onReset}
          className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium"
        >
          New Evaluation
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Student Info Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            Student Information
          </h2>
          <div className="grid grid-cols-2 gap-y-4 gap-x-8">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Student Name</p>
              <p className="text-slate-900 font-medium">{report.studentInfo.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Roll Number</p>
              <p className="text-slate-900 font-medium">{report.studentInfo.rollNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subject</p>
              <p className="text-slate-900 font-medium">{report.studentInfo.subject || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Exam</p>
              <p className="text-slate-900 font-medium">{report.studentInfo.examName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Class/Sec</p>
              <p className="text-slate-900 font-medium">{report.studentInfo.class || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date</p>
              <p className="text-slate-900 font-medium">{report.studentInfo.date || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Score Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
          <h2 className="text-lg font-semibold mb-2">Total Score</h2>
          <div className="relative w-40 h-40">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-slate-900">{report.totalScore}/{report.maxScore}</span>
              <span className="text-sm font-medium text-slate-400">{report.percentage}%</span>
            </div>
          </div>
          <div className={`mt-4 px-3 py-1 rounded-full text-sm font-semibold ${report.percentage >= 40 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {report.percentage >= 40 ? 'PASSED' : 'FAILED'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Analysis Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            Performance Breakdown
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Feedback */}
        <div className="bg-blue-600 p-6 rounded-2xl shadow-sm border border-blue-700 text-white flex flex-col">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
            Educator's Feedback
          </h2>
          <p className="text-blue-100 leading-relaxed italic flex-grow">
            "{report.generalFeedback}"
          </p>
          <div className="mt-6 p-4 bg-blue-500/30 rounded-xl border border-blue-400/30 text-sm">
             <span className="font-semibold block mb-1 text-white">Gemini Evaluator Note:</span>
             High accuracy handwriting recognition utilized. Suggestions based on standard curriculum.
          </div>
        </div>
      </div>

      {/* Detailed Question Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
           <h2 className="text-lg font-semibold">Detailed Grading</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Q#</th>
                <th className="px-6 py-4">Student Answer</th>
                <th className="px-6 py-4">Key/Reference</th>
                <th className="px-6 py-4">Marks</th>
                <th className="px-6 py-4">Comments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {report.grades.map((grade, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{grade.questionNumber}</td>
                  <td className="px-6 py-4 text-slate-600 max-w-xs">{grade.studentAnswer}</td>
                  <td className="px-6 py-4 text-slate-400 italic max-w-xs">{grade.correctAnswer}</td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${grade.marksObtained === grade.totalMarks ? 'text-green-600' : grade.marksObtained === 0 ? 'text-red-600' : 'text-orange-500'}`}>
                      {grade.marksObtained}/{grade.totalMarks}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{grade.feedback}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EvaluationReportView;
