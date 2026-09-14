import { 
  MerchantDailySettlement, 
  MerchantBankAccount, 
  MerchantSettlementConfig, 
  MerchantOrderReconciliationItem,
  Order,
  Restaurant 
} from '../types';
import { RESTAURANTS_DATA } from './mockData';

export const DEFAULT_MERCHANT_CONFIGS: Record<string, { bank: MerchantBankAccount; config: MerchantSettlementConfig }> = {
  rest_1: {
    bank: {
      bankName: 'ธนาคารกสิกรไทย (KBANK)',
      bankCode: '004',
      accountNumber: '045-8-12948-2',
      accountName: 'บจก. กะเพราถาด 1999 (สำนักงานใหญ่)',
      promptPayId: '0105562089123',
      branchName: 'สาขาสุขุมวิท 33',
    },
    config: {
      gpRatePct: 20,
      paymentFeePct: 1.5,
      vatPct: 7,
      whtPct: 3,
      isCorporate: true,
      autoTransferTime: '14:00 น.',
      enableInstantPushNotifications: true,
      minPendingPayoutThreshold: 5000,
      enablePendingPayoutAlert: true,
    },
  },
  rest_2: {
    bank: {
      bankName: 'ธนาคารไทยพาณิชย์ (SCB)',
      bankCode: '014',
      accountNumber: '408-9-77123-1',
      accountName: 'หจก. ส้มตำคุณแม่ แซ่บนัว',
      promptPayId: '0103558019485',
      branchName: 'สาขาเอ็มควอเทียร์',
    },
    config: {
      gpRatePct: 25,
      paymentFeePct: 1.5,
      vatPct: 7,
      whtPct: 3,
      isCorporate: true,
      autoTransferTime: '14:00 น.',
      enableInstantPushNotifications: true,
      minPendingPayoutThreshold: 3000,
      enablePendingPayoutAlert: true,
    },
  },
  rest_3: {
    bank: {
      bankName: 'ธนาคารกรุงเทพ (BBL)',
      bankCode: '002',
      accountNumber: '127-4-88392-0',
      accountName: 'บจก. นิปปอน คูซีน แอนด์ ราเมน',
      promptPayId: '0105559038172',
      branchName: 'สาขาพร้อมพงษ์',
    },
    config: {
      gpRatePct: 22,
      paymentFeePct: 1.5,
      vatPct: 7,
      whtPct: 3,
      isCorporate: true,
      autoTransferTime: '14:00 น.',
      enableInstantPushNotifications: true,
      minPendingPayoutThreshold: 5000,
      enablePendingPayoutAlert: true,
    },
  },
  rest_4: {
    bank: {
      bankName: 'ธนาคารกสิกรไทย (KBANK)',
      bankCode: '004',
      accountNumber: '712-2-90145-8',
      accountName: 'นางสาวภัทรา วรรณกิจ (ซาวัวร์ คาเฟ่)',
      promptPayId: '0812345678',
      branchName: 'สาขาทองหล่อ',
    },
    config: {
      gpRatePct: 18,
      paymentFeePct: 1.5,
      vatPct: 7,
      whtPct: 0,
      isCorporate: false,
      autoTransferTime: '14:00 น.',
      enableInstantPushNotifications: false,
      minPendingPayoutThreshold: 2500,
      enablePendingPayoutAlert: true,
    },
  },
  rest_5: {
    bank: {
      bankName: 'ธนาคารกรุงไทย (KTB)',
      bankCode: '006',
      accountNumber: '028-1-55420-9',
      accountName: 'บจก. สแมช แอนด์ สแต็ค เบอร์เกอร์',
      promptPayId: '0105561048291',
      branchName: 'สาขาอโศก',
    },
    config: {
      gpRatePct: 20,
      paymentFeePct: 1.5,
      vatPct: 7,
      whtPct: 3,
      isCorporate: true,
      autoTransferTime: '14:00 น.',
      enableInstantPushNotifications: true,
      minPendingPayoutThreshold: 4000,
      enablePendingPayoutAlert: true,
    },
  },
  rest_6: {
    bank: {
      bankName: 'ธนาคารทหารไทยธนชาต (TTB)',
      bankCode: '011',
      accountNumber: '099-2-33418-7',
      accountName: 'นายวีระพล สุขสวัสดิ์ (ครัวปักษ์ใต้)',
      promptPayId: '0898765432',
      branchName: 'สาขาเอกมัย',
    },
    config: {
      gpRatePct: 15,
      paymentFeePct: 1.5,
      vatPct: 7,
      whtPct: 0,
      isCorporate: false,
      autoTransferTime: '14:00 น.',
      enableInstantPushNotifications: true,
      minPendingPayoutThreshold: 3000,
      enablePendingPayoutAlert: true,
    },
  },
};

