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

  const COLORS = ['#FCA311', 'rgba(255,255,255,0.05)'];

  const barData = report.grades.map(g => ({
    name: `Q${g.questionNumber}`,
    score: g.marksObtained,
    total: g.totalMarks
  }));

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 print-container">
      <div className="flex flex-col md:flex-row justify-between items-start mb-14 gap-8 no-print">
        <div>
          <button 
            onClick={onReset}
            className="text-white/40 hover:text-[#FCA311] font-black text-[10px] uppercase tracking-[0.4em] mb-4 flex items-center gap-3 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            ESC TO ENGINE
          </button>
          <h1 className="text-5xl font-black text-white tracking-tighter">TRANSCRIPT ANALYSIS</h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleDownload}
            className="bg-black/40 backdrop-blur-md border border-white/10 text-white px-8 py-4 rounded-xl hover:border-[#FCA311] transition-all shadow-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3"
          >
            <svg className="w-4 h-4 text-[#FCA311]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            PRINT RECORD
          </button>
          <button 
            onClick={onReset}
            className="bg-[#FCA311] text-black px-8 py-4 rounded-xl hover:bg-white transition-all shadow-[0_0_25px_rgba(252,163,17,0.3)] font-black text-[10px] uppercase tracking-widest"
          >
            NEW ANALYSIS
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-10">
        <div className="bg-black/40 backdrop-blur-md p-10 rounded-[32px] border border-white/5 lg:col-span-2">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-[#FCA311]/10 text-[#FCA311] border border-[#FCA311]/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </div>
            <h2 className="text-[11px] font-black text-white uppercase tracking-[0.5em]">CANDIDATE DOSSIER</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-12 gap-x-10 text-sm">
            <div className="space-y-2">
              <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">CANDIDATE NAME</p>
              <p className="text-white font-black uppercase tracking-widest">{report.studentInfo.name || 'UNKNOWN'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">IDENTIFIER</p>
              <p className="text-white font-black uppercase tracking-widest">{report.studentInfo.rollNumber || 'UNKNOWN'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">DISCIPLINE</p>
              <p className="text-[#FCA311] font-black uppercase tracking-widest">{report.studentInfo.subject || 'UNKNOWN'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">EXAMINATION</p>
              <p className="text-white font-bold uppercase tracking-widest text-xs">{report.studentInfo.examName || 'UNSPECIFIED'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">CLASSIFICATION</p>
              <p className="text-white font-bold uppercase tracking-widest text-xs">{report.studentInfo.class || 'UNSPECIFIED'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">CHRONOLOGY</p>
              <p className="text-white font-bold uppercase tracking-widest text-xs">{report.studentInfo.date || 'UNSPECIFIED'}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#000000] p-10 rounded-[32px] border border-white/10 flex flex-col items-center justify-center text-center shadow-2xl">
          <h2 className="text-[9px] font-black text-[#FCA311] uppercase tracking-[0.5em] mb-10">PROFICIENCY INDEX</h2>
          <div className="relative w-52 h-52">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={85}
                  outerRadius={100}
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
              <span className="text-5xl font-black text-white tracking-tighter">{report.totalScore}</span>
              <div className="h-[2px] w-8 bg-[#FCA311] my-2"></div>
              <span className="text-xl font-bold text-white/20">{report.maxScore}</span>
            </div>
          </div>
          <div className={`mt-10 px-8 py-3 rounded-xl text-[9px] font-black tracking-[0.4em] border-2 uppercase ${report.percentage >= 40 ? 'bg-[#FCA311]/5 border-[#FCA311] text-[#FCA311]' : 'bg-red-500/5 border-red-500 text-red-500'}`}>
            {report.percentage >= 40 ? 'CREDIT' : 'RESUBMIT'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-10">
        <div className="bg-black/40 backdrop-blur-md p-10 rounded-[32px] border border-white/5 lg:col-span-2">
          <h2 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
             <div className="w-10 h-10 bg-white/5 text-[#FCA311] border border-white/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
             </div>
             ITEMIZED DISTRIBUTION
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#FFFFFF40', fontSize: 10, fontWeight: 900}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#FFFFFF40', fontSize: 10, fontWeight: 900}} />
                <Tooltip cursor={{fill: '#FCA31110'}} contentStyle={{backgroundColor: '#000', border: '1px solid #FFFFFF20', borderRadius: '12px', padding: '12px'}} />
                <Bar dataKey="score" fill="#FCA311" radius={[4, 4, 0, 0]} barSize={34} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#000000] p-10 rounded-[32px] border border-white/10 text-white flex flex-col relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#FCA311]/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <h2 className="text-[10px] font-black text-[#FCA311] uppercase tracking-[0.5em] mb-8 flex items-center gap-4 relative z-10">
            <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-[#FCA311]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
            </div>
            AI SYNTHESIS
          </h2>
          <p className="text-white/80 leading-relaxed italic text-xl relative z-10 font-medium tracking-tight">
            "{report.generalFeedback}"
          </p>
          <div className="mt-auto pt-10 flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.4em] text-[#FCA311]/60 relative z-10">
             <div className="w-2 h-2 rounded-full bg-[#FCA311] shadow-[0_0_12px_#FCA311]"></div>
             CERTIFIED BY CORE ENGINE PRO
          </div>
        </div>
      </div>

      <div className="bg-black/40 backdrop-blur-md rounded-[32px] border border-white/5 overflow-hidden mb-20 shadow-2xl">
        <div className="p-10 border-b border-white/5 bg-white/5">
           <h2 className="text-[11px] font-black text-white uppercase tracking-[0.5em]">ITEMIZED TRANSCRIPT</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-white/30 text-[9px] font-black uppercase tracking-[0.5em]">
                <th className="px-10 py-7">INDEX</th>
                <th className="px-10 py-7">SUBMISSION CORE</th>
                <th className="px-10 py-7">REFERENCE KEY</th>
                <th className="px-10 py-7">METRIC</th>
                <th className="px-10 py-7">OBSERVATIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {report.grades.map((grade, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-all">
                  <td className="px-10 py-8 font-black text-white tracking-widest">{grade.questionNumber}</td>
                  <td className="px-10 py-8 text-white/70 max-w-sm leading-relaxed tracking-tight">{grade.studentAnswer}</td>
                  <td className="px-10 py-8 text-white/20 italic max-w-sm leading-relaxed tracking-tight">{grade.correctAnswer}</td>
                  <td className="px-10 py-8">
                    <div className="font-black text-black bg-[#FCA311] px-3 py-1.5 rounded-lg inline-block uppercase tracking-tighter shadow-lg">
                      {grade.marksObtained} / {grade.totalMarks}
                    </div>
                  </td>
                  <td className="px-10 py-8 text-white/40 font-bold leading-relaxed italic uppercase tracking-wider text-[10px]">{grade.feedback}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="hidden print:block text-center text-white/10 text-[9px] font-black uppercase tracking-[0.8em] py-20">
        PREMIUM ACADEMIC TRANSCRIPT • EDUGRADE AI GLOBAL • {new Date().toLocaleDateString()}
      </div>
    </div>
  );
};

export default EvaluationReportView;