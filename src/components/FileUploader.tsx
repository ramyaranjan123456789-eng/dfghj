import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Download, FileText, X, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { PasswordModal } from './PasswordModal';
import { useToast } from '@/context/ToastContext';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface FileUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  multiple?: boolean;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  description?: string;
  hideAddMore?: boolean;
  hideFileInfo?: boolean;
  hideFileList?: boolean;
}

export function FileUploader({
  files,
  onFilesChange,
  multiple = true,
  accept = { 'application/pdf': ['.pdf'] },
  maxFiles = 10,
  description = 'or drop files anywhere on the screen',
  hideAddMore = false,
  hideFileInfo = false,
  hideFileList = false,
}: FileUploaderProps) {
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordFileName, setPasswordFileName] = useState<string | undefined>();
  const fileIds = React.useRef(new WeakMap<File, string>());
  const toast = useToast();

  const getFileId = (file: File) => {
    if (!fileIds.current.has(file)) {
      fileIds.current.set(file, Math.random().toString(36).substring(2, 9));
    }
    return fileIds.current.get(file)!;
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const validFiles: File[] = [];
    let hasPasswordError = false;
    let firstPasswordFileName: string | undefined;

    for (const file of acceptedFiles) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        validFiles.push(file);
      } catch (error: any) {
        if (error.name === 'PasswordException' || (error.message && error.message.toLowerCase().includes('password'))) {
          hasPasswordError = true;
          if (!firstPasswordFileName) firstPasswordFileName = file.name;
        } else {
          toast.error(`Failed to load "${file.name}". It might be corrupted.`);
        }
      }
    }

    if (hasPasswordError) {
      setPasswordFileName(firstPasswordFileName);
      setIsPasswordModalOpen(true);
    }

    if (validFiles.length > 0) {
      if (multiple) {
        onFilesChange([...files, ...validFiles].slice(0, maxFiles));
      } else {
        onFilesChange([validFiles[0]]);
      }
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  const generatePreview = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      const page = await pdf.getPage(1);
      
      const scale = 0.5;
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      if (context) {
        await page.render({ canvasContext: context, viewport } as any).promise;
        return canvas.toDataURL();
      }
    } catch (error: any) {
      console.error('Error generating preview:', error);
    }
    return null;
  };

  useEffect(() => {
    files.forEach(async (file) => {
      const key = `${file.name}-${file.size}`;
      if (!previews[key]) {
        const url = await generatePreview(file);
        if (url) {
          setPreviews(prev => ({ ...prev, [key]: url }));
        }
      }
    });
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
    maxFiles: multiple ? maxFiles : 1,
  } as any);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <PasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
        fileName={passwordFileName}
      />

      <div
        {...getRootProps()}
        className={cn(
          'group relative w-full max-w-2xl cursor-pointer transition-all duration-300',
          files.length > 0 ? 'hidden' : 'block'
        )}
      >
        <input {...getInputProps()} />
        <div className={cn(
          "flex flex-col items-center justify-center p-10 sm:p-14 bg-white border-2 border-dashed rounded-3xl transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10",
          isDragActive 
            ? "border-emerald-600 bg-emerald-50/50 scale-[1.01]" 
            : "border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20"
        )}>
          <div className="mb-5 p-5 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform duration-300 shadow-xs border border-emerald-100">
            <UploadCloud className="w-10 h-10 stroke-[2]" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2 font-display">Select PDF Files</h3>
          <p className="text-slate-500 font-medium text-xs sm:text-sm text-center mb-6">{description}</p>
          
          <div className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all">
            Browse Documents
          </div>
        </div>
      </div>

      {!hideFileList && files.length > 0 && (
        <div className="w-full max-w-3xl space-y-3 mt-4">
          {files.map((file, index) => {
            const key = `${file.name}-${file.size}`;
            return (
              <motion.div
                key={getFileId(file)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-xs"
              >
                <div className="flex items-center space-x-4 min-w-0">
                  <div className="w-12 h-14 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
                    {previews[key] ? (
                      <img src={previews[key]} alt="PDF Preview" className="w-full h-full object-cover" />
                    ) : (
                      <FileText className="w-6 h-6 text-emerald-600" />
                    )}
                  </div>
                  {!hideFileInfo && (
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{file.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
