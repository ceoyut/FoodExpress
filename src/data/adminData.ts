import { AdminDisputeTicket, PlatformSystemConfig, AdminRole, RolePermissionDetail, StandardRbacMatrixItem } from '../types';

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

export const ROLES_RBAC_CONFIG: Record<AdminRole, RolePermissionDetail> = {
  super_admin: {
    id: 'super_admin',
    title: 'เจ้าของระบบ / ผู้บริหารสูงสุด (Super Admin)',
    thaiTitle: 'ผู้ดูแลระบบสูงสุด',
    badgeTitle: 'Super Admin',
    roleIcon: '👑',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-400',
    badgeBorder: 'border-amber-500/30',
    accentBg: 'from-amber-500/10 via-slate-900 to-slate-900',
    accentBorder: 'border-amber-500/30',
    department: 'Executive & Platform Governance',
    description: 'สิทธิ์ระดับ Root เจ้าของแพลตฟอร์ม เข้าถึงและควบคุมทุกโมดูลในระบบ 100% ตั้งค่าภาษี, ค่า GP, วงเงินโอน และโครงสร้างแพลตฟอร์ม',
    allowedActions: [
      'เข้าถึงและควบคุมทุกโมดูลในระบบ 100% (Full Control)',
      'ตั้งค่าระบบส่วนกลาง (อัตรา GP ฐาน, ภาษีมูลค่าเพิ่ม VAT, ค่าส่งพื้นฐาน, สวิตช์ AI Dispatch)',
      'อนุมัติการสั่งโอนเงิน EOD ให้ร้านค้า และอนุมัติการคืนเงินข้อพิพาททุกกรณี',
      'สลับเปลี่ยนไรเดอร์ และสั่งยกเลิกคำสั่งซื้อฉุกเฉินกรณีวิกฤต',
      'อนุมัติคัดกรองไรเดอร์ และกำหนดอัตราส่วนแบ่ง GP เฉพาะรายร้านค้า',
      'กำหนดบทบาทและสิทธิ์ผู้ใช้งานในระบบ (RBAC & User Provisioning)'
    ],
    restrictedActions: [
      'ไม่มีข้อจำกัด (Full Root Privilege)'
    ],
    permissions: {
      canDispatchAndCancelOrders: true,
      canEditMerchantGP: true,
      canApproveRiders: true,
      canApprovePayouts: true,
      canResolveDisputes: true,
      canAccessSettings: true
    }
  },
  operations: {
    id: 'operations',
    title: 'ฝ่ายปฏิบัติการ & จ่ายงาน (Operations / Dispatch)',
    thaiTitle: 'ฝ่ายปฏิบัติการ (Ops)',
    badgeTitle: 'Operations (Ops)',
    roleIcon: '🚚',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-500/30',
    accentBg: 'from-emerald-500/10 via-slate-900 to-slate-900',
    accentBorder: 'border-emerald-500/30',
    department: 'Fleet & Order Operations',
    description: 'ควบคุมมอนิเตอร์ออเดอร์สดหน้างาน (Live Tracking), แทรกแซงสลับไรเดอร์, ยกเลิกออเดอร์ฉุกเฉิน และตรวจสอบประวัติ/ใบขับขี่ไรเดอร์ใหม่',
    allowedActions: [
      'มอนิเตอร์และแทรกแซงออเดอร์สด (Live Dispatch & Emergency Override)',
      'สลับเปลี่ยนไรเดอร์กรณีรถเสีย หรือปฏิเสธงานไม่ไปรับอาหาร',
      'กดยกเลิกออเดอร์กรณีร้านค้าปิดกะทันหัน หรือเกิดอุบัติเหตุบนท้องถนน',
      'ตรวจสอบและกดอนุมัติ/ปฏิเสธใบสมัครไรเดอร์ใหม่ (CID/DL/Liveness)',
      'ดูข้อมูลร้านค้าและยอดขายแบบ Read-only เพื่อประสานงานหน้างาน'
    ],
    restrictedActions: [
      'ห้ามกดอนุมัติสั่งโอนเงิน EOD ให้ร้านค้า (จำกัดเฉพาะ Finance เพื่อป้องกันการทุจริต)',
      'ห้ามแก้ไขอัตรา GP ร้านค้าหรือแก้ไขสัญญาส่วนแบ่ง (จำกัดเฉพาะ Super Admin)',
      'ห้ามอนุมัติเงินคืนข้อพิพาทโดยพลการ (ต้องผ่านกระบวนการ Customer Support)',
      'ห้ามเข้าแก้ไขการตั้งค่าระบบส่วนกลาง (Platform Settings ถูกล็อก)'
    ],
    permissions: {
      canDispatchAndCancelOrders: true,
      canEditMerchantGP: false,
      canApproveRiders: true,
      canApprovePayouts: false,
      canResolveDisputes: false,
      canAccessSettings: false
    }
  },
  finance: {
    id: 'finance',
    title: 'ฝ่ายการเงิน & บัญชีเคลียริ่ง (Finance & Settlements)',
    thaiTitle: 'ฝ่ายการเงิน (Finance)',
    badgeTitle: 'Finance',
    roleIcon: '💰',
    badgeBg: 'bg-blue-500/10',
    badgeText: 'text-blue-400',
    badgeBorder: 'border-blue-500/30',
    accentBg: 'from-blue-500/10 via-slate-900 to-slate-900',
    accentBorder: 'border-blue-500/30',
    department: 'Accounting & Treasury',
    description: 'ตรวจสอบรายได้ GMV, กระทบยอดสิ้นวัน (EOD Reconciliation), หักค่าคอมมิชชั่น GP, หักภาษี ณ ที่จ่าย 3% และอนุมัติโอนเงินเข้าบัญชีธนาคารร้านค้า',
    allowedActions: [
      'ตรวจสอบรายงานกระทบยอดบัญชีประจำวัน (EOD Reconciliation)',
      'อนุมัติและสั่งโอนเงิน Direct Credit เข้าบัญชีธนาคารร้านค้าและไรเดอร์',
      'ตรวจสอบยอดหัก GP, ภาษีมูลค่าเพิ่ม VAT 7%, และหัก ณ ที่จ่าย WHT 3%',
      'ส่งออกสลิปรายงานการโอนเงิน (Payout Slip) และหลักฐานการทำธุรกรรม',
      'ดูข้อมูลออเดอร์และร้านค้าในมุมมองตัวเลขรายได้ (Read-only)'
    ],
    restrictedActions: [
      'ห้ามสลับไรเดอร์หรือกดยกเลิกออเดอร์สดหน้างาน (ไม่ใช่หน้าที่ของฝ่ายการเงิน)',
      'ห้ามอนุมัติหรือตรวจประวัติใบสมัครไรเดอร์ (หน้าที่ของฝ่าย Ops)',
      'ห้ามแก้ไขอัตรา GP ร้านค้า หรือตั้งค่าระบบส่วนกลาง (จำกัดเฉพาะ Super Admin)',
      'ห้ามอนุมัติคืนเงินเคสข้อพิพาทโดยตรง (ต้องให้ Support ตรวจสอบหลักฐานก่อน)'
    ],
    permissions: {
      canDispatchAndCancelOrders: false,
      canEditMerchantGP: false,
      canApproveRiders: false,
      canApprovePayouts: true,
      canResolveDisputes: false,
      canAccessSettings: false
    }
  },
  support: {
    id: 'support',
    title: 'ศูนย์ดูแลลูกค้า & ระงับข้อพิพาท (Customer Support / CX)',
    thaiTitle: 'ศูนย์บริการลูกค้า (Support)',
    badgeTitle: 'Support / CS',
    roleIcon: '🎧',
    badgeBg: 'bg-rose-500/10',
    badgeText: 'text-rose-400',
    badgeBorder: 'border-rose-500/30',
    accentBg: 'from-rose-500/10 via-slate-900 to-slate-900',
    accentBorder: 'border-rose-500/30',
    department: 'Customer Experience & Trust',
    description: 'ดูแลข้อร้องเรียนของผู้ใช้งาน ลูกค้า ร้านค้า และไรเดอร์ สอบสวนเคสอาหารหกเสียหาย ส่งผิด หรือล่าช้า และมีอำนาจสั่งคืนเงินเข้าวอลเล็ตทันที',
    allowedActions: [
      'จัดการ Ticket ข้อพิพาทและการเคลม (Dispute & Claim Management)',
      'อนุมัติคืนเงิน (Refund) เข้ากระเป๋า FoodExpress Wallet ให้ลูกค้า',
      'ปฏิเสธคำร้องที่ไม่เข้าเกณฑ์ หรือตรวจพบพฤติกรรมทุจริตซ้ำซ้อน',
      'ตรวจสอบประวัติการจัดส่งและแชทเพื่อสืบสวนข้อเท็จจริง',
      'ดูสถานะออเดอร์แบบ Read-only เพื่อตอบคำถามและช่วยเหลือลูกค้าหน้างาน'
    ],
    restrictedActions: [
      'ห้ามกดสั่งโอนเงินรอบ EOD ร้านค้า (จำกัดเฉพาะ Finance)',
      'ห้ามสลับไรเดอร์หน้างาน (ต้องประสานต่อให้ Ops ดำเนินการ)',
      'ห้ามอนุมัติใบสมัครไรเดอร์ใหม่',
      'ห้ามแก้ไขการตั้งค่าระบบส่วนกลางหรือโครงสร้าง GP'
    ],
    permissions: {
      canDispatchAndCancelOrders: false,
      canEditMerchantGP: false,
      canApproveRiders: false,
      canApprovePayouts: false,
      canResolveDisputes: true,
      canAccessSettings: false
    }
  }
};

