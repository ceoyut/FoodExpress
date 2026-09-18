import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, MapPin, Navigation, Car, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

interface TaxiModalProps {
  onClose: () => void;
}

export const TaxiModal: React.FC<TaxiModalProps> = ({ onClose }) => {
  const { userLocation, triggerToast } = useApp();
  const [pickup, setPickup] = useState(userLocation.name || 'สุขุมวิท 39, กรุงเทพฯ');
  const [destination, setDestination] = useState('');
  const [vehicleType, setVehicleType] = useState<'taxi' | 'plus' | 'van'>('taxi');
  const [isCalling, setIsCalling] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  const fares = {
    taxi: 85,
    plus: 130,
    van: 220,
  };

  const handleBookTaxi = async () => {
    if (!destination.trim()) {
      triggerToast('กรุณาระบุจุดหมายปลายทาง', 'พิมพ์สถานที่ที่คุณต้องการให้รถแท็กซี่ไปส่ง', 'info');
      return;
    }
    setIsCalling(true);
    await new Promise(r => setTimeout(r, 1200));
    setIsCalling(false);
    setIsBooked(true);
    triggerToast('เรียกรถสำเร็จ! 🚕', 'คนขับแท็กซี่กำลังเดินทางมารับคุณใน 4 นาที', 'reward');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col animate-in slide-in-from-bottom-6 duration-200 text-slate-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00BA76] to-[#009E60] p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">
              🚕
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">เรียกแท็กซี่ (LINE MAN Taxi)</h2>
              <p className="text-xs text-white/80">ปลอดภัย มั่นใจทุกการเดินทาง มิเตอร์มาตรฐาน</p>
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
              <h3 className="text-lg font-bold text-slate-800">จับคู่คนขับแท็กซี่สำเร็จ!</h3>
              <p className="text-xs text-slate-500 mt-1">
                คุณเกียรติศักดิ์ • โตโยต้า อัลติส (ทะเบียน 1มข-4421 เขียว-เหลือง)
              </p>
              <p className="text-xs font-bold text-emerald-600 mt-0.5">ถึงจุดรับของคุณในอีก 3-5 นาที</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">ประเภทรถ:</span>
                <span className="font-bold text-slate-800">
                  {vehicleType === 'taxi' ? 'แท็กซี่ทั่วไป (Eco)' : vehicleType === 'plus' ? 'Taxi Plus แอร์เย็น รถใหม่' : 'รถตู้ Van 7 ที่นั่ง'}
                </span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">ค่าโดยสารประมาณการ:</span>
                <span className="font-bold text-emerald-600 text-sm">฿{fares[vehicleType]}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">วิธีชำระเงิน:</span>
                <span className="text-slate-700 font-semibold">พร้อมเพย์ QR / วอลเล็ต / เงินสด</span>
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
            {/* Route Inputs */}
            <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100 shrink-0 ml-1" />
                <div className="flex-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">จุดรับผู้โดยสาร</label>
                  <input
                    type="text"
                    value={pickup}
                    onChange={e => setPickup(e.target.value)}
                    placeholder="ระบุจุดขึ้นรถ"
                    className="w-full bg-transparent text-xs font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 ml-4.5" />

              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-amber-500 ring-4 ring-amber-100 shrink-0 ml-1" />
                <div className="flex-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">ไปส่งที่ไหน?</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={e => setDestination(e.target.value)}
                    placeholder="ค้นหาจุดหมาย เช่น สยามพารากอน, ไอคอนสยาม"
                    className="w-full bg-transparent text-xs font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Vehicle Options */}
            <div>
              <label className="text-xs font-bold text-slate-800 mb-2 block">เลือกประเภทรถ</label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setVehicleType('taxi')}
                  className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                    vehicleType === 'taxi'
                      ? 'border-[#00BA76] bg-emerald-50/60 ring-1 ring-[#00BA76]'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl">
                      🚕
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800">Taxi ทั่วไป</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-bold">ยอดนิยม</span>
                      </div>
                      <p className="text-[11px] text-slate-500">1-4 ที่นั่ง • คนขับมืออาชีพ</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-slate-900">฿85</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVehicleType('plus')}
                  className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                    vehicleType === 'plus'
                      ? 'border-[#00BA76] bg-emerald-50/60 ring-1 ring-[#00BA76]'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl">
                      🚗
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800">Taxi Plus</span>
                      <p className="text-[11px] text-slate-500">รถไซส์ใหญ่ สะอาด แอร์เย็นฉ่ำ</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-slate-900">฿130</span>
                </button>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleBookTaxi}
                disabled={isCalling}
                className="w-full py-3.5 rounded-2xl bg-[#00BA76] hover:bg-[#009E60] text-white font-bold text-sm shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isCalling ? (
                  <span>กำลังค้นหารถแท็กซี่ใกล้คุณ...</span>
                ) : (
                  <>
                    <span>เรียกรถแท็กซี่เลย (ประมาณ ฿{fares[vehicleType]})</span>
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
