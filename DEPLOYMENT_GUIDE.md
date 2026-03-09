# 🚀 Deployment Guide for nestforstay

This guide covers deploying the nestforstay Student Housing Platform to production.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Environment Variables](#environment-variables)
5. [Database Setup](#database-setup)
6. [Security Checklist](#security-checklist)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

- **Node.js** v18 or higher
- **npm** or **yarn** package manager
- **Git** for version control
- **MongoDB Atlas** account (or self-hosted MongoDB)

### Recommended Hosting Platforms

**Backend:**

- Render.com (free tier available)
- Railway.app
- Heroku (paid)
- AWS EC2
- DigitalOcean

**Frontend:**

- Vercel (recommended for React apps)
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

**Database:**

- MongoDB Atlas (free tier: 512MB)

---

## Backend Deployment

### Step 1: Prepare Backend Code

```bash
cd backend

# Install dependencies
npm install

# Verify .env file exists with all required variables
cp .env.example .env
# Edit .env with your production values
nano .env
```

### Step 2: Set Required Environment Variables

Create a `.env` file in the `backend/` directory with:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/staynest

# Server
PORT=5000
NODE_ENV=production

# Security
JWT_SECRET=your-strong-random-secret-key-here
JWT_EXPIRE=7d

# Frontend URLs
FRONTEND_URL_PROD=https://yourdomain.com
FRONTEND_URL_DEV=http://localhost:3000
FRONTEND_URL_EXTRA=https://www.yourdomain.com

# Admin Setup (optional)
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=strong_password_here
ADMIN_SECRET=admin_registration_key
```

### Step 3: Test Locally

```bash
# Install dependencies
npm install

# Run tests
npm test

# Start development server
npm run dev

# The server should run on http://localhost:5000
```

### Step 4: Deploy to Render.com (Example)

1. Push code to GitHub
2. Create account on [Render.com](https://render.com)
3. Create new Web Service
4. Connect GitHub repository
5. Configure deployment settings:
   - **Build Command:** `npm install`
   - **Start Command:** `node src/index.js`
6. Add environment variables from your `.env` file
7. Click "Deploy"

### Step 5: Verify Backend Deployment

```bash
# Check health endpoint
curl https://your-backend-url/health

# Should return:
# {"status":"Server is running"}
```

---

## Frontend Deployment

### Step 1: Prepare Frontend Code

```bash
cd frontend

# Install dependencies
npm install
```

### Step 2: Create .env.local

```bash
# Copy the example file
cp .env.example .env.local

# Edit with your production API URL
nano .env.local
```

**Content:**

```env
REACT_APP_API_URL=https://your-backend-url
REACT_APP_NAME=nestforstay
REACT_APP_DEBUG=false
```

### Step 3: Build for Production

```bash
# Create optimized build
npm run build

# The 'build' folder is ready to deploy
```

### Step 4: Deploy to Vercel (Recommended)

**Option A: Using Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd frontend
vercel --prod
```

**Option B: GitHub Integration (Automatic)**

1. Create account on [Vercel.com](https://vercel.com)
2. Connect GitHub repository
3. Vercel automatically detects React app
4. Set environment variable: `REACT_APP_API_URL=https://your-backend-url`
5. Click "Deploy"
6. Vercel will auto-deploy on every GitHub push

### Step 5: Deploy to Netlify (Alternative)

1. Create account on [Netlify](https://netlify.com)
2. Connect GitHub repository
3. Configure build settings:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `build`
4. Add environment variable: `REACT_APP_API_URL=https://your-backend-url`
5. Click "Deploy"

### Step 6: Verify Frontend Deployment

1. Visit your deployed frontend URL
2. Check browser console for errors
3. Test login/register functionality
4. Verify API calls reach backend

---

## Environment Variables

### Backend Required Variables

| Variable            | Required    | Example              | Purpose                   |
| ------------------- | ----------- | -------------------- | ------------------------- |
| `MONGODB_URI`       | ✅ Yes      | `mongodb+srv://...`  | MongoDB connection        |
| `JWT_SECRET`        | ✅ Yes      | `your-secret-key`    | JWT token signing         |
| `NODE_ENV`          | ✅ Yes      | `production`         | Environment flag          |
| `PORT`              | ✅ Yes      | `5000`               | Server port               |
| `FRONTEND_URL_PROD` | ✅ Yes      | `https://domain.com` | CORS allowed origin       |
| `ADMIN_EMAIL`       | ❌ Optional | `admin@...`          | Admin account email       |
| `ADMIN_PASSWORD`    | ❌ Optional | `password`           | Admin account password    |
| `ADMIN_SECRET`      | ❌ Optional | `secret-key`         | Admin registration secret |

### Frontend Required Variables

| Variable            | Required    | Example                  | Purpose         |
| ------------------- | ----------- | ------------------------ | --------------- |
| `REACT_APP_API_URL` | ✅ Yes      | `https://api.domain.com` | Backend API URL |
| `REACT_APP_NAME`    | ❌ Optional | `nestforstay`            | App name        |
| `REACT_APP_DEBUG`   | ❌ Optional | `false`                  | Debug mode      |

---

## Database Setup

### MongoDB Atlas (Recommended for Beginners)

1. **Create Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free account

2. **Create Cluster**
   - Click "Create a Deployment"
   - Choose "Free" tier
   - Select region closest to your users
   - Click "Create Deployment"

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Set username and password
   - Add to "All Clusters"
   - Click "Create User"

4. **Allow Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - For development: Add your IP
   - For production: Click "Allow access from anywhere" (0.0.0.0/0)

5. **Get Connection String**
   - Click "Connect" on cluster
   - Choose "Drivers"
   - Copy connection string
   - Replace `<password>` with your database user password
   - Use as `MONGODB_URI`

### Connection String Format

```
mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
```

---

## Security Checklist

Before deploying to production, ensure:

### Backend Security

- [ ] `JWT_SECRET` is a strong random string (at least 32 characters)
- [ ] `JWT_SECRET` is different from development
- [ ] `NODE_ENV=production` is set
- [ ] HTTPS is enforced (redirect HTTP to HTTPS)
- [ ] CORS_ORIGINS only includes your frontend domain
- [ ] Database credentials are never in code (only in `.env`)
- [ ] `.env` file is in `.gitignore` and never committed
- [ ] Admin credentials are changed from defaults
- [ ] Error messages don't expose sensitive information
- [ ] Rate limiting is enabled
- [ ] HTTPS certificate is valid and auto-renews

### Frontend Security

- [ ] API URLs are absolute (https://)
- [ ] Sensitive data is not hardcoded
- [ ] `.env.local` is in `.gitignore` and never committed
- [ ] Build process removes console logs in production
- [ ] No localStorage of sensitive data
- [ ] Tokens are HTTP-only cookies (if changed from localStorage)
- [ ] XSS prevention: All user inputs are escaped
- [ ] CSRF protection: Consider adding CSRF tokens

### Database Security

- [ ] MongoDB Atlas firewall allows only backend server IP (or use VPN)
- [ ] Database user has minimal required permissions
- [ ] Database backups are enabled and tested
- [ ] Encryption at rest is enabled (MongoDB Atlas default)
- [ ] Encryption in transit is enforced (HTTPS)

### Infrastructure Security

- [ ] SSL/TLS certificates are valid (HTTPS everywhere)
- [ ] Firewall rules restrict traffic to necessary ports only
- [ ] Regular security updates are applied
- [ ] Logging and monitoring are in place
- [ ] Backup strategy is in place and tested
- [ ] Disaster recovery plan exists

---

## Troubleshooting

### Backend Issues

#### "MONGODB_URI is not defined"

**Problem:** Backend crashes on startup

**Solution:**

```bash
# Verify .env file exists and contains MONGODB_URI
cat backend/.env | grep MONGODB_URI

# Make sure it's not empty and has correct format
```

#### "CORS policy: This origin is not allowed"

**Problem:** Frontend can't call backend API

**Solution:**

```bash
# 1. Check if FRONTEND_URL_PROD is set correctly
cat backend/.env | grep FRONTEND_URL

# 2. Make sure frontend URL matches exactly
#    (protocol, domain, and port must match)

# 3. Restart backend after changing .env
```

#### "Invalid token" on login

**Problem:** JWT token validation fails

**Solution:**

```bash
# 1. Verify JWT_SECRET is same between environments
cat backend/.env | grep JWT_SECRET

# 2. Check token expiration
# Default is 7 days

# 3. Ensure database is accessible
# Test with: mongodb+srv://user:pass@cluster...
```

### Frontend Issues

#### "Failed to fetch from API"

**Problem:** API calls fail with network error

**Solution:**

```bash
# 1. Check REACT_APP_API_URL in .env.local
cat frontend/.env.local

# 2. Verify backend is running and accessible
curl https://your-backend-url/health

# 3. Check browser console for CORS errors

# 4. For Vercel: Ensure environment variable is set
#    Settings > Environment Variables > REACT_APP_API_URL
```

#### "Module not found error"

**Problem:** Build fails due to missing dependencies

**Solution:**

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Database Issues

#### "Connection refused"

**Problem:** MongoDB connection fails

**Solution:**

```bash
# 1. Verify MongoDB Atlas cluster is running
#    Check MongoDB Atlas dashboard

# 2. Check IP whitelist allows your server
#    MongoDB Atlas > Network Access > Check IP

# 3. Test connection string locally
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected'))
  .catch(e => console.error(e.message));
"
```

#### "Authentication failed"

**Problem:** Database user credentials are wrong

**Solution:**

```bash
# 1. Verify username and password are correct
# 2. Check for special characters that need escaping
#    Use @ instead of % in URLs
# 3. Reset database user password in MongoDB Atlas
```

---

## Monitoring & Maintenance

### Monitor Your Deployment

1. **Set up error tracking** (optional)
   - Sentry.io
   - Rollbar
   - LogSnag

2. **Enable database backups**
   - MongoDB Atlas: Automatic backups every day
   - Enable point-in-time recovery

3. **Monitor application logs**
   - Check Render.com logs
   - Check Vercel logs
   - Monitor database query performance

### Regular Maintenance

- [ ] Weekly: Check error logs
- [ ] Weekly: Verify all features work
- [ ] Monthly: Review security alerts
- [ ] Monthly: Update dependencies
- [ ] Quarterly: Test backup restoration
- [ ] Quarterly: Review and update environment variables

---

## Getting Help

If deployment fails:

1. Check error logs on hosting platform
2. Verify all environment variables are set
3. Ensure database is accessible
4. Test locally with same environment variables
5. Check that ports 5000 (backend) and 3000 (frontend dev) are available
6. Verify git repository is updated before deployment

---

## Next Steps

After successful deployment:

1. **Configure Custom Domain**
   - Update DNS records
   - Set up SSL/TLS certificate
   - Test HTTPS access

2. **Set up Monitoring**
   - Enable application monitoring
   - Set up error alerts
   - Enable database backups

3. **Create Admin Account**
   - If ADMIN\_\* variables were set, admin account created on startup
   - Otherwise, create first admin user manually

4. **Test All Features**
   - Test user registration
   - Test login/logout
   - Test listing creation
   - Test bookings
   - Test admin dashboard

5. **Announce Website**
   - Share deployed URL
   - Test with real users
   - Gather feedback and iterate

---

## Production Checklist

Before going live, verify:

- [ ] Backend deployed and running
- [ ] Frontend deployed and running
- [ ] Custom domain configured
- [ ] SSL/TLS certificate valid
- [ ] All environment variables set correctly
- [ ] Database backups enabled
- [ ] Error logging enabled
- [ ] Admin account created
- [ ] All user roles tested (student, owner, admin)
- [ ] Mobile responsiveness verified
- [ ] API rate limiting working
- [ ] CORS properly configured
- [ ] Security headers set
- [ ] No console errors in browser
- [ ] Load times acceptable
- [ ] All tests passing

---

## Support

For issues or questions:

1. Check this guide's Troubleshooting section
2. Review error logs on your hosting platform
3. Check MongoDB Atlas dashboard status
4. Verify network/firewall settings
5. Test with curl/Postman to isolate issues

Good luck with your deployment! 🚀