/**
 * Calculates a complete merchant daily settlement summary from order reconciliation items
 */
export function computeMerchantSettlement(
  restaurantId: string,
  dateStr: string,
  dateDisplayTh: string,
  orders: MerchantOrderReconciliationItem[],
  customConfig?: Partial<MerchantSettlementConfig>,
  customBank?: Partial<MerchantBankAccount>
): MerchantDailySettlement {
  const restaurant = RESTAURANTS_DATA.find(r => r.id === restaurantId) || RESTAURANTS_DATA[0];
  const defaults = DEFAULT_MERCHANT_CONFIGS[restaurantId] || DEFAULT_MERCHANT_CONFIGS.rest_1;
  
  const config: MerchantSettlementConfig = {
    ...defaults.config,
    enableInstantPushNotifications: customConfig?.enableInstantPushNotifications !== undefined 
      ? customConfig.enableInstantPushNotifications 
      : (defaults.config.enableInstantPushNotifications ?? true),
    minPendingPayoutThreshold: customConfig?.minPendingPayoutThreshold !== undefined
      ? customConfig.minPendingPayoutThreshold
      : (defaults.config.minPendingPayoutThreshold ?? 5000),
    enablePendingPayoutAlert: customConfig?.enablePendingPayoutAlert !== undefined
      ? customConfig.enablePendingPayoutAlert
      : (defaults.config.enablePendingPayoutAlert ?? true),
    ...(customConfig || {}),
  };

  const bankAccount: MerchantBankAccount = {
    ...defaults.bank,
    ...(customBank || {}),
  };

  // Filter completed and valid orders for calculation
  const completedOrders = orders.filter(o => o.status === 'delivered');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');

  let grossSales = 0;
  let merchantFundedDiscount = 0;
  let cashCollectedByStore = 0;
  let totalTipsReceived = 0;

  completedOrders.forEach(ord => {
    grossSales += ord.grossAmount;
    merchantFundedDiscount += ord.merchantDiscount;
    cashCollectedByStore += ord.cashCollectedAtStore;
    totalTipsReceived += (ord.tipAmount || 0);
  });

  // Calculate Platform GP Fee (e.g. 20% of Gross Sales)
  const platformGpAmount = Math.round(grossSales * (config.gpRatePct / 100));

  // Calculate Payment Processing MDR (e.g. 1.5% of Gross Sales for non-cash)
  const nonCashGross = completedOrders
    .filter(o => o.paymentMethod !== 'cash_on_delivery')
    .reduce((sum, o) => sum + o.grossAmount, 0);
  const paymentProcessingFee = Math.round(nonCashGross * (config.paymentFeePct / 100));

  // Total Service fees charged by platform to merchant
  const totalServiceFees = platformGpAmount + paymentProcessingFee;

  // VAT 7% applied on Platform Service Fees (ตามกฎหมายสรรพากร ภาษีมูลค่าเพิ่มคิดจากค่าบริการของแพลตฟอร์ม)
  const vatOnFees = Math.round(totalServiceFees * (config.vatPct / 100));

  // Withholding Tax 3% (ภาษีหัก ณ ที่จ่าย ที่ร้านค้านิติบุคคลสามารถหักจากค่าบริการของแพลตฟอร์ม)
  const withholdingTax = config.isCorporate 
    ? Math.round(totalServiceFees * (config.whtPct / 100))
    : 0;

  // Net Payout Payable to Merchant:
  // Formula: ยอดขายรวม (Gross) 
  //        - ค่าธรรมเนียม GP
  //        - ค่าประมวลผลการชำระเงิน MDR
  //        - VAT 7% ของค่าบริการ
  //        + ภาษีหัก ณ ที่จ่าย (WHT คืนให้ร้านค้านำส่งสรรพากร)
  //        - ส่วนลดโปรโมชั่นที่ร้านค้าออก
  //        - เงินสดที่ร้านค้าเก็บไปแล้วที่หน้าร้าน (Cash On Delivery / POS Cash)
  const netPayoutPayable = Math.max(
    0,
    grossSales 
      - platformGpAmount 
      - paymentProcessingFee 
      - vatOnFees 
      + withholdingTax 
      - merchantFundedDiscount 
      - cashCollectedByStore
  );

  return {
    id: `STL-${restaurantId}-${dateStr.replace(/-/g, '')}`,
    restaurantId,
    restaurantName: restaurant.name,
    restaurantLogo: restaurant.logoImage,
    date: dateStr,
    dateDisplayTh,
    totalOrdersCount: orders.length,
    completedOrdersCount: completedOrders.length,
    cancelledOrdersCount: cancelledOrders.length,
    grossSales,
    merchantFundedDiscount,
    platformGpAmount,
    paymentProcessingFee,
    vatOnFees,
    withholdingTax,
    cashCollectedByStore,
    netPayoutPayable,
    totalTipsReceived,
    status: 'calculated',
    config,
    bankAccount,
    reconciledOrders: orders,
  };
}

