import React, { useState, useEffect } from 'react';
import { Megaphone, MapPin, Calendar, Activity } from 'lucide-react';

export default function Updates() {
  const [latestProjects, setLatestProjects] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/public/projects')
      .then(res => res.json())
      .then(data => {
        // Sort by start_date descending (newest first), fallback to ID for deterministic ordering
        const sorted = data.sort((a, b) => new Date(b.start_date) - new Date(a.start_date) || b.id.localeCompare(a.id));
        setLatestProjects(sorted.slice(0, 10)); // Take top 10
      })
      .catch(console.error);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-3">
          <Megaphone className="w-8 h-8 text-blue-600" />
          Recently Declared Projects
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Stay up to date with the latest infrastructure developments across the country. Here are the 10 most recently announced government projects.
        </p>
      </div>

      <div className="space-y-4">
        {latestProjects.map((proj, idx) => (
          <div key={proj.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow relative">
            {idx === 0 && (
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg">
                Newest
              </div>
            )}
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-slate-900">{proj.name}</h3>
                <span className="font-mono text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                  {proj.id}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  {proj.state_name} ({proj.sector})
                </div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  Budget: ₹{proj.budget.toLocaleString()} Cr
                </div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  Started: {formatDate(proj.start_date)}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                  proj.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                  proj.status === 'New' ? 'bg-blue-100 text-blue-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {proj.status}
                </span>
                <span className="text-sm font-medium text-slate-500">
                  Target Completion: {formatDate(proj.expected_completion)}
                </span>
              </div>
            </div>
          </div>
        ))}

        {latestProjects.length === 0 && (
          <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            Loading recent projects...
          </div>
        )}
      </div>
    </div>
  );
}
