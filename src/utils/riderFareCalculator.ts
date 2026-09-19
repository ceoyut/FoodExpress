/**
 * Thai Rider Fare Standards & Real Distance Calculator
 * โครงสร้างและสูตรคำนวณมาตรฐานค่ารอบการจัดส่งอาหารของไรเดอร์ไทยตามระยะทางจริง
 */

export interface ThaiFareZoneConfig {
  id: 'bkk_metro' | 'bkk_cbd' | 'provincial';
  nameTh: string;
  baseFare: number; // ค่ารอบเริ่มต้น (บาท)
  baseDistanceKm: number; // ระยะทางตั้งต้น (กม.)
  ratePerKmNormal: number; // อัตราค่าระยะทางส่วนเกิน (บาท/กม.)
  longDistanceThresholdKm: number; // เกณฑ์ระยะทางไกลพิเศษ (กม.)
  ratePerKmLongDistance: number; // อัตราค่าระยะทางไกลพิเศษ (บาท/กม.)
  defaultPeakBonus: number; // โบนัสช่วงพีคมาตรฐาน (บาท)
  defaultRainSurge: number; // ค่าเสี่ยงภัยช่วงฝนตก (บาท)
  batchOrderSecondaryBase: number; // ค่ารอบออเดอร์พ่วงจุดที่สอง (บาท)
}

export const THAI_FARE_ZONES: Record<'bkk_metro' | 'bkk_cbd' | 'provincial', ThaiFareZoneConfig> = {
  bkk_cbd: {
    id: 'bkk_cbd',
    nameTh: 'กทม. โซนเศรษฐกิจชั้นใน (BKK CBD: สยาม/สาทร/สุขุมวิท)',
    baseFare: 44.00, // โซนหนาแน่นสูง
    baseDistanceKm: 3.0,
    ratePerKmNormal: 10.00,
    longDistanceThresholdKm: 10.0,
    ratePerKmLongDistance: 14.00,
    defaultPeakBonus: 20.00,
    defaultRainSurge: 25.00,
    batchOrderSecondaryBase: 28.00,
  },
  bkk_metro: {
    id: 'bkk_metro',
    nameTh: 'กรุงเทพฯ และปริมณฑล (BKK & Metro)',
    baseFare: 40.00, // มาตรฐาน กทม. 38 - 45 บาท
    baseDistanceKm: 3.0, // 0 - 3.0 กม. แรก
    ratePerKmNormal: 9.00, // 8 - 12 บาท/กม.
    longDistanceThresholdKm: 10.0, // เกิน 10 กม.
    ratePerKmLongDistance: 13.00, // ชดเชยเที่ยววิ่งกลับ 12 - 15 บาท/กม.
    defaultPeakBonus: 15.00, // มื้อเที่ยง / มื้อเย็น
    defaultRainSurge: 20.00, // ฝนตก
    batchOrderSecondaryBase: 25.00, // พ่วงออเดอร์
  },
  provincial: {
    id: 'provincial',
    nameTh: 'ต่างจังหวัด / หัวเมืองใหญ่ (ต่างจังหวัด)',
    baseFare: 32.00, // มาตรฐานต่างจังหวัด 28 - 35 บาท
    baseDistanceKm: 3.0,
    ratePerKmNormal: 7.50, // 6 - 9 บาท/กม.
    longDistanceThresholdKm: 10.0,
    ratePerKmLongDistance: 10.50,
    defaultPeakBonus: 10.00,
    defaultRainSurge: 15.00,
    batchOrderSecondaryBase: 20.00,
  }
};

export interface CalculateRiderFareOptions {
  distanceKm: number;
  zoneType?: 'bkk_metro' | 'bkk_cbd' | 'provincial';
  isPeakHour?: boolean;
  peakBonusAmount?: number;
  isRaining?: boolean;
  rainSurgeAmount?: number;
  isBatchOrder?: boolean;
  customerTip?: number;
  customerChargedFee?: number; // ค่าส่งที่เก็บจากลูกค้าจริง
}

