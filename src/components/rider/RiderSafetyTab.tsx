import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  AlertTriangle, 
  PhoneCall, 
  Clock, 
  FileText, 
  Camera, 
  CheckCircle2, 
  HeartHandshake, 
  CloudRain, 
  Navigation, 
  Send, 
  ChevronRight,
  Sparkles,
  HelpCircle,
  XCircle,
  Radio
} from 'lucide-react';

interface IncidentReportItem {
  id: string;
  type: string;
  title: string;
  orderNumber: string;
  reportedAt: string;
  status: 'reviewing' | 'resolved' | 'compensated';
  compensationAmount?: number;
  note: string;
}

export const RiderSafetyTab: React.FC = () => {
  const { activeRider, triggerToast } = useApp();

  const [selectedIncidentType, setSelectedIncidentType] = useState<string>('customer_unreachable');
  const [orderNumberInput, setOrderNumberInput] = useState<string>('ORD-2026-9812');
  const [descriptionInput, setDescriptionInput] = useState<string>('');
  const [isWaitTimerActive, setIsWaitTimerActive] = useState<boolean>(false);
  const [waitTimerSeconds, setWaitTimerSeconds] = useState<number>(600); // 10 minutes
  const [incidentHistory, setIncidentHistory] = useState<IncidentReportItem[]>([
    {
      id: 'INC-8819',
      type: 'restaurant_delay',
      title: 'ร้านทำอาหารช้าเกิน 15 นาที',
      orderNumber: 'ORD-2026-9720',
      reportedAt: 'เมื่อวานนี้ 18:42 น.',
      status: 'compensated',
      compensationAmount: 20,
      note: 'ระบบอนุมัติเงินชดเชยค่ารอ ฿20 โอนเข้า Cash Wallet เรียบร้อยแล้ว'
    },
    {
      id: 'INC-8742',
      type: 'customer_unreachable',
      title: 'ลูกค้าไม่รับสายเกิน 10 นาที',
      orderNumber: 'ORD-2026-9650',
      reportedAt: '10 ก.ย. 13:15 น.',
      status: 'resolved',
      note: 'ศูนย์ประสานงานปิดงานให้ ไรเดอร์นำอาหารกลับได้โดยไม่เสียคะแนนรับงาน'
    }
  ]);

  // Handle countdown timer for unreachable customer
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWaitTimerActive && waitTimerSeconds > 0) {
      interval = setInterval(() => {
        setWaitTimerSeconds(prev => {
          if (prev <= 1) {
            setIsWaitTimerActive(false);
            triggerToast(
              'ครบเวลารอ 10 นาทีแล้ว ⏱️',
              'ระบบอนุญาตให้กดยกเลิกงานและรับค่ารอบเต็มจำนวนได้ทันที',
              'success'
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWaitTimerActive, waitTimerSeconds, triggerToast]);

  const handleStartWaitTimer = () => {
    setIsWaitTimerActive(true);
    setWaitTimerSeconds(600);
    triggerToast(
      'เริ่มนับเวลารอ 10 นาที ⏱️',
      'หากครบกำหนดและติดต่อลูกค้าไม่ได้ สามารถขอยกเลิกงานพร้อมรับค่ารอบเต็มจำนวนได้ทันที',
      'info'
    );
  };

  const handleSubmitIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descriptionInput.trim()) {
      triggerToast('กรุณาระบุรายละเอียด', 'โปรดระบุรายละเอียดปัญหาที่พบเพื่อความรวดเร็วในการช่วยเหลือ', 'warning');
      return;
    }

    const typeLabels: Record<string, string> = {
      customer_unreachable: 'ลูกค้าไม่รับสาย / ติดต่อไม่ได้เกิน 10 นาที',
      restaurant_delay: 'ร้านค้าทำอาหารช้าผิดปกติ (>15 นาที)',
      damaged_food: 'อาหารเสียหายหรือหกเลอะระหว่างทาง',
      vehicle_breakdown: 'อุบัติเหตุ / รถจักรยานยนต์ขัดข้อง',
      wrong_address: 'พิกัดหมุดไม่ตรงกับที่อยู่จริง'
    };

    const newIncident: IncidentReportItem = {
      id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
      type: selectedIncidentType,
      title: typeLabels[selectedIncidentType] || 'ปัญหาหน้างาน',
      orderNumber: orderNumberInput || 'ORD-LIVE',
      reportedAt: 'เมื่อสักครู่',
      status: selectedIncidentType === 'restaurant_delay' ? 'compensated' : 'reviewing',
      compensationAmount: selectedIncidentType === 'restaurant_delay' ? 20 : undefined,
      note: selectedIncidentType === 'restaurant_delay' 
        ? 'ตรวจพบเวลารอที่ร้าน 18 นาที ได้รับเงินชดเชยค่ารอ ฿20 โอนเข้า Cash Wallet ทันที'
        : 'ศูนย์ช่วยเหลือฉุกเฉินรับเรื่องแล้ว เจ้าหน้าที่กำลังตรวจสอบข้อมูล'
    };

    setIncidentHistory([newIncident, ...incidentHistory]);
    setDescriptionInput('');
    triggerToast(
      'ส่งรายงานปัญหาสำเร็จ! 🚨',
      'เจ้าหน้าที่ Dispatch Support กำลังตรวจสอบข้อมูลและจะดูแลคุณทันที',
      'success'
    );
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6">
      {/* 1. SOS EMERGENCY CALL BANNER */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 rounded-3xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black tracking-wider uppercase backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>Rider Safety First • ช่วยเหลือฉุกเฉิน 24 ชม.</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              ศูนย์ความปลอดภัย & ปุ่มแจ้งเหตุฉุกเฉิน (SOS)
            </h2>
            <p className="text-xs sm:text-sm text-rose-100 leading-relaxed">
              เมื่อเกิดอุบัติเหตุหรือเหตุด่วนระหว่างปฏิบัติหน้าที่ กดปุ่มด้านล่างเพื่อติดต่อสายด่วนทันที หรือแจ้งพิกัดตำแหน่งสดให้ศูนย์ประสานงานเข้าช่วยเหลือ
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              id="rider-sos-call-btn"
              href="tel:191"
              className="px-5 py-3 rounded-2xl bg-white text-red-600 font-black text-sm flex items-center gap-2.5 shadow-md hover:bg-rose-50 transition-transform active:scale-95 cursor-pointer"
            >
              <PhoneCall className="w-5 h-5 text-red-600 animate-bounce" />
              <span>โทรแจ้งเหตุด่วน 191</span>
            </a>

            <a
              id="rider-hotline-call-btn"
              href="tel:029998888"
              className="px-4 py-3 rounded-2xl bg-black/30 hover:bg-black/40 text-white font-bold text-xs flex items-center gap-2 border border-white/20 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>สายด่วน FoodExpress (02-999-8888)</span>
            </a>
          </div>
        </div>

        {/* Background accent ring */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
      </div>

      {/* 2. ACTIVE ACCIDENT INSURANCE CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900">
                  กรมธรรม์ประกันอุบัติเหตุกลุ่มคุ้มครองไรเดอร์ (FoodExpress Shield)
                </h3>
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  คุ้มครองอยู่ (Active)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                ผู้เอาประกัน: <strong>{activeRider.name}</strong> • เลขทะเบียนรถ: <strong>{activeRider.licensePlate}</strong>
              </p>
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="text-slate-400">เลขที่กรมธรรม์:</span>{' '}
            <strong className="font-mono text-slate-800">FE-INS-2026-99218</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block mb-1">🏥 ค่ารักษาพยาบาลจากอุบัติเหตุ</span>
            <span className="text-base font-black text-emerald-700">สูงสุด ฿50,000</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">ต่อครั้ง ไม่จำกัดจำนวนครั้ง/ปี</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block mb-1">🕊️ คุ้มครองกรณีเสียชีวิต / ทุพพลภาพ</span>
            <span className="text-base font-black text-slate-900">฿200,000</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">จ่ายให้ทายาทหรือผู้รับผลประโยชน์</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 block mb-1">🌧️ ชดเชยรายได้รายวันระหว่างรักษา</span>
            <span className="text-base font-black text-blue-700">฿500 / วัน</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">สูงสุด 30 วัน เมื่อมีใบรับรองแพทย์</span>
          </div>
        </div>
      </div>

      {/* 3. FAST INCIDENT REPORTING & LIVE ASSISTANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Report an Issue */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-black text-slate-900">
                แจ้งปัญหาหน้างานด่วน (Fast Incident Report)
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              รับเรื่อง & แก้ไขภายใน 3 นาที
            </span>
          </div>

          {/* Quick Problem Select Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              เลือกประเภทปัญหาที่กำลังพบเจอ:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedIncidentType('customer_unreachable')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  selectedIncidentType === 'customer_unreachable'
                    ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold">ลูกค้าไม่รับสาย / รอเกิน 10 นาที</span>
                  <span className="text-[10px] text-slate-500 font-normal">เปิดนับเวลารอรับเงินชดเชย</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedIncidentType('restaurant_delay')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  selectedIncidentType === 'restaurant_delay'
                    ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Clock className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold">ร้านอาหารทำช้าเกิน 15 นาที</span>
                  <span className="text-[10px] text-slate-500 font-normal">รับค่าชดเชยการรอ +฿20</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedIncidentType('damaged_food')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  selectedIncidentType === 'damaged_food'
                    ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold">อาหารเสียหาย / หกเลอะ</span>
                  <span className="text-[10px] text-slate-500 font-normal">เคลมประกันอาหารโดยไม่ถูกหักเงิน</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedIncidentType('vehicle_breakdown')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  selectedIncidentType === 'vehicle_breakdown'
                    ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold">อุบัติเหตุ / รถเสียระหว่างทาง</span>
                  <span className="text-[10px] text-slate-500 font-normal">ส่งไรเดอร์เสริมมารับช่วงต่อ</span>
                </div>
              </button>
            </div>
          </div>

          {/* Customer Unreachable Live Countdown Helper */}
          {selectedIncidentType === 'customer_unreachable' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>ตัวช่วยจับเวลารอลูกค้า (มาตรฐาน 10 นาที)</span>
                </span>
                <span className="font-black text-amber-800 text-sm font-mono bg-white px-2.5 py-0.5 rounded-lg border border-amber-300">
                  {formatTimer(waitTimerSeconds)}
                </span>
              </div>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                ตามข้อกำหนดมาตรฐาน: ไรเดอร์โทรติดต่ออย่างน้อย 3 ครั้ง หากครบ 10 นาทียังติดต่อไม่ได้ ระบบจะอนุมัติให้จบงานได้โดยไม่เสียคะแนน และไรเดอร์จะได้รับค่ารอบเต็มจำนวน
              </p>
              {!isWaitTimerActive ? (
                <button
                  type="button"
                  onClick={handleStartWaitTimer}
                  className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  ⏱️ เริ่มจับเวลารอ 10 นาที
                </button>
              ) : (
                <div className="text-center text-[11px] font-bold text-emerald-700 bg-emerald-50 py-1.5 rounded-lg border border-emerald-200">
                  กำลังจับเวลารอ... หากครบกำหนดสามารถกดยกเลิกงานได้ทันที
                </div>
              )}
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmitIncident} className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  หมายเลขออเดอร์ที่เกี่ยวข้อง:
                </label>
                <input
                  type="text"
                  value={orderNumberInput}
                  onChange={e => setOrderNumberInput(e.target.value)}
                  placeholder="เช่น ORD-2026-9812"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-emerald-500 text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  แนบภาพถ่ายหน้างาน (ถ้ามี):
                </label>
                <button
                  type="button"
                  onClick={() => triggerToast('เปิดกล้องถ่ายภาพ', 'จำลองการถ่ายภาพหลักฐานหน้างานเรียบร้อยแล้ว 📸', 'info')}
                  className="w-full px-3 py-2 rounded-xl border border-dashed border-slate-300 hover:bg-slate-50 text-slate-600 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-slate-500" />
                  <span>ถ่ายภาพหลักฐาน (กล้อง/รูป)</span>
                </button>
              </div>
            </div>

            <div className="text-xs">
              <label className="font-bold text-slate-700 block mb-1">
                รายละเอียดเพิ่มเติม:
              </label>
              <textarea
                value={descriptionInput}
                onChange={e => setDescriptionInput(e.target.value)}
                rows={2}
                placeholder="อธิบายเหตุการณ์ เช่น ลูกค้าปิดเครื่อง, ร้านแจ้งออเดอร์ตกหล่น, รถยางแบนที่แยกพระโขนง..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-emerald-500 text-xs resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>ส่งรายงานปัญหาให้ศูนย์ช่วยเหลือทันที</span>
            </button>
          </form>
        </div>

        {/* Right: Incident History & Resolution */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>ประวัติการแจ้งปัญหาและการชดเชย</span>
              </h3>
              <span className="text-[10px] text-slate-400">
                {incidentHistory.length} รายการ
              </span>
            </div>

            <div className="space-y-2.5">
              {incidentHistory.map(inc => (
                <div key={inc.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1.5 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-extrabold text-slate-900 block">
                        {inc.title}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {inc.id} • {inc.orderNumber}
                      </span>
                    </div>

                    {inc.status === 'compensated' && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] shrink-0">
                        +฿{inc.compensationAmount} ชดเชยแล้ว
                      </span>
                    )}

                    {inc.status === 'resolved' && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-extrabold text-[10px] shrink-0">
                        คลี่คลายแล้ว
                      </span>
                    )}

                    {inc.status === 'reviewing' && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[10px] shrink-0">
                        กำลังตรวจสอบ
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed bg-white p-2 rounded-lg border border-slate-100">
                    {inc.note}
                  </p>
                  <div className="text-[10px] text-slate-400 text-right">
                    {inc.reportedAt}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Weather & Road Alert */}
          <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-100 text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-sky-900 font-bold">
              <CloudRain className="w-4 h-4 text-sky-600" />
              <span>เรดาร์สภาพอากาศ & การจราจรเรียลไทม์</span>
            </div>
            <p className="text-sky-800 text-[11px] leading-relaxed">
              โซนสุขุมวิท-อโศก: ฝนตกปรอยๆ ถนนลื่น กรุณาลดความเร็วและสวมเสื้อกันฝน FoodExpress ทางระบบเปิดโหมด <strong>Rain Surcharge +฿15/รอบ</strong> ให้โดยอัตโนมัติ 🌧️
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
