import React from 'react';
import { AlertTriangle, CheckCircle, RefreshCw, Share2, Info } from 'lucide-react';

// Destructure exactly what App.jsx is sending
const ResultsPage = ({ riskScore, status, recommendation, alerts = [], onReset }) => {
  
  // 1. Logic check: Use the props sent from App.jsx
  const displayScore = riskScore || 0;
  const displayStatus = status || "Analysis Complete";
  const displayRec = recommendation || "Processing your results...";

  // Determine styling based on risk level
  const isHighRisk = displayStatus === "High Risk" || displayScore > 50;
  const colorClass = isHighRisk ? 'text-red-600' : 'text-green-600';
  const bgColor = isHighRisk ? 'bg-red-50' : 'bg-green-50';
  const borderColor = isHighRisk ? 'border-red-100' : 'border-green-100';

  return (
    <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-3xl shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-500">
      <h2 className="text-3xl font-bold text-center text-slate-900 mb-8">Your Health Analysis</h2>
      
      {/* Risk Gauge Section */}
      <div className="relative flex flex-col items-center justify-center mb-10">
        <div className="relative w-64 h-32 overflow-hidden">
          {/* Background Track */}
          <div className="absolute w-64 h-64 border-[20px] border-slate-100 rounded-full"></div>
          {/* Dynamic Progress Fill */}
          <div 
            className="absolute w-64 h-64 border-[20px] rounded-full transition-all duration-1000 ease-out"
            style={{ 
              borderColor: isHighRisk ? '#EF4444' : '#10B981',
              clipPath: 'inset(0 0 50% 0)',
              // Math: 1.8 degrees per percentage point (180 deg / 100%)
              transform: `rotate(${(displayScore * 1.8) - 90}deg)` 
            }}
          ></div>
        </div>
        
        {/* The Percentage Display */}
        <div className="mt-4 text-center">
          <span className={`text-6xl font-black ${colorClass}`}>
            {displayScore}%
          </span>
          <p className="text-slate-500 font-bold uppercase tracking-widest mt-1">
            {displayStatus}
          </p>
        </div>
      </div>

      {/* Insight Card */}
      <div className={`${bgColor} border ${borderColor} p-6 rounded-2xl flex items-start gap-4 mb-6`}>
        {isHighRisk ? (
          <AlertTriangle className="text-red-600 shrink-0" size={28} />
        ) : (
          <CheckCircle className="text-green-600 shrink-0" size={28} />
        )}
        <div>
          <h3 className={`font-bold text-lg ${colorClass}`}>
            {isHighRisk ? "Action Recommended" : "Healthy Standing"}
          </h3>
          <p className="text-slate-700 text-sm leading-relaxed mt-1">
            {displayRec}
          </p>
        </div>
      </div>

      {/* Critical Alerts from Flask (if any) */}
      {alerts && alerts.length > 0 && (
        <div className="mb-8 space-y-2">
          {alerts.map((alert, index) => (
            <div key={index} className="flex items-center gap-2 text-red-700 bg-red-100/50 px-4 py-2 rounded-lg text-sm font-medium">
              <Info size={16} /> {alert}
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={onReset}
          className="flex items-center justify-center gap-2 border-2 border-slate-200 py-4 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition active:scale-95"
        >
          <RefreshCw size={18} /> New Test
        </button>
        <button className="flex items-center justify-center gap-2 bg-blue-600 py-4 rounded-xl font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition active:scale-95">
          <Share2 size={18} /> Save PDF
        </button>
      </div>
    </div>
  );
};

export default ResultsPage;