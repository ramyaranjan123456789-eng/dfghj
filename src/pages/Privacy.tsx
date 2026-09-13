import React from "react";
import { motion } from "motion/react";
import { SEO } from "@/components/SEO";
import { Shield, ShieldCheck, ArrowLeft, Key, Lock, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";

export const Privacy: React.FC = () => {
  return (
    <div className="flex-1 bg-white py-16 px-4 sm:px-6 lg:px-8 relative">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10 bg-white overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/[0.02] rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000002_1px,transparent_1px),linear-gradient(to_bottom,#00000002_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <SEO 
        title="Privacy Policy - PDFLovesYou" 
        description="Learn about our 100% secure file processing, local storage deletion, and privacy commitments."
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
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display tracking-tight">Privacy Policy</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Last updated: June 2, 2026</p>
          </div>
        </div>

        {/* Pillars of Trust */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50">
            <Lock className="w-6 h-6 text-indigo-600 mb-3" />
            <h3 className="font-bold text-slate-900 text-sm mb-1 font-display">Local Processing</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Files are loaded and processed locally within your secure sandbox or automatically cleared immediately.
            </p>
          </div>
          <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50">
            <EyeOff className="w-6 h-6 text-indigo-600 mb-3" />
            <h3 className="font-bold text-slate-900 text-sm mb-1 font-display">No Backups Saved</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We never save backup copies of your PDFs. There are no databases running any automated scraper.
            </p>
          </div>
          <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50">
            <Key className="w-6 h-6 text-indigo-600 mb-3" />
            <h3 className="font-bold text-slate-900 text-sm mb-1 font-display">GDPR Compliant</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              You maintain total regulatory jurisdiction over your individual information and document assets.
            </p>
          </div>
        </div>

        {/* Full Details */}
        <div className="space-y-8 text-slate-600 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-900 font-display">1. Information We Do Not Collect</h2>
            <p>
              When you upload files (such as PDFs, Word documents, or JPEG images) to PDFLovesYou, those files are transferred safely for processing. 
              <strong> We never read, view, parse, save, or store the information in those documents.</strong> 
              No databases maintain archive copies, and the document contents are fully purged automatically from cache memory inside the network session immediately upon task completion.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-900 font-display">2. Secure local storage</h2>
            <p>
              Any transient reference metadata (such as original filename or total file size) used to facilitate immediate user actions like the "Download Page" history counts is managed strictly using your browser's local sandbox storage. Users can clear this entirely at any time by executing the trash icon inside the download page.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-900 font-display">3. Third-Party Integrations</h2>
            <p>
              We optionally provide access buttons for loading files directly via third-party repositories like Google Drive or Dropbox. When using these connections, you establish direct sessions with those companies. PDFLovesYou never collects, monitors, or gains unauthorized secondary keys to your cloud accounts.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-900 font-display">4. Analytical Protection</h2>
            <p>
              We run secure, non-identifying telemetry to help monitor overall infrastructure health (such as aggregate counts of successful merges versus splits to prevent tool errors). No personally identifiable data (PID) or file-content indexes are submitted to tracking networks.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-900 font-display">5. Contact Information</h2>
            <p>
              If you have any questions or require additional clarifications regarding your user security or privacy protocols, reach out directly at: <span className="text-indigo-600 font-semibold">support@pdfloveyou.com</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
