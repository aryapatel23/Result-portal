# 🚀 Security Quick Start Guide

## Immediate Steps to Secure Your Application

### 1. Environment Variables ⚙️

Update your `.env` file with strong secrets:

```bash
# Generate a strong JWT secret:
# Method 1: Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Method 2: OpenSSL
openssl rand -hex 64

# Method 3: PowerShell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Required Variables:**
```env
NODE_ENV=production
JWT_SECRET=<your-64-character-secret>
MONGO_URI=<your-mongodb-uri>
FRONTEND_URL=https://yourfrontend.com
```

---

### 2. Update CORS Whitelist 🌐

Edit `Backend/config/corsConfig.js`:

```javascript
const whitelist = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://yourfrontend.com', // ← Add your production URL
  'https://www.yourfrontend.com',
];
```

---

### 3. Enable HTTPS 🔒

**For Production (Render/Heroku):**
- They provide HTTPS automatically
- Ensure you use `https://` URLs

**For Custom Server:**
```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('path/to/key.pem'),
  cert: fs.readFileSync('path/to/cert.pem')
};

https.createServer(options, app).listen(443);
```

---

### 4. Test Security 🧪

#### Test Rate Limiting:
```bash
# This should block after 5 attempts
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"role":"admin","email":"test@test.com","password":"wrong"}'
done
```

#### Test Security Headers:
```bash
# Check security headers
curl -I http://localhost:5000/api/health/ping
```

**Expected Headers:**
- ✅ `X-Frame-Options: DENY`
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `Strict-Transport-Security`
- ✅ `X-XSS-Protection`

---

### 5. Monitor Logs 📝

**Check logs regularly:**
```bash
# View security events
tail -f Backend/logs/security.log

# View errors
tail -f Backend/logs/error.log

# View access logs
tail -f Backend/logs/access.log
```

**On Windows (PowerShell):**
```powershell
Get-Content Backend\logs\security.log -Wait
```

---

## 🛡️ Security Features at a Glance

| Feature | Status | Protection Against |
|---------|--------|-------------------|
| Helmet | ✅ | XSS, Clickjacking, MIME sniffing |
| Rate Limiting | ✅ | Brute force, DDoS |
| CORS | ✅ | Unauthorized origins |
| Input Validation | ✅ | Injection attacks |
| MongoDB Sanitize | ✅ | NoSQL injection |
| XSS Clean | ✅ | Cross-site scripting |
| Password Policy | ✅ | Weak passwords |
| JWT Auth | ✅ | Unauthorized access |
| Logging | ✅ | Monitoring, auditing |

---

## 🔍 Common Issues & Solutions

### Issue: "Too many requests" error

**Solution:** You're hitting rate limits. Wait 15 minutes or adjust limits in `rateLimitMiddleware.js`

```javascript
// Increase limit for development
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Change from 5 to 10
});
```

---

### Issue: CORS error in frontend

**Solution:** Add your frontend URL to whitelist

```javascript
// In Backend/config/corsConfig.js
const whitelist = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://yourfrontend.com', // Add this
];
```

---

### Issue: JWT token expired

**Solution:** Increase token expiry in `authController.js`

```javascript
const token = jwt.sign(
  payload,
  process.env.JWT_SECRET,
  { expiresIn: "30d" } // Change from "7d" to "30d"
);
```

---

### Issue: Password validation too strict

**Solution:** Adjust policy in `utils/passwordPolicy.js`

```javascript
const PASSWORD_POLICY = {
  minLength: 6,  // Change from 8 to 6
  requireUppercase: false,  // Make optional
  requireNumbers: false,  // Make optional
};
```

---

## 🚀 Production Deployment Checklist

Before deploying to production:

### Backend
- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT_SECRET (64+ characters)
- [ ] Enable HTTPS
- [ ] Update CORS whitelist with production URLs
- [ ] Configure database security
- [ ] Set up monitoring/logging
- [ ] Test rate limiting
- [ ] Verify security headers
- [ ] Review error handling
- [ ] Set up automated backups

### Frontend
- [ ] Use environment variables for API URLs
- [ ] Implement token refresh
- [ ] Handle rate limit errors
- [ ] Add loading states
- [ ] Implement proper error handling
- [ ] Enable HTTPS
- [ ] Minimize and obfuscate code
- [ ] Remove console.logs
- [ ] Test on multiple devices
- [ ] Verify CORS configuration

### React Native App
- [ ] Use secure storage for tokens
- [ ] Implement certificate pinning
- [ ] Handle network errors gracefully
- [ ] Add offline support
- [ ] Implement biometric authentication
- [ ] Use ProGuard (Android) / obfuscation
- [ ] Test on real devices
- [ ] Enable code push updates
- [ ] Implement proper error reporting

---

## 📊 Security Testing Commands

### Test Authentication
```bash
# Valid login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"role":"admin","email":"admin@school.com","password":"Admin@123"}'

# Invalid login (test rate limit)
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"role":"admin","email":"admin@school.com","password":"wrong"}'
  sleep 1
done
```

### Test Input Validation
```bash
# Test NoSQL injection
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":{"$gt":""},"password":"test"}'

# Test XSS
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"<script>alert(1)</script>"}'
```

### Test Rate Limiting
```bash
# Test forgot password limit (3 per hour)
for i in {1..5}; do
  curl -X POST http://localhost:5000/api/auth/forgot-password \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com"}'
  sleep 1
done
```

---

## 🆘 Emergency Response

### If you detect a security breach:

1. **Immediately:**
   ```bash
   # Change JWT secret in .env
   JWT_SECRET=<new-strong-secret>
   
   # Restart server (invalidates all tokens)
   pm2 restart all
   ```

2. **Review logs:**
   ```bash
   grep "SECURITY" Backend/logs/security.log
   grep "ERROR" Backend/logs/error.log
   ```

3. **Block malicious IPs:**
   ```javascript
   // In securityMiddleware.js
   const blockedIPs = ['123.456.789.0', '987.654.321.0'];
   if (blockedIPs.includes(req.ip)) {
     return res.status(403).json({ message: 'Forbidden' });
   }
   ```

4. **Notify users:**
   - Email all users about the breach
   - Force password reset for all accounts
   - Enable additional security measures

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)
- [JWT Security Best Practices](https://tools.ietf.org/html/rfc8725)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

## 💡 Pro Tips

1. **Use environment variables** for ALL sensitive data
2. **Never commit** `.env` files to Git
3. **Rotate secrets** every 3-6 months
4. **Monitor logs** daily in production
5. **Test security** before each deployment
6. **Keep dependencies** updated (`npm audit`)
7. **Use HTTPS** always in production
8. **Implement** proper error handling
9. **Add** request logging for auditing
10. **Regular** security audits & penetration testing

---

**Questions?** Review the full [SECURITY_GUIDE.md](./SECURITY_GUIDE.md) for detailed information.

**Last Updated:** February 28, 2026  
**Status:** ✅ Ready for Production