export interface ThaiRiderFareResult {
  distanceKm: number;
  zone: ThaiFareZoneConfig;
  baseFare: number;
  baseDistanceKm: number;
  coveredInBaseKm: number;
  extraDistanceKm: number;
  extraDistanceFare: number;
  longDistanceKm: number;
  longDistanceFare: number;
  totalDistanceFee: number;
  distanceFee: number; // alias for totalDistanceFee
  peakBonus: number;
  peakSurgeFee: number; // alias for peakBonus
  rainSurge: number;
  longDistanceSubsidy: number; // alias for longDistanceFare
  batchBonus: number;
  isBatchOrder: boolean;
  customerTip: number;
  grossFare: number; // ค่ารอบรวมก่อนทิป
  netEarnings: number; // รายได้สุทธิที่ไรเดอร์ได้รับ
  totalRiderEarnings: number; // alias for netEarnings
  customerChargedFee: number; // ค่าส่งที่เรียกเก็บจากลูกค้า
  platformSubsidy: number; // ส่วนต่างที่แพลตฟอร์มชดเชยให้ไรเดอร์
  formulaString: string;
  summaryNoteTh: string;
}

/**
 * คำนวณค่ารอบไรเดอร์ตามระยะทางจริงตามมาตรฐานไทย
 */
export function calculateThaiRiderFare(options: CalculateRiderFareOptions): ThaiRiderFareResult {
  const zoneType = options.zoneType || 'bkk_metro';
  const zone = THAI_FARE_ZONES[zoneType];
  const distance = Math.max(0.1, Number(options.distanceKm.toFixed(1)));

  // 1. ค่ารอบเริ่มต้น (Base Fare)
  let baseFare = zone.baseFare;
  let batchBonus = 0;

  if (options.isBatchOrder) {
    // ออเดอร์พ่วงจุดที่สอง คิดฐานพ่วง
    baseFare = zone.batchOrderSecondaryBase;
    batchBonus = zone.batchOrderSecondaryBase;
  }

  // 2. คำนวณระยะทาง
  const coveredInBaseKm = Math.min(distance, zone.baseDistanceKm);
  let extraDistanceKm = 0;
  let extraDistanceFare = 0;
  let longDistanceKm = 0;
  let longDistanceFare = 0;

  if (distance > zone.baseDistanceKm) {
    const rawExtra = distance - zone.baseDistanceKm;
    
    if (distance <= zone.longDistanceThresholdKm) {
      extraDistanceKm = Number(rawExtra.toFixed(1));
      extraDistanceFare = Number((extraDistanceKm * zone.ratePerKmNormal).toFixed(2));
    } else {
      // มีระยะเกิน 10 กม.
      const normalTierKm = zone.longDistanceThresholdKm - zone.baseDistanceKm;
      extraDistanceKm = Number(normalTierKm.toFixed(1));
      extraDistanceFare = Number((extraDistanceKm * zone.ratePerKmNormal).toFixed(2));

      longDistanceKm = Number((distance - zone.longDistanceThresholdKm).toFixed(1));
      longDistanceFare = Number((longDistanceKm * zone.ratePerKmLongDistance).toFixed(2));
    }
  }

  const totalDistanceFee = Number((extraDistanceFare + longDistanceFare).toFixed(2));

  // 3. ส่วนเพิ่มพิเศษ (Incentives / Surges)
  const peakBonus = options.isPeakHour
    ? (options.peakBonusAmount !== undefined ? options.peakBonusAmount : zone.defaultPeakBonus)
    : 0;

  const rainSurge = options.isRaining
    ? (options.rainSurgeAmount !== undefined ? options.rainSurgeAmount : zone.defaultRainSurge)
    : 0;

  const customerTip = Number((options.customerTip || 0).toFixed(2));

  // 4. สรุปรวมรายได้
  const grossFare = Number((baseFare + totalDistanceFee + peakBonus + rainSurge).toFixed(2));
  const netEarnings = Number((grossFare + customerTip).toFixed(2));

  // 5. ค่าชดเชยจากแพลตฟอร์ม (Platform Subsidy)
  // ปกติลูกค้ามักจ่ายโปรโมชัน 0-25 บาท แต่ไรเดอร์ได้ 40+ บาท
  const customerCharged = options.customerChargedFee !== undefined 
    ? options.customerChargedFee 
    : (distance <= 3 ? 15 : 15 + Math.round((distance - 3) * 6));

  const platformSubsidy = Math.max(0, Number((grossFare - customerCharged).toFixed(2)));

  // สรุปสูตรแสดงผล
  const parts: string[] = [`ฐาน ฿${baseFare.toFixed(0)} (${zone.baseDistanceKm}กม.)`];
  if (extraDistanceFare > 0) {
    parts.push(`ระยะเกิน ${extraDistanceKm}กม.x฿${zone.ratePerKmNormal} (+฿${extraDistanceFare.toFixed(0)})`);
  }
  if (longDistanceFare > 0) {
    parts.push(`ระยะไกลพิเศษ ${longDistanceKm}กม.x฿${zone.ratePerKmLongDistance} (+฿${longDistanceFare.toFixed(0)})`);
  }
  if (peakBonus > 0) parts.push(`ช่วงพีค (+฿${peakBonus.toFixed(0)})`);
  if (rainSurge > 0) parts.push(`ฝนตก (+฿${rainSurge.toFixed(0)})`);
  if (customerTip > 0) parts.push(`ทิปลูกค้า (+฿${customerTip.toFixed(0)})`);

  const formulaString = parts.join(' + ');

  let summaryNoteTh = `ระยะทาง ${distance} กม. อยู่ในเกณฑ์${distance <= zone.baseDistanceKm ? 'ระยะตั้งต้น' : 'ระยะทางจริงส่วนเกิน'}`;
  if (longDistanceKm > 0) {
    summaryNoteTh += ' (ได้รับค่าชดเชยระยะไกลพิเศษ)';
  }

  return {
    distanceKm: distance,
    zone,
    baseFare,
    baseDistanceKm: zone.baseDistanceKm,
    coveredInBaseKm,
    extraDistanceKm,
    extraDistanceFare,
    longDistanceKm,
    longDistanceFare,
    totalDistanceFee,
    distanceFee: totalDistanceFee,
    peakBonus,
    peakSurgeFee: peakBonus,
    rainSurge,
    longDistanceSubsidy: longDistanceFare,
    batchBonus,
    isBatchOrder: !!options.isBatchOrder,
    customerTip,
    grossFare,
    netEarnings,
    totalRiderEarnings: netEarnings,
    customerChargedFee: customerCharged,
    platformSubsidy,
    formulaString,
    summaryNoteTh,
  };
}

