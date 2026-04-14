# MongoDB Atlas Database Setup Guide

## 1. MongoDB Atlas Setup

### Step 1: Create Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google/GitHub/Email
3. Create a new organization (e.g., "LetAsk")

### Step 2: Create Cluster
1. Click "Build a Cluster"
2. Choose "M0" (Free Tier)
3. Select cloud provider (AWS/Google Cloud/Azure)
4. Choose region closest to your users (e.g., Mumbai for India)
5. Name cluster: `letask-cluster`
6. Click "Create Cluster" (takes ~5 minutes)

### Step 3: Database User
1. Go to Database Access → Add New Database User
2. Username: `letask_admin`
3. Password: Generate strong password (save it!)
4. Role: Atlas Admin
5. Click "Add User"

### Step 4: Network Access
1. Go to Network Access → Add IP Address
2. Click "Add Current IP Address" (for development)
3. For production: Add specific IPs or use `0.0.0.0/0` (less secure)

### Step 5: Get Connection String
1. Go to Clusters → Click "Connect"
2. Choose "Drivers"
3. Select "Node.js" and version "4.1 or later"
4. Copy connection string
5. Replace `<password>` with your database password
6. Add database name: `letask`

Example:
```
mongodb+srv://letask_admin:YOUR_PASSWORD@letask-cluster.abc123.mongodb.net/letask?retryWrites=true&w=majority
```

## 2. Environment Configuration

Add to `.env.local`:
```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://letask_admin:YOUR_PASSWORD@letask-cluster.abc123.mongodb.net/letask?retryWrites=true&w=majority

# For local development (optional fallback)
MONGODB_URI_LOCAL=mongodb://localhost:27017/letask
```

## 3. Database Schema Overview

Based on your ER Diagram and DFDs, the database includes:

### Collections

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| `users` | User accounts (Admin, Mentee, Mentor) | name, email, role, password_hash, ratings |
| `sessions` | Mentorship sessions | menteeId, mentorId, status, date, timeSlot |
| `feedback` | Session feedback & ratings | sessionId, menteeId, mentorId, rating, testimonial |
| `testimonials` | Public testimonials | reviewerId, revieweeId, content, isFeatured |
| `ratings` | Detailed category ratings | categories (communication, expertise, etc.) |
| `documents` | Verification documents | userId, docType, url, status |
| `mentorprofiles` | Pro mentor profiles | userId, expertise, pricing, bio |
| `menteprofiles` | Mentee profiles | userId, learningGoals, preferences |
| `premontorapplications` | Pre-mentor applications | userId, status, documents |
| `promontorapplications` | Pro-mentor applications | userId, status, documents |
| `payments` | Payment transactions | userId, sessionId, amount, status |
| `payouts` | Mentor payouts | mentorId, amount, status |
| `messages` | Chat messages | sessionId, senderId, content |
| `communityposts` | Community forum | authorId, content, likes, comments |
| `xptranasctions` | XP/Level tracking | userId, xp, action |

## 4. Database Indexes (Auto-Created)

For performance, these indexes are defined:
- `users`: email (unique), role
- `sessions`: menteeId, mentorId, status
- `feedback`: sessionId (unique), mentorId, menteeId
- `testimonials`: revieweeId, isFeatured
- `documents`: userId, status
- `payments`: userId, sessionId, status

## 5. Initialize Database

Run the setup API after starting the server:
```
http://localhost:3000/api/admin/db-setup
```

This creates:
- Database indexes
- Default admin user
- Sample data (optional)

## 6. Backup & Recovery

### Atlas Backups (M10+ clusters)
1. Go to Clusters → Backup
2. Enable "Cloud Backup"
3. Set schedule (daily recommended)

### Manual Export/Import
```bash
# Export
mongodump --uri="YOUR_URI" --out=backup/

# Import
mongorestore --uri="YOUR_URI" backup/
```

## 7. Monitoring

1. Atlas Dashboard → Metrics
2. Track: Connections, Operations, Storage
3. Set alerts for high CPU/memory

## 8. Security Best Practices

1. ✅ Use strong passwords (Atlas generates these)
2. ✅ Whitelist only required IPs
3. ✅ Enable 2FA on Atlas account
4. ✅ Don't commit `.env.local` to git
5. ✅ Use separate databases for dev/staging/prod
6. ✅ Enable Encryption at Rest (M10+)

## Troubleshooting

### Connection Errors
- Check IP whitelist
- Verify password in connection string
- Ensure cluster is running (not paused)

### Performance Issues
- Check indexes are created
- Monitor slow queries in Atlas Profiler
- Consider upgrading cluster tier

### Data Issues
- Check schema validation rules
- Review application logs
- Use Atlas Data Explorer to verify data
