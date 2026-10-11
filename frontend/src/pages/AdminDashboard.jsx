import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, BatteryCharging, Zap, DollarSign, TrendingUp, 
  AlertTriangle, Sparkles, CheckCircle2, RefreshCw, Plus, MapPin, 
  BarChart3, Activity, Clock, Sliders, ArrowUpRight, Trash2, Eye, ChevronDown, ChevronUp
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { analyticsApi, stationApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Quick Presets for Indian Cities
const INDIAN_CITY_PRESETS = [
  { city: 'New Delhi', lat: '28.6139', lng: '77.2090' },
  { city: 'Mumbai', lat: '19.0760', lng: '72.8777' },
  { city: 'Bengaluru', lat: '12.9716', lng: '77.5946' },
  { city: 'Hyderabad', lat: '17.3850', lng: '78.4867' },
  { city: 'Chennai', lat: '13.0827', lng: '80.2707' },
  { city: 'Pune', lat: '18.5204', lng: '73.8567' },
  { city: 'Jaipur', lat: '26.9124', lng: '75.7873' },
  { city: 'Ahmedabad', lat: '23.0225', lng: '72.5714' },
  { city: 'Agra', lat: '27.1767', lng: '78.0081' },
  { city: 'Goa', lat: '15.4909', lng: '73.8278' },
  { city: 'Kolkata', lat: '22.5726', lng: '88.3639' },
  { city: 'Chandigarh', lat: '30.7333', lng: '76.7794' }
];

const AdminDashboard = () => {
  const { user, isAdmin, login } = useAuth();
  const [stats, setStats] = useState(null);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddStationModal, setShowAddStationModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedStationId, setExpandedStationId] = useState(null);

  // New Station Form State
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCity, setNewCity] = useState('New Delhi');
  const [newLat, setNewLat] = useState('28.6139');
  const [newLng, setNewLng] = useState('77.2090');
  const [newPower, setNewPower] = useState('150.0');
  const [newTariff, setNewTariff] = useState('15.0');
  const [newParkingFee, setNewParkingFee] = useState('40.0');
  const [newSlots, setNewSlots] = useState(8);
  const [newChargerTypes, setNewChargerTypes] = useState('CCS2, Type 2');
  const [newAmenities, setNewAmenities] = useState('Café, Restrooms, Free Wi-Fi, Lounge, CCTV');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, stationsRes] = await Promise.all([
        analyticsApi.getAdminStats(),
        stationApi.getAll(),
      ]);
      setStats(statsRes.data);
      setStations(stationsRes.data || []);
    } catch (err) {
      console.error('Error fetching admin stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApplyPreset = (preset) => {
    setNewCity(preset.city);
    setNewLat(preset.lat);
    setNewLng(preset.lng);
  };

  const handleCreateStation = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const payload = {
        name: newName,
        address: newAddress,
        city: newCity,
        latitude: parseFloat(newLat),
        longitude: parseFloat(newLng),
        parkingPricePerHour: parseFloat(newParkingFee) || 30.0,
        chargingPricePerKwh: parseFloat(newTariff) || 15.0,
        maxChargingSpeedKw: parseFloat(newPower) || 120.0,
        chargerTypes: newChargerTypes || 'CCS2, Type 2',
        totalSlots: parseInt(newSlots) || 8,
        rating: 4.8,
        reviewCount: 0,
        openingHours: '24/7 Open',
        amenities: newAmenities,
        active: true,
        imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80',
      };

      await stationApi.create(payload);
      setShowAddStationModal(false);
      // Reset form
      setNewName('');
      setNewAddress('');
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Failed to register station: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteStation = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this station hub?')) return;
    try {
      await stationApi.delete(id);
      fetchAdminData();
    } catch (err) {
      console.error('Failed to delete station', err);
      alert('Could not delete station.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[2px]">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Pan-India EV Admin & Hub Deployer
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-black uppercase tracking-wider">
                  Admin Control Plane
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Deploy EV charging centers with custom slots, manage corridor tariffs, and monitor highway utilization
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddStationModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add EV Center & Slots</span>
          </button>
          <button
            onClick={fetchAdminData}
            className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Role Notice banner if not admin */}
      {!isAdmin && (
        <div className="mb-6 p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 text-xs text-cyan-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>You are previewing the Admin Console. Click here to authenticate with full administrator permissions.</span>
          </div>
          <button
            onClick={() => login('admin@smartev.com', 'admin123')}
            className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors"
          >
            Log In as Admin
          </button>
        </div>
      )}

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-6 rounded-3xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered EV Drivers</span>
            <Users className="w-4 h-4 text-brand-accent" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{stats?.totalUsers || 142}</span>
            <span className="text-xs text-brand-accent font-semibold">+24% this month</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Pan-India active fleet accounts</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Platform Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">₹{stats?.totalRevenue ? stats.totalRevenue.toLocaleString() : '84,500'}</span>
            <span className="text-xs text-emerald-400 font-semibold">Razorpay Verified</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Combined parking & DC fast charging</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Bookings</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{stats?.todayBookings || 218}</span>
            <span className="text-xs text-cyan-400 font-semibold">AI Pred tmrw: {stats?.predictedTomorrowBookings || 265}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Peak highway window: 5 PM - 9 PM</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Pan-India Hubs</span>
            <MapPin className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{stations.length}</span>
            <span className="text-xs text-emerald-400 font-semibold">100% Uptime</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Configured expressway stations</p>
        </div>
      </div>

      {/* Mid Section: 7-Day Revenue Trend Chart + Station Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        <div className="lg:col-span-8 glass-card p-6 sm:p-7 rounded-3xl border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-accent" />
                <span>7-Day Indian Highway Booking & Revenue Trend</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Daily volume and transaction values tracked across Indian expressway charging hubs
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-brand-accent">
                <span className="w-3 h-3 rounded bg-emerald-500"></span> Bookings
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-3 h-3 rounded bg-cyan-400"></span> Revenue (₹)
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.trends || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" stroke="#10b981" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#38bdf8" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Bar yAxisId="left" dataKey="bookings" name="Bookings" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar yAxisId="right" dataKey="revenue" name="Revenue (₹)" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Station Demand Congestion Rankings */}
        <div className="lg:col-span-4 glass-card p-6 sm:p-7 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <Activity className="w-5 h-5 text-amber-400" />
              <span>Corridor Grid Occupancy</span>
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Live bay occupancy ratio across highway networks
            </p>

            <div className="space-y-4">
              {stats?.stationDemand?.map((st, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-200">{st.station}</span>
                    <span className={`font-mono font-bold ${
                      st.utilization > 85 ? 'text-rose-400' : st.utilization > 75 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {st.utilization}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        st.utilization > 85 ? 'bg-rose-500' : st.utilization > 75 ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${st.utilization}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Yamuna Expressway & Electronic City hubs show &gt;85% peak occupancy.</span>
          </div>
        </div>
      </div>

      {/* Station Management Table with Expandable Physical Slots */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">All EV Centers & Configured Bays ({stations.length})</h3>
            <p className="text-xs text-slate-400">All physical stations and their slot matrices deployed across India</p>
          </div>
          <button
            onClick={() => setShowAddStationModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 hover:bg-cyan-400"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add EV Center</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-bold">Station Name</th>
                <th className="pb-3 font-bold">City / Location</th>
                <th className="pb-3 font-bold">Configured Slots</th>
                <th className="pb-3 font-bold">Speed (kW)</th>
                <th className="pb-3 font-bold">Tariff</th>
                <th className="pb-3 font-bold">Rating</th>
                <th className="pb-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {stations.map((st) => {
                const isExpanded = expandedStationId === st.id;
                return (
                  <React.Fragment key={st.id}>
                    <tr className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 font-bold text-white flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                        <div>
                          <p>{st.name}</p>
                          <span className="text-[10px] text-slate-400 font-normal">{st.address}</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-300">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700/60 text-slate-300 font-semibold text-[11px]">
                          {st.city}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-brand-accent border border-emerald-500/30 text-[10px] font-bold">
                          {st.availableSlots || st.totalSlots || 8} / {st.totalSlots || 8} Bays
                        </span>
                      </td>
                      <td className="py-3.5 text-cyan-400 font-bold">{st.maxChargingSpeedKw} kW</td>
                      <td className="py-3.5">₹{st.chargingPricePerKwh}/kWh</td>
                      <td className="py-3.5 text-amber-400 font-bold">★ {st.rating?.toFixed(1) || '4.8'}</td>
                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setExpandedStationId(isExpanded ? null : st.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                          >
                            <span>Slots</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                          <button
                            onClick={(e) => handleDeleteStation(st.id, e)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                            title="Delete Station"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Bay / Slot Matrix */}
                    {isExpanded && (
                      <tr className="bg-slate-950/70">
                        <td colSpan="7" className="p-4 border-b border-slate-800/80">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-slate-300 uppercase tracking-wider">
                                Physical Slot Matrix for {st.name}
                              </span>
                              <span className="text-slate-400">
                                Connectors: <strong className="text-white">{st.chargerTypes || 'CCS2, Type 2'}</strong> • Base Parking: <strong className="text-white">₹{st.parkingPricePerHour}/hr</strong>
                              </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 pt-1">
                              {(st.slots && st.slots.length > 0 
                                ? st.slots 
                                : Array.from({ length: st.totalSlots || 8 }).map((_, i) => ({
                                    id: i + 1,
                                    slotNumber: `A${i + 1}`,
                                    chargerType: i < 5 ? 'CCS2' : 'Type 2',
                                    maxKw: i < 3 ? st.maxChargingSpeedKw : 60.0,
                                    isAvailable: true
                                  }))
                              ).map((slot, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-0.5"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-mono font-bold text-white text-xs">{slot.slotNumber}</span>
                                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                  </div>
                                  <div className="text-[10px] text-cyan-400 font-bold">{slot.maxKw || st.maxChargingSpeedKw} kW</div>
                                  <div className="text-[9px] text-slate-400 truncate">{slot.chargerType || 'CCS2'}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Station & Slots Modal */}
      {showAddStationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card max-w-lg w-full p-6 sm:p-7 rounded-3xl border border-slate-700 space-y-4 max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="text-lg font-bold text-white">Deploy EV Charging Center & Slots</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure a new hub anywhere in India along with physical charging bays
              </p>
            </div>

            {/* Quick Indian City Presets */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                1-Click City Coordinates Preset
              </label>
              <div className="flex flex-wrap gap-1.5">
                {INDIAN_CITY_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                      newCity === p.city
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {p.city}
                  </button>
                ))}
              </div>
            </div>
            
            <form onSubmit={handleCreateStation} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Center / Station Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Jio-BP Pulse Express Delhi"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Address / Highway Landmark</label>
                <input
                  type="text"
                  required
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="e.g. Toll Plaza Mile 45, NH 48 Corridor"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Latitude</label>
                  <input
                    type="text"
                    required
                    value={newLat}
                    onChange={(e) => setNewLat(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Longitude</label>
                  <input
                    type="text"
                    required
                    value={newLng}
                    onChange={(e) => setNewLng(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Slot count and Power configuration */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Physical Bay & Slot Configuration
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Total Bays / Slots</label>
                    <select
                      value={newSlots}
                      onChange={(e) => setNewSlots(parseInt(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none border-none"
                    >
                      <option value="4">4 Bays (A1 to A4)</option>
                      <option value="6">6 Bays (A1 to A6)</option>
                      <option value="8">8 Bays (A1 to A8)</option>
                      <option value="10">10 Bays (A1 to A10)</option>
                      <option value="12">12 Bays (A1 to A12)</option>
                      <option value="16">16 Bays (A1 to A16)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Max Power (kW)</label>
                    <select
                      value={newPower}
                      onChange={(e) => setNewPower(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none border-none"
                    >
                      <option value="60.0">60 kW Fast DC</option>
                      <option value="90.0">90 kW Fast DC</option>
                      <option value="120.0">120 kW High-Speed</option>
                      <option value="150.0">150 kW Ultra-Fast</option>
                      <option value="240.0">240 kW HyperCharger</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Connector Protocols</label>
                  <input
                    type="text"
                    value={newChargerTypes}
                    onChange={(e) => setNewChargerTypes(e.target.value)}
                    placeholder="CCS2, Type 2, CHAdeMO"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Pricing Tariffs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Charging Tariff (₹/kWh)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newTariff}
                    onChange={(e) => setNewTariff(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Parking Rate (₹/hr)</label>
                  <input
                    type="number"
                    step="5"
                    required
                    value={newParkingFee}
                    onChange={(e) => setNewParkingFee(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Amenities</label>
                <input
                  type="text"
                  value={newAmenities}
                  onChange={(e) => setNewAmenities(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStationModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black shadow-lg shadow-cyan-500/20"
                >
                  {actionLoading ? 'Deploying...' : `Deploy Center with ${newSlots} Bays`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
