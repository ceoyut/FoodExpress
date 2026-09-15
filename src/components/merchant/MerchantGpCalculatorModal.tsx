import React, { useState, useMemo } from 'react';
import { 
  X, 
  Calculator, 
  Percent, 
  DollarSign, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Info,
  ShieldCheck,
  Building2,
  Receipt
} from 'lucide-react';
import { GP_PACKAGES } from '../../data/merchantAuthData';
import { useApp } from '../../context/AppContext';

interface MerchantGpCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGrossSales?: number;
  initialGpRate?: number;
}

export const MerchantGpCalculatorModal: React.FC<MerchantGpCalculatorModalProps> = ({
  isOpen,
  onClose,
  initialGrossSales = 10000,
  initialGpRate = 20,
}) => {
  const { 
    activeMerchant, 
    updateMerchantConfig, 
    selectedSettlementRestId, 
    triggerToast 
  } = useApp();

  const [salesAmount, setSalesAmount] = useState<number>(initialGrossSales);
  const [gpRate, setGpRate] = useState<number>(initialGpRate);
  const [paymentFeeRate, setPaymentFeeRate] = useState<number>(1.5);
  const [isCorporate, setIsCorporate] = useState<boolean>(activeMerchant?.isCorporate ?? true);

  // Recalculate financial breakdown
  const calculations = useMemo(() => {
    const gross = Math.max(0, salesAmount);
    const gpFee = Math.round(gross * (gpRate / 100) * 100) / 100;
    const vatOnGp = Math.round(gpFee * 0.07 * 100) / 100;
    const paymentFee = Math.round(gross * (paymentFeeRate / 100) * 100) / 100;
    const vatOnPaymentFee = Math.round(paymentFee * 0.07 * 100) / 100;
    const totalVat = Math.round((vatOnGp + vatOnPaymentFee) * 100) / 100;
    
    // WHT 3% on services
    const whtRate = isCorporate ? 0.03 : 0;
    const wht = Math.round((gpFee + paymentFee) * whtRate * 100) / 100;

    // Total deductions
    const totalDeductions = Math.round((gpFee + paymentFee + totalVat - wht) * 100) / 100;
    const netPayout = Math.max(0, Math.round((gross - totalDeductions) * 100) / 100);
    const profitPercentage = gross > 0 ? Math.round((netPayout / gross) * 1000) / 10 : 0;

    return {
      gross,
      gpFee,
      paymentFee,
      vatOnGp,
      totalVat,
      wht,
      totalDeductions,
      netPayout,
      profitPercentage,
    };
  }, [salesAmount, gpRate, paymentFeeRate, isCorporate]);

  // Apply new GP rate to current merchant
  const handleApplyGpRate = (rate: number) => {
    if (selectedSettlementRestId) {
      updateMerchantConfig(selectedSettlementRestId, {
        gpRatePct: rate,
      });
      triggerToast(
        'อัปเดตสัญญา GP สำเร็จ! 📋',
        `ปรับอัตรา GP สำหรับร้านเป็น ${rate}% เรียบร้อยแล้ว`,
        'success'
      );
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 text-white p-5 relative shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950">
                  GP Engine Simulator
                </span>
                <span className="text-xs text-emerald-200">จำลองการคำนวณและรายได้สุทธิ</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                เครื่องคำนวณอัตรา GP และส่วนแบ่งรายได้
              </h2>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Sliders Control Card */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
            {/* Sales Amount Slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  ยอดขายอาหารรวมต่อรอบ (Gross Sales)
                </label>
                <span className="text-base font-black text-slate-900">
                  ฿{salesAmount.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="100000"
                step="1000"
                value={salesAmount}
                onChange={e => setSalesAmount(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>฿1,000</span>
                <span>฿25,000</span>
                <span>฿50,000</span>
                <span>฿100,000</span>
              </div>
            </div>

            {/* GP Rate Slider & Presets */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  อัตราค่าธรรมเนียม GP (Platform Commission)
                </label>
                <span className="text-base font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg">
                  {gpRate}%
                </span>
              </div>
              
              {/* Presets buttons */}
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[
                  { label: '0% Non-GP', rate: 0 },
                  { label: '15% Starter', rate: 15 },
                  { label: '20% Standard', rate: 20 },
                  { label: '25% Growth', rate: 25 },
                ].map(item => (
                  <button
                    key={item.rate}
                    type="button"
                    onClick={() => setGpRate(item.rate)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      gpRate === item.rate
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <input
                type="range"
                min="0"
                max="35"
                step="1"
                value={gpRate}
                onChange={e => setGpRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {/* Corporate Tax Switch */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                หักภาษี ณ ที่จ่าย WHT 3% (สำหรับนิติบุคคล)
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCorporate}
                  onChange={e => setIsCorporate(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>

          {/* Breakdown Result Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <span>สรุปผลการคำนวณและเงินโอนเข้าบัญชี</span>
            </h3>

            {/* Big Highlight Card: Net Payout */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider">
                    ยอดเงินโอนสุทธิให้ร้านค้า (Net Payout)
                  </span>
                  <div className="text-2xl sm:text-3xl font-black mt-0.5">
                    ฿{calculations.netPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-lg">
                    คิดเป็น {calculations.profitPercentage}% ของยอดขาย
                  </span>
                  <p className="text-[10px] text-emerald-200 mt-1">โอนเข้าทุกวัน 14:00 น.</p>
                </div>
              </div>
            </div>

            {/* Detailed Calculation Items Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 font-bold text-slate-700">
                <span>ยอดขายอาหารรวม (Gross Sales)</span>
                <span className="text-sm font-black text-slate-900 font-mono">
                  +฿{calculations.gross.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                  <span>หัก ค่าคอมมิชชัน GP ({gpRate}%)</span>
                </div>
                <span className="font-bold text-red-600 font-mono">
                  -฿{calculations.gpFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>หัก ค่าธรรมเนียมชำระเงิน MDR (1.5%)</span>
                </div>
                <span className="font-bold text-amber-700 font-mono">
                  -฿{calculations.paymentFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  <span>หัก ภาษีมูลค่าเพิ่ม VAT 7% ของค่าบริการ</span>
                </div>
                <span className="font-bold text-slate-700 font-mono">
                  -฿{calculations.totalVat.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              {isCorporate && (
                <div className="flex items-center justify-between p-3 text-slate-600 bg-emerald-50/40">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>บวกคืน หัก ณ ที่จ่าย WHT 3% (ร้านค้าหักไว้)</span>
                  </div>
                  <span className="font-bold text-emerald-700 font-mono">
                    +฿{calculations.wht.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Compare with all GP packages */}
          <div className="pt-2 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 mb-2.5">
              เปรียบเทียบยอดโอนสุทธิทุกแพ็กเกจ (บนยอดขาย ฿{salesAmount.toLocaleString()})
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {GP_PACKAGES.map(pkg => {
                const pkgGpFee = Math.round(salesAmount * (pkg.ratePct / 100) * 100) / 100;
                const pkgVat = Math.round((pkgGpFee + salesAmount * 0.015) * 0.07 * 100) / 100;
                const pkgNet = Math.round((salesAmount - pkgGpFee - (salesAmount * 0.015) - pkgVat) * 100) / 100;
                const isSelected = gpRate === pkg.ratePct;

                return (
                  <button
                    key={pkg.tier}
                    type="button"
                    onClick={() => setGpRate(pkg.ratePct)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 shadow-xs ring-2 ring-emerald-400'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-slate-500 block truncate">
                      {pkg.nameTh}
                    </span>
                    <span className="text-sm font-black text-emerald-700 block mt-0.5">
                      ฿{pkgNet.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      GP {pkg.ratePct}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Button: Apply GP Rate */}
        <div className="bg-slate-50 p-4 px-6 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
          >
            ปิด
          </button>

          <button
            type="button"
            onClick={() => handleApplyGpRate(gpRate)}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>ปรับใช้อัตรา GP {gpRate}% กับร้านนี้</span>
          </button>
        </div>
      </div>
    </div>
  );
};
