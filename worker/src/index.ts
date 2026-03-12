import { EmailMessage } from "cloudflare:email";
import { createMimeMessage } from "mimetext";
import { z } from "zod";

const ContactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  email: z.string().trim().email("Invalid email address").max(254),
  phone: z.string().trim().max(40).optional(),
  eventDate: z.string().trim().max(40).optional(),
  venue: z.string().trim().max(160).optional(),
  eventType: z.string().trim().max(80).optional(),
  gearNeeds: z.array(z.string().trim().min(1).max(60)).max(20).optional().default([]),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(5_000),
  turnstileToken: z.string().min(1, "Bot verification token missing").max(2_048),
});

type ContactPayload = z.infer<typeof ContactSchema>;

interface Env {
  SEND_EMAIL: SendEmail;
  TURNSTILE_SECRET_KEY: string;
  ALLOWED_ORIGINS?: string;
  CONTACT_TO_ADDRESS?: string;
  GOOGLE_APPS_SCRIPT_URL?: string;
  TURNSTILE_EXPECTED_HOSTNAME?: string;
  TURNSTILE_EXPECTED_ACTION?: string;
  CONTACT_SUBMISSION_LIMITER?: RateLimit;
}

const DEFAULT_ALLOWED_ORIGINS = [
  "https://hotbeamproductions.com",
  "https://www.hotbeamproductions.com",
  "http://localhost:3000",
];

const FROM_ADDRESS = "contact@hotbeamproductions.com";
const MAX_BODY_BYTES = 25_000;
const TURNSTILE_TIMEOUT_MS = 8_000;
const GOOGLE_LOG_TIMEOUT_MS = 8_000;
const RATE_LIMIT_ERROR = "Too many requests. Please wait before trying again.";

interface TurnstileVerificationResult {
  success: boolean;
  hostname?: string;
  action?: string;
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin") ?? "";
    const allowedOrigins = getAllowedOrigins(env.ALLOWED_ORIGINS);
    const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0] ?? "*";

    if (request.method === "OPTIONS") {
      if (origin && !allowedOrigins.includes(origin)) {
        return new Response("Forbidden", { status: 403 });
      }
      return new Response(null, {
        status: 204,
        headers: corsHeaders(allowedOrigin),
      });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    if (!origin || !allowedOrigins.includes(origin)) {
      return new Response("Forbidden", { status: 403 });
    }

    if (!(await isRateLimitAllowed(env.CONTACT_SUBMISSION_LIMITER, `${origin}:${request.headers.get("CF-Connecting-IP") ?? "unknown"}`))) {
      return corsResponse({ success: false, error: RATE_LIMIT_ERROR }, 429, origin);
    }

    if (!env.TURNSTILE_SECRET_KEY) {
      return corsResponse({ success: false, error: "Turnstile is not configured" }, 500, allowedOrigin);
    }

    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
      return corsResponse({ success: false, error: "Request body too large" }, 413, allowedOrigin);
    }

    let rawBody = "";
    try {
      rawBody = await request.text();
    } catch {
      return corsResponse({ success: false, error: "Invalid request body" }, 400, allowedOrigin);
    }

    if (rawBody.length > MAX_BODY_BYTES) {
      return corsResponse({ success: false, error: "Request body too large" }, 413, allowedOrigin);
    }

    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return corsResponse({ success: false, error: "Invalid request body" }, 400, allowedOrigin);
    }

    const parsed = ContactSchema.safeParse(body);
    if (!parsed.success) {
      return corsResponse(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid request body" },
        400,
        allowedOrigin
      );
    }

    const turnstileResult = await verifyTurnstile(
      parsed.data.turnstileToken,
      env.TURNSTILE_SECRET_KEY,
      request.headers.get("CF-Connecting-IP")
    );

    if (!matchesTurnstileExpectations(turnstileResult, env)) {
      return corsResponse(
        { success: false, error: "Bot verification failed. Please try again." },
        400,
        allowedOrigin
      );
    }

    const toAddress = env.CONTACT_TO_ADDRESS || FROM_ADDRESS;

    try {
      const html = buildEmailHtml(parsed.data);
      const message = createMimeMessage();
      message.setSender({ name: "Hot Beam Website", addr: FROM_ADDRESS });
      message.setRecipient(toAddress);
      message.setHeader("Reply-To", parsed.data.email);
      message.setSubject(
        `Proposal Request from ${parsed.data.name}${parsed.data.eventType ? ` - ${parsed.data.eventType}` : ""}`
      );
      message.addMessage({ contentType: "text/html", data: html });

      const emailMessage = new EmailMessage(FROM_ADDRESS, toAddress, message.asRaw());
      await env.SEND_EMAIL.send(emailMessage);
    } catch {
      return corsResponse(
        { success: false, error: "Failed to send message. Please try again." },
        500,
        allowedOrigin
      );
    }

    if (env.GOOGLE_APPS_SCRIPT_URL) {
      void logToGoogleSheet(env.GOOGLE_APPS_SCRIPT_URL, parsed.data, request.headers.get("CF-Connecting-IP"));
    }

    return corsResponse({ success: true }, 200, allowedOrigin);
  },
};

