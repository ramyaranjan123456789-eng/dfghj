import React from "react";
import { motion } from "motion/react";
import { SEO } from "@/components/SEO";
import { Cookie, CheckCircle2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export const Cookies: React.FC = () => {
  return (
    <div className="flex-1 bg-white py-16 px-4 sm:px-6 lg:px-8 relative">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10 bg-white overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/[0.02] rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000002_1px,transparent_1px),linear-gradient(to_bottom,#00000002_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <SEO 
        title="Cookies Policy - PDFLovesYou" 
        description="Understand how we use cookies and browser local storage to deliver an elegant experience with zero identity tracking."
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
            <Cookie className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display tracking-tight">Cookies Policy</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Last updated: June 2, 2026</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-8 text-slate-600 leading-relaxed">
          <p className="text-lg text-slate-500">
            PDFLovesYou uses minimal, essential storage structures to provide quick page rendering, temporary task compilation histories, and system analytics configuration.
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 font-display">What are Cookies & Local Storage?</h2>
            <p>
              Cookies are minor text files stored on your local workstation by websites you explore. Browser Local Storage is a modern mechanism that allows websites to hold high-capacity data key-values locally without slowing down system network requests.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 font-display">How We Utilize Storage</h2>
            
            <div className="space-y-3 border-l-2 border-slate-200 pl-4">
              <div className="flex gap-2 items-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                <div>
                  <strong className="text-slate-900">Essential Settings:</strong> Holds minimal active preferences (such as selected files waitlisting) during document execution.
                </div>
              </div>

              <div className="flex gap-2 items-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                <div>
                  <strong className="text-slate-900">Temporary Download Cards:</strong> Holds direct references of downloads inside your browser's private local state so you can access your compiled assets during active research sessions.
                </div>
              </div>

              <div className="flex gap-2 items-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                <div>
                  <strong className="text-slate-900">Anonymous Telemetry:</strong> Assists in load indexing so we can optimize application servers and prevent operational down-times.
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 font-display">Your Control and De-authorization Rights</h2>
            <p>
              Users can comfortably manage, remove, or completely filter active cookie footprints. Navigate to your browser's settings dashboard (commonly labeled as Privacy & Security) to clear active local caches.
            </p>
            <p>
              For fully autonomous document clearing on our app, you can simply open our <strong>Download Dashboard</strong> and select the trash icon to instantly delete all local application tracks.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
