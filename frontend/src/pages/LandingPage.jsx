import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Navigation, BatteryCharging, Shield, ArrowRight, Star, Clock, CheckCircle, ChevronRight, Activity, Cpu, Sparkles } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState('Pune');
  const [destination, setDestination] = useState('Mumbai');

  const handleQuickPlan = (e) => {
    e.preventDefault();
    navigate(`/dashboard?from=${encodeURIComponent(origin)}&to=${encodeURIComponent(destination)}`);
  };

  const features = [
    {
      icon: Cpu,
      title: "AI Recommendation Engine",
      description: "Scores candidate stations using multi-factor algorithms: route deviation, 120kW+ speeds, live availability, tariff, and EV battery SOC.",
      tag: "XGBoost + Heuristic AI"
    },
    {
      icon: Shield,
      title: "Redis Slot Concurrency Engine",
      description: "Distributed locks with 10-minute temporary holds eliminate duplicate bookings during peak expressway traffic hours.",
      tag: "Distributed Redis"
    },
    {
      icon: BatteryCharging,
      title: "Battery Health Intelligence",
      description: "Predicts State of Health (SOH %) and Remaining Useful Life (RUL cycles) from electrochemical telemetry using trained machine learning.",
      tag: "ML Telemetry"
    },
    {
      icon: Activity,
      title: "Station Demand Forecasting",
      description: "Anticipates hourly grid congestion and recommends optimal off-peak reservation windows for zero waiting times.",
      tag: "Time-Series AI"
    }
  ];

  const corridorStations = [
    {
      name: "GreenCharge Wakad",
      location: "Pune (Expressway Start)",
      speed: "120 kW CCS2",
      slots: "8 / 10 Free",
      price: "₹14/kWh",
      rating: 4.6,
      badge: "Fastest In City"
    },
    {
      name: "GreenCharge Lonavala",
      location: "Milestone 62 (Expressway Oasis)",
      speed: "120 kW CCS2",
      slots: "6 / 10 Free",
      price: "₹13.50/kWh",
      rating: 4.7,
      badge: "AI Top Pick ⭐"
    },
    {
      name: "Tata Power BKC",
      location: "Bandra Kurla Complex (Mumbai)",
      speed: "150 kW Ultra",
      slots: "11 / 12 Free",
      price: "₹16/kWh",
      rating: 4.9,
      badge: "Premium Hub"
    }
  ];

  return (
    <div className="min-h-screen bg-brand-dark text-slate-100 overflow-hidden">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
        {/* Glow backdrop lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-cyan-500/15 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-cyan-500/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Top Pill */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-lg shadow-emerald-500/10">
              <Sparkles className="w-3.5 h-3.5 text-brand-accent animate-pulse" />
              <span>Next-Gen AIML Final Year Engineering Project</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-slate-400">Pune–Mumbai Corridor Live</span>
            </div>
          </div>

          {/* Main Title & Subtitle */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
              Smart EV Charging <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                & AI Route Intelligence
              </span>
            </h1>
            <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Find charging stations, reserve your slot with 10-minute Redis locks, navigate smarter with multi-factor AI scoring, and evaluate your battery health with XGBoost.
            </p>
          </div>

          {/* Quick Route Plan Search Card */}
          <div className="mt-10 max-w-3xl mx-auto">
            <form
              onSubmit={handleQuickPlan}
              className="glass-panel p-3 sm:p-4 rounded-3xl shadow-2xl flex flex-col sm:flex-row items-center gap-3 border border-slate-700/60"
            >
              <div className="flex-1 w-full flex items-center gap-3 px-4 py-3 bg-slate-900/80 rounded-2xl border border-slate-800">
                <div className="w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20 shrink-0" />
                <div className="flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Start Origin</span>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="Enter city or location (e.g. Pune)"
                    className="w-full bg-transparent text-sm font-semibold text-white focus:outline-none placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="flex-1 w-full flex items-center gap-3 px-4 py-3 bg-slate-900/80 rounded-2xl border border-slate-800">
                <div className="w-3 h-3 rounded-full bg-cyan-400 ring-4 ring-cyan-500/20 shrink-0" />
                <div className="flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Destination</span>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Destination (e.g. Mumbai)"
                    className="w-full bg-transparent text-sm font-semibold text-white focus:outline-none placeholder-slate-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-500/25 shrink-0"
              >
                <span>Plan Journey</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Quick Action Badges */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-3 text-xs">
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500/40 flex items-center gap-2 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-brand-accent" />
              <span>Interactive Navigation Map</span>
            </Link>
            <Link
              to="/battery-health"
              className="px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500/40 flex items-center gap-2 transition-colors"
            >
              <BatteryCharging className="w-3.5 h-3.5 text-cyan-400" />
              <span>XGBoost Battery SOH Dashboard</span>
            </Link>
            <Link
              to="/admin"
              className="px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500/40 flex items-center gap-2 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>Admin AI Analytics Portal</span>
            </Link>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="border-y border-slate-800/80 bg-slate-950/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl lg:text-4xl font-black text-brand-accent">8 Hubs</div>
              <p className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">Pune–Mumbai Corridor</p>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-black text-cyan-400">10 Mins</div>
              <p className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">Redis Concurrency Lock</p>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-black text-emerald-400">0.998 R²</div>
              <p className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">XGBoost Battery Accuracy</p>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-black text-teal-300">100%</div>
              <p className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">Razorpay Test Gateway</p>
            </div>
          </div>
        </div>
      </section>

      {/* CORE AI PILLARS */}
      <section className="py-20 lg:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-brand-accent tracking-widest uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              AIML Engineering Core
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4">
              Real Artificial Intelligence, Not Just A Simple CRUD
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-3">
              Designed from ground up with integrated Machine Learning microservices, real-time Redis locking, and automated agentic tool-calling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, idx) => (
              <div
                key={idx}
                className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 group hover:-translate-y-1.5 shadow-xl shadow-black/40"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-brand-accent group-hover:scale-110 group-hover:border-emerald-500/50 transition-all">
                  <f.icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-cyan-400 mt-4 block">
                  {f.tag}
                </span>
                <h3 className="text-lg font-bold text-white mt-1 group-hover:text-brand-accent transition-colors">
                  {f.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED STATIONS PREVIEW */}
      <section className="py-20 bg-slate-950/70 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold text-brand-accent tracking-wider uppercase">Live Availability</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Featured Expressway Stations
              </h2>
            </div>
            <Link
              to="/dashboard"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs font-bold text-brand-accent hover:underline"
            >
              <span>Explore all corridor stations</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {corridorStations.map((st, idx) => (
              <div
                key={idx}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-slate-700 transition-all shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-brand-accent border border-emerald-500/30">
                    {st.badge}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{st.rating}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mt-4">{st.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{st.location}</p>

                <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Speed</span>
                    <span className="font-bold text-white">{st.speed}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Slots</span>
                    <span className="font-bold text-emerald-400">{st.slots}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Tariff</span>
                    <span className="font-bold text-white">{st.price}</span>
                  </div>
                </div>

                <Link
                  to="/dashboard"
                  className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center justify-center gap-2 transition-colors"
                >
                  <span>View Details & Slots</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-brand-dark py-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-brand-accent" />
            <span className="text-white font-bold">SmartEV Platform</span>
            <span>• AIML Final Year Project</span>
          </div>
          <div className="flex items-center gap-6 text-slate-400">
            <Link to="/dashboard" className="hover:text-white">Navigation</Link>
            <Link to="/battery-health" className="hover:text-white">Battery Intelligence</Link>
            <Link to="/admin" className="hover:text-white">Admin Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
