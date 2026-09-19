/**
 * FoodExpress Delivery Distance & Time SLA (Service Level Agreement) Engine
 * 
 * Standard Criteria:
 * 1. Optimal Distance (Sweet Spot): <= 3 - 5 km (Rider travel time 10-15 min, food stays hot, crispy, fresh)
 * 2. Safe / Standard Distance: 5 - 8 km (Rider travel time 15-20 min)
 * 3. Extended Distance: > 8 km (Travel time 25+ min, requires thermal insulated bag)
 * 
 * Total Delivery Time Formula:
 * Total Time = Prep Time (เวลาทำอาหาร) + Travel Time (เวลาเดินทางไรเดอร์)
 * - Impressive / Fast: 20 - 30 mins (Prep 10-15m + Travel 10-15m)
 * - Acceptable / Standard: 30 - 45 mins (Prep 15-25m + Travel 15-20m)
 * - Extended / Warning: > 45 mins
 */

export type DeliverySlaTier = 'sweet_spot' | 'standard' | 'extended';

export interface DeliverySlaDetails {
  distanceKm: number;
  prepMinutes: number;
  travelMinutes: number;
  totalMinutes: number;
  tier: DeliverySlaTier;
  tierTitleTh: string;
  tierSublabelTh: string;
  badgeText: string;
  freshnessLabelTh: string;
  freshnessScorePct: number;
  badgeBg: string;
  badgeTextCol: string;
  badgeBorder: string;
  isSweetSpot: boolean;
  isExtended: boolean;
  riderDispatchRecommendationTh: string;
  satisfactionLevelTh: string;
}

/**
 * Calculates delivery travel time in minutes based on distance in kilometers.
 * In dense urban environment, rider average travel speed is ~ 2.5 - 3.2 min/km + 2 min buffer.
 */
export function calculateRiderTravelMinutes(distanceKm: number): number {
  if (distanceKm <= 1.0) return 6;
  if (distanceKm <= 2.5) return 8;
  if (distanceKm <= 3.5) return 10;
  if (distanceKm <= 5.0) return 14;
  if (distanceKm <= 7.0) return 18;
  if (distanceKm <= 8.0) return 22;
  // Above 8km: transit takes longer due to cross-city traffic
  return Math.round(distanceKm * 2.8 + 4);
}

/**
 * Calculates full Delivery SLA details including time breakdown and food freshness guarantee.
 */
export function getDeliverySlaDetails(
  distanceKm: number,
  averagePrepTimeMinutes: number = 15
): DeliverySlaDetails {
  const prepMinutes = Math.max(8, Math.min(25, averagePrepTimeMinutes || 15));
  const travelMinutes = calculateRiderTravelMinutes(distanceKm);
  const totalMinutes = prepMinutes + travelMinutes;

  // Classify SLA Tier
  if (distanceKm <= 5.0 && totalMinutes <= 32) {
    // Tier 1: Sweet Spot (ยอดเยี่ยม 20-30 นาที, ระยะ <= 3-5 กม.)
    return {
      distanceKm,
      prepMinutes,
      travelMinutes,
      totalMinutes,
      tier: 'sweet_spot',
      tierTitleTh: 'ระยะแนะนำอันดับ 1 (Sweet Spot)',
      tierSublabelTh: 'ส่งด่วนพิเศษ 20 - 30 นาที',
      badgeText: '⚡ ส่งด่วน 20-30 น. (ระยะแนะนำ)',
      freshnessLabelTh: 'สดใหม่ 100% (ร้อน กรอบ น้ำแข็งไม่ละลาย)',
      freshnessScorePct: 98,
      badgeBg: 'bg-emerald-50',
      badgeTextCol: 'text-emerald-700',
      badgeBorder: 'border-emerald-300',
      isSweetSpot: true,
      isExtended: false,
      riderDispatchRecommendationTh: 'ระบบจับคู่ไรเดอร์ล่วงหน้า (Smart Pre-dispatch) ไรเดอร์จะถึงร้านตรงกับเวลาอาหารเสร็จพอดี',
      satisfactionLevelTh: 'ยอดเยี่ยม (Fast & Impressive)',
    };
  }

  if (distanceKm <= 8.0 && totalMinutes <= 45) {
    // Tier 2: Standard (มาตรฐาน 30-45 นาที, ระยะ 5-8 กม.)
    return {
      distanceKm,
      prepMinutes,
      travelMinutes,
      totalMinutes,
      tier: 'standard',
      tierTitleTh: 'ระยะมาตรฐานปลอดภัย',
      tierSublabelTh: 'เวลาจัดส่ง 30 - 45 นาที',
      badgeText: '⏱️ 30-45 น. (ระยะมาตรฐาน)',
      freshnessLabelTh: 'คงคุณภาพความสดใหม่มาตรฐาน',
      freshnessScorePct: 88,
      badgeBg: 'bg-amber-50',
      badgeTextCol: 'text-amber-800',
      badgeBorder: 'border-amber-300',
      isSweetSpot: false,
      isExtended: false,
      riderDispatchRecommendationTh: 'ไรเดอร์เดินทางด้วยเส้นทางเลี่ยงรถติด พร้อมตรวจเช็คอาหารก่อนออกเดินทาง',
      satisfactionLevelTh: 'มาตรฐานที่ยอมรับได้ (Acceptable)',
    };
  }

  // Tier 3: Extended Distance (ระยะไกลพิเศษ > 8 กม. หรือ เกิน 45 นาที)
  return {
    distanceKm,
    prepMinutes,
    travelMinutes,
    totalMinutes,
    tier: 'extended',
    tierTitleTh: 'ระยะไกลพิเศษ (> 8 กม.)',
    tierSublabelTh: 'เวลาจัดส่งประมาณ 45 - 60 นาที',
    badgeText: '🛡️ >45 น. (ระยะไกลพิเศษ)',
    freshnessLabelTh: 'ควบคุมอุณหภูมิด้วยกระเป๋าเก็บความร้อน-เย็นพิเศษ',
    freshnessScorePct: 78,
    badgeBg: 'bg-orange-50',
    badgeTextCol: 'text-orange-800',
    badgeBorder: 'border-orange-300',
    isSweetSpot: false,
    isExtended: true,
    riderDispatchRecommendationTh: 'จัดเตรียมไรเดอร์ที่มีกล่องเก็บอุณหภูมิความร้อน/เย็น เพื่อคงรสชาติจนถึงปลายทาง',
    satisfactionLevelTh: 'ระยะไกล (มีการควบคุมคุณภาพพิเศษ)',
  };
}
