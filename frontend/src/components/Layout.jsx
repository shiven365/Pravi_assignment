import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Building2, Shield, UserCircle, Search, Menu } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  const isOverview = location.pathname === '/public' || location.pathname === '/';
  const isUpdates = location.pathname === '/updates';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Top Banner (Government feel) */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 md:px-8 flex justify-between items-center border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Shield className="w-3 h-3 text-blue-400" />
          <span>Official Public Infrastructure Portal</span>
        </div>
        <div className="hidden md:flex gap-4">
          <a href="#" className="hover:text-white transition-colors">Skip to main content</a>
          <a href="#" className="hover:text-white transition-colors">Accessibility Options</a>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-blue-700 p-1.5 rounded group-hover:bg-blue-800 transition-colors">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">GovInfra360</h1>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Asset Transparency</p>
              </div>
            </Link>
            
            {!location.pathname.startsWith('/login') && !location.pathname.startsWith('/admin') && (
              <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                <Link to="/public" className={isOverview ? "text-blue-700 font-semibold border-b-2 border-blue-700 py-5" : "hover:text-blue-700 transition-colors py-5"}>Overview</Link>
                <Link to="/map" className={location.pathname === '/map' ? "text-blue-700 font-semibold border-b-2 border-blue-700 py-5" : "hover:text-blue-700 transition-colors py-5"}>Map View</Link>
                <Link to="/updates" className={isUpdates ? "text-blue-700 font-semibold border-b-2 border-blue-700 py-5" : "hover:text-blue-700 transition-colors py-5"}>What's New</Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-500 p-2" aria-label="Menu">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t-4 border-blue-700">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-6 h-6 text-blue-500" />
              <h2 className="text-lg font-bold text-white tracking-tight">GovInfra360</h2>
            </div>
            <p className="text-sm leading-relaxed">Public Transparency Platform for Infrastructure Asset Lifecycle Management.</p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4 uppercase text-xs tracking-wider">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/projects" className="hover:text-white transition-colors">All Projects</Link></li>
              <li><Link to="/assets" className="hover:text-white transition-colors">Asset Registry</Link></li>
              <li><Link to="/sectors" className="hover:text-white transition-colors">Sectors Overview</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4 uppercase text-xs tracking-wider">Information</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/updates" className="hover:text-white transition-colors">What's New</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Methodology</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Open Data</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4 uppercase text-xs tracking-wider">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Report an Issue</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 pt-8 border-t border-slate-800 text-sm flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} Government Infrastructure Portal. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-500">MVP v1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
