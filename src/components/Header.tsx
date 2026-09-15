import React from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, Bell, Coins, Sparkles, ChevronDown, Building2, Bike } from 'lucide-react';
import { Wallet } from './Wallet';
import { LanguageSwitcher } from './LanguageSwitcher';

interface HeaderProps {
  onOpenSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const {
    user,
    userLocation,
    unreadNotificationCount,
    setIsNotificationsOpen,
    activeTab,
    setActiveTab,
    setIsAuthModalOpen,
    cloudSyncState,
    t,
  } = useApp();

  const defaultAddress = user.savedAddresses.find(a => a.isDefault) || user.savedAddresses[0];

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs px-4 py-3">
      {/* Top row: Location, POS Switcher & Cloud Sync indicator */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <button
          id="header-delivery-address-btn"
          onClick={() => setIsAuthModalOpen(true)}
          className="flex items-center gap-2 text-left group max-w-[50%] sm:max-w-[60%]"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
            userLocation.isLiveGPS 
              ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-400/50' 
              : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'
          }`}>
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 tracking-wide uppercase">
              <span>{userLocation.isLiveGPS ? t('liveGPS') : t('deliverTo')}</span>
              <span className="text-slate-400">({userLocation.isLiveGPS ? t('live') : (defaultAddress?.label || t('home'))})</span>
              <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-700 transition-colors" />
            </div>
            <p className="text-xs font-medium text-slate-800 truncate">
              {userLocation.name || defaultAddress?.address || 'สุขุมวิท 39, วัฒนา, กรุงเทพฯ'}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Language Switcher in Header */}
          <LanguageSwitcher />

          {/* Switch to Rider Hub */}
          <button
            id="header-switch-rider-btn"
            onClick={() => setActiveTab(activeTab === 'rider_hub' ? 'home' : 'rider_hub')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold transition-all cursor-pointer ${
              activeTab === 'rider_hub'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                : 'bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border-slate-200/80 text-slate-700'
            }`}
            title="Rider Hub"
          >
            <Bike className="w-3.5 h-3.5" />
            <span>{activeTab === 'rider_hub' ? t('riderHub') : t('riderHubShort')}</span>
          </button>

          {/* Switch to POS Settlement System */}
          <button
            id="header-switch-pos-btn"
            onClick={() => setActiveTab(activeTab === 'pos_settlement' ? 'home' : 'pos_settlement')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold transition-all cursor-pointer ${
              activeTab === 'pos_settlement'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                : 'bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border-slate-200/80 text-slate-700'
            }`}
            title="Merchant POS"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{activeTab === 'pos_settlement' ? t('posSettlement') : t('posSettlementShort')}</span>
          </button>

          {/* Cloud database sync status indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/90 border border-slate-200/80 text-[11px] text-slate-600">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cloudSyncState === 'synced' ? 'bg-emerald-400 opacity-75' : 'bg-amber-400 opacity-75'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${cloudSyncState === 'synced' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </span>
            <span className="font-medium text-[10px]">
              {cloudSyncState === 'synced' ? t('cloudSync') : t('saving')}
            </span>
          </div>
        </div>
      </div>

      {/* Middle row: Wallet with Warning Badge, Points, Notifications & Profile Avatar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {/* Dedicated Wallet Component with Low Balance Warning Badge */}
          <Wallet />

          {/* Loyalty Points Pill */}
          <button
            id="header-loyalty-points-btn"
            onClick={() => setActiveTab('rewards')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200/60 shadow-xs transition-colors cursor-pointer"
          >
            <Coins className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-semibold text-amber-800 leading-none">{t('rewardPoints')}</span>
              <span className="text-xs font-bold text-amber-950 leading-tight">
                {user.loyaltyPoints.toLocaleString()} {t('pts')}
              </span>
            </div>
            <Sparkles className="w-3 h-3 text-amber-500 animate-pulse ml-0.5" />
          </button>
        </div>

        {/* Right action icons: Notifications and Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Notification Bell */}
          <button
            id="header-notifications-btn"
            onClick={() => setIsNotificationsOpen(true)}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title={t('notifications')}
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center px-1 animate-bounce">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar with Tier badge */}
          <button
            id="header-user-profile-btn"
            onClick={() => setIsAuthModalOpen(true)}
            className="relative p-0.5 rounded-full ring-2 ring-emerald-500/40 hover:ring-emerald-500 transition-all active:scale-95 cursor-pointer"
            title={t('profile')}
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
            <span className="absolute -bottom-1 -right-1 text-[8px] font-extrabold uppercase px-1 py-0.2 bg-amber-400 text-slate-950 rounded-full shadow-xs border border-white">
              {user.tier}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

