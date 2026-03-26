import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, wallet, nftLink } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS,
      },
    });

    // Admin notification (to you)
    await transporter.sendMail({
      from: `"AXIS" <${process.env.CUSTOM_FROM}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Submission – ${name}`,
      text: `Name: ${name}
Email: ${email}
Phone: ${phone || '—'}
Wallet: ${wallet || '—'}
NFT Link: ${nftLink || '—'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #111;">New Submission Received</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p><strong>Wallet:</strong> ${wallet || 'Not provided'}</p>
          <p><strong>NFT Link:</strong> ${nftLink ? `<a href="${nftLink}">${nftLink}</a>` : 'Not provided'}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">
            Received via AXIS landing page
          </p>
        </div>
      `,
    });

    // Auto-response to user
    await transporter.sendMail({
      from: `"AXIS" <${process.env.CUSTOM_FROM}>`,
      to: email,
      subject: `Thank You for Your Submission, ${name}!`,
      text: `Hi ${name},

Thank you for sharing your details with AXIS.
We have received:
- Wallet: ${wallet || '—'}
- NFT Link: ${nftLink || '—'}

Our team will review it and get in touch soon.

Best regards,
AXIS Team
https://axis.show`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #111;">Thank You, ${name}!</h2>
          <p>We received your submission and are excited to review it.</p>
          <ul style="margin: 20px 0; padding-left: 20px;">
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Wallet:</strong> ${wallet || '—'}</li>
            <li><strong>NFT Link:</strong> ${nftLink || '—'}</li>
          </ul>
          <p>We'll be in touch shortly.</p>
          <p style="margin-top: 30px; font-size: 14px; color: #444;">
            — AXIS Team<br>
            <a href="https://axis.show" style="color: #0066cc;">axis.show</a>
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Send error:', err.message);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
