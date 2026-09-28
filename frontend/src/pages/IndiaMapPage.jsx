import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, CheckCircle2, TrendingUp, MapPin } from 'lucide-react';
import { scaleLinear } from 'd3-scale';
import IndiaMapData from '@svg-maps/india';

export default function IndiaMapPage() {
  const [selectedState, setSelectedState] = useState(null);
  const [dbProjects, setDbProjects] = useState([]);
  const [dbAssets, setDbAssets] = useState([]);
  const [tooltipContent, setTooltipContent] = useState("");

  useEffect(() => {
    fetch('https://pravi-assignment.onrender.com/api/public/projects')
      .then(res => res.json())
      .then(setDbProjects)
      .catch(console.error);

    fetch('https://pravi-assignment.onrender.com/api/public/assets')
      .then(res => res.json())
      .then(setDbAssets)
      .catch(console.error);
  }, []);

  const stateProjects = selectedState ? dbProjects.filter(p => p.state_name?.toLowerCase() === selectedState.toLowerCase()) : [];
  const stateAssets = selectedState ? dbAssets.filter(a => a.state_name?.toLowerCase() === selectedState.toLowerCase()) : [];

  const totalBudget = stateProjects.reduce((acc, p) => acc + (p.budget || 0), 0);
  const totalSpent = stateProjects.reduce((acc, p) => acc + (p.spent || 0), 0);
  const activeProjects = stateProjects.filter(p => p.status !== 'Completed').length;
  
  const stateBudgets = {};
  dbProjects.forEach(p => {
    if (p.state_name) {
      stateBudgets[p.state_name] = (stateBudgets[p.state_name] || 0) + (p.budget || 0);
    }
  });
  
  const maxBudget = Math.max(...Object.values(stateBudgets), 1);
  const colorScale = scaleLinear().domain([0, maxBudget]).range(["#e0e7ff", "#1d4ed8"]);

  const handleStateClick = (stateName) => {
    if (stateName) setSelectedState(stateName);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">National Infrastructure Map</h1>
        <p className="text-slate-600 mb-8">
          Interactive geographical overview. Select any state on the map to view its localized infrastructure projects, asset health, and budget utilization.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* MAP SECTION */}
          <div className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden relative flex flex-col p-6 min-h-[500px]">
            <div className="flex justify-between items-start w-full mb-8 absolute top-4 left-4 right-4 z-10 pointer-events-none">
              <div className="bg-white/90 backdrop-blur p-3 rounded-lg border border-slate-200 shadow-sm pointer-events-auto">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Budget Heatmap</h3>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span>Low</span>
                  <div className="w-24 h-2 bg-gradient-to-r from-indigo-100 to-blue-700 rounded-full"></div>
                  <span>High</span>
                </div>
              </div>
              {tooltipContent && (
                <div className="bg-slate-900 text-white px-4 py-2 rounded shadow-lg text-sm font-bold animate-in fade-in zoom-in-95 pointer-events-none">
                  {tooltipContent}
                </div>
              )}
            </div>

            <div className="flex-1 flex items-center justify-center mt-12 overflow-visible">
              <svg 
                viewBox={IndiaMapData.viewBox} 
                className="w-full h-full max-h-[600px] drop-shadow-md"
                aria-label={IndiaMapData.label}
              >
                {IndiaMapData.locations.map(location => {
                  let stateName = location.name;
                  if (stateName === "Odisha (Orissa)") stateName = "Odisha";
                  if (stateName === "Uttarakhand (Uttaranchal)") stateName = "Uttarakhand";
                  
                  const budget = stateBudgets[stateName] || 0;
                  const isSelected = selectedState === stateName;

                  return (
                    <path
                      key={location.id}
                      id={location.id}
                      name={location.name}
                      d={location.path}
                      onClick={() => handleStateClick(stateName)}
                      onMouseEnter={() => setTooltipContent(`${stateName} (₹${budget.toLocaleString()} Cr)`)}
                      onMouseLeave={() => setTooltipContent("")}
                      className="cursor-pointer transition-colors duration-200"
                      style={{
                        fill: isSelected ? "#f59e0b" : budget > 0 ? colorScale(budget) : "#f1f5f9",
                        stroke: isSelected ? "#fff" : "#cbd5e1",
                        strokeWidth: isSelected ? 2 : 1,
                        outline: "none"
                      }}
                    />
                  );
                })}
              </svg>
            </div>
          </div>

          {/* SIDE PANEL INFO */}
          <div className="flex flex-col gap-4">
            {!selectedState ? (
              <div className="flex-1 bg-white border border-slate-200 border-dashed rounded-xl flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <MapPin className="w-12 h-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-700 mb-2">No State Selected</h3>
                <p className="text-sm">Click on any state on the map to view its detailed infrastructure analytics.</p>
              </div>
            ) : (
              <>
                <div className="bg-blue-700 text-white rounded-xl p-6 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl opacity-10 -mr-10 -mt-10"></div>
                  <h2 className="text-2xl font-extrabold mb-1 relative z-10">{selectedState}</h2>
                  <p className="text-blue-200 text-sm font-medium relative z-10">State Infrastructure Overview</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-blue-500">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Budget</p>
                    <p className="text-xl font-bold text-slate-900">₹{totalBudget.toLocaleString()} Cr</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Utilized</p>
                    <p className="text-xl font-bold text-emerald-600">₹{totalSpent.toLocaleString()} Cr</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-amber-500">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Active Projects</p>
                    <p className="text-xl font-bold text-amber-600">{activeProjects}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-indigo-500">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Monitored Assets</p>
                    <p className="text-xl font-bold text-indigo-600">{stateAssets.length}</p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                  {/* Projects List */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col min-h-[200px]">
                    <div className="p-3 border-b border-slate-100 bg-slate-50">
                      <h3 className="font-bold text-slate-900 text-sm">Active Projects</h3>
                    </div>
                    <div className="overflow-y-auto p-3 flex-1 space-y-2">
                      {stateProjects.filter(p => p.status !== 'Completed').length > 0 ? stateProjects.filter(p => p.status !== 'Completed').map(proj => (
                        <Link key={proj.id} to={`/projects/${proj.id}`} className="block border border-slate-100 p-2 rounded-lg hover:bg-slate-50 hover:border-blue-300 transition-all group">
                          <h4 className="font-semibold text-xs text-slate-900 leading-tight mb-1 group-hover:text-blue-700">{proj.name}</h4>
                          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded">{proj.sector}</span>
                            <span className="text-blue-600">{proj.status}</span>
                          </div>
                        </Link>
                      )) : (
                        <p className="text-center text-slate-400 text-xs py-4">No active projects.</p>
                      )}
                    </div>
                  </div>

                  {/* Assets List */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col min-h-[200px]">
                    <div className="p-3 border-b border-slate-100 bg-slate-50">
                      <h3 className="font-bold text-slate-900 text-sm">Monitored Assets (Completed)</h3>
                    </div>
                    <div className="overflow-y-auto p-3 flex-1 space-y-2">
                      {stateAssets.length > 0 ? stateAssets.map(asset => (
                        <div key={asset.id} className="border border-slate-100 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                          <h4 className="font-semibold text-xs text-slate-900 leading-tight mb-1">{asset.name}</h4>
                          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded">{asset.type}</span>
                            <span className={asset.health_score >= 70 ? 'text-emerald-600' : 'text-amber-600'}>Health: {asset.health_score}/100</span>
                          </div>
                        </div>
                      )) : (
                        <p className="text-center text-slate-400 text-xs py-4">No monitored assets.</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
