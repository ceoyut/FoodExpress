import React from 'react';
import { Restaurant } from '../types';
import { useApp } from '../context/AppContext';
import { Star, Clock, Bike, Heart, MapPin } from 'lucide-react';
import { formatDistance, estimateDeliveryMinutes } from '../utils/geolocation';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
  calculatedDistanceKm?: number;
  isDistanceSorted?: boolean;
  proximityRank?: number;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ 
  restaurant, 
  onClick,
  calculatedDistanceKm,
  isDistanceSorted = false,
  proximityRank
}) => {
  const { user, toggleFavorite } = useApp();
  const isFavorite = user.favoriteRestaurantIds.includes(restaurant.id);

  // Compute display distance and dynamic delivery time
  const effectiveDistance = calculatedDistanceKm !== undefined ? calculatedDistanceKm : restaurant.distanceKm;
  const displayDistance = formatDistance(effectiveDistance);
  const displayDeliveryTime = calculatedDistanceKm !== undefined
    ? estimateDeliveryMinutes(restaurant.averagePrepTimeMinutes || 15, effectiveDistance)
    : restaurant.deliveryTimeMinutes;

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

        {/* Promo Badge (shifted if proximity rank is displayed) */}
        {restaurant.promoBadge && (
          <div className={`absolute text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ${
            isDistanceSorted && proximityRank !== undefined 
              ? 'top-8 left-2.5 bg-rose-500/95' 
              : 'top-2.5 left-2.5 bg-rose-500'
          }`}>
            {restaurant.promoBadge}
          </div>
        )}

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
          isDistanceSorted ? 'bg-emerald-950/80 border border-emerald-500/30' : 'bg-black/60'
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

          <p className="text-[11px] text-slate-500 mb-2 line-clamp-1">
            {restaurant.category} • {restaurant.nameEn}
          </p>
        </div>

        {/* Bottom meta stats */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-slate-800">{restaurant.rating.toFixed(1)}</span>
            <span className="text-[11px] text-slate-400">({restaurant.reviewCount.toLocaleString()})</span>
          </div>

          <div className="flex items-center gap-1 text-slate-600 font-medium text-[11px]">
            <Bike className="w-3.5 h-3.5 text-emerald-600" />
            {restaurant.deliveryFee === 0 ? (
              <span className="text-emerald-600 font-bold">ส่งฟรี</span>
            ) : (
              <span>฿{restaurant.deliveryFee}</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

