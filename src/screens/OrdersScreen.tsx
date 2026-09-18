import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShoppingBag, 
  Clock, 
  MapPin, 
  Star, 
  ArrowRight, 
  RotateCw, 
  Bike, 
  CheckCircle2, 
  Sparkles,
  Utensils,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Receipt,
  CreditCard,
  Store,
  Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RESTAURANTS_DATA } from '../data/mockData';
import { Order, CartItem, MenuItem, Restaurant } from '../types';
import { OrderPrepCountdownTimer } from '../components/OrderPrepCountdownTimer';

type FilterTab = 'all' | 'active' | 'completed' | 'cancelled';

export interface OrderTimeEstimates {
  orderTimeDisplay: string;
  deliveryTimeRange: string;
  deliveryExactTime: string;
  pickupTime: string;
  deliveryMinutes: number;
  pickupMinutes: number;
  averagePrepTimeMinutes: number;
  minutesRemainingDelivery?: number;
  minutesRemainingPickup?: number;
  isCompleted: boolean;
  isCancelled: boolean;
}

/**
 * Calculates estimated delivery or pickup time based on the order timestamp (createdAt)
 * and the restaurant's estimated preparation/delivery duration.
 */
export const calculateOrderTimeEstimates = (order: Order): OrderTimeEstimates => {
  const deliveryMinutes = order.estimatedDeliveryMinutes || 25;
  const matchedRestaurant = RESTAURANTS_DATA.find(r => r.id === order.restaurantId);
  // Average preparation time benchmark from restaurant data or fallback
  const averagePrepTimeMinutes = matchedRestaurant?.averagePrepTimeMinutes || Math.max(8, Math.round(deliveryMinutes * 0.6));
  // Kitchen prep time for takeout/pickup without rider delivery transit
  const pickupMinutes = averagePrepTimeMinutes;

  let baseDate = new Date();
  const raw = (order.createdAt || '').trim();

  // Try direct date parse if it has hyphen or ISO format
  const parsed = Date.parse(raw);
  if (!isNaN(parsed) && raw.includes('-')) {
    baseDate = new Date(parsed);
  } else {
    // Parse time pattern like "18:30" or "12:15"
    const match = raw.match(/(\d{1,2}):(\d{2})/);
    if (match) {
      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      baseDate = new Date();
      if (raw.includes('เมื่อวาน')) {
        baseDate.setDate(baseDate.getDate() - 1);
      } else if (raw.includes('วันที่แล้ว')) {
        const daysMatch = raw.match(/(\d+)\s*วันที่แล้ว/);
        const days = daysMatch ? parseInt(daysMatch[1], 10) : 3;
        baseDate.setDate(baseDate.getDate() - days);
      }
      baseDate.setHours(hours, minutes, 0, 0);
    }
  }

  const formatThTime = (d: Date) => {
    return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
  };

  const deliveryStart = new Date(baseDate.getTime() + Math.max(5, deliveryMinutes - 3) * 60000);
  const deliveryEnd = new Date(baseDate.getTime() + (deliveryMinutes + 5) * 60000);
  const deliveryExact = new Date(baseDate.getTime() + deliveryMinutes * 60000);
  const pickupTarget = new Date(baseDate.getTime() + pickupMinutes * 60000);

  const now = new Date();
  const diffDeliveryMs = deliveryEnd.getTime() - now.getTime();
  const diffPickupMs = pickupTarget.getTime() - now.getTime();

  const isCompleted = order.status === 'delivered';
  const isCancelled = order.status === 'cancelled';

  return {
    orderTimeDisplay: formatThTime(baseDate),
    deliveryTimeRange: `${formatThTime(deliveryStart)} - ${formatThTime(deliveryEnd)}`,
    deliveryExactTime: formatThTime(deliveryExact),
    pickupTime: formatThTime(pickupTarget),
    deliveryMinutes,
    pickupMinutes,
    averagePrepTimeMinutes,
    minutesRemainingDelivery: (!isCompleted && !isCancelled && diffDeliveryMs > 0)
      ? Math.ceil(diffDeliveryMs / 60000)
      : undefined,
    minutesRemainingPickup: (!isCompleted && !isCancelled && diffPickupMs > 0)
      ? Math.ceil(diffPickupMs / 60000)
      : undefined,
    isCompleted,
    isCancelled,
  };
};

