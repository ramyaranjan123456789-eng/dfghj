import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Camera, 
  Smartphone, 
  CheckCircle2, 
  UploadCloud, 
  RotateCw, 
  Trash2, 
  Plus, 
  X, 
  Loader2, 
  ArrowRight, 
  Upload, 
  FileCheck, 
  RefreshCw,
  Sparkles,
  Sliders,
  Check
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '@/context/ToastContext';
import { SEO } from '@/components/SEO';
import { cn } from '@/lib/utils';

interface MobilePage {
  id: string;
  dataUrl: string;
  name: string;
  rotation: number;
}

export function ScanMobile() {
  const [searchParams] = useSearchParams();
  const sessionId = (searchParams.get('session') || 'DEMO').toUpperCase();

  const [pages, setPages] = useState<MobilePage[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanFilter, setScanFilter] = useState<'normal' | 'bw' | 'contrast'>('contrast');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const toast = useToast();

  // Connect Mobile socket
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    let ws: WebSocket | null = null;
    let isMounted = true;

    const connectWs = () => {
      try {
        ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          if (!isMounted) return;
          ws?.send(JSON.stringify({ type: 'REGISTER', sessionId, role: 'mobile' }));
        };

        ws.onclose = () => {
          if (isMounted) {
            setTimeout(connectWs, 3000);
          }
        };
      } catch (e) {
        console.warn('WS error on mobile:', e);
      }
    };

    connectWs();

    return () => {
      isMounted = false;
      ws?.close();
    };
  }, [sessionId]);

  useEffect(() => {
    if (isCameraActive && videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch((e) => console.error(e));
    }
  }, [isCameraActive, mediaStream]);

  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [mediaStream]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        });
      } catch (e) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      setMediaStream(stream);
      setIsCameraActive(true);
      toast.success('Mobile camera active!');
    } catch (err: any) {
      console.error(err);
      setCameraError('Camera access unavailable. You can tap "Gallery Photos" to upload image files.');
      toast.error('Unable to open mobile camera');
    }
  };

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
      setMediaStream(null);
    }
    setIsCameraActive(false);
  };

  const applyScanFilter = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (scanFilter === 'normal') return;
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (scanFilter === 'bw') {
        const avg = 0.299 * r + 0.587 * g + 0.114 * b;
        const v = avg > 130 ? 255 : 0;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
      } else if (scanFilter === 'contrast') {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        const factor = (259 * (150 + 255)) / (255 * (259 - 150));
        const v = Math.min(255, Math.max(0, factor * (gray - 128) + 128));
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      applyScanFilter(ctx, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

      const newPage: MobilePage = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        dataUrl,
        name: `Scanned Page ${pages.length + 1}`,
        rotation: 0,
      };

      setPages((prev) => [...prev, newPage]);
      toast.success(`Captured Page ${pages.length + 1}!`);
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              applyScanFilter(ctx, canvas.width, canvas.height);
              const processedUrl = canvas.toDataURL('image/jpeg', 0.92);

              const newPage: MobilePage = {
                id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                dataUrl: processedUrl,
                name: file.name,
                rotation: 0,
              };

              setPages((prev) => [...prev, newPage]);
            }
          };
          img.src = e.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    });
    toast.success(`Loaded ${acceptedFiles.length} file(s)!`);
  };

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.heic'] },
    noClick: true,
  } as any);

  const rotatePage = (id: string) => {
    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
    );
  };

  const deletePage = (id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSaveAndUpload = async () => {
    if (pages.length === 0) return;
    setIsUploading(true);
    setUploadProgress(10);
    setUploadSuccess(false);

    try {
      // Send WebSocket upload status update
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: 'STATUS_CHANGE',
            sessionId,
            status: 'uploading',
            progress: 30,
          })
        );
      }

      setUploadProgress(50);

      // REST upload to backend
      const res = await fetch('/api/scan/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          images: pages,
          isComplete: true,
        }),
      });

      setUploadProgress(90);

      if (res.ok) {
        setUploadProgress(100);
        setUploadSuccess(true);
        toast.success('Upload Successful! Pages transmitted live to PC screen.');
      } else {
        throw new Error('Server returned upload error');
      }
    } catch (err) {
      console.error(err);
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">
      <SEO
        title="Mobile Document Scanner - Scan to PDF PC"
        description="Capture document scans with your phone camera and transmit them instantly to your computer."
      />

      {/* Header */}
      <header className="px-4 py-3 bg-slate-800/90 backdrop-blur-md border-b border-slate-700 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-rose-600 text-white rounded-xl shadow-xs">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight leading-none text-white">Mobile Scanner</h1>
            <p className="text-[11px] text-rose-400 font-bold">Session: #{sessionId}</p>
          </div>
        </div>

        <div className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Live Connected
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-4 max-w-md mx-auto w-full flex flex-col items-center justify-start bg-[#0b0f19] min-h-[calc(100vh-60px)]">
        {uploadSuccess ? (
          /* Upload Success Screen */
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full bg-[#131b2e] border-2 border-emerald-500 p-8 rounded-3xl text-center shadow-2xl my-auto"
          >
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/40">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="text-2xl font-black text-white mb-2">Upload Successful!</h2>
            <p className="text-slate-300 text-xs leading-relaxed mb-6">
              Your <strong className="text-white">{pages.length} page(s)</strong> have been transmitted live to your computer. Look at your PC screen to finalize your PDF!
            </p>

            <button
              type="button"
              onClick={() => {
                setPages([]);
                setUploadSuccess(false);
              }}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white py-4 rounded-2xl font-extrabold text-sm shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Scan More Document Pages
            </button>
          </motion.div>
        ) : isCameraActive ? (
          /* Camera Viewfinder matching user screenshot */
          <div className="w-full flex flex-col items-center">
            <div className="relative w-full aspect-[3/4] max-h-[460px] bg-black rounded-3xl overflow-hidden border-2 border-rose-500/80 shadow-2xl mb-6">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

              {/* Dashed Pink Alignment Box */}
              <div className="absolute inset-5 border-2 border-dashed border-rose-500/90 rounded-2xl pointer-events-none flex items-center justify-center">
                <span className="text-rose-300/90 text-sm font-bold tracking-wide">
                  Align page in box
                </span>
              </div>

              {/* Bottom Camera Overlay Controls (Close | Camera Icon | Contrast) */}
              <div className="absolute bottom-4 left-0 right-0 px-6 flex items-center justify-between z-20">
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-full font-bold text-xs backdrop-blur-md cursor-pointer transition-all shadow-md"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={capturePhoto}
                  className="w-14 h-14 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center shadow-xl border-4 border-rose-400/50 active:scale-95 transition-transform cursor-pointer"
                >
                  <Camera className="w-6 h-6 stroke-[2.5]" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setScanFilter((prev) => (prev === 'contrast' ? 'bw' : prev === 'bw' ? 'normal' : 'contrast'))
                  }
                  className="px-4 py-2 bg-slate-900/90 hover:bg-slate-800 text-rose-300 border border-slate-700/80 rounded-full font-bold text-xs backdrop-blur-md capitalize cursor-pointer transition-all shadow-md"
                >
                  {scanFilter}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Main Action Panel */
          <div className="w-full bg-[#131b2e] border border-slate-800 rounded-3xl p-6 shadow-xl mb-6 text-center my-2">
            <div className="w-14 h-14 bg-rose-600/20 text-rose-500 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Camera className="w-7 h-7" />
            </div>

            <h2 className="text-2xl font-black text-white mb-1 font-display">Document Camera</h2>
            <p className="text-slate-400 text-xs mb-6 leading-relaxed">
              Capture or pick document pages. When done, tap <strong>Save</strong> to send them live to your PC screen.
            </p>

            {cameraError && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs mb-4">
                {cameraError}
              </div>
            )}

            <div className="space-y-3">
              <button
                type="button"
                onClick={startCamera}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white py-4 px-6 rounded-2xl font-extrabold text-base shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                <Camera className="w-5 h-5" />
                Open Phone Camera
              </button>

              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <button
                  type="button"
                  onClick={open}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-3.5 px-6 rounded-2xl font-bold text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-rose-400" />
                  Gallery Photos
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Captured Pages Previews matching Screenshot */}
        {pages.length > 0 && !uploadSuccess && (
          <div className="w-full mt-2">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                PAGE PREVIEWS ({pages.length})
              </h3>
              <button
                type="button"
                onClick={() => setPages([])}
                className="text-xs font-bold text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
              >
                Retake All
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {pages.map((page, idx) => (
                <div
                  key={page.id ? `${page.id}-${idx}` : `page-${idx}`}
                  className="relative aspect-[3/4] bg-[#131b2e] rounded-2xl border border-slate-800 overflow-hidden group flex flex-col justify-between shadow-md"
                >
                  <div className="flex-1 overflow-hidden flex items-center justify-center p-2">
                    <img
                      src={page.dataUrl}
                      alt={page.name}
                      style={{ transform: `rotate(${page.rotation}deg)` }}
                      className="max-w-full max-h-full object-contain rounded-md"
                    />
                  </div>

                  <div className="p-2 bg-slate-950/80 text-white flex items-center justify-between text-xs backdrop-blur-xs border-t border-slate-800">
                    <span className="font-extrabold text-[10px] px-2 py-0.5 bg-rose-600 rounded-md">
                      Page {idx + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => rotatePage(page.id)}
                        className="p-1 hover:bg-slate-800 rounded-md cursor-pointer text-slate-300"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deletePage(page.id)}
                        className="p-1 hover:bg-rose-600/30 rounded-md cursor-pointer text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Save & Upload Progress Button */}
            <div className="sticky bottom-4 bg-[#0b0f19]/90 p-2 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl">
              {isUploading && (
                <div className="mb-2 w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                  <div
                    className="bg-rose-500 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveAndUpload}
                disabled={isUploading}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white py-4 rounded-xl font-extrabold text-base shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading to PC... ({uploadProgress}%)
                  </>
                ) : (
                  <>
                    <FileCheck className="w-5 h-5" />
                    Save & Upload to PC Screen
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="p-4 text-center text-[11px] text-slate-500 border-t border-slate-800">
        Connected to PC Session #{sessionId} • iLovePDF Realtime Sync
      </footer>
    </div>
  );
}