export default worker;

function getAllowedOrigins(raw: string | undefined): string[] {
  if (!raw) return DEFAULT_ALLOWED_ORIGINS;

  const parsed = raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return parsed.length > 0 ? parsed : DEFAULT_ALLOWED_ORIGINS;
}

async function isRateLimitAllowed(limiter: RateLimit | undefined, key: string): Promise<boolean> {
  if (!limiter) return true;

  try {
    const outcome = await limiter.limit({ key });
    return outcome.success;
  } catch {
    // Fail open if the binding is unavailable so contact intake still works.
    return true;
  }
}

async function verifyTurnstile(
  token: string,
  secret: string,
  ipAddress: string | null
): Promise<TurnstileVerificationResult> {
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: token,
        ...(ipAddress ? { remoteip: ipAddress } : {}),
      }),
      signal: AbortSignal.timeout(TURNSTILE_TIMEOUT_MS),
    });

    if (!response.ok) return { success: false };

    const result = (await response.json()) as TurnstileVerificationResult;
    return {
      success: Boolean(result.success),
      hostname: typeof result.hostname === "string" ? result.hostname : undefined,
      action: typeof result.action === "string" ? result.action : undefined,
    };
  } catch {
    return { success: false };
  }
}

function matchesTurnstileExpectations(
  result: TurnstileVerificationResult,
  env: Env
): boolean {
  if (!result.success) return false;

  const expectedHostname = env.TURNSTILE_EXPECTED_HOSTNAME?.trim().toLowerCase();
  if (expectedHostname && result.hostname?.trim().toLowerCase() !== expectedHostname) {
    return false;
  }

  const expectedAction = env.TURNSTILE_EXPECTED_ACTION?.trim();
  if (expectedAction && result.action?.trim() !== expectedAction) {
    return false;
  }

  return true;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildEmailHtml(data: ContactPayload): string {
  const name = escapeHtml(data.name);
  const email = escapeHtml(data.email);
  const phone = data.phone ? escapeHtml(data.phone) : "";
  const eventDate = data.eventDate ? escapeHtml(data.eventDate) : "";
  const venue = data.venue ? escapeHtml(data.venue) : "";
  const eventType = data.eventType ? escapeHtml(data.eventType) : "";
  const message = escapeHtml(data.message).replace(/\n/g, "<br />");

  const gearList =
    data.gearNeeds.length > 0
      ? `<p><strong>Production Needs:</strong> ${data.gearNeeds.map((need) => escapeHtml(need)).join(", ")}</p>`
      : "";

  return `
    <h2 style="font-family:system-ui,sans-serif">New Proposal Request</h2>
    <table style="font-family:system-ui,sans-serif;border-collapse:collapse;width:100%">
      <tr><td style="padding:4px 8px;color:#5f6368">Name</td><td style="padding:4px 8px">${name}</td></tr>
      <tr><td style="padding:4px 8px;color:#5f6368">Email</td><td style="padding:4px 8px"><a href="mailto:${email}">${email}</a></td></tr>
      ${phone ? `<tr><td style="padding:4px 8px;color:#5f6368">Phone</td><td style="padding:4px 8px">${phone}</td></tr>` : ""}
      ${eventDate ? `<tr><td style="padding:4px 8px;color:#5f6368">Event Date</td><td style="padding:4px 8px">${eventDate}</td></tr>` : ""}
      ${venue ? `<tr><td style="padding:4px 8px;color:#5f6368">Venue</td><td style="padding:4px 8px">${venue}</td></tr>` : ""}
      ${eventType ? `<tr><td style="padding:4px 8px;color:#5f6368">Event Type</td><td style="padding:4px 8px">${eventType}</td></tr>` : ""}
    </table>
    ${gearList}
    <h3 style="font-family:system-ui,sans-serif;margin-top:16px">Project Brief</h3>
    <p style="font-family:system-ui,sans-serif;white-space:normal;background:#f4f6f8;padding:12px;border-radius:4px">${message}</p>
  `;
}

async function logToGoogleSheet(
  endpoint: string,
  data: ContactPayload,
  ipAddress: string | null
): Promise<void> {
  const leadData: Omit<ContactPayload, "turnstileToken"> = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    eventDate: data.eventDate,
    venue: data.venue,
    eventType: data.eventType,
    gearNeeds: data.gearNeeds,
    message: data.message,
  };

  try {
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submittedAt: new Date().toISOString(),
        source: "hotbeam-website",
        ipAddress,
        ...leadData,
      }),
      signal: AbortSignal.timeout(GOOGLE_LOG_TIMEOUT_MS),
    });
  } catch {
    // Ignore logging failures to avoid blocking lead intake.
  }
}

function corsHeaders(origin: string): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function corsResponse(body: unknown, status: number, origin: string): Response {
  return new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin),
    },
  });
}