/**
 * เปรียบเทียบข้อมูลมาตรฐานค่ารอบของแพลตฟอร์มในประเทศไทย
 */
export const THAI_PLATFORMS_BENCHMARK = [
  {
    platform: 'FoodExpress (ระบบนี้)',
    baseKm: '0 - 3.0 กม.',
    baseFare: '฿40.00',
    extraPerKm: '฿9.00 / กม.',
    longDistPerKm: '฿13.00 (>10 กม.)',
    rainSurge: '+฿20.00',
    peakBonus: '+฿15 - ฿25',
    tipKeep: '100% ไม่หัก GP',
    highlight: 'โปร่งใส คำนวณตามระยะทาง GPS จริง และเงินเข้ากระเป๋าทันที'
  },
  {
    platform: 'GrabFood',
    baseKm: '0 - 3.0 หรือ 4.0 กม.',
    baseFare: '฿40 - ฿44',
    extraPerKm: '฿9 - ฿12 / กม.',
    longDistPerKm: 'ปรับตามโซน',
    rainSurge: '+฿15 - ฿25',
    peakBonus: 'ระบบเพชร/เควส',
    tipKeep: '100%',
    highlight: 'เกณฑ์มาตรฐาน มีอินเซนทีฟตามรอบสะสมประจำสัปดาห์'
  },
  {
    platform: 'LINE MAN',
    baseKm: '0 - 3.0 หรือ 4.0 กม.',
    baseFare: '฿40 - ฿43',
    extraPerKm: '฿8.5 - ฿10 / กม.',
    longDistPerKm: 'ตามขั้นบันได',
    rainSurge: '+฿15 - ฿20',
    peakBonus: 'โบนัสรอบเร่งด่วน',
    tipKeep: '100%',
    highlight: 'มีออเดอร์ร้าน Street Food หนาแน่น'
  },
  {
    platform: 'ShopeeFood',
    baseKm: '0 - 3.0 กม.',
    baseFare: '฿38 - ฿42',
    extraPerKm: '฿8 - ฿9 / กม.',
    longDistPerKm: 'ตามขั้นบันได',
    rainSurge: '+฿15 - ฿25',
    peakBonus: 'เป้าหมายรายวัน',
    tipKeep: '100%',
    highlight: 'งานพ่วงบ่อยในรัศมีใกล้'
  }
];
