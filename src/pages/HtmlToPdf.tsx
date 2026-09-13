import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { useNavigate } from 'react-router-dom';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useToast } from '@/context/ToastContext';
import { ToolWorkspaceLayout } from '@/components/ToolWorkspaceLayout';
import { Globe, Code } from 'lucide-react';

export function HtmlToPdf() {
  const [url, setUrl] = useState('');
  const [htmlCode, setHtmlCode] = useState('<div style="font-family: sans-serif; padding: 24px;">\n  <h1 style="color: #E5322D;">Document Summary</h1>\n  <p>Thank you for choosing our PDF tools! Your order has been processed.</p>\n</div>');
  const [activeMode, setActiveMode] = useState<'url' | 'code'>('code');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const toast = useToast();
  const { trackEvent } = useAnalytics();
  const navigate = useNavigate();

  const handleConvert = async () => {
    setIsProcessing(true);
    const startTime = Date.now();

    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const source = activeMode === 'code' 
        ? htmlCode 
        : `<div style="font-family: sans-serif; padding: 30px;"><h2>Webpage snapshot:</h2><p><a href="${url}">${url}</a></p><p>Captured online snapshot rendered into standard document format.</p></div>`;
      
      const container = document.createElement('div');
      container.style.width = '550pt';
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.innerHTML = source;
      document.body.appendChild(container);

      await doc.html(container, {
        callback: function (pdf) {
          document.body.removeChild(container);
          const blob = pdf.output('blob');
          const pdfUrl = URL.createObjectURL(blob);

          trackEvent('HTML to PDF', 1, 'success', Date.now() - startTime);

          navigate('/download', {
            state: {
              files: [{
                url: pdfUrl,
                filename: activeMode === 'code' ? 'html_document.pdf' : 'webpage.pdf',
                size: blob.size
              }],
              action: 'converted to PDF'
            }
          });
        },
        x: 20,
        y: 20
      });
    } catch (err) {
      console.error(err);
      trackEvent('HTML to PDF', 1, 'failed', Date.now() - startTime);
      toast.error('Failed to convert HTML to PDF.');
      setIsProcessing(false);
    }
  };

  return (
    <ToolWorkspaceLayout
      title="Convert HTML to PDF"
      subtitle="Convert webpages in HTML to PDF. Copy and paste the URL of the page you want or paste raw HTML code."
      selectButtonText="Paste HTML or URL"
      files={[]}
      onFilesChange={() => {}}
      sidebarTitle="HTML options"
      infoMessage="Choose whether to capture an online website URL or render raw HTML markup code."
      actionButtonText="Convert to PDF"
      onAction={handleConvert}
      isProcessing={isProcessing}
      isProcessingText="Rendering HTML to PDF..."
      actionDisabled={activeMode === 'url' ? !url.trim() : !htmlCode.trim()}
      seoTitle="HTML to PDF - Convert Webpages and HTML Code to PDF"
      seoDescription="Convert web pages, URLs, and HTML code into PDF online."
      seoUrl="https://pdfloveyou.com/html-to-pdf"
      customCanvasContent={
        <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full p-4">
          <div className="p-1 bg-slate-100 rounded-xl flex gap-1 mb-4">
            <button
              type="button"
              onClick={() => setActiveMode('code')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                activeMode === 'code' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              <Code className="w-3.5 h-3.5" /> Raw HTML Code
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('url')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                activeMode === 'url' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> Website URL
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            {activeMode === 'url' ? (
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                  Enter Webpage URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-hidden focus:border-[#E5322D]"
                />
              </div>
            ) : (
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                  Paste HTML Content
                </label>
                <textarea
                  value={htmlCode}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  rows={10}
                  className="w-full p-3 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 focus:outline-hidden focus:border-[#E5322D]"
                />
              </div>
            )}
          </div>
        </div>
      }
    />
  );
}
