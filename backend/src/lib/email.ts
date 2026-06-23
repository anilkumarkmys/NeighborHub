import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER || 'apikey',
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOtpEmail(to: string, otp: string) {
  await transporter.sendMail({
    from: `"NeighborHub" <${process.env.FROM_EMAIL || 'noreply@neighborhub.app'}>`,
    to,
    subject: 'Verify Your Address - NeighborHub',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #00B060;">Welcome to NeighborHub!</h2>
        <p>Your address verification code is:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2D3748; padding: 20px 0;">${otp}</div>
        <p style="color: #718096;">This code expires in 10 minutes. Do not share it with anyone.</p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(to: string, firstName: string, neighborhood: string) {
  await transporter.sendMail({
    from: `"NeighborHub" <${process.env.FROM_EMAIL || 'noreply@neighborhub.app'}>`,
    to,
    subject: `Welcome to ${neighborhood} on NeighborHub!`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #00B060;">You're in, ${firstName}!</h2>
        <p>You've been verified and added to <strong>${neighborhood}</strong>.</p>
        <p>Start connecting with your neighbors today.</p>
      </div>
    `,
  });
}
