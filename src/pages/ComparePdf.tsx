import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useToast } from '@/context/ToastContext';
import { ToolWorkspaceLayout } from '@/components/ToolWorkspaceLayout';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export function ComparePdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [diffResult, setDiffResult] = useState<{ page: number; diff: boolean; textA: string; textB: string }[] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  
  const toast = useToast();
  const { trackEvent } = useAnalytics();

  const handleCompare = async () => {
    if (files.length < 2) {
      toast.error('Please select at least 2 PDF files to compare.');
      return;
    }
    setIsProcessing(true);
    const startTime = Date.now();

    try {
      const fileA = files[0];
      const fileB = files[1];
      const bufA = await fileA.arrayBuffer();
      const bufB = await fileB.arrayBuffer();

      const pdfA = await pdfjsLib.getDocument({ data: new Uint8Array(bufA) }).promise;
      const pdfB = await pdfjsLib.getDocument({ data: new Uint8Array(bufB) }).promise;

      const maxPages = Math.max(pdfA.numPages, pdfB.numPages);
      let results = [];
      let diffCount = 0;

      for (let i = 1; i <= Math.min(maxPages, 15); i++) {
        let textA = '';
        let textB = '';

        if (i <= pdfA.numPages) {
          const pA = await pdfA.getPage(i);
          const tA = await pA.getTextContent();
          textA = tA.items.map((it: any) => it.str).join(' ').trim();
        }

        if (i <= pdfB.numPages) {
          const pB = await pdfB.getPage(i);
          const tB = await pB.getTextContent();
          textB = tB.items.map((it: any) => it.str).join(' ').trim();
        }

        const isDifferent = textA !== textB;
        if (isDifferent) diffCount++;

        results.push({
          page: i,
          diff: isDifferent,
          textA,
          textB
        });
      }

      setDiffResult(results);
      setSummary(
        diffCount === 0
          ? 'Both documents are completely identical in text content.'
          : `Found differences in ${diffCount} of ${results.length} evaluated pages.`
      );

      trackEvent('Compare PDF', 2, 'success', Date.now() - startTime);
    } catch (error) {
      console.error('Compare failed:', error);
      trackEvent('Compare PDF', 2, 'failed', Date.now() - startTime);
      toast.error('Failed to compare documents.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolWorkspaceLayout
      title="Compare PDF files"
      subtitle="Easily compare two PDF documents side by side to highlight visual and text differences."
      selectButtonText="Select 2 PDF files"
      files={files}
      onFilesChange={setFiles}
      sidebarTitle="Comparison options"
      infoMessage="Select 2 PDF files to inspect and highlight differences between versions."
      actionButtonText="Compare Documents"
      onAction={handleCompare}
      isProcessing={isProcessing}
      isProcessingText="Analyzing differences..."
      actionDisabled={files.length < 2}
      seoTitle="Compare PDF - Find differences between two PDF files"
      seoDescription="Side-by-side visual and text comparison between PDF documents online."
      seoUrl="https://pdfloveyou.com/compare-pdf"
      customCanvasContent={
        diffResult ? (
          <div className="flex-1 flex flex-col gap-4 max-w-4xl mx-auto w-full p-4 overflow-y-auto max-h-[600px]">
            {summary && (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
                {diffResult.some(r => r.diff) ? (
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                )}
                <span className="text-xs font-bold text-slate-800">{summary}</span>
              </div>
            )}
            <div className="space-y-3">
              {diffResult.map((res) => (
                <div
                  key={res.page}
                  className={`p-4 rounded-2xl border text-xs ${
                    res.diff
                      ? 'bg-amber-50/40 border-amber-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-center font-bold mb-2">
                    <span>Page {res.page}</span>
                    <span className={res.diff ? 'text-amber-600' : 'text-emerald-600'}>
                      {res.diff ? 'Differences detected' : 'Identical'}
                    </span>
                  </div>
                  {res.diff && (
                    <div className="grid grid-cols-2 gap-3 mt-2 font-mono text-[11px]">
                      <div className="p-2.5 rounded-xl bg-red-50/50 border border-red-100 text-slate-700 max-h-32 overflow-y-auto">
                        <div className="font-bold text-red-600 mb-1">{files[0]?.name || 'File A'}</div>
                        {res.textA || '(empty)'}
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-slate-700 max-h-32 overflow-y-auto">
                        <div className="font-bold text-emerald-600 mb-1">{files[1]?.name || 'File B'}</div>
                        {res.textB || '(empty)'}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null
      }
    />
  );
}
