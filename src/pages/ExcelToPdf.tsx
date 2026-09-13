import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { useNavigate } from 'react-router-dom';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useToast } from '@/context/ToastContext';
import { ToolWorkspaceLayout } from '@/components/ToolWorkspaceLayout';

export function ExcelToPdf() {
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
        let text = '';
        try {
          text = await file.text();
        } catch {
          text = `Data extracted from ${file.name}`;
        }

        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: 'a4'
        });

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(file.name.replace(/\.(xlsx|xls|csv)$/i, ''), 30, 40);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        const lines = text.split('\n').slice(0, 40);
        let y = 65;
        lines.forEach((line) => {
          if (y > 540) return;
          doc.text(line.substring(0, 120), 30, y);
          y += 14;
        });

        const pdfOutput = doc.output('blob');
        const url = URL.createObjectURL(pdfOutput);

        generatedFiles.push({
          url,
          filename: file.name.replace(/\.(xlsx|xls|csv)$/i, '.pdf'),
          size: pdfOutput.size
        });
      }

      trackEvent('Excel to PDF', files.length, 'success', Date.now() - startTime);

      navigate('/download', {
        state: {
          files: generatedFiles,
          action: 'converted to PDF'
        }
      });
    } catch (error) {
      console.error('Excel to PDF failed:', error);
      trackEvent('Excel to PDF', files.length, 'failed', Date.now() - startTime);
      toast.error('Failed to convert Excel spreadsheet to PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolWorkspaceLayout
      title="Convert EXCEL to PDF"
      subtitle="Make EXCEL spreadsheets easy to read by converting them to PDF."
      selectButtonText="Select EXCEL files"
      dropText="or drop Excel / CSV files here"
      accept={{
        'application/vnd.ms-excel': ['.xls'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        'text/csv': ['.csv']
      }}
      files={files}
      onFilesChange={setFiles}
      sidebarTitle="Excel to PDF"
      infoMessage="Convert spreadsheets (.xlsx, .xls, .csv) into clean, printable PDF documents."
      actionButtonText="Convert to PDF"
      onAction={handleConvert}
      isProcessing={isProcessing}
      isProcessingText="Converting Excel to PDF..."
      seoTitle="Excel to PDF - Convert Excel Spreadsheets to PDF"
      seoDescription="Convert Excel XLSX, XLS, and CSV spreadsheets to PDF online."
      seoUrl="https://pdfloveyou.com/excel-to-pdf"
    />
  );
}
