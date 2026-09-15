export type DeviceViewMode = 'ios' | 'android' | 'responsive';

export type PaymentMethod = 
  | 'wallet'
  | 'credit_card'
  | 'promptpay_qr'
  | 'rabbit_line_pay'
  | 'cash_on_delivery';

export type OrderStatus = 
  | 'confirmed'
  | 'preparing'
  | 'rider_assigned'
  | 'delivering'
  | 'delivered'
  | 'cancelled';

export interface MenuItemOptionChoice {
  id: string;
  name: string;
  price: number;
}

export interface MenuItemOptionGroup {
  id: string;
  name: string;
  required: boolean;
  choices: MenuItemOptionChoice[];
}

export type DietaryPreference = 
  | 'vegetarian'   // มังสวิรัติ (Vegetarian)
  | 'vegan'        // วีแกน / เจ (Vegan / Plant-based)
  | 'halal'        // ฮาลาล (Halal)
  | 'gluten_free'  // ปลอดกลูเตน (Gluten-Free)
  | 'keto';        // คีโตเจนิค (Keto / Low-Carb)

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  isPopular?: boolean;
  isSpicy?: boolean;
  spicyLevels?: string[];
  dietary?: DietaryPreference[];
  options?: MenuItemOptionGroup[];
}

export interface Restaurant {
  id: string;
  name: string;
  nameEn: string;
  rating: number;
  reviewCount: number;
  deliveryTimeMinutes: number;
  averagePrepTimeMinutes?: number; // Kitchen preparation duration benchmark in minutes
  deliveryFee: number;
  minOrder: number;
  distanceKm: number;
  bannerImage: string;
  logoImage: string;
  category: string;
  tags: string[];
  dietaryPreferences?: DietaryPreference[]; // Dietary choices catered by restaurant
  isPromo?: boolean;
  promoBadge?: string;
  address: string;
  isOpen: boolean;
  isFeatured?: boolean;
  coords: { x: number; y: number }; // Relative coordinate on simulated map 0-100
  geoLocation?: { lat: number; lng: number }; // WGS84 Real-world coordinates (Latitude, Longitude)
  menu: MenuItem[];
}

export interface UserGeoLocation {
  lat: number;
  lng: number;
  accuracy?: number; // In meters
  name?: string;     // Friendly name or address label
  isLiveGPS: boolean; // True if acquired from device navigator.geolocation
  timestamp?: number;
}

export type RestaurantSortOption =
  | 'proximity'     // Location-based proximity to user's geolocation
  | 'rating'        // Highest rating
  | 'delivery_time' // Fastest delivery
  | 'delivery_fee'  // Lowest delivery fee
  | 'popular';      // Most reviews & popular items

export interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  restaurantId: string;
  restaurantName: string;
  quantity: number;
  selectedOptions: { [groupName: string]: string };
  spicyLevel?: string;
  notes?: string;
  unitPrice: number;
}

export interface Rider {
  id: string;
  name: string;
  phone: string;
  photo: string;
  vehicle: string;
  licensePlate: string;
  rating: number;
  tripsCount: number;
}

export interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  restaurantLogo: string;
  items: CartItem[];
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  pointsUsed: number;
  total: number;
  pointsEarned: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'pending';
  deliveryAddress: string;
  notes?: string;
  createdAt: string;
  estimatedDeliveryMinutes: number;
  rider?: Rider;
  riderProgressPct: number; // 0 to 100
  riderCurrentLocation?: { x: number; y: number };
  hasReviewed?: boolean;
}

export interface Review {
  id: string;
  restaurantId: string;
  orderId?: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  foodRating?: number;
  riderRating?: number;
  date: string;
  comment: string;
  tags?: string[];
  photos?: string[];
  helpfulCount: number;
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'free_delivery';
  discountValue: number;
  minOrder: number;
  pointsCost: number;
  expiresAt: string;
  isRedeemed: boolean;
  categoryIcon?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'promo' | 'order' | 'reward' | 'system';
  timestamp: string;
  read: boolean;
  actionText?: string;
  targetId?: string;
  badge?: string;
}

export interface SavedAddress {
  id: string;
  label: string;
  address: string;
  details: string;
  isDefault: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  loyaltyPoints: number;
  walletBalance: number;
  savedAddresses: SavedAddress[];
  favoriteRestaurantIds: string[];
  loginProvider: 'google' | 'line' | 'apple' | 'facebook' | 'phone';
}

