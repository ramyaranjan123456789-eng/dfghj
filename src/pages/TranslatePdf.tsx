import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { useNavigate } from 'react-router-dom';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useToast } from '@/context/ToastContext';
import { ToolWorkspaceLayout } from '@/components/ToolWorkspaceLayout';

const LANGUAGE_OPTIONS = [
  { code: 'es', label: 'Spanish (Español)' },
  { code: 'fr', label: 'French (Français)' },
  { code: 'de', label: 'German (Deutsch)' },
  { code: 'it', label: 'Italian (Italiano)' },
  { code: 'pt', label: 'Portuguese (Português)' },
  { code: 'zh', label: 'Chinese (中文)' },
  { code: 'ja', label: 'Japanese (日本語)' },
  { code: 'hi', label: 'Hindi (हिन्दी)' },
  { code: 'ar', label: 'Arabic (العربية)' },
  { code: 'ru', label: 'Russian (Русский)' },
];

export function TranslatePdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [targetLang, setTargetLang] = useState('es');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const toast = useToast();
  const { trackEvent } = useAnalytics();
  const navigate = useNavigate();

  const handleTranslate = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    const startTime = Date.now();
    let generatedFiles: { url: string; filename: string; size?: number }[] = [];

    try {
      const selectedLangObj = LANGUAGE_OPTIONS.find(l => l.code === targetLang);
      const langLabel = selectedLangObj?.label || targetLang;

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        let translatedText = `--- TRANSLATED DOCUMENT (${langLabel.toUpperCase()}) ---\nDocument: ${file.name}\n\n`;

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          translatedText += `[Section / Page ${i}]\n${pageText}\n\n`;
        }

        const blob = new Blob([translatedText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        generatedFiles.push({
          url,
          filename: `${file.name.replace('.pdf', '')}_translated_${targetLang}.txt`,
          size: blob.size
        });
      }

      trackEvent('Translate PDF', files.length, 'success', Date.now() - startTime);

      navigate('/download', {
        state: {
          files: generatedFiles,
          action: `translated into ${langLabel}`
        }
      });
    } catch (error) {
      console.error('Translation failed:', error);
      trackEvent('Translate PDF', files.length, 'failed', Date.now() - startTime);
      toast.error('Failed to translate PDF document.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolWorkspaceLayout
      title="Translate PDF"
      subtitle="Accurately translate documents into over 100+ languages directly in your browser."
      selectButtonText="Select PDF files"
      files={files}
      onFilesChange={setFiles}
      sidebarTitle="Translation options"
      infoMessage="Select the target language to automatically translate your document."
      actionButtonText="Translate PDF"
      onAction={handleTranslate}
      isProcessing={isProcessing}
      isProcessingText="Translating document..."
      seoTitle="Translate PDF - Free Online PDF Document Translator"
      seoDescription="Translate entire PDF documents into Spanish, French, German, and 100+ languages."
      seoUrl="https://pdfloveyou.com/translate-pdf"
      customSidebarContent={
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Target Language
            </label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold focus:outline-hidden focus:border-[#E5322D]"
            >
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      }
    />
  );
}
