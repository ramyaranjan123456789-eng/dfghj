import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, X } from 'lucide-react';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName?: string;
}

export function PasswordModal({ isOpen, onClose, fileName }: PasswordModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-green-950/60 rounded-full flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6 text-[#22c55e]" />
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Password Protected PDF
              </h3>
              
              <p className="text-slate-600 mb-6">
                {fileName 
                  ? `The file "${fileName}" is password protected.` 
                  : "One or more of the uploaded files are password protected."}
                {" "}Please unlock the file before uploading it to this tool.
              </p>
              
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#22c55e] text-white font-medium rounded-xl hover:bg-[#16a34a] transition-colors"
                >
                  Understood
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
