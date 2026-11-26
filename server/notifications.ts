import { createRemoteJWKSet, jwtVerify } from "jose";
import fs from "node:fs";
import path from "node:path";

const OWNER_ADMIN_EMAIL = "abahafc@gmail.com";

const GOOGLE_SECURE_TOKEN_JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
  )
);

const ALLOWED_WEBHOOK_HOSTS = new Set([
  "ntfy.sh",
  "hooks.slack.com",
  "discord.com",
  "discordapp.com",
  "hooks.zapier.com",
  "hook.eu1.make.com",
  "hook.us1.make.com",
  "hook.eu2.make.com",
  "hook.us2.make.com",
]);

const NTFY_TOPIC_REGEX = /^[a-zA-Z0-9_-]{3,120}$/;
const SIMPLE_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FirebaseAppletConfig = {
  projectId: string;
  firestoreDatabaseId?: string;
};

function loadFirebaseConfig(): FirebaseAppletConfig {
  const candidates = [
    path.resolve(process.cwd(), "firebase-applet-config.json"),
    path.resolve(import.meta.dirname, "../../firebase-applet-config.json"),
    path.resolve(import.meta.dirname, "../firebase-applet-config.json"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      const raw = fs.readFileSync(candidate, "utf-8");
      const parsed = JSON.parse(raw) as FirebaseAppletConfig;
      if (parsed?.projectId) {
        return parsed;
      }
    }
  }
  throw new Error("Missing firebase-applet-config.json");
}

function isBlockedHostname(hostname: string): boolean {
  const host = hostname.trim().toLowerCase().replace(/^\[|\]$/g, "");
  if (!host) return true;
  if (
    host === "localhost" ||
    host === "::1" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".localhost")
  ) {
    return true;
  }
  // Block raw IPv4 / IPv6 literals to prevent loopback/private/metadata SSRF
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(":")) {
    return true;
  }
  return false;
}

export function validateSafeWebhookUrl(rawUrl: string): string | null {
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.length > 512) return null;
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:") return null;
  if (parsed.username || parsed.password) return null;
  if (parsed.port && parsed.port !== "443") return null;

  const host = parsed.hostname.toLowerCase();
  if (isBlockedHostname(host)) return null;
  if (!ALLOWED_WEBHOOK_HOSTS.has(host)) return null;

  return parsed.toString();
}

export function sanitizeNtfyTopic(rawTopic: string): string | null {
  const trimmed = rawTopic.trim();
  if (!NTFY_TOPIC_REGEX.test(trimmed)) return null;
  return trimmed;
}

