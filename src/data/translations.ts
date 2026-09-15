export type Language = 'th' | 'en';

export interface Translations {
  // Header
  deliveryAddress: string;
  liveGPS: string;
  deliverTo: string;
  live: string;
  home: string;
  office: string;
  riderHub: string;
  riderHubShort: string;
  posSettlement: string;
  posSettlementShort: string;
  cloudSync: string;
  saving: string;
  wallet: string;
  rewardPoints: string;
  pts: string;
  notifications: string;
  profile: string;
  language: string;
  thai: string;
  english: string;

  // Wallet & Warning Badge
  walletTitle: string;
  walletBalance: string;
  lowBalance: string;
  lowBalanceAlert: string;
  lowBalanceWarning: string;
  lowBalanceDesc: string;
  topUp: string;
  topUpNow: string;
  currentBalance: string;
  safetyThreshold: string;
  setThreshold: string;
  simulateLowBalance: string;
  restoreBalance: string;
  customThreshold: string;
  quickTest: string;

  // Top Up Modal
  topUpWalletTitle: string;
  selectTopUpAmount: string;
  orCustomAmount: string;
  paymentMethod: string;
  promptPayTitle: string;
  promptPaySubtitle: string;
  creditCardTitle: string;
  creditCardSubtitle: string;
  balanceAfterTopUp: string;
  confirmTopUp: string;

  // Bottom Navigation
  navHome: string;
  navOrders: string;
  navRewards: string;
  navPOS: string;
  navRider: string;
  navProfile: string;
  viewCart: string;
  deliveringOrder: string;
  liveMap: string;

  // Dietary & Filters
  dietaryTitle: string;
  dietarySub: string;
  dietaryStandards: string;
  all: string;
  vegetarian: string;
  vegan: string;
  halal: string;
  glutenFree: string;
  keto: string;
  freeDelivery: string;
  highRating: string;
  fastDelivery: string;
  specialPromo: string;

  // Restaurant Section
  popularRestaurants: string;
  nearbyRestaurants: string;
  closestToYou: string;
  foundRestaurants: string;
  distanceSorted: string;
  noRestaurantsFound: string;
  searchPlaceholder: string;
  clearAllFilters: string;
  mins: string;
  km: string;

  // Orders & Reorder
  ordersTitle: string;
  ordersSubtitle: string;
  reorder: string;
  reordering: string;
  reorderSuccess: string;
  reorderAllItems: string;
  reorderTooltip: string;
  orderSummary: string;
  trackRider: string;
  reviewStore: string;
  reviewed: string;

