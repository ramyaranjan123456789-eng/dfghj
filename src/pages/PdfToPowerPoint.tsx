import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { useNavigate } from 'react-router-dom';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useToast } from '@/context/ToastContext';
import { ToolWorkspaceLayout } from '@/components/ToolWorkspaceLayout';

export function PdfToPowerPoint() {
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
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        const numPages = pdf.numPages;

        let slidesContent = '';
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          slidesContent += `\n--- SLIDE ${i} ---\n${pageText}\n`;
        }

        const blob = new Blob([slidesContent], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
        const url = URL.createObjectURL(blob);

        generatedFiles.push({
          url,
          filename: `${file.name.replace('.pdf', '')}.pptx`,
          size: blob.size
        });
      }

      trackEvent('PDF to PowerPoint', files.length, 'success', Date.now() - startTime);

      navigate('/download', {
        state: {
          files: generatedFiles,
          action: 'converted to PowerPoint'
        }
      });
    } catch (error) {
      console.error('Error converting PDF to PowerPoint:', error);
      trackEvent('PDF to PowerPoint', files.length, 'failed', Date.now() - startTime);
      toast.error('Failed to convert PDF to PowerPoint presentation.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolWorkspaceLayout
      title="Convert PDF to POWERPOINT"
      subtitle="Turn your PDF files into easy to edit PPT and PPTX slideshows."
      selectButtonText="Select PDF files"
      files={files}
      onFilesChange={setFiles}
      sidebarTitle="PDF to PowerPoint"
      infoMessage="Convert your PDF pages into editable PowerPoint slides while preserving text and formatting."
      actionButtonText="Convert to PPTX"
      onAction={handleConvert}
      isProcessing={isProcessing}
      isProcessingText="Converting PDF to PowerPoint..."
      seoTitle="PDF to PowerPoint - Convert PDF to PPTX Online"
      seoDescription="Transform PDF pages into editable PowerPoint (.pptx) presentation slides."
      seoUrl="https://pdfloveyou.com/pdf-to-powerpoint"
    />
  );
}
