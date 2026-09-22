import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Restaurant, 
  MenuItem, 
  CartItem, 
  Order, 
  PaymentMethod, 
  Review, 
  Coupon, 
  NotificationItem, 
  UserProfile, 
  DeviceViewMode,
  OrderStatus,
  ChatMessage,
  MerchantDailySettlement,
  MerchantSettlementConfig,
  MerchantBankAccount,
  RiderApplication,
  RiderQueueItem,
  DispatchQueueOrder,
  RiderPayoutSlip,
  RiderTripEarningRecord,
  ActiveRiderAccount,
  RiderShiftStatus,
  RiderApplicationStatus,
  UserGeoLocation,
  RiderReportedIssue,
  MerchantAccount,
  MerchantSocialProvider,
  MerchantGpTier,
  AdminRole,
  PlatformSystemConfig,
  AdminDisputeTicket
} from '../types';
import {
  INITIAL_PLATFORM_CONFIG,
  INITIAL_DISPUTES
} from '../data/adminData';
import { 
  DEFAULT_USER_LOCATION,
  requestDeviceGeolocation
} from '../utils/geolocation';
import { 
  INITIAL_USER, 
  DEMO_CUSTOMER_ACCOUNTS,
  RESTAURANTS_DATA, 
  INITIAL_REVIEWS, 
  AVAILABLE_COUPONS, 
  INITIAL_NOTIFICATIONS, 
  DEFAULT_RIDER,
  INITIAL_ORDERS
} from '../data/mockData';
import {
  INITIAL_MERCHANT_SETTLEMENTS,
  computeMerchantSettlement,
  generateMockReconciledOrders
} from '../data/merchantSettlementData';
import {
  INITIAL_MERCHANT_ACCOUNTS
} from '../data/merchantAuthData';
import {
  DELIVERY_ZONES,
  DeliveryZone,
  INITIAL_ACTIVE_RIDER,
  INITIAL_RIDER_APPLICATIONS,
  INITIAL_ZONE_QUEUE,
  INITIAL_DISPATCH_ORDERS,
  INITIAL_RIDER_EARNINGS_HISTORY,
  INITIAL_RIDER_PAYOUT_SLIPS
} from '../data/riderData';
import { TRANSLATIONS, Language } from '../data/translations';
import { createCloudOrder, subscribeToOrders } from '../lib/firebase';
import { calculateThaiRiderFare, calculateStandardDeliveryFee } from '../utils/riderFareCalculator';
import { getRestaurantDistance } from '../utils/geolocation';
import { merchantOrderAudio } from '../utils/merchantOrderAudio';

interface ToastState {
  title: string;
  message: string;
  type: 'success' | 'info' | 'reward';
  visible: boolean;
}

interface AppContextType {
  // User & Wallet
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  updateUserProfile: (data: Partial<UserProfile>) => void;
  loginAs: (provider: UserProfile['loginProvider']) => void;
  topUpWallet: (amount: number) => void;
  setWalletBalance: (balance: number) => void;
  walletLowBalanceThreshold: number;
  setWalletLowBalanceThreshold: (threshold: number) => void;
  isWalletBalanceLow: boolean;
  toggleFavorite: (restaurantId: string) => void;

  // Language & Internationalization
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  
  // Cart
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  cartRestaurant: Restaurant | null;
  setCartRestaurant: React.Dispatch<React.SetStateAction<Restaurant | null>>;
  addToCart: (
    menuItem: MenuItem, 
    restaurant: Restaurant, 
    quantity: number, 
    options: { [group: string]: string }, 
    spicyLevel?: string, 
    notes?: string
  ) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartDeliveryFee: number;
  
  // Coupons & Rewards
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  setAppliedCoupon: (coupon: Coupon | null) => void;
  redeemCouponWithPoints: (couponId: string) => boolean;
  
  // Orders & Live Tracking
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;
  placeOrder: (
    paymentMethod: PaymentMethod, 
    address: string, 
    notes?: string
  ) => Promise<Order>;
  simulateIncomingOrder: (restaurantId: string) => Order;
  reorderOrder: (order: Order) => {
    items: CartItem[];
    subtotal: number;
    deliveryFee: number;
    total: number;
    totalQuantity: number;
  };
  cancelActiveOrder: () => void;
  speedUpTracking: () => void;
  updateOrderProgress: (pct: number, status?: OrderStatus, coords?: { x: number; y: number }) => void;
  simulationSpeed: 'normal' | 'fast';
  setSimulationSpeed: (speed: 'normal' | 'fast') => void;
  chatMessages: ChatMessage[];
  sendRiderMessage: (text: string) => void;
  
  // Reviews
  reviews: Review[];
  addReview: (
    restaurantId: string, 
    orderId: string | undefined, 
    rating: number, 
    comment: string, 
    tags?: string[], 
    foodRating?: number, 
    riderRating?: number
  ) => void;
  
  // Notifications
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'> & Partial<NotificationItem>) => void;
  
  // UI & View State
  deviceMode: DeviceViewMode;
  setDeviceMode: (mode: DeviceViewMode) => void;
  activeTab: 'home' | 'orders' | 'rewards' | 'profile' | 'pos_settlement' | 'rider_hub' | 'admin_portal';
  setActiveTab: (tab: 'home' | 'orders' | 'rewards' | 'profile' | 'pos_settlement' | 'rider_hub' | 'admin_portal') => void;
  selectedRestaurant: Restaurant | null;
  setSelectedRestaurant: (r: Restaurant | null) => void;

  // Geolocation & User Proximity State
  userLocation: UserGeoLocation;
  setUserLocation: React.Dispatch<React.SetStateAction<UserGeoLocation>>;
  geoStatus: 'idle' | 'locating' | 'success' | 'error';
  geoErrorMessage: string | null;
  refreshDeviceGeolocation: () => Promise<boolean>;

  // Merchant Daily Payout & GP Settlement System
  merchantSettlements: MerchantDailySettlement[];
  selectedSettlementRestId: string;
  setSelectedSettlementRestId: (id: string) => void;
  selectedSettlementDate: string;
  setSelectedSettlementDate: (date: string) => void;
  runEodSettlementCalculation: (restaurantId: string, date: string) => void;
  approveAndTransferPayout: (settlementId: string) => void;
  updateMerchantConfig: (restaurantId: string, newConfig: Partial<MerchantSettlementConfig>) => void;
  updateMerchantBank: (restaurantId: string, newBank: Partial<MerchantBankAccount>) => void;
  
  // Merchant Social Auth & GP Onboarding
  merchantAccounts: MerchantAccount[];
  activeMerchant: MerchantAccount | null;
  setActiveMerchant: React.Dispatch<React.SetStateAction<MerchantAccount | null>>;
  loginMerchantAs: (provider: MerchantSocialProvider, restaurantId?: string) => void;
  signupMerchant: (merchantData: Omit<MerchantAccount, 'id' | 'joinedDate'>) => MerchantAccount;
  logoutMerchant: () => void;
  isMerchantAuthModalOpen: boolean;
  setIsMerchantAuthModalOpen: (open: boolean) => void;
  isGpCalculatorOpen: boolean;
  setIsGpCalculatorOpen: (open: boolean) => void;

  // Rider Management Systems (Registration, Queue, Payout)
  activeRider: ActiveRiderAccount;
  setActiveRider: React.Dispatch<React.SetStateAction<ActiveRiderAccount>>;
  riderApplications: RiderApplication[];
  selectedZoneId: string;
  setSelectedZoneId: (zoneId: string) => void;
  deliveryZones: DeliveryZone[];
  zoneRiderQueue: RiderQueueItem[];
  dispatchOrders: DispatchQueueOrder[];
  riderEarningsHistory: RiderTripEarningRecord[];
  riderPayoutSlips: RiderPayoutSlip[];
  activeIncomingTrip: DispatchQueueOrder | null;
  setActiveIncomingTrip: (trip: DispatchQueueOrder | null) => void;
  activeDeliveringTrip: DispatchQueueOrder | null;
  setActiveDeliveringTrip: (trip: DispatchQueueOrder | null) => void;
  deliveryStepIndex: number;
  setDeliveryStepIndex: (step: number) => void;
  submitRiderApplication: (appData: Omit<RiderApplication, 'id' | 'submittedAt' | 'status'>) => void;
  updateApplicationStatus: (appId: string, status: RiderApplicationStatus, reason?: string) => void;
  toggleRiderShiftStatus: () => void;
  setRiderShiftStatusManual: (status: RiderShiftStatus) => void;
  acceptIncomingTrip: (orderId: string) => void;
  declineIncomingTrip: (orderId: string) => void;
  advanceDeliveringStep: () => void;
  withdrawRiderEarnings: (amount: number, method: 'promptpay' | 'bank_account') => RiderPayoutSlip | null;
  triggerSimulatedIncomingOrder: () => void;
  riderIssues: RiderReportedIssue[];
  reportRiderIssue: (issue: Omit<RiderReportedIssue, 'id' | 'reportedAt' | 'status'>) => RiderReportedIssue;
  resolveRiderIssue: (issueId: string, note?: string) => void;
  
  // Modals & Popups
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isQuickCartPopupOpen: boolean;
  setIsQuickCartPopupOpen: (open: boolean) => void;
  lastAddedCartItemName: string | null;
  setLastAddedCartItemName: (name: string | null) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isTrackingOpen: boolean;
  setIsTrackingOpen: (open: boolean) => void;
  isTopUpOpen: boolean;
  setIsTopUpOpen: (open: boolean) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  isReviewModalOpen: boolean;
  setIsReviewModalOpen: (open: boolean) => void;
  reviewingOrder: Order | null;
  setReviewingOrder: (order: Order | null) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  
  // Admin & HQ Management Portal
  adminRole: AdminRole;
  setAdminRole: (role: AdminRole) => void;
  platformConfig: PlatformSystemConfig;
  updatePlatformConfig: (newConfig: Partial<PlatformSystemConfig>) => void;
  disputeTickets: AdminDisputeTicket[];
  resolveDisputeTicket: (ticketId: string, action: 'refund' | 'reject', refundMethod?: 'wallet_credit' | 'promptpay_refund') => void;
  reassignOrderRider: (orderId: string, newRiderName: string) => void;
  cancelOrderByAdmin: (orderId: string, reason: string) => void;

