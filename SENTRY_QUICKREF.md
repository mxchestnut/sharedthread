# 🔍 Quick Reference: Error Monitoring with Sentry

## ⚡ Quick Start

```bash
# 1. Sign up at https://sentry.io
# 2. Create a Next.js project
# 3. Copy your DSN
# 4. Add to .env.local:
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn-here
```

---

## 📝 Usage Examples

### Basic Error Logging

```typescript
import { logError } from '@/lib/error-logger';

try {
  await riskyOperation();
} catch (error) {
  logError('Operation failed', error, { userId: user.id });
}
```

### Warning Logging

```typescript
import { logWarning } from '@/lib/error-logger';

if (unusualCondition) {
  logWarning('Unusual condition detected', { condition: details });
}
```

### Set User Context (on login)

```typescript
import { setUserContext } from '@/lib/error-logger';

setUserContext({
  id: user.id,
  email: user.email,
  username: user.username,
  role: user.role,
});
```

### Clear User Context (on logout)

```typescript
import { clearUserContext } from '@/lib/error-logger';

clearUserContext();
```

### Track Custom Events

```typescript
import { trackEvent } from '@/lib/error-logger';

trackEvent('work_published', {
  workId: work.id,
  authorId: author.id,
  visibility: work.visibility,
});
```

---

## 🎯 When to Use

| Function | When to Use | Example |
|----------|-------------|---------|
| `logError()` | Critical failures, exceptions | API errors, database failures |
| `logWarning()` | Non-critical issues | Rate limit approaching, deprecated API use |
| `logInfo()` | Important events | User signups, work published |
| `trackEvent()` | Business metrics | Feature usage, user actions |
| `setUserContext()` | User login | Store user info for error context |

---

## 📊 What Gets Tracked

✅ **Automatic:**
- Uncaught exceptions
- Unhandled promise rejections
- API route errors
- Client-side JavaScript errors
- Network failures
- Performance issues

✅ **Manual (using error-logger):**
- Custom error messages
- Warnings
- User context
- Custom events/metrics

---

## 🔔 Setting Up Alerts

1. Go to [Sentry Dashboard](https://sentry.io)
2. Click **Alerts** → **Create Alert**
3. Choose trigger (e.g., "First time seen")
4. Set notification channel (email/Slack)
5. Save

**Recommended Alerts:**
- New errors (first occurrence)
- Error spike (>10% increase)
- High error rate (>5% of requests)

---

## 🚫 What's NOT Sent to Sentry

- Development errors (NODE_ENV=development)
- Info/log level messages
- Ignored error patterns (see config)
- Personally identifiable info (PII) - masked by default

---

## 🛠️ Configuration Files

| File | Purpose |
|------|---------|
| `sentry.client.config.ts` | Browser error tracking |
| `sentry.server.config.ts` | Server/API error tracking |
| `sentry.edge.config.ts` | Middleware error tracking |
| `src/lib/error-logger.ts` | Helper functions |
| `next.config.js` | Sentry integration |

---

## 📈 Monitoring Dashboard

**View Errors:** https://sentry.io/organizations/YOUR_ORG/issues/

**Key Metrics:**
- Error frequency & trends
- Affected users count
- Stack traces
- Environment (prod/dev)
- User actions before error

---

## 💡 Best Practices

✅ **DO:**
- Use `logError()` for all error handlers
- Set user context after login
- Clear user context on logout
- Add relevant context to errors
- Set up email alerts

❌ **DON'T:**
- Log sensitive data (passwords, tokens)
- Over-log (keep it meaningful)
- Ignore errors in production
- Forget to clear user context

---

## 🔧 Troubleshooting

**Errors not showing?**
```bash
# Check DSN is set
echo $NEXT_PUBLIC_SENTRY_DSN

# Test manually
import * as Sentry from '@sentry/nextjs';
Sentry.captureMessage('Test');
```

**Build errors?**
```bash
# Reinstall Sentry
npm install @sentry/nextjs
```

---

## 💰 Pricing

- **Free:** 100k events/month
- **Team:** $26/month (1M events)
- **Business:** $80/month (5M events)

**Estimate:** Free tier is sufficient for most apps

---

## 📚 Learn More

- [Full Setup Guide](./SENTRY_SETUP.md)
- [Sentry Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Error Logger Source](./src/lib/error-logger.ts)

---

**Need Help?** Check SENTRY_SETUP.md for detailed instructions.
