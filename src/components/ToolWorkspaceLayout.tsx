import React, { useEffect, useRef, useState } from 'react';
import { useDropzone, Accept } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  X, 
  Lock, 
  Loader2, 
  FileText, 
  ArrowRight, 
  Info,
  Layers,
  CheckCircle2,
  Trash2,
  RotateCw,
  HardDrive,
  Cloud
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { PasswordModal } from '@/components/PasswordModal';
import { useToast } from '@/context/ToastContext';
import { SEO } from '@/components/SEO';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export interface ToolWorkspaceLayoutProps {
  title: string;
  subtitle: string;
  selectButtonText?: string;
  dropText?: string;
  accept?: Accept;
  multiple?: boolean;
  maxFiles?: number;
  files: File[];
  onFilesChange: (files: File[]) => void;
  infoMessage?: string;
  sidebarTitle?: string;
  actionButtonText: string;
  onAction: () => void;
  isProcessing?: boolean;
  isProcessingText?: string;
  actionDisabled?: boolean;
  customSidebarContent?: React.ReactNode;
  customCanvasContent?: React.ReactNode;
  seoTitle?: string;
  seoDescription?: string;
  seoUrl?: string;
  hideDefaultThumbnails?: boolean;
  onFileSelect?: (file: File) => void;
  renderThumbnailOverlay?: (file: File, index: number) => React.ReactNode;
}

