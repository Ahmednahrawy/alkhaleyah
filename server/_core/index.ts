import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { z } from "zod";
import { registerOAuthRoutes } from "./oauth";
import { publicPlatformScript } from "./publicConfig";
import {
  generateReferenceId,
  getOrderRecord,
  saveOrderRecord,
} from "../orders";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

const inquirySchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(180).or(z.literal("")).optional().default(""),
    phone: z.string().trim().max(40).optional().default(""),
    inquiryType: z.enum(["home", "trade"]),
    products: z.array(z.string().trim().min(1).max(80)).min(1).max(20),
    message: z.string().trim().max(2000).optional().default(""),
  })
  .refine((data) => Boolean(data.phone || data.email), {
    message: "Phone or email is required",
  });

const orderSchema = z.object({
  referenceId: z.string().trim().min(3).max(40).optional(),
  orderType: z.enum(["home", "trade"]).default("home"),
  customerName: z.string().trim().max(120).optional().default(""),
  phone: z.string().trim().max(40).optional().default(""),
  email: z.string().trim().max(180).optional().default(""),
  items: z.array(z.string().trim().min(1).max(300)).min(1).max(50),
  subtotal: z.number().nonnegative().optional(),
  notes: z.string().trim().max(2000).optional().default(""),
});

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.get(["/api/platform/config.js", "/alkhaleyah/api/platform/config.js"], (_req, res) => {
    res.set("Cache-Control", "no-store").type("application/javascript").send(publicPlatformScript());
  });
  app.post(["/api/inquiries", "/alkhaleyah/api/inquiries"], (req, res) => {
    const parsed = inquirySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, error: "Invalid inquiry details" });
    }
    const now = new Date().toISOString();
    const referenceId = generateReferenceId();
    const order = saveOrderRecord({
      referenceId,
      kind: "inquiry",
      orderType: parsed.data.inquiryType,
      customerName: parsed.data.name,
      itemsSummary: parsed.data.products,
      status: "received",
      createdAt: now,
      updatedAt: now,
      notes: parsed.data.message || undefined,
    });
    return res.status(200).json({ ok: true, referenceId, order });
  });
  app.post(["/api/orders", "/alkhaleyah/api/orders"], (req, res) => {
    const parsed = orderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, error: "Invalid order details" });
    }
    const now = new Date().toISOString();
    const referenceId = parsed.data.referenceId || generateReferenceId();
    const order = saveOrderRecord({
      referenceId,
      kind: "order",
      orderType: parsed.data.orderType,
      customerName: parsed.data.customerName || "WhatsApp customer",
      itemsSummary: parsed.data.items,
      subtotal: parsed.data.subtotal,
      status: "received",
      createdAt: now,
      updatedAt: now,
      notes: parsed.data.notes || undefined,
    });
    return res.status(200).json({ ok: true, referenceId: order.referenceId, order });
  });
  app.get(
    ["/api/orders/:referenceId", "/alkhaleyah/api/orders/:referenceId"],
    (req, res) => {
      const order = getOrderRecord(req.params.referenceId);
      if (!order) {
        return res.status(404).json({ ok: false, error: "Order not found" });
      }
      return res.status(200).json({ ok: true, order });
    }
  );
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = Number(process.env.PORT || "3000");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid PORT");
  server.on("error", error => { console.error("Server failed:", error.message); process.exit(1); });
  server.listen(port, "0.0.0.0", () => console.log(`Server listening on port ${port}`));
}

startServer().catch(error => { console.error(error); process.exit(1); });
