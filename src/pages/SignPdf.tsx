import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, PenTool, Type } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { useNavigate } from 'react-router-dom';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useToast } from '@/context/ToastContext';
import { ToolWorkspaceLayout } from '@/components/ToolWorkspaceLayout';

export function SignPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [signMode, setSignMode] = useState<'draw' | 'type'>('draw');
  const [signatureName, setSignatureName] = useState('John Doe');
  const [pagePreviewUrl, setPagePreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const toast = useToast();
  const { trackEvent } = useAnalytics();
  const navigate = useNavigate();

  const handleFilesChange = async (newFiles: File[]) => {
    setFiles(newFiles);
    if (newFiles.length === 0) {
      setPagePreviewUrl(null);
      return;
    }

    try {
      const pdfFile = newFiles[0];
      const buffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.5 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      if (ctx) {
        await page.render({ canvasContext: ctx, viewport } as any).promise;
        setPagePreviewUrl(canvas.toDataURL());
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load PDF preview.');
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e293b';
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleSign = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    const startTime = Date.now();

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width } = firstPage.getSize();

      let sigImageBytes: Uint8Array | null = null;
      if (signMode === 'draw' && canvasRef.current) {
        const dataUrl = canvasRef.current.toDataURL('image/png');
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        sigImageBytes = new Uint8Array(await blob.arrayBuffer());
      } else {
        const sigCanvas = document.createElement('canvas');
        sigCanvas.width = 300;
        sigCanvas.height = 100;
        const ctx = sigCanvas.getContext('2d');
        if (ctx) {
          ctx.font = 'italic 32px "Caveat", "Brush Script MT", cursive';
          ctx.fillStyle = '#0f172a';
          ctx.fillText(signatureName || 'Signature', 20, 60);
          const dataUrl = sigCanvas.toDataURL('image/png');
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          sigImageBytes = new Uint8Array(await blob.arrayBuffer());
        }
      }

      if (sigImageBytes) {
        const sigImage = await pdfDoc.embedPng(sigImageBytes);
        firstPage.drawImage(sigImage, {
          x: width - 220,
          y: 60,
          width: 160,
          height: 60
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      trackEvent('Sign PDF', 1, 'success', Date.now() - startTime);

      navigate('/download', {
        state: {
          files: [{
            url,
            filename: file.name.replace('.pdf', '_signed.pdf'),
            size: blob.size
          }],
          action: 'signed'
        }
      });
    } catch (error) {
      console.error('Sign failed:', error);
      trackEvent('Sign PDF', 1, 'failed', Date.now() - startTime);
      toast.error('Failed to sign PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolWorkspaceLayout
      title="Sign PDF"
      subtitle="Sign yourself or request electronic signatures from others. Draw or type your signature online."
      selectButtonText="Select PDF file"
      multiple={false}
      files={files}
      onFilesChange={handleFilesChange}
      sidebarTitle="Signature options"
      infoMessage="Create your digital signature by drawing with a pen or typing your name."
      actionButtonText="Sign PDF"
      onAction={handleSign}
      isProcessing={isProcessing}
      isProcessingText="Embedding signature..."
      seoTitle="Sign PDF - Sign documents online for free"
      seoDescription="Create and add digital electronic signatures to PDF files online."
      seoUrl="https://pdfloveyou.com/sign-pdf"
      customCanvasContent={
        pagePreviewUrl ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-md max-w-sm relative">
              <img src={pagePreviewUrl} alt="Document" className="w-full rounded-lg" />
              <div className="absolute bottom-8 right-8 border border-dashed border-red-400 bg-red-50/80 px-4 py-2 rounded-lg text-xs font-bold text-red-600">
                Signature Placed Here
              </div>
            </div>
          </div>
        ) : null
      }
      customSidebarContent={
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setSignMode('draw')}
              className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                signMode === 'draw' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" /> Draw
            </button>
            <button
              type="button"
              onClick={() => setSignMode('type')}
              className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                signMode === 'type' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              <Type className="w-3.5 h-3.5" /> Type
            </button>
          </div>

          {signMode === 'draw' ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span>Draw your signature</span>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-[#E5322D] hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Clear
                </button>
              </div>
              <canvas
                ref={canvasRef}
                width={300}
                height={120}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="w-full bg-white border border-slate-200 rounded-xl cursor-crosshair shadow-2xs"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Your Name</label>
              <input
                type="text"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                placeholder="Type your name"
                className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-sm font-bold focus:outline-hidden focus:border-[#E5322D]"
              />
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center italic text-xl font-serif text-slate-800">
                {signatureName || 'Signature'}
              </div>
            </div>
          )}
        </div>
      }
    />
  );
}
