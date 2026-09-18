import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  User, 
  ShoppingBag, 
  Printer, 
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Phone,
  Sparkles,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order } from '../types';
import { merchantOrderAudio } from '../utils/merchantOrderAudio';

interface NewOrderAlertModalProps {
  order: Order | null;
  isOpen: boolean;
  onAcknowledge: (orderId: string) => void;
  onClose: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const NewOrderAlertModal: React.FC<NewOrderAlertModalProps> = ({
  order,
  isOpen,
  onAcknowledge,
  onClose,
  isMuted,
  onToggleMute,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer counting seconds since modal opened
  useEffect(() => {
    if (!isOpen) {
      setElapsedSeconds(0);
      return;
    }
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div 
        id="new-order-alert-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          id="new-order-alert-container"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-4 border-amber-400 overflow-hidden my-auto"
        >
          {/* Top Flashing Urgent Banner */}
          <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 bg-[length:200%_auto] animate-pulse px-5 py-3 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-white animate-bounce" />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-wide">
                  🚨 มีออเดอร์ใหม่เข้ามา! (New Order Placed)
                </h3>
                <p className="text-[11px] text-white/90 font-medium">
                  กรุณากดรับทราบและยืนยันออเดอร์ทันที
                </p>
              </div>
            </div>

            {/* Live elapsed timer */}
            <div className="flex items-center gap-1.5 bg-black/30 px-2.5 py-1 rounded-full text-xs font-mono font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-300 animate-spin" />
              <span>{Math.floor(elapsedSeconds / 60).toString().padStart(2, '0')}:{(elapsedSeconds % 60).toString().padStart(2, '0')} น.</span>
            </div>
          </div>

          {/* Sound State & Mute Control Bar */}
          <div className="px-5 py-2.5 bg-amber-50/90 border-b border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <span>
                {isMuted ? 'ปิดเสียงเตือนชั่วคราว' : '🔊 เสียงเตือนกำลังดังต่อเนื่องจนกว่าจะกดรับทราบ'}
              </span>
            </div>

            <button
              type="button"
              id="btn-toggle-order-alert-sound"
              onClick={onToggleMute}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isMuted
                  ? 'bg-amber-200 text-amber-900 hover:bg-amber-300'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-amber-300 shadow-2xs'
              }`}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-600" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
              <span>{isMuted ? 'เปิดเสียง' : 'ปิดเสียงเตือน'}</span>
            </button>
          </div>

          {/* Order Details Body */}
          <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Header: Order ID and Restaurant */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  เลขอ้างอิงออเดอร์
                </span>
                <span className="text-xl font-black text-slate-900 tracking-tight">
                  #{order.id}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  เวลาสั่งซื้อ
                </span>
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                  {order.createdAt || 'เมื่อสักครู่'}
                </span>
              </div>
            </div>

            {/* Customer & Delivery Address Card */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ลูกค้าผู้สั่งซื้อ:</span>
                </div>
                <span className="text-slate-600 font-medium">จัดส่งแบบด่วน (Express)</span>
              </div>
              <div className="flex items-start gap-2 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span className="line-clamp-2 leading-relaxed">
                  {order.deliveryAddress || 'กรุงเทพมหานคร'}
                </span>
              </div>
              {order.notes && (
                <div className="bg-amber-100/60 p-2 rounded-xl text-amber-900 text-[11px] border border-amber-200">
                  <strong>โน้ตพิเศษจากลูกค้า:</strong> {order.notes}
                </div>
              )}
            </div>

            {/* Ordered Items List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>รายการอาหาร ({order.items.length} รายการ)</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  จำนวนรวม: {order.items.reduce((s, i) => s + i.quantity, 0)} จาน
                </span>
              </div>

              <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden">
                {order.items.map((item, idx) => (
                  <div key={item.cartItemId || idx} className="p-3 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
                        {item.quantity}x
                      </span>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900">
                          {item.menuItem.name}
                        </h5>
                        {item.spicyLevel && (
                          <span className="text-[10px] text-rose-600 font-medium block">
                            ระดับความเผ็ด: {item.spicyLevel}
                          </span>
                        )}
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <span className="text-[10px] text-slate-500 block">
                            {Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ')}
                          </span>
                        )}
                        {item.notes && (
                          <span className="text-[10px] text-amber-700 italic block">
                            *{item.notes}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-xs font-bold text-slate-800 shrink-0">
                      ฿{((item.unitPrice || 0) * (item.quantity || 1)).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment & Settlement Summary */}
            <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-700" />
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                    วิธีชำระเงิน
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {order.paymentMethod === 'promptpay' ? 'พร้อมเพย์ QR Code' : order.paymentMethod === 'wallet' ? 'FoodExpress Wallet' : 'ชำระเงินเรียบร้อย'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                  ยอดรวมทั้งสิ้น (Total)
                </span>
                <span className="text-lg font-black text-emerald-700">
                  ฿{(order.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              id="btn-print-kitchen-slip"
              onClick={handlePrintSlip}
              className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>พิมพ์ใบรายการครัว</span>
            </button>

            <button
              type="button"
              id="btn-acknowledge-new-order"
              onClick={() => onAcknowledge(order.id)}
              className="w-full flex-1 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95 ring-2 ring-emerald-500/50"
            >
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span>รับออเดอร์ & ยืนยันรับทราบ (Acknowledge)</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
