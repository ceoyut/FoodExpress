import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, 
  Phone, 
  MessageSquare, 
  Star, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Send, 
  X, 
  Navigation,
  Play,
  Pause,
  FastForward,
  RotateCcw,
  Compass,
  Radio,
  MapPin,
  Sliders,
  ChevronRight,
  Volume2,
  VolumeX,
  Store,
  Utensils,
  Bike,
  PackageCheck
} from 'lucide-react';
import { OrderStatus } from '../types';

interface LiveTrackingModalProps {
  onClose: () => void;
}

export const LiveTrackingModal: React.FC<LiveTrackingModalProps> = ({ onClose }) => {
  const { 
    activeOrder, 
    speedUpTracking, 
    updateOrderProgress,
    simulationSpeed, 
    setSimulationSpeed, 
    chatMessages, 
    sendRiderMessage,
    cancelActiveOrder,
    setIsReviewModalOpen,
    setReviewingOrder 
  } = useApp();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Live GPS Simulation Controls
  const [isAutoSimulating, setIsAutoSimulating] = useState(true);
  const [simSpeedMultiplier, setSimSpeedMultiplier] = useState<1 | 2 | 4>(1);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState(36);
  const [liveGpsCoords, setLiveGpsCoords] = useState({ lat: 13.7382, lon: 100.5615 });

  // SVG Path Reference for accurate geometry and point calculation
  const pathRef = useRef<SVGPathElement | null>(null);
  const [riderCoords, setRiderCoords] = useState<{ x: number; y: number; angle: number }>({
    x: 50,
    y: 50,
    angle: 0
  });

  if (!activeOrder) return null;

  // Visual Route Definition across Bangkok streets:
  // Start: (50, 50) [Restaurant at Asoke Montri]
  // -> Turn Asoke junction: (95, 50)
  // -> Enter Sukhumvit Road: (140, 72)
  // -> Cross canal bridge: (185, 115)
  // -> Turn into Soi Sukhumvit 23: (245, 125)
  // -> Through neighborhood: (290, 150)
  // -> Customer Destination: (350, 195)
  const routePathD = "M 50 50 L 95 50 Q 125 50 140 72 L 160 100 Q 175 120 205 122 L 245 125 Q 275 126 290 150 L 315 180 Q 328 195 350 195";

  const isDelivered = activeOrder.status === 'delivered';
  const pct = Math.min(100, Math.max(0, activeOrder.riderProgressPct));

  // Audio feedback helper (Web Audio API synthetics)
  const playBeep = (freq: number = 880, duration: number = 0.15) => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Safe fallback if audio context is blocked
    }
  };

  // Synchronize Rider Coordinates along the exact SVG Curve
  useEffect(() => {
    if (!pathRef.current) return;
    try {
      const totalLength = pathRef.current.getTotalLength();
      if (totalLength <= 0) return;

      const currentDist = (pct / 100) * totalLength;
      const pt = pathRef.current.getPointAtLength(currentDist);

      // Sample ahead point to determine orientation / bearing angle
      const sampleDist = Math.min(totalLength, currentDist + 3);
      const aheadPt = pathRef.current.getPointAtLength(sampleDist);
      const angle = Math.atan2(aheadPt.y - pt.y, aheadPt.x - pt.x) * (180 / Math.PI);

      setRiderCoords({ x: pt.x, y: pt.y, angle });

      // Calculate realistic simulated GPS Lat/Lon based on Bangkok baseline (Sukhumvit-Asoke area)
      const baseLat = 13.7380;
      const baseLon = 100.5600;
      const latOffset = (pt.y - 50) * 0.000045;
      const lonOffset = (pt.x - 50) * 0.000055;
      setLiveGpsCoords({
        lat: Number((baseLat - latOffset).toFixed(5)),
        lon: Number((baseLon + lonOffset).toFixed(5)),
      });

      // Fluctuate speed based on progress
      if (pct <= 5 || pct >= 100) {
        setCurrentSpeedKmh(0);
      } else if (pct > 25 && pct < 45) {
        setCurrentSpeedKmh(22 + Math.floor(Math.random() * 8)); // junction slowdown
      } else {
        setCurrentSpeedKmh(34 + Math.floor(Math.random() * 10)); // cruise speed
      }
    } catch {
      // safe fallback
    }
  }, [pct]);

  // Real-time GPS movement simulation loop
  useEffect(() => {
    if (!isAutoSimulating || isDelivered || activeOrder.status === 'cancelled') {
      return;
    }

    const intervalMs = 900;
    const timer = setInterval(() => {
      // Step increment based on multiplier (approx +1.8% to +3.5% per step)
      const step = (1.5 + Math.random() * 1.2) * simSpeedMultiplier;
      const nextPct = Math.min(100, pct + step);

      // Determine appropriate status milestone
      let nextStatus: OrderStatus = activeOrder.status;
      if (nextPct >= 100) {
        nextStatus = 'delivered';
        playBeep(1046, 0.4); // high C celebration ping
      } else if (nextPct >= 60) {
        nextStatus = 'delivering';
      } else if (nextPct >= 40) {
        nextStatus = 'rider_assigned';
      } else if (nextPct >= 20) {
        nextStatus = 'preparing';
      } else {
        nextStatus = 'confirmed';
      }

      updateOrderProgress(nextPct, nextStatus);

      if (nextPct >= 100) {
        setIsAutoSimulating(false);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isAutoSimulating, isDelivered, pct, simSpeedMultiplier, activeOrder.status, updateOrderProgress]);

  // 5 Real-time Order Status Steps
  const steps = [
    { key: 'confirmed', label: 'รับคำสั่งซื้อ', sub: 'ร้านค้ายืนยัน', icon: Store, minPct: 0 },
    { key: 'preparing', label: 'กำลังปรุง', sub: 'เชฟแพ็คอาหาร', icon: Utensils, minPct: 20 },
    { key: 'rider_assigned', label: 'ตรวจรับอาหาร', sub: 'ไรเดอร์ขึ้นของ', icon: PackageCheck, minPct: 40 },
    { key: 'delivering', label: 'กำลังนำส่ง', sub: 'GPS บนถนนสด', icon: Bike, minPct: 60 },
    { key: 'delivered', label: 'ส่งสำเร็จแล้ว', sub: 'ถึงจุดหมาย', icon: CheckCircle2, minPct: 100 },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'confirmed': return 0;
      case 'preparing': return 1;
      case 'rider_assigned': return 2;
      case 'delivering': return 3;
      case 'delivered': return 4;
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex(activeOrder.status);

  // Dynamic Road Name & Speech Badge
  const roadCheckpoint = useMemo(() => {
    if (pct < 18) return { road: 'หน้าร้านค้า ถ.อโศกมนตรี', note: 'ไรเดอร์กำลังเทียบรถตรวจรับออเดอร์', bubble: 'กำลังตรวจสอบอาหารที่ร้านครับ 👨‍🍳' };
    if (pct < 38) return { road: 'แยกอโศก-สุขุมวิท', note: 'ร้านกำลังบรรจุใส่กล่องเก็บความร้อน', bubble: 'แพ็คเรียบร้อย พร้อมสตาร์ทรถ 🛵' };
    if (pct < 60) return { road: 'ถ.สุขุมวิท มุ่งหน้าพร้อมพงษ์', note: 'ความเร็ว 38 กม./ชม. การจราจรคล่องตัว', bubble: 'กำลังขับมุ่งหน้าไปตาม GPS ครับ 💨' };
    if (pct < 82) return { road: 'สะพานข้ามคลอง • ซ.สุขุมวิท 23', note: 'เลี้ยวเข้าถนนสายย่อย ใกล้จุดหมาย', bubble: 'เข้าซอย 23 แล้ว อีกประมาณ 5 นาทีครับ' };
    if (pct < 98) return { road: 'ปากซอยบ้านของคุณ (200 ม.)', note: 'ชะลอความเร็วเพื่อเทียบจุดจอด', bubble: 'ใกล้ถึงแล้วครับ เตรียมรับอาหารได้เลย 📦' };
    return { road: 'ถึงจุดหมายเรียบร้อยแล้ว', note: 'ส่งมอบอาหารถึงมือคุณเรียบร้อย', bubble: 'ถึงแล้วครับ ทานให้อร่อยนะครับ! ⭐⭐⭐⭐⭐' };
  }, [pct]);

  // Remaining Distance and ETA calculation
  const remainingMeters = Math.max(0, Math.round((1 - pct / 100) * 1800));
  const remainingDistStr = remainingMeters > 999 
    ? `${(remainingMeters / 1000).toFixed(1)} กม.` 
    : `${remainingMeters} ม.`;
  const remainingMinutes = Math.max(1, Math.round((1 - pct / 100) * 18));

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = (chatInput || '').trim();
    if (!text) return;
    sendRiderMessage(text);
    setChatInput('');
  };

  const handleReviewOrder = () => {
    setReviewingOrder(activeOrder);
    setIsReviewModalOpen(true);
  };

  // Jump to specific step
  const handleJumpToStep = (targetPct: number) => {
    playBeep(660, 0.1);
    updateOrderProgress(targetPct);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col animate-in slide-in-from-bottom-5 text-slate-800">
        
        {/* Top Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950 text-white">
          <div className="flex items-center gap-3">
            <button
              id="close-tracking-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm text-white">ระบบติดตามสถานะจัดส่งสด</h2>
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  GPS Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {activeOrder.id} • {activeOrder.restaurantName}
              </p>
            </div>
          </div>

          {/* Sound & Fast Speed Actions */}
          <div className="flex items-center gap-2">
            <button
              id="toggle-tracking-sound-btn"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title={soundEnabled ? 'ปิดเสียงเอฟเฟกต์' : 'เปิดเสียงเอฟเฟกต์'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            {!isDelivered && (
              <button
                id="speed-up-simulation-btn"
                onClick={speedUpTracking}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-[11px] flex items-center gap-1 shadow-xs transition-transform active:scale-95"
                title="เร่งข้ามไปยังขั้นตอนถัดไปทันที"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>ข้ามขั้น</span>
              </button>
            )}
          </div>
        </div>

        {/* Real-time Map Area with Moving Rider Marker */}
        <div className="relative w-full h-64 sm:h-72 bg-slate-950 overflow-hidden select-none border-b border-slate-800">
          
          {/* Simulated Bangkok Styled Vector Map */}
          <svg
            className="w-full h-full"
            viewBox="0 0 400 240"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              {/* Glow Filter for Active Delivery Route */}
              <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Headlamp Spotlight Gradient */}
              <radialGradient id="headlightGradient" cx="0%" cy="50%" r="90%">
                <stop offset="0%" stopColor="#34d399" stopOpacity="0.45" />
                <stop offset="60%" stopColor="#10b981" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Background Dark Urban Terrain */}
            <rect width="400" height="240" fill="#090d16" />

            {/* City Blocks & Urban Grid */}
            <rect x="20" y="20" width="70" height="80" rx="6" fill="#0f172a" opacity="0.7" />
            <rect x="110" y="20" width="90" height="40" rx="6" fill="#0f172a" opacity="0.7" />
            <rect x="220" y="20" width="160" height="80" rx="6" fill="#0f172a" opacity="0.7" />
            <rect x="20" y="120" width="100" height="100" rx="6" fill="#0f172a" opacity="0.7" />
            <rect x="140" y="140" width="80" height="80" rx="6" fill="#0f172a" opacity="0.7" />
            <rect x="240" y="120" width="80" height="60" rx="6" fill="#0f172a" opacity="0.7" />

            {/* Parks / Green Zones (Benjakitti / Benchasiri Style) */}
            <path d="M 230 30 Q 280 40 270 80 T 230 90 Z" fill="#064e3b" opacity="0.4" />
            <circle cx="50" cy="180" r="30" fill="#064e3b" opacity="0.35" />

            {/* Khlong Saen Saep / Chao Phraya River Curve */}
            <path
              d="M -10 215 Q 100 175 190 220 T 410 190"
              fill="none"
              stroke="#0284c7"
              strokeWidth="14"
              opacity="0.25"
            />
            <path
              d="M -10 215 Q 100 175 190 220 T 410 190"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              opacity="0.4"
              strokeDasharray="8 6"
            />

            {/* Major Arterial Streets (Sukhumvit, Asoke, Rama IV) */}
            <line x1="0" y1="50" x2="400" y2="50" stroke="#1e293b" strokeWidth="8" />
            <line x1="0" y1="125" x2="400" y2="125" stroke="#334155" strokeWidth="10" />
            <line x1="0" y1="195" x2="400" y2="195" stroke="#1e293b" strokeWidth="7" />
            
            {/* Cross Streets */}
            <line x1="95" y1="0" x2="95" y2="240" stroke="#1e293b" strokeWidth="8" />
            <line x1="245" y1="0" x2="245" y2="240" stroke="#1e293b" strokeWidth="8" />
            <line x1="330" y1="0" x2="330" y2="240" stroke="#1e293b" strokeWidth="6" />

            {/* Road Center Line Dashes */}
            <line x1="0" y1="125" x2="400" y2="125" stroke="#475569" strokeWidth="1.2" strokeDasharray="6 6" />

            {/* Street Labels */}
            <text x="360" y="44" fill="#64748b" fontSize="6.5" fontWeight="bold" textAnchor="end">ถ.อโศกมนตรี</text>
            <text x="380" y="119" fill="#94a3b8" fontSize="7.5" fontWeight="bold" textAnchor="end">ถ.สุขุมวิท (Asoke - Phrom Phong)</text>
            <text x="248" y="15" fill="#64748b" fontSize="6" fontWeight="bold">ซ.สุขุมวิท 23 (ประสานมิตร)</text>
            <text x="18" y="232" fill="#38bdf8" fontSize="6.5" opacity="0.7">คลองแสนแสบ</text>

            {/* BTS Skytrain Viaduct Line */}
            <line x1="0" y1="120" x2="400" y2="120" stroke="#047857" strokeWidth="2.5" opacity="0.6" strokeDasharray="12 4" />
            <text x="12" y="115" fill="#34d399" fontSize="6" fontWeight="bold">BTS สายสุขุมวิท</text>

            {/* Master Delivery Route Hidden for Length Measurement */}
            <path
              ref={pathRef}
              d={routePathD}
              fill="none"
              stroke="transparent"
              strokeWidth="0.1"
            />

            {/* Base Background Delivery Route (Road Guidance) */}
            <path
              d={routePathD}
              fill="none"
              stroke="#064e3b"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />

            {/* Animated Ahead Route (Dashed Pulse) */}
            <path
              d={routePathD}
              fill="none"
              stroke="#059669"
              strokeWidth="3.5"
              strokeDasharray="6 5"
              strokeLinecap="round"
              className="animate-pulse"
              opacity="0.9"
            />

            {/* Traversed Road Glow (Breadcrumb Trail behind the rider) */}
            {pathRef.current && (
              <path
                d={routePathD}
                fill="none"
                stroke="#10b981"
                strokeWidth="4"
                strokeLinecap="round"
                filter="url(#routeGlow)"
                style={{
                  strokeDasharray: pathRef.current.getTotalLength() || 400,
                  strokeDashoffset: (pathRef.current.getTotalLength() || 400) * (1 - pct / 100),
                  transition: 'stroke-dashoffset 0.3s ease-out'
                }}
              />
            )}

            {/* Restaurant Marker (🏪) */}
            <g transform="translate(50, 50)">
              <circle r="14" fill="#059669" opacity="0.25" className="animate-ping" />
              <circle r="9" fill="#059669" stroke="#ffffff" strokeWidth="1.5" />
              <text x="0" y="3.5" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">🏪</text>
              
              {/* Label Pill */}
              <rect x="-36" y="-24" width="72" height="15" rx="4" fill="#022c22" stroke="#059669" strokeWidth="1" />
              <text x="0" y="-14" textAnchor="middle" fill="#6ee7b7" fontSize="7" fontWeight="bold">
                {activeOrder.restaurantName.slice(0, 14)}
              </text>
            </g>

            {/* Customer Home Destination Marker (📍) */}
            <g transform="translate(350, 195)">
              {/* Expanding Geofence Radar Boundary */}
              <circle r="22" fill="#e11d48" opacity="0.12" className="animate-ping" />
              <circle r="14" fill="#e11d48" opacity="0.3" />
              <circle r="9" fill="#e11d48" stroke="#ffffff" strokeWidth="1.5" />
              <text x="0" y="3.5" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">📍</text>
              
              {/* Label Pill */}
              <rect x="-38" y="-24" width="76" height="15" rx="4" fill="#4c0519" stroke="#e11d48" strokeWidth="1" />
              <text x="0" y="-14" textAnchor="middle" fill="#fda4af" fontSize="7" fontWeight="bold">
                จุดส่ง: บ้านของคุณ
              </text>
            </g>

            {/* Real-time Moving Rider Marker (🛵) */}
            <g 
              transform={`translate(${riderCoords.x}, ${riderCoords.y})`}
              className="transition-transform duration-300 ease-out"
            >
              {/* Concentric GPS Radar Ripples */}
              {!isDelivered && (
                <>
                  <circle r="18" fill="#10b981" opacity="0.2" className="animate-ping" />
                  <circle r="12" fill="#10b981" opacity="0.35" />
                </>
              )}

              {/* Headlamp Light Beam pointing towards bearing */}
              {!isDelivered && (
                <path
                  d="M 0 0 L 32 -14 L 32 14 Z"
                  fill="url(#headlightGradient)"
                  transform={`rotate(${riderCoords.angle})`}
                  opacity="0.75"
                />
              )}

              {/* Rotating Motorcycle & Rider Body */}
              <g transform={`rotate(${riderCoords.angle})`}>
                {/* Rider Base Pill / Shadow */}
                <ellipse cx="0" cy="0" rx="9" ry="6" fill="#022c22" stroke="#10b981" strokeWidth="1.2" />
                {/* Tail Exhaust Spark when moving */}
                {!isDelivered && currentSpeedKmh > 0 && (
                  <circle cx="-10" cy="0" r="2" fill="#34d399" className="animate-ping" />
                )}
              </g>

              {/* High Contrast Scooter Pin Icon */}
              <circle r="10" fill="#047857" stroke="#ffffff" strokeWidth="2" />
              <text x="0" y="3.5" textAnchor="middle" fontSize="9">🛵</text>

              {/* Floating Dynamic Speech Bubble above Rider */}
              <g transform="translate(0, -22)">
                <rect 
                  x="-62" 
                  y="-14" 
                  width="124" 
                  height="16" 
                  rx="5" 
                  fill="#022c22" 
                  stroke="#10b981" 
                  strokeWidth="1"
                  className="shadow-lg"
                />
                <polygon points="0,2 -4,-2 4,-2" fill="#022c22" stroke="#10b981" strokeWidth="0.8" />
                <text 
                  x="0" 
                  y="-3" 
                  textAnchor="middle" 
                  fill="#a7f3d0" 
                  fontSize="6.5" 
                  fontWeight="bold"
                >
                  {roadCheckpoint.bubble}
                </text>
              </g>
            </g>
          </svg>

          {/* Floating Top Telemetry & ETA HUD Overlay */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between pointer-events-none gap-2">
            
            {/* Left ETA & Distance Badge */}
            <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 px-3 py-2 rounded-2xl shadow-xl text-white pointer-events-auto">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px]">
                <Clock className="w-3.5 h-3.5" />
                <span>{isDelivered ? 'จัดส่งสำเร็จ' : 'เวลาจัดส่งโดยประมาณ'}</span>
              </div>
              <div className="font-extrabold text-sm sm:text-base text-white mt-0.5 flex items-baseline gap-2">
                <span>{isDelivered ? 'ได้รับเรียบร้อย' : `อีก ~${remainingMinutes} นาที`}</span>
                {!isDelivered && (
                  <span className="text-[11px] font-medium text-emerald-300">
                    ({remainingDistStr})
                  </span>
                )}
              </div>
              <div className="text-[9.5px] text-slate-400 mt-0.5 flex items-center gap-1">
                <Compass className="w-3 h-3 text-slate-400" />
                <span className="truncate max-w-[140px] sm:max-w-[190px]">{roadCheckpoint.road}</span>
              </div>
            </div>

            {/* Right Live Speedometer & GPS Satellite Badge */}
            <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 px-2.5 py-2 rounded-2xl shadow-xl text-right pointer-events-auto flex flex-col items-end">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>{currentSpeedKmh} กม./ชม.</span>
              </div>
              <div className="text-[9px] font-mono text-emerald-300 mt-0.5">
                {liveGpsCoords.lat.toFixed(4)}°N, {liveGpsCoords.lon.toFixed(4)}°E
              </div>
              <div className="text-[8.5px] text-slate-400 mt-0.5">
                GPS แม่นยำ ±2ม. (ดาวเทียม 9 ดวง)
              </div>
            </div>
          </div>

          {/* Floating Bottom Quick Simulation Control Strip */}
          <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between gap-2 bg-slate-950/85 backdrop-blur-md border border-slate-800 p-2 rounded-xl text-white text-[11px]">
            <div className="flex items-center gap-1.5">
              <button
                id="toggle-auto-sim-btn"
                onClick={() => setIsAutoSimulating(!isAutoSimulating)}
                disabled={isDelivered}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                  isAutoSimulating 
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isAutoSimulating ? (
                  <>
                    <Pause className="w-3 h-3 fill-current" />
                    <span>หยุดจำลอง</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current" />
                    <span>เล่น GPS สด</span>
                  </>
                )}
              </button>

              {/* Speed multiplier selector */}
              <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
                {([1, 2, 4] as const).map(spd => (
                  <button
                    key={spd}
                    id={`sim-multiplier-${spd}x-btn`}
                    onClick={() => setSimSpeedMultiplier(spd)}
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md transition-colors ${
                      simSpeedMultiplier === spd 
                        ? 'bg-emerald-600 text-white' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Step +5% Button */}
            <button
              id="step-forward-gps-btn"
              onClick={() => handleJumpToStep(Math.min(100, pct + 5))}
              disabled={isDelivered}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1 transition-colors"
              title="ขยับตำแหน่ง GPS ไปข้างหน้า 5%"
            >
              <FastForward className="w-3 h-3" />
              <span>+5% GPS</span>
            </button>
          </div>
        </div>

        {/* Status Stepper & Progress Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs bg-slate-50">
          
          {/* Stepper Progress Bar & Stage Status */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <div className="flex items-center gap-2">
                <span>ลำดับขั้นตอนจัดส่ง</span>
                <span className="text-[11px] font-normal text-slate-500">
                  ({steps[currentStepIdx]?.label})
                </span>
              </div>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-extrabold border border-emerald-200">
                คืบหน้า {pct}%
              </span>
            </div>

            {/* Stepper Graphic with Connectors */}
            <div className="relative flex items-center justify-between pt-1">
              <div className="absolute left-4 right-4 top-4.5 h-1 bg-slate-200 -z-0">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                  style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
                />
              </div>

              {steps.map((step, idx) => {
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                const IconComponent = step.icon;

                return (
                  <button
                    key={step.key}
                    id={`stepper-step-${step.key}-btn`}
                    onClick={() => handleJumpToStep(step.minPct)}
                    className="flex flex-col items-center text-center z-10 group focus:outline-none"
                    title={`ข้ามไปยังขั้น: ${step.label} (${step.minPct}%)`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isCurrent
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 scale-110 shadow-sm'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-500 group-hover:bg-slate-300'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] mt-1.5 font-medium max-w-[62px] leading-tight ${isPassed ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                      {step.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Interactive Route Scrubber (Slider) */}
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <Sliders className="w-3 h-3 text-emerald-600" />
                  จำลองตำแหน่ง GPS บนเส้นทาง:
                </span>
                <span className="font-bold text-emerald-700">{pct}%</span>
              </div>
              <input
                id="rider-route-scrubber-slider"
                type="range"
                min="0"
                max="100"
                value={pct}
                onChange={e => updateOrderProgress(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[9px] text-slate-400 px-0.5">
                <span>0% ร้านค้า</span>
                <span>30% ปรุงอาหาร</span>
                <span>60% นำส่ง</span>
                <span>100% ถึงบ้าน</span>
              </div>
            </div>
          </div>

          {/* Rider Profile Card */}
          {activeOrder.rider && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={activeOrder.rider.photo}
                  alt={activeOrder.rider.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">{activeOrder.rider.name}</h3>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="flex items-center text-amber-500 font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                      {activeOrder.rider.rating}
                    </span>
                    <span>•</span>
                    <span>{activeOrder.rider.licensePlate}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{activeOrder.rider.vehicle}</p>
                </div>
              </div>

              {/* Call & Chat Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  id="call-rider-btn"
                  onClick={() => setIsCallModalOpen(true)}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                  title="โทรหาไรเดอร์"
                >
                  <Phone className="w-4 h-4" />
                </button>

                <button
                  id="chat-rider-btn"
                  onClick={() => setIsChatOpen(true)}
                  className="relative w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors shadow-xs"
                  title="แชทกับไรเดอร์"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white" />
                </button>
              </div>
            </div>
          )}

          {/* Delivery Details Summary */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between font-semibold text-slate-800">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                สถานที่จัดส่ง:
              </span>
              <span className="text-slate-600 truncate max-w-[220px]">{activeOrder.deliveryAddress}</span>
            </div>
            {activeOrder.notes && (
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>หมายเหตุ:</span>
                <span className="italic">{activeOrder.notes}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-800 pt-2 border-t border-slate-100 font-bold">
              <span>ยอดรวมทั้งหมด:</span>
              <span className="text-emerald-700 text-sm">฿{activeOrder.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
          {isDelivered ? (
            <button
              id="delivered-review-order-btn"
              onClick={handleReviewOrder}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
            >
              <Star className="w-4 h-4 fill-white" />
              <span>เขียนรีวิวให้คะแนนร้านค้า & ไรเดอร์ (+15 คะแนน)</span>
            </button>
          ) : (
            <div className="w-full flex items-center justify-between gap-2">
              <button
                id="cancel-order-tracking-btn"
                onClick={cancelActiveOrder}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-500 font-medium text-xs transition-colors"
              >
                ยกเลิกออเดอร์
              </button>

              <button
                id="simulation-speed-toggle-btn"
                onClick={() => setSimulationSpeed(simulationSpeed === 'fast' ? 'normal' : 'fast')}
                className="text-[11px] text-slate-500 font-medium hover:text-slate-800 underline"
              >
                ความเร็วระบบหลัก: {simulationSpeed === 'fast' ? '⚡ เร็ว (4วิ)' : 'ปกติ (9วิ)'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Rider Chat Drawer Overlay */}
      {isChatOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl h-[520px] max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
            {/* Chat Header */}
            <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={activeOrder.rider?.photo}
                  alt={activeOrder.rider?.name}
                  className="w-8 h-8 rounded-full object-cover border border-emerald-500"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-bold text-xs">{activeOrder.rider?.name}</h4>
                  <p className="text-[10px] text-emerald-400">กำลังออนไลน์ • ขับขี่ปลอดภัย</p>
                </div>
              </div>
              <button
                id="close-rider-chat-btn"
                onClick={() => setIsChatOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-slate-50 text-xs">
              {chatMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    <p className="text-xs leading-relaxed">{msg.text}</p>
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}
            </div>

            {/* Quick response pills */}
            <div className="px-3 py-1.5 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
              {['ฝากไว้ที่ล็อบบี้ได้เลยครับ', 'ขอช้อนส้อมด้วยนะครับ', 'ใกล้ถึงหรือยังครับ', 'รอรับหน้าประตูครับ'].map(quick => (
                <button
                  key={quick}
                  onClick={() => sendRiderMessage(quick)}
                  className="text-[10px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
                >
                  {quick}
                </button>
              ))}
            </div>

            {/* Chat Form */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="พิมพ์ข้อความถึงไรเดอร์..."
                className="flex-1 p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <button
                id="send-chat-btn"
                type="submit"
                className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Call Rider Simulation Modal */}
      {isCallModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 text-white rounded-3xl p-6 text-center space-y-4 shadow-2xl border border-slate-800">
            <div className="relative mx-auto w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-400 shadow-xl">
              <img
                src={activeOrder.rider?.photo}
                alt={activeOrder.rider?.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className="font-bold text-lg">{activeOrder.rider?.name}</h3>
              <p className="text-xs text-slate-400">เบอร์ติดต่อ: {activeOrder.rider?.phone}</p>
              <p className="text-xs text-emerald-400 mt-2 animate-pulse">กำลังโทรออกผ่านเครือข่ายปลอดภัย...</p>
            </div>
            <button
              id="end-call-btn"
              onClick={() => setIsCallModalOpen(false)}
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all"
            >
              วางสาย
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
