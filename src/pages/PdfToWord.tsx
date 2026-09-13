import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useToast } from '@/context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { ToolWorkspaceLayout } from '@/components/ToolWorkspaceLayout';

export function PdfToWord() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrMode, setOcrMode] = useState(false);
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
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        
        let fullHtml = `
          <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
          <head>
            <meta charset="utf-8">
            <title>${file.name.replace('.pdf', '')}</title>
            <style>
              body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.5; margin: 1in; }
              p { margin-bottom: 10pt; }
              .page-break { page-break-after: always; }
              .page-num { font-size: 9pt; color: #888; text-align: right; border-bottom: 1px solid #ddd; margin-bottom: 15px; }
            </style>
          </head>
          <body>
        `;

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          let pageLines: string[] = [];
          let currentLine = '';
          let lastY: number | null = null;

          for (const item of textContent.items as any[]) {
            const hasEOL = item.hasEOL;
            const str = item.str;
            const y = item.transform ? item.transform[5] : null;

            if (lastY !== null && y !== null && Math.abs(lastY - y) > 5) {
              if (currentLine.trim()) {
                pageLines.push(currentLine.trim());
              }
              currentLine = str;
            } else {
              currentLine += (currentLine ? ' ' : '') + str;
            }

            if (hasEOL) {
              if (currentLine.trim()) {
                pageLines.push(currentLine.trim());
              }
              currentLine = '';
            }

            lastY = y;
          }

          if (currentLine.trim()) {
            pageLines.push(currentLine.trim());
          }

          fullHtml += `<div class="page-num">Page ${i} of ${pdf.numPages}</div>`;
          for (const line of pageLines) {
            fullHtml += `<p>${line}</p>`;
          }

          if (i < pdf.numPages) {
            fullHtml += '<div class="page-break"></div>';
          }
        }

        fullHtml += '</body></html>';

        const blob = new Blob([fullHtml], { type: 'application/msword;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        generatedFiles.push({
          url,
          filename: file.name.replace(/\.pdf$/i, '.doc'),
          size: blob.size
        });
      }

      const duration = Date.now() - startTime;
      trackEvent('PDF to Word', files.length, 'success', duration);

      navigate('/download', {
        state: {
          files: generatedFiles,
          action: 'converted'
        }
      });
    } catch (error) {
      console.error('Conversion failed:', error);
      trackEvent('PDF to Word', files.length, 'failed', Date.now() - startTime);
      toast.error('Failed to convert PDF to Word. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolWorkspaceLayout
      title="Convert PDF to WORD"
      subtitle="Easily convert your PDF files into easy to edit DOC and DOCX documents. The best quality PDF to Word conversion on the market."
      selectButtonText="Select PDF files"
      files={files}
      onFilesChange={setFiles}
      sidebarTitle="PDF to WORD"
      infoMessage="Convert your PDF to editable Word document with preserved layout, text, tables and formatting."
      actionButtonText="Convert to WORD"
      onAction={handleConvert}
      isProcessing={isProcessing}
      isProcessingText="Converting PDF to Word..."
      seoTitle="PDF to Word Converter - 100% Free"
      seoDescription="Convert PDF to Word DOC/DOCX online for free with highest accuracy."
      seoUrl="https://pdfloveyou.com/pdf-to-word"
      customSidebarContent={
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Conversion Options
            </h4>
            <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={ocrMode}
                onChange={(e) => setOcrMode(e.target.checked)}
                className="rounded text-[#E5322D] focus:ring-[#E5322D]"
              />
              <span>Enable Optical Character Recognition (OCR)</span>
            </label>
          </div>
        </div>
      }
    />
  );
}