  // Cloud & Feedback
  cloudSyncState: 'synced' | 'syncing';
  toast: ToastState | null;
  triggerToast: (title: string, message: string, type?: 'success' | 'info' | 'reward') => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  USER: 'foodexpress_user_v2',
  CART: 'foodexpress_cart_v2',
  CART_REST: 'foodexpress_cart_rest_v2',
  ORDERS: 'foodexpress_orders_v2',
  ACTIVE_ORDER: 'foodexpress_active_order_v2',
  REVIEWS: 'foodexpress_reviews_v2',
  COUPONS: 'foodexpress_coupons_v2',
  NOTIFS: 'foodexpress_notifs_v2',
  DEVICE: 'foodexpress_device_v2',
  MERCHANT_SETTLEMENTS: 'foodexpress_merchant_settlements_v2',
  MERCHANT_ACCOUNTS: 'foodexpress_merchant_accounts_v2',
  ACTIVE_MERCHANT: 'foodexpress_active_merchant_v2',
  RIDER_ACCOUNT: 'foodexpress_rider_account_v2',
  RIDER_APPLICATIONS: 'foodexpress_rider_apps_v2',
  RIDER_QUEUE: 'foodexpress_rider_queue_v2',
  RIDER_DISPATCH_ORDERS: 'foodexpress_rider_dispatch_orders_v2',
  RIDER_EARNINGS: 'foodexpress_rider_earnings_v2',
  RIDER_PAYOUT_SLIPS: 'foodexpress_rider_payout_slips_v2',
  RIDER_ISSUES: 'foodexpress_rider_issues_v2',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state with local storage fallback
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      return saved ? JSON.parse(saved) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [cartRestaurant, setCartRestaurant] = useState<Restaurant | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART_REST);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved && JSON.parse(saved).length > 0 ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // Listen to orders from Firebase Cloud Firestore in real time
  useEffect(() => {
    const unsub = subscribeToOrders((cloudOrders) => {
      if (!cloudOrders || cloudOrders.length === 0) return;
      setOrders(prev => {
        const merged = [...prev];
        cloudOrders.forEach(co => {
          const idx = merged.findIndex(o => o.id === co.id);
          const mappedOrder: Order = {
            id: co.id,
            restaurantId: co.restaurantId,
            restaurantName: co.restaurantName,
            restaurantLogo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100&auto=format&fit=crop&q=60',
            items: co.items?.map(it => ({
              cartItemId: it.id,
              menuItem: {
                id: it.id,
                restaurantId: co.restaurantId,
                name: it.name,
                price: it.price,
                description: '',
                image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
                category: 'ยอดนิยม',
                isPopular: true
              },
              restaurantId: co.restaurantId,
              restaurantName: co.restaurantName,
              quantity: it.quantity,
              unitPrice: it.price,
              selectedOptions: {}
            })) || [],
            status: (co.orderStatus === 'completed' ? 'delivered' : (co.orderStatus === 'delivering' ? 'on_the_way' : (co.orderStatus === 'rider_pickup' ? 'picked_up' : 'preparing'))) as any,
            subtotal: co.subtotal || co.totalAmount,
            deliveryFee: co.deliveryFee || 0,
            discountAmount: co.discount || 0,
            pointsUsed: 0,
            total: co.totalAmount,
            pointsEarned: Math.floor(co.totalAmount / 10),
            paymentMethod: (co.paymentMethod as any) || 'promptpay_qr',
            paymentStatus: (co.paymentStatus as any) || 'paid',
            deliveryAddress: co.deliveryAddress,
            createdAt: typeof co.createdAt === 'string' ? co.createdAt : 'เมื่อสักครู่',
            estimatedDeliveryMinutes: 20,
            rider: { ...DEFAULT_RIDER },
            riderProgressPct: co.orderStatus === 'completed' ? 100 : (co.orderStatus === 'delivering' ? 70 : 30),
            riderCurrentLocation: { x: 50, y: 50 },
            hasReviewed: false
          };
          if (idx > -1) {
            merged[idx] = { ...merged[idx], ...mappedOrder };
          } else {
            merged.unshift(mappedOrder);
          }
        });
        return merged;
      });
    });

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const [activeOrder, setActiveOrder] = useState<Order | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_ORDER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COUPONS);
      return saved ? JSON.parse(saved) : AVAILABLE_COUPONS;
    } catch {
      return AVAILABLE_COUPONS;
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [toast, setToast] = useState<ToastState | null>(null);
  const [cloudSyncState, setCloudSyncState] = useState<'synced' | 'syncing'>('synced');

  const triggerToast = useCallback((title: string, message: string, type: 'success' | 'info' | 'reward' = 'success') => {
    setToast({ title, message, type, visible: true });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  }, []);

  const addNotification = useCallback((item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'> & Partial<NotificationItem>) => {
    const newItem: NotificationItem = {
      id: item.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: item.timestamp || 'เมื่อสักครู่',
      read: item.read ?? false,
      title: item.title,
      body: item.body,
      type: item.type || 'system',
      actionText: item.actionText,
      targetId: item.targetId,
      badge: item.badge,
    };
    setNotifications(prev => [newItem, ...prev]);
  }, []);

  const [deviceMode, setDeviceMode] = useState<DeviceViewMode>('responsive');
  const [activeTab, setActiveTab] = useState<'home' | 'orders' | 'rewards' | 'profile' | 'pos_settlement' | 'rider_hub' | 'admin_portal'>('home');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  // Language & Internationalization State
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('foodexpress_lang');
      return saved === 'en' || saved === 'th' ? saved : 'th';
    } catch {
      return 'th';
    }
  });

  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('foodexpress_lang', newLang);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const langSet = TRANSLATIONS[language] || TRANSLATIONS.th;
    let text = (langSet as unknown as Record<string, string>)[key] || (TRANSLATIONS.th as unknown as Record<string, string>)[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return text;
  }, [language]);

  // Wallet Low Balance Threshold State
  const [walletLowBalanceThreshold, setWalletLowBalanceThresholdState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('foodexpress_wallet_threshold');
      return saved ? Number(saved) : 150;
    } catch {
      return 150;
    }
  });

  const setWalletLowBalanceThreshold = useCallback((threshold: number) => {
    setWalletLowBalanceThresholdState(threshold);
    try {
      localStorage.setItem('foodexpress_wallet_threshold', String(threshold));
    } catch {
      // ignore
    }
  }, []);

  const setWalletBalance = useCallback((balance: number) => {
    setUser(prev => ({
      ...prev,
      walletBalance: balance,
    }));
  }, []);

  const isWalletBalanceLow = user.walletBalance < walletLowBalanceThreshold;

  // POS & Merchant Daily Settlements State
  const [merchantSettlements, setMerchantSettlements] = useState<MerchantDailySettlement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MERCHANT_SETTLEMENTS);
      return saved ? JSON.parse(saved) : INITIAL_MERCHANT_SETTLEMENTS;
    } catch {
      return INITIAL_MERCHANT_SETTLEMENTS;
    }
  });

  const [selectedSettlementRestId, setSelectedSettlementRestId] = useState<string>('rest_kanda_roimor');
  const [selectedSettlementDate, setSelectedSettlementDate] = useState<string>('2026-09-12');

  // Persist merchant settlements
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MERCHANT_SETTLEMENTS, JSON.stringify(merchantSettlements));
    } catch (err) {
      console.error('Failed to save settlements:', err);
    }
  }, [merchantSettlements]);

  // Run End-of-Day POS Settlement calculation for a merchant
  const runEodSettlementCalculation = useCallback((restaurantId: string, dateStr: string) => {
    setCloudSyncState('syncing');

    setMerchantSettlements(prev => {
      const existing = prev.find(s => s.restaurantId === restaurantId && s.date === dateStr);
      const orders = existing?.reconciledOrders && existing.reconciledOrders.length > 0
        ? existing.reconciledOrders
        : generateMockReconciledOrders(restaurantId, dateStr);

      const computed = computeMerchantSettlement(
        restaurantId,
        dateStr,
        dateStr === '2026-09-12' ? 'วันนี้ (12 ก.ย. 2026)' : dateStr === '2026-09-11' ? 'เมื่อวานนี้ (11 ก.ย. 2026)' : dateStr,
        orders,
        existing?.config,
        existing?.bankAccount
      );

      // Keep transfer status if already paid
      if (existing?.status === 'paid') {
        computed.status = 'paid';
        computed.transferRefNumber = existing.transferRefNumber;
        computed.transferredAt = existing.transferredAt;
      } else {
        computed.status = 'calculated';
      }

      const others = prev.filter(s => !(s.restaurantId === restaurantId && s.date === dateStr));
      return [computed, ...others];
    });

    setTimeout(() => {
      setCloudSyncState('synced');
      const restName = RESTAURANTS_DATA.find(r => r.id === restaurantId)?.name || 'ร้านค้า';
      triggerToast(
        'คำนวณยอดปิดวัน POS สำเร็จ!',
        `คำนวณยอดเงินสุทธิและตรวจสอบรายการขายของ ${restName} ประจำวันที่ ${dateStr} เรียบร้อยแล้ว`,
        'success'
      );
    }, 400);
  }, []);

  // Approve & execute payout to merchant bank account
  const approveAndTransferPayout = useCallback((settlementId: string) => {
    setCloudSyncState('syncing');

    const now = new Date();
    const nowTimeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    const refNum = `TXN-KBANK-${Date.now().toString().slice(-8)}`;

    setMerchantSettlements(prev => {
      return prev.map(s => {
        if (s.id === settlementId) {
          return {
            ...s,
            status: 'paid' as const,
            transferRefNumber: refNum,
            transferredAt: `วันนี้ เวลา ${nowTimeStr} น.`,
          };
        }
        return s;
      });
    });

    // Confetti celebration for successful transfer
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#059669', '#34D399', '#FBBF24']
      });
    } catch {
      // safe ignore
    }

    setTimeout(() => {
      setCloudSyncState('synced');
      triggerToast(
        'โอนเงินเข้าบัญชีร้านค้าสำเร็จ! 💸',
        `โอนยอดเงินสุทธิเข้าบัญชีเรียบร้อย เลขที่อ้างอิง: ${refNum}`,
        'reward'
      );
    }, 400);
  }, []);

  // Update merchant contract GP & tax settings
  const updateMerchantConfig = useCallback((restaurantId: string, newConfig: Partial<MerchantSettlementConfig>) => {
    setMerchantSettlements(prev => {
      return prev.map(s => {
        if (s.restaurantId === restaurantId) {
          const mergedConfig = { ...s.config, ...newConfig };
          return computeMerchantSettlement(
            s.restaurantId,
            s.date,
            s.dateDisplayTh,
            s.reconciledOrders,
            mergedConfig,
            s.bankAccount
          );
        }
        return s;
      });
    });

    triggerToast('บันทึกเงื่อนไขร้านค้าแล้ว', 'อัปเดตอัตรา GP และการคำนวณภาษีร้านค้าสำเร็จ', 'info');
  }, []);

  // Update merchant bank account
  const updateMerchantBank = useCallback((restaurantId: string, newBank: Partial<MerchantBankAccount>) => {
    setMerchantSettlements(prev => {
      return prev.map(s => {
        if (s.restaurantId === restaurantId) {
          return {
            ...s,
            bankAccount: { ...s.bankAccount, ...newBank }
          };
        }
        return s;
      });
    });

    triggerToast('อัปเดตบัญชีรับเงินสำเร็จ', 'ข้อมูลธนาคารและพร้อมเพย์ของร้านค้าได้รับการบันทึกแล้ว', 'success');
  }, []);

  // =========================================================================
  // MERCHANT SOCIAL AUTH & GP REGISTRATION SYSTEM
  // =========================================================================
  const [merchantAccounts, setMerchantAccounts] = useState<MerchantAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MERCHANT_ACCOUNTS);
      return saved ? JSON.parse(saved) : INITIAL_MERCHANT_ACCOUNTS;
    } catch {
      return INITIAL_MERCHANT_ACCOUNTS;
    }
  });

  const [activeMerchant, setActiveMerchant] = useState<MerchantAccount | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_MERCHANT);
      if (saved) return JSON.parse(saved);
      return INITIAL_MERCHANT_ACCOUNTS[0] || null;
    } catch {
      return INITIAL_MERCHANT_ACCOUNTS[0] || null;
    }
  });

  const [isMerchantAuthModalOpen, setIsMerchantAuthModalOpen] = useState<boolean>(false);
  const [isGpCalculatorOpen, setIsGpCalculatorOpen] = useState<boolean>(false);

  // Persist merchant accounts & active session
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MERCHANT_ACCOUNTS, JSON.stringify(merchantAccounts));
    } catch (err) {
      console.error('Failed to save merchant accounts:', err);
    }
  }, [merchantAccounts]);

  useEffect(() => {
    try {
      if (activeMerchant) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_MERCHANT, JSON.stringify(activeMerchant));
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_MERCHANT);
      }
    } catch (err) {
      console.error('Failed to save active merchant:', err);
    }
  }, [activeMerchant]);

  // Social login for merchant
  const loginMerchantAs = useCallback((provider: MerchantSocialProvider, restaurantId?: string) => {
    const target = merchantAccounts.find(m => 
      (restaurantId ? m.restaurantId === restaurantId : true) && 
      (m.socialProvider === provider || !restaurantId)
    ) || merchantAccounts.find(m => m.socialProvider === provider) || merchantAccounts[0];

    if (target) {
      setActiveMerchant(target);
      setSelectedSettlementRestId(target.restaurantId);
      triggerToast(
        'เข้าสู่ระบบร้านค้าสำเร็จ! 🏪',
        `เข้าสู่ระบบด้วยบัญชี ${provider.toUpperCase()} (ร้าน: ${target.restaurantName})`,
        'success'
      );
    }
  }, [merchantAccounts, triggerToast]);

  // Register / Sign up new merchant with chosen GP package
  const signupMerchant = useCallback((merchantData: Omit<MerchantAccount, 'id' | 'joinedDate'>): MerchantAccount => {
    const newId = `merch_act_${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    const createdMerchant: MerchantAccount = {
      ...merchantData,
      id: newId,
      joinedDate: today,
    };

    setMerchantAccounts(prev => [createdMerchant, ...prev]);
    setActiveMerchant(createdMerchant);
    setSelectedSettlementRestId(createdMerchant.restaurantId);

    // Bootstrap initial settlement configuration for this new merchant
    const initialConfig: MerchantSettlementConfig = {
      gpRatePct: createdMerchant.gpRatePct,
      paymentFeePct: 1.5,
      vatPct: 7,
      whtPct: createdMerchant.isCorporate ? 3 : 0,
      isCorporate: createdMerchant.isCorporate,
      autoTransferTime: '14:00 น.',
      enableInstantPushNotifications: true,
      minPendingPayoutThreshold: 3000,
      enablePendingPayoutAlert: true,
    };

    // Bootstrap mock reconciled orders for instant settlement view
    const initialOrders = generateMockReconciledOrders(createdMerchant.restaurantId, '2026-09-12');
    const computed = computeMerchantSettlement(
      createdMerchant.restaurantId,
      '2026-09-12',
      'วันนี้ (12 ก.ย. 2026)',
      initialOrders,
      initialConfig,
      createdMerchant.bankAccount
    );

    // Override restaurant display name
    computed.restaurantName = createdMerchant.restaurantName;
    if (createdMerchant.restaurantLogo) {
      computed.restaurantLogo = createdMerchant.restaurantLogo;
    }

    setMerchantSettlements(prev => [computed, ...prev]);

    return createdMerchant;
  }, []);

  // Merchant logout
  const logoutMerchant = useCallback(() => {
    setActiveMerchant(null);
  }, []);

  // =========================================================================
  // RIDER MANAGEMENT STATE & LOGIC
  // 1. Rider Registration & Application
  // 2. Queue & Dispatch System
  // 3. Rider Earnings & Payout Settlement System
  // =========================================================================

  const [activeRider, setActiveRider] = useState<ActiveRiderAccount>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RIDER_ACCOUNT);
      return saved ? JSON.parse(saved) : INITIAL_ACTIVE_RIDER;
    } catch {
      return INITIAL_ACTIVE_RIDER;
    }
  });

  const [riderApplications, setRiderApplications] = useState<RiderApplication[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RIDER_APPLICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_RIDER_APPLICATIONS;
    } catch {
      return INITIAL_RIDER_APPLICATIONS;
    }
  });

  const [selectedZoneId, setSelectedZoneId] = useState<string>('zone_sukhumvit');
  const [deliveryZones] = useState<DeliveryZone[]>(DELIVERY_ZONES);

  const [zoneRiderQueue, setZoneRiderQueue] = useState<RiderQueueItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RIDER_QUEUE);
      return saved ? JSON.parse(saved) : INITIAL_ZONE_QUEUE;
    } catch {
      return INITIAL_ZONE_QUEUE;
    }
  });

  const [dispatchOrders, setDispatchOrders] = useState<DispatchQueueOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RIDER_DISPATCH_ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_DISPATCH_ORDERS;
    } catch {
      return INITIAL_DISPATCH_ORDERS;
    }
  });

  const [riderEarningsHistory, setRiderEarningsHistory] = useState<RiderTripEarningRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RIDER_EARNINGS);
      return saved ? JSON.parse(saved) : INITIAL_RIDER_EARNINGS_HISTORY;
    } catch {
      return INITIAL_RIDER_EARNINGS_HISTORY;
    }
  });

  const [riderPayoutSlips, setRiderPayoutSlips] = useState<RiderPayoutSlip[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RIDER_PAYOUT_SLIPS);
      return saved ? JSON.parse(saved) : INITIAL_RIDER_PAYOUT_SLIPS;
    } catch {
      return INITIAL_RIDER_PAYOUT_SLIPS;
    }
  });

  // Rider reported issues (hands-free voice incident reports)
  const [riderIssues, setRiderIssues] = useState<RiderReportedIssue[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RIDER_ISSUES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active incoming order alert (for rider queue matching)
  const [activeIncomingTrip, setActiveIncomingTrip] = useState<DispatchQueueOrder | null>(() => {
    return INITIAL_DISPATCH_ORDERS.find(o => o.status === 'offered') || null;
  });

  // Active accepted trip currently in delivery process (0: To store, 1: Picked up, 2: To customer, 3: Completed)
  const [activeDeliveringTrip, setActiveDeliveringTrip] = useState<DispatchQueueOrder | null>(null);
  const [deliveryStepIndex, setDeliveryStepIndex] = useState<number>(0);

  // Audio chime synthesizer for rider alerts & payouts
  const playRiderChime = useCallback((type: 'dispatch_alert' | 'cash_payout' | 'step_done') => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      if (type === 'dispatch_alert') {
        // High-energy two-tone chime for incoming delivery offer
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1108.73, now + 0.14);
        osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.28);
        gain2.gain.setValueAtTime(0.3, now + 0.14);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.14);
        osc2.stop(now + 0.45);
      } else if (type === 'cash_payout') {
        // Cash register arpeggio chime
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);
          gain.gain.setValueAtTime(0.25, now + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.3);
        });
      } else if (type === 'step_done') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch {
      // safe fallback
    }
  }, []);

  // Persist rider data
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RIDER_ACCOUNT, JSON.stringify(activeRider));
      localStorage.setItem(STORAGE_KEYS.RIDER_APPLICATIONS, JSON.stringify(riderApplications));
      localStorage.setItem(STORAGE_KEYS.RIDER_QUEUE, JSON.stringify(zoneRiderQueue));
      localStorage.setItem(STORAGE_KEYS.RIDER_DISPATCH_ORDERS, JSON.stringify(dispatchOrders));
      localStorage.setItem(STORAGE_KEYS.RIDER_EARNINGS, JSON.stringify(riderEarningsHistory));
      localStorage.setItem(STORAGE_KEYS.RIDER_PAYOUT_SLIPS, JSON.stringify(riderPayoutSlips));
      localStorage.setItem(STORAGE_KEYS.RIDER_ISSUES, JSON.stringify(riderIssues));
    } catch (err) {
      console.error('Failed to save rider state:', err);
    }
  }, [activeRider, riderApplications, zoneRiderQueue, dispatchOrders, riderEarningsHistory, riderPayoutSlips, riderIssues]);

  // Submit Rider Application
  const submitRiderApplication = useCallback((appData: Omit<RiderApplication, 'id' | 'submittedAt' | 'status'>) => {
    setCloudSyncState('syncing');

    const now = new Date();
    const dateStr = now.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const appId = `app_${Date.now()}`;

    const newApp: RiderApplication = {
      ...appData,
      id: appId,
      submittedAt: dateStr,
      status: 'approved', // Auto-approved for seamless interactive demo
      approvedAt: dateStr,
    };

    setRiderApplications(prev => [newApp, ...prev]);

    // Activate this rider profile
    setActiveRider(prev => ({
      ...prev,
      name: appData.fullName,
      phone: appData.phone,
      vehicle: `${appData.vehicleBrandModel} (${appData.licensePlate})`,
      licensePlate: appData.licensePlate,
      vehicleType: appData.vehicleType,
      preferredZone: appData.preferredZone,
      bankAccount: {
        bankName: appData.bankName,
        accountNumber: appData.bankAccountNumber,
        accountName: appData.fullName,
        promptPayId: appData.promptPayId,
      },
      applicationStatus: 'approved',
      shiftStatus: 'in_queue',
      currentQueuePosition: 1,
    }));

    playRiderChime('cash_payout');
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#10B981', '#059669', '#3B82F6', '#F59E0B']
      });
    } catch {
      // safe
    }

    addNotification({
      title: '🎉 ยินดีต้อนรับพนักงานจัดส่งใหม่!',
      body: `ใบสมัครของคุณ (${appData.fullName}) ได้รับการอนุมัติแล้ว พร้อมเริ่มรับงานจัดส่งและสร้างรายได้ได้ทันที 🛵`,
      type: 'system',
      badge: 'ไรเดอร์ใหม่',
    });

    triggerToast(
      'สมัครพนักงานจัดส่งสำเร็จ! 🎉',
      `ยินดีต้อนรับคุณ ${appData.fullName}! บัญชีได้รับการอนุมัติและเข้าสู่คิวรับงานเรียบร้อยแล้ว`,
      'success'
    );

    setTimeout(() => {
      setCloudSyncState('synced');
    }, 400);
  }, [playRiderChime]);

  // Update applicant status (admin / reviewer view)
  const updateApplicationStatus = useCallback((appId: string, status: RiderApplicationStatus, reason?: string) => {
    setRiderApplications(prev => prev.map(app => {
      if (app.id === appId) {
        return {
          ...app,
          status,
          rejectionReason: reason,
          approvedAt: status === 'approved' ? new Date().toLocaleString('th-TH') : app.approvedAt,
        };
      }
      return app;
    }));

    if (status === 'approved') {
      playRiderChime('step_done');
      triggerToast('อนุมัติพนักงานจัดส่งแล้ว', 'เปิดสิทธิ์เข้าสู่ระบบคิวรับออเดอร์เรียบร้อย', 'success');
    } else {
      triggerToast('อัปเดตสถานะใบสมัครแล้ว', `เปลี่ยนสถานะเป็น ${status}`, 'info');
    }
  }, [playRiderChime]);

  // Toggle shift status
  const toggleRiderShiftStatus = useCallback(() => {
    setActiveRider(prev => {
      const nextStatus: RiderShiftStatus = prev.shiftStatus === 'offline' ? 'in_queue' : 'offline';
      const pos = nextStatus === 'in_queue' ? 2 : undefined;
      return {
        ...prev,
        shiftStatus: nextStatus,
        currentQueuePosition: pos,
      };
    });

    playRiderChime('step_done');
    triggerToast(
      activeRider.shiftStatus === 'offline' ? '🟢 ออนไลน์พร้อมรับงาน' : '🔴 พักกะ / ออฟไลน์',
      activeRider.shiftStatus === 'offline' ? 'คุณเข้าสู่คิวรอจ่ายงานในโซนแล้ว ระบบจะค้นหาออเดอร์ที่เหมาะสมให้ทันที' : 'คุณออกจากคิวเรียบร้อยแล้ว จะไม่ได้รับออเดอร์ใหม่',
      'info'
    );
  }, [activeRider.shiftStatus, playRiderChime]);

  const setRiderShiftStatusManual = useCallback((status: RiderShiftStatus) => {
    setActiveRider(prev => ({
      ...prev,
      shiftStatus: status,
      currentQueuePosition: status === 'in_queue' ? (prev.currentQueuePosition || 2) : undefined,
    }));
    playRiderChime('step_done');
  }, [playRiderChime]);

  // Accept incoming trip offer
  const acceptIncomingTrip = useCallback((orderId: string) => {
    const order = dispatchOrders.find(o => o.id === orderId) || activeIncomingTrip;
    if (!order) return;

    setActiveDeliveringTrip(order);
    setDeliveryStepIndex(0);
    setActiveIncomingTrip(null);
    setActiveRider(prev => ({
      ...prev,
      shiftStatus: 'busy_delivery',
      currentQueuePosition: undefined,
    }));

    setDispatchOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'accepted' as const } : o));

    playRiderChime('step_done');

    addNotification({
      title: '🛵 คุณได้รับออเดอร์ใหม่แล้ว!',
      body: `กรุณาเดินทางไปยังร้าน "${order.restaurantName}" เพื่อรับอาหาร (${order.itemsCount} รายการ)`,
      type: 'order',
      badge: 'กำลังจัดส่ง',
    });

    triggerToast(
      'รับออเดอร์จัดส่งสำเร็จ! 🛵',
      `กรุณามุ่งหน้าไปที่ร้าน ${order.restaurantName} ค่ารอบ ฿${order.totalTripEarnings.toFixed(2)}`,
      'success'
    );
  }, [dispatchOrders, activeIncomingTrip, playRiderChime]);

  // Decline incoming trip offer
  const declineIncomingTrip = useCallback((orderId: string) => {
    setActiveIncomingTrip(null);
    setActiveRider(prev => ({
      ...prev,
      shiftStatus: 'in_queue',
      currentQueuePosition: (prev.currentQueuePosition || 1) + 1,
    }));

    setDispatchOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'queued' as const, offeredToRiderId: undefined } : o));

    triggerToast('ข้ามออเดอร์แล้ว', 'ระบบส่งงานให้ไรเดอร์ในคิวถัดไป คุณยังคงอยู่ในคิวรอจ่ายงาน', 'info');
  }, []);

  // Advance delivering trip step
  const advanceDeliveringStep = useCallback(() => {
    if (!activeDeliveringTrip) return;

    if (deliveryStepIndex < 2) {
      const nextStep = deliveryStepIndex + 1;
      setDeliveryStepIndex(nextStep);
      playRiderChime('step_done');

      if (nextStep === 1) {
        triggerToast('รับอาหารจากร้านเรียบร้อย 🥡', `กำลังเดินทางไปส่งที่ ${activeDeliveringTrip.customerName}`, 'info');
      } else if (nextStep === 2) {
        triggerToast('ถึงที่หมายของลูกค้าแล้ว 📍', 'กำลังส่งมอบอาหารและตรวจสอบการรับสินค้า', 'info');
      }
    } else {
      // Complete delivery trip!
      const trip = activeDeliveringTrip;
      const earningsAmount = trip.totalTripEarnings;

      const newRecord: RiderTripEarningRecord = {
        id: `earn_${Date.now()}`,
        orderId: trip.orderNumber,
        restaurantName: trip.restaurantName,
        customerName: trip.customerName,
        distanceKm: trip.distanceKm,
        completedAt: 'เมื่อสักครู่',
        baseFee: trip.baseDeliveryFee,
        distanceFee: trip.distanceFee,
        peakBonus: trip.specialIncentive,
        tipAmount: trip.customerTip,
        grossEarnings: earningsAmount,
        netEarnings: earningsAmount,
        payoutStatus: 'available_to_withdraw',
      };

      setRiderEarningsHistory(prev => [newRecord, ...prev]);

      setActiveRider(prev => ({
        ...prev,
        walletBalance: prev.walletBalance + earningsAmount,
        totalEarnedToday: prev.totalEarnedToday + earningsAmount,
        todayTripsCount: prev.todayTripsCount + 1,
        totalLifetimeTrips: prev.totalLifetimeTrips + 1,
        totalLifetimeEarnings: prev.totalLifetimeEarnings + earningsAmount,
        shiftStatus: 'in_queue',
        currentQueuePosition: 3,
      }));

      setDispatchOrders(prev => prev.map(o => o.id === trip.id ? { ...o, status: 'delivered' as const } : o));
      setActiveDeliveringTrip(null);
      setDeliveryStepIndex(0);

      playRiderChime('cash_payout');
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#10B981', '#34D399', '#F59E0B', '#3B82F6']
        });
      } catch {
        // safe
      }

      addNotification({
        title: '💸 ยอดเงินเข้าวอลเล็ตไรเดอร์!',
        body: `การจัดส่งออเดอร์ ${trip.orderNumber} สำเร็จ รับเงินสุทธิ ฿${earningsAmount.toFixed(2)} (รวมทิป ฿${trip.customerTip}) พร้อมถอนได้ทันที`,
        type: 'reward',
        badge: '+฿' + earningsAmount.toFixed(0),
      });

      triggerToast(
        'จัดส่งสำเร็จ! รับเงินเข้ากระเป๋า 💸',
        `เพิ่มเงิน ฿${earningsAmount.toFixed(2)} เข้าสู่วอลเล็ตไรเดอร์เรียบร้อยแล้ว`,
        'reward'
      );
    }
  }, [activeDeliveringTrip, deliveryStepIndex, playRiderChime]);

  // Report issue from rider (via voice recognition or hands-free console)
  const reportRiderIssue = useCallback((issueData: Omit<RiderReportedIssue, 'id' | 'reportedAt' | 'status'>) => {
    const newIssue: RiderReportedIssue = {
      ...issueData,
      id: `issue_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      reportedAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
      status: 'acknowledged',
    };

    setRiderIssues(prev => [newIssue, ...prev]);

    playRiderChime('step_done');

    addNotification({
      title: `⚠️ แจ้งเหตุ: ${newIssue.categoryLabel}`,
      body: newIssue.description || newIssue.transcript,
      type: 'system',
      badge: 'แจ้งเหตุ',
    });

    triggerToast(
      language === 'th' ? '🚨 บันทึกรายงานปัญหาแล้ว' : '🚨 Incident Recorded',
      `${newIssue.categoryLabel}: ${newIssue.description || newIssue.transcript}`,
      'info'
    );

    return newIssue;
  }, [language, playRiderChime, addNotification, triggerToast]);

  const resolveRiderIssue = useCallback((issueId: string, note?: string) => {
    setRiderIssues(prev => prev.map(issue => 
      issue.id === issueId 
        ? { ...issue, status: 'resolved', resolvedNote: note || 'ศูนย์ช่วยเหลือตรวจสอบและประสานงานเรียบร้อย' } 
        : issue
    ));
    triggerToast(
      language === 'th' ? 'อัปเดตสถานะปัญหาแล้ว' : 'Issue Updated',
      'สถานะการแจ้งปัญหาได้รับการอัปเดตเป็นเรียบร้อยแล้ว',
      'success'
    );
  }, [language, triggerToast]);

  // Withdraw rider earnings to Bank or PromptPay
  const withdrawRiderEarnings = useCallback((amount: number, method: 'promptpay' | 'bank_account'): RiderPayoutSlip | null => {
    if (amount <= 0 || amount > activeRider.walletBalance) {
      triggerToast('ยอดเงินไม่ถูกต้อง', 'กรุณาระบุจำนวนเงินที่ต้องการถอนให้ถูกต้องและไม่เกินยอดคงเหลือ', 'info');
      return null;
    }

    setCloudSyncState('syncing');

    const now = new Date();
    const timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    const refNum = `PAY-RD-${Date.now().toString().slice(-8)}`;

    const destDetail = method === 'promptpay'
      ? `พร้อมเพย์: ${activeRider.bankAccount.promptPayId}`
      : `${activeRider.bankAccount.bankName} เลขที่ ${activeRider.bankAccount.accountNumber}`;

    const newSlip: RiderPayoutSlip = {
      id: `slip_${Date.now()}`,
      payoutRef: refNum,
      riderId: activeRider.id,
      riderName: activeRider.name,
      amount,
      fee: 0,
      netAmount: amount,
      destinationType: method,
      destinationDetail: destDetail,
      bankName: activeRider.bankAccount.bankName,
      transferredAt: `${dateStr}, ${timeStr} น.`,
      status: 'transferred',
      totalTripsIncluded: activeRider.todayTripsCount,
    };

    setActiveRider(prev => ({
      ...prev,
      walletBalance: Math.max(0, prev.walletBalance - amount),
    }));

    setRiderPayoutSlips(prev => [newSlip, ...prev]);

    // Mark matching earnings records as paid_out
    setRiderEarningsHistory(prev => {
      let remainingToMark = amount;
      return prev.map(rec => {
        if (rec.payoutStatus === 'available_to_withdraw' && remainingToMark > 0) {
          remainingToMark -= rec.netEarnings;
          return { ...rec, payoutStatus: 'paid_out' as const };
        }
        return rec;
      });
    });

    playRiderChime('cash_payout');
    try {
      confetti({
        particleCount: 110,
        spread: 85,
        origin: { y: 0.55 },
        colors: ['#10B981', '#34D399', '#FBBF24', '#60A5FA']
      });
    } catch {
      // safe
    }

    addNotification({
      title: '✅ โอนเงินให้พนักงานจัดส่งสำเร็จ!',
      body: `ระบบโอนเงินจำนวน ฿${amount.toLocaleString()} เข้า ${destDetail} เรียบร้อยแล้ว (เลขอ้างอิง: ${refNum})`,
      type: 'reward',
      badge: 'ถอนเงินสำเร็จ',
    });

    triggerToast(
      'โอนเงินเข้าบัญชีไรเดอร์สำเร็จ! 💸',
      `โอนเงิน ฿${amount.toLocaleString()} เข้า ${method === 'promptpay' ? 'พร้อมเพย์' : 'บัญชีธนาคาร'} เรียบร้อยแล้ว ฟรีค่าธรรมเนียม`,
      'reward'
    );

    setTimeout(() => {
      setCloudSyncState('synced');
    }, 300);

    return newSlip;
  }, [activeRider, playRiderChime]);

  // Trigger simulated incoming order offer
  const triggerSimulatedIncomingOrder = useCallback(() => {
    const currentZone = deliveryZones.find(z => z.id === selectedZoneId) || deliveryZones[0];
    const simulatedOrderId = `DSP-${Date.now().toString().slice(-4)}`;
    const randomRest = RESTAURANTS_DATA[Math.floor(Math.random() * RESTAURANTS_DATA.length)];
    const distance = Number((1.2 + Math.random() * 4.5).toFixed(1));
    const incentive = currentZone.surgeBonusPerTrip;
    const tip = [0, 15, 20, 30, 40][Math.floor(Math.random() * 5)];

    // Calculate rider fare using real Thai distance standard
    const thaiFare = calculateThaiRiderFare({
      distanceKm: distance,
      zoneType: currentZone.surgeBonusPerTrip > 0 ? 'bkk_cbd' : 'bkk_metro',
      isPeakHour: incentive > 0,
      customerTip: tip,
    });

    const newOffer: DispatchQueueOrder = {
      id: simulatedOrderId,
      orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
      restaurantId: randomRest.id,
      restaurantName: randomRest.name,
      restaurantLogo: randomRest.logoImage,
      restaurantAddress: randomRest.address,
      restaurantCoords: randomRest.coords,
      customerName: 'คุณลูกค้า (เดลิเวอรีด่วน)',
      customerPhone: '089-555-1234',
      customerAddress: `อาคารสำนักงานและคอนโดมิเนียม (${currentZone.name})`,
      customerCoords: { x: randomRest.coords.x + 8, y: randomRest.coords.y + 10 },
      distanceKm: distance,
      itemsCount: 2,
      itemsSummary: `${randomRest?.menu?.[0]?.name || 'ชุดอาหารพิเศษ'} x1, เครื่องดื่ม x1`,
      baseDeliveryFee: thaiFare.baseFare,
      distanceFee: thaiFare.distanceFee,
      specialIncentive: thaiFare.peakSurgeFee + thaiFare.longDistanceSubsidy,
      customerTip: tip,
      totalTripEarnings: thaiFare.totalRiderEarnings,
      matchedZone: currentZone.name,
      status: 'offered',
      offeredToRiderId: activeRider.id,
      createdAt: 'เมื่อสักครู่',
      estimatedPickupMinutes: 6,
    };

    setDispatchOrders(prev => [newOffer, ...prev]);
    setActiveIncomingTrip(newOffer);
    setActiveRider(prev => ({ ...prev, shiftStatus: 'online_ready', currentQueuePosition: 1 }));

    playRiderChime('dispatch_alert');

    addNotification({
      title: '🚨 มีออเดอร์ใหม่เสนอให้คุณ (คิดตามระยะทางจริง)!',
      body: `ร้าน ${randomRest.name} (${distance} กม.) รายได้รอบนี้ ฿${thaiFare.totalRiderEarnings.toFixed(2)} (ฐาน ฿${thaiFare.baseFare} + ระยะเกิน ฿${thaiFare.distanceFee}${tip > 0 ? ` + ทิป ฿${tip}` : ''})`,
      type: 'order',
      badge: 'ออเดอร์ใหม่',
    });

    triggerToast(
      '🚨 มีออเดอร์ใหม่เข้ามาในคิวของคุณ!',
      `ร้าน ${randomRest.name} (${distance} กม.) รายได้รอบนี้ ฿${thaiFare.totalRiderEarnings.toFixed(2)} ตอบรับเลย!`,
      'reward'
    );
  }, [selectedZoneId, deliveryZones, activeRider.id, playRiderChime]);

  // Modals & Popups
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isQuickCartPopupOpen, setIsQuickCartPopupOpen] = useState(false);
  const [lastAddedCartItemName, setLastAddedCartItemName] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewingOrder, setReviewingOrder] = useState<Order | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Admin Portal & Platform HQ Management States
  const [adminRole, setAdminRole] = useState<AdminRole>('super_admin');
  const [platformConfig, setPlatformConfig] = useState<PlatformSystemConfig>(() => {
    try {
      const saved = localStorage.getItem('foodexpress_platform_config');
      return saved ? JSON.parse(saved) : INITIAL_PLATFORM_CONFIG;
    } catch {
      return INITIAL_PLATFORM_CONFIG;
    }
  });
  const [disputeTickets, setDisputeTickets] = useState<AdminDisputeTicket[]>(() => {
    try {
      const saved = localStorage.getItem('foodexpress_dispute_tickets');
      return saved ? JSON.parse(saved) : INITIAL_DISPUTES;
    } catch {
      return INITIAL_DISPUTES;
    }
  });

  const updatePlatformConfig = useCallback((newConfig: Partial<PlatformSystemConfig>) => {
    setPlatformConfig(prev => {
      const updated = { ...prev, ...newConfig };
      try {
        localStorage.setItem('foodexpress_platform_config', JSON.stringify(updated));
      } catch {
        // safe
      }
      return updated;
    });
    triggerToast('อัปเดตการตั้งค่าระบบแล้ว ⚙️', 'บันทึกค่าพารามิเตอร์แพลตฟอร์มส่วนกลางเรียบร้อย', 'success');
  }, [triggerToast]);

  const resolveDisputeTicket = useCallback((ticketId: string, action: 'refund' | 'reject', refundMethod: 'wallet_credit' | 'promptpay_refund' = 'wallet_credit') => {
    setDisputeTickets(prev => {
      const target = prev.find(t => t.id === ticketId);
      if (!target) return prev;

      if (action === 'refund') {
        // Automatically credit customer wallet
        setUser(u => ({
          ...u,
          walletBalance: u.walletBalance + target.claimAmount
        }));
      }

      const updated = prev.map(t => {
        if (t.id === ticketId) {
          return {
            ...t,
            status: (action === 'refund' ? 'refunded' : 'rejected') as AdminDisputeTicket['status'],
            refundMethod
          };
        }
        return t;
      });

      try {
        localStorage.setItem('foodexpress_dispute_tickets', JSON.stringify(updated));
      } catch {
        // safe
      }

      return updated;
    });

    if (action === 'refund') {
      triggerToast('อนุมัติการคืนเงินเรียบร้อย 💸', 'ระบบโอนเงินชดเชยเข้ากระเป๋าวอลเล็ตของลูกค้าทันที', 'reward');
    } else {
      triggerToast('ปฏิเสธคำร้องข้อพิพาท', 'บันทึกผลการตรวจสอบคำร้องเรียบร้อย', 'info');
    }
  }, [triggerToast]);

  const reassignOrderRider = useCallback((orderId: string, newRiderName: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          rider: {
            ...o.rider,
            name: newRiderName,
            status: 'assigned'
          }
        };
      }
      return o;
    }));
    triggerToast('โอนมอบหมายงานสำเร็จ 🛵', `มอบหมายออเดอร์ ${orderId} ให้ไรเดอร์ ${newRiderName} แล้ว`, 'success');
  }, [triggerToast]);

  const cancelOrderByAdmin = useCallback((orderId: string, reason: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'cancelled' as OrderStatus
        };
      }
      return o;
    }));
    triggerToast('ยกเลิกออเดอร์โดยแอดมิน ⚠️', `ออเดอร์ถูกยกเลิกเนื่องจาก: ${reason} พร้อมระบบคืนเงินอัตโนมัติ`, 'info');
  }, [triggerToast]);

  // Simulation & Cloud
  const [simulationSpeed, setSimulationSpeed] = useState<'normal' | 'fast'>('fast');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_1',
      sender: 'rider',
      text: 'สวัสดีครับ ผมรับออเดอร์แล้ว กำลังรอร้านปรุงอาหารนะครับ 🙏',
      timestamp: 'เมื่อสักครู่',
    }
  ]);

  // Geolocation & Proximity State
  const [userLocation, setUserLocation] = useState<UserGeoLocation>(() => {
    try {
      const saved = localStorage.getItem('foodexpress_user_location');
      return saved ? JSON.parse(saved) : DEFAULT_USER_LOCATION;
    } catch {
      return DEFAULT_USER_LOCATION;
    }
  });
  const [geoStatus, setGeoStatus] = useState<'idle' | 'locating' | 'success' | 'error'>('idle');
  const [geoErrorMessage, setGeoErrorMessage] = useState<string | null>(null);

  const refreshDeviceGeolocation = useCallback(async (): Promise<boolean> => {
    setGeoStatus('locating');
    setGeoErrorMessage(null);
    const result = await requestDeviceGeolocation();
    if (result.success) {
      setUserLocation(result.location);
      setGeoStatus('success');
      try {
        localStorage.setItem('foodexpress_user_location', JSON.stringify(result.location));
      } catch {
        // safe ignore
      }
      triggerToast('ระบุพิกัด GPS สำเร็จ 📍', `ความแม่นยำ ±${result.location.accuracy || 15}ม. (${result.location.lat.toFixed(4)}°, ${result.location.lng.toFixed(4)}°)`, 'success');
      return true;
    } else {
      setGeoStatus('error');
      setGeoErrorMessage(result.error);
      triggerToast('ไม่สามารถดึงพิกัด GPS ได้', result.error, 'info');
      return false;
    }
  }, [triggerToast]);

  // Sync to LocalStorage
  useEffect(() => {
    setCloudSyncState('syncing');
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
      if (cartRestaurant) {
        localStorage.setItem(STORAGE_KEYS.CART_REST, JSON.stringify(cartRestaurant));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CART_REST);
      }
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      if (activeOrder) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_ORDER, JSON.stringify(activeOrder));
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_ORDER);
      }
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
      localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
      localStorage.setItem(STORAGE_KEYS.NOTIFS, JSON.stringify(notifications));
    } catch (e) {
      console.error('Storage write error', e);
    }
    const timer = setTimeout(() => {
      setCloudSyncState('synced');
    }, 400);
    return () => clearTimeout(timer);
  }, [user, cart, cartRestaurant, orders, activeOrder, reviews, coupons, notifications]);

  // Synchronize loyalty tier with total orders placed
  useEffect(() => {
    const validCount = orders.filter(o => o.status !== 'cancelled').length;
    let computedTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' = 'Bronze';
    if (validCount >= 15) computedTier = 'Platinum';
    else if (validCount >= 8) computedTier = 'Gold';
    else if (validCount >= 3) computedTier = 'Silver';

    setUser(prev => {
      if (prev.tier !== computedTier) {
        return { ...prev, tier: computedTier };
      }
      return prev;
    });
  }, [orders]);

  // Cart Calculations with Standard Thai Rider Distance Fare
  const cartSubtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const cartDistance = cartRestaurant ? (getRestaurantDistance(cartRestaurant, userLocation) || cartRestaurant.distanceKm) : 0;
  const cartDeliveryFee = cartRestaurant ? calculateStandardDeliveryFee(cartDistance) : 0;

  // Add to Cart
  const addToCart = useCallback((
    menuItem: MenuItem, 
    restaurant: Restaurant, 
    quantity: number, 
    options: { [group: string]: string }, 
    spicyLevel?: string, 
    notes?: string
  ) => {
    // If different restaurant, ask/reset
    if (cartRestaurant && cartRestaurant.id !== restaurant.id && cart.length > 0) {
      const confirmSwitch = window.confirm(`คุณมีอาหารจากร้าน "${cartRestaurant.name}" อยู่ในตะกร้า ต้องการเปลี่ยนเป็นร้านใหม่หรือไม่?`);
      if (!confirmSwitch) return;
      setCart([]);
      setAppliedCoupon(null);
    }

    setCartRestaurant(restaurant);

    // Calculate options additional cost
    let additionalCost = 0;
    if (menuItem.options) {
      for (const optGroup of menuItem.options) {
        const selectedChoiceId = options[optGroup.name];
        const choice = optGroup.choices.find(c => c.name === selectedChoiceId || c.id === selectedChoiceId);
        if (choice) {
          additionalCost += choice.price;
        }
      }
    }

    const unitPrice = menuItem.price + additionalCost;
    const cartItemId = `${menuItem.id}_${spicyLevel || 'normal'}_${JSON.stringify(options)}`;

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex].quantity += quantity;
        return copy;
      }
      return [
        ...prev,
        {
          cartItemId,
          menuItem,
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          quantity,
          selectedOptions: options,
          spicyLevel,
          notes,
          unitPrice,
        }
      ];
    });

    setLastAddedCartItemName(menuItem.name);
    triggerToast('เพิ่มลงตะกร้าแล้ว', `${menuItem.name} (${quantity} รายการ) พร้อมสั่งซื้อ`, 'success');
  }, [cartRestaurant, cart.length, triggerToast]);

  const updateCartQuantity = useCallback((cartItemId: string, delta: number) => {
    setCart(prev => {
      const updated = prev.map(item => {
        if (item.cartItemId === cartItemId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];

      if (updated.length === 0) {
        setCartRestaurant(null);
        setAppliedCoupon(null);
        setIsQuickCartPopupOpen(false);
      }
      return updated;
    });
  }, []);

  const removeFromCart = useCallback((cartItemId: string) => {
    setCart(prev => {
      const filtered = prev.filter(i => i.cartItemId !== cartItemId);
      if (filtered.length === 0) {
        setCartRestaurant(null);
        setAppliedCoupon(null);
        setIsQuickCartPopupOpen(false);
      }
      return filtered;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setCartRestaurant(null);
    setAppliedCoupon(null);
    setIsQuickCartPopupOpen(false);
  }, []);

  // Wallet & User
  const topUpWallet = useCallback((amount: number) => {
    setUser(prev => ({
      ...prev,
      walletBalance: prev.walletBalance + amount,
    }));
    
    // Add notification
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: '💳 เติมเงินวอลเล็ตสำเร็จ',
      body: `คุณได้เติมเงิน ฿${amount.toLocaleString()} เข้าสู่วอลเล็ต ยอดคงเหลือ ฿${(user.walletBalance + amount).toLocaleString()}`,
      type: 'system',
      timestamp: 'เมื่อสักครู่',
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
    triggerToast('เติมเงินสำเร็จ!', `เพิ่ม ฿${amount.toLocaleString()} ในวอลเล็ตแล้ว`, 'success');
  }, [user.walletBalance, triggerToast]);

  const toggleFavorite = useCallback((restaurantId: string) => {
    setUser(prev => {
      const exists = prev.favoriteRestaurantIds.includes(restaurantId);
      const updated = exists 
        ? prev.favoriteRestaurantIds.filter(id => id !== restaurantId)
        : [...prev.favoriteRestaurantIds, restaurantId];
      return { ...prev, favoriteRestaurantIds: updated };
    });
  }, []);

  const updateUserProfile = useCallback((data: Partial<UserProfile>) => {
    setUser(prev => ({
      ...prev,
      ...data,
    }));
    triggerToast('บันทึกข้อมูลสำเร็จ', 'อัปเดตข้อมูลโปรไฟล์เรียบร้อยแล้ว', 'success');
  }, [triggerToast]);

  const loginAs = useCallback((provider: UserProfile['loginProvider']) => {
    const demoProfile = DEMO_CUSTOMER_ACCOUNTS[provider];
    if (demoProfile) {
      setUser(demoProfile);
      triggerToast('เข้าสู่ระบบสำเร็จ! 🎉', `สลับเป็นบัญชี ${demoProfile.name} (${provider.toUpperCase()}) เรียบร้อยแล้ว`, 'success');
    } else {
      setUser(prev => ({
        ...prev,
        loginProvider: provider,
      }));
      triggerToast('เข้าสู่ระบบสำเร็จ', `เชื่อมต่อบัญชีด้วย ${provider.toUpperCase()}`, 'info');
    }
    setIsAuthModalOpen(false);
  }, [triggerToast]);

  // Points Redemption
  const redeemCouponWithPoints = useCallback((couponId: string): boolean => {
    const coupon = coupons.find(c => c.id === couponId);
    if (!coupon) return false;

    if (user.loyaltyPoints < coupon.pointsCost) {
      triggerToast('คะแนนไม่เพียงพอ', `คุณต้องการอีก ${coupon.pointsCost - user.loyaltyPoints} คะแนนสำหรับคูปองนี้`, 'info');
      return false;
    }

    setUser(prev => ({
      ...prev,
      loyaltyPoints: prev.loyaltyPoints - coupon.pointsCost,
    }));

    setCoupons(prev => prev.map(c => c.id === couponId ? { ...c, isRedeemed: true } : c));

    // Celebrate with confetti
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });

    triggerToast('แลกคูปองสำเร็จ! 🎉', `ได้รับ ${coupon.title} ใช้งานได้ทันที`, 'reward');
    return true;
  }, [coupons, user.loyaltyPoints, triggerToast]);

  // Place Order
  const placeOrder = useCallback(async (
    paymentMethod: PaymentMethod, 
    address: string, 
    notes?: string
  ): Promise<Order> => {
    if (!cartRestaurant || cart.length === 0) {
      throw new Error('ตะกร้าว่างเปล่า');
    }

    // Calculate discount
    let discount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.discountType === 'fixed') {
        discount = appliedCoupon.discountValue;
      } else if (appliedCoupon.discountType === 'free_delivery') {
        discount = cartDeliveryFee;
      } else if (appliedCoupon.discountType === 'percentage') {
        discount = Math.round((cartSubtotal * appliedCoupon.discountValue) / 100);
      }
    }

    const totalBeforePoints = Math.max(0, cartSubtotal + cartDeliveryFee - discount);

    // If wallet used, check balance
    if (paymentMethod === 'wallet') {
      if (user.walletBalance < totalBeforePoints) {
        throw new Error('ยอดเงินในวอลเล็ตไม่เพียงพอ กรุณาเติมเงินก่อน');
      }
      setUser(prev => ({
        ...prev,
        walletBalance: prev.walletBalance - totalBeforePoints,
      }));
    }

    // Calculate points earned: 1 pt for every 10 baht
    const pointsEarned = Math.floor(totalBeforePoints / 10);
    setUser(prev => ({
      ...prev,
      loyaltyPoints: prev.loyaltyPoints + pointsEarned,
    }));

    const newOrder: Order = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      restaurantId: cartRestaurant.id,
      restaurantName: cartRestaurant.name,
      restaurantLogo: cartRestaurant.logoImage,
      items: [...cart],
      status: 'confirmed',
      subtotal: cartSubtotal,
      deliveryFee: cartDeliveryFee,
      discountAmount: discount,
      pointsUsed: 0,
      total: totalBeforePoints,
      pointsEarned,
      paymentMethod,
      paymentStatus: 'paid',
      deliveryAddress: address,
      notes,
      createdAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      estimatedDeliveryMinutes: 25,
      rider: { ...DEFAULT_RIDER },
      riderProgressPct: 10,
      riderCurrentLocation: { x: cartRestaurant.coords.x, y: cartRestaurant.coords.y },
      hasReviewed: false,
    };

    setOrders(prev => [newOrder, ...prev]);
    setActiveOrder(newOrder);

    // Save order to Firebase Cloud Firestore
    createCloudOrder({
      id: newOrder.id,
      restaurantId: newOrder.restaurantId,
      restaurantName: newOrder.restaurantName,
      customerName: user.name,
      customerPhone: user.phone,
      deliveryAddress: newOrder.deliveryAddress,
      itemsSummary: newOrder.items.map(i => `${i.quantity}x ${i.menuItem.name}`).join(', '),
      items: newOrder.items.map(i => ({
        id: i.cartItemId,
        name: i.menuItem.name,
        price: i.unitPrice,
        quantity: i.quantity,
      })),
      subtotal: newOrder.subtotal,
      deliveryFee: newOrder.deliveryFee,
      discount: newOrder.discountAmount,
      tip: 0,
      totalAmount: newOrder.total,
      paymentMethod: (newOrder.paymentMethod as any) || 'promptpay_qr',
      paymentStatus: (newOrder.paymentStatus as any) || 'paid',
      orderStatus: 'kitchen_prep',
      transactionRef: `TXN-${Date.now().toString().slice(-6)}`,
      riderId: newOrder.rider.id,
      riderName: newOrder.rider.name,
    }).catch(err => {
      console.warn('Firebase order persist notice:', err);
    });

    setCart([]);
    setCartRestaurant(null);
    setAppliedCoupon(null);
    setIsCheckoutOpen(false);
    setIsTrackingOpen(true);

    // Initial rider welcome message
    setChatMessages([
      {
        id: `msg_${Date.now()}`,
        sender: 'rider',
        text: `สวัสดีครับคุณ${user.name} ผมรับออเดอร์ ${newOrder.id} เรียบร้อยแล้ว กำลังรอร้านจัดเตรียมอาหารให้นะครับ 🛵✨`,
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      }
    ]);

    // Push notification for customer
    const orderNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: `🛍️ ออเดอร์ ${newOrder.id} ได้รับการยืนยันแล้ว`,
      body: `ร้าน ${newOrder.restaurantName} กำลังเริ่มปรุงอาหาร ไรเดอร์ ${DEFAULT_RIDER.name} จะนำส่งให้คุณ`,
      type: 'order',
      timestamp: 'เมื่อสักครู่',
      read: false,
      targetId: newOrder.id,
    };

    // Instant push notification for merchant if enabled
    const matchedSettlement = merchantSettlements.find(s => s.restaurantId === newOrder.restaurantId);
    const instantPushEnabled = matchedSettlement?.config?.enableInstantPushNotifications ?? true;
    const newNotifs: NotificationItem[] = [orderNotif];

    if (instantPushEnabled) {
      newNotifs.unshift({
        id: `notif_merchant_${Date.now()}`,
        title: `🔔 ยอดขายสำเร็จ! ร้าน ${newOrder.restaurantName}`,
        body: `ออเดอร์ ${newOrder.id} ได้รับชำระเงินสำเร็จ ฿${newOrder.total.toLocaleString()} (${newOrder.paymentMethod === 'promptpay_qr' ? 'พร้อมเพย์ QR' : newOrder.paymentMethod === 'wallet' ? 'วอลเล็ต' : newOrder.paymentMethod === 'credit_card' ? 'บัตรเครดิต' : 'เงินสด POS'}) กรุณาจัดเตรียมอาหาร`,
        type: 'system',
        timestamp: 'เมื่อสักครู่',
        read: false,
        targetId: newOrder.id,
      });
    }

    setNotifications(prev => [...newNotifs, ...prev]);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.7 },
    });

    triggerToast('สั่งซื้อสำเร็จ!', `ออเดอร์ ${newOrder.id} ยืนยันแล้ว รับ +${pointsEarned} คะแนนสะสม`, 'reward');

    // Trigger visual browser notification for merchant
    try {
      merchantOrderAudio.sendVisualBrowserNotification('🚨 มีออเดอร์ใหม่เข้ามา! (New Order Placed)', {
        body: `ออเดอร์ #${newOrder.id} • ยอด ฿${newOrder.total.toLocaleString()} จากคุณ ${user.name || 'ลูกค้า'} (${newOrder.items.length} รายการ)`,
        icon: newOrder.restaurantLogo,
        tag: newOrder.id,
      });
    } catch {
      // Safe fallback
    }

    return newOrder;
  }, [cartRestaurant, cart, appliedCoupon, cartDeliveryFee, cartSubtotal, user.walletBalance, user.name, triggerToast, merchantSettlements]);

  // Simulate an incoming customer order for merchant POS alert
  const simulateIncomingOrder = useCallback((restaurantId: string): Order => {
    const restaurant = RESTAURANTS_DATA.find(r => r.id === restaurantId) || RESTAURANTS_DATA[0];
    const menuItems = restaurant.menu.length > 0 ? restaurant.menu : RESTAURANTS_DATA[0].menu;
    const item1 = menuItems[0] || RESTAURANTS_DATA[0].menu[0];
    const item2 = menuItems[1] || item1;

    const thaiNames = [
      'คุณธนกร รุ่งอรุณ',
      'คุณวิภา สุวรรณเวช',
      'คุณณัฐพงศ์ เกียรติไพบูลย์',
      'คุณศศิธร เจริญทรัพย์',
      'คุณกิตติศักดิ์ พรหมมินทร์'
    ];
    const randomCustomer = thaiNames[Math.floor(Math.random() * thaiNames.length)];
    const addresses = [
      'อาคารเสริมมิตรทาวเวอร์ ชั้น 18 ซอยสุขุมวิท 21 แขวงคลองเตยเหนือ กรุงเทพฯ',
      'คอนโด เดอะ เบส สุขุมวิท 77 ตึก A ห้อง 814 แขวงพระโขนงเหนือ กรุงเทพฯ',
      'บ้านเลขที่ 98/42 หมู่บ้านนันทวัน ศรีนครินทร์ ต.บางแก้ว อ.บางพลี',
      'อาคาร ซีดับเบิ้ลยู ทาวเวอร์ ชั้น 12 ถนนรัชดาภิเษก แขวงห้วยขวาง กรุงเทพฯ'
    ];
    const randomAddress = addresses[Math.floor(Math.random() * addresses.length)];

    const cartItems: CartItem[] = [
      {
        cartItemId: `${item1.id}_sim_${Date.now()}_1`,
        menuItem: item1,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        quantity: Math.floor(Math.random() * 2) + 1,
        unitPrice: item1.price,
        selectedOptions: {},
        spicyLevel: 'ปกติ',
        notes: 'ขอช้อนส้อมพลาสติกด้วยครับ'
      }
    ];

    if (item2 && item2.id !== item1.id) {
      cartItems.push({
        cartItemId: `${item2.id}_sim_${Date.now()}_2`,
        menuItem: item2,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        quantity: 1,
        unitPrice: item2.price,
        selectedOptions: {},
        spicyLevel: 'เผ็ดน้อย',
      });
    }

    const subtotal = cartItems.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
    const deliveryFee = calculateStandardDeliveryFee(restaurant.distanceKm);
    const total = subtotal + deliveryFee;

    const newOrder: Order = {
      id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      restaurantLogo: restaurant.logoImage,
      items: cartItems,
      status: 'confirmed',
      subtotal,
      deliveryFee,
      discountAmount: 0,
      pointsUsed: 0,
      total,
      pointsEarned: Math.floor(total / 10),
      paymentMethod: Math.random() > 0.5 ? 'promptpay_qr' : 'wallet',
      paymentStatus: 'paid',
      deliveryAddress: randomAddress,
      notes: `ลูกค้า: ${randomCustomer} • ฝากแขวนไว้ที่ป้อม รปภ. ได้เลยครับ`,
      createdAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      estimatedDeliveryMinutes: 25,
      rider: { ...DEFAULT_RIDER },
      riderProgressPct: 15,
      hasReviewed: false,
    };

    setOrders(prev => [newOrder, ...prev]);

    addNotification({
      title: `🛍️ ลูกค้าสั่งออเดอร์ใหม่ #${newOrder.id}`,
      body: `ร้าน ${restaurant.name} ได้รับออเดอร์ใหม่ ยอดรวม ฿${total.toLocaleString()}`,
      type: 'order',
      targetId: newOrder.id,
    });

    return newOrder;
  }, [addNotification]);

  // Cancel order
  const cancelActiveOrder = useCallback(() => {
    if (!activeOrder) return;
    if (activeOrder.status === 'delivering' || activeOrder.status === 'delivered') {
      triggerToast('ไม่สามารถยกเลิกได้', 'ไรเดอร์กำลังนำส่งอาหารแล้ว', 'info');
      return;
    }

    // Refund if wallet
    if (activeOrder.paymentMethod === 'wallet') {
      setUser(prev => ({
        ...prev,
        walletBalance: prev.walletBalance + activeOrder.total,
        loyaltyPoints: Math.max(0, prev.loyaltyPoints - activeOrder.pointsEarned),
      }));
    }

    const updatedOrder: Order = { ...activeOrder, status: 'cancelled' };
    setOrders(prev => prev.map(o => o.id === activeOrder.id ? updatedOrder : o));
    setActiveOrder(null);
    setIsTrackingOpen(false);
    triggerToast('ยกเลิกออเดอร์แล้ว', 'ระบบได้ทำการยกเลิกและคืนเงินให้คุณเรียบร้อย', 'info');
  }, [activeOrder, triggerToast]);

  // Reorder previous order - deep-copies items, calculates new total, and populates CartDrawer directly
  const reorderOrder = useCallback((order: Order) => {
    // 1. Locate restaurant from RESTAURANTS_DATA or construct clean fallback
    const matchedRestaurant = RESTAURANTS_DATA.find(r => r.id === order.restaurantId);
    const restaurant: Restaurant = matchedRestaurant
      ? JSON.parse(JSON.stringify(matchedRestaurant))
      : {
          id: order.restaurantId,
          name: order.restaurantName,
          nameEn: order.restaurantName,
          rating: 4.8,
          reviewCount: 120,
          deliveryTimeMinutes: order.estimatedDeliveryMinutes || 25,
          deliveryFee: typeof order.deliveryFee === 'number' ? order.deliveryFee : calculateStandardDeliveryFee(1.4),
          minOrder: 50,
          distanceKm: 1.4,
          bannerImage: order.restaurantLogo || '',
          logoImage: order.restaurantLogo || '',
          category: 'อาหารจานด่วน',
          tags: ['สั่งซ้ำยอดนิยม'],
          address: 'กรุงเทพฯ',
          isOpen: true,
          coords: { x: 50, y: 50 },
          menu: order.items.map(i => JSON.parse(JSON.stringify(i.menuItem))),
        };

    // 2. Deep-copy each item from the past order with isolated references and unique IDs
    const deepCopiedItems: CartItem[] = order.items.map((item, index) => {
      const clonedMenuItem: MenuItem = JSON.parse(JSON.stringify(item.menuItem));
      const clonedSelectedOptions: { [groupName: string]: string } = item.selectedOptions 
        ? JSON.parse(JSON.stringify(item.selectedOptions)) 
        : {};

      // Verify and recalculate unit price including chosen options
      let additionalCost = 0;
      if (clonedMenuItem.options && clonedMenuItem.options.length > 0) {
        for (const optGroup of clonedMenuItem.options) {
          const selectedChoiceId = clonedSelectedOptions[optGroup.name];
          if (selectedChoiceId) {
            const choice = optGroup.choices?.find(c => c.name === selectedChoiceId || c.id === selectedChoiceId);
            if (choice) {
              additionalCost += choice.price;
            }
          }
        }
      }

      const unitPrice = item.unitPrice > 0 ? item.unitPrice : (clonedMenuItem.price + additionalCost);
      const quantity = Math.max(1, Number(item.quantity) || 1);

      return {
        cartItemId: `${clonedMenuItem.id}_reorder_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 7)}`,
        menuItem: clonedMenuItem,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        quantity,
        selectedOptions: clonedSelectedOptions,
        spicyLevel: item.spicyLevel,
        notes: item.notes,
        unitPrice,
      };
    });

    // 3. Add into active cart: if same restaurant already in cart, merge/append; otherwise replace
    let finalCartItems: CartItem[] = [];
    if (cartRestaurant && cartRestaurant.id === restaurant.id && cart.length > 0) {
      finalCartItems = [...cart];
      for (const newItem of deepCopiedItems) {
        const matchIdx = finalCartItems.findIndex(
          ci => ci.menuItem.id === newItem.menuItem.id &&
                ci.spicyLevel === newItem.spicyLevel &&
                JSON.stringify(ci.selectedOptions || {}) === JSON.stringify(newItem.selectedOptions || {}) &&
                (ci.notes || '') === (newItem.notes || '')
        );
        if (matchIdx > -1) {
          finalCartItems[matchIdx] = {
            ...finalCartItems[matchIdx],
            quantity: finalCartItems[matchIdx].quantity + newItem.quantity,
          };
        } else {
          finalCartItems.push(newItem);
        }
      }
    } else {
      finalCartItems = deepCopiedItems;
    }

    // 4. Calculate new total and subtotal using standard rider delivery fee
    const newSubtotal = finalCartItems.reduce((sum, itm) => sum + (itm.unitPrice * itm.quantity), 0);
    const reorderDistance = getRestaurantDistance(restaurant, userLocation) || restaurant.distanceKm;
    const newDeliveryFee = calculateStandardDeliveryFee(reorderDistance);
    const newTotal = newSubtotal + newDeliveryFee;
    const totalQuantityAdded = deepCopiedItems.reduce((sum, itm) => sum + itm.quantity, 0);

    // 5. Populate CartDrawer state directly
    setCart(finalCartItems);
    setCartRestaurant(restaurant);
    setAppliedCoupon(null);
    setSelectedRestaurant(restaurant);
    setIsCartOpen(true);

    triggerToast(
      'เพิ่มรายการสั่งซ้ำแล้ว 🛒',
      `เพิ่มอาหาร ${totalQuantityAdded} รายการจากร้าน "${restaurant.name}" ลงในตะกร้าของคุณเรียบร้อยแล้ว`,
      'success'
    );

    return {
      items: finalCartItems,
      subtotal: newSubtotal,
      deliveryFee: newDeliveryFee,
      total: newTotal,
      totalQuantity: finalCartItems.reduce((sum, itm) => sum + itm.quantity, 0),
    };
  }, [cart, cartRestaurant, triggerToast]);

  // Speed up tracking simulation button
  const speedUpTracking = useCallback(() => {
    if (!activeOrder || activeOrder.status === 'delivered') return;

    setActiveOrder(prev => {
      if (!prev) return null;
      let nextStatus: OrderStatus = prev.status;
      let nextProgress = prev.riderProgressPct;

      if (prev.status === 'confirmed') {
        nextStatus = 'preparing';
        nextProgress = 30;
      } else if (prev.status === 'preparing') {
        nextStatus = 'rider_assigned';
        nextProgress = 55;
      } else if (prev.status === 'rider_assigned') {
        nextStatus = 'delivering';
        nextProgress = 80;
      } else if (prev.status === 'delivering') {
        nextStatus = 'delivered';
        nextProgress = 100;
      }

      const updated = {
        ...prev,
        status: nextStatus,
        riderProgressPct: nextProgress,
      };

      setOrders(all => all.map(o => o.id === updated.id ? updated : o));
      return updated;
    });
  }, [activeOrder]);

  // Update real-time order progress percentage and status smoothly
  const updateOrderProgress = useCallback((newPct: number, newStatus?: OrderStatus, coords?: { x: number; y: number }) => {
    setActiveOrder(prev => {
      if (!prev) return null;
      const clampedPct = Math.min(100, Math.max(0, Math.round(newPct)));
      let determinedStatus: OrderStatus = newStatus || prev.status;
      if (!newStatus) {
        if (clampedPct >= 100) determinedStatus = 'delivered';
        else if (clampedPct >= 65) determinedStatus = 'delivering';
        else if (clampedPct >= 40) determinedStatus = 'rider_assigned';
        else if (clampedPct >= 20) determinedStatus = 'preparing';
        else determinedStatus = 'confirmed';
      }

      const updated: Order = {
        ...prev,
        riderProgressPct: clampedPct,
        status: determinedStatus,
        riderCurrentLocation: coords || prev.riderCurrentLocation,
      };

      setOrders(all => all.map(o => o.id === updated.id ? updated : o));

      if (determinedStatus === 'delivered' && prev.status !== 'delivered') {
        try {
          confetti({
            particleCount: 80,
            spread: 90,
            origin: { y: 0.5 },
            colors: ['#10B981', '#059669', '#3B82F6', '#F59E0B']
          });
        } catch {
          // safe
        }

        setNotifications(notifs => [
          {
            id: `notif_del_${Date.now()}`,
            title: `✅ จัดส่งออเดอร์ ${updated.id} สำเร็จแล้ว!`,
            body: `อาหารจากร้าน ${updated.restaurantName} ส่งถึงแล้ว อย่าลืมให้คะแนนรีวิวร้านค้าและไรเดอร์นะ`,
            type: 'order',
            timestamp: 'เมื่อสักครู่',
            read: false,
            targetId: updated.id,
          },
          ...notifs,
        ]);
      }

      return updated;
    });
  }, []);

  // Real-time Delivery Simulation Engine (Timers)
  const activeOrderRef = useRef(activeOrder);
  activeOrderRef.current = activeOrder;

  useEffect(() => {
    if (!activeOrder || activeOrder.status === 'delivered' || activeOrder.status === 'cancelled') {
      return;
    }

    const intervalTime = simulationSpeed === 'fast' ? 4000 : 9000;

    const timer = setInterval(() => {
      const curr = activeOrderRef.current;
      if (!curr || curr.status === 'delivered' || curr.status === 'cancelled') {
        clearInterval(timer);
        return;
      }

      let nextStatus: OrderStatus = curr.status;
      let nextPct = curr.riderProgressPct + 15;
      let riderMsg: string | null = null;

      if (curr.status === 'confirmed' && nextPct >= 25) {
        nextStatus = 'preparing';
        riderMsg = 'ร้านค้ากำลังปรุงอาหารสดใหม่อยู่ครับ รออีกสักครู่นะครับ';
      } else if (curr.status === 'preparing' && nextPct >= 50) {
        nextStatus = 'rider_assigned';
        riderMsg = 'ผมถึงหน้าร้านแล้ว กำลังตรวจสอบอาหารและแพ็คใส่กระเป๋าเก็บความร้อนครับ';
      } else if (curr.status === 'rider_assigned' && nextPct >= 70) {
        nextStatus = 'delivering';
        riderMsg = 'รับอาหารเรียบร้อยแล้ว กำลังขับมุ่งหน้าไปตาม GPS ครับ 🛵💨';
      } else if (nextPct >= 100) {
        nextStatus = 'delivered';
        nextPct = 100;
        riderMsg = 'ถึงที่หมายแล้วครับ วางไว้ตามจุดที่คุณระบุเรียบร้อย ทานให้อร่อยนะครับ! ⭐⭐⭐⭐⭐';
        
        // Delivered celebration
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.5 },
        });

        // Add delivered notification
        setNotifications(prev => [
          {
            id: `notif_del_${Date.now()}`,
            title: `✅ จัดส่งออเดอร์ ${curr.id} สำเร็จแล้ว!`,
            body: `อาหารจากร้าน ${curr.restaurantName} ส่งถึงแล้ว อย่าลืมให้คะแนนรีวิวร้านค้าและไรเดอร์นะ`,
            type: 'order',
            timestamp: 'เมื่อสักครู่',
            read: false,
            targetId: curr.id,
          },
          ...prev,
        ]);
      }

      const updated: Order = {
        ...curr,
        status: nextStatus,
        riderProgressPct: nextPct,
      };

      setActiveOrder(updated);
      setOrders(all => all.map(o => o.id === updated.id ? updated : o));

      if (riderMsg) {
        setChatMessages(prev => [
          ...prev,
          {
            id: `msg_${Date.now()}`,
            sender: 'rider',
            text: riderMsg!,
            timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          }
        ]);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [activeOrder?.id, activeOrder?.status, simulationSpeed]);

  // Chat with Rider
  const sendRiderMessage = useCallback((text: string) => {
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages(prev => [...prev, userMsg]);

    // Simulated quick rider response
    setTimeout(() => {
      let replyText = 'รับทราบครับผม กำลังรีบนำส่งให้อย่างปลอดภัยครับ 🙏🛵';
      const lower = text.toLowerCase();
      if (lower.includes('ช้อน') || lower.includes('ส้อม')) {
        replyText = 'มีช้อนส้อมให้ครบในถุงเรียบร้อยครับ 👍';
      } else if (lower.includes('ล็อบบี้') || lower.includes('ฝาก')) {
        replyText = 'โอเคครับ เดี๋ยวผมวางไว้ที่จุดรับของล็อบบี้แล้วแจ้งอีกทีนะครับ';
      } else if (lower.includes('เร็ว') || lower.includes('หิว')) {
        replyText = 'เร่งเครื่องเต็มที่ให้เลยครับ กำลังเลี้ยวเข้าซอยแล้วครับ!';
      }

      setChatMessages(prev => [
        ...prev,
        {
          id: `msg_r_${Date.now()}`,
          sender: 'rider',
          text: replyText,
          timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }, 1200);
  }, []);

  // Add Review
  const addReview = useCallback((
    restaurantId: string, 
    orderId: string | undefined, 
    rating: number, 
    comment: string, 
    tags?: string[], 
    foodRating?: number, 
    riderRating?: number
  ) => {
    const newRev: Review = {
      id: `rev_${Date.now()}`,
      restaurantId,
      orderId,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      rating,
      foodRating,
      riderRating,
      date: 'วันนี้',
      comment,
      tags: tags || ['อาหารอร่อย', 'บริการประทับใจ'],
      helpfulCount: 1,
    };

    setReviews(prev => [newRev, ...prev]);

    // Mark order as reviewed
    if (orderId) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, hasReviewed: true } : o));
      if (activeOrder?.id === orderId) {
        setActiveOrder(prev => prev ? { ...prev, hasReviewed: true } : null);
      }
    }

    // Award bonus points for reviewing!
    setUser(prev => ({
      ...prev,
      loyaltyPoints: prev.loyaltyPoints + 15,
    }));

    triggerToast('ส่งรีวิวสำเร็จ ⭐', 'ขอบคุณสำหรับรีวิว! คุณได้รับ +15 คะแนนสะสมพิเศษ', 'reward');
    setIsReviewModalOpen(false);
  }, [user.id, user.name, user.avatar, activeOrder?.id, triggerToast]);

  // Notifications helpers
  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    triggerToast('อัปเดตแล้ว', 'อ่านการแจ้งเตือนทั้งหมดเรียบร้อย', 'info');
  }, [triggerToast]);

  // Reset Demo Data
  const resetAllData = useCallback(() => {
    localStorage.clear();
    setUser(INITIAL_USER);
    setCart([]);
    setCartRestaurant(null);
    setOrders([]);
    setActiveOrder(null);
    setReviews(INITIAL_REVIEWS);
    setCoupons(AVAILABLE_COUPONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAppliedCoupon(null);
    setActiveMerchant(INITIAL_MERCHANT_ACCOUNTS[0]);
    setSelectedSettlementRestId('rest_kanda_roimor');
    setActiveRider(INITIAL_ACTIVE_RIDER);
    triggerToast('รีเซ็ตข้อมูลสำเร็จ', 'คืนค่าเริ่มต้นผู้ใช้ทั้ง 3 บัญชี (สมชาย, กานดา, สมหวัง) เรียบร้อย', 'info');
  }, [triggerToast]);

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      updateUserProfile,
      loginAs,
      topUpWallet,
      setWalletBalance,
      walletLowBalanceThreshold,
      setWalletLowBalanceThreshold,
      isWalletBalanceLow,
      toggleFavorite,
      language,
      setLanguage,
      t,
      cart,
      setCart,
      cartRestaurant,
      setCartRestaurant,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      cartSubtotal,
      cartDeliveryFee,
      coupons,
      appliedCoupon,
      setAppliedCoupon,
      redeemCouponWithPoints,
      orders,
      setOrders,
      activeOrder,
      setActiveOrder,
      placeOrder,
      simulateIncomingOrder,
      reorderOrder,
      cancelActiveOrder,
      speedUpTracking,
      updateOrderProgress,
      simulationSpeed,
      setSimulationSpeed,
      chatMessages,
      sendRiderMessage,
      reviews,
      addReview,
      notifications,
      unreadNotificationCount,
      markNotificationRead,
      markAllNotificationsRead,
      addNotification,
      deviceMode,
      setDeviceMode,
      activeTab,
      setActiveTab,
      selectedRestaurant,
      setSelectedRestaurant,
      // Geolocation & User Proximity
      userLocation,
      setUserLocation,
      geoStatus,
      geoErrorMessage,
      refreshDeviceGeolocation,
      merchantSettlements,
      selectedSettlementRestId,
      setSelectedSettlementRestId,
      selectedSettlementDate,
      setSelectedSettlementDate,
      runEodSettlementCalculation,
      approveAndTransferPayout,
      updateMerchantConfig,
      updateMerchantBank,
      merchantAccounts,
      activeMerchant,
      setActiveMerchant,
      loginMerchantAs,
      signupMerchant,
      logoutMerchant,
      isMerchantAuthModalOpen,
      setIsMerchantAuthModalOpen,
      isGpCalculatorOpen,
      setIsGpCalculatorOpen,
      // Rider Hub
      activeRider,
      setActiveRider,
      riderApplications,
      selectedZoneId,
      setSelectedZoneId,
      deliveryZones,
      zoneRiderQueue,
      dispatchOrders,
      riderEarningsHistory,
      riderPayoutSlips,
      activeIncomingTrip,
      setActiveIncomingTrip,
      activeDeliveringTrip,
      setActiveDeliveringTrip,
      deliveryStepIndex,
      setDeliveryStepIndex,
      submitRiderApplication,
      updateApplicationStatus,
      toggleRiderShiftStatus,
      setRiderShiftStatusManual,
      acceptIncomingTrip,
      declineIncomingTrip,
      advanceDeliveringStep,
      withdrawRiderEarnings,
      triggerSimulatedIncomingOrder,
      riderIssues,
      reportRiderIssue,
      resolveRiderIssue,
      isCartOpen,
      setIsCartOpen,
      isQuickCartPopupOpen,
      setIsQuickCartPopupOpen,
      lastAddedCartItemName,
      setLastAddedCartItemName,
      isCheckoutOpen,
      setIsCheckoutOpen,
      isTrackingOpen,
      setIsTrackingOpen,
      isTopUpOpen,
      setIsTopUpOpen,
      isNotificationsOpen,
      setIsNotificationsOpen,
      isReviewModalOpen,
      setIsReviewModalOpen,
      reviewingOrder,
      setReviewingOrder,
      isAuthModalOpen,
      setIsAuthModalOpen,
      // Admin Portal & Platform HQ Management
      adminRole,
      setAdminRole,
      platformConfig,
      updatePlatformConfig,
      disputeTickets,
      resolveDisputeTicket,
      reassignOrderRider,
      cancelOrderByAdmin,
      cloudSyncState,
      toast,
      triggerToast,
      resetAllData,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
