import React, { useState, useEffect, useMemo } from 'react';
import { Timer, Clock, Utensils, CheckCircle2, Flame, Sparkles, ChefHat } from 'lucide-react';
import { Order } from '../types';
import { RESTAURANTS_DATA } from '../data/mockData';

interface OrderPrepCountdownTimerProps {
  order: Order;
  averagePrepTimeMinutes?: number;
  compact?: boolean;
  className?: string;
}

interface PrepStage {
  label: string;
  sublabel: string;
  minPct: number;
  icon: React.ComponentType<{ className?: string }>;
}

const PREP_STAGES: PrepStage[] = [
  {
    label: 'เชฟรับออเดอร์ & จัดเตรียมวัตถุดิบ',
    sublabel: 'คัดสรรวัตถุดิบสดใหม่พร้อมลงเตา',
    minPct: 0,
    icon: ChefHat,
  },
  {
    label: 'กำลังปรุงอาหารบนเตาร้อน ๆ',
    sublabel: 'คั่วไฟแรง ปรุงสดใหม่ทุกจาน',
    minPct: 25,
    icon: Flame,
  },
  {
    label: 'อาหารสุกแล้ว กำลังแพ็คบรรจุกล่อง',
    sublabel: 'ซีลภาชนะเก็บความร้อน รอส่งมอบไรเดอร์',
    minPct: 70,
    icon: Utensils,
  },
  {
    label: 'อาหารปรุงเสร็จสมบูรณ์พร้อมแล้ว!',
    sublabel: 'พร้อมส่งมอบหรือรับประทานทันที',
    minPct: 100,
    icon: CheckCircle2,
  },
];