// Generate realistic simulated reconciliation orders for a merchant
export function generateMockReconciledOrders(restaurantId: string, baseDateStr: string): MerchantOrderReconciliationItem[] {
  const rest = RESTAURANTS_DATA.find(r => r.id === restaurantId) || RESTAURANTS_DATA[0];
  const defaults = DEFAULT_MERCHANT_CONFIGS[restaurantId] || DEFAULT_MERCHANT_CONFIGS.rest_1;
  const gpRate = defaults.config.gpRatePct / 100;
  const pFeeRate = defaults.config.paymentFeePct / 100;

  const mockTemplates = [
    {
      time: '10:14 น.',
      orderType: 'delivery' as const,
      itemsSummary: rest?.menu?.[0]?.name ? `1x ${rest.menu[0].name}` : '1x เมนูยอดนิยม',
      itemsCount: 1,
      paymentMethod: 'promptpay_qr' as const,
      grossAmount: rest?.menu?.[0]?.price || 135,
      merchantDiscount: 15,
      tipAmount: 20,
      isCod: false,
      status: 'delivered' as const,
    },
    {
      time: '11:28 น.',
      orderType: 'takeaway' as const,
      itemsSummary: rest?.menu?.[1]?.name ? `2x ${rest.menu[1].name}` : '2x เมนูพิเศษ',
      itemsCount: 2,
      paymentMethod: 'wallet' as const,
      grossAmount: (rest?.menu?.[1]?.price || 119) * 2,
      merchantDiscount: 0,
      tipAmount: 0,
      isCod: false,
      status: 'delivered' as const,
    },
    {
      time: '12:05 น.',
      orderType: 'delivery' as const,
      itemsSummary: `1x ${rest?.menu?.[0]?.name || 'ข้าวกะเพรา'}, 2x ${rest?.menu?.[3]?.name || 'เครื่องดื่ม'}`,
      itemsCount: 3,
      paymentMethod: 'credit_card' as const,
      grossAmount: (rest?.menu?.[0]?.price || 135) + ((rest?.menu?.[3]?.price || 35) * 2),
      merchantDiscount: 20,
      tipAmount: 40,
      isCod: false,
      status: 'delivered' as const,
    },
    {
      time: '12:42 น.',
      orderType: 'pos_dinein' as const,
      itemsSummary: `3x ${rest?.menu?.[0]?.name || 'เซ็ตอาหารกลางวัน'}`,
      itemsCount: 3,
      paymentMethod: 'cash_on_delivery' as const, // Paid cash directly at POS
      grossAmount: (rest?.menu?.[0]?.price || 135) * 3,
      merchantDiscount: 0,
      tipAmount: 0,
      isCod: true,
      status: 'delivered' as const,
    },
    {
      time: '13:15 น.',
      orderType: 'delivery' as const,
      itemsSummary: `1x ${rest?.menu?.[2]?.name || 'อาหารจานหลัก'}`,
      itemsCount: 1,
      paymentMethod: 'rabbit_line_pay' as const,
      grossAmount: rest?.menu?.[2]?.price || 155,
      merchantDiscount: 10,
      tipAmount: 25,
      isCod: false,
      status: 'delivered' as const,
    },
    {
      time: '14:30 น.',
      orderType: 'delivery' as const,
      itemsSummary: `2x ${rest?.menu?.[0]?.name || 'กะเพราพิเศษ'}`,
      itemsCount: 2,
      paymentMethod: 'promptpay_qr' as const,
      grossAmount: (rest?.menu?.[0]?.price || 135) * 2,
      merchantDiscount: 0,
      tipAmount: 30,
      isCod: false,
      status: 'delivered' as const,
    },
    {
      time: '15:10 น.',
      orderType: 'delivery' as const,
      itemsSummary: '1x รายการสั่งผิดกะทันหัน',
      itemsCount: 1,
      paymentMethod: 'credit_card' as const,
      grossAmount: 180,
      merchantDiscount: 0,
      tipAmount: 0,
      isCod: false,
      status: 'cancelled' as const,
    },
    {
      time: '17:40 น.',
      orderType: 'delivery' as const,
      itemsSummary: `2x ${rest?.menu?.[1]?.name || 'เมนูค่ำ'}, 2x ${rest?.menu?.[3]?.name || 'เครื่องดื่ม'}`,
      itemsCount: 4,
      paymentMethod: 'wallet' as const,
      grossAmount: ((rest?.menu?.[1]?.price || 119) * 2) + ((rest?.menu?.[3]?.price || 35) * 2),
      merchantDiscount: 25,
      tipAmount: 50,
      isCod: false,
      status: 'delivered' as const,
    },
    {
      time: '18:55 น.',
      orderType: 'delivery' as const,
      itemsSummary: `1x ${rest?.menu?.[0]?.name || 'เมนูแนะนำ'}, 1x ${rest?.menu?.[2]?.name || 'อาหารจานโต'}`,
      itemsCount: 2,
      paymentMethod: 'promptpay_qr' as const,
      grossAmount: (rest?.menu?.[0]?.price || 135) + (rest?.menu?.[2]?.price || 155),
      merchantDiscount: 15,
      tipAmount: 35,
      isCod: false,
      status: 'delivered' as const,
    },
    {
      time: '19:30 น.',
      orderType: 'pos_dinein' as const,
      itemsSummary: `4x ${rest?.menu?.[0]?.name || 'เซ็ตครอบครัว'}`,
      itemsCount: 4,
      paymentMethod: 'promptpay_qr' as const,
      grossAmount: (rest?.menu?.[0]?.price || 135) * 4,
      merchantDiscount: 30,
      tipAmount: 0,
      isCod: false,
      status: 'delivered' as const,
    },
  ];

  return mockTemplates.map((t, idx) => {
    const isCompleted = t.status === 'delivered';
    const gross = isCompleted ? t.grossAmount : 0;
    const discount = isCompleted ? t.merchantDiscount : 0;
    const gp = isCompleted ? Math.round(gross * gpRate) : 0;
    const pFee = (isCompleted && !t.isCod) ? Math.round(gross * pFeeRate) : 0;
    const cashCollected = (isCompleted && t.isCod) ? gross : 0;
    const net = isCompleted ? Math.max(0, gross - gp - pFee - discount - cashCollected) : 0;
    const tip = isCompleted ? (t.tipAmount || 0) : 0;

    return {
      orderId: `POS-${restaurantId.toUpperCase()}-${baseDateStr.replace(/-/g, '').slice(4)}-${String(idx + 1).padStart(3, '0')}`,
      time: t.time,
      orderType: t.orderType,
      itemsSummary: t.itemsSummary,
      itemsCount: t.itemsCount,
      paymentMethod: t.paymentMethod,
      grossAmount: t.grossAmount,
      merchantDiscount: t.merchantDiscount,
      platformGp: gp,
      paymentProcessingFee: pFee,
      cashCollectedAtStore: cashCollected,
      netPayout: net,
      tipAmount: tip,
      status: t.status,
      payoutStatus: isCompleted ? 'settled' : 'refunded',
    };
  });
}

