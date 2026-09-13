import React, { useState } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useToast } from '@/context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { ToolWorkspaceLayout } from '@/components/ToolWorkspaceLayout';
import { RotateCw, RotateCcw } from 'lucide-react';

export function Rotate() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rotationDegrees, setRotationDegrees] = useState(90);
  const navigate = useNavigate();
  const toast = useToast();
  const { trackEvent } = useAnalytics();

  const handleRotate = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    const startTime = Date.now();
    let generatedFiles: { url: string; filename: string; size?: number }[] = [];

    try {
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = pdfDoc.getPages();

        pages.forEach((page) => {
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees((currentRotation + rotationDegrees) % 360));
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        generatedFiles.push({
          url,
          filename: file.name.replace('.pdf', '_rotated.pdf'),
          size: blob.size
        });
      }

      const duration = Date.now() - startTime;
      trackEvent('Rotate PDF', files.length, 'success', duration);

      navigate('/download', {
        state: {
          files: generatedFiles,
          action: 'rotated'
        }
      });
    } catch (error) {
      console.error('Rotate PDF failed:', error);
      trackEvent('Rotate PDF', files.length, 'failed', Date.now() - startTime);
      toast.error('Failed to rotate PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolWorkspaceLayout
      title="Rotate PDF"
      subtitle="Rotate your PDF files the way you need them. You can even rotate multiple documents at the same time!"
      selectButtonText="Select PDF files"
      files={files}
      onFilesChange={setFiles}
      sidebarTitle="Rotate PDF"
      infoMessage="Choose the rotation angle to apply to all pages in the uploaded PDF documents."
      actionButtonText="Rotate PDF"
      onAction={handleRotate}
      isProcessing={isProcessing}
      isProcessingText="Rotating PDF pages..."
      seoTitle="Rotate PDF - Rotate PDF pages online for free"
      seoDescription="Rotate PDF pages left or right permanently online."
      seoUrl="https://pdfloveyou.com/rotate"
      customSidebarContent={
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Rotation Direction
            </h4>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRotationDegrees(90)}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all ${
                  rotationDegrees === 90
                    ? 'border-[#E5322D] bg-red-50 text-[#E5322D]'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <RotateCw className="w-4 h-4" />
                <span>Right 90°</span>
              </button>

              <button
                type="button"
                onClick={() => setRotationDegrees(270)}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all ${
                  rotationDegrees === 270
                    ? 'border-[#E5322D] bg-red-50 text-[#E5322D]'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Left 90°</span>
              </button>

              <button
                type="button"
                onClick={() => setRotationDegrees(180)}
                className={`col-span-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all ${
                  rotationDegrees === 180
                    ? 'border-[#E5322D] bg-red-50 text-[#E5322D]'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <RotateCw className="w-4 h-4" />
                <span>180° (Upside down)</span>
              </button>
            </div>
          </div>
        </div>
      }
    />
  );
}
