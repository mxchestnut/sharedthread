# 🔍 Sentry Error Monitoring Setup Guide

**Status:** ✅ Installed and Configured  
**Time to Complete:** 5-10 minutes

---

## What is Sentry?

Sentry is a real-time error tracking service that helps you:
- **Monitor errors** in production before users report them
- **Track performance** and identify slow API routes
- **Debug issues** with full stack traces and context
- **Get alerts** when critical errors occur

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create a Sentry Account

1. Go to [https://sentry.io](https://sentry.io)
2. Sign up for a free account (100k events/month free tier)
3. Click "Create Project"
4. Select **Next.js** as your platform
5. Name your project: `sharedthread`
6. Click "Create Project"

### Step 2: Get Your DSN

After creating the project, Sentry will show you a **DSN** (Data Source Name).

It looks like this:
```
https://abc123def456@o123456.ingest.sentry.io/7654321
```

**Copy this DSN** - you'll need it in the next step.

### Step 3: Add DSN to Environment Variables

#### For Local Development:

Edit `.env.local` and add your DSN:

```bash
# Find this section in .env.local:
NEXT_PUBLIC_SENTRY_DSN=https://YOUR_DSN_HERE

# Replace YOUR_DSN_HERE with your actual DSN
```

#### For Production (Azure):

1. Go to Azure Portal
2. Navigate to your App Service: `sharedthread`
3. Go to **Configuration** → **Application settings**
4. Click **New application setting**
5. Add:
   - **Name:** `NEXT_PUBLIC_SENTRY_DSN`
   - **Value:** `https://YOUR_DSN_HERE`
6. Click **Save**

### Step 4: Test It Works

Run this in your terminal:

```bash
cd /Users/kit/Documents/work-shelf
npm run build
```

If the build succeeds, Sentry is configured! 🎉

---

## 📊 What's Monitored

Sentry will now automatically track:

✅ **Client-side errors** (JavaScript errors in the browser)  
✅ **Server-side errors** (API route errors, server crashes)  
✅ **Edge runtime errors** (Middleware errors)  
✅ **Unhandled promise rejections**  
✅ **Network errors** (failed API calls)  
✅ **Performance issues** (slow API routes)

---

## 🛠️ How to Use in Your Code

### Option 1: Use the Error Logger (Recommended)

We've created a centralized error logger that automatically sends to Sentry:

```typescript
import { logError, logWarning, logInfo } from '@/lib/error-logger';

// In your API routes or components:
try {
  // Your code here
  await someOperation();
} catch (error) {
  // This will log to console in dev, and send to Sentry in production
  logError('Failed to process request', error, {
    userId: user.id,
    workId: work.id,
  });
}
```

### Option 2: Use Sentry Directly

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.captureException(error);
```

### Track User Context

When a user logs in:

```typescript
import { setUserContext } from '@/lib/error-logger';

setUserContext({
  id: user.id,
  email: user.email,
  username: user.username,
  role: user.role,
});
```

When a user logs out:

```typescript
import { clearUserContext } from '@/lib/error-logger';

clearUserContext();
```

---

## 🔔 Setting Up Alerts

### Get Notified of Errors:

1. Go to your Sentry project dashboard
2. Click **Alerts** in the sidebar
3. Click **Create Alert**
4. Choose **Issues**
5. Set conditions:
   - **When:** An issue is first seen
   - **If:** Issue level equals Error or Fatal
6. **Then:** Send notification to email
7. Click **Save Rule**

### Recommended Alert Rules:

- **Critical Errors:** Alert immediately for errors affecting >10 users
- **High Error Rate:** Alert if error rate exceeds 5% of requests
- **New Errors:** Alert on first occurrence of new error types

---

## 📈 Monitoring Dashboard

View your errors at: `https://sentry.io/organizations/YOUR_ORG/issues/`

**Key Metrics:**
- Error frequency and trends
- Affected users
- Stack traces with source maps
- Breadcrumbs (user actions before error)
- Environment (production vs development)

---

## ⚙️ Advanced Configuration (Optional)

### Upload Source Maps

For better debugging, upload source maps:

1. Get your auth token from Sentry:
   - Go to **Settings** → **Auth Tokens**
   - Create new token with `project:releases` scope

2. Add to `.env.local`:
```bash
SENTRY_ORG=your-organization-slug
SENTRY_PROJECT=sharedthread
SENTRY_AUTH_TOKEN=your_auth_token_here
```

3. Source maps will auto-upload on `npm run build`

### Customize Error Filtering

Edit `sentry.client.config.ts` or `sentry.server.config.ts`:

```typescript
ignoreErrors: [
  'ResizeObserver loop limit exceeded',
  'Non-Error promise rejection captured',
  // Add patterns to ignore
],
```

---

## 🎯 Current Configuration

### ✅ Installed Files

- `sentry.client.config.ts` - Client-side error tracking
- `sentry.server.config.ts` - Server-side error tracking  
- `sentry.edge.config.ts` - Edge runtime (middleware) tracking
- `src/lib/error-logger.ts` - Centralized logging utility
- `next.config.js` - Updated with Sentry integration

### 🔧 Configuration

- **Sample Rate:** 100% (captures all errors)
- **Replay Sample Rate:** 10% (records 10% of sessions)
- **Error Replay:** 100% (always record when error occurs)
- **Debug Mode:** Disabled in production
- **Source Maps:** Optional (requires auth token)

### 🛡️ Privacy & Security

- Errors are **not sent in development mode**
- Sensitive data is **masked** in session replays
- User context is **opt-in** (you control what's sent)
- All data is **encrypted** in transit and at rest

---

## 🚨 Troubleshooting

### Errors Not Showing Up?

1. **Check DSN is set:**
   ```bash
   echo $NEXT_PUBLIC_SENTRY_DSN
   ```

2. **Verify it's production:**
   Errors are only sent when `NODE_ENV=production`

3. **Test manually:**
   ```typescript
   import * as Sentry from '@sentry/nextjs';
   Sentry.captureMessage('Test error from Shared Thread');
   ```

4. **Check Sentry quota:**
   Free tier: 100k events/month

### Build Errors?

If you see Sentry errors during build:

1. Make sure `@sentry/nextjs` is installed:
   ```bash
   npm install @sentry/nextjs
   ```

2. DSN can be empty during build (it's only needed at runtime)

---

## 💰 Cost

**Free Tier:** 100,000 events/month (plenty for most apps)

**Paid Plans:** Start at $26/month if you exceed free tier

**Estimate for Shared Thread:**
- With moderate traffic: Free tier is sufficient
- With high traffic: Consider Team plan ($26/mo)

---

## 📚 Next Steps

1. ✅ Create Sentry account
2. ✅ Get your DSN
3. ✅ Add DSN to environment variables
4. ✅ Deploy to production
5. ✅ Set up email alerts
6. ✅ Monitor your dashboard

---

## 🎉 You're Done!

Sentry is now monitoring your application for errors. You'll get:
- Real-time error notifications
- Detailed stack traces
- User impact metrics
- Performance insights

**View your errors:** [https://sentry.io](https://sentry.io)

---

## 🔗 Resources

- [Sentry Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Dashboard](https://sentry.io)
- [Error Logger Utility](./src/lib/error-logger.ts)

**Questions?** Check the Sentry docs or the error-logger.ts file for usage examples.
