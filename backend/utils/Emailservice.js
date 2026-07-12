const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Override sgMail.send if MailBluster API configuration is provided
if (process.env.MAILBLUSTER_API_KEY) {
  sgMail.send = async (msg) => {
    const fromStr = msg.from && typeof msg.from === 'object'
      ? `"${msg.from.name || 'DreamHome'}" <${msg.from.email || 'onboarding@yourdomain.com'}>`
      : msg.from || `"DreamHome" <onboarding@yourdomain.com>`;

    const payload = {
      to: msg.to,
      subject: msg.subject,
      from: fromStr,
      html: msg.html,
      text: msg.text || ""
    };

    const response = await fetch("https://api.mailbluster.com/v1/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": process.env.MAILBLUSTER_API_KEY.trim(),
        "x-mailbluster-api-key": process.env.MAILBLUSTER_API_KEY.trim()
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `MailBluster API Error: ${response.statusText}`);
    }

    console.log('Email sent via MailBluster API successfully:', data);
    return [{ statusCode: 200, message: 'Sent via MailBluster' }];
  };
} else if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  // Override sgMail.send if Gmail SMTP configuration is provided
  sgMail.send = async (msg) => {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"${msg.from?.name || 'DreamHome'}" <${process.env.EMAIL_USER}>`,
      to: msg.to,
      subject: msg.subject,
      html: msg.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent via Nodemailer (Gmail):', info.messageId);
    return [{ statusCode: 200, messageId: info.messageId }];
  };
}

const FROM_EMAIL = process.env.EMAIL_USER || 'onboarding@yourdomain.com'; // Replace with your verified SendGrid sender
const FROM_NAME = 'DreamHome';

// Send OTP Email
const sendOTPEmail = async (email, otp, name) => {
  const msg = {
    to: email,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: 'Verify Your Email - DreamHome',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; padding: 30px; text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box {
            background: white; border: 2px dashed #667eea;
            border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;
          }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .warning {
            background: #fff3cd; border-left: 4px solid #ffc107;
            padding: 15px; margin: 20px 0; border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏠 DreamHome</h1>
            <p>Email Verification</p>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Thank you for registering with DreamHome! To complete your registration, please verify your email address.</p>
            <div class="otp-box">
              <p style="margin: 0; font-size: 14px; color: #666;">Your verification code is:</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Valid for 10 minutes</p>
            </div>
            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>Never share this code with anyone</li>
                <li>DreamHome will never ask for your OTP via phone or email</li>
                <li>This code expires in 10 minutes</li>
              </ul>
            </div>
            <p>If you didn't request this verification, please ignore this email.</p>
            <p>Best regards,<br><strong>The DreamHome Team</strong></p>
          </div>
          <div class="footer">
            <p>© 2024 DreamHome. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const [response] = await sgMail.send(msg);
    console.log('OTP Email sent, status:', response.statusCode);
    return { success: true, statusCode: response.statusCode };
  } catch (error) {
    console.error('Error sending OTP email:', error.response?.body || error);
    throw error;
  }
};

// Send Welcome Email (after verification)
const sendWelcomeEmail = async (email, name, role) => {
  const roleMessage =
    role === 'seller'
      ? 'You can now start listing your properties and connect with potential buyers.'
      : 'You can now browse and inquire about properties that match your needs.';

  const msg = {
    to: email,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: 'Welcome to DreamHome! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; padding: 30px; text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-icon { font-size: 60px; text-align: center; margin: 20px 0; }
          .cta-button {
            display: inline-block; background: #667eea; color: white;
            padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;
          }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>🏠 Welcome to DreamHome!</h1></div>
          <div class="content">
            <div class="success-icon">✅</div>
            <h2>Congratulations, ${name}!</h2>
            <p>Your email has been successfully verified and your account is now active.</p>
            <p>${roleMessage}</p>
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="cta-button">
                Get Started
              </a>
            </div>
            <p>Happy house hunting!<br><strong>The DreamHome Team</strong></p>
          </div>
          <div class="footer"><p>© 2024 DreamHome. All rights reserved.</p></div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const [response] = await sgMail.send(msg);
    console.log('Welcome Email sent, status:', response.statusCode);
    return { success: true, statusCode: response.statusCode };
  } catch (error) {
    console.error('Error sending welcome email:', error.response?.body || error);
    throw error;
  }
};

// Send Password Reset OTP Email
const sendPasswordResetOTP = async (email, otp, name) => {
  const msg = {
    to: email,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: 'Password Reset Request - DreamHome',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white; padding: 30px; text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box {
            background: white; border: 2px dashed #f5576c;
            border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;
          }
          .otp-code { font-size: 32px; font-weight: bold; color: #f5576c; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
            <p>DreamHome Security</p>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>We received a request to reset your password. Use the verification code below to proceed.</p>
            <div class="otp-box">
              <p style="margin: 0; font-size: 14px; color: #666;">Your password reset code is:</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Valid for 10 minutes</p>
            </div>
            <p>If you didn't request a password reset, please ignore this email.</p>
            <p>Best regards,<br><strong>The DreamHome Security Team</strong></p>
          </div>
          <div class="footer"><p>© 2024 DreamHome. All rights reserved.</p></div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const [response] = await sgMail.send(msg);
    console.log('Password Reset OTP Email sent, status:', response.statusCode);
    return { success: true, statusCode: response.statusCode };
  } catch (error) {
    console.error('Error sending password reset OTP email:', error.response?.body || error);
    throw error;
  }
};

// Send Password Changed Confirmation Email
const sendPasswordChangedConfirmation = async (email, name) => {
  const msg = {
    to: email,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: 'Password Successfully Changed - DreamHome',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header {
            background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
            color: white; padding: 30px; text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-icon { font-size: 60px; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>✅ Password Changed Successfully</h1></div>
          <div class="content">
            <div class="success-icon">🔒</div>
            <h2>Hello ${name},</h2>
            <p>Your password has been successfully changed. You can now login with your new password.</p>
            <p>Thank you for keeping your account secure!</p>
            <p>Best regards,<br><strong>The DreamHome Security Team</strong></p>
          </div>
          <div class="footer"><p>© 2024 DreamHome. All rights reserved.</p></div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const [response] = await sgMail.send(msg);
    console.log('Password Changed Confirmation Email sent, status:', response.statusCode);
    return { success: true, statusCode: response.statusCode };
  } catch (error) {
    console.error('Error sending password changed confirmation email:', error.response?.body || error);
    throw error;
  }
};

// Send Inquiry Notification to Seller
const sendInquiryNotification = async (sellerEmail, sellerName, inquiryData) => {
  const {
    buyerName, buyerEmail, buyerPhone,
    buyerProfession, propertyTitle, propertyAddress, propertyPrice,
  } = inquiryData;

  const msg = {
    to: sellerEmail,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `New Inquiry for Your Property - ${propertyTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>🔔 New Property Inquiry</h1>
          <h2>Hello ${sellerName},</h2>
          <p>You have received a new inquiry!</p>
          <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Property: ${propertyTitle}</h3>
            <p><strong>Address:</strong> ${propertyAddress}</p>
            <p><strong>Price:</strong> ${propertyPrice}</p>
          </div>
          <div style="background: white; border: 1px solid #ddd; padding: 15px; border-radius: 5px;">
            <h3>Buyer Information:</h3>
            <p><strong>Name:</strong> ${buyerName}</p>
            <p><strong>Email:</strong> ${buyerEmail}</p>
            <p><strong>Phone:</strong> ${buyerPhone}</p>
            <p><strong>Profession:</strong> ${buyerProfession}</p>
          </div>
          <p style="margin-top: 20px;">Best regards,<br><strong>The DreamHome Team</strong></p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const [response] = await sgMail.send(msg);
    console.log('Inquiry Notification Email sent, status:', response.statusCode);
    return { success: true, statusCode: response.statusCode };
  } catch (error) {
    console.error('Error sending inquiry notification email:', error.response?.body || error);
    throw error;
  }
};

