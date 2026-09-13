import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PDFDocument, PageSizes } from 'pdf-lib';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useToast } from '@/context/ToastContext';
import { ToolWorkspaceLayout } from '@/components/ToolWorkspaceLayout';

export function JpgToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape' | 'auto'>('auto');
  const [margin, setMargin] = useState<'no_margin' | 'small' | 'big'>('no_margin');
  const [pageSize, setPageSize] = useState<'fit' | 'a4' | 'letter'>('fit');
  
  const navigate = useNavigate();
  const { trackEvent } = useAnalytics();
  const toast = useToast();

  const handleConvert = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    const startTime = Date.now();

    try {
      const pdfDoc = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        let image;
        
        if (file.type === 'image/png' || file.name.toLowerCase().endsWith('.png')) {
          image = await pdfDoc.embedPng(arrayBuffer);
        } else {
          image = await pdfDoc.embedJpg(arrayBuffer);
        }

        const imgWidth = image.width;
        const imgHeight = image.height;

        let pageWidth = imgWidth;
        let pageHeight = imgHeight;

        if (pageSize === 'a4') {
          pageWidth = PageSizes.A4[0];
          pageHeight = PageSizes.A4[1];
        } else if (pageSize === 'letter') {
          pageWidth = PageSizes.Letter[0];
          pageHeight = PageSizes.Letter[1];
        }

        if (orientation === 'landscape' || (orientation === 'auto' && imgWidth > imgHeight)) {
          if (pageWidth < pageHeight) {
            const temp = pageWidth;
            pageWidth = pageHeight;
            pageHeight = temp;
          }
        }

        let marginSize = 0;
        if (margin === 'small') marginSize = 20;
        else if (margin === 'big') marginSize = 40;

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        const availWidth = pageWidth - (marginSize * 2);
        const availHeight = pageHeight - (marginSize * 2);

        const scale = Math.min(availWidth / imgWidth, availHeight / imgHeight, 1);
        const drawWidth = imgWidth * scale;
        const drawHeight = imgHeight * scale;

        const x = marginSize + (availWidth - drawWidth) / 2;
        const y = marginSize + (availHeight - drawHeight) / 2;

        page.drawImage(image, {
          x,
          y,
          width: drawWidth,
          height: drawHeight,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const duration = Date.now() - startTime;
      trackEvent('JPG to PDF', files.length, 'success', duration);

      navigate('/download', {
        state: {
          files: [{
            url,
            filename: 'converted_images.pdf',
            size: blob.size
          }],
          action: 'converted'
        }
      });
    } catch (error) {
      console.error('JPG to PDF conversion failed:', error);
      trackEvent('JPG to PDF', files.length, 'failed', Date.now() - startTime);
      toast.error('Failed to convert images to PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolWorkspaceLayout
      title="JPG to PDF"
      subtitle="Convert JPG images to PDF in seconds. Easily adjust orientation and margins."
      selectButtonText="Select JPG images"
      dropText="or drop JPG / PNG images here"
      accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.JPG', '.JPEG', '.PNG'] }}
      files={files}
      onFilesChange={setFiles}
      sidebarTitle="Image to PDF options"
      infoMessage="Adjust page orientation, page size, and margins for the generated PDF."
      actionButtonText="Convert to PDF"
      onAction={handleConvert}
      isProcessing={isProcessing}
      isProcessingText="Converting Images to PDF..."
      seoTitle="JPG to PDF - Convert Images to PDF Online Free"
      seoDescription="Convert JPG, PNG, and WebP images to PDF online with custom orientation and margins."
      seoUrl="https://pdfloveyou.com/jpg-to-pdf"
      customSidebarContent={
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Orientation
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['auto', 'portrait', 'landscape'] as const).map((orient) => (
                  <button
                    key={orient}
                    type="button"
                    onClick={() => setOrientation(orient)}
                    className={`py-2 rounded-xl border text-xs font-bold capitalize transition-all ${
                      orientation === orient
                        ? 'border-[#E5322D] bg-red-50 text-[#E5322D]'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    {orient}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Margin
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'no_margin', label: 'No margin' },
                  { id: 'small', label: 'Small' },
                  { id: 'big', label: 'Big' }
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMargin(m.id as any)}
                    className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                      margin === m.id
                        ? 'border-[#E5322D] bg-red-50 text-[#E5322D]'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
}
