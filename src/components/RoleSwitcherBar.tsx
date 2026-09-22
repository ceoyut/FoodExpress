import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Store, Bike, Sparkles, Radio, Smartphone, QrCode, ShieldCheck } from 'lucide-react';
import { INITIAL_MERCHANT_ACCOUNTS } from '../data/merchantAuthData';
import { INITIAL_ACTIVE_RIDER } from '../data/riderData';
import { E2eSimulationModal } from './simulation/E2eSimulationModal';
import { MultiDeviceSyncModal } from './sync/MultiDeviceSyncModal';

export const RoleSwitcherBar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    user, 
    activeMerchant, 
    setActiveMerchant,
    setSelectedSettlementRestId,
    activeRider,
    setActiveRider,
    triggerToast 
  } = useApp();

  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const [isMultiDeviceOpen, setIsMultiDeviceOpen] = useState(false);

  const handleSwitchToCustomer = () => {
    setActiveTab('home');
    triggerToast('สลับบทบาท: ลูกค้า', `เข้าสู่โหมดลูกค้า: คุณ${user.name}`, 'info');
  };

  const handleSwitchToMerchant = () => {
    const kanda = INITIAL_MERCHANT_ACCOUNTS[0];
    if (kanda) {
      setActiveMerchant(kanda);
      setSelectedSettlementRestId(kanda.restaurantId);
    }
    setActiveTab('pos_settlement');
    triggerToast('สลับบทบาท: ร้านค้า', `เข้าสู่ระบบร้านค้า: ${kanda?.restaurantName || 'กานดา ร้อยหม้อ'}`, 'info');
  };

  const handleSwitchToRider = () => {
    setActiveRider(INITIAL_ACTIVE_RIDER);
    setActiveTab('rider_hub');
    triggerToast('สลับบทบาท: ไรเดอร์', `เข้าสู่ระบบไรเดอร์: ${INITIAL_ACTIVE_RIDER.name}`, 'info');
  };

  const handleSwitchToAdmin = () => {
    setActiveTab('admin_portal');
    triggerToast('สลับบทบาท: แอดมิน HQ', 'เข้าสู่ศูนย์บัญชาการระบบหลังบ้านและผู้ดูแลระบบ', 'info');
  };

  return (
    <>
      <div className="bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 px-2 sm:px-3 py-1.5 shadow-sm z-30 sticky top-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 text-xs">
          
          {/* Left: Role Switch Buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 shrink-0 pr-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-400 hidden md:inline">บทบาท:</span>
            </div>

            {/* Customer Button */}
            <button
              id="role-switch-customer-btn"
              onClick={handleSwitchToCustomer}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'home' || activeTab === 'orders' || activeTab === 'rewards'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              title={`สลับเป็นผู้ใช้: ${user.name} (ลูกค้า)`}
            >
              <User className="w-3 h-3 text-emerald-300" />
              <span>{user.name.split(' ')[0]} (ลูกค้า)</span>
            </button>

            {/* Merchant Button */}
            <button
              id="role-switch-merchant-btn"
              onClick={handleSwitchToMerchant}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'pos_settlement'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              title="สลับเป็นร้านค้า: กานดา ร้อยหม้อ (Merchant POS)"
            >
              <Store className="w-3 h-3 text-amber-300" />
              <span>กานดา (ร้านค้า)</span>
            </button>

            {/* Rider Button */}
            <button
              id="role-switch-rider-btn"
              onClick={handleSwitchToRider}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'rider_hub'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              title="สลับเป็นไรเดอร์: สมหวัง สายซิ่ง (Rider Hub)"
            >
              <Bike className="w-3 h-3 text-sky-300" />
              <span>สมหวัง (ไรเดอร์)</span>
            </button>

            {/* Admin HQ Button */}
            <button
              id="role-switch-admin-btn"
              onClick={handleSwitchToAdmin}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'admin_portal'
                  ? 'bg-rose-600 text-white shadow-xs ring-1 ring-rose-400'
                  : 'bg-slate-800 text-rose-300 hover:bg-slate-700 hover:text-white'
              }`}
              title="สลับเป็นผู้ดูแลระบบ / เจ้าของระบบ (Platform HQ & Super Admin)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
              <span>แอดมิน HQ</span>
            </button>
          </div>

          {/* Right: Recommendation 1 & 2 Action Tools */}
          <div className="flex items-center gap-1 shrink-0">
            {/* 1. E2E Order Flow Simulation */}
            <button
              id="open-e2e-simulation-btn"
              onClick={() => setIsSimulationOpen(true)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              title="ทดสอบวงจรคำสั่งซื้อแบบครบวงจร 3 ฝ่าย (Customer -> Merchant -> Rider -> Settlement)"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span className="hidden sm:inline">ทดสอบวงจร 3 ฝ่าย</span>
              <span className="sm:hidden">วงจร 3 ฝ่าย</span>
            </button>

            {/* 2. Multi-Device Realtime Sync */}
            <button
              id="open-multi-device-sync-btn"
              onClick={() => setIsMultiDeviceOpen(true)}
              className="px-2 py-1 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-sky-200 border border-slate-700 flex items-center gap-1 transition-all cursor-pointer"
              title="เชื่อมต่อเปิดพร้อมกันหลายหน้าจอ/มือถือผ่าน QR Code"
            >
              <Radio className="w-3 h-3 text-sky-400 animate-pulse" />
              <span className="hidden md:inline">ต่อหลายจอ</span>
              <QrCode className="w-3 h-3 md:hidden" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <E2eSimulationModal
        isOpen={isSimulationOpen}
        onClose={() => setIsSimulationOpen(false)}
      />

      <MultiDeviceSyncModal
        isOpen={isMultiDeviceOpen}
        onClose={() => setIsMultiDeviceOpen(false)}
      />
    </>
  );
};
