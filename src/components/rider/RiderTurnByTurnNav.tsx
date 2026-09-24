import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  Volume2, 
  VolumeX, 
  Compass, 
  Zap, 
  AlertTriangle, 
  CornerUpRight, 
  CornerUpLeft, 
  ArrowUp, 
  MapPin, 
  Store, 
  User, 
  CheckCircle2,
  Clock,
  RotateCcw
} from 'lucide-react';
import { DispatchQueueOrder } from '../../types';

interface RiderTurnByTurnNavProps {
  trip: DispatchQueueOrder;
  stepIndex: number; // 0: to restaurant, 1: to customer (or batch steps)
  onFastForwardArrived: () => void;
  triggerToast?: (title: string, desc: string, type?: 'info' | 'success' | 'warning' | 'error' | 'reward') => void;
  isBatchTrip?: boolean;
}

export const RiderTurnByTurnNav: React.FC<RiderTurnByTurnNavProps> = ({
  trip,
  stepIndex,
  onFastForwardArrived,
  triggerToast,
  isBatchTrip = false
}) => {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);
  const [progressPercent, setProgressPercent] = useState<number>(25);
  const [currentSpeed, setCurrentSpeed] = useState<number>(38);
  const [routeStepIndex, setRouteStepIndex] = useState<number>(0);

  // Turn-by-turn guidance steps
  const destinationTitle = stepIndex === 0 
    ? trip.restaurantName 
    : isBatchTrip && trip.batchSecondaryOrder 
      ? `${trip.customerName} & ${trip.batchSecondaryOrder.customerName}`
      : trip.customerName;

  const destinationAddress = stepIndex === 0 ? trip.restaurantAddress : trip.customerAddress;

  const guidanceSteps = stepIndex === 0 ? [
    {
      distanceMeters: 180,
      instruction: `ตรงไปตามถนนสุขุมวิท มุ่งหน้าซอยทองหล่อ`,
      maneuver: 'straight',
      subtext: 'การจราจรคล่องตัว ความเร็วแนะนำ 40 กม./ชม.',
      icon: ArrowUp
    },
    {
      distanceMeters: 60,
      instruction: `เลี้ยวขวาเข้า ซอยทองหล่อ (สุขุมวิท 55)`,
      maneuver: 'right',
      subtext: 'ระวังรถจักรยานยนต์ตัดเลนขวา',
      icon: CornerUpRight
    },
    {
      distanceMeters: 20,
      instruction: `ถึงจุดหมาย: ${trip.restaurantName}`,
      maneuver: 'arrived',
      subtext: 'จอดรถจักรยานยนต์บริเวณจุดพักไรเดอร์หน้าร้าน',
      icon: MapPin
    }
  ] : [
    {
      distanceMeters: 350,
      instruction: `ออกจากร้านเลี้ยวซ้าย มุ่งหน้าถนนสุขุมวิท`,
      maneuver: 'left',
      subtext: 'ระวังทางออกจุดกลับรถ',
      icon: CornerUpLeft
    },
    {
      distanceMeters: 120,
      instruction: `ชิดขวา เตรียมเลี้ยวเข้า อาคารปลายทาง (${trip.customerName})`,
      maneuver: 'right',
      subtext: 'แจ้ง รปภ. ว่ามาส่ง FoodExpress',
      icon: CornerUpRight
    },
    {
      distanceMeters: 15,
      instruction: `ถึงจุดหมายส่งอาหาร: ${trip.customerAddress}`,
      maneuver: 'arrived',
      subtext: 'กดถ่ายภาพหลักฐานการส่งมอบ (POD)',
      icon: CheckCircle2
    }
  ];

  const currentGuidance = guidanceSteps[routeStepIndex] || guidanceSteps[0];

  // Auto-progress simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgressPercent(prev => {
        if (prev >= 95) return 95;
        return prev + 2;
      });

      // Fluctuate speed realistically between 32 and 45 km/h
      setCurrentSpeed(Math.floor(34 + Math.random() * 9));
    }, 1500);

    return () => clearInterval(interval);
  }, [stepIndex]);

  // Adjust route instruction as progress moves
  useEffect(() => {
    if (progressPercent < 45) {
      setRouteStepIndex(0);
    } else if (progressPercent < 85) {
      setRouteStepIndex(1);
    } else {
      setRouteStepIndex(2);
    }
  }, [progressPercent]);

  // Speech synthesizer voice prompt
  const speakVoiceInstruction = () => {
    if (!isVoiceEnabled) return;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const text = `อีก ${currentGuidance.distanceMeters} เมตร ${currentGuidance.instruction}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'th-TH';
        utterance.rate = 1.05;
        window.speechSynthesis.speak(utterance);
        triggerToast?.('ระบบเสียงนำทาง 🔊', text, 'info');
      } else {
        triggerToast?.('ระบบเสียงนำทาง 🔊', `อีก ${currentGuidance.distanceMeters} ม. ${currentGuidance.instruction}`, 'info');
      }
    } catch {
      triggerToast?.('ระบบเสียงนำทาง 🔊', `อีก ${currentGuidance.distanceMeters} ม. ${currentGuidance.instruction}`, 'info');
    }
  };

  const IconComponent = currentGuidance.icon;

  return (
    <div className="bg-slate-950 text-white rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-xl space-y-4 relative overflow-hidden">
      {/* Background Subtle Map Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Top Bar: Nav Status & Voice Controls */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-black tracking-wide text-emerald-400 uppercase flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
            <span>GPS LIVE NAVIGATION • TURN-BY-TURN</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsVoiceEnabled(!isVoiceEnabled);
              triggerToast?.(
                isVoiceEnabled ? 'ปิดเสียงนำทาง 🔇' : 'เปิดเสียงนำทางภาษาไทย 🔊',
                isVoiceEnabled ? 'ปิดเสียงเตือนทิศทางแล้ว' : 'ระบบจะอ่านทิศทางเลี้ยวอัตโนมัติ',
                'info'
              );
            }}
            className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              isVoiceEnabled 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="เปิด/ปิดเสียงนำทางภาษาไทย"
          >
            {isVoiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="text-[10px] hidden sm:inline">{isVoiceEnabled ? 'เสียงนำทางเปิดอยู่' : 'ปิดเสียง'}</span>
          </button>

          <button
            type="button"
            onClick={speakVoiceInstruction}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold cursor-pointer transition-colors"
            title="กดทดสอบฟังเสียงนำทาง"
          >
            <span className="text-[10px]">🗣️ ฟังซ้ำ</span>
          </button>
        </div>
      </div>

      {/* Primary Turn Banner */}
      <div className="bg-emerald-600/90 backdrop-blur-md rounded-2xl p-4 border border-emerald-400/40 flex items-center justify-between gap-4 relative z-10 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center shrink-0 shadow-inner">
            <IconComponent className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="text-xl font-black text-white tracking-tight flex items-baseline gap-1.5">
              <span>อีก {currentGuidance.distanceMeters} ม.</span>
            </div>
            <div className="text-sm font-bold text-emerald-50 leading-snug">
              {currentGuidance.instruction}
            </div>
            <div className="text-[11px] text-emerald-200 mt-0.5">
              {currentGuidance.subtext}
            </div>
          </div>
        </div>

        <div className="text-right shrink-0 border-l border-emerald-400/30 pl-3">
          <div className="text-2xl font-black text-white font-mono leading-none">
            {currentSpeed}
          </div>
          <div className="text-[10px] font-bold text-emerald-200 uppercase">กม./ชม.</div>
        </div>
      </div>

      {/* Simulated Interactive Route Canvas & Progress */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-3.5 space-y-3 relative z-10">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            {stepIndex === 0 ? (
              <Store className="w-4 h-4 text-emerald-400" />
            ) : (
              <User className="w-4 h-4 text-blue-400" />
            )}
            <span className="font-bold truncate max-w-[200px] sm:max-w-[320px]">
              {destinationTitle}
            </span>
          </div>
          <span className="text-slate-400 font-mono text-[11px]">
            {destinationAddress}
          </span>
        </div>

        {/* Visual Route Path Line */}
        <div className="relative pt-3 pb-1">
          {/* Track */}
          <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden relative">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Motorcycle Animated Indicator */}
          <div 
            className="absolute top-0 -translate-y-1/2 -ml-3 transition-all duration-700 ease-out"
            style={{ left: `${progressPercent}%` }}
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-sm shadow-md animate-bounce">
              🛵
            </div>
          </div>

          {/* Destination Icon at End */}
          <div className="absolute right-0 top-0 -translate-y-1/2">
            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-[10px]">
              🏁
            </div>
          </div>
        </div>

        {/* ETA & Distance Telemetry */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80 text-center">
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] text-slate-400">ระยะทางเหลือ</div>
            <div className="text-xs font-black text-emerald-400 font-mono">
              {((trip.distanceKm * (100 - progressPercent)) / 100).toFixed(1)} กม.
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] text-slate-400">เวลาถึงโดยประมาณ (ETA)</div>
            <div className="text-xs font-black text-amber-400 font-mono flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>{Math.max(1, Math.ceil(((trip.distanceKm * (100 - progressPercent)) / 100) * 2.2))} นาที</span>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] text-slate-400">สภาพการจราจร</div>
            <div className="text-xs font-bold text-emerald-300">
              🟢 ไหลลื่นปกติ
            </div>
          </div>
        </div>

        {/* Fast-forward simulator button */}
        <div className="flex items-center justify-between pt-1 gap-2">
          <span className="text-[10px] text-slate-400">
            💡 ระบบจะคำนวณเส้นทางหลีกเลี่ยงรถติดอัตโนมัติ (AI Smart Route)
          </span>

          <button
            type="button"
            onClick={() => {
              setProgressPercent(100);
              onFastForwardArrived();
              triggerToast?.('ถึงที่หมายทันที! 🏁', 'จำลองการขับขี่เสร็จสิ้น ถึงจุดหมายเรียบร้อยแล้ว', 'success');
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-[11px] font-black cursor-pointer transition-all flex items-center gap-1.5 shadow-sm shrink-0"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>จำลองถึงที่หมายทันที ⚡</span>
          </button>
        </div>
      </div>
    </div>
  );
};
