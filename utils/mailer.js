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
      subject: `DigiCoders Assessment Portal OTP for Login: ${otp}`,
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
      subject: `🔐 Your OTP is ${otp} - DigiCoders Assessment Portal`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <div style="background:linear-gradient(135deg,#1e40af,#2563eb);padding:28px 24px;text-align:center;">
            <div style="font-size:32px;margin-bottom:8px;">📊</div>
            <h2 style="color:#fff;margin:0;font-size:20px;">DigiCoders Assessment Portal</h2>
            <p style="color:#bfdbfe;margin:6px 0 0;font-size:13px;">Secure Data Download Authorization</p>
          </div>

          <!-- Alert Banner -->
          <div style="background:#fef9c3;border-left:4px solid #eab308;padding:12px 20px;display:flex;align-items:center;">
            <span style="font-size:18px;margin-right:10px;">⚠️</span>
            <p style="color:#854d0e;font-size:13px;margin:0;"><strong>Action Required:</strong> A data download has been requested from the admin panel.</p>
          </div>

          <!-- Body -->
          <div style="padding:32px 28px;">
            <p style="color:#1e293b;font-size:16px;margin-top:0;">Hello <strong>${userName}</strong>,</p>

            <!-- Download Info Box -->
            <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:16px 20px;margin:20px 0;">
              <p style="color:#0369a1;font-size:13px;font-weight:bold;margin:0 0 8px;">📥 Download Request Details</p>
              <table style="width:100%;font-size:13px;color:#334155;">
                <tr><td style="padding:4px 0;">🌐 <strong>Portal:</strong></td><td>DigiCoders Assessment Portal</td></tr>
                <tr><td style="padding:4px 0;">📂 <strong>Data Type:</strong></td><td>Student Assessment Results (Excel)</td></tr>
                <tr><td style="padding:4px 0;">👤 <strong>Requested By:</strong></td><td>${userName}</td></tr>
                <tr><td style="padding:4px 0;">🕐 <strong>Time:</strong></td><td>${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</td></tr>
              </table>
            </div>

            <p style="color:#475569;font-size:14px;">Enter the OTP below in the admin panel to authorize this download:</p>

            <!-- OTP Box -->
            <div style="text-align:center;margin:28px 0;">
              <div style="display:inline-block;background:#dbeafe;border:2px dashed #2563eb;border-radius:10px;padding:18px 36px;">
                <p style="color:#1e40af;font-size:12px;font-weight:bold;margin:0 0 8px;letter-spacing:2px;">YOUR OTP</p>
                <span style="font-size:40px;font-weight:bold;letter-spacing:14px;color:#1d4ed8;">${otp}</span>
                <p style="color:#64748b;font-size:11px;margin:8px 0 0;">Valid for 5 minutes only</p>
              </div>
            </div>

            <!-- Security Notice -->
            <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px 18px;">
              <p style="color:#991b1b;font-size:13px;margin:0;">🔒 <strong>Security Notice:</strong> If you did not initiate this download request, please contact your system administrator immediately and do not share this OTP with anyone.</p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="color:#94a3b8;font-size:12px;margin:0;">DigiCoders Technologies Pvt. Ltd. &nbsp;|&nbsp; Assessment Portal &nbsp;|&nbsp; Automated Security Email</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error('SMTP Error:', error.message);
    throw new Error('Failed to send download OTP email: ' + error.message);
  }
};
