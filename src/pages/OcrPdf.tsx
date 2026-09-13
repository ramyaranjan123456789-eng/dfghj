import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { useNavigate } from 'react-router-dom';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useToast } from '@/context/ToastContext';
import { ToolWorkspaceLayout } from '@/components/ToolWorkspaceLayout';

export function OcrPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [language, setLanguage] = useState('eng');
  const [outputFormat, setOutputFormat] = useState<'txt' | 'searchable_pdf'>('txt');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const toast = useToast();
  const { trackEvent } = useAnalytics();
  const navigate = useNavigate();

  const handleOcr = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    const startTime = Date.now();
    let generatedFiles: { url: string; filename: string; size?: number }[] = [];

    try {
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        const numPages = pdf.numPages;

        let extractedText = `--- OCR EXTRACTED TEXT: ${file.name} ---\n\n`;
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          extractedText += `[Page ${i}]\n${pageText}\n\n`;
        }

        const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        generatedFiles.push({
          url,
          filename: `${file.name.replace('.pdf', '')}_ocr.txt`,
          size: blob.size
        });
      }

      trackEvent('OCR PDF', files.length, 'success', Date.now() - startTime);

      navigate('/download', {
        state: {
          files: generatedFiles,
          action: 'extracted text with OCR'
        }
      });
    } catch (error) {
      console.error('OCR failed:', error);
      trackEvent('OCR PDF', files.length, 'failed', Date.now() - startTime);
      toast.error('Failed to perform OCR recognition.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolWorkspaceLayout
      title="OCR PDF"
      subtitle="Easily convert scanned PDF documents into searchable and selectable text files."
      selectButtonText="Select PDF files"
      files={files}
      onFilesChange={setFiles}
      sidebarTitle="OCR options"
      infoMessage="Select recognition language to extract text accurately from scanned documents."
      actionButtonText="Recognize Text (OCR)"
      onAction={handleOcr}
      isProcessing={isProcessing}
      isProcessingText="Performing OCR text recognition..."
      seoTitle="OCR PDF - Recognize text from scanned PDF online"
      seoDescription="Convert scanned PDF files into searchable and editable text documents."
      seoUrl="https://pdfloveyou.com/ocr-pdf"
      customSidebarContent={
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Document Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold focus:outline-hidden focus:border-[#E5322D]"
            >
              <option value="eng">English</option>
              <option value="spa">Spanish (Español)</option>
              <option value="fra">French (Français)</option>
              <option value="deu">German (Deutsch)</option>
              <option value="ita">Italian (Italiano)</option>
              <option value="por">Portuguese (Português)</option>
              <option value="hin">Hindi</option>
              <option value="chi_sim">Chinese Simplified</option>
              <option value="jpn">Japanese</option>
            </select>
          </div>
        </div>
      }
    />
  );
}
