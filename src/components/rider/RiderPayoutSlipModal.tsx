import React from 'react';
import { RiderPayoutSlip } from '../../types';
import { 
  X, 
  CheckCircle2, 
  QrCode, 
  Download, 
  Share2, 
  Building2, 
  Smartphone, 
  ShieldCheck 
} from 'lucide-react';

interface RiderPayoutSlipModalProps {
  slip: RiderPayoutSlip | null;
  onClose: () => void;
}

export const RiderPayoutSlipModal: React.FC<RiderPayoutSlipModalProps> = ({ slip, onClose }) => {
  if (!slip) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Slip Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white relative">
          <button
            id="close-payout-slip-btn"
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200">
              e-Slip โอนเงินค่ารอบไรเดอร์สำเร็จ
            </span>
          </div>

          <h3 className="text-xl font-black">FoodExpress Rider Pay</h3>
          <p className="text-[11px] text-emerald-100 mt-0.5">
            สลิปหลักฐานการโอนเงินค่ารอบและทิปพนักงานจัดส่ง
          </p>
        </div>

        {/* Amount Box */}
        <div className="p-5 text-center bg-slate-50/70 border-b border-slate-100">
          <span className="text-[11px] text-slate-500 font-bold uppercase block">
            จำนวนเงินที่โอนสำเร็จ
          </span>
          <div className="text-3xl font-black text-slate-900 mt-1">
            ฿{slip.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>โอนสำเร็จแบบ Real-time 24 ชม.</span>
          </span>
        </div>

        {/* Slip Details Body */}
        <div className="p-5 space-y-3.5 text-xs text-slate-700">
          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">รหัสอ้างอิงธุรกรรม:</span>
            <span className="font-mono font-bold text-slate-900">{slip.payoutRef}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">ผู้โอนเงิน:</span>
            <span className="font-semibold text-slate-900">บจก. ฟู้ดเอ็กซ์เพรส (ประเทศไทย)</span>
          </div>

          <div className="flex items-start justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">ผู้รับเงิน (ไรเดอร์):</span>
            <div className="text-right">
              <span className="font-bold text-slate-900 block">{slip.riderName}</span>
              <span className="text-[11px] text-slate-500 font-mono">{slip.riderId}</span>
            </div>
          </div>

          <div className="flex items-start justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">ช่องทางรับเงิน:</span>
            <div className="text-right">
              <span className="font-bold text-slate-900 flex items-center justify-end gap-1">
                {slip.destinationType === 'promptpay' ? (
                  <>
                    <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                    <span>พร้อมเพย์ (PromptPay)</span>
                  </>
                ) : (
                  <>
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>โอนผ่านบัญชีธนาคาร</span>
                  </>
                )}
              </span>
              <span className="text-[11px] text-slate-500">{slip.destinationDetail}</span>
            </div>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">ค่าธรรมเนียมการโอน:</span>
            <span className="font-bold text-emerald-600">฿0.00 (ฟรี)</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">วันเวลาที่โอน:</span>
            <span className="font-medium text-slate-700">{slip.transferredAt}</span>
          </div>

          {/* QR Verification Mock Box */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center p-1 shadow-2xs">
                <QrCode className="w-full h-full text-slate-800" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-800 block">สแกนตรวจสอบ e-Slip</span>
                <span className="text-[9px] text-slate-400">Verified by Bank of Thailand Standard</span>
              </div>
            </div>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
          <button
            onClick={() => {
              alert(`บันทึกสลิป ${slip.payoutRef} ลงในเครื่องเรียบร้อยแล้ว`);
            }}
            className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>บันทึกสลิป</span>
          </button>
        </div>
      </div>
    </div>
  );
};
