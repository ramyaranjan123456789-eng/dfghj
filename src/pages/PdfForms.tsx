import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useNavigate } from 'react-router-dom';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useToast } from '@/context/ToastContext';
import { ToolWorkspaceLayout } from '@/components/ToolWorkspaceLayout';

export function PdfForms() {
  const [files, setFiles] = useState<File[]>([]);
  const [formFields, setFormFields] = useState<{ name: string; type: string; value: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const toast = useToast();
  const { trackEvent } = useAnalytics();
  const navigate = useNavigate();

  const handleFilesChange = async (newFiles: File[]) => {
    setFiles(newFiles);
    if (newFiles.length === 0) {
      setFormFields([]);
      return;
    }

    try {
      const pdfFile = newFiles[0];
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const form = pdfDoc.getForm();
      const fields = form.getFields();

      const extracted = fields.map(f => ({
        name: f.getName(),
        type: f.constructor.name,
        value: ''
      }));

      setFormFields(extracted);
      if (extracted.length === 0) {
        toast.info('No standard fillable fields found. General form fill ready.');
      } else {
        toast.success(`Found ${extracted.length} fillable field(s)!`);
      }
    } catch (err) {
      console.warn('Error reading form fields:', err);
    }
  };

  const handleFieldChange = (index: number, val: string) => {
    setFormFields(prev => {
      const copy = [...prev];
      copy[index].value = val;
      return copy;
    });
  };

  const handleSaveForm = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    const startTime = Date.now();

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const form = pdfDoc.getForm();

      formFields.forEach(f => {
        try {
          const field = form.getTextField(f.name);
          if (field && f.value) {
            field.setText(f.value);
          }
        } catch {
          // If not a text field or fails, skip
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      trackEvent('Fill PDF Forms', 1, 'success', Date.now() - startTime);

      navigate('/download', {
        state: {
          files: [{
            url,
            filename: file.name.replace('.pdf', '_filled.pdf'),
            size: blob.size
          }],
          action: 'filled & saved'
        }
      });
    } catch (error) {
      console.error('Fill form failed:', error);
      trackEvent('Fill PDF Forms', 1, 'failed', Date.now() - startTime);
      toast.error('Failed to save filled form.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolWorkspaceLayout
      title="Fill & Sign PDF Forms"
      subtitle="Fill out PDF forms and document fields directly in your browser without Adobe Acrobat."
      selectButtonText="Select PDF form"
      multiple={false}
      files={files}
      onFilesChange={handleFilesChange}
      sidebarTitle="Form Fields"
      infoMessage="Type your answers into detected form fields, then export the completed PDF."
      actionButtonText="Save Filled Form"
      onAction={handleSaveForm}
      isProcessing={isProcessing}
      isProcessingText="Saving filled form..."
      seoTitle="PDF Form Filler - Fill and submit PDF forms online free"
      seoDescription="Fill out interactive PDF forms and text fields directly online."
      seoUrl="https://pdfloveyou.com/pdf-forms"
      customSidebarContent={
        formFields.length > 0 ? (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {formFields.map((field, idx) => (
              <div key={idx} className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block truncate" title={field.name}>
                  {field.name || `Field ${idx + 1}`}
                </label>
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => handleFieldChange(idx, e.target.value)}
                  placeholder="Enter value..."
                  className="w-full p-2 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-[#E5322D]"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl border border-slate-200">
            No interactive form fields found in this file.
          </p>
        )
      }
    />
  );
}
