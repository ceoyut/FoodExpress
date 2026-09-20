import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, ReceiptText, Gift, User, Building2, Bike, ShieldCheck } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    activeOrder, 
    setIsTrackingOpen,
    activeIncomingTrip,
    t
  } = useApp();

  return (
    <>
      {/* Floating Active Order Tracker Pill (if active order in progress) */}
      {activeOrder && activeOrder.status !== 'delivered' && activeOrder.status !== 'cancelled' && (
        <aside 
          aria-label="Active order delivery tracking"
          className="sticky bottom-16 left-0 right-0 px-4 pb-2 z-20 pointer-events-auto"
        >
          <button
            id="floating-active-order-tracker-btn"
            onClick={() => setIsTrackingOpen(true)}
            className="w-full bg-slate-900 text-white p-3 rounded-2xl shadow-xl flex items-center justify-between border border-emerald-500/40 hover:bg-slate-850 transition-transform active:scale-[0.99] group"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                  🛵
                </div>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-400">{t('deliveringOrder')}</span>
                  <span className="text-[10px] text-slate-400">({activeOrder.id})</span>
                </div>
                <p className="text-xs font-medium text-slate-200 truncate max-w-[200px]">
                  {activeOrder.restaurantName} • อีก ~{Math.max(3, 20 - Math.round(activeOrder.riderProgressPct * 0.17))} นาที
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800">
                {t('liveMap')}
              </span>
            </div>
          </button>
        </aside>
      )}

      {/* Main Bottom Nav Bar */}
      <nav className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 py-1.5 px-3 z-30 flex items-center justify-around shadow-lg">
        <button
          id="nav-tab-home-btn"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            activeTab === 'home'
              ? 'text-emerald-600 font-semibold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{t('navHome')}</span>
        </button>

        <button
          id="nav-tab-orders-btn"
          onClick={() => setActiveTab('orders')}
          className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            activeTab === 'orders'
              ? 'text-emerald-600 font-semibold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <ReceiptText className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{t('navOrders')}</span>
          {activeOrder && activeOrder.status !== 'delivered' && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          )}
        </button>

        <button
          id="nav-tab-rewards-btn"
          onClick={() => setActiveTab('rewards')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            activeTab === 'rewards'
              ? 'text-emerald-600 font-semibold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Gift className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{t('navRewards')}</span>
        </button>

        <button
          id="nav-tab-pos-settlement-btn"
          onClick={() => setActiveTab('pos_settlement')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'pos_settlement'
              ? 'text-emerald-600 font-semibold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Building2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{t('navPOS')}</span>
        </button>

        <button
          id="nav-tab-rider-hub-btn"
          onClick={() => setActiveTab('rider_hub')}
          className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'rider_hub'
              ? 'text-emerald-600 font-semibold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Bike className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{t('navRider')}</span>
          {activeIncomingTrip && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500 animate-ping" />
          )}
        </button>

        <button
          id="nav-tab-profile-btn"
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'profile'
              ? 'text-emerald-600 font-semibold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{t('navProfile')}</span>
        </button>

        <button
          id="nav-tab-admin-hq-btn"
          onClick={() => setActiveTab('admin_portal')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'admin_portal'
              ? 'text-rose-600 font-semibold'
              : 'text-slate-400 hover:text-rose-500'
          }`}
          title="ศูนย์บัญชาการแอดมิน HQ"
        >
          <ShieldCheck className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">แอดมิน HQ</span>
        </button>
      </nav>
    </>
  );
};
