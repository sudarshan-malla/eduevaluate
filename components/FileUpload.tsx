import React from 'react';
import { UploadedFile } from '../types';

interface FileUploadProps {
  label: string;
  onFilesSelected: (files: File[]) => void;
  files: UploadedFile[];
  multiple?: boolean;
  required?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ label, onFilesSelected, files, multiple = true, required = false }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <label className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em]">
          {label} {required && <span className="text-[#FCA311] font-black">*</span>}
        </label>
        <span className="text-[8px] bg-white/5 text-white/30 px-3 py-1 rounded-full font-black uppercase tracking-widest border border-white/5">
          {files.length} ITEMS
        </span>
      </div>
      
      <div className="flex flex-col gap-5">
        <label className="relative flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-white/10 rounded-[20px] cursor-pointer hover:border-[#FCA311] hover:bg-[#FCA311]/5 transition-all group overflow-hidden bg-black/30 backdrop-blur-sm">
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#FCA311]/10 transition-all border border-white/5">
              <svg className="w-6 h-6 text-white/20 group-hover:text-[#FCA311] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-[10px] text-white/60 font-black uppercase tracking-widest">
              <span className="text-[#FCA311] underline underline-offset-4">IMPORT FILES</span> or drag
            </p>
            <p className="mt-3 text-[8px] text-white/20 font-black uppercase tracking-[0.3em]">MAX 3MB • PDF/JPG/PNG</p>
          </div>
          <input type="file" className="hidden" multiple={multiple} onChange={handleChange} accept="image/*,application/pdf" />
        </label>
        
        {files.length > 0 && (
          <div className="grid grid-cols-1 gap-3">
            {files.map((f, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-black/40 border border-white/10 rounded-xl shadow-2xl animate-in fade-in slide-in-from-left-2 backdrop-blur-md">
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 border border-white/5">
                  {f.file.type.includes('image') ? (
                    <img src={f.preview} alt="Preview" className="w-full h-full object-cover grayscale opacity-50" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 16h1v1h-1v-1zm1-11H7v14h10V9h-4V5zm-1 4h3l-3-3v3z" /></svg>
                    </div>
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-white/80 truncate uppercase tracking-widest">{f.file.name}</span>
                    <span className="text-[8px] text-white/30 font-bold">{(f.file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-700 rounded-full ${f.status === 'complete' ? 'bg-[#FCA311] shadow-[0_0_8px_#FCA311]' : 'bg-white/40'}`}
                      style={{ width: `${f.progress}%` }}
                    />
                  </div>
                </div>
                {f.status === 'complete' && (
                  <div className="text-[#FCA311]">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;