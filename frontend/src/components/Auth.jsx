import React, { useState } from 'react';
import { Lock, User, ArrowRight } from 'lucide-react';

const Auth = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/login' : '/register';
    
    try {
      const response = await fetch(`http://127.0.0.1:5001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          localStorage.setItem('userToken', data.token);
          onLoginSuccess(data.token);
        } else {
          alert("Registration successful! Please login.");
          setIsLogin(true);
        }
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch (err) {
      setError("Server connection failed.");
    }
  };

  return (
    <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl shadow-xl border border-slate-100 animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="text-slate-500 mt-2">{isLogin ? 'Login to check your heart health' : 'Join us to track your cardiovascular data'}</p>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 text-center font-medium">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <User className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Username"
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <input
            type="password"
            placeholder="Password"
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-100">
          {isLogin ? 'Login' : 'Sign Up'} <ArrowRight size={18} />
        </button>
      </form>

      <button 
        onClick={() => setIsLogin(!isLogin)}
        className="w-full mt-6 text-slate-500 text-sm font-medium hover:text-blue-600 transition"
      >
        {isLogin ? "Don't have an account? Register here" : "Already have an account? Login here"}
      </button>
    </div>
  );
};

export default Auth;