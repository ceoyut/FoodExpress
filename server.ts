import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// In-memory payment registry for fast backend lookup & webhook simulation
const paymentStore = new Map<string, {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  channel: string;
  status: 'pending' | 'success' | 'failed';
  chargeRef: string;
  createdAt: string;
}>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ==========================================
  // BACKEND API ROUTES
  // ==========================================

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      services: {
        database: "Firebase Cloud Firestore",
        paymentGateway: "FoodExpress PromptPay & Card Engine",
        environment: process.env.NODE_ENV || "development"
      }
    });
  });

  // Payment Gateway Configuration
  app.get("/api/config/payment", (_req, res) => {
    res.json({
      gatewayName: "FoodExpress Pay Gateway",
      supportedChannels: ["promptpay_qr", "credit_card", "wallet", "cash"],
      currency: "THB",
      promptpayBillerId: "0105566023456",
      sandboxMode: false,
      pciDssCompliant: true
    });
  });

  // Create Payment Intent
  app.post("/api/payment/create-intent", (req, res) => {
    const { orderId, amount, channel, merchantName } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ error: "Missing required fields: orderId or amount" });
    }

    const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const chargeRef = `TH-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(100000 + Math.random() * 900000)}`;

    const paymentRecord = {
      paymentId,
      orderId,
      amount: Number(amount),
      currency: "THB",
      channel: channel || "promptpay_qr",
      status: channel === "cash" ? "pending" as const : (channel === "wallet" ? "success" as const : "pending" as const),
      chargeRef,
      merchantName: merchantName || "FoodExpress Partner",
      createdAt: new Date().toISOString()
    };

    paymentStore.set(paymentId, paymentRecord);

    return res.json({
      success: true,
      ...paymentRecord,
      expiresAt: Date.now() + 5 * 60 * 1000
    });
  });

  // Check Payment Status
  app.get("/api/payment/status/:paymentId", (req, res) => {
    const { paymentId } = req.params;
    const payment = paymentStore.get(paymentId);

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    return res.json({
      success: true,
      payment
    });
  });

  // Payment Webhook (Handles external banking callbacks)
  app.post("/api/payment/webhook", (req, res) => {
    const { paymentId, event, transactionRef } = req.body;
    const payment = paymentStore.get(paymentId);

    if (payment) {
      payment.status = event === "charge.failed" ? "failed" : "success";
      paymentStore.set(paymentId, payment);
    }

    return res.json({
      received: true,
      transactionRef: transactionRef || `TXN-WH-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString()
    });
  });

  // ==========================================
  // VITE MIDDLEWARE / PRODUCTION STATIC SERVING
  // ==========================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FoodExpress Backend Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
