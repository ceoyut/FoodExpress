import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Check, 
  MapPin, 
  Plus, 
  RotateCcw, 
  Phone, 
  ShieldCheck, 
  LogOut, 
  Heart,
  User,
  Mail,
  Wallet,
  Sparkles,
  CheckCircle2,
  UserPlus,
  KeyRound
} from 'lucide-react';
import { RESTAURANTS_DATA } from '../data/mockData';

interface AuthModalProps {
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { 
    user, 
    setUser,
    updateUserProfile,
    loginAs, 
    resetAllData, 
    setSelectedRestaurant, 
    activeTab,
    setActiveTab, 
    setIsAuthModalOpen,
    triggerToast 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'register' | 'addresses' | 'favorites'>('profile');
  const [newAddressInput, setNewAddressInput] = useState('');

  // Customer registration / edit state
  const [regForm, setRegForm] = useState({
    name: user.name,
    phone: user.phone,
    email: user.email,
    address: user.savedAddresses[0]?.address || '128/9 ซอยสุขุมวิท 55 (ทองหล่อ), วัฒนา, กทม.',
    otpCode: '889922',
  });
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('889922');
  const [isPhoneVerified, setIsPhoneVerified] = useState(true);

  const handleVerifyOtp = () => {
    if (enteredOtp.trim() === regForm.otpCode) {
      setIsPhoneVerified(true);
      triggerToast('ยืนยัน OTP สำเร็จ!', `เบอร์ ${regForm.phone} ผ่านการรับรองความปลอดภัยแล้ว`, 'success');
    } else {
      triggerToast('รหัส OTP ไม่ถูกต้อง', `กรุณากรอกรหัสทดสอบ ${regForm.otpCode}`, 'error');
    }
  };

  const handleClose = () => {
    setIsAuthModalOpen(false);
    if (activeTab === 'profile') {
      setActiveTab('home');
    }
    if (onClose) {
      onClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.name.trim()) {
      triggerToast('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกชื่อ-นามสกุล', 'info');
      return;
    }
    if (!regForm.phone.trim()) {
      triggerToast('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกเบอร์โทรศัพท์', 'info');
      return;
    }

    updateUserProfile({
      name: regForm.name.trim(),
      phone: regForm.phone.trim(),
      email: regForm.email.trim() || `${regForm.name.replace(/\s+/g, '').toLowerCase()}@foodexpress.com`,
    });
    triggerToast('สมัครสมาชิกสำเร็จ', `ยินดีต้อนรับคุณ ${regForm.name} สู่ FoodExpress!`, 'success');
    setActiveSubTab('profile');
  };

  const favoriteRestaurants = RESTAURANTS_DATA.filter(r => 
    user.favoriteRestaurantIds.includes(r.id)
  );

  const socialProviders = [
    { id: 'google', name: 'Google Workspace', icon: '🌐', color: 'border-slate-300 hover:bg-slate-50' },
    { id: 'line', name: 'LINE Account', icon: '🟢', color: 'border-emerald-300 hover:bg-emerald-50 text-emerald-700' },
    { id: 'apple', name: 'Apple ID', icon: '🍏', color: 'border-slate-800 bg-slate-900 text-white' },
    { id: 'facebook', name: 'Facebook', icon: '🔵', color: 'border-blue-300 hover:bg-blue-50 text-blue-700' },
  ];

  return (
    <div 
      className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 cursor-pointer animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-5 text-slate-800 cursor-default"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 border-b border-slate-150 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500 shadow-xs"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-slate-900">{user.name}</h3>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded-full">
                  {user.tier}
                </span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">
                  ลูกค้า (Customer)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                <span>{user.phone}</span>
                <span>•</span>
                <span>{user.email}</span>
              </p>
            </div>
          </div>

          <button
            id="close-auth-modal-btn"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/80 text-slate-700 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer border border-slate-200"
            title="ปิดหน้าต่าง"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Subtabs */}
        <div className="flex border-b border-slate-200 px-2 bg-white overflow-x-auto no-scrollbar">
          <button
            id="auth-subtab-profile-btn"
            onClick={() => setActiveSubTab('profile')}
            className={`px-3 py-2.5 text-center font-bold text-xs border-b-2 whitespace-nowrap transition-all ${
              activeSubTab === 'profile'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            ข้อมูลลูกค้า & ล็อกอิน
          </button>

          <button
            id="auth-subtab-register-btn"
            onClick={() => setActiveSubTab('register')}
            className={`px-3 py-2.5 text-center font-bold text-xs border-b-2 whitespace-nowrap transition-all ${
              activeSubTab === 'register'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            สมัครสมาชิกใหม่
          </button>

          <button
            id="auth-subtab-addresses-btn"
            onClick={() => setActiveSubTab('addresses')}
            className={`px-3 py-2.5 text-center font-bold text-xs border-b-2 whitespace-nowrap transition-all ${
              activeSubTab === 'addresses'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            ที่อยู่ ({user.savedAddresses.length})
          </button>

          <button
            id="auth-subtab-favorites-btn"
            onClick={() => setActiveSubTab('favorites')}
            className={`px-3 py-2.5 text-center font-bold text-xs border-b-2 whitespace-nowrap transition-all ${
              activeSubTab === 'favorites'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            ร้านโปรด ({user.favoriteRestaurantIds.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Customer Profile & Social Login Tab */}
          {activeSubTab === 'profile' && (
            <div className="space-y-4">
              {/* Active Customer Summary Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-50 to-teal-50/40 border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-emerald-950 text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    บัญชีลูกค้าปัจจุบัน (Active Customer)
                  </span>
                  <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                    ยืนยันตัวตนแล้ว
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-emerald-150">
                  <div className="bg-white/80 p-2 rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Wallet className="w-3 h-3 text-emerald-600" /> วอลเล็ต
                    </span>
                    <p className="font-black text-xs text-emerald-900 mt-0.5">
                      ฿{user.walletBalance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="bg-white/80 p-2 rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" /> คะแนนสะสม
                    </span>
                    <p className="font-black text-xs text-amber-900 mt-0.5">
                      {user.loyaltyPoints} แต้ม ({user.tier})
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Login */}
              <div className="space-y-1">
                <span className="font-bold text-slate-900 text-xs block">
                  เข้าสู่ระบบด้วยโซเชียลมีเดีย (Social Login)
                </span>
                <p className="text-[11px] text-slate-500">
                  เข้าสู่ระบบได้ทันทีในคลิกเดียว ปลอดภัยตามมาตรฐานสากล
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {socialProviders.map(p => (
                  <button
                    key={p.id}
                    onClick={() => loginAs(p.id as any)}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition-all active:scale-98 ${p.color} ${
                      user.loginProvider === p.id ? 'ring-2 ring-emerald-500 shadow-sm' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{p.icon}</span>
                      <span className="font-semibold text-xs">{p.name}</span>
                    </div>
                    {user.loginProvider === p.id && (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                        เชื่อมต่ออยู่
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Security guarantee */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-[11px] text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>การเชื่อมต่อข้อมูลได้รับการเข้ารหัสด้วย SSL 256-bit ปลอดภัยสูงสุด</span>
              </div>

              {/* Reset Data Button */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  id="reset-demo-data-btn"
                  onClick={resetAllData}
                  className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>รีเซ็ตข้อมูลตัวอย่างกลับเป็นค่าเริ่มต้น (Reset Demo Data)</span>
                </button>
              </div>
            </div>
          )}

          {/* Customer Registration Flow Tab */}
          {activeSubTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                <h4 className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  ทดสอบระบบสมัครสมาชิกสำหรับลูกค้า (Customer Registration)
                </h4>
                <p className="text-[11px] text-emerald-800 mt-1">
                  กรอกข้อมูลเพื่อจำลองการเปิดบัญชีลูกค้าใหม่ พร้อมรับสิทธิประโยชน์และโบนัสแรกเข้า
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ชื่อ - นามสกุล *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={regForm.name}
                      onChange={e => setRegForm({ ...regForm, name: e.target.value })}
                      placeholder="เช่น สมชาย สายใจ"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700">
                      เบอร์โทรศัพท์ (สำหรับรับรหัส SMS OTP) *
                    </label>
                    {isPhoneVerified && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        ยืนยัน OTP แล้ว
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        value={regForm.phone}
                        onChange={e => {
                          setRegForm({ ...regForm, phone: e.target.value });
                          setIsPhoneVerified(false);
                        }}
                        placeholder="081-992-3344"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-500 focus:outline-none"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(true);
                        setIsPhoneVerified(false);
                        triggerToast('ส่งรหัส OTP สำเร็จ 💬', `รหัสยืนยันตัวตน SMS คือ ${regForm.otpCode}`, 'info');
                      }}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-[11px] font-bold text-slate-700 shrink-0 cursor-pointer"
                    >
                      {otpSent ? 'ส่ง OTP ใหม่' : 'รับ OTP'}
                    </button>
                  </div>

                  {/* Interactive OTP Verification Box */}
                  {otpSent && !isPhoneVerified && (
                    <div className="mt-2.5 p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                      <div className="flex items-center justify-between text-xs text-amber-950 font-bold">
                        <span className="flex items-center gap-1">
                          <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                          กรอกรหัส 6 หลักจาก SMS
                        </span>
                        <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                          รหัสทดสอบ: {regForm.otpCode}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={enteredOtp}
                          onChange={e => setEnteredOtp(e.target.value)}
                          placeholder="889922"
                          className="flex-1 px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs font-mono font-bold tracking-widest text-center focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
                        >
                          ยืนยัน OTP
                        </button>
                      </div>
                    </div>
                  )}

                  {isPhoneVerified && (
                    <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                      เบอร์โทรศัพท์ผ่านการยืนยันตัวตนด้วย SMS OTP เรียบร้อย (AIS/True SMS Gateway)
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    อีเมล (สำหรับใบเสร็จอิเล็กทรอนิกส์)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={regForm.email}
                      onChange={e => setRegForm({ ...regForm, email: e.target.value })}
                      placeholder="somchai.saijai@foodexpress.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ที่อยู่จัดส่งเริ่มต้น
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={regForm.address}
                      onChange={e => setRegForm({ ...regForm, address: e.target.value })}
                      placeholder="บ้านเลขที่, ถนน, แขวง, เขต"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>บันทึกและเปิดใช้งานบัญชีลูกค้านี้</span>
                </button>
              </div>
            </form>
          )}

          {/* Saved Addresses Tab */}
          {activeSubTab === 'addresses' && (
            <div className="space-y-3">
              <div className="space-y-2">
                {user.savedAddresses.map(addr => (
                  <div
                    key={addr.id}
                    className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 ${
                      addr.isDefault
                        ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${addr.isDefault ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{addr.label}</span>
                          {addr.isDefault && (
                            <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded">
                              ค่าเริ่มต้น
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 text-[11px] mt-0.5">{addr.address}</p>
                        <p className="text-slate-400 text-[10px] mt-0.5">{addr.details}</p>
                      </div>
                    </div>

                    {addr.isDefault && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Favorites Tab */}
          {activeSubTab === 'favorites' && (
            <div className="space-y-3">
              {favoriteRestaurants.length > 0 ? (
                <div className="space-y-2">
                  {favoriteRestaurants.map(rest => (
                    <div
                      key={rest.id}
                      onClick={() => {
                        setSelectedRestaurant(rest);
                        handleClose();
                      }}
                      className="p-2.5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-400 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rest.logoImage}
                          alt={rest.name}
                          className="w-10 h-10 rounded-xl object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">{rest.name}</h4>
                          <p className="text-[10px] text-slate-500">{rest.category} • {rest.deliveryTimeMinutes} นาที</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-700">สั่งเลย →</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 space-y-1.5">
                  <Heart className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs">ยังไม่มีร้านอาหารโปรด</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
