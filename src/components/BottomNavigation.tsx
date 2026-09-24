import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, ReceiptText, Gift, User } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    activeOrder, 
    setIsTrackingOpen,
    user,
    t
  } = useApp();

  return (
    <>
      {/* Floating Active Order Tracker Pill (if active order in progress) */}
      {activeOrder && activeOrder.status !== 'delivered' && activeOrder.status !== 'cancelled' && (
        <aside 
          aria-label="Active order delivery tracking"
          className="sticky bottom-20 left-0 right-0 px-4 pb-2 z-20 pointer-events-auto max-w-lg mx-auto"
        >
          <button
            id="floating-active-order-tracker-btn"
            onClick={() => setIsTrackingOpen(true)}
            className="w-full bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-xl flex items-center justify-between border border-emerald-500/50 hover:bg-slate-850 transition-all active:scale-[0.99] group cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                  🛵
                </div>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
              </div>
              <div className="text-left min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-emerald-400">{t('deliveringOrder')}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({activeOrder.id})</span>
                </div>
                <p className="text-xs font-medium text-slate-200 truncate">
                  {activeOrder.restaurantName} • อีก ~{Math.max(3, 20 - Math.round(activeOrder.riderProgressPct * 0.17))} นาที
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800 flex items-center gap-1 group-hover:bg-emerald-900 transition-colors">
                <span>{t('liveMap')}</span>
                <span className="text-[10px]">📍</span>
              </span>
            </div>
          </button>
        </aside>
      )}

      {/* Main Bottom Nav Bar - Clean 4 Customer-Centric Tabs */}
      <nav 
        aria-label="Customer Bottom Navigation"
        className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-4 z-30 shadow-lg"
      >
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
          {/* 1. Home */}
          <button
            id="nav-tab-home-btn"
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center py-2 px-2 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'text-emerald-700 bg-emerald-50/80 font-black scale-102'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Home className={`w-5 h-5 transition-transform ${activeTab === 'home' ? 'scale-110 text-emerald-600' : ''}`} />
            <span className="text-[11px] mt-1 font-bold tracking-tight">{t('navHome')}</span>
          </button>

          {/* 2. Orders */}
          <button
            id="nav-tab-orders-btn"
            onClick={() => setActiveTab('orders')}
            className={`relative flex flex-col items-center justify-center py-2 px-2 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'text-emerald-700 bg-emerald-50/80 font-black scale-102'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="relative">
              <ReceiptText className={`w-5 h-5 transition-transform ${activeTab === 'orders' ? 'scale-110 text-emerald-600' : ''}`} />
              {activeOrder && activeOrder.status !== 'delivered' && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
              )}
            </div>
            <span className="text-[11px] mt-1 font-bold tracking-tight">{t('navOrders')}</span>
          </button>

          {/* 3. Rewards */}
          <button
            id="nav-tab-rewards-btn"
            onClick={() => setActiveTab('rewards')}
            className={`relative flex flex-col items-center justify-center py-2 px-2 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'rewards'
                ? 'text-emerald-700 bg-emerald-50/80 font-black scale-102'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="relative">
              <Gift className={`w-5 h-5 transition-transform ${activeTab === 'rewards' ? 'scale-110 text-emerald-600' : ''}`} />
              <span className="absolute -top-1 -right-1.5 bg-amber-500 text-slate-950 font-black text-[9px] px-1 rounded-full leading-tight">
                {user.points > 0 ? `${user.points}` : '0'}
              </span>
            </div>
            <span className="text-[11px] mt-1 font-bold tracking-tight">{t('navRewards')}</span>
          </button>

          {/* 4. Profile / Account */}
          <button
            id="nav-tab-profile-btn"
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center py-2 px-2 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'text-emerald-700 bg-emerald-50/80 font-black scale-102'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <User className={`w-5 h-5 transition-transform ${activeTab === 'profile' ? 'scale-110 text-emerald-600' : ''}`} />
            <span className="text-[11px] mt-1 font-bold tracking-tight">{t('navProfile')}</span>
          </button>
        </div>
      </nav>
    </>
  );
};
