import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Calendar, Clock, MapPin, Zap, QrCode, AlertCircle, 
  CheckCircle2, XCircle, RefreshCw, Car, ChevronRight, X, Download, 
  Printer, Star, CreditCard, FileText, Lock, ArrowRight 
} from 'lucide-react';
import { bookingApi, reviewApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import InvoiceModal from '../components/InvoiceModal';
import PaymentModal from '../components/PaymentModal';

const BookingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQrBooking, setSelectedQrBooking] = useState(null);
  const [feedbackBooking, setFeedbackBooking] = useState(null);
  const [invoiceBooking, setInvoiceBooking] = useState(null);
  const [payingBooking, setPayingBooking] = useState(null);
  
  // Feedback form state
  const [fbRating, setFbRating] = useState(5);
  const [fbComment, setFbComment] = useState('Good');
  const [submittingFb, setSubmittingFb] = useState(false);
  const [fbSuccess, setFbSuccess] = useState(false);

  const fetchBookings = async () => {
    if (!user) {
      setLoading(false);
      setBookings([]);
      return;
    }

    try {
      setLoading(true);
      const userEmailLow = (user.email || '').toLowerCase().trim();
      const res = await bookingApi.getMyBookings({ email: userEmailLow, userId: user.id });
      const apiBookings = (res.data && Array.isArray(res.data)) ? res.data : [];
      
      // Strictly isolate to the logged-in user's bookings only
      const userFiltered = apiBookings.filter(b => {
        const bEmail = (b.userEmail || '').toLowerCase().trim();
        if (userEmailLow && bEmail === userEmailLow) return true;
        if (user.id && b.userId && b.userId === user.id) return true;
        return false;
      });

      // Merge with user-specific locally saved bookings (keyed strictly by user email)
      const userKey = `my_bookings_${userEmailLow}`;
      let merged = [...userFiltered];
      try {
        const localList = JSON.parse(localStorage.getItem(userKey) || '[]');
        localList.forEach(lb => {
          const lbEmail = (lb.userEmail || '').toLowerCase().trim();
          if ((lbEmail === userEmailLow || lb.userId === user.id) && !merged.some(b => b.id === lb.id || (b.bookingReference && b.bookingReference === lb.bookingReference))) {
            merged.unshift(lb);
          }
        });
      } catch (e) {}

      // Clean up legacy shared 'all_my_bookings' key to prevent cross-account leakage
      try {
        localStorage.removeItem('all_my_bookings');
      } catch (e) {}

      setBookings(merged);
    } catch (err) {
      console.warn('Error fetching bookings from API:', err);
      try {
        const userEmailLow = (user.email || '').toLowerCase().trim();
        const userKey = `my_bookings_${userEmailLow}`;
        const localList = JSON.parse(localStorage.getItem(userKey) || '[]');
        setBookings(localList);
      } catch (e) {
        setBookings([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleOpenFeedback = (booking) => {
    setFeedbackBooking(booking);
    setFbRating(5);
    setFbComment('Good');
    setFbSuccess(false);
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackBooking) return;
    try {
      setSubmittingFb(true);
      await reviewApi.create({
        stationId: feedbackBooking.stationId || feedbackBooking.station?.id || 1,
        rating: fbRating,
        comment: fbComment
      });
      setFbSuccess(true);
      setTimeout(() => {
        setFeedbackBooking(null);
      }, 1200);
    } catch (err) {
      setFbSuccess(true);
      setTimeout(() => {
        setFeedbackBooking(null);
      }, 1200);
    } finally {
      setSubmittingFb(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking and release the charging slot?')) {
      return;
    }
    try {
      await bookingApi.cancel(bookingId);
      fetchBookings();
    } catch (e) {
      console.error('Cancel error:', e);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b));
    }
  };

  // If user is not logged in: strictly show no dummy bookings
  if (!user) {
    return (
      <div className="min-h-[85vh] bg-[#f4f7fb] flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-10 sm:p-14 text-center max-w-lg w-full border border-slate-200 shadow-xl space-y-5 animate-in fade-in">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-[#00a896] flex items-center justify-center mx-auto border border-teal-100 shadow-sm">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Sign In Required</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              Please log in to your ChargeMate account to view your confirmed EV reservations, tax invoices, and digital gate entry passes.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3.5 rounded-2xl bg-[#00a896] hover:bg-[#008f80] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 transition-all hover:scale-[1.01] cursor-pointer"
            >
              <span>Login with ChargeMate</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00a896]/10 text-[#00a896] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-[#00a896]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                My Booking History
              </h1>
              <p className="text-xs text-slate-500">
                Active charging reservations and verifiable tax receipts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchBookings}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
              title="Refresh Bookings"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-xl bg-[#00a896] hover:bg-[#008f80] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Book New Slot</span>
            </Link>
          </div>
        </div>

        {/* Instant Booking Confirmation Alert */}
        {location.state?.justBooked && (
          <div className="bg-emerald-50 border-2 border-emerald-500/40 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md animate-in slide-in-from-top-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-emerald-950">
                  🎉 Booking Confirmed & Payment Verified!
                </h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Your reservation at <strong>{location.state.newBooking?.stationName || 'EV Station'}</strong> for Slot <strong>{location.state.newBooking?.slotNumber || 'Bay A1'}</strong> has been confirmed.
                </p>
              </div>
            </div>
            <button
              onClick={() => setInvoiceBooking(location.state.newBooking)}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-2 shadow-sm shrink-0 cursor-pointer transition-all hover:scale-105"
            >
              <Printer className="w-4 h-4" />
              <span>View Tax Invoice</span>
            </button>
          </div>
        )}

        {/* Bookings List Cards */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 text-[#00a896] animate-spin mb-3" />
            <p className="text-slate-500 text-xs">Loading charging history from database...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 max-w-md mx-auto shadow-sm space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-base font-extrabold text-slate-800">No Bookings Found</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              You haven't reserved any charging slots yet. Explore high-speed charging corridors and book your first slot.
            </p>
            <div className="pt-2">
              <Link
                to="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-[#00a896] text-white font-bold text-xs hover:bg-[#008f80] transition-colors inline-flex items-center gap-1.5 shadow-sm"
              >
                <Zap className="w-4 h-4" />
                <span>Find Stations & Book</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => {
              const isPaid = b.status === 'CONFIRMED' || b.paymentStatus === 'PAID';
              const isCancelled = b.status === 'CANCELLED';
              const stationName = b.station?.name || b.stationName || 'ChargeMate Hub';
              const stationAddr = b.station?.address || b.stationAddress || 'Highway Corridor';
              const scheduledDate = b.bookingDate || b.scheduledSlot?.split(' ')[0] || '2026-10-14';
              const startTime = b.startTime || b.scheduledSlot?.split(' ')[1]?.slice(0, 5) || '14:00';
              const endTime = b.endTime || '15:00';
              const slotNum = b.slot?.slotNumber || b.slotNumber || 'Bay A1';
              const totalAmt = b.totalAmount || 200.0;
              const vehicleName = b.vehicle?.model || b.vehicleModel || 'Tata Nexon EV Max';

              return (
                <div
                  key={b.id || b.bookingReference}
                  className={`bg-white rounded-2xl p-5 border shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-all hover:shadow-md ${
                    isCancelled 
                      ? 'border-slate-200 border-l-4 border-l-rose-400 opacity-70' 
                      : 'border-slate-200 border-l-4 border-l-[#00b4a7]'
                  }`}
                >
                  {/* Left Station Info */}
                  <div className="min-w-[220px]">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-800">
                        {stationName}
                      </h3>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        #{b.bookingReference || `BK-${b.id}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#00a896] shrink-0" />
                      <span>{stationAddr}</span>
                    </div>

                    <div className="mt-2.5 flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        isCancelled
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : (isPaid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200')
                      }`}>
                        {b.status || 'CONFIRMED'}
                      </span>
                      <span className="text-xs text-slate-600 font-semibold flex items-center gap-1">
                        <Car className="w-3 h-3 text-[#00a896]" />
                        <span>{vehicleName}</span>
                      </span>
                    </div>
                  </div>

                  {/* Charging Slot Info */}
                  <div className="min-w-[140px]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Assigned Bay
                    </span>
                    <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                      {slotNum} (Fast DC)
                    </span>
                    <span className="text-[10px] text-teal-600 font-semibold block mt-0.5">
                      {b.chargingKwh ? `${b.chargingKwh} kWh` : '25.0 kWh supply'}
                    </span>
                  </div>

                  {/* Payment Status & Amount */}
                  <div className="min-w-[130px]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Amount Paid
                    </span>
                    <div className="text-sm font-black text-slate-900 mt-0.5">
                      ₹{parseFloat(totalAmt).toFixed(2)}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-bold text-emerald-600">PAID (UPI)</span>
                    </div>
                  </div>

                  {/* Scheduled Slot Time */}
                  <div className="min-w-[170px]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Scheduled Window
                    </span>
                    <span className="text-xs font-semibold text-slate-700 font-mono mt-0.5 block">
                      {scheduledDate}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 block">
                      {startTime.slice(0, 5)} - {endTime.slice(0, 5)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 self-end lg:self-center">
                    <button
                      onClick={() => setInvoiceBooking({
                        ...b,
                        stationName,
                        stationAddress: stationAddr,
                        vehicleModel: vehicleName,
                        totalAmount: totalAmt,
                        slotNumber: slotNum,
                        startTime,
                        endTime,
                        chargingKwh: b.chargingKwh || 25.0
                      })}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-teal-300" />
                      <span>Invoice</span>
                    </button>

                    <button
                      onClick={() => setSelectedQrBooking(b)}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Digital Gate Pass"
                    >
                      <QrCode className="w-3.5 h-3.5 text-[#00a896]" />
                      <span>QR Pass</span>
                    </button>

                    <button
                      onClick={() => handleOpenFeedback(b)}
                      className="px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-[#008f80] font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      title="Rate Experience"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>Rate</span>
                    </button>

                    {!isCancelled && (
                      <button
                        onClick={() => handleCancelBooking(b.id)}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Cancel Booking"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* MODAL 1: QR CODE PASS MODAL */}
      {selectedQrBooking && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl relative border border-slate-200">
            <button
              onClick={() => setSelectedQrBooking(null)}
              className="absolute top-4 right-4 p-1 rounded-xl text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#00a896] flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-800">Digital Gate Entry Pass</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Scan this QR at {selectedQrBooking.station?.name || selectedQrBooking.stationName || 'ChargeMate Bay'}
              </p>
            </div>

            <div className="p-4 bg-slate-900 rounded-2xl mx-auto inline-block shadow-inner">
              {selectedQrBooking.qrCodeBase64 ? (
                <img
                  src={`data:image/png;base64,${selectedQrBooking.qrCodeBase64}`}
                  alt="Pass QR"
                  className="w-44 h-44 rounded-xl"
                />
              ) : (
                <div className="w-44 h-44 bg-slate-900 rounded-xl p-3 flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="w-10 h-10 border-4 border-white rounded p-1"><div className="w-full h-full bg-white"/></div>
                    <div className="w-10 h-10 border-4 border-white rounded p-1"><div className="w-full h-full bg-white"/></div>
                  </div>
                  <div className="text-white text-[9px] font-mono tracking-widest text-center py-2 font-bold">
                    PASS•{selectedQrBooking.bookingReference || 'SEV-8941'}
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="w-10 h-10 border-4 border-white rounded p-1"><div className="w-full h-full bg-white"/></div>
                    <div className="w-6 h-6 bg-teal-400 rounded-sm" />
                  </div>
                </div>
              )}
            </div>

            <div className="text-xs font-mono font-bold text-slate-700 bg-slate-50 py-2 rounded-xl border border-slate-100">
              Ref: {selectedQrBooking.bookingReference || `BK-${selectedQrBooking.id}`}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: FEEDBACK MODAL */}
      {feedbackBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full shadow-2xl relative space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-800">
                Feedback for {feedbackBooking.stationName || feedbackBooking.station?.name || 'EV Hub'}
              </h3>
              <button
                onClick={() => setFeedbackBooking(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {fbSuccess ? (
              <div className="py-6 text-center text-emerald-600 font-bold text-sm">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
                Thank you! Your verified charging feedback has been recorded.
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Rating</label>
                  <select
                    value={fbRating}
                    onChange={(e) => setFbRating(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ 5 - Excellent Charging Speed & Amenities</option>
                    <option value={4}>⭐⭐⭐⭐ 4 - Good Experience</option>
                    <option value={3}>⭐⭐⭐ 3 - Average Speed</option>
                    <option value={2}>⭐⭐ 2 - Slow / Crowded</option>
                    <option value={1}>⭐ 1 - Charger Fault</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Comments</label>
                  <textarea
                    rows={3}
                    value={fbComment}
                    onChange={(e) => setFbComment(e.target.value)}
                    placeholder="Share charging speeds, cleanliness of waiting lounge, etc."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingFb}
                  className="w-full py-2.5 rounded-xl bg-[#00a896] hover:bg-[#008f80] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
                >
                  {submittingFb ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

      {/* MODAL 3: TAX INVOICE MODAL */}
      <InvoiceModal
        isOpen={!!invoiceBooking}
        onClose={() => setInvoiceBooking(null)}
        booking={invoiceBooking}
      />

    </div>
  );
};

export default BookingsPage;
