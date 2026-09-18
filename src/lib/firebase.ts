import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  where
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with configured databaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
export const auth = getAuth(app);

// Collection References
export const ordersCollection = collection(db, 'orders');
export const paymentsCollection = collection(db, 'payments');
export const settlementsCollection = collection(db, 'settlements');

export interface CloudOrderRecord {
  id: string;
  restaurantId: string;
  restaurantName: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  itemsSummary: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    options?: string[];
  }>;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tip: number;
  totalAmount: number;
  paymentMethod: 'promptpay_qr' | 'credit_card' | 'wallet' | 'cash';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending_payment' | 'kitchen_prep' | 'rider_pickup' | 'delivering' | 'completed' | 'cancelled';
  transactionRef: string;
  paymentChargeId?: string;
  riderId?: string;
  riderName?: string;
  createdAt: any;
  paidAt?: any;
  completedAt?: any;
}

export interface CloudPaymentRecord {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  channel: 'promptpay_qr' | 'credit_card' | 'wallet' | 'cash';
  status: 'pending' | 'success' | 'failed';
  chargeRef: string;
  qrPayload?: string;
  merchantName: string;
  createdAt: any;
  paidAt?: any;
}

/**
 * Save new customer order into Cloud Firestore
 */
export async function createCloudOrder(order: Omit<CloudOrderRecord, 'createdAt'>): Promise<string> {
  try {
    const orderDocRef = doc(db, 'orders', order.id);
    await setDoc(orderDocRef, {
      ...order,
      createdAt: serverTimestamp(),
    });
    return order.id;
  } catch (error) {
    console.warn('Firebase order creation warning (fallback to local state):', error);
    return order.id;
  }
}

/**
 * Update order status in Cloud Firestore
 */
export async function updateCloudOrderStatus(
  orderId: string, 
  updates: Partial<CloudOrderRecord>
): Promise<void> {
  try {
    const orderDocRef = doc(db, 'orders', orderId);
    await updateDoc(orderDocRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn('Firebase order update warning:', error);
  }
}

/**
 * Record Payment Transaction in Cloud Firestore
 */
export async function recordCloudPayment(payment: Omit<CloudPaymentRecord, 'createdAt'>): Promise<string> {
  try {
    const paymentDocRef = doc(db, 'payments', payment.id);
    await setDoc(paymentDocRef, {
      ...payment,
      createdAt: serverTimestamp(),
    });
    return payment.id;
  } catch (error) {
    console.warn('Firebase payment creation warning:', error);
    return payment.id;
  }
}

/**
 * Real-time listener for orders
 */
export function subscribeToOrders(
  onOrdersUpdated: (orders: CloudOrderRecord[]) => void
) {
  try {
    const q = query(ordersCollection, orderBy('createdAt', 'desc'), limit(50));
    return onSnapshot(q, (snapshot) => {
      const orders: CloudOrderRecord[] = [];
      snapshot.forEach((docSnap) => {
        orders.push({ id: docSnap.id, ...docSnap.data() } as CloudOrderRecord);
      });
      onOrdersUpdated(orders);
    }, (error) => {
      console.warn('Orders subscription warning:', error);
    });
  } catch (e) {
    console.warn('Failed to attach orders subscription:', e);
    return () => {};
  }
}
