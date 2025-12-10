# ✨ Automatic Token Syncing - Admin Portal ↔️ Career Portal

## 🎯 What is This?

The Admin Portal and Career Portal **automatically sync authentication tokens** using the browser's `postMessage` API. This means:

- ✅ **Login once** in Admin Portal → **Automatically logged in** to Career Portal
- ✅ **No manual token copying** required
- ✅ **Real-time sync** - tokens update across both apps
- ✅ **Logout propagation** - logging out in one logs out in both

---

## 🚀 How It Works

### Architecture

```
┌─────────────────────────┐         ┌─────────────────────────┐
│  Admin Portal (3001)    │         │ Career Portal (3002)    │
│                         │         │                         │
│  1. User logs in        │         │  2. Listens for token   │
│  2. Stores token        │◄───────►│  3. Receives token      │
│  3. Broadcasts token    │         │  4. Stores token        │
│                         │postMsg  │  5. Uses for API calls  │
└─────────────────────────┘         └─────────────────────────┘
```

### Step-by-Step Flow

1. **Admin Portal Login**

   ```javascript
   // User logs in at localhost:3001
   - Token stored in localStorage
   - Token broadcasted via postMessage API
   ```

2. **Career Portal Auto-Sync**

   ```javascript
   // On startup, Career Portal (localhost:3002):
   - Listens for token messages
   - Receives token from Admin Portal
   - Stores token in localStorage
   - All API calls now include Authorization header
   ```

3. **Logout Sync**
   ```javascript
   // User logs out in Admin Portal:
   - Clears token in Admin Portal
   - Broadcasts logout message
   - Career Portal receives logout
   - Clears token in Career Portal
   ```

---

## 🧪 Testing

### Test 1: Automatic Token Sync on Startup

1. **Start Fresh**

   - Clear all browser data OR open Incognito/Private window
   - Open Career Portal: http://localhost:3002
   - Open Browser Console (F12)

2. **Check Initial State**

   ```javascript
   localStorage.getItem("token");
   // Should be: null (no token yet)
   ```

3. **Login to Admin Portal**

   - Open Admin Portal in SAME browser: http://localhost:3001
   - Login with: `kidemana@gmail.com` / `student@123`
   - Watch console for: `🔗 Token broadcasted to Career Portal`

4. **Verify Career Portal Got Token**

   - Go back to Career Portal tab
   - Check console for: `🔗 Career Portal token bridge initialized - auto-syncing with Admin Portal`
   - Check token:

   ```javascript
   localStorage.getItem("token");
   // Should now have a token!
   ```

5. **Test API Call**

   ```javascript
   // In Career Portal console:
   fetch("http://localhost:8080/api/auth/me", {
     headers: {
       Authorization: `Bearer ${localStorage.getItem("token")}`,
     },
   })
     .then((r) => r.json())
     .then(console.log);

   // ✅ Should return your user data!
   ```

---

### Test 2: Manual Token Request

1. **Career Portal Already Open**
   - Have Career Portal open: http://localhost:3002
2. **Login to Admin Portal**

   - Open Admin Portal: http://localhost:3001
   - Login

3. **Manually Trigger Sync** (if needed)

   ```javascript
   // In Career Portal console:
   import { tokenBridge } from "./utils/tokenBridge";
   tokenBridge.requestTokenFromAdmin();

   // Watch console for token sync messages
   ```

---

### Test 3: Logout Propagation

1. **Both Apps Logged In**

   - Admin Portal: http://localhost:3001 (logged in)
   - Career Portal: http://localhost:3002 (token synced)

2. **Check Tokens**

   ```javascript
   // In both tabs:
   localStorage.getItem("token");
   // Both should have tokens
   ```

3. **Logout from Admin Portal**

   - Click logout in Admin Portal
   - Watch console for: `🔗 Logout broadcasted to Career Portal`

4. **Verify Career Portal Cleared Token**
   - Switch to Career Portal tab
   - Check console for: `🔗 Received logout notification from Admin Portal`
   - Check token:
   ```javascript
   localStorage.getItem("token");
   // Should be: null (token cleared!)
   ```

---

## 🔧 Technical Implementation

### Files Created

**Admin Portal:**

- `frontend/src/utils/tokenBridge.ts` - Token broadcasting logic
- Updated `frontend/src/App.tsx` - Initialize bridge
- Updated `frontend/src/contexts/AuthContext.tsx` - Broadcast on login/logout

