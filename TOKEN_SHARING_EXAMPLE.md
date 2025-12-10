# Quick Test: Token Sharing Between Apps

## 🚀 Quick Start

### Option 1: Browser Console (Easiest)

1. **Login to Admin Portal**

   - Visit: http://localhost:3001
   - Login with: `kidemana@gmail.com` / `student@123`

2. **Open Browser Console** (F12 or Cmd+Option+I)

3. **Navigate to Career Portal with Token**

   ```javascript
   // Copy and paste this into the console:
   const token = localStorage.getItem("token");
   const user = localStorage.getItem("user");
   window.open(
     `http://localhost:3002?token=${token}&user=${encodeURIComponent(user)}`
   );
   ```

4. **Verify in Career Portal**
   - Open DevTools in the new tab
   - Run: `localStorage.getItem('token')`
   - You should see the same token! ✅

---

### Option 2: Using Utility Function

1. **In Admin Portal, open console and run:**

   ```javascript
   // Import the utility (if not already available)
   import { authUtils } from "./utils/authUtils";

   // Open Career Portal
   authUtils.openCareerPortal("/jobs");
   ```

---

### Option 3: Manual URL

1. **Get your token:**

   ```javascript
   // In Admin Portal console
   console.log(localStorage.getItem("token"));
   ```

2. **Navigate to:**

   ```
   http://localhost:3002?token=YOUR_TOKEN_HERE
   ```

3. **Check token was stored:**
   ```javascript
   // In Career Portal console
   localStorage.getItem("token");
   ```

---

## 🧪 Testing API Calls with Token

### Before (Career Portal - No Auth)

```javascript
// In Career Portal console
fetch("http://localhost:8080/api/jobs")
  .then((r) => r.json())
  .then(console.log);

// ✅ Works - Public endpoint
```

### After (Career Portal - With Auth)

```javascript
// In Career Portal console (after token sync)
const token = localStorage.getItem("token");

fetch("http://localhost:8080/api/auth/me", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
})
  .then((r) => r.json())
  .then(console.log);

// ✅ Should return your user info!
```

---

## 📝 Add Button to Admin Portal

Want a permanent button? Add this to `AdminLayout.tsx`:

```tsx
// frontend/src/components/admin/AdminLayout.tsx

import { authUtils } from "../../utils/authUtils";

// Add this button somewhere in your admin layout:
<button
  onClick={() => authUtils.openCareerPortal("/jobs")}
  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
>
  🌐 View Career Portal
</button>;
```

---

## ✅ Verification Checklist

- [ ] Login to Admin Portal
- [ ] Token exists in Admin Portal: `localStorage.getItem('token')`
- [ ] Navigate to Career Portal with token
- [ ] Token synced to Career Portal: `localStorage.getItem('token')`
- [ ] Token removed from URL (automatic cleanup)
- [ ] API calls include Authorization header
- [ ] Can access protected endpoints

---

## 🐛 Common Issues

### Issue: Token not syncing

**Solution:**

1. Check browser console for errors
2. Ensure token is in URL: `?token=xxx`
3. Hard refresh Career Portal (Cmd+Shift+R)

### Issue: 401 Unauthorized

**Solution:**

1. Token might be expired - login again
2. Check token format: `localStorage.getItem('token')`
3. Verify backend is running: `docker-compose ps`

### Issue: CORS errors

**Solution:**

1. Both apps should call `http://localhost:8080`
2. Check backend CORS config
3. Restart backend: `docker-compose restart backend`

---

## 🎯 How It Works

1. **Admin Portal** (3001) stores token in `localStorage`
2. **URL Navigation** passes token as query param: `?token=xxx`
3. **Career Portal** (3002) reads token from URL on load
4. **Auto Sync** stores token in Career Portal's `localStorage`
5. **URL Cleanup** removes token from address bar
6. **API Calls** automatically include token in headers

---

## 🔒 Security Notes

✅ **Good:**

- Token removed from URL after sync
- Works for authenticated API calls
- Simple implementation

⚠️ **Considerations:**

- Token briefly visible in URL
- For production, use cookies or SSO
- Always use HTTPS in production

---

## 📚 Full Documentation

See `CROSS_APP_AUTH.md` for complete API reference and production recommendations.

