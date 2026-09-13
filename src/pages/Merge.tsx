import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useToast } from '@/context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { ToolWorkspaceLayout } from '@/components/ToolWorkspaceLayout';

export function Merge() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { trackEvent } = useAnalytics();
  const toast = useToast();
  const navigate = useNavigate();

  const handleMerge = async () => {
    if (files.length < 2) {
      toast.error('Please select at least 2 PDF files to merge.');
      return;
    }

    setIsProcessing(true);
    const startTime = Date.now();

    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const duration = Date.now() - startTime;
      trackEvent('Merge PDF', files.length, 'success', duration);

      navigate('/download', {
        state: {
          files: [{
            url,
            filename: 'merged.pdf',
            size: blob.size
          }],
          action: 'merged'
        }
      });
    } catch (error) {
      console.error('Merge failed:', error);
      trackEvent('Merge PDF', files.length, 'failed', Date.now() - startTime);
      toast.error('Failed to merge PDFs. Please make sure the files are valid.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolWorkspaceLayout
      title="Merge PDF files"
      subtitle="Combine PDFs in the order you want with the easiest PDF merger available."
      selectButtonText="Select PDF files"
      files={files}
      onFilesChange={setFiles}
      sidebarTitle="Merge PDF"
      infoMessage="Drag and drop file cards in the preview area to reorder before merging."
      actionButtonText="Merge PDF"
      onAction={handleMerge}
      isProcessing={isProcessing}
      isProcessingText="Merging PDFs..."
      actionDisabled={files.length < 2}
      seoTitle="Merge PDF - Combine PDF files online for free"
      seoDescription="Combine multiple PDF files into a single document in seconds with our free online PDF merger."
      seoUrl="https://pdfloveyou.com/merge"
      customSidebarContent={
        <div className="space-y-3 text-xs text-slate-500">
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span>Files selected:</span>
            <span className="font-bold text-slate-800">{files.length}</span>
          </div>
          {files.length === 1 && (
            <p className="text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              Please add at least one more PDF file to merge.
            </p>
          )}
        </div>
      }
    />
  );
}
