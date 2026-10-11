import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Zap, Battery, Car, Star, ShieldCheck, ArrowRight, Sparkles, Filter, Clock, MapPin, AlertTriangle, CheckCircle2, Compass, Layers } from 'lucide-react';
import { navigationApi, stationApi } from '../services/api';

// Custom Leaflet Icons for EV charging hubs
const createCustomIcon = (isRecommended, isSelected) => {
  const bg = isRecommended ? '#00e699' : (isSelected ? '#06b6d4' : '#0284c7');
  return L.divIcon({
    className: 'custom-ev-marker',
    html: `
      <div style="
        background: ${bg};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid #ffffff;
        box-shadow: 0 0 15px ${bg}aa;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #000;
        font-weight: bold;
        font-size: 14px;
        transform: translate(-16px, -16px);
      ">
        ⚡
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

// Component to dynamically fit map bounds to route or coordinates
function MapAutoBounds({ polyline, stations }) {
  const map = useMap();
  useEffect(() => {
    if (polyline && polyline.length > 0) {
      const bounds = L.latLngBounds(polyline);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else if (stations && stations.length > 0) {
      const bounds = L.latLngBounds(stations.map(s => [s.latitude, s.longitude]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [polyline, stations, map]);
  return null;
}

// Pre-defined Pan-India High-Traffic Corridors
const PAN_INDIA_CORRIDORS = [
  { label: 'Delhi ⇄ Agra', from: 'Delhi', to: 'Agra', badge: 'Yamuna Exp.' },
  { label: 'Delhi ⇄ Jaipur', from: 'Delhi', to: 'Jaipur', badge: 'NH 48' },
  { label: 'Bengaluru ⇄ Chennai', from: 'Bengaluru', to: 'Chennai', badge: 'NH 48' },
  { label: 'Bengaluru ⇄ Mysuru', from: 'Bengaluru', to: 'Mysuru', badge: 'Exp.' },
  { label: 'Pune ⇄ Mumbai', from: 'Pune', to: 'Mumbai', badge: 'NH 48' },
  { label: 'Mumbai ⇄ Goa', from: 'Mumbai', to: 'Goa', badge: 'NH 66' },
  { label: 'Hyderabad ⇄ Bengaluru', from: 'Hyderabad', to: 'Bengaluru', badge: 'NH 44' },
  { label: 'Ahmedabad ⇄ Vadodara', from: 'Ahmedabad', to: 'Vadodara', badge: 'NE 1' },
];

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [origin, setOrigin] = useState(searchParams.get('from') || 'Delhi');
  const [destination, setDestination] = useState(searchParams.get('to') || 'Agra');
  const [batteryPct, setBatteryPct] = useState(38);
  const [vehicleModel, setVehicleModel] = useState('Tata Nexon EV Max');

  const [loading, setLoading] = useState(false);
  const [routePlan, setRoutePlan] = useState(null);
  const [allStations, setAllStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);

  // Load initial stations
  useEffect(() => {
    stationApi.getAll()
      .then(res => {
        setAllStations(res.data || []);
      })
      .catch(err => console.error('Error fetching stations:', err));

    triggerRoutePlanning(origin, destination);
  }, []);

  const triggerRoutePlanning = async (fromCity = origin, toCity = destination) => {
    setLoading(true);
    try {
      const res = await navigationApi.planRoute({
        origin: fromCity,
        destination: toCity,
        currentBatteryPct: batteryPct,
        batteryCapacityKwh: 40.5,
        vehicleModel,
        connectorType: 'CCS2'
      });
      setRoutePlan(res.data);
      if (res.data.recommendedStationId) {
        setSelectedStation(res.data.recommendedStationId);
      }
    } catch (err) {
      console.error('Route plan error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCorridorClick = (from, to) => {
    setOrigin(from);
    setDestination(to);
    triggerRoutePlanning(from, to);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    triggerRoutePlanning(origin, destination);
  };

  // Extract display stations along route or fallback to all stations
  const displayStations = (routePlan?.allStationsAlongRoute && routePlan.allStationsAlongRoute.length > 0)
    ? routePlan.allStationsAlongRoute.map(item => item.station || item)
    : allStations;

  const polylineCoords = routePlan?.routeCoordinates || [
    [28.6139, 77.2090],
    [28.1750, 77.5850],
    [27.4924, 77.6737],
    [27.1767, 78.0081]
  ];

  const topRec = routePlan?.topRecommendation;

  return (
    <div className="relative h-[calc(100vh-5rem)] w-full overflow-hidden flex flex-col lg:flex-row bg-brand-dark">
      
      {/* LEFT CONTROL SIDEBAR */}
      <div className="w-full lg:w-[500px] h-full overflow-y-auto bg-slate-950/95 border-r border-slate-800 p-4 sm:p-5 z-20 flex flex-col gap-5 shadow-2xl backdrop-blur-xl">
        
        {/* Pan-India Expressway Corridor Quick Picker */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-accent flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              <span>Pan-India Expressway Corridors</span>
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-brand-accent px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
              Live Network
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {PAN_INDIA_CORRIDORS.map((c, idx) => {
              const isActive = origin.toLowerCase().includes(c.from.toLowerCase()) && 
                               destination.toLowerCase().includes(c.to.toLowerCase());
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleCorridorClick(c.from, c.to)}
                  className={`py-1.5 px-2.5 rounded-xl text-left transition-all border flex items-center justify-between ${
                    isActive
                      ? 'bg-emerald-500/20 border-emerald-500 text-brand-accent shadow-sm'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <span className="text-[11px] font-bold truncate">{c.label}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 shrink-0 ml-1">
                    {c.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Route Planner Form */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              <span>Custom Route & SOC Optimization</span>
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
              Dynamic GPS
            </span>
          </div>

          <form onSubmit={handleSearchSubmit} className="space-y-2.5">
            <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
              <div className="flex-1">
                <label className="text-[9px] text-slate-500 uppercase font-bold block">Start City / Origin</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. Delhi, Pune, Bengaluru"
                  className="w-full bg-transparent text-xs font-bold text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0" />
              <div className="flex-1">
                <label className="text-[9px] text-slate-500 uppercase font-bold block">Destination City / Hub</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Agra, Mumbai, Chennai"
                  className="w-full bg-transparent text-xs font-bold text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Vehicle and Battery SOC selector */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="p-2 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
                <label className="text-[9px] text-slate-500 uppercase font-bold block mb-1">Current Battery (SOC)</label>
                <div className="flex items-center gap-2">
                  <Battery className="w-4 h-4 text-emerald-400" />
                  <input
                    type="number"
                    value={batteryPct}
                    min="5"
                    max="100"
                    onChange={(e) => setBatteryPct(Number(e.target.value))}
                    className="w-12 bg-slate-900 px-1 py-0.5 rounded text-xs font-bold text-white text-center focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400 font-bold">%</span>
                </div>
              </div>

              <div className="p-2 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
                <label className="text-[9px] text-slate-500 uppercase font-bold block mb-1">EV Model</label>
                <select
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  className="w-full bg-slate-900 text-[11px] font-semibold text-white rounded p-1 focus:outline-none border-none"
                >
                  <option value="Tata Nexon EV Max">Tata Nexon EV</option>
                  <option value="MG ZS EV">MG ZS EV</option>
                  <option value="Hyundai Ioniq 5">Hyundai Ioniq 5</option>
                  <option value="Mahindra XUV400">Mahindra XUV400</option>
                  <option value="BYD Atto 3">BYD Atto 3</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Calculating Live Route...' : 'Calculate Live Corridor Route'}</span>
            </button>
          </form>
        </div>

        {/* Route Details Banner */}
        {routePlan && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 text-xs">
            <div className="flex items-center justify-between text-center">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Route Distance</span>
                <p className="text-base font-black text-white">{routePlan.distanceKm} km</p>
              </div>
              <div className="border-x border-slate-800 px-3">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Est. Travel Time</span>
                <p className="text-base font-black text-cyan-400">{routePlan.durationMinutes} mins</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">En-Route EV Hubs</span>
                <p className="text-base font-black text-brand-accent">
                  {displayStations.length} Centers
                </p>
              </div>
            </div>

            {/* Charge Status Warning/Recommendation */}
            <div className={`mt-2.5 p-2.5 rounded-xl flex items-start gap-2 ${
              routePlan.chargeStatus === 'CHARGING_REQUIRED'
                ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
            }`}>
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                {routePlan.statusExplanation}
              </p>
            </div>
          </div>
        )}

        {/* AI RECOMMENDED STOP CARD */}
        {topRec && (
          <div className="bg-gradient-to-b from-emerald-950/40 via-slate-900/90 to-slate-900/90 border-2 border-emerald-500/60 rounded-3xl p-4 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[11px] font-black shadow-md">
                <Sparkles className="w-3 h-3" />
                <span>AI Recommended Stop ⭐</span>
              </span>
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{topRec.station?.rating || 4.8}</span>
              </span>
            </div>

            <h3 className="text-base font-black text-white">{topRec.station?.name}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
              <span>{topRec.station?.address}</span>
            </p>

            {/* Slot Matrix Overview */}
            <div className="mt-2.5 p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 leading-relaxed">
              <span className="font-bold text-white block mb-0.5">Why this station is selected:</span>
              {topRec.reason || routePlan?.primaryReason}
            </div>

            {/* Slots and Quick Specs */}
            <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-800 text-center text-xs">
              <div>
                <span className="text-[9px] text-slate-500 block uppercase font-bold">Detour</span>
                <span className="font-bold text-white">{topRec.station?.distance_from_route_km || 1.2} km</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block uppercase font-bold">Speed</span>
                <span className="font-bold text-cyan-400">{topRec.station?.max_charging_speed_kw || 120} kW</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block uppercase font-bold">Free Slots</span>
                <span className="font-bold text-emerald-400">
                  {topRec.station?.available_slots || topRec.station?.availableSlots || 8} Bays
                </span>
              </div>
            </div>

            {/* Quick Physical Slots Badge row */}
            {topRec.station?.slots && (
              <div className="mt-3 pt-2 border-t border-slate-800/80">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Physical Bays Status</span>
                  <span className="text-emerald-400 font-mono">
                    {topRec.station.available_slots || topRec.station.availableSlots || 8}/{topRec.station.total_slots || topRec.station.totalSlots || 10} Available
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {topRec.station.slots.slice(0, 10).map((sl) => (
                    <span
                      key={sl.id || sl.slotNumber}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        sl.isAvailable || sl.status === 'AVAILABLE'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {sl.slotNumber}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Link
              to={`/stations/${topRec.station?.id}`}
              className="mt-3 w-full py-2.5 rounded-2xl bg-brand-accent hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
            >
              <span>Book Bay & Pay via Razorpay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* ALL STATIONS LIST ALONG SELECTED INDIAN ROUTE WITH LIVE SLOTS */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Waypoints & Slots Along Route ({displayStations.length})
            </h4>
            <span className="text-[10px] text-slate-400">Live Status</span>
          </div>

          <div className="space-y-2.5">
            {displayStations.map((st) => {
              const freeSlots = st.available_slots !== undefined ? st.available_slots : (st.availableSlots !== undefined ? st.availableSlots : 8);
              const totalSlots = st.total_slots !== undefined ? st.total_slots : (st.totalSlots !== undefined ? st.totalSlots : 10);
              const isSelected = selectedStation === st.id;

              return (
                <div
                  key={st.id}
                  onClick={() => setSelectedStation(st.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/70 shadow-lg'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-brand-accent" />
                      <span>{st.name}</span>
                    </h5>
                    <span className="text-[11px] font-bold text-amber-400 flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{st.rating?.toFixed(1) || '4.7'}</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">{st.address}, {st.city}</p>

                  {/* Slot Count & Speed Badges */}
                  <div className="mt-2 flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-800/80">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                      {freeSlots} / {totalSlots} Slots Free
                    </span>
                    <span className="text-cyan-400 font-bold font-mono">
                      {st.maxChargingSpeedKw || st.max_charging_speed_kw || 120} kW
                    </span>
                    <span className="text-slate-300 font-semibold">
                      ₹{st.chargingPricePerKwh || st.price_per_kwh || 14}/kWh
                    </span>
                  </div>

                  {/* Physical Slots Chips */}
                  {st.slots && st.slots.length > 0 && (
                    <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex flex-wrap gap-1">
                      {st.slots.slice(0, 8).map((sl) => (
                        <span
                          key={sl.id || sl.slotNumber}
                          className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                            sl.isAvailable || sl.status === 'AVAILABLE'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          }`}
                          title={`Slot ${sl.slotNumber}: ${sl.chargerType || 'CCS2'}`}
                        >
                          {sl.slotNumber}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-2.5 flex justify-end">
                    <Link
                      to={`/stations/${st.id}`}
                      className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-brand-accent text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <span>Book Slot</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT LEAFLET MAP VIEWPORT */}
      <div className="flex-1 h-full w-full relative">
        <MapContainer
          center={polylineCoords[0] || [28.6139, 77.2090]}
          zoom={8}
          className="h-full w-full dark-map"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapAutoBounds polyline={polylineCoords} stations={displayStations} />

          {/* Expressway Highway Polyline */}
          <Polyline
            positions={polylineCoords}
            pathOptions={{
              color: '#00e699',
              weight: 5,
              opacity: 0.85,
              dashArray: '1, 8',
              lineCap: 'round'
            }}
          />

          {/* Polyline solid underlay */}
          <Polyline
            positions={polylineCoords}
            pathOptions={{
              color: '#0284c7',
              weight: 3,
              opacity: 0.7
            }}
          />

          {/* Markers for all corridor stations */}
          {displayStations.map((st) => {
            const isRec = topRec?.station?.id === st.id;
            const isSel = selectedStation === st.id;
            const freeSlots = st.available_slots !== undefined ? st.available_slots : (st.availableSlots !== undefined ? st.availableSlots : 8);
            const totalSlots = st.total_slots !== undefined ? st.total_slots : (st.totalSlots !== undefined ? st.totalSlots : 10);

            return (
              <Marker
                key={st.id}
                position={[st.latitude, st.longitude]}
                icon={createCustomIcon(isRec, isSel)}
                eventHandlers={{
                  click: () => setSelectedStation(st.id)
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-2 text-slate-900 max-w-[240px]">
                    <h4 className="font-bold text-sm text-slate-900">{st.name}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{st.address}, {st.city}</p>
                    <div className="mt-2 text-xs flex justify-between font-bold">
                      <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        {freeSlots} / {totalSlots} Free
                      </span>
                      <span className="text-blue-700">
                        {st.maxChargingSpeedKw || st.max_charging_speed_kw || 120} kW
                      </span>
                    </div>
                    <div className="mt-1.5 text-xs text-slate-700">
                      ₹{st.chargingPricePerKwh || st.price_per_kwh || 14}/kWh • {st.rating || 4.8} ⭐
                    </div>
                    <button
                      onClick={() => navigate(`/stations/${st.id}`)}
                      className="mt-2.5 w-full py-1.5 px-3 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors"
                    >
                      Book Slot & Access Gate
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Floating Route Info Tool on top of Map */}
        <div className="absolute top-4 right-4 z-[400] glass-panel px-4 py-2.5 rounded-2xl flex items-center gap-3 text-xs shadow-xl">
          <span className="flex items-center gap-1.5 font-bold text-white">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-accent animate-pulse" />
            <span>Active Corridor</span>
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-cyan-300 font-bold">{origin} ⇄ {destination}</span>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-400 font-bold font-mono">
            {displayStations.length} EV Hubs Live
          </span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
