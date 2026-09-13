import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useToast } from '@/context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { ToolWorkspaceLayout } from '@/components/ToolWorkspaceLayout';

export function Unlock() {
  const [files, setFiles] = useState<File[]>([]);
  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { trackEvent } = useAnalytics();

  const handleUnlock = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    const startTime = Date.now();
    let generatedFiles: { url: string; filename: string; size?: number }[] = [];

    try {
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const enteredPassword = passwords[file.name] || '';

        try {
          const pdf = await pdfjsLib.getDocument({
            data: new Uint8Array(arrayBuffer),
            password: enteredPassword
          }).promise;

          const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: 'a4'
          });

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            if (context) {
              await page.render({ canvasContext: context, viewport } as any).promise;
              const imgData = canvas.toDataURL('image/jpeg', 0.9);

              if (i > 1) doc.addPage();
              const pdfWidth = doc.internal.pageSize.getWidth();
              const pdfHeight = doc.internal.pageSize.getHeight();
              doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            }
          }

          const pdfOutput = doc.output('blob');
          const url = URL.createObjectURL(pdfOutput);

          generatedFiles.push({
            url,
            filename: file.name.replace('.pdf', '_unlocked.pdf'),
            size: pdfOutput.size
          });
        } catch (err: any) {
          if (err.name === 'PasswordException') {
            throw new Error(`Password incorrect for ${file.name}`);
          }
          throw err;
        }
      }

      const duration = Date.now() - startTime;
      trackEvent('Unlock PDF', files.length, 'success', duration);

      navigate('/download', {
        state: {
          files: generatedFiles,
          action: 'unlocked'
        }
      });
    } catch (error: any) {
      console.error('Unlock failed:', error);
      trackEvent('Unlock PDF', files.length, 'failed', Date.now() - startTime);
      toast.error(error.message || 'Failed to unlock PDF. Please verify password.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolWorkspaceLayout
      title="Unlock PDF"
      subtitle="Remove PDF password security, giving you the freedom to use your PDFs as you want."
      selectButtonText="Select PDF files"
      files={files}
      onFilesChange={setFiles}
      sidebarTitle="Unlock PDF"
      infoMessage="Enter the current password if the PDF is password-encrypted to unlock and remove protections."
      actionButtonText="Unlock PDF"
      onAction={handleUnlock}
      isProcessing={isProcessing}
      isProcessingText="Unlocking PDF documents..."
      seoTitle="Unlock PDF - Remove PDF Password Online"
      seoDescription="Unlock password protected PDFs online without losing file quality."
      seoUrl="https://pdfloveyou.com/unlock"
      customSidebarContent={
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Document Password
            </label>
            {files.map((file) => (
              <div key={file.name} className="space-y-1">
                <span className="text-[11px] font-bold text-slate-600 truncate block">
                  {file.name}
                </span>
                <input
                  type="password"
                  placeholder="Enter password (if known)"
                  value={passwords[file.name] || ''}
                  onChange={(e) => setPasswords({ ...passwords, [file.name]: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs focus:outline-hidden focus:border-[#E5322D]"
                />
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}
