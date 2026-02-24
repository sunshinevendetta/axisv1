"use client";

import { useState } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import BeamsBackground from "@/components/backgrounds/BeamsBackground";

export default function SubmissionForm() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    wallet: '',
    artworkLink: '',
    telegram: '',
    instagram: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [walletStatus, setWalletStatus] = useState<'idle' | 'valid' | 'invalid' | 'resolving'>('idle');
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [walletError, setWalletError] = useState('');

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const validateWallet = (wallet: string) => {
    if (!wallet) {
      setWalletStatus('idle');
      setWalletError('Wallet address or ENS is required');
      setResolvedAddress(null);
      return false;
    }
    setWalletStatus('resolving');
    setWalletError('');
    if (/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      setWalletStatus('valid');
      setResolvedAddress(wallet);
      return true;
    }
    if (wallet.toLowerCase().endsWith('.eth')) {
      setWalletStatus('valid');
      setResolvedAddress(null);
      return true;
    }
    setWalletStatus('invalid');
    setWalletError('Must be a valid EVM address (starts with 0x) or ENS name (.eth)');
    setResolvedAddress(null);
    return false;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'wallet') validateWallet(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    if (!formData.name || !formData.email || !formData.phone || !formData.wallet || !formData.artworkLink) {
      setStatus('error');
      setMessage('All fields are required except Telegram and Instagram.');
      return;
    }
    if (!validateEmail(formData.email)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }
    if (walletStatus !== 'valid') {
      setStatus('error');
      setMessage('Please provide a valid wallet address or ENS name.');
      return;
    }
    if (!executeRecaptcha) {
      setStatus('error');
      setMessage('reCAPTCHA not ready, please try again.');
      return;
    }

    const recaptchaToken = await executeRecaptcha('submit_form');

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, recaptchaToken }),
      });

      if (res.ok) {
        setStatus('success');
        setMessage('Thank you! Your submission has been received. Check your email for confirmation.');
        setFormData({ name: '', email: '', phone: '', wallet: '', artworkLink: '', telegram: '', instagram: '' });
        setResolvedAddress(null);
        setWalletStatus('idle');
      } else {
        const err = await res.json();
        setStatus('error');
        setMessage(err.error || 'Something went wrong. Please try again or contact support.');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again or contact support.');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center py-32 px-6">
      <BeamsBackground />

      <div className="max-w-md mx-auto p-6 bg-black/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl relative z-10">
        <style>{`
          .phone-wrap .PhoneInput { display: flex; align-items: center; background: black; border: 1px solid rgba(255,255,255,0.3); border-radius: 0.5rem; }
          .phone-wrap .PhoneInputInput { flex: 1; padding: 0.75rem 1rem; background: black; border: none; color: white; font-size: 0.875rem; outline: none; }
          .phone-wrap .PhoneInputInput::placeholder { color: rgba(255,255,255,0.5); }
          .phone-wrap .PhoneInputCountrySelect { background: black; color: white; border: none; border-right: 1px solid rgba(255,255,255,0.3); padding: 0.5rem 0.75rem; cursor: pointer; }
          .phone-wrap .PhoneInputCountrySelectArrow { color: rgba(255,255,255,0.7); }
        `}</style>

        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Show us what you make
        </h2>

        <div className="text-white/80 text-center mb-8 text-base leading-relaxed space-y-4">
          <p>Submit your art for consideration in our upcoming live exhibitions and events.</p>
          <p>If selected, you will receive a complimentary artist membership, granting you entry to our events for 1 year, and exposure to our global community of art, music, and technology enthusiasts.</p>
          <p>We are looking for innovative digital art that aligns with our themes of energy, technology, and culture.</p>
          <p>Our team will review submissions and contact selected artists shortly.</p>
          <p>Your information is kept confidential and used only for review and contact purposes.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-white font-medium mb-1 text-sm">Name / Alias *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-black border border-white/30 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-white transition text-sm"
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-1 text-sm">Email Address *</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-black border border-white/30 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-white transition text-sm"
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-1 text-sm">Phone Number *</label>
            <div className="phone-wrap">
              <PhoneInput
                international
                defaultCountry="MX"
                value={formData.phone}
                onChange={(value: string | undefined) => setFormData(prev => ({ ...prev, phone: value || '' }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-white font-medium mb-1 text-sm">Wallet Address or ENS (.eth) *</label>
            <input
              name="wallet"
              value={formData.wallet}
              onChange={handleChange}
              onBlur={() => validateWallet(formData.wallet)}
              required
              className="w-full px-4 py-3 bg-black border border-white/30 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:border-white transition text-sm"
            />
            {walletStatus === 'resolving' && <p className="text-white/60 text-xs mt-1">Resolving ENS...</p>}
            {walletStatus === 'valid' && resolvedAddress && (
              <p className="text-green-300 text-xs mt-1">Resolved to: {resolvedAddress}</p>
            )}
            {walletError && <p className="text-red-400 text-xs mt-1">{walletError}</p>}
          </div>

          <div>
            <label className="block text-white font-medium mb-1 text-sm">Artwork Link *</label>
            <a
              href="https://base.app/invite/sunshinev/R80CCWVY"
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-1 mb-2 text-white/60 text-[8px] leading-tight hover:text-white transition-colors"
            >
              WE ONLY ACCEPT ONCHAIN ARTWORKS — if your work is not on any blockchain, please upload it to Base App as a post, it is free to use. Paste the link here or from the marketplace of your choice. Click here to see how.
            </a>
            <input
              name="artworkLink"
              value={formData.artworkLink}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-black border border-white/30 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:border-white transition text-sm"
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-1 text-sm">Telegram (optional)</label>
            <input
              name="telegram"
              value={formData.telegram}
              onChange={handleChange}
              placeholder="@username or https://t.me/username"
              className="w-full px-4 py-3 bg-black border border-white/30 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:border-white transition text-sm"
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-1 text-sm">Instagram (optional)</label>
            <input
              name="instagram"
              value={formData.instagram}
              onChange={handleChange}
              placeholder="@username or https://instagram.com/username"
              className="w-full px-4 py-3 bg-black border border-white/30 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:border-white transition text-sm"
            />
          </div>

          <p className="text-white/30 text-[10px] text-center">
            Protected by reCAPTCHA —{' '}
            <a href="https://policies.google.com/privacy" className="underline" target="_blank" rel="noopener noreferrer">
              Privacy
            </a>
            {' '}&amp;{' '}
            <a href="https://policies.google.com/terms" className="underline" target="_blank" rel="noopener noreferrer">
              Terms
            </a>
          </p>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-4 px-8 bg-white text-black font-semibold rounded-xl hover:bg-black hover:text-white hover:scale-105 hover:shadow-2xl hover:border-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border border-black"
          >
            {status === 'loading' ? 'Sending...' : 'Submit'}
          </button>
        </form>

        {status === 'success' && (
          <p className="mt-6 text-center text-green-300 font-medium text-lg">{message}</p>
        )}
        {status === 'error' && (
          <p className="mt-6 text-center text-red-400 font-medium text-lg">{message}</p>
        )}
      </div>
    </div>
  );
}