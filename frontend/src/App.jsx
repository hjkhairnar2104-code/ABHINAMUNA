import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import AiChatModal from './components/AiChatModal';

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import StationDetails from './pages/StationDetails';
import BatteryDashboard from './pages/BatteryDashboard';
import BookingsPage from './pages/BookingsPage';
import VehiclesPage from './pages/VehiclesPage';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isBatteryPage = location.pathname === '/battery-health';
  const isDarkPage = isHomePage || isBatteryPage;

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-teal-500 selection:text-white ${
      isDarkPage ? 'bg-slate-950 text-slate-100' : 'bg-[#f4f7fb] text-slate-800'
    }`}>
      {/* Global Navigation Bar */}
      <Navbar />

      {/* Main View Router */}
      <main className="flex-1 relative">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/stations/:id" element={<StationDetails />} />
          <Route path="/battery-health" element={<BatteryDashboard />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/vehicles" element={<VehiclesPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Persistent AI Travel Copilot */}
      <AiChatModal />

      {!isDarkPage && (
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">ChargeMate Platform</span>
              <span>•</span>
              <span>Intelligent EV Navigation, Charging & Battery Health</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Pan-India EV Charging Network • Intelligent Route Planning & Battery AI
            </div>
          </div>
        </footer>
      )}

      {isBatteryPage && (
        <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">SmartEV Battery AI Laboratory</span>
              <span>•</span>
              <span className="text-slate-400">Physics-Informed LightGBM Battery Twin & CALCE Master Dataset</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              IEEE Trans. Electrification • MAE 0.43% • Latency 0.019 ms
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
