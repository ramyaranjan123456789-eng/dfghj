import React from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrandIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Brand Emblem for PDFLovesYou using available Lucide Heart icon
 */
export const BrandIcon: React.FC<BrandIconProps> = ({ 
  className,
  size = 'md'
}) => {
  const sizeMap = {
    sm: { box: "w-7 h-7 rounded-lg", icon: "w-4 h-4" },
    md: { box: "w-8 h-8 sm:w-9 sm:h-9 rounded-xl", icon: "w-4.5 h-4.5 sm:w-5 sm:h-5" },
    lg: { box: "w-10 h-10 sm:w-11 sm:h-11 rounded-xl", icon: "w-6 h-6" },
    xl: { box: "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl", icon: "w-7 h-7" }
  };

  const current = sizeMap[size];

  return (
    <div 
      className={cn(
        "bg-[#E5322D] text-white flex items-center justify-center shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-105 select-none",
        current.box,
        className
      )}
    >
      <Heart className={cn("fill-white text-white stroke-[2.2]", current.icon)} />
    </div>
  );
};

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

/**
 * Complete Brand Logo with Emblem & Typographic Wordmark
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  className,
  size = 'md',
  showText = true
}) => {
  const textSizes = {
    sm: "text-[20px]",
    md: "text-[23px] sm:text-[25px]",
    lg: "text-[26px] sm:text-[29px]"
  };

  return (
    <div className={cn("flex items-center gap-2 sm:gap-2.5 group cursor-pointer", className)}>
      <BrandIcon size={size} />
      {showText && (
        <div className={cn("font-black tracking-tight font-display flex items-baseline leading-none select-none", textSizes[size])}>
          <span className="text-slate-900">PDF</span>
          <span className="text-[#E5322D]">Loves</span>
          <span className="text-slate-900">You</span>
        </div>
      )}
    </div>
  );
};
