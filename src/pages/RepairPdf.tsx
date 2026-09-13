import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useNavigate } from 'react-router-dom';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useToast } from '@/context/ToastContext';
import { ToolWorkspaceLayout } from '@/components/ToolWorkspaceLayout';

export function RepairPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const toast = useToast();
  const { trackEvent } = useAnalytics();
  const navigate = useNavigate();

  const handleRepair = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    const startTime = Date.now();
    let generatedFiles: { url: string; filename: string; size?: number }[] = [];

    try {
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        
        // Re-serialize and repair xref table
        const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        generatedFiles.push({
          url,
          filename: file.name.replace('.pdf', '_repaired.pdf'),
          size: blob.size
        });
      }

      trackEvent('Repair PDF', files.length, 'success', Date.now() - startTime);

      navigate('/download', {
        state: {
          files: generatedFiles,
          action: 'repaired'
        }
      });
    } catch (error) {
      console.error('Repair PDF failed:', error);
      trackEvent('Repair PDF', files.length, 'failed', Date.now() - startTime);
      toast.error('Failed to repair PDF document.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolWorkspaceLayout
      title="Repair PDF file"
      subtitle="Repair a damaged PDF and recover data from corrupt PDF. Fix PDF files with our Repair tool."
      selectButtonText="Select PDF files"
      files={files}
      onFilesChange={setFiles}
      sidebarTitle="Repair PDF"
      infoMessage="Analyze and rebuild damaged structure, metadata, and cross-reference tables in corrupt PDFs."
      actionButtonText="Repair PDF"
      onAction={handleRepair}
      isProcessing={isProcessing}
      isProcessingText="Repairing damaged PDF..."
      seoTitle="Repair PDF - Recover Corrupted PDF Files Online"
      seoDescription="Fix damaged and corrupt PDF files online easily."
      seoUrl="https://pdfloveyou.com/repair"
    />
  );
}