export interface LoyaltyTierInfo {
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  tierTh: string;
  minOrders: number;
  maxOrders?: number;
  pointsMultiplier: string;
  freeDeliveryPerMonth: number | 'unlimited';
  discountPct: number;
  perks: string[];
  badgeColor: string;
  accentColor: string;
  gradient: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'rider';
  text: string;
  timestamp: string;
}

export type MerchantPayoutStatus = 'pending' | 'calculated' | 'approved' | 'paid' | 'on_hold';

export interface MerchantBankAccount {
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  promptPayId?: string;
  branchName?: string;
}

export type MerchantSocialProvider = 'google' | 'line' | 'facebook' | 'apple' | 'phone';
export type MerchantGpTier = 'starter_15' | 'standard_20' | 'growth_25' | 'zerogp_0' | 'custom';

export interface MerchantAccount {
  id: string;
  ownerName: string;
  email: string;
  phone: string;
  avatar: string;
  socialProvider: MerchantSocialProvider;
  restaurantId: string;
  restaurantName: string;
  restaurantLogo?: string;
  category?: string;
  address?: string;
  gpRatePct: number;
  gpTier: MerchantGpTier;
  contractStatus: 'active' | 'pending_verification' | 'reviewing';
  contractNumber?: string;
  isCorporate: boolean;
  taxId?: string;
  bankAccount: MerchantBankAccount;
  joinedDate: string;
  role: 'owner' | 'manager' | 'partner';
}

export interface MerchantSettlementConfig {
  gpRatePct: number; // e.g., 20 (%)
  paymentFeePct: number; // e.g., 1.5 (%)
  vatPct: number; // 7 (%)
  whtPct: number; // 3 (%) for corporate or 0%
  isCorporate: boolean;
  autoTransferTime: string; // e.g., "14:00 น."
  enableInstantPushNotifications: boolean; // Instant push notification for every successful transaction completed at the store
  minPendingPayoutThreshold?: number; // เกณฑ์ยอดเงินรอโอนขั้นต่ำสำหรับการแจ้งเตือน (Minimum Pending Payout Threshold Alert)
  enablePendingPayoutAlert?: boolean; // เปิด/ปิดการแจ้งเตือนเมื่อยอดเงินรอโอนข้ามเกณฑ์ขั้นต่ำ
}

export interface MerchantOrderReconciliationItem {
  orderId: string;
  time: string;
  orderType: 'delivery' | 'takeaway' | 'pos_dinein';
  itemsSummary: string;
  itemsCount: number;
  paymentMethod: PaymentMethod;
  grossAmount: number;
  merchantDiscount: number;
  platformGp: number;
  paymentProcessingFee: number;
  cashCollectedAtStore: number;
  netPayout: number;
  tipAmount?: number; // ทิปให้พนักงานจัดส่ง (Performance Incentive for Delivery Staff)
  status: OrderStatus;
  payoutStatus: 'settled' | 'pending' | 'refunded';
}

export interface MerchantDailySettlement {
  id: string;
  restaurantId: string;
  restaurantName: string;
  restaurantLogo: string;
  date: string; // YYYY-MM-DD
  dateDisplayTh: string;
  totalOrdersCount: number;
  completedOrdersCount: number;
  cancelledOrdersCount: number;
  grossSales: number; // ยอดขายอาหารรวม (Gross Sales)
  merchantFundedDiscount: number; // ส่วนลดที่ร้านค้าร่วมออก
  platformGpAmount: number; // หัก ค่าธรรมเนียม GP
  paymentProcessingFee: number; // หัก ค่าธรรมเนียมชำระเงิน MDR
  vatOnFees: number; // ภาษีมูลค่าเพิ่ม 7% ของค่าบริการ
  withholdingTax: number; // หัก ณ ที่จ่าย 3% (WHT)
  cashCollectedByStore: number; // เงินสดที่ร้านค้าเก็บไปแล้ว (COD หรือหน้าร้าน)
  netPayoutPayable: number; // ยอดสุทธิที่ต้องโอนให้ร้านค้า (Net Payout)
  totalTipsReceived?: number; // ทิปรวมที่พนักงานจัดส่งได้รับ (Total Tips Received - Delivery Staff Performance Incentive)
  status: MerchantPayoutStatus;
  config: MerchantSettlementConfig;
  bankAccount: MerchantBankAccount;
  transferRefNumber?: string;
  transferredAt?: string;
  reconciledOrders: MerchantOrderReconciliationItem[];
}

// ==========================================
// RIDER / DRIVER MANAGEMENT SYSTEMS
// 1. Rider Registration & Application
// 2. Rider Queue & Dispatch System
// 3. Rider Earnings & Payout Settlement System
// ==========================================

