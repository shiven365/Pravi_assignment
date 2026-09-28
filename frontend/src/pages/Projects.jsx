import React from 'react';
import { useAppContext } from '../context/AppContext';
import { PieChart, TrendingUp, AlertTriangle, Link as LinkIcon, DollarSign, Activity, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Projects() {
  const { projects, assets } = useAppContext();
  
  // Calculate aggregate analytics
  const projectsList = Object.values(projects);
  const totalBudget = projectsList.reduce((acc, p) => acc + p.budget, 0);
  const totalSpent = projectsList.reduce((acc, p) => acc + p.spent, 0);
  const remainingBudget = totalBudget - totalSpent;
  
  const overallProgress = projectsList.reduce((acc, p) => acc + p.progress, 0) / projectsList.length;
  const overallBudgetUtilized = (totalSpent / totalBudget) * 100;
  
  // Rough mock calculation for Maintenance Spend across all lifecycle events
  const maintenanceSpend = '₹2.45 Cr';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Budget & Project Analytics</h1>
          <p className="text-slate-600">Track financial utilization, project progress, and detect budget anomalies.</p>
        </div>
      </div>

      {/* Top KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Allocated Budget", value: `₹${totalBudget.toLocaleString()} Cr`, icon: DollarSign, color: "text-blue-600", bg: "bg-blue-100" },
          { title: "Amount Utilized", value: `₹${totalSpent.toLocaleString()} Cr`, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-100", sub: `${overallBudgetUtilized.toFixed(1)}% Used` },
          { title: "Remaining Budget", value: `₹${remainingBudget.toLocaleString()} Cr`, icon: PieChart, color: "text-emerald-600", bg: "bg-emerald-100" },
          { title: "Maintenance Expenditure", value: maintenanceSpend, icon: Wrench, color: "text-purple-600", bg: "bg-purple-100", sub: "Active Assets" },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className={`w-10 h-10 rounded-lg ${kpi.bg} flex items-center justify-center mb-4`}>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">{kpi.title}</h3>
            <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
            {kpi.sub && <p className="text-xs font-semibold text-slate-500 mt-1">{kpi.sub}</p>}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" /> Project Portfolio
        </h2>
        
        <div className="space-y-8">
          {projectsList.map((proj) => {
            const budgetUsedPercent = (proj.spent / proj.budget) * 100;
            const hasAnomaly = budgetUsedPercent > (proj.progress + 20);

            return (
              <div key={proj.id} className="border border-slate-200 rounded-xl p-6 relative overflow-hidden transition-all hover:border-blue-300 hover:shadow-md">
                {hasAnomaly && (
                  <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg shadow-sm flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Budget Anomaly
                  </div>
                )}
                
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                  
                  {/* Left: Info & Assets */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{proj.sector}</span>
                        <span className="text-xs font-mono text-slate-500">{proj.id}</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">{proj.name}</h3>
                      <p className="text-sm text-slate-500">{proj.state} • Expected: {proj.dates.expectedCompletion}</p>
                    </div>

                    <div className="pt-2">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <LinkIcon className="w-3 h-3" /> Assets Created
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {proj.assetsCreated.map(assetId => (
                          <Link 
                            key={assetId} 
                            to={`/assets/${assetId}`}
                            className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded transition-colors"
                          >
                            {assets[assetId]?.name || assetId}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Progress & Budget Analytics */}
                  <div className="w-full md:w-96 space-y-5 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    
                    {/* Completion Progress */}
                    <div>
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-xs font-semibold text-slate-700">Project Completion</span>
                        <span className="text-sm font-bold text-slate-900">{proj.progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                          style={{ width: `${proj.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Budget Progress */}
                    <div>
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-xs font-semibold text-slate-700">Budget Utilized (₹{proj.budget} Cr)</span>
                        <span className={`text-sm font-bold ${hasAnomaly ? 'text-rose-600' : 'text-slate-900'}`}>
                          {budgetUsedPercent.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${hasAnomaly ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${budgetUsedPercent}%` }}
                        ></div>
                      </div>
                      
                      {/* Anomaly Explanation */}
                      {hasAnomaly && (
                        <p className="text-[10px] font-semibold text-rose-600 mt-2 bg-rose-50 p-2 rounded border border-rose-100">
                          Warning: Budget utilization ({budgetUsedPercent.toFixed(0)}%) significantly exceeds physical progress ({proj.progress}%). Audit recommended.
                        </p>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
