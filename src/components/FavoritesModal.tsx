import React from 'react';
import { useApp } from '../context/AppContext';
import { RESTAURANTS_DATA } from '../data/mockData';
import { Heart, X, Star, Clock, Bike, ArrowRight, Sparkles } from 'lucide-react';

interface FavoritesModalProps {
  onClose: () => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({ onClose }) => {
  const { setSelectedRestaurant, userLocation } = useApp();

  // Top favored restaurants (or user favorites)
  const favoriteRestaurants = RESTAURANTS_DATA.slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-6 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00BA76] to-[#009E60] p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">ร้านโปรดของฉัน</h2>
              <p className="text-xs text-white/80">ร้านอร่อยที่คุณบันทึกไว้ สั่งซ้ำได้ทันใจ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 no-scrollbar">
          {favoriteRestaurants.map(restaurant => (
            <div
              key={restaurant.id}
              onClick={() => {
                setSelectedRestaurant(restaurant);
                onClose();
              }}
              className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-emerald-50/50 hover:border-emerald-200 transition-all cursor-pointer group"
            >
              <img
                src={restaurant.bannerImage || restaurant.logoImage}
                alt={restaurant.name}
                className="w-18 h-18 rounded-xl object-cover shrink-0 shadow-2xs group-hover:scale-102 transition-transform"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="text-sm font-bold text-slate-800 truncate group-hover:text-emerald-700">
                    {restaurant.name}
                  </h3>
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-500 shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{restaurant.rating}</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{restaurant.category}</p>
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{restaurant.deliveryTimeMinutes} นาที</span>
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <Bike className="w-3 h-3" />
                    <span>{restaurant.deliveryFee === 0 ? 'ส่งฟรี' : `฿${restaurant.deliveryFee}`}</span>
                  </span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white shadow-2xs border border-slate-200/80 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 group-hover:border-emerald-300 shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">บันทึกไว้ {favoriteRestaurants.length} ร้าน</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#00BA76] hover:bg-[#009E60] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            เลือกดูร้านอาหารต่อ
          </button>
        </div>
      </div>
    </div>
  );
};
