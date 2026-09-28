import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Key, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password'); // Demo default
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await login(email, password);
      if (user.role === 'CENTRAL_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/admin'); // MVP routes all admins to the unified dashboard, which restricts view
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] animate-in fade-in">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          
          <div className="bg-slate-900 p-8 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
            <Shield className="w-12 h-12 mx-auto mb-4 text-blue-400" />
            <h1 className="text-2xl font-bold tracking-tight">Authority Login</h1>
            <p className="text-slate-400 text-sm mt-2">Access GovInfra360 Administrative Portal</p>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg flex items-start gap-2 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Authority Email</label>
                <input 
                  type="email" required
                  className="w-full border border-slate-300 rounded-lg text-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
                  placeholder="e.g. central@govinfra.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Password</label>
                <input 
                  type="password" required
                  className="w-full border border-slate-300 rounded-lg text-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button 
                type="submit" disabled={loading}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 mt-4"
              >
                {loading ? 'Authenticating...' : <><Key className="w-4 h-4" /> Secure Login</>}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
