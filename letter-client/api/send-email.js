// Vercel serverless function for sending emails
// This runs on Vercel's infrastructure (which allows SMTP)
// Called from Render backend via HTTP

import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  // CORS headers (allow requests from Render backend)
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['https://dearly-server-v2.onrender.com', 'http://localhost:5000'];

  const origin = req.headers.origin || req.headers.referer;
  if (origin && allowedOrigins.some(allowed => origin.startsWith(allowed))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { 
      recipientEmail, 
      recipientName, 
      senderName, 
      shareableLink, 
      letterTitle,
      subject,
      html,
      text,
      from,
      to
    } = req.body;

    // Support both letter email format and generic email format
    const emailData = {
      recipientEmail: recipientEmail || to,
      recipientName: recipientName,
      senderName: senderName,
      shareableLink,
      letterTitle,
      subject,
      html,
      text,
      from,
      to
    };

    // Validate required fields
    const emailTo = emailData.recipientEmail || emailData.to;
    if (!emailTo) {
      return res.status(400).json({
        success: false,
        error: 'Recipient email is required',
      });
    }

    // Get Gmail credentials from environment variables
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const fromName = process.env.EMAIL_FROM_NAME || 'Dearly 💌';

    if (!emailUser || !emailPass) {
      console.error('Missing EMAIL_USER or EMAIL_PASS environment variables');
      return res.status(500).json({
        success: false,
        error: 'Email service not configured',
      });
    }

    // Create Gmail transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    // Prepare email content
    let mailOptions;

    // If this is a letter email (has shareableLink), use letter template
    if (shareableLink && !html && !text) {
      const receiverName = recipientName || 'there';
      const sender = senderName || 'Someone special';
      const title = letterTitle || 'A special letter for you';

      // Plain text version
      const textContent = `Hello ${receiverName},

${sender} has a special letter for you on Dearly.

Open your letter here: ${shareableLink}

Made with ❤️ by ${sender} for ${receiverName}

If you didn't expect this email, you can safely ignore it.`;

      // HTML version
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>A letter for you</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Georgia', 'Times New Roman', serif; background: linear-gradient(135deg, #fef3f2 0%, #fce7f3 50%, #fae8ff 100%);">
          <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #fef3f2 0%, #fce7f3 50%, #fae8ff 100%); padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: linear-gradient(135deg, rgba(254, 243, 242, 0.95) 0%, rgba(252, 231, 243, 0.95) 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); backdrop-filter: blur(10px);">
                  <!-- Header -->
                  <tr>
                    <td align="center" style="padding: 40px 30px 30px; background: linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(251, 113, 133, 0.1) 100%);">
                      <div style="text-align: center;">
                        <h1 style="color: #ec4899; font-size: 36px; margin: 0; font-weight: bold; letter-spacing: 2px;">Dearly</h1>
                        <p style="color: #9f1239; font-size: 14px; margin: 8px 0 0; font-style: italic; letter-spacing: 1px;">Express your heart, beautifully</p>
                      </div>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);">
                        <!-- Greeting -->
                        <h2 style="color: #1f2937; font-size: 28px; margin: 0 0 20px; font-weight: normal; line-height: 1.4;">
                          Hello ${receiverName} 💕
                        </h2>

                        <!-- Romantic Message -->
                        <p style="color: #4b5563; font-size: 17px; line-height: 1.8; margin: 0 0 24px; font-style: italic;">
                          In the quiet moments between heartbeats, someone has poured their heart into words meant only for you.
                        </p>

                        <p style="color: #4b5563; font-size: 17px; line-height: 1.8; margin: 0 0 24px; font-style: italic;">
                          A letter awaits, carrying emotions that words alone cannot express. It's a piece of someone's soul, wrapped in digital parchment, waiting to touch your heart.
                        </p>

                        <p style="color: #6b7280; font-size: 16px; line-height: 1.7; margin: 0 0 40px; font-style: italic; text-align: center;">
                          ✨ Open it when you're ready to feel something beautiful ✨
                        </p>

                        <!-- CTA Button -->
                        <div style="text-align: center; margin: 40px 0;">
                          <a href="${shareableLink}" 
                             style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%); color: white; padding: 18px 48px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 18px; box-shadow: 0 6px 20px rgba(236, 72, 153, 0.4); transition: transform 0.2s;">
                            Open Your Letter 💌
                          </a>
                        </div>

                        <!-- Alternative Link -->
                        <div style="margin: 32px 0 0; padding: 20px; background: linear-gradient(135deg, #fef3f2 0%, #fce7f3 100%); border-radius: 8px; border: 2px solid #ec4899;">
                          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 12px; text-align: center; font-weight: 600;">
                            Or copy and paste this link:
                          </p>
                          <p style="color: #ec4899; font-size: 14px; word-break: break-all; background: white; padding: 16px; border-radius: 8px; margin: 0; text-align: center; border: 1px solid #fce7f3; font-family: 'Courier New', monospace; line-height: 1.6;">
                            <a href="${shareableLink}" style="color: #ec4899; text-decoration: underline;">${shareableLink}</a>
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td align="center" style="padding: 30px; background: rgba(255, 255, 255, 0.9); border-top: 1px solid rgba(236, 72, 153, 0.2);">
                      <p style="color: #4b5563; font-size: 14px; margin: 0; line-height: 1.8; font-weight: 500;">
                        Made with <span style="color: #ec4899; font-size: 16px;">❤️</span> by <strong style="color: #ec4899;">${sender}</strong> for <strong style="color: #ec4899;">${receiverName}</strong>
                      </p>
                      <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0; line-height: 1.6;">
                        If you didn't expect this email, you can safely ignore it.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      mailOptions = {
        from: `"${fromName}" <${emailUser}>`,
        to: emailTo,
        subject: subject || `💌 ${sender} has a letter for you`,
        text: textContent,
        html: htmlContent,
      };
    } else {
      // Generic email format (from Render backend)
      mailOptions = {
        from: from || `"${fromName}" <${emailUser}>`,
        to: emailTo,
        subject: subject || 'A message from Dearly',
        text: text || '',
        html: html || text || '',
      };
    }

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent successfully:', {
      messageId: info.messageId,
      to: emailTo,
    });

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
    });

  } catch (error) {
    console.error('❌ Error sending email:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to send email',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

