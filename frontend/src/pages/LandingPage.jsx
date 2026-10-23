import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, ChevronRight, Zap, Navigation, BatteryCharging, 
  ShieldCheck, Calendar, Car, ArrowRight, CheckCircle2, Clock, 
  MapPin, Award, Users, Smartphone, Sparkles, Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const slides = [
  {
    id: 1,
    image: '/slides/slide1.jpg',
    heading: 'Welcome to ChargeMate',
    subheading: 'The all-in-one intelligent solution for electric vehicle owners to find charging stations, reserve bays, and protect battery health.',
    primaryAction: 'Find Stations Now',
    primaryPath: '/dashboard'
  },
  {
    id: 2,
    image: '/slides/slide2.jpg',
    heading: 'AI-Powered EV Navigation',
    subheading: 'Our platform helps EV drivers locate stations effortlessly, minimize highway detours, and guarantee slot availability before arrival.',
    primaryAction: 'Plan Live Route',
    primaryPath: '/dashboard'
  },
  {
    id: 3,
    image: '/slides/slide3.jpg',
    heading: 'Battery Health Intelligence',
    subheading: 'Predictive degradation analytics trained on 50,000 real EV fleet records with 97.7% accuracy for maximum pack longevity.',
    primaryAction: 'Analyze Battery AI',
    primaryPath: '/battery-health'
  }
];

const PARTNERS = [
  { name: 'Tata Power EZ Charge', power: '24kW - 150kW Dual CCS2', locs: '4,500+ Hubs' },
  { name: 'Jio-bp pulse', power: '60kW - 120kW Fast DC', locs: '1,800+ Hubs' },
  { name: 'Statiq EV Network', power: '30kW - 60kW DC / AC', locs: '2,200+ Hubs' },
  { name: 'Ather Grid', power: 'Fast Grid Hubs', locs: '1,400+ Points' },
  { name: 'ChargeZone', power: 'High-Speed Highway Corridors', locs: '850+ Hubs' },
  { name: 'Zeon Charging', power: '50kW - 120kW CCS2', locs: '600+ Hubs' }
];

const REVIEWS = [
  {
    name: 'Vikramaditya Roy',
    role: 'Tata Nexon EV Max Driver • Mumbai to Pune Expressway',
    rating: 5,
    comment: 'ChargeMate eliminated my range anxiety on the expressway. Reserved Bay A1 at Lonavala, paid through Razorpay in seconds, and my QR pass was ready on arrival. The best EV app in India.'
  },
  {
    name: 'Pooja Sundaram',
    role: 'MG ZS EV Owner • Bangalore Tech Fleet',
    rating: 5,
    comment: 'The 10-minute slot hold and real-time bay availability prevent long queues. Plus, the Battery Health prediction matches my OEM telemetry perfectly!'
  },
  {
    name: 'Rahul K. Sharma',
    role: 'Fleet Manager (25 Mahindra XUV400s) • Delhi NCR',
    rating: 5,
    comment: 'The admin dashboard gives us complete transparency on driver booking timestamps, station loads, and pack internal resistance trends. Remarkable AIML engineering.'
  }
];

const LandingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const autoPlayRef = useRef(null);
  const navigate = useNavigate();

  // Auto-play slideshow every 6 seconds
  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, []);

  const prevSlide = (e) => {
    e?.stopPropagation();
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = (e) => {
    e?.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const scrollToAbout = () => {
    const el = document.getElementById('about-us');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-slate-950 text-white selection:bg-teal-500 selection:text-white">
      
      {/* =========================================================================
          SECTION 1: TOP HERO SLIDER (Exact full-bleed images matching screenshots)
          ========================================================================= */}
      <section className="relative w-full h-[calc(100vh-64px)] min-h-[580px] overflow-hidden select-none bg-slate-950">
        
        {/* Slide Images */}
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Background Image full-bleed */}
              <img
                src={slide.image}
                alt={slide.heading}
                className="w-full h-full object-cover object-center"
              />

              {/* Dark gradient overlay for pristine text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-black/45 to-black/40" />

              {/* Text Overlay & Interactive Action Buttons */}
              <div className="absolute inset-0 flex flex-col justify-end pb-16 sm:pb-20 lg:pb-24 px-6 sm:px-12 lg:px-20 z-20">
                <div className="max-w-4xl mx-auto text-center space-y-4">
                  
                  {/* Subtle Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold backdrop-blur-md mx-auto">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Intelligent Electric Vehicle Infrastructure Platform</span>
                  </div>

                  {/* Heading */}
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-xl leading-tight">
                    {slide.heading}
                  </h1>

                  {/* Subtitle text */}
                  <p className="text-xs sm:text-sm lg:text-base text-slate-200/95 font-normal max-w-2xl mx-auto leading-relaxed drop-shadow">
                    {slide.subheading}
                  </p>

                  {/* Call-to-action Buttons on Hero */}
                  <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => navigate(slide.primaryPath)}
                      className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-sm shadow-lg shadow-teal-500/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      <span>{slide.primaryAction}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => navigate('/dashboard')}
                      className="px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm backdrop-blur-md border border-sky-400/30 shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <MapPin className="w-4 h-4 text-white" />
                      <span>Nearby Stations (Live GPS)</span>
                    </button>

                    <button
                      onClick={scrollToAbout}
                      className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm backdrop-blur-md border border-white/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      Learn More About Us
                    </button>
                  </div>

                </div>
              </div>
            </div>
          );
        })}

        {/* Left Arrow Chevron */}
        <button
          onClick={prevSlide}
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/30 hover:bg-black/60 text-white/80 hover:text-white transition-all hover:scale-110 active:scale-90 cursor-pointer backdrop-blur-sm border border-white/10"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 stroke-[2]" />
        </button>

        {/* Right Arrow Chevron */}
        <button
          onClick={nextSlide}
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/30 hover:bg-black/60 text-white/80 hover:text-white transition-all hover:scale-110 active:scale-90 cursor-pointer backdrop-blur-sm border border-white/10"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 stroke-[2]" />
        </button>

        {/* Slider Navigation Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                index === currentSlide 
                  ? 'w-8 h-2.5 bg-teal-400 shadow-md shadow-teal-500/50' 
                  : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

      </section>

      {/* =========================================================================
          SECTION 2: ABOUT US (Rich, comprehensive platform story & vision)
          ========================================================================= */}
      <section id="about-us" className="py-20 px-6 sm:px-12 lg:px-20 bg-slate-900 border-t border-slate-800 relative">
        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-teal-400 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20">
              About ChargeMate Platform
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Powering India's Clean Mobility Revolution
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              ChargeMate is an AI-driven intelligent EV charging, navigation, slot reservation, and battery health intelligence platform engineered to eliminate range anxiety, eliminate queue wait-times, and optimize electric fleet longevity across India.
            </p>
          </div>

          {/* 3 Core Architecture Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Pillar 1 */}
            <div className="p-8 rounded-3xl bg-slate-950/70 border border-slate-800 hover:border-teal-500/50 transition-all hover:-translate-y-1 group">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-teal-500/20 transition-all">
                <Navigation className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Smart EV Navigation</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                Real-time route planning integrated with live OpenStreetMap highways. Recommends verified high-speed charging stops with minimum detour and guarantees arrival with safe battery state.
              </p>
              <div className="text-xs font-semibold text-teal-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                <span>Explore Indian Routes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="p-8 rounded-3xl bg-slate-950/70 border border-slate-800 hover:border-blue-500/50 transition-all hover:-translate-y-1 group">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Live Slot Holds & Razorpay</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                Concurrency-safe 10-minute temporary bay reservations backed by Redis distributed locks. Seamless UPI QR & Card payment via Razorpay with encrypted digital QR check-in passes.
              </p>
              <div className="text-xs font-semibold text-blue-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                <span>100% Concurrency Safe</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="p-8 rounded-3xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 transition-all hover:-translate-y-1 group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
                <BatteryCharging className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">50k Battery AI Models</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                Machine learning models trained on 50,000 real EV fleet records. Gradient Boosting Regressor predicts State of Health (R²=0.9773, MAE=0.715%) and Remaining Useful Life cycles.
              </p>
              <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                <span>View AI Degradation Curves</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

          </div>

          {/* Key Metric Counters */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800">
            <div className="text-center space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-teal-400">1,200+</div>
              <div className="text-xs font-bold text-slate-300">Fast Charging Bays</div>
              <div className="text-[11px] text-slate-500">Dual CCS2 60kW - 150kW</div>
            </div>

            <div className="text-center space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-blue-400">50,000+</div>
              <div className="text-xs font-bold text-slate-300">Trained Telemetry Points</div>
              <div className="text-[11px] text-slate-500">LFP, NMC, NCA & LMO Packs</div>
            </div>

            <div className="text-center space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">99.8%</div>
              <div className="text-xs font-bold text-slate-300">Slot Reservation Uptime</div>
              <div className="text-[11px] text-slate-500">Zero Overbooking Clashes</div>
            </div>

            <div className="text-center space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-purple-400">100+</div>
              <div className="text-xs font-bold text-slate-300">Indian Cities & Corridors</div>
              <div className="text-[11px] text-slate-500">National Highway Corridors</div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 3: OUR SERVICES (Clickable navigation to every service page)
          ========================================================================= */}
      <section id="services" className="py-20 px-6 sm:px-12 lg:px-20 bg-slate-950 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <span className="text-teal-400 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20">
                Full-Stack EV Services
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                Everything You Need for Effortless EV Travel
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md">
              Access all platform services directly from the header navigation bar or through the service cards below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Service 1: Find Stations */}
            <div 
              onClick={() => navigate('/dashboard')}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-teal-500/60 transition-all hover:-translate-y-1 cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-slate-950 transition-colors">
                  <Navigation className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
                  Find Stations & Slots
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Interactive pan-India map with live bay availability, tariff rates per kWh, fast vs normal chargers, and highway filter.
                </p>
              </div>
              <div className="pt-6 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-bold text-teal-400">
                <span>Open Stations Map</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Service 2: Bookings */}
            <div 
              onClick={() => navigate('/bookings')}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/60 transition-all hover:-translate-y-1 cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <Calendar className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                  Slot Booking & QR Passes
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Reserve charging bays in advance. View active bookings, download digital QR passes, and check payment receipts.
                </p>
              </div>
              <div className="pt-6 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-bold text-blue-400">
                <span>View My Bookings</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Service 3: Battery Health */}
            <div 
              onClick={() => navigate('/battery-health')}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/60 transition-all hover:-translate-y-1 cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                  <BatteryCharging className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Battery AI Diagnostics
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Predict State of Health (SOH %), Remaining Useful Life cycles, thermal runaway safety risk, and run interactive What-If simulations.
                </p>
              </div>
              <div className="pt-6 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-bold text-emerald-400">
                <span>Launch Battery Lab</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Service 4: Vehicle Management */}
            <div 
              onClick={() => navigate('/vehicles')}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-purple-500/60 transition-all hover:-translate-y-1 cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  <Car className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                  EV Fleet & Vehicles
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Manage registered electric vehicles, battery chemistry profiles, connector compatibility, and telemetry logs in one place.
                </p>
              </div>
              <div className="pt-6 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-bold text-purple-400">
                <span>Manage EV Garage</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 4: HOW IT WORKS (Simple 4-Step User Journey)
          ========================================================================= */}
      <section className="py-20 px-6 sm:px-12 lg:px-20 bg-slate-900/60 border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-14">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-teal-400 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20">
              Seamless Driver Experience
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              How ChargeMate Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              From discovering stations to contactless QR check-in in under 60 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-black text-sm">
                01
              </div>
              <h4 className="text-base font-bold text-white">Find Station or Route</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enter your start and destination anywhere in India or browse stations with live available slot counters.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-sm">
                02
              </div>
              <h4 className="text-base font-bold text-white">Pick Slot & Time Window</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Choose between Fast DC (120kW CCS2) or Normal AC charging. Slot is held for 10 minutes concurrency-safe.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm">
                03
              </div>
              <h4 className="text-base font-bold text-white">Pay with Razorpay</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Scan the dynamic UPI QR code with Google Pay, PhonePe, Paytm, or pay via Card/Netbanking with zero extra fees.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-black text-sm">
                04
              </div>
              <h4 className="text-base font-bold text-white">Scan QR & Plug In</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Show your digital QR pass at the charging hub to unlock the charger. Track live kWh session in real time.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 5: CHARGING NETWORK PARTNERS
          ========================================================================= */}
      <section className="py-16 px-6 sm:px-12 lg:px-20 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="text-center space-y-2">
            <span className="text-teal-400 text-xs font-black uppercase tracking-widest">
              Unified Ecosystem
            </span>
            <h3 className="text-2xl font-black text-white">
              Aggregated Across India's Premier EV Charging Networks
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {PARTNERS.map((p, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
                <div className="font-extrabold text-xs text-white truncate">{p.name}</div>
                <div className="text-[10px] text-teal-400 font-semibold">{p.power}</div>
                <div className="text-[10px] text-slate-500">{p.locs}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 6: DRIVER REVIEWS & TESTIMONIALS
          ========================================================================= */}
      <section id="reviews" className="py-20 px-6 sm:px-12 lg:px-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-teal-400 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20">
              Trusted by EV Drivers
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Real Experiences from the Road
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((r, i) => (
              <div key={i} className="p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex text-amber-400">
                    {[...Array(r.rating)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                    "{r.comment}"
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/70">
                  <div className="font-bold text-sm text-white">{r.name}</div>
                  <div className="text-[11px] text-teal-400">{r.role}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 7: BOTTOM CALL TO ACTION
          ========================================================================= */}
      <section className="py-20 px-6 sm:px-12 lg:px-20 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto shadow-xl shadow-teal-500/10">
            <Zap className="w-8 h-8 fill-current" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Ready for Worry-Free EV Travel?
          </h2>

          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            Join thousands of electric vehicle owners across India. Locate stations, reserve your slot in real time, and safeguard your battery with predictive AI.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-teal-500/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Explore Stations & Book Bay</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/battery-health')}
              className="px-8 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              Run Battery AI Diagnostics
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: FOOTER
          ========================================================================= */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-10 px-6 sm:px-12 lg:px-20 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="space-y-1 text-center md:text-left">
            <div className="font-extrabold text-base text-white tracking-tight flex items-center justify-center md:justify-start gap-1.5">
              <span>ChargeMate</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 font-bold">
                SmartEV
              </span>
            </div>
            <p className="text-slate-500 text-[11px]">
              Intelligent EV Charging, Parking, Navigation & Battery Intelligence Platform
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400 font-medium">
            <button onClick={() => navigate('/dashboard')} className="hover:text-white transition-colors cursor-pointer">Find Stations</button>
            <button onClick={() => navigate('/bookings')} className="hover:text-white transition-colors cursor-pointer">My Bookings</button>
            <button onClick={() => navigate('/battery-health')} className="hover:text-white transition-colors cursor-pointer">Battery AI</button>
            <button onClick={() => navigate('/vehicles')} className="hover:text-white transition-colors cursor-pointer">Vehicles</button>
            <button onClick={() => navigate('/admin')} className="hover:text-white transition-colors cursor-pointer">Admin Portal</button>
          </div>

          <div className="text-[11px] text-slate-500 text-center md:text-right">
            © 2026 ChargeMate • Powered by AIML & Razorpay PG
          </div>

        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
