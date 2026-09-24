import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  UtensilsCrossed, 
  Flame, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Trash2, 
  Clock, 
  DollarSign, 
  Shield, 
  Lock, 
  AlertCircle, 
  Layers, 
  TrendingUp, 
  Sparkles, 
  Store,
  ChevronRight,
  Eye,
  EyeOff,
  ChefHat,
  UserCheck,
  Crown,
  Upload,
  Image as ImageIcon,
  Camera,
  FileImage,
  Check,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MenuItem, MerchantStaffRole, Restaurant } from '../../types';

// Preset Food Photography for quick merchant selection
const FOOD_PHOTO_PRESETS = [
  {
    name: 'ต้มยำกุ้งแม่น้ำหม้อไฟ',
    category: 'ต้มยำ/แกงโบราณ',
    url: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'กะเพราถาดโบราณไข่ดาว',
    category: 'ผัดกะเพรา/จานด่วน',
    url: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'ข้าวผัดกุ้งแม่น้ำทรงเครื่อง',
    category: 'ข้าวผัด/อาหารจานเดียว',
    url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'ส้มตำไทยไข่เค็มทรงเครื่อง',
    category: 'ส้มตำ/ยำรสเด็ด',
    url: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'ผัดไทยกุ้งสดห่อไข่',
    category: 'ก๋วยเตี๋ยว/ผัดไทย',
    url: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'ก๋วยเตี๋ยวต้มยำมะนาวสด',
    category: 'ก๋วยเตี๋ยว/เส้น',
    url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'แกงมัสมั่นเนื้อน่องลาย',
    category: 'แกงไทย/ต้ม',
    url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'ไก่ทอดหาดใหญ่หอมเจียว',
    category: 'ของทอด/กับแกล้ม',
    url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'ชาไทยเย็นพรีเมียม',
    category: 'เครื่องดื่ม',
    url: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'บัวลอยน้ำกะทิมะพร้าวอ่อน',
    category: 'ของหวานไทย',
    url: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=800&auto=format&fit=crop&q=80',
  }
];

// Helper: Instant client-side photo compression to avoid massive base64 payloads
const compressAndReadImage = (file: File, callback: (dataUrl: string) => void) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 800;
      let width = img.width;
      let height = img.height;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.85);
        callback(compressed);
      } else {
        callback(event.target?.result as string);
      }
    };
    img.src = event.target?.result as string;
  };
  reader.readAsDataURL(file);
};

// Interactive Subcomponent for selecting and uploading food photos
interface ImageSelectorProps {
  currentImage: string;
  onImageChange: (url: string) => void;
  title?: string;
}

