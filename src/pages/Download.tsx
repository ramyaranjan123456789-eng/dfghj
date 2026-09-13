import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Download as DownloadIcon,
  ArrowLeft,
  Link as LinkIcon,
  Trash2,
  ChevronRight,
  Check,
  Share2,
  HardDrive,
  Cloud,
  CheckCircle2,
  Sparkles,
  PartyPopper,
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { useToast } from '@/context/ToastContext';
import { getToolVectorIcon } from '@/components/ToolIcons';

interface DownloadFile {
  url: string;
  filename: string;
  size?: number;
  originalSize?: number;
}

interface DownloadState {
  url?: string;
  filename?: string;
  size?: number;
  originalSize?: number;
  files?: DownloadFile[];
  action: string;
}

// Helper to format title matching authentic iLovePDF
function formatDownloadHeading(action: string): string {
  const a = action.toLowerCase().trim();
  if (a.includes('split')) return 'PDF has been split!';
  if (a.includes('merge')) return 'PDFs have been merged!';
  if (a.includes('compress')) return 'PDF has been compressed!';
  if (a.includes('rotate')) return 'PDF has been rotated!';
  if (a.includes('watermark') || a.includes('stamp')) return 'Watermark has been added!';
  if (a.includes('page_number') || a.includes('number')) return 'Page numbers have been added!';
  if (a.includes('protect') || a.includes('encrypt')) return 'PDF has been protected!';
  if (a.includes('unlock')) return 'PDF has been unlocked!';
  if (a.includes('sign')) return 'PDF has been signed!';
  if (a.includes('organize')) return 'PDF pages have been organized!';
  if (a.includes('crop')) return 'PDF has been cropped!';
  if (a.includes('redact')) return 'PDF has been redacted!';
  if (a.includes('repair')) return 'PDF has been repaired!';
  if (a.includes('ocr')) return 'PDF has been OCR processed!';
  if (a.includes('convert') || a.includes('to_')) return 'PDF has been converted!';
  if (a.includes('fill') || a.includes('form')) return 'PDF form has been saved!';
  if (a.includes('translate')) return 'PDF has been translated!';
  return 'PDF has been processed!';
}

// Helper to format button label
function formatButtonLabel(action: string): string {
  const a = action.toLowerCase().trim();
  if (a.includes('split')) return 'Download split PDF';
  if (a.includes('merge')) return 'Download merged PDF';
  if (a.includes('compress')) return 'Download compressed PDF';
  if (a.includes('rotate')) return 'Download rotated PDF';
  if (a.includes('watermark')) return 'Download watermarked PDF';
  if (a.includes('number')) return 'Download numbered PDF';
  if (a.includes('protect')) return 'Download protected PDF';
  if (a.includes('unlock')) return 'Download unlocked PDF';
  if (a.includes('sign')) return 'Download signed PDF';
  if (a.includes('organize')) return 'Download organized PDF';
  if (a.includes('jpg_to_pdf')) return 'Download converted PDF';
  if (a.includes('pdf_to_jpg')) return 'Download JPG images';
  if (a.includes('word')) return 'Download Word document';
  if (a.includes('excel')) return 'Download Excel sheet';
  if (a.includes('powerpoint')) return 'Download PowerPoint';
  return 'Download PDF';
}

