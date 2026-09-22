import React, { useState } from 'react';
import { Restaurant, MenuItem } from '../types';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  Bike, 
  MapPin, 
  Heart, 
  Plus, 
  Minus, 
  Flame, 
  MessageSquare, 
  Info, 
  CheckCircle2, 
  Sparkles,
  Zap,
  ShieldCheck,
  ThermometerSnowflake
} from 'lucide-react';
import { getRestaurantDistance, formatDistance, estimateDeliveryMinutes } from '../utils/geolocation';
import { getDietaryConfig } from '../data/dietaryPreferences';
import { getDeliverySlaDetails } from '../utils/deliverySla';
import { calculateStandardDeliveryFee } from '../utils/riderFareCalculator';
import { DeliverySlaModal } from './DeliverySlaModal';

interface RestaurantDetailModalProps {
  restaurant: Restaurant;
  onClose: () => void;
}

export const RestaurantDetailModal: React.FC<RestaurantDetailModalProps> = ({ restaurant, onClose }) => {
  const { user, userLocation, toggleFavorite, addToCart, reviews, setIsReviewModalOpen, setReviewingOrder } = useApp();
  const [activeTab, setActiveTab] = useState<'menu' | 'reviews' | 'info'>('menu');
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [isSlaModalOpen, setIsSlaModalOpen] = useState(false);

  const effectiveDistance = getRestaurantDistance(restaurant, userLocation);
  const displayDistance = formatDistance(effectiveDistance);
  const effectiveDeliveryFee = calculateStandardDeliveryFee(effectiveDistance);
  const sla = getDeliverySlaDetails(effectiveDistance, restaurant.averagePrepTimeMinutes || 15);
  const displayDeliveryTime = sla.totalMinutes;

  // Customization state for selected menu item
  const [quantity, setQuantity] = useState(1);
  const [selectedSpicy, setSelectedSpicy] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<{ [group: string]: string }>({});
  const [specialNotes, setSpecialNotes] = useState('');

  const isFavorite = user.favoriteRestaurantIds.includes(restaurant.id);
  const restaurantReviews = reviews.filter(r => r.restaurantId === restaurant.id);

  // When opening item customization
  const openCustomization = (item: MenuItem) => {
    setSelectedMenuItem(item);
    setQuantity(1);
    setSelectedSpicy(item.spicyLevels ? item.spicyLevels[1] || item.spicyLevels[0] : '');
    setSpecialNotes('');
    
    // Default select first required option in each group
    const initialOpts: { [group: string]: string } = {};
    if (item.options) {
      for (const group of item.options) {
        if (group.required && group.choices.length > 0) {
          initialOpts[group.name] = group.choices[0].name;
        }
      }
    }
    setSelectedOptions(initialOpts);
  };

  const handleAddToCart = () => {
    if (!selectedMenuItem) return;
    addToCart(selectedMenuItem, restaurant, quantity, selectedOptions, selectedSpicy, specialNotes);
    setSelectedMenuItem(null);
  };

  // Calculate current customized unit price
  let currentUnitPrice = selectedMenuItem ? selectedMenuItem.price : 0;
  if (selectedMenuItem?.options) {
    for (const group of selectedMenuItem.options) {
      const choiceName = selectedOptions[group.name];
      const choice = group.choices.find(c => c.name === choiceName);
      if (choice) {
        currentUnitPrice += choice.price;
      }
    }
  }

  // Filter distinct categories in this restaurant
  const menuItems = Array.isArray(restaurant?.menu) ? restaurant.menu : [];
  const categories = Array.from(new Set(menuItems.map(m => m.category)));

  return (
    <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white sm:rounded-3xl shadow-2xl min-h-screen sm:min-h-0 sm:max-h-[90vh] overflow-y-auto flex flex-col relative text-slate-800">
        
        {/* Banner with controls */}
        <div className="relative h-52 sm:h-60 w-full bg-slate-200 shrink-0">
          <img
            src={restaurant.bannerImage}
            alt={restaurant.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

          {/* Top navigation actions */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <button
              id="restaurant-back-btn"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/90 text-slate-800 flex items-center justify-center shadow-md hover:bg-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <button
              id="restaurant-fav-modal-btn"
              onClick={() => toggleFavorite(restaurant.id)}
              className="w-9 h-9 rounded-full bg-white/90 text-slate-800 flex items-center justify-center shadow-md hover:bg-white transition-colors"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>

          {/* Restaurant Header Info Overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 font-bold text-[11px]">
                {restaurant.category}
              </span>
              {restaurant.promoBadge && (
                <span className="px-2 py-0.5 rounded-md bg-rose-500 text-white font-bold text-[11px]">
                  {restaurant.promoBadge}
                </span>
              )}
              {restaurant.dietaryPreferences?.map(prefId => {
                const conf = getDietaryConfig(prefId);
                if (!conf) return null;
                return (
                  <span 
                    key={prefId} 
                    className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white border border-white/20 font-bold text-[11px] flex items-center gap-1 shadow-xs"
                  >
                    <span>{conf.emoji}</span>
                    <span>{conf.shortLabel}</span>
                  </span>
                );
              })}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white drop-shadow-md">
              {restaurant.name}
            </h1>
            <p className="text-xs text-slate-200">{restaurant.nameEn}</p>
          </div>
        </div>

        {/* Quick Restaurant Specs Bar */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold">{restaurant.rating.toFixed(1)}</span>
            <span className="text-slate-400">({restaurant.reviewCount} รีวิว)</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>{displayDeliveryTime} นาที</span>
            <span className="text-slate-300">•</span>
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-700 font-semibold">{displayDistance}</span>
          </div>

          <div className="flex items-center gap-1.5 font-medium">
            <Bike className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-800 font-bold">ค่าส่ง ฿{effectiveDeliveryFee}</span>
            <span className="text-[10px] text-slate-500 font-normal">(มาตรฐานไรเดอร์)</span>
          </div>
        </div>

        {/* Delivery Distance & Freshness SLA Engine Card */}
        <div className={`mx-4 sm:mx-5 my-3 p-3.5 rounded-2xl border ${sla.badgeBorder} ${sla.badgeBg} space-y-2`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wide flex items-center gap-1 bg-white border ${sla.badgeBorder} ${sla.badgeTextCol}`}>
                {sla.isSweetSpot && <Zap className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />}
                {!sla.isSweetSpot && !sla.isExtended && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                {sla.isExtended && <ThermometerSnowflake className="w-3.5 h-3.5 text-orange-600" />}
                <span>{sla.tierTitleTh}</span>
              </span>
              <span className="font-extrabold text-slate-800 text-xs">
                {displayDistance} • {sla.totalMinutes} นาที
              </span>
            </div>

            <button
              id="restaurant-open-sla-modal-btn"
              onClick={() => setIsSlaModalOpen(true)}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Info className="w-3.5 h-3.5" />
              <span>เกณฑ์จัดส่ง</span>
            </button>
          </div>

          {/* Time & Prep breakdown timeline bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1 border-t border-black/5">
            <div className="flex items-center gap-2 bg-white/70 p-2 rounded-xl border border-slate-100">
              <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
                🍳
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-medium">เวลาเตรียมอาหาร</div>
                <div className="font-bold text-slate-800">~{sla.prepMinutes} นาที</div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/70 p-2 rounded-xl border border-slate-100">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                🛵
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-medium">ไรเดอร์เดินทาง</div>
                <div className="font-bold text-slate-800">~{sla.travelMinutes} นาที ({displayDistance})</div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/70 p-2 rounded-xl border border-slate-100">
              <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
                ✨
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-medium">การันตีคุณภาพ</div>
                <div className="font-bold text-slate-800 truncate">{sla.freshnessLabelTh}</div>
              </div>
            </div>
          </div>

          {/* Smart Pre-dispatch notification */}
          <div className="flex items-center gap-1.5 text-[10.5px] text-slate-600 bg-white/90 px-2.5 py-1.5 rounded-xl border border-slate-200/60">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{sla.riderDispatchRecommendationTh}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-5 bg-white sticky top-0 z-20">
          <button
            id="tab-menu-btn"
            onClick={() => setActiveTab('menu')}
            className={`py-3 px-4 font-semibold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'menu'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <span>รายการอาหาร</span>
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
              {menuItems.length}
            </span>
          </button>

          <button
            id="tab-reviews-btn"
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-4 font-semibold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>รีวิวจากลูกค้า</span>
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
              {restaurantReviews.length}
            </span>
          </button>

          <button
            id="tab-info-btn"
            onClick={() => setActiveTab('info')}
            className={`py-3 px-4 font-semibold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'info'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>ข้อมูลร้าน</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 flex-1 bg-slate-50/50">
          {activeTab === 'menu' && (
            <div className="space-y-6">
              {categories.map(category => (
                <div key={category} className="space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <span>{category}</span>
                    <span className="h-1 flex-1 bg-slate-200/80 rounded-full" />
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {menuItems
                      .filter(m => m.category === category)
                      .map(item => (
                        <div
                          key={item.id}
                          id={`menu-item-${item.id}`}
                          onClick={() => openCustomization(item)}
                          className="bg-white p-3 rounded-2xl border border-slate-150 shadow-xs hover:shadow-md transition-all flex gap-3 cursor-pointer group"
                        >
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                {item.isPopular && (
                                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                    <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                                    ยอดนิยม
                                  </span>
                                )}
                                {item.isSpicy && (
                                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                    <Flame className="w-2.5 h-2.5 text-rose-500" />
                                    เผ็ด
                                  </span>
                                )}
                                {item.dietary?.map(dietId => {
                                  const c = getDietaryConfig(dietId);
                                  if (!c) return null;
                                  return (
                                    <span 
                                      key={dietId}
                                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border flex items-center gap-1 ${c.theme.badgeBg} ${c.theme.badgeText} ${c.theme.badgeBorder}`}
                                    >
                                      <span>{c.emoji}</span>
                                      <span>{c.shortLabel}</span>
                                    </span>
                                  );
                                })}
                              </div>

                              <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-emerald-700 transition-colors line-clamp-1">
                                {item.name}
                              </h4>
                              <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                                {item.description}
                              </p>
                            </div>

                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                              <div className="flex items-baseline gap-1.5">
                                <span className="font-extrabold text-sm text-slate-900">
                                  ฿{item.price}
                                </span>
                                {item.originalPrice && (
                                  <span className="text-[11px] text-slate-400 line-through">
                                    ฿{item.originalPrice}
                                  </span>
                                )}
                              </div>

                              <button
                                id={`add-btn-${item.id}`}
                                className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Image thumbnail */}
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              referrerPolicy="no-referrer"
                              loading="lazy"
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Customer Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {/* Rating Summary Header */}
              <div className="bg-white p-4 rounded-2xl border border-slate-150 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col items-center justify-center text-amber-700">
                    <span className="text-2xl font-black leading-none">{restaurant.rating.toFixed(1)}</span>
                    <div className="flex mt-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">คะแนนความพึงพอใจโดยรวม</h4>
                    <p className="text-xs text-slate-500">จากผู้ใช้งานจริง {(restaurant?.reviewCount ?? 0).toLocaleString()} ท่าน</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                        ✓ รสชาติดี 98%
                      </span>
                      <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                        ✓ ส่งไว 95%
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  id="write-review-btn"
                  onClick={() => {
                    setReviewingOrder(null);
                    setIsReviewModalOpen(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                >
                  + เขียนรีวิวร้านนี้
                </button>
              </div>

              {/* Reviews List */}
              <div className="space-y-3">
                {restaurantReviews.map(review => (
                  <div key={review.id} className="bg-white p-4 rounded-2xl border border-slate-150 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={review.userAvatar}
                          alt={review.userName}
                          className="w-8 h-8 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900">{review.userName}</span>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          </div>
                          <span className="text-[10px] text-slate-400">{review.date}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">{review.comment}</p>

                    {review.tags && review.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {review.tags.map((tag, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Tab */}
          {activeTab === 'info' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-150 space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">ที่อยู่ร้านค้า</h4>
                  <p className="text-slate-600 mt-0.5">{restaurant.address}</p>
                  <p className="text-emerald-700 font-semibold text-[11px] mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    <span>ระยะห่างจากตำแหน่งคุณ ({userLocation.name || 'พิกัดปัจจุบัน'}): {displayDistance}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-slate-100">
                <Clock className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">เวลาเปิด - ปิดทำการ</h4>
                  <p className="text-emerald-700 font-semibold mt-0.5">เปิดให้บริการทุกวัน 09:30 - 21:30 น.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-slate-100">
                <Bike className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">เงื่อนไขการจัดส่งและชำระเงิน</h4>
                  <p className="text-slate-600 mt-0.5">
                    ค่าส่งตามมาตรฐานระยะทางไรเดอร์ (฿{effectiveDeliveryFee} สำหรับระยะ {displayDistance}) • สั่งขั้นต่ำ ฿{restaurant.minOrder} • รองรับชำระผ่านบัตรเครดิต, FoodExpress Wallet, และ QR PromptPay
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customization Modal */}
      {selectedMenuItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-5">
            
            {/* Modal Header with food image */}
            <div className="relative h-40 bg-slate-100 shrink-0">
              <img
                src={selectedMenuItem.image}
                alt={selectedMenuItem.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <button
                id="close-customization-btn"
                onClick={() => setSelectedMenuItem(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                ✕
              </button>
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <h3 className="font-bold text-base line-clamp-1">{selectedMenuItem.name}</h3>
                <p className="text-xs text-slate-200">฿{selectedMenuItem.price}</p>
              </div>
            </div>

            {/* Options List */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Spiciness Level if available */}
              {selectedMenuItem.spicyLevels && selectedMenuItem.spicyLevels.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm flex items-center gap-1">
                      <Flame className="w-4 h-4 text-rose-500" />
                      ระดับความเผ็ด
                    </span>
                    <span className="text-[10px] bg-rose-50 text-rose-600 font-semibold px-2 py-0.5 rounded-full">
                      เลือก 1 อย่าง
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {selectedMenuItem.spicyLevels.map(level => (
                      <label
                        key={level}
                        className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-colors ${
                          selectedSpicy === level
                            ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 font-semibold'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xs">{level}</span>
                        <input
                          type="radio"
                          name="spicy"
                          checked={selectedSpicy === level}
                          onChange={() => setSelectedSpicy(level)}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Option Groups */}
              {selectedMenuItem.options?.map(group => (
                <div key={group.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{group.name}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                      {group.required ? 'จำเป็นต้องเลือก' : 'เลือกหรือไม่ก็ได้'}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {group.choices.map(choice => (
                      <label
                        key={choice.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-colors ${
                          selectedOptions[group.name] === choice.name
                            ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 font-semibold'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xs">{choice.name}</span>
                        <div className="flex items-center gap-2">
                          {choice.price > 0 && (
                            <span className="text-xs font-bold text-emerald-600">
                              +฿{choice.price}
                            </span>
                          )}
                          <input
                            type="radio"
                            name={group.id}
                            checked={selectedOptions[group.name] === choice.name}
                            onChange={() =>
                              setSelectedOptions(prev => ({ ...prev, [group.name]: choice.name }))
                            }
                            className="text-emerald-600 focus:ring-emerald-500"
                          />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {/* Special Notes */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-900 text-xs block">
                  รายละเอียดเพิ่มเติมถึงร้านค้า (ถ้ามี)
                </label>
                <input
                  type="text"
                  placeholder="เช่น ไม่ใส่ผักชี, ขอพริกน้ำปลาเพิ่ม, แยกน้ำซุป"
                  value={specialNotes}
                  onChange={e => setSpecialNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Bottom Actions: Quantity & Add to Cart */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1 shadow-xs">
                <button
                  id="custom-qty-minus"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-bold text-slate-900 text-sm">{quantity}</span>
                <button
                  id="custom-qty-plus"
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-8 h-8 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                id="confirm-add-to-cart-btn"
                onClick={handleAddToCart}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm flex items-center justify-between shadow-md shadow-emerald-600/20 active:scale-[0.99] transition-all"
              >
                <span>เพิ่มลงตะกร้า</span>
                <span>฿{(currentUnitPrice * quantity).toLocaleString()}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery SLA Modal */}
      <DeliverySlaModal
        isOpen={isSlaModalOpen}
        onClose={() => setIsSlaModalOpen(false)}
      />
    </div>
  );
};
