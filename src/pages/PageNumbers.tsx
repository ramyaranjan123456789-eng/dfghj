import React, { useState } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useToast } from '@/context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { ToolWorkspaceLayout } from '@/components/ToolWorkspaceLayout';

export function PageNumbers() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Position configuration
  const [vPos, setVPos] = useState<'top' | 'bottom'>('bottom');
  const [hPos, setHPos] = useState<'left' | 'center' | 'right'>('right');
  const [startingNumber, setStartingNumber] = useState(1);
  const [textFormat, setTextFormat] = useState<'page_n' | 'n_of_total' | 'n_only'>('page_n');
  
  const { trackEvent } = useAnalytics();
  const toast = useToast();
  const navigate = useNavigate();

  const handleAddPageNumbers = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    const startTime = Date.now();
    let generatedFiles: { url: string; filename: string; size?: number }[] = [];

    try {
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const pages = pdfDoc.getPages();
        const total = pages.length;

        pages.forEach((page, index) => {
          const pageNum = startingNumber + index;
          let label = `Page ${pageNum}`;
          if (textFormat === 'n_of_total') {
            label = `Page ${pageNum} of ${total}`;
          } else if (textFormat === 'n_only') {
            label = `${pageNum}`;
          }

          const { width, height } = page.getSize();
          const fontSize = 10;
          const textWidth = font.widthOfTextAtSize(label, fontSize);

          let x = width - textWidth - 36;
          if (hPos === 'left') x = 36;
          else if (hPos === 'center') x = (width - textWidth) / 2;

          let y = 30;
          if (vPos === 'top') y = height - 30;

          page.drawText(label, {
            x,
            y,
            size: fontSize,
            font,
            color: rgb(0.3, 0.3, 0.3)
          });
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        generatedFiles.push({
          url,
          filename: file.name.replace('.pdf', '_numbered.pdf'),
          size: blob.size
        });
      }

      const duration = Date.now() - startTime;
      trackEvent('Page Numbers', files.length, 'success', duration);

      navigate('/download', {
        state: {
          files: generatedFiles,
          action: 'numbered'
        }
      });
    } catch (error) {
      console.error('Page numbering failed:', error);
      trackEvent('Page Numbers', files.length, 'failed', Date.now() - startTime);
      toast.error('Failed to add page numbers. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolWorkspaceLayout
      title="Page Numbers"
      subtitle="Add page numbers into PDFs with ease. Choose your positions, dimensions, typography."
      selectButtonText="Select PDF files"
      files={files}
      onFilesChange={setFiles}
      sidebarTitle="Page Number Options"
      infoMessage="Select position, format, and starting number for adding page numbers to your document."
      actionButtonText="Add Page Numbers"
      onAction={handleAddPageNumbers}
      isProcessing={isProcessing}
      isProcessingText="Adding page numbers..."
      seoTitle="Add Page Numbers to PDF - Free Online"
      seoDescription="Add page numbers to your PDF document easily with custom position and typography."
      seoUrl="https://pdfloveyou.com/page-numbers"
      customSidebarContent={
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Position
              </label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setVPos('top')}
                  className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                    vPos === 'top' ? 'border-[#E5322D] bg-red-50 text-[#E5322D]' : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  Top
                </button>
                <button
                  type="button"
                  onClick={() => setVPos('bottom')}
                  className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                    vPos === 'bottom' ? 'border-[#E5322D] bg-red-50 text-[#E5322D]' : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  Bottom
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(['left', 'center', 'right'] as const).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setHPos(pos)}
                    className={`py-2 rounded-xl border text-xs font-bold capitalize transition-all ${
                      hPos === pos ? 'border-[#E5322D] bg-red-50 text-[#E5322D]' : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Format
              </label>
              <div className="space-y-1.5">
                {[
                  { id: 'page_n', label: 'Page 1, Page 2...' },
                  { id: 'n_of_total', label: 'Page 1 of N, Page 2 of N...' },
                  { id: 'n_only', label: '1, 2, 3...' }
                ].map((fmt) => (
                  <label
                    key={fmt.id}
                    onClick={() => setTextFormat(fmt.id as any)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs ${
                      textFormat === fmt.id
                        ? 'border-[#E5322D] bg-red-50 text-slate-900 font-bold'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      checked={textFormat === fmt.id}
                      onChange={() => {}}
                      className="text-[#E5322D] focus:ring-[#E5322D]"
                    />
                    <span>{fmt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                First number
              </label>
              <input
                type="number"
                min="1"
                value={startingNumber}
                onChange={(e) => setStartingNumber(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-center"
              />
            </div>
          </div>
        </div>
      }
    />
  );
}
