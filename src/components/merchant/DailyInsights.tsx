import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  ComposedChart,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  Cell,
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Percent, 
  Receipt, 
  Clock, 
  ArrowUpRight, 
  ShieldCheck, 
  Calendar, 
  Sparkles,
  Info,
  Layers,
  ChevronRight,
  BarChart3,
  SlidersHorizontal,
  Coins
} from 'lucide-react';
import { MerchantDailySettlement, MerchantOrderReconciliationItem } from '../../types';
import { computeMerchantSettlement, generateMockReconciledOrders } from '../../data/merchantSettlementData';

interface DailyInsightsProps {
  settlement: MerchantDailySettlement;
  allSettlements?: MerchantDailySettlement[];
  selectedDate: string;
  onSelectDate?: (date: string) => void;
}

type InsightChartMode = 'timeline' | 'multiday' | 'share';

export const DailyInsights: React.FC<DailyInsightsProps> = ({
  settlement,
  allSettlements = [],
  selectedDate,
  onSelectDate,
}) => {
  const [chartMode, setChartMode] = useState<InsightChartMode>('timeline');

  // Key metrics calculation
  const grossSales = settlement?.grossSales || 0;
  const gpAmount = settlement?.platformGpAmount || 0;
  const paymentFee = settlement?.paymentProcessingFee || 0;
  const vatOnFees = settlement?.vatOnFees || 0;
  const withholdingTax = settlement?.withholdingTax || 0;
  
  // Total direct commission and transaction deduction
  const totalCommissionDeducted = gpAmount + paymentFee;
  const netPayout = settlement?.netPayoutPayable || 0;
  
  // Effective percentages
  const effectiveCommissionRate = grossSales > 0 
    ? ((totalCommissionDeducted / grossSales) * 100).toFixed(1) 
    : '0.0';
  const retentionRate = grossSales > 0 
    ? ((netPayout / grossSales) * 100).toFixed(1) 
    : '0.0';

  // Average commission per completed order
  const completedOrders = settlement?.completedOrdersCount || 1;
  const avgCommissionPerOrder = Math.round(totalCommissionDeducted / (completedOrders || 1));
  const avgRevenuePerOrder = Math.round(grossSales / (completedOrders || 1));

  // 1. Order-by-order timeline data for the selected day
  const timelineData = useMemo(() => {
    const orders: MerchantOrderReconciliationItem[] = settlement?.reconciledOrders || [];
    if (orders.length === 0) return [];

    return orders.map((order, idx) => {
      const orderCommission = (order.platformGp || 0) + (order.paymentProcessingFee || 0);
      const shortTime = (order.time || '').replace(' น.', '');
      return {
        orderId: order.orderId,
        displayLabel: shortTime || `#${idx + 1}`,
        time: shortTime,
        grossAmount: order.grossAmount || 0,
        commissionFees: orderCommission,
        gpFee: order.platformGp || 0,
        paymentFee: order.paymentProcessingFee || 0,
        netPayout: order.netPayout || 0,
        itemsSummary: order.itemsSummary || 'รายการอาหาร',
        paymentMethod: order.paymentMethod,
        isCompleted: order.status === 'delivered',
      };
    });
  }, [settlement]);

  // Find peak revenue order
  const peakOrder = useMemo(() => {
    if (!timelineData.length) return null;
    return [...timelineData].sort((a, b) => b.grossAmount - a.grossAmount)[0];
  }, [timelineData]);

  // 2. Multi-day comparison dataset (historical 7 days ending at selectedDate)
  const multiDayData = useMemo(() => {
    try {
      const base = new Date(selectedDate);
      if (isNaN(base.getTime())) return [];

      const result = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(base);
        d.setDate(base.getDate() - i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        // Look up existing settlement for this restaurant
        const existing = allSettlements.find(
          s => s.restaurantId === settlement.restaurantId && s.date === dateStr
        );

        let dayGross = 0;
        let dayCommission = 0;
        let dayNet = 0;
        let dayOrders = 0;

        if (existing) {
          dayGross = existing.grossSales;
          dayCommission = (existing.platformGpAmount || 0) + (existing.paymentProcessingFee || 0);
          dayNet = existing.netPayoutPayable;
          dayOrders = existing.completedOrdersCount;
        } else if (dateStr === selectedDate) {
          dayGross = grossSales;
          dayCommission = totalCommissionDeducted;
          dayNet = netPayout;
          dayOrders = completedOrders;
        } else {
          // Deterministic fallback for historical view
          const mockOrders = generateMockReconciledOrders(settlement.restaurantId, dateStr);
          const computed = computeMerchantSettlement(
            settlement.restaurantId,
            dateStr,
            dateStr,
            mockOrders,
            settlement.config,
            settlement.bankAccount
          );
          dayGross = computed.grossSales;
          dayCommission = computed.platformGpAmount + computed.paymentProcessingFee;
          dayNet = computed.netPayoutPayable;
          dayOrders = computed.completedOrdersCount;
        }

        const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const labelShort = `${parseInt(dd)} ${thaiMonths[d.getMonth()]}`;

        result.push({
          date: dateStr,
          dayLabel: labelShort,
          isCurrentSelected: dateStr === selectedDate,
          grossRevenue: dayGross,
          commissionDeducted: dayCommission,
          netPayout: dayNet,
          ordersCount: dayOrders,
          commissionRatePct: dayGross > 0 ? Number(((dayCommission / dayGross) * 100).toFixed(1)) : 0,
        });
      }
      return result;
    } catch {
      return [];
    }
  }, [selectedDate, allSettlements, settlement, grossSales, totalCommissionDeducted, netPayout, completedOrders]);

  // 3. Proportion data for fee distribution
  const distributionData = useMemo(() => {
    return [
      {
        category: 'ส่วนแบ่งรายได้',
        netAmount: netPayout,
        gpFee: gpAmount,
        processingFee: paymentFee,
        vatAmount: vatOnFees,
      }
    ];
  }, [netPayout, gpAmount, paymentFee, vatOnFees]);

  return (
    <div id="merchant-daily-insights-card" className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 space-y-5">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200 shadow-2xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                ข้อมูลเชิงลึกรายวัน (Daily Insights)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300">
                {settlement.dateDisplayTh || selectedDate}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              เปรียบเทียบยอดขายรวม (Total Daily Revenue) กับ ค่าคอมมิชชันและค่าธรรมเนียมที่ถูกหัก (Commission Fees Deducted)
            </p>
          </div>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="inline-flex p-1 rounded-2xl bg-slate-100 border border-slate-200/80 self-start md:self-center">
          <button
            id="insight-mode-timeline-btn"
            onClick={() => setChartMode('timeline')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              chartMode === 'timeline'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>ไทม์ไลน์รายออเดอร์</span>
          </button>

          <button
            id="insight-mode-multiday-btn"
            onClick={() => setChartMode('multiday')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              chartMode === 'multiday'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>เปรียบเทียบย้อนหลัง 7 วัน</span>
          </button>

          <button
            id="insight-mode-share-btn"
            onClick={() => setChartMode('share')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              chartMode === 'share'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>สัดส่วนค่าธรรมเนียม</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Revenue vs Commission Deducted */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Daily Revenue */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-emerald-100/40 border border-emerald-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-[11px] font-bold">ยอดขายรวมประจำวัน (Gross)</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-950">
            ฿{grossSales.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-semibold">
            <span>{completedOrders} ออเดอร์สำเร็จ</span>
            <span>•</span>
            <span>เฉลี่ย ฿{avgRevenuePerOrder.toLocaleString()}/ออเดอร์</span>
          </div>
        </div>

        {/* Commission Deducted */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-50/70 to-rose-100/40 border border-rose-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-rose-800">
            <span className="text-[11px] font-bold">ค่าคอมมิชชันและธรรมเนียมหัก</span>
            <Percent className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600">
            -฿{totalCommissionDeducted.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-rose-700 font-semibold">
            <span className="px-1.5 py-0.2 rounded bg-rose-200/80 font-bold">
              {effectiveCommissionRate}% หักรวม
            </span>
            <span>(GP {settlement.config.gpRatePct}% + MDR {settlement.config.paymentFeePct}%)</span>
          </div>
        </div>

        {/* Net Merchant Payout */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-50/70 to-sky-100/40 border border-sky-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-sky-800">
            <span className="text-[11px] font-bold">ยอดสุทธิที่ร้านค้ารับจริง (Net)</span>
            <Receipt className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-sky-950">
            ฿{netPayout.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-sky-700 font-semibold">
            <span className="px-1.5 py-0.2 rounded bg-sky-200/80 font-bold">
              {retentionRate}% สัดส่วนรายได้สุทธิ
            </span>
            <span>หลังหักค่าบริการ</span>
          </div>
        </div>

        {/* Commission Efficiency / Fee Per Order */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-[11px] font-bold">ค่าคอมฯ เฉลี่ยต่อออเดอร์</span>
            <Coins className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-800">
            ฿{avgCommissionPerOrder.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
            <span>ประหยัดกว่าเมื่อมียอดต่อบิลสูง</span>
          </div>
        </div>
      </div>

      {/* Main Chart Visualization Section */}
      <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4">
        {chartMode === 'timeline' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-800">
                  กราฟเปรียบเทียบยอดขายรวม (Revenue) vs ค่าคอมมิชชันหัก (Commission) แต่ละออเดอร์
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                คลิกหรือชี้ที่แท่งเพื่อดูรายละเอียดออเดอร์
              </span>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={timelineData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="displayLabel" 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    interval={0}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickFormatter={(val) => `฿${val}`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700 min-w-[200px] space-y-1.5">
                          <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                            <span className="font-bold text-emerald-400">ออเดอร์ #{data.orderId}</span>
                            <span className="text-slate-400 text-[10px]">{data.time} น.</span>
                          </div>
                          <p className="text-[11px] text-slate-300 truncate">{data.itemsSummary}</p>
                          <div className="space-y-1 pt-1 text-[11px]">
                            <div className="flex justify-between">
                              <span className="text-slate-400">ยอดขายรวม:</span>
                              <span className="font-bold text-emerald-400">฿{(data.grossAmount || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">หักค่า GP ({settlement.config.gpRatePct}%):</span>
                              <span className="font-semibold text-rose-400">-฿{(data.gpFee || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">หักค่า MDR ({settlement.config.paymentFeePct}%):</span>
                              <span className="font-semibold text-rose-400">-฿{(data.paymentFee || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border-t border-slate-800 pt-1 font-bold">
                              <span className="text-sky-300">ร้านค้ารับสุทธิ:</span>
                              <span className="text-sky-300">฿{(data.netPayout || 0).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    wrapperStyle={{ fontSize: 12, paddingBottom: 10 }}
                  />
                  <Bar 
                    dataKey="grossAmount" 
                    name="ยอดขายรวม (Daily Revenue)" 
                    fill="#10b981" 
                    radius={[5, 5, 0, 0]}
                    maxBarSize={42}
                  />
                  <Bar 
                    dataKey="commissionFees" 
                    name="ค่าคอมมิชชันหัก (Commission Deducted)" 
                    fill="#f43f5e" 
                    radius={[5, 5, 0, 0]}
                    maxBarSize={42}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="netPayout" 
                    name="ยอดสุทธิร้านค้ารับ (Net Payout)" 
                    stroke="#0284c7" 
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#0284c7', strokeWidth: 1, stroke: '#fff' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {chartMode === 'multiday' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-800">
                  เปรียบเทียบย้อนหลัง 7 วัน: ยอดขายรวม vs ค่าคอมมิชชันหัก
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                (คลิกที่แท่งวันเพื่อเปลี่ยนวันที่ดูข้อมูลในหน้า settlement)
              </span>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={multiDayData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
                  onClick={(e: any) => {
                    if (e && e.activePayload && e.activePayload[0]) {
                      const clickedDate = e.activePayload[0].payload?.date;
                      if (clickedDate && onSelectDate) {
                        onSelectDate(clickedDate);
                      }
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="dayLabel" 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickFormatter={(val) => `฿${val}`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700 space-y-1.5">
                          <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                            <span className="font-bold text-white">รอบวันที่ {d.dayLabel} ({d.date})</span>
                            {d.isCurrentSelected && (
                              <span className="text-[10px] bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded font-bold">
                                วันที่เลือกอยู่
                              </span>
                            )}
                          </div>
                          <div className="space-y-1 pt-1 text-[11px]">
                            <div className="flex justify-between gap-4">
                              <span className="text-slate-400">ยอดขายรวม (Gross):</span>
                              <span className="font-bold text-emerald-400">฿{(d.grossRevenue || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-slate-400">หักค่าคอมมิชชัน:</span>
                              <span className="font-bold text-rose-400">-฿{(d.commissionDeducted || 0).toLocaleString()} ({d.commissionRatePct}%)</span>
                            </div>
                            <div className="flex justify-between gap-4 border-t border-slate-800 pt-1">
                              <span className="text-sky-300 font-bold">ร้านค้ารับสุทธิ:</span>
                              <span className="font-bold text-sky-300">฿{(d.netPayout || 0).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    wrapperStyle={{ fontSize: 12, paddingBottom: 10 }}
                  />
                  <Bar 
                    dataKey="grossRevenue" 
                    name="ยอดขายรวมประจำวัน (Gross Revenue)" 
                    fill="#10b981" 
                    radius={[5, 5, 0, 0]}
                    maxBarSize={38}
                  >
                    {multiDayData.map((entry, index) => (
                      <Cell 
                        key={`cell-rev-${index}`} 
                        fill={entry.isCurrentSelected ? '#059669' : '#10b981'} 
                        stroke={entry.isCurrentSelected ? '#047857' : undefined}
                        strokeWidth={entry.isCurrentSelected ? 2 : 0}
                      />
                    ))}
                  </Bar>
                  <Bar 
                    dataKey="commissionDeducted" 
                    name="ค่าคอมมิชชันที่ถูกหัก (Commission Deducted)" 
                    fill="#f43f5e" 
                    radius={[5, 5, 0, 0]}
                    maxBarSize={38}
                  >
                    {multiDayData.map((entry, index) => (
                      <Cell 
                        key={`cell-comm-${index}`} 
                        fill={entry.isCurrentSelected ? '#e11d48' : '#f43f5e'} 
                        stroke={entry.isCurrentSelected ? '#be123c' : undefined}
                        strokeWidth={entry.isCurrentSelected ? 2 : 0}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {chartMode === 'share' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-800">
                  สัดส่วนการกระจายยอดขาย: ร้านค้ารับจริง vs การหักค่าบริการแพลตฟอร์ม
                </span>
              </div>
            </div>

            {/* Visual Stacked Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5 text-sky-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
                  ร้านค้ารับสุทธิ: ฿{netPayout.toLocaleString()} ({retentionRate}%)
                </span>
                <span className="flex items-center gap-1.5 text-rose-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                  ค่าคอมมิชชันและบริการ: ฿{totalCommissionDeducted.toLocaleString()} ({effectiveCommissionRate}%)
                </span>
              </div>

              <div className="w-full h-8 bg-slate-200 rounded-2xl overflow-hidden flex shadow-inner">
                <div 
                  className="bg-sky-500 hover:bg-sky-600 transition-all flex items-center justify-center text-white text-xs font-black"
                  style={{ width: `${Math.min(100, Math.max(0, Number(retentionRate)))}%` }}
                  title={`ร้านค้ารับ: ${retentionRate}%`}
                >
                  {Number(retentionRate) > 20 && `${retentionRate}% ร้านค้ารับ`}
                </div>
                <div 
                  className="bg-rose-500 hover:bg-rose-600 transition-all flex items-center justify-center text-white text-xs font-black"
                  style={{ width: `${Math.min(100, Math.max(0, Number(effectiveCommissionRate)))}%` }}
                  title={`ค่าคอมมิชชันหัก: ${effectiveCommissionRate}%`}
                >
                  {Number(effectiveCommissionRate) > 15 && `${effectiveCommissionRate}% GP+MDR`}
                </div>
              </div>
            </div>

            {/* Breakdown Detail Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500">1. ค่า GP แพลตฟอร์ม ({settlement.config.gpRatePct}%)</div>
                <div className="text-base font-black text-rose-600 mt-1">
                  ฿{gpAmount.toLocaleString()}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">ค่าทำการตลาดและการนำส่งลูกค้า</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500">2. ค่าธรรมเนียมชำระเงิน MDR ({settlement.config.paymentFeePct}%)</div>
                <div className="text-base font-black text-rose-600 mt-1">
                  ฿{paymentFee.toLocaleString()}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">ระบบเกตเวย์ พร้อมเพย์ / บัตรเครดิต</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500">3. ภาษีมูลค่าเพิ่ม VAT 7%</div>
                <div className="text-base font-black text-amber-600 mt-1">
                  ฿{vatOnFees.toLocaleString()}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">คิดเฉพาะส่วนค่าบริการ 7%</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Analytical Takeaways Footer Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            {peakOrder ? (
              <>
                ออเดอร์ยอดสูงสุดของวัน: <strong className="text-slate-900">#{peakOrder.orderId}</strong> ที่เวลา <strong>{peakOrder.time} น.</strong> (ยอด ฿{peakOrder.grossAmount.toLocaleString()}, หักคอมฯ ฿{peakOrder.commissionFees.toLocaleString()})
              </>
            ) : (
              'ไม่มีรายการออเดอร์ในรอบวันที่เลือก'
            )}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] shrink-0 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>สูตรคำนวณโปร่งใส ตรวจสอบย้อนหลังได้ทุกบิล</span>
        </div>
      </div>
    </div>
  );
};
