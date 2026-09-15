import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DietaryPreference } from '../types';
import { DIETARY_PREFERENCES, getDietaryConfig } from '../data/dietaryPreferences';
import { Sparkles, Info, X, Check, ShieldCheck } from 'lucide-react';

interface DietaryFilterBarProps {
  selectedPreference: DietaryPreference | 'all';
  onSelectPreference: (pref: DietaryPreference | 'all') => void;
  restaurantCounts: Record<DietaryPreference | 'all', number>;
}

export const DietaryFilterBar: React.FC<DietaryFilterBarProps> = ({
  selectedPreference,
  onSelectPreference,
  restaurantCounts,
}) => {
  const { language, t } = useApp();
  const [showInfoModal, setShowInfoModal] = useState(false);

  const activeConfig = selectedPreference !== 'all' ? getDietaryConfig(selectedPreference) : null;

  return (
    <section 
      id="dietary-preferences-section" 
      aria-label="Dietary preferences and nutrition filters"
      className="space-y-2.5"
    >
      {/* Header with Title and Standards Info Button */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-black text-slate-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>{t('dietaryTitle')}</span>
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
            Dietary
          </span>
        </div>

        <button
          id="dietary-info-toggle-btn"
          type="button"
          onClick={() => setShowInfoModal(true)}
          className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 py-0.5 px-2 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
          title={language === 'th' ? 'ดูมาตรฐานและความปลอดภัยของอาหารเฉพาะกลุ่ม' : 'View dietary safety standards'}
        >
          <Info className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t('dietaryStandards')}</span>
        </button>
      </div>

      {/* Filter Chips Slider / Pill Group */}
      <div 
        id="dietary-filter-chips-list" 
        className="flex gap-2 overflow-x-auto no-scrollbar py-0.5"
      >
        {/* 'All' Option */}
        <button
          id="dietary-filter-chip-all"
          type="button"
          onClick={() => onSelectPreference('all')}
          className={`px-3.5 py-2 rounded-2xl flex items-center gap-2 whitespace-nowrap text-xs font-bold transition-all shrink-0 cursor-pointer shadow-2xs ${
            selectedPreference === 'all'
              ? 'bg-slate-900 text-white ring-2 ring-slate-900/20'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
          }`}
        >
          <span className="text-sm">🍽️</span>
          <span>{t('all')}</span>
          <span 
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
              selectedPreference === 'all'
                ? 'bg-slate-800 text-slate-200'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {restaurantCounts.all}
          </span>
        </button>

        {/* Dietary Preference Specific Chips */}
        {DIETARY_PREFERENCES.map((pref) => {
          const isSelected = selectedPreference === pref.id;
          const count = restaurantCounts[pref.id] || 0;
          const displayLabel = language === 'en' ? pref.labelEn : pref.label;

          return (
            <button
              key={pref.id}
              id={`dietary-filter-chip-${pref.id}`}
              type="button"
              onClick={() => onSelectPreference(isSelected ? 'all' : pref.id)}
              className={`px-3.5 py-2 rounded-2xl flex items-center gap-2 whitespace-nowrap text-xs font-bold transition-all shrink-0 cursor-pointer shadow-2xs ${
                isSelected
                  ? `${pref.theme.activeBg} ${pref.theme.activeText} ring-2 ${pref.theme.activeBorder}/40 shadow-sm`
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <span className="text-base leading-none">{pref.emoji}</span>
              <span>{displayLabel}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Dietary Filter Banner / Guarantee Bar */}
      {activeConfig && (
        <div 
          id={`dietary-active-banner-${activeConfig.id}`}
          className={`p-3 rounded-2xl border flex items-start justify-between gap-2.5 transition-all animate-fadeIn ${activeConfig.theme.badgeBg} ${activeConfig.theme.badgeBorder}`}
        >
          <div className="flex items-start gap-2.5 min-w-0">
            <span className="text-xl leading-none mt-0.5 shrink-0">{activeConfig.emoji}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-xs font-extrabold ${activeConfig.theme.badgeText}`}>
                  {language === 'th' ? `ตัวกรอง: ${activeConfig.label} (${activeConfig.labelEn})` : `Filter: ${activeConfig.labelEn} (${activeConfig.label})`}
                </span>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-white/80 text-slate-700 border border-slate-200/80">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  {t('dietaryStandards')}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                {activeConfig.guaranteeText}
              </p>
            </div>
          </div>

          <button
            id="dietary-clear-filter-btn"
            type="button"
            onClick={() => onSelectPreference('all')}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/60 transition-colors shrink-0 cursor-pointer"
            title="ล้างตัวกรอง"
            aria-label="Clear filter"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dietary Standards Reassurance Modal */}
      {showInfoModal && (
        <div 
          id="dietary-standards-modal" 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setShowInfoModal(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-150 space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                    {language === 'th' ? 'มาตรฐานข้อจำกัดอาหาร (Dietary Standards)' : 'Dietary Standards & Safety'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {language === 'th' ? 'FoodExpress คัดกรองและตรวจสอบมาตรฐานร้านอาหารทุกมื้อ' : 'FoodExpress verifies preparation hygiene and ingredient compliance'}
                  </p>
                </div>
              </div>
              <button
                id="close-dietary-info-modal-btn"
                onClick={() => setShowInfoModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {DIETARY_PREFERENCES.map(pref => (
                <div 
                  key={pref.id}
                  className={`p-3 rounded-2xl border ${pref.theme.badgeBg} ${pref.theme.badgeBorder} space-y-1`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-bold flex items-center gap-1.5 ${pref.theme.badgeText}`}>
                      <span className="text-base">{pref.emoji}</span>
                      <span>{language === 'en' ? pref.labelEn : pref.label}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({language === 'en' ? pref.label : pref.labelEn})</span>
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                      {language === 'th' ? `พบ ${restaurantCounts[pref.id] || 0} ร้าน` : `${restaurantCounts[pref.id] || 0} places`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {pref.description}
                  </p>
                  <div className="pt-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-800">
                    <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>{pref.guaranteeText}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                id="dietary-standards-modal-ok-btn"
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {language === 'th' ? 'เข้าใจแล้ว ปิดหน้าต่าง' : 'Got it, Close Window'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
