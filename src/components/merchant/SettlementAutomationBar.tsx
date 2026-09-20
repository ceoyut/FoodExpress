import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  Building2, 
  CreditCard, 
  FileText, 
  Check, 
  RefreshCw,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SettlementAutomationBarProps {
  restaurantId: string;
  selectedDate: string;
}

export const SettlementAutomationBar: React.FC<SettlementAutomationBarProps> = ({
  restaurantId,
  selectedDate
}) => {
  const { 
    merchantSettlements, 
    runEodSettlementCalculation, 
    approveAndTransferPayout,
    triggerToast 
  } = useApp();

  const [isAutoTransferEnabled, setIsAutoTransferEnabled] = useState(true);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isSimulatingEod, setIsSimulatingEod] = useState(false);

  // Find current settlement
  const currentSettlement = merchantSettlements.find(
    s => s.restaurantId === restaurantId && s.date === selectedDate
  );

  // Real-time countdown to 23:59:59 today
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const eod = new Date();
      eod.setHours(23, 59, 59, 999);

      const diff = Math.max(0, eod.getTime() - now.getTime());
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateEodCutoff = () => {
    setIsSimulatingEod(true);
    triggerToast('กำลังประมวลผลตัดรอบอัตโนมัติ...', 'ระบบกำลังกระทบยอดบิลขาย คำนวณ GP และหักภาษี ณ ที่จ่าย 3%', 'info');

    setTimeout(() => {
      // 1. Calculate EOD
      runEodSettlementCalculation(restaurantId, selectedDate);

      // 2. If auto-transfer enabled, approve transfer immediately
      if (isAutoTransferEnabled) {
        setTimeout(() => {
          const settlement = merchantSettlements.find(
            s => s.restaurantId === restaurantId && s.date === selectedDate
          );
          if (settlement && settlement.status !== 'paid') {
            approveAndTransferPayout(settlement.id);
          }
          setIsSimulatingEod(false);
          triggerToast(
            'ตัดรอบ 23:59:59 และโอนเงินสำเร็จ! 💸',
            `ระบบโอนเงินสุทธิเข้าบัญชีธนาคารกสิกรไทยเรียบร้อย (เลขอ้างอิง KBANK-${Date.now().toString().slice(-6)})`,
            'reward'
          );
        }, 300);
      } else {
        setIsSimulatingEod(false);
        triggerToast('สรุปยอดขาย EOD สำเร็จ', 'รอผู้จัดการกดอนุมัติโอนเงินด้วยตนเอง', 'success');
      }
    }, 700);
  };

  const padZero = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950 text-white p-4 sm:p-5 rounded-3xl border border-slate-800 shadow-md space-y-4">
      
      {/* Top Header: Automation Engine & EOD Timer */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                Settlement Automation
              </span>
              <span className="text-[11px] text-slate-300">ระบบตัดยอด & โอนเงินอัตโนมัติ</span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
              ตัดรอบบัญชีอัตโนมัติประจำวัน (EOD 23:59:59 Auto-Cutoff)
            </h3>
            <p className="text-xs text-slate-300">
              ระบบจะคำนวณ GP, ภาษีมูลค่าเพิ่ม 7%, ภาษีหัก ณ ที่จ่าย 3% และโอนเงินเข้าบัญชีร้านค้าทันทีหลังเที่ยงคืน
            </p>
          </div>
        </div>

        {/* Real-time Countdown Box */}
        <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 px-3.5 py-2 rounded-2xl self-start md:self-center shrink-0">
          <Clock className="w-4 h-4 text-emerald-400" />
          <div className="text-left">
            <span className="text-[10px] text-slate-400 block font-medium">นับถอยหลังตัดรอบวันนี้:</span>
            <div className="font-mono text-sm font-black text-emerald-400 tracking-wider">
              {padZero(timeLeft.hours)}:{padZero(timeLeft.minutes)}:{padZero(timeLeft.seconds)} น.
            </div>
          </div>
        </div>
      </div>

      {/* Controls & Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 border-t border-slate-800/80">
        
        {/* Toggle Switch */}
        <div className="bg-slate-850/80 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="font-bold text-xs text-white block">โอนเงินเข้าบัญชีอัตโนมัติ</span>
            <span className="text-[10px] text-slate-400">
              {isAutoTransferEnabled ? 'เปิดใช้งาน (โอนเข้าบัญชีทันที)' : 'ปิด (รอร้านค้ากดรับเอง)'}
            </span>
          </div>
          <button
            id="toggle-auto-transfer-btn"
            onClick={() => {
              setIsAutoTransferEnabled(!isAutoTransferEnabled);
              triggerToast(
                !isAutoTransferEnabled ? 'เปิดระบบโอนเงินอัตโนมัติแล้ว' : 'ปิดระบบโอนเงินอัตโนมัติแล้ว',
                !isAutoTransferEnabled ? 'ระบบจะโอนยอดสุทธิเข้าบัญชีธนาคารทันทีเมื่อถึงเวลา 23:59:59' : 'คุณต้องกดอนุมัติเงินโอนในหน้าสรุปยอดด้วยตนเอง',
                'info'
              );
            }}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
              isAutoTransferEnabled ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
              isAutoTransferEnabled ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Current Settlement Status */}
        <div className="bg-slate-850/80 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="font-bold text-xs text-white block">สถานะยอดวันที่เลือก ({selectedDate})</span>
            <span className="text-[10px] text-slate-400">
              {currentSettlement?.status === 'paid' 
                ? `โอนแล้ว (${currentSettlement.transferRefNumber || 'KBANK'})` 
                : currentSettlement?.status === 'calculated'
                ? 'คำนวณแล้ว (รอตัดรอบ/โอน)'
                : 'รอการตัดรอบสิ้นวัน'}
            </span>
          </div>
          {currentSettlement?.status === 'paid' ? (
            <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" />
              โอนสำเร็จ
            </span>
          ) : (
            <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
              รอดำเนินการ
            </span>
          )}
        </div>

        {/* Trigger Simulation Button */}
        <button
          id="simulate-eod-cutoff-btn"
          onClick={handleSimulateEodCutoff}
          disabled={isSimulatingEod}
          className="bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white p-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isSimulatingEod ? 'animate-spin' : ''}`} />
          <span>{isSimulatingEod ? 'กำลังประมวลผลรอบเที่ยงคืน...' : 'จำลองถึงเวลา 23:59:59 (Run EOD Now)'}</span>
        </button>

      </div>

      {/* Merchant Security & Legal KYC Badges (Recommendation 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-xs">
        
        {/* DBD Registered Badge */}
        <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
          <div className="w-6 h-6 rounded-lg bg-emerald-950 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <div className="overflow-hidden">
            <span className="text-[10px] font-bold text-emerald-400 block truncate flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 inline shrink-0" />
              DBD จดทะเบียนพาณิชย์
            </span>
            <span className="text-[10px] text-slate-400 font-mono block truncate">
              เลขทะเบียน: 0105562098812
            </span>
          </div>
        </div>

        {/* Bank Passbook Verified */}
        <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
          <div className="w-6 h-6 rounded-lg bg-sky-950 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
            <CreditCard className="w-3.5 h-3.5" />
          </div>
          <div className="overflow-hidden">
            <span className="text-[10px] font-bold text-sky-400 block truncate flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-sky-400 inline shrink-0" />
              สมุดบัญชีธนาคารยืนยันแล้ว
            </span>
            <span className="text-[10px] text-slate-400 font-mono block truncate">
              กสิกรไทย: 092-2-88190-4
            </span>
          </div>
        </div>

        {/* e-Tax Ready & WHT 3% */}
        <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
          <div className="w-6 h-6 rounded-lg bg-amber-950 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div className="overflow-hidden">
            <span className="text-[10px] font-bold text-amber-400 block truncate flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-amber-400 inline shrink-0" />
              e-Tax & หัก ณ ที่จ่าย 3%
            </span>
            <span className="text-[10px] text-slate-400 font-mono block truncate">
              นำส่งกรมสรรพากรอัตโนมัติ
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
