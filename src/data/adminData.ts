import { AdminDisputeTicket, PlatformSystemConfig } from '../types';

export const INITIAL_PLATFORM_CONFIG: PlatformSystemConfig = {
  defaultGpPercent: 25,
  vatRatePercent: 7,
  withholdingTaxPercent: 3,
  baseDeliveryFee: 15,
  perKmRate: 6,
  peakHourSurcharge: 10,
  autoDispatchEnabled: true,
  autoSettlementTransfer: true,
  isMaintenanceMode: false,
  minWithdrawalAmount: 100
};

export const INITIAL_DISPUTES: AdminDisputeTicket[] = [
  {
    id: 'disp-001',
    orderId: 'ord-8891',
    orderNumber: 'FE-8891-BKK',
    customerName: 'คุณสมชาย สายใจ',
    restaurantName: 'กานดา ร้อยหม้อ ข้าวต้มรอบดึก',
    riderName: 'สมหวัง สายซิ่ง',
    issueType: 'damaged_spill',
    issueLabel: 'น้ำซุปหกเลอะถุง / ภาชนะแตกระหว่างขนส่ง',
    description: 'ถุงต้มยำกุ้งน้ำข้นถูกกระแทกระหว่างเดินทาง น้ำซุปหกซึมออกมาครึ่งถุง ลูกค้าขอคืนเงินเฉพาะรายการต้มยำ',
    claimAmount: 150,
    status: 'open',
    createdAt: '15 นาทีที่แล้ว',
    refundMethod: 'wallet_credit'
  },
  {
    id: 'disp-002',
    orderId: 'ord-8884',
    orderNumber: 'FE-8884-BKK',
    customerName: 'นริศรา มีสุข',
    restaurantName: 'เบอร์เกอร์ คิงดอม สาขาสุขุมวิท',
    riderName: 'ธนาวุฒิ ส่งไว',
    issueType: 'missing_food',
    issueLabel: 'ได้รับอาหารไม่ครบ (ขาดเฟรนช์ฟรายส์ไซส์ L)',
    description: 'ทางร้านลืมใส่เฟรนช์ฟรายส์ขนาดใหญ่ 1 ที่ในถุงซีล ลูกค้าแจ้งแอดมินทันทีหลังเปิดถุง',
    claimAmount: 89,
    status: 'investigating',
    createdAt: '42 นาทีที่แล้ว',
    refundMethod: 'wallet_credit'
  },
  {
    id: 'disp-003',
    orderId: 'ord-8870',
    orderNumber: 'FE-8870-BKK',
    customerName: 'ประวิทย์ เอกอนันต์',
    restaurantName: 'ส้มตำเจ๊ไก่ แซ่บนัว',
    riderName: 'วิทวัส ลุยฝน',
    issueType: 'excessive_delay',
    issueLabel: 'จัดส่งล่าช้าเกิน 75 นาทีเนื่องจากฝนตกหนัก',
    description: 'ไรเดอร์ติดพายุฝน ไม่สามารถเคลื่อนตัวได้ ได้รับอาหารเย็นชืด ลูกค้าขอยกเลิกและขอคูปองชดเชย',
    claimAmount: 220,
    status: 'refunded',
    createdAt: '2 ชั่วโมงที่แล้ว',
    refundMethod: 'wallet_credit'
  }
];