export const OrderPrepCountdownTimer: React.FC<OrderPrepCountdownTimerProps> = ({
  order,
  averagePrepTimeMinutes: propPrepMinutes,
  compact = false,
  className = '',
}) => {
  // 1. Resolve restaurant and average preparation time benchmark
  const restaurant = useMemo(() => {
    return RESTAURANTS_DATA.find(r => r.id === order.restaurantId);
  }, [order.restaurantId]);

  const prepMinutes = useMemo(() => {
    if (propPrepMinutes && propPrepMinutes > 0) return propPrepMinutes;
    if (restaurant?.averagePrepTimeMinutes && restaurant.averagePrepTimeMinutes > 0) {
      return restaurant.averagePrepTimeMinutes;
    }
    // Smart fallback based on delivery duration or restaurant type
    return Math.max(8, Math.round((order.estimatedDeliveryMinutes || 20) * 0.6));
  }, [propPrepMinutes, restaurant, order.estimatedDeliveryMinutes]);

  const totalPrepSeconds = prepMinutes * 60;

  // 2. Parse order creation time to determine start and target completion time
  const { startTime, targetReadyTime, targetTimeString } = useMemo(() => {
    let base = new Date();
    const raw = (order.createdAt || '').trim();
    const parsed = Date.parse(raw);

    if (!isNaN(parsed) && raw.includes('-')) {
      base = new Date(parsed);
    } else {
      const match = raw.match(/(\d{1,2}):(\d{2})/);
      if (match) {
        const hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        base = new Date();
        if (raw.includes('เมื่อวาน')) {
          base.setDate(base.getDate() - 1);
        } else if (raw.includes('วันที่แล้ว')) {
          const daysMatch = raw.match(/(\d+)\s*วันที่แล้ว/);
          const days = daysMatch ? parseInt(daysMatch[1], 10) : 3;
          base.setDate(base.getDate() - days);
        }
        base.setHours(hours, minutes, 0, 0);
      }
    }

    const readyDate = new Date(base.getTime() + prepMinutes * 60 * 1000);
    const targetTimeString = readyDate.toLocaleTimeString('th-TH', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }) + ' น.';

    return {
      startTime: base,
      targetReadyTime: readyDate,
      targetTimeString,
    };
  }, [order.createdAt, prepMinutes]);

  // 3. Real-time seconds ticking countdown
  const isOrderActive = order.status !== 'delivered' && order.status !== 'cancelled';
  const isPastDelivered = order.status === 'delivered';
  const isCancelled = order.status === 'cancelled';

  const calculateRemainingSeconds = (): number => {
    if (isPastDelivered) return 0;
    if (isCancelled) return 0;

    // For active tracking simulation, check status
    if (order.status === 'rider_assigned' || order.status === 'delivering') {
      return 0; // Food is already cooked and handed over
    }

    const now = new Date();
    const diffMs = targetReadyTime.getTime() - now.getTime();
    if (diffMs > 0) {
      return Math.round(diffMs / 1000);
    }

    // If order was placed earlier in session or timestamp passed but status is still confirmed/preparing
    if (order.status === 'confirmed' || order.status === 'preparing') {
      // Provide active realistic countdown based on riderProgressPct
      const progressFraction = Math.max(0.1, (order.riderProgressPct || 20) / 45);
      const simulatedRemaining = Math.max(15, Math.round(totalPrepSeconds * (1 - Math.min(0.95, progressFraction))));
      return simulatedRemaining;
    }

    return 0;
  };

  const [remainingSeconds, setRemainingSeconds] = useState<number>(calculateRemainingSeconds);

  useEffect(() => {
    if (!isOrderActive) return;

    // Initial sync
    setRemainingSeconds(calculateRemainingSeconds());

    const interval = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOrderActive, targetReadyTime, order.status, order.riderProgressPct]);

  // Formatting minutes & seconds: MM:SS
  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const elapsedSeconds = Math.max(0, totalPrepSeconds - remainingSeconds);
  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedSeconds / totalPrepSeconds) * 100)));

  // Current prep stage
  const currentStage = useMemo(() => {
    if (remainingSeconds <= 0 || order.status === 'rider_assigned' || order.status === 'delivering' || isPastDelivered) {
      return PREP_STAGES[3];
    }
    if (progressPercent >= 70) return PREP_STAGES[2];
    if (progressPercent >= 25) return PREP_STAGES[1];
    return PREP_STAGES[0];
  }, [remainingSeconds, progressPercent, order.status, isPastDelivered]);

  const StageIcon = currentStage.icon;

  // Render for completed or cancelled orders
  if (isPastDelivered) {
    return (
      <div 
        id={`order-prep-completed-${order.id}`}
        className={`p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 text-[11px] ${className}`}
      >
        <div className="flex items-center gap-2 text-slate-600">
          <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-semibold text-slate-800">ปรุงเสร็จสมบูรณ์</span>
            <span className="text-slate-400 block text-[10px]">
              เวลาปรุงมาตรฐานร้านนี้: ~{prepMinutes} นาที
            </span>
          </div>
        </div>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          ตรงตามเวลามาตรฐาน ✨
        </span>
      </div>
    );
  }

  if (isCancelled) {
    return null;
  }

  // Active Order Live Countdown Display
  const isReady = remainingSeconds <= 0 || order.status === 'rider_assigned' || order.status === 'delivering';

  return (
    <div
      id={`order-prep-timer-${order.id}`}
      className={`rounded-2xl border transition-all ${
        isReady
          ? 'bg-emerald-50/80 border-emerald-300 shadow-2xs'
          : 'bg-gradient-to-br from-amber-500/10 via-amber-50/70 to-orange-50/80 border-amber-300/80 shadow-xs ring-1 ring-amber-400/30'
      } p-3 sm:p-3.5 ${className}`}
    >
      {/* Header: Title & Restaurant Benchmark Badge */}
      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-amber-200/60">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
            isReady 
              ? 'bg-emerald-600 text-white shadow-xs' 
              : 'bg-amber-500 text-white shadow-xs animate-pulse'
          }`}>
            {isReady ? <CheckCircle2 className="w-4 h-4" /> : <Timer className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span>{isReady ? 'อาหารปรุงเสร็จแล้ว!' : 'เวลาเตรียมอาหารโดยประมาณ'}</span>
              {!isReady && (
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-amber-500 text-white animate-pulse">
                  นับถอยหลังสด
                </span>
              )}
            </h4>
            <p className="text-[10px] text-slate-500">
              คำนวณจากเวลาปรุงเฉลี่ยร้านนี้ ({prepMinutes} นาที)
            </p>
          </div>
        </div>

        {/* Live Countdown Digits Display */}
        <div className="text-right shrink-0">
          {isReady ? (
            <div className="flex flex-col items-end">
              <span className="text-xs sm:text-sm font-black text-emerald-700 bg-white/90 px-2.5 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>พร้อมแล้ว (00:00)</span>
              </span>
              <span className="text-[9px] text-emerald-600 font-medium mt-0.5">รอส่งมอบไรเดอร์</span>
            </div>
          ) : (
            <div className="flex flex-col items-end">
              <div 
                id={`countdown-digits-${order.id}`}
                className="font-mono text-base sm:text-lg font-black tracking-tight text-amber-950 bg-white px-2.5 py-0.5 rounded-xl border border-amber-300 shadow-2xs flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" style={{ animationDuration: '8s' }} />
                <span>{formatTimeRemaining(remainingSeconds)}</span>
              </div>
              <span className="text-[9px] text-slate-500 font-medium mt-0.5">
                เสร็จประมาณ ~{targetTimeString}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar & Stage Indicator */}
      <div className="space-y-2">
        {/* Animated Progress Bar */}
        <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden relative">
          <div
            className={`h-full transition-all duration-1000 ease-out rounded-full ${
              isReady
                ? 'bg-emerald-500'
                : 'bg-gradient-to-r from-amber-400 to-orange-500'
            }`}
            style={{ width: `${isReady ? 100 : progressPercent}%` }}
          />
        </div>

        {/* Stage Status Pill */}
        <div className="flex items-center justify-between text-[11px] pt-0.5">
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold min-w-0">
            <StageIcon className={`w-3.5 h-3.5 shrink-0 ${isReady ? 'text-emerald-600' : 'text-amber-600'}`} />
            <span className="truncate">{currentStage.label}</span>
          </div>

          <div className="text-[10px] font-bold text-slate-500 shrink-0 ml-2">
            {isReady ? (
              <span className="text-emerald-700 font-extrabold">100% เสร็จสิ้น</span>
            ) : (
              <span>ความคืบหน้า {progressPercent}%</span>
            )}
          </div>
        </div>

        {!compact && (
          <p className="text-[10px] text-slate-500 italic">
            💡 {currentStage.sublabel}
          </p>
        )}
      </div>
    </div>
  );
};
