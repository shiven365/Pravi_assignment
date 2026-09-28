import React, { useState, useEffect } from 'react';
import { ArrowRight, Activity, TrendingUp, AlertTriangle, CheckCircle2, Zap, Droplets, MapPin, Truck, Filter } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function Home() {
  const { updates } = useAppContext();
  const navigate = useNavigate();
  
  const [dbProjects, setDbProjects] = useState([]);
  const [dbAssets, setDbAssets] = useState([]);
  
  const [filterState, setFilterState] = useState('All');
  const [filterSector, setFilterSector] = useState('All');

  useEffect(() => {
    fetch('https://pravi-assignment.onrender.com/api/public/projects')
      .then(res => res.json())
      .then(data => setDbProjects(data))
      .catch(console.error);

    fetch('https://pravi-assignment.onrender.com/api/public/assets')
      .then(res => res.json())
      .then(data => setDbAssets(data))
      .catch(console.error);
  }, []);

  const displayedProjects = dbProjects.filter(p => (filterSector === 'All' || p.sector === filterSector) && (filterState === 'All' || p.state_name === filterState));
  const displayedAssets = dbAssets.filter(a => (filterSector === 'All' || a.sector === filterSector) && (filterState === 'All' || a.state_name === filterState));

  const totalBudget = displayedProjects.reduce((acc, p) => acc + (p.budget || 0), 0);
  const totalSpent = displayedProjects.reduce((acc, p) => acc + (p.spent || 0), 0);
  const remainingBudget = totalBudget - totalSpent;
  const percentUsed = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0;
  
  const activeProjectsCount = displayedProjects.filter(p => p.status !== 'Completed').length;
  const commissionedAssetsCount = displayedAssets.filter(a => a.status === 'Commissioned').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-60"></div>
        <div className="p-8 md:p-12 relative z-10">
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">
            Infrastructure Asset <br className="hidden md:block"/>
            <span className="text-blue-700">Analytics & Budget</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mb-8 leading-relaxed">
            Monitor government spending, track project progress, and explore the lifecycle of public infrastructure across all states and sectors.
          </p>
          
          {/* Quick Filters */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 inline-flex flex-wrap gap-4 items-center shadow-inner">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-semibold text-slate-700">State:</span>
              <select 
                value={filterState} onChange={e => setFilterState(e.target.value)}
                className="bg-white border border-slate-300 text-slate-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 w-48 shadow-sm">
                <option value="All">All India</option>
                {[...new Set(dbProjects.map(p => p.state_name))].filter(Boolean).sort().map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <Filter className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-semibold text-slate-700">Sector:</span>
              <select 
                value={filterSector} onChange={e => setFilterSector(e.target.value)}
                className="bg-white border border-slate-300 text-slate-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 w-40 shadow-sm">
                <option value="All">All Sectors</option>
                <option value="Transportation">Transportation</option>
                <option value="Water">Water</option>
                <option value="Energy">Energy</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Budget KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
          <h3 className="text-slate-500 text-[10px] uppercase tracking-wider font-bold mb-1">Total Allocated</h3>
          <p className="text-2xl font-bold text-slate-900 mb-1">₹{totalBudget.toLocaleString()} Cr</p>
          <p className="text-xs text-slate-500 font-medium">For {displayedProjects.length} Projects</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow border-l-4 border-l-amber-500">
          <h3 className="text-slate-500 text-[10px] uppercase tracking-wider font-bold mb-1">Amount Utilized</h3>
          <p className="text-2xl font-bold text-amber-600 mb-1">₹{totalSpent.toLocaleString()} Cr</p>
          <p className="text-xs text-slate-500 font-medium">Spent to date</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow border-l-4 border-l-emerald-500">
          <h3 className="text-slate-500 text-[10px] uppercase tracking-wider font-bold mb-1">Remaining Budget</h3>
          <p className="text-2xl font-bold text-emerald-600 mb-1">₹{remainingBudget.toLocaleString()} Cr</p>
          <p className="text-xs text-slate-500 font-medium">Available for completion</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-slate-100">
            <div className="absolute bottom-0 w-full bg-blue-500 transition-all duration-1000" style={{height: `${Math.min(percentUsed, 100)}%`}}></div>
          </div>
          <h3 className="text-slate-500 text-[10px] uppercase tracking-wider font-bold mb-1">Utilization</h3>
          <p className="text-2xl font-bold text-blue-600 mb-1">{percentUsed}%</p>
          <p className="text-xs text-slate-500 font-medium">Of allocated funds</p>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-bold text-slate-900">Public Projects Ledger</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Name</th>
                <th className="py-3 px-4 font-semibold">State</th>
                <th className="py-3 px-4 font-semibold">Sector</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedProjects.map((proj) => (
                <tr 
                  key={proj.id} 
                  onClick={() => navigate(`/projects/${proj.id}`)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4 font-medium text-slate-900 group-hover:text-blue-700">{proj.name}</td>
                  <td className="py-3 px-4 text-slate-600">{proj.state_name}</td>
                  <td className="py-3 px-4 text-slate-600">{proj.sector}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${proj.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                      {proj.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-slate-200 rounded-full h-1.5 w-16">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${proj.progress}%` }}></div>
                      </div>
                      <span className="text-xs">{proj.progress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              {displayedProjects.length === 0 && (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500">No projects found for the selected criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-bold text-slate-900">Public Assets Registry</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Name</th>
                <th className="py-3 px-4 font-semibold">State</th>
                <th className="py-3 px-4 font-semibold">Sector</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Health Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900">{asset.name}</td>
                  <td className="py-3 px-4 text-slate-600">{asset.state_name}</td>
                  <td className="py-3 px-4 text-slate-600">{asset.sector}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${asset.status === 'Commissioned' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-mono">{asset.health_score}/100</td>
                </tr>
              ))}
              {displayedAssets.length === 0 && (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500">No assets found for the selected criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