export async function verifyAdminBearerToken(
  authHeader: string | undefined
): Promise<{ uid: string; email: string } | null> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice("Bearer ".length).trim();
  if (!token || token.length > 8192) return null;

  const config = loadFirebaseConfig();
  const projectId = config.projectId;
  const databaseId = config.firestoreDatabaseId || "(default)";

  try {
    const { payload } = await jwtVerify(token, GOOGLE_SECURE_TOKEN_JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });

    const uid = typeof payload.sub === "string" ? payload.sub : "";
    const email =
      typeof payload.email === "string" ? payload.email.toLowerCase() : "";
    const emailVerified = payload.email_verified === true;

    if (!uid || !email || !emailVerified) {
      return null;
    }

    if (email === OWNER_ADMIN_EMAIL.toLowerCase()) {
      return { uid, email };
    }

    // Check secondary admin role document via Firestore REST using the caller's own verified ID token
    const adminDocUrl = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
      projectId
    )}/databases/${encodeURIComponent(databaseId)}/documents/admins/${encodeURIComponent(
      uid
    )}`;
    const res = await fetch(adminDocUrl, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    return { uid, email };
  } catch {
    return null;
  }
}

export type AlertPayload = {
  title: string;
  body: string;
  referenceId?: string;
  eventType?: string;
  ntfyTopic?: string;
  webhookUrl?: string;
  recipientEmail?: string;
};

export type AlertDispatchResult = {
  ntfySent: boolean;
  webhookSent: boolean;
  emailSent: boolean;
  envWebhookSent: boolean;
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendNtfyAlert(
  topic: string,
  title: string,
  body: string,
  referenceId?: string
): Promise<boolean> {
  const safeTopic = sanitizeNtfyTopic(topic);
  if (!safeTopic) return false;
  try {
    const res = await fetch(`https://ntfy.sh/${encodeURIComponent(safeTopic)}`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        Title: title.replace(/[\r\n]+/g, " ").slice(0, 140),
        Priority: "4",
        Tags: referenceId ? "shopping_bags,alkhaleyah" : "bell,alkhaleyah",
      },
      body: body.slice(0, 1200),
      redirect: "error",
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function sendWebhookPost(
  safeUrl: string,
  title: string,
  body: string,
  referenceId?: string
): Promise<boolean> {
  try {
    const parsed = new URL(safeUrl);
    const formatted = referenceId
      ? `[${referenceId}] ${title}\n${body}`
      : `${title}\n${body}`;

    const isNtfyUrl = parsed.hostname.toLowerCase() === "ntfy.sh";
    const res = await fetch(safeUrl, {
      method: "POST",
      headers: isNtfyUrl
        ? {
            "Content-Type": "text/plain; charset=utf-8",
            Title: title.replace(/[\r\n]+/g, " ").slice(0, 140),
          }
        : {
            "Content-Type": "application/json",
          },
      body: isNtfyUrl
        ? body.slice(0, 1200)
        : JSON.stringify({
            text: formatted,
            content: formatted,
            title,
            body,
            referenceId: referenceId ?? "",
          }),
      redirect: "error",
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function sendResendEmail(
  toEmail: string,
  title: string,
  body: string
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey || !SIMPLE_EMAIL_REGEX.test(toEmail)) return false;

  const fromEmail =
    process.env.ADMIN_ALERT_FROM_EMAIL?.trim() ||
    "Alkhaleyah Alerts <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject: title.slice(0, 140),
        text: body,
        html: `<div style="font-family:sans-serif;line-height:1.6;color:#173828"><h2>${escapeHtml(
          title
        )}</h2><p style="white-space:pre-line">${escapeHtml(body)}</p></div>`,
      }),
      redirect: "error",
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn(
        `[Notifications] Resend delivery failed (${res.status}): ${errText.slice(0, 200)}`
      );
    }
    return res.ok;
  } catch (error) {
    console.warn(
      "[Notifications] Resend request error:",
      error instanceof Error ? error.message : "unknown"
    );
    return false;
  }
}

export async function dispatchExternalAlerts(
  payload: AlertPayload
): Promise<AlertDispatchResult> {
  const result: AlertDispatchResult = {
    ntfySent: false,
    webhookSent: false,
    emailSent: false,
    envWebhookSent: false,
  };

  const title = payload.title.trim().slice(0, 140);
  const body = payload.body.trim().slice(0, 1200);
  if (!title) return result;

  const tasks: Promise<void>[] = [];

  if (payload.ntfyTopic) {
    tasks.push(
      sendNtfyAlert(payload.ntfyTopic, title, body, payload.referenceId).then(
        (ok) => {
          result.ntfySent = ok;
        }
      )
    );
  }

  if (payload.webhookUrl) {
    const safeUrl = validateSafeWebhookUrl(payload.webhookUrl);
    if (safeUrl) {
      tasks.push(
        sendWebhookPost(safeUrl, title, body, payload.referenceId).then(
          (ok) => {
            result.webhookSent = ok;
          }
        )
      );
    }
  }

  const envWebhook = process.env.ADMIN_WEBHOOK_URL?.trim();
  if (envWebhook) {
    const safeEnvUrl = validateSafeWebhookUrl(envWebhook);
    if (safeEnvUrl) {
      tasks.push(
        sendWebhookPost(safeEnvUrl, title, body, payload.referenceId).then(
          (ok) => {
            result.envWebhookSent = ok;
          }
        )
      );
    }
  }

  const targetEmail =
    (payload.recipientEmail && SIMPLE_EMAIL_REGEX.test(payload.recipientEmail)
      ? payload.recipientEmail.trim()
      : "") ||
    process.env.ADMIN_ALERT_EMAIL?.trim() ||
    OWNER_ADMIN_EMAIL;

  if (process.env.RESEND_API_KEY?.trim() && targetEmail) {
    tasks.push(
      sendResendEmail(targetEmail, title, body).then((ok) => {
        result.emailSent = ok;
      })
    );
  }

  await Promise.all(tasks);
  return result;
}

export function getServerNotificationCapabilities() {
  return {
    emailReady: Boolean(process.env.RESEND_API_KEY?.trim()),
    envWebhookReady: Boolean(
      process.env.ADMIN_WEBHOOK_URL?.trim() &&
        validateSafeWebhookUrl(process.env.ADMIN_WEBHOOK_URL)
    ),
    defaultAlertEmailConfigured: Boolean(process.env.ADMIN_ALERT_EMAIL?.trim()),
  };
}
