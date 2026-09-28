import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const INITIAL_PROJECTS = {
  'PRJ-2024-01': {
    id: 'PRJ-2024-01', name: 'Coastal Highway Phase 1', sector: 'Transportation', state: 'Maharashtra',
    budget: 15000, spent: 12500, progress: 60, status: 'Delayed',
    dates: { start: '2020-01-10', expectedCompletion: '2024-12-30' },
    assetsCreated: ['AST-2024-001']
  },
  'PRJ-2024-02': {
    id: 'PRJ-2024-02', name: 'Kutch Solar Expansion', sector: 'Energy', state: 'Gujarat',
    budget: 500, spent: 400, progress: 85, status: 'On Track',
    dates: { start: '2023-05-01', expectedCompletion: '2024-08-15' },
    assetsCreated: ['AST-2024-108', 'AST-2024-304']
  },
  'PRJ-2024-03': {
    id: 'PRJ-2024-03', name: 'Narmada Canal Extension', sector: 'Water', state: 'Gujarat',
    budget: 2000, spent: 100, progress: 5, status: 'New',
    dates: { start: '2024-02-20', expectedCompletion: '2027-12-31' },
    assetsCreated: ['AST-2024-042']
  }
};

const INITIAL_ASSETS = {
  'AST-2024-001': {
    name: 'Mumbai Coastal Road Phase 1', type: 'Highway', sector: 'Transportation',
    location: 'District: Mumbai, State: Maharashtra', cost: '₹12,721 Cr', installationDate: '2024-03-10',
    expectedLife: '50 Years', healthScore: 92, status: 'Commissioned',
    dates: { nextInspection: '2025-03-10', lastMaintenance: '-' },
    events: [
      { stage: 'Procurement', date: '2018-10-01', status: 'completed', description: 'Tender awarded to L&T for Phase 1 construction.', cost: '₹12,721 Cr' },
      { stage: 'Installation', date: '2023-12-15', status: 'completed', description: 'Major structural phase and tunneling completed.', cost: '-' },
      { stage: 'Commissioned', date: '2024-03-10', status: 'completed', description: 'Officially inaugurated and opened for public transport.', cost: '-' },
      { stage: 'Inspection', date: '2025-03-10', status: 'upcoming', description: 'Scheduled annual safety and structural inspection.', cost: 'TBD' }
    ]
  },
  'AST-2024-042': {
    name: 'Narmada Main Canal Pump 4', type: 'Water Pump', sector: 'Water',
    location: 'District: Kutch, State: Gujarat', cost: '₹14.5 Cr', installationDate: '2019-11-15',
    expectedLife: '15 Years', healthScore: 45, status: 'Maintenance Required',
    dates: { nextInspection: '2024-10-01', lastMaintenance: '2024-05-10' },
    events: [
      { stage: 'Commissioned', date: '2019-11-15', status: 'completed', description: 'Official inauguration and handover to operations.', cost: '-' },
      { stage: 'Inspection', date: '2024-10-01', status: 'pending', description: 'Overdue: High vibration anomaly detected.', cost: '-' }
    ]
  },
  'AST-2024-304': {
    name: 'Bangalore East Streetlights', type: 'Streetlight', sector: 'Energy',
    location: 'District: Bangalore, State: Karnataka', cost: '₹2.1 Cr', installationDate: '2018-04-10',
    expectedLife: '10 Years', healthScore: 32, status: 'Critical',
    dates: { nextInspection: '2024-04-10', lastMaintenance: '2021-08-20' },
    events: [
      { stage: 'Commissioned', date: '2018-04-10', status: 'completed', description: 'Streetlights activated in East Zone.', cost: '₹0.3 Cr' },
      { stage: 'Inspection', date: '2024-04-10', status: 'pending', description: 'Overdue: 45% of lights reported non-functional by citizens.', cost: '-' }
    ]
  }
};

const INITIAL_AUDIT = [
  { id: 1, timestamp: new Date(Date.now() - 7200000).toISOString(), user: "System", action: "System Initialization", entity: "All", reason: "Platform Boot", oldData: "-", newData: "-" }
];

