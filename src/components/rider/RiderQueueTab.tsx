import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { RiderVoiceAssistant } from './RiderVoiceAssistant';
import { RiderFareStandardsModal } from './RiderFareStandardsModal';
import { calculateThaiRiderFare } from '../../utils/riderFareCalculator';
import { 
  Radio, 
  Power, 
  MapPin, 
  Clock, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  Navigation, 
  Phone, 
  Store, 
  User, 
  ArrowRight, 
  AlertTriangle, 
  Zap, 
  ChevronRight, 
  ShieldCheck, 
  TrendingUp, 
  XCircle, 
  Play,
  Calculator,
  Info,
  Camera,
  MessageSquare,
  ShieldAlert,
  Image as ImageIcon
} from 'lucide-react';

export const RiderQueueTab: React.FC = () => {
  const { 
    activeRider, 
    toggleRiderShiftStatus, 
    selectedZoneId, 
    setSelectedZoneId, 
    deliveryZones, 
    zoneRiderQueue, 
    activeIncomingTrip, 
    acceptIncomingTrip, 
    declineIncomingTrip, 
    activeDeliveringTrip, 
    deliveryStepIndex, 
    advanceDeliveringStep, 
    triggerSimulatedIncomingOrder,
    triggerToast
  } = useApp();

  // Proof of Delivery (POD) states
  const [podMethod, setPodMethod] = useState<'door_drop' | 'hand_over' | 'lobby_security'>('door_drop');
  const [podPhotoUploaded, setPodPhotoUploaded] = useState<boolean>(true);
  const [podNote, setPodNote] = useState<string>('วางบนโต๊ะหน้าประตูห้องเรียบร้อย');
  const [quickChatSent, setQuickChatSent] = useState<boolean>(false);

  // Incoming offer countdown timer (20 seconds)
  const [countdownSeconds, setCountdownSeconds] = useState<number>(20);
  const currentOfferIdRef = useRef<string | null>(null);

  // Thai Rider Fare Standards Modal State
  const [isFareModalOpen, setIsFareModalOpen] = useState<boolean>(false);
  const [fareModalDistance, setFareModalDistance] = useState<number>(3.5);

  // Reset and run countdown timer when an incoming trip arrives
  useEffect(() => {
    if (!activeIncomingTrip) {
      currentOfferIdRef.current = null;
      setCountdownSeconds(20);
      return;
    }

    if (currentOfferIdRef.current !== activeIncomingTrip.id) {
      currentOfferIdRef.current = activeIncomingTrip.id;
      setCountdownSeconds(20);
    }

    const timer = setInterval(() => {
      setCountdownSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [activeIncomingTrip?.id]);

  // When timer reaches 0, safely decline the offer in a post-render effect
  useEffect(() => {
    if (activeIncomingTrip && countdownSeconds === 0) {
      declineIncomingTrip(activeIncomingTrip.id);
    }
  }, [countdownSeconds, activeIncomingTrip, declineIncomingTrip]);

  const currentZone = deliveryZones.find(z => z.id === selectedZoneId) || deliveryZones[0];

  return (
    <div className="space-y-6">
      {/* 1. TOP SHIFT STATUS & ZONE CONTROLLER */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black ${
              activeRider.shiftStatus === 'offline'
                ? 'bg-slate-100 text-slate-400'
                : activeRider.shiftStatus === 'busy_delivery'
                ? 'bg-amber-100 text-amber-700 animate-pulse'
                : 'bg-emerald-100 text-emerald-700'
            }`}>
              {activeRider.shiftStatus === 'offline' ? '💤' : activeRider.shiftStatus === 'busy_delivery' ? '🛵' : '🟢'}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-900">
                  {activeRider.name}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeRider.shiftStatus === 'offline'
                    ? 'bg-slate-100 text-slate-500'
                    : activeRider.shiftStatus === 'busy_delivery'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {activeRider.shiftStatus === 'offline'
                    ? '🔴 พักกะ (ออฟไลน์)'
                    : activeRider.shiftStatus === 'busy_delivery'
                    ? '🛵 กำลังนำส่งอาหาร'
                    : '🟢 ออนไลน์ในคิว'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeRider.vehicle} • คะแนนรีวิว {activeRider.rating.toFixed(2)} ⭐ (อัตราตอบรับ {activeRider.acceptanceRate}%)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="open-rider-fare-standards-btn"
              onClick={() => {
                setFareModalDistance(activeIncomingTrip?.distanceKm || activeDeliveringTrip?.distanceKm || 3.5);
                setIsFareModalOpen(true);
              }}
              className="px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="ดูตารางมาตรฐานค่ารอบและสูตรคำนวณตามระยะทางจริงในไทย"
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">มาตรฐานค่ารอบไทย</span>
              <span className="sm:hidden">เกณฑ์ค่ารอบ</span>
            </button>

            <button
              id="rider-toggle-shift-btn"
              onClick={toggleRiderShiftStatus}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs ${
                activeRider.shiftStatus === 'offline'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{activeRider.shiftStatus === 'offline' ? 'เปิดระบบเข้าคิวรับงาน' : 'กดพักกะ / ออกจากคิว'}</span>
            </button>

            <button
              id="simulate-incoming-order-btn"
              onClick={triggerSimulatedIncomingOrder}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="สร้างออเดอร์ใหม่เพื่อทดสอบระบบคิว"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">จำลองออเดอร์เข้าคิว</span>
              <span className="sm:hidden">จำลอง</span>
            </button>
          </div>
        </div>

        {/* Zone Selector & Live Zone Stats */}
        <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700">เลือกโซนรับงาน:</span>
            <select
              id="rider-zone-select"
              value={selectedZoneId}
              onChange={e => setSelectedZoneId(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {deliveryZones.map(z => (
                <option key={z.id} value={z.id}>
                  {z.name} ({z.district})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>ช่วงความต้องการสูง: <strong>+{currentZone.surgeBonusPerTrip} บาท/รอบ</strong></span>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
              <span>ออเดอร์รอจ่ายงาน: <strong>{currentZone.currentOrdersWaiting} รายการ</strong></span>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
              <span>ไรเดอร์ในโซน: <strong>{currentZone.activeRidersCount} คัน</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* HANDS-FREE VOICE ASSISTANT CONSOLE (Speech Recognition & Incident Reporting) */}
      <RiderVoiceAssistant />

      {/* 2. ACTIVE DELIVERING TRIP (IF RIDER HAS ACCEPTED AN ORDER) */}
      {activeDeliveringTrip && (
        <div className="bg-white rounded-2xl border-2 border-emerald-500 shadow-md p-5 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <h4 className="text-sm font-black text-slate-900">
                กำลังดำเนินการจัดส่ง ({activeDeliveringTrip.orderNumber})
              </h4>
            </div>
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              ค่ารอบสุทธิ ฿{activeDeliveringTrip.totalTripEarnings.toFixed(2)}
            </span>
          </div>

          {/* Stepper Progress */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {[
              { step: 0, label: '1. เดินทางไปร้านค้า', desc: activeDeliveringTrip.restaurantName },
              { step: 1, label: '2. นำส่งลูกค้า', desc: activeDeliveringTrip.customerName },
              { step: 2, label: '3. ส่งมอบ & รับเงิน', desc: 'ยอดเงินเข้าวอลเล็ตทันที' },
            ].map(s => (
              <div 
                key={s.step} 
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  deliveryStepIndex === s.step
                    ? 'border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-500'
                    : deliveryStepIndex > s.step
                    ? 'border-slate-200 bg-slate-50 text-slate-400'
                    : 'border-slate-200 bg-white opacity-60'
                }`}
              >
                <div className="text-[11px] font-bold">{s.label}</div>
                <div className="text-[10px] truncate text-slate-500">{s.desc}</div>
              </div>
            ))}
          </div>

          {/* Current Step Action Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            {deliveryStepIndex === 0 && (
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <Store className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="text-xs font-black text-slate-900">
                        {activeDeliveringTrip.restaurantName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {activeDeliveringTrip.restaurantAddress}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                    ระยะทาง {activeDeliveringTrip.distanceKm} กม.
                  </span>
                </div>

                <div className="text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-100">
                  <strong>รายการอาหารที่ต้องรับ ({activeDeliveringTrip.itemsCount} อย่าง):</strong> {activeDeliveringTrip.itemsSummary}
                </div>

                <button
                  id="rider-step-pickup-confirm-btn"
                  onClick={advanceDeliveringStep}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ถึงร้านอาหาร & ตรวจรับอาหารเรียบร้อยแล้ว 🥡</span>
                </button>
              </div>
            )}

            {deliveryStepIndex === 1 && (
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <User className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-xs font-black text-slate-900">
                        {activeDeliveringTrip.customerName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {activeDeliveringTrip.customerAddress}
                      </div>
                    </div>
                  </div>
                  <a 
                    href={`tel:${activeDeliveringTrip.customerPhone}`}
                    className="text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg flex items-center gap-1 hover:bg-blue-100"
                  >
                    <Phone className="w-3 h-3" />
                    <span>โทรหาลูกค้า</span>
                  </a>
                </div>

                {/* Quick Chat Messaging */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => {
                      setQuickChatSent(true);
                      triggerToast('ส่งข้อความถึงลูกค้าแล้ว 💬', 'ส่งข้อความด่วน: "กำลังนำอาหารไปส่งให้อย่างปลอดภัยครับ"', 'info');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1 whitespace-nowrap cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3 text-slate-500" />
                    <span>🛵 กำลังนำไปส่งครับ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQuickChatSent(true);
                      triggerToast('ส่งข้อความถึงลูกค้าแล้ว 💬', 'ส่งข้อความด่วน: "ถึงหน้าบ้าน/คอนโดแล้วครับ"', 'info');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1 whitespace-nowrap cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3 text-slate-500" />
                    <span>📍 ถึงหน้าบ้านแล้วครับ</span>
                  </button>
                </div>

                <div className="text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-100">
                  <strong>โน้ตการจัดส่ง:</strong> วางไว้หน้าประตูห้อง หรือโทรแจ้งเมื่อถึงด้านล่างอาคาร
                </div>

                {/* Proof of Delivery (POD) Drop-off Selector */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-emerald-600" />
                      <span>หลักฐานการส่งมอบ (Proof of Delivery / POD)</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      มาตรฐานความปลอดภัย
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPodMethod('door_drop')}
                      className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer ${
                        podMethod === 'door_drop'
                          ? 'border-emerald-500 bg-white text-emerald-800 font-bold shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <span className="text-[11px] block">🚪 วางหน้าประตู</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPodMethod('hand_over')}
                      className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer ${
                        podMethod === 'hand_over'
                          ? 'border-emerald-500 bg-white text-emerald-800 font-bold shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <span className="text-[11px] block">🤝 ส่งถึงมือ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPodMethod('lobby_security')}
                      className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer ${
                        podMethod === 'lobby_security'
                          ? 'border-emerald-500 bg-white text-emerald-800 font-bold shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <span className="text-[11px] block">🏢 ฝาก รปภ./นิติ</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPodPhotoUploaded(true);
                      triggerToast('ถ่ายภาพสำเร็จ! 📸', 'บันทึกภาพถ่ายจุดวางอาหาร (Proof of Delivery) เข้าระบบคลาวด์แล้ว', 'success');
                    }}
                    className="w-full py-2 rounded-lg bg-white border border-dashed border-emerald-400 hover:bg-emerald-50/50 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{podPhotoUploaded ? '✓ ถ่ายภาพจุดส่งมอบเรียบร้อย (กดเพื่อถ่ายใหม่)' : 'กดเพื่อถ่ายภาพจุดส่งมอบอาหาร (POD)'}</span>
                  </button>
                </div>

                <button
                  id="rider-step-arrived-customer-btn"
                  onClick={advanceDeliveringStep}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  <span>ยืนยันส่งมอบอาหารสำเร็จ (บันทึก POD & จบงาน) 📍</span>
                </button>
              </div>
            )}

            {deliveryStepIndex === 2 && (
              <div className="space-y-3">
                <div className="text-center py-2">
                  <div className="text-3xl mb-1">🎉</div>
                  <h5 className="text-sm font-extrabold text-slate-900">ส่งมอบอาหารสำเร็จเรียบร้อย</h5>
                  <p className="text-xs text-slate-500">
                    ลูกค้ายืนยันการรับอาหาร ยอดเงินค่ารอบพร้อมทิปจะถูกโอนเข้ากระเป๋าวอลเล็ตทันที
                  </p>
                </div>

                {/* POD Verified Badge */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>บันทึกภาพหลักฐานส่งมอบ (POD Verified)</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                    {podMethod === 'door_drop' ? '🚪 วางหน้าประตูห้อง' : podMethod === 'lobby_security' ? '🏢 ฝาก รปภ./นิติ' : '🤝 ส่งมอบถึงมือ'}
                  </span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                      <span>โครงสร้างค่ารอบตามระยะทางจริง (มาตรฐานไทย)</span>
                    </span>
                    <button
                      id="view-fare-formula-completed-step-btn"
                      onClick={() => {
                        setFareModalDistance(activeDeliveringTrip.distanceKm);
                        setIsFareModalOpen(true);
                      }}
                      className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1 cursor-pointer"
                    >
                      <Info className="w-3 h-3" />
                      <span>ดูเกณฑ์คำนวณ</span>
                    </button>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>ค่ารอบพื้นฐาน (0 - 3.0 กม. แรก)</span>
                    <span className="font-semibold">฿{activeDeliveringTrip.baseDeliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>
                      ระยะทางส่วนเกิน ({activeDeliveringTrip.distanceKm} กม.
                      {activeDeliveringTrip.distanceKm > 3.0 ? ` • เกิน ${(activeDeliveringTrip.distanceKm - 3.0).toFixed(1)} กม. x ฿9` : ' • ในระยะตั้งต้น'})
                    </span>
                    <span className="font-semibold text-blue-700">+฿{activeDeliveringTrip.distanceFee.toFixed(2)}</span>
                  </div>
                  {activeDeliveringTrip.specialIncentive > 0 && (
                    <div className="flex justify-between text-amber-700">
                      <span>โบนัสช่วงความต้องการสูง (Rush Hour Surge)</span>
                      <span className="font-semibold">+฿{activeDeliveringTrip.specialIncentive.toFixed(2)}</span>
                    </div>
                  )}
                  {activeDeliveringTrip.customerTip > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>ทิปจากลูกค้า (โอนเข้าไรเดอร์ 100% เต็ม ไม่หัก GP)</span>
                      <span>+฿{activeDeliveringTrip.customerTip.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center font-black text-sm text-slate-900">
                    <div>
                      <span>รายได้สุทธิรอบนี้</span>
                      <span className="text-[10px] text-slate-500 font-normal block">เงินโอนเข้ากระเป๋าวอลเล็ตทันที</span>
                    </div>
                    <span className="text-emerald-600 text-lg">฿{activeDeliveringTrip.totalTripEarnings.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  id="rider-step-complete-trip-btn"
                  onClick={advanceDeliveringStep}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black cursor-pointer transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>ยืนยันส่งมอบสำเร็จ & รับเงินเข้ากระเป๋า 💸</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. INCOMING ORDER DISPATCH OFFER (MODAL/CARD) */}
      {activeIncomingTrip && (
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-2xl p-1 shadow-lg animate-bounce duration-1000">
          <div className="bg-white rounded-xl p-5 space-y-4">
            {/* Header with countdown bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-red-600">
                  ข้อเสนอออเดอร์ใหม่เข้าคิวของคุณ!
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded-full">
                <Clock className="w-3.5 h-3.5 text-orange-600" />
                <span>ตอบรับใน {countdownSeconds} วินาที</span>
              </div>
            </div>

            {/* Countdown progress bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-1000"
                style={{ width: `${(countdownSeconds / 20) * 100}%` }}
              />
            </div>

            {/* Earnings Highlight Banner */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-xl space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-200">รายได้รอบนี้รวมสุทธิ</span>
                  <div className="text-2xl font-black">฿{activeIncomingTrip.totalTripEarnings.toFixed(2)}</div>
                  <span className="text-[11px] text-emerald-100">
                    รวมทิปลูกค้า ฿{activeIncomingTrip.customerTip} + โบนัสโซน ฿{activeIncomingTrip.specialIncentive}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-emerald-200">ระยะทางจัดส่งจริง</span>
                  <div className="text-xl font-extrabold">{activeIncomingTrip.distanceKm} กม.</div>
                  <span className="text-[10px] text-emerald-200">รับใน {activeIncomingTrip.estimatedPickupMinutes} นาที</span>
                </div>
              </div>

              {/* Thai Standard Formula Badge */}
              <div className="bg-black/20 backdrop-blur-xs p-2 rounded-lg text-[10.5px] border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-100 font-mono">
                  <span>💡 ฐาน ฿{activeIncomingTrip.baseDeliveryFee.toFixed(0)} (3 กม.)</span>
                  <span>+ ระยะเกิน ฿{activeIncomingTrip.distanceFee.toFixed(0)}</span>
                  {activeIncomingTrip.specialIncentive > 0 && <span>+ พีค ฿{activeIncomingTrip.specialIncentive}</span>}
                  {activeIncomingTrip.customerTip > 0 && <span>+ ทิป ฿{activeIncomingTrip.customerTip}</span>}
                </div>
                <button
                  onClick={() => {
                    setFareModalDistance(activeIncomingTrip.distanceKm);
                    setIsFareModalOpen(true);
                  }}
                  className="text-white hover:text-amber-200 underline text-[10px] font-bold cursor-pointer shrink-0 ml-2"
                >
                  มาตรฐานไทย ↗
                </button>
              </div>
            </div>

            {/* Trip Details */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <Store className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">{activeIncomingTrip.restaurantName}</span>
                  <span className="text-slate-500 text-[11px]">{activeIncomingTrip.restaurantAddress}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">{activeIncomingTrip.customerName}</span>
                  <span className="text-slate-500 text-[11px]">{activeIncomingTrip.customerAddress}</span>
                </div>
              </div>
            </div>

            {/* Accept / Decline Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                id="rider-decline-trip-btn"
                onClick={() => declineIncomingTrip(activeIncomingTrip.id)}
                className="py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4 text-slate-400" />
                <span>ข้ามออเดอร์นี้ (ให้คิวถัดไป)</span>
              </button>

              <button
                id="rider-accept-trip-btn"
                onClick={() => acceptIncomingTrip(activeIncomingTrip.id)}
                className="py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>รับงานทันที 🛵</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. QUEUE POSITION STATUS & ZONE QUEUE LADDER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Queue Position Card */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">ลำดับคิวของคุณในโซน</span>
            <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
              Live Queue
            </span>
          </div>

          <div className="text-center py-2">
            <div className="text-4xl font-black text-slate-900">
              #{activeRider.shiftStatus === 'offline' ? '-' : (activeRider.currentQueuePosition || 1)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {activeRider.shiftStatus === 'offline'
                ? 'คุณกำลังพักกะ (กดออนไลน์เพื่อรับคิว)'
                : `จากไรเดอร์ทั้งหมด ${currentZone.activeRidersCount} คนในโซนนี้`}
            </p>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>เวลารอคอยเฉลี่ย:</span>
              <strong className="text-slate-800">~2 - 4 นาที</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>คะแนนสิทธิ์จ่ายงาน (Priority):</span>
              <strong className="text-emerald-600">96 / 100</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>เกณฑ์จัดคิว:</span>
              <span className="text-slate-500">อัตราตอบรับ + ระยะทาง</span>
            </div>
          </div>
        </div>

        {/* Zone Queue Ladder (List of active riders in queue) */}
        <div className="md:col-span-2 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h4 className="text-xs font-extrabold text-slate-900">
                รายชื่อคิวไรเดอร์ในโซน {currentZone.name}
              </h4>
              <p className="text-[11px] text-slate-500">
                ระบบจัดการจ่ายงานอัตโนมัติตามลำดับคิวและคะแนนความพร้อม
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-600">
              รอจ่ายงาน {zoneRiderQueue.filter(r => r.status === 'in_queue').length} คิว
            </span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {zoneRiderQueue.map(item => {
              const isMe = item.riderId === activeRider.id;
              return (
                <div 
                  key={item.riderId}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                    isMe 
                      ? 'border-emerald-400 bg-emerald-50/50' 
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                      item.queuePosition === 1
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      #{item.queuePosition}
                    </div>

                    <div>
                      <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                        <span>{item.riderName}</span>
                        {isMe && (
                          <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-full font-bold">
                            คุณ
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {item.vehicleModel} • รับแล้ว {item.completedTripsToday} รอบ ({item.rating.toFixed(2)} ⭐)
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'in_queue'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'busy'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {item.status === 'in_queue' ? '🟢 ในคิวรับงาน' : item.status === 'busy' ? '🛵 ส่งออเดอร์' : 'พักกะ'}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      เข้าคิว: {item.enteredQueueAt}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* THAI RIDER FARE STANDARDS & DISTANCE SIMULATOR MODAL */}
      <RiderFareStandardsModal
        isOpen={isFareModalOpen}
        onClose={() => setIsFareModalOpen(false)}
        initialDistanceKm={fareModalDistance}
      />
    </div>
  );
};
