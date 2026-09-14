import React, { useState } from 'react';
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
  Heart 
} from 'lucide-react';
import { RESTAURANTS_DATA } from '../data/mockData';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { 
    user, 
    loginAs, 
    resetAllData, 
    setSelectedRestaurant, 
    setActiveTab, 
    triggerToast 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'addresses' | 'favorites'>('profile');
  const [newAddressInput, setNewAddressInput] = useState('');

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
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col animate-in slide-in-from-bottom-5 text-slate-800">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-150 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-slate-900">{user.name}</h3>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded-full">
                  {user.tier}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">{user.email}</p>
            </div>
          </div>

          <button
            id="close-auth-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/80 text-slate-700 flex items-center justify-center hover:bg-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Subtabs */}
        <div className="flex border-b border-slate-200 px-3 bg-white">
          <button
            id="auth-subtab-profile-btn"
            onClick={() => setActiveSubTab('profile')}
            className={`flex-1 py-2.5 text-center font-bold text-xs border-b-2 transition-all ${
              activeSubTab === 'profile'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            โซเชียลล็อกอิน
          </button>

          <button
            id="auth-subtab-addresses-btn"
            onClick={() => setActiveSubTab('addresses')}
            className={`flex-1 py-2.5 text-center font-bold text-xs border-b-2 transition-all ${
              activeSubTab === 'addresses'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            ที่อยู่จัดส่ง ({user.savedAddresses.length})
          </button>

          <button
            id="auth-subtab-favorites-btn"
            onClick={() => setActiveSubTab('favorites')}
            className={`flex-1 py-2.5 text-center font-bold text-xs border-b-2 transition-all ${
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
          
          {/* Social Login Tab */}
          {activeSubTab === 'profile' && (
            <div className="space-y-4">
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
              <div className="pt-3 border-t border-slate-100">
                <button
                  id="reset-demo-data-btn"
                  onClick={resetAllData}
                  className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>รีเซ็ตข้อมูลตัวอย่างกลับเป็นค่าเริ่มต้น (Reset Demo Data)</span>
                </button>
              </div>
            </div>
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
                        onClose();
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
