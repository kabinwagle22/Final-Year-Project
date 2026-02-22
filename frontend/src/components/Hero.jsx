import React from 'react';
import { HeartPulse, ShieldCheck, Activity } from 'lucide-react';

// We accept onStart as a prop from App.jsx to trigger the form view
const Hero = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-2xl">
          <HeartPulse size={32} /> <span>CVD-AI</span>
        </div>
        <div className="space-x-8 hidden md:block text-slate-600">
          <a href="#about" className="hover:text-blue-600">About CVD</a>
          <a href="#how" className="hover:text-blue-600">How it Works</a>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition">
            Login
          </button>
        </div>
      </nav>

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
            {/* The Start Assessment button now triggers the function passed from App.jsx */}
            <button 
              onClick={onStart}
              className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:scale-105 transition"
            >
              Start Assessment
            </button>
            <button className="border-2 border-slate-200 px-8 py-4 rounded-xl text-lg font-bold hover:bg-slate-50 transition">
              Learn More
            </button>
          </div>
        </div>
        
        {/* Right Side Info Cards */}
        <div className="md:w-1/2 mt-12 md:mt-0 grid grid-cols-2 gap-4 pl-4">
          <div className="bg-blue-50 p-8 rounded-3xl flex flex-col items-center text-center space-y-4 shadow-sm border border-blue-100">
            <Activity className="text-blue-600" size={48} />
            <h3 className="font-bold text-lg text-slate-800">AI Analysis</h3>
            <p className="text-sm text-slate-500">Real-time risk scoring based on 13 medical metrics.</p>
          </div>
          <div className="bg-green-50 p-8 rounded-3xl flex flex-col items-center text-center space-y-4 mt-8 shadow-sm border border-green-100">
            <ShieldCheck className="text-green-600" size={48} />
            <h3 className="font-bold text-lg text-slate-800">Secure Data</h3>
            <p className="text-sm text-slate-500">Your health data is encrypted and private.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;