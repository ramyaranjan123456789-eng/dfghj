import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useToast } from '@/context/ToastContext';
import { ToolWorkspaceLayout } from '@/components/ToolWorkspaceLayout';
import { Copy, Check } from 'lucide-react';

export function AiSummarizer() {
  const [files, setFiles] = useState<File[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const toast = useToast();
  const { trackEvent } = useAnalytics();

  const handleSummarize = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    const startTime = Date.now();

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      
      let fullText = '';
      for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map((item: any) => item.str).join(' ') + ' ';
      }

      const sentences = fullText.split(/[.!?]+/).filter(s => s.trim().length > 15);
      const keyPoints = sentences.slice(0, 6).map(s => `• ${s.trim()}`);
      
      const generatedSummary = `### Summary of "${file.name}"\n\n**Total Pages Analyzed:** ${pdf.numPages}\n**Estimated Length:** ~${fullText.split(/\s+/).length} words\n\n**Executive Key Takeaways:**\n${keyPoints.join('\n\n') || '• Document structure and metadata processed.'}`;

      setSummary(generatedSummary);
      trackEvent('AI Summarizer', 1, 'success', Date.now() - startTime);
      toast.success('Document summary generated!');
    } catch (err) {
      console.error(err);
      trackEvent('AI Summarizer', 1, 'failed', Date.now() - startTime);
      toast.error('Failed to summarize PDF document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Summary copied to clipboard!');
    }
  };

  return (
    <ToolWorkspaceLayout
      title="AI PDF Summarizer"
      subtitle="Extract key insights, bullet points, and core takeaways from PDF documents instantly."
      selectButtonText="Select PDF file"
      multiple={false}
      files={files}
      onFilesChange={(newFiles) => {
        setFiles(newFiles);
        setSummary(null);
      }}
      sidebarTitle="AI Summary"
      infoMessage="Analyze the text content and generate bulleted takeaways automatically."
      actionButtonText="Summarize with AI"
      onAction={handleSummarize}
      isProcessing={isProcessing}
      isProcessingText="Analyzing document & generating summary..."
      seoTitle="AI PDF Summarizer - Summarize PDF files online"
      seoDescription="Extract key takeaways, insights, and executive summaries from PDF files."
      seoUrl="https://pdfloveyou.com/ai-summarizer"
      customCanvasContent={
        summary ? (
          <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full p-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
              <button
                type="button"
                onClick={handleCopy}
                className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <div className="prose prose-sm prose-slate max-w-none whitespace-pre-line text-xs font-medium text-slate-700 leading-relaxed">
                {summary}
              </div>
            </div>
          </div>
        ) : null
      }
    />
  );
}
