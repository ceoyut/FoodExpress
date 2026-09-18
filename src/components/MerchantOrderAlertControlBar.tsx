import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellRing, 
  BellOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  AlertCircle,
  PlusCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { merchantOrderAudio } from '../utils/merchantOrderAudio';

interface MerchantOrderAlertControlBarProps {
  isSoundMuted: boolean;
  onToggleSound: () => void;
  onTestSound: () => void;
  onSimulateIncomingOrder: () => void;
  unacknowledgedCount: number;
  onOpenPendingModal?: () => void;
}

export const MerchantOrderAlertControlBar: React.FC<MerchantOrderAlertControlBarProps> = ({
  isSoundMuted,
  onToggleSound,
  onTestSound,
  onSimulateIncomingOrder,
  unacknowledgedCount,
  onOpenPendingModal,
}) => {
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    setBrowserPermission(merchantOrderAudio.getBrowserNotificationPermission());
  }, []);

  const handleRequestPermission = async () => {
    const result = await merchantOrderAudio.requestBrowserNotificationPermission();
    setBrowserPermission(result);
    if (result === 'granted') {
      merchantOrderAudio.sendVisualBrowserNotification('🎉 เปิดการแจ้งเตือนเบราว์เซอร์สำเร็จ', {
        body: 'ระบบจะส่งการแจ้งเตือนทันทีเมื่อมีออเดอร์ใหม่เข้ามา แม้คุณกำลังเปิดแท็บอื่นอยู่',
      });
    }
  };

  return (
    <div 
      id="merchant-order-alert-control-bar"
      className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
    >
      {/* Left: System Status & Indicator */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            unacknowledgedCount > 0 
              ? 'bg-rose-500 text-white animate-bounce shadow-md' 
              : 'bg-emerald-100 text-emerald-700'
          }`}>
            {unacknowledgedCount > 0 ? (
              <BellRing className="w-5 h-5" />
            ) : (
              <Bell className="w-5 h-5" />
            )}
          </div>
          {unacknowledgedCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
              {unacknowledgedCount}
            </span>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-xs sm:text-sm font-black text-slate-900">
              ระบบแจ้งเตือนออเดอร์ใหม่แบบเรียลไทม์ (Live Order Alert System)
            </h4>
            {unacknowledgedCount > 0 ? (
              <span 
                onClick={onOpenPendingModal}
                className="cursor-pointer text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 animate-pulse hover:bg-rose-200 transition-colors"
              >
                ⚠️ มี {unacknowledgedCount} ออเดอร์รอรับทราบ
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>สแตนด์บายพร้อมรับออเดอร์</span>
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            ส่งเสียงกระดิ่ง POS ร้านอาหารวนซ้ำ + ป๊อปอัพหน้าจอ + Visual Browser Notification ทันทีที่ลูกค้าสั่งซื้อ
          </p>
        </div>
      </div>

      {/* Right: Interactive Action Controls */}
      <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
        {/* Browser Notification Status Pill / Button */}
        {browserPermission === 'granted' ? (
          <span 
            id="badge-browser-notification-granted"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
            title="การแจ้งเตือนบนหน้าต่างเบราว์เซอร์เปิดใช้งานแล้ว"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>เบราว์เซอร์แจ้งเตือนเปิดแล้ว</span>
          </span>
        ) : browserPermission === 'denied' ? (
          <span 
            id="badge-browser-notification-denied"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200"
            title="เบราว์เซอร์ปฏิเสธการแจ้งเตือน (สามารถกดอนุญาตในตั้งค่าไซต์)"
          >
            <BellOff className="w-3.5 h-3.5 text-slate-400" />
            <span>แจ้งเตือนถูกปิดในเบราว์เซอร์</span>
          </span>
        ) : browserPermission === 'unsupported' ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-500">
            <span>ไม่รองรับ Notification</span>
          </span>
        ) : (
          <button
            type="button"
            id="btn-request-browser-notification"
            onClick={handleRequestPermission}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Bell className="w-3.5 h-3.5 text-amber-100" />
            <span>เปิดแจ้งเตือนเบราว์เซอร์</span>
          </button>
        )}

        {/* Sound Chime Toggle */}
        <button
          type="button"
          id="btn-toggle-sound-alert-bar"
          onClick={onToggleSound}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
            isSoundMuted
              ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50 shadow-2xs'
          }`}
        >
          {isSoundMuted ? (
            <>
              <VolumeX className="w-3.5 h-3.5 text-rose-500" />
              <span>เสียง: ปิดอยู่</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>เสียง: เปิดแล้ว</span>
            </>
          )}
        </button>

        {/* Test Chime Sound Button */}
        <button
          type="button"
          id="btn-test-chime-sound"
          onClick={onTestSound}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
        >
          <Play className="w-3 h-3 text-slate-500" />
          <span>ทดสอบเสียง</span>
        </button>

        {/* Simulate New Customer Order Button */}
        <button
          type="button"
          id="btn-simulate-customer-order"
          onClick={onSimulateIncomingOrder}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <PlusCircle className="w-3.5 h-3.5 text-emerald-200" />
          <span>จำลองออเดอร์ใหม่</span>
        </button>
      </div>
    </div>
  );
};
