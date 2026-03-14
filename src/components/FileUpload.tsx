import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File as FileIcon, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadProps {
  onFilesAdded: (files: File[]) => void;
  files: File[];
  onRemoveFile: (index: number) => void;
  label?: string;
  description?: string;
  icon?: React.ReactNode;
}

export default function FileUpload({ onFilesAdded, files, onRemoveFile, label, description, icon }: FileUploadProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onFilesAdded,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
    }
  } as any);

  return (
    <div className="space-y-6">
      <div 
        {...getRootProps()} 
        className={`
          border-2 border-dashed rounded-[2rem] p-8 text-center transition-all cursor-pointer
          ${isDragActive ? 'border-[#5A5A40] dark:border-[#A8A878] bg-[#5A5A40]/5 dark:bg-[#A8A878]/5' : 'border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 bg-white dark:bg-white/5'}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-[#F5F5F0] dark:bg-white/10 rounded-full flex items-center justify-center text-[#5A5A40] dark:text-[#A8A878]">
            {icon || <Upload className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-lg font-bold dark:text-white">{label || 'Upload Course Materials'}</h3>
            <p className="text-xs font-sans opacity-50 mt-1 dark:text-white/60">
              {description || 'Drag & drop files here. Supports PDF, DOCX, PPTX, TXT.'}
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <h4 className="text-[10px] font-sans font-bold uppercase tracking-wider opacity-50 px-2 dark:text-white/50">Selected Files ({files.length})</h4>
            <div className="grid gap-2">
              {files.map((file, index) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between p-3 bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F5F5F0] dark:bg-white/10 flex items-center justify-center text-[#5A5A40] dark:text-[#A8A878]">
                      <FileIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs truncate max-w-[150px] dark:text-white">{file.name}</div>
                      <div className="text-[8px] font-sans opacity-40 uppercase tracking-widest dark:text-white/40">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFile(index);
                    }}
                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
