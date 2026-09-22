import React, { useMemo } from 'react';
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  Bike, 
  MapPin, 
  Check, 
  Flame, 
  Shield, 
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';

interface MerchantKitchenOrdersTabProps {
  restaurantId: string;
}

export const MerchantKitchenOrdersTab: React.FC<MerchantKitchenOrdersTabProps> = ({ restaurantId }) => {
  const { orders, updateOrderStatus, restaurantList, triggerToast } = useApp();

  const currentRestaurant = useMemo(() => {
    return restaurantList.find(r => r.id === restaurantId) || restaurantList[0];
  }, [restaurantList, restaurantId]);

  // Strictly isolated to this restaurant
  const restaurantOrders = useMemo(() => {
    return orders.filter(o => o.restaurantId === restaurantId);
  }, [orders, restaurantId]);

  // Group by status
  const pendingOrders = restaurantOrders.filter(o => o.status === 'confirmed');
  const preparingOrders = restaurantOrders.filter(o => o.status === 'preparing');
  const deliveringOrders = restaurantOrders.filter(o => o.status === 'rider_assigned' || o.status === 'delivering');
  const completedOrders = restaurantOrders.filter(o => o.status === 'delivered');

  const handleAdvanceStatus = (orderId: string, currentStatus: OrderStatus) => {
    if (currentStatus === 'confirmed') {
      updateOrderStatus(orderId, 'preparing');
      triggerToast('เริ่มทำอาหารแล้ว 🍳', `ออเดอร์ #${orderId.slice(-4)} อยู่ในสถานะกำลังปรุง`, 'info');
    } else if (currentStatus === 'preparing') {
      updateOrderStatus(orderId, 'rider_assigned');
      triggerToast('อาหารปรุงเสร็จแล้ว ✅', `แจ้งเรียกรถไรเดอร์มารับอาหารที่ร้าน ${currentRestaurant.name}`, 'success');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-5 border border-emerald-500/30 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <ChefHat className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  หน้าจอครัว & ออเดอร์สด (Kitchen Display System - KDS)
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-emerald-950">
                  {currentRestaurant.name}
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-1 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>จำกัดสิทธิ์แสดงเฉพาะออเดอร์ที่สั่งมายังร้าน {currentRestaurant.name} เท่านั้น</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>รอทำ {pendingOrders.length + preparingOrders.length} ออเดอร์</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3-Column KDS Workflow: รอรับ/เริ่มทำ ➔ กำลังปรุง ➔ ไรเดอร์กำลังมารับ/ส่งแล้ว */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Pending (รอรับคำสั่งซื้อ) */}
        <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between font-black text-xs text-amber-800 pb-2 border-b border-amber-200/60">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              1. ออเดอร์ใหม่ ({pendingOrders.length})
            </span>
            <span className="text-[10px] bg-amber-100 px-2 py-0.5 rounded-full">รอยืนยัน</span>
          </div>

          <div className="space-y-3">
            {pendingOrders.map(order => (
              <div key={order.id} className="bg-white rounded-xl p-3.5 border border-amber-300 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-900">#{order.id.slice(-6).toUpperCase()}</span>
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold">
                    {order.orderTime ? new Date(order.orderTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : 'เมื่อสักครู่'}
                  </span>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-1 flex items-start justify-between gap-2">
                      <div className="font-medium text-slate-800">
                        <span className="font-bold text-emerald-700 mr-1.5">{item.quantity}x</span>
                        {item.menuItem.name}
                        {item.spicyLevel && (
                          <div className="text-[10px] text-rose-600 flex items-center gap-0.5 mt-0.5">
                            <Flame className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                            <span>{item.spicyLevel}</span>
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-slate-900 shrink-0">฿{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleAdvanceStatus(order.id, order.status)}
                  className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ChefHat className="w-3.5 h-3.5" />
                  <span>รับออเดอร์ & เริ่มปรุงอาหาร</span>
                </button>
              </div>
            ))}

            {pendingOrders.length === 0 && (
              <div className="p-6 text-center text-slate-400 text-xs">
                ไม่มีออเดอร์ใหม่ในขณะนี้
              </div>
            )}
          </div>
        </div>

        {/* 2. Preparing (กำลังปรุง) */}
        <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between font-black text-xs text-sky-800 pb-2 border-b border-sky-200/60">
            <span className="flex items-center gap-1.5">
              <ChefHat className="w-4 h-4 text-sky-600" />
              2. กำลังปรุงในครัว ({preparingOrders.length})
            </span>
            <span className="text-[10px] bg-sky-100 px-2 py-0.5 rounded-full">เตา 1-4</span>
          </div>

          <div className="space-y-3">
            {preparingOrders.map(order => (
              <div key={order.id} className="bg-white rounded-xl p-3.5 border border-sky-300 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-900">#{order.id.slice(-6).toUpperCase()}</span>
                  <span className="text-[10px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md font-semibold animate-pulse">
                    กำลังเคี่ยวเตาถ่าน
                  </span>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-1 flex items-start justify-between gap-2">
                      <div className="font-medium text-slate-800">
                        <span className="font-bold text-sky-700 mr-1.5">{item.quantity}x</span>
                        {item.menuItem.name}
                      </div>
                      <span className="font-bold text-slate-900 shrink-0">฿{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleAdvanceStatus(order.id, order.status)}
                  className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>ปรุงเสร็จแล้ว (แจ้งไรเดอร์)</span>
                </button>
              </div>
            ))}

            {preparingOrders.length === 0 && (
              <div className="p-6 text-center text-slate-400 text-xs">
                ไม่มีออเดอร์ที่กำลังปรุง
              </div>
            )}
          </div>
        </div>

        {/* 3. Delivering / Completed */}
        <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between font-black text-xs text-emerald-800 pb-2 border-b border-emerald-200/60">
            <span className="flex items-center gap-1.5">
              <Bike className="w-4 h-4 text-emerald-600" />
              3. ไรเดอร์รับอาหารแล้ว ({deliveringOrders.length})
            </span>
            <span className="text-[10px] bg-emerald-100 px-2 py-0.5 rounded-full">จัดส่ง</span>
          </div>

          <div className="space-y-3">
            {deliveringOrders.map(order => (
              <div key={order.id} className="bg-white rounded-xl p-3.5 border border-emerald-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-900">#{order.id.slice(-6).toUpperCase()}</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                    {order.riderInfo ? `ไรเดอร์: ${order.riderInfo.name}` : 'กำลังนำส่ง'}
                  </span>
                </div>

                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                  <span>{order.items.length} รายการ (รวม ฿{order.totalAmount.toLocaleString()})</span>
                </div>

                {order.riderInfo && (
                  <div className="bg-slate-50 p-2 rounded-lg text-[11px] text-slate-600 space-y-0.5">
                    <div>ไรเดอร์: <strong>{order.riderInfo.name}</strong> ({order.riderInfo.vehiclePlate})</div>
                    <div>เบอร์ติดต่อ: {order.riderInfo.phone}</div>
                  </div>
                )}
              </div>
            ))}

            {deliveringOrders.length === 0 && (
              <div className="p-6 text-center text-slate-400 text-xs">
                ไม่มีออเดอร์ระหว่างจัดส่ง
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
