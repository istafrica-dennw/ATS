# 🔐 Authentication Sync - Quick Reference Card

## 🎯 What You Have Now

### ✅ Two Authentication Sharing Methods

| Method          | Environment           | Status     | Auto-Sync |
| --------------- | --------------------- | ---------- | --------- |
| **postMessage** | Localhost             | ✅ Working | ✅ Yes    |
| **Cookies**     | Production Subdomains | ✅ Ready   | ✅ Yes    |

---

## 🚀 Current Setup (Localhost)

### How It Works Now

```
1. Login at http://localhost:3001 (Admin Portal)
   ↓
2. Token stored in localStorage
   ↓
3. Token broadcasted via postMessage API
   ↓
4. Career Portal (localhost:3002) receives token
   ↓
5. Token stored in Career Portal's localStorage
   ↓
6. ✅ Both apps authenticated!
```

### Test Right Now

```javascript
// 1. Open Admin Portal
http://localhost:3001

// 2. Login with
Email: kidemana@gmail.com
Password: student@123

// 3. Open Career Portal (same browser)
http://localhost:3002

// 4. Check console
Admin: "🔗 Token broadcasted to Career Portal"
Career: "🔗 Received token from Admin Portal: ✅"

// 5. Verify
localStorage.getItem('token')  // Should have token!
```

---

## 🌐 Production Setup (When Ready)

### For Subdomain Deployment

When you deploy to:

- `admin.yourcompany.com`
- `careers.yourcompany.com`

### Setup Steps (5 minutes)

1. **Install Dependencies**

   ```bash
   cd frontend
   npm install js-cookie @types/js-cookie

   cd ../frontend-career
   npm install js-cookie @types/js-cookie
   ```

2. **Set Up DNS**

   ```
   admin.yourcompany.com    → Your server IP
   careers.yourcompany.com  → Your server IP
   ```

3. **Get SSL**

   ```bash
   certbot certonly --nginx -d admin.yourcompany.com -d careers.yourcompany.com
   ```

4. **Deploy**

   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

5. **Done!** Cookies automatically share tokens 🎉

---

## 📊 Comparison

### postMessage (Current)

```
✅ Works now in localhost
✅ No dependencies needed
✅ Already implemented
⚠️ Complex for production
```

### Cookies (Production)

```
✅ Production-standard
✅ Automatic sharing
✅ Better security
⏳ Needs subdomains
```

---

## 🔧 Files Created

### Already in Your Project:

**postMessage:**

- `frontend/src/utils/tokenBridge.ts`
- `frontend-career/src/utils/tokenBridge.ts`

**Cookies:**

- `frontend/src/utils/cookieAuth.ts`
- `frontend-career/src/utils/cookieAuth.ts`

**Documentation:**

- `AUTO_TOKEN_SYNC.md` - postMessage guide
- `SUBDOMAIN_AUTH.md` - Cookie overview
- `COOKIE_AUTH_SETUP.md` - Cookie setup
- `AUTH_SYNC_SUMMARY.md` - Complete summary
- `QUICK_AUTH_REFERENCE.md` - This file

---

## ⚡ Quick Commands

### Check if Token Syncing Works

```javascript
// In Admin Portal console:
localStorage.getItem("token");

// In Career Portal console:
localStorage.getItem("token");

// Should be the same! ✅
```

### Manual Token Sync (Fallback)

```javascript
// From Admin Portal:
const token = localStorage.getItem("token");
window.open(`http://localhost:3002?token=${token}`);
```

### Check Cookie (Production)

```javascript
// In browser console:
document.cookie;

// Should see: auth_token=xxx
```

---

## 🎯 What to Do Next

### Today (Development)

✅ **Nothing!** postMessage already working

### When Deploying to Production

1. Install `js-cookie` in both frontends
2. Set up subdomains
3. Get SSL certificates
4. Deploy
5. Cookies work automatically!

---

## 🆘 Troubleshooting

### Token not syncing in localhost?

- ✅ Make sure both tabs are in **same browser**
- ✅ Check browser console for errors
- ✅ Restart both containers: `docker-compose restart frontend frontend-career`

### Cookies not working in production?

- ✅ Verify you're using **subdomains** (admin.example.com, careers.example.com)
- ✅ Check **HTTPS** is enabled
- ✅ Inspect cookies in DevTools → Application → Cookies

---

## 📱 Contact URLs

| App         | Localhost             | Production                      |
| ----------- | --------------------- | ------------------------------- |
| **Admin**   | http://localhost:3001 | https://admin.yourcompany.com   |
| **Career**  | http://localhost:3002 | https://careers.yourcompany.com |
| **Backend** | http://localhost:8080 | https://api.yourcompany.com     |

---

## ✨ Summary

**You have:**

- ✅ Working token sync in localhost (postMessage)
- ✅ Production-ready cookie code (when you need it)
- ✅ Complete documentation
- ✅ Both methods coexist peacefully

**No action needed now** - it's already working!

When you're ready for production with subdomains, install `js-cookie` and deploy. That's it! 🚀

---

**Happy coding!** 🎉
