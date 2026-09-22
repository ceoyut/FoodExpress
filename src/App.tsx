import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { DeviceFrame } from './components/DeviceFrame';
import { Header } from './components/Header';
import { BottomNavigation } from './components/BottomNavigation';
import { HomeScreen } from './screens/HomeScreen';
import { OrdersScreen } from './screens/OrdersScreen';
import { RewardsModal } from './components/RewardsModal';
import { RestaurantDetailModal } from './components/RestaurantDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { FloatingQuickCart } from './components/FloatingQuickCart';
import { CheckoutModal } from './components/CheckoutModal';
import { LiveTrackingModal } from './components/LiveTrackingModal';
import { ReviewModal } from './components/ReviewModal';
import { NotificationsModal } from './components/NotificationsModal';
import { WalletTopUpModal } from './components/WalletTopUpModal';
import { AuthModal } from './components/AuthModal';
import { MerchantSettlementScreen } from './screens/MerchantSettlementScreen';
import { RiderHubScreen } from './screens/RiderHubScreen';
import { AdminHQScreen } from './screens/AdminHQScreen';
import { MerchantSocialAuthModal } from './components/merchant/MerchantSocialAuthModal';
import { MerchantGpCalculatorModal } from './components/merchant/MerchantGpCalculatorModal';
import { RoleSwitcherBar } from './components/RoleSwitcherBar';
import { INITIAL_MERCHANT_ACCOUNTS } from './data/merchantAuthData';
import { INITIAL_ACTIVE_RIDER } from './data/riderData';

const AppContent: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab,
    selectedRestaurant, 
    setSelectedRestaurant, 
    isCartOpen, 
    setIsCartOpen, 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    isTrackingOpen, 
    setIsTrackingOpen, 
    isNotificationsOpen, 
    setIsNotificationsOpen, 
    isTopUpOpen, 
    setIsTopUpOpen, 
    isAuthModalOpen, 
    setIsAuthModalOpen,
    isMerchantAuthModalOpen,
    setIsMerchantAuthModalOpen,
    isGpCalculatorOpen,
    setIsGpCalculatorOpen,
    setActiveMerchant,
    setSelectedSettlementRestId,
    setActiveRider,
    toast 
  } = useApp();

  // Multi-device sync: check URL parameter on mount (e.g. ?role=merchant or ?role=rider)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    if (roleParam === 'merchant') {
      const kanda = INITIAL_MERCHANT_ACCOUNTS[0];
      if (kanda) {
        setActiveMerchant(kanda);
        setSelectedSettlementRestId(kanda.restaurantId);
      }
      setActiveTab('pos_settlement');
    } else if (roleParam === 'rider') {
      setActiveRider(INITIAL_ACTIVE_RIDER);
      setActiveTab('rider_hub');
    } else if (roleParam === 'customer') {
      setActiveTab('home');
    }
  }, [setActiveMerchant, setSelectedSettlementRestId, setActiveRider, setActiveTab]);

  const isCustomerScreen = activeTab === 'home' || activeTab === 'orders' || activeTab === 'rewards' || activeTab === 'profile';

  return (
    <DeviceFrame>
      <div className="flex flex-col h-full bg-[#F6F8F7] font-sans relative">
        {/* Quick Role Switcher for testing (Customer / Merchant / Rider) */}
        <RoleSwitcherBar />

        {/* Fixed Header (for customer sub-screens only: orders, rewards, profile) */}
        {isCustomerScreen && activeTab !== 'home' && <Header />}

        {/* Scrollable Main Area */}
        <main className={`flex-1 overflow-y-auto no-scrollbar ${isCustomerScreen ? 'pb-24' : 'pb-6'}`}>
          {activeTab === 'home' && <HomeScreen />}
          {activeTab === 'orders' && <OrdersScreen />}
          {activeTab === 'rewards' && <RewardsModal />}
          {activeTab === 'pos_settlement' && <MerchantSettlementScreen />}
          {activeTab === 'rider_hub' && <RiderHubScreen />}
          {activeTab === 'admin_portal' && <AdminHQScreen />}
          {activeTab === 'profile' && <HomeScreen />}
        </main>

        {/* Bottom Floating Navigation (Customer only) */}
        {isCustomerScreen && <BottomNavigation />}

        {/* Floating Quick Cart Pop-up Widget (Customer only) */}
        {isCustomerScreen && <FloatingQuickCart />}

        {/* Floating Modals & Drawers */}
        {selectedRestaurant && (
          <RestaurantDetailModal
            restaurant={selectedRestaurant}
            onClose={() => setSelectedRestaurant(null)}
          />
        )}

        {isCartOpen && (
          <CartDrawer
            onClose={() => setIsCartOpen(false)}
            onProceedToCheckout={() => {
              setIsCartOpen(false);
              setIsCheckoutOpen(true);
            }}
          />
        )}

        {isCheckoutOpen && (
          <CheckoutModal onClose={() => setIsCheckoutOpen(false)} />
        )}

        {isTrackingOpen && (
          <LiveTrackingModal onClose={() => setIsTrackingOpen(false)} />
        )}

        <ReviewModal />

        {isNotificationsOpen && (
          <NotificationsModal onClose={() => setIsNotificationsOpen(false)} />
        )}

        {isTopUpOpen && (
          <WalletTopUpModal onClose={() => setIsTopUpOpen(false)} />
        )}

        {(isAuthModalOpen || activeTab === 'profile') && (
          <AuthModal 
            onClose={() => {
              setIsAuthModalOpen(false);
              if (activeTab === 'profile') {
                setActiveTab('home');
              }
            }} 
          />
        )}

        {/* Merchant GP Social Auth & Registration Modal */}
        <MerchantSocialAuthModal 
          isOpen={isMerchantAuthModalOpen} 
          onClose={() => setIsMerchantAuthModalOpen(false)} 
        />

        {/* Merchant GP Calculator & Simulator Modal */}
        <MerchantGpCalculatorModal
          isOpen={isGpCalculatorOpen}
          onClose={() => setIsGpCalculatorOpen(false)}
        />

        {/* Global Toast Notification */}
        {toast && toast.visible && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-70 max-w-sm w-[90%] bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
            <span className="text-xl">
              {toast.type === 'success' ? '🎉' : toast.type === 'reward' ? '💸' : 'ℹ️'}
            </span>
            <div className="flex-1">
              <h4 className="font-bold text-xs text-white">{toast.title}</h4>
              <p className="text-[11px] text-slate-300 mt-0.5">{toast.message}</p>
            </div>
          </div>
        )}
      </div>
    </DeviceFrame>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
