"use client";

import Link from "next/link";
import { Turnstile } from "@marsidev/react-turnstile";
import { useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { GlowButton } from "@/components/glow-button";
import type { ContactData } from "@/lib/types";

const inputStyles =
  "w-full border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-laser-cyan/45";
const optionalLabelStyles = "ml-1 text-xs text-muted";

const commonDomainTypos: Record<string, string> = {
  "gamil.com": "gmail.com",
  "gmial.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmail.co": "gmail.com",
  "hotnail.com": "hotmail.com",
  "homtail.com": "hotmail.com",
  "outlok.com": "outlook.com",
  "outllok.com": "outlook.com",
  "yaho.com": "yahoo.com",
  "yhoo.com": "yahoo.com",
};

function suggestEmailCorrection(value: string): string | null {
  const trimmed = value.trim();
  const atIndex = trimmed.lastIndexOf("@");

  if (atIndex < 1 || atIndex === trimmed.length - 1) {
    return null;
  }

  const localPart = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1).toLowerCase();
  const correctedDomain = commonDomainTypos[domain];

  if (!correctedDomain) {
    return null;
  }

  return `${localPart}@${correctedDomain}`;
}

interface ContactResponse {
  success: boolean;
  error?: string;
}

interface ContactFormProps {
  contact: ContactData;
}

