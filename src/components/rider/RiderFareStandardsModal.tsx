import React, { useState } from 'react';
import { 
  X, 
  Bike, 
  MapPin, 
  Zap, 
  CloudRain, 
  Clock, 
  Heart, 
  Sliders, 
  ShieldCheck, 
  CheckCircle2, 
  TrendingUp, 
  HelpCircle,
  Building2,
  DollarSign
} from 'lucide-react';
import { 
  calculateThaiRiderFare, 
  THAI_FARE_ZONES, 
  THAI_PLATFORMS_BENCHMARK 
} from '../../utils/riderFareCalculator';

interface RiderFareStandardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDistanceKm?: number;
}

export const RiderFareStandardsModal: React.FC<RiderFareStandardsModalProps> = ({
  isOpen,
  onClose,
  initialDistanceKm = 4.5,
}) => {
  if (!isOpen) return null;

  // Simulator state
  const [zoneType, setZoneType] = useState<'bkk_metro' | 'provincial'>('bkk_metro');
  const [simDistance, setSimDistance] = useState<number>(initialDistanceKm);
  const [isPeak, setIsPeak] = useState<boolean>(true);
  const [isRain, setIsRain] = useState<boolean>(false);
  const [tip, setTip] = useState<number>(20);
  const [isBatch, setIsBatch] = useState<boolean>(false);

  // Calculate live simulation
  const result = calculateThaiRiderFare({
    distanceKm: simDistance,
    zoneType,
    isPeakHour: isPeak,
    isRaining: isRain,
    customerTip: tip,
    isBatchOrder: isBatch,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/20 flex items-center justify-center text-xl shadow-inner">
              🛵
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight leading-none">
                  มาตรฐานค่ารอบไรเดอร์ตามระยะทางจริง
                </h3>
                <span className="text-[10px] font-black bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full uppercase">
                  Thai Rider Standard
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-1">
                โครงสร้างค่ารอบมาตรฐานแพลตฟอร์มไทย คำนวณตามพิกัด GPS ระยะจริง
              </p>
            </div>
          </div>

          <button
            id="close-rider-fare-standards-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 text-xs">
          {/* Quick Summary Pill Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-2xl">
              <div className="text-[10px] text-emerald-700 font-bold uppercase">ค่ารอบตั้งต้น (Base)</div>
              <div className="text-base font-black text-emerald-900 mt-0.5">฿40.00</div>
              <div className="text-[9.5px] text-emerald-600 font-medium">0 - 3.0 กม. แรก</div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-2xl">
              <div className="text-[10px] text-blue-700 font-bold uppercase">กม. ถัดไป (Extra)</div>
              <div className="text-base font-black text-blue-900 mt-0.5">+฿9.00 / กม.</div>
              <div className="text-[9.5px] text-blue-600 font-medium">กม. ที่ 3.1 - 10.0</div>
            </div>

            <div className="bg-purple-50 border border-purple-200 p-2.5 rounded-2xl">
              <div className="text-[10px] text-purple-700 font-bold uppercase">ระยะไกล (&gt;10 กม.)</div>
              <div className="text-base font-black text-purple-900 mt-0.5">+฿13.00 / กม.</div>
              <div className="text-[9.5px] text-purple-600 font-medium">ชดเชยวินขากลับ</div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-2xl">
              <div className="text-[10px] text-amber-700 font-bold uppercase">ทิปจากลูกค้า (Tip)</div>
              <div className="text-base font-black text-amber-900 mt-0.5">100% เต็ม</div>
              <div className="text-[9.5px] text-amber-600 font-medium">ไม่หักค่าธรรมเนียม</div>
            </div>
          </div>

          {/* Interactive Live Fare Simulator */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span className="font-extrabold text-slate-900 text-sm">เครื่องมือจำลองคำนวณค่ารอบตามระยะทาง</span>
              </div>

              {/* Zone selector */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-[11px]">
                <button
                  onClick={() => setZoneType('bkk_metro')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    zoneType === 'bkk_metro' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  กทม. & ปริมณฑล
                </button>
                <button
                  onClick={() => setZoneType('provincial')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    zoneType === 'provincial' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ต่างจังหวัด
                </button>
              </div>
            </div>

            {/* Distance Slider */}
            <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span>ระยะทางขับจริงตาม GPS (ร้านถึงลูกค้า):</span>
                </label>
                <span className="text-base font-black text-emerald-600 font-mono">
                  {simDistance.toFixed(1)} กิโลเมตร
                </span>
              </div>

              <input
                type="range"
                min="0.5"
                max="18.0"
                step="0.1"
                value={simDistance}
                onChange={e => setSimDistance(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0.5 กม.</span>
                <span>3.0 กม. (จุดตัด Base)</span>
                <span>10.0 กม. (จุดตัดระยะไกล)</span>
                <span>18.0 กม.</span>
              </div>
            </div>

            {/* Conditions & Modifier Toggles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setIsPeak(!isPeak)}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  isPeak 
                    ? 'bg-amber-500/10 border-amber-300 text-amber-900 shadow-2xs' 
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${isPeak ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {isPeak ? 'เปิด' : 'ปิด'}
                  </span>
                </div>
                <div className="mt-1">
                  <div className="font-bold text-[11px]">ช่วงเร่งด่วน (Peak)</div>
                  <div className="text-[10px] text-amber-700">+{result.zone.defaultPeakBonus} ฿</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsRain(!isRain)}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  isRain 
                    ? 'bg-blue-500/10 border-blue-300 text-blue-900 shadow-2xs' 
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <CloudRain className="w-3.5 h-3.5 text-blue-600" />
                  <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${isRain ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {isRain ? 'เปิด' : 'ปิด'}
                  </span>
                </div>
                <div className="mt-1">
                  <div className="font-bold text-[11px]">ฝนตก (Rain Surge)</div>
                  <div className="text-[10px] text-blue-700">+{result.zone.defaultRainSurge} ฿</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsBatch(!isBatch)}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  isBatch 
                    ? 'bg-teal-500/10 border-teal-300 text-teal-900 shadow-2xs' 
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Bike className="w-3.5 h-3.5 text-teal-600" />
                  <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${isBatch ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {isBatch ? 'พ่วง' : 'เดี่ยว'}
                  </span>
                </div>
                <div className="mt-1">
                  <div className="font-bold text-[11px]">งานพ่วง (Batch Order)</div>
                  <div className="text-[10px] text-teal-700">จุดที่ 2 (ฐาน ฿25)</div>
                </div>
              </button>

              <div className="p-2 rounded-xl bg-white border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span className="text-[10px] text-slate-500 font-bold">ทิป</span>
                </div>
                <div className="flex gap-1 mt-1">
                  {[0, 20, 30].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setTip(v)}
                      className={`flex-1 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                        tip === v ? 'bg-rose-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      +{v}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Calculation Slip Result */}
            <div className="bg-white p-4 rounded-2xl border-2 border-emerald-500/30 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>สรุปยอดเงินค่ารอบที่ไรเดอร์จะได้รับสุทธิ</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  โอนเข้ากระเป๋าทันที
                </span>
              </div>

              {/* Formula String */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-700">
                <span className="text-slate-400 block text-[10px] font-sans font-medium mb-0.5">สูตรคำนวณรอบนี้:</span>
                {result.formulaString}
              </div>

              {/* Detailed Breakdown Rows */}
              <div className="space-y-1.5 pt-1 text-[11.5px]">
                <div className="flex justify-between text-slate-600">
                  <span>ค่ารอบพื้นฐาน ({result.isBatchOrder ? 'จุดส่งพ่วง' : `0 - ${result.baseDistanceKm} กม.`})</span>
                  <span className="font-bold text-slate-900">฿{result.baseFare.toFixed(2)}</span>
                </div>

                {result.extraDistanceKm > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>ระยะทางส่วนเกิน ({result.extraDistanceKm} กม. × ฿{result.zone.ratePerKmNormal}/กม.)</span>
                    <span className="font-bold text-blue-700">+฿{result.extraDistanceFare.toFixed(2)}</span>
                  </div>
                )}

                {result.longDistanceKm > 0 && (
                  <div className="flex justify-between text-purple-800 font-medium">
                    <span>ชดเชยระยะไกลพิเศษเกิน 10 กม. ({result.longDistanceKm} กม. × ฿{result.zone.ratePerKmLongDistance}/กม.)</span>
                    <span className="font-bold">+฿{result.longDistanceFare.toFixed(2)}</span>
                  </div>
                )}

                {result.peakBonus > 0 && (
                  <div className="flex justify-between text-amber-800 font-medium">
                    <span>โบนัสรอบเร่งด่วน (Peak Hour Incentive)</span>
                    <span className="font-bold">+฿{result.peakBonus.toFixed(2)}</span>
                  </div>
                )}

                {result.rainSurge > 0 && (
                  <div className="flex justify-between text-blue-800 font-medium">
                    <span>ค่าเสี่ยงภัยสภาพอากาศฝนตก (Rain Surge)</span>
                    <span className="font-bold">+฿{result.rainSurge.toFixed(2)}</span>
                  </div>
                )}

                {result.customerTip > 0 && (
                  <div className="flex justify-between text-emerald-800 font-bold">
                    <span>ทิปน้ำใจจากลูกค้า (ได้รับ 100% เต็ม ไม่หัก GP)</span>
                    <span>+฿{result.customerTip.toFixed(2)}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="text-sm font-black text-slate-900 block">รายได้สุทธิรอบนี้ (Net Payout)</span>
                    <span className="text-[10px] text-slate-500">ถอนเงินผ่านพร้อมเพย์ ฟรีค่าธรรมเนียม ฿0</span>
                  </div>
                  <span className="text-2xl font-black text-emerald-600">
                    ฿{result.netEarnings.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Platform Subsidy Explainer Box */}
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-[11px] text-emerald-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>กลไกการชดเชยค่ารอบ (Platform Subsidy Mechanism)</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[10.5px]">
                  ออเดอร์นี้ลูกค้าจ่ายค่าส่งตามโปรโมชันประมาณ <strong>฿{result.customerChargedFee}</strong> แต่ไรเดอร์ได้รับค่ารอบจริง <strong>฿{result.grossFare.toFixed(2)}</strong> บริษัทแพลตฟอร์มเป็นผู้ชดเชยส่วนต่าง <strong>+฿{result.platformSubsidy.toFixed(2)}</strong> จากส่วนแบ่ง GP ร้านค้า โดยไม่หักเงินจากไรเดอร์
                </p>
              </div>
            </div>
          </div>

          {/* Industry Benchmark Table */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>ตารางเปรียบเทียบมาตรฐานค่ารอบแพลตฟอร์มในประเทศไทย</span>
            </h4>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">แพลตฟอร์ม</th>
                    <th className="p-2.5">ระยะตั้งต้น</th>
                    <th className="p-2.5">ค่ารอบตั้งต้น</th>
                    <th className="p-2.5">กม. ถัดไป</th>
                    <th className="p-2.5">ฝนตก/พีค</th>
                    <th className="p-2.5">ทิป</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {THAI_PLATFORMS_BENCHMARK.map((b, idx) => (
                    <tr key={b.platform} className={idx === 0 ? 'bg-emerald-50/70 font-semibold' : 'hover:bg-slate-50'}>
                      <td className="p-2.5 font-bold text-slate-900 flex items-center gap-1">
                        {idx === 0 && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                        <span>{b.platform}</span>
                      </td>
                      <td className="p-2.5 text-slate-600">{b.baseKm}</td>
                      <td className="p-2.5 font-bold text-emerald-700">{b.baseFare}</td>
                      <td className="p-2.5 text-slate-600">{b.extraPerKm}</td>
                      <td className="p-2.5 text-amber-700">{b.rainSurge}</td>
                      <td className="p-2.5 text-slate-800">{b.tipKeep}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rules & Fair Work Safeguards */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>หลักประกันความเป็นธรรมและสิทธิประโยชน์ของไรเดอร์</span>
            </span>
            <ul className="space-y-1 text-slate-600 text-[11px] list-disc list-inside">
              <li><strong>วัดระยะทางจริงตามแนวถนน (Road Routing Distance)</strong>: ไม่ใช้ระยะทางเส้นตรงข้ามตึก คำนวณตามแผนที่การเดินรถจักรยานยนต์จริง</li>
              <li><strong>รับเงินเข้ากระเป๋าวอลเล็ตทันที (Instant Payout)</strong>: เมื่อกดยืนยันส่งมอบอาหารสำเร็จ ยอดเงินจะเข้าบัญชีไรเดอร์ทันที</li>
              <li><strong>ฟรีค่าธรรมเนียมโอนเงิน (Zero Transfer Fee)</strong>: ถอนเงินเข้าบัญชีธนาคารหรือพร้อมเพย์ได้ 24 ชั่วโมง โดยไม่มีการหักค่าธรรมเนียม</li>
              <li><strong>ประกันอุบัติเหตุคุ้มครองทุกเที่ยววิ่ง</strong>: คุ้มครองตั้งแต่รับงานจนถึงส่งมอบอาหารเสร็จสิ้น</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            อัปเดตตามมาตรฐานค่าตอบแทนแรงงานแพลตฟอร์มเดลิเวอรีไทย
          </span>

          <button
            id="close-rider-fare-standards-btn-footer"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
          >
            เข้าใจแล้ว & ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
