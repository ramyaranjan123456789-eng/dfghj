import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useToast } from '@/context/ToastContext';
import { ToolWorkspaceLayout } from '@/components/ToolWorkspaceLayout';

export function PdfToJpg() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversionMode, setConversionMode] = useState<'pages' | 'extract'>('pages');
  const [quality, setQuality] = useState<'normal' | 'high'>('high');
  
  const navigate = useNavigate();
  const { trackEvent } = useAnalytics();
  const toast = useToast();

  const handleConvert = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    const startTime = Date.now();
    let generatedFiles: { url: string; filename: string; size?: number }[] = [];

    try {
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        const zip = new JSZip();
        const baseName = file.name.replace(/\.pdf$/i, '');

        const scale = quality === 'high' ? 2.0 : 1.2;

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          if (context) {
            await page.render({ canvasContext: context, viewport } as any).promise;
            const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
            const base64Data = dataUrl.replace(/^data:image\/jpeg;base64,/, '');
            zip.file(`${baseName}_page_${i}.jpg`, base64Data, { base64: true });
          }
        }

        if (pdf.numPages === 1) {
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          if (context) {
            await page.render({ canvasContext: context, viewport } as any).promise;
            const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.92));
            generatedFiles.push({
              url: URL.createObjectURL(blob),
              filename: `${baseName}.jpg`,
              size: blob.size
            });
          }
        } else {
          const zipBlob = await zip.generateAsync({ type: 'blob' });
          generatedFiles.push({
            url: URL.createObjectURL(zipBlob),
            filename: `${baseName}_images.zip`,
            size: zipBlob.size
          });
        }
      }

      const duration = Date.now() - startTime;
      trackEvent('PDF to JPG', files.length, 'success', duration);

      navigate('/download', {
        state: {
          files: generatedFiles,
          action: 'converted'
        }
      });
    } catch (error) {
      console.error('PDF to JPG failed:', error);
      trackEvent('PDF to JPG', files.length, 'failed', Date.now() - startTime);
      toast.error('Failed to convert PDF to JPG. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolWorkspaceLayout
      title="PDF to JPG"
      subtitle="Extract all images contained in a PDF or convert each page to a JPG file."
      selectButtonText="Select PDF files"
      files={files}
      onFilesChange={setFiles}
      sidebarTitle="PDF to JPG options"
      infoMessage="Convert each PDF page into high quality JPG image files."
      actionButtonText="Convert to JPG"
      onAction={handleConvert}
      isProcessing={isProcessing}
      isProcessingText="Converting PDF to JPG..."
      seoTitle="PDF to JPG - Convert PDF pages to JPG Images"
      seoDescription="Convert PDF pages to JPG images online in seconds with high quality."
      seoUrl="https://pdfloveyou.com/pdf-to-jpg"
      customSidebarContent={
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Image Quality
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setQuality('normal')}
                className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                  quality === 'normal'
                    ? 'border-[#E5322D] bg-red-50 text-[#E5322D]'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                Normal (Standard)
              </button>
              <button
                type="button"
                onClick={() => setQuality('high')}
                className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                  quality === 'high'
                    ? 'border-[#E5322D] bg-red-50 text-[#E5322D]'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                High (300 DPI)
              </button>
            </div>
          </div>
        </div>
      }
    />
  );
}