export type RiderVehicleType = 'motorcycle' | 'electric_bike' | 'bicycle' | 'car';
export type RiderApplicationStatus = 'pending_review' | 'approved' | 'rejected' | 'additional_docs_needed';
export type RiderShiftStatus = 'online_ready' | 'in_queue' | 'busy_delivery' | 'offline';

export interface RiderApplication {
  id: string;
  fullName: string;
  nationalId: string; // เลขบัตรประชาชน 13 หลัก
  phone: string;
  email: string;
  vehicleType: RiderVehicleType;
  vehicleBrandModel: string;
  licensePlate: string;
  driverLicenseNumber: string;
  preferredZone: string; // e.g. 'สุขุมวิท / อโศก / ทองหล่อ'
  bankName: string;
  bankAccountNumber: string;
  promptPayId: string;
  idCardPhoto?: string;
  driverLicensePhoto?: string;
  vehiclePhoto?: string;
  submittedAt: string;
  status: RiderApplicationStatus;
  rejectionReason?: string;
  approvedAt?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface RiderQueueItem {
  riderId: string;
  riderName: string;
  photo: string;
  vehicle: string;
  licensePlate: string;
  zoneId: string;
  zoneName: string;
  queueNumber: number;
  enteredQueueAt: string;
  rating: number;
  acceptanceRate: number; // e.g. 98%
  completedTodayCount: number;
  priorityScore: number; // Score 1-100 based on rating & promptness
  status: 'waiting' | 'offered' | 'picking_up' | 'delivering';
  currentOrderId?: string;
}

export interface DispatchQueueOrder {
  id: string;
  orderNumber: string;
  restaurantId: string;
  restaurantName: string;
  restaurantLogo: string;
  restaurantAddress: string;
  restaurantCoords: { x: number; y: number };
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCoords: { x: number; y: number };
  distanceKm: number;
  itemsCount: number;
  itemsSummary: string;
  baseDeliveryFee: number; // ค่ารอบพื้นฐาน
  distanceFee: number; // ค่าระยะทาง
  specialIncentive: number; // โบนัสช่วงพีค
  customerTip: number; // ทิปจากลูกค้า
  totalTripEarnings: number; // รวมรายได้รอบนี้
  matchedZone: string;
  status: 'queued' | 'offered' | 'accepted' | 'picked_up' | 'delivered';
  offeredToRiderId?: string;
  createdAt: string;
  estimatedPickupMinutes: number;
}

export interface RiderPayoutSlip {
  id: string;
  payoutRef: string;
  riderId: string;
  riderName: string;
  amount: number;
  fee: number; // ฿0 ค่าธรรมเนียมโอนฟรี
  netAmount: number;
  destinationType: 'promptpay' | 'bank_account';
  destinationDetail: string; // เช่น PromptPay 081-xxx-5678 หรือ SCB 123-xxx-789
  bankName?: string;
  transferredAt: string;
  status: 'transferred' | 'processing' | 'failed';
  totalTripsIncluded: number;
}

export interface RiderTripEarningRecord {
  id: string;
  orderId: string;
  restaurantName: string;
  customerName: string;
  distanceKm: number;
  completedAt: string;
  baseFee: number;
  distanceFee: number;
  peakBonus: number;
  tipAmount: number;
  grossEarnings: number;
  netEarnings: number;
  payoutStatus: 'available_to_withdraw' | 'paid_out';
}

export interface ActiveRiderAccount {
  id: string;
  name: string;
  phone: string;
  photo: string;
  vehicle: string;
  licensePlate: string;
  vehicleType: RiderVehicleType;
  preferredZone: string;
  rating: number;
  acceptanceRate: number; // %
  completionRate: number; // %
  totalLifetimeTrips: number;
  totalLifetimeEarnings: number;
  walletBalance: number; // ยอดคงเหลือพร้อมถอน
  totalEarnedToday: number;
  todayTripsCount: number;
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    promptPayId: string;
  };
  shiftStatus: RiderShiftStatus;
  currentQueuePosition?: number;
  totalInQueueCount?: number;
  applicationStatus: RiderApplicationStatus;
}

export type Language = 'th' | 'en';

export interface RiderReportedIssue {
  id: string;
  tripId?: string;
  orderNumber?: string;
  category: 'vehicle_breakdown' | 'traffic_weather' | 'customer_unreachable' | 'restaurant_delay' | 'damaged_food' | 'general';
  categoryLabel: string;
  description: string;
  transcript: string;
  reportedAt: string;
  status: 'acknowledged' | 'in_review' | 'resolved';
  resolvedNote?: string;
}

