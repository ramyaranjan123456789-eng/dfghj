import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useNavigate } from 'react-router-dom';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useToast } from '@/context/ToastContext';
import { ToolWorkspaceLayout } from '@/components/ToolWorkspaceLayout';

export function CropPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [margin, setMargin] = useState(25);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const toast = useToast();
  const { trackEvent } = useAnalytics();
  const navigate = useNavigate();

  const handleCrop = async () => {
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
          const { width, height } = page.getSize();
          if (width > margin * 2 && height > margin * 2) {
            page.setCropBox(margin, margin, width - margin * 2, height - margin * 2);
          }
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        generatedFiles.push({
          url,
          filename: file.name.replace('.pdf', '_cropped.pdf'),
          size: blob.size
        });
      }

      trackEvent('Crop PDF', files.length, 'success', Date.now() - startTime);

      navigate('/download', {
        state: {
          files: generatedFiles,
          action: 'cropped'
        }
      });
    } catch (error) {
      console.error('Crop PDF failed:', error);
      trackEvent('Crop PDF', files.length, 'failed', Date.now() - startTime);
      toast.error('Failed to crop PDF document.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolWorkspaceLayout
      title="Crop PDF"
      subtitle="Trim document margins, change canvas size, or crop unwanted borders from PDF pages."
      selectButtonText="Select PDF files"
      files={files}
      onFilesChange={setFiles}
      sidebarTitle="Crop options"
      infoMessage="Adjust margin trim size to remove whitespace or crop edges across all pages."
      actionButtonText="Crop PDF"
      onAction={handleCrop}
      isProcessing={isProcessing}
      isProcessingText="Cropping PDF margins..."
      seoTitle="Crop PDF - Trim and crop PDF pages online"
      seoDescription="Trim margins and crop PDF pages easily online."
      seoUrl="https://pdfloveyou.com/crop-pdf"
      customSidebarContent={
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-800">
              <span className="uppercase tracking-wider">Margin Trim</span>
              <span className="text-[#E5322D]">{margin} px</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={margin}
              onChange={(e) => setMargin(parseInt(e.target.value))}
              className="w-full accent-[#E5322D]"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Light (5px)</span>
              <span>Medium (50px)</span>
              <span>Heavy (100px)</span>
            </div>
          </div>
        </div>
      }
    />
  );
}
