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
      setVehicles(res.data && res.data.length > 0 ? res.data : [
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
    } catch (err) {
      console.error('Error fetching vehicles', err);
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
      // Fallback local update
      setVehicles(prev => [...prev, { id: Date.now(), ...payload }]);
      setShowAddModal(false);
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
      setVehicles(prev => prev.filter(v => v.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Car className="w-6 h-6 text-[#00a896]" />
              <span>My EV Garage</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your electric vehicles, battery specs, and live SOC calibration
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-[#00a896] hover:bg-[#008f80] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle</span>
          </button>
        </div>

        {/* Vehicles Grid (White Cards) */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 text-[#00a896] animate-spin mb-3" />
            <p className="text-slate-500 text-xs">Loading registered EV garage...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v) => {
              const rangeEst = Math.round((v.batteryCapacityKwh * (v.currentSocPercent / 100)) * 6.5);
              return (
                <div
                  key={v.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-bold text-[#00a896] bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                        {v.licensePlate}
                      </span>
                      <button
                        onClick={() => handleDeleteVehicle(v.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                        title="Remove Vehicle"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="text-lg font-black text-slate-800 mb-2">{v.model}</h3>

                    {/* Battery SOC Gauge */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-4">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                          <BatteryCharging className="w-4 h-4 text-[#00a896]" />
                          Current State of Charge
                        </span>
                        <span className="font-black text-slate-800 text-sm">
                          {v.currentSocPercent}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-[#00b4a7] h-2 rounded-full"
                          style={{ width: `${v.currentSocPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500 mt-2 font-medium">
                        <span>Remaining Range:</span>
                        <span className="font-bold text-slate-800">~{rangeEst} km</span>
                      </div>
                    </div>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs mb-5">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <div className="text-[10px] text-slate-400 font-bold">Pack Capacity</div>
                        <div className="font-bold text-slate-700 mt-0.5">{v.batteryCapacityKwh} kWh</div>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <div className="text-[10px] text-slate-400 font-bold">Max DC Rate</div>
                        <div className="font-bold text-[#00a896] mt-0.5">{v.maxChargingPowerKw} kW</div>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <div className="text-[10px] text-slate-400 font-bold">Port Type</div>
                        <div className="font-bold text-slate-700 mt-0.5">{v.connectorType || 'CCS2'}</div>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <div className="text-[10px] text-slate-400 font-bold">Model Year</div>
                        <div className="font-bold text-slate-700 mt-0.5">{v.year || 2024}</div>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/battery-health"
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-[#00a896] text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-200"
                  >
                    <Gauge className="w-3.5 h-3.5 text-[#00a896]" />
                    <span>Battery SOH Degradation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-800">Add Vehicle to Garage</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">EV Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-teal-500 font-semibold"
                >
                  <option value="Tata Nexon EV Max">Tata Nexon EV Max (40.5 kWh)</option>
                  <option value="MG ZS EV">MG ZS EV (50.3 kWh)</option>
                  <option value="Hyundai Ioniq 5">Hyundai Ioniq 5 (72.6 kWh)</option>
                  <option value="Mahindra XUV400">Mahindra XUV400 (39.4 kWh)</option>
                  <option value="BYD Atto 3">BYD Atto 3 (60.4 kWh)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">License Plate Number</label>
                <input
                  type="text"
                  required
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  placeholder="e.g. MH 12 EV 8899"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Pack Size (kWh)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={batteryCapacityKwh}
                    onChange={(e) => setBatteryCapacityKwh(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Current SOC (%)</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={currentSocPercent}
                    onChange={(e) => setCurrentSocPercent(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#00a896] hover:bg-[#008f80] text-white font-bold"
                >
                  {submitting ? 'Saving...' : 'Register Vehicle'}
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