export function Download() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const state = location.state as DownloadState | null;

  const [showAllTools, setShowAllTools] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const filesToDownload: DownloadFile[] =
    state?.files && state.files.length > 0
      ? state.files
      : state?.url && state?.filename
      ? [
          {
            url: state.url,
            filename: state.filename,
            size: state.size,
            originalSize: state.originalSize,
          },
        ]
      : [];

  useEffect(() => {
    if (!state || filesToDownload.length === 0) {
      navigate('/');
      return;
    }

    // Trigger colorful paper blast confetti cannons on successful conversion
    const fireBlast = () => {
      // Center burst
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.5 },
        colors: ['#E5322D', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'],
        disableForReducedMotion: true,
      });

      // Left blast cannon
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 60,
          origin: { x: 0.1, y: 0.6 },
          colors: ['#E5322D', '#10B981', '#3B82F6', '#FBBF24'],
          disableForReducedMotion: true,
        });
      }, 150);

      // Right blast cannon
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 60,
          origin: { x: 0.9, y: 0.6 },
          colors: ['#E5322D', '#10B981', '#3B82F6', '#EC4899'],
          disableForReducedMotion: true,
        });
      }, 300);
    };

    const timer = setTimeout(fireBlast, 100);
    return () => clearTimeout(timer);
  }, [state, navigate, filesToDownload.length]);

  const triggerConfettiBlast = () => {
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#E5322D', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'],
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 45,
      angle: 60,
      spread: 55,
      origin: { x: 0.15, y: 0.65 },
      colors: ['#E5322D', '#10B981', '#FBBF24'],
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 45,
      angle: 120,
      spread: 55,
      origin: { x: 0.85, y: 0.65 },
      colors: ['#3B82F6', '#EC4899', '#10B981'],
      disableForReducedMotion: true,
    });
  };

  if (!state || filesToDownload.length === 0) {
    return null;
  }

  const handleDownload = () => {
    filesToDownload.forEach((file, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 300);
    });
    toast.success('Download started!');
  };

  const handleGoogleDrive = () => {
    // Initiate download and inform user
    handleDownload();
    toast.info('Downloading file to save to Google Drive');
  };

  const handleDropbox = () => {
    handleDownload();
    toast.info('Downloading file to save to Dropbox');
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleDelete = () => {
    filesToDownload.forEach((file) => URL.revokeObjectURL(file.url));
    toast.info('Task cleared.');
    navigate('/');
  };

  const nextTools = [
    {
      title: 'Compress PDF',
      href: '/compress',
      icon: getToolVectorIcon('Compress PDF', 'compress', 'w-8 h-8'),
    },
    {
      title: 'Merge PDF',
      href: '/merge',
      icon: getToolVectorIcon('Merge PDF', 'merge', 'w-8 h-8'),
    },
    {
      title: 'Add page numbers',
      href: '/page-numbers',
      icon: getToolVectorIcon('Page numbers', 'page-numbers', 'w-8 h-8'),
    },
    {
      title: 'Add watermark',
      href: '/watermark',
      icon: getToolVectorIcon('Watermark', 'watermark', 'w-8 h-8'),
    },
    {
      title: 'Rotate PDF',
      href: '/rotate',
      icon: getToolVectorIcon('Rotate PDF', 'rotate', 'w-8 h-8'),
    },
    {
      title: 'Protect PDF',
      href: '/protect-pdf',
      icon: getToolVectorIcon('Protect PDF', 'lock', 'w-8 h-8'),
    },
    {
      title: 'Split PDF',
      href: '/split',
      icon: getToolVectorIcon('Split PDF', 'split', 'w-8 h-8'),
    },
    {
      title: 'PDF to Word',
      href: '/pdf-to-word',
      icon: getToolVectorIcon('PDF to Word', 'word', 'w-8 h-8'),
    },
    {
      title: 'Organize PDF',
      href: '/organize',
      icon: getToolVectorIcon('Organize PDF', 'organize', 'w-8 h-8'),
    },
    {
      title: 'Sign PDF',
      href: '/sign-pdf',
      icon: getToolVectorIcon('Sign PDF', 'sign', 'w-8 h-8'),
    },
    {
      title: 'OCR PDF',
      href: '/ocr-pdf',
      icon: getToolVectorIcon('OCR PDF', 'ocr', 'w-8 h-8'),
    },
    {
      title: 'Unlock PDF',
      href: '/unlock',
      icon: getToolVectorIcon('Unlock PDF', 'unlock', 'w-8 h-8'),
    },
  ];

  const displayedTools = showAllTools ? nextTools : nextTools.slice(0, 6);

  return (
    <div className="min-h-[calc(100vh-140px)] bg-[#F8FAFC] py-14 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-start">
      <SEO
        title="Download Processed Files - PDFLovesYou"
        description="Download your processed PDF files securely from PDFLovesYou."
        url="https://pdflovesyou.com/download"
      />

      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        {/* Congratulations Badge & Celebration Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="flex flex-col items-center mb-5 cursor-pointer group"
          onClick={triggerConfettiBlast}
          title="Click to blast confetti!"
        >
          <div className="relative mb-3 transition-transform duration-200 group-hover:scale-105 active:scale-95">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-4 ring-emerald-100">
              <CheckCircle2 className="w-9 h-9 sm:w-11 sm:h-11" strokeWidth={2.4} />
            </div>
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 15 }}
              className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shadow-sm"
            >
              <PartyPopper className="w-4 h-4" />
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="absolute -bottom-1 -left-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </motion.div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs sm:text-sm font-bold tracking-wide uppercase transition-colors group-hover:bg-emerald-100">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Congratulations!</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.25 }}
          className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight text-center mb-8 font-display"
        >
          {formatDownloadHeading(state.action)}
        </motion.h1>

        {/* Main Action Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center gap-3 sm:gap-4 mb-10 flex-wrap"
        >
          {/* Back Button */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#383B42] hover:bg-[#2C2E33] text-white flex items-center justify-center shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Big Red Download Button */}
          <button
            type="button"
            onClick={handleDownload}
            className="h-14 sm:h-16 px-6 sm:px-9 bg-[#E5322D] hover:bg-[#D02823] text-white text-lg sm:text-xl font-bold rounded-2xl shadow-lg shadow-red-500/20 flex items-center gap-3 active:scale-[0.98] transition-all cursor-pointer group"
          >
            <DownloadIcon className="w-6 h-6 group-hover:translate-y-0.5 transition-transform" />
            <span>{formatButtonLabel(state.action)}</span>
          </button>

          {/* 2x2 Action Icons */}
          <div className="grid grid-cols-2 gap-2">
            {/* Google Drive */}
            <button
              type="button"
              onClick={handleGoogleDrive}
              aria-label="Save to Google Drive"
              title="Save to Google Drive"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#E5322D] hover:bg-[#D02823] text-white flex items-center justify-center shadow-sm transition-transform hover:scale-110 active:scale-95 cursor-pointer"
            >
              <HardDrive className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Share / Copy Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              aria-label="Share link"
              title="Share or copy link"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#E5322D] hover:bg-[#D02823] text-white flex items-center justify-center shadow-sm transition-transform hover:scale-110 active:scale-95 cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-200" /> : <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            {/* Dropbox */}
            <button
              type="button"
              onClick={handleDropbox}
              aria-label="Save to Dropbox"
              title="Save to Dropbox"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#E5322D] hover:bg-[#D02823] text-white flex items-center justify-center shadow-sm transition-transform hover:scale-110 active:scale-95 cursor-pointer"
            >
              <Cloud className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Delete / Clear */}
            <button
              type="button"
              onClick={handleDelete}
              aria-label="Delete file"
              title="Delete processed file"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#E5322D] hover:bg-[#D02823] text-white flex items-center justify-center shadow-sm transition-transform hover:scale-110 active:scale-95 cursor-pointer"
            >
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </motion.div>

        {/* Continue to... Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-800 tracking-tight">
              Continue to...
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
            {displayedTools.map((tool) => (
              <Link
                key={tool.title}
                to={tool.href}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-200/60"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {tool.icon}
                  <span className="text-xs sm:text-sm font-semibold text-slate-700 group-hover:text-[#E5322D] transition-colors truncate">
                    {tool.title}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
              </Link>
            ))}
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={() => setShowAllTools(!showAllTools)}
              className="text-xs font-bold text-slate-800 hover:text-[#E5322D] underline hover:no-underline transition-colors cursor-pointer"
            >
              {showAllTools ? 'See less' : 'See more'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
