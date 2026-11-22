import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { z } from "zod";
import { registerOAuthRoutes } from "./oauth";
import { publicPlatformScript } from "./publicConfig";
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
    const referenceId = `ALK-${Date.now().toString(36).toUpperCase()}`;
    return res.status(200).json({ ok: true, referenceId });
  });
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
