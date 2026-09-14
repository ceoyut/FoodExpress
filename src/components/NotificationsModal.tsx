import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bell, 
  X, 
  Sparkles, 
  Tag, 
  ShoppingBag, 
  Coins, 
  CheckCheck, 
  ArrowRight 
} from 'lucide-react';
import { RESTAURANTS_DATA } from '../data/mockData';

interface NotificationsModalProps {
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ onClose }) => {
  const { 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead, 
    setSelectedRestaurant, 
    setActiveTab, 
    setIsTrackingOpen 
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'promo' | 'order' | 'reward'>('all');

  const filtered = notifications.filter(n => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const handleNotificationClick = (item: any) => {
    markNotificationRead(item.id);
    if (item.targetId && item.targetId.startsWith('rest_')) {
      const rest = RESTAURANTS_DATA.find(r => r.id === item.targetId);
      if (rest) {
        setSelectedRestaurant(rest);
        onClose();
      }
    } else if (item.type === 'reward') {
      setActiveTab('rewards');
      onClose();
    } else if (item.type === 'order') {
      setIsTrackingOpen(true);
      onClose();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'promo': return <Tag className="w-4 h-4 text-rose-500" />;
      case 'order': return <ShoppingBag className="w-4 h-4 text-emerald-500" />;
      case 'reward': return <Coins className="w-4 h-4 text-amber-500" />;
      default: return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col animate-in slide-in-from-bottom-5 text-slate-800">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-150 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">การแจ้งเตือน & โปรโมชั่นเฉพาะคุณ</h3>
              <p className="text-[10px] text-slate-500">ข้อเสนอสุดพิเศษตามความชอบของคุณ</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="mark-all-read-btn"
              onClick={markAllNotificationsRead}
              className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold p-1 transition-colors flex items-center gap-1"
              title="อ่านทั้งหมด"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">อ่านทั้งหมด</span>
            </button>

            <button
              id="close-notifications-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200/80 text-slate-700 flex items-center justify-center hover:bg-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="px-4 py-2 bg-white border-b border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
          {[
            { key: 'all', label: 'ทั้งหมด' },
            { key: 'promo', label: '🔥 โปรโมชั่นเฉพาะคุณ' },
            { key: 'order', label: '🛵 สถานะออเดอร์' },
            { key: 'reward', label: '🎁 สิทธิประโยชน์' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as any)}
              className={`px-3 py-1 rounded-full font-medium whitespace-nowrap transition-colors ${
                filter === f.key
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1 text-xs">
          {filtered.length > 0 ? (
            filtered.map(item => (
              <div
                key={item.id}
                id={`notification-item-${item.id}`}
                onClick={() => handleNotificationClick(item)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-3 ${
                  !item.read
                    ? 'bg-emerald-50/40 border-emerald-200 shadow-xs'
                    : 'bg-white border-slate-150 hover:bg-slate-50'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4 className="font-bold text-slate-900 text-xs line-clamp-1">
                      {item.title}
                    </h4>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    )}
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                    {item.body}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100/80 text-[10px] text-slate-400">
                    <span>{item.timestamp}</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-0.5 hover:underline">
                      แตะเพื่อดูรายละเอียด <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <Bell className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs">ไม่มีการแจ้งเตือนในหมวดหมู่นี้</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
