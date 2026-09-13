import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getToolVectorIcon } from '@/components/ToolIcons';

interface ToolCardProps {
  title: string;
  description: string;
  icon?: React.ElementType;
  href: string;
  color?: string;
  badge?: string;
  customIcon?: React.ReactNode;
  iconType?: string;
}

// Visual icon renderer returning authentic, ultra-sharp vector graphics
export const renderToolIcon = (title: string, iconType?: string, className: string = "w-12 h-12 sm:w-13 sm:h-13") => {
  return getToolVectorIcon(title, iconType, className);
};

export const ToolCard: React.FC<ToolCardProps> = ({ 
  title, 
  description, 
  href, 
  customIcon,
  iconType,
  badge
}) => {
  return (
    <Link
      to={href}
      className={cn(
        "group relative flex flex-col justify-between p-6 h-full min-h-[175px] sm:min-h-[190px] rounded-2xl",
        "bg-white border border-slate-200/90 shadow-xs",
        "hover:border-[#E5322D] hover:shadow-md hover:-translate-y-1",
        "active:scale-[0.99] active:bg-slate-50/50",
        "transition-all duration-200 cursor-pointer"
      )}
    >
      {/* Optional Badge */}
      {badge && (
        <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 text-[#E5322D] border border-red-100 shadow-2xs">
          {badge}
        </span>
      )}

      {/* Top Left Icon Badge */}
      <div className="shrink-0 mb-4 group-hover:scale-105 transition-transform duration-200">
        {customIcon ? customIcon : renderToolIcon(title, iconType, "w-12 h-12")}
      </div>
      
      {/* Title & Description Stack */}
      <div className="flex-1 min-w-0">
        <h3 className="text-[18px] sm:text-[19px] font-bold text-slate-800 mb-1.5 tracking-tight group-hover:text-[#E5322D] transition-colors font-display">
          {title}
        </h3>
        <p className="text-slate-500 text-[13px] leading-relaxed font-normal line-clamp-3">
          {description}
        </p>
      </div>
    </Link>
  );
};
