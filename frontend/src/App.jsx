import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import About from './components/About';
import AssessmentForm from './components/AssessmentForm';
import ResultsPage from './components/ResultsPage';
import Auth from './components/Auth'; // New Import
import './index.css';

function App() {
  const [view, setView] = useState('home'); 
  const [riskData, setRiskData] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('userToken') || null);

  // Effect to check for token on load
  useEffect(() => {
    const savedToken = localStorage.getItem('userToken');
    if (savedToken) setToken(savedToken);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    setToken(null);
    setView('home');
  };

  const handleStart = () => {
    // If no token, send them to login first
    if (!token) {
      setView('login');
    } else {
      setView('form');
    }
  };

  const handleCalculate = async (formData) => {
    try {
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
          'Authorization': `Bearer ${token}` // This is the "Key" the backend needs!
        },
        body: JSON.stringify({ features: featureArray }),
      });

      const data = await response.json();

      if (response.status === 401) {
        handleLogout();
        alert("Session expired. Please login again.");
        return;
      }

      setRiskData(data); 
      setView('results');
      
    } catch (error) {
      console.error("Backend Error:", error);
      alert("Connection failed. Check if Flask is running.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation / Logout Button */}
      {token && (
        <div className="absolute top-4 right-4 z-50">
          <button onClick={handleLogout} className="text-sm font-semibold text-slate-500 hover:text-red-600 transition">
            Logout
          </button>
        </div>
      )}

      {view === 'home' && (
        <>
          <Hero onStart={handleStart} />
          <About />
        </>
      )}

      {view === 'login' && (
        <div className="bg-slate-50 min-h-screen py-12 px-6">
          <Auth onLoginSuccess={(newToken) => {
            setToken(newToken);
            setView('form');
          }} />
        </div>
      )}

      {view === 'form' && (
        <div className="bg-slate-50 min-h-screen py-12 px-6">
          <AssessmentForm onComplete={handleCalculate} onBack={() => setView('home')} />
        </div>
      )}

      {view === 'results' && riskData && (
        <div className="bg-slate-50 min-h-screen py-12 px-6">
          <ResultsPage 
            riskScore={riskData.risk_score} 
            status={riskData.status}
            recommendation={riskData.recommendation}
            onReset={() => setView('home')} 
          />
        </div>
      )}
    </div>
  );
}

export default App;