  // Rider Voice Assistant
  voiceAssistantTitle: string;
  voiceAssistantSubtitle: string;
  handsFreeVoiceMode: string;
  voiceListening: string;
  voiceTapToSpeak: string;
  voiceStopListening: string;
  voiceNotSupported: string;
  voiceCommandRecognized: string;
  voiceCommandsCheatsheet: string;
  reportIssueTitle: string;
  reportIssueDesc: string;
  issueReportedSuccess: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  th: {
    // Header
    deliveryAddress: 'ที่อยู่จัดส่ง',
    liveGPS: 'พิกัด GPS ปัจจุบัน',
    deliverTo: 'จัดส่งไปที่',
    live: 'สด',
    home: 'บ้าน',
    office: 'ออฟฟิศ',
    riderHub: 'ศูนย์พนักงานจัดส่ง',
    riderHubShort: 'ไรเดอร์ Hub',
    posSettlement: 'ระบบ GP ร้านค้า',
    posSettlementShort: 'ระบบ GP ร้านค้า',
    cloudSync: 'คลาวด์',
    saving: 'กำลังบันทึก...',
    wallet: 'วอลเล็ต',
    rewardPoints: 'คะแนนสะสม',
    pts: 'แต้ม',
    notifications: 'การแจ้งเตือน',
    profile: 'โปรไฟล์และบัญชี',
    language: 'ภาษา',
    thai: 'ไทย',
    english: 'English',

    // Wallet & Warning Badge
    walletTitle: 'FoodExpress Wallet',
    walletBalance: 'ยอดเงินวอลเล็ต',
    lowBalance: 'ยอดเงินต่ำ',
    lowBalanceAlert: 'เตือนยอดเงินต่ำกว่าเกณฑ์',
    lowBalanceWarning: 'ยอดเงินในวอลเล็ตเหลือน้อย',
    lowBalanceDesc: 'ยอดเงินคงเหลือต่ำกว่าเกณฑ์ความปลอดภัย (฿{threshold}) อาจไม่พอสำหรับออเดอร์ถัดไป',
    topUp: 'เติมเงิน',
    topUpNow: 'เติมเงินทันที',
    currentBalance: 'ยอดคงเหลือปัจจุบัน',
    safetyThreshold: 'เกณฑ์ความปลอดภัย',
    setThreshold: 'ตั้งเกณฑ์เตือน',
    simulateLowBalance: 'จำลองยอดเงินต่ำ (฿50)',
    restoreBalance: 'คืนค่ายอดเงินเดิม (฿650)',
    customThreshold: 'ปรับเกณฑ์เตือน',
    quickTest: 'ทดสอบระบบ',

    // Top Up Modal
    topUpWalletTitle: 'เติมเงิน FoodExpress Wallet',
    selectTopUpAmount: 'เลือกจำนวนเงินที่ต้องการเติม',
    orCustomAmount: 'หรือระบุจำนวนเงินเอง (บาท)',
    paymentMethod: 'ช่องทางการชำระเงิน',
    promptPayTitle: 'PromptPay QR Code',
    promptPaySubtitle: 'ฟรีค่าธรรมเนียม เติมเข้าทันที',
    creditCardTitle: 'บัตรเครดิต / เดบิต',
    creditCardSubtitle: 'Visa / Mastercard / JCB',
    balanceAfterTopUp: 'ยอดเงินหลังเติมเสร็จสิ้น:',
    confirmTopUp: 'ยืนยันเติมเงิน',

    // Bottom Navigation
    navHome: 'หน้าแรก',
    navOrders: 'คำสั่งซื้อ',
    navRewards: 'สะสมแต้ม',
    navPOS: 'ระบบ GP ร้านค้า',
    navRider: 'ไรเดอร์ Hub',
    navProfile: 'บัญชีของฉัน',
    viewCart: 'ดูตะกร้าสั่งอาหาร',
    deliveringOrder: 'กำลังจัดส่ง',
    liveMap: 'ดูแผนที่สด',

    // Dietary & Filters
    dietaryTitle: 'โภชนาการและข้อจำกัดอาหาร',
    dietarySub: 'Dietary',
    dietaryStandards: 'มาตรฐานความปลอดภัย',
    all: 'ทั้งหมด',
    vegetarian: 'มังสวิรัติ',
    vegan: 'วีแกน / เจ',
    halal: 'ฮาลาล',
    glutenFree: 'ปลอดกลูเตน',
    keto: 'คีโตเจนิค',
    freeDelivery: 'ส่งฟรี 0 บาท',
    highRating: 'คะแนน 4.8+',
    fastDelivery: 'ส่งไว < 20 นาที',
    specialPromo: 'มีส่วนลดพิเศษ',

    // Restaurant Section
    popularRestaurants: 'ร้านอาหารแนะนำยอดนิยม',
    nearbyRestaurants: 'ร้านอาหารเรียงตามระยะทางใกล้คุณ',
    closestToYou: 'ใกล้คุณที่สุด',
    foundRestaurants: 'พบ {count} ร้านอร่อยพร้อมจัดส่ง',
    distanceSorted: 'เรียงจากใกล้สุด ({min} กม.)',
    noRestaurantsFound: 'ไม่พบร้านอาหารที่ตรงกับการค้นหา',
    searchPlaceholder: 'ค้นหาร้านอาหาร เมนูโปรด หรือประเภทอาหาร...',
    clearAllFilters: 'ล้างตัวกรองทั้งหมด',
    mins: 'นาที',
    km: 'กม.',

    // Orders & Reorder
    ordersTitle: 'ประวัติการสั่งอาหาร',
    ordersSubtitle: 'ติดตามสถานะและตรวจสอบคำสั่งซื้อทั้งหมดของคุณ',
    reorder: 'สั่งซ้ำ (Reorder)',
    reordering: 'กำลังใส่ตะกร้า...',
    reorderSuccess: 'ใส่ตะกร้าแล้ว! 🛒',
    reorderAllItems: 'สั่งซ้ำรายการอาหารทั้งออเดอร์นี้',
    reorderTooltip: 'ใส่รายการอาหารทั้งหมดจากออเดอร์นี้ลงในตะกร้าทันทีด้วย 1 คลิก',
    orderSummary: 'สรุปเมนู',
    trackRider: 'ติดตามไรเดอร์',
    reviewStore: 'รีวิวร้านนี้',
    reviewed: 'รีวิวแล้ว',

    // Rider Voice Assistant
    voiceAssistantTitle: 'ระบบสั่งงานด้วยเสียงแฮนด์ฟรี (Voice Assistant)',
    voiceAssistantSubtitle: 'อัปเดตสถานะและแจ้งปัญหาระหว่างขับขี่โดยไม่ต้องสัมผัสหน้าจอ',
    handsFreeVoiceMode: 'โหมดขับขี่ สั่งงานด้วยเสียง',
    voiceListening: 'กำลังฟังเสียงของคุณ...',
    voiceTapToSpeak: 'แตะเพื่อเปิดไมค์สั่งงานด้วยเสียง',
    voiceStopListening: 'ปิดไมค์',
    voiceNotSupported: 'เบราว์เซอร์นี้ไม่รองรับ Web Speech API (ใช้ปุ่มคำสั่งลัดแทนได้)',
    voiceCommandRecognized: 'คำสั่งเสียงที่ตรวจพบ:',
    voiceCommandsCheatsheet: 'คำสั่งเสียงที่รองรับ',
    reportIssueTitle: 'รายงานปัญหาระหว่างจัดส่ง',
    reportIssueDesc: 'พูดปัญหา เช่น "ยางแบน", "ฝนตกหนัก", "ติดต่อลูกค้าไม่ได้", "ร้านทำช้า"',
    issueReportedSuccess: 'บันทึกรายงานปัญหาเรียบร้อยแล้ว',
  },

