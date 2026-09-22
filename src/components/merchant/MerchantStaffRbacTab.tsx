import React from 'react';
import { 
  ShieldCheck, 
  Crown, 
  ChefHat, 
  UserCheck, 
  Check, 
  X, 
  AlertTriangle, 
  Lock, 
  Building2, 
  DollarSign, 
  UtensilsCrossed, 
  Receipt, 
  Settings, 
  Users, 
  FileText,
  BadgeAlert,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MerchantStaffRole } from '../../types';

interface PermissionRow {
  systemName: string;
  description: string;
  category: string;
  owner: boolean;
  manager: boolean;
  kitchen: boolean;
}

const PERMISSIONS_MATRIX: PermissionRow[] = [
  {
    category: 'ระบบจัดการออเดอร์ & ครัว (Kitchen POS)',
    systemName: 'รับ/ปฏิเสธคำสั่งซื้อ & แจ้งเตือนออเดอร์เข้า',
    description: 'กดยืนยันออเดอร์ ดูรายการอาหาร และพิมพ์ใบเข้าครัว',
    owner: true,
    manager: true,
    kitchen: true,
  },
  {
    category: 'ระบบจัดการออเดอร์ & ครัว (Kitchen POS)',
    systemName: 'ปรับสถานะการปรุงอาหาร (Preparing ➔ Ready)',
    description: 'ส่งสัญญาณให้ระบบเรียกรถไรเดอร์มารับอาหารตาม SLA',
    owner: true,
    manager: true,
    kitchen: true,
  },
  {
    category: 'ระบบจัดการออเดอร์ & ครัว (Kitchen POS)',
    systemName: 'ดูข้อมูลและพิกัด GPS ไรเดอร์ที่มารับงาน',
    description: 'ตรวจสอบชื่อ เบอร์โทร ทะเบียนรถ และตำแหน่งสดของไรเดอร์',
    owner: true,
    manager: true,
    kitchen: true,
  },
  {
    category: 'ระบบจัดการเมนู & สต็อก (Menu & Stock)',
    systemName: 'เปิด/ปิด เมนูเมื่อของหมดชั่วคราว (Out of Stock)',
    description: 'กดสลับสถานะอาหารหมดทันทีเมื่อวัตถุดิบในครัวหมด',
    owner: true,
    manager: true,
    kitchen: true,
  },
  {
    category: 'ระบบจัดการเมนู & สต็อก (Menu & Stock)',
    systemName: 'แก้ไขราคา คำบรรยาย และรูปภาพอาหาร',
    description: 'ปรับราคาขาย ราคาโปรโมชั่น และรายละเอียดสูตรอาหาร',
    owner: true,
    manager: true,
    kitchen: false,
  },
  {
    category: 'ระบบจัดการเมนู & สต็อก (Menu & Stock)',
    systemName: 'เพิ่มเมนูใหม่ และลบเมนูออกจากร้าน',
    description: 'สร้างรายการอาหารใหม่ กำหนดตัวเลือกเสริม ท็อปปิ้ง',
    owner: true,
    manager: true,
    kitchen: false,
  },
  {
    category: 'การเงิน บัญชี และยอดโอน (Financial & Settlement)',
    systemName: 'ดูสรุปยอดขายรายวัน (Gross Sales)',
    description: 'ดูยอดขายรวมและจำนวนออเดอร์ที่ขายได้ประจำวัน',
    owner: true,
    manager: true,
    kitchen: false,
  },
  {
    category: 'การเงิน บัญชี และยอดโอน (Financial & Settlement)',
    systemName: 'ดูการหักค่า GP, VAT 7%, WHT 3% และยอดเงินโอนสุทธิ',
    description: 'ตรวจสอบรายงานสรุป EOD Settlement และเงินโอนเข้าธนาคาร',
    owner: true,
    manager: false,
    kitchen: false,
  },
  {
    category: 'การเงิน บัญชี และยอดโอน (Financial & Settlement)',
    systemName: 'แก้ไขข้อมูลบัญชีธนาคารสำหรับรับเงินโอน (Bank Payout)',
    description: 'เปลี่ยนเลขที่บัญชีธนาคาร พร้อมเพย์นิติบุคคล และชื่อผู้รับเงิน',
    owner: true,
    manager: false,
    kitchen: false,
  },
  {
    category: 'สัญญาและความปลอดภัย (Contracts & Admin)',
    systemName: 'จัดการสัญญา GP อัตราค่าบริการ และสิทธิ์พนักงาน',
    description: 'ยอมรับเงื่อนไขสัญญาแพลตฟอร์ม และเพิ่ม/ลดสิทธิ์พนักงานในร้าน',
    owner: true,
    manager: false,
    kitchen: false,
  },
];

