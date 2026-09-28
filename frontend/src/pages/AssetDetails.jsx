import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle, Clock, Hammer, Settings, Wrench, ShieldAlert } from 'lucide-react';

const MOCK_ASSETS = {
  'AST-2024-001': {
    name: 'Mumbai Coastal Road Phase 1',
    type: 'Highway',
    sector: 'Transportation',
    location: 'District: Mumbai, State: Maharashtra',
    cost: '₹12,721 Cr',
    installationDate: '2024-03-10',
    expectedLife: '50 Years',
    healthScore: 92,
    status: 'Commissioned',
    dates: { nextInspection: '2025-03-10', lastMaintenance: '-' },
    events: [
      { stage: 'Procurement', date: '2018-10-01', status: 'completed', description: 'Tender awarded to L&T for Phase 1 construction.', cost: '₹12,721 Cr' },
      { stage: 'Installation', date: '2023-12-15', status: 'completed', description: 'Major structural phase and tunneling completed.', cost: '-' },
      { stage: 'Commissioned', date: '2024-03-10', status: 'completed', description: 'Officially inaugurated and opened for public transport.', cost: '-' },
      { stage: 'Inspection', date: '2025-03-10', status: 'upcoming', description: 'Scheduled annual safety and structural inspection.', cost: 'TBD' }
    ]
  },
  'AST-2024-042': {
    name: 'Narmada Main Canal Pump 4',
    type: 'Water Pump',
    sector: 'Water',
    location: 'District: Kutch, State: Gujarat',
    cost: '₹14.5 Cr',
    installationDate: '2019-11-15',
    expectedLife: '15 Years',
    healthScore: 45,
    status: 'Maintenance Required',
    dates: { nextInspection: '2026-12-01', lastMaintenance: '2024-05-10' },
    events: [
      { stage: 'Procurement', date: '2019-01-10', status: 'completed', description: 'Tender awarded to AquaTech Infra', cost: '₹12.0 Cr' },
      { stage: 'Installation', date: '2019-10-20', status: 'completed', description: 'Pump installation and grid integration completed.', cost: '₹2.5 Cr' },
      { stage: 'Commissioned', date: '2019-11-15', status: 'completed', description: 'Official inauguration and handover to operations.', cost: '-' },
      { stage: 'Inspection', date: '2022-11-15', status: 'completed', description: 'Routine 3-year structural and electrical inspection.', cost: '₹50,000' },
      { stage: 'Maintenance', date: '2024-05-10', status: 'completed', description: 'Bearing replacement and lubrication.', cost: '₹2.4 Lakh' },
      { stage: 'Inspection', date: '2026-10-01', status: 'pending', description: 'Overdue: High vibration anomaly detected.', cost: '-' },
      { stage: 'Upgrade', date: 'Planned 2028', status: 'upcoming', description: 'Capacity expansion planned for Phase 2.', cost: 'TBD' },
    ]
  },
  'AST-2024-108': {
    name: 'Kutch Solar Grid Substation A',
    type: 'Transformer',
    sector: 'Energy',
    location: 'District: Kutch, State: Gujarat',
    cost: '₹8.2 Cr',
    installationDate: '2022-06-20',
    expectedLife: '25 Years',
    healthScore: 78,
    status: 'Commissioned',
    dates: { nextInspection: '2025-06-20', lastMaintenance: '2023-01-15' },
    events: [
      { stage: 'Procurement', date: '2021-11-05', status: 'completed', description: 'Procured 50MVA heavy duty transformer.', cost: '₹7.5 Cr' },
      { stage: 'Installation', date: '2022-05-10', status: 'completed', description: 'Substation wiring, earthing, and mounting.', cost: '₹0.7 Cr' },
      { stage: 'Commissioned', date: '2022-06-20', status: 'completed', description: 'Connected to main solar grid.', cost: '-' },
      { stage: 'Inspection', date: '2025-06-20', status: 'upcoming', description: 'Scheduled thermal imaging inspection.', cost: 'TBD' }
    ]
  },
  'AST-2024-211': {
    name: 'Pune BRTS Corridor 2',
    type: 'Road',
    sector: 'Transportation',
    location: 'District: Pune, State: Maharashtra',
    cost: '₹340 Cr',
    installationDate: '2016-08-12',
    expectedLife: '20 Years',
    healthScore: 85,
    status: 'Commissioned',
    dates: { nextInspection: '2025-01-10', lastMaintenance: '2022-11-05' },
    events: [
      { stage: 'Procurement', date: '2014-04-10', status: 'completed', description: 'Contract awarded for dedicated bus lanes.', cost: '₹340 Cr' },
      { stage: 'Commissioned', date: '2016-08-12', status: 'completed', description: 'BRTS Corridor 2 opened for municipal transport.', cost: '-' },
      { stage: 'Maintenance', date: '2022-11-05', status: 'completed', description: 'Lane repainting, signage replacement and minor pothole repair.', cost: '₹1.2 Cr' },
      { stage: 'Inspection', date: '2025-01-10', status: 'upcoming', description: 'Road surface friction test.', cost: 'TBD' }
    ]
  },
  'AST-2024-304': {
    name: 'Bangalore East Streetlights',
    type: 'Streetlight',
    sector: 'Energy',
    location: 'District: Bangalore, State: Karnataka',
    cost: '₹2.1 Cr',
    installationDate: '2018-04-10',
    expectedLife: '10 Years',
    healthScore: 32,
    status: 'Critical',
    dates: { nextInspection: '2024-04-10', lastMaintenance: '2021-08-20' },
    events: [
      { stage: 'Procurement', date: '2018-01-15', status: 'completed', description: 'Energy-efficient LED modules procured.', cost: '₹1.8 Cr' },
      { stage: 'Commissioned', date: '2018-04-10', status: 'completed', description: 'Streetlights activated in East Zone.', cost: '₹0.3 Cr' },
      { stage: 'Inspection', date: '2024-04-10', status: 'pending', description: 'Overdue: 45% of lights reported non-functional by citizens.', cost: '-' },
      { stage: 'Maintenance', date: 'Immediate', status: 'upcoming', description: 'Emergency LED driver replacement needed across 12 sectors.', cost: '₹0.5 Cr' }
    ]
  }
};

