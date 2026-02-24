import React, { useEffect, useState } from 'react';
import { Clock, TrendingUp, ShieldAlert, CheckCircle, Activity, Heart, Apple, Dumbbell } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const RiskGauge = ({ score }) => {
  const data = [{ value: score }, { value: 100 - score }, { value: 100 }];
  const getColors = () => {
    if (score < 30) return ['#22c55e', '#f1f5f9', 'transparent'];
    if (score < 60) return ['#eab308', '#f1f5f9', 'transparent'];
    return ['#ef4444', '#f1f5f9', 'transparent'];
  };

  return (
    <div className="h-40 w-full relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie 
            data={data} 
            cx="50%" 
            cy="80%" 
            startAngle={180} 
            endAngle={0} 
            innerRadius={55} 
            outerRadius={80} 
            dataKey="value" 
            stroke="none"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={getColors()[index]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute bottom-4 text-center">
        <p className="text-2xl font-black text-slate-800 leading-none">{score}%</p>
        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">CVD Risk</p>
      </div>
    </div>
  );
};

const HealthTips = ({ score }) => {
  const isHighRisk = score > 50;

  const tips = isHighRisk ? [
    { icon: <Apple className="text-orange-500" />, title: "DASH Diet", desc: "Prioritize fruits, veggies, and lean proteins to help lower BP." },
    { icon: <Dumbbell className="text-blue-500" />, title: "Low Impact Cardio", desc: "Start with 15 mins of walking daily to strengthen your heart." },
    { icon: <ShieldAlert className="text-red-500" />, title: "Medical Consult", desc: "Since your risk is >50%, schedule a heart screening soon." }
  ] : [
    { icon: <CheckCircle className="text-green-500" />, title: "Maintenance", desc: "Your risk is low! Keep up your current activity levels." },
    { icon: <Heart className="text-pink-500" />, title: "Omega-3s", desc: "Incorporate fish or walnuts to maintain healthy cholesterol." },
    { icon: <Activity className="text-blue-500" />, title: "Consistency", desc: "Track your BP once a month to ensure you stay in the green." }
  ];

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Heart size={20} className="text-red-500" /> Personalized Health Tips
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tips.map((tip, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition">
            <div className="mb-2">{tip.icon}</div>
            <p className="font-bold text-slate-800 text-sm">{tip.title}</p>
            <p className="text-xs text-slate-500 mt-1">{tip.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const Dashboard = ({ token, onNewTest }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:5001/history', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setHistory(data);
      setLoading(false);
    })
    .catch(err => console.error("Error:", err));
  }, [token]);

  const lastAssessment = history.length > 0 ? history[0] : null;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Health Dashboard</h2>
          <p className="text-slate-500">Real-time cardiovascular monitoring</p>
        </div>
        <button onClick={onNewTest} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg transition-all active:scale-95">
          New Assessment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><TrendingUp size={24}/></div>
          <div><p className="text-sm text-slate-500 font-medium">Total Assessments</p><p className="text-2xl font-bold text-slate-800">{history.length}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-slate-50 p-3 rounded-xl text-slate-600"><Activity size={24}/></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Latest Status</p>
            <p className={`text-xl font-bold ${lastAssessment?.risk_score > 50 ? 'text-red-500' : 'text-green-500'}`}>
              {lastAssessment ? lastAssessment.status : 'No Data Available'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Assessment History</h3>
          <div className="space-y-4">
            {history.map((item, idx) => (
              <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between hover:border-blue-200 transition">
                <div className="flex items-center gap-4">
                  <div className={`${item.risk_score > 50 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'} p-2 rounded-lg`}>
                    {item.risk_score > 50 ? <ShieldAlert size={20}/> : <CheckCircle size={20}/>}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{item.status}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Clock size={12}/> {item.timestamp}</p>
                  </div>
                </div>
                <span className={`text-xl font-black ${item.risk_score > 50 ? 'text-red-600' : 'text-green-600'}`}>{item.risk_score}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Risk Level Guide</h3>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center">
            {lastAssessment ? (
              <>
                <RiskGauge score={lastAssessment.risk_score} />
                <p className="text-sm text-slate-500 mt-4 leading-relaxed">
                  Your risk score is <strong>{lastAssessment.risk_score}%</strong>. 
                  {lastAssessment.risk_score > 50 
                    ? " This is considered high risk. Small changes can make a big difference!" 
                    : " Your heart health is on the right track. Keep up the good work!"}
                </p>
              </>
            ) : <p className="text-slate-400 py-10">Complete a test to see analysis.</p>}
          </div>
        </div>
      </div>

      {lastAssessment && <HealthTips score={lastAssessment.risk_score} />}
    </div>
  );
};

export default Dashboard;