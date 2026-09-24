import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RiderRegistrationTab } from '../components/rider/RiderRegistrationTab';
import { RiderQueueTab } from '../components/rider/RiderQueueTab';
import { RiderPayoutTab } from '../components/rider/RiderPayoutTab';
import { RiderHeatmapTab } from '../components/rider/RiderHeatmapTab';
import { RiderSafetyTab } from '../components/rider/RiderSafetyTab';
import { RiderTierQuestsModal } from '../components/rider/RiderTierQuestsModal';
import { RIDER_TIERS_CONFIG } from '../data/riderData';
import { RiderWeatherMode } from '../types';
import { 
  Bike, 
  UserPlus, 
  ListOrdered, 
  CreditCard, 
  Sparkles, 
  ArrowLeft, 
  ShieldCheck, 
  PhoneCall,
  Bell,
  Flame,
  ShieldAlert,
  Layers,
  Award,
  CloudRain,
  Sun,
  CloudLightning,
  Gift
} from 'lucide-react';

export const RiderHubScreen: React.FC = () => {
  const { 
    activeRider, 
    setActiveTab, 
    activeIncomingTrip,
    triggerSimulatedIncomingOrder,
    riderWeatherMode,
    setRiderWeatherMode,
    riderQuests
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'queue' | 'heatmap' | 'payout' | 'safety' | 'registration'>('queue');
  const [isTierModalOpen, setIsTierModalOpen] = useState<boolean>(false);

  const currentTierId = activeRider.tier || 'gold';
  const currentTierConfig = RIDER_TIERS_CONFIG[currentTierId];
  const unclaimedQuestsCount = riderQuests.filter(q => q.completed && !q.claimed).length;

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Top App Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              id="rider-hub-back-home-btn"
              onClick={() => setActiveTab('home')}
              className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="กลับหน้าหลักลูกค้า"
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
                    ศูนย์ปฏิบัติการไรเดอร์สากล
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  รับงานสด • นำทาง GPS • งานพ่วงอัตโนมัติ • โหมดฝนตก • เลเวลและภารกิจ
                </p>
              </div>
            </div>
          </div>

          {/* Controls: Weather Mode Switcher, Tier Status & Simulated Order */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap justify-end">
            {/* Weather Mode Surcharge Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setRiderWeatherMode('clear')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 text-[11px] ${
                  riderWeatherMode === 'clear'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="สภาพอากาศปกติ"
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="hidden md:inline">ปกติ</span>
              </button>

              <button
                type="button"
                onClick={() => setRiderWeatherMode('rain')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 text-[11px] ${
                  riderWeatherMode === 'rain'
                    ? 'bg-blue-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="โหมดฝนตก (+฿15 ทุกงาน)"
              >
                <CloudRain className="w-3.5 h-3.5" />
                <span className="hidden md:inline">ฝนตก (+฿15)</span>
                <span className="md:hidden">+฿15</span>
              </button>

              <button
                type="button"
                onClick={() => setRiderWeatherMode('storm')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 text-[11px] ${
                  riderWeatherMode === 'storm'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="โหมดพายุฝน (+฿25 ทุกงาน)"
              >
                <CloudLightning className="w-3.5 h-3.5" />
                <span className="hidden md:inline">พายุ (+฿25)</span>
                <span className="md:hidden">+฿25</span>
              </button>
            </div>

            {/* Rider Tier & Daily Quests Button */}
            <button
              id="rider-hub-tier-quests-btn"
              onClick={() => setIsTierModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs relative"
              title="ดูระดับเลเวล สิทธิประโยชน์ และภารกิจสะสมแต้ม"
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>{currentTierConfig.badgeEmoji} {currentTierConfig.titleTh.split(' ')[0]}</span>
              {currentTierConfig.earningBonusPercent > 0 && (
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1 rounded">
                  +{currentTierConfig.earningBonusPercent}%
                </span>
              )}
              {unclaimedQuestsCount > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping absolute -top-1 -right-1" />
              )}
            </button>

            {/* Simulated Incoming Order Button */}
            <button
              id="rider-hub-sim-incoming-btn"
              onClick={triggerSimulatedIncomingOrder}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Bell className="w-3.5 h-3.5 animate-bounce" />
              <span className="hidden sm:inline">จำลองออเดอร์เข้า</span>
              <span className="sm:hidden">ยิงงาน</span>
            </button>
          </div>
        </div>

        {/* 5 Core System Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1.5 border-t border-slate-100 pt-2 pb-2 overflow-x-auto">
            <button
              id="rider-tab-queue-btn"
              onClick={() => setActiveSubTab('queue')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeSubTab === 'queue'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span>1. คิว & รับงานสด (GPS & งานพ่วง)</span>
              {activeIncomingTrip && (
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
              )}
            </button>

            <button
              id="rider-tab-heatmap-btn"
              onClick={() => setActiveSubTab('heatmap')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeSubTab === 'heatmap'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-500" />
              <span>2. แผนที่ฮอตสปอต & งานพ่วง</span>
            </button>

            <button
              id="rider-tab-payout-btn"
              onClick={() => setActiveSubTab('payout')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeSubTab === 'payout'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>3. กระเป๋าเงินคู่ & ถอนเงิน</span>
            </button>

            <button
              id="rider-tab-safety-btn"
              onClick={() => setActiveSubTab('safety')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeSubTab === 'safety'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-rose-500 group-hover:text-rose-600" />
              <span>4. ความปลอดภัย & SOS</span>
            </button>

            <button
              id="rider-tab-registration-btn"
              onClick={() => setActiveSubTab('registration')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeSubTab === 'registration'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>5. ข้อมูลคนขับ & ตรวจเอกสาร</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeSubTab === 'queue' && <RiderQueueTab />}
        {activeSubTab === 'heatmap' && <RiderHeatmapTab />}
        {activeSubTab === 'payout' && <RiderPayoutTab />}
        {activeSubTab === 'safety' && <RiderSafetyTab />}
        {activeSubTab === 'registration' && <RiderRegistrationTab />}
      </main>

      {/* Rider Tier & Quests Modal */}
      <RiderTierQuestsModal
        isOpen={isTierModalOpen}
        onClose={() => setIsTierModalOpen(false)}
      />
    </div>
  );
};
