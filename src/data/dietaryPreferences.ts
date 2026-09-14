import { DietaryPreference } from '../types';

export interface DietaryPreferenceConfig {
  id: DietaryPreference;
  label: string;
  labelEn: string;
  shortLabel: string;
  emoji: string;
  description: string;
  guaranteeText: string;
  theme: {
    activeBg: string;
    activeText: string;
    activeBorder: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    iconColor: string;
  };
}

export const DIETARY_PREFERENCES: DietaryPreferenceConfig[] = [
  {
    id: 'vegetarian',
    label: 'มังสวิรัติ',
    labelEn: 'Vegetarian',
    shortLabel: 'มังสวิรัติ',
    emoji: '🌱',
    description: 'ไม่มีเนื้อสัตว์ทุกชนิด ปรุงจากผัก เห็ด และเต้าหู้ ทานนมและไข่ได้',
    guaranteeText: 'ร้านนี้มีเมนูมังสวิรัติแยกชัดเจน ไม่ปนเปื้อนเนื้อสัตว์',
    theme: {
      activeBg: 'bg-emerald-600',
      activeText: 'text-white',
      activeBorder: 'border-emerald-600',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-700',
      badgeBorder: 'border-emerald-200',
      iconColor: 'text-emerald-600',
    },
  },
  {
    id: 'vegan',
    label: 'วีแกน / เจ',
    labelEn: 'Vegan & Plant-Based',
    shortLabel: 'วีแกน',
    emoji: '🥗',
    description: 'พืชและโปรตีนจากพืช 100% ปราศจากไข่ นม เนย น้ำผึ้ง และสัตว์ทุกชนิด',
    guaranteeText: 'ใช้วัตถุดิบแพลนต์เบส 100% ปราศจากส่วนผสมจากสัตว์',
    theme: {
      activeBg: 'bg-teal-600',
      activeText: 'text-white',
      activeBorder: 'border-teal-600',
      badgeBg: 'bg-teal-50',
      badgeText: 'text-teal-700',
      badgeBorder: 'border-teal-200',
      iconColor: 'text-teal-600',
    },
  },
  {
    id: 'halal',
    label: 'ฮาลาล',
    labelEn: 'Halal Certified',
    shortLabel: 'ฮาลาล',
    emoji: '☪️',
    description: 'ปรุงถูกต้องตามหลักศาสนาอิสลาม ปราศจากเนื้อหมูและแอลกอฮอล์',
    guaranteeText: 'วัตถุดิบและขั้นตอนการปรุงถูกต้องตามหลักฮาลาล 100%',
    theme: {
      activeBg: 'bg-indigo-600',
      activeText: 'text-white',
      activeBorder: 'border-indigo-600',
      badgeBg: 'bg-indigo-50',
      badgeText: 'text-indigo-700',
      badgeBorder: 'border-indigo-200',
      iconColor: 'text-indigo-600',
    },
  },
  {
    id: 'gluten_free',
    label: 'ปลอดกลูเตน',
    labelEn: 'Gluten-Free',
    shortLabel: 'ไร้กลูเตน',
    emoji: '🌾',
    description: 'ปราศจากแป้งสาลี ข้าวบาร์เลย์ และข้าวไรย์ ปลอดภัยสำหรับผู้แพ้กลูเตน',
    guaranteeText: 'มีเมนูปราศจากกลูเตน ปรุงแยกเพื่อลดการปนเปื้อน',
    theme: {
      activeBg: 'bg-amber-600',
      activeText: 'text-white',
      activeBorder: 'border-amber-600',
      badgeBg: 'bg-amber-50',
      badgeText: 'text-amber-800',
      badgeBorder: 'border-amber-200',
      iconColor: 'text-amber-600',
    },
  },
  {
    id: 'keto',
    label: 'คีโตเจนิค',
    labelEn: 'Keto & Low-Carb',
    shortLabel: 'คีโต',
    emoji: '🥑',
    description: 'คาร์โบไฮเดรตต่ำ ปราศจากน้ำตาลทราย เน้นไขมันดีและโปรตีนคุณภาพ',
    guaranteeText: 'ไม่มีน้ำตาลขัดสี คาร์บสุทธิต่ำ เหมาะสำหรับชาวคีโต',
    theme: {
      activeBg: 'bg-lime-600',
      activeText: 'text-white',
      activeBorder: 'border-lime-600',
      badgeBg: 'bg-lime-50',
      badgeText: 'text-lime-800',
      badgeBorder: 'border-lime-200',
      iconColor: 'text-lime-600',
    },
  },
];

export function getDietaryConfig(id: DietaryPreference): DietaryPreferenceConfig | undefined {
  return DIETARY_PREFERENCES.find(p => p.id === id);
}
