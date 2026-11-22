export const WHATSAPP_NUMBER = "201091850076";
export const WHATSAPP_DISPLAY = "+20 109 185 0076";

export function buildWhatsAppUrl(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
