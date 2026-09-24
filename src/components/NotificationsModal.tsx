import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bell, 
  X, 
  Sparkles, 
  Tag, 
  ShoppingBag, 
  Coins, 
  CheckCheck, 
  ArrowRight,
  User,
  Store,
  Bike,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Clock,
  Trash2,
  ExternalLink,
  DollarSign,
  CloudRain,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { RESTAURANTS_DATA } from '../data/mockData';
import { NotificationItem, NotificationRole, NotificationType } from '../types';

interface NotificationsModalProps {
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ onClose }) => {
  const { 
    notifications, 
    markNotificationRead, 
    markRoleNotificationsRead,
    deleteNotification,
    setSelectedRestaurant, 
    activeTab,
    setActiveTab, 
    setIsTrackingOpen,
    currentActiveRole,
    addNotification,
    triggerToast
  } = useApp();

  // Role filter: defaults to 'auto' (context-aware matching current active app screen)
  const [roleFilter, setRoleFilter] = useState<NotificationRole | 'auto' | 'all'>('auto');
  const [typeFilter, setTypeFilter] = useState<'all' | 'unread' | 'order_job' | 'financial' | 'system_safety'>('all');

  // Resolved effective role for 'auto'
  const effectiveRole: NotificationRole | 'all' = roleFilter === 'auto' ? currentActiveRole : roleFilter;

  // Unread counts per role
  const unreadStats = useMemo(() => {
    return {
      all: notifications.filter(n => !n.read).length,
      customer: notifications.filter(n => !n.read && (n.targetRole === 'customer' || n.targetRole === 'all')).length,
      merchant: notifications.filter(n => !n.read && (n.targetRole === 'merchant' || n.targetRole === 'all')).length,
      rider: notifications.filter(n => !n.read && (n.targetRole === 'rider' || n.targetRole === 'all')).length,
      admin: notifications.filter(n => !n.read && (n.targetRole === 'admin' || n.targetRole === 'all')).length,
    };
  }, [notifications]);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(item => {
      // 1. Role Filter
      if (effectiveRole !== 'all') {
        if (item.targetRole !== effectiveRole && item.targetRole !== 'all') {
          return false;
        }
      }

      // 2. Type / Status Filter
      if (typeFilter === 'unread') {
        return !item.read;
      }
      if (typeFilter === 'order_job') {
        return item.type === 'order' || item.type === 'job' || item.type === 'promo';
      }
      if (typeFilter === 'financial') {
        return item.type === 'financial' || item.type === 'reward';
      }
      if (typeFilter === 'system_safety') {
        return item.type === 'system' || item.type === 'safety';
      }

      return true;
    });
  }, [notifications, effectiveRole, typeFilter]);

  const handleNotificationAction = (item: NotificationItem) => {
    markNotificationRead(item.id);

    if (item.actionTab) {
      setActiveTab(item.actionTab);
      triggerToast('นำทางสำเร็จ', `เปิดไปยังหน้า: ${item.actionText || 'ข้อมูลที่เกี่ยวข้อง'}`, 'info');
      onClose();
      return;
    }

    if (item.targetId && item.targetId.startsWith('rest_')) {
      const rest = RESTAURANTS_DATA.find(r => r.id === item.targetId);
      if (rest) {
        setSelectedRestaurant(rest);
        onClose();
        return;
      }
    }

    if (item.type === 'order') {
      if (item.targetRole === 'customer') {
        setIsTrackingOpen(true);
      } else if (item.targetRole === 'merchant') {
        setActiveTab('pos_settlement');
      } else if (item.targetRole === 'rider') {
        setActiveTab('rider_hub');
      }
      onClose();
    } else if (item.type === 'reward') {
      setActiveTab('rewards');
      onClose();
    }
  };

  const getRoleBadge = (role: NotificationRole) => {
    switch (role) {
      case 'customer':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            <User className="w-2.5 h-2.5" />
            ลูกค้า
          </span>
        );
      case 'merchant':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            <Store className="w-2.5 h-2.5" />
            ร้านค้า POS
          </span>
        );
      case 'rider':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
            <Bike className="w-2.5 h-2.5" />
            ไรเดอร์
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
            <ShieldCheck className="w-2.5 h-2.5" />
            แอดมิน HQ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            ทั่วไป
          </span>
        );
    }
  };

  const getTypeIcon = (type: NotificationType, priority?: string) => {
    if (priority === 'urgent') {
      return <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />;
    }
    switch (type) {
      case 'promo':
        return <Tag className="w-4 h-4 text-rose-500" />;
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-emerald-600" />;
      case 'reward':
        return <Coins className="w-4 h-4 text-amber-500" />;
      case 'financial':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'job':
        return <Bike className="w-4 h-4 text-sky-600" />;
      case 'safety':
        return <CloudRain className="w-4 h-4 text-sky-600" />;
      case 'system':
      default:
        return <Bell className="w-4 h-4 text-indigo-500" />;
    }
  };

  // Quick simulation helpers for user testing
  const simulateRoleAlert = (role: NotificationRole) => {
    if (role === 'customer') {
      addNotification({
        title: '🛵 ร้านค้ารับออเดอร์แล้ว! กำลังปรุงอาหาร',
        body: 'ร้าน กะเพราถาดโบราณ ได้รับออเดอร์แล้ว อาหารจะพร้อมในอีกประมาณ 10 นาที',
        type: 'order',
        targetRole: 'customer',
        priority: 'normal',
        badge: 'สถานะออเดอร์',
        actionText: 'ติดตามออเดอร์',
        actionTab: 'orders',
      });
      triggerToast('สร้างแจ้งเตือนลูกค้าสำเร็จ', 'แจ้งเตือนถูกส่งเข้ากล่องข้อความลูกค้า', 'success');
    } else if (role === 'merchant') {
      addNotification({
        title: '🔔 ออเดอร์ใหม่เข้าหน้าร้าน! #FX-9932 (ลูกค้าสั่งอาหาร)',
        body: 'ข้าวผัดต้มยำกุ้ง 1 จาน + ชามะนาว 1 แก้ว รวม ฿185 กรุณากดรับออเดอร์',
        type: 'order',
        targetRole: 'merchant',
        priority: 'urgent',
        badge: 'ออเดอร์ POS',
        actionText: 'เปิดดูออเดอร์',
        actionTab: 'pos_settlement',
      });
      triggerToast('สร้างแจ้งเตือนร้านค้าสำเร็จ', 'แจ้งเตือนถูกส่งเข้ากล่องข้อความร้านค้า', 'success');
    } else if (role === 'rider') {
      addNotification({
        title: '⚡ มีออเดอร์ใหม่เด้งเข้า: ซอยสุขุมวิท 55 (ค่ารอบ ฿48)',
        body: 'ระยะทางรวม 2.4 กม. ร้านกานดาร้อยหม้อ ➔ คอนโดทองหล่อ พร้อมสิทธิ์รับงานทันที',
        type: 'job',
        targetRole: 'rider',
        priority: 'high',
        badge: 'งานใหม่',
        actionText: 'เปิดคิวรับงาน',
        actionTab: 'rider_hub',
      });
      triggerToast('สร้างแจ้งเตือนไรเดอร์สำเร็จ', 'แจ้งเตือนถูกส่งเข้ากล่องข้อความไรเดอร์', 'success');
    } else if (role === 'admin') {
      addNotification({
        title: '🛡️ รายงานระบบ HQ: ตรวจพบธุรกรรมยอดเงินสูง ฿25,000',
        body: 'การชำระเงิน B2B PromptPay จากร้านค้าพาร์ทเนอร์ ผ่านการตรวจสอบระบบความปลอดภัยแล้ว',
        type: 'financial',
        targetRole: 'admin',
        priority: 'normal',
        badge: 'ระบบ HQ',
        actionText: 'เปิดศูนย์แอดมิน',
        actionTab: 'admin_portal',
      });
      triggerToast('สร้างแจ้งเตือนแอดมินสำเร็จ', 'แจ้งเตือนถูกส่งเข้ากล่องข้อความแอดมิน HQ', 'success');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-5 text-slate-800 cursor-default"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header with Active Context Label */}
        <div className="p-4 border-b border-slate-150 bg-gradient-to-r from-slate-900 to-slate-850 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-emerald-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-white">ศูนย์การแจ้งเตือน (Notifications)</h3>
                <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/40">
                  Role-Isolated
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                แยกกล่องข้อความตามสิทธิ์ & ป้องกันข้อมูลรั่วไหลระหว่างบทบาท
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="mark-role-read-btn"
              onClick={() => markRoleNotificationsRead(effectiveRole)}
              className="text-[11px] text-slate-200 hover:text-white font-bold px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1 cursor-pointer"
              title="อ่านทั้งหมดในมุมมองนี้"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">อ่านแล้ว</span>
            </button>

            <button
              id="close-notifications-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 1. Main Role Filter Tabs (แยกสิทธิ์ชัดเจน 4 บทบาท) */}
        <div className="p-2.5 bg-slate-100 border-b border-slate-200">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5 px-1 flex items-center justify-between">
            <span>เลือกมุมมองบทบาท (Role View):</span>
            <span className="text-emerald-700 font-bold lowercase">
              โหมดปัจจุบัน: {currentActiveRole === 'customer' ? '👤 ลูกค้า' : currentActiveRole === 'merchant' ? '🏪 ร้านค้า' : currentActiveRole === 'rider' ? '🛵 ไรเดอร์' : '🛡️ แอดมิน'}
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
            {/* Auto (Context-Aware) */}
            <button
              id="role-filter-auto-btn"
              onClick={() => setRoleFilter('auto')}
              className={`px-2 py-1.5 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
                roleFilter === 'auto'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>อัตโนมัติ</span>
            </button>

            {/* Customer */}
            <button
              id="role-filter-customer-btn"
              onClick={() => setRoleFilter('customer')}
              className={`px-2 py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                roleFilter === 'customer'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80'
              }`}
            >
              <User className="w-3 h-3 text-emerald-600" />
              <span>ลูกค้า</span>
              {unreadStats.customer > 0 && (
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-1 rounded-full">
                  {unreadStats.customer}
                </span>
              )}
            </button>

            {/* Merchant */}
            <button
              id="role-filter-merchant-btn"
              onClick={() => setRoleFilter('merchant')}
              className={`px-2 py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                roleFilter === 'merchant'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80'
              }`}
            >
              <Store className="w-3 h-3 text-amber-600" />
              <span>ร้านค้า</span>
              {unreadStats.merchant > 0 && (
                <span className="text-[9px] bg-amber-100 text-amber-900 font-black px-1 rounded-full">
                  {unreadStats.merchant}
                </span>
              )}
            </button>

            {/* Rider */}
            <button
              id="role-filter-rider-btn"
              onClick={() => setRoleFilter('rider')}
              className={`px-2 py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                roleFilter === 'rider'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80'
              }`}
            >
              <Bike className="w-3 h-3 text-sky-600" />
              <span>ไรเดอร์</span>
              {unreadStats.rider > 0 && (
                <span className="text-[9px] bg-sky-100 text-sky-900 font-black px-1 rounded-full">
                  {unreadStats.rider}
                </span>
              )}
            </button>

            {/* Admin */}
            <button
              id="role-filter-admin-btn"
              onClick={() => setRoleFilter('admin')}
              className={`px-2 py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                roleFilter === 'admin'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80'
              }`}
            >
              <ShieldCheck className="w-3 h-3 text-rose-600" />
              <span>แอดมิน</span>
              {unreadStats.admin > 0 && (
                <span className="text-[9px] bg-rose-100 text-rose-900 font-black px-1 rounded-full">
                  {unreadStats.admin}
                </span>
              )}
            </button>

            {/* All */}
            <button
              id="role-filter-all-btn"
              onClick={() => setRoleFilter('all')}
              className={`px-2 py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                roleFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80'
              }`}
            >
              <span>รวมทุกฝ่าย</span>
              {unreadStats.all > 0 && (
                <span className="text-[9px] bg-slate-200 text-slate-800 font-black px-1 rounded-full">
                  {unreadStats.all}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 2. Sub-Filter Category Pills */}
        <div className="px-4 py-2 bg-white border-b border-slate-150 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'unread', label: '🔴 ยังไม่อ่าน' },
            { id: 'order_job', label: '📦 ออเดอร์ & งาน' },
            { id: 'financial', label: '💰 การเงิน & แต้ม' },
            { id: 'system_safety', label: '🛡️ ระบบ & ความปลอดภัย' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setTypeFilter(f.id as any)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                typeFilter === f.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* 3. Notifications List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1 text-xs">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map(item => (
              <div
                key={item.id}
                id={`notification-item-${item.id}`}
                className={`p-3.5 rounded-2xl border transition-all flex gap-3 group relative ${
                  !item.read
                    ? item.priority === 'urgent'
                      ? 'bg-rose-50/60 border-rose-300 ring-1 ring-rose-200'
                      : 'bg-emerald-50/40 border-emerald-200 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50/80'
                }`}
              >
                {/* Icon Container */}
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                  item.priority === 'urgent' 
                    ? 'bg-rose-100 border border-rose-300 text-rose-600'
                    : 'bg-white border border-slate-200 text-slate-700'
                }`}>
                  {getTypeIcon(item.type, item.priority)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1 flex-wrap">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {getRoleBadge(item.targetRole)}
                      {item.badge && (
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded-md">
                          {item.badge}
                        </span>
                      )}
                      {item.priority === 'urgent' && (
                        <span className="text-[9px] font-black text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded uppercase animate-pulse">
                          ด่วนที่สุด
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!item.read && (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="ยังไม่อ่าน" />
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(item.id);
                        }}
                        className="text-slate-300 hover:text-rose-500 p-0.5 rounded transition-colors cursor-pointer"
                        title="ลบการแจ้งเตือน"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-black text-slate-900 text-xs leading-snug mb-1">
                    {item.title}
                  </h4>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {item.body}
                  </p>

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100/90 text-[10px]">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{item.timestamp}</span>
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      id={`action-notif-btn-${item.id}`}
                      onClick={() => handleNotificationAction(item)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs active:scale-95"
                    >
                      <span>{item.actionText || 'ดูรายละเอียด'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-slate-400 space-y-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <Bell className="w-10 h-10 mx-auto text-slate-300" />
              <h4 className="font-bold text-slate-700 text-xs">ไม่มีการแจ้งเตือนในหมวดหมู่นี้</h4>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                เมื่อมีออเดอร์ใหม่ สถานะจัดส่ง หรือรายงานการเงินของบทบาทนี้ ระบบจะแจ้งเตือนที่นี่ทันที
              </p>
            </div>
          )}
        </div>

        {/* 4. Quick Simulation Bar (ให้ทดสอบสลับแจ้งเตือนได้ทันที) */}
        <div className="p-3 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              ทดสอบส่งการแจ้งเตือนจำลอง (Live Simulation):
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button
              type="button"
              id="sim-customer-notif-btn"
              onClick={() => simulateRoleAlert('customer')}
              className="py-1 px-2 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-[10px] font-bold text-slate-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <span>+ ลูกค้า 👤</span>
            </button>

            <button
              type="button"
              id="sim-merchant-notif-btn"
              onClick={() => simulateRoleAlert('merchant')}
              className="py-1 px-2 rounded-lg bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-[10px] font-bold text-slate-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <span>+ ร้านค้า 🏪</span>
            </button>

            <button
              type="button"
              id="sim-rider-notif-btn"
              onClick={() => simulateRoleAlert('rider')}
              className="py-1 px-2 rounded-lg bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-[10px] font-bold text-slate-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <span>+ ไรเดอร์ 🛵</span>
            </button>

            <button
              type="button"
              id="sim-admin-notif-btn"
              onClick={() => simulateRoleAlert('admin')}
              className="py-1 px-2 rounded-lg bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-[10px] font-bold text-slate-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <span>+ แอดมิน 🛡️</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
