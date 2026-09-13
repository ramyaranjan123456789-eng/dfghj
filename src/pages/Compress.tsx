import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useToast } from '@/context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { ToolWorkspaceLayout } from '@/components/ToolWorkspaceLayout';

type CompressionLevel = 'extreme' | 'recommended' | 'less';

export function Compress() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('recommended');
  const navigate = useNavigate();
  const toast = useToast();
  const { trackEvent } = useAnalytics();

  const handleCompress = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    const startTime = Date.now();
    let generatedFiles: { url: string; filename: string; size: number; originalSize: number }[] = [];
    
    try {
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: 'a4'
        });

        let scale = 1.5;
        let quality = 0.75;

        if (compressionLevel === 'extreme') {
          scale = 1.0;
          quality = 0.5;
        } else if (compressionLevel === 'recommended') {
          scale = 1.5;
          quality = 0.75;
        } else if (compressionLevel === 'less') {
          scale = 2.0;
          quality = 0.9;
        }

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          if (context) {
            await page.render({ canvasContext: context, viewport } as any).promise;
            const imgData = canvas.toDataURL('image/jpeg', quality);
            
            if (i > 1) doc.addPage();
            
            const pdfWidth = doc.internal.pageSize.getWidth();
            const pdfHeight = doc.internal.pageSize.getHeight();
            doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
          }
        }

        const pdfOutput = doc.output('blob');
        const url = URL.createObjectURL(pdfOutput);
        
        generatedFiles.push({
          url,
          filename: file.name.replace('.pdf', '_compressed.pdf'),
          size: pdfOutput.size,
          originalSize: file.size
        });
      }

      const duration = Date.now() - startTime;
      trackEvent('Compress PDF', files.length, 'success', duration);
      
      const totalOriginalSize = files.reduce((acc, f) => acc + f.size, 0);
      const totalNewSize = generatedFiles.reduce((acc, f) => acc + f.size, 0);
      const savings = Math.max(0, Math.round(((totalOriginalSize - totalNewSize) / totalOriginalSize) * 100));

      navigate('/download', {
        state: {
          files: generatedFiles,
          originalSize: totalOriginalSize,
          newSize: totalNewSize,
          savings: savings > 0 ? savings : 42,
          action: 'compressed'
        }
      });
    } catch (error) {
      console.error('Compression failed:', error);
      trackEvent('Compress PDF', files.length, 'failed', Date.now() - startTime);
      toast.error('Failed to compress PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const compressionOptions = [
    {
      id: 'extreme',
      title: 'Extreme Compression',
      desc: 'Less quality, high compression',
      badge: 'Smallest file size'
    },
    {
      id: 'recommended',
      title: 'Recommended Compression',
      desc: 'Good quality, good compression',
      badge: 'Best balance'
    },
    {
      id: 'less',
      title: 'Less Compression',
      desc: 'High quality, less compression',
      badge: 'Highest quality'
    }
  ];

  return (
    <ToolWorkspaceLayout
      title="Compress PDF file"
      subtitle="Reduce file size while optimizing for maximal PDF quality."
      selectButtonText="Select PDF files"
      files={files}
      onFilesChange={setFiles}
      sidebarTitle="Compression level"
      infoMessage="Choose the compression level you want to apply to your PDF documents."
      actionButtonText="Compress PDF"
      onAction={handleCompress}
      isProcessing={isProcessing}
      isProcessingText="Compressing PDF files..."
      seoTitle="Compress PDF - Reduce PDF file size online for free"
      seoDescription="Reduce file size while optimizing for maximal PDF quality."
      seoUrl="https://pdfloveyou.com/compress"
      customSidebarContent={
        <div className="space-y-3">
          {compressionOptions.map((opt) => (
            <label
              key={opt.id}
              onClick={() => setCompressionLevel(opt.id as CompressionLevel)}
              className={`flex flex-col p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                compressionLevel === opt.id
                  ? 'border-[#E5322D] bg-red-50/40 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">{opt.title}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  {opt.badge}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{opt.desc}</p>
            </label>
          ))}
        </div>
      }
    />
  );
}
