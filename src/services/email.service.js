import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  if (!env.EMAIL_HOST || !env.EMAIL_USER) {
    return null;
  }
  transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT ?? 587,
    secure: env.EMAIL_SECURE === true,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS ?? '',
    },
  });
  return transporter;
}

/**
 * Sends a simple HTML email. If SMTP is not configured, logs and returns false.
 */
export async function sendMail({ to, subject, text, html }) {
  const tx = getTransporter();
  if (!tx) {
    console.warn('[email] SMTP not configured — skipping send. Set EMAIL_* in .env');
    return false;
  }
  const info = await tx.sendMail({
    from: env.EMAIL_FROM ?? 'noreply@localhost',
    to,
    subject,
    text,
    html,
  });
  if (process.env.NODE_ENV === 'development') {
    console.log('[email] sent:', info.messageId);
  }
  return true;
}
