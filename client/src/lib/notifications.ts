import {
  doc,
  serverTimestamp,
  setDoc,
  type FieldValue,
} from "firebase/firestore";
import { auth, db, OWNER_ADMIN_EMAIL } from "@/lib/firebase";

export type AdminNotificationType =
  | "order_created"
  | "inquiry_created"
  | "order_status_updated"
  | "catalog_updated"
  | "settings_updated";

export type AdminNotificationTargetTab = "orders" | "catalog" | "settings";

export type AdminNotificationItem = {
  id: string;
  type: AdminNotificationType;
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
  targetTab: AdminNotificationTargetTab;
  referenceId: string;
  actor: string;
  isRead: boolean;
  createdAt: string;
};

export type AdminNotificationConfig = {
  configId: "notifications";
  soundEnabled: boolean;
  desktopAlertsEnabled: boolean;
  notifyOnNewOrder: boolean;
  notifyOnStatusChange: boolean;
  notifyOnCatalogUpdate: boolean;
  notifyOnSettingsUpdate: boolean;
  notifyEmail: string;
  ntfyTopic: string;
  webhookUrl: string;
};

export const DEFAULT_NOTIFICATION_CONFIG: AdminNotificationConfig = {
  configId: "notifications",
  soundEnabled: true,
  desktopAlertsEnabled: false,
  notifyOnNewOrder: true,
  notifyOnStatusChange: true,
  notifyOnCatalogUpdate: true,
  notifyOnSettingsUpdate: true,
  notifyEmail: OWNER_ADMIN_EMAIL,
  ntfyTopic: "",
  webhookUrl: "",
};

export function createNotificationId(prefix = "upd"): string {
  const safePrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 12) || "upd";
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${safePrefix}_${stamp}${rand}`.slice(0, 64);
}

export function buildOrderNotificationDoc(input: {
  referenceId: string;
  kind: "order" | "inquiry";
  orderType: "home" | "trade";
  customerName: string;
  itemsCount: number;
  subtotal?: number;
}): {
  id: string;
  type: "order_created" | "inquiry_created";
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
  targetTab: "orders";
  referenceId: string;
  actor: string;
  isRead: false;
  createdAt: FieldValue;
} {
  const refId = input.referenceId.trim().toUpperCase();
  const safeName = (input.customerName.trim() || "Customer").slice(0, 80);
  const channelEn = input.orderType === "trade" ? "Trade" : "Home";
  const channelAr = input.orderType === "trade" ? "جملة" : "منزلي";
  const subtotalPartEn =
    typeof input.subtotal === "number" && input.subtotal > 0
      ? ` · ${input.subtotal} EGP`
      : "";
  const subtotalPartAr =
    typeof input.subtotal === "number" && input.subtotal > 0
      ? ` · ${input.subtotal} ج.م`
      : "";

  const isInquiry = input.kind === "inquiry";

  return {
    id: `order_${refId}`,
    type: isInquiry ? "inquiry_created" : "order_created",
    titleEn: (isInquiry
      ? `New inquiry ${refId} — ${safeName}`
      : `New order ${refId} — ${safeName}`
    ).slice(0, 140),
    titleAr: (isInquiry
      ? `استفسار جديد ${refId} — ${safeName}`
      : `طلب جديد ${refId} — ${safeName}`
    ).slice(0, 140),
    bodyEn: `${channelEn} · ${input.itemsCount} item(s)${subtotalPartEn}`.slice(
      0,
      400
    ),
    bodyAr: `${channelAr} · ${input.itemsCount} أصناف${subtotalPartAr}`.slice(
      0,
      400
    ),
    targetTab: "orders",
    referenceId: refId.slice(0, 64),
    actor: safeName.slice(0, 120),
    isRead: false,
    createdAt: serverTimestamp(),
  };
}

export async function recordAdminUpdateNotification(input: {
  type: Exclude<AdminNotificationType, "order_created" | "inquiry_created">;
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
  targetTab: AdminNotificationTargetTab;
  referenceId?: string;
  actorEmail?: string | null;
}): Promise<AdminNotificationItem | null> {
  const id = createNotificationId("adm");
  const actor = (input.actorEmail || auth.currentUser?.email || "Admin").slice(
    0,
    120
  );
  const refId = (input.referenceId || "").slice(0, 64);

  const payload = {
    id,
    type: input.type,
    titleEn: input.titleEn.trim().slice(0, 140) || "Dashboard update",
    titleAr: input.titleAr.trim().slice(0, 140) || "تحديث في لوحة التحكم",
    bodyEn: input.bodyEn.trim().slice(0, 400),
    bodyAr: input.bodyAr.trim().slice(0, 400),
    targetTab: input.targetTab,
    referenceId: refId,
    actor,
    isRead: false,
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, "adminNotifications", id), payload);
    return {
      ...payload,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.warn("Failed to log admin notification:", error);
    return null;
  }
}

export function playNotificationChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(0.09, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    playTone(659.25, now, 0.22); // E5
    playTone(880.0, now + 0.14, 0.3); // A5
    setTimeout(() => {
      void ctx.close().catch(() => undefined);
    }, 650);
  } catch {
    // Web Audio API blocked before user interaction or unsupported
  }
}

export function canUseDesktopNotifications(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getDesktopNotificationPermission(): NotificationPermission | "unsupported" {
  if (!canUseDesktopNotifications()) return "unsupported";
  return Notification.permission;
}

export async function requestDesktopNotificationPermission(): Promise<
  NotificationPermission | "unsupported"
> {
  if (!canUseDesktopNotifications()) return "unsupported";
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export function showDesktopNotification(input: {
  title: string;
  body: string;
  tag?: string;
  onClick?: () => void;
}) {
  if (!canUseDesktopNotifications()) return;
  if (Notification.permission !== "granted") return;
  try {
    const notif = new Notification(input.title, {
      body: input.body,
      tag: input.tag,
    });
    if (input.onClick) {
      notif.onclick = () => {
        window.focus();
        input.onClick?.();
        notif.close();
      };
    }
  } catch {
    // Notification blocked by iframe or browser policy
  }
}

export async function dispatchExternalAdminAlert(input: {
  title: string;
  body: string;
  referenceId?: string;
  eventType?: AdminNotificationType | "test";
  config?: AdminNotificationConfig;
}): Promise<{
  ok: boolean;
  result?: {
    ntfySent: boolean;
    webhookSent: boolean;
    emailSent: boolean;
    envWebhookSent: boolean;
  };
}> {
  const currentUser = auth.currentUser;
  if (!currentUser) return { ok: false };

  try {
    const token = await currentUser.getIdToken();
    const endpoint = `${import.meta.env.BASE_URL}api/admin/dispatch-alert`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: input.title,
        body: input.body,
        referenceId: input.referenceId,
        eventType: input.eventType,
        ntfyTopic: input.config?.ntfyTopic ?? "",
        webhookUrl: input.config?.webhookUrl ?? "",
        recipientEmail: input.config?.notifyEmail ?? "",
      }),
    });
    if (!res.ok) return { ok: false };
    return (await res.json()) as {
      ok: boolean;
      result?: {
        ntfySent: boolean;
        webhookSent: boolean;
        emailSent: boolean;
        envWebhookSent: boolean;
      };
    };
  } catch {
    return { ok: false };
  }
}
