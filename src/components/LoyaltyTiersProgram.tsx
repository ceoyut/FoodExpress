import React, { useState } from 'react';
import { 
  Crown, 
  Sparkles, 
  Medal, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  ArrowRight, 
  ShoppingBag, 
  TrendingUp, 
  Gift, 
  Percent, 
  Truck, 
  Headphones, 
  Zap,
  Info,
  RotateCcw,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';

export interface TierDefinition {
  id: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  nameEn: string;
  nameTh: string;
  minOrders: number;
  targetOrders: number;
  tagline: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  cardBorder: string;
  cardBg: string;
  barColor: string;
  perks: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }[];
}

export const TIER_DEFINITIONS: TierDefinition[] = [
  {
    id: 'Bronze',
    nameEn: 'Bronze Tier',
    nameTh: 'สมาชิกระดับ บรอนซ์',
    minOrders: 0,
    targetOrders: 2,
    tagline: 'เริ่มต้นการเดินทางแห่งความอร่อย',
    badgeBg: 'bg-amber-100/90 text-amber-900',
    badgeBorder: 'border-amber-300',
    badgeText: 'text-amber-800',
    cardBorder: 'border-amber-200/80 hover:border-amber-400',
    cardBg: 'bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30',
    barColor: 'bg-gradient-to-r from-amber-600 to-amber-700',
    perks: [
      {
        icon: <Zap className="w-3.5 h-3.5 text-amber-600" />,
        title: 'สะสมแต้มปกติ 1.0x',
        description: 'ทุก ฿10 รับ 1 แต้มสะสมแลกรับคูปอง',
      },
      {
        icon: <Truck className="w-3.5 h-3.5 text-amber-600" />,
        title: 'ฟรีค่าจัดส่ง 1 ครั้ง/เดือน',
        description: 'รับคูปองจัดส่งฟรีในกระเป๋าคูปองทุกต้นเดือน',
      },
      {
        icon: <Gift className="w-3.5 h-3.5 text-amber-600" />,
        title: 'โค้ดต้อนรับ ฿30',
        description: 'ใช้ลดออเดอร์แรกกับร้านค้าพันธมิตร',
      },
    ],
  },
  {
    id: 'Silver',
    nameEn: 'Silver Tier',
    nameTh: 'สมาชิกระดับ ซิลเวอร์',
    minOrders: 3,
    targetOrders: 7,
    tagline: 'ฟู้ดดี้ตัวจริง สั่งบ่อยรับความคุ้มค่าเพิ่ม',
    badgeBg: 'bg-slate-200 text-slate-800',
    badgeBorder: 'border-slate-300',
    badgeText: 'text-slate-700',
    cardBorder: 'border-slate-300 hover:border-slate-400',
    cardBg: 'bg-gradient-to-br from-slate-50 via-white to-slate-100/50',
    barColor: 'bg-gradient-to-r from-slate-400 to-slate-600',
    perks: [
      {
        icon: <Zap className="w-3.5 h-3.5 text-slate-600" />,
        title: 'รับแต้มโบนัส 1.25x',
        description: 'รับแต้มเพิ่ม 25% ในทุกยอดสั่งซื้อ',
      },
      {
        icon: <Truck className="w-3.5 h-3.5 text-slate-600" />,
        title: 'ฟรีค่าจัดส่ง 3 ครั้ง/เดือน',
        description: 'คูปองส่งฟรีเติมเข้ากระเป๋าอัตโนมัติ',
      },
      {
        icon: <Percent className="w-3.5 h-3.5 text-slate-600" />,
        title: 'ส่วนลดพิเศษ 5%',
        description: 'รับส่วนลดพิเศษเมื่อสั่งอาหารครบ ฿200',
      },
      {
        icon: <Gift className="w-3.5 h-3.5 text-slate-600" />,
        title: 'ของขวัญวันเกิด ฿50',
        description: 'คูปองฉลองวันเกิดมอบให้ในเดือนเกิด',
      },
    ],
  },
  {
    id: 'Gold',
    nameEn: 'Gold Tier',
    nameTh: 'สมาชิกระดับ โกลด์',
    minOrders: 8,
    targetOrders: 14,
    tagline: 'ระดับยอดนิยม สิทธิพิเศษเหนือระดับทุกวัน',
    badgeBg: 'bg-amber-400/20 text-amber-800',
    badgeBorder: 'border-amber-400',
    badgeText: 'text-amber-900',
    cardBorder: 'border-amber-300 hover:border-amber-500 shadow-amber-500/5',
    cardBg: 'bg-gradient-to-br from-amber-50/80 via-white to-amber-100/30',
    barColor: 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600',
    perks: [
      {
        icon: <Zap className="w-3.5 h-3.5 text-amber-600" />,
        title: 'รับแต้มโบนัส 1.5x สปีดไว',
        description: 'รับแต้มเพิ่ม 50% ทุกการสั่งซื้อไม่มีเพดาน',
      },
      {
        icon: <Truck className="w-3.5 h-3.5 text-amber-600" />,
        title: 'ฟรีค่าส่งไม่อั้น (ขั้นต่ำ ฿150)',
        description: 'ไม่ต้องใช้คูปอง ลดค่าจัดส่งอัตโนมัติทันที',
      },
      {
        icon: <Percent className="w-3.5 h-3.5 text-amber-600" />,
        title: 'ส่วนลด 10% ร้านยอดฮิต',
        description: 'รับส่วนลดพิเศษประจำสัปดาห์กับร้านดัง',
      },
      {
        icon: <TrendingUp className="w-3.5 h-3.5 text-amber-600" />,
        title: 'Priority Dispatch จัดส่งด่วน',
        description: 'ระบบจับคู่ไรเดอร์และคิวจัดเตรียมอาหารเร็วกว่าปกติ',
      },
      {
        icon: <Gift className="w-3.5 h-3.5 text-amber-600" />,
        title: 'คูปองวันเกิดพิเศษ ฿100',
        description: 'ฉลองเดือนเกิดด้วยคูปองลดพิเศษ ฿100',
      },
    ],
  },
  {
    id: 'Platinum',
    nameEn: 'Platinum Tier',
    nameTh: 'สมาชิกระดับ แพลทินัม',
    minOrders: 15,
    targetOrders: 15,
    tagline: 'เอกสิทธิ์สูงสุดเพื่อประสบการณ์อาหารที่ดีที่สุด',
    badgeBg: 'bg-indigo-100 text-indigo-800',
    badgeBorder: 'border-indigo-300',
    badgeText: 'text-indigo-900',
    cardBorder: 'border-indigo-200/90 hover:border-indigo-400 shadow-indigo-500/5',
    cardBg: 'bg-gradient-to-br from-indigo-50/40 via-white to-teal-50/40',
    barColor: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-500',
    perks: [
      {
        icon: <Zap className="w-3.5 h-3.5 text-indigo-600" />,
        title: 'รับแต้มซูเปอร์โบนัส 2.0x (คูณสอง)',
        description: 'คะแนนสะสม 2 เท่า ทุก ฿10 ได้ 2 แต้ม',
      },
      {
        icon: <Truck className="w-3.5 h-3.5 text-indigo-600" />,
        title: 'ฟรีค่าส่งทุกออเดอร์ ไม่มีขั้นต่ำ',
        description: 'จัดส่งฟรีไม่จำกัดจำนวนครั้งตลอดชีพสมาชิก',
      },
      {
        icon: <Percent className="w-3.5 h-3.5 text-indigo-600" />,
        title: 'ส่วนลด 15% ทุกร้านพาร์ทเนอร์',
        description: 'รับส่วนลดสูงสุดเมื่อสั่งอาหารจากร้านแนะนำ',
      },
      {
        icon: <Sparkles className="w-3.5 h-3.5 text-indigo-600" />,
        title: 'สิทธิ์สั่ง Secret Menu ก่อนใคร',
        description: 'เข้าถึงเมนูพิเศษเฉพาะลูกค้า VIP เท่านั้น',
      },
      {
        icon: <Headphones className="w-3.5 h-3.5 text-indigo-600" />,
        title: 'VIP Concierge Support 24 ชม.',
        description: 'เจ้าหน้าที่ซัพพอร์ตระดับพรีเมียม ดูแลสายตรง',
      },
    ],
  },
];

