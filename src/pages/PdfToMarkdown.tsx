import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { useNavigate } from 'react-router-dom';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useToast } from '@/context/ToastContext';
import { ToolWorkspaceLayout } from '@/components/ToolWorkspaceLayout';

export function PdfToMarkdown() {
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
        let mdContent = `# ${file.name.replace('.pdf', '')}\n\n`;

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          mdContent += `## Page ${i}\n\n${pageText}\n\n`;
        }

        const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        generatedFiles.push({
          url,
          filename: `${file.name.replace('.pdf', '')}.md`,
          size: blob.size
        });
      }

      trackEvent('PDF to Markdown', files.length, 'success', Date.now() - startTime);

      navigate('/download', {
        state: {
          files: generatedFiles,
          action: 'converted to Markdown'
        }
      });
    } catch (error) {
      console.error('PDF to Markdown failed:', error);
      trackEvent('PDF to Markdown', files.length, 'failed', Date.now() - startTime);
      toast.error('Failed to convert PDF to Markdown.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolWorkspaceLayout
      title="Convert PDF to Markdown"
      subtitle="Transform PDF text, headings, and structure into clean Markdown (.md) formatted files."
      selectButtonText="Select PDF files"
      files={files}
      onFilesChange={setFiles}
      sidebarTitle="Markdown options"
      infoMessage="Extracts structural text and headings ready for documentation, LLMs, and static site generators."
      actionButtonText="Convert to Markdown"
      onAction={handleConvert}
      isProcessing={isProcessing}
      isProcessingText="Extracting Markdown..."
      seoTitle="PDF to Markdown Converter - Convert PDF to MD Online Free"
      seoDescription="Convert PDF to Markdown (.md) online in seconds."
      seoUrl="https://pdfloveyou.com/pdf-to-markdown"
    />
  );
}
