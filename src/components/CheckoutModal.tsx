import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMethod } from '../types';
import { PaymentGatewayModal } from './PaymentGatewayModal';
import { 
  ArrowLeft, 
  MapPin, 
  CreditCard, 
  Wallet, 
  QrCode, 
  ShieldCheck, 
  Coins, 
  Sparkles, 
  Lock, 
  ChevronRight,
  Plus,
  Zap,
  Clock,
  ThermometerSnowflake
} from 'lucide-react';
import { getRestaurantDistance, formatDistance } from '../utils/geolocation';
import { getDeliverySlaDetails } from '../utils/deliverySla';

interface CheckoutModalProps {
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onClose }) => {
  const { 
    user, 
    cart, 
    cartRestaurant, 
    userLocation,
    cartSubtotal, 
    cartDeliveryFee, 
    appliedCoupon, 
    placeOrder, 
    setIsTopUpOpen,
    triggerToast 
  } = useApp();

  const effectiveDistance = cartRestaurant ? getRestaurantDistance(cartRestaurant, userLocation) : 0;
  const sla = getDeliverySlaDetails(effectiveDistance, cartRestaurant?.averagePrepTimeMinutes || 15);

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('promptpay_qr');
  const [deliveryAddress, setDeliveryAddress] = useState(
    user.savedAddresses.find(a => a.isDefault)?.address || user.savedAddresses[0]?.address || ''
  );
  const [driverNotes, setDriverNotes] = useState('ฝากไว้ที่จุดรับของคอนโด / โทรแจ้งเมื่อถึง');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);

  // Credit card dummy form states
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardExpiry, setCardExpiry] = useState('11/28');
  const [cardCvv, setCardCvv] = useState('789');
  const [cardHolder, setCardHolder] = useState(user.name);

  // Discount calculation
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'fixed') {
      discountAmount = appliedCoupon.discountValue;
    } else if (appliedCoupon.discountType === 'free_delivery') {
      discountAmount = cartDeliveryFee;
    } else if (appliedCoupon.discountType === 'percentage') {
      discountAmount = Math.round((cartSubtotal * appliedCoupon.discountValue) / 100);
    }
  }

  const finalTotal = Math.max(0, cartSubtotal + cartDeliveryFee - discountAmount);
  const pointsToEarn = Math.floor(finalTotal / 10);
  const isWalletInsufficient = selectedPayment === 'wallet' && user.walletBalance < finalTotal;

  const handleConfirmOrder = async () => {
    if (isWalletInsufficient) {
      triggerToast('ยอดเงินวอลเล็ตไม่พอ', 'กรุณาเติมเงินวอลเล็ต หรือเลือกชำระผ่านพร้อมเพย์ / บัตรเครดิต', 'info');
      return;
    }

    if (selectedPayment === 'promptpay_qr' || selectedPayment === 'credit_card') {
      // Open real-time Payment Gateway Modal
      setIsGatewayOpen(true);
      return;
    }

    setIsProcessing(true);

    try {
      // Wallet or Cash direct settlement
      await new Promise(resolve => setTimeout(resolve, 800));
      await placeOrder(selectedPayment, deliveryAddress, driverNotes);
    } catch (err: any) {
      triggerToast('เกิดข้อผิดพลาด', err.message || 'ไม่สามารถชำระเงินได้', 'info');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGatewaySuccess = async (txnRef: string) => {
    setIsGatewayOpen(false);
    setIsProcessing(true);
    try {
      await placeOrder(selectedPayment, deliveryAddress, driverNotes);
      triggerToast('สั่งอาหารและชำระเงินสำเร็จ! 🎉', `เลขอ้างอิง: ${txnRef} ซิงค์ลง Cloud Firestore แล้ว`, 'reward');
    } catch (err: any) {
      triggerToast('เกิดข้อผิดพลาดในการบันทึกออเดอร์', err.message, 'info');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-5 text-slate-800">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-150 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <button
              id="checkout-back-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200/80 text-slate-700 flex items-center justify-center hover:bg-slate-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="font-bold text-base text-slate-900">ยืนยันคำสั่งซื้อ & ชำระเงิน</h2>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>ชำระเงินปลอดภัย 256-bit</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Delivery Address Card with Realtime SLA */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                สถานที่จัดส่ง
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${sla.badgeBorder} ${sla.badgeBg} ${sla.badgeTextCol} flex items-center gap-1`}>
                {sla.isSweetSpot && <Zap className="w-3 h-3 fill-emerald-600" />}
                {!sla.isSweetSpot && !sla.isExtended && <Clock className="w-3 h-3" />}
                {sla.isExtended && <ThermometerSnowflake className="w-3 h-3" />}
                <span>~{sla.totalMinutes} นาที ({formatDistance(effectiveDistance)})</span>
              </span>
            </div>

            <div className="space-y-1">
              <div className="font-bold text-slate-800">{user.name} ({user.phone})</div>
              <p className="text-slate-600">{deliveryAddress}</p>
            </div>

            {/* SLA Timing Breakdown Bar */}
            <div className="p-2 rounded-xl bg-white border border-slate-200/70 text-[11px] flex items-center justify-between text-slate-600">
              <span>🍳 ร้านปรุง: ~{sla.prepMinutes} น.</span>
              <span className="text-slate-300">•</span>
              <span>🛵 ไรเดอร์วิ่ง: ~{sla.travelMinutes} น.</span>
              <span className="text-slate-300">•</span>
              <span className="font-bold text-emerald-700">รวม ~{sla.totalMinutes} น.</span>
            </div>

            {/* Note to Rider */}
            <div className="pt-2 border-t border-slate-200/80">
              <label className="text-[10px] text-slate-500 font-medium block mb-1">
                หมายเหตุถึงไรเดอร์:
              </label>
              <input
                type="text"
                value={driverNotes}
                onChange={e => setDriverNotes(e.target.value)}
                placeholder="เช่น วางไว้ที่โต๊ะล็อบบี้, โทรมาก่อนถึง 5 นาที"
                className="w-full p-2 rounded-xl bg-white border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Restaurant & Summary Items Mini-List */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs">สรุปรายการ ({cartRestaurant?.name})</span>
              <span className="text-slate-500 text-[11px]">{cart.length} เมนู</span>
            </div>

            <div className="divide-y divide-slate-100">
              {cart.map(item => (
                <div key={item.cartItemId} className="py-1.5 flex justify-between items-center text-[11px]">
                  <span className="text-slate-700">
                    <b className="text-emerald-700 font-semibold">{item.quantity}x</b> {item.menuItem.name}
                  </span>
                  <span className="font-semibold text-slate-900">
                    ฿{(item.unitPrice * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Price & Delivery Fee Breakdown */}
            <div className="pt-2 border-t border-slate-200/80 space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>ค่าอาหารรวม</span>
                <span className="font-semibold text-slate-800">฿{cartSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="flex items-center gap-1">
                  <span>ค่าจัดส่ง (มาตรฐานระยะทางไรเดอร์)</span>
                  <span className="text-slate-400">({formatDistance(effectiveDistance)})</span>
                </span>
                <span className="font-bold text-slate-800">฿{cartDeliveryFee.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>ส่วนลดคูปอง</span>
                  <span>-฿{discountAmount.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                เลือกวิธีชำระเงิน
              </label>
              <span className="text-[10px] text-slate-400">มาตรฐานสากล PCI-DSS</span>
            </div>

            <div className="space-y-2">
              {/* Option 1: In-App Wallet */}
              <label
                className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedPayment === 'wallet'
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="payment"
                    checked={selectedPayment === 'wallet'}
                    onChange={() => setSelectedPayment('wallet')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">FoodExpress Wallet (วอลเล็ต)</div>
                    <div className="text-[11px] text-slate-500">
                      ยอดเงินคงเหลือ: <span className="font-bold text-emerald-700">฿{user.walletBalance.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {isWalletInsufficient ? (
                  <button
                    id="insufficient-topup-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsTopUpOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] shadow-xs flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>เติมเงินเพิ่ม</span>
                  </button>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    แนะนำ รวดเร็วที่สุด
                  </span>
                )}
              </label>

              {/* Option 2: Credit / Debit Card */}
              <label
                className={`p-3 rounded-2xl border flex flex-col gap-2.5 cursor-pointer transition-all ${
                  selectedPayment === 'credit_card'
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="payment"
                      checked={selectedPayment === 'credit_card'}
                      onChange={() => setSelectedPayment('credit_card')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">บัตรเครดิต / เดบิต (Visa, Mastercard, JCB)</div>
                      <div className="text-[11px] text-slate-500">รองรับ 3D Secure OTP</div>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <span className="text-[9px] font-extrabold bg-blue-900 text-white px-1.5 py-0.5 rounded">VISA</span>
                    <span className="text-[9px] font-extrabold bg-red-600 text-white px-1.5 py-0.5 rounded">MC</span>
                  </div>
                </div>

                {/* Card input details simulation */}
                {selectedPayment === 'credit_card' && (
                  <div className="pt-2 border-t border-slate-200 space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-medium">หมายเลขบัตร</span>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        className="w-full p-2 mt-0.5 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500 font-medium">วันหมดอายุ (MM/YY)</span>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={e => setCardExpiry(e.target.value)}
                          className="w-full p-2 mt-0.5 rounded-xl border border-slate-200 bg-white text-xs font-mono text-center"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-medium">รหัส CVV (3 หลัก)</span>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value)}
                          className="w-full p-2 mt-0.5 rounded-xl border border-slate-200 bg-white text-xs font-mono text-center"
                          maxLength={4}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </label>

              {/* Option 3: PromptPay QR */}
              <label
                className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedPayment === 'promptpay_qr'
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="payment"
                    checked={selectedPayment === 'promptpay_qr'}
                    onChange={() => setSelectedPayment('promptpay_qr')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">พร้อมเพย์ QR (PromptPay)</div>
                    <div className="text-[11px] text-slate-500">สแกนจ่ายผ่านแอปธนาคารทุกแห่ง ฟรีค่าธรรมเนียม</div>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer Payment Action */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between items-baseline">
            <div>
              <span className="font-bold text-slate-900 text-sm">ยอดชำระสุทธิ</span>
              <div className="flex items-center gap-1 text-[10px] text-amber-700 font-semibold mt-0.5">
                <Coins className="w-3 h-3 text-amber-500" />
                <span>คุณจะได้รับ +{pointsToEarn} คะแนนสะสม</span>
              </div>
            </div>
            <span className="font-black text-2xl text-emerald-700">
              ฿{finalTotal.toLocaleString()}
            </span>
          </div>

          <button
            id="submit-order-payment-btn"
            disabled={isProcessing}
            onClick={handleConfirmOrder}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.99] ${
              isProcessing
                ? 'bg-slate-400 cursor-not-allowed'
                : isWalletInsufficient
                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/25'
            }`}
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>กำลังประมวลผลการชำระเงินที่ปลอดภัย...</span>
              </div>
            ) : isWalletInsufficient ? (
              <span>ยอดเงินวอลเล็ตไม่พอ (กรุณาเติมเงิน)</span>
            ) : (
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4" />
                <span>ยืนยันการสั่งซื้อ ฿{finalTotal.toLocaleString()}</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Payment Gateway Modal (PromptPay QR & Credit Card 3DS) */}
      {isGatewayOpen && (
        <PaymentGatewayModal
          orderId={`ORD-${Date.now().toString().slice(-6)}`}
          amount={finalTotal}
          channel={selectedPayment === 'credit_card' ? 'credit_card' : 'promptpay_qr'}
          merchantName={cartRestaurant?.name || 'FoodExpress Partner'}
          onSuccess={handleGatewaySuccess}
          onCancel={() => setIsGatewayOpen(false)}
        />
      )}
    </div>
  );
};
