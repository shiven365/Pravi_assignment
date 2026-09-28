import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Activity, MapPin, Calendar as CalendarIcon, Briefcase, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8000/api/public/projects/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Project not found');
        return res.json();
      })
      .then(data => {
        setProject(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Project Not Found</h2>
        <p className="text-slate-600 mb-6">The project you are looking for does not exist or has been archived.</p>
        <Link to="/public" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const percentUsed = project.budget > 0 ? ((project.spent / project.budget) * 100).toFixed(1) : 0;
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <Link to="/public" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-blue-100 text-blue-700 font-bold uppercase tracking-wider text-xs px-2.5 py-1 rounded">
                  {project.sector}
                </span>
                <span className={`font-bold uppercase tracking-wider text-xs px-2.5 py-1 rounded ${project.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : project.status === 'Delayed' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                  {project.status}
                </span>
                <span className="text-slate-400 font-mono text-sm border-l border-slate-300 pl-3">
                  {project.id}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                {project.name}
              </h1>
              <p className="flex items-center gap-2 text-slate-500 font-medium">
                <MapPin className="w-4 h-4" /> {project.state_name} Region
              </p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 min-w-[200px] flex-shrink-0">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">Project Progress</h3>
              <div className="flex items-end justify-center gap-1 mb-2">
                <span className="text-4xl font-extrabold text-slate-900 leading-none">{project.progress}</span>
                <span className="text-lg font-bold text-slate-500 mb-1">%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all duration-1000" style={{ width: `${project.progress}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial & Timeline Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" /> Financial Overview
          </h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-semibold text-slate-600">Total Allocated Budget</span>
                <span className="text-xl font-bold text-slate-900">₹{project.budget?.toLocaleString()} Cr</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-semibold text-slate-600">Amount Spent</span>
                <span className="text-xl font-bold text-emerald-600">₹{project.spent?.toLocaleString()} Cr</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.min(percentUsed, 100)}%` }}></div>
              </div>
              <p className="text-xs text-slate-500 mt-2 text-right">{percentUsed}% of budget utilized</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" /> Timeline
          </h2>
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-200">
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-blue-100 text-blue-600 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Start Date</p>
                <p className="font-semibold text-slate-900">
                  {new Date(project.start_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-amber-100 text-amber-600 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10">
                <Activity className="w-4 h-4" />
              </div>
              <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Expected Completion</p>
                <p className="font-semibold text-slate-900">
                  {new Date(project.expected_completion).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
