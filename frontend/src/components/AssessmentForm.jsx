import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, ClipboardCheck } from 'lucide-react';

const AssessmentForm = ({ onComplete, onBack }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: '', sex: '', cp: '0', trestbps: '', chol: '', 
    fbs: '0', restecg: '0', thalach: '', exang: '0', 
    oldpeak: '0', slope: '1', ca: '0', thal: '1'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

      <form className="space-y-4">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold mb-4">Personal Metrics</h2>
            <label className="block text-sm font-medium">Age</label>
            <input name="age" type="number" onChange={handleChange} className="w-full p-3 border rounded-xl mb-4" />
            <label className="block text-sm font-medium">Sex (1=M, 0=F)</label>
            <select name="sex" onChange={handleChange} className="w-full p-3 border rounded-xl">
              <option value="">Select</option>
              <option value="1">Male</option>
              <option value="0">Female</option>
            </select>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold mb-4">Clinical Data</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Resting BP</label>
                <input name="trestbps" type="number" onChange={handleChange} className="w-full p-3 border rounded-xl" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Cholesterol</label>
                <input name="chol" type="number" onChange={handleChange} className="w-full p-3 border rounded-xl" />
              </div>
            </div>
            <label className="block text-sm font-medium mt-4">Max Heart Rate (thalach)</label>
            <input name="thalach" type="number" onChange={handleChange} className="w-full p-3 border rounded-xl" />
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-6 animate-in zoom-in">
            <ClipboardCheck size={60} className="mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold">Ready to Predict</h2>
            <p className="text-slate-500 mb-6">Note: Missing fields will default to 0 for this demo.</p>
            <button 
              type="button" 
              onClick={() => onComplete(formData)}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700"
            >
              Analyze My Risk
            </button>
          </div>
        )}

        <div className="flex justify-between mt-8">
          {step > 1 && <button type="button" onClick={() => setStep(step-1)} className="text-slate-500 font-bold">Back</button>}
          {step < 3 && <button type="button" onClick={() => setStep(step+1)} className="ml-auto bg-slate-900 text-white px-8 py-2 rounded-xl font-bold">Next</button>}
        </div>
      </form>
    </div>
  );
};

export default AssessmentForm;