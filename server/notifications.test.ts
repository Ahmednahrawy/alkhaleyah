import { describe, expect, it } from "vitest";
import {
  sanitizeNtfyTopic,
  validateSafeWebhookUrl,
} from "./notifications";

describe("admin notification SSRF and input validators", () => {
  it("accepts verified HTTPS webhook destinations on allowlisted hosts", () => {
    expect(
      validateSafeWebhookUrl("https://discord.com/api/webhooks/123/abc")
    ).toBe("https://discord.com/api/webhooks/123/abc");
    expect(
      validateSafeWebhookUrl("https://hooks.slack.com/services/T00/B00/XXX")
    ).toBe("https://hooks.slack.com/services/T00/B00/XXX");
    expect(validateSafeWebhookUrl("https://ntfy.sh/alkhaleyah-orders")).toBe(
      "https://ntfy.sh/alkhaleyah-orders"
    );
    expect(validateSafeWebhookUrl("https://hook.eu1.make.com/abc123")).toBe(
      "https://hook.eu1.make.com/abc123"
    );
  });

  it("rejects insecure HTTP, loopback/private/metadata IPs, and untrusted hosts", () => {
    expect(validateSafeWebhookUrl("")).toBeNull();
    expect(
      validateSafeWebhookUrl("http://discord.com/api/webhooks/123/abc")
    ).toBeNull();
    expect(validateSafeWebhookUrl("https://localhost/webhook")).toBeNull();
    expect(validateSafeWebhookUrl("https://127.0.0.1/webhook")).toBeNull();
    expect(
      validateSafeWebhookUrl("https://169.254.169.254/latest/meta-data/")
    ).toBeNull();
    expect(validateSafeWebhookUrl("https://10.0.0.5/hook")).toBeNull();
    expect(validateSafeWebhookUrl("https://192.168.1.10/hook")).toBeNull();
    expect(
      validateSafeWebhookUrl("https://user:secret@discord.com/api/webhooks/1")
    ).toBeNull();
    expect(
      validateSafeWebhookUrl("https://discord.com:8443/api/webhooks/1")
    ).toBeNull();
    expect(validateSafeWebhookUrl("https://evil.example.com/steal")).toBeNull();
  });

  it("validates ntfy topics against strict identifier characters", () => {
    expect(sanitizeNtfyTopic("alkhaleyah-orders_live")).toBe(
      "alkhaleyah-orders_live"
    );
    expect(sanitizeNtfyTopic("ab")).toBeNull();
    expect(sanitizeNtfyTopic("foo/bar")).toBeNull();
    expect(sanitizeNtfyTopic("topic?poll=1")).toBeNull();
    expect(sanitizeNtfyTopic("my topic")).toBeNull();
  });
});
