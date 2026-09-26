import { UserGeoLocation, Restaurant } from '../types';

/**
 * Default fallback benchmark location: Sukhumvit 39 / Phrom Phong, Watthana, Bangkok
 */
export const DEFAULT_USER_LOCATION: UserGeoLocation = {
  lat: 13.7360,
  lng: 100.5710,
  accuracy: 10,
  name: 'สุขุมวิท 39 (พร้อมพงษ์)',
  isLiveGPS: false,
  timestamp: Date.now(),
};

/**
 * Benchmark test locations around Bangkok for testing proximity sorting
 */
export interface BenchmarkLocation {
  id: string;
  name: string;
  nameEn: string;
  district: string;
  province?: 'bangkok' | 'korat';
  lat: number;
  lng: number;
  description: string;
}

export const KORAT_BENCHMARK_LOCATIONS: BenchmarkLocation[] = [
  {
    id: 'korat_yamo',
    name: 'ลานย่าโม (อนุสาวรีย์ท้าวสุรนารี)',
    nameEn: 'Thao Suranari (Ya Mo) Monument',
    district: 'อ.เมืองนครราชสีมา',
    province: 'korat',
    lat: 14.9738,
    lng: 102.0978,
    description: 'ใจกลางเมืองโคราช ใกล้ครัวสุวิมล (2.6 กม.) และปลาเผาสืบศิริ (3.4 กม.)',
  },
  {
    id: 'korat_suebsiri',
    name: 'ถ.สืบศิริ / ร่วมเริงไชย (ในเมืองโคราช)',
    nameEn: 'Sueb Siri Rd / Ruam Roeng Chai',
    district: 'อ.เมืองนครราชสีมา',
    province: 'korat',
    lat: 14.9625,
    lng: 102.0680,
    description: 'ติดร้านปลาเผาสืบศิริ (0.1 กม.) และครัวสุวิมล (1.8 กม.)',
  },
  {
    id: 'korat_themall',
    name: 'เดอะมอลล์ โคราช / ถ.มิตรภาพ',
    nameEn: 'The Mall Korat / Mittraphap',
    district: 'อ.เมืองนครราชสีมา',
    province: 'korat',
    lat: 14.9782,
    lng: 102.0725,
    description: 'ติดร้านครัวสุวิมล โคราช (0.1 กม.) และใกล้ปลาเผาสืบศิริ (1.7 กม.)',
  },
  {
    id: 'korat_pradok',
    name: 'บ้านประโดก / ต.หมื่นไวย โคราช',
    nameEn: 'Ban Pradok / Muen Wai',
    district: 'อ.เมืองนครราชสีมา',
    province: 'korat',
    lat: 15.0028,
    lng: 102.1055,
    description: 'ติดร้านขนมจีนประโดก ป้าพร (0.1 กม.)',
  },
  {
    id: 'korat_pakchong',
    name: 'ปากช่อง / ถ.มิตรภาพ (ประตูสู่เขาใหญ่)',
    nameEn: 'Pak Chong / Mittraphap Road',
    district: 'อ.ปากช่อง (นครราชสีมา)',
    province: 'korat',
    lat: 14.6850,
    lng: 101.4120,
    description: 'ติดร้านสเต็กเขาใหญ่ คาวบอยกริลล์ (0.2 กม.)',
  },
];

export const BANGKOK_BENCHMARK_LOCATIONS: BenchmarkLocation[] = [
  {
    id: 'sukhumvit_39',
    name: 'สุขุมวิท 39 (พร้อมพงษ์)',
    nameEn: 'Sukhumvit 39 / Phrom Phong',
    district: 'วัฒนา',
    province: 'bangkok',
    lat: 13.7360,
    lng: 100.5710,
    description: 'ใกล้กะเพรา 1999 (0.8 กม.) และชาตราเพลิน (0.5 กม.)',
  },
  {
    id: 'thonglor_10',
    name: 'ทองหล่อ ซอย 10',
    nameEn: 'Thonglor Soi 10',
    district: 'วัฒนา',
    province: 'bangkok',
    lat: 13.7330,
    lng: 100.5820,
    description: 'ใกล้ราเมง ฮาจิเมะ (0.1 กม.) และส้มตำคุณแม่ (0.9 กม.)',
  },
  {
    id: 'ekkamai_12',
    name: 'เอกมัย ซอย 12',
    nameEn: 'Ekkamai Soi 12',
    district: 'วัฒนา',
    province: 'bangkok',
    lat: 13.7285,
    lng: 100.5890,
    description: 'ติดร้านส้มตำคุณแม่ แซ่บนัว (0.1 กม.)',
  },
  {
    id: 'asoke_bts',
    name: 'BTS อโศก / สุขุมวิท 21-23',
    nameEn: 'Asoke Intersection',
    district: 'คลองเตย/วัฒนา',
    province: 'bangkok',
    lat: 13.7370,
    lng: 100.5615,
    description: 'ใกล้เบอร์เกอร์ คราฟต์ แฟคทอรี (0.2 กม.) และกะเพรา 1999 (0.7 กม.)',
  },
  {
    id: 'sukhumvit_49',
    name: 'สุขุมวิท 49 (ซอยกลาง)',
    nameEn: 'Sukhumvit 49',
    district: 'วัฒนา',
    province: 'bangkok',
    lat: 13.7380,
    lng: 100.5765,
    description: 'ใกล้พิซซ่าเตาถ่าน นาโปลี (0.2 กม.) และชาตราเพลิน (0.4 กม.)',
  },
  {
    id: 'siam_paragon',
    name: 'สยามพารากอน / ปทุมวัน',
    nameEn: 'Siam Paragon / Pathum Wan',
    district: 'ปทุมวัน',
    province: 'bangkok',
    lat: 13.7460,
    lng: 100.5348,
    description: 'ห่างจากโซนสุขุมวิทประมาณ 3.5 - 5.0 กม. (Sweet Spot แนะนำ)',
  },
  {
    id: 'silom_satun',
    name: 'สีลม / สาทร (BTS ศาลาแดง)',
    nameEn: 'Silom / Sathorn',
    district: 'บางรัก',
    province: 'bangkok',
    lat: 13.7285,
    lng: 100.5350,
    description: 'ห่างจากโซนสุขุมวิทประมาณ 5.2 - 7.2 กม. (ระยะมาตรฐาน 30-45 นาที)',
  },
  {
    id: 'chatuchak_ladprao',
    name: 'เซ็นทรัลลาดพร้าว / จตุจักร',
    nameEn: 'Ladprao / Chatuchak',
    district: 'จตุจักร',
    province: 'bangkok',
    lat: 13.8165,
    lng: 100.5610,
    description: 'ห่างจากโซนสุขุมวิทประมาณ 8.5 - 10.5 กม. (ระยะไกล >45 นาที กระเป๋าคุมอุณหภูมิ)',
  },
];