export interface OrderItemProps {
  order: Order;
  orderIndex: number;
  isActive: boolean;
  isCancelled: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onTrack: () => void;
  onReorder: (order: Order) => void;
  onReview: (order: Order) => void;
  getStatusBadge: (status: Order['status']) => React.ReactNode;
  getPaymentMethodLabel: (method: string) => string;
}

export const OrderItem: React.FC<OrderItemProps> = ({
  order,
  orderIndex: _orderIndex,
  isActive,
  isCancelled,
  isExpanded,
  onToggleExpand,
  onTrack,
  onReorder,
  onReview,
  getStatusBadge,
  getPaymentMethodLabel,
}) => {
  const { t } = useApp();
  const [timeMode, setTimeMode] = useState<'delivery' | 'pickup'>('delivery');
  const [isReordering, setIsReordering] = useState(false);
  const estimates = calculateOrderTimeEstimates(order);
  const totalItemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  const handleReorderClick = () => {
    setIsReordering(true);
    onReorder(order);
    setTimeout(() => {
      setIsReordering(false);
    }, 1500);
  };

  return (
    <div
      id={`order-card-${order.id}`}
      className={`p-4 rounded-2xl border transition-all ${
        isActive
          ? 'border-emerald-500 bg-emerald-50/30 shadow-md ring-1 ring-emerald-500'
          : isCancelled
          ? 'bg-slate-50/70 border-slate-200/80 shadow-2xs opacity-90'
          : 'bg-white border-slate-200 shadow-2xs'
      }`}
    >
      {/* Card Top: Restaurant info & Order ID & Status */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <img
            src={order.restaurantLogo || (RESTAURANTS_DATA.find(r => r.id === order.restaurantId)?.logoImage) || 'https://images.unsplash.com/photo-1562967914-608f82629710?w=200&auto=format&fit=crop&q=80'}
            alt={order.restaurantName}
            className="w-10 h-10 rounded-xl object-cover border border-slate-200"
            referrerPolicy="no-referrer"
          />
          <div>
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">{order.restaurantName}</h3>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
              <span>สั่งเมื่อ: {order.createdAt}</span>
              <span>•</span>
              <span>{order.id}</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          {getStatusBadge(order.status)}
        </div>
      </div>

      {/* Dynamic Estimated Delivery or Pickup Time Banner based on order timestamp */}
      <div className="my-2.5 p-2.5 sm:p-3 rounded-xl bg-slate-50/90 border border-slate-100/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs ${
            timeMode === 'delivery' 
              ? 'bg-emerald-600 text-white' 
              : 'bg-amber-500 text-white'
          }`}>
            {timeMode === 'delivery' ? (
              <Bike className="w-4 h-4" />
            ) : (
              <Store className="w-4 h-4" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-semibold text-slate-500">
                {timeMode === 'delivery' ? 'เวลาจัดส่งโดยประมาณ (Delivery ETA)' : 'เวลารับอาหารที่ร้าน (Pickup ETA)'}
              </span>
              {isActive && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 animate-pulse">
                  <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                  คำนวณสด
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xs sm:text-sm font-black text-slate-900">
                {timeMode === 'delivery' ? estimates.deliveryTimeRange : estimates.pickupTime}
              </span>

              {isActive ? (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded">
                  {timeMode === 'delivery' 
                    ? (estimates.minutesRemainingDelivery ? `อีก ~${estimates.minutesRemainingDelivery} นาที` : `ใช้เวลา ~${estimates.deliveryMinutes} นาที`)
                    : (estimates.minutesRemainingPickup ? `อีก ~${estimates.minutesRemainingPickup} นาที` : `ใช้เวลา ~${estimates.pickupMinutes} นาที`)
                  }
                </span>
              ) : estimates.isCompleted ? (
                <span className="text-[10px] font-medium text-slate-500">
                  {timeMode === 'delivery' 
                    ? `(ส่งถึงเมื่อ ~${estimates.deliveryExactTime})` 
                    : `(ปรุงเสร็จเมื่อ ~${estimates.pickupTime})`
                  }
                </span>
              ) : (
                <span className="text-[10px] font-medium text-slate-400">
                  (เวลาคาดการณ์เดิม)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Toggle Mode: Delivery vs Pickup */}
        <div className="flex items-center p-0.5 bg-white rounded-xl border border-slate-200 text-[10px] font-bold self-start sm:self-auto shrink-0 shadow-2xs">
          <button
            type="button"
            id={`toggle-delivery-mode-${order.id}`}
            onClick={() => setTimeMode('delivery')}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
              timeMode === 'delivery'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="ดูเวลาจัดส่งถึงบ้านโดยประมาณ"
          >
            <Bike className="w-3 h-3" />
            <span>จัดส่งเดลิเวอรี่</span>
          </button>
          <button
            type="button"
            id={`toggle-pickup-mode-${order.id}`}
            onClick={() => setTimeMode('pickup')}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
              timeMode === 'pickup'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="ดูเวลารับอาหารที่ร้านโดยประมาณ"
          >
            <Store className="w-3 h-3" />
            <span>รับที่ร้าน (Pickup)</span>
          </button>
        </div>
      </div>

      {/* Countdown Timer estimating order preparation duration based on restaurant average prep time */}
      <OrderPrepCountdownTimer
        order={order}
        averagePrepTimeMinutes={estimates.averagePrepTimeMinutes}
        className="my-2.5"
      />

      {/* Interactive Toggle Summary Bar */}
      <div className="py-2.5 flex items-center justify-between gap-2 border-b border-slate-100">
        <button
          id={`toggle-order-expand-${order.id}`}
          onClick={onToggleExpand}
          className="flex-1 flex items-center justify-between text-left group cursor-pointer hover:opacity-90 transition-opacity"
          title={isExpanded ? 'ย่อรายละเอียดเมนู' : 'กดเพื่อดูรายละเอียดเมนูและราคา'}
        >
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
              <Receipt className="w-3 h-3" />
              <span>{totalItemsCount} รายการ</span>
            </span>
            <span className="text-[11px] text-slate-500 truncate">
              {order.items.map(i => `${i.quantity}x ${i.menuItem.name}`).join(', ')}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 shrink-0 group-hover:text-emerald-700">
            <span>{isExpanded ? 'ย่อสรุป' : 'ดูสรุปเมนู'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>
      </div>

      {/* Collapsed single-line preview when collapsed */}
      {!isExpanded && (
        <div className="py-2 flex items-center justify-between text-[11px] text-slate-500">
          <span className="truncate">
            {order.items.map(i => `${i.quantity}x ${i.menuItem.name}`).join(', ')}
          </span>
          <span className="text-slate-400 shrink-0 ml-2 font-medium">
            {order.items.length} ชนิด
          </span>
        </div>
      )}

      {/* Expanded Mini-Summary of Ordered Dishes */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key={`expanded-order-details-${order.id}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="py-3 space-y-3">
              {/* Summary Header */}
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                  <span>สรุปรายการอาหาร ({totalItemsCount} รายการ)</span>
                </span>
                <span>ราคาต่อชิ้น / รวม</span>
              </div>

              {/* Dishes Cards List */}
              <div className="space-y-2">
                {order.items.map((item, idx) => {
                  const itemTotal = item.unitPrice * item.quantity;
                  const dishImage = item.menuItem.image;
                  return (
                    <div
                      key={item.cartItemId || `${order.id}-dish-${idx}`}
                      className="p-2.5 sm:p-3 rounded-xl bg-slate-50/90 border border-slate-100 flex items-start justify-between gap-3 text-xs hover:border-slate-200 transition-colors"
                    >
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        {dishImage ? (
                          <img
                            src={dishImage}
                            alt={item.menuItem.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200/80 shrink-0 mt-0.5"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-600 mt-0.5">
                            <Utensils className="w-5 h-5" />
                          </div>
                        )}

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">
                              {item.menuItem.name}
                            </h4>
                            {item.menuItem.nameEn && (
                              <span className="text-[10px] text-slate-400">
                                ({item.menuItem.nameEn})
                              </span>
                            )}
                          </div>

                          {/* Options & Customizations */}
                          {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                            <div className="flex flex-wrap gap-1 text-[10px]">
                              {Object.entries(item.selectedOptions).map(([group, choice]) => (
                                <span
                                  key={group}
                                  className="bg-white px-1.5 py-0.5 rounded-md border border-slate-200 text-slate-600"
                                >
                                  {group}: <b className="text-slate-800 font-medium">{choice}</b>
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Spicy level */}
                          {item.spicyLevel && (
                            <span className="inline-block text-[10px] bg-rose-50 text-rose-700 font-semibold px-1.5 py-0.5 rounded-md border border-rose-100">
                              🌶️ {item.spicyLevel}
                            </span>
                          )}

                          {/* Notes */}
                          {item.notes && (
                            <p className="text-[10px] text-slate-600 italic bg-amber-50/70 border border-amber-100 text-amber-900 px-1.5 py-0.5 rounded-md">
                              โน้ต: {item.notes}
                            </p>
                          )}

                          {/* Quantity & Unit Price */}
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
                            <span className="bg-emerald-100/80 text-emerald-800 font-bold px-1.5 py-0.2 rounded text-[10px]">
                              {item.quantity} จาน
                            </span>
                            <span>×</span>
                            <span>฿{(item.unitPrice || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="text-right shrink-0">
                        <span className="font-black text-slate-900 text-xs sm:text-sm">
                          ฿{(itemTotal || 0).toLocaleString()}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          ({item.quantity || 1}x)
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Timestamp & Estimated Schedule Breakdown Box */}
              <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/60 space-y-2 text-[11px]">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <Timer className="w-3.5 h-3.5 text-emerald-700" />
                  <span>กำหนดเวลาคำนวณตามเวลาสั่งซื้อ (Timestamp Schedule)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[10px]">
                  <div className="p-2 rounded-lg bg-white border border-emerald-100">
                    <span className="text-slate-400 block mb-0.5">1. เวลาส่งคำสั่งซื้อ</span>
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{estimates.orderTimeDisplay}</span>
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">({order.createdAt})</span>
                  </div>

                  <div className="p-2 rounded-lg bg-white border border-amber-100">
                    <span className="text-amber-700 block mb-0.5 font-medium">2. พร้อมรับที่ร้าน (Pickup)</span>
                    <span className="font-bold text-amber-900 text-xs flex items-center gap-1">
                      <Store className="w-3 h-3 text-amber-600" />
                      <span>{estimates.pickupTime}</span>
                    </span>
                    <span className="text-[9px] text-amber-600 block mt-0.5">ปรุงเสร็จใน ~{estimates.pickupMinutes} นาที</span>
                  </div>

                  <div className="p-2 rounded-lg bg-white border border-emerald-100">
                    <span className="text-emerald-700 block mb-0.5 font-medium">3. ถึงปลายทาง (Delivery)</span>
                    <span className="font-bold text-emerald-900 text-xs flex items-center gap-1">
                      <Bike className="w-3 h-3 text-emerald-600" />
                      <span>{estimates.deliveryTimeRange}</span>
                    </span>
                    <span className="text-[9px] text-emerald-600 block mt-0.5">จัดส่งรวม ~{estimates.deliveryMinutes} นาที</span>
                  </div>
                </div>
              </div>

              {/* Financial & Delivery Breakdown */}
              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1.5 text-[11px] text-slate-600">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">ค่าอาหารรวม (Subtotal)</span>
                  <span className="font-semibold text-slate-800">
                    ฿{(order.subtotal || order.items.reduce((sum, i) => sum + (i.unitPrice * i.quantity), 0)).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">ค่าจัดส่ง</span>
                  <span className="font-semibold text-slate-800">
                    {order.deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-bold">ฟรี</span>
                    ) : (
                      `฿${order.deliveryFee.toLocaleString()}`
                    )}
                  </span>
                </div>

                {order.discountAmount > 0 && (
                  <div className="flex justify-between items-center text-rose-600">
                    <span>ส่วนลดคูปอง</span>
                    <span className="font-bold">-฿{order.discountAmount.toLocaleString()}</span>
                  </div>
                )}

                {order.pointsUsed > 0 && (
                  <div className="flex justify-between items-center text-amber-600">
                    <span>ส่วนลดจากแต้มสะสม</span>
                    <span className="font-bold">-฿{order.pointsUsed.toLocaleString()}</span>
                  </div>
                )}

                <div className="pt-2 mt-1 border-t border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[10px] text-slate-500">
                  <div className="flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{order.deliveryAddress}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 font-medium text-slate-700">
                    <CreditCard className="w-3 h-3 text-slate-400" />
                    <span>{getPaymentMethodLabel(order.paymentMethod)}</span>
                  </div>
                </div>

                {/* Reorder entire order button in expanded summary */}
                <div className="pt-2 mt-1 border-t border-slate-200/70">
                  <button
                    type="button"
                    id={`reorder-expanded-btn-${order.id}`}
                    onClick={handleReorderClick}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-98 cursor-pointer"
                    title={t('reorderTooltip')}
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${isReordering ? 'animate-spin text-emerald-600' : ''}`} />
                    <span>
                      {isReordering 
                        ? t('reorderSuccess')
                        : t('reorderAllItems', { count: totalItemsCount })}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pricing & Points Footer */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-slate-500 text-[11px]">ยอดรวมสุทธิ:</span>
          <span className="font-black text-base text-emerald-700">฿{order.total.toLocaleString()}</span>
          {order.pointsEarned > 0 && (
            <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
              +{order.pointsEarned} แต้ม
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {isActive ? (
            <>
              <button
                id={`track-order-btn-${order.id}`}
                onClick={onTrack}
                className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Bike className="w-4 h-4 animate-bounce" />
                <span>{t('trackRider')}</span>
              </button>

              <button
                id={`reorder-btn-${order.id}`}
                onClick={handleReorderClick}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  isReordering 
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700'
                }`}
                title={t('reorderTooltip')}
              >
                <RotateCw className={`w-3.5 h-3.5 ${isReordering ? 'animate-spin' : ''}`} />
                <span>{isReordering ? t('reorderSuccess') : t('reorder')}</span>
              </button>
            </>
          ) : isCancelled ? (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium">คำสั่งซื้อถูกยกเลิก</span>
              <button
                id={`reorder-btn-${order.id}`}
                onClick={handleReorderClick}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
                title={t('reorderTooltip')}
              >
                <RotateCw className={`w-3.5 h-3.5 ${isReordering ? 'animate-spin' : ''}`} />
                <span>{isReordering ? t('reorderSuccess') : t('reorder')}</span>
              </button>
            </div>
          ) : (
            <>
              {!order.hasReviewed ? (
                <button
                  id={`review-order-btn-${order.id}`}
                  onClick={() => onReview(order)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  <span>รีวิวร้านนี้</span>
                </button>
              ) : (
                <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>รีวิวแล้ว</span>
                </span>
              )}

              <button
                id={`reorder-btn-${order.id}`}
                onClick={handleReorderClick}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
                title={t('reorderTooltip')}
              >
                <RotateCw className={`w-3.5 h-3.5 ${isReordering ? 'animate-spin' : ''}`} />
                <span>{isReordering ? t('reorderSuccess') : t('reorder')}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const OrdersScreen: React.FC = () => {
  const { 
    orders, 
    activeOrder, 
    setIsTrackingOpen, 
    setSelectedRestaurant, 
    setIsReviewModalOpen, 
    setReviewingOrder,
    setCart,
    setCartRestaurant,
    setAppliedCoupon,
    setIsCartOpen,
    reorderOrder,
    triggerToast,
    t
  } = useApp();

  const [filter, setFilter] = useState<FilterTab>('all');
  const [expandedOrderIds, setExpandedOrderIds] = useState<Record<string, boolean>>({});

  const toggleExpandOrder = (orderId: string, currentState: boolean) => {
    setExpandedOrderIds(prev => ({
      ...prev,
      [orderId]: !currentState,
    }));
  };

  const isOrderExpanded = (order: Order, index: number) => {
    if (expandedOrderIds[order.id] !== undefined) {
      return expandedOrderIds[order.id];
    }
    // Default active orders or the very first order to expanded
    return (activeOrder?.id === order.id && order.status !== 'delivered' && order.status !== 'cancelled') || index === 0;
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'promptpay': return 'พร้อมเพย์ QR';
      case 'card': return 'บัตรเครดิต/เดบิต';
      case 'truemoney': return 'TrueMoney Wallet';
      case 'cash': return 'เงินสดปลายทาง';
      case 'wallet': return 'Lineman Wallet';
      default: return method;
    }
  };

  const counts = {
    all: orders.length,
    active: orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length,
    completed: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  const filteredOrders = orders.filter(o => {
    if (filter === 'all') return true;
    if (filter === 'active') return o.status !== 'delivered' && o.status !== 'cancelled';
    if (filter === 'completed') return o.status === 'delivered';
    if (filter === 'cancelled') return o.status === 'cancelled';
    return true;
  });

  // Core Reorder logic: adds the items from a previous order into the active cart and opens CartDrawer
  const handleReorder = (order: Order) => {
    reorderOrder(order);
  };

  const handleReview = (order: Order) => {
    setReviewingOrder(order);
    setIsReviewModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200/60 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span>รับออเดอร์แล้ว</span>
          </span>
        );
      case 'preparing':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200/60 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            <span>กำลังปรุงอาหาร</span>
          </span>
        );
      case 'rider_assigned':
        return (
          <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200/60 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
            <Bike className="w-3 h-3 text-indigo-600" />
            <span>ไรเดอร์รับอาหารแล้ว</span>
          </span>
        );
      case 'delivering':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 rounded-full font-bold text-[10px] animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>กำลังนำส่ง</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300/60 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>จัดส่งสำเร็จ</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200/60 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>ยกเลิกแล้ว</span>
          </span>
        );
      default:
        return <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-bold text-[10px]">{status}</span>;
    }
  };

  const tabs = [
    { key: 'all' as const, label: 'ทั้งหมด', count: counts.all, icon: ShoppingBag },
    { key: 'active' as const, label: 'กำลังส่ง (Active)', count: counts.active, icon: Bike },
    { key: 'completed' as const, label: 'สำเร็จ (Completed)', count: counts.completed, icon: CheckCircle2 },
    { key: 'cancelled' as const, label: 'ยกเลิก (Cancelled)', count: counts.cancelled, icon: XCircle },
  ];

  const getEmptyStateContent = () => {
    switch (filter) {
      case 'active':
        return {
          icon: Bike,
          title: 'ไม่มีออเดอร์ที่กำลังจัดส่งในขณะนี้',
          description: 'เมื่อคุณสั่งอาหาร รายการสถานะและตำแหน่งไรเดอร์จะแสดงที่นี่แบบเรียลไทม์',
        };
      case 'completed':
        return {
          icon: CheckCircle2,
          title: 'ยังไม่มีออเดอร์ที่จัดส่งสำเร็จ',
          description: 'ประวัติคำสั่งซื้อที่ส่งมอบเรียบร้อยของคุณจะปรากฏในแท็บนี้',
        };
      case 'cancelled':
        return {
          icon: XCircle,
          title: 'ไม่มีออเดอร์ที่ถูกยกเลิก',
          description: 'ไม่มีรายการสั่งซื้อใดที่ถูกยกเลิกในประวัติของคุณ',
        };
      default:
        return {
          icon: ShoppingBag,
          title: 'ยังไม่มีรายการสั่งอาหาร',
          description: 'สั่งอาหารจานโปรดจากร้านค้าชั้นนำเพื่อเริ่มต้นสะสมคะแนนแลกส่วนลดพิเศษ',
        };
    }
  };

  const emptyState = getEmptyStateContent();
  const EmptyIcon = emptyState.icon;

  return (
    <div className="p-4 sm:p-5 space-y-4 text-xs text-slate-800">
      
      {/* Header & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-black text-slate-900">{t('ordersTitle')}</h2>
          <p className="text-[11px] text-slate-500">{t('ordersSubtitle')}</p>
        </div>
      </div>

      {/* Active Order Preparation Spotlight Card (Real-time prep countdown) */}
      {activeOrder && activeOrder.status !== 'delivered' && activeOrder.status !== 'cancelled' && (
        <div
          id="active-order-prep-spotlight"
          className="p-4 rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-md space-y-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
              </span>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200 block">
                  ออเดอร์ที่กำลังปรุงและจัดส่ง
                </span>
                <h3 className="font-bold text-white text-sm">{activeOrder.restaurantName}</h3>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                id="spotlight-track-btn"
                onClick={() => setIsTrackingOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-white text-emerald-800 font-bold text-xs hover:bg-emerald-50 flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Bike className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                <span>{t('trackRider')}</span>
              </button>
              <button
                type="button"
                id="spotlight-reorder-btn"
                onClick={() => handleReorder(activeOrder)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500/30 hover:bg-emerald-500/50 border border-white/20 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                title={t('reorderTooltip')}
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>{t('reorder')}</span>
              </button>
            </div>
          </div>

          <OrderPrepCountdownTimer
            order={activeOrder}
            averagePrepTimeMinutes={RESTAURANTS_DATA.find(r => r.id === activeOrder.restaurantId)?.averagePrepTimeMinutes}
            className="bg-white/95 text-slate-900 border-none shadow-sm"
          />
        </div>
      )}

      {/* Filter Tabs Bar */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs" role="tablist">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isSelected = filter === tab.key;
          return (
            <button
              key={tab.key}
              id={`order-filter-tab-${tab.key}`}
              role="tab"
              aria-selected={isSelected}
              onClick={() => setFilter(tab.key)}
              className={`min-h-[40px] px-3.5 py-2 rounded-2xl font-bold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-600'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isSelected
                    ? 'bg-white/25 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order, orderIndex) => {
            const isActive = activeOrder?.id === order.id && order.status !== 'delivered' && order.status !== 'cancelled';
            const isCancelled = order.status === 'cancelled';
            const isExpanded = isOrderExpanded(order, orderIndex);

            return (
              <OrderItem
                key={order.id}
                order={order}
                orderIndex={orderIndex}
                isActive={isActive}
                isCancelled={isCancelled}
                isExpanded={isExpanded}
                onToggleExpand={() => toggleExpandOrder(order.id, isExpanded)}
                onTrack={() => setIsTrackingOpen(true)}
                onReorder={handleReorder}
                onReview={handleReview}
                getStatusBadge={getStatusBadge}
                getPaymentMethodLabel={getPaymentMethodLabel}
              />
            );
          })
        ) : (
          <div className="p-10 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-2.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <EmptyIcon className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">{emptyState.title}</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">{emptyState.description}</p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-600 font-bold hover:underline cursor-pointer"
              >
                <span>ดูออเดอร์ทั้งหมด</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

