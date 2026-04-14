const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const brandColor = '#0EA5E9';
const successColor = '#10B981';
const warningColor = '#F59E0B';
const dangerColor = '#EF4444';

const emailLayout = (content: string, options: { title: string; headerColor?: string; showLogo?: boolean } = { title: 'LetAsk', showLogo: true }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.title}</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 20px !important; }
      .content { padding: 20px !important; }
      .code-box { font-size: 24px !important; padding: 16px !important; }
      .button { width: 100% !important; text-align: center !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="container" style="max-width: 600px; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          ${options.showLogo ? `
          <tr>
            <td style="background: linear-gradient(135deg, ${options.headerColor || brandColor} 0%, ${options.headerColor ? options.headerColor + 'dd' : '#0284c7'} 100%); padding: 32px 40px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="text-align: center;">
                    <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 12px; border-radius: 12px; margin-bottom: 12px;">
                      <span style="font-size: 32px;">🎓</span>
                    </div>
                    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">LetAsk</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Connect. Learn. Grow.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}
          
          <!-- Content -->
          <tr>
            <td class="content" style="padding: 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 12px; margin: 0 0 8px 0;">
                © ${new Date().getFullYear()} LetAsk. All rights reserved.
              </p>
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">
                Need help? Contact us at <a href="mailto:support@letask.in" style="color: ${brandColor}; text-decoration: none;">support@letask.in</a>
              </p>
              <p style="color: #94a3b8; font-size: 11px; margin: 16px 0 0 0;">
                <a href="${baseUrl}/privacy" style="color: #64748b; text-decoration: none; margin: 0 8px;">Privacy Policy</a> •
                <a href="${baseUrl}/terms" style="color: #64748b; text-decoration: none; margin: 0 8px;">Terms of Service</a>
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

const button = (text: string, url: string, color: string = brandColor) => `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0;">
    <tr>
      <td style="border-radius: 8px; background: ${color};" class="button">
        <a href="${url}" 
           style="display: inline-block; padding: 14px 32px; color: white; text-decoration: none; font-weight: 600; font-size: 15px; border-radius: 8px;">
          ${text}
        </a>
      </td>
    </tr>
  </table>
`;

const infoBox = (items: { label: string; value: string; highlight?: boolean }[], type: 'info' | 'success' | 'warning' = 'info') => {
  const colors = {
    info: { bg: '#f1f5f9', border: '#e2e8f0', label: '#64748b' },
    success: { bg: '#f0fdf4', border: '#86efac', label: '#16a34a' },
    warning: { bg: '#fffbeb', border: '#fcd34d', label: '#d97706' }
  };
  const c = colors[type];
  
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: ${c.bg}; border-radius: 12px; border-left: 4px solid ${c.border}; margin: 20px 0;">
      <tr>
        <td style="padding: 20px;">
          ${items.map(item => `
            <p style="margin: 0 0 8px 0; font-size: 14px;">
              <span style="color: ${c.label}; font-weight: 500;">${item.label}:</span>
              <span style="color: #1e293b; font-weight: ${item.highlight ? '600' : '400'};">${item.value}</span>
            </p>
          `).join('')}
        </td>
      </tr>
    </table>
  `;
};

export const emailTemplates = {
  // ===== AUTHENTICATION EMAILS =====
  
  welcome: (name: string, role: string = 'user') => ({
    subject: `Welcome to LetAsk, ${name}! 🎓`,
    html: emailLayout(`
      <h2 style="color: #1e293b; font-size: 24px; margin: 0 0 16px 0; font-weight: 700;">Welcome aboard, ${name}!</h2>
      <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
        We're thrilled to have you join our community of learners and mentors. LetAsk is where knowledge meets opportunity.
      </p>
      <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        As a <strong style="color: ${brandColor};">${role}</strong>, you're now part of a platform that connects passionate learners with expert mentors.
      </p>
      ${button('Get Started', `${baseUrl}/dashboard`, brandColor)}
      <p style="color: #64748b; font-size: 14px; margin: 24px 0 0 0;">
        Here's what you can do next:<br>
        • Complete your profile<br>
        • ${role === 'mentee' ? 'Find a mentor' : 'Set up your availability'}<br>
        • ${role === 'mentee' ? 'Book your first session' : 'Start accepting bookings'}
      </p>
    `, { title: 'Welcome to LetAsk' }),
  }),

  otpVerification: (name: string, code: string) => ({
    subject: 'Your LetAsk Verification Code 🔐',
    html: emailLayout(`
      <h2 style="color: #1e293b; font-size: 24px; margin: 0 0 16px 0; font-weight: 700;">Verify your email address</h2>
      <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Hi ${name}, please use the verification code below to complete your registration on LetAsk.
      </p>
      
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td align="center" style="padding: 24px 0;">
            <div class="code-box" style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white; padding: 24px 32px; border-radius: 12px; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace; display: inline-block; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.2);">
              ${code}
            </div>
          </td>
        </tr>
      </table>
      
      <p style="color: #64748b; font-size: 14px; text-align: center; margin: 16px 0 24px 0;">
        ⏰ This code expires in <strong>10 minutes</strong>
      </p>
      
      <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p style="color: #92400e; font-size: 13px; margin: 0;">
          <strong>Didn't request this?</strong> If you didn't create an account on LetAsk, you can safely ignore this email.
        </p>
      </div>
    `, { title: 'Email Verification - LetAsk' }),
  }),

  passwordReset: (name: string, code: string) => ({
    subject: 'Password Reset Request - LetAsk',
    html: emailLayout(`
      <h2 style="color: #1e293b; font-size: 24px; margin: 0 0 16px 0; font-weight: 700;">Reset your password</h2>
      <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Hi ${name}, we received a request to reset your LetAsk password. Use the code below to proceed.
      </p>
      
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td align="center" style="padding: 24px 0;">
            <div style="background: linear-gradient(135deg, ${dangerColor} 0%, #dc2626 100%); color: white; padding: 24px 32px; border-radius: 12px; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace; display: inline-block; box-shadow: 0 10px 25px -5px rgba(239,68,68,0.3);">
              ${code}
            </div>
          </td>
        </tr>
      </table>
      
      <p style="color: #64748b; font-size: 14px; text-align: center; margin: 16px 0 24px 0;">
        ⏰ This code expires in <strong>10 minutes</strong>
      </p>
      
      <div style="background: #fee2e2; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p style="color: #991b1b; font-size: 13px; margin: 0;">
          <strong>Security tip:</strong> Never share this code with anyone. LetAsk staff will never ask for your password or verification codes.
        </p>
      </div>
      
      <p style="color: #64748b; font-size: 14px; margin: 24px 0 0 0;">
        Didn't request this? <a href="${baseUrl}/contact" style="color: ${brandColor}; text-decoration: none;">Contact support</a> immediately.
      </p>
    `, { title: 'Password Reset - LetAsk', headerColor: dangerColor }),
  }),

  emailVerified: (name: string) => ({
    subject: 'Email Verified Successfully ✅',
    html: emailLayout(`
      <div style="text-align: center; padding: 20px 0;">
        <div style="display: inline-block; background: ${successColor}; color: white; width: 64px; height: 64px; border-radius: 50%; line-height: 64px; font-size: 32px; margin-bottom: 16px;">
          ✓
        </div>
        <h2 style="color: #1e293b; font-size: 28px; margin: 0 0 12px 0; font-weight: 700;">Email Verified!</h2>
        <p style="color: #475569; font-size: 16px; margin: 0;">Your email has been successfully verified.</p>
      </div>
      
      <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 24px 0;">
        Hi ${name}, your LetAsk account is now fully activated. You can now access all features of the platform.
      </p>
      
      ${button('Go to Dashboard', `${baseUrl}/dashboard`, successColor)}
      
      <p style="color: #64748b; font-size: 14px; margin: 24px 0 0 0;">
        Thank you for verifying your email. Welcome to the LetAsk community!
      </p>
    `, { title: 'Email Verified - LetAsk', headerColor: successColor }),
  }),

  // ===== BOOKING & SESSION EMAILS =====
  
  bookingRequest: (mentorName: string, menteeName: string, sessionDetails: any) => ({
    subject: `New Booking Request from ${menteeName} 📅`,
    html: emailLayout(`
      <h2 style="color: #1e293b; font-size: 24px; margin: 0 0 16px 0; font-weight: 700;">New Session Request</h2>
      <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Hi ${mentorName}, <strong>${menteeName}</strong> has requested a mentoring session with you.
      </p>
      
      ${infoBox([
        { label: 'Subject', value: sessionDetails.subject, highlight: true },
        { label: 'Date', value: sessionDetails.date },
        { label: 'Time', value: sessionDetails.timeSlot },
        { label: 'Status', value: 'Pending your approval' }
      ], 'info')}
      
      ${button('Review Request', `${baseUrl}/dashboard/promentor/sessions`, brandColor)}
      
      <p style="color: #64748b; font-size: 14px; margin: 24px 0 0 0;">
        Please respond within 24 hours to maintain your response rate.
      </p>
    `, { title: 'New Booking Request - LetAsk' }),
  }),

  bookingAccepted: (menteeName: string, mentorName: string, sessionDetails: any, amount: number) => ({
    subject: `Booking Accepted by ${mentorName} - Payment Required 💳`,
    html: emailLayout(`
      <h2 style="color: #1e293b; font-size: 24px; margin: 0 0 16px 0; font-weight: 700;">Great news! 🎉</h2>
      <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Hi ${menteeName}, <strong>${mentorName}</strong> has accepted your session request. Complete payment to confirm your booking.
      </p>
      
      ${infoBox([
        { label: 'Session', value: sessionDetails.subject, highlight: true },
        { label: 'Date', value: sessionDetails.date },
        { label: 'Time', value: sessionDetails.timeSlot },
        { label: 'Amount', value: `₹${amount}`, highlight: true }
      ], 'success')}
      
      ${button('Complete Payment', `${baseUrl}/dashboard/mentee/payment/${sessionDetails._id}`, successColor)}
      
      <p style="color: #64748b; font-size: 14px; margin: 24px 0 0 0;">
        Your session will be confirmed once payment is received. Need help? <a href="${baseUrl}/support" style="color: ${brandColor};">Contact support</a>
      </p>
    `, { title: 'Booking Accepted - LetAsk', headerColor: successColor }),
  }),

  bookingDeclined: (menteeName: string, mentorName: string, sessionDetails: any, reason?: string) => ({
    subject: `Booking Update from ${mentorName}`,
    html: emailLayout(`
      <h2 style="color: #1e293b; font-size: 24px; margin: 0 0 16px 0; font-weight: 700;">Booking Update</h2>
      <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Hi ${menteeName}, unfortunately <strong>${mentorName}</strong> is unable to accept your session request at this time.
      </p>
      
      ${infoBox([
        { label: 'Session', value: sessionDetails.subject },
        { label: 'Date', value: sessionDetails.date },
        { label: 'Time', value: sessionDetails.timeSlot }
      ], 'warning')}
      
      ${reason ? `
        <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="color: #475569; font-size: 14px; margin: 0;"><strong>Mentor's note:</strong> ${reason}</p>
        </div>
      ` : ''}
      
      ${button('Find Other Mentors', `${baseUrl}/dashboard/mentee/explore`, brandColor)}
      
      <p style="color: #64748b; font-size: 14px; margin: 24px 0 0 0;">
        Don't worry! There are many other qualified mentors available. Browse and book with someone else.
      </p>
    `, { title: 'Booking Update - LetAsk', headerColor: warningColor }),
  }),

  paymentReceived: (menteeName: string, mentorName: string, sessionDetails: any, amount: number) => ({
    subject: `Payment Confirmed - Session with ${mentorName} ✅`,
    html: emailLayout(`
      <div style="text-align: center; padding: 20px 0;">
        <div style="display: inline-block; background: ${successColor}; color: white; width: 64px; height: 64px; border-radius: 50%; line-height: 64px; font-size: 32px; margin-bottom: 16px;">
          ✓
        </div>
        <h2 style="color: #1e293b; font-size: 28px; margin: 0 0 12px 0; font-weight: 700;">Payment Successful!</h2>
        <p style="color: #475569; font-size: 16px; margin: 0;">Your session is now confirmed</p>
      </div>
      
      <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 24px 0;">
        Hi ${menteeName}, your payment of <strong>₹${amount}</strong> has been received. Your session with ${mentorName} is confirmed!
      </p>
      
      ${infoBox([
        { label: 'Mentor', value: mentorName },
        { label: 'Session', value: sessionDetails.subject },
        { label: 'Date', value: sessionDetails.date },
        { label: 'Time', value: sessionDetails.timeSlot }
      ], 'success')}
      
      ${button('Join Session', `${baseUrl}/dashboard/chat/${sessionDetails._id}`, successColor)}
      
      <p style="color: #64748b; font-size: 14px; margin: 24px 0 0 0;">
        You'll receive a reminder 15 minutes before your session starts. Add this to your calendar!
      </p>
    `, { title: 'Payment Confirmed - LetAsk', headerColor: successColor }),
  }),

  paymentReceivedMentor: (mentorName: string, menteeName: string, sessionDetails: any, amount: number, earning: number) => ({
    subject: `Payment Received from ${menteeName} 💰`,
    html: emailLayout(`
      <h2 style="color: #1e293b; font-size: 24px; margin: 0 0 16px 0; font-weight: 700;">Payment Received! 💰</h2>
      <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Hi ${mentorName}, <strong>${menteeName}</strong> has completed payment for your upcoming session.
      </p>
      
      ${infoBox([
        { label: 'Amount Paid', value: `₹${amount}` },
        { label: 'Your Earnings', value: `₹${earning}`, highlight: true },
        { label: 'Session', value: sessionDetails.subject },
        { label: 'Date', value: sessionDetails.date },
        { label: 'Time', value: sessionDetails.timeSlot }
      ], 'success')}
      
      ${button('View Session', `${baseUrl}/dashboard/promentor/sessions`, successColor)}
      
      <p style="color: #64748b; font-size: 14px; margin: 24px 0 0 0;">
        Your earnings will be available for withdrawal after the session is completed.
      </p>
    `, { title: 'Payment Received - LetAsk', headerColor: successColor }),
  }),

  paymentPending: (menteeName: string, mentorName: string, sessionDetails: any, amount: number) => ({
    subject: `Complete Your Payment - Session with ${mentorName} 💳`,
    html: emailLayout(`
      <div style="text-align: center; padding: 20px 0;">
        <div style="display: inline-block; background: ${warningColor}; color: white; width: 64px; height: 64px; border-radius: 50%; line-height: 64px; font-size: 32px; margin-bottom: 16px;">
          💳
        </div>
        <h2 style="color: #1e293b; font-size: 28px; margin: 0 0 12px 0; font-weight: 700;">Payment Pending</h2>
        <p style="color: #475569; font-size: 16px; margin: 0;">Complete your payment to confirm the session</p>
      </div>
      
      <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 24px 0;">
        Hi ${menteeName}, your session with <strong>${mentorName}</strong> is waiting for payment confirmation.
      </p>
      
      ${infoBox([
        { label: 'Mentor', value: mentorName },
        { label: 'Session', value: sessionDetails.subject },
        { label: 'Date', value: sessionDetails.date },
        { label: 'Time', value: sessionDetails.timeSlot },
        { label: 'Amount', value: `₹${amount}`, highlight: true }
      ], 'warning')}
      
      ${button('Complete Payment Now', `${baseUrl}/dashboard/mentee/payments`, brandColor)}
      
      <div style="background: #eff6ff; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p style="color: #1e40af; font-size: 14px; margin: 0;">
          <strong>Why pay now?</strong><br>
          • Secure your preferred time slot<br>
          • Mentor is notified immediately<br>
          • Session is confirmed instantly after payment
        </p>
      </div>
      
      <p style="color: #64748b; font-size: 14px; margin: 24px 0 0 0;">
        Your payment is secure and encrypted. If you have any issues, contact <a href="mailto:support@letask.in" style="color: ${brandColor};">support@letask.in</a>
      </p>
    `, { title: 'Payment Pending - LetAsk', headerColor: warningColor }),
  }),

  sessionReminder: (name: string, otherParty: string, sessionDetails: any, role: 'mentor' | 'mentee') => ({
    subject: `Session Starting in 15 Minutes with ${otherParty} ⏰`,
    html: emailLayout(`
      <div style="text-align: center; padding: 20px 0;">
        <div style="display: inline-block; background: ${warningColor}; color: white; width: 64px; height: 64px; border-radius: 50%; line-height: 64px; font-size: 32px; margin-bottom: 16px;">
          ⏰
        </div>
        <h2 style="color: #1e293b; font-size: 28px; margin: 0 0 12px 0; font-weight: 700;">Starting Soon!</h2>
        <p style="color: #475569; font-size: 16px; margin: 0;">Your session begins in 15 minutes</p>
      </div>
      
      <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 24px 0;">
        Hi ${name}, your session with <strong>${otherParty}</strong> is about to start. Join now to begin on time.
      </p>
      
      ${infoBox([
        { label: 'Session', value: sessionDetails.subject },
        { label: 'Date', value: sessionDetails.date },
        { label: 'Time', value: sessionDetails.timeSlot },
        { label: 'Your Role', value: role === 'mentor' ? 'Mentor' : 'Mentee' }
      ], 'warning')}
      
      ${button('Join Now', `${baseUrl}/dashboard/chat/${sessionDetails._id}`, warningColor)}
      
      <p style="color: #64748b; font-size: 14px; margin: 24px 0 0 0;">
        <strong>Tip:</strong> Test your audio and video before joining. Sessions are timed and begin when both parties enter.
      </p>
    `, { title: 'Session Reminder - LetAsk', headerColor: warningColor }),
  }),

  sessionCompleted: (name: string, otherParty: string, sessionDetails: any, role: 'mentor' | 'mentee') => ({
    subject: `Session Completed with ${otherParty} 🎉`,
    html: emailLayout(`
      <div style="text-align: center; padding: 20px 0;">
        <div style="display: inline-block; background: ${successColor}; color: white; width: 64px; height: 64px; border-radius: 50%; line-height: 64px; font-size: 32px; margin-bottom: 16px;">
          🎉
        </div>
        <h2 style="color: #1e293b; font-size: 28px; margin: 0 0 12px 0; font-weight: 700;">Session Complete!</h2>
        <p style="color: #475569; font-size: 16px; margin: 0;">Great work today</p>
      </div>
      
      <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 24px 0;">
        Hi ${name}, your session with <strong>${otherParty}</strong> has ended. ${role === 'mentee' ? 'Please share your feedback to help us improve.' : 'Your earnings will be available shortly.'}
      </p>
      
      ${infoBox([
        { label: 'Session', value: sessionDetails.subject },
        { label: 'Completed', value: new Date().toLocaleDateString() }
      ], 'success')}
      
      ${role === 'mentee' 
        ? button('Leave Feedback', `${baseUrl}/dashboard/mentee/feedback/${sessionDetails._id}`, successColor)
        : button('View Earnings', `${baseUrl}/dashboard/promentor/earnings`, successColor)
      }
      
      <p style="color: #64748b; font-size: 14px; margin: 24px 0 0 0;">
        ${role === 'mentee' 
          ? 'Your feedback helps mentors improve and helps other learners make informed decisions.'
          : 'Thank you for your time and expertise. Keep up the great mentoring!'
        }
      </p>
    `, { title: 'Session Complete - LetAsk', headerColor: successColor }),
  }),

  // ===== APPLICATION & ONBOARDING EMAILS =====
  
  applicationSubmitted: (name: string, type: 'prementor' | 'promentor', tempId: string) => ({
    subject: `Application Submitted - LetAsk ${type === 'promentor' ? 'Pro-Mentor' : 'Pre-Mentor'}`,
    html: emailLayout(`
      <h2 style="color: #1e293b; font-size: 24px; margin: 0 0 16px 0; font-weight: 700;">Application Received! 📨</h2>
      <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Hi ${name}, thank you for applying to become a LetAsk ${type === 'promentor' ? 'Pro-Mentor' : 'Pre-Mentor'}. We've received your application.
      </p>
      
      ${infoBox([
        { label: 'Application ID', value: tempId, highlight: true },
        { label: 'Type', value: type === 'promentor' ? 'Pro-Mentor' : 'Pre-Mentor' },
        { label: 'Status', value: 'Under Review' }
      ], 'info')}
      
      <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 24px 0;">
        Our team will review your application within 3-5 business days. You'll receive an email notification once a decision has been made.
      </p>
      
      <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p style="color: #475569; font-size: 14px; margin: 0;">
          <strong>What's next?</strong><br>
          • Application review by our team<br>
          • ${type === 'promentor' ? 'Video evaluation' : 'Mock test assessment'}<br>
          • Final approval decision
        </p>
      </div>
      
      <p style="color: #64748b; font-size: 14px; margin: 24px 0 0 0;">
        Questions? Reply to this email or contact <a href="mailto:support@letask.in" style="color: ${brandColor};">support@letask.in</a>
      </p>
    `, { title: 'Application Submitted - LetAsk' }),
  }),

  applicationApproved: (name: string, type: 'prementor' | 'promentor', tempId: string, credentials?: { email: string; tempPassword: string }) => ({
    subject: `🎉 Application Approved - Welcome to LetAsk ${type === 'promentor' ? 'Pro-Mentor' : 'Pre-Mentor'}!`,
    html: emailLayout(`
      <div style="text-align: center; padding: 20px 0;">
        <div style="display: inline-block; background: ${successColor}; color: white; width: 80px; height: 80px; border-radius: 50%; line-height: 80px; font-size: 40px; margin-bottom: 16px;">
          🎉
        </div>
        <h2 style="color: #1e293b; font-size: 28px; margin: 0 0 12px 0; font-weight: 700;">Congratulations!</h2>
        <p style="color: #475569; font-size: 16px; margin: 0;">Your application has been approved</p>
      </div>
      
      <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 24px 0;">
        Hi ${name}, we're thrilled to welcome you as a LetAsk <strong>${type === 'promentor' ? 'Pro-Mentor' : 'Pre-Mentor'}</strong>! Your application has been reviewed and approved.
      </p>
      
      ${infoBox([
        { label: 'Application ID', value: tempId },
        { label: 'Status', value: '✅ APPROVED', highlight: true },
        { label: 'Type', value: type === 'promentor' ? 'Pro-Mentor' : 'Pre-Mentor' }
      ], 'success')}
      
      ${credentials ? `
        <div style="background: #eff6ff; border: 2px solid ${brandColor}; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 16px 0;">Your Login Credentials</h3>
          <p style="color: #475569; font-size: 14px; margin: 0 0 8px 0;"><strong>Email:</strong> ${credentials.email}</p>
          <p style="color: #475569; font-size: 14px; margin: 0;"><strong>Temporary Password:</strong> ${credentials.tempPassword}</p>
          <p style="color: #64748b; font-size: 12px; margin: 12px 0 0 0;">Please change your password after first login.</p>
        </div>
      ` : ''}
      
      ${button('Access Dashboard', `${baseUrl}/dashboard/${type}`, successColor)}
      
      <div style="background: #f0fdf4; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p style="color: #166534; font-size: 14px; margin: 0;">
          <strong>Getting Started:</strong><br>
          ${type === 'promentor' 
            ? '• Set your session pricing<br>• Add your availability<br>• Complete your profile' 
            : '• Complete your profile<br>• Set your availability<br>• Start accepting mentees'
          }
        </p>
      </div>
      
      <p style="color: #64748b; font-size: 14px; margin: 24px 0 0 0;">
        Welcome to the LetAsk mentor community! We're excited to have you on board.
      </p>
    `, { title: 'Application Approved - LetAsk', headerColor: successColor }),
  }),

  applicationRejected: (name: string, type: 'prementor' | 'promentor', tempId: string, feedback?: string) => ({
    subject: `Application Update - LetAsk ${type === 'promentor' ? 'Pro-Mentor' : 'Pre-Mentor'}`,
    html: emailLayout(`
      <h2 style="color: #1e293b; font-size: 24px; margin: 0 0 16px 0; font-weight: 700;">Application Update</h2>
      <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Hi ${name}, thank you for your interest in becoming a LetAsk ${type === 'promentor' ? 'Pro-Mentor' : 'Pre-Mentor'}. After careful review, we have decided not to approve your application at this time.
      </p>
      
      ${infoBox([
        { label: 'Application ID', value: tempId },
        { label: 'Status', value: 'Not Approved' }
      ], 'warning')}
      
      ${feedback ? `
        <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <p style="color: #92400e; font-size: 14px; margin: 0;"><strong>Feedback from our team:</strong></p>
          <p style="color: #78350f; font-size: 14px; margin: 8px 0 0 0;">${feedback}</p>
        </div>
      ` : ''}
      
      <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 24px 0;">
        We encourage you to work on the feedback provided and consider reapplying in the future. You can also explore our other mentoring opportunities.
      </p>
      
      <p style="color: #64748b; font-size: 14px; margin: 24px 0 0 0;">
        Questions? Contact us at <a href="mailto:support@letask.in" style="color: ${brandColor};">support@letask.in</a>
      </p>
    `, { title: 'Application Update - LetAsk', headerColor: warningColor }),
  }),

  // ===== ADMIN & SYSTEM EMAILS =====
  
  adminAlert: (subject: string, details: any) => ({
    subject: `🔔 Admin Alert: ${subject}`,
    html: emailLayout(`
      <h2 style="color: #1e293b; font-size: 24px; margin: 0 0 16px 0; font-weight: 700;">Admin Alert</h2>
      <p style="color: #475569; font-size: 16px; margin: 0 0 24px 0;">
        <strong>Alert:</strong> ${subject}
      </p>
      
      <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <pre style="color: #475569; font-size: 13px; margin: 0; white-space: pre-wrap; font-family: monospace;">${JSON.stringify(details, null, 2)}</pre>
      </div>
      
      <p style="color: #64748b; font-size: 14px; margin: 24px 0 0 0;">
        Timestamp: ${new Date().toISOString()}
      </p>
    `, { title: 'Admin Alert - LetAsk', headerColor: dangerColor }),
  }),

  payoutProcessed: (mentorName: string, amount: number, method: string, reference: string) => ({
    subject: `Payout Processed - ₹${amount} Transferred 💸`,
    html: emailLayout(`
      <div style="text-align: center; padding: 20px 0;">
        <div style="display: inline-block; background: ${successColor}; color: white; width: 64px; height: 64px; border-radius: 50%; line-height: 64px; font-size: 32px; margin-bottom: 16px;">
          💸
        </div>
        <h2 style="color: #1e293b; font-size: 28px; margin: 0 0 12px 0; font-weight: 700;">Payout Processed!</h2>
        <p style="color: #475569; font-size: 16px; margin: 0;">Your earnings are on the way</p>
      </div>
      
      <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 24px 0;">
        Hi ${mentorName}, your payout request has been processed successfully.
      </p>
      
      ${infoBox([
        { label: 'Amount', value: `₹${amount}`, highlight: true },
        { label: 'Method', value: method },
        { label: 'Reference', value: reference },
        { label: 'Status', value: 'Processed' }
      ], 'success')}
      
      <p style="color: #64748b; font-size: 14px; margin: 24px 0 0 0;">
        Funds should appear in your account within 3-5 business days. Reference ID: <strong>${reference}</strong>
      </p>
    `, { title: 'Payout Processed - LetAsk', headerColor: successColor }),
  }),

  // ===== NEW: Weekly Digest Email =====
  weeklyDigest: (name: string, role: string, stats: any) => ({
    subject: `Your LetAsk Weekly Digest 📊`,
    html: emailLayout(`
      <h2 style="color: #1e293b; font-size: 24px; margin: 0 0 16px 0; font-weight: 700;">Your Weekly Summary</h2>
      <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Hi ${name}, here's what happened on LetAsk this week:
      </p>
      
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 24px 0;">
        <tr>
          ${role === 'mentor' ? `
            <td width="48%" style="background: #f0fdf4; border-radius: 12px; padding: 20px; text-align: center;">
              <div style="font-size: 32px; font-weight: 700; color: ${successColor};">₹${stats.earnings || 0}</div>
              <div style="font-size: 14px; color: #64748b;">Earnings</div>
            </td>
            <td width="4%"></td>
            <td width="48%" style="background: #eff6ff; border-radius: 12px; padding: 20px; text-align: center;">
              <div style="font-size: 32px; font-weight: 700; color: ${brandColor};">${stats.sessions || 0}</div>
              <div style="font-size: 14px; color: #64748b;">Sessions</div>
            </td>
          ` : `
            <td width="48%" style="background: #eff6ff; border-radius: 12px; padding: 20px; text-align: center;">
              <div style="font-size: 32px; font-weight: 700; color: ${brandColor};">${stats.sessions || 0}</div>
              <div style="font-size: 14px; color: #64748b;">Sessions</div>
            </td>
            <td width="4%"></td>
            <td width="48%" style="background: #f0fdf4; border-radius: 12px; padding: 20px; text-align: center;">
              <div style="font-size: 32px; font-weight: 700; color: ${successColor};">${stats.mentors || 0}</div>
              <div style="font-size: 14px; color: #64748b;">Mentors</div>
            </td>
          `}
        </tr>
      </table>
      
      ${button('View Full Dashboard', `${baseUrl}/dashboard`, brandColor)}
      
      <p style="color: #64748b; font-size: 14px; margin: 24px 0 0 0;">
        Keep up the great work! You're making a difference in the LetAsk community.
      </p>
    `, { title: 'Weekly Digest - LetAsk' }),
  }),

  // ===== NEW: Account Security Emails =====
  loginAlert: (name: string, device: string, location: string, time: string) => ({
    subject: 'New Login Detected - LetAsk Account 🔒',
    html: emailLayout(`
      <h2 style="color: #1e293b; font-size: 24px; margin: 0 0 16px 0; font-weight: 700;">New Login Detected</h2>
      <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Hi ${name}, we detected a new login to your LetAsk account.
      </p>
      
      ${infoBox([
        { label: 'Device', value: device },
        { label: 'Location', value: location },
        { label: 'Time', value: time }
      ], 'warning')}
      
      <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 24px 0;">
        If this was you, no action is needed. If you don't recognize this activity, please secure your account immediately.
      </p>
      
      ${button('Secure My Account', `${baseUrl}/settings/security`, dangerColor)}
      
      <p style="color: #64748b; font-size: 14px; margin: 24px 0 0 0;">
        <strong>Security tip:</strong> Enable two-factor authentication for added protection.
      </p>
    `, { title: 'Security Alert - LetAsk', headerColor: warningColor }),
  }),
};

export default emailTemplates;