// Generate initial settlements for all restaurants across multiple days
export const INITIAL_MERCHANT_SETTLEMENTS: MerchantDailySettlement[] = [
  // Today's settlement for rest_1
  {
    ...computeMerchantSettlement(
      'rest_1',
      '2026-09-12',
      'วันนี้ (12 ก.ย. 2026)',
      generateMockReconciledOrders('rest_1', '2026-09-12')
    ),
    status: 'calculated',
  },
  // Yesterday's settlement for rest_1 (Already paid/transferred)
  {
    ...computeMerchantSettlement(
      'rest_1',
      '2026-09-11',
      'เมื่อวานนี้ (11 ก.ย. 2026)',
      generateMockReconciledOrders('rest_1', '2026-09-11')
    ),
    status: 'paid',
    transferRefNumber: 'TXN-KBANK-20260911-88902',
    transferredAt: '11 ก.ย. 2026 เวลา 14:00 น.',
  },
  // Today's settlement for rest_2
  {
    ...computeMerchantSettlement(
      'rest_2',
      '2026-09-12',
      'วันนี้ (12 ก.ย. 2026)',
      generateMockReconciledOrders('rest_2', '2026-09-12')
    ),
    status: 'pending',
  },
  // Yesterday's settlement for rest_2 (Paid)
  {
    ...computeMerchantSettlement(
      'rest_2',
      '2026-09-11',
      'เมื่อวานนี้ (11 ก.ย. 2026)',
      generateMockReconciledOrders('rest_2', '2026-09-11')
    ),
    status: 'paid',
    transferRefNumber: 'TXN-SCB-20260911-34190',
    transferredAt: '11 ก.ย. 2026 เวลา 14:00 น.',
  },
  // Today's settlement for rest_3
  {
    ...computeMerchantSettlement(
      'rest_3',
      '2026-09-12',
      'วันนี้ (12 ก.ย. 2026)',
      generateMockReconciledOrders('rest_3', '2026-09-12')
    ),
    status: 'calculated',
  },
  // Today's settlement for rest_4
  {
    ...computeMerchantSettlement(
      'rest_4',
      '2026-09-12',
      'วันนี้ (12 ก.ย. 2026)',
      generateMockReconciledOrders('rest_4', '2026-09-12')
    ),
    status: 'calculated',
  },
  // Today's settlement for rest_5
  {
    ...computeMerchantSettlement(
      'rest_5',
      '2026-09-12',
      'วันนี้ (12 ก.ย. 2026)',
      generateMockReconciledOrders('rest_5', '2026-09-12')
    ),
    status: 'approved',
  },
  // Today's settlement for rest_6
  {
    ...computeMerchantSettlement(
      'rest_6',
      '2026-09-12',
      'วันนี้ (12 ก.ย. 2026)',
      generateMockReconciledOrders('rest_6', '2026-09-12')
    ),
    status: 'calculated',
  },
];
