import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, BatteryCharging, Zap, Plus, Trash2, Edit3, 
  CheckCircle2, RefreshCw, X, ArrowRight, ShieldCheck, Gauge
} from 'lucide-react';
import { vehicleApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const VehiclesPage = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New vehicle form state
  const [model, setModel] = useState('Tata Nexon EV Max');
  const [licensePlate, setLicensePlate] = useState('MH 12 EV 8899');
  const [batteryCapacityKwh, setBatteryCapacityKwh] = useState(40.5);
  const [currentSocPercent, setCurrentSocPercent] = useState(38.0);
  const [maxChargingPowerKw, setMaxChargingPowerKw] = useState(50.0);
  const [connectorType, setConnectorType] = useState('CCS2');

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await vehicleApi.getAll();
      setVehicles(res.data || []);
    } catch (err) {
      console.error('Error fetching vehicles', err);
      // Fallback demo garage vehicle
      setVehicles([
        {
          id: 1,
          model: 'Tata Nexon EV Max',
          licensePlate: 'MH 12 EV 8899',
          batteryCapacityKwh: 40.5,
          currentSocPercent: 38.0,
          maxChargingPowerKw: 50.0,
          connectorType: 'CCS2',
          year: 2024
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        model,
        licensePlate,
        batteryCapacityKwh: parseFloat(batteryCapacityKwh),
        currentSocPercent: parseFloat(currentSocPercent),
        maxChargingPowerKw: parseFloat(maxChargingPowerKw),
        connectorType,
        year: 2024
      };

      await vehicleApi.add(payload);
      setShowAddModal(false);
      fetchVehicles();
    } catch (err) {
      console.error('Add vehicle error', err);
      alert('Unable to register vehicle. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm('Are you sure you want to remove this vehicle from your garage?')) return;
    try {
      await vehicleApi.delete(id);
      fetchVehicles();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-[2px]">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Car className="w-5 h-5 text-brand-accent" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                EV Fleet Garage & Profiles
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage your electric vehicles, battery specs, and charging port standards
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs hover:scale-105 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Register New EV</span>
        </button>
      </div>

      {/* Vehicles Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <RefreshCw className="w-8 h-8 text-brand-accent animate-spin mb-4" />
          <p className="text-slate-400 text-xs">Loading registered EV fleet...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((v) => {
            const rangeEst = Math.round((v.batteryCapacityKwh * (v.currentSocPercent / 100)) * 6.5); // ~6.5 km per kWh
            return (
              <div
                key={v.id}
                className="glass-card p-6 sm:p-7 rounded-3xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-brand-accent bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                      {v.licensePlate}
                    </span>
                    <button
                      onClick={() => handleDeleteVehicle(v.id)}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Remove Vehicle"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-xl font-extrabold text-white mb-2">{v.model}</h3>

                  {/* Battery SOC Gauge */}
                  <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 mb-4">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <BatteryCharging className="w-4 h-4 text-brand-accent" />
                        Current State of Charge
                      </span>
                      <span className="font-extrabold text-brand-accent text-sm">
                        {v.currentSocPercent}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full"
                        style={{ width: `${v.currentSocPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 mt-2">
                      <span>Remaining Range:</span>
                      <span className="font-bold text-white">~{rangeEst} km</span>
                    </div>
                  </div>

                  {/* Vehicle Specs Grid */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs mb-6">
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                      <div className="text-[10px] text-slate-400">Pack Capacity</div>
                      <div className="font-bold text-slate-200 mt-0.5">{v.batteryCapacityKwh} kWh</div>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                      <div className="text-[10px] text-slate-400">Max DC Rate</div>
                      <div className="font-bold text-cyan-400 mt-0.5">{v.maxChargingPowerKw} kW</div>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                      <div className="text-[10px] text-slate-400">Port Standard</div>
                      <div className="font-bold text-slate-200 mt-0.5">{v.connectorType || 'CCS2'}</div>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                      <div className="text-[10px] text-slate-400">Model Year</div>
                      <div className="font-bold text-slate-200 mt-0.5">{v.year || 2024}</div>
                    </div>
                  </div>
                </div>

                {/* Link to Battery Health AI */}
                <Link
                  to="/battery-health"
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-brand-accent font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-emerald-500/20"
                >
                  <Gauge className="w-3.5 h-3.5" />
                  <span>Inspect SOH Degradation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Add EV Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card max-w-md w-full p-6 sm:p-7 rounded-3xl border border-slate-700 space-y-4 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white">Register New Electric Vehicle</h3>
              <p className="text-xs text-slate-400 mt-0.5">Add vehicle battery specifications to enable intelligent route planning</p>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Vehicle Model</label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. Tata Nexon EV, MG ZS EV, Hyundai Ioniq 5"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Registration Plate</label>
                <input
                  type="text"
                  required
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  placeholder="e.g. MH 12 EV 8899"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono uppercase focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Battery (kWh)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={batteryCapacityKwh}
                    onChange={(e) => setBatteryCapacityKwh(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Current SOC (%)</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max="100"
                    required
                    value={currentSocPercent}
                    onChange={(e) => setCurrentSocPercent(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Max DC (kW)</label>
                  <input
                    type="number"
                    step="5"
                    required
                    value={maxChargingPowerKw}
                    onChange={(e) => setMaxChargingPowerKw(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Connector</label>
                  <select
                    value={connectorType}
                    onChange={(e) => setConnectorType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-accent"
                  >
                    <option value="CCS2">CCS2 (Standard DC)</option>
                    <option value="Type 2">Type 2 (AC Slow)</option>
                    <option value="CHAdeMO">CHAdeMO</option>
                    <option value="GB/T">GB/T</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-brand-accent text-slate-950 font-bold hover:bg-emerald-400"
                >
                  {submitting ? 'Registering...' : 'Save EV Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default VehiclesPage;
