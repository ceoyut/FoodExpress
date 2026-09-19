import React from 'react';
import { 
  X, 
  Zap, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  ThermometerSnowflake, 
  Flame, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  Bike
} from 'lucide-react';

interface DeliverySlaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeliverySlaModal: React.FC<DeliverySlaModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col text-slate-800 my-auto">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-xl shadow-xs">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-base sm:text-lg tracking-tight">
                  เกณฑ์ระยะทางและเวลาจัดส่ง FoodExpress
                </h3>
              </div>
              <p className="text-xs text-emerald-100">
                มาตรฐานการจัดส่งเพื่อไม่ให้ลูกค้ารอนาน และรักษาความสดใหม่ 100%
              </p>
            </div>
          </div>

          <button
            id="close-delivery-sla-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
          {/* Formula summary */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <div className="flex items-center gap-1.5 text-emerald-900 font-extrabold text-xs">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>สูตรคำนวณเวลารวมถึงมือลูกค้า (Total Delivery Time)</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-white border border-emerald-100 shadow-2xs">
                <div className="text-[10px] text-slate-500 font-medium">1. เวลาทำอาหาร</div>
                <div className="font-extrabold text-slate-800 text-sm mt-0.5">10 - 15 นาที</div>
                <div className="text-[9px] text-emerald-700">เชฟปรุงสดใหม่</div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-emerald-100 shadow-2xs">
                <div className="text-[10px] text-slate-500 font-medium">2. ไรเดอร์เดินทาง</div>
                <div className="font-extrabold text-slate-800 text-sm mt-0.5">10 - 15 นาที</div>
                <div className="text-[9px] text-emerald-700">ระยะ &le; 3-5 กม.</div>
              </div>
              <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-2xs">
                <div className="text-[10px] text-emerald-100 font-medium">3. ถึงมือคุณ</div>
                <div className="font-extrabold text-white text-sm mt-0.5">20 - 30 นาที</div>
                <div className="text-[9px] text-emerald-100 font-bold">ยอดเยี่ยม ⚡</div>
              </div>
            </div>
          </div>

          {/* 3 Distance & Time SLA Tiers */}
          <div className="space-y-3">
            <h4 className="font-black text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>ระดับเกณฑ์มาตรฐานระยะทาง (Delivery SLA Tiers)</span>
            </h4>

            {/* Tier 1: Sweet Spot */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/50 border-2 border-emerald-400 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black tracking-wide uppercase">
                    แนะนำอันดับ 1 • Sweet Spot
                  </span>
                  <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    ไม่เกิน 3 - 5 กิโลเมตร
                  </span>
                </div>
                <span className="font-black text-emerald-700 text-xs">20 - 30 นาที</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                ระยะทางที่เหมาะสมที่สุด ไรเดอร์เดินทางเฉลี่ยเพียง 10-15 นาที <b>อาหารยังคงความร้อน กรอบ ไม่เซ็ตตัว และน้ำแข็งไม่ละลาย</b> ลูกค้ารู้สึกประทับใจว่าได้รับเร็วมาก
              </p>
              <div className="flex items-center gap-3 pt-1 text-[11px] text-emerald-800 font-medium">
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500" /> อาหารร้อนกรอบ 100%
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ไรเดอร์ถึงไว
                </span>
              </div>
            </div>

            {/* Tier 2: Standard Distance */}
            <div className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-300 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black tracking-wide">
                    ระยะมาตรฐานปลอดภัย
                  </span>
                  <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    5 - 8 กิโลเมตร
                  </span>
                </div>
                <span className="font-black text-amber-800 text-xs">30 - 45 นาที</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                เกณฑ์มาตรฐานที่ยอมรับได้ในช่วงเวลาเร่งด่วน (Peak Hours) ไรเดอร์เดินทาง 15-20 นาที คุณภาพอาหารยังอยู่ในเกณฑ์ดี
              </p>
            </div>

            {/* Tier 3: Extended Distance */}
            <div className="p-3.5 rounded-2xl bg-orange-50/40 border border-orange-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-black tracking-wide">
                    ระยะไกลพิเศษ
                  </span>
                  <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    เกิน 8 กิโลเมตร
                  </span>
                </div>
                <span className="font-black text-orange-700 text-xs">&gt; 45 นาที</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                อาจมีความเสี่ยงจากการจราจรติดขัดหรือสภาพอากาศ FoodExpress <b>จัดระบบคัดเลือกไรเดอร์พร้อมกระเป๋าเก็บความร้อน-เย็นพิเศษ (Thermal Bag)</b> และแจ้งเตือนระยะเวลาที่ชัดเจน
              </p>
            </div>
          </div>

          {/* 3 Core System Principles */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>3 นวัตกรรมของ FoodExpress ที่ช่วยลดเวลารอ:</span>
            </h5>
            <ul className="space-y-1.5 text-xs text-slate-600 pl-1">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span><b>Smart Pre-dispatch:</b> ส่งสัญญาณเรียกรถไรเดอร์ทันทีที่ร้านกดยืนยัน เพื่อให้ไรเดอร์ถึงร้านตรงกับจังหวะที่อาหารปรุงเสร็จพอดี (ลดเวลารอที่หน้าร้านเป็น 0)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span><b>Freshness Distance Guarantee:</b> ติดป้ายแนะนำร้านในรัศมี 3-5 กม. เป็นอันดับแรก เพื่อให้ได้อาหารร้อน สด กรอบ</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span><b>Live Telemetry Tracking:</b> แสดงพิกัดสดและเวลาคงเหลือแบบนาทีต่อนาที เพื่อให้ลูกค้ารู้สถานะจริงอย่างโปร่งใส</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            id="acknowledge-delivery-sla-btn"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            เข้าใจแล้ว รับทราบเกณฑ์
          </button>
        </div>
      </div>
    </div>
  );
};
