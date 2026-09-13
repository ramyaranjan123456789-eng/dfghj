import React from 'react';
import {
  Scissors,
  Minimize2,
  FileText,
  Presentation,
  FileSpreadsheet,
  PenTool,
  Image,
  FileSignature,
  Stamp,
  RotateCw,
  Code2,
  Unlock,
  Lock,
  LayoutGrid,
  FileCheck,
  Wrench,
  Hash,
  Scan,
  ScanText,
  GitCompare,
  EyeOff,
  CheckSquare,
  FileCode,
  Crop,
  Sparkles,
  Languages,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface IconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

interface BadgeIconProps extends IconProps {
  icon: React.ElementType;
  bgClass: string;
  textClass?: string;
  strokeWidth?: number;
}

const ToolBadge: React.FC<BadgeIconProps> = ({
  icon: IconComponent,
  className = "w-12 h-12",
  bgClass,
  textClass = "text-white",
  strokeWidth = 2.2
}) => {
  return (
    <div
      className={cn(
        "rounded-xl flex items-center justify-center shrink-0 shadow-xs select-none transition-transform duration-200",
        bgClass,
        textClass,
        className
      )}
    >
      <IconComponent className="w-[52%] h-[52%]" strokeWidth={strokeWidth} />
    </div>
  );
};

/* =========================================================================
   AUTHENTIC ILOVEPDF DUAL-TILE & ARROW ICONS (MATCHING ATTACHED SCREENSHOT)
   ========================================================================= */

// 1. MERGE PDF (Light salmon back tile with incoming diagonal arrow + Solid coral red front tile with incoming diagonal arrow pointing together)
export const MergePdfIcon: React.FC<IconProps> = ({ className = "w-12 h-12" }) => (
  <div className={cn("relative shrink-0 select-none", className)}>
    {/* Background upper-left tile */}
    <div className="absolute top-0 left-0 w-[64%] h-[64%] bg-[#F87171] rounded-lg shadow-xs flex items-center justify-center">
      {/* Arrow pointing down-right towards center */}
      <span className="text-white text-[15px] leading-none font-black font-mono">↘</span>
    </div>
    {/* Foreground bottom-right tile */}
    <div className="absolute bottom-0 right-0 w-[64%] h-[64%] bg-[#E5322D] rounded-lg shadow-sm flex items-center justify-center border-2 border-white">
      {/* Arrow pointing up-left towards center */}
      <span className="text-white text-[15px] leading-none font-black font-mono">↖</span>
    </div>
  </div>
);

// 2. SPLIT PDF (Solid coral red top-left tile with outgoing arrow + bottom-right tile with outgoing arrow pointing apart)
export const SplitPdfIcon: React.FC<IconProps> = ({ className = "w-12 h-12" }) => (
  <div className={cn("relative shrink-0 select-none", className)}>
    {/* Background top-left tile */}
    <div className="absolute top-0 left-0 w-[64%] h-[64%] bg-[#E5322D] rounded-lg shadow-sm flex items-center justify-center z-10">
      {/* Arrow pointing outward up-left */}
      <span className="text-white text-[15px] leading-none font-black font-mono">↖</span>
    </div>
    {/* Foreground bottom-right tile */}
    <div className="absolute bottom-0 right-0 w-[64%] h-[64%] bg-[#E5322D] rounded-lg shadow-xs flex items-center justify-center border-2 border-white">
      {/* Arrow pointing outward down-right */}
      <span className="text-white text-[15px] leading-none font-black font-mono">↘</span>
    </div>
  </div>
);

// 3. COMPRESS PDF (Green 2x2 grid of 4 tiles with 4 inward pointing arrows)
export const CompressPdfIcon: React.FC<IconProps> = ({ className = "w-12 h-12" }) => (
  <div className={cn("grid grid-cols-2 gap-1 p-0.5 shrink-0 select-none", className)}>
    <div className="bg-[#78B13F] rounded-md flex items-center justify-center text-white font-mono font-black text-[13px]">
      ↘
    </div>
    <div className="bg-[#78B13F] rounded-md flex items-center justify-center text-white font-mono font-black text-[13px]">
      ↙
    </div>
    <div className="bg-[#78B13F] rounded-md flex items-center justify-center text-white font-mono font-black text-[13px]">
      ↗
    </div>
    <div className="bg-[#78B13F] rounded-md flex items-center justify-center text-white font-mono font-black text-[13px]">
      ↖
    </div>
  </div>
);

// 4. PDF TO WORD (Light blue small tile top-left with arrow + Blue main tile with bold 'W')
export const PdfToWordIcon: React.FC<IconProps> = ({ className = "w-12 h-12" }) => (
  <div className={cn("relative shrink-0 select-none", className)}>
    {/* Source mini tile */}
    <div className="absolute top-0 left-0 w-[46%] h-[46%] bg-[#C7D2FE] rounded-md flex items-center justify-center text-[#4F46E5] font-mono font-black text-[13px]">
      ↘
    </div>
    {/* Target Word tile */}
    <div className="absolute bottom-0 right-0 w-[70%] h-[70%] bg-[#2B78E4] rounded-lg shadow-sm flex items-center justify-center border-2 border-white text-white font-extrabold text-[17px] font-sans">
      W
    </div>
  </div>
);

// 5. PDF TO POWERPOINT (Light coral mini tile top-left with arrow + Orange/Red main tile with bold 'P')
export const PdfToPowerPointIcon: React.FC<IconProps> = ({ className = "w-12 h-12" }) => (
  <div className={cn("relative shrink-0 select-none", className)}>
    {/* Source mini tile */}
    <div className="absolute top-0 left-0 w-[46%] h-[46%] bg-[#FED7AA] rounded-md flex items-center justify-center text-[#EA580C] font-mono font-black text-[13px]">
      ↘
    </div>
    {/* Target PPT tile */}
    <div className="absolute bottom-0 right-0 w-[70%] h-[70%] bg-[#F25F3A] rounded-lg shadow-sm flex items-center justify-center border-2 border-white text-white font-extrabold text-[17px] font-sans">
      P
    </div>
  </div>
);

// 6. PDF TO EXCEL (Light green mini tile top-left with arrow + Green main tile with bold 'X')
export const PdfToExcelIcon: React.FC<IconProps> = ({ className = "w-12 h-12" }) => (
  <div className={cn("relative shrink-0 select-none", className)}>
    {/* Source mini tile */}
    <div className="absolute top-0 left-0 w-[46%] h-[46%] bg-[#BBF7D0] rounded-md flex items-center justify-center text-[#15803D] font-mono font-black text-[13px]">
      ↘
    </div>
    {/* Target Excel tile */}
    <div className="absolute bottom-0 right-0 w-[70%] h-[70%] bg-[#36A853] rounded-lg shadow-sm flex items-center justify-center border-2 border-white text-white font-extrabold text-[17px] font-sans">
      X
    </div>
  </div>
);

// 7. WORD TO PDF (Blue Word tile top-left with 'W' + Coral PDF mini tile bottom-right with arrow)
export const WordToPdfIcon: React.FC<IconProps> = ({ className = "w-12 h-12" }) => (
  <div className={cn("relative shrink-0 select-none", className)}>
    {/* Source Word tile */}
    <div className="absolute top-0 left-0 w-[70%] h-[70%] bg-[#2B78E4] rounded-lg shadow-sm flex items-center justify-center text-white font-extrabold text-[17px] font-sans z-10">
      W
    </div>
    {/* Target PDF mini tile */}
    <div className="absolute bottom-0 right-0 w-[46%] h-[46%] bg-[#2563EB] rounded-md flex items-center justify-center border-2 border-white text-white font-mono font-black text-[13px]">
      ↘
    </div>
  </div>
);

// 8. POWERPOINT TO PDF (Orange PPT tile top-left with 'P' + Coral PDF mini tile bottom-right with arrow)
export const PowerPointToPdfIcon: React.FC<IconProps> = ({ className = "w-12 h-12" }) => (
  <div className={cn("relative shrink-0 select-none", className)}>
    {/* Source PPT tile */}
    <div className="absolute top-0 left-0 w-[70%] h-[70%] bg-[#F25F3A] rounded-lg shadow-sm flex items-center justify-center text-white font-extrabold text-[17px] font-sans z-10">
      P
    </div>
    {/* Target PDF mini tile */}
    <div className="absolute bottom-0 right-0 w-[46%] h-[46%] bg-[#EA580C] rounded-md flex items-center justify-center border-2 border-white text-white font-mono font-black text-[13px]">
      ↘
    </div>
  </div>
);

// 9. EXCEL TO PDF (Green Excel tile top-left with 'X' + Green PDF mini tile bottom-right with arrow)
export const ExcelToPdfIcon: React.FC<IconProps> = ({ className = "w-12 h-12" }) => (
  <div className={cn("relative shrink-0 select-none", className)}>
    {/* Source Excel tile */}
    <div className="absolute top-0 left-0 w-[70%] h-[70%] bg-[#A7F3D0] rounded-lg shadow-sm flex items-center justify-center text-[#065F46] font-extrabold text-[17px] font-sans z-10">
      X
    </div>
    {/* Target PDF mini tile */}
    <div className="absolute bottom-0 right-0 w-[46%] h-[46%] bg-[#10B981] rounded-md flex items-center justify-center border-2 border-white text-white font-mono font-black text-[13px]">
      ↘
    </div>
  </div>
);

// 10. EDIT PDF (Purple badge with drawing pencil / text frame)
export const EditPdfIcon: React.FC<IconProps> = (props) => (
  <ToolBadge {...props} icon={PenTool} bgClass="bg-[#8B5CF6]" />
);

// 11. PDF TO JPG
export const PdfToJpgIcon: React.FC<IconProps> = (props) => (
  <ToolBadge {...props} icon={Image} bgClass="bg-[#E11D48]" />
);

// 12. JPG TO PDF
export const JpgToPdfIcon: React.FC<IconProps> = (props) => (
  <ToolBadge {...props} icon={Image} bgClass="bg-[#E5322D]" />
);

// 13. SIGN PDF
export const SignPdfIcon: React.FC<IconProps> = (props) => (
  <ToolBadge {...props} icon={FileSignature} bgClass="bg-[#7C3AED]" />
);

// 14. WATERMARK
export const WatermarkIcon: React.FC<IconProps> = (props) => (
  <ToolBadge {...props} icon={Stamp} bgClass="bg-[#0284C7]" />
);

// 15. ROTATE PDF
export const RotatePdfIcon: React.FC<IconProps> = (props) => (
  <ToolBadge {...props} icon={RotateCw} bgClass="bg-[#06B6D4]" />
);

// 16. HTML TO PDF
export const HtmlToPdfIcon: React.FC<IconProps> = (props) => (
  <ToolBadge {...props} icon={Code2} bgClass="bg-[#4F46E5]" />
);

// 17. UNLOCK PDF
export const UnlockPdfIcon: React.FC<IconProps> = (props) => (
  <ToolBadge {...props} icon={Unlock} bgClass="bg-[#0D9488]" />
);

// 18. PROTECT PDF
export const ProtectPdfIcon: React.FC<IconProps> = (props) => (
  <ToolBadge {...props} icon={Lock} bgClass="bg-[#E11D48]" />
);

// 19. ORGANIZE PDF
export const OrganizePdfIcon: React.FC<IconProps> = (props) => (
  <ToolBadge {...props} icon={LayoutGrid} bgClass="bg-[#C026D3]" />
);

// 20. PDF TO PDF/A
export const PdfToPdfAIcon: React.FC<IconProps> = (props) => (
  <ToolBadge {...props} icon={FileCheck} bgClass="bg-[#334155]" />
);

// 21. REPAIR PDF
export const RepairPdfIcon: React.FC<IconProps> = (props) => (
  <ToolBadge {...props} icon={Wrench} bgClass="bg-[#F59E0B]" />
);

// 22. PAGE NUMBERS
export const PageNumbersIcon: React.FC<IconProps> = (props) => (
  <ToolBadge {...props} icon={Hash} bgClass="bg-[#0D9488]" />
);

// 23. SCAN TO PDF
export const ScanToPdfIcon: React.FC<IconProps> = (props) => (
  <ToolBadge {...props} icon={Scan} bgClass="bg-[#059669]" />
);

// 24. OCR PDF
export const OcrPdfIcon: React.FC<IconProps> = (props) => (
  <ToolBadge {...props} icon={ScanText} bgClass="bg-[#0891B2]" />
);

// 25. COMPARE PDF
export const ComparePdfIcon: React.FC<IconProps> = (props) => (
  <ToolBadge {...props} icon={GitCompare} bgClass="bg-[#6D28D9]" />
);

// 26. REDACT PDF
export const RedactPdfIcon: React.FC<IconProps> = (props) => (
  <ToolBadge {...props} icon={EyeOff} bgClass="bg-[#1E293B]" />
);

// 27. PDF FORMS
export const PdfFormsIcon: React.FC<IconProps> = (props) => (
  <ToolBadge {...props} icon={CheckSquare} bgClass="bg-[#4F46E5]" />
);

// 28. PDF TO MARKDOWN
export const PdfToMarkdownIcon: React.FC<IconProps> = (props) => (
  <ToolBadge {...props} icon={FileCode} bgClass="bg-[#10B981]" />
);

// 29. CROP PDF
export const CropPdfIcon: React.FC<IconProps> = (props) => (
  <ToolBadge {...props} icon={Crop} bgClass="bg-[#3B82F6]" />
);

// 30. AI PDF SUMMARIZER
export const AiSummarizerIcon: React.FC<IconProps> = (props) => (
  <ToolBadge {...props} icon={Sparkles} bgClass="bg-gradient-to-tr from-[#6366F1] to-[#EC4899]" />
);

// 31. TRANSLATE PDF
export const TranslatePdfIcon: React.FC<IconProps> = (props) => (
  <ToolBadge {...props} icon={Languages} bgClass="bg-[#2563EB]" />
);

/**
 * Universal Tool Icon Resolver
 */
export const getToolVectorIcon = (
  title: string, 
  iconType?: string, 
  className: string = "w-12 h-12"
): React.ReactNode => {
  const t = title.toLowerCase().trim();
  const it = (iconType || '').toLowerCase().trim();

  // 1. Merge
  if (t === 'merge pdf' || it === 'merge' || t.includes('merge')) {
    return <MergePdfIcon className={className} />;
  }

  // 2. Split
  if (t === 'split pdf' || it === 'split' || t.includes('split')) {
    return <SplitPdfIcon className={className} />;
  }

  // 3. Compress
  if (t === 'compress pdf' || it === 'compress' || t.includes('compress')) {
    return <CompressPdfIcon className={className} />;
  }

  // 4. PDF to Word
  if (t === 'pdf to word' || (t.includes('pdf to') && t.includes('word'))) {
    return <PdfToWordIcon className={className} />;
  }

  // 5. Word to PDF
  if (t === 'word to pdf' || (t.includes('word') && t.includes('to pdf'))) {
    return <WordToPdfIcon className={className} />;
  }

  // 6. PDF to PowerPoint
  if (t === 'pdf to powerpoint' || (t.includes('pdf to') && (t.includes('powerpoint') || t.includes('ppt')))) {
    return <PdfToPowerPointIcon className={className} />;
  }

  // 7. PowerPoint to PDF
  if (t === 'powerpoint to pdf' || ((t.includes('powerpoint') || t.includes('ppt')) && t.includes('to pdf'))) {
    return <PowerPointToPdfIcon className={className} />;
  }

  // 8. PDF to Excel
  if (t === 'pdf to excel' || (t.includes('pdf to') && (t.includes('excel') || t.includes('xls')))) {
    return <PdfToExcelIcon className={className} />;
  }

  // 9. Excel to PDF
  if (t === 'excel to pdf' || ((t.includes('excel') || t.includes('xls')) && t.includes('to pdf'))) {
    return <ExcelToPdfIcon className={className} />;
  }

  // 10. Edit PDF
  if (t === 'edit pdf' || (t.includes('edit') && !t.includes('form'))) {
    return <EditPdfIcon className={className} />;
  }

  // 11. PDF to JPG
  if (t === 'pdf to jpg' || (t.includes('pdf to') && (t.includes('jpg') || t.includes('image')))) {
    return <PdfToJpgIcon className={className} />;
  }

  // 12. JPG to PDF
  if (t === 'jpg to pdf' || ((t.includes('jpg') || t.includes('image')) && t.includes('to pdf'))) {
    return <JpgToPdfIcon className={className} />;
  }

  // 13. Sign PDF
  if (t.includes('sign') || it === 'sign') {
    return <SignPdfIcon className={className} />;
  }

  // 14. Watermark
  if (t.includes('watermark') || it === 'watermark') {
    return <WatermarkIcon className={className} />;
  }

  // 15. Rotate
  if (t.includes('rotate') || it === 'rotate') {
    return <RotatePdfIcon className={className} />;
  }

  // 16. HTML to PDF
  if (t.includes('html') || it === 'html' || it === 'code') {
    return <HtmlToPdfIcon className={className} />;
  }

  // 17. Unlock PDF
  if (t.includes('unlock') || it === 'unlock') {
    return <UnlockPdfIcon className={className} />;
  }

  // 18. Protect PDF
  if (t.includes('protect') || t.includes('lock') || it === 'lock') {
    return <ProtectPdfIcon className={className} />;
  }

  // 19. Organize PDF
  if (t.includes('organize') || it === 'organize') {
    return <OrganizePdfIcon className={className} />;
  }

  // 20. PDF to PDF/A
  if (t.includes('pdf/a') || it === 'pdfa') {
    return <PdfToPdfAIcon className={className} />;
  }

  // 21. Repair PDF
  if (t.includes('repair') || it === 'wrench') {
    return <RepairPdfIcon className={className} />;
  }

  // 22. Page Numbers
  if (t.includes('page number') || it === 'page-numbers') {
    return <PageNumbersIcon className={className} />;
  }

  // 23. Scan to PDF
  if (t.includes('scan to pdf') || (t.includes('scan') && !t.includes('ocr'))) {
    return <ScanToPdfIcon className={className} />;
  }

  // 24. OCR PDF
  if (t.includes('ocr') || it === 'ocr') {
    return <OcrPdfIcon className={className} />;
  }

  // 25. Compare PDF
  if (t.includes('compare') || it === 'compare') {
    return <ComparePdfIcon className={className} />;
  }

  // 26. Redact PDF
  if (t.includes('redact') || it === 'redact') {
    return <RedactPdfIcon className={className} />;
  }

  // 27. PDF Forms
  if (t.includes('form') || it === 'forms') {
    return <PdfFormsIcon className={className} />;
  }

  // 28. PDF to Markdown
  if (t.includes('markdown') || it === 'markdown') {
    return <PdfToMarkdownIcon className={className} />;
  }

  // 29. Crop PDF
  if (t.includes('crop') || it === 'crop') {
    return <CropPdfIcon className={className} />;
  }

  // 30. AI PDF Summarizer
  if (t.includes('ai') || t.includes('summar')) {
    return <AiSummarizerIcon className={className} />;
  }

  // 31. Translate PDF
  if (t.includes('translate')) {
    return <TranslatePdfIcon className={className} />;
  }

  // Default clean PDF document icon
  return (
    <ToolBadge
      className={className}
      icon={FileText}
      bgClass="bg-[#E5322D]"
    />
  );
};
