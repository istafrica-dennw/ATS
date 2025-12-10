# Cross-App Authentication - Token Sharing Guide

## Overview

The ATS system has two frontend applications:

- **Admin Portal** (port 3001) - Admin interface for managing jobs, users, etc.
- **Career Portal** (port 3002) - Public job listing and application portal

Since they run on different ports, they have **separate localStorage**. This guide explains how to share authentication tokens between them.

---

## How It Works

### 1. Token Storage

- Each app stores its JWT token in `localStorage.getItem('token')`
- Tokens are **NOT automatically shared** between ports (different origins)

### 2. Token Syncing Mechanism

Both apps now support:

- **URL-based token passing**: Pass token via `?token=xxx` parameter
- **Automatic sync**: Tokens from URL are automatically stored in localStorage
- **URL cleanup**: Token is removed from URL after storage (for security)

---

## Usage Examples

### From Admin Portal → Career Portal

#### Method 1: Using the Utility Function (Recommended)

```typescript
import { authUtils } from "../utils/authUtils";

// Navigate to Career Portal with current auth
authUtils.navigateToCareer("/jobs");

// Open Career Portal in new tab
authUtils.openCareerPortal("/jobs/123");
```

#### Method 2: Manual Link

```typescript
// In a React component
const token = localStorage.getItem("token");
const careerUrl = `http://localhost:3002/jobs?token=${token}`;

// Open in new tab
window.open(careerUrl, "_blank");

// Or navigate
window.location.href = careerUrl;
```

#### Method 3: JSX Link

```jsx
import { authUtils } from "../utils/authUtils";

<a
  href={authUtils.generateAuthUrl("http://localhost:3002/jobs")}
  target="_blank"
  className="btn-primary"
>
  View Public Career Portal
</a>;
```

---

### From Career Portal → Admin Portal

```typescript
import { authUtils } from "../utils/authUtils";

// Navigate to Admin Portal
authUtils.navigateToAdmin("/dashboard");
```

---

## API Reference

### `authUtils.syncTokenFromUrl()`

Automatically called on app startup. Checks URL for `?token=xxx` and stores it.

```typescript
// App.tsx (already implemented)
useEffect(() => {
  authUtils.syncTokenFromUrl();
}, []);
```

### `authUtils.getToken()`

Get current stored token.

```typescript
const token = authUtils.getToken();
// Returns: "eyJhbGciOiJIUzI1NiIs..." or null
```

### `authUtils.isAuthenticated()`

Check if user is logged in.

```typescript
if (authUtils.isAuthenticated()) {
  console.log("User is logged in");
}
```

### `authUtils.setAuthData(token, user)`

Store authentication data.

```typescript
authUtils.setAuthData("eyJhbGciOiJIUzI1NiIs...", {
  id: 1,
  email: "user@example.com",
  role: "ADMIN",
});
```

### `authUtils.clearAuthData()`

Clear all authentication data (logout).

```typescript
authUtils.clearAuthData();
```

### `authUtils.generateAuthUrl(baseUrl)`

Generate URL with token for cross-app navigation.

```typescript
const url = authUtils.generateAuthUrl("http://localhost:3002/jobs/123");
// Returns: "http://localhost:3002/jobs/123?token=xxx&user=yyy"
```

### `authUtils.navigateToCareer(path)`

Navigate to Career Portal with auth.

```typescript
authUtils.navigateToCareer("/jobs/123/apply");
```

### `authUtils.navigateToAdmin(path)`

Navigate to Admin Portal with auth.

```typescript
authUtils.navigateToAdmin("/job-management");
```

---

## Security Considerations

### ✅ Safe Practices

1. **URL cleanup**: Token is automatically removed from URL after storage
2. **HTTPS in production**: Always use HTTPS in production
3. **Token expiration**: Backend validates token expiration
4. **Short-lived tokens**: Use short expiration times for JWTs

### ⚠️ Cautions

1. **URL history**: Token briefly appears in browser history
2. **Shared computers**: Users should log out on shared computers
3. **Network sniffing**: Use HTTPS to prevent token interception

### 🔒 Production Recommendations

For production, consider using **cookies** instead of URL parameters:

```typescript
// Set cookie with proper domain
document.cookie = `token=${token}; domain=.yourcompany.com; secure; samesite=strict`;
```

---

## Axios Configuration

Both apps automatically include the token in API requests:

```typescript
// frontend/src/utils/axios.ts (Admin Portal)
// frontend-career/src/services/api.ts (Career Portal)

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## Testing Token Sharing

### Step 1: Login to Admin Portal

1. Visit: `http://localhost:3001`
2. Login with: `kidemana@gmail.com` / `student@123`
3. Copy your token from DevTools: `localStorage.getItem('token')`

### Step 2: Navigate to Career Portal with Token

Option A - Manual URL:

```
http://localhost:3002?token=YOUR_TOKEN_HERE
```

Option B - Using Browser Console:

```javascript
// From Admin Portal (localhost:3001)
window.open(`http://localhost:3002?token=${localStorage.getItem("token")}`);
```

Option C - Add a button to Admin Portal:

```jsx
<button onClick={() => authUtils.openCareerPortal("/jobs")}>
  View Career Portal
</button>
```

### Step 3: Verify in Career Portal

1. Open DevTools Console
2. Check: `localStorage.getItem('token')`
3. Should see the same token!

---

## Environment Variables

Add these to your `.env` files:

### Admin Portal (.env)

```bash
REACT_APP_ADMIN_URL=http://localhost:3001
REACT_APP_CAREER_URL=http://localhost:3002
```

### Career Portal (.env)

```bash
REACT_APP_ADMIN_URL=http://localhost:3001
REACT_APP_CAREER_URL=http://localhost:3002
REACT_APP_API_URL=http://localhost:8080/api
```

---

## Troubleshooting

### Token Not Syncing

1. Check browser console for errors
2. Verify token is in URL: `?token=xxx`
3. Check localStorage: `localStorage.getItem('token')`
4. Clear cache and reload

### 401 Unauthorized Errors

1. Token expired - login again
2. Token invalid - clear storage and login
3. Backend not running - check `docker-compose ps`

### CORS Issues

1. Verify backend allows both origins
2. Check `CORS_ALLOWED_ORIGINS` in backend config
3. Ensure both apps use same backend URL

---

## Example: Add "View Career Portal" Button to Admin

```tsx
// frontend/src/components/admin/AdminLayout.tsx

import { authUtils } from "../../utils/authUtils";

const AdminLayout = () => {
  return (
    <div>
      {/* ... existing layout ... */}

      <button
        onClick={() => authUtils.openCareerPortal("/jobs")}
        className="btn-secondary"
      >
        🌐 View Career Portal
      </button>
    </div>
  );
};
```

---

## Summary

✅ **What's Implemented:**

- Token passing via URL parameters
- Automatic token sync on app load
- Utility functions for cross-app navigation
- URL cleanup for security
- Support for both localStorage and sessionStorage

🎯 **Next Steps:**

1. Add navigation buttons in Admin Portal to Career Portal
2. Test token sharing in browser
3. Consider cookie-based auth for production
4. Add refresh token mechanism

---

## Support

For questions or issues:

1. Check browser console for errors
2. Verify Docker containers are running
3. Check backend logs: `docker-compose logs backend`
4. Review this documentation

Happy coding! 🚀

