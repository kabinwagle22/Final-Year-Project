import React from 'react';
import { Apple, Activity, Moon, Brain, ChevronLeft, Heart, CheckCircle2, Sparkles } from 'lucide-react';

const HealthTips = ({ onBack }) => {
  const handleBack = () => {
    onBack();
    window.scrollTo(0, 0);
  };

  const tipCategories = [
    {
      title: "Nutrition & Diet",
      icon: <Apple size={32} />,
      gradient: "from-orange-400 to-red-500",
      shadow: "hover:shadow-orange-200",
      glow: "group-hover:text-orange-500",
      tips: ["DASH diet focus", "Low sodium (<2300mg)", "Rich in Omega-3s"]
    },
    {
      title: "Physical Activity",
      icon: <Activity size={32} />,
      gradient: "from-blue-400 to-cyan-500",
      shadow: "hover:shadow-blue-200",
      glow: "group-hover:text-blue-500",
      tips: ["150 mins moderate/week", "Strength training 2x/week", "Break sedentary habits"]
    },
    {
      title: "Mental Wellbeing",
      icon: <Brain size={32} />,
      gradient: "from-purple-400 to-pink-500",
      shadow: "hover:shadow-purple-200",
      glow: "group-hover:text-purple-500",
      tips: ["Manage cortisol levels", "Daily mindfulness", "Social connection"]
    },
    {
      title: "Sleep Hygiene",
      icon: <Moon size={32} />,
      gradient: "from-indigo-500 to-blue-700",
      shadow: "hover:shadow-indigo-200",
      glow: "group-hover:text-indigo-600",
      tips: ["7-9 hours recovery", "Consistent schedule", "BP regulation"]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
      {/* --- MAGIC BACKGROUND ELEMENTS --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-100/40 rounded-full blur-[120px] animate-bounce" style={{ animationDuration: '8s' }}></div>

      <div className="max-w-6xl mx-auto px-6 relative z-10 py-12">
        
        {/* Back Button with Glass effect */}
        <button 
          onClick={handleBack}
          className="group flex items-center gap-2 px-5 py-2 bg-white/50 backdrop-blur-md border border-white/50 rounded-full text-slate-500 hover:text-blue-600 font-bold transition-all shadow-sm hover:shadow-md mb-12"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        <header className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest mb-6 animate-fade-in">
            <Sparkles size={14} /> AI Health Insights
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-none">
            The Heart <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-red-500">Blueprint</span>
          </h1>
          <p className="text-slate-500 text-xl max-w-2xl mx-auto font-medium">
            Science-backed pillars to transform your cardiovascular future.
          </p>
        </header>

        {/* --- DYNAMIC MAGIC GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {tipCategories.map((category, idx) => (
            <div 
              key={idx} 
              className={`group relative bg-white/80 backdrop-blur-xl rounded-[3rem] p-12 border border-white shadow-xl 
                transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
                hover:scale-[1.03] hover:-translate-y-3 ${category.shadow} cursor-default overflow-hidden`}
            >
              {/* Background Glow Effect */}
              <div className={`absolute -right-20 -top-20 w-48 h-48 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-full blur-3xl`}></div>

              <div className="relative z-10">
                <div className={`w-20 h-20 bg-gradient-to-br ${category.gradient} rounded-[1.5rem] flex items-center justify-center text-white shadow-lg shadow-current/20 mb-8 transition-transform duration-700 group-hover:rotate-[15deg] group-hover:scale-110`}>
                  {category.icon}
                </div>

                <h2 className={`text-3xl font-black text-slate-800 mb-6 transition-colors duration-300 ${category.glow}`}>
                  {category.title}
                </h2>

                <div className="space-y-5">
                  {category.tips.map((tip, tIdx) => (
                    <div key={tIdx} className="flex items-center gap-4 group/item">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center group-hover/item:bg-green-100 transition-colors">
                        <CheckCircle2 size={14} className="text-slate-400 group-hover/item:text-green-600 transition-colors" />
                      </div>
                      <span className="text-slate-500 font-bold group-hover:text-slate-700 transition-colors">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decorative "Glass" element inside card */}
              <div className="absolute bottom-4 right-8 text-slate-100 group-hover:text-slate-200 transition-colors">
                <Heart size={80} strokeWidth={0.5} />
              </div>
            </div>
          ))}
        </div>

        {/* --- PREMIUM CALL TO ACTION --- */}
        <div className="mt-24 relative p-1 bg-gradient-to-r from-blue-600 via-purple-500 to-red-500 rounded-[3.5rem] shadow-2xl">
          <div className="bg-slate-900 rounded-[3.4rem] p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 relative z-10">
              Ready to take the <br/><span className="text-blue-400 font-mono">first step?</span>
            </h2>
            <p className="text-slate-400 text-lg mb-12 max-w-lg mx-auto relative z-10">
              Your AI dashboard is waiting. Get your clinical-grade assessment in under 5 minutes.
            </p>
            
            <button 
              onClick={handleBack}
              className="relative z-10 bg-white text-slate-900 px-12 py-5 rounded-2xl font-black text-xl hover:bg-blue-50 hover:scale-110 active:scale-95 transition-all shadow-xl shadow-white/10"
            >
              Start Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthTips;