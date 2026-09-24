import React from 'react';
import { 
  Award, 
  X, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Gift, 
  Zap, 
  Star,
  ChevronRight,
  Flame,
  Radio
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { RIDER_TIERS_CONFIG } from '../../data/riderData';
import { RiderTier, RiderDailyQuest } from '../../types';

interface RiderTierQuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RiderTierQuestsModal: React.FC<RiderTierQuestsModalProps> = ({
  isOpen,
  onClose
}) => {
  const { 
    activeRider, 
    setActiveRider, 
    riderQuests, 
    claimRiderQuestReward, 
    triggerToast 
  } = useApp();

  if (!isOpen) return null;

  const currentTierId: RiderTier = activeRider.tier || 'gold';
  const currentTierConfig = RIDER_TIERS_CONFIG[currentTierId];

  const handleSelectTier = (tier: RiderTier) => {
    setActiveRider(prev => ({
      ...prev,
      tier
    }));
    const newConfig = RIDER_TIERS_CONFIG[tier];
    triggerToast(
      `สลับเป็นระดับ ${newConfig.titleTh}!`,
      `รับสิทธิ์โบนัสค่ารอบ +${newConfig.earningBonusPercent}% และ Priority Dispatch ${newConfig.earlyDispatchSeconds} วินาที`,
      'reward'
    );
  };

  const handleClaim = (quest: RiderDailyQuest) => {
    claimRiderQuestReward(quest.id);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#6366F1']
      });
    } catch {
      // safe
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow-sm">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  ระดับเลเวลเกียรติยศ & ภารกิจสะสมแต้ม (Rider Tiers & Quests)
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  {currentTierConfig.badgeEmoji} {currentTierConfig.titleTh}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                ยกระดับประสิทธิภาพรับงาน เพิ่มเปอร์เซ็นต์โบนัสค่ารอบ และปลดล็อกสิทธิพิเศษตามมาตรฐานสากล
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          
          {/* Active Rider Current Status Progress Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-5 border border-slate-700 shadow-lg relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">
                  CURRENT RIDER TIER LEVEL
                </span>
                <div className="text-xl sm:text-2xl font-black flex items-center gap-2">
                  <span>{currentTierConfig.badgeEmoji}</span>
                  <span>{currentTierConfig.titleTh}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  โบนัสค่ารอบปัจจุบัน: <strong className="text-amber-300 font-black">+{currentTierConfig.earningBonusPercent}%</strong> • สิทธิ์รับงานเร็วกว่า: <strong className="text-emerald-300 font-black">{currentTierConfig.earlyDispatchSeconds} วินาที</strong>
                </p>
              </div>

              {/* Progress to Next Tier */}
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-700/80 min-w-[240px]">
                <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                  <span className="text-slate-300">เกณฑ์เลื่อนสู่ Platinum Hero</span>
                  <span className="text-amber-400 font-mono">88%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 w-[88%]" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                  <div>วิ่งงานเดือนนี้: <strong className="text-white">218/250 งาน</strong></div>
                  <div>คะแนนรีวิว: <strong className="text-emerald-400">4.98 ⭐</strong></div>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Tier Cards Selection (Clickable to switch demo) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>ตารางเปรียบเทียบ 4 ระดับเลเวล (คลิกเพื่อทดสอบสลับระดับ):</span>
              </h4>
              <span className="text-[11px] text-slate-500">คลิกที่การ์ดเพื่อสลับสิทธิ์ทดสอบ</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(['bronze', 'silver', 'gold', 'platinum'] as RiderTier[]).map(t => {
                const cfg = RIDER_TIERS_CONFIG[t];
                const isCurrent = currentTierId === t;
                return (
                  <div
                    key={t}
                    onClick={() => handleSelectTier(t)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isCurrent
                        ? `${cfg.borderClass} ${cfg.badgeBg} ring-2 ring-amber-400 shadow-md`
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{cfg.badgeEmoji}</span>
                        {isCurrent ? (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                            ใช้งานอยู่
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">
                            คลิกเพื่อสลับ
                          </span>
                        )}
                      </div>
                      <div className="font-black text-slate-900 text-sm mb-1">{cfg.titleTh}</div>
                      <div className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mb-2">
                        {cfg.earningBonusPercent > 0 ? `โบนัสค่ารอบ +${cfg.earningBonusPercent}%` : 'ค่ารอบมาตรฐาน'}
                      </div>
                      <ul className="space-y-1 text-[11px] text-slate-600 mt-1">
                        {cfg.perks.map((p, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-emerald-600 font-bold shrink-0">✓</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 text-[10px] text-slate-500">
                      <div>เกณฑ์งาน: <strong>{cfg.minMonthlyTrips} งาน/เดือน</strong></div>
                      <div>ประกัน: <strong>{cfg.insuranceCoverageTh}</strong></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Daily Quests Section (ภารกิจประจำวันรับเงินสดเพิ่ม) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span>ภารกิจประจำวันรับเงินโบนัสพิเศษ (Daily Quests & Challenges)</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  ทำภารกิจสำเร็จ ยอดเงินโบนัสจะโอนเข้า Cash Wallet พร้อมถอนได้ทันที
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {riderQuests.map(q => (
                <div 
                  key={q.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    q.claimed
                      ? 'bg-slate-50 border-slate-200 opacity-70'
                      : q.completed
                      ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-400'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{q.iconEmoji}</span>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{q.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          ความคืบหน้า: <strong className="text-slate-800">{q.currentCount}/{q.targetCount}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-amber-600 block">
                        +฿{q.bonusBaht}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3 mb-2.5">
                    <div 
                      className={`h-full ${q.completed ? 'bg-emerald-500' : 'bg-amber-400'}`}
                      style={{ width: `${Math.min(100, (q.currentCount / q.targetCount) * 100)}%` }}
                    />
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400">
                      {q.claimed ? 'รับรางวัลแล้ว' : q.completed ? 'สำเร็จแล้ว กดรับเงินได้ทันที' : 'กำลังดำเนินการ'}
                    </span>

                    {q.claimed ? (
                      <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>รับแล้ว ✓</span>
                      </span>
                    ) : q.completed ? (
                      <button
                        type="button"
                        onClick={() => handleClaim(q)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-black cursor-pointer shadow-xs flex items-center gap-1 animate-pulse"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        <span>กดรับโบนัส ฿{q.bonusBaht} 💸</span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                        เหลืออีก {q.targetCount - q.currentCount}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            ระบบอัปเดตสถิติและสถานะทุกสิ้นวัน เวลา 23:59 น.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