export function AppProvider({ children }) {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [updates, setUpdates] = useState([]); // Public notifications
  const [notifications, setNotifications] = useState([]); // Admin notifications
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT);

  // Initialize notifications from state rules (Section 10)
  useEffect(() => {
    let adminNotes = [];
    let pubUpdates = [];
    let idCounter = 1;

    // Evaluate Assets
    Object.entries(INITIAL_ASSETS).forEach(([id, asset]) => {
      if (asset.healthScore < 40) {
        adminNotes.push({ id: idCounter++, message: `CRITICAL ASSET: ${asset.name} health score is ${asset.healthScore}`, type: 'error', time: 'Generated' });
        pubUpdates.push({ id: idCounter++, time: 'Recent', type: 'Alert', title: `Critical Update: ${asset.name} requires immediate intervention`, tag: asset.sector, reason: 'Health score below 40' });
      }
      const pendingEvent = asset.events.find(e => e.status === 'pending');
      if (pendingEvent && pendingEvent.stage === 'Inspection') {
        adminNotes.push({ id: idCounter++, message: `OVERDUE: Inspection for ${asset.name} was due on ${pendingEvent.date}`, type: 'warning', time: 'Generated' });
      }
    });

    // Evaluate Projects
    Object.entries(INITIAL_PROJECTS).forEach(([id, proj]) => {
      if (proj.status === 'New') {
        pubUpdates.push({ id: idCounter++, time: 'Recent', type: 'New Project', title: `${proj.name} launched in ${proj.state}`, tag: proj.sector, reason: 'Project Approved' });
      }
      if (proj.status === 'Delayed') {
        adminNotes.push({ id: idCounter++, message: `DELAYED PROJECT: ${proj.name} is behind schedule.`, type: 'warning', time: 'Generated' });
        pubUpdates.push({ id: idCounter++, time: 'Recent', type: 'Major Delay', title: `${proj.name} schedule extended`, tag: proj.sector, reason: 'Contractor review pending' });
      }
      
      // Budget Anomaly Rule: If Budget Used % > Project Progress % + 20
      const spentPercent = (proj.spent / proj.budget) * 100;
      if (spentPercent > proj.progress + 20) {
        adminNotes.push({ id: idCounter++, message: `BUDGET ANOMALY on ${proj.name}: Spent ${spentPercent.toFixed(0)}% but progress is only ${proj.progress}%.`, type: 'error', time: 'Generated' });
      }
    });

    setNotifications(adminNotes);
    setUpdates(pubUpdates);
  }, []);

  const rescheduleInspection = (assetId, oldDate, newDate, reason, user = "Admin (Water)") => {
    const now = new Date();
    
    setAssets(prev => {
      const asset = { ...prev[assetId] };
      const eventIndex = asset.events.findIndex(e => e.stage === 'Inspection' && (e.status === 'pending' || e.status === 'upcoming'));
      
      const newEvents = [...asset.events];
      if (eventIndex >= 0) {
        newEvents[eventIndex] = { ...newEvents[eventIndex], date: newDate, status: 'upcoming', description: `Rescheduled from ${oldDate}. Reason: ${reason}` };
      }
      asset.events = newEvents;
      asset.dates = { ...asset.dates, nextInspection: newDate };
      return { ...prev, [assetId]: asset };
    });

    setAuditLogs(prev => [{
      id: Date.now(), timestamp: now.toISOString(), user: user, action: "Rescheduled Inspection", entity: assetId, reason: reason, oldData: oldDate, newData: newDate
    }, ...prev]);

    setNotifications(prev => [{ id: Date.now(), message: `Inspection for ${assets[assetId].name} rescheduled to ${newDate}.`, type: "info", time: "Just now" }, ...prev]);

    setUpdates(prev => [{ id: Date.now(), time: "Just now", type: "Important Change", title: `${assets[assetId].name} Schedule Change`, tag: assets[assetId].sector, reason: reason }, ...prev]);
  };

  const updateAsset = (id, updatedData) => {
    setAssets(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updatedData }
    }));
    // Optionally log this edit
    setAuditLogs(prev => [{
      id: Date.now(), timestamp: new Date().toISOString(), user: `Admin (${updatedData.sector || prev[id].sector})`, action: "Updated Asset Record", entity: id, reason: "Data maintenance", oldData: "-", newData: "Multiple fields"
    }, ...prev]);
  };

  const updateProject = (id, updatedData) => {
    setProjects(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updatedData }
    }));
    setAuditLogs(prev => [{
      id: Date.now(), timestamp: new Date().toISOString(), user: `Admin (${updatedData.sector || prev[id].sector})`, action: "Updated Project Record", entity: id, reason: "Data maintenance", oldData: "-", newData: "Multiple fields"
    }, ...prev]);
  };

  return (
    <AppContext.Provider value={{ projects, assets, updates, auditLogs, notifications, rescheduleInspection, updateAsset, updateProject }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
