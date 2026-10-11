import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-brand-dark text-slate-100 flex flex-col font-sans selection:bg-brand-accent selection:text-black">
          {/* Global Sticky Navigation Bar */}
          <Navbar />

          {/* Main View Router */}
          <main className="flex-1">
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

          {/* Persistent AI Travel Copilot Modal */}
          <AiChatModal />

          {/* Footer */}
          <footer className="border-t border-slate-900 bg-slate-950/80 py-8 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-300">SmartEV Platform</span>
                <span>•</span>
                <span>Intelligent EV Navigation, Charging & Battery Health</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Final Year AIML Project • Pune–Mumbai NH 48 Corridor Network
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
