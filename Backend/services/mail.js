import nodemailer from 'nodemailer';
import { 
  forgotPasswordTemplate, 
  otpVerificationTemplate, 
  welcomeVerificationTemplate 
} from './emailTemplates/emailtemplates.js';

// Email configuration
const emailConfig = {
  appName: process.env.APP_NAME || 'GenNotes',
  supportEmail: process.env.SUPPORT_EMAIL || process.env.MAIL_USER, // Changed to MAIL_USER
  fromEmail: process.env.FROM_EMAIL || process.env.MAIL_USER, // Changed to MAIL_USER
  fromName: process.env.FROM_NAME || 'GenNotes'
};

// Create transporter with MAIL_* variables
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.zoho.in', // Changed to MAIL_HOST
  port: process.env.MAIL_PORT || 587, // Changed to MAIL_PORT
  secure: process.env.MAIL_SECURE === 'true' || false, // Added MAIL_SECURE
  auth: {
    user: process.env.MAIL_USER, // Changed to MAIL_USER
    pass: process.env.MAIL_PASS, // Changed to MAIL_PASS
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

// ... rest of your email functions remain the same
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`,
      to,
      subject,
      html,
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

export default {
  sendResetPasswordEmail,
  sendOTPVerificationEmail,
  sendWelcomeVerificationEmail
};