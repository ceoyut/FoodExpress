import { recordCloudPayment, updateCloudOrderStatus } from '../lib/firebase';

/**
 * EMVCo PromptPay QR Generator (Thai Standard)
 * Generates valid EMVCo QR string for Thai PromptPay with exact THB amount and CRC-16 checksum
 */
export function generatePromptPayPayload(targetId: string, amount: number): string {
  // Clean target ID (phone number or Tax ID)
  let cleanId = targetId.replace(/[^0-9]/g, '');
  let promptPaySubtag = '';

  if (cleanId.length === 10 && cleanId.startsWith('0')) {
    // Mobile number: prefix with 0066 and omit leading 0
    const formattedPhone = `0066${cleanId.substring(1)}`;
    promptPaySubtag = `01${formattedPhone.length.toString().padStart(2, '0')}${formattedPhone}`;
  } else if (cleanId.length === 13) {
    // 13-digit National ID or Tax ID
    promptPaySubtag = `02${cleanId.length.toString().padStart(2, '0')}${cleanId}`;
  } else {
    // Default FoodExpress Tax ID
    const defaultTaxId = '0105566023456';
    promptPaySubtag = `02${defaultTaxId.length.toString().padStart(2, '0')}${defaultTaxId}`;
  }

  // Merchant Account Info (Tag 29 for PromptPay)
  const aid = 'A000000677010111';
  const tag29Value = `00${aid.length.toString().padStart(2, '0')}${aid}${promptPaySubtag}`;
  const tag29 = `29${tag29Value.length.toString().padStart(2, '0')}${tag29Value}`;

  // Currency (764 = THB)
  const currencyTag = '5303764';

  // Amount formatting (Tag 54)
  const amountStr = amount.toFixed(2);
  const amountTag = `54${amountStr.length.toString().padStart(2, '0')}${amountStr}`;

  // Country Code (Tag 58 = TH)
  const countryTag = '5802TH';

  // Point of Initiation Method: 12 = Dynamic (QR has specific amount), 11 = Static
  const poiTag = '010212';
  const formatTag = '000201';

  const rawWithoutCrc = `${formatTag}${poiTag}${tag29}${currencyTag}${amountTag}${countryTag}6304`;

  // Calculate CRC-16 (CCITT-FALSE)
  const crcHex = calculateCrc16(rawWithoutCrc);
  return `${rawWithoutCrc}${crcHex}`;
}

function calculateCrc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= (data.charCodeAt(i) << 8);
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export interface PaymentIntentResponse {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  channel: 'promptpay_qr' | 'credit_card' | 'wallet' | 'cash';
  qrPayload?: string;
  qrImageUrl?: string;
  chargeRef: string;
  merchantName: string;
  status: 'pending' | 'success' | 'failed';
  expiresAt: number; // Unix timestamp
}

/**
 * Initialize a Payment Session with Payment Gateway
 */
export async function createPaymentIntent(params: {
  orderId: string;
  amount: number;
  channel: 'promptpay_qr' | 'credit_card' | 'wallet' | 'cash';
  merchantName: string;
}): Promise<PaymentIntentResponse> {
  const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const chargeRef = `TH-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(100000 + Math.random() * 900000)}`;

  let qrPayload: string | undefined;
  let qrImageUrl: string | undefined;

  if (params.channel === 'promptpay_qr') {
    // Generate valid PromptPay EMVCo string
    qrPayload = generatePromptPayPayload('0105566023456', params.amount);
    // Create reliable QR render URL using Google Charts QR API or encoded SVG
    qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(qrPayload)}`;
  }

  const response: PaymentIntentResponse = {
    paymentId,
    orderId: params.orderId,
    amount: params.amount,
    currency: 'THB',
    channel: params.channel,
    qrPayload,
    qrImageUrl,
    chargeRef,
    merchantName: params.merchantName,
    status: params.channel === 'cash' ? 'pending' : (params.channel === 'wallet' ? 'success' : 'pending'),
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes expiry
  };

  // Record into Cloud Firestore
  await recordCloudPayment({
    id: paymentId,
    orderId: params.orderId,
    amount: params.amount,
    currency: 'THB',
    channel: params.channel,
    status: response.status,
    chargeRef,
    qrPayload,
    merchantName: params.merchantName,
  });

  return response;
}

/**
 * Verify / Settle Payment (Simulates Gateway Webhook Callback)
 */
export async function confirmPaymentTransaction(
  paymentId: string, 
  orderId: string
): Promise<{ success: boolean; transactionRef: string; message: string }> {
  const transactionRef = `TXN-APP-${Date.now().toString().slice(-6)}`;

  // Update order in Firebase Firestore
  await updateCloudOrderStatus(orderId, {
    paymentStatus: 'paid',
    orderStatus: 'kitchen_prep',
    transactionRef,
    paidAt: new Date().toISOString(),
  });

  return {
    success: true,
    transactionRef,
    message: 'ชำระเงินสำเร็จ บันทึกลง Cloud Firestore เรียบร้อยแล้ว',
  };
}
