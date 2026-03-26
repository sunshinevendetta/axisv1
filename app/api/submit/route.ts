import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      wallet,
      artworkLink,
      projectLink,
      telegram,
      instagram,
      recaptchaToken,
      submissionType,
    } = body;
    const link = artworkLink || projectLink;
    const isDevSubmission = submissionType === 'dev';
    const submissionLabel = isDevSubmission ? 'Developer Submission' : 'Art Submission';
    const linkLabel = isDevSubmission ? 'Project / Product Link' : 'Artwork Link';
    const membershipLabel = isDevSubmission ? 'Builder Access' : 'Artist Membership';

    if (!name || !email || !phone || !wallet || !link || !recaptchaToken) {
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
      from: `"AXIS" <${process.env.CUSTOM_FROM || 'art@axis.show'}>`,
      to: process.env.ADMIN_EMAIL || 'hello@axis.show',
      subject: `New ${submissionLabel} – ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background:#000; color:#fff;">
          <h2>New ${submissionLabel} Received</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Wallet:</strong> ${finalWallet}</p>
          <p><strong>${linkLabel}:</strong> ${link}</p>
          <p><strong>Telegram:</strong> ${telegram || '—'}</p>
          <p><strong>Instagram:</strong> ${instagram || '—'}</p>
        </div>
      `,
    });

    console.log('Sending user confirmation email...');
    await transporter.sendMail({
      from: `"AXIS" <${process.env.CUSTOM_FROM || 'art@axis.show'}>`,
      to: email,
      subject: `Thank You for Your ${isDevSubmission ? 'Project' : 'Submission'}, ${name}! – AXIS`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thank You for Submitting to AXIS</title>
        </head>
        <body style="margin:0; padding:0; font-family: Arial, Helvetica, sans-serif; background-color:#000; color:#ffffff;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; margin:0 auto; background:#000;">
            <!-- Header / Logo -->
            <tr>
              <td align="center" style="padding: 40px 0 20px;">
                <img 
                  src="https://raw.githubusercontent.com/sunshinevendetta/spectra/refs/heads/main/public/logow.png" 
                  alt="AXIS Logo" 
                  width="180" 
                  style="display:block; max-width:180px; height:auto;"
                />
              </td>
            </tr>

            <!-- Greeting -->
            <tr>
              <td style="padding: 0 30px 20px; text-align:center;">
                <h1 style="margin:0; font-size:28px; color:#ffffff;">Thank You, ${name}!</h1>
                <p style="margin:12px 0 0; font-size:16px; color:#cccccc;">
                  Your ${isDevSubmission ? 'project' : 'submission'} has been successfully received.
                </p>
              </td>
            </tr>

            <!-- Main Content -->
            <tr>
              <td style="padding: 0 30px 30px; font-size:16px; line-height:1.6; color:#dddddd;">
                <p>${isDevSubmission
                  ? 'We are excited to review what you are building and appreciate you sharing it with the AXIS community.'
                  : 'We are excited to review your work and appreciate you sharing it with the AXIS community.'
                }</p>
                
                <p><strong>Here's what you shared with us:</strong></p>
                <ul style="margin:0; padding-left:20px; color:#cccccc;">
                  <li><strong>Name / Alias:</strong> ${name}</li>
                  <li><strong>Email:</strong> ${email}</li>
                  <li><strong>Phone:</strong> ${phone}</li>
                  <li><strong>Wallet Address / ENS:</strong> ${finalWallet}</li>
                  <li><strong>${linkLabel}:</strong> <a href="${link}" style="color:#00d1ff; text-decoration:none;">${link}</a></li>
                  ${telegram ? `<li><strong>Telegram:</strong> ${telegram}</li>` : ''}
                  ${instagram ? `<li><strong>Instagram:</strong> ${instagram}</li>` : ''}
                </ul>

                <p style="margin:30px 0 10px;">
                  <strong>Next steps:</strong> Our curation team will review your submission shortly. 
                  ${isDevSubmission
                    ? 'If your product aligns with our vision, we will contact you directly via email or the channels you provided.'
                    : 'If your artwork aligns with our vision, we will contact you directly via email or the channels you provided.'
                  }
                </p>

                <p style="margin:20px 0;">
                  If selected, you will receive a complimentary <strong>${membershipLabel}</strong> for the season, which grants:
                </p>
                <ul style="margin:0 0 20px; padding-left:20px; color:#cccccc;">
                  <li>Access to all AXIS events (main shows + partner events)</li>
                  <li>${isDevSubmission
                    ? 'Potential project activation, demo placement, or product showcase across our season lineup and collaborating brand events'
                    : 'Potential exhibition of your submitted artwork across our season lineup and collaborating brand events'
                  }</li>
                  <li>Exposure to our global network of art, music, technology, and culture enthusiasts</li>
                </ul>

                <p style="margin:30px 0 0; color:#aaaaaa; font-size:14px;">
                  Thank you again for being part of AXIS. We look forward to possibly featuring your vision.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding: 30px; font-size:13px; color:#777777; border-top:1px solid #222;">
                <p style="margin:0 0 4px;">AXIS</p>
                <p style="margin:0 0 12px;">
                  Unexpected Art Experiences Worldwide<br>
                  Crafted in Mexico City — thinking local, building GLOBAL
                </p>
                <p style="margin:8px 0 0; line-height:1.8;">
                  <a href="https://axis.show" style="color:#00d1ff; text-decoration:none;">axis.show</a>
                  &nbsp;|&nbsp;
                  <a href="https://x.com/axis.show" style="color:#00d1ff; text-decoration:none;">X</a>
                  &nbsp;|&nbsp;
                  <a href="https://instagram.com/axis.show" style="color:#00d1ff; text-decoration:none;">Instagram</a>
                  &nbsp;|&nbsp;
                  <a href="https://base.app/profile/axis.show" style="color:#00d1ff; text-decoration:none;">Base</a>
                  &nbsp;|&nbsp;
                  <a href="https://hey.xyz/u/axis.show" style="color:#00d1ff; text-decoration:none;">Lens</a>
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
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
