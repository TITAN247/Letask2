import nodemailer from 'nodemailer';

/**
 * LetAsk Email Service
 * 
 * Supports:
 * 1. Gmail (SMTP_USER + SMTP_PASS set, uses Gmail service)
 * 2. Generic SMTP (SMTP_HOST + SMTP_USER + SMTP_PASS set)
 * 3. Dev fallback: prints to console (no SMTP needed)
 */
export const sendEmail = async ({
    to,
    subject,
    html,
}: {
    to: string;
    subject: string;
    html: string;
}) => {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpHost = process.env.SMTP_HOST;
    const fromName = process.env.SMTP_FROM_NAME || 'LetAsk';
    const fromEmail = process.env.SMTP_FROM_EMAIL || smtpUser;

    // --- Mode 1: Gmail shortcut ---
    if (smtpUser && smtpPass && !smtpHost) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });

        try {
            const info = await transporter.sendMail({
                from: `"${fromName}" <${fromEmail}>`,
                to,
                subject,
                html,
                headers: {
                    'X-Priority': '1',
                    'X-Mailer': 'LetAsk Mailer',
                    'List-Unsubscribe': `<mailto:unsubscribe@letask.com?subject=unsubscribe>`,
                },
            });
            console.log(`[MAILER] Email sent via Gmail to ${to} — ID: ${info.messageId}`);
            return { success: true };
        } catch (error: any) {
            console.error(`[MAILER] Gmail send failed:`, error.message);
        }
    }

    // --- Mode 2: Generic SMTP ---
    if (smtpHost && smtpUser && smtpPass) {
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });

        try {
            const info = await transporter.sendMail({
                from: `"${fromName}" <${fromEmail}>`,
                to,
                subject,
                html,
                headers: {
                    'X-Priority': '1',
                    'X-Mailer': 'LetAsk Mailer',
                    'List-Unsubscribe': `<mailto:unsubscribe@letask.com?subject=unsubscribe>`,
                },
            });
            console.log(`[MAILER] Email sent via SMTP to ${to} — ID: ${info.messageId}`);
            return { success: true };
        } catch (error: any) {
            console.error(`[MAILER] SMTP send failed:`, error.message);
        }
    }

    // --- Mode 3: Dev console fallback ---
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  📧  DEV EMAIL (configure SMTP to send real emails)`);
    console.log(`${'─'.repeat(60)}`);
    console.log(`  TO:      ${to}`);
    console.log(`  SUBJECT: ${subject}`);
    console.log(`${'─'.repeat(60)}`);
    console.log(`  Set SMTP_USER and SMTP_PASS in .env.local to send real emails`);
    console.log(`${'═'.repeat(60)}\n`);
    return { success: false, devMode: true };
};