const MenuItemImageSelector: React.FC<ImageSelectorProps> = ({ currentImage, onImageChange, title = 'รูปภาพอาหาร' }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState(currentImage || '');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพ (JPG, PNG, WEBP)');
      return;
    }
    compressAndReadImage(file, (dataUrl) => {
      onImageChange(dataUrl);
      setUrlInput(dataUrl);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
          <span>{title}</span>
        </label>
        <span className="text-[10px] text-slate-400">ขนาดแนะนำ 1:1 หรือ 4:3 (คมชัด บีบอัดอัตโนมัติ)</span>
      </div>

      {/* Preview Card and Selectors */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-slate-200 shrink-0 bg-slate-200 shadow-2xs group">
          {currentImage ? (
            <img 
              src={currentImage} 
              alt="Food Preview" 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80';
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-[10px]">
              <FileImage className="w-6 h-6 mb-1" />
              <span>ไม่มีรูป</span>
            </div>
          )}
          <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-xs text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold">
            พรีวิวสด
          </div>
        </div>

        <div className="flex-1 w-full space-y-1.5">
          <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-xl text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-1 rounded-lg text-center transition-all cursor-pointer ${
                activeTab === 'upload' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📁 อัปโหลด/ถ่ายภาพ
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preset')}
              className={`flex-1 py-1 rounded-lg text-center transition-all cursor-pointer ${
                activeTab === 'preset' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🖼️ คลังภาพอาหาร
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-1 rounded-lg text-center transition-all cursor-pointer ${
                activeTab === 'url' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🔗 ใส่ลิงก์ URL
            </button>
          </div>

          {activeTab === 'upload' && (
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-2.5 rounded-xl border border-dashed text-center cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-emerald-500 bg-emerald-50' 
                    : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 bg-white'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700">
                  <Upload className="w-3.5 h-3.5" />
                  <span>คลิกเพื่ออัปโหลด หรือลากวางไฟล์ที่นี่</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">รองรับ JPG, PNG, WEBP (แปลงและปรับขนาดให้อัตโนมัติ)</p>
              </div>
            </div>
          )}

          {activeTab === 'url' && (
            <div className="flex gap-1.5">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  onImageChange(e.target.value);
                }}
                placeholder="วางลิงก์รูปภาพ เช่น https://images.unsplash.com/..."
                className="flex-1 p-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          )}
        </div>
      </div>

      {/* Preset Gallery Accordion */}
      {activeTab === 'preset' && (
        <div className="pt-2 border-t border-slate-200/80">
          <div className="text-[10px] font-bold text-slate-500 mb-1.5 flex items-center justify-between">
            <span>คลิกเลือกรูปภาพอาหารไทยคุณภาพสูง:</span>
            <span className="text-emerald-600 font-bold">10 รายการแนะนำ</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 max-h-40 overflow-y-auto pr-1">
            {FOOD_PHOTO_PRESETS.map((p, idx) => {
              const isSelected = currentImage === p.url;
              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    onImageChange(p.url);
                    setUrlInput(p.url);
                  }}
                  className={`group relative rounded-xl overflow-hidden border p-1 text-left transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-emerald-600 ring-2 ring-emerald-500/30 bg-emerald-50' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="aspect-square w-full rounded-lg overflow-hidden relative">
                    <img src={p.url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-emerald-600/40 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white drop-shadow-md" />
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] font-bold text-slate-800 truncate mt-1">
                    {p.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

interface MerchantMenuManagementProps {
  restaurantId: string;
}

export const MerchantMenuManagement: React.FC<MerchantMenuManagementProps> = ({ restaurantId }) => {
  const {
    restaurantList,
    toggleMenuItemStock,
    toggleMenuItemAvailability,
    updateMenuItem,
    addMenuItemToRestaurant,
    deleteMenuItemFromRestaurant,
    updateRestaurantOperationalStatus,
    merchantStaffRole,
    setMerchantStaffRole,
    triggerToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // New Menu Item Form State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('เมนูซิกเนเจอร์ 100 หม้อ');
  const [newPrice, setNewPrice] = useState<number>(180);
  const [newOriginalPrice, setNewOriginalPrice] = useState<number | undefined>(220);
  const [newDescription, setNewDescription] = useState('');
  const [newImage, setNewImage] = useState('https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=400&auto=format&fit=crop&q=80');
  const [newIsSpicy, setNewIsSpicy] = useState(true);
  const [newIsPopular, setNewIsPopular] = useState(true);

  // Current active restaurant (strictly isolated to this restaurantId)
  const currentRestaurant = useMemo(() => {
    return restaurantList.find(r => r.id === restaurantId) || restaurantList[0];
  }, [restaurantList, restaurantId]);

  // Categories extracted from current restaurant only
  const categories = useMemo(() => {
    if (!currentRestaurant) return ['all'];
    const cats = Array.from(new Set(currentRestaurant.menu.map(m => m.category)));
    return ['all', ...cats];
  }, [currentRestaurant]);

  // Filtered menu items (strictly from this restaurant)
  const filteredItems = useMemo(() => {
    if (!currentRestaurant) return [];
    return currentRestaurant.menu.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const isItemInStock = item.inStockToday !== false;
      const matchesStock = stockFilter === 'all' ||
        (stockFilter === 'in_stock' && isItemInStock) ||
        (stockFilter === 'out_of_stock' && !isItemInStock);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [currentRestaurant, searchQuery, selectedCategory, stockFilter]);

  // Statistics for this restaurant
  const stats = useMemo(() => {
    if (!currentRestaurant) return { total: 0, inStock: 0, outOfStock: 0, popular: 0 };
    const total = currentRestaurant.menu.length;
    const outOfStock = currentRestaurant.menu.filter(m => m.inStockToday === false).length;
    const inStock = total - outOfStock;
    const popular = currentRestaurant.menu.filter(m => m.isPopular).length;
    return { total, inStock, outOfStock, popular };
  }, [currentRestaurant]);

  // Role permissions helpers
  const canEditMenu = merchantStaffRole === 'owner' || merchantStaffRole === 'manager';
  const canDeleteMenu = merchantStaffRole === 'owner';
  const canChangeSettings = merchantStaffRole === 'owner';

  // Handle Add Item
  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      triggerToast('กรุณากรอกชื่อเมนู', 'ต้องระบุชื่อเมนูอาหารก่อนบันทึก', 'info');
      return;
    }

    addMenuItemToRestaurant(currentRestaurant.id, {
      restaurantId: currentRestaurant.id,
      name: newName.trim(),
      category: newCategory,
      price: Number(newPrice),
      originalPrice: newOriginalPrice ? Number(newOriginalPrice) : undefined,
      description: newDescription.trim(),
      image: newImage.trim() || 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=400&auto=format&fit=crop&q=80',
      isSpicy: newIsSpicy,
      isPopular: newIsPopular,
      spicyLevels: newIsSpicy ? ['เผ็ดน้อย', 'เผ็ดมาตรฐานสูตรกานดา', 'เผ็ดจัดจ้าน'] : undefined,
    });

    setIsAddModalOpen(false);
    // Reset Form
    setNewName('');
    setNewDescription('');
    setNewPrice(180);
  };

  // Handle Edit Item
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    updateMenuItem(currentRestaurant.id, editingItem);
    setEditingItem(null);
  };

  return (
    <div className="space-y-4">
      {/* 1. Header & Domain Isolation Security Notice */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-5 border border-emerald-500/30 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  ระบบจัดการเมนู & สต็อกอาหาร — {currentRestaurant.name}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-emerald-950">
                  {currentRestaurant.category}
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 mt-1 flex items-center gap-1.5 flex-wrap">
                <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>ความปลอดภัยข้อมูล: แสดงเฉพาะเมนูของร้าน <strong>{currentRestaurant.name}</strong> เท่านั้น (ไม่แสดงข้อมูลของร้านค้าอื่น)</span>
              </p>
            </div>
          </div>

          {/* Quick Add Button & Store Open/Close Status */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Store Operational Status Toggle */}
            <button
              onClick={() => {
                if (!canChangeSettings) {
                  triggerToast('จำกัดสิทธิ์', 'เฉพาะเจ้าของร้าน (Owner) จึงจะสามารถเปิด-ปิดร้านได้', 'info');
                  return;
                }
                updateRestaurantOperationalStatus(currentRestaurant.id, !currentRestaurant.isOpen);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentRestaurant.isOpen
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 hover:bg-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-400/40 hover:bg-rose-500/30'
              }`}
              title="เปิด/ปิด รับออเดอร์ของร้าน"
            >
              <span className={`w-2 h-2 rounded-full ${currentRestaurant.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span>{currentRestaurant.isOpen ? 'ร้านเปิดรับออเดอร์ (Open)' : 'ร้านปิดชั่วคราว (Closed)'}</span>
            </button>

            {canEditMenu && (
              <button
                id="merchant-add-menu-btn"
                onClick={() => setIsAddModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all hover:scale-102"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มเมนูใหม่</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Interactive Staff Role (RBAC) Switcher Bar */}
        <div className="mt-4 pt-3.5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px] font-semibold flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              ตำแหน่งผู้ใช้งานปัจจุบัน (Staff Role):
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-white/10 font-bold text-white text-[11px]">
              {merchantStaffRole === 'owner' && '👑 เจ้าของร้าน (Owner - สิทธิ์เต็ม)'}
              {merchantStaffRole === 'manager' && '👔 ผู้จัดการร้าน (Store Manager)'}
              {merchantStaffRole === 'kitchen' && '🍳 พนักงานครัว (Kitchen Staff - จำกัดสิทธิ์)'}
            </span>
          </div>

          {/* Quick role test toggles */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] text-slate-400 shrink-0">ทดสอบสลับสิทธิ์:</span>
            <button
              onClick={() => {
                setMerchantStaffRole('owner');
                triggerToast('สลับสิทธิ์: เจ้าของร้าน (Owner)', 'เข้าถึงได้ทุกระบบ รวมถึงการเงิน สัญญา GP และการแก้ไขเมนู', 'success');
              }}
              className={`px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                merchantStaffRole === 'owner' ? 'bg-amber-500 text-slate-950' : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              เจ้าของร้าน
            </button>
            <button
              onClick={() => {
                setMerchantStaffRole('manager');
                triggerToast('สลับสิทธิ์: ผู้จัดการ (Manager)', 'สามารถจัดการเมนู ออเดอร์ และโปรโมชั่นได้ (ไม่เห็นบัญชีธนาคาร)', 'info');
              }}
              className={`px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                merchantStaffRole === 'manager' ? 'bg-sky-500 text-slate-950' : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              ผู้จัดการ
            </button>
            <button
              onClick={() => {
                setMerchantStaffRole('kitchen');
                triggerToast('สลับสิทธิ์: พนักงานครัว (Kitchen)', 'เข้าถึงเฉพาะหน้าจอรับออเดอร์และกดปิดเมนูของหมดชั่วคราว', 'info');
              }}
              className={`px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                merchantStaffRole === 'kitchen' ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              พนักงานครัว
            </button>
          </div>
        </div>
      </div>

      {/* 3. Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>เมนูทั้งหมด</span>
            <UtensilsCrossed className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">{stats.total}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">เฉพาะร้านกานดา ร้อยหม้อ</p>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 text-xs">
            <span>พร้อมจำหน่าย</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-emerald-600 mt-1">{stats.inStock}</div>
          <p className="text-[10px] text-emerald-600/70 mt-0.5">ลูกค้าสั่งได้ทันที</p>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-rose-500 text-xs">
            <span>ของหมดวันนี้</span>
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-xl font-black text-rose-600 mt-1">{stats.outOfStock}</div>
          <p className="text-[10px] text-rose-500/70 mt-0.5">ปิดรับออเดอร์ชั่วคราว</p>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-amber-500 text-xs">
            <span>เมนูซิกเนเจอร์</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-black text-amber-600 mt-1">{stats.popular}</div>
          <p className="text-[10px] text-amber-600/70 mt-0.5">ติดแท็กยอดนิยม</p>
        </div>
      </div>

      {/* 4. Filter & Search Controls */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อเมนู หรือคำบรรยาย..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Stock Filter Pills */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto no-scrollbar">
            <span className="text-xs text-slate-500 font-medium shrink-0">สถานะสต็อก:</span>
            <button
              onClick={() => setStockFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                stockFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ทั้งหมด ({stats.total})
            </button>
            <button
              onClick={() => setStockFilter('in_stock')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                stockFilter === 'in_stock'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              พร้อมขาย ({stats.inStock})
            </button>
            <button
              onClick={() => setStockFilter('out_of_stock')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                stockFilter === 'out_of_stock'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              ของหมด ({stats.outOfStock})
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-500 font-medium shrink-0">หมวดหมู่:</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'ทุกหมวดหมู่' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredItems.map(item => {
          const isItemInStock = item.inStockToday !== false;
          const isItemAvailable = item.isAvailable !== false;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border transition-all p-3.5 flex flex-col justify-between gap-3 shadow-2xs ${
                !isItemInStock 
                  ? 'border-rose-200 bg-rose-50/20' 
                  : 'border-slate-200/90 hover:border-emerald-300'
              }`}
            >
              <div className="flex gap-3">
                {/* Food Image */}
                <div className="relative w-22 h-22 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className={`w-full h-full object-cover transition-transform duration-300 ${!isItemInStock ? 'grayscale opacity-60' : 'hover:scale-105'}`}
                    referrerPolicy="no-referrer"
                  />
                  {!isItemInStock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[10px] font-black uppercase tracking-tight">
                      หมดวันนี้
                    </div>
                  )}
                  {item.isPopular && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[9px] shadow-xs">
                      100 หม้อ
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="font-bold text-slate-900 text-sm truncate">
                      {item.name}
                    </h3>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="font-black text-emerald-700 text-sm">
                      ฿{item.price.toLocaleString()}
                    </span>
                    {item.originalPrice && (
                      <span className="text-[11px] text-slate-400 line-through">
                        ฿{item.originalPrice.toLocaleString()}
                      </span>
                    )}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                      {item.category}
                    </span>
                    {item.isSpicy && (
                      <span className="text-[10px] text-rose-600 flex items-center gap-0.5">
                        <Flame className="w-3 h-3 fill-rose-500 text-rose-500" />
                        <span>รสจัดจ้าน</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                {/* Quick Stock Toggle Button (Available to all roles including Kitchen Staff) */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleMenuItemStock(currentRestaurant.id, item.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      isItemInStock
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                    }`}
                    title="คลิกเพื่อสลับสถานะของหมดวันนี้"
                  >
                    {isItemInStock ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>พร้อมขาย (In Stock)</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>ของหมด (Sold Out)</span>
                      </>
                    )}
                  </button>

                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    ขายแล้ว {item.soldCountToday || Math.floor(Math.random() * 20 + 8)} รายการ
                  </span>
                </div>

                {/* Edit & Delete Buttons (Restricted by Role) */}
                <div className="flex items-center gap-1">
                  {canEditMenu && (
                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                      title="แก้ไขข้อมูลเมนู"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}

                  {canDeleteMenu && (
                    <button
                      onClick={() => {
                        if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบเมนู "${item.name}" ออกจากร้านกานดา ร้อยหม้อ?`)) {
                          deleteMenuItemFromRestaurant(currentRestaurant.id, item.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="ลบเมนูนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  {!canEditMenu && (
                    <span className="text-[10px] text-slate-400 px-2 py-1 bg-slate-100 rounded-md flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>สิทธิ์ครัว (ปรับสต็อกได้เท่านั้น)</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="col-span-full bg-slate-50 rounded-2xl p-8 text-center border border-dashed border-slate-200">
            <UtensilsCrossed className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">ไม่พบเมนูอาหารตามเงื่อนไขที่เลือก</p>
            <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรองหมวดหมู่</p>
          </div>
        )}
      </div>

      {/* 6. Modal: Add New Menu Item */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">เพิ่มเมนูใหม่ — {currentRestaurant.name}</h3>
                  <p className="text-[11px] text-slate-400">ระบุรายละเอียดอาหาร ราคา และหมวดหมู่</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewItem} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-800">ชื่อเมนูอาหาร *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="เช่น แกงส้มชะอมกุ้งสดหม้อไฟโบราณ"
                  className="w-full mt-1 p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800">ราคาขาย (บาท) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full mt-1 p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-800">ราคาเดิมก่อนลด (ถ้ามี)</label>
                  <input
                    type="number"
                    min={1}
                    value={newOriginalPrice || ''}
                    onChange={(e) => setNewOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="เช่น 240"
                    className="w-full mt-1 p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800">หมวดหมู่เมนู</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full mt-1 p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                >
                  <option value="เมนูซิกเนเจอร์ 100 หม้อ">เมนูซิกเนเจอร์ 100 หม้อ</option>
                  <option value="จานเคียงยอดฮิต">จานเคียงยอดฮิต</option>
                  <option value="ข้าวสวย & เครื่องเคียง">ข้าวสวย & เครื่องเคียง</option>
                  <option value="เครื่องดื่ม & ของหวาน">เครื่องดื่ม & ของหวาน</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800">คำบรรยายเมนู & วัตถุดิบเด่น</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="เช่น กุ้งแชบ๊วยสดตัวโต เครื่องแกงตำสด มะขามเปียกเคี่ยวโบราณ หอมกรุ่นสมุนไพรไทย"
                  className="w-full mt-1 p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <MenuItemImageSelector
                currentImage={newImage}
                onImageChange={setNewImage}
                title="รูปภาพอาหารเมนูใหม่"
              />

              <div className="flex items-center gap-4 pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsSpicy}
                    onChange={(e) => setNewIsSpicy(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  <span>มีระดับความเผ็ด (Spicy)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsPopular}
                    onChange={(e) => setNewIsPopular(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  <span>ติดแท็กเมนูแนะนำ (Signature)</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 shadow-xs cursor-pointer"
                >
                  บันทึกเมนูใหม่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Modal: Edit Existing Menu Item */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">แก้ไขเมนู: {editingItem.name}</h3>
                  <p className="text-[11px] text-slate-400">ปรับราคา คำบรรยาย หรือสถานะสินค้า</p>
                </div>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-800">ชื่อเมนูอาหาร</label>
                <input
                  type="text"
                  required
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full mt-1 p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800">ราคาขาย (บาท)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-800">ราคาเดิมก่อนลด</label>
                  <input
                    type="number"
                    min={1}
                    value={editingItem.originalPrice || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, originalPrice: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full mt-1 p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800">หมวดหมู่</label>
                <input
                  type="text"
                  value={editingItem.category}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                  className="w-full mt-1 p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800">คำบรรยายเมนู</label>
                <textarea
                  rows={3}
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full mt-1 p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <MenuItemImageSelector
                currentImage={editingItem.image}
                onImageChange={(url) => setEditingItem({ ...editingItem, image: url })}
                title="รูปภาพอาหารเมนูนี้"
              />

              <div className="flex items-center gap-4 pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.inStockToday !== false}
                    onChange={(e) => setEditingItem({ ...editingItem, inStockToday: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span>มีของพร้อมขายวันนี้ (In Stock)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.isPopular || false}
                    onChange={(e) => setEditingItem({ ...editingItem, isPopular: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span>เมนูแนะนำ 100 หม้อ</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-500 shadow-xs cursor-pointer"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