export function ContactForm({ contact }: ContactFormProps) {
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [turnstileToken, setTurnstileToken] = useState("");
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const endpoint = useMemo(() => {
    return process.env.NEXT_PUBLIC_CONTACT_ENDPOINT ?? process.env.NEXT_PUBLIC_WORKER_URL;
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setPending(true);
    setError(undefined);

    if (!endpoint) {
      setError("Contact form is not configured yet. Please email us directly.");
      setPending(false);
      return;
    }

    if (!turnstileSiteKey) {
      setError("Bot verification is unavailable right now. Please email us directly.");
      setPending(false);
      return;
    }

    if (!turnstileToken) {
      setError("Please complete verification before sending.");
      setPending(false);
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    // Honeypot field for low-effort bot submissions.
    if (String(formData.get("companyWebsite") ?? "").trim().length > 0) {
      setPending(false);
      setSuccess(true);
      return;
    }

    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim() || undefined,
      eventDate: String(formData.get("eventDate") ?? "").trim() || undefined,
      venue: String(formData.get("venue") ?? "").trim() || undefined,
      eventType: String(formData.get("eventType") ?? "").trim() || undefined,
      gearNeeds: formData.getAll("gearNeeds").map((value) => String(value)),
      message: String(formData.get("message") ?? "").trim(),
      turnstileToken,
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = (await response.json()) as ContactResponse;

      if (response.ok && responseData.success) {
        setSuccess(true);
        form.reset();
        setTurnstileToken("");
        setEmailSuggestion(null);
        return;
      }

      setError(responseData.error ?? "We could not send your request. Please try again.");
    } catch {
      setError("Network error while sending your request. Please try again.");
    } finally {
      setPending(false);
    }
  }

  const waitingOnVerification = Boolean(turnstileSiteKey) && !turnstileToken;

  if (success) {
    return (
      <div className="border border-border bg-surface px-8 py-16 text-center" role="status">
        <CheckCircle2 className="mx-auto mb-5 h-14 w-14 text-laser-cyan" aria-hidden="true" />
        <h3 className="font-heading text-3xl tracking-tight text-foreground">
          {contact.success.title}
        </h3>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-light">
          {contact.success.message}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7" aria-busy={pending}>
      <p className="text-sm leading-relaxed text-muted-light">
        Takes about a minute. Share the basics first, then add optional details if you want a tighter first quote.
      </p>

      <input
        tabIndex={-1}
        autoComplete="off"
        className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden opacity-0"
        name="companyWebsite"
        aria-hidden="true"
      />

      {error && (
        <div
          className="flex items-start gap-3 border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          role="alert"
        >
          <AlertCircle className="mt-[1px] h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm text-muted-light">
            Full Name <span aria-hidden="true">*</span>
          </label>
          <input
            id="name"
            name="name"
            required
            minLength={2}
            className={inputStyles}
            placeholder="Jane Smith"
            autoComplete="name"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm text-muted-light">
            Email <span aria-hidden="true">*</span>
          </label>
          <input
            id="email"
            ref={emailRef}
            name="email"
            type="email"
            required
            className={inputStyles}
            placeholder="you@company.com"
            autoComplete="email"
            inputMode="email"
            onBlur={(event) => {
              setEmailSuggestion(suggestEmailCorrection(event.currentTarget.value));
            }}
            onInput={() => {
              if (emailSuggestion) {
                setEmailSuggestion(null);
              }
            }}
          />
          {emailSuggestion ? (
            <p className="mt-2 text-xs text-amber-300">
              Did you mean{" "}
              <button
                type="button"
                className="underline decoration-dotted underline-offset-2 hover:text-amber-200"
                onClick={() => {
                  if (emailRef.current) {
                    emailRef.current.value = emailSuggestion;
                    emailRef.current.focus();
                  }
                  setEmailSuggestion(null);
                }}
              >
                {emailSuggestion}
              </button>
              ?
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor="message" className="mb-2 block text-sm text-muted-light">
          Project Brief <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          minLength={10}
          maxLength={5_000}
          className={inputStyles}
          placeholder="Share event goals, audience size, run-of-show needs, and any technical constraints."
          aria-describedby="message-hint"
        />
        <p id="message-hint" className="mt-2 text-xs text-muted">
          1 to 3 short paragraphs are enough.
        </p>
      </div>

      <details className="border border-border/80 bg-surface-light/25 p-4">
        <summary className="cursor-pointer select-none text-sm text-foreground">
          Add event details
          <span className={optionalLabelStyles}>(optional)</span>
        </summary>
        <p className="mt-2 text-xs text-muted-light">
          These details help us send a more precise scope in the first reply.
        </p>

        <div className="mt-5 space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="eventDate" className="mb-2 block text-sm text-muted-light">
                Event Date <span className={optionalLabelStyles}>(optional)</span>
              </label>
              <input id="eventDate" name="eventDate" type="date" className={inputStyles} />
            </div>

            <div>
              <label htmlFor="eventType" className="mb-2 block text-sm text-muted-light">
                Event Type <span className={optionalLabelStyles}>(optional)</span>
              </label>
              <select id="eventType" name="eventType" className={inputStyles} defaultValue="">
                <option value="">Choose event type</option>
                {contact.eventTypes.map((eventType) => (
                  <option key={eventType} value={eventType}>
                    {eventType}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="venue" className="mb-2 block text-sm text-muted-light">
                Venue and City <span className={optionalLabelStyles}>(optional)</span>
              </label>
              <input
                id="venue"
                name="venue"
                className={inputStyles}
                placeholder="Red Rocks Amphitheatre, Morrison"
                autoComplete="address-level2"
              />
            </div>

            <div>
              <label htmlFor="phone" className="mb-2 block text-sm text-muted-light">
                Phone <span className={optionalLabelStyles}>(optional)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className={inputStyles}
                placeholder="(303) 555-0100"
                autoComplete="tel"
                inputMode="tel"
              />
            </div>
          </div>

          <fieldset>
            <legend className="mb-3 text-sm text-muted-light">
              Services Needed <span className={optionalLabelStyles}>(optional)</span>
            </legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {contact.serviceNeeds.map((need) => (
                <label
                  key={need}
                  className="flex cursor-pointer items-center gap-2 border border-border bg-surface px-3 py-2 text-sm text-muted transition-colors hover:text-foreground"
                >
                  <input
                    type="checkbox"
                    name="gearNeeds"
                    value={need}
                    className="h-4 w-4 border-border bg-surface text-laser-cyan"
                  />
                  {need}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </details>

      <div className="flex flex-col gap-4">
        <div>
          {turnstileSiteKey ? (
            <div className="space-y-2">
              <Turnstile
                siteKey={turnstileSiteKey}
                onSuccess={setTurnstileToken}
                onExpire={() => setTurnstileToken("")}
                onError={() => {
                  setTurnstileToken("");
                  setError("Verification failed. Please try again.");
                }}
                options={{ theme: "dark", size: "flexible" }}
              />
              {waitingOnVerification ? (
                <p className="text-xs text-muted">Complete verification to enable send.</p>
              ) : null}
            </div>
          ) : (
            <p className="text-xs text-red-200">
              Verification is not configured. Add `NEXT_PUBLIC_TURNSTILE_SITE_KEY` to enable submissions.
            </p>
          )}
        </div>

        <p className="text-xs leading-relaxed text-muted-light">
          We only use this information to reply to your request. See our{" "}
          <Link href="/privacy-policy" className="underline decoration-dotted underline-offset-2 hover:text-foreground">
            privacy policy
          </Link>
          .
        </p>

        <GlowButton type="submit" variant="primary" disabled={pending || waitingOnVerification} className="w-full sm:w-auto">
          <Send className="mr-2 inline h-4 w-4" aria-hidden="true" />
          {pending ? "Sending request..." : waitingOnVerification ? "Complete Verification to Send" : contact.submitLabel}
        </GlowButton>
      </div>
    </form>
  );
}
