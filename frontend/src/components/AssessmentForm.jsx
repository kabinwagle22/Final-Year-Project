import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, ClipboardCheck, CheckCircle2 } from 'lucide-react';

const AssessmentForm = ({ onComplete, onBack }) => {
    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState({});
    const [validFields, setValidFields] = useState({}); // Tracks green checkmarks
    const [formData, setFormData] = useState({
      age: '', sex: '', cp: '0', trestbps: '', chol: '', 
      fbs: '0', restecg: '0', thalach: '', exang: '0', 
      oldpeak: '0', slope: '1', ca: '0', thal: '1'
    });
  
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
      
        // --- REAL-TIME VALIDATION FOR CHECKMARKS ---
        let isValid = false;
        if (name === 'age') isValid = value >= 1 && value <= 110;
        if (name === 'trestbps') isValid = value >= 60 && value <= 250;
        if (name === 'chol') isValid = value >= 100 && value <= 600;
        if (name === 'thalach') isValid = value >= 50 && value <= 220;
        if (name === 'sex') isValid = value !== "";
      
        setValidFields((prev) => ({ ...prev, [name]: isValid }));
      
        if (errors[name]) {
          setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    // --- NEW: FORMATTER FOR BACKEND SYNC ---
    const handleFinalSubmit = () => {
        // We map the object keys to the exact indices the Heart Disease model expects
        const featureArray = [
            Number(formData.age),      // index 0
            Number(formData.sex),      // index 1
            Number(formData.cp),       // index 2
            Number(formData.trestbps), // index 3
            Number(formData.chol),     // index 4
            Number(formData.fbs),      // index 5
            Number(formData.restecg),  // index 6
            Number(formData.thalach),  // index 7
            Number(formData.exang),    // index 8
            Number(formData.oldpeak),  // index 9
            Number(formData.slope),    // index 10
            Number(formData.ca),       // index 11
            Number(formData.thal)      // index 12
        ];
        
        onComplete(featureArray);
    };
  
    const handleNext = () => {
        let newErrors = {};
        
        if (step === 1) {
          if (!formData.age) newErrors.age = "Age is required";
          else if (formData.age < 1 || formData.age > 110) newErrors.age = "Range: 1-110";
          if (!formData.sex) newErrors.sex = "Required";
        }
    
        if (step === 2) {
          if (!formData.trestbps || formData.trestbps < 60 || formData.trestbps > 250) newErrors.trestbps = "Range: 60-250";
          if (!formData.chol || formData.chol < 100 || formData.chol > 600) newErrors.chol = "Range: 100-600";
          if (!formData.thalach || formData.thalach < 50 || formData.thalach > 220) newErrors.thalach = "Range: 50-220";
        }
    
        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          return;
        }
    
        setErrors({});
        setStep(step + 1);
    };
  
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-3xl shadow-xl border border-slate-100">
        <button onClick={onBack} className="text-slate-400 mb-4 hover:text-blue-600 transition">← Cancel</button>
        
        <div className="mb-8">
          <p className="text-blue-600 font-bold">Step {step} of 3</p>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2">
            <div className="bg-blue-600 h-full rounded-full transition-all" style={{width: `${(step/3)*100}%`}}></div>
          </div>
        </div>
  
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-bold mb-4 text-slate-900">Personal Metrics</h2>
              
              <label className="block text-sm font-medium text-slate-700">Age</label>
              <div className="relative mb-4">
                <input 
                  name="age" type="number" value={formData.age} onChange={handleChange} 
                  className={`w-full p-3 border rounded-xl transition-all ${errors.age ? 'border-red-500 bg-red-50' : validFields.age ? 'border-green-500 bg-green-50' : 'border-slate-200'}`}
                  placeholder="e.g. 45"
                />
                {validFields.age && <CheckCircle2 size={18} className="absolute right-3 top-3.5 text-green-500 animate-in zoom-in" />}
              </div>
              {errors.age && <p className="text-red-500 text-xs mb-4 font-bold">⚠ {errors.age}</p>}
  
              <label className="block text-sm font-medium text-slate-700 mt-4">Sex (1=M, 0=F)</label>
              <div className="relative">
                <select 
                    name="sex" value={formData.sex} onChange={handleChange} 
                    className={`w-full p-3 border rounded-xl transition-all ${errors.sex ? 'border-red-500 bg-red-50' : validFields.sex ? 'border-green-500 bg-green-50' : 'border-slate-200'}`}
                >
                    <option value="">Select</option>
                    <option value="1">Male</option>
                    <option value="0">Female</option>
                </select>
                {validFields.sex && <CheckCircle2 size={18} className="absolute right-8 top-3.5 text-green-500 animate-in zoom-in" />}
              </div>
              {errors.sex && <p className="text-red-500 text-xs mt-1 font-bold">⚠ {errors.sex}</p>}
            </div>
          )}
  
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-bold mb-4 text-slate-900">Clinical Data</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="text-xs font-bold uppercase text-slate-500">Resting BP</label>
                  <input 
                    name="trestbps" type="number" value={formData.trestbps} onChange={handleChange} 
                    className={`w-full p-3 border rounded-xl ${errors.trestbps ? 'border-red-500 bg-red-50' : validFields.trestbps ? 'border-green-500 bg-green-50' : 'border-slate-200'}`} 
                  />
                  {validFields.trestbps && <CheckCircle2 size={16} className="absolute right-3 top-9 text-green-500 animate-in zoom-in" />}
                  {errors.trestbps && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.trestbps}</p>}
                </div>
                <div className="relative">
                  <label className="text-xs font-bold uppercase text-slate-500">Cholesterol</label>
                  <input 
                    name="chol" type="number" value={formData.chol} onChange={handleChange} 
                    className={`w-full p-3 border rounded-xl ${errors.chol ? 'border-red-500 bg-red-50' : validFields.chol ? 'border-green-500 bg-green-50' : 'border-slate-200'}`} 
                  />
                  {validFields.chol && <CheckCircle2 size={16} className="absolute right-3 top-9 text-green-500 animate-in zoom-in" />}
                  {errors.chol && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.chol}</p>}
                </div>
              </div>
              
              <label className="block text-sm font-medium mt-6 text-slate-700">Max Heart Rate (thalach)</label>
              <div className="relative">
                <input 
                    name="thalach" type="number" value={formData.thalach} onChange={handleChange} 
                    className={`w-full p-3 border rounded-xl ${errors.thalach ? 'border-red-500 bg-red-50' : validFields.thalach ? 'border-green-500 bg-green-50' : 'border-slate-200'}`} 
                />
                {validFields.thalach && <CheckCircle2 size={18} className="absolute right-3 top-3.5 text-green-500 animate-in zoom-in" />}
              </div>
              {errors.thalach && <p className="text-red-500 text-xs mt-1 font-bold">⚠ {errors.thalach}</p>}
            </div>
          )}
  
          {step === 3 && (
            <div className="text-center py-10 animate-in fade-in zoom-in duration-500">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25"></div>
                    <ClipboardCheck size={80} className="relative text-green-500 mb-4 mx-auto" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Metrics Validated!</h2>
                <p className="text-slate-500 mb-8 max-w-xs mx-auto">All data is within clinical ranges. Ready for analysis.</p>
                <button 
                    type="button" 
                    onClick={handleFinalSubmit}
                    className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 shadow-2xl transition-all transform hover:scale-[1.02] active:scale-95"
                >
                    Run Diagnostic Report
                </button>
            </div>
          )}
  
          <div className="flex justify-between mt-8">
            {step > 1 && <button type="button" onClick={() => setStep(step-1)} className="text-slate-400 hover:text-slate-900 font-bold transition-colors">Back</button>}
            {step < 3 && <button type="button" onClick={handleNext} className="ml-auto bg-slate-900 text-white px-10 py-3 rounded-xl font-bold hover:shadow-lg transition-all">Next</button>}
          </div>
        </form>
      </div>
    );
};

export default AssessmentForm;