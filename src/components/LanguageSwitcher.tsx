import React from 'react';
import { useApp } from '../context/AppContext';
import { Globe } from 'lucide-react';
import { Language } from '../data/translations';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'pill' | 'toggle' | 'minimal';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  className = '',
  variant = 'pill' 
}) => {
  const { language, setLanguage, triggerToast, t } = useApp();

  const handleToggle = (newLang: Language) => {
    if (newLang === language) return;
    setLanguage(newLang);
    triggerToast(
      newLang === 'en' ? 'Language Changed' : 'เปลี่ยนภาษาสำเร็จ',
      newLang === 'en' ? 'App interface switched to English' : 'เปลี่ยนเมนูและหน้าจอเป็นภาษาไทยแล้ว',
      'info'
    );
  };

  const toggleLang = () => {
    const nextLang: Language = language === 'th' ? 'en' : 'th';
    handleToggle(nextLang);
  };

  if (variant === 'toggle') {
    return (
      <button
        id="header-language-switcher-btn"
        type="button"
        onClick={toggleLang}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold transition-all cursor-pointer bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs ${className}`}
        title={language === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}
        aria-label="Switch Language"
      >
        <Globe className="w-3.5 h-3.5 text-emerald-600" />
        <span>{language === 'th' ? '🇹🇭 TH' : '🇬🇧 EN'}</span>
      </button>
    );
  }

  return (
    <div 
      id="header-language-switcher-group"
      className={`inline-flex items-center p-0.5 rounded-full bg-slate-100 border border-slate-200/80 shadow-2xs ${className}`}
      role="group"
      aria-label="Language selection"
    >
      <button
        id="lang-switch-th-btn"
        type="button"
        onClick={() => handleToggle('th')}
        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
          language === 'th'
            ? 'bg-white text-emerald-800 shadow-xs ring-1 ring-emerald-500/20'
            : 'text-slate-500 hover:text-slate-900'
        }`}
        title="ภาษาไทย"
      >
        <span>🇹🇭</span>
        <span>TH</span>
      </button>

      <button
        id="lang-switch-en-btn"
        type="button"
        onClick={() => handleToggle('en')}
        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
          language === 'en'
            ? 'bg-white text-emerald-800 shadow-xs ring-1 ring-emerald-500/20'
            : 'text-slate-500 hover:text-slate-900'
        }`}
        title="English"
      >
        <span>🇬🇧</span>
        <span>EN</span>
      </button>
    </div>
  );
};
