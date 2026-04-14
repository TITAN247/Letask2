# LetAsk Database Schema

## Overview
This document maps the ER Diagram and DFDs to MongoDB collections.

## Entity-Collection Mapping

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           LETASK DATABASE SCHEMA                        │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│    USER      │──────│   SESSION    │──────│   FEEDBACK   │
│  (users)     │      │  (sessions)  │      │  (feedback)  │
└──────────────┘      └──────────────┘      └──────────────┘
       │                       │                     │
       │                       │                     │
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  DOCUMENT    │      │   MESSAGE    │      │ TESTIMONIAL  │
│ (documents)  │      │  (messages)  │      │(testimonials)│
└──────────────┘      └──────────────┘      └──────────────┘
       │
       │
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│MENTOR PROFILE│      │   PAYMENT    │      │    RATING    │
│(mentorprofil)│      │  (payments)  │      │  (ratings)   │
└──────────────┘      └──────────────┘      └──────────────┘
       │
       │
┌──────────────┐      ┌──────────────┐
│MENTEE PROFILE│      │   PAYOUT     │
│(menteprofil) │      │  (payouts)   │
└──────────────┘      └──────────────┘
```

## Collections Detail

### 1. users (User Entity from ER Diagram)
**Purpose**: Store all user accounts (Admin, Mentee, Pre-Mentor, Pro-Mentor)

**Key Fields**:
- `_id` (ObjectId) - Primary key (maps to user_id in ER)
- `name` (String) - User's full name
- `email` (String) - Unique email address
- `password` (String) - Hashed password
- `role` (Enum: 'mentee'|'prementor'|'promentor'|'admin') - User type
- `isEmailVerified` (Boolean) - Email verification status
- `xp` (Number) - XP points for gamification
- `level` (Number) - User level
- `averageRating` (Number) - Average rating received
- `earningsBalance` (Number) - Mentor earnings
- `specializations` (Array) - User's skills/expertise

**Indexes**: email (unique), role, averageRating

---

### 2. sessions (Mentorship Session Entity)
**Purpose**: Store mentorship session bookings and status

**Key Fields**:
- `_id` (ObjectId) - Session ID
- `menteeId` (ObjectId) → users - Who booked
- `mentorId` (ObjectId) → users/PreMentor - Who is mentoring
- `mentorType` (Enum) - 'promentor' or 'prementor'
- `subject` (String) - Session topic
- `date` (String) - YYYY-MM-DD format
- `timeSlot` (String) - e.g., "10:00 AM"
- `status` (Enum) - pending|accepted|completed|cancelled
- `paymentStatus` (Enum) - pending|paid|failed|refunded
- `amount` (Number) - Session price
- `sessionNotes` (Object) - Notes about what was covered
- `completedAt` (Date) - When session ended

**Indexes**: menteeId+status, mentorId+status, date

---

### 3. feedback (Feedback Entity from ER Diagram)
**Purpose**: Store session feedback and ratings

**Key Fields**:
- `_id` (ObjectId) - Feedback ID (maps to feedback_id in ER)
- `sessionId` (ObjectId) → sessions - Which session
- `menteeId` (ObjectId) → users - Who gave feedback
- `mentorId` (ObjectId) → users - Who received it
- `fromRole` (Enum) - Role of reviewer
- `toRole` (Enum) - Role of reviewee
- `rating` (Number) - 1-5 overall rating
- `categories` (Object) - Detailed ratings:
  - `communication` (Number) - 1-5
  - `expertise` (Number) - 1-5
  - `punctuality` (Number) - 1-5
  - `helpfulness` (Number) - 1-5
- `review` (String) - Short review text
- `testimonial` (String) - Long testimonial (from ER)
- `tags` (Array) - Feedback tags
- `isPublic` (Boolean) - Show publicly
- `isFeatured` (Boolean) - Featured testimonial
- `helpfulCount` (Number) - Upvotes

**Indexes**: sessionId (unique), mentorId, menteeId+sessionId

---

### 4. testimonials (Testimonial Entity)
**Purpose**: Public testimonials for mentor profiles

**Key Fields**:
- `_id` (ObjectId) - Testimonial ID
- `sessionId` (ObjectId) → sessions
- `reviewerId` (ObjectId) → users - Who wrote it
- `revieweeId` (ObjectId) → users - Mentor being praised
- `content` (String) - Testimonial text
- `isPublic` (Boolean) - Visible to all
- `isFeatured` (Boolean) - Highlighted
- `helpfulCount` (Number) - Upvotes

**Indexes**: revieweeId+isPublic, isFeatured+createdAt

---

### 5. ratings (Detailed Ratings)
**Purpose**: Granular category ratings for analytics

**Key Fields**:
- `_id` (ObjectId) - Rating ID
- `sessionId` (ObjectId) → sessions
- `reviewerId` (ObjectId) → users
- `revieweeId` (ObjectId) → users
- `reviewerRole` (Enum) - 'mentee'|'mentor'
- `revieweeRole` (Enum) - 'mentee'|'prementor'|'promentor'
- `categories` (Object):
  - `communication` (Number) - 1-5
  - `expertise` (Number) - 1-5
  - `punctuality` (Number) - 1-5
  - `helpfulness` (Number) - 1-5
  - `overall` (Number) - 1-5
- `feedback` (String) - Optional comment
- `tags` (Array) - Rating tags
- `isPublic` (Boolean)

**Indexes**: revieweeId+createdAt, revieweeRole+overall

---

### 6. documents (Documents Entity from ER Diagram)
**Purpose**: Store verification documents

**Key Fields**:
- `_id` (ObjectId) - Document ID (maps to doc_id in ER)
- `userId` (ObjectId) → users - Who uploaded
- `docType` (Enum) - 'identity'|'education'|'certification'|'experience'|'other'
- `url` (String) - File URL (maps to uri in ER)
- `fileName` (String) - Original filename
- `fileSize` (Number) - File size in bytes
- `mimeType` (String) - File type
- `status` (Enum) - 'pending'|'approved'|'rejected' (maps to status in ER)
- `adminNotes` (String) - Reviewer comments
- `uploadedAt` (Date) - When uploaded
- `verifiedAt` (Date) - When approved/rejected
- `verifiedBy` (ObjectId) → users - Admin who verified

**Indexes**: userId+docType, status+uploadedAt

---

### 7. messages (Chat Message Entity from ER Diagram)
**Purpose**: Store chat messages between users

**Key Fields**:
- `_id` (ObjectId) - Message ID (maps to msg_id in ER)
- `sessionId` (ObjectId) → sessions - Which session chat
- `senderId` (ObjectId) → users - Who sent
- `senderRole` (Enum) - 'mentee'|'mentor'
- `content` (String) - Message text
- `messageType` (Enum) - 'text'|'file'|'system'
- `fileUrl` (String) - If file attachment
- `isDeleted` (Boolean) - Soft delete
- `readBy` (Array) - Who has read

**Indexes**: sessionId+createdAt, senderId

---

### 8. payments (Transactions Entity from ER Diagram)
**Purpose**: Store payment transactions

**Key Fields**:
- `_id` (ObjectId) - Payment ID (maps to txn_id in ER)
- `userId` (ObjectId) → users - Who paid
- `sessionId` (ObjectId) → sessions - For which session
- `mentorId` (ObjectId) → users - Who receives
- `amount` (Number) - Amount paid (maps to amount in ER)
- `currency` (String) - 'INR'|'USD'
- `status` (Enum) - 'pending'|'completed'|'failed'|'refunded'
- `paymentMethod` (String) - 'razorpay'|'stripe'
- `paymentId` (String) - Gateway transaction ID
- `platformFee` (Number) - Platform commission
- `mentorEarnings` (Number) - Amount to mentor

**Indexes**: userId+status, sessionId, mentorId

---

### 9. payouts (Payouts for Mentors)
**Purpose**: Track mentor withdrawals

**Key Fields**:
- `_id` (ObjectId) - Payout ID
- `mentorId` (ObjectId) → users - Who requested
- `amount` (Number) - Payout amount
- `status` (Enum) - 'pending'|'processing'|'completed'|'failed'
- `method` (String) - 'bank_transfer'|'upi'|'paypal'
- `accountDetails` (Object) - Bank/UPI info
- `requestedAt` (Date) - When requested
- `processedAt` (Date) - When completed
- `transactionId` (String) - Bank reference

**Indexes**: mentorId+status, requestedAt

---

### 10. mentorprofiles (Mentor Profile)
**Purpose**: Extended mentor information

**Key Fields**:
- `_id` (ObjectId)
- `userId` (ObjectId) → users
- `expertise` (Array) - Skills
- `bio` (String) - Detailed bio
- `hourlyRate` (Number) - Pricing
- `availability` (Object) - Schedule
- `totalSessions` (Number)
- `totalEarnings` (Number)

**Indexes**: userId (unique), expertise

---

### 11. menteeprofiles (Mentee Profile)
**Purpose**: Extended mentee information

**Key Fields**:
- `_id` (ObjectId)
- `userId` (ObjectId) → users
- `learningGoals` (Array) - What they want to learn
- `interests` (Array) - Topics of interest
- `preferredMentorType` (Enum)
- `budget` (Number) - Monthly budget

**Indexes**: userId (unique), interests

---

### 12. prementorapplications (Pre-Mentor Applications)
**Purpose**: Track pre-mentor onboarding

**Key Fields**:
- `_id` (ObjectId)
- `userId` (ObjectId) → users
- `status` (Enum) - 'pending'|'approved'|'rejected'
- `techSpecialization` (String)
- `experienceLevel` (String)
- `documents` (Array) - Uploaded docs
- `mockTestScore` (Number)
- `submittedAt` (Date)

---

### 13. promontorapplications (Pro-Mentor Applications)
**Purpose**: Track pro-mentor upgrade applications

**Key Fields**:
- `_id` (ObjectId)
- `userId` (ObjectId) → users
- `status` (Enum) - 'pending'|'approved'|'rejected'
- `documents` (Array) - Certificates, ID proof
- `verificationNotes` (String) - Admin notes
- `submittedAt` (Date)

---

## Relationships Summary

From your ER Diagram:

1. **USER → DOCUMENTS** (1:N) - One user can upload many documents
2. **USER → MENTORSHIP SESSION** (M:N) - Users participate in sessions as mentor/mentee
3. **MENTORSHIP SESSION → CHAT MESSAGE** (1:N) - One session has many messages
4. **MENTORSHIP SESSION → FEEDBACK** (1:1) - One session generates one feedback
5. **MENTORSHIP SESSION → TRANSACTIONS** (1:1) - One session has one payment
6. **FEEDBACK → TESTIMONIAL** (1:1) - Testimonials come from feedback
7. **USER → RATINGS** (1:N) - Users can have multiple ratings

## Data Flows (From DFDs)

### Level 0 (Context Diagram)
- **Seeker** sends Problem → **LetAsk Platform**
- **LetAsk Platform** sends Requests → **Mentor**
- **Mentor** sends Guidance → **Seeker**
- **LetAsk Platform** sends System Reports → **Admin**

### Level 1.1 (Mentee DFD)
- User Management (P1) stores in User DB (D1)
- Mentee Flow (P2) stores Goals in D2
- AI Recommendation (P3) queries AI Profiles (D3)
- Mentorship System (P4) stores in Session DB (D4), Chat Logs (D5), Feedback (D6)

### Level 1.2 (Pre-Mentor DFD)
- Similar flows with Pre-Mentor specific processes
- Verification (P3) handles document verification

### Level 1.3 (Pro-Mentor DFD)
- Expert Registration (P3) creates Pro-Mentor accounts
- Verification & Payment (P2) manages payouts

### Level 1.4 (Admin DFD)
- Admin Panel (P1) manages all databases
- Approvals, Analytics, Platform Config

## Indexes for Performance

All collections have optimized indexes:

| Collection | Indexes | Purpose |
|------------|---------|---------|
| users | email (unique), role, averageRating | Fast login, filtering |
| sessions | menteeId+status, mentorId+status, date | Dashboard queries |
| feedback | sessionId (unique), mentorId, menteeId | Prevent duplicates, mentor stats |
| testimonials | revieweeId+isPublic, isFeatured | Profile display |
| ratings | revieweeId+createdAt, revieweeRole | Analytics |
| documents | userId+docType, status | Verification workflow |
| payments | userId+status, sessionId | Transaction history |
| messages | sessionId+createdAt | Chat loading |

## Setup Instructions

1. Run database initialization:
   ```
   POST /api/admin/db-setup
   {
     "setupKey": "letask-setup-2024"
   }
   ```

2. Verify collections created:
   ```
   GET /api/admin/db-setup
   ```

3. Check Atlas dashboard for indexes and data

## Best Practices

1. ✅ Always use ObjectId references for relationships
2. ✅ Index fields used in queries (email, userId, status)
3. ✅ Use compound indexes for multi-field queries
4. ✅ Store timestamps for all collections
5. ✅ Use enums for status fields
6. ✅ Set maxlength on string fields
7. ✅ Implement soft delete (isDeleted flag)
8. ✅ Regular backups via Atlas

## Migration Notes

When updating schema:
1. Test changes in development first
2. Use Mongoose migrations for data transformation
3. Keep backward compatibility during transition
4. Update indexes after schema changes
