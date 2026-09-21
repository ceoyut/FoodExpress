import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowUpRight, 
  Download, 
  Printer, 
  Settings, 
  CreditCard, 
  Wallet, 
  Receipt, 
  RefreshCw, 
  ChevronRight, 
  FileText, 
  Search, 
  Filter, 
  TrendingUp, 
  ShieldCheck, 
  Store, 
  X,
  Share2,
  Percent,
  Calculator,
  ArrowRight,
  Sparkles,
  Info,
  Bell,
  BellRing,
  BellOff,
  Volume2,
  ShoppingBag,
  Coins,
  SlidersHorizontal,
  AlertTriangle,
  UserCheck,
  LogIn,
  UserPlus,
  LogOut,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RESTAURANTS_DATA } from '../data/mockData';
import { MerchantDailySettlement, MerchantOrderReconciliationItem } from '../types';
import { WeeklyRevenueSummaryView } from '../components/WeeklyRevenueSummaryView';
import { DailyInsights } from '../components/merchant/DailyInsights';
import { computeMerchantSettlement, generateMockReconciledOrders } from '../data/merchantSettlementData';
import { GP_PACKAGES } from '../data/merchantAuthData';
import { SettlementSummaryAlert } from '../components/SettlementSummaryAlert';
import { NewOrderAlertModal } from '../components/NewOrderAlertModal';
import { MerchantOrderAlertControlBar } from '../components/MerchantOrderAlertControlBar';
import { merchantOrderAudio } from '../utils/merchantOrderAudio';
import { SettlementAutomationBar } from '../components/merchant/SettlementAutomationBar';
import { Order } from '../types';

