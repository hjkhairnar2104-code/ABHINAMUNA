import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Zap, Battery, Car, Star, ShieldCheck, ArrowRight, Sparkles, Filter, Clock, MapPin, AlertTriangle, CheckCircle2, Compass, Layers, Search, RefreshCw } from 'lucide-react';
import { navigationApi, stationApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Custom Leaflet Icons for EV charging hubs
const createCustomIcon = (isRecommended, isSelected, isNew = false) => {
  let bg = '#0d9488';
  if (isNew) bg = '#059669'; // Vibrant emerald for newly deployed stations
  if (isRecommended) bg = '#00b4a7';
  if (isSelected) bg = '#0284c7';

  const border = isNew ? '3px solid #fde047' : '3px solid #ffffff';
  const badgeHtml = isNew ? `<div style="position:absolute; top:-24px; left:50%; transform:translateX(-50%); background:#059669; color:#fef08a; font-size:9px; font-weight:900; border-radius:6px; padding:1px 5px; border:1px solid #fde047; white-space:nowrap; box-shadow:0 2px 6px rgba(0,0,0,0.3);">★ NEW</div>` : '';

  return L.divIcon({
    className: 'custom-ev-marker',
    html: `
      <div style="position:relative; width:36px; height:36px;">
        ${badgeHtml}
        <div style="
          background: ${bg};
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: ${border};
          box-shadow: 0 4px 14px ${isNew ? 'rgba(5, 150, 105, 0.6)' : 'rgba(0, 168, 150, 0.4)'};
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: bold;
          font-size: 16px;
          transform: translate(-18px, -18px);
          cursor: pointer;
        ">
          ⚡
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
};

const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'user-gps-marker',
    html: `
      <div style="position:relative; width:34px; height:34px;">
        <div style="position:absolute; width:100%; height:100%; border-radius:50%; background:rgba(2,132,199,0.35); animation:ping 1.8s cubic-bezier(0,0,0.2,1) infinite;"></div>
        <div style="position:relative; width:22px; height:22px; top:6px; left:6px; border-radius:50%; background:#0284c7; border:3px solid #ffffff; box-shadow:0 3px 12px rgba(2,132,199,0.6); display:flex; align-items:center; justify-content:center; color:white; font-size:11px;">
          📍
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });
};

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 10) / 10;
}