export const ALL_BENCHMARK_LOCATIONS: BenchmarkLocation[] = [
  ...BANGKOK_BENCHMARK_LOCATIONS,
  ...KORAT_BENCHMARK_LOCATIONS,
];

/**
 * Calculates the geodesic distance between two latitude/longitude points using the Haversine formula.
 * @returns distance in kilometers rounded to 1 decimal place (e.g. 1.2)
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Round to 1 decimal place, minimum 0.1 km
  const rounded = Math.round(distance * 10) / 10;
  return rounded < 0.1 ? 0.1 : rounded;
}

/**
 * Format distance nicely in Thai language:
 * < 1.0 km formatted as meters (e.g. "450 ม.")
 * >= 1.0 km formatted as km (e.g. "1.4 กม.")
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1.0) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} ม.`;
  }
  return `${distanceKm.toFixed(1)} กม.`;
}

/**
 * Dynamically computes delivery time based on kitchen prep time and travel transit time
 */
export function estimateDeliveryMinutes(prepTimeMinutes: number = 15, distanceKm: number = 1.5): number {
  // Assume urban rider speed ~ 3.5 minutes per km + 3 minutes dispatch/buffer
  const transitMinutes = Math.round(distanceKm * 3.5 + 3);
  const total = prepTimeMinutes + transitMinutes;
  return Math.max(12, Math.min(60, total));
}

/**
 * Gets distance for a restaurant from a given user location.
 * Uses restaurant.geoLocation if available, otherwise falls back to restaurant.distanceKm.
 */
export function getRestaurantDistance(
  restaurant: Restaurant,
  userLocation: UserGeoLocation | null
): number {
  if (userLocation && restaurant.geoLocation) {
    return calculateDistanceKm(
      userLocation.lat,
      userLocation.lng,
      restaurant.geoLocation.lat,
      restaurant.geoLocation.lng
    );
  }
  return restaurant.distanceKm;
}

export interface GeolocationResult {
  success: boolean;
  location?: UserGeoLocation;
  error?: string;
  code?: number;
}

/**
 * Acquire current geolocation using the browser's navigator.geolocation API.
 * Handles timeouts, permission denies, and insecure/iframe restrictions safely.
 */
export async function requestDeviceGeolocation(
  timeoutMs: number = 9000
): Promise<GeolocationResult> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return {
      success: false,
      error: 'อุปกรณ์หรือเบราว์เซอร์ของคุณไม่รองรับระบบระบุตำแหน่งทางภูมิศาสตร์ (Geolocation)',
    };
  }

  return new Promise<GeolocationResult>(resolve => {
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude, accuracy } = position.coords;
        const location: UserGeoLocation = {
          lat: latitude,
          lng: longitude,
          accuracy: Math.round(accuracy || 15),
          name: `พิกัด GPS (${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°)`,
          isLiveGPS: true,
          timestamp: position.timestamp || Date.now(),
        };
        resolve({ success: true, location });
      },
      error => {
        let errorMsg = 'ไม่สามารถดึงตำแหน่งพิกัดได้';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'การเข้าถึงตำแหน่งถูกปฏิเสธ (กรุณาอนุญาต Geolocation ในเบราว์เซอร์)';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'สัญญาณดาวเทียมหรือเครือข่ายตำแหน่งไม่พร้อมใช้งานในขณะนี้';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'หมดเวลาในการค้นหาสัญญาณดาวเทียม GPS';
        }
        resolve({ success: false, error: errorMsg, code: error.code });
      },
      {
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 30000,
      }
    );
  });
}
