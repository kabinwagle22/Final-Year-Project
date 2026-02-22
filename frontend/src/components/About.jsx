import React from 'react';
import { BookOpen, Zap, Shield } from 'lucide-react';

const About = () => {
  return (
    <section id="about" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Why Early Detection Matters</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Heart disease isn't just for older generations. We help those under 35 track 
            indicators before they become symptoms.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BookOpen size={30} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-800">13 Key Metrics</h3>
            <p className="text-slate-600 leading-relaxed">
              We analyze blood pressure, cholesterol, and lifestyle habits to get a full picture.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Zap size={30} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-800">AI-Powered</h3>
            <p className="text-slate-600 leading-relaxed">
              Our Random Forest model provides a risk percentage based on clinical research.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield size={30} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-800">Private & Secure</h3>
            <p className="text-slate-600 leading-relaxed">
              Your health data is encrypted and never shared without your explicit consent.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;