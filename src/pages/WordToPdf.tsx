import React, { useState } from 'react';
import * as mammoth from 'mammoth';
import { jsPDF } from 'jspdf';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useToast } from '@/context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { ToolWorkspaceLayout } from '@/components/ToolWorkspaceLayout';

export function WordToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { trackEvent } = useAnalytics();

  const handleConvert = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    const startTime = Date.now();
    let generatedFiles: { url: string; filename: string; size?: number }[] = [];
    
    try {
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = result.value;
        
        const doc = new jsPDF();
        const splitText = doc.splitTextToSize(text || 'Document content', 170);
        let y = 20;
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(file.name.replace(/\.(docx|doc)$/i, ''), 20, y);
        y += 12;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        for (let i = 0; i < splitText.length; i++) {
          if (y > 275) {
            doc.addPage();
            y = 20;
          }
          doc.text(splitText[i], 20, y);
          y += 6;
        }

        const pdfOutput = doc.output('blob');
        const url = URL.createObjectURL(pdfOutput);
        
        generatedFiles.push({
          url,
          filename: file.name.replace(/\.(docx|doc)$/i, '.pdf'),
          size: pdfOutput.size
        });
      }

      const duration = Date.now() - startTime;
      trackEvent('Word to PDF', files.length, 'success', duration);

      navigate('/download', {
        state: {
          files: generatedFiles,
          action: 'converted'
        }
      });
    } catch (error) {
      console.error('Word to PDF failed:', error);
      trackEvent('Word to PDF', files.length, 'failed', Date.now() - startTime);
      toast.error('Failed to convert Word file. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolWorkspaceLayout
      title="Convert WORD to PDF"
      subtitle="Make DOC and DOCX files easy to read by converting them to PDF."
      selectButtonText="Select WORD files"
      dropText="or drop WORD documents here"
      accept={{ 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'application/msword': ['.doc']
      }}
      files={files}
      onFilesChange={setFiles}
      sidebarTitle="WORD to PDF"
      infoMessage="Convert your DOC/DOCX files into high quality, standardized PDF files."
      actionButtonText="Convert to PDF"
      onAction={handleConvert}
      isProcessing={isProcessing}
      isProcessingText="Converting Word to PDF..."
      seoTitle="WORD to PDF - Convert DOCX to PDF online for free"
      seoDescription="Convert Word documents to PDF online quickly and with high fidelity."
      seoUrl="https://pdfloveyou.com/word-to-pdf"
    />
  );
}
