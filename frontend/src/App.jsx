import React, { useState } from 'react';
import Hero from './components/Hero';
import About from './components/About';
import AssessmentForm from './components/AssessmentForm';
import ResultsPage from './components/ResultsPage';
import './index.css';

function App() {
  const [view, setView] = useState('home'); 
  const [riskData, setRiskData] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('userToken') || null);

  // MOCK LOGIN: Since your backend requires @jwt_required, 
  // you'll eventually need a real Login.jsx. For now, we simulate success.
  const handleStart = () => {
    if (!token) {
      alert("Note: Prediction requires a token. Ensure you implement Phase 5.1.5 (Login) next!");
      // For now, we still proceed to show the form
    }
    setView('form');
  };

  const handleCalculate = async (formData) => {
    try {
      // Prepare the data structure Flask expects: {"features": [13 values]}
      const featureArray = [
        Number(formData.age), Number(formData.sex), Number(formData.cp),
        Number(formData.trestbps), Number(formData.chol), Number(formData.fbs),
        Number(formData.restecg), Number(formData.thalach), Number(formData.exang),
        Number(formData.oldpeak), Number(formData.slope), Number(formData.ca), Number(formData.thal)
      ];

      const response = await fetch('http://127.0.0.1:5001/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Only send the header if the token actually exists
          ...(token && { 'Authorization': `Bearer ${token}` }) 
        },
        body: JSON.stringify({ features: featureArray }),
      });

      const data = await response.json();

      if (response.status === 401) {
        alert("Session expired or No Token found. Please login (Phase 5.1.5).");
        return;
      }

      setRiskData(data); // Stores risk_score, status, and alerts
      setView('results');
      
    } catch (error) {
      console.error("Backend Error:", error);
      alert("Connection failed. Check if Flask is running on 5001.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {view === 'home' && (
        <>
          <Hero onStart={handleStart} />
          <About />
        </>
      )}

      {view === 'form' && (
        <div className="bg-slate-50 min-h-screen py-12 px-6">
          <AssessmentForm onComplete={handleCalculate} onBack={() => setView('home')} />
        </div>
      )}

      {view === 'results' && riskData && (
        <div className="bg-slate-50 min-h-screen py-12 px-6">
          <ResultsPage 
            riskScore={riskData.risk_score} // Flask sends risk_score
            status={riskData.status}       // Flask sends status
            recommendation={riskData.recommendation} // Flask sends recommendation
            alerts={riskData.alerts}
            onReset={() => setView('home')} 
          />
        </div>
      )}
    </div>
  );
}

export default App;