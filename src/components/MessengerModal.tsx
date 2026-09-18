import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, MapPin, Package, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

interface MessengerModalProps {
  onClose: () => void;
}

export const MessengerModal: React.FC<MessengerModalProps> = ({ onClose }) => {
  const { userLocation, triggerToast } = useApp();
  const [pickup, setPickup] = useState(userLocation.name || 'ตำแหน่งปัจจุบัน (สุขุมวิท 39)');
  const [destination, setDestination] = useState('');
  const [parcelType, setParcelType] = useState<'document' | 'box' | 'food'>('document');
  const [isRequesting, setIsRequesting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  const priceEstimate = parcelType === 'document' ? 45 : parcelType === 'box' ? 75 : 60;

  const handleBooking = async () => {
    if (!destination.trim()) {
      triggerToast('กรุณาระบุสถานที่ส่ง', 'พิมพ์จุดหมายปลายทางที่ต้องการให้เมสเซ็นเจอร์ไปส่ง', 'info');
      return;
    }
    setIsRequesting(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsRequesting(false);
    setIsBooked(true);
    triggerToast('เรียกเมสเซ็นเจอร์สำเร็จ! 🛵', 'ไรเดอร์กำลังมุ่งหน้ามารับพัสดุของคุณ', 'reward');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col animate-in slide-in-from-bottom-6 duration-200 text-slate-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00BA76] to-[#009E60] p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">
              🛵
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">เมสเซ็นเจอร์ (LINE MAN Express)</h2>
              <p className="text-xs text-white/80">ส่งเอกสาร พัสดุ ด่วนทันใจ ถึงผู้รับใน 30 นาที</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {isBooked ? (
          <div className="p-6 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">ค้นพบไรเดอร์เมสเซ็นเจอร์แล้ว!</h3>
              <p className="text-xs text-slate-500 mt-1">
                คุณสมชาย (มอเตอร์ไซค์ ทะเบียน 2ขก-9821) กำลังเดินทางมารับของที่ {pickup}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">ประเภทพัสดุ:</span>
                <span className="font-bold text-slate-800">
                  {parcelType === 'document' ? 'เอกสาร / ซองจดหมาย' : parcelType === 'box' ? 'กล่องพัสดุ' : 'อาหาร / ของสด'}
                </span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">ค่าบริการสุทธิ:</span>
                <span className="font-bold text-emerald-600 text-sm">฿{priceEstimate}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">ประกันพัสดุ:</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> คุ้มครองสูงสุด ฿3,000
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-[#00BA76] hover:bg-[#009E60] text-white font-bold text-sm cursor-pointer"
            >
              รับทราบ / กลับสู่หน้าหลัก
            </button>
          </div>
        ) : (
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 no-scrollbar">
            {/* Pickup & Destination inputs */}
            <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100 shrink-0 ml-1" />
                <div className="flex-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">จุดรับพัสดุ</label>
                  <input
                    type="text"
                    value={pickup}
                    onChange={e => setPickup(e.target.value)}
                    placeholder="ระบุจุดรับพัสดุ"
                    className="w-full bg-transparent text-xs font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 ml-4.5" />

              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-500 ring-4 ring-rose-100 shrink-0 ml-1" />
                <div className="flex-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">จุดส่งพัสดุ</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={e => setDestination(e.target.value)}
                    placeholder="พิมพ์ชื่อสถานที่ปลายทางหรือเบอร์โทรผู้รับ"
                    className="w-full bg-transparent text-xs font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Parcel Type Selection */}
            <div>
              <label className="text-xs font-bold text-slate-800 mb-2 block">ประเภทพัสดุ</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setParcelType('document')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    parcelType === 'document'
                      ? 'border-[#00BA76] bg-emerald-50 text-emerald-800 font-bold'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <span className="text-lg block mb-1">📄</span>
                  <span className="text-xs">เอกสาร</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">฿45</span>
                </button>

                <button
                  type="button"
                  onClick={() => setParcelType('box')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    parcelType === 'box'
                      ? 'border-[#00BA76] bg-emerald-50 text-emerald-800 font-bold'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <span className="text-lg block mb-1">📦</span>
                  <span className="text-xs">กล่องพัสดุ</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">฿75</span>
                </button>

                <button
                  type="button"
                  onClick={() => setParcelType('food')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    parcelType === 'food'
                      ? 'border-[#00BA76] bg-emerald-50 text-emerald-800 font-bold'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <span className="text-lg block mb-1">🍱</span>
                  <span className="text-xs">อาหาร/เค้ก</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">฿60</span>
                </button>
              </div>
            </div>

            {/* Guarantee badge */}
            <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/80 flex items-center gap-2 text-xs text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>คุ้มครองสินค้าสูญหาย/เสียหาย พร้อมเช็กพิกัด GPS ตลอดทาง</span>
            </div>

            {/* Bottom Call to action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleBooking}
                disabled={isRequesting}
                className="w-full py-3.5 rounded-2xl bg-[#00BA76] hover:bg-[#009E60] text-white font-bold text-sm shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isRequesting ? (
                  <span>กำลังค้นหาไรเดอร์เมสเซ็นเจอร์...</span>
                ) : (
                  <>
                    <span>เรียกเมสเซ็นเจอร์ทันที (ประมาณ ฿{priceEstimate})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
