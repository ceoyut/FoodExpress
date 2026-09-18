import React from 'react';
import { useApp } from '../context/AppContext';
import { Wifi, Battery, Smartphone, Monitor } from 'lucide-react';

interface DeviceFrameProps {
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children }) => {
  const { deviceMode, setDeviceMode } = useApp();

  const currentTime = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start p-0 md:p-4 lg:p-6 transition-colors duration-300">
      {/* Top Device Switcher Toolbar */}
      <header className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 px-4 py-3 mb-2 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 text-slate-300 shadow-xl z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-extrabold text-lg shadow-md shadow-emerald-500/20">
            FE
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-tight">FoodExpress</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                Live Cloud
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              แพลตฟอร์มสั่งอาหารและติดตามสถานะจัดส่งแบบเรียลไทม์ (iOS & Android)
            </p>
          </div>
        </div>

        {/* Device Mode Selectors */}
        <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/60 text-xs">
          <button
            id="device-mode-ios-btn"
            onClick={() => setDeviceMode('ios')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              deviceMode === 'ios'
                ? 'bg-emerald-500 text-slate-950 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>iPhone (iOS)</span>
          </button>

          <button
            id="device-mode-android-btn"
            onClick={() => setDeviceMode('android')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              deviceMode === 'android'
                ? 'bg-emerald-500 text-slate-950 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Pixel (Android)</span>
          </button>

          <button
            id="device-mode-responsive-btn"
            onClick={() => setDeviceMode('responsive')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              deviceMode === 'responsive'
                ? 'bg-emerald-500 text-slate-950 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Responsive Web</span>
          </button>
        </div>
      </header>

      {/* Main Container based on device mode */}
      <main className="w-full flex items-center justify-center flex-1">
        {deviceMode === 'responsive' ? (
          <div className="w-full max-w-5xl bg-slate-50 min-h-[85vh] rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col relative text-slate-900">
            {children}
          </div>
        ) : (
          <div
            className={`relative transition-all duration-300 w-full max-w-[412px] bg-slate-50 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col text-slate-900 ${
              deviceMode === 'ios'
                ? 'rounded-[50px] border-[10px] border-slate-200 ring-1 ring-slate-300 min-h-[844px] max-h-[94vh]'
                : 'rounded-[36px] border-[8px] border-slate-700 ring-1 ring-slate-600 min-h-[844px] max-h-[94vh]'
            }`}
          >
            {/* Native OS Status Bar - Seamless Green from Reference Image */}
            <div className="w-full bg-gradient-to-r from-[#00BA76] to-[#00A366] text-white px-7 pt-3.5 pb-2 flex items-center justify-between select-none z-30 shrink-0 shadow-2xs">
              <span className="text-xs font-bold tracking-tight">9:41</span>

              {/* Dynamic Island or Camera Punch */}
              {deviceMode === 'ios' ? (
                <div className="w-24 h-4.5 bg-black rounded-full flex items-center justify-end px-2 gap-1.5 shadow-inner">
                  <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-800" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/90 animate-pulse" />
                </div>
              ) : (
                <div className="w-3.5 h-3.5 bg-black rounded-full shadow-inner mx-auto" />
              )}

              <div className="flex items-center gap-1.5 text-xs text-white">
                <Wifi className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">5G</span>
                <Battery className="w-4 h-4" />
              </div>
            </div>

            {/* Inner App Content with scroll */}
            <div className="flex-1 overflow-y-auto flex flex-col relative bg-[#F6F8F7]">
              {children}
            </div>

            {/* Native Home Indicator Bar (iOS / Android) */}
            <div className="w-full bg-white py-2 flex items-center justify-center shrink-0 z-30 border-t border-slate-100">
              {deviceMode === 'ios' ? (
                <div className="w-32 h-1 bg-slate-300 rounded-full" />
              ) : (
                <div className="w-20 h-1 bg-slate-400 rounded-full" />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
