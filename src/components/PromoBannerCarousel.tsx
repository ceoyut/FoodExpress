import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Flame, 
  Tag, 
  Clock, 
  Star, 
  ArrowRight, 
  Copy, 
  Check, 
  Store,
  Gift
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RESTAURANTS_DATA } from '../data/mockData';
import { Restaurant } from '../types';
import promoBannerGreenImg from '../assets/images/promo_banner_green_1789709495074.jpg';

interface PromoBannerItem {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  highlightText: string;
  description: string;
  couponCode?: string;
  discountBadge: string;
  restaurantId: string;
  ctaText: string;
  bgGradient: string;
  imageUrl: string;
  category: string;
}

const PROMO_BANNERS: PromoBannerItem[] = [
  {
    id: 'promo-lineman-campaign',
    badge: 'คนละครึ่ง x2 • LINE MAN แจกเพิ่ม',
    badgeColor: 'bg-emerald-400 text-slate-950 font-black',
    title: 'อิ่มคุ้มทุกมื้อ แจกโค้ดลดเพิ่ม 800+ บ.',
    highlightText: 'ลดสูงสุด 50% + คูปองส่วนลดจัดเต็มทุกร้านดัง',
    description: 'สั่งอาหารและของสดจากซูเปอร์มาร์เก็ตชั้นนำ รับเงินคืนและคูปองส่วนลดพิเศษทุกวัน',
    couponCode: 'LINEMAN800',
    discountBadge: 'โค้ดลด ฿800+',
    restaurantId: 'rest_1',
    ctaText: 'ใช้โค้ดลดเลย',
    bgGradient: 'from-emerald-950/90 via-[#00BA76]/80 to-slate-900/85',
    imageUrl: promoBannerGreenImg,
    category: 'แคมเปญสุดคุ้ม'
  },
  {
    id: 'promo-1',
    badge: 'Seasonal Mega Deal • ดีลเด็ดสิ้นสุดสัปดาห์นี้',
    badgeColor: 'bg-amber-400 text-slate-950',
    title: 'เทศกาลอาหารไทยเตาถ่าน',
    highlightText: 'ลดสูงสุด 40% + อิ่มคุ้มทุกเมนูยอดนิยม',
    description: 'กะเพราเนื้อโคขุนคั่วพริกแห้งและไข่ดาวเป็ดลาวา เสิร์ฟร้อนจากเตาถ่านโบราณ',
    couponCode: 'RAINY40',
    discountBadge: 'ลด 40% ไม่มีขั้นต่ำ',
    restaurantId: 'rest_1',
    ctaText: 'สั่งเลยลด 40%',
    bgGradient: 'from-amber-950/90 via-slate-900/85 to-emerald-950/80',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1000&auto=format&fit=crop&q=80',
    category: 'อาหารไทยจานเดียว'
  },
  {
    id: 'promo-2',
    badge: 'Autumn Ramen Festival • การันตี 4.9 ดาว',
    badgeColor: 'bg-rose-500 text-white',
    title: 'ราเมง ฮาจิเมะ ทงคัตสึเข้มข้น 16 ชม.',
    highlightText: 'ฟรีเกี๊ยวซ่าคุโรบูตะ เมื่อสั่ง 2 ชาม',
    description: 'ซดน้ำซุปกระดูกหมูสูตรฟุกุโอกะแท้ เส้นเหนียวนุ่ม หมูชาชูยักษ์เบิร์นไฟหอมกรุ่น',
    couponCode: 'RAMENFREE',
    discountBadge: 'ฟรีเกี๊ยวซ่า ฿95',
    restaurantId: 'rest_3',
    ctaText: 'ลิ้มลองราเมงแท้',
    bgGradient: 'from-stone-950/90 via-rose-950/80 to-slate-900/85',
    imageUrl: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=1000&auto=format&fit=crop&q=80',
    category: 'อาหารญี่ปุ่น'
  },
  {
    id: 'promo-3',
    badge: 'Michelin Guide 3 ปีซ้อน • แซ่บนัวระดับตำนาน',
    badgeColor: 'bg-red-500 text-white',
    title: 'ส้มตำคุณแม่ แซ่บนัว เอกมัย',
    highlightText: 'เซ็ตส้มตำ & คอหมูย่าง ลดทันที ฿70',
    description: 'ส้มตำไทยไข่เค็มมะละกอกรอบ คอหมูย่างเตาถ่านหมักงาขาว จิ้มแจ่วมะขามเปียกสูตรลับ',
    couponCode: 'ZAP70',
    discountBadge: 'ลด ฿70 สั่งครบ 250.-',
    restaurantId: 'rest_2',
    ctaText: 'สั่งเซ็ตแซ่บมิชลิน',
    bgGradient: 'from-red-950/90 via-orange-950/85 to-slate-900/85',
    imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=1000&auto=format&fit=crop&q=80',
    category: 'อาหารอีสาน / ส้มตำ'
  },
  {
    id: 'promo-4',
    badge: 'Sweet Craving Flash Deal • สั่งด่วน 15 นาที',
    badgeColor: 'bg-emerald-400 text-slate-950',
    title: 'ชาตราเพลิน & ขนมปังปิ้งเตาถ่าน',
    highlightText: 'ซื้อ 1 แถม 1 ชานมไข่มุกบราวชูการ์',
    description: 'ชาซีลอนเคี่ยวนมสดฮอกไกโด ไข่มุกสีทองนุ่มหนึบ ทานคู่ขนมปังปิ้งไส้สังขยาใบเตยสดลาวา',
    couponCode: 'BOGOPEAN',
    discountBadge: 'ซื้อ 1 แถม 1 ทันที',
    restaurantId: 'rest_4',
    ctaText: 'รับสิทธิ์ 1 แถม 1',
    bgGradient: 'from-emerald-950/90 via-teal-950/85 to-slate-900/85',
    imageUrl: 'https://images.unsplash.com/photo-1558857563-b37fcbf725b7?w=1000&auto=format&fit=crop&q=80',
    category: 'คาเฟ่ & ชานม & ของหวาน'
  },
  {
    id: 'promo-5',
    badge: 'Gourmet Smash Burger • ชีสเยิ้มฉ่ำเนื้อ',
    badgeColor: 'bg-amber-500 text-white',
    title: 'เบอร์เกอร์ คราฟต์ แฟคทอรี',
    highlightText: 'Flash Deal เซ็ตเบอร์เกอร์ + ฟรายส์ ฿149',
    description: 'เนื้อดรายเอจสแมชขอบกรอบ หอมใหญ่ผัดคาราเมลไลซ์ ซอสสเปเชียลคราฟต์ทำสด',
    couponCode: 'SMASH149',
    discountBadge: 'ลดเหลือ ฿149 (ปกติ ฿220)',
    restaurantId: 'rest_5',
    ctaText: 'คว้าดีลเบอร์เกอร์',
    bgGradient: 'from-slate-950/95 via-amber-950/80 to-stone-900/85',
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1000&auto=format&fit=crop&q=80',
    category: 'เบอร์เกอร์ & ฟาสต์ฟู้ด'
  }
];

