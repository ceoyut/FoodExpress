import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RESTAURANTS_DATA } from '../data/mockData';
import { ROLES_RBAC_CONFIG, RBAC_STANDARD_MATRIX } from '../data/adminData';
import { 
  ShieldCheck, 
  Activity, 
  Store, 
  Bike, 
  DollarSign, 
  Headphones, 
  Settings, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  MapPin, 
  Layers, 
  ArrowUpRight, 
  Sliders, 
  UserCheck, 
  FileText,
  CreditCard,
  Ban,
  Clock,
  Sparkles,
  PhoneCall,
  Lock,
  Info,
  Eye,
  HelpCircle,
  X,
  ShieldAlert,
  KeyRound,
  Check
} from 'lucide-react';
import { AdminRole, OrderStatus } from '../types';

export const AdminHQScreen: React.FC = () => {
  const { 
    orders, 
    riderApplications, 
    updateApplicationStatus, 
    activeRider,
    merchantSettlements,
    approveAndTransferPayout,
    disputeTickets,
    resolveDisputeTicket,
    reassignOrderRider,
    cancelOrderByAdmin,
    platformConfig,
    updatePlatformConfig,
    adminRole,
    setAdminRole,
    triggerToast,
    deliveryZones
  } = useApp();

  const restaurants = RESTAURANTS_DATA;

  const [activeTab, setActiveTab] = useState<'live_ops' | 'merchants' | 'riders' | 'finance' | 'disputes' | 'settings'>('live_ops');
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);
  const [isRbacModalOpen, setIsRbacModalOpen] = useState<boolean>(false);

  // Active Role RBAC Configuration
  const currentRoleConfig = ROLES_RBAC_CONFIG[adminRole] || ROLES_RBAC_CONFIG.super_admin;

  // Permission Guard Helper
  const verifyPermission = (hasPermission: boolean, requiredRoleName: string, actionDescription: string): boolean => {
    if (!hasPermission) {
      triggerToast(
        'สิทธิ์การใช้งานถูกจำกัด 🔒',
        `บทบาทปัจจุบัน (${currentRoleConfig.badgeTitle}) ไม่มีสิทธิ์ "${actionDescription}" — สงวนสิทธิ์สำหรับ ${requiredRoleName}`,
        'warning'
      );
      return false;
    }
    return true;
  };

  // High Level Platform Financial & Operational Metrics
  const totalCompletedOrders = orders.filter(o => o.status === 'delivered').length;
  const todayGmv = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
  const platformTakeRatePct = platformConfig.defaultGpPercent;
  const estimatedNetRevenue = Math.round(todayGmv * (platformTakeRatePct / 100));
  const openDisputeCount = disputeTickets.filter(t => t.status === 'open' || t.status === 'investigating').length;
  const pendingRiderApps = riderApplications.filter(a => a.status === 'pending_review').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      
      {/* Top Super Admin Header & RBAC Switcher */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-20 px-4 py-3 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${
              adminRole === 'super_admin' ? 'from-amber-500 to-rose-600 shadow-amber-500/20' :
              adminRole === 'operations' ? 'from-emerald-500 to-teal-600 shadow-emerald-500/20' :
              adminRole === 'finance' ? 'from-blue-600 to-indigo-600 shadow-blue-500/20' :
              'from-rose-500 to-pink-600 shadow-rose-500/20'
            } flex items-center justify-center text-white shadow-lg transition-all`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                  FoodExpress Platform HQ
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${currentRoleConfig.badgeBg} ${currentRoleConfig.badgeText} ${currentRoleConfig.badgeBorder} flex items-center gap-1 transition-all`}>
                  <span>{currentRoleConfig.roleIcon}</span>
                  <span>{currentRoleConfig.badgeTitle}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                ศูนย์บัญชาการหลังบ้าน • บทบาทปัจจุบัน: <strong className={currentRoleConfig.badgeText}>{currentRoleConfig.thaiTitle}</strong>
              </p>
            </div>
          </div>

          {/* Role-Based Access Control (RBAC) Selector & Matrix Guide Trigger */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsRbacModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="เปิดดูตารางเปรียบเทียบสิทธิ์ตามมาตรฐานอุตสาหกรรม"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>มาตรฐานสิทธิ์ 4 ฝ่าย</span>
            </button>

            <div className="flex items-center gap-1.5 bg-slate-950/90 p-1 rounded-xl border border-slate-800 text-xs">
              <span className="text-[11px] font-bold text-slate-400 px-2 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-500" /> สลับสิทธิ์:
              </span>
              {(['super_admin', 'operations', 'finance', 'support'] as AdminRole[]).map((role) => {
                const cfg = ROLES_RBAC_CONFIG[role];
                const isSelected = adminRole === role;
                const activeColorClasses: Record<AdminRole, string> = {
                  super_admin: 'bg-amber-500 text-slate-950 font-black shadow-xs',
                  operations: 'bg-emerald-500 text-slate-950 font-black shadow-xs',
                  finance: 'bg-blue-600 text-white font-black shadow-xs',
                  support: 'bg-rose-500 text-white font-black shadow-xs'
                };
                return (
                  <button
                    key={role}
                    onClick={() => {
                      setAdminRole(role);
                      triggerToast('สลับระดับสิทธิ์แอดมิน 🛡️', `คุณกำลังทำงานในสิทธิ์: ${cfg.title}`, 'info');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? activeColorClasses[role]
                        : 'text-slate-400 hover:text-slate-200 font-semibold'
                    }`}
                  >
                    <span>{cfg.roleIcon}</span>
                    <span>{role === 'super_admin' ? 'Super Admin' : role === 'operations' ? 'Ops' : role === 'finance' ? 'Finance' : 'Support'}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-5 space-y-5">
        
        {/* ACTIVE ROLE PERMISSION & SCOPE CONTEXT BANNER */}
        <div className={`rounded-2xl bg-gradient-to-r ${currentRoleConfig.accentBg} border ${currentRoleConfig.accentBorder} p-4 sm:p-5 shadow-lg transition-all`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-3 mb-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 shadow-xs">
                {currentRoleConfig.roleIcon}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-white">
                    {currentRoleConfig.title}
                  </h2>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${currentRoleConfig.badgeBg} ${currentRoleConfig.badgeText} ${currentRoleConfig.badgeBorder}`}>
                    สังกัด: {currentRoleConfig.department}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {currentRoleConfig.description}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsRbacModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5 shrink-0 self-start md:self-center"
            >
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>ตารางเปรียบเทียบสิทธิ์ 4 บทบาท</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Allowed Scope */}
            <div className="bg-slate-950/70 p-3 rounded-xl border border-emerald-500/20 space-y-1.5">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5 pb-1 border-b border-slate-800">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>ขอบเขตอำนาจหน้าที่ของบทบาทนี้ (Authorized Capabilities):</span>
              </div>
              <ul className="space-y-1 text-slate-300">
                {currentRoleConfig.allowedActions.map((act, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[11px]">
                    <span className="text-emerald-400 mt-0.5 font-bold">✓</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Restricted Scope */}
            <div className="bg-slate-950/70 p-3 rounded-xl border border-rose-500/20 space-y-1.5">
              <div className="font-bold text-rose-400 flex items-center gap-1.5 pb-1 border-b border-slate-800">
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span>ข้อจำกัดสิทธิ์ตามมาตรฐาน (Policy & Separation of Duties):</span>
              </div>
              <ul className="space-y-1 text-slate-400">
                {currentRoleConfig.restrictedActions.map((act, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[11px]">
                    <span className="text-rose-400 mt-0.5 font-bold">✕</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Real-time KPI Stats Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>GMV ยอดขายรวมวันนี้</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-black text-white font-mono">
              ฿{(todayGmv ?? 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+18.4% เทียบสัปดาห์ก่อน</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>รายได้สุทธิระบบ (GP {platformConfig?.defaultGpPercent ?? 25}%)</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-black text-amber-400 font-mono">
              ฿{(estimatedNetRevenue ?? 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400">
              หักค่าเกตเวย์ 1.5% แล้ว
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>คำสั่งซื้อสดในระบบ</span>
              <Activity className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-xl font-black text-white font-mono">
              {orders.length} <span className="text-xs font-normal text-slate-400">ออเดอร์</span>
            </div>
            <div className="text-[10px] text-sky-400">
              ส่งเสร็จแล้ว {totalCompletedOrders} รายการ
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>ข้อพิพาท & ใบสมัครรอตรวจ</span>
              <AlertCircle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl font-black text-rose-400 font-mono">
              {openDisputeCount + pendingRiderApps} <span className="text-xs font-normal text-slate-400">เรื่อง</span>
            </div>
            <div className="text-[10px] text-slate-400">
              ข้อพิพาท {openDisputeCount} / ไรเดอร์ใหม่ {pendingRiderApps}
            </div>
          </div>

        </div>

        {/* Navigation Tabs with Dynamic RBAC Indicators */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('live_ops')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
              activeTab === 'live_ops'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>1. จัดการออเดอร์สด & Dispatch</span>
            {adminRole === 'operations' ? (
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black">
                หน้าที่หลัก
              </span>
            ) : adminRole === 'super_admin' ? (
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black">
                Full
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[9px]">
                Read-only
              </span>
            )}
            {orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('merchants')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
              activeTab === 'merchants'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>2. ร้านค้า & อัตรา GP ({restaurants.length})</span>
            {adminRole === 'super_admin' ? (
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black">
                Full
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[9px]">
                Read-only
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('riders')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
              activeTab === 'riders'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>3. กองยานไรเดอร์ & คัดกรอง ({riderApplications.length})</span>
            {adminRole === 'operations' ? (
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black">
                หน้าที่หลัก
              </span>
            ) : adminRole === 'super_admin' ? (
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black">
                Full
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[9px]">
                Read-only
              </span>
            )}
            {pendingRiderApps > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-extrabold">
                {pendingRiderApps}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('finance')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
              activeTab === 'finance'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>4. การเงินตัดรอบ EOD</span>
            {adminRole === 'finance' ? (
              <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] font-black">
                หน้าที่หลัก
              </span>
            ) : adminRole === 'super_admin' ? (
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black">
                Full
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[9px]">
                Read-only
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('disputes')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
              activeTab === 'disputes'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>5. ข้อพิพาท & คืนเงิน ({disputeTickets.length})</span>
            {adminRole === 'support' ? (
              <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] font-black">
                หน้าที่หลัก
              </span>
            ) : adminRole === 'super_admin' ? (
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black">
                Full
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[9px]">
                Read-only
              </span>
            )}
            {openDisputeCount > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-extrabold">
                {openDisputeCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>6. ตั้งค่าระบบแพลตฟอร์ม</span>
            {adminRole === 'super_admin' ? (
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black">
                Full Access
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] font-bold flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> ล็อก
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Live Operations & Dispatch Intervention */}
        {activeTab === 'live_ops' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  ศูนย์ควบคุมออเดอร์สด (Live Dispatch & Emergency Override)
                </h3>
                <p className="text-xs text-slate-400">
                  มอนิเตอร์สถานะออเดอร์ทุกขั้นตอน สามารถแทรกแซง สลับไรเดอร์ หรือยกเลิกคำสั่งซื้อฉุกเฉินได้ทันที
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  LIVE DISPATCH ENGINE
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {orders.map((order) => {
                const statusBadge: Record<OrderStatus, { text: string; bg: string; textCol: string }> = {
                  confirmed: { text: 'ร้านได้รับแล้ว', bg: 'bg-blue-500/10 border-blue-500/30', textCol: 'text-blue-400' },
                  preparing: { text: 'กำลังปรุงอาหาร', bg: 'bg-amber-500/10 border-amber-500/30', textCol: 'text-amber-400' },
                  rider_assigned: { text: 'ไรเดอร์รับงานแล้ว', bg: 'bg-indigo-500/10 border-indigo-500/30', textCol: 'text-indigo-400' },
                  delivering: { text: 'กำลังนำส่ง', bg: 'bg-sky-500/10 border-sky-500/30', textCol: 'text-sky-400' },
                  delivered: { text: 'ส่งมอบสำเร็จ', bg: 'bg-emerald-500/10 border-emerald-500/30', textCol: 'text-emerald-400' },
                  cancelled: { text: 'ยกเลิกแล้ว', bg: 'bg-rose-500/10 border-rose-500/30', textCol: 'text-rose-400' },
                };
                const badge = statusBadge[order.status] || { text: order.status, bg: 'bg-slate-800', textCol: 'text-slate-300' };

                return (
                  <div 
                    key={order.id} 
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-all"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                          {order.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg} ${badge.textCol}`}>
                          {badge.text}
                        </span>
                        <span className="text-xs text-slate-400">
                          {order.createdAt}
                        </span>
                      </div>

                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{order.restaurantName}</span>
                        <span className="text-slate-500">➔</span>
                        <span className="text-slate-300">ลูกค้า: คุณ{order.customerName || 'สมชาย'}</span>
                      </div>

                      <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span>ยอดรวม: <strong className="text-white font-mono">฿{order.total}</strong> ({order.paymentMethod})</span>
                        <span>ไรเดอร์: <strong className="text-sky-400">{order.rider?.name || 'กำลังจัดสรร'}</strong> ({order.rider?.phone || '-'})</span>
                        <span>จุดส่ง: {order.deliveryAddress}</span>
                      </div>
                    </div>

                    {/* Admin Action Buttons with RBAC enforcement */}
                    <div className="flex items-center gap-2 shrink-0">
                      {order.status !== 'delivered' && order.status !== 'cancelled' ? (
                        <>
                          <button
                            onClick={() => {
                              if (!verifyPermission(
                                currentRoleConfig.permissions.canDispatchAndCancelOrders,
                                'ฝ่าย Operations (Ops) หรือ Super Admin',
                                'สลับมอบหมายงานให้ไรเดอร์'
                              )) return;
                              reassignOrderRider(order.id, 'สมหวัง สายซิ่ง (HQ Re-assigned)');
                            }}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all ${
                              currentRoleConfig.permissions.canDispatchAndCancelOrders
                                ? 'bg-slate-800 hover:bg-slate-700 text-sky-400 border-slate-700 cursor-pointer shadow-xs'
                                : 'bg-slate-900/60 text-slate-500 border-slate-800 border-dashed cursor-not-allowed opacity-60'
                            }`}
                            title={currentRoleConfig.permissions.canDispatchAndCancelOrders ? 'สลับมอบหมายงานให้ไรเดอร์สมหวัง' : 'จำกัดสิทธิ์เฉพาะฝ่าย Operations (Ops) หรือ Super Admin'}
                          >
                            {currentRoleConfig.permissions.canDispatchAndCancelOrders ? (
                              <Bike className="w-3.5 h-3.5" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-slate-500" />
                            )}
                            <span>{currentRoleConfig.permissions.canDispatchAndCancelOrders ? 'สลับไรเดอร์' : 'สลับไรเดอร์ 🔒'}</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              if (!verifyPermission(
                                currentRoleConfig.permissions.canDispatchAndCancelOrders,
                                'ฝ่าย Operations (Ops) หรือ Super Admin',
                                'ยกเลิกคำสั่งซื้อฉุกเฉิน'
                              )) return;
                              cancelOrderByAdmin(order.id, 'ร้านค้าวัตถุดิบหมดกะทันหัน');
                            }}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all ${
                              currentRoleConfig.permissions.canDispatchAndCancelOrders
                                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30 cursor-pointer shadow-xs'
                                : 'bg-slate-900/60 text-slate-500 border-slate-800 border-dashed cursor-not-allowed opacity-60'
                            }`}
                            title={currentRoleConfig.permissions.canDispatchAndCancelOrders ? 'ยกเลิกออเดอร์และคืนเงินลูกค้า' : 'จำกัดสิทธิ์เฉพาะฝ่าย Operations (Ops) หรือ Super Admin'}
                          >
                            {currentRoleConfig.permissions.canDispatchAndCancelOrders ? (
                              <Ban className="w-3.5 h-3.5" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-slate-500" />
                            )}
                            <span>{currentRoleConfig.permissions.canDispatchAndCancelOrders ? 'ยกเลิกออเดอร์' : 'ยกเลิก 🔒'}</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          สิ้นสุดกระบวนการ
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Merchant Management & GP Matrix */}
        {activeTab === 'merchants' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Store className="w-4 h-4 text-amber-400" />
                  รายชื่อร้านค้าในระบบ & สัญญากำหนดอัตรา GP (Merchant Portfolio)
                </h3>
                <p className="text-xs text-slate-400">
                  ตรวจสอบสถานะจดทะเบียน DBD, การรับรองสุขอนามัย และกำหนดอัตราส่วนแบ่งกำไร (Commission Tier)
                </p>
              </div>
              <button
                onClick={() => {
                  if (!verifyPermission(
                    currentRoleConfig.permissions.canEditMerchantGP,
                    'Super Admin',
                    'สร้างสัญญาและกำหนดอัตราส่วนแบ่ง GP ร้านค้า'
                  )) return;
                  triggerToast('สร้างสัญญาใหม่', 'เปิดแบบฟอร์มร่างสัญญา GP ร้านค้าพันธมิตร', 'info');
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                  currentRoleConfig.permissions.canEditMerchantGP
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-xs'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed opacity-75'
                }`}
                title={currentRoleConfig.permissions.canEditMerchantGP ? 'เพิ่มร้านค้าพันธมิตรใหม่' : 'สงวนสิทธิ์เฉพาะ Super Admin'}
              >
                {currentRoleConfig.permissions.canEditMerchantGP ? '+ เพิ่มร้านค้าพันธมิตร' : '🔒 เพิ่มร้านค้า (เฉพาะ Super Admin)'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {restaurants.map(rest => (
                <div key={rest.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={rest.logoImage} 
                        alt={rest.name} 
                        className="w-12 h-12 rounded-xl object-cover border border-slate-800" 
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white">{rest.name}</h4>
                        <p className="text-xs text-slate-400">{rest.category} • {rest.address}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      DBD รับรองแล้ว
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">อัตราค่าคอมมิชชั่น GP:</span>
                    <span className="font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                      {rest.id === 'rest_kanda_roimor' ? '25%' : '30%'} (Standard)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>เรตติ้งเฉลี่ย: ⭐ {rest.rating} ({rest.reviewCount} รีวิว)</span>
                    <button 
                      onClick={() => triggerToast('ตรวจสอบเมนู', `กำลังเปิดตรวจสอบเมนูอาหารของร้าน ${rest.name}`, 'info')}
                      className="text-sky-400 hover:underline cursor-pointer font-bold"
                    >
                      ตรวจสอบเมนู & ราคา ➔
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Rider Fleet & Application Review */}
        {activeTab === 'riders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bike className="w-4 h-4 text-sky-400" />
                  ระบบคัดกรองและอนุมัติไรเดอร์ใหม่ (Rider Verification & CID Approval)
                </h3>
                <p className="text-xs text-slate-400">
                  ตรวจสอบใบขับขี่, พรบ. ยานพาหนะ, ผลตรวจประวัติอาชญากรรม (สตช.) และสแกนใบหน้า Biometric
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {riderApplications.map(app => (
                <div key={app.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded border border-sky-400/20">
                        {app.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        app.status === 'approved' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                          : app.status === 'pending_review' 
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        {app.status === 'approved' ? 'อนุมัติแล้ว' : app.status === 'pending_review' ? 'รอตรวจสอบ' : 'ปฏิเสธ'}
                      </span>
                      <span className="text-xs text-slate-400">ยื่นเมื่อ: {app.submittedAt}</span>
                    </div>

                    <div className="text-sm font-bold text-white">
                      คุณ{app.fullName} ({app.phone})
                    </div>

                    <div className="text-xs text-slate-400 flex flex-wrap gap-x-3 gap-y-1">
                      <span>ยานพาหนะ: <strong className="text-slate-200">{app.vehicleModel}</strong> (ทะเบียน {app.licensePlate})</span>
                      <span>โซนที่เลือก: <strong className="text-amber-400">{deliveryZones.find(z => z.id === app.selectedZoneId)?.name || 'กรุงเทพฯ ชั้นใน'}</strong></span>
                      <span>ใบขับขี่: {app.driverLicenseNumber}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> ใบหน้า Liveness ผ่าน (99.8%)
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> ไร้ประวัติอาชญากรรม (สตช.)
                      </span>
                    </div>
                  </div>

                  {/* Approve / Reject Controls with RBAC */}
                  <div className="flex items-center gap-2 shrink-0">
                    {app.status === 'pending_review' ? (
                      <>
                        <button
                          onClick={() => {
                            if (!verifyPermission(
                              currentRoleConfig.permissions.canApproveRiders,
                              'ฝ่าย Operations (Ops) หรือ Super Admin',
                              'อนุมัติรับไรเดอร์เข้าสู่ระบบ'
                            )) return;
                            updateApplicationStatus(app.id, 'approved');
                            triggerToast('อนุมัติไรเดอร์สำเร็จ! 🛵', `เปิดสิทธิ์ให้คุณ${app.fullName} เริ่มรับงานในโซนได้ทันที`, 'success');
                          }}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                            currentRoleConfig.permissions.canApproveRiders
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-xs'
                              : 'bg-slate-900/60 text-slate-500 border border-slate-800 border-dashed cursor-not-allowed opacity-60'
                          }`}
                          title={currentRoleConfig.permissions.canApproveRiders ? 'อนุมัติใบสมัคร' : 'สงวนสิทธิ์เฉพาะฝ่าย Ops หรือ Super Admin'}
                        >
                          {currentRoleConfig.permissions.canApproveRiders ? (
                            <UserCheck className="w-3.5 h-3.5" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-slate-500" />
                          )}
                          <span>{currentRoleConfig.permissions.canApproveRiders ? 'อนุมัติรับเข้าสู่ระบบ' : 'อนุมัติ (ล็อก 🔒)'}</span>
                        </button>

                        <button
                          onClick={() => {
                            if (!verifyPermission(
                              currentRoleConfig.permissions.canApproveRiders,
                              'ฝ่าย Operations (Ops) หรือ Super Admin',
                              'ปฏิเสธใบสมัครไรเดอร์'
                            )) return;
                            updateApplicationStatus(app.id, 'rejected', 'เอกสารพรบ.รถหมดอายุ');
                            triggerToast('ปฏิเสธใบสมัคร', `แจ้งผลการตรวจเอกสารไปยังคุณ${app.fullName}`, 'info');
                          }}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                            currentRoleConfig.permissions.canApproveRiders
                              ? 'bg-slate-800 hover:bg-rose-900/40 text-rose-400 border-slate-700 cursor-pointer'
                              : 'bg-slate-900/60 text-slate-500 border-slate-800 border-dashed cursor-not-allowed opacity-60'
                          }`}
                          title={currentRoleConfig.permissions.canApproveRiders ? 'ปฏิเสธใบสมัคร' : 'สงวนสิทธิ์เฉพาะฝ่าย Ops หรือ Super Admin'}
                        >
                          {currentRoleConfig.permissions.canApproveRiders ? 'ปฏิเสธ' : 'ปฏิเสธ (ล็อก 🔒)'}
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ตรวจสอบสมบูรณ์
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Finance & EOD Clearing */}
        {activeTab === 'finance' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  ศูนย์บัญชีและตัดรอบจ่ายเงินร้านค้า (EOD Settlement HQ & Bulk Transfer)
                </h3>
                <p className="text-xs text-slate-400">
                  ระบบกระทบยอดสิ้นวัน คำนวณหักภาษี ณ ที่จ่าย 3% และสั่งโอนเงินตรงเข้าบัญชีธนาคารร้านค้า
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {merchantSettlements.map(settlement => (
                <div key={settlement.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                        {settlement.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        settlement.status === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {settlement.status === 'paid' ? 'โอนเงินแล้ว' : 'คำนวณแล้ว รอโอน'}
                      </span>
                      <span className="text-xs text-slate-400">รอบวันที่: {settlement.date}</span>
                    </div>

                    <div className="text-sm font-bold text-white">
                      ร้าน: {settlement.restaurantName} ({settlement.totalOrdersCount} ออเดอร์)
                    </div>

                    <div className="text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                      <span>ยอดขายรวม: <strong className="text-white font-mono">฿{(settlement.grossSales ?? 0).toLocaleString()}</strong></span>
                      <span>หัก GP: <strong className="text-rose-400 font-mono">-฿{(settlement.gpDeductionAmount ?? 0).toLocaleString()}</strong></span>
                      <span>ภาษี ณ ที่จ่าย: <strong className="text-amber-400 font-mono">฿{settlement.withholdingTaxAmount ?? 0}</strong></span>
                      <span>ยอดโอนสุทธิ: <strong className="text-emerald-400 text-sm font-mono">฿{(settlement.netPayoutAmount ?? 0).toLocaleString()}</strong></span>
                    </div>

                    {settlement.transferRefNumber && (
                      <div className="text-[11px] text-slate-400 font-mono">
                        เลขอ้างอิงธนาคาร: <span className="text-sky-400">{settlement.transferRefNumber}</span> ({settlement.transferredAt})
                      </div>
                    )}
                  </div>

                  {/* Payout Action Button with RBAC enforcement */}
                  <div className="shrink-0">
                    {settlement.status !== 'paid' ? (
                      <button
                        onClick={() => {
                          if (!verifyPermission(
                            currentRoleConfig.permissions.canApprovePayouts,
                            'ฝ่ายบัญชีและการเงิน (Finance) หรือ Super Admin',
                            'อนุมัติคำสั่งโอนเงิน EOD ให้ร้านค้า'
                          )) return;
                          approveAndTransferPayout(settlement.id);
                        }}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm ${
                          currentRoleConfig.permissions.canApprovePayouts
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                            : 'bg-slate-900/60 text-slate-500 border border-slate-800 border-dashed cursor-not-allowed opacity-60'
                        }`}
                        title={currentRoleConfig.permissions.canApprovePayouts ? 'อนุมัติสั่งโอนเงิน' : 'สงวนสิทธิ์เฉพาะฝ่าย Finance หรือ Super Admin'}
                      >
                        {currentRoleConfig.permissions.canApprovePayouts ? (
                          <CreditCard className="w-3.5 h-3.5" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        <span>{currentRoleConfig.permissions.canApprovePayouts ? 'อนุมัติสั่งโอนเงิน Direct Credit' : 'อนุมัติสั่งโอนเงิน (ล็อก 🔒)'}</span>
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        โอนเงินเสร็จสิ้น
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Disputes & Refunds */}
        {activeTab === 'disputes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-rose-400" />
                  ศูนย์ระงับข้อพิพาทและคืนเงิน (Dispute Resolution & Customer Refund)
                </h3>
                <p className="text-xs text-slate-400">
                  จัดการเคสอาหารหกเสียหาย ส่งผิด หรือล่าช้า แอดมินสามารถคืนเงินเข้า FoodExpress Wallet ได้ทันที
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {disputeTickets.map(ticket => (
                <div key={ticket.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded border border-rose-400/20">
                        {ticket.id}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">ออเดอร์: {ticket.orderNumber}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        ticket.status === 'refunded'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : ticket.status === 'open'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : ticket.status === 'investigating'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {ticket.status === 'refunded' ? 'คืนเงินแล้ว' : ticket.status === 'open' ? 'เคสใหม่' : ticket.status === 'investigating' ? 'กำลังตรวจสอบ' : 'ปฏิเสธ'}
                      </span>
                      <span className="text-xs text-slate-400">{ticket.createdAt}</span>
                    </div>

                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{ticket.issueLabel}</span>
                      <span className="text-xs font-normal text-slate-400">โดย: {ticket.customerName}</span>
                    </div>

                    <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      "{ticket.description}"
                    </p>

                    <div className="text-xs text-slate-400 flex items-center gap-4">
                      <span>ร้านค้า: <strong className="text-slate-200">{ticket.restaurantName}</strong></span>
                      <span>ไรเดอร์: <strong className="text-sky-400">{ticket.riderName || '-'}</strong></span>
                      <span>ยอดขอคืน: <strong className="text-rose-400 font-mono text-sm">฿{ticket.claimAmount}</strong></span>
                    </div>
                  </div>

                  {/* Refund Action Buttons with RBAC */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                    {ticket.status !== 'refunded' && ticket.status !== 'rejected' ? (
                      <>
                        <button
                          onClick={() => {
                            if (!verifyPermission(
                              currentRoleConfig.permissions.canResolveDisputes,
                              'ฝ่ายบริการลูกค้า (Customer Support) หรือ Super Admin',
                              'อนุมัติคืนเงินเข้าวอลเล็ตลูกค้า'
                            )) return;
                            resolveDisputeTicket(ticket.id, 'refund', 'wallet_credit');
                          }}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm ${
                            currentRoleConfig.permissions.canResolveDisputes
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                              : 'bg-slate-900/60 text-slate-500 border border-slate-800 border-dashed cursor-not-allowed opacity-60'
                          }`}
                          title={currentRoleConfig.permissions.canResolveDisputes ? 'อนุมัติคืนเงิน' : 'สงวนสิทธิ์เฉพาะฝ่าย CX Support หรือ Super Admin'}
                        >
                          {currentRoleConfig.permissions.canResolveDisputes ? (
                            <DollarSign className="w-3.5 h-3.5" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-slate-500" />
                          )}
                          <span>{currentRoleConfig.permissions.canResolveDisputes ? `คืนเงินวอลเล็ตทันที (฿${ticket.claimAmount})` : `คืนเงิน (ล็อก 🔒)`}</span>
                        </button>

                        <button
                          onClick={() => {
                            if (!verifyPermission(
                              currentRoleConfig.permissions.canResolveDisputes,
                              'ฝ่ายบริการลูกค้า (Customer Support) หรือ Super Admin',
                              'ปฏิเสธข้อเรียกร้องเงินชดเชย'
                            )) return;
                            resolveDisputeTicket(ticket.id, 'reject');
                          }}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                            currentRoleConfig.permissions.canResolveDisputes
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 cursor-pointer'
                              : 'bg-slate-900/60 text-slate-500 border border-slate-800 border-dashed cursor-not-allowed opacity-60'
                          }`}
                          title={currentRoleConfig.permissions.canResolveDisputes ? 'ปฏิเสธคำร้อง' : 'สงวนสิทธิ์เฉพาะฝ่าย CX Support หรือ Super Admin'}
                        >
                          {currentRoleConfig.permissions.canResolveDisputes ? 'ปฏิเสธคำร้อง' : 'ปฏิเสธ (ล็อก 🔒)'}
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                        {ticket.status === 'refunded' ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> คืนเงินเข้ากระเป๋าเรียบร้อย
                          </span>
                        ) : (
                          'ปิดเคสแล้ว'
                        )}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Platform Configuration with Super Admin Guard */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            {!currentRoleConfig.permissions.canAccessSettings ? (
              <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-xl">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-2xl">
                  <Lock className="w-8 h-8 text-rose-400" />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>จำกัดสิทธิ์การเข้าถึง (Access Restricted)</span>
                  </div>
                  <h3 className="text-lg font-black text-white">
                    สงวนสิทธิ์เฉพาะ Super Admin เท่านั้น
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    บทบาทปัจจุบันของคุณคือ <strong className="text-amber-400">{currentRoleConfig.title} ({currentRoleConfig.department})</strong> ไม่ได้รับอนุญาตให้เปลี่ยนแปลงพารามิเตอร์ระดับแกนกลางของระบบ (Root Parameters) เช่น GP ส่วนกลาง, ค่าส่งพื้นฐาน, หรือระบบ Dispatch อัตโนมัติ เพื่อรักษาเสถียรภาพและความปลอดภัยของแพลตฟอร์ม
                  </p>
                </div>

                <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setAdminRole('super_admin');
                      triggerToast('สลับบทบาทสำเร็จ!', 'เข้าสู่ระบบในฐานะ Super Admin เรียบร้อยแล้ว สามารถปรับแต่งค่าระบบได้เต็มรูปแบบ', 'success');
                    }}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-2"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>สลับเป็นสิทธิ์ Super Admin ทันที</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('live_ops')}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer border border-slate-700"
                  >
                    กลับสู่หน้าจัดการหลัก
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Settings className="w-4 h-4 text-amber-400" />
                      การตั้งค่าพารามิเตอร์ระบบส่วนกลาง (Global Platform Settings)
                    </h3>
                    <p className="text-xs text-slate-400">
                      ปรับแต่งอัตรา GP มาตรฐาน, ค่าจัดส่งเริ่มต้น, ภาษี และระบบจ่ายงานอัตโนมัติ (Super Admin Clearance)
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs rounded-xl font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Super Admin Unlocked
                  </span>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        อัตรา GP มาตรฐานร้านค้าทั่วไป (%)
                      </label>
                      <input
                        type="number"
                        value={platformConfig.defaultGpPercent}
                        onChange={(e) => updatePlatformConfig({ defaultGpPercent: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">ใช้เป็นค่าตั้งต้นสำหรับร้านค้าใหม่</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        ค่าส่งเริ่มต้นฐาน (Base Delivery Fee ฿)
                      </label>
                      <input
                        type="number"
                        value={platformConfig.baseDeliveryFee}
                        onChange={(e) => updatePlatformConfig({ baseDeliveryFee: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">ครอบคลุมระยะทาง 1 กม. แรก</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        ค่าบริการช่วงเวลาหนาแน่น Peak Hour (฿)
                      </label>
                      <input
                        type="number"
                        value={platformConfig.peakHourSurcharge}
                        onChange={(e) => updatePlatformConfig({ peakHourSurcharge: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">บวกเพิ่มช่วง 11:30 - 13:30 และ 18:00 - 20:00</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        id="auto-dispatch-toggle"
                        checked={platformConfig.autoDispatchEnabled}
                        onChange={(e) => updatePlatformConfig({ autoDispatchEnabled: e.target.checked })}
                        className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                      />
                      <label htmlFor="auto-dispatch-toggle" className="text-xs font-bold text-white cursor-pointer">
                        เปิดระบบกระจายงานให้ไรเดอร์อัตโนมัติ (Automated AI Dispatcher)
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        id="auto-settle-toggle"
                        checked={platformConfig.autoSettlementTransfer}
                        onChange={(e) => updatePlatformConfig({ autoSettlementTransfer: e.target.checked })}
                        className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                      />
                      <label htmlFor="auto-settle-toggle" className="text-xs font-bold text-white cursor-pointer">
                        เปิดโอนเงินร้านค้าอัตโนมัติรอบเที่ยงคืน (Midnight Direct Credit)
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* RBAC STANDARD MATRIX MODAL */}
      {isRbacModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    มาตรฐานการจัดสรรสิทธิ์ 4 บทบาท (Standard RBAC Matrix)
                  </h3>
                  <p className="text-xs text-slate-400">
                    หลักการแบ่งแยกหน้าที่ (Separation of Duties) & มาตรฐานความปลอดภัยของแพลตฟอร์ม On-Demand Delivery
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRbacModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
              
              {/* Role Definition Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {(['super_admin', 'operations', 'finance', 'support'] as AdminRole[]).map((r) => {
                  const cfg = ROLES_RBAC_CONFIG[r];
                  const isCurrent = adminRole === r;
                  return (
                    <div 
                      key={r}
                      onClick={() => {
                        setAdminRole(r);
                        triggerToast(`สลับสู่บทบาท ${cfg.title}`, `ขอบเขตงาน: ${cfg.department}`, 'info');
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isCurrent 
                          ? `${cfg.accentBorder} ${cfg.badgeBg} ring-1 ring-amber-400/40 shadow-md` 
                          : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl">{cfg.roleIcon}</span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30">
                            ใช้งานอยู่
                          </span>
                        )}
                      </div>
                      <div className="font-black text-white text-sm">{cfg.title}</div>
                      <div className="text-[11px] text-slate-400 mb-2">{cfg.department}</div>
                      <p className="text-[10px] text-slate-300 line-clamp-3">
                        {cfg.description}
                      </p>
                      <button className="mt-3 w-full py-1 text-[11px] font-bold rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200">
                        {isCurrent ? 'บทบาทปัจจุบัน' : 'คลิกเพื่อสลับทดสอบ'}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Standard Comparison Table */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/70">
                <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-800 font-bold text-white flex items-center justify-between">
                  <span>ตารางวิเคราะห์สิทธิ์ตามฟังก์ชันงาน (Capability Matrix):</span>
                  <span className="text-[11px] font-normal text-slate-400">✓ = ได้รับอนุญาต | ✕ = จำกัดสิทธิ์ (Restricted)</span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-mono text-[11px]">
                        <th className="p-3">ฟังก์ชันงานหลัก (Feature / Action)</th>
                        <th className="p-3 text-center text-amber-400">👑 Super Admin</th>
                        <th className="p-3 text-center text-emerald-400">🚚 Live Ops</th>
                        <th className="p-3 text-center text-blue-400">💰 Finance</th>
                        <th className="p-3 text-center text-rose-400">🎧 Support</th>
                        <th className="p-3">เหตุผลมาตรฐาน (Rationale)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {RBAC_STANDARD_MATRIX.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/40">
                          <td className="p-3 font-semibold text-white">
                            <div className="font-bold text-white">{row.featureTitle}</div>
                            <div className="text-[10px] text-slate-400">{row.description}</div>
                          </td>
                          <td className="p-3 text-center">
                            {row.superAdmin ? (
                              <span className="text-emerald-400 font-bold text-sm">✓</span>
                            ) : (
                              <span className="text-slate-600 font-bold text-sm">✕</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {row.operations ? (
                              <span className="text-emerald-400 font-bold text-sm">✓</span>
                            ) : (
                              <span className="text-slate-600 font-bold text-sm">✕</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {row.finance ? (
                              <span className="text-emerald-400 font-bold text-sm">✓</span>
                            ) : (
                              <span className="text-slate-600 font-bold text-sm">✕</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {row.support ? (
                              <span className="text-emerald-400 font-bold text-sm">✓</span>
                            ) : (
                              <span className="text-slate-600 font-bold text-sm">✕</span>
                            )}
                          </td>
                          <td className="p-3 text-[11px] text-slate-400">
                            {row.rationale}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Best Practice Summary Box */}
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl space-y-1.5 text-xs text-amber-200">
                <div className="font-bold flex items-center gap-1.5 text-amber-300">
                  <Sparkles className="w-4 h-4" />
                  <span>หลักคิดสากลในการออกแบบ RBAC (Role-Based Access Control) สำหรับแพลตฟอร์ม Delivery:</span>
                </div>
                <p className="text-[11px] text-amber-100/90 leading-relaxed">
                  1. <strong>Separation of Duties (SoD):</strong> ผู้ที่มีสิทธิ์สั่งโอนเงิน (Finance) จะต้องไม่ใช่คนเดียวกับผู้สร้างออเดอร์หรือจัดการไรเดอร์ (Ops) เพื่อป้องกันการทุจริตภายใน<br />
                  2. <strong>Least Privilege:</strong> แต่ละแผนกเห็นข้อมูลที่จำเป็นต่อการปฏิบัติหน้าที่เท่านั้น เช่น ฝ่าย Support โฟกัสการคืนเงินตามเรื่องร้องเรียน ส่วน Live Ops มุ่งเน้นการจัดสรรไรเดอร์ให้เร็วที่สุด<br />
                  3. <strong>Audit Trail:</strong> ทุกการแทรกแซง (Cancel, Reassign, Refund, Direct Transfer) ต้องสามารถสืบย้อนได้ว่ากระทำโดยผู้ใช้บทบาทใด
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                บทบาทปัจจุบัน: <strong className="text-white">{currentRoleConfig.title}</strong>
              </span>
              <button
                onClick={() => setIsRbacModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
