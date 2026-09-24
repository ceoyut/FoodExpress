import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  X, 
  Store, 
  User, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Zap, 
  ArrowRight, 
  Flame,
  PlusCircle,
  AlertCircle
} from 'lucide-react';
import { DispatchQueueOrder, BatchSecondaryOrder } from '../../types';

interface RiderBatchOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  primaryOrder: DispatchQueueOrder;
  secondaryOrder: BatchSecondaryOrder;
  onAcceptBatch: () => void;
  onDeclineBatch: () => void;
}

export const RiderBatchOfferModal: React.FC<RiderBatchOfferModalProps> = ({
  isOpen,
  onClose,
  primaryOrder,
  secondaryOrder,
  onAcceptBatch,
  onDeclineBatch
}) => {
  const [countdown, setCountdown] = useState<number>(15);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(15);
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onDeclineBatch();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onDeclineBatch]);

  if (!isOpen) return null;

  const totalBatchEarnings = primaryOrder.totalTripEarnings + secondaryOrder.addedEarnings;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl border-2 border-amber-400">
        
        {/* Header with Countdown */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl shadow-inner">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase bg-black/30 px-2 py-0.5 rounded-full text-amber-200">
                  STACKED BATCH TRIP
                </span>
                <span className="text-xs font-bold text-amber-100">
                  ทางเดียวกัน!
                </span>
              </div>
              <h3 className="text-base font-black text-white leading-tight">
                มีงานพ่วงใหม่ใกล้เคียงเข้ามา! (+฿{secondaryOrder.addedEarnings.toFixed(2)})
              </h3>
            </div>
          </div>

          {/* Countdown Pill */}
          <div className="w-10 h-10 rounded-full bg-white/25 border-2 border-white flex items-center justify-center font-black text-lg text-white shadow-md animate-pulse">
            {countdown}
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 text-xs text-slate-700">
          
          {/* Earnings summary banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-amber-800 font-bold block">
                รวมรายได้งานพ่วง 2 ออเดอร์ (วิ่งทริปเดียว):
              </span>
              <div className="text-2xl font-black text-amber-900 font-mono">
                ฿{totalBatchEarnings.toFixed(2)}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-emerald-700 font-black bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                + เพิ่มระยะทางเพียง {secondaryOrder.extraDistanceKm} กม.
              </span>
            </div>
          </div>

          {/* Stepper of the 2 Orders Combined */}
          <div className="space-y-3">
            <span className="font-extrabold text-slate-900 block text-xs">
              แผนผังการรับส่งงานพ่วง (Optimized 4-Stop Route):
            </span>

            <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden bg-slate-50/50">
              
              {/* Stop 1: Current Restaurant */}
              <div className="p-3 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  1
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1">
                      <Store className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{primaryOrder.restaurantName} (ออเดอร์เดิม)</span>
                    </span>
                    <span className="text-[10px] text-slate-400">จุดรับ 1</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{primaryOrder.restaurantAddress}</p>
                </div>
              </div>

              {/* Stop 2: Secondary Nearby Restaurant */}
              <div className="p-3 flex items-start gap-2.5 bg-amber-50/70">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 shadow-xs">
                  2
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 text-xs flex items-center gap-1">
                      <Store className="w-3.5 h-3.5 text-amber-600" />
                      <span>{secondaryOrder.restaurantName} (ร้านพ่วงใหม่)</span>
                    </span>
                    <span className="text-[10px] font-black text-amber-700 bg-amber-200/80 px-1.5 py-0.5 rounded">
                      ห่างร้านแรก 250ม.
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">{secondaryOrder.restaurantAddress}</p>
                  <p className="text-[10px] text-amber-800 font-bold mt-0.5">รายการ: {secondaryOrder.itemsSummary}</p>
                </div>
              </div>

              {/* Stop 3: First Customer */}
              <div className="p-3 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  3
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>ส่งมอบ: {primaryOrder.customerName}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">จุดส่ง 1</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{primaryOrder.customerAddress}</p>
                </div>
              </div>

              {/* Stop 4: Second Customer */}
              <div className="p-3 flex items-start gap-2.5 bg-blue-50/60">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 shadow-xs">
                  4
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900 text-xs flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>ส่งมอบ: {secondaryOrder.customerName}</span>
                    </span>
                    <span className="text-[10px] font-black text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                      คอนโดทางเดียวกัน
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">{secondaryOrder.customerAddress}</p>
                </div>
              </div>

            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onDeclineBatch}
              className="py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
            >
              ข้ามงานพ่วงนี้
            </button>

            <button
              type="button"
              onClick={onAcceptBatch}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black cursor-pointer transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Zap className="w-4 h-4" />
              <span>ตอบรับงานพ่วง (+฿{secondaryOrder.addedEarnings.toFixed(2)})</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
