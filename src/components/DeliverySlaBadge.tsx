import React from 'react';
import { getDeliverySlaDetails, DeliverySlaDetails } from '../utils/deliverySla';
import { Zap, Clock, ShieldAlert, Sparkles, Flame, Info } from 'lucide-react';

interface DeliverySlaBadgeProps {
  distanceKm: number;
  prepTimeMinutes?: number;
  compact?: boolean;
  showBreakdown?: boolean;
  onInfoClick?: () => void;
  className?: string;
}

export const DeliverySlaBadge: React.FC<DeliverySlaBadgeProps> = ({
  distanceKm,
  prepTimeMinutes = 15,
  compact = false,
  showBreakdown = false,
  onInfoClick,
  className = '',
}) => {
  const sla: DeliverySlaDetails = getDeliverySlaDetails(distanceKm, prepTimeMinutes);

  if (compact) {
    if (sla.isSweetSpot) {
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${sla.badgeBg} ${sla.badgeTextCol} ${sla.badgeBorder} shadow-2xs ${className}`}
          title={`${sla.tierTitleTh} (${sla.totalMinutes} นาที) - ระยะ ${distanceKm.toFixed(1)} กม.`}
        >
          <Zap className="w-3 h-3 fill-emerald-500 text-emerald-500" />
          <span>20-30 น.</span>
          <span className="opacity-70 text-[9px] font-medium hidden sm:inline">• สดใหม่</span>
        </span>
      );
    }

    if (sla.isExtended) {
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${sla.badgeBg} ${sla.badgeTextCol} ${sla.badgeBorder} shadow-2xs ${className}`}
          title={`${sla.tierTitleTh} (${sla.totalMinutes} นาที) - ระยะ ${distanceKm.toFixed(1)} กม.`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          <span>&gt;45 น. (ไกลพิเศษ)</span>
        </span>
      );
    }

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${sla.badgeBg} ${sla.badgeTextCol} ${sla.badgeBorder} shadow-2xs ${className}`}
        title={`${sla.tierTitleTh} (${sla.totalMinutes} นาที) - ระยะ ${distanceKm.toFixed(1)} กม.`}
      >
        <Clock className="w-3 h-3 text-amber-600" />
        <span>30-45 น.</span>
      </span>
    );
  }

  // Full detailed display
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${sla.badgeBg} ${sla.badgeTextCol} ${sla.badgeBorder}`}>
          {sla.isSweetSpot && <Zap className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />}
          {!sla.isSweetSpot && !sla.isExtended && <Clock className="w-3.5 h-3.5 text-amber-600" />}
          {sla.isExtended && <span className="w-2 h-2 rounded-full bg-orange-500" />}
          <span>{sla.badgeText}</span>
        </div>

        {onInfoClick && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onInfoClick();
            }}
            className="text-slate-400 hover:text-emerald-700 transition-colors p-1"
            title="ดูข้อมูลเกณฑ์ระยะทางและเวลาแนะนำ"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {showBreakdown && (
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            🍳 ปรุง ~{sla.prepMinutes} น.
          </span>
          <span className="text-slate-300">+</span>
          <span className="flex items-center gap-1">
            🛵 ขี่ส่ง ~{sla.travelMinutes} น.
          </span>
          <span className="text-slate-300">=</span>
          <span className="font-bold text-slate-700">
            รวม ~{sla.totalMinutes} น.
          </span>
        </div>
      )}
    </div>
  );
};
