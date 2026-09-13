import React from 'react';
import { Shield, Zap, CheckCircle2, Cloud, Lock, Heart, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToolFeature {
  title: string;
  desc: string;
}

interface ToolViewContainerProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  actionTitle?: string;
  infoMessage?: string;
  onAddMore?: () => void;
  hasFiles?: boolean;
  features?: ToolFeature[];
}

export const defaultToolFeatures: ToolFeature[] = [
  {
    title: 'Secure',
    desc: 'Your files are protected with 256-bit SSL encryption.'
  },
  {
    title: 'Fast',
    desc: 'Process your PDFs in just a few seconds.'
  },
  {
    title: 'Easy to Use',
    desc: 'Simple and intuitive interface for everyone.'
  },
  {
    title: '100% Free',
    desc: 'Unlimited processing, completely free.'
  }
];

export function ToolViewContainer({
  title,
  subtitle,
  children,
  actionTitle,
  infoMessage,
  onAddMore,
  hasFiles = false,
  features = defaultToolFeatures
}: ToolViewContainerProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] bg-[#FAF8FC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Top Header Illustration with 2 documents & plus symbol matching screenshot */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative flex items-center justify-center mb-4">
            {/* Left PDF Doc */}
            <div className="w-10 h-12 sm:w-12 sm:h-14 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col items-center justify-center transform -rotate-6 -mr-2 relative z-10">
              <FileText className="w-5 h-5 text-rose-500" strokeWidth={2.2} />
            </div>

            {/* Center + Badge */}
            <div className="w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 text-xs font-black z-20 mx-[-6px]">
              +
            </div>

            {/* Right PDF Doc */}
            <div className="w-10 h-12 sm:w-12 sm:h-14 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col items-center justify-center transform rotate-6 -ml-2 relative z-10">
              <FileText className="w-5 h-5 text-rose-500" strokeWidth={2.2} />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-2 sm:mb-3 font-display tracking-tight text-center">
            {title}
          </h1>
          
          {/* Subtitle */}
          <p className="text-xs sm:text-base text-slate-500 max-w-lg mx-auto text-center font-normal leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Dynamic Tool Content (Upload card, interactive file workspace, conversion options) */}
        <div className="w-full flex flex-col items-center justify-center">
          {children}
        </div>

        {/* 4 Feature Pillars Grid matching screenshot */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 my-10 sm:my-14 text-center">
          {/* 1. Secure */}
          <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col items-center">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-3">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <h4 className="text-sm font-extrabold text-slate-900 mb-1 font-display">{features[0]?.title || 'Secure'}</h4>
            <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">
              {features[0]?.desc || 'Your files are protected with 256-bit SSL encryption.'}
            </p>
          </div>

          {/* 2. Fast */}
          <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col items-center">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-3">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <h4 className="text-sm font-extrabold text-slate-900 mb-1 font-display">{features[1]?.title || 'Fast'}</h4>
            <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">
              {features[1]?.desc || 'Process your PDFs in just a few seconds.'}
            </p>
          </div>

          {/* 3. Easy to Use */}
          <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col items-center">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-3">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <h4 className="text-sm font-extrabold text-slate-900 mb-1 font-display">{features[2]?.title || 'Easy to Use'}</h4>
            <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">
              {features[2]?.desc || 'Simple and intuitive interface for everyone.'}
            </p>
          </div>

          {/* 4. 100% Free */}
          <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col items-center">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-3">
              <Cloud className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <h4 className="text-sm font-extrabold text-slate-900 mb-1 font-display">{features[3]?.title || '100% Free'}</h4>
            <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">
              {features[3]?.desc || 'Unlimited processing, completely free.'}
            </p>
          </div>
        </div>

        {/* Soft Pink Banner: Our PDF tools are 100% free to use. */}
        <div className="bg-[#FDF2F8] border border-[#FCE7F3] rounded-2xl py-3.5 px-4 sm:px-6 text-center text-slate-700 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 shadow-xs mb-6">
          <Heart className="w-4 h-4 text-pink-500 fill-pink-500 shrink-0" />
          <span>Our PDF tools are 100% free to use. No sign up, no limits, just easy PDF solutions.</span>
        </div>

        {/* Privacy Note Card at Bottom matching screenshot */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <Shield className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 mb-0.5 font-display">Your privacy matters</h4>
            <p className="text-xs text-slate-500">
              We never store your files. They are processed locally or automatically deleted after processing.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
