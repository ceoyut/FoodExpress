import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Wallet, X, QrCode, CreditCard, Check, Sparkles } from 'lucide-react';

interface WalletTopUpModalProps {
  onClose: () => void;
}

export const WalletTopUpModal: React.FC<WalletTopUpModalProps> = ({ onClose }) => {
  const { user, topUpWallet } = useApp();
  const [amount, setAmount] = useState<number>(300);
  const [method, setMethod] = useState<'promptpay' | 'card'>('promptpay');
  const [isProcessing, setIsProcessing] = useState(false);

  const presetAmounts = [100, 300, 500, 1000];

  const handleTopUp = async () => {
    if (amount <= 0) return;
    setIsProcessing(true);

    // Simulate gateway delay
    await new Promise(r => setTimeout(r, 800));
    topUpWallet(amount);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-5 text-slate-800">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-150 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">เติมเงิน FoodExpress Wallet</h3>
              <p className="text-[11px] text-slate-500">
                ยอดคงเหลือปัจจุบัน: ฿{user.walletBalance.toLocaleString()}
              </p>
            </div>
          </div>

          <button
            id="close-topup-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/80 text-slate-700 flex items-center justify-center hover:bg-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Preset Amounts Grid */}
          <div className="space-y-2">
            <label className="font-bold text-slate-900 text-xs block">
              เลือกจำนวนเงินที่ต้องการเติม
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presetAmounts.map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`py-3 rounded-xl font-bold text-xs border transition-all ${
                    amount === val
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-xs ring-1 ring-emerald-500'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  ฿{val.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Custom amount input */}
          <div className="space-y-1">
            <span className="text-[11px] text-slate-500 font-medium">หรือระบุจำนวนเงินเอง (บาท)</span>
            <input
              type="number"
              min={20}
              max={10000}
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Payment Method for Top-Up */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="font-bold text-slate-900 text-xs block">
              ช่องทางการชำระเงิน
            </label>
            
            <div className="space-y-2">
              <label
                onClick={() => setMethod('promptpay')}
                className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  method === 'promptpay'
                    ? 'border-emerald-500 bg-emerald-50/60 shadow-xs'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">PromptPay QR Code</div>
                    <div className="text-[10px] text-slate-500">ฟรีค่าธรรมเนียม เติมเข้าทันที</div>
                  </div>
                </div>
                {method === 'promptpay' && <Check className="w-4 h-4 text-emerald-600" />}
              </label>

              <label
                onClick={() => setMethod('card')}
                className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  method === 'card'
                    ? 'border-emerald-500 bg-emerald-50/60 shadow-xs'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">บัตรเครดิต / เดบิต</div>
                    <div className="text-[10px] text-slate-500">Visa / Mastercard / JCB</div>
                  </div>
                </div>
                {method === 'card' && <Check className="w-4 h-4 text-emerald-600" />}
              </label>
            </div>
          </div>

          {/* Balance Preview */}
          <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex justify-between items-center text-xs">
            <span className="text-emerald-900 font-medium">ยอดเงินหลังเติมเสร็จสิ้น:</span>
            <span className="font-black text-sm text-emerald-800">
              ฿{(user.walletBalance + amount).toLocaleString()}
            </span>
          </div>

          {/* Action Button */}
          <button
            id="confirm-topup-submit-btn"
            disabled={isProcessing || amount <= 0}
            onClick={handleTopUp}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>ยืนยันเติมเงิน ฿{amount.toLocaleString()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