export default function AssetDetails() {
  const { id } = useParams();

  // Find the exact asset or default to the pump if an unknown ID is provided
  const assetData = MOCK_ASSETS[id] || MOCK_ASSETS['AST-2024-042'];
  const asset = { id: id || 'AST-2024-042', ...assetData };
  const lifecycleEvents = asset.events;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <Link to="/assets" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Registry
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header Passport */}
        <div className="border-b border-slate-200 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900 text-white relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl -mr-16 -mt-16 opacity-20"></div>
          <div className="relative z-10">
            <div className="flex gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300 border border-blue-400/30 bg-blue-900/50 px-2 py-0.5 rounded">
                Digital Passport
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 border border-slate-600 px-2 py-0.5 rounded">
                {asset.id}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">{asset.name}</h1>
            <p className="text-slate-400 font-medium">{asset.sector} &bull; {asset.type} &bull; {asset.location}</p>
          </div>
          
          <div className="relative z-10 bg-slate-800 border border-slate-700 p-4 rounded-xl flex items-center gap-4 shadow-lg min-w-[200px]">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl border-4 ${asset.healthScore >= 80 ? 'border-emerald-500 text-emerald-400' : asset.healthScore >= 60 ? 'border-blue-500 text-blue-400' : asset.healthScore >= 40 ? 'border-amber-500 text-amber-400' : 'border-rose-500 text-rose-400'}`}>
              {asset.healthScore}
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Health Score</p>
              <p className="text-sm font-semibold text-white">{asset.status}</p>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 border-b border-slate-200">
          <div className="p-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Cost</p>
            <p className="text-lg font-semibold text-slate-900">{asset.cost}</p>
          </div>
          <div className="p-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Installed</p>
            <p className="text-lg font-semibold text-slate-900">{asset.installationDate}</p>
          </div>
          <div className="p-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Expected Life</p>
            <p className="text-lg font-semibold text-slate-900">{asset.expectedLife}</p>
          </div>
          <div className="p-6 bg-slate-50">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Next Inspection</p>
            <p className="text-lg font-semibold text-amber-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {asset.dates.nextInspection}
            </p>
          </div>
        </div>

        {/* Lifecycle Engine Timeline */}
        <div className="p-6 md:p-8">
          <div className="mb-6 border-b border-slate-200 pb-4">
            <h2 className="text-xl font-bold text-slate-900">Asset Lifecycle</h2>
            <p className="text-sm text-slate-500">End-to-end transparency from procurement to retirement.</p>
          </div>

          <div className="relative border-l-2 border-slate-200 ml-4 md:ml-6 space-y-8 pb-4">
            {lifecycleEvents.map((event, idx) => {
              const isCompleted = event.status === 'completed';
              const isPending = event.status === 'pending';
              
              let Icon = CheckCircle2;
              let bg = 'bg-blue-600';
              let text = 'text-white';
              
              if (isPending) {
                Icon = Clock;
                bg = 'bg-amber-500';
              } else if (event.status === 'upcoming') {
                Icon = Clock;
                bg = 'bg-slate-200';
                text = 'text-slate-400';
              } else if (event.stage === 'Maintenance') {
                Icon = Wrench;
                bg = 'bg-indigo-600';
              } else if (event.stage === 'Installation') {
                Icon = Hammer;
                bg = 'bg-emerald-600';
              }

              return (
                <div key={idx} className="relative pl-8 md:pl-10">
                  <div className={`absolute -left-[17px] top-0.5 w-8 h-8 rounded-full border-4 border-white ${bg} ${text} flex items-center justify-center shadow-sm`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  
                  <div className={`bg-slate-50 p-4 rounded-xl border ${isPending ? 'border-amber-200 shadow-sm' : 'border-slate-200'} relative`}>
                    {isPending && <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-amber-500 animate-pulse -mt-1 -mr-1"></div>}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-200 px-2 py-0.5 rounded mr-2">
                          {event.stage}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">{event.date}</span>
                      </div>
                      <span className="text-xs font-mono text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded">
                        Cost: {event.cost}
                      </span>
                    </div>
                    <p className={`text-sm ${isPending ? 'font-semibold text-amber-800' : 'text-slate-700'}`}>
                      {event.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
