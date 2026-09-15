import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Wrench, 
  CloudRain, 
  PhoneOff, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Radio, 
  Flame, 
  Check, 
  Send,
  XCircle,
  Headphones
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RiderReportedIssue } from '../../types';

// Web Speech API interface definitions to ensure type-safety without external deps
interface SpeechRecognitionResultAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultItem {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionResultAlternative;
}

interface SpeechRecognitionResultListItems {
  length: number;
  [index: number]: SpeechRecognitionResultItem;
}

interface IWebSpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultListItems;
}

interface IWebSpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface IWebSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: IWebSpeechRecognition, ev: Event) => void) | null;
  onend: ((this: IWebSpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: IWebSpeechRecognition, ev: IWebSpeechRecognitionErrorEvent) => void) | null;
  onresult: ((this: IWebSpeechRecognition, ev: IWebSpeechRecognitionEvent) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: { new(): IWebSpeechRecognition };
    webkitSpeechRecognition?: { new(): IWebSpeechRecognition };
  }
}

interface RiderVoiceAssistantProps {
  compact?: boolean;
}

export const RiderVoiceAssistant: React.FC<RiderVoiceAssistantProps> = ({ compact = false }) => {
  const { 
    language, 
    t, 
    activeRider,
    toggleRiderShiftStatus,
    activeIncomingTrip,
    acceptIncomingTrip,
    declineIncomingTrip,
    activeDeliveringTrip,
    deliveryStepIndex,
    advanceDeliveringStep,
    riderIssues,
    reportRiderIssue,
    resolveRiderIssue,
    triggerToast
  } = useApp();

  const [isListening, setIsListening] = useState<boolean>(false);
  const [handsFreeMode, setHandsFreeMode] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [lastCommandAction, setLastCommandAction] = useState<{ action: string; time: string } | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [showCheatsheet, setShowCheatsheet] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [soundFeedback, setSoundFeedback] = useState<boolean>(true);

  // Manual issue reporting modal state
  const [manualCategory, setManualCategory] = useState<RiderReportedIssue['category']>('vehicle_breakdown');
  const [manualDescription, setManualDescription] = useState<string>('');

  const recognitionRef = useRef<IWebSpeechRecognition | null>(null);
  const handsFreeModeRef = useRef<boolean>(handsFreeMode);
  handsFreeModeRef.current = handsFreeMode;

  // Synthesize short speech feedback to rider
  const speakFeedback = useCallback((text: string) => {
    if (!soundFeedback || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'th' ? 'th-TH' : 'en-US';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // safe fallback
    }
  }, [soundFeedback, language]);

  // Execute parsed voice command
  const executeVoiceCommand = useCallback((spokenText: string) => {
    const text = spokenText.trim().toLowerCase();
    if (!text) return;

    const timeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

    // 1. INCOMING TRIP COMMANDS
    if (activeIncomingTrip) {
      if (text.includes('รับงาน') || text.includes('รับออเดอร์') || text.includes('ตกลง') || text.includes('accept') || text.includes('take order')) {
        acceptIncomingTrip(activeIncomingTrip.id);
        setLastCommandAction({ action: language === 'th' ? 'รับงานเรียบร้อย' : 'Order Accepted', time: timeStr });
        speakFeedback(language === 'th' ? 'รับออเดอร์เรียบร้อยแล้วค่ะ' : 'Order accepted');
        return;
      }
      if (text.includes('ข้าม') || text.includes('ปฏิเสธ') || text.includes('ไม่รับ') || text.includes('decline') || text.includes('skip')) {
        declineIncomingTrip(activeIncomingTrip.id);
        setLastCommandAction({ action: language === 'th' ? 'ข้ามออเดอร์ให้คิวถัดไป' : 'Order Declined', time: timeStr });
        speakFeedback(language === 'th' ? 'ข้ามออเดอร์แล้วค่ะ' : 'Order skipped');
        return;
      }
    }

    // 2. ACTIVE DELIVERY STATUS COMMANDS
    if (activeDeliveringTrip) {
      // Step 0 -> Step 1: Arrived at store / picked up items
      if (deliveryStepIndex === 0) {
        if (
          text.includes('ถึงร้าน') || 
          text.includes('รับอาหาร') || 
          text.includes('รับของ') || 
          text.includes('ได้ของแล้ว') || 
          text.includes('picked up') || 
          text.includes('arrive store') || 
          text.includes('arrived at store')
        ) {
          advanceDeliveringStep();
          setLastCommandAction({ action: language === 'th' ? 'อัปเดต: ตรวจรับอาหารจากร้านแล้ว' : 'Updated: Picked Up from Store', time: timeStr });
          speakFeedback(language === 'th' ? 'บันทึกรับอาหารจากร้านเรียบร้อย มุ่งหน้าส่งลูกค้าค่ะ' : 'Food picked up. Head to customer.');
          return;
        }
      }

      // Step 1 -> Step 2: Arrived at customer location
      if (deliveryStepIndex === 1) {
        if (
          text.includes('ถึงลูกค้า') || 
          text.includes('ถึงบ้าน') || 
          text.includes('ถึงคอนโด') || 
          text.includes('ถึงแล้ว') || 
          text.includes('ถึงที่หมาย') || 
          text.includes('arrived') || 
          text.includes('at customer') || 
          text.includes('arrive')
        ) {
          advanceDeliveringStep();
          setLastCommandAction({ action: language === 'th' ? 'อัปเดต: ถึงจุดส่งมอบลูกค้าแล้ว' : 'Updated: Arrived at Customer', time: timeStr });
          speakFeedback(language === 'th' ? 'บันทึกถึงจุดส่งมอบลูกค้าแล้วค่ะ' : 'Arrived at destination.');
          return;
        }
      }

      // Step 2 -> Finished: Confirm handover & complete payout
      if (deliveryStepIndex === 2) {
        if (
          text.includes('ส่งสำเร็จ') || 
          text.includes('ส่งเรียบร้อย') || 
          text.includes('ส่งอาหารแล้ว') || 
          text.includes('ลูกค้ารับแล้ว') || 
          text.includes('ยืนยันส่ง') || 
          text.includes('complete') || 
          text.includes('delivered') || 
          text.includes('done')
        ) {
          advanceDeliveringStep();
          setLastCommandAction({ action: language === 'th' ? 'อัปเดต: ส่งมอบสำเร็จ รับเงินเข้ากระเป๋า' : 'Delivery Completed & Paid', time: timeStr });
          speakFeedback(language === 'th' ? 'ส่งมอบอาหารสำเร็จ ยอดเงินเข้ากระเป๋าเรียบร้อยแล้วค่ะ' : 'Delivery completed. Payment credited.');
          return;
        }
      }
    }

    // 3. SHIFT STATUS COMMANDS
    if (text.includes('เปิดระบบ') || text.includes('เข้าคิว') || text.includes('เริ่มงาน') || text.includes('start shift') || text.includes('go online')) {
      if (activeRider.shiftStatus === 'offline') {
        toggleRiderShiftStatus();
        setLastCommandAction({ action: language === 'th' ? 'เปิดระบบเข้าคิวออนไลน์' : 'Shift Started (Online)', time: timeStr });
        speakFeedback(language === 'th' ? 'เปิดระบบออนไลน์พร้อมรับงานแล้วค่ะ' : 'You are now online in queue');
        return;
      }
    }
    if (text.includes('พักกะ') || text.includes('ปิดระบบ') || text.includes('หยุดงาน') || text.includes('stop shift') || text.includes('go offline')) {
      if (activeRider.shiftStatus !== 'offline') {
        toggleRiderShiftStatus();
        setLastCommandAction({ action: language === 'th' ? 'ปิดระบบพักกะ' : 'Shift Paused (Offline)', time: timeStr });
        speakFeedback(language === 'th' ? 'บันทึกพักกะเรียบร้อยค่ะ' : 'Shift ended. You are offline.');
        return;
      }
    }

    // 4. REPORT ROAD INCIDENT / ISSUES HANDS-FREE
    if (
      text.includes('ปัญหา') || 
      text.includes('ยางแบน') || 
      text.includes('รถเสีย') || 
      text.includes('ฝนตก') || 
      text.includes('น้ำท่วม') || 
      text.includes('ลูกค้าไม่รับ') || 
      text.includes('โทรไม่ติด') || 
      text.includes('ร้านช้า') || 
      text.includes('อาหารหก') || 
      text.includes('report') || 
      text.includes('issue') || 
      text.includes('help')
    ) {
      let category: RiderReportedIssue['category'] = 'general';
      let categoryLabel = 'แจ้งเหตุทั่วไป (General Incident)';

      if (text.includes('ยางแบน') || text.includes('รถเสีย') || text.includes('รถล้ม') || text.includes('breakdown') || text.includes('flat tire')) {
        category = 'vehicle_breakdown';
        categoryLabel = 'ยานพาหนะขัดข้อง / ยางแบน (Vehicle Breakdown)';
      } else if (text.includes('ฝนตก') || text.includes('น้ำท่วม') || text.includes('รถติด') || text.includes('rain') || text.includes('flood') || text.includes('traffic')) {
        category = 'traffic_weather';
        categoryLabel = 'สภาพอากาศรุนแรง / จราจรติดขัด (Severe Weather / Traffic)';
      } else if (text.includes('ลูกค้าไม่รับ') || text.includes('โทรไม่ติด') || text.includes('ติดต่อไม่ได้') || text.includes('unreachable') || text.includes('phone')) {
        category = 'customer_unreachable';
        categoryLabel = 'ติดต่อลูกค้าไม่ได้ (Customer Unreachable)';
      } else if (text.includes('ร้านช้า') || text.includes('ทำช้า') || text.includes('รอนาน') || text.includes('delayed') || text.includes('kitchen')) {
        category = 'restaurant_delay';
        categoryLabel = 'ร้านค้าปรุงอาหารล่าช้า (Kitchen Delayed)';
      } else if (text.includes('อาหารหก') || text.includes('เสียหาย') || text.includes('ถุงขาด') || text.includes('spill') || text.includes('damaged')) {
        category = 'damaged_food';
        categoryLabel = 'อาหารหรือบรรจุภัณฑ์เสียหาย (Food Damaged / Spilled)';
      }

      reportRiderIssue({
        tripId: activeDeliveringTrip?.id,
        orderNumber: activeDeliveringTrip?.orderNumber,
        category,
        categoryLabel,
        description: text,
        transcript: spokenText,
      });

      setLastCommandAction({ 
        action: `${language === 'th' ? 'รายงานปัญหา:' : 'Reported:'} ${categoryLabel}`, 
        time: timeStr 
      });

      speakFeedback(
        language === 'th' 
          ? `บันทึกรายงานปัญหา ${categoryLabel.split('(')[0]} เรียบร้อยแล้วค่ะ ศูนย์ช่วยเหลือรับทราบแล้ว`
          : 'Incident reported to support center.'
      );
      return;
    }

    // Default unrecognized
    triggerToast(
      language === 'th' ? 'รับเสียงแล้ว' : 'Voice Input Received',
      `"${spokenText}" (แตะคำสั่งด่วนด้านล่างเพื่อสั่งงาน)`,
      'info'
    );
  }, [
    activeIncomingTrip,
    activeDeliveringTrip,
    deliveryStepIndex,
    activeRider.shiftStatus,
    acceptIncomingTrip,
    declineIncomingTrip,
    advanceDeliveringStep,
    toggleRiderShiftStatus,
    reportRiderIssue,
    language,
    speakFeedback,
    triggerToast
  ]);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language === 'th' ? 'th-TH' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: IWebSpeechRecognitionEvent) => {
        let currentInterim = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            finalChunk += res[0].transcript;
          } else {
            currentInterim += res[0].transcript;
          }
        }

        setInterimTranscript(currentInterim);

        if (finalChunk) {
          setTranscript(finalChunk);
          executeVoiceCommand(finalChunk);
          setInterimTranscript('');
        }
      };

      recognition.onerror = (event: IWebSpeechRecognitionErrorEvent) => {
        console.warn('Speech recognition event warning:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setIsListening(false);
          setHandsFreeMode(false);
          triggerToast(
            language === 'th' ? 'ไม่ได้รับอนุญาตใช้ไมโครโฟน' : 'Microphone Permission Denied',
            language === 'th' ? 'กรุณาอนุญาตไมโครโฟนในเบราว์เซอร์เพื่อใช้งานระบบเสียง หรือใช้ปุ่มคำสั่งลัด' : 'Please grant mic access in browser, or use quick action chips',
            'info'
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        // If hands-free mode is enabled, auto restart recognition smoothly
        if (handsFreeModeRef.current) {
          try {
            recognition.start();
          } catch {
            // safe
          }
        }
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.error('Speech recognition init error:', e);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // safe
        }
      }
    };
  }, [language, executeVoiceCommand, triggerToast]);

  // Toggle voice listening
  const toggleListening = () => {
    if (!recognitionRef.current) {
      triggerToast(
        language === 'th' ? 'ไม่พบ Speech API' : 'Speech API Unavailable',
        language === 'th' ? 'คุณสามารถคลิกปุ่มจำลองคำสั่งเสียงด่วนด้านล่างได้ทันที' : 'Use the quick action simulation buttons below',
        'info'
      );
      return;
    }

    if (isListening) {
      setHandsFreeMode(false);
      recognitionRef.current.stop();
      setIsListening(false);
      triggerToast(
        language === 'th' ? 'ปิดไมโครโฟนแล้ว' : 'Microphone Stopped',
        language === 'th' ? 'หยุดรับคำสั่งเสียงเรียบร้อย' : 'Voice listening paused',
        'info'
      );
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        triggerToast(
          language === 'th' ? '🎤 กำลังฟังคำสั่งเสียง...' : '🎤 Listening...',
          language === 'th' ? 'พูดคำสั่ง เช่น "ถึงร้านแล้ว", "ถึงลูกค้าแล้ว", "ส่งสำเร็จ", "รายงานปัญหายางแบน"' : 'Speak commands like "arrived at store", "complete", "report flat tire"',
          'success'
        );
      } catch (err) {
        console.warn('Speech start error:', err);
      }
    }
  };

  // Toggle Hands-Free Driving Mode
  const toggleHandsFree = () => {
    const nextMode = !handsFreeMode;
    setHandsFreeMode(nextMode);

    if (nextMode && !isListening && recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch {
        // safe
      }
    }

    triggerToast(
      nextMode 
        ? (language === 'th' ? '🛵 เปิดโหมดขับขี่ Hands-Free' : '🛵 Hands-Free Driving Mode ON')
        : (language === 'th' ? 'ปิดโหมด Hands-Free' : 'Hands-Free Driving Mode OFF'),
      nextMode
        ? (language === 'th' ? 'ระบบจะเปิดไมค์ต่อเนื่องพร้อมรับคำสั่งเสียงตลอดเส้นทาง' : 'Microphone will continuously listen for delivery commands')
        : (language === 'th' ? 'ปิดระบบรับเสียงต่อเนื่องแล้ว' : 'Continuous listening turned off'),
      nextMode ? 'reward' : 'info'
    );
  };

  // Handle manual submit issue
  const handleManualSubmitIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDescription.trim()) return;

    const categoryLabels: Record<RiderReportedIssue['category'], string> = {
      vehicle_breakdown: 'ยานพาหนะขัดข้อง / ยางแบน (Vehicle Breakdown)',
      traffic_weather: 'สภาพอากาศ / จราจรติดขัด (Severe Weather / Traffic)',
      customer_unreachable: 'ติดต่อลูกค้าไม่ได้ (Customer Unreachable)',
      restaurant_delay: 'ร้านค้าปรุงอาหารล่าช้า (Kitchen Delayed)',
      damaged_food: 'อาหารหรือบรรจุภัณฑ์เสียหาย (Food Damaged / Spilled)',
      general: 'แจ้งเหตุทั่วไป (General Incident)',
    };

    reportRiderIssue({
      tripId: activeDeliveringTrip?.id,
      orderNumber: activeDeliveringTrip?.orderNumber,
      category: manualCategory,
      categoryLabel: categoryLabels[manualCategory],
      description: manualDescription.trim(),
      transcript: manualDescription.trim(),
    });

    setManualDescription('');
    setShowReportModal(false);
  };

  return (
    <div id="rider-voice-assistant-card" className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Card Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
            isListening 
              ? 'bg-rose-600 text-white shadow-md shadow-rose-200 ring-4 ring-rose-100' 
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            {isListening ? (
              <>
                <Mic className="w-5 h-5 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
              </>
            ) : (
              <MicOff className="w-5 h-5 text-slate-500" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900">
                {t('voiceAssistantTitle')}
              </h3>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                isListening 
                  ? 'bg-rose-100 text-rose-800 animate-pulse' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {isListening ? '● LIVE LISTENING' : 'STANDBY'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('voiceAssistantSubtitle')}
            </p>
          </div>
        </div>

        {/* Action Buttons: Toggle Mic & Hands-Free Driving Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sound Feedback Toggle */}
          <button
            type="button"
            onClick={() => setSoundFeedback(!soundFeedback)}
            className={`p-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
              soundFeedback 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' 
                : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
            title={soundFeedback ? 'เปิดเสียงตอบรับ' : 'ปิดเสียงตอบรับ'}
          >
            {soundFeedback ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Hands-free mode switch */}
          <button
            type="button"
            id="rider-voice-handsfree-toggle"
            onClick={toggleHandsFree}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
              handsFreeMode 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs ring-2 ring-emerald-400' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
            title="เปิดไมค์ตลอดเวลาขณะขับขี่ ไม่ต้องกดสัมผัสหน้าจอ"
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>{handsFreeMode ? 'โหมด Hands-Free: เปิด' : 'เปิดโหมด Hands-Free'}</span>
          </button>

          {/* Main Push-to-Talk Mic Toggle */}
          <button
            type="button"
            id="rider-voice-mic-btn"
            onClick={toggleListening}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shadow-xs ${
              isListening 
                ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" />
                <span>{t('voiceStopListening')}</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>{t('voiceTapToSpeak')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Audio Visualizer / Status Banner */}
      <div className={`p-3.5 rounded-xl border transition-all ${
        isListening 
          ? 'bg-gradient-to-r from-rose-50 via-amber-50 to-emerald-50 border-rose-200' 
          : 'bg-slate-50/80 border-slate-200/80'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            {isListening ? (
              <div className="flex items-center gap-1 shrink-0 h-4">
                <span className="w-1 h-3 bg-rose-500 rounded-full animate-bounce" />
                <span className="w-1 h-5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-1 h-4 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.3s]" />
                <span className="w-1 h-6 bg-blue-500 rounded-full animate-bounce [animation-delay:0.45s]" />
              </div>
            ) : (
              <div className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
            )}

            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                {isListening ? t('voiceListening') : 'คำสั่งเสียงล่าสุด (Last Voice Command)'}
              </span>
              <div className="text-xs font-black text-slate-900 truncate">
                {interimTranscript ? (
                  <span className="text-amber-700 italic">{interimTranscript}...</span>
                ) : transcript ? (
                  <span>"{transcript}"</span>
                ) : (
                  <span className="text-slate-400 font-normal italic">
                    {language === 'th' ? 'แตะปุ่มไมค์แล้วพูด เช่น "ถึงร้านแล้ว", "ส่งสำเร็จ", "แจ้งเหตุ ยางแบน"' : 'Tap mic and speak a command'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {lastCommandAction && (
            <div className="bg-white px-3 py-1.5 rounded-lg border border-emerald-200 shadow-2xs flex items-center gap-2 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <div className="text-[11px] font-bold text-slate-800">
                <span>{lastCommandAction.action}</span>
                <span className="text-[10px] text-slate-400 ml-1.5 font-normal">({lastCommandAction.time})</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Hands-Free Simulation Action Chips (Ensures full testing even without mic input) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>คำสั่งด่วนจำลองเสียง (Quick Voice Simulation Chips):</span>
          </span>

          <button
            type="button"
            onClick={() => setShowCheatsheet(!showCheatsheet)}
            className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>{showCheatsheet ? 'ซ่อนคู่มือ' : 'ดูคำสั่งเสียงทั้งหมด'}</span>
            {showCheatsheet ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Action Chips Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {/* Status 1: To Store / Picked up */}
          <button
            type="button"
            id="voice-chip-pickup"
            onClick={() => executeVoiceCommand('ถึงร้านแล้ว รับอาหารเรียบร้อย')}
            className={`p-2 rounded-xl border text-left font-bold transition-all cursor-pointer flex items-center gap-2 shadow-2xs ${
              activeDeliveringTrip && deliveryStepIndex === 0
                ? 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-300'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title="จำลองพูดคำสั่ง: ถึงร้านแล้ว รับอาหารเรียบร้อย"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-xs">
              🥡
            </div>
            <div className="min-w-0">
              <div className="truncate text-[11px]">"ถึงร้านแล้ว"</div>
              <div className="text-[9px] text-slate-400">ตรวจรับอาหาร (Step 1)</div>
            </div>
          </button>

          {/* Status 2: Arrived at customer */}
          <button
            type="button"
            id="voice-chip-arrived"
            onClick={() => executeVoiceCommand('ถึงบ้านลูกค้าแล้ว')}
            className={`p-2 rounded-xl border text-left font-bold transition-all cursor-pointer flex items-center gap-2 shadow-2xs ${
              activeDeliveringTrip && deliveryStepIndex === 1
                ? 'bg-blue-50 border-blue-400 text-blue-900 ring-2 ring-blue-300'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title="จำลองพูดคำสั่ง: ถึงบ้านลูกค้าแล้ว"
          >
            <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 text-xs">
              📍
            </div>
            <div className="min-w-0">
              <div className="truncate text-[11px]">"ถึงลูกค้าแล้ว"</div>
              <div className="text-[9px] text-slate-400">ถึงจุดหมาย (Step 2)</div>
            </div>
          </button>

          {/* Status 3: Complete & Cash In */}
          <button
            type="button"
            id="voice-chip-complete"
            onClick={() => executeVoiceCommand('ส่งอาหารสำเร็จเรียบร้อยแล้ว')}
            className={`p-2 rounded-xl border text-left font-bold transition-all cursor-pointer flex items-center gap-2 shadow-2xs ${
              activeDeliveringTrip && deliveryStepIndex === 2
                ? 'bg-emerald-500 text-white border-emerald-600 ring-2 ring-emerald-300 shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title="จำลองพูดคำสั่ง: ส่งอาหารสำเร็จเรียบร้อยแล้ว"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 text-xs">
              💸
            </div>
            <div className="min-w-0">
              <div className="truncate text-[11px]">"ส่งสำเร็จแล้ว"</div>
              <div className="text-[9px] opacity-80">รับเงินเข้าวอลเล็ต (Step 3)</div>
            </div>
          </button>

          {/* Report Issue Button / Chip */}
          <button
            type="button"
            id="voice-chip-report-issue"
            onClick={() => setShowReportModal(true)}
            className="p-2 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-800 text-left font-bold transition-all cursor-pointer flex items-center gap-2 shadow-2xs"
            title="รายงานปัญหา ยางแบน / รถเสีย / ลูกค้าไม่รับสาย"
          >
            <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 text-xs">
              ⚠️
            </div>
            <div className="min-w-0">
              <div className="truncate text-[11px]">"รายงานปัญหา"</div>
              <div className="text-[9px] text-rose-600 font-semibold">แจ้งเหตุฉุกเฉิน</div>
            </div>
          </button>
        </div>
      </div>

      {/* Cheatsheet Expandable Box */}
      <AnimatePresence>
        {showCheatsheet && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-3"
          >
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>{t('voiceCommandsCheatsheet')}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                <span className="font-black text-emerald-700 block">🛵 1. อัปเดตสถานะการจัดส่ง</span>
                <ul className="space-y-1 text-slate-600 list-disc list-inside">
                  <li><strong>"ถึงร้านแล้ว"</strong> / <strong>"รับอาหารแล้ว"</strong> (ข้ามไปขั้นตอนนำส่งลูกค้า)</li>
                  <li><strong>"ถึงลูกค้าแล้ว"</strong> / <strong>"ถึงที่หมายแล้ว"</strong> (ข้ามไปขั้นตอนส่งมอบ)</li>
                  <li><strong>"ส่งสำเร็จแล้ว"</strong> / <strong>"ส่งเรียบร้อย"</strong> (ยืนยันจบงานและรับเงิน)</li>
                  <li><strong>"รับงาน"</strong> / <strong>"ข้ามออเดอร์"</strong> (ตอบรับข้อเสนอที่เด้งเข้าคิว)</li>
                </ul>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                <span className="font-black text-rose-700 block">⚠️ 2. รายงานปัญหาระหว่างทาง (Hands-Free Issue)</span>
                <ul className="space-y-1 text-slate-600 list-disc list-inside">
                  <li><strong>"รายงาน ยางแบน รถเสีย"</strong> (ส่งเรื่องช่าง/ยานพาหนะขัดข้อง)</li>
                  <li><strong>"รายงาน ฝนตกหนัก น้ำท่วมทาง"</strong> (ขยายเวลาจัดส่งอัตโนมัติ)</li>
                  <li><strong>"รายงาน ติดต่อลูกค้าไม่ได้"</strong> (แจ้งศูนย์ติดต่อปลายทาง)</li>
                  <li><strong>"รายงาน ร้านทำอาหารช้ามาก"</strong> (แจ้งอัปเดตเวลารอคิว)</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reported Issues History List (If any recorded) */}
      {riderIssues.length > 0 && (
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>ประวัติการแจ้งปัญหา ({riderIssues.length} รายการ)</span>
            </span>
            <span className="text-[10px] text-slate-400">บันทึกผ่านระบบเสียงอัตโนมัติ</span>
          </div>

          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {riderIssues.map(issue => (
              <div 
                key={issue.id}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 text-xs"
              >
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-slate-800 text-[11px]">
                      {issue.categoryLabel}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                      issue.status === 'resolved' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800 animate-pulse'
                    }`}>
                      {issue.status === 'resolved' ? '✓ แก้ไขแล้ว' : '● กำลังประสานงาน'}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-auto">{issue.reportedAt}</span>
                  </div>

                  <p className="text-[11px] text-slate-600 bg-white p-1.5 rounded-lg border border-slate-100">
                    "{issue.transcript || issue.description}"
                  </p>

                  {issue.resolvedNote && (
                    <p className="text-[10px] text-emerald-700 font-semibold">
                      ศูนย์ช่วยเหลือ: {issue.resolvedNote}
                    </p>
                  )}
                </div>

                {issue.status !== 'resolved' && (
                  <button
                    type="button"
                    onClick={() => resolveRiderIssue(issue.id)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[10px] shrink-0 cursor-pointer"
                  >
                    กดเคลียร์ปัญหา
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Issue Reporting Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-lg shadow-2xs">
                  ⚠️
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">
                    {t('reportIssueTitle')}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    แจ้งศูนย์ปฏิบัติการไรเดอร์เพื่อประสานงานช่วยเหลือ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualSubmitIssue} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  ประเภทปัญหาที่พบ:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'vehicle_breakdown' as const, label: '🔧 รถเสีย / ยางแบน', desc: 'Breakdown' },
                    { key: 'traffic_weather' as const, label: '🌧️ ฝนตกหนัก / รถติด', desc: 'Weather/Traffic' },
                    { key: 'customer_unreachable' as const, label: '📞 ติดต่อลูกค้าไม่ได้', desc: 'Unreachable' },
                    { key: 'restaurant_delay' as const, label: '⏱️ ร้านอาหารทำช้า', desc: 'Kitchen Delay' },
                    { key: 'damaged_food' as const, label: '🥡 อาหารหกเสียหาย', desc: 'Damaged Food' },
                    { key: 'general' as const, label: '⚠️ เหตุฉุกเฉินอื่น ๆ', desc: 'General Issue' },
                  ].map(cat => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setManualCategory(cat.key)}
                      className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                        manualCategory === cat.key 
                          ? 'border-rose-500 bg-rose-50 text-rose-900 ring-1 ring-rose-500' 
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <div className="text-[11px]">{cat.label}</div>
                      <div className="text-[9px] text-slate-400">{cat.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  รายละเอียดเหตุการณ์ (พูดหรือพิมพ์):
                </label>
                <textarea
                  rows={3}
                  value={manualDescription}
                  onChange={e => setManualDescription(e.target.value)}
                  placeholder="เช่น ยางหลังแบนอยู่บริเวณปากซอยสุขุมวิท 23 กำลังหาจุดปะยาง..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  required
                />
              </div>

              {/* Quick Preset buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'ยางหลังแบน ขอความช่วยเหลือด่วน',
                  'ฝนตกหนักมาก ต้องจอดหลบใต้สะพาน',
                  'โทรหาลูกค้า 4 ครั้งไม่มีคนรับสาย',
                  'ร้านอาหารแจ้งว่าคิวยาว รอนานเกิน 25 นาที'
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setManualDescription(preset)}
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-medium text-slate-700 cursor-pointer"
                  >
                    + "{preset}"
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>บันทึกแจ้งเหตุ ⚠️</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
