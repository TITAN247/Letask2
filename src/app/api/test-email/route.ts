import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
    try {
        const { to } = await req.json();
        
        if (!to) {
            return NextResponse.json({ error: 'Email address required' }, { status: 400 });
        }

        const result = await sendEmail({
            to,
            subject: '🎉 Brevo Email Test - LetAsk',
            body: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #0EA5E9, #6366F1); padding: 30px; border-radius: 16px; text-align: center; color: white;">
                        <h1 style="margin: 0;">🎉 Email Test Successful!</h1>
                        <p style="margin: 10px 0 0 0;">Your Brevo SMTP is configured correctly</p>
                    </div>
                    <div style="background: #f8fafc; padding: 30px; border-radius: 16px; margin-top: 20px;">
                        <p style="font-size: 16px; color: #334155;">
                            This email was sent from your LetAsk application using Brevo SMTP.
                        </p>
                        <p style="font-size: 14px; color: #64748b; margin-top: 20px;">
                            Configuration used:<br>
                            • SMTP Server: smtp-relay.brevo.com<br>
                            • Port: 587<br>
                            • Sender: LetAsk Team
                        </p>
                    </div>
                </div>
            `
        });

        if (result.success) {
            return NextResponse.json({ 
                success: true, 
                message: `Test email sent to ${to}` 
            });
        } else {
            return NextResponse.json({ 
                success: false, 
                message: 'Email not sent - check server logs',
                devMode: result.devMode 
            }, { status: 500 });
        }
    } catch (error: any) {
        return NextResponse.json({ 
            error: error.message 
        }, { status: 500 });
    }
}
