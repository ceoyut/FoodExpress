import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RiderRegistrationTab } from '../components/rider/RiderRegistrationTab';
import { RiderQueueTab } from '../components/rider/RiderQueueTab';
import { RiderPayoutTab } from '../components/rider/RiderPayoutTab';
import { 
  Bike, 
  UserPlus, 
  ListOrdered, 
  CreditCard, 
  Sparkles, 
  ArrowLeft, 
  ShieldCheck, 
  PhoneCall,
  Bell
} from 'lucide-react';

export const RiderHubScreen: React.FC = () => {
  const { 
    activeRider, 
    setActiveTab, 
    activeIncomingTrip,
    triggerSimulatedIncomingOrder
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'queue' | 'registration' | 'payout'>('queue');

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Top App Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              id="rider-hub-back-home-btn"
              onClick={() => setActiveTab('home')}
              className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="กลับหน้าหลัก"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-xl shadow-xs">
                🛵
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-black text-slate-900 leading-none">
                    FoodExpress Rider Hub
                  </h1>
                  <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    ศูนย์ปฏิบัติการไรเดอร์
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  ระบบสมัครงาน • ระบบคิวรับออเดอร์ • ระบบจ่ายเงินค่ารอบ
                </p>
              </div>
            </div>
          </div>

          {/* Quick Active Rider Badge */}
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-black text-slate-800">{activeRider.name}</span>
              <span className="text-[10px] text-slate-500">
                วอลเล็ต: <strong className="text-emerald-600 font-bold">฿{activeRider.walletBalance.toFixed(2)}</strong>
              </span>
            </div>

            <button
              id="rider-hub-sim-incoming-btn"
              onClick={triggerSimulatedIncomingOrder}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Bell className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
              <span className="hidden sm:inline">จำลองออเดอร์เข้า</span>
              <span className="sm:hidden">ยิงงาน</span>
            </button>
          </div>
        </div>

        {/* 3 Core System Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 border-t border-slate-100 pt-2 pb-2 overflow-x-auto">
            <button
              id="rider-tab-queue-btn"
              onClick={() => setActiveSubTab('queue')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeSubTab === 'queue'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span>ระบบคิว & เข้ารับออเดอร์</span>
              {activeIncomingTrip && (
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
              )}
            </button>

            <button
              id="rider-tab-registration-btn"
              onClick={() => setActiveSubTab('registration')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeSubTab === 'registration'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>ระบบสมัครพนักงานจัดส่ง</span>
            </button>

            <button
              id="rider-tab-payout-btn"
              onClick={() => setActiveSubTab('payout')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeSubTab === 'payout'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>ระบบจ่ายเงิน & สลิปค่ารอบ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeSubTab === 'queue' && <RiderQueueTab />}
        {activeSubTab === 'registration' && <RiderRegistrationTab />}
        {activeSubTab === 'payout' && <RiderPayoutTab />}
      </main>
    </div>
  );
};
