import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RestaurantSortOption, UserGeoLocation } from '../types';
import { 
  BANGKOK_BENCHMARK_LOCATIONS, 
  BenchmarkLocation,
  formatDistance 
} from '../utils/geolocation';
import { 
  MapPin, 
  Navigation, 
  RefreshCw, 
  ChevronDown, 
  Check, 
  SlidersHorizontal, 
  ArrowUpDown, 
  AlertCircle,
  LocateFixed,
  Sparkles,
  Info
} from 'lucide-react';

interface LocationSortControlProps {
  currentSort: RestaurantSortOption;
  onSortChange: (sort: RestaurantSortOption) => void;
  maxDistanceFilter: number | null; // in km, null means all
  onDistanceFilterChange: (distance: number | null) => void;
  filteredCount: number;
  minDistance: number;
  maxDistance: number;
}

export const LocationSortControl: React.FC<LocationSortControlProps> = ({
  currentSort,
  onSortChange,
  maxDistanceFilter,
  onDistanceFilterChange,
  filteredCount,
  minDistance,
  maxDistance
}) => {
  const { 
    userLocation, 
    setUserLocation, 
    geoStatus, 
    geoErrorMessage, 
    refreshDeviceGeolocation 
  } = useApp();

  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showRadiusFilter, setShowRadiusFilter] = useState(false);

  const handleSelectBenchmark = (bench: BenchmarkLocation) => {
    const updated: UserGeoLocation = {
      lat: bench.lat,
      lng: bench.lng,
      accuracy: 10,
      name: `${bench.name} (${bench.district})`,
      isLiveGPS: false,
      timestamp: Date.now()
    };
    setUserLocation(updated);
    try {
      localStorage.setItem('foodexpress_user_location', JSON.stringify(updated));
    } catch {
      // safe ignore
    }
    setShowLocationPicker(false);
  };

  const handleFetchLiveGPS = async () => {
    await refreshDeviceGeolocation();
    setShowLocationPicker(false);
  };

  const distancePresets: { label: string; value: number | null }[] = [
    { label: 'ทุกระยะ', value: null },
    { label: '< 1.5 กม.', value: 1.5 },
    { label: '< 2.5 กม.', value: 2.5 },
    { label: '< 3.5 กม.', value: 3.5 },
    { label: '< 5.0 กม.', value: 5.0 },
  ];

  return (
    <div id="location-proximity-control-panel" className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs mb-4">
      {/* Top row: Current Geolocation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-150">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
            userLocation.isLiveGPS 
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
          }`}>
            {userLocation.isLiveGPS ? (
              <Navigation className="w-5 h-5 animate-pulse text-emerald-600" />
            ) : (
              <MapPin className="w-5 h-5 text-emerald-600" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                ตำแหน่งจัดส่ง & คำนวณระยะทาง
              </span>
              {userLocation.isLiveGPS && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  GPS สด (±{userLocation.accuracy || 15}ม.)
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1 text-sm font-extrabold text-slate-800">
              <span className="truncate max-w-[220px] sm:max-w-[320px]">
                {userLocation.name || 'พิกัดปัจจุบัน'}
              </span>
              <span className="text-slate-400 text-xs font-medium">
                ({userLocation.lat.toFixed(4)}°, {userLocation.lng.toFixed(4)}°)
              </span>
            </div>
          </div>
        </div>

        {/* Location Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Refresh GPS Button */}
          <button
            id="refresh-gps-location-btn"
            onClick={handleFetchLiveGPS}
            disabled={geoStatus === 'locating'}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors shadow-xs active:scale-95 disabled:opacity-50"
            title="ค้นหาพิกัด GPS อุปกรณ์จริง"
          >
            <LocateFixed className={`w-3.5 h-3.5 ${geoStatus === 'locating' ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{geoStatus === 'locating' ? 'กำลังดึง GPS...' : 'พิกัด GPS สด'}</span>
          </button>

          {/* Change Location Picker Toggle */}
          <button
            id="open-location-benchmark-picker-btn"
            onClick={() => setShowLocationPicker(!showLocationPicker)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-xs"
          >
            <span>เปลี่ยนพิกัด</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${showLocationPicker ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Geolocation Error Alert if any */}
      {geoStatus === 'error' && geoErrorMessage && (
        <div className="mt-2.5 p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">หมายเหตุระบบพิกัด: </span>
            <span>{geoErrorMessage}</span>
            <span className="block text-[11px] text-amber-700 mt-0.5">
              (ระบบใช้พิกัดทดสอบในกรุงเทพฯ เพื่อคำนวณระยะทางให้คุณเรียบร้อย สามารถเลือกจุดพิกัดอื่นด้านล่างได้)
            </span>
          </div>
        </div>
      )}

      {/* Location Picker Dropdown Card */}
      {showLocationPicker && (
        <div className="mt-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              เลือกจุดทดสอบพิกัดในกรุงเทพฯ (จำลองตำแหน่งของคุณ):
            </span>
            <span className="text-[11px] text-slate-400">คลิกเพื่อดูการเรียงลำดับร้านค้าใหม่</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {BANGKOK_BENCHMARK_LOCATIONS.map(bench => {
              const isSelected = !userLocation.isLiveGPS && Math.abs(userLocation.lat - bench.lat) < 0.001;
              return (
                <button
                  key={bench.id}
                  id={`benchmark-loc-${bench.id}`}
                  onClick={() => handleSelectBenchmark(bench)}
                  className={`p-2.5 text-left rounded-xl border transition-all flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white hover:bg-emerald-50/60 text-slate-800 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">
                      {bench.name}
                    </div>
                    <div className={`text-[11px] truncate ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                      {bench.description}
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              ร้านอาหารในระบบอยู่ในโซน สุขุมวิท 23, 31, 49, ทองหล่อ 10, และเอกมัย 12
            </span>
            <button
              onClick={handleFetchLiveGPS}
              className="text-emerald-600 font-bold hover:underline"
            >
              ใช้ GPS จริงจากเครื่อง
            </button>
          </div>
        </div>
      )}

      {/* Sorting Tabs Bar */}
      <div className="mt-3 pt-1 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1 shrink-0 text-xs text-slate-400 font-medium mr-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span>เรียงตาม:</span>
          </div>

          {/* Location-based Proximity Sort Button (Featured) */}
          <button
            id="sort-by-proximity-btn"
            onClick={() => onSortChange('proximity')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0 ${
              currentSort === 'proximity'
                ? 'bg-emerald-600 text-white shadow-emerald-500/20 ring-2 ring-emerald-500/30'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <MapPin className={`w-3.5 h-3.5 ${currentSort === 'proximity' ? 'text-white' : 'text-emerald-600'}`} />
            <span>ใกล้ที่สุดก่อน (GPS)</span>
            {currentSort === 'proximity' && (
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            )}
          </button>

          {/* Rating */}
          <button
            id="sort-by-rating-btn"
            onClick={() => onSortChange('rating')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              currentSort === 'rating'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>⭐ คะแนนสูงสุด</span>
          </button>

          {/* Delivery Speed */}
          <button
            id="sort-by-delivery-time-btn"
            onClick={() => onSortChange('delivery_time')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              currentSort === 'delivery_time'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>⚡ ส่งไวสุด</span>
          </button>

          {/* Popularity */}
          <button
            id="sort-by-popular-btn"
            onClick={() => onSortChange('popular')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              currentSort === 'popular'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>🔥 ยอดนิยม</span>
          </button>

          {/* Delivery Fee */}
          <button
            id="sort-by-fee-btn"
            onClick={() => onSortChange('delivery_fee')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              currentSort === 'delivery_fee'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>🛵 ค่าส่งถูกสุด</span>
          </button>
        </div>

        {/* Filter by distance toggle */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <button
            id="toggle-radius-filter-btn"
            onClick={() => setShowRadiusFilter(!showRadiusFilter)}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-xl border transition-colors ${
              maxDistanceFilter !== null
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>รัศมี: {maxDistanceFilter ? `< ${maxDistanceFilter} กม.` : 'ทุกระยะ'}</span>
          </button>
        </div>
      </div>

      {/* Radius distance filter chips (collapsible) */}
      {showRadiusFilter && (
        <div className="mt-3 pt-2 border-t border-slate-150 flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs text-slate-500 font-medium shrink-0 mr-1">จำกัดระยะ:</span>
          {distancePresets.map(preset => (
            <button
              key={preset.label}
              onClick={() => onDistanceFilterChange(preset.value)}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 ${
                maxDistanceFilter === preset.value
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Proximity Feedback Banner */}
      <div className="mt-3 pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-1.5">
        <div className="flex items-center gap-1.5">
          {currentSort === 'proximity' ? (
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              เรียงลำดับตามระยะทางจากจุดที่คุณอยู่ (ใกล้สุด {formatDistance(minDistance)} ถึง {formatDistance(maxDistance)})
            </span>
          ) : (
            <span>
              แสดง {filteredCount} ร้านค้า (ระยะห่าง {formatDistance(minDistance)} - {formatDistance(maxDistance)})
            </span>
          )}
        </div>

        {maxDistanceFilter !== null && (
          <button
            onClick={() => onDistanceFilterChange(null)}
            className="text-xs text-rose-600 font-medium hover:underline self-start sm:self-auto"
          >
            ล้างตัวกรองระยะทาง
          </button>
        )}
      </div>
    </div>
  );
};
