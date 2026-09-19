import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShoppingBag, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  Sparkles, 
  Maximize2, 
  Clock, 
  Check, 
  ChevronUp,
  ChevronDown,
  Store
} from 'lucide-react';
import { getRestaurantDistance, formatDistance } from '../utils/geolocation';
import { getDeliverySlaDetails } from '../utils/deliverySla';

export const FloatingQuickCart: React.FC = () => {
  const { 
    cart, 
    cartRestaurant, 
    cartSubtotal, 
    cartDeliveryFee, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart,
    isQuickCartPopupOpen, 
    setIsQuickCartPopupOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    userLocation,
    lastAddedCartItemName,
    setLastAddedCartItemName
  } = useApp();

  const popupRef = useRef<HTMLDivElement>(null);
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Auto-dismiss lastAddedCartItemName notification after 4 seconds
  useEffect(() => {
    if (lastAddedCartItemName) {
      const timer = setTimeout(() => {
        setLastAddedCartItemName(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [lastAddedCartItemName, setLastAddedCartItemName]);

  // Click outside to close the Quick Cart Popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isQuickCartPopupOpen && 
        popupRef.current && 
        !popupRef.current.contains(event.target as Node)
      ) {
        setIsQuickCartPopupOpen(false);
      }
    };

    if (isQuickCartPopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isQuickCartPopupOpen, setIsQuickCartPopupOpen]);

  // If cart is empty, do not render floating widget
  if (totalCartCount === 0 || !cartRestaurant) {
    return null;
  }

  const effectiveDistance = cartRestaurant ? getRestaurantDistance(cartRestaurant, userLocation) : 0;
  const sla = getDeliverySlaDetails(effectiveDistance, cartRestaurant?.averagePrepTimeMinutes || 15);

  const handleOpenFullModal = () => {
    setIsQuickCartPopupOpen(false);
    setIsCartOpen(true);
  };

  const handleQuickProceedToCheckout = () => {
    setIsQuickCartPopupOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div 
      ref={popupRef}
      className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 pointer-events-auto flex flex-col items-end"
    >
      {/* 1. Added-to-Cart Floating Micro Toast Capsule */}
      {lastAddedCartItemName && !isQuickCartPopupOpen && (
        <div 
          id="cart-added-item-flash-capsule"
          className="mb-2 bg-slate-900/95 backdrop-blur-md text-white text-xs px-3.5 py-2 rounded-2xl shadow-xl border border-emerald-500/40 flex items-center gap-2.5 animate-in slide-in-from-bottom-2 fade-in duration-200"
        >
          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
          <div className="max-w-[180px] sm:max-w-[220px] truncate">
            <span className="text-emerald-400 font-bold">เพิ่มแล้ว: </span>
            <span className="font-semibold text-slate-100">{lastAddedCartItemName}</span>
          </div>
          <button
            id="quick-view-capsule-btn"
            onClick={() => {
              setLastAddedCartItemName(null);
              setIsQuickCartPopupOpen(true);
            }}
            className="text-[11px] font-black text-emerald-400 hover:text-emerald-300 underline cursor-pointer shrink-0"
          >
            เปิดดู
          </button>
          <button
            onClick={() => setLastAddedCartItemName(null)}
            className="text-slate-400 hover:text-slate-200 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Interactive Mini Quick-Cart Pop-up (Popover) */}
      {isQuickCartPopupOpen && (
        <div
          id="quick-cart-popup-card"
          className="mb-3 w-[calc(100vw-2rem)] max-w-sm sm:w-96 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col animate-in zoom-in-95 fade-in slide-in-from-bottom-3 duration-200"
        >
          {/* Pop-up Header */}
          <div className="p-3.5 bg-gradient-to-r from-slate-900 to-slate-850 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={cartRestaurant.logoImage}
                alt={cartRestaurant.name}
                className="w-8 h-8 rounded-full object-cover border border-white/20 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded">
                    ป๊อปอัปตะกร้าด่วน
                  </span>
                  <span className="text-[11px] text-slate-300">~{sla.totalMinutes} นาที</span>
                </div>
                <h4 className="font-extrabold text-xs text-white truncate">
                  {cartRestaurant.name}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                id="expand-to-full-cart-btn"
                onClick={handleOpenFullModal}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                title="ขยายเป็นหน้าต่างเต็ม"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                id="close-quick-cart-popup-btn"
                onClick={() => setIsQuickCartPopupOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                title="ปิดป๊อปอัป"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Items List (Max 3 visible, scrollable) */}
          <div className="p-3 max-h-56 overflow-y-auto divide-y divide-slate-100 space-y-2 text-xs">
            {cart.map(item => (
              <div key={item.cartItemId} className="pt-2 first:pt-0 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <img
                    src={item.menuItem.image}
                    alt={item.menuItem.name}
                    className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900 text-xs truncate">
                      {item.menuItem.name}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {item.spicyLevel && `${item.spicyLevel} • `}
                      ฿{item.unitPrice} x {item.quantity}
                    </div>
                  </div>
                </div>

                {/* Instant Quantity Stepper */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                    <button
                      onClick={() => updateCartQuantity(item.cartItemId, -1)}
                      className="w-5 h-5 rounded bg-white text-slate-700 shadow-2xs flex items-center justify-center hover:bg-slate-50 cursor-pointer"
                      title="ลดจำนวน"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="w-5 text-center font-bold text-slate-900 text-xs">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.cartItemId, 1)}
                      className="w-5 h-5 rounded bg-white text-slate-700 shadow-2xs flex items-center justify-center hover:bg-slate-50 cursor-pointer"
                      title="เพิ่มจำนวน"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <span className="font-black text-slate-900 text-xs min-w-[48px] text-right">
                    ฿{(item.unitPrice * item.quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Summary & Mini SLA Badge */}
          <div className="p-3 bg-slate-50/90 border-t border-slate-200/80 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1">
                <span>รวมค่าอาหาร ({totalCartCount} รายการ)</span>
              </span>
              <span className="font-extrabold text-slate-900 text-sm">
                ฿{cartSubtotal.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-600" />
                <span>ค่าส่ง: {cartDeliveryFee === 0 ? 'ฟรีค่าจัดส่ง' : `฿${cartDeliveryFee}`}</span>
              </span>
              <button
                id="quick-cart-clear-btn"
                onClick={clearCart}
                className="text-rose-500 hover:text-rose-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-2.5 h-2.5" />
                <span>ล้างตะกร้า</span>
              </button>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                id="quick-cart-full-view-btn"
                onClick={handleOpenFullModal}
                className="py-2.5 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <Store className="w-3.5 h-3.5 text-slate-500" />
                <span>ดูรายละเอียดเต็ม</span>
              </button>

              <button
                id="quick-cart-checkout-btn"
                onClick={handleQuickProceedToCheckout}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs transition-all shadow-md shadow-emerald-600/20 active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>สั่งซื้อทันที ⚡</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Sleek Floating Cart Action Button (FAB) */}
      <button
        id="floating-cart-bubble-toggle-btn"
        onClick={() => setIsQuickCartPopupOpen(!isQuickCartPopupOpen)}
        className={`group flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl transition-all duration-200 cursor-pointer border active:scale-95 ${
          isQuickCartPopupOpen
            ? 'bg-slate-900 border-slate-750 text-white ring-4 ring-emerald-500/20 shadow-slate-900/30'
            : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 border-emerald-400/40 text-white shadow-emerald-600/40 hover:shadow-emerald-600/50 hover:brightness-105'
        }`}
        aria-label="เปิดป๊อปอัปตะกร้าสินค้า"
      >
        {/* Shopping Bag Icon with Count Badge */}
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[11px] font-black rounded-full h-5 min-w-5 px-1 flex items-center justify-center shadow-md border-2 border-white animate-pulse">
            {totalCartCount}
          </span>
        </div>

        {/* Text & Price Info */}
        <div className="text-left flex flex-col leading-tight">
          <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider">
            {isQuickCartPopupOpen ? 'ปิดป๊อปอัป' : 'ตะกร้าสินค้า'}
          </span>
          <span className="text-sm font-black text-white">
            ฿{cartSubtotal.toLocaleString()}
          </span>
        </div>

        {/* Expand / Collapse Indicator */}
        <div className="ml-1 pl-1.5 border-l border-white/20 text-emerald-200">
          {isQuickCartPopupOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
          )}
        </div>
      </button>
    </div>
  );
};
