import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { useNavigate } from 'react-router-dom';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useToast } from '@/context/ToastContext';
import { ToolWorkspaceLayout } from '@/components/ToolWorkspaceLayout';

export function PdfToExcel() {
  const [files, setFiles] = useState<File[]>([]);
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
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        const numPages = pdf.numPages;

        let csvRows: string[][] = [];

        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          let lineMap: { [y: number]: { x: number; text: string }[] } = {};
          
          textContent.items.forEach((item: any) => {
            if (!item.str || item.str.trim() === '') return;
            const y = Math.round(item.transform[5]);
            const x = Math.round(item.transform[4]);
            if (!lineMap[y]) lineMap[y] = [];
            lineMap[y].push({ x, text: item.str });
          });

          const sortedYs = Object.keys(lineMap).map(Number).sort((a, b) => b - a);

          sortedYs.forEach(y => {
            const lineItems = lineMap[y].sort((a, b) => a.x - b.x);
            const row = lineItems.map(item => `"${item.text.replace(/"/g, '""')}"`);
            csvRows.push(row);
          });
        }

        const csvContent = csvRows.map(e => e.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        generatedFiles.push({
          url,
          filename: `${file.name.replace('.pdf', '')}.csv`,
          size: blob.size
        });
      }

      trackEvent('PDF to Excel', files.length, 'success', Date.now() - startTime);

      navigate('/download', {
        state: {
          files: generatedFiles,
          action: 'converted to CSV / Excel'
        }
      });
    } catch (error) {
      console.error('Error converting PDF to Excel:', error);
      trackEvent('PDF to Excel', files.length, 'failed', Date.now() - startTime);
      toast.error('Failed to convert PDF to Excel spreadsheet.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolWorkspaceLayout
      title="Convert PDF to EXCEL"
      subtitle="Pull data straight from PDFs into Excel spreadsheets in a few short seconds."
      selectButtonText="Select PDF files"
      files={files}
      onFilesChange={setFiles}
      sidebarTitle="PDF to Excel"
      infoMessage="Extract tabular and structured data from your PDF into editable CSV and Excel spreadsheets."
      actionButtonText="Convert to EXCEL"
      onAction={handleConvert}
      isProcessing={isProcessing}
      isProcessingText="Converting PDF to Excel..."
      seoTitle="PDF to Excel Converter - 100% Free"
      seoDescription="Convert PDF to Excel XLS/XLSX/CSV spreadsheets online for free."
      seoUrl="https://pdfloveyou.com/pdf-to-excel"
    />
  );
}
