import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  AreaChart,
  Area,
  LineChart,
  Line,
  ComposedChart,
  ReferenceLine,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  Cell 
} from 'recharts';
import { 
  TrendingUp, 
  Store, 
  Building2, 
  Calendar, 
  DollarSign, 
  ShoppingBag, 
  Flame, 
  Award, 
  Layers, 
  ChevronRight, 
  ArrowUpRight,
  Info,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart,
  Target,
  Download,
  CheckCircle2,
  SlidersHorizontal,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RESTAURANTS_DATA } from '../data/mockData';
import { MerchantDailySettlement } from '../types';

export interface DailyRevenueItem {
  date: string;
  dayName: string;
  dayShort: string;
  fullLabel: string;
  grossSales: number;
  netPayout: number;
  platformGp: number;
  feesAndTax: number;
  totalOrders: number;
  aov: number; // Average Order Value (฿)
  tips: number;
  isToday: boolean;
  isPeak: boolean;
  status: 'paid' | 'pending' | 'review';
}

interface WeeklyRevenueSummaryViewProps {
  onSelectDate?: (date: string) => void;
}

export type ChartVisualizationMode = 'bar' | 'area' | 'composed' | 'stacked';

export const WeeklyRevenueSummaryView: React.FC<WeeklyRevenueSummaryViewProps> = ({ onSelectDate }) => {
  const { 
    merchantSettlements, 
    selectedSettlementRestId, 
    setSelectedSettlementRestId,
    selectedSettlementDate,
    setSelectedSettlementDate,
    activeMerchant,
    triggerToast
  } = useApp();

  // Scope: 'selected' for current restaurant, 'all' for network-wide
  const [scope, setScope] = useState<'selected' | 'all'>('selected');
  // Metric display mode for standard bar chart: 'gross' | 'net' | 'both'
  const [metricMode, setMetricMode] = useState<'gross' | 'net' | 'both'>('both');
  // Chart visualization type
  const [chartType, setChartType] = useState<ChartVisualizationMode>('bar');
  // Week period: 'current' (7-13 Sep 2026) or 'previous' (31 Aug - 6 Sep 2026)
  const [weekPeriod, setWeekPeriod] = useState<'current' | 'previous'>('current');
  // Show target reference line
  const [showTargetLine, setShowTargetLine] = useState<boolean>(true);
  // Weekly Target Goal (in THB)
  const [weeklyGoal, setWeeklyGoal] = useState<number>(150000);

  const currentRestaurant = useMemo(() => {
    return RESTAURANTS_DATA.find(r => r.id === selectedSettlementRestId) || RESTAURANTS_DATA[0];
  }, [selectedSettlementRestId]);

  // Current Week (7 Sep - 13 Sep 2026)
  const currentWeekDates = useMemo(() => [
    { date: '2026-09-07', dayName: 'จันทร์', dayShort: 'จ.', label: '7 ก.ย.' },
    { date: '2026-09-08', dayName: 'อังคาร', dayShort: 'อ.', label: '8 ก.ย.' },
    { date: '2026-09-09', dayName: 'พุธ', dayShort: 'พ.', label: '9 ก.ย.' },
    { date: '2026-09-10', dayName: 'พฤหัสบดี', dayShort: 'พฤ.', label: '10 ก.ย.' },
    { date: '2026-09-11', dayName: 'ศุกร์', dayShort: 'ศ.', label: '11 ก.ย.' },
    { date: '2026-09-12', dayName: 'เสาร์', dayShort: 'ส.', label: '12 ก.ย.' },
    { date: '2026-09-13', dayName: 'อาทิตย์', dayShort: 'อา.', label: '13 ก.ย.' },
  ], []);

  // Previous Week (31 Aug - 6 Sep 2026)
  const prevWeekDates = useMemo(() => [
    { date: '2026-08-31', dayName: 'จันทร์', dayShort: 'จ.', label: '31 ส.ค.' },
    { date: '2026-09-01', dayName: 'อังคาร', dayShort: 'อ.', label: '1 ก.ย.' },
    { date: '2026-09-02', dayName: 'พุธ', dayShort: 'พ.', label: '2 ก.ย.' },
    { date: '2026-09-03', dayName: 'พฤหัสบดี', dayShort: 'พฤ.', label: '3 ก.ย.' },
    { date: '2026-09-04', dayName: 'ศุกร์', dayShort: 'ศ.', label: '4 ก.ย.' },
    { date: '2026-09-05', dayName: 'เสาร์', dayShort: 'ส.', label: '5 ก.ย.' },
    { date: '2026-09-06', dayName: 'อาทิตย์', dayShort: 'อา.', label: '6 ก.ย.' },
  ], []);

  const activeDates = weekPeriod === 'current' ? currentWeekDates : prevWeekDates;

  // Compute daily trends for each day
  const weeklyTrendsData: DailyRevenueItem[] = useMemo(() => {
    const getRestBaseRevenue = (restId: string) => {
      switch (restId) {
        case 'rest_1': return 28000;
        case 'rest_2': return 22000;
        case 'rest_3': return 31000;
        case 'rest_4': return 16000;
        case 'rest_5': return 26000;
        case 'rest_6': return 19000;
        default: return 20000;
      }
    };

    const dayMultipliers: Record<string, number> = {
      // Current Week
      '2026-09-07': 0.78,
      '2026-09-08': 0.84,
      '2026-09-09': 0.92,
      '2026-09-10': 0.98,
      '2026-09-11': 1.28,
      '2026-09-12': 1.38,
      '2026-09-13': 1.22,
      // Previous Week
      '2026-08-31': 0.72,
      '2026-09-01': 0.76,
      '2026-09-02': 0.82,
      '2026-09-03': 0.88,
      '2026-09-04': 1.15,
      '2026-09-05': 1.25,
      '2026-09-06': 1.10,
    };

    const rawItems = activeDates.map(dayInfo => {
      let gross = 0;
      let net = 0;
      let gp = 0;
      let fees = 0;
      let orders = 0;
      let tips = 0;
      let status: 'paid' | 'pending' | 'review' = 'paid';

      if (scope === 'selected') {
        const exactMatch = merchantSettlements.find(
          s => s.restaurantId === selectedSettlementRestId && s.date === dayInfo.date
        );

        if (exactMatch) {
          gross = exactMatch.grossSales;
          net = exactMatch.netPayoutPayable;
          gp = exactMatch.platformGpFee;
          fees = Math.round(exactMatch.paymentGatewayFeeMdr + exactMatch.vatOnGp - (exactMatch.whtDeductedByPlatform || 0));
          orders = exactMatch.completedOrdersCount || exactMatch.totalOrdersCount || 42;
          tips = exactMatch.totalTipsReceived || Math.round(orders * 18);
          status = exactMatch.status;
        } else {
          const base = getRestBaseRevenue(selectedSettlementRestId);
          const mult = dayMultipliers[dayInfo.date] || 1.0;
          gross = Math.round(base * mult);
          gp = Math.round(gross * 0.20);
          fees = Math.round(gross * 0.028);
          net = Math.max(0, gross - gp - fees);
          orders = Math.round(gross / 480);
          tips = Math.round(orders * 22);
          status = dayInfo.date === '2026-09-12' || dayInfo.date === '2026-09-13' ? 'pending' : 'paid';
        }
      } else {
        const matchingSettlements = merchantSettlements.filter(s => s.date === dayInfo.date);
        
        if (matchingSettlements.length > 0) {
          matchingSettlements.forEach(s => {
            gross += s.grossSales;
            net += s.netPayoutPayable;
            gp += s.platformGpFee;
            fees += Math.round(s.paymentGatewayFeeMdr + s.vatOnGp);
            orders += s.completedOrdersCount || s.totalOrdersCount || 0;
            tips += s.totalTipsReceived || 0;
          });

          const missingCount = RESTAURANTS_DATA.length - matchingSettlements.length;
          if (missingCount > 0) {
            const mult = dayMultipliers[dayInfo.date] || 1.0;
            const avgBase = 23000 * mult;
            const simGross = Math.round(avgBase * missingCount);
            gross += simGross;
            gp += Math.round(simGross * 0.20);
            fees += Math.round(simGross * 0.028);
            net += Math.round(simGross * 0.772);
            orders += Math.round((simGross / 480));
            tips += Math.round(orders * 20);
          }
        } else {
          RESTAURANTS_DATA.forEach(r => {
            const base = getRestBaseRevenue(r.id);
            const mult = dayMultipliers[dayInfo.date] || 1.0;
            const g = Math.round(base * mult);
            gross += g;
            gp += Math.round(g * 0.20);
            fees += Math.round(g * 0.028);
            net += Math.round(g * 0.772);
            orders += Math.round(g / 480);
            tips += Math.round(orders * 20);
          });
        }
        status = dayInfo.date === '2026-09-12' || dayInfo.date === '2026-09-13' ? 'pending' : 'paid';
      }

      const aov = orders > 0 ? Math.round(gross / orders) : 0;

      return {
        date: dayInfo.date,
        dayName: dayInfo.dayName,
        dayShort: dayInfo.dayShort,
        fullLabel: `${dayInfo.dayShort} ${dayInfo.label}`,
        grossSales: gross,
        netPayout: net,
        platformGp: gp,
        feesAndTax: fees,
        totalOrders: orders,
        aov,
        tips,
        isToday: dayInfo.date === '2026-09-12' || dayInfo.date === '2026-09-13',
        isPeak: false,
        status,
      };
    });

    const maxGross = Math.max(...rawItems.map(d => d.grossSales));

    return rawItems.map(item => ({
      ...item,
      isPeak: item.grossSales === maxGross,
    }));
  }, [activeDates, scope, selectedSettlementRestId, merchantSettlements]);

  // Aggregate Weekly KPIs
  const weeklySummary = useMemo(() => {
    const totalGross = weeklyTrendsData.reduce((acc, curr) => acc + curr.grossSales, 0);
    const totalNet = weeklyTrendsData.reduce((acc, curr) => acc + curr.netPayout, 0);
    const totalGp = weeklyTrendsData.reduce((acc, curr) => acc + curr.platformGp, 0);
    const totalOrders = weeklyTrendsData.reduce((acc, curr) => acc + curr.totalOrders, 0);
    const totalTips = weeklyTrendsData.reduce((acc, curr) => acc + curr.tips, 0);
    const dailyAverageGross = Math.round(totalGross / (weeklyTrendsData.length || 1));
    const dailyAverageNet = Math.round(totalNet / (weeklyTrendsData.length || 1));
    const weeklyAov = totalOrders > 0 ? Math.round(totalGross / totalOrders) : 0;
    const peakDay = weeklyTrendsData.find(d => d.isPeak) || weeklyTrendsData[5] || weeklyTrendsData[0];
    const targetProgressPct = Math.min(150, Math.round((totalGross / (weeklyGoal || 1)) * 100));

    return {
      totalGross,
      totalNet,
      totalGp,
      totalOrders,
      totalTips,
      dailyAverageGross,
      dailyAverageNet,
      weeklyAov,
      peakDay,
      growthPct: weekPeriod === 'current' ? 14.8 : 8.2,
      targetProgressPct,
    };
  }, [weeklyTrendsData, weeklyGoal, weekPeriod]);

  // Currently selected day item in the week
  const selectedDayItem = useMemo(() => {
    return weeklyTrendsData.find(d => d.date === selectedSettlementDate) || weeklyTrendsData[weeklyTrendsData.length - 1];
  }, [weeklyTrendsData, selectedSettlementDate]);

  // Custom Chart Tooltip
  const CustomChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: DailyRevenueItem = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs min-w-[220px] space-y-2 select-none">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold text-white text-xs">{data.dayName} ({data.date})</span>
            </div>
            {data.isPeak ? (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-extrabold text-[9px] border border-amber-500/40 flex items-center gap-0.5">
                <Flame className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                Peak
              </span>
            ) : data.isToday ? (
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[9px]">
                วันนี้
              </span>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                ยอดขายรวม (Gross):
              </span>
              <span className="font-extrabold text-emerald-400">
                ฿{data.grossSales.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                ยอดสุทธิร้านค้า (Net):
              </span>
              <span className="font-extrabold text-blue-400">
                ฿{data.netPayout.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                หัก GP แพลตฟอร์ม:
              </span>
              <span className="font-bold text-rose-300">
                -฿{data.platformGp.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px] text-slate-300">
              <span>จำนวนคำสั่งซื้อ:</span>
              <span className="font-semibold text-white">{data.totalOrders} ออเดอร์</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span>ยอดเฉลี่ยต่อบิล (AOV):</span>
              <span className="font-semibold text-amber-300">฿{data.aov} / บิล</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span>ทิปพนักงานส่ง:</span>
              <span className="font-semibold text-purple-300">฿{data.tips.toLocaleString()}</span>
            </div>
          </div>

          <div className="text-[9px] text-emerald-300 pt-1 text-center font-medium border-t border-slate-800">
            👉 คลิกเพื่อเลือกรอบบัญชีและดูรายละเอียด
          </div>
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (entry: any) => {
    if (!entry) return;
    const clickedDate = entry.date;
    if (clickedDate) {
      setSelectedSettlementDate(clickedDate);
      if (onSelectDate) onSelectDate(clickedDate);
      triggerToast(`เลือกรอบบัญชีวันที่ ${clickedDate} (${entry.dayName}) เรียบร้อย`);
    }
  };

  // Export Weekly Report to CSV
  const handleExportCsv = () => {
    const headers = ['วันที่', 'วัน', 'ยอดขายรวม_Gross_THB', 'หัก_GP_THB', 'ค่าธรรมเนียมและภาษี_THB', 'เงินโอนสุทธิ_Net_THB', 'จำนวนออเดอร์', 'ยอดเฉลี่ยต่อบิล_THB', 'ทิปไรเดอร์_THB', 'สถานะ'];
    const rows = weeklyTrendsData.map(d => [
      d.date,
      d.dayName,
      d.grossSales,
      d.platformGp,
      d.feesAndTax,
      d.netPayout,
      d.totalOrders,
      d.aov,
      d.tips,
      d.status === 'paid' ? 'โอนแล้ว' : 'รอดำเนินการ'
    ]);

    const csvContent = '\uFEFF' + [
      `รายงานสรุปยอดขายรายสัปดาห์ - ${currentRestaurant.name}`,
      `ช่วงเวลา: ${weekPeriod === 'current' ? '7-13 ก.ย. 2026' : '31 ส.ค. - 6 ก.ย. 2026'}`,
      `ยอดขายรวมทั้งสัปดาห์: ฿${weeklySummary.totalGross.toLocaleString()} | เงินโอนสุทธิ: ฿${weeklySummary.totalNet.toLocaleString()}`,
      '',
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `weekly-sales-${selectedSettlementRestId}-${weekPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast('ดาวน์โหลดรายงานยอดขายรายสัปดาห์ (CSV) เรียบร้อย');
  };

  return (
    <div 
      id="merchant-weekly-revenue-summary-view"
      className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-4"
    >
      {/* View Header with Title, Period Switch & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md shadow-emerald-600/20 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                สรุปยอดขายรายวันและภาพรวมรายได้รายสัปดาห์ (Recharts Engine)
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                <span>วิเคราะห์อัตโนมัติ</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              กราฟแท่งและแนวโน้มรายได้ 7 วัน เปรียบเทียบยอดขายรวม (Gross Sales) และเงินโอนสุทธิ (Net Payout)
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
          {/* Week Period Selector */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs">
            <button
              id="weekly-period-current-btn"
              onClick={() => setWeekPeriod('current')}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                weekPeriod === 'current'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              สัปดาห์นี้ (7-13 ก.ย.)
            </button>
            <button
              id="weekly-period-prev-btn"
              onClick={() => setWeekPeriod('previous')}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                weekPeriod === 'previous'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              สัปดาห์ที่แล้ว (31 ส.ค.-6 ก.ย.)
            </button>
          </div>

          {/* Scope Selector: Current Restaurant vs All */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs">
            <button
              id="weekly-scope-selected-btn"
              onClick={() => setScope('selected')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                scope === 'selected'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              <span className="truncate max-w-[100px] sm:max-w-[130px]">{currentRestaurant.name}</span>
            </button>
            <button
              id="weekly-scope-all-btn"
              onClick={() => setScope('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                scope === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>ทุกร้านค้า ({RESTAURANTS_DATA.length})</span>
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            id="export-weekly-csv-btn"
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="ดาวน์โหลดรายงานยอดขาย 7 วันในรูปแบบ CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">ส่งออก CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Primary KPI Summary Cards + Weekly Target Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* 1. Total Weekly Gross */}
        <div className="bg-gradient-to-br from-emerald-50/70 to-emerald-100/30 p-3.5 rounded-2xl border border-emerald-200/80 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center justify-between">
            <span>ยอดขายรวม 7 วัน (Gross)</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          </span>
          <div className="text-lg sm:text-xl font-black text-slate-900">
            ฿{weeklySummary.totalGross.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-emerald-600" />
            <span>+{weeklySummary.growthPct}% เทียบรอบก่อนหน้า</span>
          </div>
        </div>

        {/* 2. Total Weekly Net Payout */}
        <div className="bg-gradient-to-br from-blue-50/70 to-blue-100/30 p-3.5 rounded-2xl border border-blue-200/80 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 flex items-center justify-between">
            <span>เงินโอนสุทธิเข้าร้าน (Net Payout)</span>
            <Award className="w-3.5 h-3.5 text-blue-600" />
          </span>
          <div className="text-lg sm:text-xl font-black text-blue-950">
            ฿{weeklySummary.totalNet.toLocaleString()}
          </div>
          <div className="text-[10px] text-blue-700 font-medium">
            สัดส่วน {( (weeklySummary.totalNet / (weeklySummary.totalGross || 1)) * 100 ).toFixed(1)}% ของยอดรวม (หัก GP ฿{weeklySummary.totalGp.toLocaleString()})
          </div>
        </div>

        {/* 3. Daily Average & AOV */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>เฉลี่ยต่อวัน / ยอดต่อบิล</span>
            <Layers className="w-3.5 h-3.5 text-slate-600" />
          </span>
          <div className="text-lg sm:text-xl font-black text-slate-900">
            ฿{weeklySummary.dailyAverageGross.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-600 font-medium flex items-center justify-between">
            <span>เฉลี่ยบิลละ: <strong className="text-slate-900 font-bold">฿{weeklySummary.weeklyAov}</strong></span>
            <span className="text-slate-400">({weeklySummary.totalOrders} บิล)</span>
          </div>
        </div>

        {/* 4. Peak Day (Highest Revenue) */}
        <div className="bg-gradient-to-br from-amber-50/70 to-amber-100/40 p-3.5 rounded-2xl border border-amber-200/80 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 flex items-center justify-between">
            <span>วันที่ยอดสูงสุด (Peak Day)</span>
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          </span>
          <div className="text-base sm:text-lg font-black text-amber-950 truncate">
            {weeklySummary.peakDay.dayName} ({weeklySummary.peakDay.fullLabel})
          </div>
          <div className="text-[10px] font-extrabold text-amber-700 flex items-center justify-between">
            <span>฿{weeklySummary.peakDay.grossSales.toLocaleString()}</span>
            <span className="bg-amber-200/60 px-1.5 py-0.5 rounded text-[9px] text-amber-900">{weeklySummary.peakDay.totalOrders} ออเดอร์</span>
          </div>
        </div>
      </div>

      {/* Target Progress Bar */}
      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">เป้าหมายยอดขายสัปดาห์นี้:</span>
              <span className="font-extrabold text-slate-900">฿{weeklyGoal.toLocaleString()}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                weeklySummary.totalGross >= weeklyGoal ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {weeklySummary.targetProgressPct}% สำเร็จ
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {weeklySummary.totalGross >= weeklyGoal
                ? `ยอดขายทะลุเป้าหมายไปแล้ว +฿${(weeklySummary.totalGross - weeklyGoal).toLocaleString()} 🎉`
                : `ต้องการอีก ฿${(weeklyGoal - weeklySummary.totalGross).toLocaleString()} เพื่อบรรลุเป้าหมาย`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:w-64 shrink-0">
          <div className="flex-1 bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, weeklySummary.targetProgressPct)}%` }}
            />
          </div>
          <button
            onClick={() => setShowTargetLine(!showTargetLine)}
            className={`text-[10px] font-bold px-2 py-1 rounded-md border cursor-pointer ${
              showTargetLine ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-slate-200 text-slate-500'
            }`}
          >
            {showTargetLine ? 'ซ่อนเส้นเป้า' : 'แสดงเส้นเป้า'}
          </button>
        </div>
      </div>

      {/* Chart Control Tabs: Choose Chart Visualization Style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
        {/* Visualization Type Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl self-start overflow-x-auto no-scrollbar max-w-full">
          <button
            id="chart-type-bar-btn"
            onClick={() => setChartType('bar')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              chartType === 'bar'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
            <span>กราฟแท่ง (Bar)</span>
          </button>

          <button
            id="chart-type-area-btn"
            onClick={() => setChartType('area')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              chartType === 'area'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span>แนวโน้มพื้นที่ (Area Trend)</span>
          </button>

          <button
            id="chart-type-composed-btn"
            onClick={() => setChartType('composed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              chartType === 'composed'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LineChartIcon className="w-3.5 h-3.5 text-purple-600" />
            <span>ยอดขาย + ออเดอร์ (Dual-Axis)</span>
          </button>

          <button
            id="chart-type-stacked-btn"
            onClick={() => setChartType('stacked')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              chartType === 'stacked'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieChart className="w-3.5 h-3.5 text-amber-600" />
            <span>สัดส่วน GP & เงินโอน (Stacked)</span>
          </button>
        </div>

        {/* Secondary Sub-controls for Bar chart */}
        {chartType === 'bar' && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs">
            <button
              onClick={() => setMetricMode('gross')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                metricMode === 'gross' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ยอดขาย
            </button>
            <button
              onClick={() => setMetricMode('net')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                metricMode === 'net' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ยอดสุทธิ
            </button>
            <button
              onClick={() => setMetricMode('both')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                metricMode === 'both' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              เทียบทั้งคู่
            </button>
          </div>
        )}
      </div>

      {/* Main Recharts Container */}
      <div className="p-3 sm:p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1 pb-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">
              {chartType === 'bar' && 'กราฟแท่งแสดงยอดขายรวมและยอดเงินโอนสุทธิรายวัน'}
              {chartType === 'area' && 'กราฟพื้นที่แสดงแนวโน้มยอดขายเทียบค่าเฉลี่ยรายวัน'}
              {chartType === 'composed' && 'กราฟคู่: ยอดขายรวม (แกนซ้าย ฿) เทียบจำนวนออเดอร์ (แกนขวา บิล)'}
              {chartType === 'stacked' && 'กราฟแท่งแบบเรียงซ้อน: เงินโอนสุทธิ + ค่าธรรมเนียม GP + ค่าตัดบัตร/ภาษี'}
            </span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
              {chartType === 'composed' ? '฿ และ ออเดอร์' : 'หน่วย: บาท (THB)'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            💡 คลิกที่แท่งหรือจุดกราฟเพื่อเลือกรอบบัญชีวันนั้น
          </span>
        </div>

        {/* Dynamic Recharts Visualization */}
        <div className="w-full h-72 sm:h-80 select-none">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              /* 1. Bar Chart Comparison */
              <BarChart
                data={weeklyTrendsData}
                margin={{ top: 12, right: 10, left: -12, bottom: 4 }}
                onClick={(state: any) => {
                  if (state && state.activePayload && state.activePayload.length > 0) {
                    handleBarClick(state.activePayload[0].payload);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis 
                  dataKey="fullLabel" 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false}
                  tick={{ fill: '#475569', fontWeight: 600 }}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val: number) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${val}`}
                />
                <Tooltip content={<CustomChartTooltip />} cursor={{ fill: '#f1f5f9', opacity: 0.8 }} />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '10px', fontSize: '11px', fontWeight: 'bold' }}
                />

                {showTargetLine && (
                  <ReferenceLine 
                    y={weeklySummary.dailyAverageGross} 
                    stroke="#f59e0b" 
                    strokeDasharray="4 4" 
                    label={{ value: `ค่าเฉลี่ย ฿${weeklySummary.dailyAverageGross.toLocaleString()}`, fill: '#b45309', fontSize: 10, position: 'right' }} 
                  />
                )}

                {(metricMode === 'gross' || metricMode === 'both') && (
                  <Bar 
                    dataKey="grossSales" 
                    name="ยอดขายรวม (Gross Sales)" 
                    fill="#059669" 
                    radius={[6, 6, 0, 0]}
                    animationDuration={600}
                  >
                    {weeklyTrendsData.map((entry) => {
                      const isSelectedDate = entry.date === selectedSettlementDate;
                      return (
                        <Cell 
                          key={`cell-gross-${entry.date}`} 
                          fill={isSelectedDate ? '#10b981' : entry.isPeak ? '#047857' : '#059669'} 
                          stroke={isSelectedDate ? '#064e3b' : 'transparent'}
                          strokeWidth={isSelectedDate ? 2.5 : 0}
                          cursor="pointer"
                        />
                      );
                    })}
                  </Bar>
                )}

                {(metricMode === 'net' || metricMode === 'both') && (
                  <Bar 
                    dataKey="netPayout" 
                    name="ยอดสุทธิร้านค้า (Net Payout)" 
                    fill="#3b82f6" 
                    radius={[6, 6, 0, 0]}
                    animationDuration={600}
                  >
                    {weeklyTrendsData.map((entry) => {
                      const isSelectedDate = entry.date === selectedSettlementDate;
                      return (
                        <Cell 
                          key={`cell-net-${entry.date}`} 
                          fill={isSelectedDate ? '#60a5fa' : '#2563eb'} 
                          stroke={isSelectedDate ? '#1e3a8a' : 'transparent'}
                          strokeWidth={isSelectedDate ? 2.5 : 0}
                          cursor="pointer"
                        />
                      );
                    })}
                  </Bar>
                )}
              </BarChart>
            ) : chartType === 'area' ? (
              /* 2. Area Trend Chart */
              <AreaChart
                data={weeklyTrendsData}
                margin={{ top: 12, right: 10, left: -12, bottom: 4 }}
                onClick={(state: any) => {
                  if (state && state.activePayload && state.activePayload.length > 0) {
                    handleBarClick(state.activePayload[0].payload);
                  }
                }}
              >
                <defs>
                  <linearGradient id="grossGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis 
                  dataKey="fullLabel" 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false}
                  tick={{ fill: '#475569', fontWeight: 600 }}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val: number) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${val}`}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '10px', fontSize: '11px', fontWeight: 'bold' }}
                />
                {showTargetLine && (
                  <ReferenceLine 
                    y={weeklySummary.dailyAverageGross} 
                    stroke="#f59e0b" 
                    strokeDasharray="4 4" 
                    label={{ value: `เฉลี่ย ฿${weeklySummary.dailyAverageGross.toLocaleString()}`, fill: '#b45309', fontSize: 10, position: 'insideTopLeft' }} 
                  />
                )}
                <Area 
                  type="monotone" 
                  dataKey="grossSales" 
                  name="ยอดขายรวม (Gross)" 
                  stroke="#059669" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#grossGradient)" 
                  activeDot={{ r: 6, fill: '#047857', stroke: '#ffffff', strokeWidth: 2 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="netPayout" 
                  name="เงินโอนสุทธิ (Net)" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#netGradient)" 
                  activeDot={{ r: 5, fill: '#1d4ed8', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            ) : chartType === 'composed' ? (
              /* 3. Dual-Axis Composed Chart (Sales in ฿ vs Orders in Count) */
              <ComposedChart
                data={weeklyTrendsData}
                margin={{ top: 12, right: 10, left: -12, bottom: 4 }}
                onClick={(state: any) => {
                  if (state && state.activePayload && state.activePayload.length > 0) {
                    handleBarClick(state.activePayload[0].payload);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis 
                  dataKey="fullLabel" 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false}
                  tick={{ fill: '#475569', fontWeight: 600 }}
                />
                {/* Left Y Axis: Gross Sales (฿) */}
                <YAxis 
                  yAxisId="left"
                  stroke="#059669" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val: number) => `฿${(val / 1000).toFixed(0)}k`}
                />
                {/* Right Y Axis: Order Count */}
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#7c3aed" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val: number) => `${val} บิล`}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '10px', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Bar 
                  yAxisId="left"
                  dataKey="grossSales" 
                  name="ยอดขายรวม (฿)" 
                  fill="#10b981" 
                  radius={[6, 6, 0, 0]}
                  animationDuration={600}
                >
                  {weeklyTrendsData.map((entry) => {
                    const isSelectedDate = entry.date === selectedSettlementDate;
                    return (
                      <Cell 
                        key={`cell-comp-${entry.date}`} 
                        fill={isSelectedDate ? '#059669' : '#34d399'} 
                        stroke={isSelectedDate ? '#064e3b' : 'transparent'}
                        strokeWidth={isSelectedDate ? 2 : 0}
                      />
                    );
                  })}
                </Bar>
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="totalOrders" 
                  name="จำนวนออเดอร์ (บิล)" 
                  stroke="#7c3aed" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#7c3aed', stroke: '#ffffff', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#6d28d9', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </ComposedChart>
            ) : (
              /* 4. Stacked Breakdown Chart: Net + GP + Tax/MDR */
              <BarChart
                data={weeklyTrendsData}
                margin={{ top: 12, right: 10, left: -12, bottom: 4 }}
                onClick={(state: any) => {
                  if (state && state.activePayload && state.activePayload.length > 0) {
                    handleBarClick(state.activePayload[0].payload);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis 
                  dataKey="fullLabel" 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false}
                  tick={{ fill: '#475569', fontWeight: 600 }}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val: number) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${val}`}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '10px', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Bar 
                  dataKey="netPayout" 
                  name="เงินโอนสุทธิ (Net Payout)" 
                  stackId="a" 
                  fill="#3b82f6" 
                />
                <Bar 
                  dataKey="platformGp" 
                  name="หักค่า GP แพลตฟอร์ม" 
                  stackId="a" 
                  fill="#f43f5e" 
                />
                <Bar 
                  dataKey="feesAndTax" 
                  name="ค่าตัดบัตร & ภาษี" 
                  stackId="a" 
                  fill="#cbd5e1" 
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Selected Day Drill-down Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-3.5 sm:p-4 shadow-sm border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-black text-white">
                สรุปยอดขายรอบวัน: {selectedDayItem.dayName}ที่ {selectedDayItem.date}
              </span>
              {selectedDayItem.isPeak && (
                <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-black">
                  🔥 ยอดสูงสุดประจำสัปดาห์
                </span>
              )}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                selectedDayItem.status === 'paid' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {selectedDayItem.status === 'paid' ? 'โอนแล้ว' : 'รอดำเนินการโอน'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300 mt-1 flex-wrap">
              <span>ยอดขาย: <strong className="text-white font-bold">฿{selectedDayItem.grossSales.toLocaleString()}</strong></span>
              <span>•</span>
              <span>หัก GP: <strong className="text-rose-300 font-bold">-฿{selectedDayItem.platformGp.toLocaleString()}</strong></span>
              <span>•</span>
              <span>เงินโอนสุทธิ: <strong className="text-emerald-400 font-extrabold">฿{selectedDayItem.netPayout.toLocaleString()}</strong></span>
              <span>•</span>
              <span>{selectedDayItem.totalOrders} ออเดอร์ (เฉลี่ย ฿{selectedDayItem.aov}/บิล)</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            const tableElement = document.getElementById('merchant-orders-breakdown-section');
            if (tableElement) {
              tableElement.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 self-start md:self-auto cursor-pointer shadow-xs shrink-0 transition-colors"
        >
          <span>ดูรายการคำสั่งซื้อวันนี้</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 7-Day Quick Scroller Pills */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span className="font-bold text-slate-700 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            ตารางสรุปรายได้รายวันประจำสัปดาห์ (คลิกเพื่อเลือกดูรอบวัน):
          </span>
          <span className="text-[10px] text-slate-400">
            รอบวันที่เลือก: <span className="font-bold text-emerald-700">{selectedSettlementDate}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {weeklyTrendsData.map((item) => {
            const isSelected = item.date === selectedSettlementDate;
            return (
              <button
                key={item.date}
                id={`weekly-day-pill-${item.date}`}
                onClick={() => {
                  setSelectedSettlementDate(item.date);
                  if (onSelectDate) onSelectDate(item.date);
                }}
                className={`p-2.5 rounded-2xl text-left transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-emerald-500/50'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-[11px] font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {item.fullLabel}
                  </span>
                  {item.isPeak ? (
                    <span className="px-1 py-0.2 rounded bg-amber-500 text-slate-950 text-[9px] font-black">
                      Peak
                    </span>
                  ) : item.isToday ? (
                    <span className="px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[8px] font-bold">
                      วันนี้
                    </span>
                  ) : null}
                </div>
                <div className={`text-xs font-black mt-1 ${isSelected ? 'text-emerald-300' : 'text-emerald-600'}`}>
                  ฿{item.grossSales.toLocaleString()}
                </div>
                <div className={`text-[10px] flex items-center justify-between mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  <span>{item.totalOrders} บิล</span>
                  <span className="font-medium text-[9px] opacity-80">Net: ฿{item.netPayout.toLocaleString()}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
