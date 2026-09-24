import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Headphones, 
  Phone, 
  ShieldCheck, 
  Store, 
  Bike, 
  Shield, 
  Clock, 
  HeartHandshake, 
  ExternalLink,
  ChevronRight,
  CreditCard,
  QrCode
} from 'lucide-react';
import { INITIAL_MERCHANT_ACCOUNTS } from '../data/merchantAuthData';
import { INITIAL_ACTIVE_RIDER } from '../data/riderData';

export const PageFooter: React.FC = () => {
  const { 
    setActiveTab, 
    setActiveMerchant, 
    setSelectedSettlementRestId, 
    setActiveRider,
    triggerToast 
  } = useApp();

  const handleOpenMerchantPOS = () => {
    const kanda = INITIAL_MERCHANT_ACCOUNTS[0];
    if (kanda) {
      setActiveMerchant(kanda);
      setSelectedSettlementRestId(kanda.restaurantId);
    }
    setActiveTab('pos_settlement');
    triggerToast('เปิดระบบร้านค้า', 'เข้าสู่ FoodExpress Merchant POS', 'info');
  };

  const handleOpenRiderHub = () => {
    setActiveRider(INITIAL_ACTIVE_RIDER);
    setActiveTab('rider_hub');
    triggerToast('เปิดระบบไรเดอร์', 'เข้าสู่ FoodExpress Rider Hub', 'info');
  };

  const handleOpenAdminHQ = () => {
    setActiveTab('admin_portal');
    triggerToast('เปิดระบบผู้ดูแล', 'เข้าสู่ FoodExpress Admin HQ', 'info');
  };

  return (
    <footer className="mt-12 bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden text-slate-700">
      {/* 1. Value Proposition Highlights Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-slate-150 bg-slate-50/70 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
        <div className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900">การันตีส่งไวใน 20-30 นาที</h4>
            <p className="text-[11px] text-slate-500">ระบบ AI จับคู่ไรเดอร์ที่ใกล้ร้านที่สุด</p>
          </div>
        </div>

        <div className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900">ประกันอาหารตรงปก 100%</h4>
            <p className="text-[11px] text-slate-500">อาหารหกหรือชำรุด เคลมเงินคืนทันใจ</p>
          </div>
        </div>

        <div className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900">GP เป็นธรรม 0-15%</h4>
            <p className="text-[11px] text-slate-500">สนับสนุนร้านอาหารไทยและไรเดอร์ชุมชน</p>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* 2. Partner Onboarding & Operational Portals Callout */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              ศูนย์บริการพาร์ทเนอร์และระบบปฏิบัติการ
            </span>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              ระบบเชื่อมต่อแบบครบวงจร
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Merchant Card */}
            <button
              type="button"
              id="footer-open-merchant-btn"
              onClick={handleOpenMerchantPOS}
              className="p-3.5 rounded-2xl bg-amber-50/60 hover:bg-amber-100/70 border border-amber-200/90 text-left transition-all active:scale-[0.98] group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                  <Store className="w-4 h-4" />
                </div>
                <ChevronRight className="w-4 h-4 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <h5 className="text-xs font-black text-slate-900 group-hover:text-amber-900">
                เปิดร้านค้า / Merchant POS
              </h5>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                ระบบจัดการออเดอร์หน้าร้าน เมนูอาหาร สรุปบัญชีรายรับแบบเรียลไทม์
              </p>
            </button>

            {/* Rider Card */}
            <button
              type="button"
              id="footer-open-rider-btn"
              onClick={handleOpenRiderHub}
              className="p-3.5 rounded-2xl bg-sky-50/60 hover:bg-sky-100/70 border border-sky-200/90 text-left transition-all active:scale-[0.98] group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
                  <Bike className="w-4 h-4" />
                </div>
                <ChevronRight className="w-4 h-4 text-sky-600 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <h5 className="text-xs font-black text-slate-900 group-hover:text-sky-900">
                ร่วมขับขี่ / Rider Hub
              </h5>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                คิวรับงานอัจฉริยะ GPS นำทาง โหมดฝนตก และถอนเงินวอลเล็ตทันใจ
              </p>
            </button>

            {/* Admin HQ Card */}
            <button
              type="button"
              id="footer-open-admin-btn"
              onClick={handleOpenAdminHQ}
              className="p-3.5 rounded-2xl bg-rose-50/60 hover:bg-rose-100/70 border border-rose-200/90 text-left transition-all active:scale-[0.98] group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                  <Shield className="w-4 h-4" />
                </div>
                <ChevronRight className="w-4 h-4 text-rose-600 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <h5 className="text-xs font-black text-slate-900 group-hover:text-rose-900">
                ศูนย์บัญชาการ / Admin HQ
              </h5>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                ระบบจัดการหลังบ้าน สิทธิ์ 4 ระดับ (RBAC) มอนิเตอร์ไรเดอร์สด
              </p>
            </button>
          </div>
        </div>

        {/* 3. Customer Support & Hotline 24 Hours */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-black text-white">ศูนย์บริการลูกค้า FoodExpress Care (24 ชม.)</h4>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                มีปัญหาเรื่องออเดอร์ อาหารไม่ตรงปก หรือต้องการความช่วยเหลือด่วน ติดต่อเราได้ทันที
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a 
              href="tel:1688"
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>โทรด่วน 1688</span>
            </a>
            <button 
              type="button"
              onClick={() => triggerToast('แชทบริการลูกค้า 💬', 'เจ้าหน้าที่ฝ่ายดูแลลูกค้ากำลังเชื่อมต่อ...', 'info')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              เปิด Live Chat
            </button>
          </div>
        </div>

        {/* 4. Payment Support Badges & Service Areas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
          <div>
            <span className="font-bold text-slate-800 block mb-2">ช่องทางชำระเงินที่ปลอดภัย (PCI-DSS)</span>
            <div className="flex items-center gap-2 flex-wrap text-[11px] font-semibold text-slate-600">
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200 flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-blue-600" />
                PromptPay QR
              </span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                บัตรเครดิต / เดบิต
              </span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200">
                FoodExpress Wallet
              </span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200">
                💵 เงินสดปลายทาง (COD)
              </span>
            </div>
          </div>

          <div>
            <span className="font-bold text-slate-800 block mb-2">พื้นที่ให้บริการครอบคลุม</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              กรุงเทพมหานครและปริมณฑล (ทองหล่อ, เอกมัย, สยาม, อารีย์, บางนา, ลาดพร้าว, ปิ่นเกล้า) พร้อมขยายครอบคลุมเชียงใหม่ ชลบุรี และภูเก็ต
            </p>
          </div>
        </div>

        {/* 5. Copyright & Disclaimer */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-emerald-600">FoodExpress 🛵</span>
            <span>• แพลตฟอร์มสั่งอาหารเดลิเวอรี่มาตรฐานไทย</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hover:underline cursor-pointer">เงื่อนไขการให้บริการ</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">นโยบายความเป็นส่วนตัว</span>
            <span>•</span>
            <span>© 2026 FoodExpress Thailand</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
