import React, { useState, useEffect } from 'react';
import { 
  X, CheckCircle2, ShieldCheck, Smartphone, CreditCard, 
  Building2, QrCode, ArrowRight, Lock, Loader2, Sparkles, ChevronRight, Check,
  Wallet, Info, HelpCircle, Minus, RefreshCw, Zap, Award
} from 'lucide-react';

const UPI_APPS = [
  { id: 'phonepe', name: 'PhonePe', color: '#5f259f', icon: '🟣' },
  { id: 'gpay', name: 'Google Pay', color: '#0f9d58', icon: '🟢' },
  { id: 'paytm', name: 'Paytm UPI', color: '#00baf2', icon: '🔵' },
  { id: 'bhim', name: 'BHIM UPI', color: '#00529b', icon: '🇮🇳' }
];

const POPULAR_BANKS = [
  { id: 'hdfc', name: 'HDFC Bank', code: 'HDFC' },
  { id: 'sbi', name: 'State Bank of India', code: 'SBI' },
  { id: 'icici', name: 'ICICI Bank', code: 'ICICI' },
  { id: 'axis', name: 'Axis Bank', code: 'AXIS' },
  { id: 'kotak', name: 'Kotak Bank', code: 'KOTAK' },
  { id: 'pnb', name: 'Punjab National Bank', code: 'PNB' }
];

const WALLETS = [
  { id: 'mobikwik', name: 'Mobikwik Wallet', balance: '₹450.00' },
  { id: 'phonepe_w', name: 'PhonePe Wallet', balance: '₹1,200.00' },
  { id: 'paytm_w', name: 'Paytm Balance', balance: '₹850.00' },
  { id: 'amazon', name: 'Amazon Pay Balance', balance: '₹620.00' }
];

