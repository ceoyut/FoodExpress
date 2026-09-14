import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
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
  Info
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
  totalOrders: number;
  tips: number;
  isToday: boolean;
  isPeak: boolean;
}

interface WeeklyRevenueSummaryViewProps {
  onSelectDate?: (date: string) => void;
}

export const WeeklyRevenueSummaryView: React.FC<WeeklyRevenueSummaryViewProps> = ({ onSelectDate }) => {
  const { 
    merchantSettlements, 
    selectedSettlementRestId, 
    setSelectedSettlementRestId,
    selectedSettlementDate,
    setSelectedSettlementDate 
  } = useApp();

  // Scope: 'selected' for current restaurant, 'all' for network-wide
  const [scope, setScope] = useState<'selected' | 'all'>('selected');
  // Metric display mode: 'gross' | 'net' | 'both'
  const [metricMode, setMetricMode] = useState<'gross' | 'net' | 'both'>('both');
  // Hovered day for interactive telemetry
  const [activeHoverDay, setActiveHoverDay] = useState<DailyRevenueItem | null>(null);

  const currentRestaurant = useMemo(() => {
    return RESTAURANTS_DATA.find(r => r.id === selectedSettlementRestId) || RESTAURANTS_DATA[0];
  }, [selectedSettlementRestId]);

  // Define the 7 days of the current week (7 Sep - 13 Sep 2026)
  const currentWeekDates = useMemo(() => [
    { date: '2026-09-07', dayName: 'จันทร์', dayShort: 'จ.', label: '7 ก.ย.' },
    { date: '2026-09-08', dayName: 'อังคาร', dayShort: 'อ.', label: '8 ก.ย.' },
    { date: '2026-09-09', dayName: 'พุธ', dayShort: 'พ.', label: '9 ก.ย.' },
    { date: '2026-09-10', dayName: 'พฤหัสบดี', dayShort: 'พฤ.', label: '10 ก.ย.' },
    { date: '2026-09-11', dayName: 'ศุกร์', dayShort: 'ศ.', label: '11 ก.ย.' },
    { date: '2026-09-12', dayName: 'เสาร์', dayShort: 'ส.', label: '12 ก.ย.' },
    { date: '2026-09-13', dayName: 'อาทิตย์', dayShort: 'อา.', label: '13 ก.ย.' },
  ], []);

  // Compute daily trends for each day of the current week
  const weeklyTrendsData: DailyRevenueItem[] = useMemo(() => {
    // Determine baseline multiplier per restaurant to produce realistic, smooth variance
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

    // Day multiplier pattern across the week (Weekends & Friday peak higher)
    const dayMultipliers: Record<string, number> = {
      '2026-09-07': 0.78, // Mon
      '2026-09-08': 0.84, // Tue
      '2026-09-09': 0.92, // Wed
      '2026-09-10': 0.98, // Thu
      '2026-09-11': 1.28, // Fri peak
      '2026-09-12': 1.38, // Sat peak
      '2026-09-13': 1.22, // Sun
    };

    // First, pass through all days to compute raw amounts
    const rawItems = currentWeekDates.map(dayInfo => {
      let gross = 0;
      let net = 0;
      let orders = 0;
      let tips = 0;

      if (scope === 'selected') {
        // Look for exact match in merchantSettlements state
        const exactMatch = merchantSettlements.find(
          s => s.restaurantId === selectedSettlementRestId && s.date === dayInfo.date
        );

        if (exactMatch) {
          gross = exactMatch.grossSales;
          net = exactMatch.netPayoutPayable;
          orders = exactMatch.completedOrdersCount || exactMatch.totalOrdersCount || 42;
          tips = exactMatch.totalTipsReceived || Math.round(orders * 18);
        } else {
          // Compute realistic simulated revenue based on store baseline & day multiplier
          const base = getRestBaseRevenue(selectedSettlementRestId);
          const mult = dayMultipliers[dayInfo.date] || 1.0;
          gross = Math.round(base * mult);
          // Realistic Net Payout (approx ~76-78% of gross after 20% GP, MDR, VAT & WHT)
          net = Math.round(gross * 0.772);
          orders = Math.round(gross / 480);
          tips = Math.round(orders * 22);
        }
      } else {
        // Aggregate all restaurants across network
        const matchingSettlements = merchantSettlements.filter(s => s.date === dayInfo.date);
        
        if (matchingSettlements.length > 0) {
          matchingSettlements.forEach(s => {
            gross += s.grossSales;
            net += s.netPayoutPayable;
            orders += s.completedOrdersCount || s.totalOrdersCount || 0;
            tips += s.totalTipsReceived || 0;
          });

          // If some restaurants don't have records for this date, add proportional baseline
          const missingCount = RESTAURANTS_DATA.length - matchingSettlements.length;
          if (missingCount > 0) {
            const mult = dayMultipliers[dayInfo.date] || 1.0;
            const avgBase = 23000 * mult;
            gross += Math.round(avgBase * missingCount);
            net += Math.round(avgBase * 0.77 * missingCount);
            orders += Math.round((avgBase / 480) * missingCount);
            tips += Math.round(orders * 20);
          }
        } else {
          // Estimate all restaurants for that day
          RESTAURANTS_DATA.forEach(r => {
            const base = getRestBaseRevenue(r.id);
            const mult = dayMultipliers[dayInfo.date] || 1.0;
            const g = Math.round(base * mult);
            gross += g;
            net += Math.round(g * 0.772);
            orders += Math.round(g / 480);
            tips += Math.round(orders * 20);
          });
        }
      }

      return {
        date: dayInfo.date,
        dayName: dayInfo.dayName,
        dayShort: dayInfo.dayShort,
        fullLabel: `${dayInfo.dayShort} ${dayInfo.label}`,
        grossSales: gross,
        netPayout: net,
        totalOrders: orders,
        tips,
        isToday: dayInfo.date === '2026-09-12' || dayInfo.date === '2026-09-13',
        isPeak: false,
      };
    });

    // Find peak gross revenue value
    const maxGross = Math.max(...rawItems.map(d => d.grossSales));

    return rawItems.map(item => ({
      ...item,
      isPeak: item.grossSales === maxGross,
    }));
  }, [currentWeekDates, scope, selectedSettlementRestId, merchantSettlements]);

  // Aggregate Weekly KPIs
  const weeklySummary = useMemo(() => {
    const totalGross = weeklyTrendsData.reduce((acc, curr) => acc + curr.grossSales, 0);
    const totalNet = weeklyTrendsData.reduce((acc, curr) => acc + curr.netPayout, 0);
    const totalOrders = weeklyTrendsData.reduce((acc, curr) => acc + curr.totalOrders, 0);
    const totalTips = weeklyTrendsData.reduce((acc, curr) => acc + curr.tips, 0);
    const dailyAverageGross = Math.round(totalGross / weeklyTrendsData.length);
    const peakDay = weeklyTrendsData.find(d => d.isPeak) || weeklyTrendsData[5];

    return {
      totalGross,
      totalNet,
      totalOrders,
      totalTips,
      dailyAverageGross,
      peakDay,
      growthPct: 14.8, // Compared to previous week
    };
  }, [weeklyTrendsData]);

  // Custom Chart Tooltip
  const CustomChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: DailyRevenueItem = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs min-w-[210px] space-y-2 select-none">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold text-white text-xs">{data.dayName} ({data.date})</span>
            </div>
            {data.isPeak && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-extrabold text-[9px] border border-amber-500/40 flex items-center gap-0.5">
                <Flame className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                Peak
              </span>
            )}
          </div>

          <div className="space-y-1">
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

            <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px] text-slate-300">
              <span>จำนวนคำสั่งซื้อ:</span>
              <span className="font-semibold">{data.totalOrders} ออเดอร์</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span>ทิปพนักงานจัดส่ง:</span>
              <span className="font-semibold text-purple-300">฿{data.tips.toLocaleString()}</span>
            </div>
          </div>

          <div className="text-[9px] text-slate-400 pt-1 text-center italic">
            คลิกที่แท่งกราฟเพื่อดูรายละเอียดรอบบัญชี
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
    }
  };

  return (
    <div 
      id="merchant-weekly-revenue-summary-view"
      className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-4"
    >
      {/* View Header with Scope and Mode Switches */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md shadow-emerald-600/20 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                สรุปแนวโน้มรายได้ประจำสัปดาห์นี้ (Weekly Revenue Trends)
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                สัปดาห์ปัจจุบัน (7 - 13 ก.ย. 2026)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              กราฟแท่งเปรียบเทียบยอดขายรวม (Gross Sales) และยอดโอนสุทธิ (Net Payout) ตลอด 7 วัน
            </p>
          </div>
        </div>

        {/* View Controls: Scope Toggle & Metric Toggle */}
        <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
          {/* Scope Selector: Selected Merchant vs All Merchants */}
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
              <span className="truncate max-w-[110px] sm:max-w-[140px]">{currentRestaurant.name}</span>
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
              <span>ทุกร้านค้า (All)</span>
            </button>
          </div>

          {/* Metric Selector */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs">
            <button
              id="weekly-metric-gross-btn"
              onClick={() => setMetricMode('gross')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                metricMode === 'gross'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ยอดขาย (Gross)
            </button>
            <button
              id="weekly-metric-net-btn"
              onClick={() => setMetricMode('net')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                metricMode === 'net'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ยอดสุทธิ (Net)
            </button>
            <button
              id="weekly-metric-both-btn"
              onClick={() => setMetricMode('both')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                metricMode === 'both'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              เปรียบเทียบทั้งคู่
            </button>
          </div>
        </div>
      </div>

      {/* 4 Key Metric Summary Cards for the Week */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* 1. Total Weekly Gross */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>ยอดขายสัปดาห์นี้ (Gross)</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          </span>
          <div className="text-lg sm:text-xl font-black text-slate-900">
            ฿{weeklySummary.totalGross.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-emerald-600" />
            <span>+{weeklySummary.growthPct}% เทียบสัปดาห์ก่อน</span>
          </div>
        </div>

        {/* 2. Total Weekly Net Payout */}
        <div className="bg-blue-50/50 p-3.5 rounded-2xl border border-blue-200/60 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 flex items-center justify-between">
            <span>ยอดสุทธิโอนเข้า (Net Payout)</span>
            <Award className="w-3.5 h-3.5 text-blue-600" />
          </span>
          <div className="text-lg sm:text-xl font-black text-blue-950">
            ฿{weeklySummary.totalNet.toLocaleString()}
          </div>
          <div className="text-[10px] text-blue-700 font-medium">
            สัดส่วน {( (weeklySummary.totalNet / (weeklySummary.totalGross || 1)) * 100 ).toFixed(1)}% ของยอดขายรวม
          </div>
        </div>

        {/* 3. Daily Average Revenue */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>ค่าเฉลี่ยรายวัน (Daily Avg)</span>
            <Layers className="w-3.5 h-3.5 text-slate-600" />
          </span>
          <div className="text-lg sm:text-xl font-black text-slate-900">
            ฿{weeklySummary.dailyAverageGross.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500">
            จาก 7 วันในรอบบัญชีปัจจุบัน
          </div>
        </div>

        {/* 4. Peak Day (Highest Revenue) */}
        <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/80 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 flex items-center justify-between">
            <span>วันที่ขายดีที่สุด (Peak Day)</span>
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          </span>
          <div className="text-base sm:text-lg font-black text-amber-950 truncate">
            {weeklySummary.peakDay.dayName} ({weeklySummary.peakDay.fullLabel})
          </div>
          <div className="text-[10px] font-extrabold text-amber-700">
            ฿{weeklySummary.peakDay.grossSales.toLocaleString()} ({weeklySummary.peakDay.totalOrders} ออเดอร์)
          </div>
        </div>
      </div>

      {/* Recharts Bar Chart Area */}
      <div className="p-3 sm:p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1 pb-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">กราฟแท่งแสดงแนวโน้มรายได้รายวัน</span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
              หน่วย: บาท (THB)
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            คลิกแท่งเพื่อเลือกรอบบัญชีวันนั้น
          </span>
        </div>

        {/* Responsive Bar Chart Canvas */}
        <div className="w-full h-64 sm:h-72 select-none">
          <ResponsiveContainer width="100%" height="100%">
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
                tickFormatter={(val: number) => {
                  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                  if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                  return `${val}`;
                }}
              />

              <Tooltip 
                content={<CustomChartTooltip />} 
                cursor={{ fill: '#f1f5f9', opacity: 0.8 }}
              />

              <Legend 
                verticalAlign="top" 
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '11px', fontWeight: 'bold' }}
              />

              {/* Bar 1: Gross Revenue */}
              {(metricMode === 'gross' || metricMode === 'both') && (
                <Bar 
                  dataKey="grossSales" 
                  name="ยอดขายรวม (Gross Sales)" 
                  fill="#059669" 
                  radius={[6, 6, 0, 0]}
                  animationDuration={800}
                >
                  {weeklyTrendsData.map((entry) => {
                    const isSelectedDate = entry.date === selectedSettlementDate;
                    return (
                      <Cell 
                        key={`cell-gross-${entry.date}`} 
                        fill={isSelectedDate ? '#10b981' : entry.isPeak ? '#047857' : '#059669'} 
                        stroke={isSelectedDate ? '#064e3b' : 'transparent'}
                        strokeWidth={isSelectedDate ? 2 : 0}
                        cursor="pointer"
                      />
                    );
                  })}
                </Bar>
              )}

              {/* Bar 2: Net Payout */}
              {(metricMode === 'net' || metricMode === 'both') && (
                <Bar 
                  dataKey="netPayout" 
                  name="ยอดสุทธิร้านค้า (Net Payout)" 
                  fill="#3b82f6" 
                  radius={[6, 6, 0, 0]}
                  animationDuration={800}
                >
                  {weeklyTrendsData.map((entry) => {
                    const isSelectedDate = entry.date === selectedSettlementDate;
                    return (
                      <Cell 
                        key={`cell-net-${entry.date}`} 
                        fill={isSelectedDate ? '#60a5fa' : '#2563eb'} 
                        stroke={isSelectedDate ? '#1e3a8a' : 'transparent'}
                        strokeWidth={isSelectedDate ? 2 : 0}
                        cursor="pointer"
                      />
                    );
                  })}
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
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
                  {item.isPeak && (
                    <span className="px-1 py-0.2 rounded bg-amber-500 text-slate-950 text-[9px] font-black">
                      Peak
                    </span>
                  )}
                </div>
                <div className={`text-xs font-black mt-1 ${isSelected ? 'text-emerald-300' : 'text-emerald-600'}`}>
                  ฿{item.grossSales.toLocaleString()}
                </div>
                <div className={`text-[10px] flex items-center justify-between mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  <span>{item.totalOrders} ออเดอร์</span>
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
