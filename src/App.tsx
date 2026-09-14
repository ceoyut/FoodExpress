import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { DeviceFrame } from './components/DeviceFrame';
import { Header } from './components/Header';
import { BottomNavigation } from './components/BottomNavigation';
import { HomeScreen } from './screens/HomeScreen';
import { OrdersScreen } from './screens/OrdersScreen';
import { RewardsModal } from './components/RewardsModal';
import { RestaurantDetailModal } from './components/RestaurantDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { LiveTrackingModal } from './components/LiveTrackingModal';
import { ReviewModal } from './components/ReviewModal';
import { NotificationsModal } from './components/NotificationsModal';
import { WalletTopUpModal } from './components/WalletTopUpModal';
import { AuthModal } from './components/AuthModal';
import { MerchantSettlementScreen } from './screens/MerchantSettlementScreen';
import { RiderHubScreen } from './screens/RiderHubScreen';

const AppContent: React.FC = () => {
  const { 
    activeTab, 
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
    toast 
  } = useApp();

  return (
    <DeviceFrame>
      <div className="flex flex-col h-full bg-slate-100 font-sans relative">
        {/* Fixed Header */}
        <Header />

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto pb-24 no-scrollbar">
          {activeTab === 'home' && <HomeScreen />}
          {activeTab === 'orders' && <OrdersScreen />}
          {activeTab === 'rewards' && <RewardsModal />}
          {activeTab === 'pos_settlement' && <MerchantSettlementScreen />}
          {activeTab === 'rider_hub' && <RiderHubScreen />}
          {activeTab === 'profile' && (
            <div className="p-4 sm:p-6">
              <AuthModal onClose={() => {}} />
            </div>
          )}
        </main>

        {/* Bottom Floating Navigation */}
        <BottomNavigation />

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

        {isAuthModalOpen && (
          <AuthModal onClose={() => setIsAuthModalOpen(false)} />
        )}

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
