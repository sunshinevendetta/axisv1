"use client";

import { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import BeamsBackground from "@/components/backgrounds/SubmissionBackground";

type SubmissionVariant = "artist" | "dev";

interface SubmissionFormProps {
  variant?: SubmissionVariant;
}

const formContent: Record<
  SubmissionVariant,
  {
    title: string;
    intro: string[];
    linkLabel: string;
    linkHint?: { href: string; label: string };
    submitLabel: string;
    successMessage: string;
  }
> = {
  artist: {
    title: "Show us what you make",
    intro: [
      "Submit your art for consideration in our upcoming live exhibitions and events.",
      "If selected, you will receive a complimentary artist membership, granting you entry to our events for 1 year, and exposure to our global community of art, music, and technology enthusiasts.",
      "We are looking for innovative digital art that aligns with our themes of energy, technology, and culture.",
      "Our team will review submissions and contact selected artists shortly.",
      "Your information is kept confidential and used only for review and contact purposes.",
    ],
    linkLabel: "Artwork Link *",
    linkHint: {
      href: "https://base.app/invite/sunshinev/R80CCWVY",
      label:
        "WE ONLY ACCEPT ONCHAIN ARTWORKS - if your work is not on any blockchain, please upload it to Base App as a post, it is free to use. Paste the link here or from the marketplace of your choice. Click here to see how.",
    },
    submitLabel: "Submit",
    successMessage: "Thank you! Your submission has been received. Check your email for confirmation.",
  },
  dev: {
    title: "Ship your build into \u00A9 SPECTRA",
    intro: [
      "This lane is for developers, founders, makers, and digital studios building apps, tools, products, or internet-native experiences.",
      "If your project should be discovered by SPECTRA attendees, collaborators, and our broader ecosystem, send us the core link and context here.",
      "We are looking for projects that feel culturally sharp, technically interesting, and ready to be activated with real users.",
      "Our team reviews each submission for possible showcases, partnerships, community drops, and live ecosystem placements.",
      "Your information is kept confidential and used only for review and contact purposes.",
    ],
    linkLabel: "Project / Product Link *",
    submitLabel: "Send Project",
    successMessage: "Thank you! Your project has been received. Check your email for confirmation.",
  },
};

export default function SubmissionForm({ variant = "artist" }: SubmissionFormProps) {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
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
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [walletError, setWalletError] = useState("");
  const content = formContent[variant];

  const inputClassName =
    "w-full bg-[#0a0a0a] px-4 py-3 text-sm text-white placeholder:text-white/36 focus:outline-none focus:ring-1 focus:ring-white/24";

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const validateWallet = (wallet: string) => {
    if (!wallet) {
      setWalletStatus("idle");
      setWalletError("Wallet address or ENS is required");
      setResolvedAddress(null);
      return false;
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
    setWalletError("Must be a valid EVM address (starts with 0x) or ENS name (.eth)");
    setResolvedAddress(null);
    return false;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (name === "wallet") validateWallet(value);
  };

  const handleCaptcha = (token: string | null) => {
    setRecaptchaToken(token);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    if (!formData.name || !formData.email || !formData.phone || !formData.wallet || !formData.artworkLink) {
      setStatus("error");
      setMessage("All fields are required except Telegram and Instagram.");
      return;
    }
    if (!validateEmail(formData.email)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }
    if (walletStatus !== "valid") {
      setStatus("error");
      setMessage("Please provide a valid wallet address or ENS name.");
      return;
    }
    if (!recaptchaToken) {
      setStatus("error");
      setMessage("Please complete the CAPTCHA.");
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
        setRecaptchaToken(null);
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
      } else {
        const errorPayload = await response.json();
        setStatus("error");
        setMessage(errorPayload.error || "Something went wrong. Please try again or contact support.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again or contact support.");
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center px-6 py-32">
      <BeamsBackground />

      <div className="relative z-10 mx-auto w-full max-w-xl bg-[rgba(8,8,8,0.92)] p-8 shadow-[0_34px_90px_rgba(0,0,0,0.46)] sm:p-10">
        <style>{`
          .phone-wrap .PhoneInput { display: flex; align-items: center; background: #0a0a0a; }
          .phone-wrap .PhoneInputInput { flex: 1; padding: 0.75rem 1rem; background: #0a0a0a; border: none; color: white; font-size: 0.875rem; outline: none; }
          .phone-wrap .PhoneInputInput::placeholder { color: rgba(255,255,255,0.36); }
          .phone-wrap .PhoneInputCountrySelect { background: #0a0a0a; color: white; border: none; padding: 0.5rem 0.75rem; cursor: pointer; }
          .phone-wrap .PhoneInputCountrySelectArrow { color: rgba(255,255,255,0.7); }
        `}</style>

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
            <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-white/48">Name / Alias</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={inputClassName}
            />
          </div>

          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-white/48">Email Address</label>
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
            <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-white/48">Phone Number</label>
            <div className="phone-wrap">
              <PhoneInput
                international
                defaultCountry="MX"
                value={formData.phone}
                onChange={(value: string | undefined) => setFormData((current) => ({ ...current, phone: value || "" }))}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-white/48">Wallet Address or ENS (.eth)</label>
            <input
              name="wallet"
              value={formData.wallet}
              onChange={handleChange}
              onBlur={() => validateWallet(formData.wallet)}
              required
              className={inputClassName}
            />
            {walletStatus === "resolving" ? <p className="mt-1 text-xs text-white/52">Resolving ENS...</p> : null}
            {walletStatus === "valid" && resolvedAddress ? (
              <p className="mt-1 text-xs text-white/52">Resolved to: {resolvedAddress}</p>
            ) : null}
            {walletError ? <p className="mt-1 text-xs text-white/44">{walletError}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-white/48">{content.linkLabel.replace(" *", "")}</label>
            {content.linkHint ? (
              <a
                href={content.linkHint.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-3 block text-[10px] uppercase tracking-[0.16em] text-white/42 transition-colors hover:text-white/72"
              >
                {content.linkHint.label}
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
            <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-white/48">Telegram (optional)</label>
            <input
              name="telegram"
              value={formData.telegram}
              onChange={handleChange}
              placeholder="@username or https://t.me/username"
              className={inputClassName}
            />
          </div>

          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-white/48">Instagram (optional)</label>
            <input
              name="instagram"
              value={formData.instagram}
              onChange={handleChange}
              placeholder="@username or https://instagram.com/username"
              className={inputClassName}
            />
          </div>

          <ReCAPTCHA ref={recaptchaRef} sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!} onChange={handleCaptcha} />

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-white px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-black transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "loading" ? "Sending..." : content.submitLabel}
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
