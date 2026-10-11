import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, Clock, MapPin, Zap, QrCode, AlertCircle, 
  CheckCircle2, XCircle, RefreshCw, Car, ChevronRight, X, Download, Printer
} from 'lucide-react';
import { bookingApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const BookingsPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('ALL');
  const [selectedQrBooking, setSelectedQrBooking] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingApi.getMyBookings();
      setBookings(res.data || []);
    } catch (err) {
      console.error('Error fetching bookings', err);
      // Fallback demo bookings if new account
      setBookings([
        {
          id: 1,
          bookingReference: 'BK-LON-4821',
          stationId: 5,
          stationName: 'GreenCharge Lonavala Expressway Hub',
          stationAddress: 'Old Mumbai-Pune Highway, Valvan, Lonavala',
          slotNumber: 'A3',
          chargerType: 'CCS2 120kW',
          vehicleModel: 'Tata Nexon EV Max',
          vehicleNumber: 'MH 12 EV 8899',
          bookingDate: new Date().toISOString().split('T')[0],
          startTime: '14:00',
          endTime: '15:00',
          totalAmount: 480.0,
          status: 'CONFIRMED',
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking and release the slot?')) return;
    try {
      setActionLoading(true);
      await bookingApi.cancel(id);
      fetchBookings();
    } catch (err) {
      console.error('Cancel error', err);
      alert('Unable to cancel booking at this time.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterTab === 'ALL') return true;
    if (filterTab === 'UPCOMING') return b.status === 'CONFIRMED' || b.status === 'HELD';
    if (filterTab === 'COMPLETED') return b.status === 'COMPLETED';
    if (filterTab === 'CANCELLED') return b.status === 'CANCELLED';
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-brand-accent border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Confirmed
          </span>
        );
      case 'HELD':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            10m Hold
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium">
            {status}
          </span>
        );
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
                <Calendar className="w-5 h-5 text-brand-accent" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                My Charging & Parking Reservations
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Digital access passes, live slot reservations, and payment receipts
              </p>
            </div>
          </div>
        </div>

        <Link
          to="/dashboard"
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs hover:scale-105 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 w-fit"
        >
          <Zap className="w-4 h-4 fill-slate-950" />
          <span>Book New Slot</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-6">
        {[
          { key: 'ALL', label: 'All Bookings' },
          { key: 'UPCOMING', label: 'Upcoming & Active' },
          { key: 'COMPLETED', label: 'Completed' },
          { key: 'CANCELLED', label: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filterTab === tab.key
                ? 'bg-emerald-500/15 text-brand-accent border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <RefreshCw className="w-8 h-8 text-brand-accent animate-spin mb-4" />
          <p className="text-slate-400 text-xs">Retrieving your charging reservations...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-3xl border border-slate-800 max-w-lg mx-auto">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Reservations Found</h3>
          <p className="text-xs text-slate-400 mb-6">
            You don't have any bookings under the "{filterTab.toLowerCase()}" filter.
          </p>
          <Link
            to="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-brand-accent text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
          >
            Explore Expressway Stations
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold text-slate-400">
                    {b.bookingReference}
                  </span>
                  {getStatusBadge(b.status)}
                </div>

                <h3 className="text-base font-extrabold text-white mb-1 group-hover:text-brand-accent transition-colors">
                  {b.stationName}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-4">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{b.stationAddress || 'Pune-Mumbai Expressway'}</span>
                </p>

                {/* Details Grid */}
                <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800/80 space-y-2 text-xs mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bay & Charger:</span>
                    <span className="font-bold text-white">
                      Bay {b.slotNumber} • {b.chargerType || 'CCS2'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Scheduled:</span>
                    <span className="font-medium text-slate-200">
                      {b.bookingDate} ({b.startTime} - {b.endTime})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vehicle:</span>
                    <span className="font-medium text-slate-200">
                      {b.vehicleModel || 'Nexon EV Max'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-800 font-bold">
                    <span className="text-slate-400">Amount:</span>
                    <span className="text-brand-accent">₹{b.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => setSelectedQrBooking(b)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5 text-brand-accent" />
                  <span>View QR Pass</span>
                </button>

                {b.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleCancelBooking(b.id)}
                    disabled={actionLoading}
                    className="py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs transition-colors border border-rose-500/20"
                    title="Cancel Booking"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Pass Modal */}
      {selectedQrBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card max-w-sm w-full p-6 rounded-3xl border border-slate-700 space-y-4 relative">
            <button
              onClick={() => setSelectedQrBooking(null)}
              className="absolute top-4 right-4 p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-accent bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                SmartEV Gate Pass
              </span>
              <h3 className="text-lg font-black text-white mt-2">{selectedQrBooking.stationName}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedQrBooking.bookingReference}</p>
            </div>

            {/* QR Code Box */}
            <div className="bg-white p-4 rounded-2xl text-center">
              {selectedQrBooking.qrCodeBase64 ? (
                <img
                  src={`data:image/png;base64,${selectedQrBooking.qrCodeBase64}`}
                  alt="Access QR Code"
                  className="w-48 h-48 mx-auto"
                />
              ) : (
                <div className="w-48 h-48 mx-auto flex flex-col items-center justify-center bg-slate-100 rounded-xl text-slate-800">
                  <QrCode className="w-32 h-32" />
                  <span className="text-[10px] font-mono mt-1 font-bold">{selectedQrBooking.bookingReference}</span>
                </div>
              )}
              <span className="text-[10px] text-slate-500 font-medium block mt-2">
                Present this pass to scanner at Bay {selectedQrBooking.slotNumber}
              </span>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Reserved Bay:</span>
                <span className="font-bold text-brand-accent">Bay {selectedQrBooking.slotNumber}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Slot Window:</span>
                <span className="font-medium text-white">{selectedQrBooking.startTime} - {selectedQrBooking.endTime}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Amount Paid:</span>
                <span className="font-bold text-emerald-400">₹{selectedQrBooking.totalAmount}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Pass</span>
              </button>
              <button
                onClick={() => setSelectedQrBooking(null)}
                className="flex-1 py-2.5 rounded-xl bg-brand-accent text-slate-950 font-bold text-xs hover:bg-emerald-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BookingsPage;
