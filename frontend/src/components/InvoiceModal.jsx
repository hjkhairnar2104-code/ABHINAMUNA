import React from 'react';
import { 
  X, Printer, Download, CheckCircle2, QrCode, 
  MapPin, Zap, Car, ShieldCheck, Calendar, Clock 
} from 'lucide-react';

const InvoiceModal = ({ isOpen, onClose, booking }) => {
  if (!isOpen || !booking) return null;

  const invoiceNo = booking.bookingReference 
    ? `INV-2026-${booking.bookingReference.replace(/[^A-Za-z0-9]/g, '').slice(-6)}` 
    : `INV-2026-${Date.now().toString().slice(-6)}`;

  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const totalAmount = parseFloat(booking.totalAmount || 200.0);
  const subtotal = Math.round((totalAmount / 1.18) * 100) / 100;
  const gstAmount = Math.round((totalAmount - subtotal) * 100) / 100;
  const cgst = Math.round((gstAmount / 2) * 100) / 100;
  const sgst = Math.round((gstAmount / 2) * 100) / 100;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden print:border-none print:shadow-none print:rounded-none">
        
        {/* Top Control Bar (Hidden in Print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Tax Invoice & Charging Pass
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-900 text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Tax Invoice Document */}
        <div className="p-8 sm:p-10 space-y-6 text-slate-800 print:p-6" id="printable-tax-invoice">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b border-slate-200 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-black tracking-tight text-[#00a896]">ChargeMate</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  VERIFIED EV HUB
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">ChargeMate Electric Mobility Networks Ltd.</p>
              <p className="text-[11px] text-slate-400">Yamuna Expressway Corridor HQ, India</p>
              <p className="text-[11px] font-mono text-slate-500 mt-1">
                <strong>GSTIN:</strong> 27AABCS1429B1Z8 • <strong>SAC:</strong> 998714
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xl font-black text-slate-900 block tracking-tight uppercase">TAX INVOICE</span>
              <span className="text-xs font-mono font-bold text-teal-700 block mt-0.5">{invoiceNo}</span>
              <span className="text-xs text-slate-500 block mt-1">Date: {todayStr}</span>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[10px] border border-emerald-200">
                PAID & CONFIRMED
              </span>
            </div>
          </div>

          {/* Billed To & Station Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Billed To (EV Driver)
              </span>
              <div className="font-extrabold text-xs text-slate-900">
                {booking.userName || booking.user?.name || 'Registered EV Driver'}
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                {booking.userEmail || booking.user?.email || 'driver@smartev.com'}
              </div>
              <div className="text-xs text-slate-700 font-semibold mt-2 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-[#00a896]" />
                <span>{booking.vehicleModel || 'Tata Nexon EV Max'}</span>
                <span className="font-mono text-slate-500">({booking.vehicleRegNo || 'MH 12 EV 8899'})</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Charging Station & Bay
              </span>
              <div className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#00a896]" />
                <span>{booking.stationName || 'ChargeMate High-Power Hub'}</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {booking.stationAddress || 'Expressway Corridor EV Plazas'}
              </div>
              <div className="text-xs text-slate-700 font-semibold mt-2 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 text-[10px] font-bold">
                  Slot: {booking.slotNumber || 'Bay A1'}
                </span>
                <span className="text-slate-600">
                  {booking.startTime?.slice(0, 5) || '14:00'} - {booking.endTime?.slice(0, 5) || '15:00'}
                </span>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5">Description</th>
                  <th className="py-2.5 text-center">Units</th>
                  <th className="py-2.5 text-right">Rate</th>
                  <th className="py-2.5 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3 font-semibold">
                    EV Energy Supply (Fast DC Fast-Charging)
                    <span className="block text-[10px] text-slate-400 font-normal">
                      High-voltage DC fast-charging with active thermal management
                    </span>
                  </td>
                  <td className="py-3 text-center font-mono">{booking.chargingKwh || '25.0'} kWh</td>
                  <td className="py-3 text-right font-mono">₹16.00</td>
                  <td className="py-3 text-right font-mono font-bold">
                    ₹{(subtotal - 30.0 > 0 ? subtotal - 30.0 : subtotal).toFixed(2)}
                  </td>
                </tr>

                <tr>
                  <td className="py-3 font-semibold">
                    Dedicated Slot Reservation & Bay Hold
                    <span className="block text-[10px] text-slate-400 font-normal">
                      Guaranteed bay lock via Redis distributed reservation
                    </span>
                  </td>
                  <td className="py-3 text-center font-mono">1 Slot</td>
                  <td className="py-3 text-right font-mono">₹30.00</td>
                  <td className="py-3 text-right font-mono font-bold">₹30.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tax Calculation & Total */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Payment Verification
              </span>
              <div className="text-xs space-y-1">
                <div><strong>Payment Method:</strong> {booking.paymentMethod || 'UPI (Google Pay)'}</div>
                <div><strong>Transaction ID:</strong> <span className="font-mono">{booking.paymentId || 'TXN-98218401'}</span></div>
                <div><strong>Bank Ref:</strong> <span className="font-mono">{booking.upiRef || 'UPI-4910291039'}</span></div>
              </div>

              {/* Digital Entry Pass QR */}
              <div className="pt-2 flex items-center gap-3">
                <div className="w-14 h-14 bg-slate-900 rounded-lg p-1.5 flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="w-3 h-3 bg-white rounded-xs"/>
                    <div className="w-3 h-3 bg-white rounded-xs"/>
                  </div>
                  <div className="text-white text-[7px] text-center font-mono">PASS</div>
                  <div className="flex justify-between">
                    <div className="w-3 h-3 bg-white rounded-xs"/>
                    <div className="w-2 h-2 bg-teal-400 rounded-xs"/>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-800">Digital Gate Pass</div>
                  <div className="text-[10px] text-slate-400">Scan at charging bay sensor</div>
                </div>
              </div>
            </div>

            <div className="sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Value:</span>
                <span className="font-mono font-semibold">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>CGST (9%):</span>
                <span className="font-mono">₹{cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>SGST (9%):</span>
                <span className="font-mono">₹{sgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Paid:</span>
                <span className="font-mono text-emerald-600">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons (Print and Go to My Bookings) */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
            <button
              onClick={handlePrint}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={() => {
                onClose();
                window.location.href = '/bookings';
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>View In My Bookings →</span>
            </button>
          </div>

          {/* Footer Terms */}
          <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 text-center space-y-1">
            <p>This is a computer-generated official tax invoice and electronic receipt valid under Indian GST law.</p>
            <p>For charging support, dial toll-free 1800-EV-CHARGE or open ChargeMate AI Copilot.</p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default InvoiceModal;
