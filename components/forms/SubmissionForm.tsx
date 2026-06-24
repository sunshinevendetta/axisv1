"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import SubmissionBackground from "@/components/backgrounds/SubmissionBackground";
import { useSiteLanguage } from "@/components/site-language";
import { getSiteCopy } from "@/src/lib/site-translations";

type SubmissionVariant = "artist" | "dev";

interface SubmissionFormProps {
  variant?: SubmissionVariant;
}

const ARTIST_LINK_HINT_HREF = "https://base.app/invite/sunshinev/R80CCWVY";

export default function SubmissionForm({ variant = "artist" }: SubmissionFormProps) {
  const { language } = useSiteLanguage();
  const copy = getSiteCopy(language);
  const formCopy = copy.submit.form;
  const content = formCopy[variant];
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [contactMode, setContactMode] = useState<"phone" | "telegram">("phone");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    wallet: "",
    artworkLink: "",
    telegram: "",
    instagram: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [walletStatus, setWalletStatus] = useState<"idle" | "valid" | "invalid" | "resolving">("idle");
  const [_resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [walletError, setWalletError] = useState("");

  const inputClassName =
    "w-full bg-[#0a0a0a] px-4 py-3 text-sm text-white placeholder:text-white/36 focus:outline-none focus:ring-1 focus:ring-white/24";

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const validateWallet = (wallet: string) => {
    if (!wallet.trim()) {
      setWalletStatus("idle");
      setWalletError("");
      setResolvedAddress(null);
      return true;
    }
    setWalletStatus("resolving");
    setWalletError("");
    if (/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      setWalletStatus("valid");
      setResolvedAddress(wallet);
      return true;
    }
    if (wallet.toLowerCase().endsWith(".eth")) {
      setWalletStatus("valid");
      setResolvedAddress(null);
      return true;
    }
    setWalletStatus("invalid");
    setWalletError(formCopy.errors.invalidWalletHelper);
    setResolvedAddress(null);
    return false;
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (name === "wallet") validateWallet(value);
  };

  const handleCaptcha = (token: string | null) => {
    setRecaptchaToken(token);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    if (!formData.name || !formData.email || !formData.artworkLink) {
      setStatus("error");
      setMessage(variant === "dev" ? formCopy.errors.requiredDev : formCopy.errors.requiredArtist);
      return;
    }
    if (contactMode === "phone" && !formData.phone) {
      setStatus("error");
      setMessage(formCopy.errors.phoneRequired);
      return;
    }
    if (contactMode === "telegram" && !formData.telegram.trim()) {
      setStatus("error");
      setMessage(formCopy.errors.telegramRequired);
      return;
    }
    if (!validateEmail(formData.email)) {
      setStatus("error");
      setMessage(formCopy.errors.invalidEmail);
      return;
    }
    if (formData.wallet.trim() && walletStatus !== "valid") {
      setStatus("error");
      setMessage(formCopy.errors.invalidWallet);
      return;
    }
    if (!recaptchaToken) {
      setStatus("error");
      setMessage(formCopy.errors.captchaRequired);
      return;
    }

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, recaptchaToken, submissionType: variant }),
      });

      if (response.ok) {
        setStatus("success");
        setMessage(content.successMessage);
        setFormData({ name: "", email: "", phone: "", wallet: "", artworkLink: "", telegram: "", instagram: "" });
        setResolvedAddress(null);
        setWalletStatus("idle");
        setWalletError("");
        setRecaptchaToken(null);
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
      } else {
        const errorPayload = await response.json();
        setStatus("error");
        setMessage(errorPayload.error || formCopy.errors.generic);
      }
    } catch {
      setStatus("error");
      setMessage(formCopy.errors.generic);
    }
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .phone-wrap .PhoneInput { display: flex; align-items: center; background: #0a0a0a; }
      .phone-wrap .PhoneInputInput { flex: 1; padding: 0.75rem 1rem; background: #0a0a0a; border: none; color: white; font-size: 0.875rem; outline: none; }
      .phone-wrap .PhoneInputInput::placeholder { color: rgba(255,255,255,0.36); }
      .phone-wrap .PhoneInputCountrySelect { background: #0a0a0a; color: white; border: none; padding: 0.5rem 0.75rem; cursor: pointer; }
      .phone-wrap .PhoneInputCountrySelectArrow { color: rgba(255,255,255,0.7); }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center px-6 py-32">
      <SubmissionBackground />

      <div className="relative z-10 mx-auto w-full max-w-xl bg-[rgba(8,8,8,0.92)] p-8 shadow-[0_34px_90px_rgba(0,0,0,0.46)] sm:p-10">
        <h2 className="mb-6 text-center [font-family:var(--font-display)] text-base leading-[0.96] tracking-[-0.05em] text-white sm:text-lg">
          {content.title}
        </h2>

        <div className="mb-10 space-y-2 text-center text-xs leading-5 tracking-wide text-white/52 sm:text-sm sm:leading-[1.55]">
          {content.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-white/48">
              {variant === "dev" ? formCopy.labels.nameTeam : formCopy.labels.nameAlias}
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={inputClassName}
            />
          </div>

          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-white/48">
              {formCopy.labels.email}
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={inputClassName}
            />
          </div>

          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-white/48">
              {content.linkLabel}
            </label>
            {"linkHint" in content ? (
              <a
                href={ARTIST_LINK_HINT_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-3 block text-[10px] uppercase tracking-[0.16em] text-white/42 transition-colors hover:text-white/72"
              >
                {content.linkHint}
              </a>
            ) : null}
            <input
              name="artworkLink"
              value={formData.artworkLink}
              onChange={handleChange}
              required
              className={inputClassName}
            />
          </div>

          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-white/48">
              {formCopy.labels.contactMethod}
            </label>
            <div className="mb-3 flex">
              <button
                type="button"
                onClick={() => setContactMode("phone")}
                className={`flex-1 border px-4 py-2.5 text-[10px] uppercase tracking-[0.24em] transition-colors duration-150 ${
                  contactMode === "phone"
                    ? "border-white/30 bg-white/8 text-white"
                    : "border-white/8 bg-transparent text-white/32 hover:border-white/16 hover:text-white/52"
                }`}
              >
                {formCopy.labels.phone}
              </button>
              <button
                type="button"
                onClick={() => setContactMode("telegram")}
                className={`flex-1 border border-l-0 px-4 py-2.5 text-[10px] uppercase tracking-[0.24em] transition-colors duration-150 ${
                  contactMode === "telegram"
                    ? "border-white/30 bg-white/8 text-white"
                    : "border-white/8 bg-transparent text-white/32 hover:border-white/16 hover:text-white/52"
                }`}
              >
                {formCopy.labels.telegram}
              </button>
            </div>
            {contactMode === "phone" ? (
              <div className="phone-wrap">
                <PhoneInput
                  international
                  defaultCountry="MX"
                  value={formData.phone}
                  onChange={(value: string | undefined) => setFormData((current) => ({ ...current, phone: value || "" }))}
                />
              </div>
            ) : (
              <input
                name="telegram"
                value={formData.telegram}
                onChange={handleChange}
                placeholder={formCopy.placeholders.telegram}
                className={inputClassName}
              />
            )}
          </div>

          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-white/48">
              {formCopy.labels.wallet} <span className="normal-case tracking-normal text-white/28">({formCopy.labels.optional})</span>
            </label>
            <input
              name="wallet"
              value={formData.wallet}
              onChange={handleChange}
              onBlur={() => validateWallet(formData.wallet)}
              className={inputClassName}
            />
            {walletError ? <p className="mt-1 text-xs text-white/44">{walletError}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-white/48">
              {formCopy.labels.instagram} <span className="normal-case tracking-normal text-white/28">({formCopy.labels.optional})</span>
            </label>
            <input
              name="instagram"
              value={formData.instagram}
              onChange={handleChange}
              placeholder={formCopy.placeholders.instagram}
              className={inputClassName}
            />
          </div>

          <ReCAPTCHA ref={recaptchaRef} sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!} onChange={handleCaptcha} />

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-white px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-black transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {content.submitLabel}
          </button>
        </form>

        {status === "success" ? (
          <p className="mt-6 text-center text-base text-white/68">{message}</p>
        ) : null}
        {status === "error" ? (
          <p className="mt-6 text-center text-base text-white/52">{message}</p>
        ) : null}
      </div>
    </div>
  );
}
