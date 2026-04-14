import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PreMentorApplication from "@/models/PreMentorApplication";
import ProMentorApplication from "@/models/ProMentorApplication";
import User from "@/models/User";
import MentorProfile from "@/models/MentorProfile";
import { getUserFromSession } from "@/lib/auth";
import { sendEmail } from "@/lib/mailer";
import bcrypt from "bcryptjs";

// GET - Fetch all applications with filters
export async function GET(req: Request) {
    try {
        console.log("[Admin API] Checking session...");
        const userSession = await getUserFromSession();
        console.log("[Admin API] Session:", userSession ? `User ${(userSession as any).id}, role: ${(userSession as any).role}` : "No session");
        
        if (!userSession || (userSession as any).role !== 'admin') {
            console.log("[Admin API] Unauthorized - role:", (userSession as any)?.role);
            return NextResponse.json({ message: "Unauthorized - Admin only" }, { status: 403 });
        }
        
        console.log("[Admin API] Connecting to database...");

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'all'; // prementor, promentor, all
        const status = searchParams.get('status') || 'all'; // pending, approved, rejected, all

        await dbConnect();
        
        // Ensure User model is registered for population
        await User.findOne().exec().catch(() => {});

        let prementorApps: any[] = [];
        let promentorApps: any[] = [];

        // Build filter query
        const statusFilter = status !== 'all' ? { status } : {};

        if (type === 'all' || type === 'prementor') {
            console.log("[Admin API] Fetching PreMentor applications...");
            prementorApps = await PreMentorApplication.find(statusFilter)
                .populate('userId', 'name email')
                .sort({ createdAt: -1 })
                .lean();
            console.log(`[Admin API] Found ${prementorApps.length} PreMentor applications`);
            
            // Manual fallback: fetch user data if populate failed
            for (let app of prementorApps) {
                if (!app.userId || typeof app.userId !== 'object') {
                    const userId = app.userId;
                    console.log(`[Admin API] Fetching user manually for app ${app.tempId}, userId: ${userId}`);
                    const user = await User.findById(userId).select('name email').lean();
                    if (user) {
                        app.userId = user;
                        console.log(`[Admin API] Found user: ${user.name}, ${user.email}`);
                    } else {
                        console.log(`[Admin API] User not found for ID: ${userId}`);
                    }
                }
            }
        }

        if (type === 'all' || type === 'promentor') {
            console.log("[Admin API] Fetching ProMentor applications...");
            promentorApps = await ProMentorApplication.find(statusFilter)
                .populate('userId', 'name email')
                .sort({ createdAt: -1 })
                .lean();
            console.log(`[Admin API] Found ${promentorApps.length} ProMentor applications`);
            
            // Manual fallback: fetch user data if populate failed
            for (let app of promentorApps) {
                if (!app.userId || typeof app.userId !== 'object') {
                    const userId = app.userId;
                    console.log(`[Admin API] Fetching user manually for app ${app.tempId}, userId: ${userId}`);
                    const user = await User.findById(userId).select('name email').lean();
                    if (user) {
                        app.userId = user;
                        console.log(`[Admin API] Found user: ${user.name}, ${user.email}`);
                    } else {
                        console.log(`[Admin API] User not found for ID: ${userId}`);
                    }
                }
            }
        }

        console.log("[Admin API] Returning success response");
        return NextResponse.json({
            prementorApplications: prementorApps,
            promentorApplications: promentorApps,
            total: prementorApps.length + promentorApps.length
        });

    } catch (error: any) {
        console.error("Admin Fetch Applications Error:", error);
        const errorResponse = { 
            message: "An error occurred fetching applications.",
            error: error.message || "Unknown error",
        };
        if (process.env.NODE_ENV === 'development') {
            (errorResponse as any).stack = error.stack;
        }
        return NextResponse.json(errorResponse, { status: 500 });
    }
}

