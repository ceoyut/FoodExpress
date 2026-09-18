import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  QrCode, 
  CreditCard, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Download, 
  Copy, 
  Sparkles, 
  AlertCircle, 
  RefreshCw,
  Lock,
  Smartphone,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { createPaymentIntent, confirmPaymentTransaction, PaymentIntentResponse } from '../services/paymentGateway';
import { useApp } from '../context/AppContext';

interface PaymentGatewayModalProps {
  orderId: string;
  amount: number;
  channel: 'promptpay_qr' | 'credit_card';
  merchantName: string;
  onSuccess: (transactionRef: string) => void;
  onCancel: () => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  orderId,
  amount,
  channel,
  merchantName,
  onSuccess,
  onCancel,
}) => {
  const { triggerToast } = useApp();
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [copied, setCopied] = useState(false);

  // Credit card 3DS OTP state
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('889922');
  const [otpInput, setOtpInput] = useState('');

  // Initialize Payment Intent on mount
  useEffect(() => {
    let isMounted = true;
    async function initPayment() {
      setLoading(true);
      try {
        const intent = await createPaymentIntent({
          orderId,
          amount,
          channel,
          merchantName,
        });
        if (isMounted) {
          setPaymentIntent(intent);
        }
      } catch (err) {
        console.error('Failed to create payment intent:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    initPayment();

    return () => {
      isMounted = false;
    };
  }, [orderId, amount, channel, merchantName]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0 || isSuccess) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, isSuccess]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleCopyPayload = () => {
    if (paymentIntent?.qrPayload) {
      navigator.clipboard.writeText(paymentIntent.qrPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      triggerToast('คัดลอกรหัส PromptPay แล้ว', 'คุณสามารถนำรหัสไปวางในแอปธนาคารได้', 'info');
    }
  };

  const handleSimulateInstantPayment = async () => {
    if (!paymentIntent) return;
    setIsVerifying(true);

    try {
      // Simulate real-time Gateway verification hook
      await new Promise(r => setTimeout(r, 1200));
      const res = await confirmPaymentTransaction(paymentIntent.paymentId, orderId);

      setIsSuccess(true);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10B981', '#059669', '#34D399', '#3B82F6', '#F59E0B']
        });
      } catch {
        // safe ignore
      }

      triggerToast('ชำระเงินสำเร็จแล้ว! 💳', `ได้รับยอด ฿${amount.toLocaleString()} ซิงค์ลง Cloud Firestore แล้ว`, 'reward');

      setTimeout(() => {
        onSuccess(res.transactionRef);
      }, 1500);
    } catch (err: any) {
      triggerToast('การยืนยันล้มเหลว', err.message || 'โปรดลองอีกครั้ง', 'info');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOtpStep(true);
    triggerToast('ส่งรหัส OTP แล้ว', 'รหัส OTP สำหรับทดสอบคือ 889922', 'info');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.trim() !== otpCode) {
      triggerToast('รหัส OTP ไม่ถูกต้อง', 'กรุณาระบุรหัส 889922 สำหรับทดสอบ', 'info');
      return;
    }
    await handleSimulateInstantPayment();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-150 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Gateway Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              disabled={isVerifying || isSuccess}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">FoodExpress Payment Gateway</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-slate-300">
                ระบบรับชำระเงินคลาวด์มาตรฐาน PCI-DSS
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
              Cloud Sync ⚡
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-4 max-h-[80vh] text-slate-800">
          
          {/* Amount & Merchant Header Card */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center space-y-1">
            <span className="text-[11px] text-slate-500 font-medium">ยอดเงินที่ต้องชำระ (Total Amount)</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              ฿{amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-600 font-semibold flex items-center justify-center gap-1.5 pt-0.5">
              <span>ร้านค้า:</span>
              <span className="text-emerald-700 font-bold">{merchantName}</span>
            </div>
          </div>

          {/* PromptPay QR Section */}
          {channel === 'promptpay_qr' && (
            <div className="space-y-3.5">
              {/* Countdown timer pill */}
              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>QR หมดอายุใน:</span>
                </span>
                <span className="font-mono font-bold text-amber-900 text-sm">
                  {timeLeft > 0 ? timeFormatted : 'หมดเวลา'}
                </span>
              </div>

              {/* QR Box */}
              <div className="bg-white p-4 rounded-2xl border-2 border-indigo-500/30 flex flex-col items-center justify-center space-y-3 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
                  <QrCode className="w-4 h-4 text-indigo-600" />
                  <span>สแกน QR ผ่าน Mobile Banking ได้ทุกธนาคาร</span>
                </div>

                {loading ? (
                  <div className="w-56 h-56 flex flex-col items-center justify-center gap-2 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                    <span className="text-xs">กำลังสร้าง Dynamic QR...</span>
                  </div>
                ) : paymentIntent?.qrImageUrl ? (
                  <div className="relative p-2 bg-white rounded-xl shadow-xs border border-slate-100">
                    <img 
                      src={paymentIntent.qrImageUrl} 
                      alt="PromptPay QR Code"
                      className="w-56 h-56 object-contain rounded-lg" 
                    />
                    {isSuccess && (
                      <div className="absolute inset-0 bg-emerald-600/90 backdrop-blur-xs rounded-lg flex flex-col items-center justify-center text-white p-4 text-center animate-in fade-in">
                        <CheckCircle2 className="w-12 h-12 text-white mb-2" />
                        <span className="font-black text-base">ชำระเงินสำเร็จแล้ว!</span>
                        <span className="text-xs opacity-90">ระบบกำลังนำไปยังหน้าติดตามคำสั่งซื้อ...</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-rose-500 text-xs">ไม่สามารถสร้าง QR Code ได้</div>
                )}

                <div className="text-center space-y-0.5">
                  <div className="text-[11px] font-bold text-slate-800">ชื่อบัญชี: บจก. ฟู้ดเอ็กซ์เพรส เทคโนโลยี (ประเทศไทย)</div>
                  <div className="text-[10px] text-slate-400 font-mono">Ref: {paymentIntent?.chargeRef || orderId}</div>
                </div>

                {/* Actions: Copy & Simulate */}
                <div className="w-full flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCopyPayload}
                    className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกรหัส EMVCo'}</span>
                  </button>

                  <a
                    href={paymentIntent?.qrImageUrl}
                    download={`promptpay-${orderId}.png`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>บันทึก QR</span>
                  </a>
                </div>
              </div>

              {/* Instant Simulation Button */}
              <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200/80 space-y-2">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-950">
                    <span className="font-bold">จำลองการชำระเงินจริง (Live Webhook Test):</span>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      กดปุ่มนี้เพื่อส่งสัญญาณยืนยันการรับเงินเข้าสู่ระบบ Cloud Firestore ทันที โดยไม่ต้องรอแอปธนาคาร
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  id="simulate-instant-pay-btn"
                  onClick={handleSimulateInstantPayment}
                  disabled={isVerifying || isSuccess}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>กำลังตรวจจับยอดเงินจากธนาคาร...</span>
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>ชำระเงินสำเร็จแล้ว!</span>
                    </>
                  ) : (
                    <>
                      <span>ยืนยันการโอนเงินสำเร็จ (Simulate Instant Payment)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Credit Card Flow */}
          {channel === 'credit_card' && (
            <div className="space-y-3.5">
              {!isOtpStep ? (
                <form onSubmit={handleCardSubmit} className="space-y-3">
                  <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-200 text-xs text-blue-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span>ระบบเชื่อมต่อ Gateway บัตรเครดิตปลอดภัย</span>
                    </div>
                    <p className="text-[11px] text-blue-700">
                      ตัดบัตรผ่านเครือข่าย Visa, Mastercard หรือ JCB ด้วยเทคโนโลยี Tokenization
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        หมายเลขบัตรเครดิต / เดบิต
                      </label>
                      <input 
                        type="text" 
                        defaultValue="4532 8812 3456 7890" 
                        readOnly 
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-800"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          วันหมดอายุ
                        </label>
                        <input 
                          type="text" 
                          defaultValue="12/28" 
                          readOnly 
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-center font-bold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          รหัส CVV
                        </label>
                        <input 
                          type="password" 
                          defaultValue="789" 
                          readOnly 
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-center font-bold text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors mt-2"
                  >
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ดำเนินการชำระเงิน ฿{amount.toLocaleString()}</span>
                  </button>
                </form>
              ) : (
                /* 3DS OTP Step */
                <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">ยืนยันรหัสความปลอดภัย OTP (3D Secure)</h4>
                    <p className="text-[11px] text-slate-500">
                      ระบบได้ส่งรหัส OTP 6 หลักไปยังเบอร์มือถือของคุณ (รหัสทดสอบ: <strong className="text-emerald-700 font-mono">889922</strong>)
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1 text-center">
                      กรอกรหัส OTP:
                    </label>
                    <input 
                      type="text" 
                      value={otpInput}
                      onChange={e => setOtpInput(e.target.value)}
                      placeholder="889922"
                      maxLength={6}
                      className="w-full p-3 rounded-xl border-2 border-emerald-500 bg-white font-mono text-center text-lg tracking-widest font-black text-slate-900 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifying || isSuccess}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>กำลังประมวลผลการตัดบัตร...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>ยืนยันและตัดยอดเงิน (Confirm Charge)</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Safe Badge */}
          <div className="pt-2 border-t border-slate-150 flex items-center justify-center gap-2 text-[10px] text-slate-400">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>เข้ารหัสลับความปลอดภัย TLS 1.3 | Google Cloud Platform</span>
          </div>
        </div>
      </div>
    </div>
  );
};
