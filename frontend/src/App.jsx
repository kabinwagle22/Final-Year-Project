import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import About from './components/About';
import AssessmentForm from './components/AssessmentForm';
import ResultsPage from './components/ResultsPage';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';
import HealthTips from './components/HealthTips';
import LoginModal from './components/LoginModal'; // NEW IMPORT
import './index.css';

function App() {
  const [view, setView] = useState('home'); 
  const [riskData, setRiskData] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('userToken') || null);
  const [lastInputs, setLastInputs] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // NEW STATE for Modal

  useEffect(() => {
    const checkToken = async () => {
      const savedToken = localStorage.getItem('userToken');
      if (!savedToken) return;
  
      try {
        const resp = await fetch('http://127.0.0.1:5001/history', {
          headers: { 'Authorization': `Bearer ${savedToken}` }
        });
        if (resp.ok) {
          setToken(savedToken);
        } else {
          handleLogout(); 
        }
      } catch (err) {
        console.error("Auth check failed");
      }
    };
    checkToken();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    setToken(null);
    setView('home');
  };

  const handleStart = () => {
    if (!token) setView('login');
    else setView('dashboard');
  };

  // UPDATED: Triggers the Pretty Modal instead of browser alert
  const goToTips = () => {
    if (!token) {
      setIsModalOpen(true); 
    } else {
      setView('tips');
      window.scrollTo(0, 0);
    }
  };

  // NEW: Navigation helper for modal action
  const handleModalLogin = () => {
    setIsModalOpen(false);
    setView('login');
  };

  // Target for "How it Works" link in Navbar
  const scrollToAbout = () => {
    if (view !== 'home') {
      setView('home');
      setTimeout(() => {
        document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCalculate = async (formData) => {
    setLastInputs(formData);
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
          'Authorization': `Bearer ${token}`
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
    <div className="min-h-screen bg-white relative">
      {/* PRETTY LOGIN MODAL */}
      <LoginModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onLogin={handleModalLogin} 
      />

      {/* GLOBAL NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => setView('home')}
        >
          <div className="text-blue-600 font-black text-2xl tracking-tighter italic">CVD-AI</div>
        </div>

        <div className="flex items-center gap-8">
          <button 
            onClick={scrollToAbout} 
            className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition"
          >
            How it Works
          </button>
          
          {token ? (
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setView('dashboard')} 
                className={`text-sm font-bold transition-colors ${view === 'dashboard' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
              >
                Dashboard
              </button>
              <div className="h-4 w-px bg-slate-200"></div>
              <button 
                onClick={handleLogout} 
                className="text-sm font-bold text-slate-500 hover:text-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setView('login')} 
              className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
            >
              Login
            </button>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pt-20">
        {view === 'home' && (
          <>
            <Hero onStart={handleStart} onViewTips={goToTips} />
            <div id="about-section">
              <About />
            </div>
          </>
        )}

        {/* HEALTH TIPS VIEW */}
        {view === 'tips' && (
          <HealthTips onBack={() => setView('home')} />
        )}

        {view === 'login' && (
          <div className="bg-slate-50 min-h-screen py-12 px-6">
            <Auth onLoginSuccess={(newToken) => {
              setToken(newToken);
              setView('dashboard');
            }} />
          </div>
        )}

        {view === 'dashboard' && token && (
          <div className="bg-slate-50 min-h-screen py-12 px-6">
            <Dashboard 
              token={token} 
              onNewTest={() => setView('form')} 
            />
          </div>
        )}

        {view === 'form' && (
          <div className="bg-slate-50 min-h-screen py-12 px-6">
            <AssessmentForm onComplete={handleCalculate} onBack={() => setView('dashboard')} />
          </div>
        )}

        {view === 'results' && riskData && (
          <div className="bg-slate-50 min-h-screen py-12 px-6">
            <ResultsPage 
              riskScore={riskData.risk_score} 
              status={riskData.status}
              recommendation={riskData.recommendation}
              userInputs={lastInputs} 
              onReset={() => setView('dashboard')} 
            />
          </div>
        )}
      </main>

      {token && <Chatbot token={token} />}
    </div>
  );
}

export default App;