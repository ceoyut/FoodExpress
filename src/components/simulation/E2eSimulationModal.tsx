import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  User, 
  Store, 
  Bike, 
  ArrowRight, 
  Sparkles, 
  ChefHat, 
  MapPin, 
  Receipt, 
  Wallet, 
  Bell, 
  Star, 
  X, 
  Clock, 
  ShieldCheck,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { merchantOrderAudio } from '../../utils/merchantOrderAudio';
import { createCloudOrder, updateCloudOrderStatus } from '../../lib/firebase';
import { INITIAL_MERCHANT_ACCOUNTS } from '../../data/merchantAuthData';
import { INITIAL_ACTIVE_RIDER } from '../../data/riderData';

interface E2eSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const E2eSimulationModal: React.FC<E2eSimulationModalProps> = ({ isOpen, onClose }) => {
  const { 
    user, 
    updateUserProfile,
    orders, 
    setOrders, 
    setActiveOrder, 
    setActiveMerchant, 
    setSelectedSettlementRestId,
    setActiveRider, 
    setActiveTab, 
    runEodSettlementCalculation,
    triggerToast 
  } = useApp();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [autoPlayTimer, setAutoPlayTimer] = useState<number>(0);
  const [simulatedOrderId, setSimulatedOrderId] = useState<string>('');
  const [cookingProgress, setCookingProgress] = useState<number>(0);
  const [deliveryProgress, setDeliveryProgress] = useState<number>(0);

  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Reset or initialize on open
  useEffect(() => {
    if (isOpen && !simulatedOrderId) {
      const newId = `ORD-SIM-${Math.floor(1000 + Math.random() * 9000)}`;
      setSimulatedOrderId(newId);
    }
  }, [isOpen, simulatedOrderId]);

