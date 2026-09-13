import React, { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useToast } from '@/context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { ToolWorkspaceLayout } from '@/components/ToolWorkspaceLayout';
import { Plus, Trash2, Check, Scissors } from 'lucide-react';

type Range = {
  id: string;
  start: number;
  end: number;
};

export function Split() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [pagePreviews, setPagePreviews] = useState<string[]>([]);
  const [isLoadingPreviews, setIsLoadingPreviews] = useState(false);

  // Split options
  const [splitMode, setSplitMode] = useState<'range' | 'extract' | 'fixed'>('range');
  const [ranges, setRanges] = useState<Range[]>([{ id: '1', start: 1, end: 1 }]);
  const [fixedStep, setFixedStep] = useState(1);
  const [mergeRanges, setMergeRanges] = useState(false);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());

  const navigate = useNavigate();
  const toast = useToast();
  const { trackEvent } = useAnalytics();

  const loadPDFPages = async (file: File) => {
    setIsLoadingPreviews(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      setPageCount(pdf.numPages);
      setRanges([{ id: '1', start: 1, end: Math.min(2, pdf.numPages) }]);

      const previews: string[] = [];
      const numToRender = Math.min(pdf.numPages, 16);
      for (let i = 1; i <= numToRender; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.35 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({ canvasContext: context, viewport } as any).promise;
          previews.push(canvas.toDataURL());
        }
      }
      setPagePreviews(previews);
    } catch (error: any) {
      console.error('Error loading pages:', error);
      toast.error('Could not extract PDF pages.');
    } finally {
      setIsLoadingPreviews(false);
    }
  };

  useEffect(() => {
    if (files.length > 0) {
      loadPDFPages(files[0]);
    } else {
      setPageCount(0);
      setPagePreviews([]);
    }
  }, [files]);

  const addRange = () => {
    const lastRange = ranges[ranges.length - 1];
    const newStart = lastRange ? Math.min(lastRange.end + 1, pageCount) : 1;
    const newEnd = Math.min(newStart, pageCount);
    setRanges([...ranges, { id: Date.now().toString(), start: newStart, end: newEnd }]);
  };

  const removeRange = (id: string) => {
    if (ranges.length > 1) {
      setRanges(ranges.filter(r => r.id !== id));
    }
  };

  const updateRange = (id: string, field: 'start' | 'end', value: number) => {
    setRanges(ranges.map(r => {
      if (r.id === id) {
        let val = Math.max(1, Math.min(value, pageCount));
        return { ...r, [field]: val };
      }
      return r;
    }));
  };

  const togglePageSelection = (pageIndex: number) => {
    setSelectedPages(prev => {
      const next = new Set(prev);
      if (next.has(pageIndex)) next.delete(pageIndex);
      else next.add(pageIndex);
      return next;
    });
  };

  const createDownloadFile = async (pdfDoc: PDFDocument, fileName: string) => {
    const bytes = await pdfDoc.save();
    const blob = new Blob([bytes], { type: 'application/pdf' });
    return {
      url: URL.createObjectURL(blob),
      filename: fileName,
      size: blob.size
    };
  };

  const handleSplit = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    const startTime = Date.now();

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      let generatedFiles: { url: string; filename: string; size: number }[] = [];

      if (splitMode === 'range') {
        if (mergeRanges) {
          const newPdf = await PDFDocument.create();
          for (const range of ranges) {
            const start = Math.min(range.start, range.end);
            const end = Math.max(range.start, range.end);
            const indices: number[] = [];
            for (let i = start; i <= end; i++) indices.push(i - 1);
            const copiedPages = await newPdf.copyPages(pdfDoc, indices);
            copiedPages.forEach(p => newPdf.addPage(p));
          }
          generatedFiles.push(await createDownloadFile(newPdf, `${file.name.replace('.pdf', '')}_split_merged.pdf`));
        } else {
          for (let i = 0; i < ranges.length; i++) {
            const range = ranges[i];
            const newPdf = await PDFDocument.create();
            const start = Math.min(range.start, range.end);
            const end = Math.max(range.start, range.end);
            const indices: number[] = [];
            for (let j = start; j <= end; j++) indices.push(j - 1);
            
            const copiedPages = await newPdf.copyPages(pdfDoc, indices);
            copiedPages.forEach(p => newPdf.addPage(p));
            generatedFiles.push(await createDownloadFile(newPdf, `${file.name.replace('.pdf', '')}_range_${i + 1}.pdf`));
          }
        }
      } else if (splitMode === 'extract') {
        if (selectedPages.size === 0) {
          toast.error('Please select at least one page to extract.');
          setIsProcessing(false);
          return;
        }

        if (mergeRanges) {
          const newPdf = await PDFDocument.create();
          const sortedIndices = (Array.from(selectedPages) as number[]).sort((a, b) => a - b);
          const copiedPages = await newPdf.copyPages(pdfDoc, sortedIndices);
          copiedPages.forEach(p => newPdf.addPage(p));
          generatedFiles.push(await createDownloadFile(newPdf, `${file.name.replace('.pdf', '')}_extracted.pdf`));
        } else {
          for (const pageIndex of selectedPages) {
            const newPdf = await PDFDocument.create();
            const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageIndex]);
            newPdf.addPage(copiedPage);
            generatedFiles.push(await createDownloadFile(newPdf, `${file.name.replace('.pdf', '')}_page_${pageIndex + 1}.pdf`));
          }
        }
      } else {
        for (let i = 0; i < pageCount; i += fixedStep) {
          const newPdf = await PDFDocument.create();
          const end = Math.min(i + fixedStep, pageCount);
          const indices: number[] = [];
          for (let j = i; j < end; j++) indices.push(j);
          
          const copiedPages = await newPdf.copyPages(pdfDoc, indices);
          copiedPages.forEach(p => newPdf.addPage(p));
          generatedFiles.push(await createDownloadFile(newPdf, `${file.name.replace('.pdf', '')}_part_${Math.floor(i / fixedStep) + 1}.pdf`));
        }
      }

      trackEvent('Split PDF', 1, 'success', Date.now() - startTime);

      if (generatedFiles.length > 0) {
        navigate('/download', {
          state: {
            files: generatedFiles,
            action: 'split'
          }
        });
      }
    } catch (error) {
      console.error('Error splitting PDF:', error);
      toast.error('Failed to split PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolWorkspaceLayout
      title="Split PDF file"
      subtitle="Separate one page or a whole set for easy conversion into independent PDF files."
      selectButtonText="Select PDF file"
      multiple={false}
      files={files}
      onFilesChange={setFiles}
      sidebarTitle="Split PDF"
      infoMessage="Select a range of pages to separate, or extract specific pages into distinct documents."
      actionButtonText="Split PDF"
      onAction={handleSplit}
      isProcessing={isProcessing}
      isProcessingText="Splitting PDF pages..."
      seoTitle="Split PDF - Extract pages from your PDF online for free"
      seoDescription="Separate one page or a whole set for easy conversion into independent PDF files."
      seoUrl="https://pdfloveyou.com/split"
      customCanvasContent={
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-slate-700">
              {pageCount} total {pageCount === 1 ? 'page' : 'pages'} in document
            </span>
            {splitMode === 'extract' && (
              <span className="text-xs text-slate-500">
                Click pages below to select ({selectedPages.size} selected)
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {pagePreviews.map((preview, idx) => {
              const isSelected = selectedPages.has(idx);
              return (
                <div
                  key={idx}
                  onClick={() => splitMode === 'extract' && togglePageSelection(idx)}
                  className={`bg-white p-2.5 rounded-2xl border transition-all flex flex-col items-center relative ${
                    splitMode === 'extract' ? 'cursor-pointer hover:border-red-300' : ''
                  } ${
                    isSelected ? 'border-2 border-[#E5322D] shadow-md' : 'border-slate-200 shadow-2xs'
                  }`}
                >
                  {splitMode === 'extract' && isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#E5322D] text-white flex items-center justify-center shadow-xs z-10">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}

                  <div className="w-full aspect-[3/4] bg-slate-50 rounded-xl overflow-hidden mb-2 border border-slate-100 flex items-center justify-center">
                    <img src={preview} alt={`Page ${idx + 1}`} className="w-full h-full object-contain" />
                  </div>
                  <span className="text-xs font-bold text-slate-600">Page {idx + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      }
      customSidebarContent={
        <div className="space-y-5">
          {/* Mode Selector */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
            {(['range', 'extract', 'fixed'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setSplitMode(mode)}
                className={`py-2 text-xs font-bold rounded-lg transition-all capitalize ${
                  splitMode === mode
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {mode === 'range' ? 'Custom Range' : mode === 'extract' ? 'Extract Pages' : 'Fixed Step'}
              </button>
            ))}
          </div>

          {/* Range Settings */}
          {splitMode === 'range' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Ranges ({ranges.length})</span>
                <button
                  type="button"
                  onClick={addRange}
                  className="text-xs font-bold text-[#E5322D] hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Range
                </button>
              </div>

              {ranges.map((range, index) => (
                <div key={range.id} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 w-6">#{index + 1}</span>
                  <input
                    type="number"
                    min="1"
                    max={pageCount}
                    value={range.start}
                    onChange={(e) => updateRange(range.id, 'start', parseInt(e.target.value) || 1)}
                    className="w-16 p-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-center"
                  />
                  <span className="text-xs text-slate-400">to</span>
                  <input
                    type="number"
                    min="1"
                    max={pageCount}
                    value={range.end}
                    onChange={(e) => updateRange(range.id, 'end', parseInt(e.target.value) || 1)}
                    className="w-16 p-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-center"
                  />
                  {ranges.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRange(range.id)}
                      className="p-1 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer mt-3">
                <input
                  type="checkbox"
                  checked={mergeRanges}
                  onChange={(e) => setMergeRanges(e.target.checked)}
                  className="rounded text-[#E5322D] focus:ring-[#E5322D]"
                />
                <span>Merge all ranges into one PDF file</span>
              </label>
            </div>
          )}

          {/* Extract Settings */}
          {splitMode === 'extract' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Click pages on the canvas to select pages for extraction.
              </p>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mergeRanges}
                  onChange={(e) => setMergeRanges(e.target.checked)}
                  className="rounded text-[#E5322D] focus:ring-[#E5322D]"
                />
                <span>Merge extracted pages into one PDF</span>
              </label>
            </div>
          )}

          {/* Fixed Step Settings */}
          {splitMode === 'fixed' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Split every N pages:</label>
              <input
                type="number"
                min="1"
                max={pageCount}
                value={fixedStep}
                onChange={(e) => setFixedStep(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-sm font-bold text-center"
              />
            </div>
          )}
        </div>
      }
    />
  );
}
