
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
      <div className="flex justify-between items-center mb-3">
        <label className="text-sm font-bold text-slate-700">
          {label} {required && <span className="text-blue-500 font-bold">*</span>}
        </label>
        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
          {files.length} Files
        </span>
      </div>
      
      <div className="flex flex-col gap-4">
        <label className="relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group overflow-hidden bg-white">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
              <svg className="w-6 h-6 text-slate-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-sm text-slate-600 font-medium">
              <span className="text-blue-600 font-bold underline underline-offset-4">Click to upload</span> or drag files
            </p>
            <p className="mt-1 text-xs text-slate-400">PDF, JPG, PNG up to 3MB each</p>
          </div>
          <input type="file" className="hidden" multiple={multiple} onChange={handleChange} accept="image/*,application/pdf" />
        </label>
        
        {files.length > 0 && (
          <div className="grid grid-cols-1 gap-2">
            {files.map((f, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm animate-in fade-in slide-in-from-left-2">
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-50">
                  {f.file.type.includes('image') ? (
                    <img src={f.preview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-red-500">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 16h1v1h-1v-1zm1-11H7v14h10V9h-4V5zm-1 4h3l-3-3v3z" /></svg>
                    </div>
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-700 truncate">{f.file.name}</span>
                    <span className="text-[10px] text-slate-400">{(f.file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 rounded-full ${f.status === 'complete' ? 'bg-green-500' : 'bg-blue-600'}`}
                      style={{ width: `${f.progress}%` }}
                    />
                  </div>
                </div>
                {f.status === 'complete' && (
                  <div className="text-green-500">
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
