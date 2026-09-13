import React from "react";
import { motion } from "motion/react";
import { SEO } from "@/components/SEO";
import { FileText, ShieldAlert, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export const Terms: React.FC = () => {
  return (
    <div className="flex-1 bg-white py-16 px-4 sm:px-6 lg:px-8 relative">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10 bg-white overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/[0.02] rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000002_1px,transparent_1px),linear-gradient(to_bottom,#00000002_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <SEO 
        title="Terms of Service - PDFLovesYou" 
        description="Read our Terms of Service. Understand your rights and our commitment to security and privacy."
      />

      <div className="max-w-3xl mx-auto">
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display tracking-tight">Terms of Service</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Last updated: June 2, 2026</p>
          </div>
        </div>

        {/* Trust Alert */}
        <div className="bg-emerald-50 border border-emerald-100/80 rounded-2xl p-5 mb-8 flex gap-4 items-start">
          <ShieldAlert className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-emerald-800 text-sm mb-1 font-display">No Registration Required & 100% Secure</h3>
            <p className="text-xs text-emerald-700 leading-relaxed">
              We process your files with industry-first client-side technology. Your documents never stay on any storage server, and we do not compile, trade, or distribute your data.
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-8 text-slate-600 leading-relaxed font-normal">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 font-display">1. Agreement to Terms</h2>
            <p>
              By accessing and using <strong>PDFLovesYou</strong>, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 font-display">2. Service Description</h2>
            <p>
              PDFLovesYou is a free, web-based tool suite that enables users to merge, split, rotate, convert, watermark, and unlock PDF files. Our premium-grade tools run with speed optimization and security as local-first as possible.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 font-display">3. Document Ownership & Non-Retention Policy</h2>
            <p>
              You maintain full, absolute ownership and copyright of any file loaded or processed. PDFLovesYou does not claim any rights over your materials. Additionally:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-500">
              <li>No document data is collected or backed up server-side.</li>
              <li>Files are deleted automatically from session memory immediately after downloading or closing the browser window.</li>
              <li>We will never view, edit, share, or sell your document contents.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 font-display">4. Acceptable Use Policy</h2>
            <p>
              You agree not to use the service for any illegal activities, or to upload files containing code, viruses, or spyware designed to disrupt web infrastructure. You represent that you have all legal authorization to process any file you submit.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 font-display">5. Limitation of Liability</h2>
            <p>
              PDFLovesYou is provided on an "as is" and "as available" basis. While we strive for extreme stability and high accuracy, we are not responsible for any file data loss occurring from network transfers or user session timeouts. Please keep original backups of your critical documents.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 font-display">6. Policy Updates</h2>
            <p>
              We reserve the right to revise these Terms occasionally to improve transparency or adjust to regulatory adjustments. Continued use of the platform constitutes agreement to the post-revision terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