// Component to dynamically fit map bounds to route or coordinates
function MapAutoBounds({ polyline, stations, userLocation }) {
  const map = useMap();
  useEffect(() => {
    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 13, { duration: 1.5 });
    } else if (polyline && polyline.length > 0) {
      const bounds = L.latLngBounds(polyline);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else if (stations && stations.length > 0) {
      const bounds = L.latLngBounds(stations.map(s => [s.latitude, s.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [polyline, stations, userLocation, map]);
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
  const { user } = useAuth();
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
  const [searchFilter, setSearchFilter] = useState('');
  const [viewScope, setViewScope] = useState('CORRIDOR'); // 'CORRIDOR', 'ALL', 'NEW'
  const [refreshing, setRefreshing] = useState(false);

  // Live GPS Location State
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [isNearbyMode, setIsNearbyMode] = useState(false);

  const fetchAllStations = async () => {
    try {
      setRefreshing(true);
      const res = await stationApi.getAll();
      setAllStations(res.data || []);
    } catch (err) {
      console.error('Error fetching stations:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Load initial stations & setup focus auto-sync
  useEffect(() => {
    fetchAllStations();
    triggerRoutePlanning(origin, destination);

    const onFocus = () => fetchAllStations();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
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

  // Auto-detect location if URL requested it
  useEffect(() => {
    if (searchParams.get('gps') === 'auto' || searchParams.get('mode') === 'nearby') {
      handleShareLiveLocation();
    }
  }, [searchParams]);

  const applyCoordinates = async (latitude, longitude, cityName = '') => {
    let resolvedCity = cityName;
    if (!resolvedCity) {
      if (latitude >= 18.4 && latitude <= 18.7 && longitude >= 73.6 && longitude <= 74.05) {
        resolvedCity = 'Pune (Wakad / Hinjewadi)';
      } else if (latitude >= 18.9 && latitude <= 19.3 && longitude >= 72.7 && longitude <= 73.15) {
        resolvedCity = 'Mumbai (ISP Gateway)';
      }
    }

    const userLoc = { lat: latitude, lng: longitude, city: resolvedCity };
    setUserLocation(userLoc);
    setIsNearbyMode(true);
    setLocating(false);

    let nearbyList = [];
    try {
      const res = await stationApi.getNearby(latitude, longitude, 100.0);
      if (res.data && res.data.length > 0) {
        nearbyList = res.data;
      }
    } catch (err) {
      console.warn('Backend nearby fallback:', err);
    }

    // Merge or fallback to all stations and sort by distance
    if (nearbyList.length === 0) {
      const stationsRes = allStations.length > 0 ? allStations : (await stationApi.getAll()).data || [];
      nearbyList = [...stationsRes];
    }

    nearbyList.sort((a, b) => {
      const distA = calculateDistanceKm(latitude, longitude, a.latitude, a.longitude) ?? 9999;
      const distB = calculateDistanceKm(latitude, longitude, b.latitude, b.longitude) ?? 9999;
      return distA - distB;
    });

    if (nearbyList.length > 0) {
      setAllStations(nearbyList);
      setSelectedStation(nearbyList[0].id);
      const closestDist = calculateDistanceKm(latitude, longitude, nearbyList[0].latitude, nearbyList[0].longitude);
      setLocationStatus(`📍 ${resolvedCity || `${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`} • Nearest: ${nearbyList[0].name} (${closestDist} km)`);
    } else {
      setLocationStatus(`📍 Live: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`);
    }
  };

  const handleShareLiveLocation = () => {
    setLocating(true);
    setLocationStatus('Detecting live location via Wi-Fi/GPS...');

    const onResolvedCoords = (lat, lng, cityLabel) => {
      let resolved = cityLabel;
      if (!resolved) {
        if (lat >= 18.4 && lat <= 18.7 && lng >= 73.6 && lng <= 74.05) {
          resolved = 'Pune (Wakad / Hinjewadi)';
        } else if (lat >= 18.9 && lat <= 19.3 && lng >= 72.7 && lng <= 73.15) {
          resolved = 'Mumbai (ISP Gateway)';
        }
      }
      applyCoordinates(lat, lng, resolved);
    };

    if (navigator.geolocation) {
      // Step 1: Attempt high accuracy first (uses Wi-Fi BSSID triangulation if available)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          onResolvedCoords(latitude, longitude);
        },
        (highAccErr) => {
          console.warn('High accuracy geolocation timed out/failed, trying standard accuracy:', highAccErr);
          // Step 2: Try standard accuracy
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude } = pos.coords;
              onResolvedCoords(latitude, longitude);
            },
            async (stdErr) => {
              console.warn('Browser GPS permission not granted/failed, checking IP geolocation:', stdErr);
              try {
                const ipRes = await fetch('https://ipapi.co/json/');
                const ipData = await ipRes.json();
                if (ipData && ipData.latitude && ipData.longitude) {
                  const isMumbai = (ipData.city || '').toLowerCase().includes('mumbai') || 
                                   (ipData.latitude >= 18.9 && ipData.latitude <= 19.3);
                  const displayCity = isMumbai ? 'Mumbai (ISP Gateway)' : (ipData.city || 'Detected Location');
                  onResolvedCoords(ipData.latitude, ipData.longitude, displayCity);
                  return;
                }
              } catch (ipErr) {
                console.warn('IP lookup fallback failed, defaulting to Pune EV corridor hub:', ipErr);
              }
              // Default fallback to Pune EV Hub
              onResolvedCoords(18.5987, 73.7634, 'Pune (Wakad / Hinjewadi)');
            },
            { enableHighAccuracy: false, timeout: 5000 }
          );
        },
        { enableHighAccuracy: true, timeout: 7000, maximumAge: 10000 }
      );
    } else {
      fetch('https://ipapi.co/json/')
        .then(r => r.json())
        .then(ipData => {
          if (ipData?.latitude && ipData?.longitude) {
            const isMumbai = (ipData.city || '').toLowerCase().includes('mumbai') || 
                             (ipData.latitude >= 18.9 && ipData.latitude <= 19.3);
            const displayCity = isMumbai ? 'Mumbai (ISP Gateway)' : (ipData.city || 'Detected Location');
            onResolvedCoords(ipData.latitude, ipData.longitude, displayCity);
          } else {
            onResolvedCoords(18.5987, 73.7634, 'Pune (Wakad / Hinjewadi)');
          }
        })
        .catch(() => onResolvedCoords(18.5987, 73.7634, 'Pune (Wakad / Hinjewadi)'));
    }
  };

  const handleResetLocationMode = () => {
    setUserLocation(null);
    setIsNearbyMode(false);
    setLocationStatus('');
    stationApi.getAll().then(res => setAllStations(res.data || []));
    triggerRoutePlanning(origin, destination);
  };

  const handleCorridorClick = (from, to) => {
    setOrigin(from);
    setDestination(to);
    setIsNearbyMode(false);
    triggerRoutePlanning(from, to);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setIsNearbyMode(false);
    triggerRoutePlanning(origin, destination);
  };

  // Extract display stations along route or fallback to all stations
  const routeStations = (!routePlan?.allStationsAlongRoute || routePlan.allStationsAlongRoute.length === 0)
    ? []
    : routePlan.allStationsAlongRoute.map(item => item.station || item);

  const routeStationIds = new Set(routeStations.map(s => s.id));

  // Newly added stations (created from admin side)
  const newlyAddedStations = allStations.filter(s => s.isNewlyAdded || s.id > 50 || s.corridor === 'Custom-Admin');

  // Select base stations based on viewScope, nearby mode, or search query
  let baseStations = [];
  if (isNearbyMode || viewScope === 'ALL' || searchFilter.trim() !== '') {
    baseStations = allStations;
  } else if (viewScope === 'NEW') {
    baseStations = newlyAddedStations.length > 0 ? newlyAddedStations : allStations;
  } else {
    // CORRIDOR Mode: Show corridor stations + automatically include any newly deployed admin stations!
    const nonRouteNewStations = newlyAddedStations.filter(s => !routeStationIds.has(s.id));
    baseStations = [...routeStations, ...nonRouteNewStations];
    if (baseStations.length === 0) baseStations = allStations;
  }

  // If user location is active, sort stations by proximity to the user!
  let rawStations = baseStations;
  if (userLocation) {
    rawStations = [...baseStations].sort((a, b) => {
      const distA = calculateDistanceKm(userLocation.lat, userLocation.lng, a.latitude, a.longitude) ?? 9999;
      const distB = calculateDistanceKm(userLocation.lat, userLocation.lng, b.latitude, b.longitude) ?? 9999;
      return distA - distB;
    });
  }

  const displayStations = rawStations.filter(st => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (st.name && st.name.toLowerCase().includes(q)) || 
           (st.city && st.city.toLowerCase().includes(q)) ||
           (st.address && st.address.toLowerCase().includes(q));
  });

  const polylineCoords = routePlan?.routeCoordinates || [
    [28.6139, 77.2090],
    [28.1750, 77.5850],
    [27.4924, 77.6737],
    [27.1767, 78.0081]
  ];

  const topRec = routePlan?.topRecommendation;

  return (
    <div className="relative h-[calc(100vh-4rem)] sm:h-[calc(100vh-4.5rem)] w-full overflow-hidden flex flex-col lg:flex-row bg-[#f4f7fb]">
      
      {/* LEFT CONTROL SIDEBAR - WHITE BACKGROUND */}
      <div className="w-full lg:w-[480px] h-full overflow-y-auto bg-white border-r border-slate-200 p-4 sm:p-5 z-20 flex flex-col gap-4 shadow-sm">
        
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#00a896]" />
              <span>Find EV Charging Stations</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live slot availability, fast charging & route battery optimization
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchAllStations();
                triggerRoutePlanning(origin, destination);
              }}
              disabled={refreshing}
              className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-[#00a896] border border-slate-200 transition-all cursor-pointer"
              title="Refresh Live Station Grid"
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin text-[#00a896]' : ''}`} />
              <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
            </button>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-[#00a896] border border-teal-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Grid</span>
            </span>
          </div>
        </div>

        {/* Live Location Sharing & Nearest Station Finder */}
        <div className="bg-gradient-to-r from-sky-50 via-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-3.5 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#00a896] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                📍
              </span>
              <div>
                <span className="text-xs font-black text-slate-800 block">
                  Live Location & Nearest EV Hubs
                </span>
                <span className="text-[10px] text-slate-500">
                  Find closest charging stations using GPS or quick city hubs
                </span>
              </div>
            </div>
            {userLocation && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase">
                GPS Live
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            {!userLocation ? (
              <button
                type="button"
                onClick={handleShareLiveLocation}
                disabled={locating}
                className="flex-1 py-2 px-3 rounded-xl bg-[#00a896] hover:bg-[#008f80] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.01] cursor-pointer"
              >
                {locating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Detecting High-Accuracy Location...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Detect Live Location (Find Nearest)</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-2 w-full">
                <div className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-teal-300 text-[11px] font-bold text-teal-800 truncate flex items-center gap-1.5 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <span className="truncate">{locationStatus}</span>
                </div>
                <button
                  type="button"
                  onClick={handleResetLocationMode}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold cursor-pointer shrink-0"
                >
                  Reset
                </button>
              </div>
            )}
          </div>

          {/* Quick Hub Switcher Buttons */}
          <div className="pt-1 border-t border-teal-100/60 flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quick Hub:</span>
            <button
              type="button"
              onClick={() => applyCoordinates(18.5987, 73.7634, 'Pune (Wakad / Hinjewadi)')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border flex items-center gap-1 cursor-pointer ${
                userLocation?.city?.toLowerCase().includes('pune')
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:text-teal-700'
              }`}
            >
              <span>📍</span>
              <span>Pune (Wakad)</span>
            </button>
            <button
              type="button"
              onClick={() => applyCoordinates(19.0600, 72.8656, 'Mumbai (BKC)')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border flex items-center gap-1 cursor-pointer ${
                userLocation?.city?.toLowerCase().includes('mumbai') && !userLocation?.city?.toLowerCase().includes('pune')
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:text-teal-700'
              }`}
            >
              <span>📍</span>
              <span>Mumbai</span>
            </button>
            <button
              type="button"
              onClick={() => applyCoordinates(28.6139, 77.2090, 'Delhi NCR')}
              className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-white text-slate-600 border border-slate-200 hover:border-teal-400 hover:text-teal-700 transition-all cursor-pointer"
            >
              Delhi NCR
            </button>
            <button
              type="button"
              onClick={() => applyCoordinates(12.9716, 77.5946, 'Bengaluru')}
              className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-white text-slate-600 border border-slate-200 hover:border-teal-400 hover:text-teal-700 transition-all cursor-pointer"
            >
              Bengaluru
            </button>
          </div>

          {/* Helpful ISP Gateway Explanation Alert if Mumbai is Detected */}
          {userLocation && (userLocation.city?.toLowerCase().includes('mumbai') || locationStatus.toLowerCase().includes('mumbai')) && (
            <div className="p-2.5 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-900 flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="text-amber-600 text-sm">💡</span>
                <span>
                  Desktop IP routed via <strong>Mumbai Gateway</strong>. If in <strong>Pune</strong>:
                </span>
              </div>
              <button
                type="button"
                onClick={() => applyCoordinates(18.5987, 73.7634, 'Pune (Wakad / Hinjewadi)')}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] shrink-0 cursor-pointer shadow-xs transition-all hover:scale-105"
              >
                📍 Switch to Pune Hub
              </button>
            </div>
          )}
        </div>

        {/* Quick Corridor Selection Pills */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Popular Expressways
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
                      ? 'bg-teal-50 border-[#00a896] text-[#00a896] font-bold shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-teal-300 hover:bg-white'
                  }`}
                >
                  <span className="text-[11px] font-semibold truncate">{c.label}</span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-white text-slate-500 border border-slate-200 shrink-0 ml-1">
                    {c.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Route Planner Form */}
        <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-[#00a896]" />
              <span>Route & Range Calculator</span>
            </span>
            <span className="text-[10px] bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-medium">
              GPS Navigation
            </span>
          </div>

          <form onSubmit={handleSearchSubmit} className="space-y-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-sm focus-within:border-teal-500">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <div className="flex-1">
                <label className="text-[9px] text-slate-400 uppercase font-bold block">Start City</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. Delhi, Pune, Chennai"
                  className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-sm focus-within:border-teal-500">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0" />
              <div className="flex-1">
                <label className="text-[9px] text-slate-400 uppercase font-bold block">Destination City</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Agra, Mumbai, Bengaluru"
                  className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Vehicle and Battery SOC selector */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <div className="p-2 bg-white rounded-xl border border-slate-200 text-xs shadow-sm">
                <label className="text-[9px] text-slate-400 uppercase font-bold block mb-1">Battery (SOC)</label>
                <div className="flex items-center gap-1.5">
                  <Battery className="w-4 h-4 text-emerald-500 shrink-0" />
                  <input
                    type="number"
                    value={batteryPct}
                    min="5"
                    max="100"
                    onChange={(e) => setBatteryPct(Number(e.target.value))}
                    className="w-12 bg-slate-100 px-1 py-0.5 rounded text-xs font-bold text-slate-800 text-center focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-500 font-bold">%</span>
                </div>
              </div>

              <div className="p-2 bg-white rounded-xl border border-slate-200 text-xs shadow-sm">
                <label className="text-[9px] text-slate-400 uppercase font-bold block mb-1">EV Model</label>
                <select
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  className="w-full bg-slate-100 text-[11px] font-semibold text-slate-800 rounded p-1 focus:outline-none border-none"
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
              className="w-full py-2.5 rounded-xl bg-[#00a896] hover:bg-[#008f80] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-teal-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Calculating Route...' : 'Calculate Live Corridor Route'}</span>
            </button>
          </form>
        </div>

        {/* AI SMART RECOMMENDATION CARD */}
        {topRec && topRec.station && (
          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#00a896] text-white text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3 h-3" />
                AI Optimum Waypoint
              </span>
              <span className="text-xs font-bold text-slate-700">
                Score: <span className="text-[#00a896] font-mono">{topRec.aiRecommendationScore?.toFixed(1) || 96}%</span>
              </span>
            </div>

            <h3 className="text-sm font-extrabold text-slate-800 mb-0.5">
              {topRec.station.name}
            </h3>
            <p className="text-[11px] text-slate-600 truncate mb-2">
              {topRec.station.address}, {topRec.station.city}
            </p>

            <div className="grid grid-cols-3 gap-2 p-2 bg-white rounded-xl border border-teal-100 text-[11px] text-center shadow-xs">
              <div>
                <span className="text-[9px] text-slate-400 block font-bold">Speed</span>
                <span className="font-bold text-[#00a896]">{topRec.station.maxChargingSpeedKw || 120} kW</span>
              </div>
              <div className="border-x border-slate-100">
                <span className="text-[9px] text-slate-400 block font-bold">Price</span>
                <span className="font-bold text-slate-700">₹{topRec.station.chargingPricePerKwh || 18}/kWh</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block font-bold">Slots</span>
                <span className="font-bold text-emerald-600">{topRec.station.availableSlots || 8} Free</span>
              </div>
            </div>

            <Link
              to={user ? `/stations/${topRec.station.id}` : '/login'}
              className="mt-3 w-full py-2 rounded-xl bg-[#00a896] hover:bg-[#008f80] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <span>{user ? 'Book Bay & Slots' : 'Login to Book Slot'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Filter / Search Bar */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search stations by name, area or city..."
            className="w-full bg-transparent text-xs text-slate-700 focus:outline-none"
          />
          {searchFilter && (
            <button onClick={() => setSearchFilter('')} className="text-xs text-slate-400 hover:text-slate-600 font-bold">
              ✕
            </button>
          )}
        </div>

        {/* Scope View Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setViewScope('CORRIDOR')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
              viewScope === 'CORRIDOR' && !searchFilter.trim()
                ? 'bg-white text-[#00a896] shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🛣️ Route ({routeStations.length})
          </button>
          <button
            type="button"
            onClick={() => setViewScope('ALL')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
              viewScope === 'ALL' || searchFilter.trim()
                ? 'bg-white text-sky-600 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🌐 All Grid ({allStations.length})
          </button>
          {newlyAddedStations.length > 0 && (
            <button
              type="button"
              onClick={() => setViewScope('NEW')}
              className={`py-1.5 px-2.5 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                viewScope === 'NEW' && !searchFilter.trim()
                  ? 'bg-emerald-600 text-white shadow-xs font-black'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <span>★ New</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                {newlyAddedStations.length}
              </span>
            </button>
          )}
        </div>

        {/* ALL STATIONS LIST ALONG ROUTE */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                {isNearbyMode 
                  ? '📍 Nearest Stations to You' 
                  : (viewScope === 'ALL' || searchFilter.trim() ? 'All Network Charging Hubs' : (viewScope === 'NEW' ? 'Newly Added Stations' : 'Stations Along Route'))} ({displayStations.length})
              </h4>
              {isNearbyMode && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase">
                  Sorted by GPS
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400">Live Availability</span>
          </div>

          <div className="space-y-2">
            {displayStations.map((st, idx) => {
              const freeSlots = st.available_slots !== undefined ? st.available_slots : (st.availableSlots !== undefined ? st.availableSlots : 8);
              const totalSlots = st.total_slots !== undefined ? st.total_slots : (st.totalSlots !== undefined ? st.totalSlots : 10);
              const isSelected = selectedStation === st.id;
              const isNewlyAdded = Boolean(st.isNewlyAdded || st.id > 50 || st.corridor === 'Custom-Admin');
              const distanceKm = userLocation 
                ? calculateDistanceKm(userLocation.lat, userLocation.lng, st.latitude, st.longitude)
                : (st.distanceFromRouteKm || null);

              return (
                <div
                  key={st.id}
                  onClick={() => setSelectedStation(st.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-50/60 border-[#00a896] shadow-sm'
                      : (isNewlyAdded ? 'bg-emerald-50/20 border-emerald-300 hover:border-emerald-500 hover:shadow-xs' : 'bg-white border-slate-200 hover:border-teal-300 hover:shadow-xs')
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <img 
                      src={st.imageUrl || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=160&q=80'}
                      alt={st.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h5 className="text-xs font-extrabold text-slate-800 truncate">
                            {st.name}
                          </h5>
                          {isNewlyAdded && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-black text-[9px] border border-emerald-300 flex items-center gap-0.5 shrink-0">
                              ★ New
                            </span>
                          )}
                          {isNearbyMode && idx === 0 && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-white font-extrabold text-[8px] uppercase tracking-wide shrink-0">
                              Closest
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-amber-500 flex items-center gap-0.5 shrink-0">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{st.rating?.toFixed(1) || '4.7'}</span>
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{st.address}, {st.city}</p>

                      {/* Distance & Facility Badges */}
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {distanceKm !== null && (
                          <span className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] flex items-center gap-0.5 ${
                            isNearbyMode && idx === 0 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : 'bg-sky-50 text-sky-700 border border-sky-200'
                          }`}>
                            <span>📍</span>
                            <span>{distanceKm} km away</span>
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[10px]">
                          {freeSlots} / {totalSlots} Free
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {st.maxChargingSpeedKw || 120} kW
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
                    <span className="text-slate-700 font-bold">
                      ₹{st.chargingPricePerKwh || 18}/kWh
                    </span>
                    <Link
                      to={user ? `/stations/${st.id}` : '/login'}
                      className={`px-3 py-1 rounded-lg text-white text-[10px] font-extrabold transition-all shadow-xs ${
                        user ? 'bg-[#00a896] hover:bg-[#008f80]' : 'bg-slate-800 hover:bg-slate-900'
                      }`}
                    >
                      {user ? 'Book Bay' : 'Login to Book'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT LEAFLET MAP VIEWPORT - CLEAN & CRISP */}
      <div className="flex-1 h-full w-full relative">
        <MapContainer
          center={polylineCoords[0] || [28.6139, 77.2090]}
          zoom={8}
          className="h-full w-full"
          scrollWheelZoom={true}
        >
          {/* Standard OpenStreetMap tiles matching user request */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          <MapAutoBounds polyline={polylineCoords} stations={displayStations} userLocation={userLocation} />

          {/* User Live GPS Marker */}
          {userLocation && (
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={createUserLocationIcon()}
            >
              <Popup>
                <div className="p-1.5 text-center font-sans">
                  <div className="text-xs font-black text-sky-800">📍 You Are Here</div>
                  <div className="text-[10px] text-slate-500 font-medium">Live GPS Location Active</div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Expressway Highway Polyline */}
          <Polyline
            positions={polylineCoords}
            pathOptions={{
              color: '#00a896',
              weight: 5,
              opacity: 0.85
            }}
          />

          {/* Markers for all corridor stations */}
          {displayStations.map((st) => {
            const isRec = topRec?.station?.id === st.id;
            const isSel = selectedStation === st.id;
            const freeSlots = st.available_slots !== undefined ? st.available_slots : (st.availableSlots !== undefined ? st.availableSlots : 8);
            const totalSlots = st.total_slots !== undefined ? st.total_slots : (st.totalSlots !== undefined ? st.totalSlots : 10);

            const isNew = Boolean(st.isNewlyAdded || st.id > 50 || st.corridor === 'Custom-Admin');

            return (
              <Marker
                key={st.id}
                position={[st.latitude, st.longitude]}
                icon={createCustomIcon(isRec, isSel, isNew)}
                eventHandlers={{
                  click: () => setSelectedStation(st.id)
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-2 text-slate-800 max-w-[240px]">
                    <div className="flex items-center gap-1.5 mb-1 justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <h4 className="font-bold text-sm text-slate-900 leading-tight truncate">{st.name}</h4>
                      </div>
                      {isNew && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-black border border-emerald-300 shrink-0">
                          ★ NEW
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{st.address}, {st.city}</p>
                    <div className="flex items-center justify-between text-xs mb-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span className="font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]">
                        {freeSlots} / {totalSlots} Free
                      </span>
                      <span className="text-slate-700 font-bold">
                        {st.maxChargingSpeedKw || 120} kW
                      </span>
                      <span className="text-[#00a896] font-bold">
                        ₹{st.chargingPricePerKwh || 18}/kWh
                      </span>
                    </div>
                    <button
                      onClick={() => navigate(user ? `/stations/${st.id}` : '/login')}
                      className="w-full py-1.5 px-3 bg-[#00a896] text-white rounded-lg text-xs font-bold hover:bg-[#008f80] transition-colors shadow-sm"
                    >
                      {user ? 'Book Slot Now' : 'Login to Book Slot'}
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Floating Route Info Pill on top of Map */}
        <div className="absolute top-4 right-4 z-[400] bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-3 text-xs shadow-md border border-slate-200">
          <span className="flex items-center gap-1.5 font-bold text-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00a896] animate-pulse" />
            <span>Corridor Active</span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-[#00a896] font-extrabold">{origin} ⇄ {destination}</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600 font-bold font-mono">
            {displayStations.length} EV Hubs
          </span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
