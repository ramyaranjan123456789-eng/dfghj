import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Layout } from '@/components/Layout';
import { ScrollToTop } from '@/components/ScrollToTop';
import { AnalyticsProvider } from '@/context/AnalyticsContext';
import { ToastProvider } from '@/context/ToastContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Home } from '@/pages/Home';
import { Merge } from '@/pages/Merge';
import { Split } from '@/pages/Split';
import { Rotate } from '@/pages/Rotate';
import { Organize } from '@/pages/Organize';
import { Watermark } from '@/pages/Watermark';
import { Compress } from '@/pages/Compress';
import { PdfToWord } from '@/pages/PdfToWord';
import { WordToPdf } from '@/pages/WordToPdf';
import { PdfToJpg } from '@/pages/PdfToJpg';
import { JpgToPdf } from '@/pages/JpgToPdf';
import { Unlock } from '@/pages/Unlock';
import { PageNumbers } from '@/pages/PageNumbers';
import { PdfToPowerPoint } from '@/pages/PdfToPowerPoint';
import { PdfToExcel } from '@/pages/PdfToExcel';
import { PowerPointToPdf } from '@/pages/PowerPointToPdf';
import { ExcelToPdf } from '@/pages/ExcelToPdf';
import { SignPdf } from '@/pages/SignPdf';
import { HtmlToPdf } from '@/pages/HtmlToPdf';
import { ProtectPdf } from '@/pages/ProtectPdf';
import { PdfToPdfA } from '@/pages/PdfToPdfA';
import { RepairPdf } from '@/pages/RepairPdf';
import { ScanToPdf } from '@/pages/ScanToPdf';
import { ScanMobile } from '@/pages/ScanMobile';
import { OcrPdf } from '@/pages/OcrPdf';
import { ComparePdf } from '@/pages/ComparePdf';
import { RedactPdf } from '@/pages/RedactPdf';
import { CropPdf } from '@/pages/CropPdf';
import { PdfForms } from '@/pages/PdfForms';
import { AiSummarizer } from '@/pages/AiSummarizer';
import { TranslatePdf } from '@/pages/TranslatePdf';
import { PdfToMarkdown } from '@/pages/PdfToMarkdown';
import { Admin } from '@/pages/Admin';
import { Download } from '@/pages/Download';
import { Terms } from '@/pages/Terms';
import { Privacy } from '@/pages/Privacy';
import { Cookies } from '@/pages/Cookies';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AnalyticsProvider>
          <ToastProvider>
            <Router>
              <ScrollToTop />
              <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/merge" element={<Merge />} />
                <Route path="/split" element={<Split />} />
                <Route path="/rotate" element={<Rotate />} />
                <Route path="/organize" element={<Organize />} />
                <Route path="/watermark" element={<Watermark />} />
                <Route path="/compress" element={<Compress />} />
                <Route path="/pdf-to-word" element={<PdfToWord />} />
                <Route path="/word-to-pdf" element={<WordToPdf />} />
                <Route path="/pdf-to-jpg" element={<PdfToJpg />} />
                <Route path="/jpg-to-pdf" element={<JpgToPdf />} />
                <Route path="/unlock" element={<Unlock />} />
                <Route path="/page-numbers" element={<PageNumbers />} />
                <Route path="/pdf-to-powerpoint" element={<PdfToPowerPoint />} />
                <Route path="/pdf-to-excel" element={<PdfToExcel />} />
                <Route path="/powerpoint-to-pdf" element={<PowerPointToPdf />} />
                <Route path="/excel-to-pdf" element={<ExcelToPdf />} />
                <Route path="/sign-pdf" element={<SignPdf />} />
                <Route path="/html-to-pdf" element={<HtmlToPdf />} />
                <Route path="/protect-pdf" element={<ProtectPdf />} />
                <Route path="/pdf-to-pdfa" element={<PdfToPdfA />} />
                <Route path="/repair-pdf" element={<RepairPdf />} />
                <Route path="/scan-to-pdf" element={<ScanToPdf />} />
                <Route path="/scan-mobile" element={<ScanMobile />} />
                <Route path="/scan" element={<ScanMobile />} />
                <Route path="/ocr-pdf" element={<OcrPdf />} />
                <Route path="/compare-pdf" element={<ComparePdf />} />
                <Route path="/redact-pdf" element={<RedactPdf />} />
                <Route path="/crop-pdf" element={<CropPdf />} />
                <Route path="/pdf-forms" element={<PdfForms />} />
                <Route path="/ai-summarizer" element={<AiSummarizer />} />
                <Route path="/translate-pdf" element={<TranslatePdf />} />
                <Route path="/pdf-to-markdown" element={<PdfToMarkdown />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/download" element={<Download />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/cookies" element={<Cookies />} />
              </Routes>
            </Layout>
          </Router>
        </ToastProvider>
      </AnalyticsProvider>
    </ThemeProvider>
  </HelmetProvider>
  );
}

