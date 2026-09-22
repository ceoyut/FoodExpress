import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Flame, 
  MapPin, 
  TrendingUp, 
  Sparkles, 
  Clock, 
  Zap, 
  Bike, 
  Store, 
  User, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  Navigation,
  Info,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface HeatmapZone {
  id: string;
  name: string;
  thaiName: string;
  demandLevel: 'critical_high' | 'high' | 'medium' | 'normal';
  surgeMultiplier: number;
  bonusBaht: number;
  pendingOrders: number;
  activeRiders: number;
  avgWaitMins: number;
  highlightFoods: string[];
  recommendedSpot: string;
  distanceFromCurrentKm: number;
}

export const RiderHeatmapTab: React.FC = () => {
  const { 
    activeRider, 
    triggerSimulatedIncomingOrder, 
    triggerToast,
    selectedZoneId,
    setSelectedZoneId
  } = useApp();

  const [zones, setZones] = useState<HeatmapZone[]>([
    {
      id: 'zone_thonglor',
      name: 'Thonglor - Ekkamai',
      thaiName: 'ทองหล่อ - เอกมัย',
      demandLevel: 'critical_high',
      surgeMultiplier: 1.4,
      bonusBaht: 25,
      pendingOrders: 42,
      activeRiders: 18,
      avgWaitMins: 4,
      highlightFoods: ['อาหารญี่ปุ่น', 'กาแฟสเปเชียลตี้', 'ปิ้งย่างเกาหลี'],
      recommendedSpot: 'หน้า The Commons ทองหล่อ หรือ มาร์เช่ ทองหล่อ',
      distanceFromCurrentKm: 1.8
    },
    {
      id: 'zone_siam',
      name: 'Siam - Silom - Sathorn',
      thaiName: 'สยาม - สีลม - สาทร',
      demandLevel: 'high',
      surgeMultiplier: 1.3,
      bonusBaht: 18,
      pendingOrders: 35,
      activeRiders: 24,
      avgWaitMins: 6,
      highlightFoods: ['ชานมไข่มุก', 'ฟาสต์ฟู้ด', 'อาหารคลีนออฟฟิศ'],
      recommendedSpot: 'ลานหน้าสยามพารากอน หรือ สี่แยกศาลาแดง',
      distanceFromCurrentKm: 3.5
    },
    {
      id: 'zone_ari',
      name: 'Ari - Phaholyothin',
      thaiName: 'อารีย์ - สะพานควาย',
      demandLevel: 'medium',
      surgeMultiplier: 1.2,
      bonusBaht: 12,
      pendingOrders: 21,
      activeRiders: 15,
      avgWaitMins: 7,
      highlightFoods: ['คาเฟ่เบเกอรี่', 'ก๋วยเตี๋ยวเรือ', 'สตรีทฟู้ด'],
      recommendedSpot: 'ปากซอยอารีย์ 1 หรือ โครงการ La Villa อารีย์',
      distanceFromCurrentKm: 5.2
    },
    {
      id: 'zone_ladprao',
      name: 'Ladprao - Chatuchak',
      thaiName: 'ลาดพร้าว - รัชโยธิน',
      demandLevel: 'medium',
      surgeMultiplier: 1.1,
      bonusBaht: 8,
      pendingOrders: 16,
      activeRiders: 19,
      avgWaitMins: 9,
      highlightFoods: ['ส้มตำ ยำแซ่บ', 'ข้าวมันไก่', 'ชาบูเดลิเวอรี'],
      recommendedSpot: 'เซ็นทรัลลาดพร้าว หรือ ยูเนี่ยนมอลล์',
      distanceFromCurrentKm: 7.1
    },
    {
      id: 'zone_bangna',
      name: 'Bangna - Sukhumvit 101',
      thaiName: 'บางนา - อุดมสุข',
      demandLevel: 'normal',
      surgeMultiplier: 1.0,
      bonusBaht: 0,
      pendingOrders: 9,
      activeRiders: 14,
      avgWaitMins: 11,
      highlightFoods: ['อาหารตามสั่ง', 'โรตีชาชัก', 'ข้าวกะเพรา'],
      recommendedSpot: 'ตลาดอุดมสุข หรือ ซอยลาซาล',
      distanceFromCurrentKm: 9.4
    }
  ]);

  const [selectedZone, setSelectedZone] = useState<HeatmapZone>(zones[0]);

  // Handle simulating a batch/stacked 2-drop order
  const handleSimulateBatchOrder = () => {
    triggerSimulatedIncomingOrder();
    triggerToast(
      'ยิงงานพ่วง 2 ออเดอร์ (Batch Order) สำเร็จ! 🛵📦',
      'งานพ่วงจากร้านกานดา ร้อยหม้อ + กะเพราถาดเจ้าเก่า ค่ารอบรวม ฿77 (+โบนัสพ่วง)',
      'success'
    );
  };

  const getDemandBadge = (level: HeatmapZone['demandLevel']) => {
    switch (level) {
      case 'critical_high':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-black text-[10px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            🔥 ดีมานด์หนาแน่นมาก (Hotspot)
          </span>
        );
      case 'high':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[10px] flex items-center gap-1">
            ⚡ ออเดอร์ชุกชุม (High Demand)
          </span>
        );
      case 'medium':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
            🟢 ออเดอร์ต่อเนื่อง
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[10px]">
            ⚪ ปกติ
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP STATS & BATCH ORDER SIMULATOR BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-900 rounded-3xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black tracking-wider uppercase border border-emerald-400/30">
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>AI Smart Dispatch & Demand Heatmap</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              แผนที่ฮอตสปอต & ระบบงานพ่วงรับเบิ้ล (Batch Orders)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              ตรวจเช็คโซนที่มีคำสั่งซื้อสูงเพื่อรับค่ารอบคูณพิเศษ (Surge Incentive สูงสุด 1.4x) หรือรับงานพ่วง 2 ออเดอร์ทางผ่านเดียวกัน เพิ่มรายได้ต่อชั่วโมงสูงสุด <strong>+35%</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              id="rider-simulate-batch-btn"
              onClick={handleSimulateBatchOrder}
              className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-slate-950" />
              <span>⚡ จำลองรับงานพ่วง (Batch 2 Drops)</span>
            </button>
          </div>
        </div>

        {/* Background glow */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
      </div>

      {/* 2. INTERACTIVE BANGKOK HEATMAP ZONES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Zone Cards list */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>โซนเดลิเวอรียอดนิยมแบบเรียลไทม์ (Live Bangkok Zones)</span>
            </h3>
            <span className="text-xs text-slate-500">
              อัปเดตทุก 30 วินาที
            </span>
          </div>

          <div className="space-y-2.5">
            {zones.map(z => {
              const isSelected = selectedZone.id === z.id;
              return (
                <div
                  key={z.id}
                  onClick={() => setSelectedZone(z)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 bg-white shadow-md ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900">
                          {z.thaiName}
                        </span>
                        <span className="text-xs text-slate-400">
                          ({z.name})
                        </span>
                        {getDemandBadge(z.demandLevel)}
                      </div>

                      <p className="text-xs text-slate-500">
                        📍 จุดแนะนำรอรับงาน: <strong className="text-slate-700">{z.recommendedSpot}</strong>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-black text-emerald-700">
                        x{z.surgeMultiplier}
                      </div>
                      <div className="text-[10px] font-bold text-amber-600">
                        {z.bonusBaht > 0 ? `+฿${z.bonusBaht} / รอบ` : 'ค่ารอบมาตรฐาน'}
                      </div>
                    </div>
                  </div>

                  {/* Zone quick KPI bar */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">ออเดอร์รอจัดส่ง</span>
                      <strong className="text-slate-800 font-extrabold">{z.pendingOrders} ออเดอร์</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">ไรเดอร์สแตนด์บาย</span>
                      <strong className="text-slate-800 font-extrabold">{z.activeRiders} คัน</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">เวลารอเฉลี่ย</span>
                      <strong className="text-emerald-700 font-extrabold">~{z.avgWaitMins} นาที/งาน</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Selected Zone Details & Navigation Helper */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-slate-400 block uppercase">
                  รายละเอียดโซนที่เลือก
                </span>
                <h4 className="text-base font-black text-slate-900">
                  {selectedZone.thaiName}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">ห่างจากตำแหน่งปัจจุบัน</span>
                <span className="text-xs font-extrabold text-blue-600">
                  ~{selectedZone.distanceFromCurrentKm} กม.
                </span>
              </div>
            </div>

            {/* Demand gauge visual */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-700">ดัชนีโอกาสรับงานเร็ว:</span>
                <span className="font-black text-emerald-700">
                  {selectedZone.demandLevel === 'critical_high' ? 'ดีเยี่ยม (98%)' : selectedZone.demandLevel === 'high' ? 'สูงมาก (85%)' : 'ปานกลาง (65%)'}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    selectedZone.demandLevel === 'critical_high'
                      ? 'w-[98%] bg-gradient-to-r from-amber-500 to-red-500'
                      : selectedZone.demandLevel === 'high'
                      ? 'w-[85%] bg-gradient-to-r from-emerald-500 to-amber-500'
                      : 'w-[65%] bg-emerald-500'
                  }`}
                />
              </div>
            </div>

            {/* Popular Foods in this zone */}
            <div className="text-xs space-y-1.5">
              <span className="font-bold text-slate-700 block">
                🍽️ อาหารที่ลูกค้ากำลังกดสั่งมากที่สุดในโซนนี้:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedZone.highlightFoods.map((f, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-100">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions for this zone */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedZoneId(selectedZone.id);
                  triggerToast(
                    'สลับโซนวิ่งงานสำเร็จ!',
                    `ย้ายพื้นที่รับงานหลักของคุณไปยัง: ${selectedZone.thaiName} เรียบร้อยแล้ว`,
                    'success'
                  );
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ปักหมุดโซนนี้เป็นพื้นที่วิ่งงานหลัก</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerToast(
                    'เปิดระบบนำทาง GPS 🗺️',
                    `กำลังนำทางไปยังจุดแนะนำ: ${selectedZone.recommendedSpot}`,
                    'info'
                  );
                }}
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5 text-slate-600" />
                <span>เปิดแผนที่นำทางไปยังจุดรอรับงาน</span>
              </button>
            </div>
          </div>

          {/* 3. BATCH ORDER EXPLAINER CARD */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200/80 p-4 text-xs space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-black">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>ทำไมการรับงานพ่วง (Batch Orders) ถึงคุ้มกว่า?</span>
            </div>

            <div className="space-y-2 text-amber-950">
              <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
                <span className="font-black text-amber-700">1.</span>
                <span><strong>ประหยัดเวลาเดินทาง:</strong> รับออเดอร์จากร้านค้าในห้างเดียวกัน หรือเส้นทางผ่านเดียวกัน</span>
              </div>
              <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
                <span className="font-black text-amber-700">2.</span>
                <span><strong>รายได้ก้าวกระโดด:</strong> ออเดอร์แรก ฿45 + ออเดอร์พ่วง ฿32 = <strong>฿77 ในเที่ยวเดียว</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
