import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Star, X, Sparkles, Check, ThumbsUp, Camera } from 'lucide-react';

export const ReviewModal: React.FC = () => {
  const { 
    isReviewModalOpen, 
    setIsReviewModalOpen, 
    reviewingOrder, 
    selectedRestaurant, 
    addReview,
    triggerToast
  } = useApp();

  const [rating, setRating] = useState(5);
  const [foodRating, setFoodRating] = useState(5);
  const [riderRating, setRiderRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['อาหารอร่อย', 'ส่งไวมาก']);

  if (!isReviewModalOpen) return null;

  const targetRestaurantId = reviewingOrder?.restaurantId || selectedRestaurant?.id || 'rest_1';
  const targetRestaurantName = reviewingOrder?.restaurantName || selectedRestaurant?.name || 'ร้านอาหาร';

  const availableTags = [
    'อาหารอร่อย',
    'ส่งไวมาก',
    'แพ็คมาดีเยี่ยม',
    'รสชาติต้นตำรับ',
    'คุ้มค่าคุ้มราคา',
    'ปริมาณเยอะอิ่มจุก',
    'ไรเดอร์สุภาพมาก',
    'อาหารยังร้อนอยู่',
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanComment = (comment || '').trim();
    if (!cleanComment) {
      triggerToast('กรุณากรอกความคิดเห็น', 'พิมพ์ความเห็นสั้นๆ เพื่อให้คะแนนร้านค้านะครับ', 'info');
      return;
    }
    addReview(
      targetRestaurantId,
      reviewingOrder?.id,
      rating,
      cleanComment,
      selectedTags,
      foodRating,
      riderRating
    );
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-5 text-slate-800">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-150 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-sm text-slate-900">เขียนรีวิวและให้คะแนน</h3>
            <p className="text-[11px] text-slate-500">{targetRestaurantName}</p>
          </div>
          <button
            id="close-review-modal-btn"
            onClick={() => setIsReviewModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-200/80 text-slate-700 flex items-center justify-center hover:bg-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Reward Points Banner */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-3 rounded-2xl flex items-center gap-2.5 text-amber-900">
            <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <div className="font-bold text-xs">รับทันที +15 คะแนนสะสมพิเศษ!</div>
              <p className="text-[10px] text-amber-700">รีวิวของคุณช่วยให้ผู้ใช้งานท่านอื่นตัดสินใจได้ดียิ่งขึ้น</p>
            </div>
          </div>

          {/* Main Star Rating */}
          <div className="text-center space-y-1.5 py-2">
            <span className="font-bold text-slate-900 text-sm block">ความพึงพอใจโดยรวม</span>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-amber-400 hover:scale-115 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${star <= rating ? 'fill-amber-400' : 'text-slate-200'}`}
                  />
                </button>
              ))}
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold">
              {rating === 5 ? 'ยอดเยี่ยม ประทับใจมาก ⭐⭐⭐⭐⭐' : rating >= 4 ? 'ดีมาก อร่อยถูกใจ' : 'พอใช้ได้'}
            </span>
          </div>

          {/* Sub Ratings */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <span className="font-semibold text-slate-700 text-[11px] block mb-1">รสชาติอาหาร</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star
                    key={s}
                    onClick={() => setFoodRating(s)}
                    className={`w-4 h-4 cursor-pointer ${s <= foodRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <span className="font-semibold text-slate-700 text-[11px] block mb-1">บริการของไรเดอร์</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star
                    key={s}
                    onClick={() => setRiderRating(s)}
                    className={`w-4 h-4 cursor-pointer ${s <= riderRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Tag Chips */}
          <div className="space-y-1.5">
            <span className="font-bold text-slate-800 text-xs block">แท็กจุดเด่นที่ประทับใจ</span>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map(tag => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment Textarea */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 text-xs block">
              แสดงความคิดเห็นเพิ่มเติม
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="บอกเล่าความอร่อย บรรจุภัณฑ์ หรือความประทับใจ..."
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <button
            id="submit-review-btn"
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 active:scale-[0.99] transition-all"
          >
            ส่งรีวิวและรับ 15 คะแนน
          </button>
        </form>
      </div>
    </div>
  );
};
