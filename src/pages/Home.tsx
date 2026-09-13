import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { ToolCard } from '@/components/ToolCard';
import { SEO } from '@/components/SEO';
import { 
  ShieldCheck,
  Rocket,
  Laptop,
  Heart,
  ChevronDown,
  ArrowRight,
  Smartphone,
  CheckCircle2,
  Lock,
  Sparkles,
  Zap,
  Globe,
  FileCheck,
  HelpCircle
} from 'lucide-react';

interface ToolItem {
  title: string;
  description: string;
  href: string;
  category: string;
  iconType: string;
  badge?: string;
}

export function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "Is PDFLovesYou completely 100% free?",
      a: "Yes! All PDF tools on PDFLovesYou are 100% free with no hidden paywalls, no monthly subscription fees, and no file quantity caps. You can merge, split, compress, convert, unlock, and watermark your PDFs anytime without paying a cent."
    },
    {
      q: "How does PDFLovesYou protect my files and personal privacy?",
      a: "Your privacy and data security are our highest priority. Document processing occurs directly in your local browser using client-side WebAssembly whenever possible, meaning your confidential files never leave your computer. For server-assisted tasks, files are protected with strict TLS 1.3 end-to-end encryption and permanently purged from memory immediately after download."
    },
    {
      q: "Can I convert PDFs to editable Word, Excel, or PowerPoint files?",
      a: "Yes! PDFLovesYou converts PDF documents accurately into editable DOCX, XLSX, and PPTX documents while faithfully preserving original text, styling, formatting, and tables."
    },
    {
      q: "Can I use PDFLovesYou on my mobile phone or tablet?",
      a: "Absolutely. PDFLovesYou is fully optimized for iOS and Android web browsers. It also features an integrated Mobile Scanner tool with instant QR code synchronization, allowing you to snap photos with your phone camera and sync them straight to your desktop workspace as crisp PDFs."
    },
    {
      q: "Is there any limit on file sizes or the number of documents I can process?",
      a: "Because our modern document processing engine operates client-side on your device, you can process large documents and multi-page manuals without artificial cloud upload caps or daily quotas."
    },
    {
      q: "Do I need to register an account or install any software?",
      a: "No software download, browser extension, or user registration is required. Simply open any tool in your browser, drag and drop your files, and download your finished documents in seconds."
    },
    {
      q: "Can I protect, sign, and redact confidential PDF documents?",
      a: "Yes. You can encrypt sensitive files with military-grade passwords using Protect PDF, digitally sign agreements with verifiable handwritten or typed signatures using Sign PDF, and permanently black out sensitive personal data with Redact PDF."
    },
    {
      q: "Will compressing a PDF decrease its visual text and image quality?",
      a: "Our Compress PDF tool uses intelligent lossless and adaptive downsampling algorithms. It strips redundant metadata and compresses duplicate streams while preserving crystal-clear vector text and sharp imagery, ideal for email attachments and web uploads."
    }
  ];

  // Complete directory of all PDF tools with highest-demand tools always placed at top
  const allTools: ToolItem[] = [
    // Top Row: The essential tools used everyday worldwide
    {
      title: "Merge PDF",
      description: "Combine PDFs in the order you want with the easiest PDF merger available.",
      href: "/merge",
      category: "organize",
      iconType: "merge",
      badge: "Popular"
    },
    {
      title: "Split PDF",
      description: "Separate one page or a whole set for easy conversion into independent PDF files.",
      href: "/split",
      category: "organize",
      iconType: "split",
      badge: "Popular"
    },
    {
      title: "Compress PDF",
      description: "Reduce file size while optimizing for maximal PDF quality.",
      href: "/compress",
      category: "optimize",
      iconType: "compress",
      badge: "Popular"
    },
    {
      title: "PDF to Word",
      description: "Easily convert your PDF files into easy to edit DOC and DOCX documents. The converted WORD document is almost 100% accurate.",
      href: "/pdf-to-word",
      category: "convert-from",
      iconType: "word",
      badge: "Popular"
    },
    {
      title: "Word to PDF",
      description: "Make DOC and DOCX files easy to read by converting them to PDF.",
      href: "/word-to-pdf",
      category: "convert-to",
      iconType: "word",
      badge: "Popular"
    },

    // Row 2: Most requested office conversions & e-signatures
    {
      title: "PDF to Excel",
      description: "Pull data straight from PDFs into Excel spreadsheets in a few short seconds.",
      href: "/pdf-to-excel",
      category: "convert-from",
      iconType: "excel",
      badge: "Top"
    },
    {
      title: "PDF to PowerPoint",
      description: "Turn your PDF files into easy to edit PPT and PPTX slideshows.",
      href: "/pdf-to-powerpoint",
      category: "convert-from",
      iconType: "powerpoint"
    },
    {
      title: "Excel to PDF",
      description: "Make EXCEL spreadsheets easy to read by converting them to PDF.",
      href: "/excel-to-pdf",
      category: "convert-to",
      iconType: "excel"
    },
    {
      title: "PowerPoint to PDF",
      description: "Make PPT and PPTX slideshows easy to view by converting them to PDF.",
      href: "/powerpoint-to-pdf",
      category: "convert-to",
      iconType: "powerpoint"
    },
    {
      title: "Sign PDF",
      description: "Sign yourself or send signature requests to others.",
      href: "/sign-pdf",
      category: "security",
      iconType: "sign",
      badge: "Top"
    },

    // Row 3: Visual and image tools
    {
      title: "PDF to JPG",
      description: "Convert each PDF page into a JPG or extract all images contained in a PDF.",
      href: "/pdf-to-jpg",
      category: "convert-from",
      iconType: "image",
      badge: "Popular"
    },
    {
      title: "JPG to PDF",
      description: "Convert JPG images to PDF in seconds. Easily adjust orientation and margins.",
      href: "/jpg-to-pdf",
      category: "convert-to",
      iconType: "image",
      badge: "Popular"
    },
    {
      title: "Watermark",
      description: "Stamp an image or text over your PDF in seconds. Choose typography, transparency and position.",
      href: "/watermark",
      category: "edit",
      iconType: "watermark"
    },
    {
      title: "Organize PDF",
      description: "Sort, add and delete PDF pages. Drag and drop the page thumbnails to organize however you want.",
      href: "/organize",
      category: "organize",
      iconType: "merge"
    },

    // Row 4: Security & Utility tools
    {
      title: "Unlock PDF",
      description: "Remove PDF password security, giving you the freedom to use your PDFs as you want.",
      href: "/unlock",
      category: "security",
      iconType: "unlock",
      badge: "Top"
    },
    {
      title: "Protect PDF",
      description: "Encrypt your PDF with a password to prevent unauthorized access.",
      href: "/protect-pdf",
      category: "security",
      iconType: "lock"
    },
    {
      title: "Page Numbers",
      description: "Add page numbers into PDFs with ease. Choose your positions, dimensions, typography.",
      href: "/page-numbers",
      category: "edit",
      iconType: "edit"
    },
    {
      title: "Scan to PDF",
      description: "Capture document scans from your mobile device and send them instantly to your browser.",
      href: "/scan-to-pdf",
      category: "convert-to",
      iconType: "image"
    },

    // Row 5: Specialized tools
    {
      title: "Compare PDF",
      description: "Show a side-by-side comparison of two PDF files to easily spot changes between versions.",
      href: "/compare-pdf",
      category: "organize",
      iconType: "merge"
    },
    {
      title: "Crop PDF",
      description: "Trim page margins or select custom crop areas on your PDF pages.",
      href: "/crop-pdf",
      category: "organize",
      iconType: "split"
    }
  ];

  // Category filter tabs
  const categories = [
    { id: 'all', label: 'All' },
    { id: 'workflows', label: 'Workflows' },
    { id: 'organize', label: 'Organize PDF' },
    { id: 'optimize', label: 'Optimize PDF' },
    { id: 'convert', label: 'Convert PDF' },
    { id: 'edit', label: 'Edit PDF' },
    { id: 'security', label: 'PDF Security' },
  ];

  const filteredTools = useMemo(() => {
    return allTools.filter(tool => {
      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'convert') {
        return tool.category === 'convert-from' || tool.category === 'convert-to';
      }
      if (selectedCategory === 'workflows') {
        return ['/merge', '/split', '/compress', '/sign-pdf', '/pdf-to-word'].includes(tool.href);
      }
      return tool.category === selectedCategory;
    });
  }, [selectedCategory]);

  return (
    <div className="relative flex flex-col min-h-screen text-slate-900 font-sans selection:bg-red-500/20 selection:text-red-900 bg-[#F4F6F9]">
      <SEO 
        title="PDFLovesYou - Every tool you need to work with PDFs in one place" 
        description="Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use! Merge, split, compress, convert, unlock and watermark PDFs with just a few clicks."
        url="https://pdflovesyou.com/"
      />

      <div className="relative z-10 px-4 sm:px-6 lg:px-10 pt-10 sm:pt-14 pb-16 max-w-[1440px] mx-auto w-full">
        
        {/* Centered Hero Header */}
        <div className="text-center max-w-4xl mx-auto mb-8 sm:mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs sm:text-sm font-black shadow-xs mb-4"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>100% Free • No Limits • No Registration</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-2xl sm:text-3xl md:text-[38px] lg:text-[42px] font-semibold text-[#1F2937] tracking-tight leading-[1.2] mb-3 font-display"
          >
            Every tool you need to work with PDFs in one place
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed font-normal max-w-3xl mx-auto"
          >
            Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use! Merge, split, compress, convert, unlock and watermark PDFs with just a few clicks.
          </motion.p>
        </div>

        {/* Filter Tabs Bar matching Screenshot 1 */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-8 sm:mb-10">
          {categories.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#18181B] text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>

        {/* Multi-column Grid Layout matching Screenshot 1 */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.title}
                title={tool.title}
                description={tool.description}
                href={tool.href}
                iconType={tool.iconType}
                badge={tool.badge}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <p className="text-sm font-bold text-slate-700 mb-1">No tools in this category</p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="mt-3 px-4 py-2 bg-[#E5322D] text-white rounded-xl text-xs font-bold"
            >
              Show All Tools
            </button>
          </div>
        )}

        {/* Features & Security Trust Indicators matching authentic iLovePDF layout */}
        <div className="mt-16 sm:mt-20 space-y-16">

          {/* 4 Trust Metrics Bar */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-slate-100 text-center">
              
              <div className="flex flex-col items-center px-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E5322D] flex items-center justify-center mb-3 shadow-xs">
                  <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 mb-0.5">100% Free</div>
                <p className="text-[13px] text-slate-500 leading-snug">
                  No subscriptions, no hidden limits, no paywalls.
                </p>
              </div>

              <div className="flex flex-col items-center px-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 shadow-xs">
                  <Lock className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 mb-0.5">End-to-End Safe</div>
                <p className="text-[13px] text-slate-500 leading-snug">
                  TLS 1.3 encryption & client-side browser processing.
                </p>
              </div>

              <div className="flex flex-col items-center px-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 shadow-xs">
                  <Zap className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 mb-0.5">Blazing Speed</div>
                <p className="text-[13px] text-slate-500 leading-snug">
                  Files convert in seconds directly in your web browser.
                </p>
              </div>

              <div className="flex flex-col items-center px-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 shadow-xs">
                  <Smartphone className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 mb-0.5">Any Device</div>
                <p className="text-[13px] text-slate-500 leading-snug">
                  Optimized for iOS, Android, Mac, Windows & Linux.
                </p>
              </div>

            </div>
          </div>

          {/* Three Feature Pillars: "The solution to all your PDF problems" */}
          <div>
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-3 font-display">
                The solution to all your PDF problems
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                PDFLovesYou delivers everything you need to organize, optimize, convert, edit, and secure your digital documents in one intuitive interface.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Pillar 1 */}
              <div className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E5322D] flex items-center justify-center mb-5">
                    <FileCheck className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 font-display">
                    Smart tools for document workflows
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-[13px] leading-relaxed mb-4">
                    Merge multiple reports into a single file, split large packets into individual pages, or compress PDFs for easy email attachments without quality loss.
                  </p>
                </div>
                <ul className="space-y-2 text-xs font-semibold text-slate-700 border-t border-slate-100 pt-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Merge, Split & Reorganize in seconds</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Intelligent compression algorithms</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Drag & drop reordering canvas</span>
                  </li>
                </ul>
              </div>

              {/* Pillar 2 */}
              <div className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                    <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 font-display">
                    Guaranteed security & strict privacy
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-[13px] leading-relaxed mb-4">
                    We never read, mine, or store your private documents. Client-side processing keeps your data on your local device, and server buffers auto-purge immediately.
                  </p>
                </div>
                <ul className="space-y-2 text-xs font-semibold text-slate-700 border-t border-slate-100 pt-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>End-to-End TLS 1.3 Encryption</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Auto-delete after conversion</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>GDPR & ISO 27001 compliant standards</span>
                  </li>
                </ul>
              </div>

              {/* Pillar 3 */}
              <div className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                    <Smartphone className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 font-display">
                    Scan from mobile & convert anywhere
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-[13px] leading-relaxed mb-4">
                    Snap pictures of physical documents or contracts with your phone camera and transform them instantly into clean, high-resolution digitized PDFs.
                  </p>
                </div>
                <ul className="space-y-2 text-xs font-semibold text-slate-700 border-t border-slate-100 pt-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Instant camera document detection</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>QR Code mobile sync</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>No app installation required</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Frequently Asked Questions (FAQ) Accordion */}
          <div className="bg-white rounded-3xl p-6 sm:p-12 border border-slate-200/90 shadow-xs">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 text-[#E5322D] text-xs font-bold uppercase tracking-wider mb-3">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Got Questions?</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-3 font-display">
                Frequently Asked Questions
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
                Everything you need to know about processing, security, OCR conversion, and using our 100% free PDF toolkit.
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div 
                    key={faq.q} 
                    className={`rounded-2xl transition-all duration-200 border ${
                      isOpen 
                        ? 'bg-slate-50/70 border-slate-300/80 shadow-xs' 
                        : 'bg-white border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between text-left gap-4 p-5 sm:p-6 group cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <span className={`text-sm sm:text-base font-bold transition-colors ${
                        isOpen ? 'text-[#E5322D]' : 'text-slate-900 group-hover:text-[#E5322D]'
                      }`}>
                        {faq.q}
                      </span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                        isOpen 
                          ? 'bg-[#E5322D] text-white rotate-180' 
                          : 'bg-slate-100 text-slate-500 group-hover:bg-red-50 group-hover:text-[#E5322D]'
                      }`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.22, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/50">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Call To Action Banner matching iLovePDF signature format */}
          <div className="rounded-3xl bg-[#E5322D] text-white p-8 sm:p-12 relative overflow-hidden shadow-xl shadow-red-500/10">
            <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
              <Heart className="w-96 h-96 fill-white text-white" />
            </div>

            <div className="relative z-10 max-w-2xl">
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-3 font-display">
                Get your PDF tasks done in seconds
              </h2>
              <p className="text-white/90 text-xs sm:text-base font-normal leading-relaxed mb-6 max-w-xl">
                Start merging, splitting, compressing, or converting your files today with 100% free online PDF software. No credit card, no sign up required.
              </p>
              
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/merge"
                  className="px-6 py-3 rounded-xl bg-white text-[#E5322D] font-bold text-xs sm:text-sm shadow-md hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <span>Merge PDF Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/compress"
                  className="px-6 py-3 rounded-xl bg-red-600/80 hover:bg-red-700/80 text-white font-bold text-xs sm:text-sm border border-white/20 transition-colors"
                >
                  <span>Compress PDF</span>
                </Link>
                <Link
                  to="/scan-to-pdf"
                  className="px-6 py-3 rounded-xl bg-red-600/80 hover:bg-red-700/80 text-white font-bold text-xs sm:text-sm border border-white/20 transition-colors flex items-center gap-2"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Mobile Scanner</span>
                </Link>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