// PATCH - Approve or reject application
export async function PATCH(req: Request) {
    try {
        const userSession = await getUserFromSession();
        if (!userSession || (userSession as any).role !== 'admin') {
            return NextResponse.json({ message: "Unauthorized - Admin only" }, { status: 403 });
        }

        const body = await req.json();
        const { applicationId, type, action, notes } = body;

        await dbConnect();

        let application;
        let user;
        let tempPassword = null;

        if (type === 'prementor') {
            application = await PreMentorApplication.findById(applicationId).populate('userId');
            if (!application) {
                return NextResponse.json({ message: "Application not found" }, { status: 404 });
            }

            if (action === 'approve') {
                let userId = application.userId;
                
                // If user doesn't exist, create one
                if (!userId || !await User.findById(userId)) {
                    console.log(`[Admin API] Creating new user for orphan PreMentor application ${application.tempId}`);
                    
                    // Generate temporary credentials
                    tempPassword = Math.random().toString(36).slice(-8);
                    const hashedPassword = await bcrypt.hash(tempPassword, 10);
                    const userIdFromApp = userId || undefined;
                    
                    // Create user
                    const newUser = await User.create({
                        _id: userIdFromApp,
                        name: `PreMentor_${application.tempId}`,
                        email: `prementor.${application.tempId.toLowerCase().replace(/-/g, '')}@letask.app`,
                        password: hashedPassword,
                        role: 'prementor',
                        isEmailVerified: true
                    });
                    
                    userId = newUser._id;
                    console.log(`[Admin API] Created user ${userId} with temp password`);
                    
                    // Update application with new userId
                    application.userId = userId;
                }

                // Update application status
                application.status = 'approved';
                application.reviewedAt = new Date();
                application.reviewedBy = (userSession as any).id;
                application.adminNotes = notes || '';
                await application.save();

                // Update user role
                user = await User.findByIdAndUpdate(
                    userId,
                    { role: 'prementor' },
                    { new: true }
                );

                // Create or update mentor profile
                await MentorProfile.findOneAndUpdate(
                    { userId: userId },
                    {
                        userId: userId,
                        skills: application.skills,
                        experienceTitle: application.domain,
                        experienceYears: application.experienceYears + (application.experienceMonths / 12),
                        description: application.qWhyMentor,
                        pricing: 0, // Free for pre-mentors
                        verified: false
                    },
                    { upsert: true, new: true }
                );

                // Send approval email
                if (application.userId && application.userId.email) {
                    await sendEmail({
                        to: application.userId.email,
                        subject: "Congratulations! Pre-Mentor Application Approved - LetAsk",
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f0fdf4; border-radius: 8px;">
                                <h2 style="color: #16a34a; margin-bottom: 20px;">🎉 Application Approved!</h2>
                                <p>Hello ${application.userId?.name || 'Applicant'},</p>
                                <p>Congratulations! Your Pre-Mentor application has been approved.</p>
                                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                    <p><strong>Application ID:</strong> ${application.tempId}</p>
                                    <p><strong>Domain:</strong> ${application.domain}</p>
                                    <p><strong>Status:</strong> ✅ Approved</p>
                                    ${notes ? `<p><strong>Admin Notes:</strong> ${notes}</p>` : ''}
                                </div>
                                <p>You can now access your Pre-Mentor Dashboard and start mentoring students.</p>
                                <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/prementor" 
                                   style="display: inline-block; background: #0EA5E9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                                    Go to Dashboard
                                </a>
                                <p style="color: #6b7280; margin-top: 30px;">Welcome to the LetAsk mentor community!</p>
                            </div>
                        `
                    });
                } else {
                    console.error('User email not found for approval notification');
                }

            } else if (action === 'reject') {
                // Update application status
                application.status = 'rejected';
                application.reviewedAt = new Date();
                application.reviewedBy = (userSession as any).id;
                application.adminNotes = notes || '';
                await application.save();

                // Send rejection email
                if (application.userId && application.userId.email) {
                    await sendEmail({
                        to: application.userId.email,
                        subject: "Pre-Mentor Application Update - LetAsk",
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fef2f2; border-radius: 8px;">
                                <h2 style="color: #dc2626; margin-bottom: 20px;">Application Update</h2>
                                <p>Hello ${application.userId?.name || 'Applicant'},</p>
                                <p>Thank you for your interest in becoming a Pre-Mentor on LetAsk.</p>
                                <p>After careful review, we have decided not to approve your application at this time.</p>
                                ${notes ? `<div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;"><strong>Feedback:</strong> ${notes}</div>` : ''}
                                <p>You can reapply after addressing the feedback. We encourage you to continue developing your skills and apply again in the future.</p>
                                <p style="color: #6b7280; margin-top: 30px;">Best regards,<br>The LetAsk Team</p>
                            </div>
                        `
                    });
                } else {
                    console.error('User email not found for rejection notification');
                }
            }

        } else if (type === 'promentor') {
            application = await ProMentorApplication.findById(applicationId).populate('userId');
            if (!application) {
                return NextResponse.json({ message: "Application not found" }, { status: 404 });
            }

            if (action === 'approve') {
                let userId = application.userId;
                
                // If user doesn't exist, create one
                if (!userId || !await User.findById(userId)) {
                    console.log(`[Admin API] Creating new user for orphan application ${application.tempId}`);
                    
                    // Generate temporary credentials
                    tempPassword = Math.random().toString(36).slice(-8);
                    const hashedPassword = await bcrypt.hash(tempPassword, 10);
                    const userIdFromApp = userId || undefined;
                    
                    // Create user
                    const newUser = await User.create({
                        _id: userIdFromApp,
                        name: `ProMentor_${application.tempId}`,
                        email: `promentor.${application.tempId.toLowerCase().replace(/-/g, '')}@letask.app`,
                        password: hashedPassword,
                        role: 'promentor',
                        isEmailVerified: true
                    });
                    
                    userId = newUser._id;
                    console.log(`[Admin API] Created user ${userId} with temp password`);
                    
                    // Update application with new userId
                    application.userId = userId;
                }

                // Update application status
                application.status = 'approved';
                application.reviewedAt = new Date();
                application.reviewedBy = (userSession as any).id;
                application.adminNotes = notes || '';
                await application.save();

                // Update user role
                user = await User.findByIdAndUpdate(
                    userId,
                    { role: 'promentor' },
                    { new: true }
                );

                // Create or update mentor profile
                await MentorProfile.findOneAndUpdate(
                    { userId: userId },
                    {
                        userId: userId,
                        skills: application.skills,
                        experienceTitle: application.domain,
                        experienceYears: application.professionalYears,
                        description: application.qWhyMentor,
                        pricing: application.expectedPricing,
                        verified: true
                    },
                    { upsert: true, new: true }
                );

                // Send approval email
                if (application.userId && application.userId.email) {
                    await sendEmail({
                        to: application.userId.email,
                        subject: "Congratulations! Pro-Mentor Application Approved - LetAsk",
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f0fdf4; border-radius: 8px;">
                                <h2 style="color: #16a34a; margin-bottom: 20px;">🎉 Pro-Mentor Application Approved!</h2>
                                <p>Hello ${application.userId?.name || 'Applicant'},</p>
                                <p>Congratulations! Your Pro-Mentor application has been approved. You are now a verified professional mentor on LetAsk.</p>
                                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                    <p><strong>Application ID:</strong> ${application.tempId}</p>
                                    <p><strong>Domain:</strong> ${application.domain}</p>
                                    <p><strong>Session Rate:</strong> $${application.expectedPricing}</p>
                                    <p><strong>Status:</strong> ✅ Verified Pro-Mentor</p>
                                    ${notes ? `<p><strong>Admin Notes:</strong> ${notes}</p>` : ''}
                                </div>
                                <p>You can now set up your schedule and start accepting paid mentoring sessions.</p>
                                <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/promentor" 
                                   style="display: inline-block; background: #0EA5E9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                                    Go to Pro-Mentor Dashboard
                                </a>
                                <p style="color: #6b7280; margin-top: 30px;">Welcome to the LetAsk Pro-Mentor community!</p>
                            </div>
                        `
                    });
                } else {
                    console.error('User email not found for Pro-Mentor approval notification');
                }

            } else if (action === 'reject') {
                // Update application status
                application.status = 'rejected';
                application.reviewedAt = new Date();
                application.reviewedBy = (userSession as any).id;
                application.adminNotes = notes || '';
                await application.save();

                // Send rejection email
                if (application.userId && application.userId.email) {
                    await sendEmail({
                        to: application.userId.email,
                        subject: "Pro-Mentor Application Update - LetAsk",
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fef2f2; border-radius: 8px;">
                                <h2 style="color: #dc2626; margin-bottom: 20px;">Application Update</h2>
                                <p>Hello ${application.userId?.name || 'Applicant'},</p>
                                <p>Thank you for your interest in becoming a Pro-Mentor on LetAsk.</p>
                                <p>After careful review of your application and teaching video, we have decided not to approve your application at this time.</p>
                                ${notes ? `<div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;"><strong>Feedback:</strong> ${notes}</div>` : ''}
                                <p>We encourage you to work on the feedback provided and consider applying for our Pre-Mentor program first to build your mentoring experience.</p>
                                <p style="color: #6b7280; margin-top: 30px;">Best regards,<br>The LetAsk Team</p>
                            </div>
                        `
                    });
                } else {
                    console.error('User email not found for Pro-Mentor rejection notification');
                }
            }
        }

        return NextResponse.json({
            message: `Application ${action}d successfully`,
            application,
            user,
            newUserCreated: tempPassword ? true : false,
            userEmail: tempPassword ? user.email : undefined,
            tempPassword: tempPassword || undefined
        });

    } catch (error) {
        console.error("Admin Application Action Error:", error);
        return NextResponse.json(
            { message: "An error occurred processing the application." },
            { status: 500 }
        );
    }
}
