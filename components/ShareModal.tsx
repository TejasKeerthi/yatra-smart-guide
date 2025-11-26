import React, { useState } from 'react';
import { X, Link, Mail, Check, Copy } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, url }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const handleEmail = () => {
    const subject = encodeURIComponent("Check out my Yatra Trip!");
    const body = encodeURIComponent(`Hey,\n\nI used Yatra to plan an amazing trip. Check out my itinerary here:\n\n${url}\n\nEnjoy!`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-300 border dark:border-slate-800">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Link size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Share your Trip</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Anyone with this link can view your itinerary.</p>
        </div>

        {/* Copy Link Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <input 
              type="text" 
              readOnly 
              value={url}
              className="flex-1 bg-transparent text-sm text-slate-600 dark:text-slate-300 outline-none px-2 font-medium truncate"
            />
            <button
              onClick={handleCopy}
              className={`
                p-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5
                ${copied 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                  : 'bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600'}
              `}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-3">
          <button 
            onClick={handleEmail}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200 dark:shadow-none"
          >
            <Mail size={18} /> Send via Email
          </button>
        </div>
      </div>
    </div>
  );
};