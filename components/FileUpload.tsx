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
      <div className="flex justify-between items-center mb-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <span className="text-[10px] text-slate-400 font-bold uppercase">
          {files.length} {files.length === 1 ? 'FILE' : 'FILES'}
        </span>
      </div>
      
      <div className="space-y-4">
        <label className="relative flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group bg-slate-50/50">
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <svg className="w-8 h-8 text-slate-300 group-hover:text-blue-500 transition-colors mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-xs text-slate-600 font-bold">
              CLICK TO UPLOAD
            </p>
            <p className="mt-1 text-[10px] text-slate-400 font-medium">MAX 3MB • PDF / IMAGES</p>
          </div>
          <input type="file" className="hidden" multiple={multiple} onChange={handleChange} accept="image/*,application/pdf" />
        </label>
        
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((f, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm animate-in fade-in slide-in-from-left-1">
                <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                  {f.file.type.includes('image') ? (
                    <img src={f.preview} alt="Preview" className="w-full h-full object-cover rounded opacity-60" />
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 16h1v1h-1v-1zm1-11H7v14h10V9h-4V5zm-1 4h3l-3-3v3z" /></svg>
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-slate-700 truncate tracking-tight">{f.file.name}</span>
                  </div>
                  <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-700 ${f.status === 'complete' ? 'bg-emerald-500' : 'bg-blue-500'}`}
                      style={{ width: `${f.progress}%` }}
                    />
                  </div>
                </div>
                {f.status === 'complete' && (
                  <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
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