import React, { useState } from 'react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useToast } from '@/context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { ToolWorkspaceLayout } from '@/components/ToolWorkspaceLayout';

export function Watermark() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkColor, setWatermarkColor] = useState<'red' | 'gray' | 'blue' | 'black'>('red');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.4);
  const [watermarkPosition, setWatermarkPosition] = useState<'diagonal' | 'horizontal'>('diagonal');
  
  const { trackEvent } = useAnalytics();
  const toast = useToast();
  const navigate = useNavigate();

  const handleWatermark = async () => {
    if (files.length === 0) return;
    if (!watermarkText.trim()) {
      toast.error('Please enter watermark text');
      return;
    }

    setIsProcessing(true);
    const startTime = Date.now();
    let generatedFiles: { url: string; filename: string; size?: number }[] = [];

    try {
      const colorMap = {
        red: rgb(0.9, 0.2, 0.2),
        gray: rgb(0.5, 0.5, 0.5),
        blue: rgb(0.2, 0.4, 0.8),
        black: rgb(0, 0, 0)
      };

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const pages = pdfDoc.getPages();

        for (const page of pages) {
          const { width, height } = page.getSize();
          const fontSize = Math.min(width, height) / 10;
          const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
          const textHeight = font.heightAtSize(fontSize);

          if (watermarkPosition === 'diagonal') {
            page.drawText(watermarkText, {
              x: width / 2 - textWidth / 2 + 30,
              y: height / 2 - textHeight / 2 - 30,
              size: fontSize,
              font,
              color: colorMap[watermarkColor],
              opacity: watermarkOpacity,
              rotate: degrees(45)
            });
          } else {
            page.drawText(watermarkText, {
              x: width / 2 - textWidth / 2,
              y: height / 2 - textHeight / 2,
              size: fontSize,
              font,
              color: colorMap[watermarkColor],
              opacity: watermarkOpacity
            });
          }
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        generatedFiles.push({
          url,
          filename: file.name.replace('.pdf', '_watermarked.pdf'),
          size: blob.size
        });
      }

      const duration = Date.now() - startTime;
      trackEvent('Watermark PDF', files.length, 'success', duration);

      navigate('/download', {
        state: {
          files: generatedFiles,
          action: 'watermarked'
        }
      });
    } catch (error) {
      console.error('Watermarking failed:', error);
      trackEvent('Watermark PDF', files.length, 'failed', Date.now() - startTime);
      toast.error('Failed to add watermark. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolWorkspaceLayout
      title="Watermark PDF"
      subtitle="Stamp an image or text over your PDF in seconds. Choose the typography, transparency and position."
      selectButtonText="Select PDF files"
      files={files}
      onFilesChange={setFiles}
      sidebarTitle="Watermark options"
      infoMessage="Customize text, color, position, and transparency of the watermark."
      actionButtonText="Add Watermark"
      onAction={handleWatermark}
      isProcessing={isProcessing}
      isProcessingText="Adding watermark..."
      actionDisabled={!watermarkText.trim()}
      seoTitle="Watermark PDF - Add watermark to PDF online for free"
      seoDescription="Stamp text or image watermarks onto PDF pages with custom angle and opacity."
      seoUrl="https://pdfloveyou.com/watermark"
      customSidebarContent={
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Watermark Text
              </label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="e.g. CONFIDENTIAL, DRAFT"
                className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-sm font-bold focus:outline-hidden focus:border-[#E5322D]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Position
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWatermarkPosition('diagonal')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    watermarkPosition === 'diagonal'
                      ? 'border-[#E5322D] bg-red-50 text-[#E5322D]'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  Diagonal (45°)
                </button>
                <button
                  type="button"
                  onClick={() => setWatermarkPosition('horizontal')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    watermarkPosition === 'horizontal'
                      ? 'border-[#E5322D] bg-red-50 text-[#E5322D]'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  Center Horizontal
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Color
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['red', 'gray', 'blue', 'black'] as const).map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setWatermarkColor(col)}
                    className={`py-2 rounded-xl border text-xs font-bold capitalize transition-all ${
                      watermarkColor === col
                        ? 'border-[#E5322D] bg-red-50 text-[#E5322D]'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                <span>Opacity</span>
                <span>{Math.round(watermarkOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={watermarkOpacity}
                onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                className="w-full accent-[#E5322D]"
              />
            </div>
          </div>
        </div>
      }
    />
  );
}
