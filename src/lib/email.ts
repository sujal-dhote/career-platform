import nodemailer from 'nodemailer'

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

// Generate 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send OTP email
export async function sendOTPEmail(email: string, otp: string, name: string) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your Email - Career Platform',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 50px auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .content {
            padding: 40px 30px;
            text-align: center;
          }
          .otp-box {
            background-color: #f8fafc;
            border: 2px dashed #f97316;
            border-radius: 10px;
            padding: 20px;
            margin: 30px 0;
            font-size: 32px;
            font-weight: bold;
            color: #f97316;
            letter-spacing: 8px;
          }
          .footer {
            background-color: #f8fafc;
            padding: 20px;
            text-align: center;
            color: #64748b;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #f97316;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Career Platform</h1>
            <p>Email Verification</p>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Thank you for signing up with Career Platform. To complete your registration, please verify your email address.</p>
            
            <p style="margin-top: 30px; font-size: 16px; color: #475569;">Your verification code is:</p>
            
            <div class="otp-box">
              ${otp}
            </div>
            
            <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes.</p>
            
            <p style="margin-top: 30px; color: #475569;">If you didn't create an account, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2024 Career Platform. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}
