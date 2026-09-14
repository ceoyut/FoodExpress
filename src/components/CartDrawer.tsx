import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  Ticket, 
  ArrowRight, 
  ShoppingBag, 
  Sparkles, 
  Check,
  Star,
  Clock,
  Flame,
  Compass 
} from 'lucide-react';
import { RESTAURANTS_DATA } from '../data/mockData';
import { EmptyCartIllustration } from './EmptyCartIllustration';

interface CartDrawerProps {
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onClose, onProceedToCheckout }) => {
  const { 
    cart, 
    cartRestaurant, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart, 
    cartSubtotal, 
    cartDeliveryFee, 
    appliedCoupon, 
    setAppliedCoupon, 
    coupons,
    triggerToast,
    setSelectedRestaurant,
    setActiveTab 
  } = useApp();

  // Filter coupons that user has redeemed
  const usableCoupons = coupons.filter(c => c.isRedeemed);

  // Discount calculation
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'fixed') {
      discountAmount = appliedCoupon.discountValue;
    } else if (appliedCoupon.discountType === 'free_delivery') {
      discountAmount = cartDeliveryFee;
    } else if (appliedCoupon.discountType === 'percentage') {
      discountAmount = Math.round((cartSubtotal * appliedCoupon.discountValue) / 100);
    }
  }

  const finalTotal = Math.max(0, cartSubtotal + cartDeliveryFee - discountAmount);
  const pointsToEarn = Math.floor(finalTotal / 10);

  // Suggested popular restaurant for empty state recommendation
  const suggestedRestaurant = RESTAURANTS_DATA[0] || null;

  if (cart.length === 0 || !cartRestaurant) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div 
          id="cart-drawer-empty-container"
          className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-5"
        >
          {/* Top Header with Close Button */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-800">ตะกร้าของคุณ</h3>
            </div>
            <button
              id="close-empty-cart-x-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              title="ปิดตะกร้า"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 sm:p-6 text-center space-y-4 overflow-y-auto no-scrollbar">
            {/* Friendly Vector SVG Illustration */}
            <div className="py-1">
              <EmptyCartIllustration className="w-48 h-38" />
            </div>

            {/* Friendly Copy */}
            <div className="space-y-1">
              <h3 className="font-black text-lg text-slate-900">
                ตะกร้าของคุณยังว่างเปล่าอยู่นะ
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                หิวแล้วใช่ไหม? เลือกสั่งอาหารจานโปรดจากร้านพันธมิตรคุณภาพ พร้อมจัดส่งร้อนๆ ถึงมือคุณ
              </p>
            </div>

            {/* Quick Food Discovery Category Chips */}
            <div className="space-y-2 text-left pt-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold px-0.5">
                <span className="flex items-center gap-1 text-slate-700">
                  <Compass className="w-3.5 h-3.5 text-emerald-600" />
                  หมวดหมู่อาหารยอดนิยม:
                </span>
                <span className="text-[10px] text-emerald-600">คลิกเพื่อเลือกดู</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '🍜 ราเมน & เส้น', filter: 'japanese' },
                  { label: '🍛 กะเพรา & อาหารไทย', filter: 'thai' },
                  { label: '🍔 เบอร์เกอร์', filter: 'fastfood' },
                  { label: '🥗 สลัด & สุขภาพ', filter: 'healthy' },
                  { label: '☕ คาเฟ่ & ขนม', filter: 'cafe' },
                ].map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => {
                      onClose();
                      setActiveTab('home');
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>{chip.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recommended Top Pick Store Card */}
            {suggestedRestaurant && (
              <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-200/80 text-left flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={suggestedRestaurant.logoImage}
                    alt={suggestedRestaurant.name}
                    className="w-11 h-11 rounded-xl object-cover border border-white shadow-2xs shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 text-[10px] text-amber-700 font-bold">
                      <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span>แนะนำประจำวัน</span>
                    </div>
                    <div className="text-xs font-extrabold text-slate-900 truncate">
                      {suggestedRestaurant.name}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                      <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                        <Star className="w-2.5 h-2.5 fill-amber-400" />
                        {suggestedRestaurant.rating}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {suggestedRestaurant.deliveryTimeMinutes} นาที
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  id="empty-cart-pick-suggested-btn"
                  onClick={() => {
                    setSelectedRestaurant(suggestedRestaurant);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0 cursor-pointer transition-colors shadow-2xs"
                >
                  ดูเมนู
                </button>
              </div>
            )}

            {/* Primary Action Button */}
            <div className="pt-2 space-y-2">
              <button
                id="close-empty-cart-btn"
                onClick={() => {
                  onClose();
                  setActiveTab('home');
                }}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-extrabold transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>สำรวจร้านอาหาร & เริ่มสั่งเลย</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-5">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-150 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <img
              src={cartRestaurant.logoImage}
              alt={cartRestaurant.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
              referrerPolicy="no-referrer"
            />
            <div>
              <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{cartRestaurant.name}</h3>
              <p className="text-[11px] text-slate-500">{cart.length} รายการอาหาร</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="clear-cart-btn"
              onClick={clearCart}
              className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg transition-colors"
              title="ล้างตะกร้าทั้งหมด"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              id="close-cart-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200/80 text-slate-700 flex items-center justify-center hover:bg-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 divide-y divide-slate-100 text-xs">
          {cart.map(item => (
            <div key={item.cartItemId} className="pt-3 first:pt-0 flex items-center gap-3">
              <img
                src={item.menuItem.image}
                alt={item.menuItem.name}
                className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0"
                referrerPolicy="no-referrer"
              />

              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 text-xs truncate">{item.menuItem.name}</h4>
                <div className="flex flex-wrap gap-1 text-[10px] text-slate-500 mt-0.5">
                  {item.spicyLevel && (
                    <span className="bg-rose-50 text-rose-600 px-1.5 py-0.2 rounded font-medium">
                      {item.spicyLevel}
                    </span>
                  )}
                  {Object.entries(item.selectedOptions).map(([group, val]) => (
                    <span key={group} className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                      {val}
                    </span>
                  ))}
                  {item.notes && (
                    <span className="text-amber-700 italic">"{item.notes}"</span>
                  )}
                </div>
                <div className="font-extrabold text-slate-900 mt-1">
                  ฿{(item.unitPrice * item.quantity).toLocaleString()}
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1">
                <button
                  id={`cart-minus-${item.cartItemId}`}
                  onClick={() => updateCartQuantity(item.cartItemId, -1)}
                  className="w-6 h-6 rounded-lg bg-white text-slate-700 shadow-xs flex items-center justify-center"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-5 text-center font-bold text-slate-900 text-xs">{item.quantity}</span>
                <button
                  id={`cart-plus-${item.cartItemId}`}
                  onClick={() => updateCartQuantity(item.cartItemId, 1)}
                  className="w-6 h-6 rounded-lg bg-white text-slate-700 shadow-xs flex items-center justify-center"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <button
                id={`cart-remove-${item.cartItemId}`}
                onClick={() => removeFromCart(item.cartItemId)}
                className="text-slate-300 hover:text-rose-500 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Coupon Voucher Section */}
          <div className="pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-emerald-600" />
                คูปองส่วนลดพิเศษ
              </span>
              {appliedCoupon && (
                <button
                  id="remove-coupon-btn"
                  onClick={() => setAppliedCoupon(null)}
                  className="text-[11px] text-rose-500 font-semibold hover:underline"
                >
                  ยกเลิกคูปอง
                </button>
              )}
            </div>

            {usableCoupons.length > 0 ? (
              <div className="space-y-1.5">
                {usableCoupons.map(coupon => {
                  const isSelected = appliedCoupon?.id === coupon.id;
                  const isApplicable = cartSubtotal >= coupon.minOrder;
                  return (
                    <div
                      key={coupon.id}
                      onClick={() => {
                        if (isApplicable) {
                          setAppliedCoupon(isSelected ? null : coupon);
                          if (!isSelected) {
                            triggerToast('ใช้คูปองแล้ว 🎉', `ได้รับส่วนลด ${coupon.title}`, 'success');
                          }
                        }
                      }}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                        !isApplicable
                          ? 'opacity-50 border-slate-200 bg-slate-50 cursor-not-allowed'
                          : isSelected
                          ? 'border-emerald-500 bg-emerald-50/60 cursor-pointer'
                          : 'border-slate-200 hover:border-emerald-300 bg-white cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isSelected ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                          {isSelected ? <Check className="w-3.5 h-3.5" /> : <Ticket className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-[11px]">{coupon.title}</div>
                          <div className="text-[10px] text-slate-400">{coupon.description}</div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {isApplicable ? (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                            {isSelected ? 'ใช้งานอยู่' : 'เลือกใช้'}
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-400">สั่งขั้นต่ำ ฿{coupon.minOrder}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-slate-500 text-[11px]">
                คุณยังไม่มีคูปองที่แลกไว้ แลกคูปองด้วยคะแนนสะสมได้ที่หน้า <b>สิทธิพิเศษ</b>
              </div>
            )}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>รวมค่าอาหาร</span>
            <span>฿{cartSubtotal.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>ค่าจัดส่ง (ระยะทาง {cartRestaurant.distanceKm} กม.)</span>
            {cartDeliveryFee === 0 ? (
              <span className="text-emerald-600 font-bold">ฟรีค่าจัดส่ง</span>
            ) : (
              <span>฿{cartDeliveryFee}</span>
            )}
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-rose-600 font-semibold">
              <span>ส่วนลดจากคูปอง ({appliedCoupon?.code})</span>
              <span>-฿{discountAmount.toLocaleString()}</span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
            <div>
              <span className="font-bold text-slate-900 text-sm">ยอดชำระสุทธิ</span>
              <div className="flex items-center gap-1 text-[10px] text-amber-700 font-semibold mt-0.5">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>รับทันที +{pointsToEarn} คะแนนสะสม</span>
              </div>
            </div>
            <span className="font-black text-xl text-emerald-700">
              ฿{finalTotal.toLocaleString()}
            </span>
          </div>

          <button
            id="proceed-checkout-btn"
            onClick={onProceedToCheckout}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm flex items-center justify-between shadow-lg shadow-emerald-600/25 active:scale-[0.99] transition-all"
          >
            <span>ดำเนินการชำระเงิน</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
