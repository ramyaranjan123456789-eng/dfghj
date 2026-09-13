import React, { useState, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  QrCode, 
  Smartphone, 
  CheckCircle2, 
  Clock, 
  UploadCloud, 
  RotateCw, 
  Trash2, 
  Plus, 
  X, 
  Loader2, 
  ArrowRight, 
  Info, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink,
  Download,
  RefreshCw,
  Sliders,
  FileCheck,
  AlertCircle,
  LayoutGrid,
  Upload,
  FileText
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useToast } from '@/context/ToastContext';
import { SEO } from '@/components/SEO';
import { saveAs } from 'file-saver';
import { cn } from '@/lib/utils';

interface ScannedPage {
  id: string;
  dataUrl: string;
  name: string;
  rotation: number;
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'uploading' | 'finished';

export function ScanToPdf() {
  const [sessionId] = useState(() => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  });

  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mobileConnected, setMobileConnected] = useState(false);
  
  const [scanFilter, setScanFilter] = useState<'normal' | 'bw' | 'contrast'>('contrast');
  const [isCompiling, setIsCompiling] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activePageIndex, setActivePageIndex] = useState(0);

  const socketRef = useRef<WebSocket | null>(null);
  const toast = useToast();
  const { trackEvent } = useAnalytics();

  const mobileScanUrl = `${window.location.origin}/scan?session=${sessionId}`;

  const handleStartOver = () => {
    setPages([]);
    setStatus('disconnected');
    setActivePageIndex(0);
    toast.info('Session reset. Ready for a new scan.');
  };

  const updatePagesSafely = (incomingImages: ScannedPage[]) => {
    const seen = new Set<string>();
    const deduplicated: ScannedPage[] = [];
    incomingImages.forEach((img, idx) => {
      const id = img.id || `${Date.now()}-${idx}`;
      if (!seen.has(id)) {
        seen.add(id);
        deduplicated.push({ ...img, id });
      }
    });
    setPages(deduplicated);
  };

  // Establish WebSocket connection & REST sync
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    let isMounted = true;
    let ws: WebSocket | null = null;

    const connectWs = () => {
      try {
        ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          if (!isMounted) return;
          ws?.send(JSON.stringify({ type: 'REGISTER', sessionId, role: 'desktop' }));
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'REGISTER_ACK') {
              setStatus(data.status || 'disconnected');
              setMobileConnected(data.mobileConnected || false);
              if (Array.isArray(data.images) && data.images.length > 0) {
                updatePagesSafely(data.images);
              }
            } else if (data.type === 'PEER_STATUS') {
              setMobileConnected(data.mobileConnected || false);
              if (data.mobileConnected) {
                setStatus((prev) => (prev === 'finished' ? 'finished' : 'connected'));
                toast.success('📱 Mobile phone connected!');
              } else {
                toast.info('Mobile phone disconnected');
              }
            } else if (data.type === 'STATUS_CHANGE') {
              setStatus(data.status);
              if (data.progress !== undefined) setUploadProgress(data.progress);
            } else if (data.type === 'SESSION_UPDATE') {
              setStatus(data.status || 'finished');
              if (Array.isArray(data.images)) {
                updatePagesSafely(data.images);
              }
              toast.success(`📄 Scanned pages updated on PC!`);
            }
          } catch (e) {
            console.error('WS parse error:', e);
          }
        };

        ws.onclose = () => {
          if (isMounted) {
            setTimeout(connectWs, 3000); // Reconnect loop
          }
        };
      } catch (e) {
        console.warn('WS fallback to HTTP polling:', e);
      }
    };

    connectWs();

    // Fallback HTTP polling interval
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/scan/session/${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setMobileConnected(data.mobileConnected);
            if (data.status && data.status !== 'disconnected') {
              setStatus(data.status);
            }
            if (Array.isArray(data.images)) {
              updatePagesSafely(data.images);
            }
          }
        }
      } catch (e) {
        // Silent poll error handling
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      ws?.close();
    };
  }, [sessionId]);

  // Dropzone for manual image upload fallback on desktop
  const onDrop = (acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const newPage: ScannedPage = {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            dataUrl: e.target.result as string,
            name: file.name,
            rotation: 0,
          };
          setPages((prev) => [...prev, newPage]);
          setStatus('finished');
        }
      };
      reader.readAsDataURL(file);
    });
    toast.success(`Added ${acceptedFiles.length} page(s)`);
  };

  const { getRootProps, getInputProps, isDragActive, open: openFilePicker } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    noClick: true,
  } as any);

  const rotatePage = (id: string) => {
    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
    );
  };

  const deletePage = (id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
    fetch(`/api/scan/session/${sessionId}/pages/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const copyMobileLink = () => {
    navigator.clipboard.writeText(mobileScanUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    toast.success('Mobile QR scanner URL copied!');
  };

  const loadDemoScan = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1100;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 800, 1100);

      ctx.fillStyle = '#e11d48';
      ctx.fillRect(50, 50, 700, 8);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText(`SCANNED DOCUMENT PAGE #${pages.length + 1}`, 50, 110);

      ctx.fillStyle = '#64748b';
      ctx.font = '16px monospace';
      ctx.fillText(`Date: ${new Date().toLocaleDateString()} | Mobile Session: ${sessionId}`, 50, 140);

      ctx.fillStyle = '#334155';
      ctx.font = '18px sans-serif';
      const sampleText = [
        'OFFICIAL DOCUMENT SUMMARY & MOBILE SCAN RECORD',
        '-----------------------------------------------------------------',
        '1. Source: Scanned via Mobile Smartphone Camera QR link.',
        '2. Security: High-contrast document processing on desktop.',
        '3. Standard: Compliant with PDF/A archiving standards.',
        `4. Link Session ID: ${sessionId}`,
        '',
        'Authorized Signature: _______________________',
        'Verified Stamp: [iLovePDF TOOLKIT CERTIFIED]',
      ];

      sampleText.forEach((line, idx) => {
        ctx.fillText(line, 50, 200 + idx * 36);
      });

      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      const newPage: ScannedPage = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        dataUrl,
        name: `Sample Page ${pages.length + 1}`,
        rotation: 0,
      };
      setPages((prev) => [...prev, newPage]);
      setStatus('finished');
      toast.success('Sample page added to document list!');
    }
  };

  const handleCreatePdf = async () => {
    if (pages.length === 0) return;
    setIsCompiling(true);
    trackEvent('scan_to_pdf', 'pdf_tool', pages.length);

    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      for (let i = 0; i < pages.length; i++) {
        if (i > 0) doc.addPage('a4', 'p');
        const page = pages[i];

        // Apply rotation if present
        if (page.rotation !== 0) {
          const img = new Image();
          await new Promise((resolve) => {
            img.onload = resolve;
            img.src = page.dataUrl;
          });

          const canvas = document.createElement('canvas');
          if (page.rotation % 180 !== 0) {
            canvas.width = img.height;
            canvas.height = img.width;
          } else {
            canvas.width = img.width;
            canvas.height = img.height;
          }

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((page.rotation * Math.PI) / 180);
            ctx.drawImage(img, -img.width / 2, -img.height / 2);
            const rotatedUrl = canvas.toDataURL('image/jpeg', 0.92);
            doc.addImage(rotatedUrl, 'JPEG', 0, 0, 210, 297);
          }
        } else {
          doc.addImage(page.dataUrl, 'JPEG', 0, 0, 210, 297);
        }
      }

      const pdfBlob = doc.output('blob');
      saveAs(pdfBlob, `scanned_document_${sessionId}.pdf`);
      toast.success(`Successfully compiled ${pages.length} page(s) into PDF!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF file.');
    } finally {
      setIsCompiling(false);
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'connecting':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-extrabold border border-amber-200">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Connecting...
          </span>
        );
      case 'connected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-extrabold border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Connected ✅
          </span>
        );
      case 'uploading':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-extrabold border border-blue-200">
            <UploadCloud className="w-3.5 h-3.5 animate-bounce" /> Uploading... ({uploadProgress}%)
          </span>
        );
      case 'finished':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-extrabold border border-rose-200">
            <FileCheck className="w-3.5 h-3.5 text-rose-500" /> Finished ✔️ ({pages.length} Pages)
          </span>
        );
      case 'disconnected':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-extrabold border border-slate-200">
            <Clock className="w-3.5 h-3.5" /> Disconnected 📴
          </span>
        );
    }
  };

  const [sidebarTab, setSidebarTab] = useState<'pages' | 'filters' | 'options'>('pages');
  const [showQrModal, setShowQrModal] = useState(false);

  return (
    <div className="h-[calc(100vh-64px)] bg-slate-50 flex flex-col font-sans overflow-hidden relative">
      <SEO
        title="Scan to PDF - Scan Documents with Smartphone Camera to Browser"
        description="Scan physical documents using your mobile phone camera via QR code and save directly as a PDF."
      />

      <div {...getRootProps()} className="flex-1 flex flex-col md:flex-row h-full overflow-hidden relative">
        <input {...getInputProps()} />

        {/* Content Area */}
        {pages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-between p-4 md:p-6 overflow-y-auto">
            {/* Top bar with Start Over button */}
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={handleStartOver}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-rose-600 border border-slate-200/90 rounded-full text-xs font-bold shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-rose-500" />
                Start Over
              </button>
            </div>

            <div className="w-full max-w-4xl flex flex-col items-center justify-center my-auto">
              {/* Title Header */}
              <div className="text-center max-w-xl mb-6">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-1 font-display">
                  Scan to <span className="text-emerald-600">PDF</span>
                </h1>
                <p className="text-sm md:text-base text-slate-600 font-medium">
                  Scan documents from your smartphone to your browser
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0"
              >
                {/* Step 1 Card */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-slate-100 flex flex-col items-center justify-between text-center relative overflow-hidden group">
                  <div className="w-full space-y-1 mb-4">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Step 1</h2>
                    <p className="text-slate-600 text-xs font-semibold max-w-xs mx-auto leading-snug">
                      Use your smartphone's camera to scan this QR code
                    </p>
                  </div>

                  {/* QR Code */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs inline-block my-1">
                    <QRCodeSVG
                      value={mobileScanUrl}
                      size={170}
                      level="H"
                      includeMargin={false}
                      className="mx-auto"
                    />
                  </div>

                  {/* Copy & Demo Helpers */}
                  <div className="w-full mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={copyMobileLink}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                      {copiedLink ? 'Copied' : 'Copy URL'}
                    </button>

                    <a
                      href={mobileScanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Test Mobile
                    </a>

                    <button
                      type="button"
                      onClick={loadDemoScan}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Demo Page
                    </button>
                  </div>
                </div>

                {/* Step 2 Card */}
                <div className={cn(
                  "rounded-3xl p-6 md:p-8 flex flex-col items-center justify-between text-center relative transition-all duration-300",
                  mobileConnected 
                    ? "bg-white shadow-md border-2 border-emerald-400" 
                    : "bg-white/80 border border-slate-200/80 shadow-xs"
                )}>
                  <div className="w-full space-y-1 mb-2">
                    <h2 className="text-2xl font-black text-slate-400 tracking-tight">Step 2</h2>
                    <div className="flex items-center justify-center pt-1">
                      {getStatusBadge()}
                    </div>
                  </div>

                  <div className="space-y-2 max-w-xs mx-auto my-auto py-2">
                    <p className="text-slate-600 text-xs font-medium leading-relaxed">
                      To scan your documents, please follow the instructions on your mobile screen, and tap <strong className="text-slate-900 font-bold">Save</strong> when you're done
                    </p>
                    <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                      Do not close this tab.
                    </p>
                  </div>

                  {/* Graphic Illustration */}
                  <div className="w-full max-w-[180px] mx-auto mt-3 py-3 flex items-center justify-center gap-3 bg-slate-50 rounded-xl border border-slate-200/60">
                    <Smartphone className="w-7 h-7 text-slate-400 shrink-0" />
                    <ArrowRight className="w-4 h-4 text-emerald-500 shrink-0 animate-pulse" />
                    <FileText className="w-7 h-7 text-emerald-600 shrink-0" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        ) : (
          /* Scanned Studio Editor UI Matching Screenshot */
          <div className="flex-1 flex flex-col md:flex-row h-full w-full overflow-hidden">
            {/* Left Main Workspace Canvas */}
            <div className="flex-1 h-full bg-slate-100/70 p-6 md:p-10 relative flex flex-col items-center justify-center overflow-y-auto">
              {/* Top Right "Remove file" button */}
              <button
                type="button"
                onClick={handleStartOver}
                className="absolute top-6 right-8 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer z-10"
              >
                <X className="w-4 h-4 text-slate-500" />
                Remove file
              </button>

              {/* Canvas Center Page Previews */}
              <div className="w-full max-w-3xl flex flex-col items-center justify-center my-auto">
                <div className="text-slate-500 font-medium text-sm mb-4">
                  Range {activePageIndex + 1}
                </div>

                {/* Main Dashed Border Card Frame */}
                <div className="w-full max-w-md bg-transparent p-6 rounded-3xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center relative transition-all group">
                  {pages[activePageIndex] && (
                    <div className="relative bg-white shadow-xl rounded-xl border border-slate-200/80 overflow-hidden max-h-[420px] p-2 flex flex-col items-center justify-center">
                      <img
                        src={pages[activePageIndex].dataUrl}
                        alt={pages[activePageIndex].name}
                        style={{ transform: `rotate(${pages[activePageIndex].rotation}deg)` }}
                        className={cn(
                          "max-h-[380px] max-w-[280px] object-contain transition-all duration-200 rounded-md",
                          scanFilter === 'bw' && 'grayscale contrast-125',
                          scanFilter === 'contrast' && 'contrast-150 brightness-105'
                        )}
                      />

                      {/* Bottom Page Number Pill Overlay */}
                      <div className="w-full bg-slate-800 text-white font-extrabold text-xs py-1.5 text-center mt-1 rounded-b-md flex items-center justify-center gap-1">
                        <span>{activePageIndex + 1}</span>
                      </div>
                    </div>
                  )}

                  {/* Thumbnail Row if Multiple Pages */}
                  {pages.length > 1 && (
                    <div className="flex items-center gap-3 mt-6 overflow-x-auto max-w-full p-2">
                      {pages.map((p, idx) => (
                        <div
                          key={p.id}
                          onClick={() => setActivePageIndex(idx)}
                          className={cn(
                            "relative w-16 h-20 rounded-lg border-2 bg-white p-1 cursor-pointer overflow-hidden transition-all shrink-0",
                            activePageIndex === idx
                              ? "border-emerald-500 ring-2 ring-emerald-200 scale-105 shadow-md"
                              : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                          )}
                        >
                          <img
                            src={p.dataUrl}
                            alt=""
                            className="w-full h-full object-cover rounded-xs"
                          />
                          <span className="absolute bottom-1 right-1 bg-slate-900 text-white text-[10px] font-bold px-1 rounded-xs">
                            {idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar Panel */}
            <div className="w-full md:w-80 lg:w-96 bg-white border-l border-slate-200/80 h-full flex flex-col justify-between p-6 shadow-sm overflow-y-auto shrink-0">
              {/* Header Title */}
              <div className="text-center pb-4 border-b border-slate-100">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight font-display">
                  Scan to <span className="text-emerald-600">PDF</span>
                </h2>
              </div>

              {/* Navigation Tabs (Range / Pages / Mode) */}
              <div className="grid grid-cols-3 gap-1 border-b border-slate-200 my-4 text-center">
                <button
                  type="button"
                  onClick={() => setSidebarTab('pages')}
                  className={cn(
                    "pb-3 text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer border-b-2",
                    sidebarTab === 'pages'
                      ? "border-emerald-500 text-emerald-600"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  )}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span>Pages</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSidebarTab('filters')}
                  className={cn(
                    "pb-3 text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer border-b-2",
                    sidebarTab === 'filters'
                      ? "border-emerald-500 text-emerald-600"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  )}
                >
                  <Sliders className="w-4 h-4" />
                  <span>Filter</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSidebarTab('options')}
                  className={cn(
                    "pb-3 text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer border-b-2",
                    sidebarTab === 'options'
                      ? "border-emerald-500 text-emerald-600"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  )}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Options</span>
                </button>
              </div>

              {/* Sidebar Content Area */}
              <div className="flex-1 py-2 space-y-6">
                {sidebarTab === 'pages' && (
                  <div className="space-y-5">
                    {/* Status Pill */}
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-3 rounded-2xl text-xs font-bold text-emerald-800">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Ready ({pages.length} {pages.length === 1 ? 'Page' : 'Pages'})</span>
                      </div>
                      <span className="text-[11px] bg-emerald-200/80 px-2 py-0.5 rounded-md font-extrabold text-emerald-900">
                        Live Sync
                      </span>
                    </div>

                    {/* Active Page Controls */}
                    {pages[activePageIndex] && (
                      <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span>Page {activePageIndex + 1} Actions</span>
                          <span className="text-slate-400 text-[11px] font-normal">{pages[activePageIndex].name}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => rotatePage(pages[activePageIndex].id)}
                            className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                          >
                            <RotateCw className="w-3.5 h-3.5 text-emerald-600" /> Rotate 90°
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const pageIdToDelete = pages[activePageIndex].id;
                              deletePage(pageIdToDelete);
                              if (activePageIndex >= pages.length - 1) {
                                setActivePageIndex(Math.max(0, pages.length - 2));
                              }
                            }}
                            className="p-2.5 bg-white hover:bg-rose-50 border border-slate-200 text-rose-600 hover:border-rose-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete Page
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Scan More Pages Action */}
                    <div className="space-y-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowQrModal(true)}
                        className="w-full py-3 border-2 border-emerald-500 text-emerald-700 hover:bg-emerald-50 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" /> Scan More Pages (Phone QR)
                      </button>

                      <button
                        type="button"
                        onClick={openFilePicker}
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        <Upload className="w-3.5 h-3.5" /> Upload Image File
                      </button>
                    </div>
                  </div>
                )}

                {sidebarTab === 'filters' && (
                  <div className="space-y-4">
                    <label className="text-xs font-extrabold text-slate-700 block uppercase tracking-wider">
                      Document Color Filter
                    </label>

                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setScanFilter('contrast')}
                        className={cn(
                          "w-full p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer",
                          scanFilter === 'contrast'
                            ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        )}
                      >
                        <span>Enhanced Document (Magic Color)</span>
                        {scanFilter === 'contrast' && <Check className="w-4 h-4 text-emerald-600" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setScanFilter('bw')}
                        className={cn(
                          "w-full p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer",
                          scanFilter === 'bw'
                            ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        )}
                      >
                        <span>Black & White Scanner</span>
                        {scanFilter === 'bw' && <Check className="w-4 h-4 text-emerald-600" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setScanFilter('normal')}
                        className={cn(
                          "w-full p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer",
                          scanFilter === 'normal'
                            ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        )}
                      >
                        <span>Original Colors</span>
                        {scanFilter === 'normal' && <Check className="w-4 h-4 text-emerald-600" />}
                      </button>
                    </div>
                  </div>
                )}

                {sidebarTab === 'options' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold text-slate-700 block uppercase tracking-wider">
                        Page Orientation
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          className="p-2.5 bg-emerald-50 border-2 border-emerald-500 text-emerald-800 text-xs font-bold rounded-xl text-center"
                        >
                          Auto Portrait
                        </button>
                        <button
                          type="button"
                          className="p-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl text-center hover:bg-slate-50"
                        >
                          Landscape
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="text-xs font-extrabold text-slate-700 block uppercase tracking-wider">
                        PDF Quality
                      </label>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600">
                        High Print Quality (A4 Size)
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Main CTA Download Button */}
              <div className="pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCreatePdf}
                  disabled={isCompiling}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-base font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer"
                >
                  {isCompiling ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Compiling PDF...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" /> Download PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Scan More Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full text-center relative shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-slate-900 mb-1">Scan More Pages</h3>
            <p className="text-xs text-slate-500 font-medium mb-4">
              Scan additional pages using your smartphone camera
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 inline-block mb-4">
              <QRCodeSVG
                value={mobileScanUrl}
                size={180}
                level="H"
                includeMargin={false}
                className="mx-auto"
              />
            </div>

            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={copyMobileLink}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copiedLink ? 'Copied' : 'Copy Mobile Link'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