export const MerchantStaffRbacTab: React.FC = () => {
  const { merchantStaffRole, setMerchantStaffRole, triggerToast } = useApp();

  return (
    <div className="space-y-4">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 border border-indigo-500/30 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  ระบบกำหนดสิทธิ์การเข้าถึงร้านค้า (Role-Based Access Control)
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500 text-white">
                  RBAC Matrix
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-1">
                การแบ่งสิทธิ์ 3 ระดับสำหรับร้านกานดา ร้อยหม้อ เพื่อความปลอดภัยทางการเงินและความคล่องตัวในครัว
              </p>
            </div>
          </div>

          {/* Current Active Badge */}
          <div className="px-3.5 py-2 rounded-2xl bg-white/10 border border-white/15 text-xs font-bold flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>สิทธิ์ที่ใช้งานอยู่: </span>
            <strong className="text-amber-300">
              {merchantStaffRole === 'owner' && '👑 เจ้าของร้าน (Owner)'}
              {merchantStaffRole === 'manager' && '👔 ผู้จัดการ (Manager)'}
              {merchantStaffRole === 'kitchen' && '🍳 พนักงานครัว (Kitchen)'}
            </strong>
          </div>
        </div>

        {/* Role Selector Controls */}
        <div className="mt-4 pt-3.5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            onClick={() => {
              setMerchantStaffRole('owner');
              triggerToast('สิทธิ์: เจ้าของร้าน (Owner)', 'เข้าถึงได้ 100% ทุกระบบ รวมถึงบัญชีธนาคารและยอดเงินโอน', 'success');
            }}
            className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
              merchantStaffRole === 'owner'
                ? 'bg-amber-500/20 border-amber-400 text-white shadow-xs'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs flex items-center gap-1.5 text-amber-300">
                <Crown className="w-4 h-4" />
                เจ้าของร้าน (Owner)
              </span>
              {merchantStaffRole === 'owner' && (
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950">
                  เลือกอยู่
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              สิทธิ์สูงสุด: ดูยอดเงินโอนสุทธิ, สัญญา GP, แก้ไขบัญชีธนาคาร, เมนูอาหาร
            </p>
          </button>

          <button
            onClick={() => {
              setMerchantStaffRole('manager');
              triggerToast('สิทธิ์: ผู้จัดการร้าน (Manager)', 'สามารถจัดการเมนู ออเดอร์ และดูยอดขายได้ แต่ไม่เห็นบัญชีเงินโอน', 'info');
            }}
            className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
              merchantStaffRole === 'manager'
                ? 'bg-sky-500/20 border-sky-400 text-white shadow-xs'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs flex items-center gap-1.5 text-sky-300">
                <UserCheck className="w-4 h-4" />
                ผู้จัดการร้าน (Store Manager)
              </span>
              {merchantStaffRole === 'manager' && (
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-sky-400 text-slate-950">
                  เลือกอยู่
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              สิทธิ์บริหาร: จัดการเมนู, เพิ่มอาหาร, แก้ไขราคา, จัดการออเดอร์ (ไม่เห็นบัญชีธนาคาร)
            </p>
          </button>

          <button
            onClick={() => {
              setMerchantStaffRole('kitchen');
              triggerToast('สิทธิ์: พนักงานครัว (Kitchen Staff)', 'เข้าถึงเฉพาะหน้าจอรับออเดอร์และกดปิดเมนูของหมดชั่วคราว', 'info');
            }}
            className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
              merchantStaffRole === 'kitchen'
                ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-xs'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs flex items-center gap-1.5 text-emerald-300">
                <ChefHat className="w-4 h-4" />
                พนักงานครัว (Kitchen Staff)
              </span>
              {merchantStaffRole === 'kitchen' && (
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-400 text-slate-950">
                  เลือกอยู่
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              สิทธิ์หน้างาน: รับออเดอร์, อัปเดตสถานะทำอาหาร, สลับของหมดชั่วคราว (ไม่เห็นยอดเงินใดๆ)
            </p>
          </button>
        </div>
      </div>

      {/* 2. Full Permissions Matrix Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900">
              ตารางสิทธิ์การเข้าถึงแต่ละระบบ (System Access Matrix)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              เปรียบเทียบสิทธิ์ตามมาตรฐานของระบบบริหารจัดการร้านอาหารเดลิเวอรี
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            10 ระบบหลัก
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-4 w-1/2">ระบบงานและฟังก์ชัน</th>
                <th className="py-3 px-3 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-amber-700">👑 เจ้าของร้าน</span>
                    <span className="text-[10px] text-slate-400 font-normal">Owner</span>
                  </div>
                </th>
                <th className="py-3 px-3 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-sky-700">👔 ผู้จัดการ</span>
                    <span className="text-[10px] text-slate-400 font-normal">Manager</span>
                  </div>
                </th>
                <th className="py-3 px-3 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-emerald-700">🍳 พนักงานครัว</span>
                    <span className="text-[10px] text-slate-400 font-normal">Kitchen</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PERMISSIONS_MATRIX.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{row.systemName}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{row.description}</div>
                    <span className="inline-block mt-1 text-[9px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {row.category}
                    </span>
                  </td>
                  
                  {/* Owner Column */}
                  <td className="py-3 px-3 text-center">
                    {row.owner ? (
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center font-bold">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-300 mx-auto flex items-center justify-center">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>

                  {/* Manager Column */}
                  <td className="py-3 px-3 text-center">
                    {row.manager ? (
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center font-bold">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-rose-50 text-rose-400 mx-auto flex items-center justify-center" title="ไม่มีสิทธิ์เข้าถึง">
                        <Lock className="w-3 h-3" />
                      </span>
                    )}
                  </td>

                  {/* Kitchen Column */}
                  <td className="py-3 px-3 text-center">
                    {row.kitchen ? (
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center font-bold">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-rose-50 text-rose-400 mx-auto flex items-center justify-center" title="ไม่มีสิทธิ์เข้าถึง">
                        <Lock className="w-3 h-3" />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Staff Members Directory of Kanda Roi Mor */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-600" />
          รายชื่อพนักงานร้าน "กานดา ร้อยหม้อ" ที่ผูกกับระบบ
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
              ก
            </div>
            <div>
              <div className="font-bold text-slate-900 text-xs">คุณกานดา ร้อยหม้อ</div>
              <div className="text-[10px] text-amber-700 font-semibold">เจ้าของร้าน (Owner)</div>
              <div className="text-[10px] text-slate-400">086-455-8822</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
              ส
            </div>
            <div>
              <div className="font-bold text-slate-900 text-xs">คุณสมบูรณ์ จันทร์เพ็ญ</div>
              <div className="text-[10px] text-sky-700 font-semibold">ผู้จัดการร้าน (Store Manager)</div>
              <div className="text-[10px] text-slate-400">081-332-9011</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              ค
            </div>
            <div>
              <div className="font-bold text-slate-900 text-xs">พี่สมควร ใจดี</div>
              <div className="text-[10px] text-emerald-700 font-semibold">หัวหน้าครัวต้มยำ (Kitchen Head)</div>
              <div className="text-[10px] text-slate-400">แท็บเล็ตครัว 01</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
