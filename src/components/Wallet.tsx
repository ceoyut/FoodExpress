import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Wallet as WalletIcon, 
  AlertTriangle, 
  Plus, 
  ChevronRight, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  X,
  Sliders
} from 'lucide-react';

interface WalletProps {
  threshold?: number;
  className?: string;
  showDetailsOnHover?: boolean;
}

export const Wallet: React.FC<WalletProps> = ({
  threshold: customThreshold,
  className = '',
}) => {
  const {
    user,
    setIsTopUpOpen,
    walletLowBalanceThreshold,
    setWalletLowBalanceThreshold,
    setWalletBalance,
    t,
    language
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Active threshold is either prop or context threshold
  const activeThreshold = customThreshold !== undefined ? customThreshold : walletLowBalanceThreshold;
  const isLowBalance = user.walletBalance < activeThreshold;

  // Close popover when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const presetThresholds = [100, 150, 200, 300, 500];

  return (
    <div className={`relative inline-block ${className}`} ref={popoverRef}>
      {/* Wallet Balance Pill */}
      <div 
        id="wallet-component-widget"
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all duration-200 shadow-2xs ${
          isLowBalance
            ? 'bg-gradient-to-r from-amber-50 via-rose-50 to-orange-50 border border-amber-300 ring-2 ring-amber-400/30'
            : 'bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60'
        }`}
      >
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 cursor-pointer text-left focus:outline-none"
          title={isLowBalance ? t('lowBalanceWarning') : t('wallet')}
        >
          <div className="relative">
            <WalletIcon className={`w-3.5 h-3.5 shrink-0 ${isLowBalance ? 'text-amber-600' : 'text-emerald-600'}`} />
            {isLowBalance && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className={`text-[9px] font-bold leading-none ${isLowBalance ? 'text-amber-800' : 'text-emerald-800'}`}>
                {t('wallet')}
              </span>

              {/* Warning Badge Triggered when balance < threshold */}
              {isLowBalance && (
                <span
                  id="wallet-warning-badge"
                  className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black tracking-tight animate-pulse shadow-xs"
                >
                  <AlertTriangle className="w-2.5 h-2.5" />
                  <span>{language === 'th' ? 'ยอดต่ำ' : 'LOW'}</span>
                </span>
              )}
            </div>

            <span className={`text-xs font-black leading-tight ${isLowBalance ? 'text-rose-950' : 'text-emerald-950'}`}>
              ฿{(user?.walletBalance ?? 0).toLocaleString()}
            </span>
          </div>
        </button>

        {/* Quick Top-Up Plus Button */}
        <button
          id="header-topup-wallet-btn"
          type="button"
          onClick={() => setIsTopUpOpen(true)}
          className={`ml-1 w-5 h-5 rounded-full text-white flex items-center justify-center text-xs font-bold transition-transform active:scale-95 shadow-xs cursor-pointer ${
            isLowBalance 
              ? 'bg-amber-600 hover:bg-amber-700 ring-1 ring-amber-400/50 animate-bounce' 
              : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
          title={t('topUpWalletTitle')}
          aria-label={t('topUp')}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Popover / Warning Details Menu */}
      {isOpen && (
        <div
          id="wallet-details-popover"
          className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95"
        >
          {/* Popover Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                isLowBalance ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {isLowBalance ? <AlertTriangle className="w-4 h-4 text-amber-600" /> : <ShieldCheck className="w-4 h-4 text-emerald-600" />}
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-slate-900 leading-snug">
                  {t('walletTitle')}
                </h4>
                <p className="text-[10px] text-slate-500">
                  {isLowBalance ? t('lowBalanceAlert') : 'FoodExpress Digital Cash'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Current Balance Display */}
          <div className="py-3">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-[11px] text-slate-500">{t('currentBalance')}</span>
              <span className={`text-lg font-black ${isLowBalance ? 'text-rose-600' : 'text-slate-900'}`}>
                ฿{(user?.walletBalance ?? 0).toLocaleString()}
              </span>
            </div>

            {/* Warning Alert Banner inside Popover if low balance */}
            {isLowBalance ? (
              <div 
                id="wallet-popover-warning-alert"
                className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2 text-[11px] mb-3 leading-relaxed"
              >
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">
                    {language === 'th' ? 'ยอดเงินต่ำกว่าเกณฑ์เตือน!' : 'Balance Below Threshold!'}
                  </p>
                  <p className="text-[10px] text-rose-800">
                    {t('lowBalanceDesc', { threshold: activeThreshold })}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-1.5 text-[11px] mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  {language === 'th' ? `ยอดเงินเพียงพอ (สูงกว่าเกณฑ์ ฿${activeThreshold})` : `Balance is healthy (> ฿${activeThreshold})`}
                </span>
              </div>
            )}

            {/* Top Up Button */}
            <button
              id="wallet-popover-topup-btn"
              onClick={() => {
                setIsOpen(false);
                setIsTopUpOpen(true);
              }}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.99]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('topUpNow')}</span>
            </button>
          </div>

          {/* Threshold Configuration & Simulation Section */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <Sliders className="w-3 h-3 text-slate-500" />
                <span>{t('safetyThreshold')}</span>
              </span>
              <span className="font-extrabold text-emerald-800">
                ฿{activeThreshold}
              </span>
            </div>

            {/* Threshold Selector Pills */}
            <div className="grid grid-cols-5 gap-1">
              {presetThresholds.map(amount => (
                <button
                  key={amount}
                  type="button"
                  id={`wallet-threshold-btn-${amount}`}
                  onClick={() => setWalletLowBalanceThreshold(amount)}
                  className={`py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                    activeThreshold === amount
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ฿{amount}
                </button>
              ))}
            </div>

            {/* Quick Testing Actions (To trigger & verify low balance warning badge easily) */}
            <div className="pt-2 flex gap-1.5">
              <button
                id="simulate-low-balance-btn"
                type="button"
                onClick={() => setWalletBalance(50)}
                className="flex-1 py-1.5 px-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold text-center transition-colors cursor-pointer"
                title="ตั้งค่ายอดเงินเป็น ฿50 เพื่อทดสอบการแสดงผลป้ายเตือนยอดเงินต่ำ"
              >
                {t('simulateLowBalance')}
              </button>

              <button
                id="restore-normal-balance-btn"
                type="button"
                onClick={() => setWalletBalance(650)}
                className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[10px] font-bold text-center transition-colors cursor-pointer"
                title="คืนค่ายอดเงินกลับเป็น ฿650"
              >
                {t('restoreBalance')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
