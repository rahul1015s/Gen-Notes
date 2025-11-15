import nodemailer from 'nodemailer';
import { 
  forgotPasswordTemplate, 
  otpVerificationTemplate, 
  welcomeVerificationTemplate 
} from './emailTemplates/emailtemplates.js';

// Email configuration
const emailConfig = {
  appName: process.env.APP_NAME || 'GenNotes',
  supportEmail: process.env.SUPPORT_EMAIL || process.env.SMTP_USER,
  fromEmail: process.env.FROM_EMAIL || process.env.SMTP_USER,
  fromName: process.env.FROM_NAME || 'GenNotes'
};

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.zoho.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ Email transporter error:', error);
  } else {
    console.log('✅ Email server is ready to take messages');
  }
});

// Base email sender
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`,
      to,
      subject,
      html,
      // Text fallback for email clients that don't support HTML
      text: html.replace(/<[^>]*>/g, ''),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent: ${subject} to ${to} (${info.messageId})`);
    return info;
  } catch (error) {
    console.error(`❌ Email sending failed for ${to}:`, error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Specific email functions
export const sendResetPasswordEmail = async (email, name, resetURL) => {
  const html = forgotPasswordTemplate(
    name, 
    resetURL, 
    emailConfig.appName, 
    emailConfig.supportEmail
  );
  
  return await sendEmail(
    email, 
    `Reset Your Password - ${emailConfig.appName}`, 
    html
  );
};

export const sendOTPVerificationEmail = async (email, name, otp) => {
  const html = otpVerificationTemplate(
    name, 
    otp, 
    emailConfig.appName, 
    emailConfig.supportEmail
  );
  
  return await sendEmail(
    email, 
    `Verify Your Email - ${emailConfig.appName}`, 
    html
  );
};

export const sendWelcomeVerificationEmail = async (email, name) => {
  const html = welcomeVerificationTemplate(
    name, 
    emailConfig.appName, 
    emailConfig.supportEmail
  );
  
  return await sendEmail(
    email, 
    `Welcome to ${emailConfig.appName}!`, 
    html
  );
};

// Export all functions as default
export default {
  sendResetPasswordEmail,
  sendOTPVerificationEmail,
  sendWelcomeVerificationEmail
};