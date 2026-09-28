import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Calendar, AlertCircle, Clock, X, Database, Edit, Filter, Shield, LogOut } from 'lucide-react';

export default function Admin() {
  const { assets, rescheduleInspection, notifications, updateAsset, updateProject } = useAppContext();
  const { user, token, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('inspections'); // 'inspections' or 'data'
  
  // Backend State
  const [dbProjects, setDbProjects] = useState([]);
  const [dbAssets, setDbAssets] = useState([]);

  // Inspections State
  const [selectedTask, setSelectedTask] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState(''); 

  // Data Management State
  const [filterSector, setFilterSector] = useState('All');
  const [filterState, setFilterState] = useState('All');
  const [editingItem, setEditingItem] = useState(null); // { type: 'asset'|'project', id, data }

  // Fetch data from backend
  useEffect(() => {
    if (token) {
      fetch('https://pravi-assignment.onrender.com/api/admin/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setDbProjects(data))
      .catch(console.error);

      fetch('https://pravi-assignment.onrender.com/api/admin/assets', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setDbAssets(data))
      .catch(console.error);
    }
  }, [token]);

  // --- Logic for Inspections & Notifications ---
  const tasks = dbAssets.map((asset) => {
    if (!asset.next_inspection_date) return null;
    
    const today = new Date();
    const inspectionDate = new Date(asset.next_inspection_date);
    const diffDays = Math.ceil((inspectionDate - today) / (1000 * 60 * 60 * 24));
    
    // Only show in "Action Required" if overdue (diffDays < 0) or upcoming within 90 days
    if (diffDays > 90) return null;
    
    const isOverdue = diffDays < 0;
    return {
      assetId: asset.id, assetName: asset.name, sector: asset.sector,
      currentDate: asset.next_inspection_date, 
      status: isOverdue ? 'pending' : 'upcoming', 
      description: `Routine inspection for ${asset.name}`
    };
  }).filter(Boolean).sort((a, b) => new Date(a.currentDate) - new Date(b.currentDate));

  // Generate Admin Alerts from Live Database
  const liveNotifications = [];
  let noteId = 1;
  dbAssets.forEach(asset => {
    if (asset.health_score < 40) {
      liveNotifications.push({ id: noteId++, message: `CRITICAL ASSET: ${asset.name} health score is ${asset.health_score}`, type: 'error', time: 'Generated' });
    }
    if (asset.next_inspection_date) {
      const today = new Date();
      const inspectionDate = new Date(asset.next_inspection_date);
      const diffDays = Math.ceil((inspectionDate - today) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        liveNotifications.push({ id: noteId++, message: `OVERDUE: Inspection for ${asset.name} was due on ${asset.next_inspection_date}`, type: 'warning', time: 'Generated' });
      }
    }
  });
  dbProjects.forEach(proj => {
    if (proj.status === 'Delayed') {
      liveNotifications.push({ id: noteId++, message: `DELAYED PROJECT: ${proj.name} is behind schedule.`, type: 'warning', time: 'Generated' });
    }
    const spentPercent = proj.budget > 0 ? (proj.spent / proj.budget) * 100 : 0;
    if (spentPercent > proj.progress + 20) {
      liveNotifications.push({ id: noteId++, message: `BUDGET ANOMALY on ${proj.name}: Spent ${spentPercent.toFixed(0)}% but progress is only ${proj.progress}%.`, type: 'error', time: 'Generated' });
    }
  });

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!selectedTask || !newDate || !reason) return;
    
    const today = new Date().toISOString().split('T')[0];
    if (newDate < today) {
      alert("Validation Error: The rescheduled date must be in the future.");
      return;
    }
    
    const fullReason = note ? `${reason} (Note: ${note})` : reason;
    
    try {
      const res = await fetch(`https://pravi-assignment.onrender.com/api/admin/assets/${selectedTask.assetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          next_inspection_date: newDate,
          reason: fullReason
        })
      });
      if (!res.ok) {
        const err = await res.json();
        alert("Error: " + err.detail);
      } else {
        const data = await (await fetch('https://pravi-assignment.onrender.com/api/admin/assets', { headers: { 'Authorization': `Bearer ${token}` } })).json();
        setDbAssets(data);
      }
    } catch(err) {
      alert("Failed to reschedule inspection");
    }
    
    setSelectedTask(null); setNewDate(''); setReason(''); setNote('');
  };

  // --- Logic for Data Management ---
  const filteredAssets = Object.entries(assets).filter(([_, a]) => filterSector === 'All' || a.sector === filterSector);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (editingItem.type === 'asset') {
      try {
        const res = await fetch(`https://pravi-assignment.onrender.com/api/admin/assets/${editingItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            status: editingItem.data.status,
            healthScore: editingItem.data.healthScore || editingItem.data.health_score,
            reason: "Admin asset data update"
          })
        });
        if (!res.ok) {
          const err = await res.json();
          alert("Error: " + err.detail);
        } else {
          const data = await (await fetch('https://pravi-assignment.onrender.com/api/admin/assets', { headers: { 'Authorization': `Bearer ${token}` } })).json();
          setDbAssets(data);
          setEditingItem(null);
        }
      } catch(err) {
        alert("Failed to update asset");
      }
    } else {
      // Update Project on real backend
      try {
        const res = await fetch(`https://pravi-assignment.onrender.com/api/admin/projects/${editingItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            progress: editingItem.data.progress,
            status: editingItem.data.status,
            spent: editingItem.data.spent,
            reason: "Admin data update"
          })
        });
        if (!res.ok) {
          const err = await res.json();
          alert("Error: " + err.detail);
        } else {
          // Refresh projects
          const data = await (await fetch('https://pravi-assignment.onrender.com/api/admin/projects', { headers: { 'Authorization': `Bearer ${token}` } })).json();
          setDbProjects(data);
          setEditingItem(null);
        }
      } catch(err) {
        alert("Failed to update project");
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* UI Authority Indicator */}
      {user && (
        <div className="bg-slate-900 text-white p-4 rounded-xl shadow-lg flex justify-between items-center border border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="bg-slate-800 p-2 rounded-full border border-slate-600">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">{user.name}</h2>
              <p className="text-xs text-blue-300 font-mono mt-0.5">Role: {user.role} | Scope: {user.state_id ? `State ID ${user.state_id}` : 'All India'}</p>
            </div>
          </div>
          <button onClick={logout} className="relative z-10 text-xs font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded text-slate-300 transition-colors flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-slate-500">Manage operations, schedule maintenance, and update system data.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('inspections')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'inspections' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Inspections</div>
          </button>
          <button 
            onClick={() => setActiveTab('data')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'data' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <div className="flex items-center gap-2"><Database className="w-4 h-4" /> Manage Data</div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* TAB 1: INSPECTIONS */}
          {activeTab === 'inspections' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" /> Action Required: Inspections
                </h2>
              </div>
              <div className="divide-y divide-slate-100">
                {tasks.length === 0 && (
                  <div className="p-8 text-center text-slate-500">No pending inspections.</div>
                )}
                {tasks.map((task, idx) => (
                  <div key={idx} className="p-4 md:p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${task.status === 'pending' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                          {task.status === 'pending' ? 'Overdue' : 'Upcoming'}
                        </span>
                        <span className="text-xs font-mono text-slate-500">{task.assetId}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mb-1">{task.assetName}</h3>
                      <p className="text-xs text-slate-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Scheduled: <span className="font-semibold text-slate-900">{task.currentDate}</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setSelectedTask(task)}
                        className="text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 px-4 py-2 rounded shadow-sm transition-colors"
                      >
                        Reschedule
                      </button>
                      <button 
                        onClick={async () => {
                          const nextYear = new Date(task.currentDate);
                          nextYear.setFullYear(nextYear.getFullYear() + 1);
                          const nextStr = nextYear.toISOString().split('T')[0];
                          try {
                            const res = await fetch(`https://pravi-assignment.onrender.com/api/admin/assets/${task.assetId}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                              body: JSON.stringify({ next_inspection_date: nextStr, reason: "Inspection marked completed." })
                            });
                            if (res.ok) {
                              const data = await (await fetch('https://pravi-assignment.onrender.com/api/admin/assets', { headers: { 'Authorization': `Bearer ${token}` } })).json();
                              setDbAssets(data);
                            } else {
                              const err = await res.json(); alert(err.detail);
                            }
                          } catch(err) { alert("Failed to complete inspection"); }
                        }}
                        className="text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded shadow-sm transition-colors">
                        Mark Completed
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: DATA MANAGEMENT */}
          {activeTab === 'data' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="text-slate-400 w-5 h-5" />
                  <span className="text-sm font-semibold text-slate-700">Sector:</span>
                  <select 
                    className="border border-slate-300 rounded-md text-sm p-2 w-40 focus:ring-blue-500 focus:border-blue-500"
                    value={filterSector}
                    onChange={(e) => setFilterSector(e.target.value)}
                  >
                    <option value="All">All Sectors</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Water">Water</option>
                    <option value="Energy">Energy</option>
                  </select>
                </div>
                
                {user && user.role === 'CENTRAL_ADMIN' && (
                  <div className="flex items-center gap-2 ml-4 border-l border-slate-200 pl-4">
                    <span className="text-sm font-semibold text-slate-700">State:</span>
                    <select 
                      className="border border-slate-300 rounded-md text-sm p-2 w-48 focus:ring-blue-500 focus:border-blue-500"
                      value={filterState}
                      onChange={(e) => setFilterState(e.target.value)}
                    >
                      <option value="All">All States</option>
                      {[...new Set(dbProjects.map(p => p.state_name))].filter(Boolean).sort().map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Dynamic Budget Overview */}
              {(() => {
                const displayedProjects = dbProjects.filter(p => (filterSector === 'All' || p.sector === filterSector) && (filterState === 'All' || p.state_name === filterState));
                const totalBudget = displayedProjects.reduce((acc, p) => acc + (p.budget || 0), 0);
                const totalSpent = displayedProjects.reduce((acc, p) => acc + (p.spent || 0), 0);
                const remainingBudget = totalBudget - totalSpent;
                const percentUsed = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0;
                
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-blue-500">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Total Allocated</p>
                      <p className="text-xl font-bold text-slate-900">₹{totalBudget.toLocaleString()} Cr</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-amber-500">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Amount Utilized</p>
                      <p className="text-xl font-bold text-amber-600">₹{totalSpent.toLocaleString()} Cr</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-emerald-500">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Remaining</p>
                      <p className="text-xl font-bold text-emerald-600">₹{remainingBudget.toLocaleString()} Cr</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 flex justify-between">
                        <span>Utilization</span>
                        <span className="text-blue-600">{percentUsed}%</span>
                      </p>
                      <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min(percentUsed, 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Projects Table */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                  <h2 className="font-bold text-slate-900">Projects Data</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-4">ID</th>
                        <th className="py-2 px-4">Name</th>
                        <th className="py-2 px-4">Status</th>
                        <th className="py-2 px-4">Budget</th>
                        <th className="py-2 px-4">Spent</th>
                        <th className="py-2 px-4">Progress</th>
                        <th className="py-2 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dbProjects.filter(p => (filterSector === 'All' || p.sector === filterSector) && (filterState === 'All' || p.state_name === filterState)).map((proj) => (
                        <tr key={proj.id} className="hover:bg-slate-50">
                          <td className="py-2 px-4 font-mono text-xs">{proj.id}</td>
                          <td className="py-2 px-4 font-semibold">{proj.name}</td>
                          <td className="py-2 px-4">{proj.status}</td>
                          <td className="py-2 px-4 text-slate-600 font-mono">₹{proj.budget?.toLocaleString()} Cr</td>
                          <td className="py-2 px-4 text-emerald-600 font-mono">₹{proj.spent?.toLocaleString()} Cr</td>
                          <td className="py-2 px-4">{proj.progress}%</td>
                          <td className="py-2 px-4 text-right">
                            <button onClick={() => setEditingItem({ type: 'project', id: proj.id, data: {...proj} })} className="text-blue-600 hover:text-blue-800 p-1">
                              <Edit className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {dbProjects.length === 0 && <tr><td colSpan="5" className="p-4 text-center text-slate-500">No projects found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Assets Table */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                  <h2 className="font-bold text-slate-900">Assets Data</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-4">ID</th>
                        <th className="py-2 px-4">Name</th>
                        <th className="py-2 px-4">Status</th>
                        <th className="py-2 px-4">Health</th>
                        <th className="py-2 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dbAssets.filter(a => (filterSector === 'All' || a.sector === filterSector) && (filterState === 'All' || a.state_name === filterState)).map((asset) => (
                        <tr key={asset.id} className="hover:bg-slate-50">
                          <td className="py-2 px-4 font-mono text-xs">{asset.id}</td>
                          <td className="py-2 px-4 font-semibold">{asset.name}</td>
                          <td className="py-2 px-4">{asset.status}</td>
                          <td className="py-2 px-4">{asset.health_score}</td>
                          <td className="py-2 px-4 text-right">
                            <button onClick={() => setEditingItem({ type: 'asset', id: asset.id, data: {...asset} })} className="text-blue-600 hover:text-blue-800 p-1">
                              <Edit className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {dbAssets.length === 0 && <tr><td colSpan="5" className="p-4 text-center text-slate-500">No assets found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Notifications */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" /> Admin Alerts
              </h2>
            </div>
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {liveNotifications.map((note) => (
                <div key={note.id} className="p-4 text-sm text-slate-700 bg-blue-50/50">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">{note.time}</span>
                  {note.message}
                </div>
              ))}
              {liveNotifications.length === 0 && (
                <div className="p-4 text-sm text-slate-500 text-center">No recent alerts.</div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* --- MODALS --- */}

      {/* Reschedule Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900">Reschedule Inspection</h3>
              <button onClick={() => setSelectedTask(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleReschedule} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Asset</label>
                <p className="text-sm font-semibold text-slate-900">{selectedTask.assetName}</p>
                <p className="text-xs text-slate-500 mt-1">Current Date: {selectedTask.currentDate}</p>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">New Date</label>
                <input 
                  type="date" required
                  className="w-full border border-slate-300 rounded-md text-sm p-2"
                  value={newDate} onChange={(e) => setNewDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Reason for Delay (Public)</label>
                <select 
                  required
                  className="w-full border border-slate-300 rounded-md text-sm p-2"
                  value={reason} onChange={(e) => setReason(e.target.value)}
                >
                  <option value="">Select a reason...</option>
                  <option value="Adverse weather conditions">Adverse weather conditions</option>
                  <option value="Awaiting budget approval">Awaiting budget approval</option>
                  <option value="Contractor unavailability">Contractor unavailability</option>
                  <option value="Equipment failure">Equipment failure</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Internal Note (Optional)</label>
                <textarea 
                  rows="2" className="w-full border border-slate-300 rounded-md text-sm p-2"
                  placeholder="Additional details..."
                  value={note} onChange={(e) => setNote(e.target.value)}
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setSelectedTask(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded shadow-sm">Confirm & Publish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Data Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900">
                Update {editingItem.type === 'asset' ? 'Asset' : 'Project'}: {editingItem.id}
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Name</label>
                <input 
                  type="text" required
                  className="w-full border border-slate-300 rounded-md text-sm p-2 bg-slate-50"
                  value={editingItem.data.name}
                  onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, name: e.target.value}})}
                />
              </div>

              {editingItem.type === 'project' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Status</label>
                    <select 
                      className="w-full border border-slate-300 rounded-md text-sm p-2"
                      value={editingItem.data.status}
                      onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, status: e.target.value}})}
                    >
                      <option value="New">New</option>
                      <option value="On Track">On Track</option>
                      <option value="Delayed">Delayed</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Progress %</label>
                      <input 
                        type="number" min="0" max="100"
                        className="w-full border border-slate-300 rounded-md text-sm p-2"
                        value={editingItem.data.progress}
                        onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, progress: parseInt(e.target.value)}})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Spent (Cr)</label>
                      <input 
                        type="number"
                        className="w-full border border-slate-300 rounded-md text-sm p-2"
                        value={editingItem.data.spent}
                        onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, spent: parseInt(e.target.value)}})}
                      />
                    </div>
                  </div>
                </>
              )}

              {editingItem.type === 'asset' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Status</label>
                    <select 
                      className="w-full border border-slate-300 rounded-md text-sm p-2"
                      value={editingItem.data.status}
                      onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, status: e.target.value}})}
                    >
                      <option value="Commissioned">Commissioned</option>
                      <option value="Maintenance Required">Maintenance Required</option>
                      <option value="Critical">Critical</option>
                      <option value="Retired">Retired</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Health Score (0-100)</label>
                    <input 
                      type="number" min="0" max="100"
                      className="w-full border border-slate-300 rounded-md text-sm p-2"
                      value={editingItem.data.health_score ?? ''}
                      onChange={(e) => setEditingItem({...editingItem, data: {...editingItem.data, health_score: parseInt(e.target.value)}})}
                    />
                  </div>
                </>
              )}

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingItem(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded shadow-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