const PaymentModal = ({ isOpen, onClose, amount, bookingDetails, onPaymentSuccess }) => {
  // Method selection: 'upi', 'card', 'emi', 'netbanking', 'wallet'
  const [activeTab, setActiveTab] = useState('upi');
  
  // Card input state
  const [cardNumber, setCardNumber] = useState('4532 8901 2345 8891');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('321');
  const [cardName, setCardName] = useState('EV Fleet Driver');

  // Net banking state
  const [selectedBank, setSelectedBank] = useState('hdfc');
  const [selectedWallet, setSelectedWallet] = useState('mobikwik');
  const [upiVpa, setUpiVpa] = useState('');

  // Countdown timer (Starts at 11:20 = 680 seconds, matching user reference image)
  const [secondsRemaining, setSecondsRemaining] = useState(680);

  // Payment execution state
  const [processing, setProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('Contacting UPI payment gateway...');
  const [success, setSuccess] = useState(false);

  const displayFare = amount ? parseFloat(amount).toFixed(2) : '250.00';
  const stationTitle = bookingDetails?.stationName || 'SmartEV Supercharger Station';
  const slotNum = bookingDetails?.slotNumber || 'Bay A1';

  useEffect(() => {
    if (!isOpen) {
      setProcessing(false);
      setSuccess(false);
      setSecondsRemaining(680);
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleExecutePayment = (methodTitle = 'UPI QR Code') => {
    setProcessing(true);
    setProcessingStatus('Connecting with Razorpay Payment Gateway...');

    setTimeout(() => {
      setProcessingStatus('Verifying UPI / Card Authorization with Bank...');
    }, 1100);

    setTimeout(() => {
      setProcessingStatus('Payment Authorized & Captured Successfully!');
    }, 2200);

    setTimeout(() => {
      setSuccess(true);
      const paymentData = {
        paymentId: `pay_RPZ${Date.now().toString().slice(-8)}`,
        orderId: `order_RPZ${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        method: methodTitle,
        upiRef: `UPI-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        amount: parseFloat(displayFare),
        timestamp: new Date().toISOString()
      };

      setTimeout(() => {
        onPaymentSuccess(paymentData);
      }, 1000);
    }, 3200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      
      {/* Authentic Razorpay 2-Column Split Modal (1:1 with User Reference Screenshot) */}
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-[0_20px_70px_rgba(0,184,124,0.3)] border-2 border-[#00b87c] overflow-hidden flex flex-col md:flex-row relative font-sans">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: VIBRANT GREEN RAZORPAY TRUST & SUMMARY PANEL */}
        {/* ======================================================== */}
        <div className="w-full md:w-5/12 bg-gradient-to-br from-[#00b87c] via-[#00a86b] to-[#047857] p-6 text-white flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle geometric background shapes */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-xl pointer-events-none" />

          {/* Top Brand Header */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md">
                <span className="text-[#00b87c] font-black text-lg">⚡</span>
              </div>
              <div>
                <h2 className="font-extrabold text-base tracking-tight text-white leading-tight">
                  SmartEV Plaza
                </h2>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-white fill-emerald-400" />
                  <span>Razorpay Trusted Business</span>
                </div>
              </div>
            </div>

            {/* Price Summary Card (White Card with Dark Text) */}
            <div className="bg-white rounded-xl p-4 text-slate-800 shadow-md">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Price Summary
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <div className="text-2xl font-black text-slate-900">
                  ₹{displayFare}
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#00b87c] border border-emerald-200">
                  Flat Slot Rate
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {stationTitle} • {slotNum}
              </p>
            </div>

            {/* User Contact Pill */}
            <div className="bg-white/15 hover:bg-white/20 transition-colors backdrop-blur-xs rounded-xl p-3 flex items-center justify-between text-xs cursor-pointer border border-white/20">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">👤</span>
                <span className="font-semibold text-white">Using as +91 98201 44552</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/80" />
            </div>

            {/* Available Offers Pill */}
            <div className="bg-white/15 hover:bg-white/20 transition-colors backdrop-blur-xs rounded-xl p-3 flex items-center justify-between text-xs cursor-pointer border border-white/20">
              <div className="flex items-center gap-2">
                <span className="text-sm">🏷️</span>
                <span className="font-semibold text-white">Offers on UPI, UPI and Cards...</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/80" />
            </div>
          </div>

          {/* Bottom Trust & EV Illustration */}
          <div className="relative z-10 pt-6 mt-4 border-t border-white/20">
            <div className="flex items-center justify-between text-[11px] text-emerald-100">
              <div className="flex items-center gap-1.5 font-bold">
                <Lock className="w-3.5 h-3.5 text-white" />
                <span>256-Bit SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-1 font-bold text-white">
                <span>Razorpay</span>
                <span className="text-[9px] bg-white/20 px-1 py-0.2 rounded font-mono">SECURE</span>
              </div>
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: PAYMENT OPTIONS & INTERACTIVE VIEWS        */}
        {/* ======================================================== */}
        <div className="w-full md:w-7/12 bg-white flex flex-col justify-between">
          
          {/* Top Window Bar */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800">
              Payment Options
            </h3>
            <div className="flex items-center gap-2">
              <button 
                type="button" 
                onClick={onClose}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
                title="Minimize"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button 
                type="button" 
                onClick={onClose}
                className="w-7 h-7 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Body: Sub-column Sidebar Tabs + Content Area */}
          <div className="flex-1 flex flex-col sm:flex-row min-h-[380px]">
            
            {/* Left Sub-Column: Payment Methods Tabs */}
            <div className="w-full sm:w-40 border-r border-slate-100 bg-slate-50/70 p-2 sm:p-3 flex sm:flex-col gap-1">
              
              <button
                type="button"
                onClick={() => setActiveTab('upi')}
                className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === 'upi'
                    ? 'bg-white text-[#00b87c] font-bold shadow-xs border border-emerald-200'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">UPI</div>
                  <div className="flex items-center gap-1 text-[9px] mt-0.5 text-slate-400">
                    <span>🟢</span><span>🟣</span><span>🔵</span>
                  </div>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold shrink-0">
                  2 Offers
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('card')}
                className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === 'card'
                    ? 'bg-white text-[#00b87c] font-bold shadow-xs border border-emerald-200'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">Cards</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Visa, Master, RuPay</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('netbanking')}
                className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === 'netbanking'
                    ? 'bg-white text-[#00b87c] font-bold shadow-xs border border-emerald-200'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">Netbanking</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">All Indian Banks</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('wallet')}
                className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === 'wallet'
                    ? 'bg-white text-[#00b87c] font-bold shadow-xs border border-emerald-200'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">Wallet</div>
                  <div className="text-[9px] text-emerald-600 font-semibold mt-0.5">Upto ₹40 cash</div>
                </div>
              </button>
            </div>

            {/* Right Sub-Column: Active Tab View */}
            <div className="flex-1 p-5 overflow-y-auto">
              
              {/* Available Offer Banner */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 mb-4 flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-1.5 font-bold truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate">UPTO ₹200 CRED cashback on UPI / CRED Pay</span>
                </div>
                <span className="text-[11px] font-bold text-[#00b87c] shrink-0 cursor-pointer hover:underline">
                  View all
                </span>
              </div>

              {/* ---------------------------------------------------- */}
              {/* VIEW 1: UPI & DYNAMIC QR CODE (Matching Screenshot)  */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'upi' && (
                <div className="space-y-4">
                  
                  {/* Top QR Header with Countdown */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      UPI QR Code
                    </span>
                    <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      <span>⏱</span>
                      <span>{formatTimer(secondsRemaining)}</span>
                    </div>
                  </div>

                  {/* QR Box with Brand Logos (Matching Exact User Reference Image) */}
                  <div className="border border-slate-200 rounded-2xl p-4 bg-white flex flex-col sm:flex-row items-center gap-4 shadow-xs">
                    
                    {/* Dynamic QR Code Canvas */}
                    <div className="relative p-2 bg-white rounded-xl border border-slate-300 shadow-inner flex flex-col items-center shrink-0">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=upi://pay?pa=smartev@razorpay%26pn=SmartEV%26am=${displayFare}%26cu=INR`}
                        alt="UPI Payment QR Code"
                        className="w-32 h-32 object-contain"
                      />
                      <span className="text-[8px] font-black text-slate-400 mt-1 uppercase tracking-widest">
                        BHIM UPI • NPCI
                      </span>
                    </div>

                    {/* Scan with App Text + Icons */}
                    <div className="space-y-2 text-center sm:text-left flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        SCAN WITH ANY APP
                      </span>
                      
                      {/* App Badges */}
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                        <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                          🟢 GPay
                        </span>
                        <span className="px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200 flex items-center gap-1">
                          🟣 PhonePe
                        </span>
                        <span className="px-2 py-1 rounded-md bg-sky-50 text-sky-700 text-[10px] font-bold border border-sky-200 flex items-center gap-1">
                          🔵 Paytm
                        </span>
                        <span className="px-2 py-1 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200 flex items-center gap-1">
                          🇮🇳 BHIM
                        </span>
                      </div>

                      <div className="pt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-[#00b87c] font-bold border border-emerald-200 inline-block">
                          ✓ 2 Offers Applicable
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Recommended One-Click UPI Apps (Matching Screenshot) */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Recommended
                    </span>

                    <button
                      type="button"
                      onClick={() => handleExecutePayment('UPI (PhonePe)')}
                      disabled={processing}
                      className="w-full p-3 rounded-xl border border-slate-200 hover:border-purple-400 bg-white hover:bg-purple-50/40 text-slate-800 transition-all flex items-center justify-between group cursor-pointer shadow-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">🟣</span>
                        <span className="text-xs font-bold group-hover:text-purple-700">UPI - PhonePe</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExecutePayment('UPI (Google Pay)')}
                      disabled={processing}
                      className="w-full p-3 rounded-xl border border-slate-200 hover:border-emerald-400 bg-white hover:bg-emerald-50/40 text-slate-800 transition-all flex items-center justify-between group cursor-pointer shadow-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">🟢</span>
                        <span className="text-xs font-bold group-hover:text-emerald-700">UPI - Google Pay</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                    </button>
                  </div>

                  {/* Instant Demo Simulator Button */}
                  <button
                    type="button"
                    onClick={() => handleExecutePayment('Simulated UPI QR Scan')}
                    disabled={processing}
                    className="w-full py-3 rounded-xl bg-[#00b87c] hover:bg-[#00a86b] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-white text-white" />
                    <span>Confirm UPI QR Scan & Pay ₹{displayFare}</span>
                  </button>

                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* VIEW 2: CREDIT / DEBIT CARDS                         */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'card' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-700">Enter Card Details</span>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                      <span>VISA</span> • <span>Mastercard</span> • <span>RuPay</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4532 8901 2345 8891"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#00b87c]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Valid Thru</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#00b87c]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">CVV</label>
                      <input
                        type="password"
                        maxLength="4"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#00b87c]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Name on card"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00b87c]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleExecutePayment(`Card (${cardNumber.slice(-4)})`)}
                    disabled={processing}
                    className="w-full mt-2 py-3 rounded-xl bg-[#00b87c] hover:bg-[#00a86b] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Pay ₹{displayFare}</span>
                  </button>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* VIEW 3: NETBANKING                                   */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'netbanking' && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-700 block pb-2 border-b border-slate-100">
                    Select Popular Bank
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    {POPULAR_BANKS.map((bank) => (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => setSelectedBank(bank.id)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                          selectedBank === bank.id
                            ? 'bg-emerald-50 border-[#00b87c] text-emerald-800 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5 text-[#00b87c] mb-1" />
                        <div>{bank.name}</div>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleExecutePayment(`Netbanking (${selectedBank.toUpperCase()})`)}
                    disabled={processing}
                    className="w-full mt-3 py-3 rounded-xl bg-[#00b87c] hover:bg-[#00a86b] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <span>Proceed with {selectedBank.toUpperCase()}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* VIEW 4: DIGITAL WALLETS                              */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'wallet' && (
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-slate-700 block pb-2 border-b border-slate-100">
                    Select Linked Wallet
                  </span>

                  {WALLETS.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setSelectedWallet(w.id)}
                      className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        selectedWallet === w.id
                          ? 'bg-emerald-50 border-[#00b87c] shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Wallet className="w-4 h-4 text-[#00b87c]" />
                        <span className="text-xs font-bold text-slate-800">{w.name}</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-700">{w.balance}</span>
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => handleExecutePayment(`Wallet (${selectedWallet})`)}
                    disabled={processing}
                    className="w-full mt-3 py-3 rounded-xl bg-[#00b87c] hover:bg-[#00a86b] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <span>Pay ₹{displayFare} using Wallet</span>
                  </button>
                </div>
              )}

            </div>

          </div>

          {/* Footer Bar */}
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00b87c]" />
              RBI Compliant Payment Standard
            </span>
            <span className="font-mono font-bold text-slate-500">
              Merchant: SmartEV India
            </span>
          </div>

        </div>

        {/* ======================================================== */}
        {/* FULLSCREEN RAZORPAY PROCESSING & SUCCESS OVERLAY         */}
        {/* ======================================================== */}
        {processing && (
          <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
            {!success ? (
              <div className="space-y-4 max-w-sm">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border-2 border-[#00b87c] mx-auto flex items-center justify-center animate-pulse">
                  <RefreshCw className="w-8 h-8 text-[#00b87c] animate-spin" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-extrabold text-slate-800">
                    Processing Razorpay Payment
                  </h4>
                  <p className="text-xs font-medium text-slate-500">
                    {processingStatus}
                  </p>
                </div>
                <div className="text-[11px] font-mono text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full inline-block">
                  Amount: ₹{displayFare} • Do not refresh
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-sm">
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/40 animate-bounce">
                  <Check className="w-9 h-9 stroke-[3]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-slate-800">
                    Payment Verified Successfully!
                  </h4>
                  <p className="text-xs font-medium text-emerald-600">
                    Slot reserved & Digital Entry Pass generated
                  </p>
                </div>
                <span className="text-[11px] font-mono text-slate-400 block">
                  Redirecting to booking confirmation...
                </span>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};

export default PaymentModal;
