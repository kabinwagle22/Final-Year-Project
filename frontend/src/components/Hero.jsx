import React from 'react';
import { ShieldCheck, Activity } from 'lucide-react';

// We accept onStart and onViewTips as props from App.jsx
const Hero = ({ onStart, onViewTips }) => {
  return (
    <div className="bg-white">
      {/* Main Content (Hero) */}
      <section className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 space-y-6">
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight">
            Predict Your Heart Health <span className="text-blue-600">In Minutes.</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-lg">
            Using advanced AI to help individuals under 35 understand their cardiovascular risks before symptoms appear.
          </p>
          <div className="flex gap-4">
            {/* Triggers the navigation to the Assessment Form or Login */}
            <button 
              onClick={onStart}
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-lg font-bold shadow-lg shadow-blue-200 hover:scale-105 active:scale-95 transition-all"
            >
              Start Assessment
            </button>
            
            {/* Triggers the smooth scroll to the About/Tips section */}
            <button 
              onClick={onViewTips}
              className="border-2 border-slate-200 text-slate-600 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-slate-50 transition-all"
            >
              View Heart Tips
            </button>
          </div>
        </div>
        
        {/* Right Side Info Cards */}
        <div className="md:w-1/2 mt-12 md:mt-0 grid grid-cols-2 gap-4 pl-4 relative">
          {/* Decorative background element */}
          <div className="absolute -z-10 top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
          
          <div className="bg-white p-8 rounded-3xl flex flex-col items-center text-center space-y-4 shadow-xl shadow-slate-100 border border-slate-50 transition-transform hover:-translate-y-2">
            <div className="bg-blue-50 p-4 rounded-2xl">
              <Activity className="text-blue-600" size={40} />
            </div>
            <h3 className="font-bold text-lg text-slate-800">AI Analysis</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Real-time risk scoring based on 13 medical metrics.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl flex flex-col items-center text-center space-y-4 mt-12 shadow-xl shadow-slate-100 border border-slate-50 transition-transform hover:-translate-y-2">
            <div className="bg-green-50 p-4 rounded-2xl">
              <ShieldCheck className="text-green-600" size={40} />
            </div>
            <h3 className="font-bold text-lg text-slate-800">Secure Data</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Your health data is encrypted and completely private.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;