export const RBAC_STANDARD_MATRIX: StandardRbacMatrixItem[] = [
  {
    id: 'live_tracking',
    featureTitle: '1. มอนิเตอร์สถานะออเดอร์สด (Live Order Tracking)',
    category: 'การดำเนินงานหน้างาน',
    description: 'ดูขั้นตอนการทำอาหาร พิกัดไรเดอร์ และสถานะการนำส่งแบบเรียลไทม์',
    superAdmin: true,
    operations: true,
    finance: 'Read-only',
    support: 'Read-only',
    rationale: 'ทุกฝ่ายจำเป็นต้องเห็นสถานะคำสั่งซื้อเพื่อประสานงาน แต่เฉพาะ Ops และ Super Admin เท่านั้นที่สามารถแทรกแซงได้'
  },
  {
    id: 'dispatch_override',
    featureTitle: '2. สลับไรเดอร์ & ยกเลิกออเดอร์ฉุกเฉิน (Dispatch Intervention)',
    category: 'การดำเนินงานหน้างาน',
    description: 'บังคับ Re-assign มอบหมายไรเดอร์คนใหม่ หรือกดยกเลิกออเดอร์วิกฤต',
    superAdmin: true,
    operations: true,
    finance: false,
    support: false,
    rationale: 'ต้องอาศัยการตัดสินใจทาง Logistics หน้างานทันที ป้องกันไม่ให้ฝ่ายอื่นยกเลิกออเดอร์โดยพลการ'
  },
  {
    id: 'rider_verification',
    featureTitle: '3. อนุมัติใบสมัครไรเดอร์ & ตรวจประวัติ (Rider Onboarding)',
    category: 'กำลังพลและยานพาหนะ',
    description: 'ตรวจใบขับขี่ พรบ. ผลตรวจประวัติอาชญากรรม (สตช.) และสแกนใบหน้า',
    superAdmin: true,
    operations: true,
    finance: false,
    support: false,
    rationale: 'Ops เป็นผู้ดูแลความพร้อม คุณภาพ และความปลอดภัยของกองยานตามมาตรฐานกรมการขนส่ง'
  },
  {
    id: 'merchant_gp',
    featureTitle: '4. กำหนดอัตราส่วนแบ่ง GP ร้านค้า (Merchant Commission Tier)',
    category: 'สัญญาและพันธมิตร',
    description: 'แก้ไขสัญญาส่วนแบ่ง GP ปรับลดสำหรับร้าน Flagship หรือทำข้อตกลงพิเศษ',
    superAdmin: true,
    operations: false,
    finance: 'Read-only',
    support: false,
    rationale: 'เป็นผลประโยชน์หลักทางธุรกิจและรายได้ของบริษัท สงวนสิทธิ์เฉพาะผู้บริหารระดับสูง (Super Admin)'
  },
  {
    id: 'eod_payout',
    featureTitle: '5. กระทบยอด & สั่งโอนเงิน EOD ร้านค้า (Settlement Payout)',
    category: 'การเงินและบัญชี',
    description: 'ตรวจสอบหักภาษี ณ ที่จ่าย 3% หัก GP และสั่งโอนเงินตรงเข้าบัญชีธนาคาร',
    superAdmin: true,
    operations: false,
    finance: true,
    support: false,
    rationale: 'หลักการแบ่งแยกหน้าที่ (Separation of Duties): ผู้จัดการคำสั่งซื้อ (Ops) ห้ามเป็นผู้สั่งจ่ายเงิน เพื่อป้องกันการทุจริตโอนเงินเข้าบัญชีตนเอง'
  },
  {
    id: 'dispute_refund',
    featureTitle: '6. ระงับข้อพิพาท & อนุมัติเงินคืนลูกค้า (Dispute Refund)',
    category: 'บริการลูกค้าและเคลม',
    description: 'สอบสวนภาพอาหารเสียหาย อาหารไม่ครบ และกดคืนเงินเข้ากระเป๋าวอลเล็ต',
    superAdmin: true,
    operations: false,
    finance: false,
    support: true,
    rationale: 'Support มีหน้าที่ไกล่เกลี่ยและประเมินหลักฐานตามนโยบายคุ้มครองผู้บริโภค'
  },
  {
    id: 'global_config',
    featureTitle: '7. ตั้งค่าระบบส่วนกลาง & ภาษี (Global Platform Settings)',
    category: 'นโยบายและเทคนิค',
    description: 'ปรับเปอร์เซ็นต์ GP มาตรฐาน, ค่าส่งฐาน, VAT 7%, และเปิด/ปิดระบบ AI Dispatch',
    superAdmin: true,
    operations: false,
    finance: false,
    support: false,
    rationale: 'มีผลกระทบต่อเศรษฐศาสตร์ของระบบ (Unit Economics) ทั้งหมด จำเป็นต้องคุมโดย Super Admin'
  },
  {
    id: 'role_management',
    featureTitle: '8. จัดการบทบาทและสิทธิ์แอดมิน (RBAC & Staff Governance)',
    category: 'ความปลอดภัยระบบ',
    description: 'เพิ่ม/ลดสิทธิ์พนักงาน เปลี่ยนฝ่าย และตรวจสอบ Audit Trail บันทึกการเข้าใช้งาน',
    superAdmin: true,
    operations: false,
    finance: false,
    support: false,
    rationale: 'ป้องกันการยกระดับสิทธิ์ตัวเอง (Privilege Escalation) ตามมาตรฐานความปลอดภัย ISO 27001'
  }
];

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
