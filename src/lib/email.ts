/**
 * Email Utility for LetAsk Mentorship Platform
 * Integrated with nodemailer via mailer.ts
 */

import { sendEmail as mailerSendEmail } from './mailer';

export async function sendEmail({ to, subject, body }: { to: string, subject: string, body: string }) {
    return mailerSendEmail({ to, subject, html: body });
}

export async function notifyAdmin(subject: string, data: any) {
    console.log(`[ADMIN ALERT] ${subject}`, data);
    return { success: true };
}

export async function sendSessionStartedEmail({ to, menteeName, mentorName, sessionId }: { to: string, menteeName: string, mentorName: string, sessionId: string }) {
    const subject = `🚀 Your mentorship session has started!`;
    const body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 16px;">
            <div style="background: linear-gradient(135deg, #0EA5E9, #0284c7); padding: 30px; border-radius: 16px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 24px;">🚀 Session Started!</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px;">Your mentor is waiting for you</p>
            </div>
            <div style="background: white; padding: 30px; border-radius: 16px; margin-top: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <p style="font-size: 16px; color: #334155; line-height: 1.6;">Hi ${menteeName},</p>
                <p style="font-size: 16px; color: #334155; line-height: 1.6;"><strong>${mentorName}</strong> has started your mentorship session and is waiting for you to join!</p>
                <div style="background: #E2F5FF; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
                    <p style="margin: 0; color: #0EA5E9; font-weight: bold;">⏱️ The 15-minute timer will begin once both of you are in the chat</p>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/chat/${sessionId}" 
                       style="background: linear-gradient(135deg, #0EA5E9, #0284c7); color: white; padding: 16px 32px; border-radius: 30px; text-decoration: none; font-weight: bold; display: inline-block;">
                        Join Chat Now →
                    </a>
                </div>
                <p style="font-size: 14px; color: #64748b; text-align: center;">Click the button above to join your session</p>
            </div>
        </div>
    `;
    return sendEmail({ to, subject, body });
}

export async function sendFeedbackRequestEmail({ to, menteeName, mentorName, sessionId }: { to: string, menteeName: string, mentorName: string, sessionId: string }) {
    const subject = `📊 How was your session with ${mentorName}?`;
    const body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; border-radius: 16px;">
            <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 30px; border-radius: 16px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 24px;">📊 Session Completed!</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px;">We'd love your feedback</p>
            </div>
            <div style="background: white; padding: 30px; border-radius: 16px; margin-top: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <p style="font-size: 16px; color: #334155; line-height: 1.6;">Hi ${menteeName},</p>
                <p style="font-size: 16px; color: #334155; line-height: 1.6;">Your mentorship session with <strong>${mentorName}</strong> has been completed.</p>
                <p style="font-size: 16px; color: #334155; line-height: 1.6;">Please take a moment to provide your feedback and rating. Your input helps us improve the experience!</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/mentee/feedback/${sessionId}" 
                       style="background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 16px 32px; border-radius: 30px; text-decoration: none; font-weight: bold; display: inline-block;">
                        Give Feedback →
                    </a>
                </div>
            </div>
        </div>
    `;
    return sendEmail({ to, subject, body });
}
