import React from 'react';
import { Restaurant, DietaryPreference } from '../types';
import { useApp } from '../context/AppContext';
import { Star, Clock, Bike, Heart, MapPin, Zap } from 'lucide-react';
import { formatDistance, estimateDeliveryMinutes } from '../utils/geolocation';
import { getDietaryConfig } from '../data/dietaryPreferences';
import { getDeliverySlaDetails } from '../utils/deliverySla';
import { calculateStandardDeliveryFee } from '../utils/riderFareCalculator';
import { DeliverySlaBadge } from './DeliverySlaBadge';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
  calculatedDistanceKm?: number;
  isDistanceSorted?: boolean;
  proximityRank?: number;
  activeDietaryPreference?: DietaryPreference | 'all';
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ 
  restaurant, 
  onClick,
  calculatedDistanceKm,
  isDistanceSorted = false,
  proximityRank,
  activeDietaryPreference = 'all',
}) => {
  const { user, toggleFavorite } = useApp();
  const isFavorite = user.favoriteRestaurantIds.includes(restaurant.id);

  // Compute display distance and dynamic delivery time & SLA details
  const effectiveDistance = calculatedDistanceKm !== undefined ? calculatedDistanceKm : restaurant.distanceKm;
  const displayDistance = formatDistance(effectiveDistance);
  const effectiveDeliveryFee = calculateStandardDeliveryFee(effectiveDistance);
  const slaDetails = getDeliverySlaDetails(effectiveDistance, restaurant.averagePrepTimeMinutes || 15);
  const displayDeliveryTime = slaDetails.totalMinutes;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(restaurant.id);
  };

  return (
    <article
      id={`restaurant-card-${restaurant.id}`}
      onClick={onClick}
      className={`group bg-white rounded-2xl border shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer flex flex-col ${
        isDistanceSorted && proximityRank === 1 
          ? 'border-emerald-400 ring-2 ring-emerald-500/20' 
          : 'border-slate-150'
      }`}
    >
      {/* Banner Image Container */}
      <div className="relative w-full aspect-16/9 bg-slate-100 overflow-hidden">
        <img
          src={restaurant.bannerImage}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Proximity Rank Badge when sorted by distance */}
        {isDistanceSorted && proximityRank !== undefined && (
          <div className={`absolute top-2.5 left-2.5 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 backdrop-blur-xs ${
            proximityRank === 1 
              ? 'bg-emerald-600 ring-1 ring-white/50 animate-pulse' 
              : proximityRank <= 3 
              ? 'bg-emerald-700/90' 
              : 'bg-slate-800/80'
          }`}>
            <MapPin className="w-3 h-3 text-emerald-300" />
            <span>#{proximityRank} ใกล้คุณ ({displayDistance})</span>
          </div>
        )}

        {/* Delivery SLA Badge on Image (or Promo) */}
        <div className={`absolute flex flex-col gap-1 items-start ${
          isDistanceSorted && proximityRank !== undefined ? 'top-8 left-2.5' : 'top-2.5 left-2.5'
        }`}>
          {slaDetails.isSweetSpot ? (
            <span className="text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md bg-emerald-600/95 backdrop-blur-xs flex items-center gap-1 border border-emerald-400/40">
              <Zap className="w-3 h-3 fill-amber-300 text-amber-300" />
              <span>ส่งด่วน 20-30 น. (Sweet Spot)</span>
            </span>
          ) : slaDetails.isExtended ? (
            <span className="text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md bg-orange-600/95 backdrop-blur-xs flex items-center gap-1 border border-orange-400/40">
              <span>🛡️ &gt;45 น. (กระเป๋าคุมอุณหภูมิ)</span>
            </span>
          ) : (
            <span className="text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md bg-slate-900/80 backdrop-blur-xs flex items-center gap-1 border border-white/20">
              <span>⏱️ 30-45 น. (ระยะมาตรฐาน)</span>
            </span>
          )}

          {restaurant.promoBadge && (
            <div className="text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm bg-rose-500">
              {restaurant.promoBadge}
            </div>
          )}
        </div>

        {/* Favorite Button */}
        <button
          id={`restaurant-fav-btn-${restaurant.id}`}
          onClick={handleFavoriteClick}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-slate-700 hover:text-rose-500 flex items-center justify-center transition-colors shadow-xs"
          title={isFavorite ? 'นำออกจากรายการโปรด' : 'บันทึกเป็นร้านโปรด'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Delivery Time & Distance Chip */}
        <div className={`absolute bottom-2 left-2 flex items-center gap-1.5 text-white text-[11px] font-medium backdrop-blur-xs px-2 py-0.5 rounded-md ${
          slaDetails.isSweetSpot 
            ? 'bg-emerald-950/85 border border-emerald-500/40' 
            : slaDetails.isExtended
            ? 'bg-orange-950/85 border border-orange-500/40'
            : 'bg-black/60'
        }`}>
          <Clock className="w-3 h-3 text-emerald-400" />
          <span>{displayDeliveryTime} นาที</span>
          <span className="text-slate-400">•</span>
          <MapPin className="w-3 h-3 text-emerald-400" />
          <span className="font-semibold text-emerald-300">{displayDistance}</span>
        </div>
      </div>

      {/* Details Container */}
      <div className="p-3 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-start justify-between gap-1 mb-1">
            <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1 group-hover:text-emerald-700 transition-colors">
              {restaurant.name}
            </h3>
          </div>

          <p className="text-[11px] text-slate-500 mb-1.5 line-clamp-1">
            {restaurant.category} • {restaurant.nameEn}
          </p>

          {/* Dietary Preference Tags */}
          {restaurant.dietaryPreferences && restaurant.dietaryPreferences.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {restaurant.dietaryPreferences.map(prefId => {
                const config = getDietaryConfig(prefId);
                if (!config) return null;
                const isHighlighted = activeDietaryPreference === prefId;
                return (
                  <span
                    key={prefId}
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md border transition-all ${
                      isHighlighted
                        ? `${config.theme.activeBg} ${config.theme.activeText} ${config.theme.activeBorder} shadow-xs scale-105`
                        : `${config.theme.badgeBg} ${config.theme.badgeText} ${config.theme.badgeBorder}`
                    }`}
                  >
                    <span>{config.emoji}</span>
                    <span>{config.shortLabel}</span>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom meta stats */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-slate-800">{restaurant.rating.toFixed(1)}</span>
            <span className="text-[11px] text-slate-400">({restaurant.reviewCount.toLocaleString()})</span>
          </div>

          <div 
            className="flex items-center gap-1 text-slate-700 font-semibold text-[11px]"
            title={`ค่าส่ง ฿${effectiveDeliveryFee} ตามมาตรฐานระยะทางไรเดอร์ (${displayDistance})`}
          >
            <Bike className="w-3.5 h-3.5 text-emerald-600" />
            <span>฿{effectiveDeliveryFee}</span>
          </div>
        </div>
      </div>
    </article>
  );
};

