import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { RESTAURANTS_DATA, CATEGORIES } from '../data/mockData';
import { RestaurantCard } from '../components/RestaurantCard';
import { PromoBannerCarousel } from '../components/PromoBannerCarousel';
import { LocationSortControl } from '../components/LocationSortControl';
import { DietaryFilterBar } from '../components/DietaryFilterBar';
import { FavoritesModal } from '../components/FavoritesModal';
import { MessengerModal } from '../components/MessengerModal';
import { TaxiModal } from '../components/TaxiModal';
import { SupermarketModal } from '../components/SupermarketModal';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { RestaurantSortOption, DietaryPreference } from '../types';
import { getRestaurantDistance } from '../utils/geolocation';
import { calculateStandardDeliveryFee } from '../utils/riderFareCalculator';
import { DeliverySlaModal } from '../components/DeliverySlaModal';
import { PageFooter } from '../components/PageFooter';
import foodMascotImg from '../assets/images/food_mascot_1789709435278.jpg';
import messengerImg from '../assets/images/messenger_scooter_1789709446992.jpg';
import taxiRideImg from '../assets/images/taxi_ride_1789709464979.jpg';
import martBasketImg from '../assets/images/mart_basket_1789709478997.jpg';
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
  MapPin,
  Heart,
  Wallet as WalletIcon,
  Bell,
  Zap
} from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const { 
    user, 
    userLocation,
    setSelectedRestaurant, 
    setIsNotificationsOpen,
    unreadNotificationCount,
    setIsAuthModalOpen,
    setIsWalletOpen,
    setActiveTab,
    t,
    language,
    restaurantList
  } = useApp();

  const sourceRestaurants = useMemo(() => {
    return (restaurantList && restaurantList.length > 0) ? restaurantList : RESTAURANTS_DATA;
  }, [restaurantList]);

  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [isTaxiOpen, setIsTaxiOpen] = useState(false);
  const [isSupermarketOpen, setIsSupermarketOpen] = useState(false);
  const [isSlaModalOpen, setIsSlaModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [activeFilter, setActiveFilter] = useState<'all' | 'free_delivery' | 'high_rating' | 'fast' | 'promo' | 'sweet_spot'>('all');
  const [selectedDietary, setSelectedDietary] = useState<DietaryPreference | 'all'>('all');
  
  // Location-based Sorting & Radius Filter States
  const [sortOption, setSortOption] = useState<RestaurantSortOption>('proximity');
  const [maxDistanceFilter, setMaxDistanceFilter] = useState<number | null>(null);

  // Compute counts of available restaurants per dietary preference
  const dietaryCounts = useMemo(() => {
    const counts: Record<DietaryPreference | 'all', number> = {
      all: sourceRestaurants.length,
      vegetarian: 0,
      vegan: 0,
      halal: 0,
      gluten_free: 0,
      keto: 0,
    };

    sourceRestaurants.forEach(r => {
      const prefs = new Set<DietaryPreference>(r.dietaryPreferences || []);
      r.menu?.forEach(m => {
        m.dietary?.forEach(d => prefs.add(d));
      });
      prefs.forEach(p => {
        if (counts[p] !== undefined) {
          counts[p] = (counts[p] || 0) + 1;
        }
      });
    });

    return counts;
  }, [sourceRestaurants]);

  // Compute restaurants with real-time calculated distance from user's geolocation
  const processedRestaurants = useMemo(() => {
    // 1. Calculate real-time distance and standard rider delivery fee for all restaurants
    const withDistance = sourceRestaurants.map(rest => {
      const calculatedDistance = getRestaurantDistance(rest, userLocation);
      const deliveryFee = calculateStandardDeliveryFee(calculatedDistance);
      return {
        ...rest,
        calculatedDistance,
        deliveryFee,
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

      // Dietary preference matching
      if (selectedDietary !== 'all') {
        const hasRestaurantPref = rest.dietaryPreferences?.includes(selectedDietary);
        const hasMenuPref = Array.isArray(rest.menu) && rest.menu.some(m => m.dietary?.includes(selectedDietary));
        if (!hasRestaurantPref && !hasMenuPref) {
          return false;
        }
      }

      // Quick filter chips
      if (activeFilter === 'sweet_spot' && rest.calculatedDistance > 5.0) return false;
      if (activeFilter === 'free_delivery' && rest.calculatedDistance > 3.0) return false;
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
  }, [searchQuery, selectedCategory, activeFilter, selectedDietary, sortOption, maxDistanceFilter, userLocation]);

  // Min and max distances in current result set
  const distances = processedRestaurants.map(r => r.calculatedDistance);
  const minDistance = distances.length > 0 ? Math.min(...distances) : 0;
  const maxDistance = distances.length > 0 ? Math.max(...distances) : 0;

  return (
    <div className="space-y-4">
      {/* Top Superapp Green Canopy (Matching Reference Image) */}
      <div className="bg-gradient-to-b from-[#00BA76] via-[#00BA76] to-[#009E60] pt-2 sm:pt-3 px-4 pb-5 sm:pb-6 rounded-b-[28px] shadow-sm text-white">
        {/* Top Utility Bar */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <LanguageSwitcher />
            <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-1 backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
              Firebase Cloud
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Wallet Pill */}
            <button
              id="home-wallet-pill-btn"
              onClick={() => setIsWalletOpen(true)}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-xs px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="เติมเงิน / กระเป๋าเงิน"
            >
              <WalletIcon className="w-3.5 h-3.5 text-white" />
              <span>฿{(user?.walletBalance ?? 0).toLocaleString()}</span>
            </button>

            {/* Quick Points Pill */}
            <button
              id="home-points-pill-btn"
              onClick={() => setActiveTab('rewards')}
              className="flex items-center gap-1 bg-amber-400 text-slate-950 px-2.5 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer shadow-xs"
              title="ดูคะแนนสะสมและแลกรางวัล"
            >
              <Sparkles className="w-3 h-3 fill-slate-950" />
              <span>{user?.loyaltyPoints ?? 0} แต้ม</span>
            </button>

            {/* Notifications */}
            <button
              id="home-notifications-pill-btn"
              onClick={() => setIsNotificationsOpen(true)}
              className="relative w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-xs flex items-center justify-center transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4 text-white" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-[9px] font-black rounded-full flex items-center justify-center text-white border border-white">
                  {unreadNotificationCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Main Greeting & Heart Button (1:1 with Reference Image) */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <button 
            id="home-greeting-user-btn"
            onClick={() => setIsAuthModalOpen(true)}
            className="text-left group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight group-hover:underline">
                สวัสดี คุณ{user.name}!
              </h1>
              <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full uppercase">
                {user.tier}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-white/90 mt-0.5">
              {user.email} • วันนี้มีอะไรให้เราช่วยไหม?
            </p>
          </button>

          {/* Heart Button on Top Right (From Reference Image) */}
          <button
            id="home-favorites-btn"
            onClick={() => setIsFavoritesOpen(true)}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white text-[#00BA76] shadow-sm flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer shrink-0"
            title="ร้านโปรดของคุณ"
          >
            <Heart className="w-5 h-5 fill-[#00BA76]" />
          </button>
        </div>

        {/* Current Location Pill (1:1 with Reference Image) */}
        <button
          id="home-location-pill-btn"
          onClick={() => setIsAuthModalOpen(true)}
          className="w-full bg-black/15 hover:bg-black/25 active:scale-[0.99] backdrop-blur-xs rounded-2xl px-3.5 py-2.5 flex items-center justify-between text-left transition-all border border-white/15 mb-3.5 cursor-pointer"
        >
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-4 h-4 text-white shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-white truncate">
              {userLocation.isLiveGPS ? `📍 ${userLocation.name || 'ตำแหน่งปัจจุบัน (GPS)'}` : (userLocation.name || 'ตำแหน่งปัจจุบัน')}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-white/80 shrink-0" />
        </button>

        {/* Hero Service Card: สั่งอาหาร (1:1 with Reference Image) */}
        <div
          id="hero-service-card-food"
          onClick={() => {
            document.getElementById('search-restaurants-input')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs text-slate-800 flex items-center justify-between gap-3 cursor-pointer hover:shadow-md transition-all active:scale-[0.99] border border-slate-100/90 mb-3"
        >
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              สั่งอาหาร
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              ร้านดังลดสูงสุด 50% • ส่งฟรี 0 บาท
            </p>
            <div className="pt-1.5 flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold text-[#00BA76] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
                อาหารจานด่วน & ข้าวแกง
              </span>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80">
                ดีลเด็ด
              </span>
            </div>
          </div>
          <div className="w-24 sm:w-28 h-20 sm:h-24 shrink-0 flex items-center justify-center">
            <img
              src={foodMascotImg}
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== '/assets/images/food_mascot_1789709435278.jpg') {
                  target.src = '/assets/images/food_mascot_1789709435278.jpg';
                }
              }}
              alt="สั่งอาหาร Mascot"
              className="w-full h-full object-contain drop-shadow-xs"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* 3 Sub-Service Cards: เมสเซ็นเจอร์ | เรียกแท็กซี่ | สั่งของซูเปอร์ (1:1 with Reference Image) */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {/* 1. เมสเซ็นเจอร์ */}
          <div className="flex flex-col items-center">
            <button
              id="service-card-messenger"
              onClick={() => setIsMessengerOpen(true)}
              className="w-full aspect-square bg-white rounded-2xl sm:rounded-3xl p-2.5 shadow-xs border border-slate-100 flex items-center justify-center hover:scale-102 active:scale-95 transition-transform cursor-pointer"
              title="ส่งของด่วน เมสเซ็นเจอร์"
            >
              <img
                src={messengerImg}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== '/assets/images/messenger_scooter_1789709446992.jpg') {
                    target.src = '/assets/images/messenger_scooter_1789709446992.jpg';
                  }
                }}
                alt="เมสเซ็นเจอร์"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </button>
            <span className="text-xs font-bold text-white text-center mt-1.5 drop-shadow-xs">
              เมสเซ็นเจอร์
            </span>
          </div>

          {/* 2. เรียกแท็กซี่ */}
          <div className="flex flex-col items-center">
            <button
              id="service-card-taxi"
              onClick={() => setIsTaxiOpen(true)}
              className="w-full aspect-square bg-white rounded-2xl sm:rounded-3xl p-2.5 shadow-xs border border-slate-100 flex items-center justify-center hover:scale-102 active:scale-95 transition-transform cursor-pointer"
              title="เรียกรถแท็กซี่"
            >
              <img
                src={taxiRideImg}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== '/assets/images/taxi_ride_1789709464979.jpg') {
                    target.src = '/assets/images/taxi_ride_1789709464979.jpg';
                  }
                }}
                alt="เรียกแท็กซี่"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </button>
            <span className="text-xs font-bold text-white text-center mt-1.5 drop-shadow-xs">
              เรียกแท็กซี่
            </span>
          </div>

          {/* 3. สั่งของซูเปอร์ */}
          <div className="flex flex-col items-center">
            <button
              id="service-card-supermarket"
              onClick={() => setIsSupermarketOpen(true)}
              className="w-full aspect-square bg-white rounded-2xl sm:rounded-3xl p-2.5 shadow-xs border border-slate-100 flex items-center justify-center hover:scale-102 active:scale-95 transition-transform cursor-pointer"
              title="สั่งของซูเปอร์มาร์เก็ต"
            >
              <img
                src={martBasketImg}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== '/assets/images/mart_basket_1789709478997.jpg') {
                    target.src = '/assets/images/mart_basket_1789709478997.jpg';
                  }
                }}
                alt="สั่งของซูเปอร์"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </button>
            <span className="text-xs font-bold text-white text-center mt-1.5 drop-shadow-xs">
              สั่งของซูเปอร์
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-3 sm:p-5 space-y-4 sm:space-y-5">
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
          placeholder={t('searchPlaceholder')}
          className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Pills Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-900 px-1">
          <span>{language === 'th' ? 'หมวดหมู่อาหาร' : 'Food Categories'}</span>
          <span className="text-slate-400 text-[11px] font-normal">{language === 'th' ? 'เลื่อนดูเพิ่มเติม →' : 'Scroll for more →'}</span>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              id={`cat-btn-${cat.id}`}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3.5 py-2 rounded-2xl flex items-center gap-2 whitespace-nowrap text-xs font-semibold transition-all shrink-0 cursor-pointer ${
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

      {/* Dietary Preferences Filter Bar */}
      <DietaryFilterBar
        selectedPreference={selectedDietary}
        onSelectPreference={setSelectedDietary}
        restaurantCounts={dietaryCounts}
      />

      {/* Filter Chips Bar */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar text-xs items-center">
        <button
          id="filter-all-btn"
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-full font-medium transition-colors shrink-0 cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {t('all')}
        </button>

        {/* Optimal Sweet Spot SLA Quick Filter */}
        <button
          id="filter-sweet-spot-btn"
          onClick={() => setActiveFilter(activeFilter === 'sweet_spot' ? 'all' : 'sweet_spot')}
          className={`px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
            activeFilter === 'sweet_spot'
              ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-300'
              : 'bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100'
          }`}
        >
          <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>⚡ ส่งด่วน 20-30 น. (Sweet Spot &le; 5 กม.)</span>
        </button>

        <button
          id="filter-free-delivery-btn"
          onClick={() => setActiveFilter('free_delivery')}
          className={`px-3 py-1.5 rounded-full font-medium flex items-center gap-1 transition-colors shrink-0 cursor-pointer ${
            activeFilter === 'free_delivery'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Bike className="w-3.5 h-3.5 text-emerald-500" />
          <span>{t('freeDelivery')}</span>
        </button>

        <button
          id="filter-high-rating-btn"
          onClick={() => setActiveFilter('high_rating')}
          className={`px-3 py-1.5 rounded-full font-medium flex items-center gap-1 transition-colors shrink-0 cursor-pointer ${
            activeFilter === 'high_rating'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>{t('highRating')}</span>
        </button>

        <button
          id="filter-fast-btn"
          onClick={() => setActiveFilter('fast')}
          className={`px-3 py-1.5 rounded-full font-medium flex items-center gap-1 transition-colors shrink-0 cursor-pointer ${
            activeFilter === 'fast'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span>{t('fastDelivery')}</span>
        </button>

        <button
          id="filter-promo-btn"
          onClick={() => setActiveFilter('promo')}
          className={`px-3 py-1.5 rounded-full font-medium flex items-center gap-1 transition-colors shrink-0 cursor-pointer ${
            activeFilter === 'promo'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Percent className="w-3.5 h-3.5 text-rose-500" />
          <span>{t('specialPromo')}</span>
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
              {sortOption === 'proximity' ? t('nearbyRestaurants') : t('popularRestaurants')}
            </h3>
            {sortOption === 'proximity' && (
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" />
                {t('closestToYou')}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            {t('foundRestaurants', { count: processedRestaurants.length })}
            {sortOption === 'proximity' && ` • ${language === 'th' ? `เรียงจากใกล้สุด (${minDistance} กม.)` : `Closest first (${minDistance} km)`}`}
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
              activeDietaryPreference={selectedDietary}
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
              setSelectedDietary('all');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      )}

        {/* Professional Website & Operations Page Footer */}
        <PageFooter />
      </div>

      {/* Interactive Service Modals & Favorites (From User's Reference UX) */}
      {isFavoritesOpen && <FavoritesModal onClose={() => setIsFavoritesOpen(false)} />}
      {isMessengerOpen && <MessengerModal onClose={() => setIsMessengerOpen(false)} />}
      {isTaxiOpen && <TaxiModal onClose={() => setIsTaxiOpen(false)} />}
      {isSupermarketOpen && <SupermarketModal onClose={() => setIsSupermarketOpen(false)} />}
      {isSlaModalOpen && <DeliverySlaModal isOpen={isSlaModalOpen} onClose={() => setIsSlaModalOpen(false)} />}
    </div>
  );
};