export const PromoBannerCarousel: React.FC = () => {
  const { setSelectedRestaurant, triggerToast } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Touch and drag coordinates for smooth swiping
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const isDragging = useRef<boolean>(false);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = PROMO_BANNERS.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-play interval
  useEffect(() => {
    if (isPaused) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      return;
    }

    autoPlayTimerRef.current = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isPaused, nextSlide]);

  // Touch event handlers for mobile swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (!touchStartX.current || !touchEndX.current) return;

    const diff = touchStartX.current - touchEndX.current;
    const swipeThreshold = 45; // Min px to trigger slide

    if (diff > swipeThreshold) {
      // Swiped Left -> Next
      nextSlide();
    } else if (diff < -swipeThreshold) {
      // Swiped Right -> Prev
      prevSlide();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Mouse drag handlers for desktop trackpad/mouse swiping
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    touchStartX.current = e.clientX;
    touchEndX.current = null;
    setIsPaused(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    touchEndX.current = e.clientX;
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setIsPaused(false);

    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;
      const swipeThreshold = 45;

      if (diff > swipeThreshold) {
        nextSlide();
      } else if (diff < -swipeThreshold) {
        prevSlide();
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Select featured restaurant
  const handleSelectFeaturedRestaurant = (restaurantId: string, banner: PromoBannerItem) => {
    const target = RESTAURANTS_DATA.find(r => r.id === restaurantId);
    if (target) {
      setSelectedRestaurant(target);
      triggerToast(`เปิดเมนูร้าน "${target.name}" พร้อมดีลพิเศษเรียบร้อยแล้ว`, 'success');
    }
  };

  // Copy coupon code
  const handleCopyCode = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    triggerToast(`คัดลอกโค้ด "${code}" สำเร็จ! นำไปใส่ในตะกร้าได้เลย`, 'success');
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  const activeBanner = PROMO_BANNERS[currentIndex];
  const currentRestaurant = RESTAURANTS_DATA.find(r => r.id === activeBanner.restaurantId);

  return (
    <section 
      id="promo-banner-carousel-section"
      aria-label="โปรโมชั่นและร้านค้าแนะนำ"
      className="relative select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false);
        isDragging.current = false;
      }}
    >
      {/* Outer Banner Card Container with Swipe Listeners */}
      <div 
        className="relative rounded-3xl overflow-hidden shadow-md shadow-slate-950/10 border border-slate-200/60 cursor-grab active:cursor-grabbing group min-h-[220px] sm:min-h-[240px] bg-slate-900"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeBanner.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative w-full h-full min-h-[220px] sm:min-h-[240px] flex flex-col justify-between p-4 sm:p-6 text-white"
          >
            {/* Background Image with Crisp Blur & Vignette Overlay */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img
                src={activeBanner.imageUrl}
                alt={activeBanner.title}
                className="w-full h-full object-cover object-center scale-105 filter brightness-75 transition-transform duration-700 ease-out group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              {/* Dark Gradient Overlay for Maximum Text Contrast */}
              <div className={`absolute inset-0 bg-gradient-to-r ${activeBanner.bgGradient} opacity-95`} />
              <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/20 to-black/60 pointer-events-none" />
            </div>

            {/* Top Row: Badge, Seasonal Tag & Counter */}
            <div className="relative z-10 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black tracking-wide shadow-xs ${activeBanner.badgeColor}`}>
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{activeBanner.badge}</span>
                </span>

                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold text-white border border-white/20">
                  <Tag className="w-3 h-3 text-amber-300" />
                  <span>{activeBanner.discountBadge}</span>
                </span>
              </div>

              {/* Slide Counter & Swipe Tip */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-200">
                <span className="font-extrabold text-amber-300">{currentIndex + 1}</span>
                <span className="text-slate-400">/</span>
                <span>{totalSlides}</span>
                <span className="hidden md:inline text-slate-400 font-sans ml-1 text-[9px]">
                  (ปัดเพื่อดูดีลถัดไป)
                </span>
              </div>
            </div>

            {/* Middle Content: Title, Highlight Discount & Description */}
            <div className="relative z-10 my-3 sm:my-4 space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                {currentRestaurant && (
                  <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-lg border border-white/15 text-[11px] font-bold text-emerald-300">
                    <Store className="w-3 h-3" />
                    <span className="truncate max-w-[150px] sm:max-w-xs">{currentRestaurant.name}</span>
                    <span className="text-amber-400 flex items-center gap-0.5 ml-1">
                      <Star className="w-2.5 h-2.5 fill-amber-400" />
                      {currentRestaurant.rating}
                    </span>
                  </div>
                )}
              </div>

              <h2 className="text-lg sm:text-2xl font-black tracking-tight leading-tight drop-shadow-sm">
                {activeBanner.title}
              </h2>

              <p className="text-sm sm:text-base font-extrabold text-amber-300 drop-shadow-xs flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                <span>{activeBanner.highlightText}</span>
              </p>

              <p className="text-xs text-slate-200 font-normal line-clamp-2 sm:line-clamp-none max-w-lg leading-relaxed text-slate-100/90">
                {activeBanner.description}
              </p>
            </div>

            {/* Bottom Row: Actions (CTA button + Promo Code Copy) */}
            <div className="relative z-10 flex items-center justify-between gap-3 pt-1 border-t border-white/15">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Primary CTA: Open Featured Restaurant */}
                <button
                  id={`promo-banner-cta-${activeBanner.id}`}
                  onClick={() => handleSelectFeaturedRestaurant(activeBanner.restaurantId, activeBanner)}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{activeBanner.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {/* Optional Promo Code Pill with One-Click Copy */}
                {activeBanner.couponCode && (
                  <button
                    id={`promo-code-btn-${activeBanner.couponCode}`}
                    onClick={(e) => handleCopyCode(e, activeBanner.couponCode!)}
                    title="คลิกเพื่อคัดลอกโค้ดส่วนลด"
                    className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 border border-white/25 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
                  >
                    <span className="text-[10px] text-slate-300">โค้ด:</span>
                    <span className="font-mono text-amber-300 tracking-wider">
                      {activeBanner.couponCode}
                    </span>
                    {copiedCode === activeBanner.couponCode ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-300" />
                    )}
                  </button>
                )}
              </div>

              {/* Delivery Speed / Benefit Badge */}
              {currentRestaurant && (
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 bg-black/30 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-white/10">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  <span>ส่งไว {currentRestaurant.deliveryTimeMinutes} นาที</span>
                  <span className="text-slate-500">•</span>
                  <span>{currentRestaurant.deliveryFee === 0 ? 'ส่งฟรี' : `ค่าส่ง ฿${currentRestaurant.deliveryFee}`}</span>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Previous Slide Arrow Button */}
        <button
          id="promo-banner-prev-btn"
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          aria-label="ดีลก่อนหน้า"
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer z-20"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Next Slide Arrow Button */}
        <button
          id="promo-banner-next-btn"
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          aria-label="ดีลถัดไป"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer z-20"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Pagination Indicators & Quick Switcher */}
      <div className="flex items-center justify-center gap-1.5 mt-2.5">
        {PROMO_BANNERS.map((banner, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={banner.id}
              id={`promo-dot-indicator-${idx}`}
              onClick={() => goToSlide(idx)}
              aria-label={`ไปยังแบนเนอร์ ${banner.title}`}
              className={`transition-all rounded-full cursor-pointer ${
                isActive 
                  ? 'w-7 h-2 bg-emerald-600' 
                  : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          );
        })}
      </div>
    </section>
  );
};
