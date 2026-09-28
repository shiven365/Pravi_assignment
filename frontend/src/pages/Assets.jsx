import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Activity, Droplets, Zap, Truck, AlertTriangle } from 'lucide-react';

// Demo data
const assetsData = [
  { id: 'AST-2024-001', name: 'Mumbai Coastal Road Phase 1', type: 'Highway', sector: 'Transportation', health: 92, status: 'Commissioned' },
  { id: 'AST-2024-042', name: 'Narmada Main Canal Pump 4', type: 'Water Pump', sector: 'Water', health: 45, status: 'Maintenance Required' },
  { id: 'AST-2024-108', name: 'Kutch Solar Grid Substation A', type: 'Transformer', sector: 'Energy', health: 78, status: 'Commissioned' },
  { id: 'AST-2024-211', name: 'Pune BRTS Corridor 2', type: 'Road', sector: 'Transportation', health: 85, status: 'Commissioned' },
  { id: 'AST-2024-304', name: 'Bangalore East Streetlights', type: 'Streetlight', sector: 'Energy', health: 32, status: 'Critical' },
];

const getHealthColor = (score) => {
  if (score >= 80) return 'text-emerald-700 bg-emerald-100';
  if (score >= 60) return 'text-blue-700 bg-blue-100';
  if (score >= 40) return 'text-amber-700 bg-amber-100';
  return 'text-rose-700 bg-rose-100';
};

const getSectorIcon = (sector) => {
  if (sector === 'Transportation') return <Truck className="w-4 h-4" />;
  if (sector === 'Water') return <Droplets className="w-4 h-4" />;
  if (sector === 'Energy') return <Zap className="w-4 h-4" />;
  return <Activity className="w-4 h-4" />;
};

export default function Assets() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSector, setFilterSector] = useState('All');

  const filteredAssets = assetsData.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || asset.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = filterSector === 'All' || asset.sector === filterSector;
    return matchesSearch && matchesSector;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Infrastructure Asset Registry</h1>
          <p className="text-sm text-slate-500">Browse and manage all physical public infrastructure assets.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search by Asset ID or Name..." 
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-auto flex items-center gap-2">
            <Filter className="text-slate-400 w-4 h-4" />
            <select 
              className="border border-slate-300 rounded-md text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
            >
              <option value="All">All Sectors</option>
              <option value="Transportation">Transportation</option>
              <option value="Water">Water</option>
              <option value="Energy">Energy</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Asset ID</th>
                <th className="py-3 px-4">Asset Name</th>
                <th className="py-3 px-4">Sector & Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Health Score</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">{asset.id}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{asset.name}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      {getSectorIcon(asset.sector)}
                      <span>{asset.sector} - {asset.type}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-700 rounded border border-slate-200">
                      {asset.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${getHealthColor(asset.health)}`}>
                        {asset.health} / 100
                      </span>
                      {asset.health < 40 && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link to={`/assets/${asset.id}`} className="text-blue-700 hover:text-blue-800 font-semibold text-xs border border-blue-200 bg-blue-50 px-3 py-1.5 rounded transition-colors inline-block">
                      View Passport
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredAssets.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">No assets found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