// Send Inquiry Accepted Email
const sendInquiryAcceptedEmail = async (buyerEmail, buyerName, inquiryData) => {
  const { propertyTitle, sellerName, sellerEmail, sellerPhone } = inquiryData;

  const msg = {
    to: buyerEmail,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `✅ Your Inquiry Accepted - ${propertyTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>✅ Inquiry Accepted!</h1>
          <h2>Great News, ${buyerName}!</h2>
          <p>The property owner has accepted your inquiry for ${propertyTitle}.</p>
          <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Seller Contact Information:</h3>
            <p><strong>Name:</strong> ${sellerName}</p>
            <p><strong>Email:</strong> ${sellerEmail}</p>
            <p><strong>Phone:</strong> ${sellerPhone}</p>
          </div>
          <p>Best regards,<br><strong>The DreamHome Team</strong></p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const [response] = await sgMail.send(msg);
    console.log('Inquiry Accepted Email sent, status:', response.statusCode);
    return { success: true, statusCode: response.statusCode };
  } catch (error) {
    console.error('Error sending inquiry accepted email:', error.response?.body || error);
    throw error;
  }
};

// Send Inquiry Declined Email
const sendInquiryDeclinedEmail = async (buyerEmail, buyerName, inquiryData) => {
  const { propertyTitle, declineReason } = inquiryData;

  const msg = {
    to: buyerEmail,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `Inquiry Update - ${propertyTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>Inquiry Status Update</h1>
          <h2>Hello ${buyerName},</h2>
          <p>The seller has declined your inquiry for ${propertyTitle}.</p>
          <div style="background: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Reason:</h3>
            <p>${declineReason}</p>
          </div>
          <p>Keep searching - there are many other great properties available!</p>
          <p>Best regards,<br><strong>The DreamHome Team</strong></p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const [response] = await sgMail.send(msg);
    console.log('Inquiry Declined Email sent, status:', response.statusCode);
    return { success: true, statusCode: response.statusCode };
  } catch (error) {
    console.error('Error sending inquiry declined email:', error.response?.body || error);
    throw error;
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetOTP,
  sendPasswordChangedConfirmation,
  sendInquiryNotification,
  sendInquiryAcceptedEmail,
  sendInquiryDeclinedEmail,
};