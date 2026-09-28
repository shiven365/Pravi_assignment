import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import IndiaMapPage from './pages/IndiaMapPage';
import Landing from './pages/Landing';
import Assets from './pages/Assets';
import AssetDetails from './pages/AssetDetails';
import Admin from './pages/Admin';
import Updates from './pages/Updates';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Login from './pages/Login';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        
        <Route element={<Layout />}>
          <Route path="/public" element={<Home />} />
          <Route path="map" element={<IndiaMapPage />} />
          <Route path="assets" element={<Assets />} />
          <Route path="assets/:id" element={<AssetDetails />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetails />} />
          <Route path="updates" element={<Updates />} />
          <Route path="login" element={<Login />} />
          <Route path="admin" element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } />
          {/* Placeholders for future pages */}
          <Route path="sectors" element={<div className="p-8 text-lg font-semibold">Sectors Overview Coming Soon...</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
