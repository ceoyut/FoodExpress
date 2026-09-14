import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  RiderApplication, 
  RiderVehicleType, 
  RiderApplicationStatus 
} from '../../types';
import { 
  UserPlus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  Bike, 
  Car, 
  CreditCard, 
  Upload, 
  Sparkles, 
  Check, 
  ChevronRight,
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  FileCheck2,
  Filter
} from 'lucide-react';

export const RiderRegistrationTab: React.FC = () => {
  const { 
    riderApplications, 
    submitRiderApplication, 
    updateApplicationStatus, 
    deliveryZones,
    setActiveRider 
  } = useApp();

  const [activeSubView, setActiveSubView] = useState<'form' | 'directory'>('form');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Multi-step application form state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    fullName: '',
    nationalId: '',
    phone: '',
    email: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    vehicleType: 'motorcycle' as RiderVehicleType,
    vehicleBrandModel: '',
    licensePlate: '',
    driverLicenseNumber: '',
    preferredZone: deliveryZones[0]?.name || 'สุขุมวิท - ทองหล่อ - เอกมัย',
    bankName: 'ธนาคารกสิกรไทย (KBANK)',
    bankAccountNumber: '',
    promptPayId: '',
    idCardUploaded: true,
    driverLicenseUploaded: true,
    vehiclePhotoUploaded: true,
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: { [key: string]: string } = {};

    if (step === 1) {
      if (!formData.fullName.trim()) errors.fullName = 'กรุณากรอกชื่อ-นามสกุล';
      if (!formData.phone.trim()) errors.phone = 'กรุณากรอกเบอร์โทรศัพท์';
      if (!formData.nationalId.trim()) errors.nationalId = 'กรุณากรอกเลขบัตรประชาชน 13 หลัก';
    } else if (step === 2) {
      if (!formData.vehicleBrandModel.trim()) errors.vehicleBrandModel = 'กรุณาระบุยี่ห้อและรุ่นของยานพาหนะ';
      if (!formData.licensePlate.trim()) errors.licensePlate = 'กรุณาระบุเลขทะเบียนรถ';
      if (!formData.driverLicenseNumber.trim()) errors.driverLicenseNumber = 'กรุณาระบุเลขที่ใบขับขี่';
    } else if (step === 3) {
      if (!formData.bankAccountNumber.trim()) errors.bankAccountNumber = 'กรุณากรอกเลขที่บัญชีธนาคาร';
      if (!formData.promptPayId.trim()) errors.promptPayId = 'กรุณาระบุเลขพร้อมเพย์สำหรับรับเงินด่วน';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(4, prev + 1));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) {
      setCurrentStep(3);
      return;
    }

    submitRiderApplication({
      fullName: formData.fullName,
      nationalId: formData.nationalId,
      phone: formData.phone,
      email: formData.email || `${formData.phone}@foodexpress.rider.th`,
      vehicleType: formData.vehicleType,
      vehicleBrandModel: formData.vehicleBrandModel,
      licensePlate: formData.licensePlate,
      driverLicenseNumber: formData.driverLicenseNumber,
      preferredZone: formData.preferredZone,
      bankName: formData.bankName,
      bankAccountNumber: formData.bankAccountNumber,
      promptPayId: formData.promptPayId,
      emergencyContactName: formData.emergencyContactName || 'ติดต่อผู้สมัครโดยตรง',
      emergencyContactPhone: formData.emergencyContactPhone || formData.phone,
    });

    // Reset form and view directory
    setActiveSubView('directory');
    setCurrentStep(1);
    setFormData({
      fullName: '',
      nationalId: '',
      phone: '',
      email: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      vehicleType: 'motorcycle',
      vehicleBrandModel: '',
      licensePlate: '',
      driverLicenseNumber: '',
      preferredZone: deliveryZones[0]?.name || 'สุขุมวิท - ทองหล่อ - เอกมัย',
      bankName: 'ธนาคารกสิกรไทย (KBANK)',
      bankAccountNumber: '',
      promptPayId: '',
      idCardUploaded: true,
      driverLicenseUploaded: true,
      vehiclePhotoUploaded: true,
    });
  };

  const fillQuickDemo = () => {
    setFormData({
      fullName: 'นายเกรียงไกร มั่นคง (ก้อง)',
      nationalId: '1-1002-44918-20-4',
      phone: '083-991-8844',
      email: 'kriengkrai.kong@gmail.com',
      emergencyContactName: 'นางสุภาพ มั่นคง (ภรรยา)',
      emergencyContactPhone: '081-445-5667',
      vehicleType: 'motorcycle',
      vehicleBrandModel: 'Honda Wave 125i (สีน้ำเงิน-เทา)',
      licensePlate: '2กฉ 5519 กทม.',
      driverLicenseNumber: '640998124',
      preferredZone: 'สุขุมวิท - ทองหล่อ - เอกมัย',
      bankName: 'ธนาคารกสิกรไทย (KBANK)',
      bankAccountNumber: '042-7-89102-1',
      promptPayId: '083-991-8844',
      idCardUploaded: true,
      driverLicenseUploaded: true,
      vehiclePhotoUploaded: true,
    });
    setFormErrors({});
  };

  const filteredApps = riderApplications.filter(app => {
    if (filterStatus === 'all') return true;
    return app.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Sub-navigation bar */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            id="rider-reg-subview-form-btn"
            onClick={() => setActiveSubView('form')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubView === 'form'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>แบบฟอร์มสมัครงาน</span>
          </button>

          <button
            id="rider-reg-subview-directory-btn"
            onClick={() => setActiveSubView('directory')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubView === 'directory'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>รายชื่อผู้สมัคร & สถานะ ({riderApplications.length})</span>
          </button>
        </div>

        {activeSubView === 'form' && (
          <button
            id="rider-fill-demo-data-btn"
            onClick={fillQuickDemo}
            className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>กรอกข้อมูลทดสอบด่วน</span>
          </button>
        )}
      </div>

      {/* FORM VIEW */}
      {activeSubView === 'form' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                  FoodExpress Rider Partner
                </span>
                <h3 className="text-lg font-black mt-1">สมัครเป็นพนักงานจัดส่งเดลิเวอรี</h3>
                <p className="text-xs text-emerald-100 mt-0.5">
                  สร้างรายได้อิสระ รับเงินไว เบิกถอนได้ทันทีตลอด 24 ชม. ค่ารอบสูงพร้อมทิป 100%
                </p>
              </div>
              <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-white/15 items-center justify-center text-3xl shadow-inner">
                🛵
              </div>
            </div>

            {/* Stepper Indicator */}
            <div className="mt-5 grid grid-cols-4 gap-2 pt-3 border-t border-white/20">
              {[
                { step: 1, label: 'ข้อมูลส่วนตัว' },
                { step: 2, label: 'ยานพาหนะ & ใบขับขี่' },
                { step: 3, label: 'โซน & บัญชีรับเงิน' },
                { step: 4, label: 'เอกสาร & ยืนยัน' },
              ].map(s => (
                <div 
                  key={s.step} 
                  onClick={() => setCurrentStep(s.step)}
                  className={`flex flex-col items-center cursor-pointer ${
                    currentStep === s.step 
                      ? 'opacity-100' 
                      : currentStep > s.step 
                      ? 'opacity-85' 
                      : 'opacity-40'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black mb-1 ${
                    currentStep === s.step 
                      ? 'bg-white text-emerald-700 ring-2 ring-emerald-300' 
                      : currentStep > s.step 
                      ? 'bg-emerald-400 text-emerald-950' 
                      : 'bg-white/20 text-white'
                  }`}>
                    {currentStep > s.step ? <Check className="w-3.5 h-3.5" /> : s.step}
                  </div>
                  <span className="text-[10px] font-medium truncate max-w-full text-center">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
            {/* STEP 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>ขั้นตอนที่ 1: ข้อมูลส่วนตัวผู้สมัคร</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    กรุณากรอกข้อมูลจริงตามบัตรประจำตัวประชาชน เพื่อความรวดเร็วในการตรวจสอบประวัติ
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ชื่อ - นามสกุล (ภาษาไทย) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="rider-input-fullname"
                        type="text"
                        value={formData.fullName}
                        onChange={e => handleInputChange('fullName', e.target.value)}
                        placeholder="เช่น นายธนากร มุ่งมั่น"
                        className={`w-full text-xs px-3.5 py-2.5 rounded-xl border ${
                          formErrors.fullName ? 'border-red-500 bg-red-50/30' : 'border-slate-200'
                        } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      />
                    </div>
                    {formErrors.fullName && (
                      <span className="text-[11px] text-red-500 mt-1 block">{formErrors.fullName}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      เลขประจำตัวประชาชน 13 หลัก <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="rider-input-national-id"
                      type="text"
                      maxLength={17}
                      value={formData.nationalId}
                      onChange={e => handleInputChange('nationalId', e.target.value)}
                      placeholder="1-xxxx-xxxxx-xx-x"
                      className={`w-full text-xs px-3.5 py-2.5 rounded-xl border ${
                        formErrors.nationalId ? 'border-red-500 bg-red-50/30' : 'border-slate-200'
                      } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    />
                    {formErrors.nationalId && (
                      <span className="text-[11px] text-red-500 mt-1 block">{formErrors.nationalId}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      เบอร์โทรศัพท์มือถือที่ติดต่อได้ <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="rider-input-phone"
                        type="tel"
                        value={formData.phone}
                        onChange={e => handleInputChange('phone', e.target.value)}
                        placeholder="08x-xxx-xxxx"
                        className={`w-full text-xs px-3.5 py-2.5 rounded-xl border ${
                          formErrors.phone ? 'border-red-500 bg-red-50/30' : 'border-slate-200'
                        } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      />
                    </div>
                    {formErrors.phone && (
                      <span className="text-[11px] text-red-500 mt-1 block">{formErrors.phone}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      อีเมล (สำหรับรับสลิปภาษีและข่าวสาร)
                    </label>
                    <input
                      id="rider-input-email"
                      type="email"
                      value={formData.email}
                      onChange={e => handleInputChange('email', e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ชื่อผู้ติดต่อกรณีฉุกเฉิน
                    </label>
                    <input
                      id="rider-input-emergency-name"
                      type="text"
                      value={formData.emergencyContactName}
                      onChange={e => handleInputChange('emergencyContactName', e.target.value)}
                      placeholder="เช่น บิดา, มารดา, คู่สมรส"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      เบอร์โทรศัพท์ผู้ติดต่อฉุกเฉิน
                    </label>
                    <input
                      id="rider-input-emergency-phone"
                      type="tel"
                      value={formData.emergencyContactPhone}
                      onChange={e => handleInputChange('emergencyContactPhone', e.target.value)}
                      placeholder="08x-xxx-xxxx"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Vehicle & Driver License */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Bike className="w-4 h-4 text-emerald-600" />
                    <span>ขั้นตอนที่ 2: ยานพาหนะ & ใบอนุญาตขับขี่</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    เลือกประเภทยานพาหนะที่ใช้ในการจัดส่งอาหาร
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    ประเภทยานพาหนะที่ใช้ <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { type: 'motorcycle' as RiderVehicleType, label: 'รถจักรยานยนต์', icon: '🛵', desc: 'คล่องตัว ค่ารอบเต็ม' },
                      { type: 'electric_bike' as RiderVehicleType, label: 'มอเตอร์ไซค์ไฟฟ้า (EV)', icon: '⚡', desc: 'ประหยัดพลังงาน โบนัสรักษ์โลก' },
                      { type: 'bicycle' as RiderVehicleType, label: 'จักรยาน', icon: '🚲', desc: 'ระยะใกล้ ไม่ใช้น้ำมัน' },
                      { type: 'car' as RiderVehicleType, label: 'รถยนต์ส่วนบุคคล', icon: '🚗', desc: 'ส่งออเดอร์ใหญ่/จัดเลี้ยง' },
                    ].map(v => (
                      <button
                        key={v.type}
                        type="button"
                        id={`vehicle-type-${v.type}-btn`}
                        onClick={() => handleInputChange('vehicleType', v.type)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          formData.vehicleType === v.type
                            ? 'border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-500'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-2xl mb-1 block">{v.icon}</span>
                        <div className="font-bold text-xs text-slate-800 leading-tight">{v.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{v.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ยี่ห้อ & รุ่นยานพาหนะ <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="rider-input-vehicle-model"
                      type="text"
                      value={formData.vehicleBrandModel}
                      onChange={e => handleInputChange('vehicleBrandModel', e.target.value)}
                      placeholder="เช่น Honda Wave 125i, Yamaha Grand Filano"
                      className={`w-full text-xs px-3.5 py-2.5 rounded-xl border ${
                        formErrors.vehicleBrandModel ? 'border-red-500 bg-red-50/30' : 'border-slate-200'
                      } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    />
                    {formErrors.vehicleBrandModel && (
                      <span className="text-[11px] text-red-500 mt-1 block">{formErrors.vehicleBrandModel}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      เลขทะเบียนรถ <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="rider-input-license-plate"
                      type="text"
                      value={formData.licensePlate}
                      onChange={e => handleInputChange('licensePlate', e.target.value)}
                      placeholder="เช่น 1กข 8824 กทม."
                      className={`w-full text-xs px-3.5 py-2.5 rounded-xl border ${
                        formErrors.licensePlate ? 'border-red-500 bg-red-50/30' : 'border-slate-200'
                      } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    />
                    {formErrors.licensePlate && (
                      <span className="text-[11px] text-red-500 mt-1 block">{formErrors.licensePlate}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      เลขที่ใบอนุญาตขับขี่ <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="rider-input-driver-license-num"
                      type="text"
                      value={formData.driverLicenseNumber}
                      onChange={e => handleInputChange('driverLicenseNumber', e.target.value)}
                      placeholder="เช่น 620091823"
                      className={`w-full text-xs px-3.5 py-2.5 rounded-xl border ${
                        formErrors.driverLicenseNumber ? 'border-red-500 bg-red-50/30' : 'border-slate-200'
                      } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    />
                    {formErrors.driverLicenseNumber && (
                      <span className="text-[11px] text-red-500 mt-1 block">{formErrors.driverLicenseNumber}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Preferred Zone & Bank Payout Details */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>ขั้นตอนที่ 3: โซนพื้นที่วิ่งงาน & บัญชีรับเงินค่ารอบ</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    เลือกโซนที่ต้องการเข้าคิวรับออเดอร์ และกรอกบัญชีธนาคารสำหรับถอนเงินด่วนตลอด 24 ชม.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    โซนพื้นที่วิ่งงานหลักที่ต้องการ <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="rider-select-zone"
                    value={formData.preferredZone}
                    onChange={e => handleInputChange('preferredZone', e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {deliveryZones.map(zone => (
                      <option key={zone.id} value={zone.name}>
                        {zone.name} ({zone.district}) • โบนัสช่วงพีค +฿{zone.surgeBonusPerTrip}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ธนาคารที่ใช้รับเงิน <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="rider-select-bank"
                      value={formData.bankName}
                      onChange={e => handleInputChange('bankName', e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="ธนาคารกสิกรไทย (KBANK)">ธนาคารกสิกรไทย (KBANK)</option>
                      <option value="ธนาคารไทยพาณิชย์ (SCB)">ธนาคารไทยพาณิชย์ (SCB)</option>
                      <option value="ธนาคารกรุงเทพ (BBL)">ธนาคารกรุงเทพ (BBL)</option>
                      <option value="ธนาคารกรุงไทย (KTB)">ธนาคารกรุงไทย (KTB)</option>
                      <option value="ธนาคารกรุงศรีอยุธยา (BAY)">ธนาคารกรุงศรีอยุธยา (BAY)</option>
                      <option value="ธนาคารทหารไทยธนชาต (TTB)">ธนาคารทหารไทยธนชาต (TTB)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      เลขที่บัญชีธนาคาร <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="rider-input-bank-acc-num"
                      type="text"
                      value={formData.bankAccountNumber}
                      onChange={e => handleInputChange('bankAccountNumber', e.target.value)}
                      placeholder="xxx-x-xxxxx-x"
                      className={`w-full text-xs px-3.5 py-2.5 rounded-xl border ${
                        formErrors.bankAccountNumber ? 'border-red-500 bg-red-50/30' : 'border-slate-200'
                      } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    />
                    {formErrors.bankAccountNumber && (
                      <span className="text-[11px] text-red-500 mt-1 block">{formErrors.bankAccountNumber}</span>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      เบอร์พร้อมเพย์ (PromptPay) หรือเลขบัตรประชาชนสำหรับรับเงินโอนทันที <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="rider-input-promptpay-id"
                        type="text"
                        value={formData.promptPayId}
                        onChange={e => handleInputChange('promptPayId', e.target.value)}
                        placeholder="เบอร์มือถือ เช่น 08x-xxx-xxxx หรือเลขบัตร 13 หลัก"
                        className={`w-full text-xs px-3.5 py-2.5 rounded-xl border ${
                          formErrors.promptPayId ? 'border-red-500 bg-red-50/30' : 'border-slate-200'
                        } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      ระบบรองรับการโอนเงินด่วนแบบ Real-time เข้าพร้อมเพย์ฟรีค่าธรรมเนียม ตลอด 24 ชม.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Document Verification & Confirm */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>ขั้นตอนที่ 4: ตรวจสอบเอกสาร & ยืนยันการสมัคร</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ตรวจสอบข้อมูลการสมัครก่อนส่งเพื่อรับการอนุมัติเข้าระบบ
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-emerald-950 block">บัตรประชาชน</span>
                      <span className="text-[10px] text-emerald-700">อัปโหลดเรียบร้อย (ตรวจจับ OCR ผ่าน)</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-emerald-950 block">ใบขับขี่</span>
                      <span className="text-[10px] text-emerald-700">ยังไม่หมดอายุ (ตรวจจับ OCR ผ่าน)</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-emerald-950 block">ภาพยานพาหนะ</span>
                      <span className="text-[10px] text-emerald-700">ป้ายทะเบียนตรงกับเอกสาร</span>
                    </div>
                  </div>
                </div>

                {/* Summary Box */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
                  <div className="font-bold text-slate-800 border-b border-slate-200 pb-1.5">
                    สรุปข้อมูลการสมัครพนักงานจัดส่ง
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                    <div>ผู้สมัคร: <strong className="text-slate-900">{formData.fullName || '-'}</strong></div>
                    <div>เบอร์โทร: <strong className="text-slate-900">{formData.phone || '-'}</strong></div>
                    <div>ยานพาหนะ: <strong className="text-slate-900">{formData.vehicleBrandModel} ({formData.licensePlate})</strong></div>
                    <div>โซนวิ่งงาน: <strong className="text-slate-900">{formData.preferredZone}</strong></div>
                    <div className="sm:col-span-2">บัญชีรับเงิน: <strong className="text-slate-900">{formData.bankName} เลขที่ {formData.bankAccountNumber} (พร้อมเพย์: {formData.promptPayId})</strong></div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">ระบบอนุมัติอัตโนมัติ (Instant Verification):</span> เมื่อกดส่งใบสมัคร ระบบจะอนุมัติและเข้าสู่คิวรับออเดอร์ในโซนที่เลือกทันที พร้อมทดสอบระบบจ่ายเงินและระบบคิว
                  </div>
                </div>
              </div>
            )}

            {/* Navigation & Submit Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {currentStep > 1 ? (
                <button
                  type="button"
                  id="rider-reg-prev-step-btn"
                  onClick={handlePrevStep}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  ย้อนกลับ
                </button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  id="rider-reg-next-step-btn"
                  onClick={handleNextStep}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>ถัดไป</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  id="rider-reg-submit-btn"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>ยืนยันการสมัคร & เริ่มต้นรับงานทันที 🛵</span>
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* DIRECTORY VIEW */}
      {activeSubView === 'directory' && (
        <div className="space-y-4">
          {/* Header & Filter */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                รายชื่อผู้สมัครพนักงานจัดส่ง ({riderApplications.length} คน)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                จัดการและตรวจสอบสถานะการอนุมัติพนักงานจัดส่งเดลิเวอรี
              </p>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: 'all', label: 'ทั้งหมด' },
                { id: 'approved', label: 'อนุมัติแล้ว' },
                { id: 'pending_review', label: 'รอตรวจสอบ' },
                { id: 'additional_docs_needed', label: 'ขอเอกสารเพิ่ม' },
              ].map(f => (
                <button
                  key={f.id}
                  id={`filter-app-status-${f.id}-btn`}
                  onClick={() => setFilterStatus(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    filterStatus === f.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* List of Applications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredApps.map(app => (
              <div 
                key={app.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-lg font-bold text-slate-700">
                      {app.vehicleType === 'motorcycle' ? '🛵' : app.vehicleType === 'electric_bike' ? '⚡' : app.vehicleType === 'car' ? '🚗' : '🚲'}
                    </div>
                    <div>
                      <h5 className="text-xs font-extrabold text-slate-900">{app.fullName}</h5>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{app.phone}</span>
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                    app.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : app.status === 'pending_review'
                      ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {app.status === 'approved' ? '✓ อนุมัติแล้ว' : app.status === 'pending_review' ? '⏳ รอตรวจสอบ' : '⚠️ ขอเอกสารเพิ่ม'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block">ยานพาหนะ</span>
                    <span className="font-semibold text-slate-800">{app.vehicleBrandModel} ({app.licensePlate})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">โซนประจำ</span>
                    <span className="font-semibold text-slate-800 truncate block">{app.preferredZone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">ใบขับขี่</span>
                    <span className="font-semibold text-slate-800">{app.driverLicenseNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">พร้อมเพย์รับเงิน</span>
                    <span className="font-semibold text-slate-800">{app.promptPayId}</span>
                  </div>
                </div>

                {app.rejectionReason && (
                  <div className="text-[11px] text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200">
                    <strong>หมายเหตุ:</strong> {app.rejectionReason}
                  </div>
                )}

                {/* Quick actions for reviewer / switching active rider */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400">
                    ยื่นเมื่อ: {app.submittedAt}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {app.status !== 'approved' && (
                      <button
                        id={`approve-rider-app-${app.id}-btn`}
                        onClick={() => updateApplicationStatus(app.id, 'approved')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
                      >
                        อนุมัติผู้สมัคร
                      </button>
                    )}

                    {app.status === 'approved' && (
                      <button
                        id={`activate-rider-profile-${app.id}-btn`}
                        onClick={() => {
                          setActiveRider(prev => ({
                            ...prev,
                            id: `rd_${app.id}`,
                            name: app.fullName,
                            phone: app.phone,
                            vehicle: `${app.vehicleBrandModel} (${app.licensePlate})`,
                            licensePlate: app.licensePlate,
                            vehicleType: app.vehicleType,
                            preferredZone: app.preferredZone,
                            bankAccount: {
                              bankName: app.bankName,
                              accountNumber: app.bankAccountNumber,
                              accountName: app.fullName,
                              promptPayId: app.promptPayId,
                            },
                          }));
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 text-[11px] font-semibold cursor-pointer transition-colors"
                      >
                        สลับใช้งานโปรไฟล์นี้
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
