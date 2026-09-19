import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Store, 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  CreditCard, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Lock,
  Phone,
  Mail,
  User,
  MapPin,
  Percent,
  TrendingUp,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  GP_PACKAGES, 
  INITIAL_MERCHANT_ACCOUNTS, 
  GpPackageInfo 
} from '../../data/merchantAuthData';
import { 
  MerchantSocialProvider, 
  MerchantGpTier, 
  MerchantAccount 
} from '../../types';

interface MerchantSocialAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const MerchantSocialAuthModal: React.FC<MerchantSocialAuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { 
    activeMerchant, 
    loginMerchantAs, 
    signupMerchant, 
    logoutMerchant, 
    setIsMerchantAuthModalOpen,
    triggerToast 
  } = useApp();

  const handleClose = () => {
    setIsMerchantAuthModalOpen(false);
    if (onClose) {
      onClose();
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [signupStep, setSignupStep] = useState<number>(1); // 1: Social provider, 2: Store info, 3: Choose GP, 4: Bank

  // Signup form state
  const [selectedProvider, setSelectedProvider] = useState<MerchantSocialProvider>('google');
  const [ownerName, setOwnerName] = useState('คุณวิภาดา มงคลสุข');
  const [ownerEmail, setOwnerEmail] = useState('wipada.kitchen@gmail.com');
  const [ownerPhone, setOwnerPhone] = useState('082-991-4455');
  const [storeName, setStoreName] = useState('');
  const [storeCategory, setStoreCategory] = useState('อาหารไทย / อาหารตามสั่ง');
  const [storeAddress, setStoreAddress] = useState('99/4 ถ.อโศกมนตรี คลองเตยเหนือ เขตวัฒนา กรุงเทพฯ 10110');
  const [selectedGpTier, setSelectedGpTier] = useState<MerchantGpTier>('standard_20');
  const [bankName, setBankName] = useState('ธนาคารกสิกรไทย (KBANK)');
  const [accountNumber, setAccountNumber] = useState('124-2-88941-0');
  const [accountName, setAccountName] = useState('วิภาดา คิทเช่น');
  const [promptPayId, setPromptPayId] = useState('0829914455');
  const [isCorporate, setIsCorporate] = useState(false);

  // Quick social login trigger
  const handleSocialLogin = (provider: MerchantSocialProvider, restId?: string) => {
    loginMerchantAs(provider, restId);
    triggerToast(
      'เข้าสู่ระบบร้านค้าสำเร็จ! 🏪',
      `ยินดีต้อนรับสู่ระบบ GP ร้านค้าพาร์ทเนอร์ ผ่าน ${provider.toUpperCase()}`,
      'success'
    );
    handleClose();
  };

  // Complete Signup Submission
  const handleCompleteSignup = (e: React.FormEvent) => {
    e.preventDefault();

    if (!storeName.trim()) {
      triggerToast('กรุณาระบุข้อมูล', 'กรุณาใส่ชื่อร้านอาหารของคุณ', 'info');
      setSignupStep(2);
      return;
    }

    const chosenPackage = GP_PACKAGES.find(p => p.tier === selectedGpTier) || GP_PACKAGES[0];
    const generatedRestId = `rest_partner_${Date.now()}`;

    const newMerchantData: Omit<MerchantAccount, 'id' | 'joinedDate'> = {
      ownerName,
      email: ownerEmail,
      phone: ownerPhone,
      avatar: selectedProvider === 'google' 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      socialProvider: selectedProvider,
      restaurantId: generatedRestId,
      restaurantName: storeName.trim(),
      restaurantLogo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
      category: storeCategory,
      address: storeAddress,
      gpRatePct: chosenPackage.ratePct,
      gpTier: chosenPackage.tier,
      contractStatus: 'active',
      contractNumber: `GP-2026-REG-${Math.floor(10000 + Math.random() * 90000)}`,
      isCorporate,
      taxId: isCorporate ? '0105567891234' : undefined,
      bankAccount: {
        bankName,
        bankCode: '004',
        accountNumber,
        accountName: accountName || storeName,
        promptPayId,
      },
      role: 'owner',
    };

    signupMerchant(newMerchantData);

    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    triggerToast(
      'ลงทะเบียนร้านค้าสำเร็จ! 🎉',
      `ยินดีต้อนรับร้าน "${storeName}" เข้าสู่สัญญา GP ${chosenPackage.ratePct}% พร้อมรับออเดอร์ทันที`,
      'reward'
    );
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 cursor-default"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white p-5 relative shrink-0">
          <button 
            id="close-merchant-auth-modal-btn"
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
            title="ปิดหน้าต่าง"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950">
                  Merchant GP Portal
                </span>
                <span className="text-xs text-emerald-200">เข้าสู่ระบบ / สมัครร้านค้า</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                {mode === 'login' ? 'เข้าสู่ระบบร้านค้าพาร์ทเนอร์ GP' : 'ลงทะเบียนร้านค้าใหม่ เข้าร่วม GP'}
              </h2>
            </div>
          </div>

          {/* Toggle Switcher (Login vs Signup) */}
          <div className="mt-4 grid grid-cols-2 p-1 bg-black/20 rounded-2xl border border-white/10 text-xs font-bold">
            <button
              id="tab-merchant-login-btn"
              type="button"
              onClick={() => { setMode('login'); setSignupStep(1); }}
              className={`py-2 rounded-xl transition-all cursor-pointer text-center ${
                mode === 'login' 
                  ? 'bg-white text-emerald-900 shadow-md font-black' 
                  : 'text-white/80 hover:text-white'
              }`}
            >
              เข้าสู่ระบบ (Sign In)
            </button>
            <button
              id="tab-merchant-signup-btn"
              type="button"
              onClick={() => { setMode('signup'); setSignupStep(1); }}
              className={`py-2 rounded-xl transition-all cursor-pointer text-center ${
                mode === 'signup' 
                  ? 'bg-white text-emerald-900 shadow-md font-black' 
                  : 'text-white/80 hover:text-white'
              }`}
            >
              สมัครร้านใหม่ (Sign Up GP)
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* ========================================================= */}
          {/* MODE 1: LOGIN */}
          {/* ========================================================= */}
          {mode === 'login' && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-slate-800">
                  เชื่อมต่อด้วยบัญชี Social ของคุณเพื่อจัดการร้านค้า
                </p>
                <p className="text-xs text-slate-500">
                  ตรวจสอบยอดขายรายวัน จัดการอัตรา GP และถอนเงินเข้าบัญชีอัตโนมัติ
                </p>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-2.5">
                {/* 1. GOOGLE */}
                <button
                  id="merchant-login-google-btn"
                  type="button"
                  onClick={() => handleSocialLogin('google', 'rest_1')}
                  className="w-full py-3 px-4 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm flex items-center justify-center gap-3 shadow-xs hover:border-slate-400 transition-all cursor-pointer active:scale-98"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                    <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9z"/>
                    <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"/>
                  </svg>
                  <span>เข้าสู่ระบบด้วย Google (Google Workspace)</span>
                </button>

                {/* 2. LINE (Official LINE Green) */}
                <button
                  id="merchant-login-line-btn"
                  type="button"
                  onClick={() => handleSocialLogin('line', 'rest_2')}
                  className="w-full py-3 px-4 rounded-2xl bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-sm flex items-center justify-center gap-3 shadow-xs transition-all cursor-pointer active:scale-98"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .626.285.626.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                  </svg>
                  <span>เข้าสู่ระบบด้วย LINE (LINE Official Account)</span>
                </button>

                {/* 3. FACEBOOK */}
                <button
                  id="merchant-login-facebook-btn"
                  type="button"
                  onClick={() => handleSocialLogin('facebook', 'rest_3')}
                  className="w-full py-3 px-4 rounded-2xl bg-[#1877F2] hover:bg-[#1567d3] text-white font-bold text-sm flex items-center justify-center gap-3 shadow-xs transition-all cursor-pointer active:scale-98"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>เข้าสู่ระบบด้วย Facebook (Meta Business)</span>
                </button>

                {/* 4. APPLE */}
                <button
                  id="merchant-login-apple-btn"
                  type="button"
                  onClick={() => handleSocialLogin('apple', 'rest_4')}
                  className="w-full py-3 px-4 rounded-2xl bg-black hover:bg-slate-900 text-white font-bold text-sm flex items-center justify-center gap-3 shadow-xs transition-all cursor-pointer active:scale-98"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.64-.81 1.08-1.94.96-3.09-.98.04-2.16.66-2.84 1.46-.59.68-1.12 1.83-.98 2.95 1.09.09 2.21-.57 2.86-1.32z"/>
                  </svg>
                  <span>เข้าสู่ระบบด้วย Apple ID</span>
                </button>
              </div>

              {/* Or Select from Demo Partner Stores */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-slate-700">หรือสลับเป็นร้านค้าตัวอย่าง (Demo Stores):</span>
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                    คลิกทดสอบได้ทันที
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {INITIAL_MERCHANT_ACCOUNTS.map(acc => {
                    const isCurrent = activeMerchant?.id === acc.id;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => handleSocialLogin(acc.socialProvider, acc.restaurantId)}
                        className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          isCurrent
                            ? 'border-emerald-500 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-400'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <img 
                          src={acc.restaurantLogo || acc.avatar} 
                          alt={acc.restaurantName}
                          className="w-9 h-9 rounded-xl object-cover shrink-0 border border-slate-200"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {acc.restaurantName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                            <span className="font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded">
                              GP {acc.gpRatePct}%
                            </span>
                            <span className="truncate">({acc.socialProvider.toUpperCase()})</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Logged-in info if exists */}
              {activeMerchant && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={activeMerchant.avatar} 
                      alt={activeMerchant.ownerName}
                      className="w-8 h-8 rounded-full object-cover border border-slate-300"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        ล็อกอินอยู่: {activeMerchant.ownerName}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        ร้าน: {activeMerchant.restaurantName} • GP {activeMerchant.gpRatePct}%
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      logoutMerchant();
                      triggerToast('ออกจากระบบแล้ว', 'ออกจากบัญชีร้านค้าเรียบร้อย', 'info');
                    }}
                    className="text-xs text-red-600 hover:text-red-700 font-bold px-2.5 py-1 rounded-lg hover:bg-red-50 cursor-pointer"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* MODE 2: SIGNUP & ONBOARDING FLOW (4 STEPS) */}
          {/* ========================================================= */}
          {mode === 'signup' && (
            <form onSubmit={handleCompleteSignup} className="space-y-5">
              {/* Stepper Header */}
              <div className="flex items-center justify-between px-2">
                {[
                  { step: 1, label: '1. เชื่อมต่อ Social' },
                  { step: 2, label: '2. ข้อมูลร้านค้า' },
                  { step: 3, label: '3. เลือกแพ็กเกจ GP' },
                  { step: 4, label: '4. บัญชีรับเงิน' },
                ].map((st) => (
                  <button
                    key={st.step}
                    type="button"
                    onClick={() => setSignupStep(st.step)}
                    className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                      signupStep === st.step
                        ? 'text-emerald-700 font-bold'
                        : signupStep > st.step
                        ? 'text-emerald-600 font-medium'
                        : 'text-slate-400 font-medium'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black ${
                      signupStep === st.step
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : signupStep > st.step
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {signupStep > st.step ? '✓' : st.step}
                    </div>
                    <span className="text-[10px] hidden sm:inline">{st.label}</span>
                  </button>
                ))}
              </div>

              {/* STEP 1: CHOOSE SOCIAL PROVIDER */}
              {signupStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100">
                    <h3 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>ขั้นตอนที่ 1: เลือกบัญชี Social สำหรับเปิดร้านพาร์ทเนอร์</span>
                    </h3>
                    <p className="text-[11px] text-emerald-700 mt-1">
                      เข้าสู่ระบบครั้งถัดไปสะดวก รวดเร็ว ปลอดภัยด้วยบัญชีที่คุณใช้อยู่เป็นประจำ
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { id: 'google', name: 'Google Workspace', desc: 'Gmail / Google ID', color: 'border-blue-300 hover:bg-blue-50/40' },
                      { id: 'line', name: 'LINE Official', desc: 'LINE Login ID', color: 'border-emerald-300 hover:bg-emerald-50/40' },
                      { id: 'facebook', name: 'Facebook', desc: 'Meta Business Page', color: 'border-blue-400 hover:bg-blue-50/40' },
                      { id: 'apple', name: 'Apple ID', desc: 'Apple Business ID', color: 'border-slate-400 hover:bg-slate-50' },
                    ].map((p) => {
                      const isSel = selectedProvider === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedProvider(p.id as MerchantSocialProvider)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            isSel 
                              ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500 shadow-xs' 
                              : `border-slate-200 ${p.color}`
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">{p.name}</span>
                            {isSel && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-0.5">{p.desc}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ชื่อ-นามสกุล เจ้าของร้าน / ตัวแทน
                      </label>
                      <input
                        type="text"
                        value={ownerName}
                        onChange={e => setOwnerName(e.target.value)}
                        required
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="เช่น คุณสมชาย สุขเจริญ"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          อีเมลสำหรับแจ้งเตือนยอด
                        </label>
                        <input
                          type="email"
                          value={ownerEmail}
                          onChange={e => setOwnerEmail(e.target.value)}
                          required
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="shop@gmail.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          เบอร์โทรติดต่อหลัก
                        </label>
                        <input
                          type="tel"
                          value={ownerPhone}
                          onChange={e => setOwnerPhone(e.target.value)}
                          required
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="08x-xxx-xxxx"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setSignupStep(2)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      <span>ถัดไป: กรอกข้อมูลร้านค้า</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: STORE INFO */}
              {signupStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100">
                    <h3 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <Store className="w-4 h-4 text-emerald-600" />
                      <span>ขั้นตอนที่ 2: ข้อมูลร้านอาหาร</span>
                    </h3>
                    <p className="text-[11px] text-emerald-700 mt-1">
                      ระบุชื่อร้านค้าและทำเลที่ตั้งเพื่อให้ไรเดอร์และลูกค้าค้นหาร้านเจอได้ง่าย
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ชื่อร้านอาหาร <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={storeName}
                        onChange={e => setStoreName(e.target.value)}
                        required
                        placeholder="เช่น ครัวคุณพิมพ์ อาหารไทยโบราณ หรือ Cafe De Bangkok"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        หมวดหมู่อาหารหลัก
                      </label>
                      <select
                        value={storeCategory}
                        onChange={e => setStoreCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      >
                        <option value="อาหารไทย / อาหารตามสั่ง">อาหารไทย / อาหารตามสั่ง</option>
                        <option value="ส้มตำ / อาหารอีสาน">ส้มตำ / อาหารอีสาน</option>
                        <option value="อาหารญี่ปุ่น / ซูชิ / ราเมน">อาหารญี่ปุ่น / ซูชิ / ราเมน</option>
                        <option value="เบเกอรี่ / คาเฟ่ / ชานม">เบเกอรี่ / คาเฟ่ / ชานม</option>
                        <option value="เบอร์เกอร์ / อาหารตะวันตก">เบอร์เกอร์ / อาหารตะวันตก</option>
                        <option value="ก๋วยเตี๋ยว / สตรีทฟู้ด">ก๋วยเตี๋ยว / สตรีทฟู้ด</option>
                        <option value="อาหารเพื่อสุขภาพ / คลีน">อาหารเพื่อสุขภาพ / คลีน</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ที่ตั้งร้าน / ปักหมุดที่อยู่
                      </label>
                      <textarea
                        value={storeAddress}
                        onChange={e => setStoreAddress(e.target.value)}
                        rows={2}
                        required
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="เลขที่ ถนน ซอย แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setSignupStep(1)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>ย้อนกลับ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!storeName.trim()) {
                          triggerToast('กรุณาระบุชื่อร้าน', 'พิมพ์ชื่อร้านอาหารของคุณก่อนไปขั้นตอนถัดไป', 'info');
                          return;
                        }
                        setSignupStep(3);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      <span>ถัดไป: เลือกแพ็กเกจ GP</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: CHOOSE GP PACKAGE */}
              {signupStep === 3 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100">
                    <h3 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <Percent className="w-4 h-4 text-emerald-600" />
                      <span>ขั้นตอนที่ 3: เลือกแพ็กเกจสัญญา GP ร้านค้า</span>
                    </h3>
                    <p className="text-[11px] text-emerald-700 mt-1">
                      กำหนดอัตราค่าคอมมิชชัน GP ตามกลยุทธ์การขายของร้านคุณ สามารถปรับเปลี่ยนได้ในภายหลัง
                    </p>
                  </div>

                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {GP_PACKAGES.map((pkg) => {
                      const isSel = selectedGpTier === pkg.tier;
                      return (
                        <div
                          key={pkg.tier}
                          onClick={() => setSelectedGpTier(pkg.tier)}
                          className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                            isSel 
                              ? `${pkg.borderAccent} bg-white shadow-md ring-2 ring-emerald-400/40` 
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-black text-slate-900">{pkg.nameTh}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pkg.bgAccent}`}>
                                  {pkg.badgeTh}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">{pkg.descriptionTh}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-lg font-black text-emerald-700">{pkg.ratePct}%</span>
                              <span className="text-[10px] text-slate-400 block">GP Rate</span>
                            </div>
                          </div>

                          {/* Benefits list */}
                          <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
                            {pkg.benefits.slice(0, 3).map((b, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span>{b}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setSignupStep(2)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>ย้อนกลับ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignupStep(4)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      <span>ถัดไป: ข้อมูลบัญชีรับเงิน</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: BANK ACCOUNT & SETTLEMENT DESTINATION */}
              {signupStep === 4 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100">
                    <h3 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      <span>ขั้นตอนที่ 4: บัญชีธนาคารสำหรับโอนเงินสุทธิ (EOD Settlement)</span>
                    </h3>
                    <p className="text-[11px] text-emerald-700 mt-1">
                      ระบบจะโอนยอดขายหลังหัก GP เข้าบัญชีนี้ทุกวันอัตโนมัติเวลา 14:00 น.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        เลือกธนาคาร
                      </label>
                      <select
                        value={bankName}
                        onChange={e => setBankName(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      >
                        <option value="ธนาคารกสิกรไทย (KBANK)">ธนาคารกสิกรไทย (KBANK)</option>
                        <option value="ธนาคารไทยพาณิชย์ (SCB)">ธนาคารไทยพาณิชย์ (SCB)</option>
                        <option value="ธนาคารกรุงเทพ (BBL)">ธนาคารกรุงเทพ (BBL)</option>
                        <option value="ธนาคารกรุงไทย (KTB)">ธนาคารกรุงไทย (KTB)</option>
                        <option value="ธนาคารกรุงศรีอยุธยา (BAY)">ธนาคารกรุงศรีอยุธยา (BAY)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          เลขที่บัญชีธนาคาร
                        </label>
                        <input
                          type="text"
                          value={accountNumber}
                          onChange={e => setAccountNumber(e.target.value)}
                          required
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                          placeholder="xxx-x-xxxxx-x"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          ชื่อบัญชี (ตรงกับ Book Bank)
                        </label>
                        <input
                          type="text"
                          value={accountName}
                          onChange={e => setAccountName(e.target.value)}
                          required
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="ชื่อบัญชีรับเงิน"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        PromptPay ID (เบอร์โทร หรือ เลขประจำตัวผู้เสียภาษี)
                      </label>
                      <input
                        type="text"
                        value={promptPayId}
                        onChange={e => setPromptPayId(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                        placeholder="08x-xxx-xxxx"
                      />
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={isCorporate}
                          onChange={e => setIsCorporate(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <span>ลงทะเบียนในนามนิติบุคคล (หักภาษี ณ ที่จ่าย WHT 3%)</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setSignupStep(3)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>ย้อนกลับ</span>
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs flex items-center gap-2 shadow-md cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>ยืนยันเปิดร้านค้า GP ทันที</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 p-3.5 px-6 border-t border-slate-200 text-center shrink-0">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>ข้อมูลสัญญาและการเงินได้รับการคุ้มครองด้วยการเข้ารหัสความปลอดภัยระดับมาตรฐานสากล</span>
          </p>
        </div>
      </div>
    </div>
  );
};
