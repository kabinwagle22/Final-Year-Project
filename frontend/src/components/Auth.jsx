import React, { useState, useEffect } from 'react';
import { 
  Lock, User, ArrowRight, Mail, UserPlus, 
  ShieldCheck, Loader2, Eye, EyeOff, CheckCircle2 
} from 'lucide-react';

const Auth = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false); 

  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [strength, setStrength] = useState({ score: 0, label: '', color: 'bg-slate-200' });

  // 1. Password Strength Logic
  useEffect(() => {
    if (isLogin || !formData.password) {
      setStrength({ score: 0, label: '', color: 'bg-slate-200' });
      return;
    }
    const pw = formData.password;
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    const levels = [
      { label: 'Very Weak', color: 'bg-red-500', width: '20%' },
      { label: 'Weak', color: 'bg-orange-500', width: '40%' },
      { label: 'Fair', color: 'bg-yellow-500', width: '60%' },
      { label: 'Strong', color: 'bg-blue-500', width: '80%' },
      { label: 'Excellent', color: 'bg-green-500', width: '100%' },
    ];
    setStrength({ ...levels[score - 1], score });
  }, [formData.password, isLogin]);

  // 2. Comprehensive Validation
  const validate = () => {
    let tempErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.username.trim()) tempErrors.username = "Username is required";
    
    if (!isLogin) {
      if (!formData.email.trim()) tempErrors.email = "Email is required";
      else if (!emailRegex.test(formData.email)) tempErrors.email = "Invalid email format";
      
      if (!formData.password) tempErrors.password = "Password is required";
      else if (formData.password.length < 6) tempErrors.password = "Minimum 6 characters";
      
      // RESTORED: Confirm Password Check
      if (!formData.confirmPassword) tempErrors.confirmPassword = "Please confirm password";
      else if (formData.password !== formData.confirmPassword) tempErrors.confirmPassword = "Passwords do not match";
    } else {
      if (!formData.password) tempErrors.password = "Password is required";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setIsSubmitting(true);
    const endpoint = isLogin ? '/login' : '/register';
    const payload = isLogin 
      ? { username: formData.username, password: formData.password }
      : { username: formData.username, email: formData.email, password: formData.password };
    
    try {
      const response = await fetch(`http://127.0.0.1:5001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          localStorage.setItem('userToken', data.token);
          localStorage.setItem('userName', data.username);
          onLoginSuccess(data.token);
        } else {
          setIsRegistered(true); 
        }
      } else {
        setServerError(data.message || "Authentication failed");
      }
    } catch (err) {
      setServerError("Server connection failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-10 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 min-h-[600px] flex flex-col justify-center">
      
      {isRegistered ? (
        <div className="text-center animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
            <CheckCircle2 size={44} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Success!</h2>
          <p className="text-slate-500 font-medium mb-10">Your profile is ready. Please log in to start tracking.</p>
          <button 
            onClick={() => { setIsRegistered(false); setIsLogin(true); }}
            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
          >
            Back to Login
          </button>
        </div>
      ) : (
        <>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mb-4">
              {isLogin ? <Lock size={30} /> : <UserPlus size={30} />}
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* USERNAME */}
            <div className="relative">
              <User className={`absolute left-4 top-4 ${errors.username ? 'text-red-400' : 'text-slate-400'}`} size={20} />
              <input
                type="text"
                placeholder="Username"
                className={`w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl outline-none transition-all ${errors.username ? 'border-red-500' : 'border-slate-100 focus:border-blue-500'}`}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
              {errors.username && <p className="text-[10px] text-red-500 font-bold ml-2 mt-1 uppercase">{errors.username}</p>}
            </div>

            {/* EMAIL */}
            {!isLogin && (
              <div className="relative">
                <Mail className={`absolute left-4 top-4 ${errors.email ? 'text-red-400' : 'text-slate-400'}`} size={20} />
                <input
                  type="email"
                  placeholder="Email Address"
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl outline-none transition-all ${errors.email ? 'border-red-500' : 'border-slate-100 focus:border-blue-500'}`}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {errors.email && <p className="text-[10px] text-red-500 font-bold ml-2 mt-1 uppercase">{errors.email}</p>}
              </div>
            )}

            {/* PASSWORD */}
            <div className="relative">
              <ShieldCheck className={`absolute left-4 top-4 ${errors.password ? 'text-red-400' : 'text-slate-400'}`} size={20} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className={`w-full pl-12 pr-12 py-4 bg-slate-50 border rounded-2xl outline-none transition-all ${errors.password ? 'border-red-500' : 'border-slate-100 focus:border-blue-500'}`}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-slate-400 hover:text-blue-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              
              {!isLogin && formData.password && (
                <div className="mt-3 px-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black uppercase text-slate-400">Strength: {strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${strength.color}`} style={{ width: strength.width }}></div>
                  </div>
                </div>
              )}
              {errors.password && <p className="text-[10px] text-red-500 font-bold ml-2 mt-1 uppercase">{errors.password}</p>}
            </div>

            {/* RESTORED: CONFIRM PASSWORD */}
            {!isLogin && (
              <div className="relative">
                <Lock className={`absolute left-4 top-4 ${errors.confirmPassword ? 'text-red-400' : 'text-slate-400'}`} size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl outline-none transition-all ${errors.confirmPassword ? 'border-red-500' : 'border-slate-100 focus:border-blue-500'}`}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
                {errors.confirmPassword && <p className="text-[10px] text-red-500 font-bold ml-2 mt-1 uppercase">{errors.confirmPassword}</p>}
              </div>
            )}

            {serverError && <p className="bg-red-50 text-red-600 p-3 rounded-xl text-[10px] font-bold text-center border border-red-100 uppercase">{serverError}</p>}

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4 shadow-xl active:scale-95"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : (isLogin ? 'Login' : 'Register Account')}
              {!isSubmitting && <ArrowRight size={20} />}
            </button>
          </form>

          <button 
            onClick={() => { setIsLogin(!isLogin); setErrors({}); setServerError(''); }}
            className="w-full mt-8 text-slate-400 text-[11px] font-black uppercase tracking-widest hover:text-blue-600 transition-colors"
          >
            {isLogin ? "New here? Sign up for free" : "Already a member? Log in"}
          </button>
        </>
      )}
    </div>
  );
};

export default Auth;