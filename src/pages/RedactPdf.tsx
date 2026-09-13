import React, { useState } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import { useNavigate } from 'react-router-dom';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useToast } from '@/context/ToastContext';
import { ToolWorkspaceLayout } from '@/components/ToolWorkspaceLayout';

export function RedactPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [redactionType, setRedactionType] = useState<'header' | 'footer' | 'margins'>('header');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const toast = useToast();
  const { trackEvent } = useAnalytics();
  const navigate = useNavigate();

  const handleRedact = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    const startTime = Date.now();
    let generatedFiles: { url: string; filename: string; size?: number }[] = [];

    try {
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = pdfDoc.getPages();

        pages.forEach((page) => {
          const { width, height } = page.getSize();
          
          if (redactionType === 'header') {
            page.drawRectangle({
              x: 0,
              y: height - 50,
              width: width,
              height: 50,
              color: rgb(0, 0, 0),
            });
          } else if (redactionType === 'footer') {
            page.drawRectangle({
              x: 0,
              y: 0,
              width: width,
              height: 50,
              color: rgb(0, 0, 0),
            });
          } else if (redactionType === 'margins') {
            // Left and right margins
            page.drawRectangle({
              x: 0,
              y: 0,
              width: 35,
              height: height,
              color: rgb(0, 0, 0)
            });
            page.drawRectangle({
              x: width - 35,
              y: 0,
              width: 35,
              height: height,
              color: rgb(0, 0, 0)
            });
          }
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        generatedFiles.push({
          url,
          filename: file.name.replace('.pdf', '_redacted.pdf'),
          size: blob.size
        });
      }

      trackEvent('Redact PDF', files.length, 'success', Date.now() - startTime);

      navigate('/download', {
        state: {
          files: generatedFiles,
          action: 'redacted'
        }
      });
    } catch (error) {
      console.error('Redact PDF failed:', error);
      trackEvent('Redact PDF', files.length, 'failed', Date.now() - startTime);
      toast.error('Failed to redact PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolWorkspaceLayout
      title="Redact PDF"
      subtitle="Permanently black out and remove sensitive text, confidential graphics, and private metadata."
      selectButtonText="Select PDF files"
      files={files}
      onFilesChange={setFiles}
      sidebarTitle="Redaction options"
      infoMessage="Permanently remove sensitive confidential data by placing blackout redactions across pages."
      actionButtonText="Redact PDF"
      onAction={handleRedact}
      isProcessing={isProcessing}
      isProcessingText="Applying permanent redactions..."
      seoTitle="Redact PDF - Permanently remove sensitive information online"
      seoDescription="Black out confidential text and sensitive sections of PDF documents permanently."
      seoUrl="https://pdfloveyou.com/redact-pdf"
      customSidebarContent={
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Redaction Area
            </label>
            <div className="space-y-2">
              {[
                { id: 'header', label: 'Top Header Area (50px)' },
                { id: 'footer', label: 'Bottom Footer Area (50px)' },
                { id: 'margins', label: 'Side Margins (35px)' }
              ].map((opt) => (
                <label
                  key={opt.id}
                  onClick={() => setRedactionType(opt.id as any)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs ${
                    redactionType === opt.id
                      ? 'border-[#E5322D] bg-red-50 text-slate-900 font-bold'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="redact_area"
                    checked={redactionType === opt.id}
                    onChange={() => {}}
                    className="text-[#E5322D] focus:ring-[#E5322D]"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      }
    />
  );
}