  // Clean up auto-play timer on unmount
  useEffect(() => {
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, []);

  if (!isOpen) return null;

  // Handle Step 1: Customer (สมชาย) places order
  const handlePlaceCustomerOrder = async () => {
    const orderId = simulatedOrderId || `ORD-SIM-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalAmount = 305; // ฿280 + ฿25

    // Deduct from Somchai's wallet
    if (user.walletBalance >= totalAmount) {
      updateUserProfile({
        walletBalance: user.walletBalance - totalAmount,
        loyaltyPoints: user.loyaltyPoints + 30
      });
    }

    const newOrderObj: any = {
      id: orderId,
      restaurantId: 'rest_kanda_roimor',
      restaurantName: 'กานดา ร้อยหม้อ (Kanda Roi Mor)',
      restaurantLogo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=120&h=120&fit=crop',
      items: [
        {
          id: 'item_sim_1',
          name: 'ต้มยำกุ้งหม้อไฟแม่กานดา (สูตรโบราณ)',
          price: 280,
          quantity: 1,
          options: ['เผ็ดกลาง', 'กุ้งแม่น้ำ 3 ตัว']
        },
        {
          id: 'item_sim_2',
          name: 'ข้าวสวยหอมมะลิสุรินทร์',
          price: 25,
          quantity: 1
        }
      ],
      subtotal: 305,
      deliveryFee: 0,
      discount: 0,
      tip: 0,
      total: 305,
      deliveryAddress: '128/9 ซอยสุขุมวิท 55 (ทองหล่อ), วัฒนา, กทม.',
      status: 'pending',
      paymentMethod: 'wallet',
      placedAt: new Date().toISOString(),
      orderType: 'delivery',
      estimatedDeliveryTime: '25-30 นาที',
      riderName: 'สมหวัง สายซิ่ง',
      riderPhone: '089-988-7711'
    };

    setOrders(prev => [newOrderObj, ...prev.filter(o => o.id !== orderId)]);
    setActiveOrder(newOrderObj);

    // Also sync to Cloud Firestore
    createCloudOrder({
      id: orderId,
      restaurantId: 'rest_kanda_roimor',
      restaurantName: 'กานดา ร้อยหม้อ',
      customerName: user.name,
      customerPhone: user.phone,
      deliveryAddress: newOrderObj.deliveryAddress,
      itemsSummary: 'ต้มยำกุ้งหม้อไฟแม่กานดา x1, ข้าวสวย x1',
      items: newOrderObj.items,
      subtotal: 305,
      deliveryFee: 0,
      discount: 0,
      tip: 0,
      totalAmount: 305,
      paymentMethod: 'wallet',
      paymentStatus: 'paid',
      orderStatus: 'kitchen_prep',
      transactionRef: `TX-WAL-${Date.now()}`
    });

    merchantOrderAudio.playOrderAlertChime();
    triggerToast('สมชาย สั่งซื้อสำเร็จ!', 'ตัดเงินผ่านวอลเล็ต ฿305 ส่งออเดอร์ถึงร้านกานดา ร้อยหม้อ เรียบร้อย', 'success');
    setCurrentStep(2);
  };

  // Handle Step 2: Merchant (กานดา) accepts & cooks
  const handleMerchantAcceptAndCook = () => {
    merchantOrderAudio.playOrderAlertChime();
    setOrders(prev => prev.map(o => o.id === simulatedOrderId ? { ...o, status: 'preparing' } : o));
    updateCloudOrderStatus(simulatedOrderId, { orderStatus: 'kitchen_prep' });

    let prog = 0;
    const interval = setInterval(() => {
      prog += 25;
      setCookingProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        setOrders(prev => prev.map(o => o.id === simulatedOrderId ? { ...o, status: 'ready_for_pickup' } : o));
        triggerToast('ร้านกานดา: อาหารปรุงเสร็จแล้ว!', 'ส่งสัญญาณเรียกไรเดอร์สมหวัง สายซิ่ง มารับอาหาร', 'info');
        setCurrentStep(3);
      }
    }, 400);
  };

  // Handle Step 3: Rider (สมหวัง) accepts & delivers
  const handleRiderPickupAndDeliver = () => {
    setOrders(prev => prev.map(o => o.id === simulatedOrderId ? { ...o, status: 'on_the_way' } : o));
    updateCloudOrderStatus(simulatedOrderId, { orderStatus: 'delivering', riderName: 'สมหวัง สายซิ่ง' });
    triggerToast('ไรเดอร์สมหวัง: รับอาหารแล้ว', 'กำลังเดินทางส่งให้คุณสมชายที่สุขุมวิท 55', 'info');

    let prog = 0;
    const interval = setInterval(() => {
      prog += 20;
      setDeliveryProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        setOrders(prev => prev.map(o => o.id === simulatedOrderId ? { ...o, status: 'delivered' } : o));
        updateCloudOrderStatus(simulatedOrderId, { orderStatus: 'completed' });
        
        // Update Merchant Settlement
        runEodSettlementCalculation('rest_kanda_roimor', new Date().toISOString().split('T')[0]);

        // Confetti celebration
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });

        triggerToast('ส่งอาหารถึงมือสมชายสำเร็จ!', 'ไรเดอร์ได้รับค่ารอบ ฿48.00 • บันทึกยอดขายร้านกานดาเรียบร้อย', 'reward');
        setCurrentStep(4);
      }
    }, 450);
  };

  // Reset simulation
  const handleResetSimulation = () => {
    setCurrentStep(1);
    setCookingProgress(0);
    setDeliveryProgress(0);
    setIsAutoPlaying(false);
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    setSimulatedOrderId(`ORD-SIM-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  // Run full automated tour
  const handleToggleAutoPlay = () => {
    if (isAutoPlaying) {
      setIsAutoPlaying(false);
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    } else {
      setIsAutoPlaying(true);
      if (currentStep === 1) {
        handlePlaceCustomerOrder();
      } else if (currentStep === 2) {
        handleMerchantAcceptAndCook();
      } else if (currentStep === 3) {
        handleRiderPickupAndDeliver();
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col cursor-default"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  ระบบทดสอบวงจรออเดอร์ 3 ฝ่าย (E2E Simulation)
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 uppercase">
                  Interactive
                </span>
              </div>
              <p className="text-xs text-slate-300">
                สมชาย (ลูกค้า) ➔ กานดา (ร้านค้า) ➔ สมหวัง (ไรเดอร์) ➔ สรุปยอดบัญชี
              </p>
            </div>
          </div>

          <button
            id="close-simulation-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="bg-slate-100/80 px-4 sm:px-6 py-3 border-b border-slate-200">
          <div className="flex items-center justify-between">
            {/* Step 1 */}
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep >= 1 ? 'bg-emerald-600 text-white ring-2 ring-emerald-200' : 'bg-slate-200 text-slate-600'
              }`}>
                {currentStep > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
              </div>
              <div className="hidden sm:block">
                <span className="text-[11px] font-bold text-slate-900 block">ลูกค้าสั่งอาหาร</span>
                <span className="text-[10px] text-slate-500">สมชาย สายใจ</span>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />

            {/* Step 2 */}
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep >= 2 ? 'bg-amber-600 text-white ring-2 ring-amber-200' : 'bg-slate-200 text-slate-600'
              }`}>
                {currentStep > 2 ? <CheckCircle2 className="w-4 h-4" /> : '2'}
              </div>
              <div className="hidden sm:block">
                <span className="text-[11px] font-bold text-slate-900 block">ร้านค้ารับ & ปรุง</span>
                <span className="text-[10px] text-slate-500">กานดา ร้อยหม้อ</span>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />

            {/* Step 3 */}
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep >= 3 ? 'bg-sky-600 text-white ring-2 ring-sky-200' : 'bg-slate-200 text-slate-600'
              }`}>
                {currentStep > 3 ? <CheckCircle2 className="w-4 h-4" /> : '3'}
              </div>
              <div className="hidden sm:block">
                <span className="text-[11px] font-bold text-slate-900 block">ไรเดอร์จัดส่ง</span>
                <span className="text-[10px] text-slate-500">สมหวัง สายซิ่ง</span>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />

            {/* Step 4 */}
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep >= 4 ? 'bg-emerald-600 text-white ring-2 ring-emerald-200' : 'bg-slate-200 text-slate-600'
              }`}>
                {currentStep === 4 ? <CheckCircle2 className="w-4 h-4" /> : '4'}
              </div>
              <div className="hidden sm:block">
                <span className="text-[11px] font-bold text-slate-900 block">ตัดรอบ & จบงาน</span>
                <span className="text-[10px] text-slate-500">Settlement</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body: Active Step View */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs text-slate-700">
          
          {/* STEP 1: CUSTOMER (สมชาย สายใจ) */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-emerald-950 text-sm flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    ขั้นตอนที่ 1: คุณสมชาย สายใจ (ลูกค้า) สั่งอาหาร
                  </span>
                  <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                    ยอดเงินวอลเล็ต: ฿{user.walletBalance.toLocaleString()}
                  </span>
                </div>
                <p className="text-emerald-800 text-xs leading-relaxed">
                  คุณสมชายเลือกสั่ง <strong>ต้มยำกุ้งหม้อไฟแม่กานดา (฿280)</strong> และ <strong>ข้าวหอมมะลิ (฿25)</strong> จากร้าน <strong>กานดา ร้อยหม้อ</strong> รวม <strong>฿305</strong> โดยระบบจะหักยอดเงินจาก FoodExpress Wallet อัตโนมัติ
                </p>
              </div>

              {/* Order Cart Simulation Card */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-150 pb-2">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-slate-900 text-xs">กานดา ร้อยหม้อ (Kanda Roi Mor)</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">#{simulatedOrderId}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span>1x ต้มยำกุ้งหม้อไฟแม่กานดา (เผ็ดกลาง)</span>
                    <strong className="text-slate-900">฿280.00</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span>1x ข้าวสวยหอมมะลิสุรินทร์</span>
                    <strong className="text-slate-900">฿25.00</strong>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500">
                    <span>ค่าจัดส่ง (ระยะทาง 2.4 กม.)</span>
                    <span className="line-through text-slate-400 mr-1">฿25.00</span>
                    <span className="text-emerald-600 font-bold">ฟรีโปรโมชั่น</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-150 flex justify-between items-center text-sm font-bold text-slate-900">
                  <span>ยอดชำระสุทธิ (หักผ่าน Wallet):</span>
                  <span className="text-emerald-600 text-base font-black">฿305.00</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  id="e2e-step1-order-btn"
                  onClick={handlePlaceCustomerOrder}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Wallet className="w-4 h-4" />
                  <span>กดยืนยันสั่งอาหาร & ชำระเงิน ฿305 (Place Order)</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: MERCHANT POS (กานดา ร้อยหม้อ) */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-amber-950 text-sm flex items-center gap-2">
                    <Store className="w-4 h-4 text-amber-600" />
                    ขั้นตอนที่ 2: แท็บเล็ตหน้าร้าน กานดา ร้อยหม้อ (Merchant POS)
                  </span>
                  <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full animate-pulse">
                    🚨 ออเดอร์ใหม่เข้า!
                  </span>
                </div>
                <p className="text-amber-900 text-xs leading-relaxed">
                  เสียงแจ้งเตือนร้านค้าดังขึ้น! ระบบหักค่า GP 25% โดยอัตโนมัติตามสัญญามาตรฐาน และแสดงยอดเงินสุทธิที่ร้านค้าจะได้รับหลังส่งมอบสำเร็จ
                </p>
              </div>

              {/* GP & Net Calculation Highlight */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block">ยอดขายออเดอร์</span>
                  <strong className="text-sm text-slate-900 font-black">฿305.00</strong>
                </div>
                <div className="p-3 bg-white rounded-xl border border-rose-200 text-center">
                  <span className="text-[10px] text-rose-600 font-bold block">หัก GP 25%</span>
                  <strong className="text-sm text-rose-600 font-black">-฿76.25</strong>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 text-center">
                  <span className="text-[10px] text-emerald-700 font-bold block">ร้านค้ารับสุทธิ</span>
                  <strong className="text-sm text-emerald-800 font-black">฿228.75</strong>
                </div>
              </div>

              {/* Cooking Progress Bar */}
              {cookingProgress > 0 && (
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1">
                      <ChefHat className="w-3.5 h-3.5 text-amber-600" />
                      กำลังปรุงอาหารในครัว...
                    </span>
                    <span>{cookingProgress}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 transition-all duration-300 rounded-full"
                      style={{ width: `${cookingProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  id="e2e-step2-cook-btn"
                  onClick={handleMerchantAcceptAndCook}
                  disabled={cookingProgress > 0}
                  className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <ChefHat className="w-4 h-4" />
                  <span>
                    {cookingProgress === 0 ? 'ร้านกานดา: รับออเดอร์ & เริ่มปรุงอาหาร (Accept & Cook)' : 'กำลังปรุงอาหารในครัว...'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: RIDER (สมหวัง สายซิ่ง) */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-sky-950 text-sm flex items-center gap-2">
                    <Bike className="w-4 h-4 text-sky-600" />
                    ขั้นตอนที่ 3: ไรเดอร์ สมหวัง สายซิ่ง (Rider Hub)
                  </span>
                  <span className="text-[10px] bg-sky-600 text-white font-bold px-2 py-0.5 rounded-full">
                    Honda Wave 125i (1กข-9988)
                  </span>
                </div>
                <p className="text-sky-900 text-xs leading-relaxed">
                  ระบบ Dispatch ส่งงานให้ไรเดอร์สมหวังในโซนสุขุมวิท ไรเดอร์รับอาหารจากร้านกานดา ร้อยหม้อ และขับไปส่งยังบ้านคุณสมชายที่ซอยทองหล่อ
                </p>
              </div>

              {/* Delivery Map Route Simulation */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5 text-sky-700">
                    <MapPin className="w-4 h-4 text-sky-600" />
                    เส้นทาง: ร้านกานดา ร้อยหม้อ ➔ ซอยสุขุมวิท 55 (2.4 กม.)
                  </span>
                  <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
                    ค่ารอบ: ฿48.00
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                    <span>จำลองสถานะการขับขี่</span>
                    <span>{deliveryProgress}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                    <div 
                      className="h-full bg-sky-500 transition-all duration-300 rounded-full"
                      style={{ width: `${deliveryProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  id="e2e-step3-deliver-btn"
                  onClick={handleRiderPickupAndDeliver}
                  disabled={deliveryProgress > 0}
                  className="flex-1 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Bike className="w-4 h-4" />
                  <span>
                    {deliveryProgress === 0 ? 'ไรเดอร์สมหวัง: ออกส่ง & ส่งมอบอาหารสำเร็จ' : 'กำลังนำส่งตามเส้นทาง GPS...'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SETTLEMENT & COMPLETED */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in zoom-in-95 duration-300">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-50 to-teal-50 border border-emerald-300 text-emerald-950">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-black">
                    วงจรคำสั่งซื้อ 3 ฝ่ายเสร็จสมบูรณ์เรียบร้อย! (E2E Completed)
                  </h3>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  อาหารส่งถึงมือคุณสมชาย สายใจ แล้ว และข้อมูลยอดขายได้ถูกส่งเข้าสู่ระบบตัดรอบบัญชีประจำวัน (Daily Settlement Ledger) ของร้านกานดา ร้อยหม้อ อย่างถูกต้อง
                </p>
              </div>

              {/* 3 Parties Result Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                {/* 1. Customer */}
                <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <User className="w-3.5 h-3.5" />
                    <span>สมชาย (ลูกค้า)</span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    ✓ ได้รับอาหารอุ่นร้อน<br/>
                    ✓ ให้คะแนน 5 ดาว ★★★★★<br/>
                    ✓ รับแต้มสะสม +30 แต้ม
                  </div>
                </div>

                {/* 2. Merchant */}
                <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-700 font-bold">
                    <Store className="w-3.5 h-3.5" />
                    <span>กานดา (ร้านค้า)</span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    ✓ ยอดขายรวม: <strong>฿305.00</strong><br/>
                    ✓ ค่า GP 25%: <strong>-฿76.25</strong><br/>
                    ✓ บันทึกตัดรอบรอโอน: <strong>฿228.75</strong>
                  </div>
                </div>

                {/* 3. Rider */}
                <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-sky-700 font-bold">
                    <Bike className="w-3.5 h-3.5" />
                    <span>สมหวัง (ไรเดอร์)</span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    ✓ ระยะทาง: <strong>2.4 กม.</strong><br/>
                    ✓ ค่ารอบจัดส่ง: <strong>+฿48.00</strong><br/>
                    ✓ เข้าวอลเล็ตไรเดอร์ทันที
                  </div>
                </div>
              </div>

              {/* Quick Jump Buttons to View in Actual Screens */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 block">
                  เข้าชมหน้าจอบันทึกจริงของแต่ละฝ่าย:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="goto-merchant-settlement-btn"
                    onClick={() => {
                      const kanda = INITIAL_MERCHANT_ACCOUNTS[0];
                      if (kanda) {
                        setActiveMerchant(kanda);
                        setSelectedSettlementRestId(kanda.restaurantId);
                      }
                      setActiveTab('pos_settlement');
                      onClose();
                    }}
                    className="py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>ดูสรุปยอดร้านกานดา</span>
                  </button>

                  <button
                    id="goto-rider-hub-btn"
                    onClick={() => {
                      setActiveRider(INITIAL_ACTIVE_RIDER);
                      setActiveTab('rider_hub');
                      onClose();
                    }}
                    className="py-2 px-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Bike className="w-3.5 h-3.5" />
                    <span>ดูคิวงาน & กระเป๋าไรเดอร์</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  id="reset-simulation-btn"
                  onClick={handleResetSimulation}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>ทดสอบรอบใหม่ (Run Again)</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              id="simulation-reset-btn"
              onClick={handleResetSimulation}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors cursor-pointer"
              title="เริ่มใหม่ตั้งแต่ต้น"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <span className="text-[11px] text-slate-500">
              สถานะ: <strong className="text-slate-800 font-semibold">
                {currentStep === 1 ? 'รอลูกค้าสั่ง' : currentStep === 2 ? 'ร้านค้ากำลังทำ' : currentStep === 3 ? 'ไรเดอร์กำลังส่ง' : 'สำเร็จเรียบร้อย'}
              </strong>
            </span>
          </div>

          <button
            id="close-simulation-footer-btn"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
