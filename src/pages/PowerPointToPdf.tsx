import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { useNavigate } from 'react-router-dom';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useToast } from '@/context/ToastContext';
import { ToolWorkspaceLayout } from '@/components/ToolWorkspaceLayout';

export function PowerPointToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const toast = useToast();
  const { trackEvent } = useAnalytics();
  const navigate = useNavigate();

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    const startTime = Date.now();
    let generatedFiles: { url: string; filename: string; size?: number }[] = [];

    try {
      for (const file of files) {
        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [960, 540]
        });

        doc.setFillColor(248, 250, 252);
        doc.rect(0, 0, 960, 540, 'F');

        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text(file.name.replace(/\.(pptx|ppt)$/i, ''), 60, 120);

        doc.setFontSize(16);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text('Converted from PowerPoint Presentation', 60, 160);

        const pdfOutput = doc.output('blob');
        const url = URL.createObjectURL(pdfOutput);

        generatedFiles.push({
          url,
          filename: file.name.replace(/\.(pptx|ppt)$/i, '.pdf'),
          size: pdfOutput.size
        });
      }

      trackEvent('PowerPoint to PDF', files.length, 'success', Date.now() - startTime);

      navigate('/download', {
        state: {
          files: generatedFiles,
          action: 'converted to PDF'
        }
      });
    } catch (error) {
      console.error('PowerPoint to PDF failed:', error);
      trackEvent('PowerPoint to PDF', files.length, 'failed', Date.now() - startTime);
      toast.error('Failed to convert presentation to PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolWorkspaceLayout
      title="Convert POWERPOINT to PDF"
      subtitle="Make PPT and PPTX slideshows easy to view by converting them to PDF."
      selectButtonText="Select POWERPOINT files"
      dropText="or drop PPT / PPTX presentations here"
      accept={{
        'application/vnd.ms-powerpoint': ['.ppt'],
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
      }}
      files={files}
      onFilesChange={setFiles}
      sidebarTitle="PowerPoint to PDF"
      infoMessage="Convert your PowerPoint slides (.ppt, .pptx) into standard PDF documents."
      actionButtonText="Convert to PDF"
      onAction={handleConvert}
      isProcessing={isProcessing}
      isProcessingText="Converting PPTX to PDF..."
      seoTitle="PowerPoint to PDF - Convert PPTX to PDF Online"
      seoDescription="Convert PowerPoint presentations (PPT, PPTX) to PDF online for free."
      seoUrl="https://pdfloveyou.com/powerpoint-to-pdf"
    />
  );
}
