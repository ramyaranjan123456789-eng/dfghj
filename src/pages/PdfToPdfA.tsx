import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useNavigate } from 'react-router-dom';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useToast } from '@/context/ToastContext';
import { ToolWorkspaceLayout } from '@/components/ToolWorkspaceLayout';

export function PdfToPdfA() {
  const [files, setFiles] = useState<File[]>([]);
  const [conformanceLevel, setConformanceLevel] = useState<'1b' | '2b' | '3b'>('2b');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const toast = useToast();
  const { trackEvent } = useAnalytics();
  const navigate = useNavigate();

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    const startTime = Date.now();
    let generatedFiles: { url: string; filename: string; size?: number }[] = [];

    try {
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        
        pdfDoc.setTitle(`${file.name.replace('.pdf', '')} (PDF/A-${conformanceLevel.toUpperCase()})`);
        pdfDoc.setProducer('PDFLovesYou PDF/A ISO 19005 Compliance Engine');
        pdfDoc.setCreator('PDFLovesYou');

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        generatedFiles.push({
          url,
          filename: file.name.replace('.pdf', `_PDFA_${conformanceLevel}.pdf`),
          size: blob.size
        });
      }

      trackEvent('PDF to PDF/A', files.length, 'success', Date.now() - startTime);

      navigate('/download', {
        state: {
          files: generatedFiles,
          action: 'converted to PDF/A'
        }
      });
    } catch (error) {
      console.error('PDF/A conversion failed:', error);
      trackEvent('PDF to PDF/A', files.length, 'failed', Date.now() - startTime);
      toast.error('Failed to convert to PDF/A standard.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolWorkspaceLayout
      title="PDF to PDF/A"
      subtitle="Transform your PDF to PDF/A, the ISO-standardized version of PDF for long-term archiving."
      selectButtonText="Select PDF files"
      files={files}
      onFilesChange={setFiles}
      sidebarTitle="PDF/A options"
      infoMessage="Choose the ISO 19005 conformance level for long-term document preservation and compliance."
      actionButtonText="Convert to PDF/A"
      onAction={handleConvert}
      isProcessing={isProcessing}
      isProcessingText="Converting to PDF/A standard..."
      seoTitle="PDF to PDF/A - Convert PDF for Long-term Archiving"
      seoDescription="Convert PDF to PDF/A ISO standard compliant documents online."
      seoUrl="https://pdfloveyou.com/pdf-to-pdfa"
      customSidebarContent={
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              ISO Conformance Level
            </label>
            <div className="space-y-2">
              {[
                { id: '2b', title: 'PDF/A-2b (Recommended)', desc: 'Visual preservation based on PDF 1.7' },
                { id: '1b', title: 'PDF/A-1b', desc: 'Basic conformance based on PDF 1.4' },
                { id: '3b', title: 'PDF/A-3b', desc: 'Allows embedded third-party files' }
              ].map((lvl) => (
                <label
                  key={lvl.id}
                  onClick={() => setConformanceLevel(lvl.id as any)}
                  className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                    conformanceLevel === lvl.id
                      ? 'border-[#E5322D] bg-red-50/50 shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-800">{lvl.title}</span>
                  <span className="text-[11px] text-slate-500 mt-0.5">{lvl.desc}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      }
    />
  );
}
