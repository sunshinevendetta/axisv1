import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, wallet, artworkLink, telegram, instagram, recaptchaToken } = body;

    if (!name || !email || !phone || !wallet || !artworkLink || !recaptchaToken) {
      return NextResponse.json({ error: 'All fields except Telegram and Instagram are required' }, { status: 400 });
    }

    // Verify reCAPTCHA v3
    const recaptchaRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET_KEY!,
        response: recaptchaToken,
      }),
    });

    const recaptchaData = await recaptchaRes.json();

    if (!recaptchaData.success || recaptchaData.score < 0.5) {
      return NextResponse.json({ error: 'CAPTCHA verification failed - please try again' }, { status: 400 });
    }

    let finalWallet = wallet;
    if (wallet.toLowerCase().endsWith('.eth')) {
      const ensRes = await fetch(`https://api.ens.domains/resolve?name=${wallet}`);
      const ensData = await ensRes.json();
      if (ensData.address) {
        finalWallet = ensData.address;
      } else {
        return NextResponse.json({ error: 'Invalid ENS name' }, { status: 400 });
      }
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.BREVO_SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS,
      },
    });

    // Admin notification
    await transporter.sendMail({
      from: `"SPECTRA ART" <${process.env.CUSTOM_FROM}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Submission – ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background:#000; color:#fff;">
          <h2>New Submission Received</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Wallet:</strong> ${finalWallet}</p>
          <p><strong>Artwork Link:</strong> ${artworkLink}</p>
          <p><strong>Telegram:</strong> ${telegram || '—'}</p>
          <p><strong>Instagram:</strong> ${instagram || '—'}</p>
        </div>
      `,
    });

    // Auto-response to user
    await transporter.sendMail({
      from: `"SPECTRA ART" <${process.env.CUSTOM_FROM}>`,
      to: email,
      subject: `Thank You for Your Submission, ${name}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background:#000; color:#fff;">
          <h2>Thank You, ${name}!</h2>
          <p>We received your details and are excited to review them.</p>
          <ul>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Phone:</strong> ${phone}</li>
            <li><strong>Wallet:</strong> ${finalWallet}</li>
            <li><strong>Artwork Link:</strong> ${artworkLink}</li>
            <li><strong>Telegram:</strong> ${telegram || '—'}</li>
            <li><strong>Instagram:</strong> ${instagram || '—'}</li>
          </ul>
          <p>We'll be in touch shortly if your work aligns with our vision.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Send error:', err.message);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}