export const calculateTierFromOrderCount = (ordersCount: number): 'Bronze' | 'Silver' | 'Gold' | 'Platinum' => {
  if (ordersCount >= 15) return 'Platinum';
  if (ordersCount >= 8) return 'Gold';
  if (ordersCount >= 3) return 'Silver';
  return 'Bronze';
};

interface LoyaltyTiersProgramProps {
  onStartOrder?: () => void;
}

export const LoyaltyTiersProgram: React.FC<LoyaltyTiersProgramProps> = ({ onStartOrder }) => {
  const { orders } = useApp();

  // Filter out cancelled orders so only placed/delivered orders count towards tier qualification
  const validOrders = orders.filter(o => o.status !== 'cancelled');
  const [simulatedOrderDelta, setSimulatedOrderDelta] = useState<number>(0);
  const [showSimulator, setShowSimulator] = useState<boolean>(false);

  // Total order count including any interactive test adjustments
  const totalOrdersPlaced = Math.max(0, validOrders.length + simulatedOrderDelta);
  const currentTierId = calculateTierFromOrderCount(totalOrdersPlaced);

  // Next tier threshold calculations
  const getNextTierDetails = () => {
    if (totalOrdersPlaced < 3) {
      return { nextTier: 'Silver', remainingOrders: 3 - totalOrdersPlaced, target: 3 };
    }
    if (totalOrdersPlaced < 8) {
      return { nextTier: 'Gold', remainingOrders: 8 - totalOrdersPlaced, target: 8 };
    }
    if (totalOrdersPlaced < 15) {
      return { nextTier: 'Platinum', remainingOrders: 15 - totalOrdersPlaced, target: 15 };
    }
    return { nextTier: null, remainingOrders: 0, target: 15 };
  };

  const nextTierInfo = getNextTierDetails();

  const getTierIcon = (id: string, className = "w-5 h-5") => {
    switch (id) {
      case 'Bronze':
        return <ShieldCheck className={`${className} text-amber-700`} />;
      case 'Silver':
        return <Medal className={`${className} text-slate-600`} />;
      case 'Gold':
        return <Crown className={`${className} text-amber-500`} />;
      case 'Platinum':
        return <Sparkles className={`${className} text-indigo-600`} />;
      default:
        return <Crown className={className} />;
    }
  };

  return (
    <div id="loyalty-program-container" className="space-y-5 text-xs text-slate-800">
      
      {/* Overview Card with Dynamic Order Milestone */}
      <div className="bg-slate-900 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
                {getTierIcon(currentTierId, "w-6 h-6 text-amber-400")}
              </div>
              <div>
                <span className="text-[10px] text-amber-300 font-extrabold uppercase tracking-widest block">
                  FoodExpress Loyalty Rewards
                </span>
                <h3 className="text-base font-extrabold flex items-center gap-1.5">
                  <span>ระดับปัจจุบัน:</span>
                  <span className="text-amber-300 underline decoration-amber-400/50 decoration-2 underline-offset-2">
                    {currentTierId} Tier
                  </span>
                </h3>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-300 block">ออเดอร์สะสม</span>
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-2xl font-black text-white">{totalOrdersPlaced}</span>
                <span className="text-xs text-slate-300">ออเดอร์</span>
              </div>
            </div>
          </div>

          {/* Next Tier Countdown & Status */}
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-medium">
                <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
                {nextTierInfo.nextTier ? (
                  <span>
                    สั่งอาหารอีกเพียง <strong className="text-amber-300 font-bold">{nextTierInfo.remainingOrders}</strong> ออเดอร์ เพื่อเลื่อนเป็น <strong className="text-white font-bold">{nextTierInfo.nextTier}</strong>
                  </span>
                ) : (
                  <span className="text-emerald-300 font-bold">
                    ยินดีด้วย! คุณอยู่ในระดับสมาชิกระดับสูงสุด (Platinum) แล้ว 🎉
                  </span>
                )}
              </div>
              <span className="text-[11px] font-bold text-slate-300">
                {totalOrdersPlaced} / {nextTierInfo.target}
              </span>
            </div>

            {/* Micro Progress Bar towards next tier */}
            <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ 
                  width: `${Math.min(100, Math.round((totalOrdersPlaced / nextTierInfo.target) * 100))}%` 
                }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 rounded-full"
              />
            </div>
          </div>

          {/* Connected Stepper Timeline */}
          <div className="pt-2 border-t border-white/15">
            <div className="grid grid-cols-4 gap-1 sm:gap-2 text-center text-[10px]">
              {TIER_DEFINITIONS.map((tierDef, index) => {
                const isReached = totalOrdersPlaced >= tierDef.minOrders;
                const isCurrent = currentTierId === tierDef.id;

                return (
                  <div key={tierDef.id} className="flex flex-col items-center space-y-1">
                    <div 
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        isCurrent 
                          ? 'bg-amber-400 text-slate-900 ring-4 ring-amber-400/30 scale-110 font-bold' 
                          : isReached 
                            ? 'bg-emerald-500 text-white font-bold' 
                            : 'bg-white/15 text-slate-400 border border-white/20'
                      }`}
                    >
                      {isReached && !isCurrent ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <span className="text-[10px] font-bold">{index + 1}</span>
                      )}
                    </div>
                    <span className={`font-bold leading-tight ${isCurrent ? 'text-amber-300' : isReached ? 'text-white' : 'text-slate-400'}`}>
                      {tierDef.id}
                    </span>
                    <span className="text-[9px] text-slate-300">
                      {tierDef.minOrders === 0 ? '1-2 ออเดอร์' : `${tierDef.minOrders}+ ออเดอร์`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Decorative background glows */}
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-44 h-44 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Simulator / Test Trigger for Reviewers & Users */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>ทดสอบระดับสมาชิกและหลอดความคืบหน้า (Interactive Simulator)</span>
          </div>
          <button
            type="button"
            id="toggle-simulator-btn"
            onClick={() => setShowSimulator(!showSimulator)}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
          >
            {showSimulator ? 'ซ่อนตัวทดสอบ' : 'เปิดตัวทดสอบความคืบหน้า'}
          </button>
        </div>

        {showSimulator && (
          <div className="mt-3 pt-3 border-t border-slate-200 space-y-2.5">
            <p className="text-[11px] text-slate-500">
              กดเลือกจำนวนออเดอร์จำลองเพื่อทดสอบดูหลอดความคืบหน้า (Progress Bars) ของระดับต่างๆ ได้ทันที หรือกดเพิ่มทีละ 1 ออเดอร์:
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                id="sim-bronze-btn"
                onClick={() => setSimulatedOrderDelta(1 - validOrders.length)}
                className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-[11px] transition-colors cursor-pointer"
              >
                1 ออเดอร์ (Bronze)
              </button>
              <button
                type="button"
                id="sim-silver-btn"
                onClick={() => setSimulatedOrderDelta(4 - validOrders.length)}
                className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-[11px] transition-colors cursor-pointer"
              >
                4 ออเดอร์ (Silver)
              </button>
              <button
                type="button"
                id="sim-gold-btn"
                onClick={() => setSimulatedOrderDelta(9 - validOrders.length)}
                className="px-2.5 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-800 font-semibold text-[11px] transition-colors cursor-pointer"
              >
                9 ออเดอร์ (Gold)
              </button>
              <button
                type="button"
                id="sim-platinum-btn"
                onClick={() => setSimulatedOrderDelta(16 - validOrders.length)}
                className="px-2.5 py-1 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-900 font-semibold text-[11px] transition-colors cursor-pointer"
              >
                16 ออเดอร์ (Platinum)
              </button>
              <button
                type="button"
                id="sim-add-one-btn"
                onClick={() => setSimulatedOrderDelta(prev => prev + 1)}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>+1 ออเดอร์</span>
              </button>
              {simulatedOrderDelta !== 0 && (
                <button
                  type="button"
                  id="sim-reset-btn"
                  onClick={() => setSimulatedOrderDelta(0)}
                  className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-600 text-[11px] flex items-center gap-1 cursor-pointer"
                  title="รีเซ็ตกลับตามประวัติจริง"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>รีเซ็ต</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
            <Medal className="w-4 h-4 text-amber-600" />
            <span>ระดับสมาชิกและความคืบหน้า (Tiers & Progress)</span>
          </h4>
          <p className="text-[11px] text-slate-500">
            คำนวณจากจำนวนคำสั่งซื้อสะสมจริง ยิ่งสั่งมาก ยิ่งได้รับสิทธิพิเศษและแต้มคูณสูงขึ้น
          </p>
        </div>
      </div>

      {/* Tier Cards with Dedicated Progress Bars */}
      <div className="space-y-4">
        {TIER_DEFINITIONS.map(tierDef => {
          const isCurrentTier = currentTierId === tierDef.id;
          const isUnlocked = totalOrdersPlaced >= tierDef.minOrders;

          // Tier-specific progress calculation based on target orders
          let progressPct = 0;
          let progressLabel = '';
          let ordersRemainingForThisTier = 0;

          if (tierDef.id === 'Bronze') {
            const capped = Math.min(totalOrdersPlaced, 2);
            progressPct = Math.min(100, Math.round((capped / 2) * 100));
            progressLabel = `${capped} / 2 ออเดอร์ (${progressPct}%)`;
          } else if (tierDef.id === 'Silver') {
            const capped = Math.min(totalOrdersPlaced, 7);
            progressPct = Math.min(100, Math.round((capped / 7) * 100));
            progressLabel = `${capped} / 7 ออเดอร์ (${progressPct}%)`;
            ordersRemainingForThisTier = Math.max(0, 3 - totalOrdersPlaced);
          } else if (tierDef.id === 'Gold') {
            const capped = Math.min(totalOrdersPlaced, 14);
            progressPct = Math.min(100, Math.round((capped / 14) * 100));
            progressLabel = `${capped} / 14 ออเดอร์ (${progressPct}%)`;
            ordersRemainingForThisTier = Math.max(0, 8 - totalOrdersPlaced);
          } else if (tierDef.id === 'Platinum') {
            const capped = Math.min(totalOrdersPlaced, 15);
            progressPct = Math.min(100, Math.round((capped / 15) * 100));
            progressLabel = `${capped} / 15 ออเดอร์ (${progressPct}%)`;
            ordersRemainingForThisTier = Math.max(0, 15 - totalOrdersPlaced);
          }

          return (
            <div
              key={tierDef.id}
              id={`tier-card-${tierDef.id.toLowerCase()}`}
              className={`rounded-3xl border p-4 sm:p-5 transition-all relative overflow-hidden ${tierDef.cardBg} ${tierDef.cardBorder} ${
                isCurrentTier ? 'ring-2 ring-amber-500/50 shadow-md' : 'shadow-2xs'
              }`}
            >
              <div className="space-y-3.5">
                
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-xs ${tierDef.badgeBg} ${tierDef.badgeBorder}`}>
                      {getTierIcon(tierDef.id, "w-6 h-6")}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                          {tierDef.nameTh}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          ({tierDef.nameEn})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {tierDef.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="self-start sm:self-auto">
                    {isCurrentTier ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500 text-white font-extrabold text-[11px] shadow-xs animate-pulse">
                        <Crown className="w-3 h-3" />
                        <span>ระดับปัจจุบันของคุณ</span>
                      </span>
                    ) : isUnlocked ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>ปลดล็อกแล้ว (Unlocked)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-semibold text-[10px]">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>ต้องการอีก {ordersRemainingForThisTier} ออเดอร์</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar Section */}
                <div className="bg-white/90 p-3 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-700 text-[11px]">
                        ความคืบหน้าสู่เป้าหมาย {tierDef.id}:
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {tierDef.minOrders === 0 
                          ? 'เกณฑ์ 1-2 ออเดอร์' 
                          : `เกณฑ์ ${tierDef.minOrders} - ${tierDef.targetOrders} ออเดอร์`}
                      </span>
                    </div>
                    <span className="font-extrabold text-slate-900 text-xs">
                      {progressLabel}
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/80">
                    <motion.div
                      id={`progress-bar-${tierDef.id.toLowerCase()}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                      className={`h-full rounded-full ${tierDef.barColor}`}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-400 pt-0.5">
                    <span>เริ่มต้น 0 ออเดอร์</span>
                    <span>เป้าหมาย {tierDef.targetOrders} ออเดอร์</span>
                  </div>
                </div>

                {/* Perks Checklist */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    สิทธิพิเศษระดับ {tierDef.id}:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {tierDef.perks.map((perk, pIndex) => (
                      <div 
                        key={pIndex} 
                        className="bg-white/70 p-2.5 rounded-xl border border-slate-200/60 flex items-start gap-2 text-left"
                      >
                        <div className="p-1 rounded-lg bg-slate-100 shrink-0 mt-0.5">
                          {perk.icon}
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-900 text-[11px]">{perk.title}</h5>
                          <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{perk.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Call to action */}
      {onStartOrder && (
        <div className="pt-2 text-center">
          <button
            type="button"
            id="loyalty-start-ordering-btn"
            onClick={onStartOrder}
            className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all active:scale-98 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>สั่งอาหารเพื่อสะสมออเดอร์เลื่อนระดับสมาชิก</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
