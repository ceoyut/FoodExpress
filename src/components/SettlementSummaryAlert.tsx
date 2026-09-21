import React, { useState } from 'react';
import { 
  Trophy, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  SlidersHorizontal, 
  CreditCard, 
  ShieldCheck, 
  Bell, 
  Flame,
  ChevronRight,
  ExternalLink,
  Zap,
  Percent
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MerchantDailySettlement } from '../types';

interface SettlementSummaryAlertProps {
  settlement: MerchantDailySettlement;
  restaurantName: string;
  onOpenTransferConfirm?: () => void;
  onOpenSettings?: () => void;
  onQuickRefresh?: () => void;
}

export const SettlementSummaryAlert: React.FC<SettlementSummaryAlertProps> = ({
  settlement,
  restaurantName,
  onOpenTransferConfirm,
  onOpenSettings,
  onQuickRefresh,
}) => {
  const [activeAlertTab, setActiveAlertTab] = useState<'all' | 'goal' | 'payout'>('all');

  // Sales goal computation
  const salesGoal = settlement?.config?.dailySalesGoal || settlement?.dailySalesGoal || 5000;
  const currentSales = settlement?.grossSales || 0;
  const isGoalMet = currentSales >= salesGoal;
  const goalProgressPct = salesGoal > 0 ? Math.round((currentSales / salesGoal) * 100) : 100;
  const excessAmount = Math.max(0, currentSales - salesGoal);
  const remainingAmount = Math.max(0, salesGoal - currentSales);

  // Pending payout status computation
  const isPendingPayout = settlement?.status !== 'paid';
  const pendingAmount = settlement?.netPayoutPayable || 0;
  const isOverThreshold = 
    settlement?.config?.enablePendingPayoutAlert !== false &&
    isPendingPayout &&
    pendingAmount >= (settlement?.config?.minPendingPayoutThreshold || 5000);

  // Status text in Thai
  const getStatusLabel = () => {
    switch (settlement.status) {
      case 'approved':
        return { text: 'อนุมัติจ่ายแล้ว (Approved - รอโอนเงิน)', color: 'text-blue-700 bg-blue-50 border-blue-200' };
      case 'calculated':
        return { text: 'คำนวณปิดยอดแล้ว (Calculated - รออนุมัติ)', color: 'text-amber-800 bg-amber-50 border-amber-300' };
      case 'pending':
        return { text: 'รอสรุปปิดยอดกะ (Pending Settlement)', color: 'text-slate-700 bg-slate-100 border-slate-300' };
      case 'on_hold':
        return { text: 'ระงับจ่ายชั่วคราว (On Hold)', color: 'text-rose-700 bg-rose-50 border-rose-200' };
      case 'paid':
      default:
        return { text: 'โอนเงินเข้าบัญชีแล้ว (Paid & Settled)', color: 'text-emerald-800 bg-emerald-50 border-emerald-300' };
    }
  };

  const statusInfo = getStatusLabel();

  // Total alerts active
  const alertCount = (isGoalMet ? 1 : 0) + (isPendingPayout ? 1 : 0);

  return (
    <motion.div
      id="merchant-settlement-summary-alert"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-3xl border border-slate-200/90 bg-white shadow-xs overflow-hidden"
    >
      {/* Alert Component Header Bar */}
      <div className={`px-4 sm:px-5 py-3.5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isGoalMet && isPendingPayout
          ? 'bg-gradient-to-r from-emerald-50 via-amber-50/70 to-slate-50 border-slate-200'
          : isGoalMet
          ? 'bg-gradient-to-r from-emerald-50 via-emerald-50/60 to-slate-50 border-emerald-200'
          : isPendingPayout
          ? 'bg-gradient-to-r from-amber-50 via-amber-50/60 to-slate-50 border-amber-200'
          : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
            isGoalMet && isPendingPayout
              ? 'bg-gradient-to-br from-emerald-500 to-amber-500 text-white'
              : isGoalMet
              ? 'bg-emerald-600 text-white'
              : isPendingPayout
              ? 'bg-amber-500 text-white'
              : 'bg-slate-200 text-slate-700'
          }`}>
            {isGoalMet && isPendingPayout ? (
              <Bell className="w-4 h-4 animate-bounce" />
            ) : isGoalMet ? (
              <Trophy className="w-4 h-4" />
            ) : isPendingPayout ? (
              <Clock className="w-4 h-4" />
            ) : (
              <TrendingUp className="w-4 h-4" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-black text-slate-900">
                สรุปการแจ้งเตือนสำคัญ (Settlement Summary Alert)
              </span>
              {alertCount > 0 ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white shadow-2xs">
                  {alertCount} รายการที่ต้องทราบ
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ปกติทุกรายการ
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isGoalMet && isPendingPayout
                ? 'ยอดขายถึงเป้าหมายประจำวันเรียบร้อย และมีเงินโอนสุทธิรอดำเนินการตัดจ่าย'
                : isGoalMet
                ? 'ยินดีด้วย! ยอดขายรวมของร้านค้าบรรลุเป้าหมายประจำวันที่ตั้งไว้สำเร็จ'
                : isPendingPayout
                ? 'มีรายการเงินโอนสุทธิรอบวันนี้ที่อยู่ในสถานะรอดำเนินการ'
                : 'ติดตามความคืบหน้าเป้าหมายยอดขายและสถานะการโอนเงินของร้านค้า'}
            </p>
          </div>
        </div>

        {/* Filter View Selector Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
          <button
            type="button"
            id="filter-alert-all-btn"
            onClick={() => setActiveAlertTab('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeAlertTab === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ทั้งหมด
          </button>
          <button
            type="button"
            id="filter-alert-goal-btn"
            onClick={() => setActiveAlertTab('goal')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              activeAlertTab === 'goal'
                ? 'bg-white text-emerald-800 shadow-2xs'
                : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            <Trophy className="w-3 h-3 text-emerald-600" />
            <span>เป้าหมายยอดขาย</span>
            {isGoalMet && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            )}
          </button>
          <button
            type="button"
            id="filter-alert-payout-btn"
            onClick={() => setActiveAlertTab('payout')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              activeAlertTab === 'payout'
                ? 'bg-white text-amber-900 shadow-2xs'
                : 'text-slate-600 hover:text-amber-800'
            }`}
          >
            <Clock className="w-3 h-3 text-amber-600" />
            <span>สถานะเงินรอโอน</span>
            {isPendingPayout && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            )}
          </button>
        </div>
      </div>

      {/* Alert Content Body */}
      <div className="p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* 1. Daily Sales Goal Alert Card */}
          {(activeAlertTab === 'all' || activeAlertTab === 'goal') && (
            <motion.div
              id="alert-daily-sales-goal-card"
              layout
              className={`rounded-2xl border p-4 transition-all relative overflow-hidden flex flex-col justify-between ${
                isGoalMet
                  ? 'bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/40 border-emerald-300 shadow-xs'
                  : 'bg-slate-50/80 border-slate-200'
              }`}
            >
              {isGoalMet && (
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-400/10 rounded-full blur-xl pointer-events-none" />
              )}

              <div className="space-y-2.5">
                {/* Header Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isGoalMet ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {isGoalMet ? <Flame className="w-4 h-4 text-emerald-600" /> : <Trophy className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">
                        เป้าหมายยอดขายประจำวัน (Daily Sales Goal)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        ร้าน: {restaurantName}
                      </p>
                    </div>
                  </div>

                  {/* Goal Status Badge */}
                  {isGoalMet ? (
                    <span 
                      id="badge-goal-met"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-600 text-white shadow-xs"
                    >
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>ถึงเป้าหมายแล้ว 🎉</span>
                    </span>
                  ) : (
                    <span 
                      id="badge-goal-in-progress"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-200 text-slate-700"
                    >
                      <TrendingUp className="w-3 h-3 text-slate-500" />
                      <span>กำลังมุ่งสู่เป้าหมาย</span>
                    </span>
                  )}
                </div>

                {/* Sales Goal Figures & Metric */}
                <div className="bg-white/80 p-3 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        ยอดขายรวมปัจจุบัน (Gross Sales)
                      </span>
                      <div className="text-lg sm:text-xl font-black text-slate-900">
                        ฿{currentSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        เป้าหมาย (Daily Target)
                      </span>
                      <div className="text-sm font-bold text-slate-600">
                        ฿{salesGoal.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-200/60">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(goalProgressPct, 100)}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          isGoalMet
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                            : 'bg-slate-400'
                        }`}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className={isGoalMet ? 'text-emerald-700' : 'text-slate-500'}>
                        {isGoalMet
                          ? `เกินเป้าหมาย +฿${excessAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} (+${goalProgressPct - 100}%)`
                          : `ยังขาดอีก ฿${remainingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} เพื่อถึงเป้า`}
                      </span>
                      <span className={isGoalMet ? 'text-emerald-700 font-black' : 'text-slate-600'}>
                        {goalProgressPct}% ของเป้าหมาย
                      </span>
                    </div>
                  </div>
                </div>

                {/* Motivational Milestone Callout */}
                {isGoalMet ? (
                  <div className="flex items-start gap-2 bg-emerald-100/60 p-2.5 rounded-xl border border-emerald-200/70 text-emerald-950">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-[11px] leading-relaxed">
                      <strong>ยินดีด้วยครับ!</strong> ยอดขายวันนี้ทะลุเป้าหมาย <strong>฿{salesGoal.toLocaleString()}</strong> เรียบร้อยแล้ว ยอดออเดอร์สะสม <strong>{settlement.completedOrdersCount || settlement.totalOrdersCount} รายการ</strong> ร้านคุณเข้าเกณฑ์แคมเปญส่งเสริมการขาย Top Seller ในรอบสัปดาห์ถัดไป
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 bg-slate-100 p-2.5 rounded-xl border border-slate-200 text-slate-700">
                    <TrendingUp className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <div className="text-[11px] leading-relaxed">
                      วันนี้ทำยอดขายได้แล้ว <strong>{goalProgressPct}%</strong> จากเป้าหมาย ฿{salesGoal.toLocaleString()} อีกเพียง <strong>฿{remainingAmount.toLocaleString()}</strong> ก็จะบรรลุเป้าหมายประจำวัน
                    </div>
                  </div>
                )}
              </div>

              {/* Goal Card Footer Action */}
              <div className="pt-3 mt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500">
                  เป้าหมายปรับแต่งได้ตามต้องการ
                </span>
                {onOpenSettings && (
                  <button
                    type="button"
                    id="btn-adjust-sales-goal"
                    onClick={onOpenSettings}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <SlidersHorizontal className="w-3 h-3 text-slate-500" />
                    <span>ปรับเป้าหมาย</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* 2. Pending Payout Status Alert Card */}
          {(activeAlertTab === 'all' || activeAlertTab === 'payout') && (
            <motion.div
              id="alert-pending-payout-status-card"
              layout
              className={`rounded-2xl border p-4 transition-all relative overflow-hidden flex flex-col justify-between ${
                isPendingPayout
                  ? 'bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40 border-amber-300 shadow-xs'
                  : 'bg-emerald-50/50 border-emerald-200'
              }`}
            >
              {isPendingPayout && (
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
              )}

              <div className="space-y-2.5">
                {/* Header Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isPendingPayout ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {isPendingPayout ? <Clock className="w-4 h-4 text-amber-600" /> : <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">
                        สถานะเงินรอโอน (Pending Payout Status)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        รอบวันที่: {settlement.dateDisplayTh}
                      </p>
                    </div>
                  </div>

                  {/* Payout Status Badge */}
                  <span 
                    id="badge-payout-status"
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusInfo.color}`}
                  >
                    {isPendingPayout ? (
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    )}
                    <span>{statusInfo.text}</span>
                  </span>
                </div>

                {/* Payout Net Payable Figures */}
                <div className="bg-white/80 p-3 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        ยอดสุทธิที่ต้องโอน (Net Payout Payable)
                      </span>
                      <div className={`text-lg sm:text-xl font-black ${
                        isPendingPayout ? 'text-amber-900' : 'text-emerald-700'
                      }`}>
                        ฿{pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        รอบโอนอัตโนมัติ
                      </span>
                      <span className="inline-block text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {settlement.config?.autoTransferTime || '14:00 น.'}
                      </span>
                    </div>
                  </div>

                  {/* Destination Bank Account Summary */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-100 flex-wrap">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>โอนเข้า: <strong>{settlement.bankAccount?.bankName}</strong></span>
                    <span className="font-mono text-slate-500">({settlement.bankAccount?.accountNumber})</span>
                    {settlement.bankAccount?.promptPayId && (
                      <span className="text-slate-400">| PromptPay: {settlement.bankAccount.promptPayId}</span>
                    )}
                  </div>
                </div>

                {/* Threshold Alert Note if exceeded */}
                {isOverThreshold ? (
                  <div className="flex items-start gap-2 bg-amber-100/70 p-2.5 rounded-xl border border-amber-300 text-amber-950">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 animate-pulse" />
                    <div className="text-[11px] leading-relaxed">
                      <strong>แจ้งเตือนข้ามเกณฑ์:</strong> ยอดรอโอน ฿{pendingAmount.toLocaleString()} ข้ามเกณฑ์ขั้นต่ำ ฿{(settlement?.config?.minPendingPayoutThreshold || 5000).toLocaleString()} ที่คุณกำหนดไว้ สามารถกดอนุมัติโอนเงินทันทีโดยไม่ต้องรอรอบโอนอัตโนมัติ
                    </div>
                  </div>
                ) : isPendingPayout ? (
                  <div className="flex items-start gap-2 bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-[11px] leading-relaxed">
                      ระบบตรวจพบยอดรอโอนรอบปัจจุบัน <strong>฿{pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> เงินจะถูกโอนอัตโนมัติเข้าบัญชี หรือสามารถกดอนุมัติโอนเงินได้ทันที
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 bg-emerald-100/60 p-2.5 rounded-xl border border-emerald-200 text-emerald-950">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-[11px] leading-relaxed">
                      รอบการชำระนี้ดำเนินการโอนเงินเข้าบัญชีเรียบร้อยแล้ว {settlement.transferredAt ? `เมื่อ ${settlement.transferredAt}` : ''}
                    </div>
                  </div>
                )}
              </div>

              {/* Payout Card Footer Actions */}
              <div className="pt-3 mt-3 border-t border-slate-200/80 flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[11px] text-slate-500">
                  {isPendingPayout ? 'ดำเนินการโดยระบบอัตโนมัติ' : 'ตรวจสอบสลิปได้'}
                </span>
                
                {isPendingPayout && onOpenTransferConfirm ? (
                  <button
                    type="button"
                    id="btn-alert-instant-transfer"
                    onClick={onOpenTransferConfirm}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>อนุมัติและโอนเงินทันที</span>
                  </button>
                ) : onOpenSettings ? (
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <SlidersHorizontal className="w-3 h-3 text-slate-500" />
                    <span>ตั้งค่ารอบโอน</span>
                  </button>
                ) : null}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
