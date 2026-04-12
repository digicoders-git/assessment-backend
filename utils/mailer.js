import nodemailer from 'nodemailer';

export const sendOtpEmail = async (toEmail, otp, userName) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    await transporter.sendMail({
      from: `"DigiCoders Assessment Portal" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: 'Your OTP - DigiCoders Assessment Portal',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
          <div style="background:#319795;padding:24px;text-align:center;">
            <h2 style="color:#fff;margin:0;">DigiCoders Assessment Portal</h2>
          </div>
          <div style="padding:32px;">
            <p style="color:#2D3748;font-size:16px;">Hello <strong>${userName}</strong>,</p>
            <p style="color:#4A5568;">Use the OTP below to complete your login. It is valid for <strong>5 minutes</strong>.</p>
            <div style="text-align:center;margin:32px 0;">
              <span style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#319795;background:#E6FFFA;padding:16px 32px;border-radius:8px;">${otp}</span>
            </div>
            <p style="color:#718096;font-size:13px;">If you did not request this, please ignore this email.</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error('SMTP Error:', error.message);
    throw new Error('Failed to send OTP email: ' + error.message);
  }
};

export const sendDownloadOtpEmail = async (toEmail, otp, userName) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    await transporter.sendMail({
      from: `"DigiCoders Assessment Portal" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: '🔐 Download Verification OTP - DigiCoders Assessment Portal',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
          <div style="background:#2563eb;padding:24px;text-align:center;">
            <h2 style="color:#fff;margin:0;">🔒 Secure Download Verification</h2>
          </div>
          <div style="padding:32px;">
            <p style="color:#2D3748;font-size:16px;">Hello <strong>${userName}</strong>,</p>
            <p style="color:#4A5568;">A request has been made to <strong>download student data</strong> from the admin panel.</p>
            <p style="color:#4A5568;">Use the OTP below to authorize this download. It is valid for <strong>5 minutes</strong>.</p>
            <div style="text-align:center;margin:32px 0;">
              <span style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#2563eb;background:#dbeafe;padding:16px 32px;border-radius:8px;">${otp}</span>
            </div>
            <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px;margin:20px 0;border-radius:4px;">
              <p style="color:#92400e;font-size:13px;margin:0;">⚠️ <strong>Security Notice:</strong> This OTP is required to download sensitive student data. If you did not initiate this request, please contact your system administrator immediately.</p>
            </div>
            <p style="color:#718096;font-size:13px;margin-top:24px;">This is an automated security measure to protect student data.</p>
          </div>
          <div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="color:#6b7280;font-size:12px;margin:0;">DigiCoders Assessment Portal - Secure Data Management</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error('SMTP Error:', error.message);
    throw new Error('Failed to send download OTP email: ' + error.message);
  }
};