**Career Portal:**

- `frontend-career/src/utils/tokenBridge.ts` - Token receiving logic
- Updated `frontend-career/src/App.tsx` - Initialize bridge and request tokens

### Security Considerations

✅ **Origin Verification**

```typescript
// Only accepts messages from known origins
if (event.origin !== ADMIN_PORTAL_URL) {
  return; // Reject unknown origins
}
```

✅ **Message Type Validation**

```typescript
// Only processes specific message types
if (event.data.type === "TOKEN_RESPONSE") {
  // Process token
}
```

✅ **HTTPS in Production**

- Always use HTTPS in production
- Tokens are visible in postMessage but encrypted over HTTPS

⚠️ **Localhost Only**

- This implementation uses `localhost` URLs
- For production, update to use your actual domains

---

## 🎛️ API Reference

### Admin Portal (tokenBridge)

```typescript
// Initialize bridge (auto-called on app start)
tokenBridge.initAdminBridge();

// Broadcast token to Career Portal
tokenBridge.broadcastToken(token, user);

// Broadcast logout
tokenBridge.broadcastLogout();
```

### Career Portal (tokenBridge)

```typescript
// Initialize bridge (auto-called on app start)
tokenBridge.initCareerBridge();

// Manually request token from Admin Portal
tokenBridge.requestTokenFromAdmin();

// Check if token exists
tokenBridge.hasToken(); // returns boolean

// Notify Admin Portal of logout
tokenBridge.notifyLogout();
```

---

## 🐛 Troubleshooting

### Token Not Syncing

**Check Console Logs:**

```javascript
// Admin Portal should show:
🔗 Admin Portal token bridge initialized
🔗 Token broadcasted to Career Portal

// Career Portal should show:
🔗 Career Portal token bridge initialized - auto-syncing with Admin Portal
🔗 Received token from Admin Portal: ✅
```

**Common Issues:**

1. **Different browsers** - Both apps must be in SAME browser
2. **Incognito mode** - May block postMessage in some browsers
3. **CORS/Same-origin** - Check browser console for security errors
4. **Timing** - Career Portal must load AFTER Admin Portal login

### Manual Fix

If automatic sync fails, use URL method:

```javascript
// From Admin Portal console:
const token = localStorage.getItem("token");
window.open(`http://localhost:3002?token=${token}`);
```

---

## 📊 Message Types

### From Admin Portal → Career Portal

```typescript
// Token Response
{
  type: 'TOKEN_RESPONSE',
  token: 'eyJhbGciOiJ...',
  user: '{"id":1,"email":"..."}'
}

// Token Update (after login)
{
  type: 'TOKEN_UPDATE',
  token: 'eyJhbGciOiJ...',
  user: '{"id":1,"email":"..."}'
}

// Logout
{
  type: 'LOGOUT'
}
```

### From Career Portal → Admin Portal

```typescript
// Token Request
{
  type: "REQUEST_TOKEN";
}

// Logout notification
{
  type: "LOGOUT";
}
```

---

## ✅ Benefits

1. **Seamless UX** - Users don't need to login twice
2. **Automatic** - No manual token copying required
3. **Real-time** - Tokens sync immediately
4. **Bidirectional** - Works both ways (Admin ↔ Career)
5. **Secure** - Origin verification prevents token theft

---

## 🚦 Status

| Feature                      | Status         | Notes                |
| ---------------------------- | -------------- | -------------------- |
| Admin → Career token sync    | ✅ Working     | On login/MFA login   |
| Career → Admin token request | ✅ Working     | On app startup       |
| Logout propagation           | ✅ Working     | Bidirectional        |
| URL fallback method          | ✅ Working     | Via authUtils        |
| Origin verification          | ✅ Implemented | Security check       |
| Production ready             | ⚠️ Testing     | Update URLs for prod |

---

## 🎯 Next Steps

1. ✅ Test in your browser
2. ✅ Verify console logs
3. ✅ Test API calls from Career Portal
4. 📝 Update URLs for production deployment
5. 🔒 Configure HTTPS for production

---

## 💡 Pro Tips

1. **Keep Dev Tools Open** - Watch console logs to see the magic happen
2. **Test in Same Browser** - Different browsers have separate localStorage
3. **Clear Storage** - Use Incognito for clean tests
4. **Check Network Tab** - Verify API calls include Authorization header

---

Enjoy seamless authentication across your ATS portals! 🎉

