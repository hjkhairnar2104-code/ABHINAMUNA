import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Zap, Navigation, BatteryCharging, Calendar, Car, Shield, 
  LogOut, Bell, Menu, X, Info, Layers, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationApi } from '../services/api';

const Navbar = () => {
  const { user, logout, login, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    if (user) {
      notificationApi.getUnreadCount()
        .then(res => setUnreadCount(res.data.unreadCount || 0))
        .catch(() => {});
    }
  }, [user]);

  // Handle smooth scroll to #about-us on home page or route navigation from other pages
  const handleAboutClick = (e) => {
    e?.preventDefault();
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      const el = document.getElementById('about-us');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/#about-us');
      setTimeout(() => {
        const el = document.getElementById('about-us');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 250);
    }
  };

  const handleOpenNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && user) {
      notificationApi.getAll()
        .then(res => setNotifications(res.data))
        .catch(() => {
          setNotifications([
            { id: 1, title: 'Booking Confirmed! 🎉', message: 'Slot A1 held for 10 minutes at Corridor EV Plaza.', type: 'INFO', createdAt: 'Just now' },
            { id: 2, title: 'Battery Degradation Normal', message: 'SOH predicted at 91.4% with stable impedance.', type: 'BATTERY', createdAt: '10m ago' }
          ]);
        });
    }
  };

  const switchAccount = async (roleType) => {
    try {
      if (roleType === 'admin') {
        await login('admin@smartev.com', 'admin123');
        navigate('/admin');
      } else {
        await login('user@smartev.com', 'user123');
        navigate('/dashboard');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Comprehensive header navigation links for all services
  const primaryNavLinks = [
    { name: 'Home', path: '/', isSpecial: false },
    { name: 'Find Stations', path: '/dashboard', icon: Navigation },
    { name: 'Slot Booking', path: '/dashboard', icon: Calendar, badge: 'Live Slots' },
    { name: 'My Bookings', path: '/bookings', icon: CheckCircle2 },
    { name: 'Battery AI', path: '/battery-health', icon: BatteryCharging },
    { name: 'Vehicles', path: '/vehicles', icon: Car },
    { name: 'About Us', isAbout: true, icon: Info },
    ...(isAdmin ? [{ name: 'Admin Portal', path: '/admin', icon: Shield, badge: 'SaaS' }] : [])
  ];

  return (
    <nav className={`transition-colors duration-200 sticky top-0 z-50 ${
      isHomePage 
        ? 'bg-[#0f172a]/95 backdrop-blur-md text-white border-b border-white/10 shadow-lg' 
        : 'bg-[#00a896] text-white shadow-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo - ChargeMate */}
          <Link 
            to="/" 
            className="flex items-center gap-2 text-xl font-black tracking-tight text-white hover:opacity-90 transition-opacity shrink-0 mr-4"
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black ${
              isHomePage ? 'bg-teal-500 text-slate-950' : 'bg-white text-[#00a896]'
            }`}>
              ⚡
            </div>
            <span>ChargeMate</span>
          </Link>

          {/* Desktop Navigation Links - Visible on ALL pages */}
          <div className="hidden xl:flex items-center gap-1">
            {primaryNavLinks.map((link) => {
              if (link.isAbout) {
                return (
                  <button
                    key="about-us-link"
                    onClick={handleAboutClick}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isHomePage 
                        ? 'text-slate-300 hover:text-white hover:bg-white/10' 
                        : 'text-teal-50 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{link.name}</span>
                  </button>
                );
              }

              const isActive = location.pathname === link.path && !link.badge?.includes('Slots');
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                    isActive
                      ? (isHomePage ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'bg-white/20 text-white shadow-sm backdrop-blur-sm')
                      : (isHomePage ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-teal-50 hover:text-white hover:bg-white/10')
                  }`}
                >
                  {link.icon && <link.icon className="w-3.5 h-3.5 opacity-85" />}
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase ${
                      link.badge === 'SaaS' 
                        ? 'bg-amber-400 text-slate-900' 
                        : (isHomePage ? 'bg-teal-500/30 text-teal-300' : 'bg-teal-800 text-teal-100')
                    }`}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Medium screen links (compact) */}
          <div className="hidden md:flex xl:hidden items-center gap-1">
            <Link to="/" className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white hover:bg-white/10">Home</Link>
            <Link to="/dashboard" className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white hover:bg-white/10">Find Stations</Link>
            <Link to="/dashboard" className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white hover:bg-white/10">Slot Booking</Link>
            <Link to="/bookings" className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white hover:bg-white/10">My Bookings</Link>
            <Link to="/battery-health" className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white hover:bg-white/10">Battery AI</Link>
            <Link to="/vehicles" className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white hover:bg-white/10">Vehicles</Link>
            <button onClick={handleAboutClick} className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white hover:bg-white/10 cursor-pointer">About Us</button>
            {isAdmin && (
              <Link to="/admin" className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-400 text-slate-900">Admin</Link>
            )}
          </div>

          {/* Right Action Icons & Auth */}
          <div className="hidden sm:flex items-center gap-3">
            
            {/* Role Switcher only shown if user is an Administrator */}
            {isAdmin && (
              <div className={`flex items-center p-0.5 rounded-xl text-xs font-medium border ${
                isHomePage ? 'bg-slate-900 border-slate-700' : 'bg-black/20 border-white/20'
              }`}>
                <button
                  onClick={() => switchAccount('driver')}
                  className="px-2 py-0.5 rounded-lg text-[11px] font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Driver
                </button>
                <button
                  onClick={() => switchAccount('admin')}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                    isHomePage ? 'bg-teal-500 text-slate-950 shadow-sm' : 'bg-white text-teal-800 shadow-sm'
                  }`}
                >
                  Admin
                </button>
              </div>
            )}

            {user ? (
              <>
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={handleOpenNotifications}
                    className={`p-2 rounded-xl transition-colors relative cursor-pointer ${
                      isHomePage ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-white/15 hover:bg-white/25 text-white'
                    }`}
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 px-4 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="font-extrabold text-xs text-slate-800">Station Alerts</span>
                        <span className="text-[10px] text-teal-600 font-bold cursor-pointer" onClick={() => setUnreadCount(0)}>Mark all read</span>
                      </div>
                      <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                        {notifications.map((n) => (
                          <div key={n.id} className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                            <div className="font-bold text-slate-800">{n.title}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{n.message}</div>
                            <div className="text-[9px] text-slate-400 mt-1">{n.createdAt}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Info & Logout */}
                <div className={`flex items-center gap-2 pl-2 border-l ${isHomePage ? 'border-slate-800' : 'border-white/20'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                    isHomePage ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : 'bg-white/20 border border-white/30 text-white'
                  }`}>
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className="text-xs font-bold leading-none">{user?.name || 'Driver'}</div>
                    <div className={`text-[10px] font-semibold mt-0.5 ${isHomePage ? 'text-slate-400' : 'text-teal-100'}`}>
                      {user?.email || 'driver@smartev.com'}
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className={`p-1.5 rounded-lg transition-colors ml-1 cursor-pointer ${
                      isHomePage ? 'bg-slate-800 hover:bg-slate-700 text-rose-400' : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isHomePage 
                      ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700' 
                      : 'bg-white/15 hover:bg-white/25 text-white'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-black shadow-sm transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}

          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-xl text-white cursor-pointer ${isHomePage ? 'bg-slate-800' : 'bg-white/10'}`}
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-t px-6 py-4 space-y-2 max-h-[80vh] overflow-y-auto ${
          isHomePage ? 'bg-slate-900 border-white/10 text-white' : 'bg-[#008f80] border-teal-400/20 text-white'
        }`}>
          {/* Role Switcher on Mobile - Only for Admin */}
          {isAdmin && (
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-bold text-slate-300">Switch Role:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => { switchAccount('driver'); setMobileMenuOpen(false); }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${!isAdmin ? 'bg-teal-400 text-slate-950' : 'bg-white/10 text-white'}`}
                >
                  Driver
                </button>
                <button
                  onClick={() => { switchAccount('admin'); setMobileMenuOpen(false); }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${isAdmin ? 'bg-teal-400 text-slate-950' : 'bg-white/10 text-white'}`}
                >
                  Admin
                </button>
              </div>
            </div>
          )}

          {/* Service Links on Mobile */}
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 py-2 text-sm font-semibold hover:text-teal-300"
          >
            <Zap className="w-4 h-4 text-teal-400" />
            <span>Home</span>
          </Link>

          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 py-2 text-sm font-semibold hover:text-teal-300"
          >
            <Navigation className="w-4 h-4 text-teal-400" />
            <span>Find Stations</span>
          </Link>

          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 py-2 text-sm font-semibold hover:text-teal-300"
          >
            <Calendar className="w-4 h-4 text-teal-400" />
            <span>Slot Booking</span>
          </Link>

          <Link
            to="/bookings"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 py-2 text-sm font-semibold hover:text-teal-300"
          >
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>My Bookings</span>
          </Link>

          <Link
            to="/battery-health"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 py-2 text-sm font-semibold hover:text-teal-300"
          >
            <BatteryCharging className="w-4 h-4 text-teal-400" />
            <span>Battery AI Health</span>
          </Link>

          <Link
            to="/vehicles"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 py-2 text-sm font-semibold hover:text-teal-300"
          >
            <Car className="w-4 h-4 text-teal-400" />
            <span>Vehicles</span>
          </Link>

          <button
            onClick={handleAboutClick}
            className="flex items-center gap-3 py-2 text-sm font-semibold hover:text-teal-300 w-full text-left cursor-pointer"
          >
            <Info className="w-4 h-4 text-teal-400" />
            <span>About Us</span>
          </button>

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 py-2 text-sm font-bold text-amber-300"
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Admin Portal</span>
            </Link>
          )}

          <div className="pt-3 border-t border-white/10 flex items-center gap-2">
            {user ? (
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="w-full py-2.5 rounded-xl bg-rose-500/20 text-rose-300 font-bold text-xs flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout ({user.name})</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 w-full">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-white/10 text-center text-xs font-bold text-white"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-teal-400 text-center text-xs font-bold text-slate-950"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

        </div>
      )}
    </nav>
  );
};

export default Navbar;
