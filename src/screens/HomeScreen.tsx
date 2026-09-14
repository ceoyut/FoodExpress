import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { RESTAURANTS_DATA, CATEGORIES } from '../data/mockData';
import { RestaurantCard } from '../components/RestaurantCard';
import { PromoBannerCarousel } from '../components/PromoBannerCarousel';
import { LocationSortControl } from '../components/LocationSortControl';
import { RestaurantSortOption } from '../types';
import { getRestaurantDistance } from '../utils/geolocation';
import { 
  Search, 
  Sparkles, 
  Flame, 
  Bike, 
  Star, 
  Clock, 
  Percent, 
  ChevronRight, 
  SlidersHorizontal,
  MapPin
} from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const { 
    user, 
    userLocation,
    setSelectedRestaurant, 
    setIsNotificationsOpen,
    setActiveTab
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [activeFilter, setActiveFilter] = useState<'all' | 'free_delivery' | 'high_rating' | 'fast' | 'promo'>('all');
  
  // Location-based Sorting & Radius Filter States
  const [sortOption, setSortOption] = useState<RestaurantSortOption>('proximity');
  const [maxDistanceFilter, setMaxDistanceFilter] = useState<number | null>(null);

  // Compute restaurants with real-time calculated distance from user's geolocation
  const processedRestaurants = useMemo(() => {
    // 1. Calculate real-time distance for all restaurants
    const withDistance = RESTAURANTS_DATA.map(rest => {
      const calculatedDistance = getRestaurantDistance(rest, userLocation);
      return {
        ...rest,
        calculatedDistance,
      };
    });

    // 2. Filter restaurants
    const filtered = withDistance.filter(rest => {
      // Search matching
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = rest.name.toLowerCase().includes(q) || (rest.nameEn && rest.nameEn.toLowerCase().includes(q));
        const matchMenu = Array.isArray(rest.menu) ? rest.menu.some(m => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)) : false;
        const matchCategory = rest.category.toLowerCase().includes(q);
        if (!matchName && !matchMenu && !matchCategory) return false;
      }

      // Category matching
      if (selectedCategory && selectedCategory !== 'ทั้งหมด' && rest.category !== selectedCategory) {
        return false;
      }

      // Quick filter chips
      if (activeFilter === 'free_delivery' && rest.deliveryFee > 0) return false;
      if (activeFilter === 'high_rating' && rest.rating < 4.8) return false;
      if (activeFilter === 'fast' && rest.deliveryTimeMinutes > 20) return false;
      if (activeFilter === 'promo' && !rest.promoBadge) return false;

      // Distance radius filter
      if (maxDistanceFilter !== null && rest.calculatedDistance > maxDistanceFilter) {
        return false;
      }

      return true;
    });

    // 3. Sort restaurants
    return filtered.sort((a, b) => {
      if (sortOption === 'proximity') {
        // Sort by distance to user's geolocation ascending
        return a.calculatedDistance - b.calculatedDistance;
      }
      if (sortOption === 'rating') {
        return b.rating - a.rating;
      }
      if (sortOption === 'delivery_time') {
        return a.deliveryTimeMinutes - b.deliveryTimeMinutes;
      }
      if (sortOption === 'delivery_fee') {
        return a.deliveryFee - b.deliveryFee;
      }
      if (sortOption === 'popular') {
        return b.reviewCount - a.reviewCount;
      }
      return 0;
    });
  }, [searchQuery, selectedCategory, activeFilter, sortOption, maxDistanceFilter, userLocation]);

  // Min and max distances in current result set
  const distances = processedRestaurants.map(r => r.calculatedDistance);
  const minDistance = distances.length > 0 ? Math.min(...distances) : 0;
  const maxDistance = distances.length > 0 ? Math.max(...distances) : 0;

  return (
    <div className="p-3 sm:p-5 space-y-4 sm:space-y-5">
      
      {/* Top Welcome & Member Tier Status Bar */}
      <div className="flex items-center justify-between gap-3 px-0.5">
        <div>
          <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
            <span>สวัสดี,</span>
            <span className="font-bold text-slate-800">คุณ{user.name.split(' ')[0]}</span>
            <span>👋</span>
          </p>
          <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
            ดีลเด็ดและร้านอาหารแนะนำวันนี้
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-800 text-[11px] font-bold flex items-center gap-1 shadow-2xs">
            <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
            <span>{user.tier} Member</span>
          </span>
          <button
            id="home-open-rewards-quick-btn"
            onClick={() => setActiveTab('rewards')}
            className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
            title="ดูคะแนนสะสมและแลกรางวัล"
          >
            {user.loyaltyPoints} แต้ม
          </button>
        </div>
      </div>

      {/* Swipeable Promotional Banner Section (Featured Restaurants & Seasonal Discounts) */}
      <PromoBannerCarousel />

      {/* Rider Partner Quick Access Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-3.5 sm:p-4 text-white shadow-xs flex items-center justify-between gap-3 border border-slate-700/60">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xl shrink-0">
            🛵
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white">FoodExpress Rider Hub</span>
              <span className="text-[9px] font-extrabold bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded-full uppercase">
                เปิดรับสมัคร
              </span>
            </div>
            <p className="text-[11px] text-slate-300 truncate">
              สมัครพนักงานจัดส่ง • ระบบคิวรับงาน • ถอนเงินไว 24 ชม.
            </p>
          </div>
        </div>

        <button
          id="home-open-rider-hub-btn"
          onClick={() => setActiveTab('rider_hub')}
          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer shrink-0 flex items-center gap-1"
        >
          <span>ศูนย์ไรเดอร์</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          id="search-restaurants-input"
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="ค้นหาร้านอาหาร, ข้าวกะเพรา, ชานม, ส้มตำ..."
          className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Pills Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-900 px-1">
          <span>หมวดหมู่อาหาร</span>
          <span className="text-slate-400 text-[11px] font-normal">เลื่อนดูเพิ่มเติม →</span>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              id={`cat-btn-${cat.id}`}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3.5 py-2 rounded-2xl flex items-center gap-2 whitespace-nowrap text-xs font-semibold transition-all shrink-0 ${
                selectedCategory === cat.name
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-600'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="text-base leading-none">{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar text-xs">
        <button
          id="filter-all-btn"
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-full font-medium transition-colors shrink-0 ${
            activeFilter === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          ทั้งหมด
        </button>

        <button
          id="filter-free-delivery-btn"
          onClick={() => setActiveFilter('free_delivery')}
          className={`px-3 py-1.5 rounded-full font-medium flex items-center gap-1 transition-colors shrink-0 ${
            activeFilter === 'free_delivery'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Bike className="w-3.5 h-3.5 text-emerald-500" />
          <span>ส่งฟรี 0 บาท</span>
        </button>

        <button
          id="filter-high-rating-btn"
          onClick={() => setActiveFilter('high_rating')}
          className={`px-3 py-1.5 rounded-full font-medium flex items-center gap-1 transition-colors shrink-0 ${
            activeFilter === 'high_rating'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>คะแนน 4.8+</span>
        </button>

        <button
          id="filter-fast-btn"
          onClick={() => setActiveFilter('fast')}
          className={`px-3 py-1.5 rounded-full font-medium flex items-center gap-1 transition-colors shrink-0 ${
            activeFilter === 'fast'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span>ส่งไว &lt; 20 นาที</span>
        </button>

        <button
          id="filter-promo-btn"
          onClick={() => setActiveFilter('promo')}
          className={`px-3 py-1.5 rounded-full font-medium flex items-center gap-1 transition-colors shrink-0 ${
            activeFilter === 'promo'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Percent className="w-3.5 h-3.5 text-rose-500" />
          <span>มีส่วนลดพิเศษ</span>
        </button>
      </div>

      {/* Geolocation & Proximity Sorting Control Bar */}
      <LocationSortControl
        currentSort={sortOption}
        onSortChange={setSortOption}
        maxDistanceFilter={maxDistanceFilter}
        onDistanceFilterChange={setMaxDistanceFilter}
        filteredCount={processedRestaurants.length}
        minDistance={minDistance}
        maxDistance={maxDistance}
      />

      {/* Restaurants Section Title */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-900 text-base">
              {sortOption === 'proximity' ? 'ร้านอาหารเรียงตามระยะทางใกล้คุณ' : 'ร้านอาหารแนะนำยอดนิยม'}
            </h3>
            {sortOption === 'proximity' && (
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" />
                ใกล้คุณที่สุด
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            พบ {processedRestaurants.length} ร้านอร่อยพร้อมจัดส่ง
            {sortOption === 'proximity' && ` • เรียงจากใกล้สุด (${minDistance} กม.)`}
          </p>
        </div>
      </div>

      {/* Restaurants Grid */}
      {processedRestaurants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {processedRestaurants.map((restaurant, index) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              onClick={() => setSelectedRestaurant(restaurant)}
              calculatedDistanceKm={restaurant.calculatedDistance}
              isDistanceSorted={sortOption === 'proximity'}
              proximityRank={index + 1}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">ไม่พบร้านอาหารที่ตรงกับการค้นหา</h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            ลองเปลี่ยนคำค้นหา หรือล้างตัวกรองเพื่อค้นหาเมนูอร่อยอื่นๆ
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ทั้งหมด');
              setActiveFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      )}
    </div>
  );
};
