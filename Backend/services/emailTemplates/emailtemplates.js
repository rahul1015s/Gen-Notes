// Email addresses configuration
export const emailAddresses = {
  support: "support@rahulwebdev.in",
  contact: "contact@rahulwebdev.in",
  admin: "admin@rahulwebdev.in",
  hello: "hello@rahulwebdev.in",
  notify: "notify@rahulwebdev.in",
  info: "info@rahulwebdev.in",
  noreply: "noreply@rahulwebdev.in"
};

// Email templates
export const emailTemplates = {
  // Forgot Password Template
  forgotPassword: (name, resetURL, appName) => {
    const currentYear = new Date().getFullYear();
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - ${appName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f6f9fc;
            padding: 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .email-header h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .email-header p {
            opacity: 0.9;
            font-size: 16px;
        }
        
        .email-body {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            margin-bottom: 24px;
            color: #2d3748;
        }
        
        .instructions {
            color: #4a5568;
            margin-bottom: 32px;
            font-size: 16px;
        }
        
        .action-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .action-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }
        
        .expiry-notice {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
            color: #856404;
        }
        
        .security-notice {
            background: #d1ecf1;
            border: 1px solid #bee5eb;
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
            color: #0c5460;
        }
        
        .manual-link {
            word-break: break-all;
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 12px;
            margin: 16px 0;
            font-size: 14px;
            color: #6c757d;
        }
        
        .email-footer {
            padding: 30px;
            text-align: center;
            background: #f8f9fa;
            color: #6c757d;
            font-size: 14px;
        }
        
        .footer-links {
            margin: 16px 0;
        }
        
        .footer-links a {
            color: #667eea;
            text-decoration: none;
            margin: 0 12px;
        }
        
        .footer-links a:hover {
            text-decoration: underline;
        }
        
        .company-info {
            margin-top: 16px;
            font-size: 12px;
            opacity: 0.7;
        }
        
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            
            .email-header {
                padding: 30px 20px;
            }
            
            .email-body {
                padding: 30px 20px;
            }
            
            .email-footer {
                padding: 20px;
            }
            
            .action-button {
                display: block;
                margin: 20px 0;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>Reset Your Password</h1>
            <p>${appName}</p>
        </div>
        
        <div class="email-body">
            <p class="greeting">Hello ${name},</p>
            
            <p class="instructions">You recently requested to reset your password for your ${appName} account. Click the button below to reset it.</p>
            
            <div style="text-align: center;">
                <a href="${resetURL}" class="action-button">Reset Your Password</a>
            </div>
            
            <div class="expiry-notice">
                <strong>⚠️ This link expires in 15 minutes</strong><br>
                For security reasons, this password reset link will expire after 15 minutes.
            </div>
            
            <div class="security-notice">
                <strong>🔒 Security Tip:</strong><br>
                If you didn't request this password reset, please ignore this email or contact our support team if you have concerns about your account security.
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <div class="manual-link">${resetURL}</div>
        </div>
        
        <div class="email-footer">
            <p>Need help? We're here for you!</p>
            <div class="footer-links">
                <a href="mailto:${emailAddresses.support}">Contact Support</a>
                <a href="${process.env.FRONTEND_URL}">Visit Our Website</a>
            </div>
            <div class="company-info">
                <p>© ${currentYear} ${appName}. All rights reserved.</p>
                <p>This email was sent to you because you requested a password reset for your ${appName} account.</p>
            </div>
        </div>
    </div>
</body>
</html>`;
  },

  // OTP Verification Template
  otpVerification: (name, otp, appName) => {
    const currentYear = new Date().getFullYear();
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - ${appName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f6f9fc;
            padding: 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .email-header {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .email-header h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .email-header p {
            opacity: 0.9;
            font-size: 16px;
        }
        
        .email-body {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            margin-bottom: 24px;
            color: #2d3748;
        }
        
        .instructions {
            color: #4a5568;
            margin-bottom: 32px;
            font-size: 16px;
        }
        
        .otp-code {
            background: #f8f9fa;
            border: 2px dashed #dee2e6;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 24px 0;
            font-family: 'Courier New', monospace;
        }
        
        .otp-number {
            font-size: 32px;
            font-weight: bold;
            color: #4facfe;
            letter-spacing: 8px;
        }
        
        .expiry-notice {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
            color: #856404;
        }
        
        .security-notice {
            background: #d1ecf1;
            border: 1px solid #bee5eb;
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
            color: #0c5460;
        }
        
        .email-footer {
            padding: 30px;
            text-align: center;
            background: #f8f9fa;
            color: #6c757d;
            font-size: 14px;
        }
        
        .footer-links {
            margin: 16px 0;
        }
        
        .footer-links a {
            color: #4facfe;
            text-decoration: none;
            margin: 0 12px;
        }
        
        .footer-links a:hover {
            text-decoration: underline;
        }
        
        .company-info {
            margin-top: 16px;
            font-size: 12px;
            opacity: 0.7;
        }
        
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            
            .email-header {
                padding: 30px 20px;
            }
            
            .email-body {
                padding: 30px 20px;
            }
            
            .email-footer {
                padding: 20px;
            }
            
            .otp-number {
                font-size: 24px;
                letter-spacing: 4px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>Verify Your Email</h1>
            <p>${appName}</p>
        </div>
        
        <div class="email-body">
            <p class="greeting">Hello ${name},</p>
            
            <p class="instructions">Thank you for signing up! Use the verification code below to complete your registration:</p>
            
            <div class="otp-code">
                <div class="otp-number">${otp}</div>
            </div>
            
            <div class="expiry-notice">
                <strong>⏰ Code Expires in 10 Minutes</strong><br>
                This verification code will expire in 10 minutes for security reasons.
            </div>
            
            <div class="security-notice">
                <strong>🔒 Security Tip:</strong><br>
                Never share this code with anyone. ${appName} will never ask for your verification code.
            </div>
            
            <p>If you didn't create an account with ${appName}, please ignore this email.</p>
        </div>
        
        <div class="email-footer">
            <p>Need help? Contact our support team!</p>
            <div class="footer-links">
                <a href="mailto:${emailAddresses.support}">Contact Support</a>
                <a href="${process.env.FRONTEND_URL}">Visit Our Website</a>
            </div>
            <div class="company-info">
                <p>© ${currentYear} ${appName}. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>`;
  },

  // Welcome/Email Verification Success Template
  welcomeVerification: (name, appName) => {
    const currentYear = new Date().getFullYear();
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ${appName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f6f9fc;
            padding: 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .email-header h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .email-body {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            margin-bottom: 24px;
            color: #2d3748;
        }
        
        .welcome-icon {
            text-align: center;
            font-size: 64px;
            margin: 20px 0;
        }
        
        .next-steps {
            background: #f0f9ff;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
        }
        
        .next-steps h3 {
            color: #2d3748;
            margin-bottom: 12px;
        }
        
        .next-steps ul {
            color: #4a5568;
            padding-left: 20px;
        }
        
        .next-steps li {
            margin-bottom: 8px;
        }
        
        .action-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
        }
        
        .email-footer {
            padding: 30px;
            text-align: center;
            background: #f8f9fa;
            color: #6c757d;
            font-size: 14px;
        }
        
        .footer-links {
            margin: 16px 0;
        }
        
        .footer-links a {
            color: #667eea;
            text-decoration: none;
            margin: 0 12px;
        }
        
        .company-info {
            margin-top: 16px;
            font-size: 12px;
            opacity: 0.7;
        }
        
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            
            .email-header, .email-body {
                padding: 30px 20px;
            }
            
            .email-footer {
                padding: 20px;
            }
            
            .welcome-icon {
                font-size: 48px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>Welcome to ${appName}! 🎉</h1>
            <p>Your account is now verified</p>
        </div>
        
        <div class="email-body">
            <p class="greeting">Hello ${name},</p>
            
            <p>Congratulations! Your email has been successfully verified and your account is now fully active.</p>
            
            <div class="welcome-icon">✨</div>
            
            <div class="next-steps">
                <h3>🚀 Ready to get started?</h3>
                <ul>
                    <li>Complete your profile setup</li>
                    <li>Explore our features</li>
                    <li>Check out our tutorials</li>
                    <li>Join our community</li>
                </ul>
            </div>
            
            <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/dashboard" class="action-button">Go to Dashboard</a>
            </div>
        </div>
        
        <div class="email-footer">
            <p>Let's create something amazing together!</p>
            <div class="footer-links">
                <a href="${process.env.FRONTEND_URL}/getting-started">Getting Started Guide</a>
                <a href="mailto:${emailAddresses.support}">Get Help</a>
            </div>
            <div class="company-info">
                <p>© ${currentYear} ${appName}. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>`;
  },

  // Account Notification Template
  accountNotification: (name, subject, message, appName) => {
    const currentYear = new Date().getFullYear();
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject} - ${appName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f6f9fc;
            padding: 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .email-header h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .email-body {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            margin-bottom: 24px;
            color: #2d3748;
        }
        
        .notification-content {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .email-footer {
            padding: 30px;
            text-align: center;
            background: #f8f9fa;
            color: #6c757d;
            font-size: 14px;
        }
        
        .footer-links a {
            color: #667eea;
            text-decoration: none;
            margin: 0 12px;
        }
        
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            
            .email-header, .email-body {
                padding: 30px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>${subject}</h1>
            <p>${appName}</p>
        </div>
        
        <div class="email-body">
            <p class="greeting">Hello ${name},</p>
            
            <div class="notification-content">
                ${message}
            </div>
            
            <p>If you have any questions, feel free to contact our support team.</p>
        </div>
        
        <div class="email-footer">
            <p>Need assistance? We're here to help!</p>
            <div class="footer-links">
                <a href="mailto:${emailAddresses.support}">Contact Support</a>
                <a href="${process.env.FRONTEND_URL}">Visit Website</a>
            </div>
            <div class="company-info">
                <p>© ${currentYear} ${appName}. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>`;
  }
};

// Export individual templates as named exports
export const forgotPasswordTemplate = emailTemplates.forgotPassword;
export const otpVerificationTemplate = emailTemplates.otpVerification;
export const welcomeVerificationTemplate = emailTemplates.welcomeVerification;
export const accountNotificationTemplate = emailTemplates.accountNotification;

// Export default as the main templates object
export default emailTemplates;