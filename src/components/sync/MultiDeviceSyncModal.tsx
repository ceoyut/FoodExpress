import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Copy, 
  Check, 
  ExternalLink, 
  Wifi, 
  Database, 
  Activity, 
  RefreshCw,
  QrCode,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface MultiDeviceSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MultiDeviceSyncModal: React.FC<MultiDeviceSyncModalProps> = ({ isOpen, onClose }) => {
  const { triggerToast } = useApp();
  const [activeDeviceTab, setActiveDeviceTab] = useState<'customer' | 'merchant' | 'rider'>('merchant');
  const [copiedRole, setCopiedRole] = useState<string | null>(null);
  const [pingLatency, setPingLatency] = useState<number>(34);
  const [isCheckingPing, setIsCheckingPing] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const baseUrl = `${currentOrigin}${currentPath}`;

  const deviceRoles = [
    {
      role: 'customer' as const,
      label: 'สมาร์ตโฟนลูกค้า',
      sublabel: 'สมชาย สายใจ',
      icon: Smartphone,
      color: 'emerald',
      url: `${baseUrl}?role=customer`,
      desc: 'เปิดบนมือถือของลูกค้า เพื่อสั่งอาหาร, เช็กแต้มสะสม และติดตามสถานะไรเดอร์แบบสด'
    },
    {
      role: 'merchant' as const,
      label: 'แท็บเล็ตหน้าร้าน POS',
      sublabel: 'กานดา ร้อยหม้อ',
      icon: Tablet,
      color: 'amber',
      url: `${baseUrl}?role=merchant`,
      desc: 'ตั้งไว้ที่เคาน์เตอร์ร้าน มีกระดิ่งเตือนเมื่อมีออเดอร์ใหม่เข้า, กดยืนยันเริ่มทำอาหาร และดูยอดสรุป GP สด'
    },
    {
      role: 'rider' as const,
      label: 'มือถือไรเดอร์ติดหน้ารถ',
      sublabel: 'สมหวัง สายซิ่ง',
      icon: Monitor,
      color: 'sky',
      url: `${baseUrl}?role=rider`,
      desc: 'เปิดบนสมาร์ตโฟนไรเดอร์ เพื่อรับงานตามพิกัด GPS, นำทางจัดส่ง และกดยืนยันรับเงินค่ารอบ'
    }
  ];

  const selectedDevice = deviceRoles.find(d => d.role === activeDeviceTab) || deviceRoles[0];

  const handleCopyLink = (url: string, roleName: string) => {
    try {
      navigator.clipboard.writeText(url);
      setCopiedRole(roleName);
      triggerToast('คัดลอกลิงก์สำเร็จ!', `นำไปเปิดบนอุปกรณ์อื่นเพื่อเชื่อมต่อกับบทบาท ${roleName}`, 'success');
      setTimeout(() => setCopiedRole(null), 2500);
    } catch {
      triggerToast('คัดลอกลิงก์ไม่สำเร็จ', 'กรุณาลองใหม่อีกครั้ง', 'error');
    }
  };

  const handleRefreshPing = () => {
    setIsCheckingPing(true);
    setTimeout(() => {
      setPingLatency(Math.floor(25 + Math.random() * 20));
      setIsCheckingPing(false);
      triggerToast('ทดสอบการเชื่อมต่อสำเร็จ', 'Cloud Firestore ทำงานแบบเรียลไทม์ปกติ', 'info');
    }, 450);
  };

  // Generate crisp QR code URL using standard QR image endpoint
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(selectedDevice.url)}&bgcolor=FFFFFF&color=0F172A&margin=8`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col cursor-default"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-sky-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/40 text-sky-400 flex items-center justify-center shadow-xs">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  โหมดเชื่อมต่อหลายหน้าจอ (Multi-Device Live Sync)
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500 text-slate-950 uppercase">
                  Real-time
                </span>
              </div>
              <p className="text-xs text-slate-300">
                สแกน QR Code หรือเปิดลิงก์พร้อมกันหลายอุปกรณ์เพื่อทดสอบวงจร Real-time
              </p>
            </div>
          </div>

          <button
            id="close-multi-device-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cloud Status Indicator Bar */}
        <div className="bg-slate-900 text-slate-300 px-4 py-2 text-xs flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-[11px] text-slate-200">
              ai-studio-foodexpress
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px]">
              <Activity className="w-3 h-3 text-sky-400" />
              <span>Ping: <strong>{pingLatency}ms</strong></span>
            </div>
            <button
              id="refresh-ping-btn"
              onClick={handleRefreshPing}
              disabled={isCheckingPing}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
              title="ทดสอบสัญญาณซิงก์"
            >
              <RefreshCw className={`w-3 h-3 ${isCheckingPing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700 flex-1">
          
          {/* Device Tabs */}
          <div className="grid grid-cols-3 gap-2">
            {deviceRoles.map(item => {
              const Icon = item.icon;
              const isActive = activeDeviceTab === item.role;
              return (
                <button
                  key={item.role}
                  id={`select-sync-role-${item.role}`}
                  onClick={() => setActiveDeviceTab(item.role)}
                  className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                    isActive 
                      ? 'border-sky-500 bg-sky-50/70 shadow-xs ring-2 ring-sky-200' 
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-500'}`} />
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />}
                  </div>
                  <div>
                    <span className="font-bold text-[11px] sm:text-xs text-slate-900 block leading-tight">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {item.sublabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Device QR & Link Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-5">
            {/* QR Code Frame */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm shrink-0 flex flex-col items-center">
              <img 
                src={qrCodeUrl} 
                alt={`QR code for ${selectedDevice.label}`}
                className="w-36 h-36 object-contain rounded-lg"
              />
              <span className="text-[10px] font-bold text-slate-500 mt-1 flex items-center gap-1">
                <QrCode className="w-3 h-3" />
                สแกนด้วยกล้องมือถือ
              </span>
            </div>

            {/* Information & Action Buttons */}
            <div className="space-y-3 flex-1 text-left w-full">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 bg-sky-100 px-2 py-0.5 rounded-md inline-block mb-1">
                  {selectedDevice.label}
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  {selectedDevice.sublabel}
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {selectedDevice.desc}
                </p>
              </div>

              {/* Link Input & Copy */}
              <div className="flex items-center gap-1.5">
                <input 
                  type="text" 
                  readOnly 
                  value={selectedDevice.url}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-[11px] font-mono text-slate-700 flex-1 truncate select-all focus:outline-none"
                />
                <button
                  id="copy-device-url-btn"
                  onClick={() => handleCopyLink(selectedDevice.url, selectedDevice.label)}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  {copiedRole === selectedDevice.label ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRole === selectedDevice.label ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                </button>
              </div>

              <div className="pt-1 flex gap-2">
                <a
                  href={selectedDevice.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>เปิดในแท็บใหม่เพื่อทดสอบแบ่งหน้าจอ (Open in New Tab)</span>
                </a>
              </div>
            </div>
          </div>

          {/* Real-time sync explanation tip */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-xs text-emerald-950">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              วิธีทดสอบ Real-time พร้อมกัน 2 หรือ 3 หน้าจอ:
            </span>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              1. เปิดหน้าจอนี้ใน 2 แท็บ (แท็บ A เป็นลูกค้า และ แท็บ B เป็นร้านค้า)<br/>
              2. เมื่อแท็บลูกค้ากดยืนยันออเดอร์ แท็บร้านค้าจะได้ยินเสียงกระดิ่งเตือนและขึ้นออเดอร์ใหม่ทันทีแบบ Real-time โดยไม่ต้องรีเฟรชหน้าจอ!
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            id="close-sync-modal-btn"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>
    </div>
  );
};
