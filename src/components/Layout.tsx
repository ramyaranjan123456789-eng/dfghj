import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  ChevronDown, 
  ChevronRight,
  Globe, 
  Twitter, 
  Facebook, 
  Instagram, 
  Youtube, 
  Smartphone,
  Check, 
  ArrowRight, 
  LayoutGrid, 
  Sparkles, 
  ShieldCheck,
  Zap,
  Download as DownloadIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getToolVectorIcon } from '@/components/ToolIcons';
import { BrandLogo } from '@/components/BrandLogo';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBentoMenuOpen, setIsBentoMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  
  const location = useLocation();

  // Close dropdowns on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsBentoMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#F4F6F9] font-sans flex flex-col text-slate-900 selection:bg-red-500/20 selection:text-red-900">
      
      {/* Navigation Bar matching authentic iLovePDF header */}
      <nav className="bg-white border-b border-slate-200/90 sticky top-0 z-50 shadow-xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex justify-between items-center h-16 sm:h-18 gap-2 sm:gap-4">
            
            {/* Left: Brand Logo & Navigation Links */}
            <div className="flex items-center gap-4 sm:gap-8">
              {/* PDFLovesYou Authentic Brand Logo */}
              <Link to="/" className="shrink-0" aria-label="PDFLovesYou Home">
                <BrandLogo size="md" />
              </Link>
              
              {/* Desktop Nav Items */}
              <div className="hidden lg:flex items-center space-x-1 ml-2">
                <Link
                  to="/merge"
                  className={cn(
                    "px-3 py-2 text-[13px] font-bold tracking-tight rounded-lg transition-colors uppercase",
                    location.pathname === '/merge' ? "text-[#E5322D] bg-red-50/70" : "text-slate-700 hover:text-[#E5322D] hover:bg-slate-50"
                  )}
                >
                  Merge PDF
                </Link>
                <Link
                  to="/split"
                  className={cn(
                    "px-3 py-2 text-[13px] font-bold tracking-tight rounded-lg transition-colors uppercase",
                    location.pathname === '/split' ? "text-[#E5322D] bg-red-50/70" : "text-slate-700 hover:text-[#E5322D] hover:bg-slate-50"
                  )}
                >
                  Split PDF
                </Link>
                <Link
                  to="/compress"
                  className={cn(
                    "px-3 py-2 text-[13px] font-bold tracking-tight rounded-lg transition-colors uppercase",
                    location.pathname === '/compress' ? "text-[#E5322D] bg-red-50/70" : "text-slate-700 hover:text-[#E5322D] hover:bg-slate-50"
                  )}
                >
                  Compress PDF
                </Link>
              </div>
            </div>

            {/* Right: Actions, Scan link, Login/Register & Bento Button */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Scan to PDF Pill */}
              <Link
                to="/scan-to-pdf"
                className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-[#E5322D] hover:bg-slate-50 rounded-lg transition-colors border border-slate-200/70"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#E5322D]" />
                <span>Scan from Mobile</span>
              </Link>

              {/* 100% Free Badge */}
              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-300/80 text-emerald-800 text-xs font-black shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="tracking-tight whitespace-nowrap">100% Free</span>
              </div>

              {/* Bento Grid Tools Button */}
              <div className="relative">
                <button
                  onClick={() => setIsBentoMenuOpen(!isBentoMenuOpen)}
                  aria-label="All features menu"
                  className={cn(
                    "p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer",
                    isBentoMenuOpen && "bg-slate-100 text-[#E5322D]"
                  )}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>

                <AnimatePresence>
                  {isBentoMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 5 }}
                      className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50"
                    >
                      <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-2 py-1 mb-1">
                        Quick Tools
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <Link
                          to="/merge"
                          onClick={() => setIsBentoMenuOpen(false)}
                          className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          {getToolVectorIcon("Merge PDF", "merge", "w-7 h-7")}
                          <span className="text-xs font-bold text-slate-800">Merge</span>
                        </Link>
                        <Link
                          to="/compress"
                          onClick={() => setIsBentoMenuOpen(false)}
                          className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          {getToolVectorIcon("Compress PDF", "compress", "w-7 h-7")}
                          <span className="text-xs font-bold text-slate-800">Compress</span>
                        </Link>
                        <Link
                          to="/split"
                          onClick={() => setIsBentoMenuOpen(false)}
                          className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          {getToolVectorIcon("Split PDF", "split", "w-7 h-7")}
                          <span className="text-xs font-bold text-slate-800">Split</span>
                        </Link>
                        <Link
                          to="/pdf-to-word"
                          onClick={() => setIsBentoMenuOpen(false)}
                          className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          {getToolVectorIcon("PDF to Word", "word", "w-7 h-7")}
                          <span className="text-xs font-bold text-slate-800">To Word</span>
                        </Link>
                        <Link
                          to="/sign-pdf"
                          onClick={() => setIsBentoMenuOpen(false)}
                          className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          {getToolVectorIcon("Sign PDF", "sign", "w-7 h-7")}
                          <span className="text-xs font-bold text-slate-800">Sign PDF</span>
                        </Link>
                        <Link
                          to="/unlock"
                          onClick={() => setIsBentoMenuOpen(false)}
                          className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          {getToolVectorIcon("Unlock PDF", "unlock", "w-7 h-7")}
                          <span className="text-xs font-bold text-slate-800">Unlock PDF</span>
                        </Link>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-100">
                        <Link
                          to="/"
                          onClick={() => setIsBentoMenuOpen(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-xl bg-red-50 text-[#E5322D] text-xs font-bold hover:bg-red-100/70 transition-colors"
                        >
                          <span>Explore All Tools</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle navigation menu"
                className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 top-16 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
              />
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="lg:hidden fixed top-16 left-0 right-0 max-h-[calc(100vh-4rem)] overflow-y-auto bg-white border-b border-slate-200 px-4 pt-3 pb-8 shadow-2xl z-50 space-y-4"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">All PDF Tools</span>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                    <Check className="w-3 h-3" /> 100% Free
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/merge"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-[#E5322D] bg-white transition-colors"
                  >
                    {getToolVectorIcon("Merge PDF", "merge", "w-7 h-7")}
                    <span className="text-xs font-bold text-slate-800">Merge PDF</span>
                  </Link>
                  <Link
                    to="/split"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-[#E5322D] bg-white transition-colors"
                  >
                    {getToolVectorIcon("Split PDF", "split", "w-7 h-7")}
                    <span className="text-xs font-bold text-slate-800">Split PDF</span>
                  </Link>
                  <Link
                    to="/compress"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-[#E5322D] bg-white transition-colors"
                  >
                    {getToolVectorIcon("Compress PDF", "compress", "w-7 h-7")}
                    <span className="text-xs font-bold text-slate-800">Compress</span>
                  </Link>
                  <Link
                    to="/pdf-to-word"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-[#E5322D] bg-white transition-colors"
                  >
                    {getToolVectorIcon("PDF to Word", "word", "w-7 h-7")}
                    <span className="text-xs font-bold text-slate-800">PDF to Word</span>
                  </Link>
                  <Link
                    to="/sign-pdf"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-[#E5322D] bg-white transition-colors"
                  >
                    {getToolVectorIcon("Sign PDF", "sign", "w-7 h-7")}
                    <span className="text-xs font-bold text-slate-800">Sign PDF</span>
                  </Link>
                  <Link
                    to="/unlock"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-[#E5322D] bg-white transition-colors"
                  >
                    {getToolVectorIcon("Unlock PDF", "unlock", "w-7 h-7")}
                    <span className="text-xs font-bold text-slate-800">Unlock PDF</span>
                  </Link>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                    More Tools
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    <Link to="/jpg-to-pdf" onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-700 hover:text-[#E5322D] font-medium">JPG to PDF</Link>
                    <Link to="/pdf-to-jpg" onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-700 hover:text-[#E5322D] font-medium">PDF to JPG</Link>
                    <Link to="/protect-pdf" onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-700 hover:text-[#E5322D] font-medium">Protect PDF</Link>
                    <Link to="/unlock" onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-700 hover:text-[#E5322D] font-medium">Unlock PDF</Link>
                    <Link to="/watermark" onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-700 hover:text-[#E5322D] font-medium">Watermark</Link>
                    <Link to="/organize" onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-700 hover:text-[#E5322D] font-medium">Organize PDF</Link>
                    <Link to="/crop-pdf" onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-700 hover:text-[#E5322D] font-medium">Crop PDF</Link>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 bg-[#E5322D] text-white rounded-xl text-xs font-bold shadow-xs"
                  >
                    View All PDF Tools
                  </Link>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Page Content */}
      <main className="flex-1 relative z-10">
        {children}
      </main>

      {/* Footer matching authentic iLovePDF layout */}
      <footer className="bg-white text-slate-600 border-t border-slate-200/80 pt-16 pb-10 shrink-0 relative z-10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          
          <div className="grid grid-cols-2 md:grid-cols-12 gap-8 lg:gap-12 mb-12">
            
            {/* Brand Column (md:col-span-4) */}
            <div className="col-span-2 md:col-span-4">
              <Link to="/" className="inline-block mb-3.5" aria-label="PDFLovesYou Home">
                <BrandLogo size="md" />
              </Link>
              
              <p className="text-slate-500 text-xs sm:text-[13px] leading-relaxed font-normal mb-5 max-w-sm">
                Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use! Merge, split, compress, convert, rotate, unlock and watermark PDFs with just a few clicks.
              </p>

              {/* Social Media Rounded Buttons */}
              <div className="flex items-center space-x-2.5 mb-6">
                <a href="#" aria-label="Twitter" className="w-8 h-8 rounded-full border border-slate-200 text-slate-500 hover:text-[#E5322D] hover:border-red-300 flex items-center justify-center transition-colors">
                  <Twitter className="w-3.5 h-3.5" />
                </a>
                <a href="#" aria-label="Facebook" className="w-8 h-8 rounded-full border border-slate-200 text-slate-500 hover:text-[#E5322D] hover:border-red-300 flex items-center justify-center transition-colors">
                  <Facebook className="w-3.5 h-3.5" />
                </a>
                <a href="#" aria-label="Instagram" className="w-8 h-8 rounded-full border border-slate-200 text-slate-500 hover:text-[#E5322D] hover:border-red-300 flex items-center justify-center transition-colors">
                  <Instagram className="w-3.5 h-3.5" />
                </a>
                <a href="#" aria-label="YouTube" className="w-8 h-8 rounded-full border border-slate-200 text-slate-500 hover:text-[#E5322D] hover:border-red-300 flex items-center justify-center transition-colors">
                  <Youtube className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* App badges */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-[11px] font-bold">
                  <Smartphone className="w-3.5 h-3.5 text-[#E5322D]" />
                  <span>iOS & Android Ready</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ISO 27001 Certified</span>
                </div>
              </div>
            </div>

            {/* Tools Column */}
            <div className="col-span-1 md:col-span-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-4">PDF Tools</h4>
              <ul className="space-y-2.5 text-xs text-slate-500 font-medium">
                <li><Link to="/merge" className="hover:text-[#E5322D] transition-colors">Merge PDF</Link></li>
                <li><Link to="/split" className="hover:text-[#E5322D] transition-colors">Split PDF</Link></li>
                <li><Link to="/compress" className="hover:text-[#E5322D] transition-colors">Compress PDF</Link></li>
                <li><Link to="/organize" className="hover:text-[#E5322D] transition-colors">Organize PDF</Link></li>
                <li><Link to="/crop-pdf" className="hover:text-[#E5322D] transition-colors">Crop PDF</Link></li>
                <li><Link to="/scan-to-pdf" className="hover:text-[#E5322D] transition-colors">Scan to PDF</Link></li>
              </ul>
            </div>

            {/* Convert Column */}
            <div className="col-span-1 md:col-span-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-4">Convert PDF</h4>
              <ul className="space-y-2.5 text-xs text-slate-500 font-medium">
                <li><Link to="/pdf-to-word" className="hover:text-[#E5322D] transition-colors">PDF to Word</Link></li>
                <li><Link to="/pdf-to-powerpoint" className="hover:text-[#E5322D] transition-colors">PDF to PowerPoint</Link></li>
                <li><Link to="/pdf-to-excel" className="hover:text-[#E5322D] transition-colors">PDF to Excel</Link></li>
                <li><Link to="/pdf-to-jpg" className="hover:text-[#E5322D] transition-colors">PDF to JPG</Link></li>
                <li><Link to="/word-to-pdf" className="hover:text-[#E5322D] transition-colors">Word to PDF</Link></li>
                <li><Link to="/jpg-to-pdf" className="hover:text-[#E5322D] transition-colors">JPG to PDF</Link></li>
              </ul>
            </div>

            {/* Security & Edit Column */}
            <div className="col-span-1 md:col-span-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-4">Security & Edit</h4>
              <ul className="space-y-2.5 text-xs text-slate-500 font-medium">
                <li><Link to="/sign-pdf" className="hover:text-[#E5322D] transition-colors">Sign PDF</Link></li>
                <li><Link to="/protect-pdf" className="hover:text-[#E5322D] transition-colors">Protect PDF</Link></li>
                <li><Link to="/unlock" className="hover:text-[#E5322D] transition-colors">Unlock PDF</Link></li>
                <li><Link to="/watermark" className="hover:text-[#E5322D] transition-colors">Watermark</Link></li>
                <li><Link to="/page-numbers" className="hover:text-[#E5322D] transition-colors">Page Numbers</Link></li>
              </ul>
            </div>

            {/* Company Column */}
            <div className="col-span-1 md:col-span-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-4">Company</h4>
              <ul className="space-y-2.5 text-xs text-slate-500 font-medium">
                <li><Link to="/" className="hover:text-[#E5322D] transition-colors">About Us</Link></li>
                <li><Link to="/scan-to-pdf" className="hover:text-[#E5322D] transition-colors">Mobile Scanner</Link></li>
                <li><Link to="/privacy" className="hover:text-[#E5322D] transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-[#E5322D] transition-colors">Terms of Use</Link></li>
                <li><Link to="/cookies" className="hover:text-[#E5322D] transition-colors">Cookie Policy</Link></li>
                <li><Link to="/admin" className="hover:text-[#E5322D] transition-colors">Admin Portal</Link></li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar: Copyright & Language Selector */}
          <div className="pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 font-medium gap-4">
            <div>
              &copy; {new Date().getFullYear()} <span className="font-bold text-slate-800">PDFLovesYou</span> &bull; Your All-in-One Free PDF Editor & Converter.
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>{selectedLanguage}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 bottom-full mb-2 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-50">
                  {['English', 'Español', 'Français', 'Deutsch', 'Italiano', 'Português', '日本語'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setSelectedLanguage(lang);
                        setIsLangDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between",
                        selectedLanguage === lang ? "text-[#E5322D] font-bold bg-red-50/50" : "text-slate-700"
                      )}
                    >
                      <span>{lang}</span>
                      {selectedLanguage === lang && <Check className="w-3 h-3 text-[#E5322D]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