export const MerchantSettlementScreen: React.FC = () => {
  const {
    merchantSettlements,
    selectedSettlementRestId,
    setSelectedSettlementRestId,
    selectedSettlementDate,
    setSelectedSettlementDate,
    orders,
    setOrders,
    simulateIncomingOrder,
    runEodSettlementCalculation,
    approveAndTransferPayout,
    updateMerchantConfig,
    updateMerchantBank,
    activeMerchant,
    merchantAccounts,
    loginMerchantAs,
    logoutMerchant,
    setIsMerchantAuthModalOpen,
    setIsGpCalculatorOpen,
    setActiveTab,
    triggerToast,
    addNotification
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('all');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);
  const [isTransferConfirmOpen, setIsTransferConfirmOpen] = useState(false);

  // Order Alert & Visual Notification states
  const [isAlertSoundMuted, setIsAlertSoundMuted] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('merchant_sound_muted');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  const [activeAlertOrder, setActiveAlertOrder] = useState<Order | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [acknowledgedOrderIds, setAcknowledgedOrderIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('merchant_acknowledged_orders');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Track initial orders on mount so we only alert on newly placed incoming customer orders
  const knownOrderIdsRef = useRef<Set<string>>(new Set(orders.map(o => o.id)));

  // Listen to new incoming orders for merchant
  useEffect(() => {
    const unacknowledged = orders.filter(order => {
      const isForCurrentRest = order.restaurantId === selectedSettlementRestId;
      const isAlreadyAck = acknowledgedOrderIds.has(order.id);
      const isNew = !knownOrderIdsRef.current.has(order.id);
      return isForCurrentRest && !isAlreadyAck && isNew;
    });

    if (unacknowledged.length > 0) {
      const newOrder = unacknowledged[0];
      knownOrderIdsRef.current.add(newOrder.id);

      setActiveAlertOrder(newOrder);
      setIsAlertModalOpen(true);

      merchantOrderAudio.setSoundMuted(isAlertSoundMuted);
      merchantOrderAudio.startLoopingOrderAlert();

      merchantOrderAudio.sendVisualBrowserNotification('🚨 มีออเดอร์ใหม่เข้ามา! (New Order Placed)', {
        body: `ออเดอร์ #${newOrder.id} • ยอด ฿${(newOrder.total || 0).toLocaleString()} (${(newOrder.items || []).length} รายการ) กรุณากดรับทราบทันที`,
        icon: newOrder.restaurantLogo,
        tag: newOrder.id,
        onClick: () => {
          setIsAlertModalOpen(true);
          setActiveAlertOrder(newOrder);
        }
      });

      triggerToast(
        '🚨 มีออเดอร์ใหม่เข้ามา!',
        `ออเดอร์ #${newOrder.id} ยอด ฿${(newOrder.total || 0).toLocaleString()} รอการกดรับทราบ`,
        'reward'
      );
    }
  }, [orders, selectedSettlementRestId, acknowledgedOrderIds, isAlertSoundMuted, triggerToast]);

  // Clean up looping sound on unmount
  useEffect(() => {
    return () => {
      merchantOrderAudio.stopLoopingOrderAlert();
    };
  }, []);

  // Compute unacknowledged orders count for current merchant restaurant
  const unacknowledgedOrders = useMemo(() => {
    return orders.filter(
      o => o.restaurantId === selectedSettlementRestId && 
           !acknowledgedOrderIds.has(o.id) && 
           o.status !== 'delivered' && 
           o.status !== 'cancelled'
    );
  }, [orders, selectedSettlementRestId, acknowledgedOrderIds]);

  const handleAcknowledgeOrder = (orderId: string) => {
    merchantOrderAudio.stopLoopingOrderAlert();
    merchantOrderAudio.playOrderAlertChime();

    setAcknowledgedOrderIds(prev => {
      const next = new Set(prev);
      next.add(orderId);
      try {
        localStorage.setItem('merchant_acknowledged_orders', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'preparing' } : o));

    setIsAlertModalOpen(false);
    setActiveAlertOrder(null);

    triggerToast(
      'รับออเดอร์สำเร็จ! 👨‍🍳',
      `ยืนยันรับทราบออเดอร์ #${orderId} เรียบร้อย ครัวกำลังจัดเตรียมอาหาร`,
      'success'
    );
  };

  const handleToggleAlertSound = () => {
    setIsAlertSoundMuted(prev => {
      const next = !prev;
      merchantOrderAudio.setSoundMuted(next);
      try {
        localStorage.setItem('merchant_sound_muted', JSON.stringify(next));
      } catch {}
      triggerToast(
        next ? 'ปิดเสียงเตือนออเดอร์แล้ว 🔇' : 'เปิดเสียงเตือนออเดอร์แล้ว 🔊',
        next ? 'ระบบจะไม่ส่งเสียงเมื่อมีออเดอร์เข้า' : 'ระบบจะส่งเสียงกระดิ่ง POS วนซ้ำเมื่อมีออเดอร์เข้า',
        'info'
      );
      return next;
    });
  };

  const handleTestAlertSound = () => {
    merchantOrderAudio.setSoundMuted(false);
    merchantOrderAudio.playOrderAlertChime();
    triggerToast('ทดสอบเสียงแจ้งเตือน 🔔', 'เล่นเสียงกระดิ่งเตือนออเดอร์ใหม่ (POS 3-tone chime)', 'info');
  };

  const handleSimulateIncomingOrder = () => {
    const newOrder = simulateIncomingOrder(selectedSettlementRestId);

    setActiveAlertOrder(newOrder);
    setIsAlertModalOpen(true);

    merchantOrderAudio.setSoundMuted(isAlertSoundMuted);
    merchantOrderAudio.startLoopingOrderAlert();

    merchantOrderAudio.sendVisualBrowserNotification('🚨 มีออเดอร์ใหม่เข้ามา! (New Order Placed)', {
      body: `ออเดอร์ #${newOrder.id} • ยอด ฿${(newOrder.total || 0).toLocaleString()} (${(newOrder.items || []).length} รายการ) กรุณากดรับทราบทันที`,
      icon: newOrder.restaurantLogo,
      tag: newOrder.id,
      onClick: () => {
        setIsAlertModalOpen(true);
        setActiveAlertOrder(newOrder);
      }
    });

    triggerToast(
      'จำลองออเดอร์ใหม่สำเร็จ 🔔',
      `สร้างออเดอร์ #${newOrder.id} เรียบร้อย ส่งเสียงเตือนและแจ้งเตือนเบราว์เซอร์แล้ว`,
      'reward'
    );
  };

  // Helper to format Thai date for display
  const formatThaiDateDisplay = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      if (!year || !month || !day) return dateStr;
      const thaiMonths = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
      ];
      return `${day} ${thaiMonths[month - 1]} ${year}`;
    } catch {
      return dateStr;
    }
  };

  // Quick preset dates
  const availableDates = [
    { key: '2026-09-12', label: 'วันนี้', sublabel: '12 ก.ย.' },
    { key: '2026-09-11', label: 'เมื่อวานนี้', sublabel: '11 ก.ย.' },
    { key: '2026-09-10', label: '2 วันก่อน', sublabel: '10 ก.ย.' },
    { key: '2026-09-05', label: '7 วันก่อน', sublabel: '5 ก.ย.' },
  ];

  // Handler for selecting date (including historical date input)
  const handleSelectDate = (dateStr: string) => {
    if (!dateStr) return;
    setSelectedSettlementDate(dateStr);
    
    // Check if settlement exists in state for this restaurant & date; if not, trigger EOD calculation
    const existing = merchantSettlements.find(
      s => s.restaurantId === selectedSettlementRestId && s.date === dateStr
    );
    if (!existing) {
      runEodSettlementCalculation(selectedSettlementRestId, dateStr);
    }
  };

  // Step day backwards or forwards
  const handleStepDay = (direction: 'prev' | 'next') => {
    try {
      const base = new Date(selectedSettlementDate);
      if (isNaN(base.getTime())) return;
      base.setDate(base.getDate() + (direction === 'next' ? 1 : -1));
      const yyyy = base.getFullYear();
      const mm = String(base.getMonth() + 1).padStart(2, '0');
      const dd = String(base.getDate()).padStart(2, '0');
      const newDateStr = `${yyyy}-${mm}-${dd}`;
      handleSelectDate(newDateStr);
    } catch {
      // fallback
    }
  };

  // Find current settlement record (with deterministic on-demand historical calculation)
  const currentSettlement = useMemo(() => {
    const existing = merchantSettlements.find(
      s => s.restaurantId === selectedSettlementRestId && s.date === selectedSettlementDate
    );
    if (existing) return existing;

    // Deterministically generate settlement for any chosen historical date
    const orders = generateMockReconciledOrders(selectedSettlementRestId, selectedSettlementDate);
    const dateDisplay = selectedSettlementDate === '2026-09-12' 
      ? 'วันนี้ (12 ก.ย. 2026)' 
      : selectedSettlementDate === '2026-09-11'
      ? 'เมื่อวานนี้ (11 ก.ย. 2026)'
      : `รอบย้อนหลัง (${formatThaiDateDisplay(selectedSettlementDate)})`;

    return computeMerchantSettlement(
      selectedSettlementRestId,
      selectedSettlementDate,
      dateDisplay,
      orders
    );
  }, [merchantSettlements, selectedSettlementRestId, selectedSettlementDate]);

  // Selected restaurant info
  const currentRestaurant = useMemo(() => {
    return RESTAURANTS_DATA.find(r => r.id === selectedSettlementRestId) || RESTAURANTS_DATA[0];
  }, [selectedSettlementRestId]);

  // Form states for Settings Modal
  const [editGpRate, setEditGpRate] = useState<number>(currentSettlement?.config?.gpRatePct || 20);
  const [editPaymentFee, setEditPaymentFee] = useState<number>(currentSettlement?.config?.paymentFeePct || 1.5);
  const [editIsCorporate, setEditIsCorporate] = useState<boolean>(currentSettlement?.config?.isCorporate ?? true);
  const [editInstantPush, setEditInstantPush] = useState<boolean>(currentSettlement?.config?.enableInstantPushNotifications ?? true);
  const [editMinPendingThreshold, setEditMinPendingThreshold] = useState<number>(currentSettlement?.config?.minPendingPayoutThreshold || 5000);
  const [editEnablePendingAlert, setEditEnablePendingAlert] = useState<boolean>(currentSettlement?.config?.enablePendingPayoutAlert ?? true);
  const [editDailySalesGoal, setEditDailySalesGoal] = useState<number>(currentSettlement?.config?.dailySalesGoal || 5000);
  const [editBankName, setEditBankName] = useState<string>(currentSettlement?.bankAccount?.bankName || '');
  const [editAccountNum, setEditAccountNum] = useState<string>(currentSettlement?.bankAccount?.accountNumber || '');
  const [editAccountName, setEditAccountName] = useState<string>(currentSettlement?.bankAccount?.accountName || '');
  const [editPromptPay, setEditPromptPay] = useState<string>(currentSettlement?.bankAccount?.promptPayId || '');

  // Quick refresh loading state
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Today's settlements across all merchant partners ('2026-09-12')
  const todaySettlements = useMemo(() => {
    return merchantSettlements.filter(s => s.date === '2026-09-12');
  }, [merchantSettlements]);

  // Total Orders Today across all merchants
  const totalOrdersToday = useMemo(() => {
    return todaySettlements.reduce((sum, s) => sum + s.totalOrders, 0);
  }, [todaySettlements]);

  // Gross Revenue Today across all merchants
  const grossRevenueToday = useMemo(() => {
    return todaySettlements.reduce((sum, s) => sum + s.grossSales, 0);
  }, [todaySettlements]);

  // Total Tips Received Today across all merchants (Performance incentives for delivery staff)
  const totalTipsToday = useMemo(() => {
    return todaySettlements.reduce((sum, s) => sum + (s.totalTipsReceived || 0), 0);
  }, [todaySettlements]);

  // Pending Payouts Today (sum of net payouts for settlements not yet marked 'paid')
  const pendingPayoutsToday = useMemo(() => {
    return todaySettlements
      .filter(s => s.status !== 'paid')
      .reduce((sum, s) => sum + s.netPayoutPayable, 0);
  }, [todaySettlements]);

  const pendingPayoutStoresCount = useMemo(() => {
    return todaySettlements.filter(s => s.status !== 'paid').length;
  }, [todaySettlements]);

  // Current store today's settlement record
  const currentStoreTodaySettlement = useMemo(() => {
    return merchantSettlements.find(
      s => s.restaurantId === selectedSettlementRestId && s.date === '2026-09-12'
    );
  }, [merchantSettlements, selectedSettlementRestId]);

  // Quick refresh handler
  const handleQuickRefresh = () => {
    setIsRefreshing(true);
    runEodSettlementCalculation(selectedSettlementRestId, selectedSettlementDate);
    playChimeSound();
    setTimeout(() => {
      setIsRefreshing(false);
      triggerToast(
        'รีเฟรชข้อมูลสำเร็จ (Quick Refresh) 🔄',
        `อัปเดตยอด Total Orders Today (${totalOrdersToday.toLocaleString()} ออเดอร์), Gross Revenue (฿${grossRevenueToday.toLocaleString(undefined, { minimumFractionDigits: 2 })}), Total Tips (฿${totalTipsToday.toLocaleString(undefined, { minimumFractionDigits: 2 })}) และ Pending Payouts (฿${pendingPayoutsToday.toLocaleString(undefined, { minimumFractionDigits: 2 })}) เรียบร้อยแล้ว`,
        'success'
      );

      // Check if refreshed pending payout crosses minimum threshold
      if (
        currentSettlement?.config?.enablePendingPayoutAlert !== false &&
        currentSettlement?.status !== 'paid' &&
        currentSettlement?.netPayoutPayable >= (currentSettlement?.config?.minPendingPayoutThreshold || 5000)
      ) {
        setTimeout(() => {
          triggerPendingPayoutThresholdAlert(undefined, false);
        }, 300);
      }
    }, 450);
  };

  // Sound chime synthesizer for order push alert
  const playChimeSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      }
    } catch {
      // safe fallback if audio is not permitted
    }
  };

  // High-priority two-tone financial alert chime for pending payout threshold alert
  const playThresholdAlertSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        
        // Tone 1
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(523.25, now); // C5
        gain1.gain.setValueAtTime(0.2, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.2);

        // Tone 2
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(783.99, now + 0.15); // G5
        osc2.frequency.exponentialRampToValueAtTime(1046.50, now + 0.35); // C6
        gain2.gain.setValueAtTime(0.3, now + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.15);
        osc2.stop(now + 0.6);
      }
    } catch {
      // safe fallback
    }
  };

  // Trigger in-app notification when pending payout crosses threshold
  const triggerPendingPayoutThresholdAlert = (targetThreshold?: number, isTest = false) => {
    if (!currentSettlement) return;
    const threshold = targetThreshold ?? (currentSettlement.config?.minPendingPayoutThreshold || 5000);
    const pendingAmount = currentSettlement.netPayoutPayable;
    
    playThresholdAlertSound();

    const title = isTest
      ? `🔔 [ทดสอบ] ยอดรอโอนข้ามเกณฑ์ขั้นต่ำ ฿${threshold.toLocaleString()}!`
      : `⚠️ ยอดรอโอน (Pending Payout) ข้ามเกณฑ์ ฿${threshold.toLocaleString()} แล้ว!`;

    const body = `ร้าน ${currentRestaurant.name} มียอดรอโอนสุทธิ ฿${pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ซึ่งข้ามเกณฑ์ขั้นต่ำ ฿${threshold.toLocaleString()} ที่กำหนดไว้ แนะนำให้ทำรายการตรวจสอบหรืออนุมัติโอนเงิน`;

    // Push into system in-app notifications drawer
    addNotification({
      title,
      body,
      type: 'system',
      timestamp: 'เมื่อสักครู่',
      badge: 'แจ้งเตือนการเงิน',
      actionText: 'ดูยอดรอโอน',
      targetId: currentSettlement.id,
    });

    // Display rich interactive toast
    triggerToast(
      title,
      body,
      'reward'
    );
  };

  // Automated tracking to trigger in-app notification when pending payout crosses threshold
  const alertedThresholdKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!currentSettlement) return;
    const threshold = currentSettlement.config?.minPendingPayoutThreshold || 5000;
    const isAlertEnabled = currentSettlement.config?.enablePendingPayoutAlert ?? true;
    const alertKey = `${currentSettlement.id}_${threshold}`;

    if (
      isAlertEnabled &&
      currentSettlement.status !== 'paid' &&
      currentSettlement.netPayoutPayable >= threshold
    ) {
      if (!alertedThresholdKeysRef.current.has(alertKey)) {
        alertedThresholdKeysRef.current.add(alertKey);
        triggerPendingPayoutThresholdAlert(threshold, false);
      }
    }
  }, [currentSettlement]);

  // Direct toggle for instant push notification on the main settlement screen
  const handleDirectToggleInstantPush = () => {
    if (!currentSettlement) return;
    const currentVal = currentSettlement.config?.enableInstantPushNotifications ?? true;
    const nextVal = !currentVal;
    updateMerchantConfig(currentSettlement.restaurantId, {
      enableInstantPushNotifications: nextVal,
    });
    setEditInstantPush(nextVal);
    if (nextVal) {
      playChimeSound();
      triggerToast(
        'เปิดการแจ้งเตือนยอดขายทันทีแล้ว 🔔',
        `ร้าน ${currentRestaurant.name} จะได้รับ Push Notification เตือนทุกครั้งที่มีออเดอร์ชำระเงินสำเร็จ`,
        'success'
      );
    } else {
      triggerToast(
        'ปิดการแจ้งเตือนยอดขายทันทีแล้ว 🔕',
        `ปิดการแจ้งเตือนรายธุรกรรมของร้าน ${currentRestaurant.name} เรียบร้อย (ยอดเงินยังคงคำนวณตามปกติ)`,
        'info'
      );
    }
  };

  // Test sound and push notification
  const handleTestNotification = () => {
    playChimeSound();
    const demoOrderNum = Math.floor(1000 + Math.random() * 9000);
    triggerToast(
      `🔔 [ทดสอบ] ยอดขายสำเร็จ #${demoOrderNum}`,
      `ร้าน ${currentRestaurant.name} ได้รับชำระเงิน ฿350.00 (พร้อมเพย์ QR) - กรุณาเริ่มจัดเตรียมอาหาร`,
      'reward'
    );
  };

  // Reset form when settlement changes
  const handleOpenSettings = () => {
    if (currentSettlement) {
      setEditGpRate(currentSettlement.config.gpRatePct);
      setEditPaymentFee(currentSettlement.config.paymentFeePct);
      setEditIsCorporate(currentSettlement.config.isCorporate);
      setEditInstantPush(currentSettlement.config.enableInstantPushNotifications ?? true);
      setEditMinPendingThreshold(currentSettlement.config.minPendingPayoutThreshold || 5000);
      setEditEnablePendingAlert(currentSettlement.config.enablePendingPayoutAlert ?? true);
      setEditDailySalesGoal(currentSettlement.config.dailySalesGoal || 5000);
      setEditBankName(currentSettlement.bankAccount.bankName);
      setEditAccountNum(currentSettlement.bankAccount.accountNumber);
      setEditAccountName(currentSettlement.bankAccount.accountName);
      setEditPromptPay(currentSettlement.bankAccount.promptPayId || '');
    }
    setIsSettingsOpen(true);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSettlement) return;

    const thresholdNum = Math.max(0, Number(editMinPendingThreshold) || 0);
    const goalNum = Math.max(500, Number(editDailySalesGoal) || 5000);

    updateMerchantConfig(currentSettlement.restaurantId, {
      gpRatePct: Number(editGpRate),
      paymentFeePct: Number(editPaymentFee),
      isCorporate: editIsCorporate,
      whtPct: editIsCorporate ? 3 : 0,
      enableInstantPushNotifications: editInstantPush,
      minPendingPayoutThreshold: thresholdNum,
      enablePendingPayoutAlert: editEnablePendingAlert,
      dailySalesGoal: goalNum,
    });

    updateMerchantBank(currentSettlement.restaurantId, {
      bankName: editBankName,
      accountNumber: editAccountNum,
      accountName: editAccountName,
      promptPayId: editPromptPay,
    });

    setIsSettingsOpen(false);

    triggerToast(
      'บันทึกการตั้งค่าร้านค้าสำเร็จ ⚙️',
      `อัปเดตเกณฑ์แจ้งเตือนยอดรอโอนขั้นต่ำ ฿${thresholdNum.toLocaleString()} (${editEnablePendingAlert ? 'เปิดแจ้งเตือน' : 'ปิดแจ้งเตือน'}) เรียบร้อย`,
      'success'
    );

    // If alert enabled and current pending payout exceeds the newly configured threshold, trigger notification immediately
    if (
      editEnablePendingAlert &&
      currentSettlement.status !== 'paid' &&
      currentSettlement.netPayoutPayable >= thresholdNum
    ) {
      setTimeout(() => {
        triggerPendingPayoutThresholdAlert(thresholdNum, false);
      }, 350);
    }
  };

  // Filter orders
  const filteredOrders = useMemo(() => {
    if (!currentSettlement?.reconciledOrders) return [];
    return currentSettlement.reconciledOrders.filter(ord => {
      const matchQuery = 
        ord.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.itemsSummary.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchPayment = 
        filterPaymentMethod === 'all' || ord.paymentMethod === filterPaymentMethod;

      return matchQuery && matchPayment;
    });
  }, [currentSettlement, searchQuery, filterPaymentMethod]);

  // Status badge styling
  const getStatusBadge = (status: MerchantDailySettlement['status']) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>โอนเงินเข้าบัญชีแล้ว (Paid)</span>
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>อนุมัติจ่ายแล้ว (Approved)</span>
          </span>
        );
      case 'calculated':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Calculator className="w-3.5 h-3.5 text-amber-600" />
            <span>คำนวณปิดยอดแล้ว (Calculated)</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-500 animate-spin" />
            <span>รอสรุปปิดยอดกะ (Pending)</span>
          </span>
        );
    }
  };

  const getPaymentBadge = (method: string) => {
    switch (method) {
      case 'promptpay_qr':
        return <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px]">พร้อมเพย์ QR</span>;
      case 'wallet':
        return <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 font-bold text-[10px]">วอลเล็ต</span>;
      case 'credit_card':
        return <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold text-[10px]">บัตรเครดิต</span>;
      case 'cash_on_delivery':
        return <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-[10px]">เงินสด POS / COD</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">{method}</span>;
    }
  };

  return (
    <div className="space-y-4 p-4 sm:p-5 max-w-5xl mx-auto pb-12">
      {/* Top Breadcrumb & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md shadow-emerald-600/20 shrink-0">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                ระบบ GP ร้านค้า (Merchant GP Portal)
              </span>
              <span className="text-[11px] text-slate-400">รอบบัญชีและส่วนแบ่งรายได้</span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              ระบบ GP ร้านค้าและคำนวณเงินโอนสุทธิ
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* GP Calculator Simulator Button */}
          <button
            id="open-gp-calculator-header-btn"
            onClick={() => setIsGpCalculatorOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="เปิดเครื่องคำนวณและจำลองอัตรา GP"
          >
            <Calculator className="w-3.5 h-3.5 text-emerald-600" />
            <span>คำนวณ GP</span>
          </button>

          {/* Social Auth Login / Signup Button */}
          <button
            id="open-merchant-auth-header-btn"
            onClick={() => setIsMerchantAuthModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="เข้าสู่ระบบร้านค้าด้วย Social หรือลงทะเบียนร้านใหม่"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{activeMerchant ? 'สลับบัญชีร้านค้า' : 'เข้าสู่ระบบ / สมัคร GP'}</span>
          </button>

          {/* Instant Push Notifications Quick Toggle in Header */}
          <button
            id="quick-toggle-push-notif-btn"
            onClick={handleDirectToggleInstantPush}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              (currentSettlement?.config?.enableInstantPushNotifications ?? true)
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 shadow-2xs'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
            }`}
            title={(currentSettlement?.config?.enableInstantPushNotifications ?? true) ? 'คลิกเพื่อปิดการแจ้งเตือนยอดขายทันที' : 'คลิกเพื่อเปิดการแจ้งเตือนยอดขายทันที'}
          >
            {(currentSettlement?.config?.enableInstantPushNotifications ?? true) ? (
              <>
                <BellRing className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span className="hidden sm:inline">แจ้งเตือนขาย:</span>
                <span>เปิด</span>
              </>
            ) : (
              <>
                <BellOff className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">แจ้งเตือนขาย:</span>
                <span>ปิด</span>
              </>
            )}
          </button>

          <button
            id="back-to-customer-app-btn"
            onClick={() => setActiveTab('home')}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>กลับหน้าสั่งอาหาร</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            id="open-merchant-settings-btn"
            onClick={handleOpenSettings}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            title="ตั้งค่าเงื่อนไขสัญญา GP และบัญชีธนาคาร"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Merchant Social Partner Identity Card */}
      {activeMerchant ? (
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950 text-white rounded-3xl p-4 sm:p-5 border border-emerald-500/20 shadow-lg relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <img 
                  src={activeMerchant.avatar} 
                  alt={activeMerchant.ownerName}
                  className="w-13 h-13 rounded-2xl object-cover border-2 border-emerald-400 shadow-md"
                />
                {/* Social Provider Badge on Avatar */}
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow-xs ${
                  activeMerchant.socialProvider === 'line'
                    ? 'bg-[#06C755] text-white'
                    : activeMerchant.socialProvider === 'google'
                    ? 'bg-white text-red-600 border border-slate-200'
                    : activeMerchant.socialProvider === 'facebook'
                    ? 'bg-[#1877F2] text-white'
                    : 'bg-black text-white border border-slate-700'
                }`}>
                  {activeMerchant.socialProvider === 'line' ? 'L' : activeMerchant.socialProvider === 'google' ? 'G' : activeMerchant.socialProvider === 'facebook' ? 'f' : ''}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-base font-black text-white">
                    {activeMerchant.ownerName}
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-emerald-200 border border-white/10">
                    เจ้าของร้าน (Owner)
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500 text-emerald-950">
                    สัญญา GP {activeMerchant.gpRatePct}%
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-300 mt-1 flex-wrap">
                  <span className="font-bold text-white flex items-center gap-1">
                    <Store className="w-3.5 h-3.5 text-emerald-400" />
                    {activeMerchant.restaurantName}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-[11px] text-slate-300">
                    เข้าสู่ระบบด้วย: <strong className="text-emerald-300 uppercase">{activeMerchant.socialProvider}</strong>
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {activeMerchant.contractNumber || 'GP-2026-ACTIVE'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                id="merchant-banner-sim-btn"
                onClick={() => setIsGpCalculatorOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>จำลองคำนวณ GP</span>
              </button>

              <button
                id="merchant-banner-switch-btn"
                onClick={() => setIsMerchantAuthModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 border border-white/15 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>สลับร้าน / ล็อกอิน</span>
              </button>

              <button
                id="merchant-banner-signup-btn"
                onClick={() => setIsMerchantAuthModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-bold text-xs flex items-center gap-1.5 border border-emerald-400/30 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>สมัครร้านใหม่</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white rounded-3xl p-4 sm:p-5 border border-emerald-500/30 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <Store className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">
                คุณยังไม่ได้เข้าสู่ระบบบัญชีร้านค้าพาร์ทเนอร์
              </h3>
              <p className="text-xs text-emerald-200 mt-0.5">
                เชื่อมต่อบัญชี Google, LINE, Facebook หรือ Apple เพื่อจัดการอัตรา GP และเงินโอนสุทธิ
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsMerchantAuthModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white text-emerald-950 font-black text-xs hover:bg-emerald-50 shadow-xs cursor-pointer"
            >
              เข้าสู่ระบบด้วย Social
            </button>
            <button
              onClick={() => setIsMerchantAuthModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 shadow-xs cursor-pointer"
            >
              สมัครร้านค้า GP ใหม่
            </button>
          </div>
        </div>
      )}

      {/* Settlement Automation & Merchant KYC Verification Bar */}
      <SettlementAutomationBar 
        restaurantId={selectedSettlementRestId} 
        selectedDate={selectedSettlementDate} 
      />

      {/* Top Status Summary Card */}
      <div 
        id="merchant-status-summary-card" 
        className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-3.5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xs sm:text-sm font-black text-slate-900">
                  สถานะภาพรวมรายวัน (Daily Settlement Summary)
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  วันนี้ 12 ก.ย. 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                ยอดขายรวม จำนวนออเดอร์ ทิปพนักงานจัดส่ง และยอดเงินสุทธิที่รอดำเนินการโอนให้ร้านค้าพันธมิตร
              </p>
            </div>
          </div>

          {/* Quick-Refresh Button */}
          <button
            id="merchant-quick-refresh-btn"
            onClick={handleQuickRefresh}
            disabled={isRefreshing}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-2xs self-start sm:self-auto active:scale-95 disabled:opacity-60 ${
              isRefreshing
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border-slate-200 hover:border-emerald-300'
            }`}
            title="คลิกเพื่อรีเฟรชยอดขาย ออเดอร์ ทิป และสถานะเงินรอโอนวันนี้"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'กำลังรีเฟรช...' : 'Quick Refresh'}</span>
          </button>
        </div>

        {/* 4 Metric Summary Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* 1. Total Orders Today */}
          <div 
            id="card-total-orders-today"
            className="bg-slate-50/90 hover:bg-slate-50 p-4 rounded-2xl border border-slate-200/80 transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                Total Orders Today
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {totalOrdersToday.toLocaleString()} <span className="text-xs font-bold text-slate-500">ออเดอร์</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between gap-1">
                <span>ยอดออเดอร์ทั้งหมดวันนี้</span>
                <span className="font-semibold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                  ร้านนี้: {currentStoreTodaySettlement?.totalOrders || 0}
                </span>
              </p>
            </div>
          </div>

          {/* 2. Gross Revenue */}
          <div 
            id="card-gross-revenue-today"
            className="bg-slate-50/90 hover:bg-slate-50 p-4 rounded-2xl border border-slate-200/80 transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                Gross Revenue
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight">
                ฿{grossRevenueToday.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between gap-1">
                <span>ยอดขายรวมทุกช่องทาง</span>
                <span className="font-semibold text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                  ร้านนี้: ฿{(currentStoreTodaySettlement?.grossSales || 0).toLocaleString()}
                </span>
              </p>
            </div>
          </div>

          {/* 3. Total Tips Received */}
          <div 
            id="card-total-tips-today"
            className="bg-purple-50/60 hover:bg-purple-50/80 p-4 rounded-2xl border border-purple-200/80 transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-purple-950 group-hover:text-purple-900 transition-colors">
                Total Tips Received
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-purple-900 tracking-tight">
                ฿{totalTipsToday.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-purple-700 mt-1 flex items-center justify-between gap-1">
                <span>ทิปพนักงานจัดส่ง (Incentive)</span>
                <span className="font-semibold text-purple-800 bg-white/90 px-1.5 py-0.5 rounded border border-purple-200 text-[10px]">
                  ร้านนี้: ฿{(currentStoreTodaySettlement?.totalTipsReceived || 0).toLocaleString()}
                </span>
              </p>
            </div>
          </div>

          {/* 4. Pending Payouts */}
          <div 
            id="card-pending-payouts-today"
            className="bg-amber-50/60 hover:bg-amber-50/80 p-4 rounded-2xl border border-amber-200/80 transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-amber-900">
                  Pending Payouts
                </span>
                {currentSettlement?.config?.enablePendingPayoutAlert !== false && (
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenSettings();
                    }}
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer border transition-colors ${
                      currentSettlement && (currentSettlement?.netPayoutPayable ?? 0) >= (currentSettlement?.config?.minPendingPayoutThreshold || 5000)
                        ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
                        : 'bg-white text-amber-800 border-amber-300 hover:bg-amber-100'
                    }`}
                    title="คลิกเพื่อตั้งค่าเกณฑ์แจ้งเตือนยอดเงินรอโอนขั้นต่ำ"
                  >
                    🔔 เกณฑ์ ฿{(currentSettlement?.config?.minPendingPayoutThreshold || 5000).toLocaleString()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  id="btn-settings-pending-threshold"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenSettings();
                  }}
                  className="w-7 h-7 rounded-lg bg-amber-100/80 hover:bg-amber-200 text-amber-800 flex items-center justify-center transition-colors cursor-pointer"
                  title="ตั้งค่าเกณฑ์ยอดเงินรอโอนขั้นต่ำ (Pending Payout Threshold)"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-amber-900 tracking-tight">
                ฿{pendingPayoutsToday.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-amber-800 mt-1 flex items-center justify-between gap-1">
                <span>ยอดรอโอนสุทธิเข้าร้านค้า</span>
                <span className="font-bold text-amber-800 bg-white/90 px-1.5 py-0.5 rounded border border-amber-300 text-[10px]">
                  {pendingPayoutStoresCount > 0 ? `${pendingPayoutStoresCount} ร้านค้ารอโอน` : 'โอนครบแล้ว ✨'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary View: Weekly Revenue Trends Bar Chart */}
      <WeeklyRevenueSummaryView onSelectDate={(date) => handleSelectDate(date)} />

      {/* Select Restaurant Partner & Historical Date Picker Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Restaurant selector dropdown */}
        <div className="md:col-span-6 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-emerald-600" />
            <span>เลือกร้านค้าพันธมิตร (Merchant Partner):</span>
          </label>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {RESTAURANTS_DATA.map(rest => {
              const isSelected = rest.id === selectedSettlementRestId;
              return (
                <button
                  key={rest.id}
                  id={`select-rest-settlement-${rest.id}`}
                  onClick={() => setSelectedSettlementRestId(rest.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-600'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <img
                    src={rest.logoImage}
                    alt={rest.name}
                    className="w-5 h-5 rounded-lg object-cover border border-white/40 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <span className="truncate max-w-[140px]">{rest.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Historical Date Selection Input & Presets */}
        <div className="md:col-span-6 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <label 
              htmlFor="merchant-settlement-date-input" 
              className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>เลือกรอบวันที่ปิดยอด (Settlement Date):</span>
            </label>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors ${
              selectedSettlementDate === '2026-09-12'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}>
              {selectedSettlementDate === '2026-09-12' ? '● รอบวันนี้' : `● ข้อมูลย้อนหลัง (${formatThaiDateDisplay(selectedSettlementDate)})`}
            </span>
          </div>

          {/* Date Input with Step Back/Forward Navigation */}
          <div className="flex items-center gap-1.5">
            <button
              id="prev-settlement-day-btn"
              type="button"
              onClick={() => handleStepDay('prev')}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer border border-slate-200 shrink-0 font-bold text-sm"
              title="ย้อนกลับ 1 วัน (Previous Day)"
            >
              ‹
            </button>

            <div className="relative flex-1">
              <input
                id="merchant-settlement-date-input"
                type="date"
                max="2026-09-12"
                value={selectedSettlementDate}
                onChange={(e) => handleSelectDate(e.target.value)}
                className="w-full h-9 px-3 text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer shadow-2xs"
                title="คลิกเพื่อเลือกวันย้อนหลังในปฏิทิน"
              />
            </div>

            <button
              id="next-settlement-day-btn"
              type="button"
              onClick={() => handleStepDay('next')}
              disabled={selectedSettlementDate >= '2026-09-12'}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 flex items-center justify-center transition-colors cursor-pointer border border-slate-200 shrink-0 font-bold text-sm"
              title="ถัดไป 1 วัน (Next Day)"
            >
              ›
            </button>
          </div>

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-4 gap-1.5 pt-0.5">
            {availableDates.map(d => {
              const isSelected = d.key === selectedSettlementDate;
              return (
                <button
                  key={d.key}
                  id={`select-date-${d.key}`}
                  type="button"
                  onClick={() => handleSelectDate(d.key)}
                  className={`px-2 py-1 rounded-lg text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <div className="text-[11px] leading-tight font-bold">{d.label}</div>
                  <div className={`text-[9px] ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                    {d.sublabel}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
 
      {/* Live Merchant Incoming Order Alert & Notification Controls */}
      <MerchantOrderAlertControlBar
        isSoundMuted={isAlertSoundMuted}
        onToggleSound={handleToggleAlertSound}
        onTestSound={handleTestAlertSound}
        onSimulateIncomingOrder={handleSimulateIncomingOrder}
        unacknowledgedCount={unacknowledgedOrders.length}
        onOpenPendingModal={() => {
          if (unacknowledgedOrders.length > 0) {
            setActiveAlertOrder(unacknowledgedOrders[0]);
            setIsAlertModalOpen(true);
            merchantOrderAudio.setSoundMuted(isAlertSoundMuted);
            merchantOrderAudio.startLoopingOrderAlert();
          } else {
            handleSimulateIncomingOrder();
          }
        }}
      />

      {/* Daily Insights Component: Visualizing Total Daily Revenue vs Commission Fees Deducted */}
      {currentSettlement && (
        <DailyInsights
          settlement={currentSettlement}
          allSettlements={merchantSettlements}
          selectedDate={selectedSettlementDate}
          onSelectDate={handleSelectDate}
        />
      )}

      {/* Summary Alert: Daily Sales Goals Met & Pending Payout Status */}
      {currentSettlement && (
        <SettlementSummaryAlert
          settlement={currentSettlement}
          restaurantName={currentRestaurant.name}
          onOpenTransferConfirm={() => setIsTransferConfirmOpen(true)}
          onOpenSettings={handleOpenSettings}
          onQuickRefresh={handleQuickRefresh}
        />
      )}

      {/* Main Settlement Highlight Card */}
      {currentSettlement && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden">
          {/* Top Header of the Settlement */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={currentRestaurant.logoImage}
                alt={currentRestaurant.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20 shadow-sm shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500 text-slate-950">
                    ID: {currentSettlement.restaurantId}
                  </span>
                  <span className="text-xs text-slate-300">
                    เลขที่รอบ: {currentSettlement.id}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-white truncate mt-0.5">
                  {currentRestaurant.name}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 flex-wrap">
                  <span>รอบสรุปยอด: {currentSettlement.dateDisplayTh}</span>
                  <span>•</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
                    สัญญา GP: {currentSettlement.config.gpRatePct}% ({GP_PACKAGES.find(p => p.ratePct === currentSettlement.config.gpRatePct)?.nameTh || 'Custom GP'})
                  </span>
                  <span>•</span>
                  <span>{currentSettlement.config.isCorporate ? 'นิติบุคคล (WHT 3%)' : 'บุคคลธรรมดา'}</span>
                </div>
              </div>
            </div>

            {/* Status & Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 shrink-0">
              <div className="self-start sm:self-auto">
                {getStatusBadge(currentSettlement.status)}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  id="open-sim-from-card-btn"
                  onClick={() => setIsGpCalculatorOpen(true)}
                  className="px-3 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs border border-emerald-400/40"
                  title="เปิดเครื่องคำนวณและจำลอง GP"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>จำลองคำนวณ GP</span>
                </button>

                <button
                  id="recalculate-eod-btn"
                  onClick={() => runEodSettlementCalculation(selectedSettlementRestId, selectedSettlementDate)}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-white/15"
                  title="คำนวณและดึงรายการออเดอร์ใหม่"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>คำนวณใหม่</span>
                </button>

                <button
                  id="view-slip-modal-btn"
                  onClick={() => setIsSlipModalOpen(true)}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-white/15"
                  title="ดูสลิปสรุปการจ่ายเงินฉบับพิมพ์"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>สลิปปิดยอด</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mathematical Payout Formula Breakdown Grid */}
          <div className="p-4 sm:p-6 bg-slate-50/70 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  สูตรการคำนวณยอดเงินสุทธิที่ต้องโอน (Settlement Calculation Formula)
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                คำนวณตามมาตรฐานสรรพากรไทย & กฎหมายภาษีบริการ
              </span>
            </div>

            {/* Step-by-step Formula Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
              {/* 1. Gross Sales */}
              <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block">1. ยอดขายรวม (Gross)</span>
                <div className="text-base font-black text-slate-900">
                  ฿{(currentSettlement?.grossSales ?? 0).toLocaleString()}
                </div>
                <span className="text-[9px] text-emerald-600 font-semibold block">
                  {currentSettlement?.completedOrdersCount ?? 0} ออเดอร์สำเร็จ
                </span>
              </div>

              {/* 2. Platform GP */}
              <div className="p-3 rounded-2xl bg-white border border-rose-100 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-rose-500 block">2. หัก ค่า GP ({currentSettlement?.config?.gpRatePct ?? 20}%)</span>
                <div className="text-base font-black text-rose-600">
                  -฿{(currentSettlement?.platformGpAmount ?? 0).toLocaleString()}
                </div>
                <span className="text-[9px] text-slate-400 block">
                  ค่าคอมมิชชันแพลตฟอร์ม
                </span>
              </div>

              {/* 3. Payment Gateway MDR */}
              <div className="p-3 rounded-2xl bg-white border border-rose-100 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-rose-500 block">3. หัก MDR ({currentSettlement?.config?.paymentFeePct ?? 1.5}%)</span>
                <div className="text-base font-black text-rose-600">
                  -฿{(currentSettlement?.paymentProcessingFee ?? 0).toLocaleString()}
                </div>
                <span className="text-[9px] text-slate-400 block">
                  ค่าประมวลผลบัตร/QR
                </span>
              </div>

              {/* 4. VAT 7% on Service Fees */}
              <div className="p-3 rounded-2xl bg-white border border-amber-100 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-amber-600 block">4. หัก VAT 7%</span>
                <div className="text-base font-black text-amber-700">
                  -฿{(currentSettlement?.vatOnFees ?? 0).toLocaleString()}
                </div>
                <span className="text-[9px] text-slate-400 block">
                  7% ของค่าบริการ GP+MDR
                </span>
              </div>

              {/* 5. Withholding Tax (WHT 3%) */}
              <div className="p-3 rounded-2xl bg-white border border-blue-100 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-blue-600 block">5. คืนภาษี หัก ณ ที่จ่าย</span>
                <div className="text-base font-black text-blue-700">
                  +฿{(currentSettlement?.withholdingTax ?? 0).toLocaleString()}
                </div>
                <span className="text-[9px] text-slate-400 block">
                  WHT 3% นิติบุคคล
                </span>
              </div>

              {/* 6. Cash Collected by Store (COD/POS) */}
              <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-500 block">6. หักเงินสดหน้าร้าน</span>
                <div className="text-base font-black text-slate-700">
                  -฿{(currentSettlement?.cashCollectedByStore ?? 0).toLocaleString()}
                </div>
                <span className="text-[9px] text-slate-400 block">
                  ร้านรับเงินสดแล้ว
                </span>
              </div>

              {/* 7. NET PAYOUT (HIGHLIGHT) */}
              <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-md space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-black text-emerald-100 block">7. สุทธิโอนเข้าร้าน</span>
                <div className="text-lg font-black text-white">
                  ฿{(currentSettlement?.netPayoutPayable ?? 0).toLocaleString()}
                </div>
                <span className="text-[9px] text-emerald-200 font-semibold block">
                  Net Merchant Payout
                </span>
              </div>
            </div>
          </div>

          {/* Minimum Pending Payout Threshold Status Banner */}
          {currentSettlement.status !== 'paid' && currentSettlement.config?.enablePendingPayoutAlert !== false && (
            <div 
              id="banner-pending-payout-threshold"
              className={`mx-4 sm:mx-6 mt-4 p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                (currentSettlement?.netPayoutPayable ?? 0) >= (currentSettlement?.config?.minPendingPayoutThreshold || 5000)
                  ? 'bg-amber-500/10 border-amber-300 text-amber-950'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-start sm:items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                  (currentSettlement?.netPayoutPayable ?? 0) >= (currentSettlement?.config?.minPendingPayoutThreshold || 5000)
                    ? 'bg-amber-500 text-white shadow-2xs animate-pulse'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  <BellRing className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs">
                      เกณฑ์แจ้งเตือนยอดรอโอน (Pending Payout Threshold): ฿{(currentSettlement?.config?.minPendingPayoutThreshold || 5000).toLocaleString()}
                    </span>
                    {(currentSettlement?.netPayoutPayable ?? 0) >= (currentSettlement?.config?.minPendingPayoutThreshold || 5000) ? (
                      <span className="text-[10px] font-extrabold bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-white" />
                        <span>เกินเกณฑ์แจ้งเตือนแล้ว (+฿{Math.max(0, (currentSettlement?.netPayoutPayable ?? 0) - (currentSettlement?.config?.minPendingPayoutThreshold || 5000)).toLocaleString()})</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                        ยังไม่ถึงเกณฑ์ (ขาดอีก ฿{Math.max(0, (currentSettlement?.config?.minPendingPayoutThreshold || 5000) - (currentSettlement?.netPayoutPayable ?? 0)).toLocaleString()})
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {(currentSettlement?.netPayoutPayable ?? 0) >= (currentSettlement?.config?.minPendingPayoutThreshold || 5000)
                      ? 'ยอดรอโอนข้ามเกณฑ์ที่กำหนดแล้ว ระบบได้ส่งการแจ้งเตือน In-App Notification ให้ทราบเรียบร้อย สามารถอนุมัติโอนเงินได้ทันที'
                      : 'ระบบจะส่ง In-App Notification แจ้งเตือนอัตโนมัติเมื่อยอดเงินรอโอนสะสมถึงหรือข้ามเกณฑ์ขั้นต่ำนี้'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  id="btn-trigger-threshold-alert-again"
                  onClick={() => triggerPendingPayoutThresholdAlert(undefined, false)}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-amber-50 border border-amber-300 text-amber-900 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                  title="ส่ง In-App Notification แจ้งเตือนยอดข้ามเกณฑ์อีกครั้ง"
                >
                  <Bell className="w-3.5 h-3.5 text-amber-600" />
                  <span>ส่งเตือนซ้ำ</span>
                </button>

                <button
                  type="button"
                  id="btn-quick-config-threshold"
                  onClick={handleOpenSettings}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                  title="ตั้งค่าเกณฑ์ยอดเงินรอโอนขั้นต่ำ"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                  <span>ปรับเกณฑ์</span>
                </button>
              </div>
            </div>
          )}

          {/* Transfer & Bank Account Dispatch Panel */}
          <div className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Bank details info */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0 border border-emerald-200">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    {currentSettlement.bankAccount.bankName}
                  </span>
                  <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                    {currentSettlement.bankAccount.accountNumber}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  ชื่อบัญชี: <span className="font-medium text-slate-700">{currentSettlement.bankAccount.accountName}</span>
                  {currentSettlement.bankAccount.promptPayId && (
                    <span className="ml-2 text-slate-400">| พร้อมเพย์: {currentSettlement.bankAccount.promptPayId}</span>
                  )}
                </p>
                {currentSettlement.status === 'paid' && currentSettlement.transferRefNumber && (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>โอนแล้ว: {currentSettlement.transferredAt} (เลขอ้างอิง: {currentSettlement.transferRefNumber})</span>
                  </div>
                )}
              </div>
            </div>

            {/* Execute Payout Transfer CTA */}
            <div className="flex items-center gap-2.5 self-end md:self-auto">
              {currentSettlement.status !== 'paid' ? (
                <button
                  id="execute-payout-transfer-btn"
                  onClick={() => setIsTransferConfirmOpen(true)}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center gap-2 shadow-md shadow-emerald-600/30 transition-transform active:scale-95 cursor-pointer"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>อนุมัติโอนเงิน ฿{(currentSettlement?.netPayoutPayable ?? 0).toLocaleString()}</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>เงินโอนเข้าบัญชีเรียบร้อยแล้ว</span>
                  </span>
                  <button
                    onClick={() => setIsSlipModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ใบเสร็จ / สลิปโอน</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Live Reconciliation Audit Table */}
      <div id="merchant-orders-breakdown-section" className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-4">
        {/* Table header & controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <span>แจกแจงรายการออเดอร์ในรอบวัน (Order-by-Order Reconciliation Audit)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ตรวจสอบความถูกต้องของยอดขาย, ค่า GP, และส่วนลดรายบิลทั้งหมด {filteredOrders.length} รายการ
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ค้นหารหัส หรือเมนู..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-44"
              />
            </div>

            <select
              value={filterPaymentMethod}
              onChange={e => setFilterPaymentMethod(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">ช่องทางชำระเงินทั้งหมด</option>
              <option value="promptpay_qr">พร้อมเพย์ QR</option>
              <option value="wallet">วอลเล็ต</option>
              <option value="credit_card">บัตรเครดิต</option>
              <option value="cash_on_delivery">เงินสด POS / COD</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/70">
                <th className="py-2.5 px-3 rounded-l-xl">เวลา & รหัสออเดอร์</th>
                <th className="py-2.5 px-3">ประเภท</th>
                <th className="py-2.5 px-3">รายการอาหาร</th>
                <th className="py-2.5 px-3">ช่องทางชำระ</th>
                <th className="py-2.5 px-3 text-right">ยอดขาย (Gross)</th>
                <th className="py-2.5 px-3 text-right">หัก GP ({currentSettlement?.config?.gpRatePct}%)</th>
                <th className="py-2.5 px-3 text-right">สุทธิร้านค้ารับ</th>
                <th className="py-2.5 px-3 text-center rounded-r-xl">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => {
                  const isDelivered = order.status === 'delivered';
                  return (
                    <tr key={order.orderId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{order.orderId}</div>
                        <div className="text-[10px] text-slate-400">{order.time}</div>
                      </td>

                      <td className="py-3 px-3">
                        {order.orderType === 'delivery' ? (
                          <div className="flex flex-col items-start gap-1">
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              🛵 เดลิเวอรี
                            </span>
                            {order.tipAmount && order.tipAmount > 0 ? (
                              <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 flex items-center gap-0.5" title="ทิปพนักงานจัดส่ง">
                                <span>+ทิป ฿{order.tipAmount}</span>
                              </span>
                            ) : null}
                          </div>
                        ) : order.orderType === 'takeaway' ? (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                            🛍️ สั่งกลับบ้าน
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                            🍽️ ทานที่ร้าน (POS)
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-800 line-clamp-1 max-w-[200px]" title={order.itemsSummary}>
                          {order.itemsSummary}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {getPaymentBadge(order.paymentMethod)}
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        {isDelivered ? `฿${(order.grossAmount ?? 0).toLocaleString()}` : <span className="text-slate-400 line-through">฿{order.grossAmount ?? 0}</span>}
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-rose-600">
                        {isDelivered ? `-฿${(order.platformGp ?? 0).toLocaleString()}` : '-'}
                      </td>

                      <td className="py-3 px-3 text-right font-black text-emerald-700">
                        {isDelivered ? `฿${(order.netPayout ?? 0).toLocaleString()}` : <span className="text-slate-400 font-normal">ยกเลิก</span>}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {isDelivered ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            พร้อมจ่าย
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            ยกเลิก
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    ไม่พบรายการออเดอร์ตามเงื่อนไขที่ค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settings Modal (Contract GP & Bank Account) */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Settings className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    ตั้งค่าเงื่อนไขสัญญา & บัญชีธนาคารร้านค้า
                  </h3>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                {/* Contract Rates */}
                <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-emerald-600" />
                      <span>อัตราสัญญา GP และภาษี (GP Contract & Taxes)</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSettingsOpen(false);
                        setIsGpCalculatorOpen(true);
                      }}
                      className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer"
                    >
                      <Calculator className="w-3 h-3 text-emerald-600" />
                      <span>เปิดเครื่องจำลอง GP</span>
                    </button>
                  </div>

                  {/* GP Package Quick Selection */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-500 font-medium">เลือกแพ็กเกจ GP สำเร็จรูป:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {GP_PACKAGES.map(pkg => (
                        <button
                          key={pkg.tier}
                          type="button"
                          onClick={() => setEditGpRate(pkg.ratePct)}
                          className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                            editGpRate === pkg.ratePct
                              ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500'
                              : 'bg-white hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          <div className="text-[11px] font-black text-slate-900">{pkg.nameTh}</div>
                          <div className="text-[10px] font-extrabold text-emerald-600">GP {pkg.ratePct}%</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        ระบุอัตราค่า GP ร้านค้า (%):
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        step="0.5"
                        value={editGpRate}
                        onChange={e => setEditGpRate(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        ค่าบริการ MDR ชำระเงิน (%):
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={editPaymentFee}
                        onChange={e => setEditPaymentFee(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">หัก ณ ที่จ่าย 3% (WHT)</span>
                      <span className="text-[10px] text-slate-500">สำหรับนิติบุคคลที่มีสิทธิ์หักภาษีจากค่าบริการ</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={editIsCorporate}
                      onChange={e => setEditIsCorporate(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Instant Push Notifications Settings Section */}
                <div className="space-y-3 bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200/90 shadow-2xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold transition-colors ${
                        editInstantPush ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {editInstantPush ? <BellRing className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-xs">
                            การแจ้งเตือนยอดขายทันที (Instant Transaction Push)
                          </h4>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md uppercase ${
                            editInstantPush ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {editInstantPush ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          ส่ง Push Notification และเสียงแจ้งเตือนแบบเรียลไทม์ทุกครั้งที่มีรายการชำระเงินและสั่งซื้อสำเร็จที่ร้านค้า
                        </p>
                      </div>
                    </div>

                    {/* Interactive Toggle Switch */}
                    <button
                      type="button"
                      id="toggle-instant-push-notifications-switch"
                      role="switch"
                      aria-checked={editInstantPush}
                      onClick={() => setEditInstantPush(!editInstantPush)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                        editInstantPush ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          editInstantPush ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-emerald-100 flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[10px] text-emerald-800 font-medium">
                      {editInstantPush 
                        ? '🟢 พร้อมส่งการแจ้งเตือนยอดขายเข้าเครื่อง POS / มือถือทันที' 
                        : '⚪ ปิดการแจ้งเตือน (ยอดขายยังบันทึกและคำนวณเงินโอนตามปกติ)'}
                    </span>
                    <button
                      type="button"
                      id="test-push-notification-btn"
                      onClick={handleTestNotification}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors shrink-0 shadow-2xs"
                    >
                      <Volume2 className="w-3 h-3 text-emerald-600" />
                      <span>ทดสอบเสียงเตือน</span>
                    </button>
                  </div>
                </div>

                {/* Minimum 'Pending Payout' Threshold Alert Configuration Section */}
                <div className="space-y-3 bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200 shadow-2xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold transition-colors ${
                        editEnablePendingAlert ? 'bg-amber-500 text-white shadow-2xs' : 'bg-slate-200 text-slate-500'
                      }`}>
                        <SlidersHorizontal className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-xs">
                            เกณฑ์แจ้งเตือนยอดเงินรอโอนขั้นต่ำ (Pending Payout Threshold)
                          </h4>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase ${
                            editEnablePendingAlert ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {editEnablePendingAlert ? 'เปิดแจ้งเตือน' : 'ปิดแจ้งเตือน'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          ระบบจะส่ง In-App Notification แจ้งเตือนทันทีเมื่อยอดเงินรอโอนสุทธิ (Pending Payout) สะสมถึงหรือข้ามจำนวนเงินขั้นต่ำที่กำหนด
                        </p>
                      </div>
                    </div>

                    {/* Interactive Toggle Switch */}
                    <button
                      type="button"
                      id="toggle-pending-payout-threshold-switch"
                      role="switch"
                      aria-checked={editEnablePendingAlert}
                      onClick={() => setEditEnablePendingAlert(!editEnablePendingAlert)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                        editEnablePendingAlert ? 'bg-amber-500' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          editEnablePendingAlert ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {editEnablePendingAlert && (
                    <div className="space-y-2.5 pt-2 border-t border-amber-200/80">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-semibold text-slate-700">
                            จำนวนเงินขั้นต่ำสำหรับแจ้งเตือน (บาท):
                          </label>
                          <span className="text-[10px] text-amber-800 font-bold">
                            ขั้นต่ำ ฿500 - สูงสุด ฿100,000
                          </span>
                        </div>

                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                            ฿
                          </span>
                          <input
                            type="number"
                            id="input-min-pending-payout-threshold"
                            min="500"
                            max="100000"
                            step="500"
                            value={editMinPendingThreshold}
                            onChange={e => setEditMinPendingThreshold(Math.max(0, Number(e.target.value)))}
                            className="w-full pl-8 pr-12 py-2 rounded-xl border border-amber-300 bg-white font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm shadow-2xs"
                            placeholder="5000"
                            required
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">
                            บาท
                          </span>
                        </div>
                      </div>

                      {/* Quick Preset Buttons */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-slate-500 font-medium">ค่าแนะนำด่วน:</span>
                        {[1000, 3000, 5000, 10000, 20000, 50000].map(val => {
                          const isActive = editMinPendingThreshold === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setEditMinPendingThreshold(val)}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                isActive 
                                  ? 'bg-amber-600 text-white shadow-2xs' 
                                  : 'bg-white hover:bg-amber-100 text-amber-900 border border-amber-200'
                              }`}
                            >
                              ฿{val.toLocaleString()}
                            </button>
                          );
                        })}
                      </div>

                      {/* Real-time Comparison Preview */}
                      <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200 text-[11px] space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 font-medium">ยอดรอโอนสุทธิปัจจุบันของร้าน:</span>
                          <span className="font-bold text-slate-900">
                            ฿{(currentSettlement?.netPayoutPayable || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>

                        {/* Progress Bar towards threshold */}
                        {(() => {
                          const currentPending = currentSettlement?.netPayoutPayable || 0;
                          const targetThreshold = editMinPendingThreshold || 1;
                          const ratio = Math.min(100, Math.round((currentPending / targetThreshold) * 100));
                          const isCrossed = currentPending >= targetThreshold;

                          return (
                            <div>
                              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-300 rounded-full ${
                                    isCrossed ? 'bg-amber-500' : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${ratio}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between text-[10px] mt-1">
                                <span className={`font-bold flex items-center gap-1 ${
                                  isCrossed ? 'text-amber-700' : 'text-slate-500'
                                }`}>
                                  {isCrossed ? (
                                    <>
                                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                                      <span>เกินเกณฑ์แล้ว! (+฿{Math.max(0, (currentPending ?? 0) - (targetThreshold ?? 0)).toLocaleString()})</span>
                                    </>
                                  ) : (
                                    <span>ยังไม่ถึงเกณฑ์ (ขาดอีก ฿{Math.max(0, (targetThreshold ?? 0) - (currentPending ?? 0)).toLocaleString()})</span>
                                  )}
                                </span>
                                <span className="font-bold text-slate-600">
                                  {Math.round((currentPending / targetThreshold) * 100)}%
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                        <span className="text-[10px] text-amber-800 font-medium">
                          🔔 เตือนผ่าน In-App Notification & เสียงสัญญาณ
                        </span>
                        <button
                          type="button"
                          id="btn-test-pending-payout-threshold"
                          onClick={() => triggerPendingPayoutThresholdAlert(editMinPendingThreshold, true)}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                        >
                          <BellRing className="w-3 h-3 text-amber-600" />
                          <span>ทดสอบการแจ้งเตือนเกณฑ์</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Daily Sales Goal Configuration */}
                <div className="space-y-3 bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                      <Trophy className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">
                        เป้าหมายยอดขายประจำวัน (Daily Sales Goal)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        เมื่อยอดขายรวมถึงเป้าหมาย ระบบจะแสดงการแจ้งเตือนสรุปความสำเร็จ (Goal Met Alert)
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-slate-700">
                        เป้าหมายยอดขายรวม (บาท / วัน):
                      </label>
                      <span className="text-[10px] text-emerald-800 font-bold">
                        แนะนำ ฿3,000 - ฿20,000
                      </span>
                    </div>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                        ฿
                      </span>
                      <input
                        type="number"
                        id="input-daily-sales-goal-setting"
                        min="500"
                        max="200000"
                        step="500"
                        value={editDailySalesGoal}
                        onChange={e => setEditDailySalesGoal(Math.max(500, Number(e.target.value)))}
                        className="w-full pl-8 pr-12 py-2 rounded-xl border border-emerald-300 bg-white font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm shadow-2xs"
                        placeholder="5000"
                        required
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">
                        บาท
                      </span>
                    </div>
                  </div>

                  {/* Preset goal buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-500 font-medium">เป้าหมายยอดนิยม:</span>
                    {[3000, 5000, 7500, 10000, 15000].map(val => {
                      const isActive = editDailySalesGoal === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setEditDailySalesGoal(val)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
                          }`}
                        >
                          ฿{val.toLocaleString()}
                        </button>
                      );
                    })}
                  </div>

                  {/* Real-time comparison preview */}
                  <div className="p-2.5 rounded-xl bg-white/90 border border-emerald-200 text-[11px] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">ยอดขายรวมปัจจุบัน:</span>
                      <span className="font-bold text-emerald-700">
                        ฿{(currentSettlement?.grossSales || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {(() => {
                      const currentSales = currentSettlement?.grossSales || 0;
                      const targetGoal = editDailySalesGoal || 1;
                      const ratio = Math.min(100, Math.round((currentSales / targetGoal) * 100));
                      const isMet = currentSales >= targetGoal;

                      return (
                        <div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                            <div
                              className={`h-full transition-all duration-300 rounded-full ${
                                isMet ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                              style={{ width: `${ratio}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] mt-1 font-bold">
                            <span className={isMet ? 'text-emerald-700' : 'text-slate-500'}>
                              {isMet ? `🎉 ถึงเป้าหมายแล้ว (+฿${Math.max(0, (currentSales ?? 0) - (targetGoal ?? 0)).toLocaleString()})` : `ยังขาดอีก ฿${Math.max(0, (targetGoal ?? 0) - (currentSales ?? 0)).toLocaleString()}`}
                            </span>
                            <span className={isMet ? 'text-emerald-700' : 'text-slate-600'}>
                              {Math.round((currentSales / targetGoal) * 100)}%
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Bank Account Details */}
                <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ข้อมูลบัญชีรับเงินร้านค้า (Payout Destination)</span>
                  </h4>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      ธนาคารพาณิชย์:
                    </label>
                    <input
                      type="text"
                      value={editBankName}
                      onChange={e => setEditBankName(e.target.value)}
                      placeholder="เช่น ธนาคารกสิกรไทย (KBANK)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        เลขที่บัญชี:
                      </label>
                      <input
                        type="text"
                        value={editAccountNum}
                        onChange={e => setEditAccountNum(e.target.value)}
                        placeholder="000-0-00000-0"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        พร้อมเพย์ (PromptPay ID):
                      </label>
                      <input
                        type="text"
                        value={editPromptPay}
                        onChange={e => setEditPromptPay(e.target.value)}
                        placeholder="เลขประจำตัวผู้เสียภาษี 13 หลัก"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      ชื่อบัญชี / ชื่อบริษัท (Account Name):
                    </label>
                    <input
                      type="text"
                      value={editAccountName}
                      onChange={e => setEditAccountName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-xs"
                  >
                    บันทึกการเปลี่ยนแปลง
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payout Transfer Confirmation Modal */}
      <AnimatePresence>
        {isTransferConfirmOpen && currentSettlement && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4"
            >
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                  <DollarSign className="w-7 h-7" />
                </div>
                <h3 className="text-base font-black text-slate-900">
                  ยืนยันการอนุมัติโอนเงินเข้าบัญชีร้านค้า
                </h3>
                <p className="text-xs text-slate-500">
                  ระบบจะทำการสั่งโอนเงินตรงแบบ B2B API เข้าบัญชีธนาคารของร้านค้าทันที
                </p>
              </div>

              {/* Summary Review Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">ร้านค้า:</span>
                  <span className="font-bold text-slate-900">{currentRestaurant.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">รอบวันที่:</span>
                  <span className="font-bold text-slate-900">{currentSettlement.dateDisplayTh}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">บัญชีปลายทาง:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {currentSettlement.bankAccount.bankName} ({currentSettlement.bankAccount.accountNumber})
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-slate-700 font-bold">ยอดเงินสุทธิที่โอน:</span>
                  <span className="text-lg font-black text-emerald-700">
                    ฿{(currentSettlement?.netPayoutPayable ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTransferConfirmOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="button"
                  id="confirm-transfer-now-btn"
                  onClick={() => {
                    approveAndTransferPayout(currentSettlement.id);
                    setIsTransferConfirmOpen(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-md shadow-emerald-600/30"
                >
                  ยืนยันการโอนเงินทันที
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Printable Daily POS Settlement Slip Modal */}
      <AnimatePresence>
        {isSlipModalOpen && currentSettlement && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500">ใบสรุปยอดการจ่ายเงินร้านค้าประจำวัน</span>
                <button
                  onClick={() => setIsSlipModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Thermal Slip Styled View */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-300 font-mono text-[11px] space-y-3 text-slate-800">
                <div className="text-center space-y-1 pb-2 border-b border-dashed border-slate-300">
                  <h2 className="font-black text-sm text-slate-900 font-sans">FOODEXPRESS POS SETTLEMENT</h2>
                  <p className="text-[10px] text-slate-500">รายงานการปิดยอดและจ่ายเงินร้านค้าประจำวัน</p>
                  <p className="text-[10px] text-slate-400">เลขที่รอบ: {currentSettlement.id}</p>
                </div>

                <div className="space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>ร้านค้า:</span>
                    <span className="font-bold text-slate-900">{currentRestaurant.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>วันที่ปิดยอด:</span>
                    <span>{currentSettlement.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>สถานะการโอน:</span>
                    <span className="font-bold text-emerald-700">
                      {currentSettlement.status === 'paid' ? 'โอนเงินแล้ว' : 'รอการโอนเงิน'}
                    </span>
                  </div>
                  {currentSettlement.transferRefNumber && (
                    <div className="flex justify-between text-[10px]">
                      <span>เลขอ้างอิง:</span>
                      <span className="font-bold text-slate-800">{currentSettlement.transferRefNumber}</span>
                    </div>
                  )}
                </div>

                {/* Calculation Table */}
                <div className="py-2 border-y border-dashed border-slate-300 space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>1. ยอดขายอาหารรวม (Gross)</span>
                    <span>฿{(currentSettlement?.grossSales ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span>2. ค่า GP แพลตฟอร์ม ({currentSettlement?.config?.gpRatePct ?? 20}%)</span>
                    <span>-฿{(currentSettlement?.platformGpAmount ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span>3. ค่าบริการชำระเงิน MDR ({currentSettlement?.config?.paymentFeePct ?? 1.5}%)</span>
                    <span>-฿{(currentSettlement?.paymentProcessingFee ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-amber-700">
                    <span>4. VAT 7% ของค่าบริการ</span>
                    <span>-฿{(currentSettlement?.vatOnFees ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-blue-700">
                    <span>5. เครดิต หัก ณ ที่จ่าย 3% (WHT)</span>
                    <span>+฿{(currentSettlement?.withholdingTax ?? 0).toLocaleString()}</span>
                  </div>
                  {(currentSettlement?.cashCollectedByStore ?? 0) > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>6. หักเงินสดที่ร้านรับเอง (COD/POS)</span>
                      <span>-฿{(currentSettlement?.cashCollectedByStore ?? 0).toLocaleString()}</span>
                    </div>
                  )}
                  {currentSettlement?.totalTipsReceived !== undefined && (
                    <div className="flex justify-between text-purple-700 font-semibold pt-1 border-t border-dashed border-slate-200">
                      <span>ทิปพนักงานจัดส่ง (Incentive):</span>
                      <span>฿{(currentSettlement?.totalTipsReceived ?? 0).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Net Total */}
                <div className="pt-1 flex justify-between items-baseline font-sans">
                  <span className="font-black text-xs text-slate-900">ยอดเงินสุทธิที่โอน:</span>
                  <span className="font-black text-base text-emerald-700">
                    ฿{(currentSettlement?.netPayoutPayable ?? 0).toLocaleString()}
                  </span>
                </div>

                {/* Bank Account */}
                <div className="pt-2 border-t border-dashed border-slate-300 text-[10px] text-slate-500 space-y-0.5">
                  <div>โอนเข้า: {currentSettlement.bankAccount.bankName}</div>
                  <div>เลขที่บัญชี: {currentSettlement.bankAccount.accountNumber}</div>
                  <div>ชื่อบัญชี: {currentSettlement.bankAccount.accountName}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerToast('สั่งพิมพ์สลิปแล้ว', 'ส่งคำสั่งพิมพ์สลิปสรุปยอดไปยังเครื่องพิมพ์ POS ใบเสร็จความร้อนแล้ว', 'success');
                    setIsSlipModalOpen(false);
                  }}
                  className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>พิมพ์สลิปความร้อน POS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSlipModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  ปิด
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Incoming Customer Order Alert & Acknowledgment Modal */}
      <NewOrderAlertModal
        order={activeAlertOrder}
        isOpen={isAlertModalOpen}
        onAcknowledge={handleAcknowledgeOrder}
        onClose={() => {
          merchantOrderAudio.stopLoopingOrderAlert();
          setIsAlertModalOpen(false);
        }}
        isMuted={isAlertSoundMuted}
        onToggleMute={handleToggleAlertSound}
      />
    </div>
  );
};
