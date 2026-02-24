import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, wallet, artworkLink, telegram, instagram, recaptchaToken } = body;

    if (!name || !email || !phone || !wallet || !artworkLink || !recaptchaToken) {
      return NextResponse.json({ error: 'All fields except Telegram and Instagram are required' }, { status: 400 });
    }

    // Verify reCAPTCHA v2
    const recaptchaRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET_KEY!,
        response: recaptchaToken,
      }),
    });

    const recaptchaData = await recaptchaRes.json();
    console.log('reCAPTCHA response:', recaptchaData); // Log for debugging

    if (!recaptchaData.success) {
      return NextResponse.json({ error: 'CAPTCHA verification failed - please try again' }, { status: 400 });
    }

    // No ENS resolution - use wallet as-is (client validation ensures format)
    const finalWallet = wallet;

    console.log('Creating transporter...');
    const transporter = nodemailer.createTransport({
      host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
      port: Number(process.env.BREVO_SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER || 'a2dee5001@smtp-brevo.com',
        pass: process.env.BREVO_SMTP_PASS,
      },
    });

    // Verify connection
    await new Promise((resolve, reject) => {
      transporter.verify((error, success) => {
        if (error) {
          console.error('Transporter verification failed:', error);
          reject(error);
        } else {
          console.log('Transporter verified successfully');
          resolve(success);
        }
      });
    });

    console.log('Sending admin email...');
    await transporter.sendMail({
      from: `"SPECTRA ART" <${process.env.CUSTOM_FROM || 'art@spectrart.xyz'}>`,
      to: process.env.ADMIN_EMAIL || 'spectrartxyz@gmail.com',
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

    console.log('Sending user confirmation email...');
    await transporter.sendMail({
      from: `"SPECTRA ART" <${process.env.CUSTOM_FROM || 'art@spectrart.xyz'}>`,
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

    console.log('Both emails sent successfully');
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Detailed send error:', {
      message: err.message,
      stack: err.stack,
      code: err.code,
      errno: err.errno,
      syscall: err.syscall,
    });
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}