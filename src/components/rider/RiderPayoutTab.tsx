import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RiderPayoutSlip } from '../../types';
import { RiderPayoutSlipModal } from './RiderPayoutSlipModal';
import { RiderFareStandardsModal } from './RiderFareStandardsModal';
import { 
  Wallet, 
  ArrowUpRight, 
  TrendingUp, 
  Heart, 
  Bike, 
  Clock, 
  CreditCard, 
  Building2, 
  Smartphone, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight,
  Receipt,
  Download,
  ShieldCheck,
  AlertCircle,
  Calculator,
  Info
} from 'lucide-react';

export const RiderPayoutTab: React.FC = () => {
  const { 
    activeRider, 
    riderEarningsHistory, 
    riderPayoutSlips, 
    withdrawRiderEarnings,
    triggerToast
  } = useApp();

  const [activeHistoryView, setActiveHistoryView] = useState<'trips' | 'payouts'>('trips');
  const [selectedSlip, setSelectedSlip] = useState<RiderPayoutSlip | null>(null);
  const [isStandardsModalOpen, setIsStandardsModalOpen] = useState<boolean>(false);
  const [selectedTripDistance, setSelectedTripDistance] = useState<number>(3.5);

  // Dual Wallet State
  const [creditWalletBalance, setCreditWalletBalance] = useState<number>(650);

  // Cash-out dialog state
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawMethod, setWithdrawMethod] = useState<'promptpay' | 'bank_account'>('promptpay');
  const [withdrawError, setWithdrawError] = useState<string>('');

  const handleQuickAmount = (val: number) => {
    const capped = Math.min(val, activeRider.walletBalance);
    setWithdrawAmount(capped.toString());
    setWithdrawError('');
  };

  const handleWithdrawAll = () => {
    setWithdrawAmount(activeRider.walletBalance.toString());
    setWithdrawError('');
  };

  const handleConfirmWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setWithdrawError('กรุณาระบุจำนวนเงินที่ต้องการถอน');
      return;
    }
    if (amountNum > activeRider.walletBalance) {
      setWithdrawError(`ยอดเงินคงเหลือไม่เพียงพอ (คงเหลือ ฿${activeRider.walletBalance.toLocaleString()})`);
      return;
    }

    const slip = withdrawRiderEarnings(amountNum, withdrawMethod);
    if (slip) {
      setSelectedSlip(slip);
      setWithdrawAmount('');
      setWithdrawError('');
    }
  };

  // Calculate total tips and available withdrawable sum
  const totalTipsToday = riderEarningsHistory.reduce((acc, curr) => acc + curr.tipAmount, 0);
  const availableToWithdrawEarnings = riderEarningsHistory
    .filter(e => e.payoutStatus === 'available_to_withdraw')
    .reduce((acc, curr) => acc + curr.netEarnings, 0);

  return (
    <div className="space-y-6">
      {/* DUAL WALLET OVERVIEW (CASH WALLET VS CREDIT WALLET) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">👛</span>
            <div>
              <h3 className="text-sm font-black text-slate-900 leading-tight">
                ระบบกระเป๋าเงินแยก 2 ประเภท (Dual Wallet Standard)
              </h3>
              <p className="text-[11px] text-slate-500">
                แยกชัดเจนระหว่างเงินสดรายได้ที่ถอนได้ กับเครดิตรับงานเก็บเงินสดปลายทาง (COD)
              </p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full self-start sm:self-center">
            มาตรฐานอุตสาหกรรม Food Delivery
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cash Wallet */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>1. Cash Wallet (กระเป๋าเงินสด / ถอนได้ทันที)</span>
              </span>
              <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-md">
                พร้อมถอน
              </span>
            </div>
            <div className="my-3">
              <div className="text-2xl font-black text-emerald-950">
                ฿{activeRider.walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                รวมค่ารอบ + ค่าระยะทาง + ทิปจากลูกค้า 100% เต็ม ไม่หักหัวคิว
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-emerald-200/50">
              <button
                type="button"
                onClick={handleWithdrawAll}
                disabled={activeRider.walletBalance <= 0}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>ถอนเข้าธนาคาร</span>
              </button>
              <span className="text-[10px] text-emerald-700">ฟรีค่าธรรมเนียม ตลอด 24 ชม.</span>
            </div>
          </div>

          {/* Credit Wallet */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>2. Credit Wallet (กระเป๋าเครดิตรับงาน COD)</span>
              </span>
              <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-md">
                เครดิตรับงาน
              </span>
            </div>
            <div className="my-3">
              <div className="text-2xl font-black text-blue-950">
                ฿{creditWalletBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-blue-800 mt-0.5">
                สำหรับรับออเดอร์เงินสด (COD) เมื่อรับเงินจากลูกค้า ระบบจะหักเครดิตตามค่าอาหารโดยอัตโนมัติ
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-blue-200/50">
              <button
                type="button"
                onClick={() => {
                  setCreditWalletBalance(prev => prev + 200);
                  triggerToast('เติมเครดิตสำเร็จ! 💳', 'เติมเงินเข้า Credit Wallet +฿200.00 สำหรับรับงานเงินสดปลายทางแล้ว', 'success');
                }}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>+ เติมเครดิต ฿200</span>
              </button>
              <span className="text-[10px] text-blue-700">แนะนำรักษายอดขั้นต่ำ ฿300</span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. FINANCIAL SUMMARY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Wallet Balance Card */}
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-2xl p-5 text-white shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200 flex items-center gap-1.5">
              <Wallet className="w-4 h-4" />
              <span>ยอดเงินพร้อมถอนทันที</span>
            </span>
            <span className="text-[9px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
              Real-time
            </span>
          </div>

          <div className="my-3">
            <div className="text-3xl font-black">
              ฿{activeRider.walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-emerald-100 mt-0.5">
              โอนเข้าพร้อมเพย์/ธนาคาร ฟรีค่าธรรมเนียม
            </p>
          </div>

          <button
            id="quick-withdraw-btn"
            onClick={handleWithdrawAll}
            disabled={activeRider.walletBalance <= 0}
            className="w-full py-2 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-black transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs flex items-center justify-center gap-1.5"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>ถอนเงินด่วนเข้าบัญชี</span>
          </button>
        </div>

        {/* Today's Total Gross Earnings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">รายได้รวมสะสมวันนี้</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-slate-900">
              ฿{activeRider.totalEarnedToday.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold">
              รวมค่ารอบ + ระยะทาง + โบนัสพีค
            </span>
          </div>
          <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2">
            วิ่งไปแล้ว {activeRider.todayTripsCount} รอบวันนี้
          </div>
        </div>

        {/* Customer Tips Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">ทิปจากลูกค้า (100% สุทธิ)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-slate-900">
              ฿{totalTipsToday.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-rose-600 font-semibold">
              ไม่มีการหักค่าธรรมเนียมใดๆ ทั้งสิ้น
            </span>
          </div>
          <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2">
            เฉลี่ย ฿{(totalTipsToday / Math.max(1, activeRider.todayTripsCount)).toFixed(1)} / รอบ
          </div>
        </div>

        {/* Lifetime Stats Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">ยอดสะสมตลอดชีพ</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-slate-900">
              ฿{activeRider.totalLifetimeEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-500">
              จากทั้งหมด {activeRider.totalLifetimeTrips} เที่ยวจัดส่ง
            </span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold border-t border-slate-100 pt-2">
            ดาวเฉลี่ย {activeRider.rating.toFixed(2)} ⭐
          </div>
        </div>
      </div>

      {/* THAI RIDER FARE STANDARDS HIGHLIGHT & EXPLANATION BANNER */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>มาตรฐานค่ารอบไรเดอร์ไทย (GPS Distance)</span>
            </span>
            <span className="text-xs text-emerald-200">โปร่งใส 100% ไม่หักค่าหัวคิว</span>
          </div>

          <h3 className="text-sm sm:text-base font-black text-white">
            สูตรคำนวณตามระยะทางจริง: ฿40.00 (3 กม.แรก) + ฿9.00/กม. ส่วนเกิน + ทิปเต็ม
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed">
            ระบบคำนวณค่ารอบตามระยะทางเลี้ยวจริงบนถนน (Road Distance) พร้อมเงินชดเชยเที่ยววิ่งไกลเกิน 10 กม. (+฿13/กม.) และเงินชดเชยจากแพลตฟอร์มเมื่อลูกค้าใช้โค้ดส่งฟรี
          </p>
        </div>

        <button
          id="open-fare-standards-payout-btn"
          onClick={() => {
            setSelectedTripDistance(3.5);
            setIsStandardsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 shrink-0 self-start md:self-center"
        >
          <Calculator className="w-4 h-4" />
          <span>จำลองค่ารอบ & ดูตารางเปรียบเทียบ</span>
        </button>
      </div>

      {/* 2. INSTANT CASH-OUT WITHDRAWAL CONSOLE */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>โอนเงินรายได้เข้าบัญชีไรเดอร์ (Instant Cash-Out)</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              รองรับการโอนเงินด่วนแบบ Real-time ฟรีค่าธรรมเนียม ตลอด 24 ชั่วโมง
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>PromptPay Instant 24/7</span>
          </span>
        </div>

        <form onSubmit={handleConfirmWithdraw} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Amount input & Quick Chips */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                จำนวนเงินที่ต้องการถอน (บาท)
              </label>
              <div className="relative">
                <input
                  id="withdraw-amount-input"
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={e => {
                    setWithdrawAmount(e.target.value);
                    setWithdrawError('');
                  }}
                  className="w-full text-lg font-black px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
                <button
                  type="button"
                  id="withdraw-all-btn"
                  onClick={handleWithdrawAll}
                  className="absolute right-2 top-2 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                >
                  ถอนทั้งหมด
                </button>
              </div>

              {withdrawError && (
                <span className="text-[11px] text-red-500 mt-1 block">{withdrawError}</span>
              )}

              {/* Quick Presets */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-slate-400 font-bold">ยอดด่วน:</span>
                {[100, 300, 500, 1000].map(val => (
                  <button
                    key={val}
                    type="button"
                    id={`quick-val-${val}-btn`}
                    onClick={() => handleQuickAmount(val)}
                    disabled={activeRider.walletBalance < val}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ฿{val}
                  </button>
                ))}
              </div>
            </div>

            {/* Destination Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                เลือกช่องทางรับเงิน
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  id="withdraw-method-promptpay-btn"
                  onClick={() => setWithdrawMethod('promptpay')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    withdrawMethod === 'promptpay'
                      ? 'border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Smartphone className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-extrabold text-slate-900">พร้อมเพย์</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-600 truncate">
                    {activeRider.bankAccount.promptPayId}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold mt-0.5">เข้าทันที Real-time</div>
                </button>

                <button
                  type="button"
                  id="withdraw-method-bank-btn"
                  onClick={() => setWithdrawMethod('bank_account')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    withdrawMethod === 'bank_account'
                      ? 'border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-extrabold text-slate-900">บัญชีธนาคาร</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-600 truncate">
                    {activeRider.bankAccount.accountNumber}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{activeRider.bankAccount.bankName.split(' ')[0]}</div>
                </button>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span className="font-semibold text-slate-700">ชื่อบัญชีผู้รับ:</span>
              <span className="font-bold text-slate-900">{activeRider.bankAccount.accountName}</span>
              <span className="text-slate-300">•</span>
              <span>ค่าธรรมเนียม: <strong className="text-emerald-600 font-black">฿0.00 ฟรี</strong></span>
            </div>

            <button
              type="submit"
              id="confirm-payout-transfer-btn"
              disabled={activeRider.walletBalance <= 0}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>ยืนยันการโอนเงินด่วนทันที 💸</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. TRANSACTION HISTORY & PAYOUT SLIPS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <button
              id="view-trips-history-btn"
              onClick={() => setActiveHistoryView('trips')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeHistoryView === 'trips'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>ประวัติรายได้แต่ละรอบ ({riderEarningsHistory.length})</span>
            </button>

            <button
              id="view-payouts-history-btn"
              onClick={() => setActiveHistoryView('payouts')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeHistoryView === 'payouts'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>สลิปการโอนเงิน ({riderPayoutSlips.length})</span>
            </button>
          </div>
        </div>

        {/* TRIP EARNINGS LOG */}
        {activeHistoryView === 'trips' && (
          <div className="space-y-2.5">
            {riderEarningsHistory.map(trip => (
              <div 
                key={trip.id}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">{trip.restaurantName}</span>
                    <span className="text-slate-300">→</span>
                    <span className="text-slate-700">{trip.customerName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({trip.orderId})</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
                    <button
                      onClick={() => {
                        setSelectedTripDistance(trip.distanceKm);
                        setIsStandardsModalOpen(true);
                      }}
                      className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1"
                      title="กดเพื่อดูการแจกแจงสูตรคำนวณตามระยะทางจริง"
                    >
                      <Bike className="w-3 h-3 text-emerald-600" />
                      <span>{trip.distanceKm} กม.</span>
                    </button>
                    <span>•</span>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">ฐาน ฿{trip.baseFee} (3 กม.)</span>
                    {trip.distanceFee > 0 && (
                      <span className="bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded font-medium">
                        ระยะเกิน +฿{trip.distanceFee}
                      </span>
                    )}
                    {trip.peakBonus > 0 && (
                      <span className="bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-medium">
                        พีค +฿{trip.peakBonus}
                      </span>
                    )}
                    {trip.tipAmount > 0 && (
                      <span className="bg-rose-50 text-rose-800 border border-rose-200 px-1.5 py-0.5 rounded font-bold">
                        ทิป 100% +฿{trip.tipAmount}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                  <div className="text-sm font-black text-emerald-600">
                    +฿{trip.netEarnings.toFixed(2)}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    trip.payoutStatus === 'paid_out'
                      ? 'bg-slate-100 text-slate-500'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {trip.payoutStatus === 'paid_out' ? 'โอนออกแล้ว' : '✓ ถอนได้'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAYOUT SLIPS LOG */}
        {activeHistoryView === 'payouts' && (
          <div className="space-y-2.5">
            {riderPayoutSlips.map(slip => (
              <div 
                key={slip.id}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 flex items-center gap-2">
                      <span>โอนสำเร็จ ฿{slip.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      <span className="text-[10px] font-mono text-slate-400">({slip.payoutRef})</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {slip.destinationDetail} • {slip.transferredAt}
                    </span>
                  </div>
                </div>

                <button
                  id={`view-slip-${slip.id}-btn`}
                  onClick={() => setSelectedSlip(slip)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>ดูสลิป</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slip Modal */}
      {selectedSlip && (
        <RiderPayoutSlipModal
          slip={selectedSlip}
          onClose={() => setSelectedSlip(null)}
        />
      )}

      {/* Thai Rider Fare Standards & Simulator Modal */}
      <RiderFareStandardsModal
        isOpen={isStandardsModalOpen}
        onClose={() => setIsStandardsModalOpen(false)}
        initialDistanceKm={selectedTripDistance}
      />
    </div>
  );
};