  en: {
    // Header
    deliveryAddress: 'Delivery Address',
    liveGPS: 'Live GPS Coordinates',
    deliverTo: 'Deliver to',
    live: 'Live',
    home: 'Home',
    office: 'Office',
    riderHub: 'Rider Operations Hub',
    riderHubShort: 'Rider Hub',
    posSettlement: 'Merchant GP Portal',
    posSettlementShort: 'GP Portal',
    cloudSync: 'Cloud',
    saving: 'Saving...',
    wallet: 'Wallet',
    rewardPoints: 'Points',
    pts: 'pts',
    notifications: 'Notifications',
    profile: 'Profile & Account',
    language: 'Language',
    thai: 'Thai',
    english: 'English',

    // Wallet & Warning Badge
    walletTitle: 'FoodExpress Wallet',
    walletBalance: 'Wallet Balance',
    lowBalance: 'Low Balance',
    lowBalanceAlert: 'Low Balance Warning',
    lowBalanceWarning: 'Wallet Balance Running Low',
    lowBalanceDesc: 'Your balance is below the safety threshold (฿{threshold}). It may not cover your next meal.',
    topUp: 'Top Up',
    topUpNow: 'Top Up Now',
    currentBalance: 'Current Balance',
    safetyThreshold: 'Alert Threshold',
    setThreshold: 'Set Threshold',
    simulateLowBalance: 'Simulate Low Balance (฿50)',
    restoreBalance: 'Restore Normal Balance (฿650)',
    customThreshold: 'Adjust Threshold',
    quickTest: 'Quick Test',

    // Top Up Modal
    topUpWalletTitle: 'Top Up FoodExpress Wallet',
    selectTopUpAmount: 'Select top-up amount',
    orCustomAmount: 'Or enter custom amount (THB)',
    paymentMethod: 'Payment Method',
    promptPayTitle: 'PromptPay QR Code',
    promptPaySubtitle: 'Instant deposit, zero transaction fees',
    creditCardTitle: 'Credit / Debit Card',
    creditCardSubtitle: 'Visa / Mastercard / JCB',
    balanceAfterTopUp: 'Balance after top-up:',
    confirmTopUp: 'Confirm Top Up',

    // Bottom Navigation
    navHome: 'Home',
    navOrders: 'Orders',
    navRewards: 'Rewards',
    navPOS: 'GP Portal',
    navRider: 'Rider Hub',
    navProfile: 'Profile',
    viewCart: 'View Order Cart',
    deliveringOrder: 'On the way',
    liveMap: 'Live GPS Map',

    // Dietary & Filters
    dietaryTitle: 'Dietary Preferences & Nutrition',
    dietarySub: 'Dietary',
    dietaryStandards: 'Safety Standards',
    all: 'All',
    vegetarian: 'Vegetarian',
    vegan: 'Vegan',
    halal: 'Halal',
    glutenFree: 'Gluten-Free',
    keto: 'Keto',
    freeDelivery: 'Free Delivery',
    highRating: 'Rating 4.8+',
    fastDelivery: 'Fast < 20 mins',
    specialPromo: 'Special Promo',

    // Restaurant Section
    popularRestaurants: 'Popular Recommended Restaurants',
    nearbyRestaurants: 'Restaurants Closest to You',
    closestToYou: 'Closest to You',
    foundRestaurants: 'Found {count} restaurants available',
    distanceSorted: 'Closest ({min} km)',
    noRestaurantsFound: 'No restaurants match your filters',
    searchPlaceholder: 'Search restaurants, dishes, or categories...',
    clearAllFilters: 'Clear All Filters',
    mins: 'mins',
    km: 'km',

    // Orders & Reorder
    ordersTitle: 'Order History',
    ordersSubtitle: 'Track your deliveries and review past orders',
    reorder: 'Reorder',
    reordering: 'Adding to cart...',
    reorderSuccess: 'Added to cart! 🛒',
    reorderAllItems: 'Reorder all items in this order',
    reorderTooltip: 'Quickly add all items from this order into your current cart with 1 click',
    orderSummary: 'Order Summary',
    trackRider: 'Track Rider',
    reviewStore: 'Review Store',
    reviewed: 'Reviewed',

    // Rider Voice Assistant
    voiceAssistantTitle: 'Hands-Free Rider Voice Assistant',
    voiceAssistantSubtitle: 'Update status and report road issues hands-free using speech recognition',
    handsFreeVoiceMode: 'Hands-Free Voice Mode',
    voiceListening: 'Listening to your voice...',
    voiceTapToSpeak: 'Tap to speak hands-free commands',
    voiceStopListening: 'Stop Mic',
    voiceNotSupported: 'Browser Speech Recognition API unavailable (Use quick action buttons)',
    voiceCommandRecognized: 'Command recognized:',
    voiceCommandsCheatsheet: 'Supported Voice Commands',
    reportIssueTitle: 'Report Delivery Incident',
    reportIssueDesc: 'Speak issues like "flat tire", "heavy rain", "customer unreachable", "delayed kitchen"',
    issueReportedSuccess: 'Incident reported successfully to dispatch center',
  }
};
