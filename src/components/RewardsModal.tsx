import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Coins, 
  Sparkles, 
  Crown, 
  Ticket, 
  Bike, 
  Check, 
  ArrowRight, 
  Gift, 
  Clock,
  Medal,
  ShoppingBag
} from 'lucide-react';
import { LoyaltyTiersProgram, calculateTierFromOrderCount } from './LoyaltyTiersProgram';

export const RewardsModal: React.FC = () => {
  const { 
    user, 
    orders,
    coupons, 
    redeemCouponWithPoints, 
    setActiveTab, 
    setSelectedRestaurant 
  } = useApp();

  const [tab, setTab] = useState<'tiers' | 'redeem' | 'my_coupons'>('tiers');

  const myCoupons = coupons.filter(c => c.isRedeemed);
  const availableCoupons = coupons.filter(c => !c.isRedeemed);

  // Calculate order-based loyalty progress
  const validOrders = orders.filter(o => o.status !== 'cancelled');
  const totalOrdersPlaced = validOrders.length;
  const currentTier = calculateTierFromOrderCount(totalOrdersPlaced);

  // Next tier order milestone calculation
  let nextTierName = 'Silver';
  let nextTierTarget = 3;
  let remainingOrdersForNextTier = 3 - totalOrdersPlaced;

  if (totalOrdersPlaced >= 15) {
    nextTierName = 'Platinum (ระดับสูงสุด)';
    nextTierTarget = 15;
    remainingOrdersForNextTier = 0;
  } else if (totalOrdersPlaced >= 8) {
    nextTierName = 'Platinum';
    nextTierTarget = 15;
    remainingOrdersForNextTier = 15 - totalOrdersPlaced;
  } else if (totalOrdersPlaced >= 3) {
    nextTierName = 'Gold';
    nextTierTarget = 8;
    remainingOrdersForNextTier = 8 - totalOrdersPlaced;
  }

  const orderProgressPct = Math.min(100, Math.round((totalOrdersPlaced / nextTierTarget) * 100));

  return (
    <div className="p-4 sm:p-6 space-y-5 text-xs text-slate-800">
      
      {/* Loyalty Points & Tier Hero Card */}
      <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 rounded-3xl p-5 text-white shadow-xl shadow-amber-500/20 relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-xs">
                <Crown className="w-4 h-4 text-amber-200" />
              </div>
              <div>
                <span className="font-extrabold text-xs uppercase tracking-wider text-amber-100 block leading-tight">
                  ระดับสมาชิก: {currentTier} Member
                </span>
                <span className="text-[10px] text-amber-200/90 font-medium">
                  สั่งอาหารสะสมแล้ว {totalOrdersPlaced} ออเดอร์
                </span>
              </div>
            </div>

            <button
              type="button"
              id="hero-view-tiers-btn"
              onClick={() => setTab('tiers')}
              className="text-[11px] bg-black/25 hover:bg-black/35 backdrop-blur-xs px-3 py-1.5 rounded-full text-amber-100 flex items-center gap-1 font-semibold transition-colors cursor-pointer border border-white/10"
            >
              <Medal className="w-3.5 h-3.5 text-amber-300" />
              <span>ดูสิทธิพิเศษ</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pt-1">
            <div>
              <span className="text-xs text-amber-100 font-medium">คะแนนสะสมคงเหลือ</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl sm:text-4xl font-black">{(user?.loyaltyPoints ?? 0).toLocaleString()}</span>
                <span className="text-sm font-semibold text-amber-200">คะแนน (Points)</span>
              </div>
            </div>

            <div className="text-[11px] bg-white/15 px-3 py-1.5 rounded-xl backdrop-blur-xs text-amber-100 self-start sm:self-auto border border-white/10">
              ทุก ฿10 รับ 1 แต้ม (สมาชิก {currentTier} รับแต้มพิเศษ)
            </div>
          </div>

          {/* Orders-based Progress Bar to Next Tier */}
          <div className="pt-2.5 border-t border-white/20 space-y-1.5">
            <div className="flex justify-between items-center text-[11px] text-amber-100 font-medium">
              <span className="flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-amber-200" />
                {remainingOrdersForNextTier > 0 ? (
                  <span>
                    สั่งอีก <strong className="text-white font-bold">{remainingOrdersForNextTier}</strong> ออเดอร์ เพื่อเลื่อนเป็น <strong className="text-white font-bold">{nextTierName}</strong>
                  </span>
                ) : (
                  <span className="text-white font-bold">คุณอยู่ในระดับสมาชิกระดับสูงสุดแล้ว 🎉</span>
                )}
              </span>
              <span className="font-bold">{totalOrdersPlaced}/{nextTierTarget} ออเดอร์ ({orderProgressPct}%)</span>
            </div>
            <div className="w-full h-2.5 bg-black/25 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-amber-200 to-white rounded-full transition-all duration-700 shadow-xs"
                style={{ width: `${orderProgressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          id="rewards-tab-tiers-btn"
          onClick={() => setTab('tiers')}
          className={`flex-1 py-2.5 text-center font-bold text-xs border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            tab === 'tiers'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Medal className="w-4 h-4" />
          <span>ระดับสมาชิก ({currentTier})</span>
        </button>

        <button
          id="rewards-tab-redeem-btn"
          onClick={() => setTab('redeem')}
          className={`flex-1 py-2.5 text-center font-bold text-xs border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            tab === 'redeem'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>แลกรับส่วนลด ({availableCoupons.length})</span>
        </button>

        <button
          id="rewards-tab-my-coupons-btn"
          onClick={() => setTab('my_coupons')}
          className={`flex-1 py-2.5 text-center font-bold text-xs border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            tab === 'my_coupons'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>คูปองของฉัน ({myCoupons.length})</span>
        </button>
      </div>

      {/* Tiers Loyalty Program Content */}
      {tab === 'tiers' && (
        <LoyaltyTiersProgram onStartOrder={() => setActiveTab('home')} />
      )}

      {/* Catalog Content */}
      {tab === 'redeem' && (
        <div className="space-y-3">
          <p className="text-[11px] text-slate-500">
            ใช้คะแนนสะสมแลกรับคูปองส่วนลดพิเศษ คูปองจะถูกเก็บไว้ในกระเป๋าของคุณทันที
          </p>

          <div className="space-y-3">
            {availableCoupons.map(coupon => {
              const canAfford = user.loyaltyPoints >= coupon.pointsCost;
              return (
                <div
                  key={coupon.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-amber-400 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0 border border-amber-200">
                      {coupon.discountType === 'free_delivery' ? (
                        <Bike className="w-6 h-6" />
                      ) : (
                        <Ticket className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{coupon.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{coupon.description}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>หมดอายุ: {coupon.expiresAt}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    id={`redeem-coupon-${coupon.id}`}
                    onClick={() => redeemCouponWithPoints(coupon.id)}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0 ${
                      canAfford
                        ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20 active:scale-95'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>ใช้ {coupon.pointsCost} คะแนน</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* My Redeemed Coupons */}
      {tab === 'my_coupons' && (
        <div className="space-y-3">
          {myCoupons.length > 0 ? (
            <div className="space-y-3">
              {myCoupons.map(coupon => (
                <div
                  key={coupon.id}
                  className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-200 shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-300">
                          {coupon.code}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-semibold">พร้อมใช้งาน</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs mt-1">{coupon.title}</h4>
                      <p className="text-[10px] text-slate-500">{coupon.description}</p>
                    </div>
                  </div>

                  <button
                    id={`use-now-coupon-${coupon.id}`}
                    onClick={() => setActiveTab('home')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shrink-0"
                  >
                    <span>สั่งเลย</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
              <Ticket className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="font-bold text-slate-700 text-xs">คุณยังไม่มีคูปองที่แลกไว้</h4>
              <p className="text-[11px] text-slate-500">
                เลือกแลกคูปองส่วนลดจากคะแนนสะสมในแท็บ "แลกรับส่วนลด" ได้เลย
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
