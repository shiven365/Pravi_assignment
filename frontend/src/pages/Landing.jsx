import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Users } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-3xl opacity-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500 rounded-full blur-3xl opacity-10"></div>

      <div className="text-center z-10 mb-12">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-4">
          GovInfra<span className="text-blue-700">360</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
          The National Infrastructure Operating System. Bridging the gap between government administration and citizen transparency.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl z-10">
        
        {/* Authorized Official Button */}
        <button 
          onClick={() => navigate('/login')}
          className="group bg-white p-8 rounded-2xl shadow-xl border border-slate-200 hover:border-blue-500 hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center focus:outline-none focus:ring-4 focus:ring-blue-500/20"
        >
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Authorized Official</h2>
          <p className="text-slate-600">Secure access for Central, State, and Department administrators to manage infrastructure data and budgets.</p>
        </button>

        {/* Citizen Access Button */}
        <button 
          onClick={() => navigate('/public')}
          className="group bg-white p-8 rounded-2xl shadow-xl border border-slate-200 hover:border-emerald-500 hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
        >
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
            <Users className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Citizen Access</h2>
          <p className="text-slate-600">Public transparency portal. View national budgets, track state projects, and monitor the health of public infrastructure.</p>
        </button>

      </div>
      
      <div className="mt-16 text-slate-400 text-sm font-mono z-10">
        v2.0.0 | National Digital Public Infrastructure
      </div>
    </div>
  );
}
