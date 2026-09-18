import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Plus, Check, ShoppingCart, Sparkles, Search } from 'lucide-react';

interface SupermarketModalProps {
  onClose: () => void;
}

interface SuperItem {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  image: string;
}

const SUPERMARKET_ITEMS: SuperItem[] = [
  {
    id: 'mart-1',
    name: 'นมสดเมจิ พาสเจอร์ไรส์ 830 มล.',
    category: 'นม & เครื่องดื่ม',
    price: 49,
    unit: 'ขวด',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'mart-2',
    name: 'ไข่ไก่สดอนามัย เบอร์ 2 (แพ็ก 10 ฟอง)',
    category: 'ของสด & ไข่ไก่',
    price: 58,
    unit: 'แพ็ก',
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'mart-3',
    name: 'กล้วยหอมทองเกรดเอ (หวี)',
    category: 'ผัก & ผลไม้',
    price: 45,
    unit: 'หวี',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'mart-4',
    name: 'ขนมปังฟาร์มเฮ้าส์ รอยัล 12 แผ่น',
    category: 'เบเกอรี่ & ขนมปัง',
    price: 38,
    unit: 'แถว',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'mart-5',
    name: 'น้ำดื่มคริสตัล 1,500 มล. (แพ็ก 6 ขวด)',
    category: 'นม & เครื่องดื่ม',
    price: 55,
    unit: 'แพ็ก',
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'mart-6',
    name: 'ข้าวหอมมะลิแท้ 100% ตราฉัตร (5 กก.)',
    category: 'ของแห้ง & ข้าวสาร',
    price: 215,
    unit: 'ถุง',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&auto=format&fit=crop&q=80',
  },
];

export const SupermarketModal: React.FC<SupermarketModalProps> = ({ onClose }) => {
  const { triggerToast, addToCart } = useApp();
  const [selectedCat, setSelectedCat] = useState('ทั้งหมด');
  const [addedItems, setAddedItems] = useState<Record<string, number>>({});

  const categories = ['ทั้งหมด', 'ของสด & ไข่ไก่', 'นม & เครื่องดื่ม', 'ผัก & ผลไม้', 'เบเกอรี่ & ขนมปัง'];

  const filteredItems = selectedCat === 'ทั้งหมด'
    ? SUPERMARKET_ITEMS
    : SUPERMARKET_ITEMS.filter(i => i.category === selectedCat);

  const handleAddItem = (item: SuperItem) => {
    setAddedItems(prev => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1,
    }));
    triggerToast('เพิ่มสินค้าซูเปอร์มาร์เก็ตแล้ว 🛒', `${item.name} บันทึกลงตะกร้า`, 'reward');
  };

  const totalSelected = Object.values(addedItems).reduce((sum: number, n: number) => sum + n, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col animate-in slide-in-from-bottom-6 duration-200 text-slate-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00BA76] to-[#009E60] p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">
              🛒
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">สั่งของซูเปอร์ (LINE MAN Mart)</h2>
              <p className="text-xs text-white/80">ของสด ของใช้ในบ้าน ซูเปอร์มาร์เก็ต ส่งไวใน 25 นาที</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-1.5 p-3 overflow-x-auto no-scrollbar border-b border-slate-100 bg-slate-50/70">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCat === cat
                  ? 'bg-[#00BA76] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="p-4 overflow-y-auto grid grid-cols-2 gap-3 flex-1 no-scrollbar">
          {filteredItems.map(item => {
            const count = addedItems[item.id] || 0;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-2.5 flex flex-col justify-between hover:border-emerald-300 hover:shadow-xs transition-all"
              >
                <div>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-28 object-cover rounded-xl mb-2"
                    referrerPolicy="no-referrer"
                  />
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-2">{item.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.category}</p>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                  <span className="text-sm font-black text-slate-900">
                    ฿{item.price} <span className="text-[10px] font-normal text-slate-400">/{item.unit}</span>
                  </span>
                  <button
                    onClick={() => handleAddItem(item)}
                    className="w-7 h-7 rounded-lg bg-[#00BA76] hover:bg-[#009E60] text-white flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs">
            <span className="text-slate-500">เลือกแล้ว: </span>
            <span className="font-bold text-slate-900">{totalSelected} รายการ</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#00BA76] hover:bg-[#009E60] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            ยืนยันการเลือกสินค้า
          </button>
        </div>
      </div>
    </div>
  );
};
