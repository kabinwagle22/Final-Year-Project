import React from 'react';
import { Lock, X, Sparkles } from 'lucide-react';

const LoginModal = ({ isOpen, onClose, onLogin }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl mb-6 shadow-inner">
            <Lock size={36} strokeWidth={2.5} />
          </div>

          <div className="flex items-center justify-center gap-2 text-blue-600 text-xs font-black uppercase tracking-widest mb-3">
            <Sparkles size={14} /> Member Exclusive
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
            Unlock the Blueprint
          </h2>
          
          <p className="text-slate-500 font-medium leading-relaxed mb-8">
            To view our premium cardiovascular health tips and personalized AI insights, please log in to your account.
          </p>

          <div className="flex flex-col gap-3">
            <button 
              onClick={onLogin}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-blue-200"
            >
              Log In Now
            </button>
            <button 
              onClick={onClose}
              className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;