export function ToolWorkspaceLayout({
  title,
  subtitle,
  selectButtonText = 'Select PDF files',
  dropText = 'or drop PDFs here',
  accept = { 'application/pdf': ['.pdf', '.PDF'] },
  multiple = true,
  maxFiles = 20,
  files,
  onFilesChange,
  infoMessage,
  sidebarTitle,
  actionButtonText,
  onAction,
  isProcessing = false,
  isProcessingText = 'Processing files...',
  actionDisabled = false,
  customSidebarContent,
  customCanvasContent,
  seoTitle,
  seoDescription,
  seoUrl,
  hideDefaultThumbnails = false,
  renderThumbnailOverlay
}: ToolWorkspaceLayoutProps) {
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordFileName, setPasswordFileName] = useState<string | undefined>();
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();
  const fileIds = useRef(new WeakMap<File, string>());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileId = (file: File) => {
    if (!fileIds.current.has(file)) {
      fileIds.current.set(file, Math.random().toString(36).substring(2, 9));
    }
    return fileIds.current.get(file)!;
  };

  // Generate thumbnail preview for PDF files
  useEffect(() => {
    files.forEach(async (file) => {
      const key = `${file.name}-${file.size}`;
      if (!previews[key]) {
        if (file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf')) {
          try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
            const page = await pdf.getPage(1);
            
            const scale = 0.45;
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            if (context) {
              await page.render({ canvasContext: context, viewport } as any).promise;
              setPreviews(prev => ({ ...prev, [key]: canvas.toDataURL() }));
            }
          } catch (error) {
            console.warn('Preview generation failed for', file.name, error);
          }
        } else if (file.type.startsWith('image/')) {
          const url = URL.createObjectURL(file);
          setPreviews(prev => ({ ...prev, [key]: url }));
        }
      }
    });
  }, [files]);

  const validateAndAddFiles = (newFiles: File[]) => {
    if (!newFiles || newFiles.length === 0) return;
    setIsUploading(true);

    const validFiles: File[] = [];

    for (const file of newFiles) {
      if (file && (file.size > 0 || file.name)) {
        validFiles.push(file);
      }
    }

    // Brief smooth transition to show loading feedback
    setTimeout(() => {
      if (validFiles.length > 0) {
        if (multiple) {
          onFilesChange([...files, ...validFiles].slice(0, maxFiles));
        } else {
          onFilesChange([validFiles[0]]);
        }
      }
      setIsUploading(false);
    }, 450);
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: (acceptedFiles: File[]) => validateAndAddFiles(acceptedFiles),
    accept,
    multiple,
    noClick: true
  } as any);

  const handleAddMore = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
        fileInputRef.current.click();
      } else {
        open();
      }
    } catch {
      open();
    }
  };

  const handleNativeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected: File[] = Array.from(e.target.files);
      validateAndAddFiles(selected);
    }
  };

  const removeFile = (index: number) => {
    const nextFiles = files.filter((_, i) => i !== index);
    onFilesChange(nextFiles);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-[#F4F6F9] relative" {...getRootProps()}>
      <input {...getInputProps()} />
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept=".pdf,application/pdf,.PDF"
        onChange={handleNativeInputChange}
        className="hidden"
        style={{ display: 'none' }}
        tabIndex={-1}
      />

      {seoTitle && (
        <SEO 
          title={seoTitle} 
          description={seoDescription || subtitle} 
          url={seoUrl}
        />
      )}

      <PasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
        fileName={passwordFileName}
      />

      {/* Dragging Overlay */}
      {isDragActive && (
        <div className="fixed inset-0 z-50 bg-[#E5322D]/10 backdrop-blur-xs border-4 border-dashed border-[#E5322D] flex flex-col items-center justify-center pointer-events-none">
          <div className="bg-white px-8 py-6 rounded-3xl shadow-2xl flex items-center gap-3 text-slate-800 font-bold text-lg">
            <Plus className="w-6 h-6 text-[#E5322D]" />
            <span>Drop files here to upload</span>
          </div>
        </div>
      )}

      {/* Uploading File Loading Overlay */}
      <AnimatePresence>
        {isUploading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex flex-col items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white px-8 py-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4 text-center max-w-sm border border-slate-100"
            >
              <div className="relative flex items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#E5322D] flex items-center justify-center">
                  <FileText className="w-7 h-7" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-xs">
                  <Loader2 className="w-5 h-5 text-[#E5322D] animate-spin" />
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-800">Uploading PDF...</h3>
                <p className="text-xs text-slate-500 mt-1">Preparing your file for processing</p>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#E5322D] h-full rounded-full animate-pulse w-3/4"></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STATE 1: Empty Hero State matching Screenshot 1 */}
      {files.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center max-w-4xl mx-auto w-full">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-[42px] font-black text-[#1F2937] tracking-tight mb-3 font-display"
          >
            {title}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-slate-600 text-sm sm:text-base md:text-lg mb-10 max-w-2xl font-normal leading-relaxed"
          >
            {subtitle}
          </motion.p>

          {/* Centered Large Red Upload Action Button with stacked Drive/Dropbox buttons */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <button
              type="button"
              onClick={handleAddMore}
              disabled={isUploading}
              className="bg-[#E5322D] hover:bg-[#D42A25] active:scale-[0.99] disabled:opacity-85 text-white font-black px-10 py-5 rounded-2xl shadow-xl shadow-red-600/25 text-lg sm:text-xl flex items-center justify-center gap-3 transition-all cursor-pointer min-h-[64px]"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                  <span>Uploading...</span>
                </>
              ) : (
                <span>{selectButtonText}</span>
              )}
            </button>

            {/* Google Drive and Dropbox circular action buttons */}
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={handleAddMore}
                title="Google Drive"
                className="w-10 h-10 rounded-full bg-[#E5322D] hover:bg-[#D42A25] text-white flex items-center justify-center shadow-md shadow-red-600/20 cursor-pointer transition-transform hover:scale-105"
              >
                <HardDrive className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={handleAddMore}
                title="Dropbox"
                className="w-10 h-10 rounded-full bg-[#E5322D] hover:bg-[#D42A25] text-white flex items-center justify-center shadow-md shadow-red-600/20 cursor-pointer transition-transform hover:scale-105"
              >
                <Cloud className="w-5 h-5" />
              </button>
            </div>
          </div>

          <p className="text-sm text-slate-400 font-medium mt-2">
            {dropText}
          </p>

          <div className="mt-12 flex items-center gap-2 text-xs text-slate-400">
            <Lock className="w-3.5 h-3.5" />
            <span>Files are encrypted and deleted automatically after 2 hours</span>
          </div>
        </div>
      ) : (
        /* STATE 2: File Grid with Right Sidebar matching Screenshot 2 */
        <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1440px] mx-auto min-h-[calc(100vh-4rem)]">
          
          {/* Main Area: Files Canvas */}
          <div className="flex-1 p-6 sm:p-10 relative flex flex-col">
            
            {/* Top Toolbar with Add More Files Floating Button matching Screenshot 2 */}
            <div className="flex items-center justify-end mb-6">
              {multiple && (
                <div className="flex items-center gap-2">
                  {/* Tooltip badge */}
                  <div className="bg-[#1F2937] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md hidden sm:flex items-center gap-1">
                    Add more files
                  </div>

                  {/* Red round button with badge */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={handleAddMore}
                      disabled={isUploading}
                      className="w-11 h-11 rounded-full bg-[#E5322D] hover:bg-[#D42A25] disabled:opacity-85 text-white flex items-center justify-center shadow-lg shadow-red-500/30 transition-transform hover:scale-105 cursor-pointer"
                      title="Add more files"
                    >
                      {isUploading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Plus className="w-6 h-6 stroke-[2.5]" />
                      )}
                    </button>
                    {/* Badge counter */}
                    <div className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-[#1F2937] text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-xs">
                      {files.length}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Custom Canvas Content or Default Thumbnail Grid */}
            {customCanvasContent ? (
              <div className="flex-1 flex flex-col">
                {customCanvasContent}
              </div>
            ) : !hideDefaultThumbnails ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                {files.map((file, index) => (
                  <div 
                    key={getFileId(file)} 
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-red-200 hover:shadow-md transition-all relative group"
                  >
                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-100 hover:bg-red-500 hover:text-white text-slate-400 flex items-center justify-center transition-colors z-10 cursor-pointer"
                      aria-label="Remove file"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    {/* Thumbnail Preview */}
                    <div className="w-full aspect-[3/4] bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden mb-3 relative">
                      {previews[`${file.name}-${file.size}`] ? (
                        <img 
                          src={previews[`${file.name}-${file.size}`]} 
                          alt="" 
                          className="w-full h-full object-contain p-1" 
                        />
                      ) : (
                        <FileText className="w-12 h-12 text-slate-300" />
                      )}

                      {/* Custom Overlay (e.g. rotation, watermark preview) */}
                      {renderThumbnailOverlay && renderThumbnailOverlay(file, index)}
                    </div>

                    {/* File Metadata */}
                    <div className="min-w-0 text-center">
                      <p className="text-xs font-bold text-slate-800 truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

          </div>

          {/* Right Sidebar: Matching Screenshot 2 */}
          <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 p-6 sm:p-8 flex flex-col justify-between shrink-0 shadow-xs">
            <div>
              <h2 className="text-2xl font-black text-slate-900 font-display mb-4 text-center">
                {sidebarTitle || title}
              </h2>

              {/* Light Blue Info Box matching Screenshot 2 */}
              {infoMessage && (
                <div className="bg-[#EBF5FF] border border-[#BFDBFE] text-[#1E40AF] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed mb-6 font-normal flex items-start gap-2.5">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{infoMessage}</div>
                </div>
              )}

              {/* Custom Tool Controls / Settings */}
              {customSidebarContent}

              {/* Document stats */}
              {!customSidebarContent && (
                <div className="space-y-3 text-xs text-slate-500 mt-4">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span>Selected Documents:</span>
                    <span className="font-bold text-slate-800">{files.length}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span>Total Size:</span>
                    <span className="font-bold text-slate-800">
                      {(files.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action Button */}
            <div className="mt-8 pt-4">
              <button
                type="button"
                onClick={onAction}
                disabled={actionDisabled || isProcessing || files.length === 0}
                className={`w-full py-4 px-6 rounded-2xl text-base font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg min-h-[54px] ${
                  !actionDisabled && !isProcessing && files.length > 0
                    ? 'bg-[#E5322D] hover:bg-[#D42A25] text-white shadow-red-600/25'
                    : 'bg-red-300 text-white cursor-not-allowed'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{isProcessingText}</span>
                  </>
                ) : (
                  <>
                    <span>{actionButtonText}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
