# 🍪 Cookie Authentication Setup Guide

## 🎯 Goal

Enable **automatic token sharing** between Admin Portal and Career Portal using **cookies** when deployed as subdomains.

---

## 📋 Prerequisites

Your apps will be deployed as:

- **Admin Portal**: `admin.yourcompany.com` or `app.yourcompany.com`
- **Career Portal**: `careers.yourcompany.com` or `jobs.yourcompany.com`

---

## 🚀 Quick Setup

### Step 1: Install Dependencies

```bash
# Install in both frontend and frontend-career
cd frontend
npm install js-cookie @types/js-cookie

cd ../frontend-career
npm install js-cookie @types/js-cookie
```

### Step 2: Import Cookie Helper (Already Created!)

The cookie helper utilities are already created at:

- ✅ `frontend/src/utils/cookieAuth.ts`
- ✅ `frontend-career/src/utils/cookieAuth.ts`

### Step 3: Update Package.json

Add to both `frontend/package.json` and `frontend-career/package.json`:

```json
{
  "dependencies": {
    "js-cookie": "^3.0.5"
  },
  "devDependencies": {
    "@types/js-cookie": "^3.0.6"
  }
}
```

---

## 🔧 Implementation (Optional - For Full Cookie Support)

### Update Admin Portal Login (Optional)

If you want to use cookies instead of localStorage, update `AuthContext.tsx`:

```typescript
import { cookieAuth } from "../utils/cookieAuth";

const login = async (email: string, password: string) => {
  const response = await authService.login({ email, password });

  // Use cookie storage (works in production)
  cookieAuth.setToken(response.accessToken, response.user);

  setToken(response.accessToken);
  setUser(response.user);

  return response;
};

const logout = () => {
  // Clear cookies and localStorage
  cookieAuth.removeToken();

  setToken(null);
  setUser(null);
};
```

### Update Axios Interceptor (Optional)

Update axios to read from cookies:

```typescript
import { cookieAuth } from "./cookieAuth";

axiosInstance.interceptors.request.use((config) => {
  const token = cookieAuth.getToken(); // Tries cookie first, then localStorage

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
```

---

## 🌐 Production Deployment

### 1. DNS Configuration

Set up your subdomains:

```
admin.yourcompany.com    →  Server IP (Admin Portal - port 3001)
careers.yourcompany.com  →  Server IP (Career Portal - port 3002)
api.yourcompany.com      →  Server IP (Backend - port 8080)
```

### 2. SSL Certificates

Get SSL certificates for all subdomains:

```bash
# Using Let's Encrypt (certbot)
sudo certbot certonly --nginx \
  -d admin.yourcompany.com \
  -d careers.yourcompany.com \
  -d api.yourcompany.com
```

### 3. Nginx Configuration

Create `/etc/nginx/sites-available/ats-system`:

```nginx
# Admin Portal
server {
    listen 443 ssl http2;
    server_name admin.yourcompany.com;

    ssl_certificate /etc/letsencrypt/live/admin.yourcompany.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.yourcompany.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Career Portal
server {
    listen 443 ssl http2;
    server_name careers.yourcompany.com;

    ssl_certificate /etc/letsencrypt/live/careers.yourcompany.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/careers.yourcompany.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend API
server {
    listen 443 ssl http2;
    server_name api.yourcompany.com;

    ssl_certificate /etc/letsencrypt/live/api.yourcompany.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourcompany.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name admin.yourcompany.com careers.yourcompany.com api.yourcompany.com;
    return 301 https://$server_name$request_uri;
}
```

Enable the configuration:

```bash
sudo ln -s /etc/nginx/sites-available/ats-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Environment Variables

Update `.env` files:

**Admin Portal:**

```env
REACT_APP_API_URL=https://api.yourcompany.com/api
REACT_APP_ADMIN_URL=https://admin.yourcompany.com
REACT_APP_CAREER_URL=https://careers.yourcompany.com
```

**Career Portal:**

```env
REACT_APP_API_URL=https://api.yourcompany.com/api
REACT_APP_ADMIN_URL=https://admin.yourcompany.com
REACT_APP_CAREER_URL=https://careers.yourcompany.com
```

**Backend:**

```env
FRONTEND_URL=https://admin.yourcompany.com
CORS_ALLOWED_ORIGINS=https://admin.yourcompany.com,https://careers.yourcompany.com
```

### 5. Docker Compose Production

Update `docker-compose.prod.yml`:

```yaml
version: "3.8"

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - REACT_APP_API_URL=https://api.yourcompany.com/api
      - REACT_APP_ADMIN_URL=https://admin.yourcompany.com
      - REACT_APP_CAREER_URL=https://careers.yourcompany.com

  frontend-career:
    build:
      context: ./frontend-career
      dockerfile: Dockerfile
    ports:
      - "3002:3002"
    environment:
      - REACT_APP_API_URL=https://api.yourcompany.com/api
      - REACT_APP_ADMIN_URL=https://admin.yourcompany.com
      - REACT_APP_CAREER_URL=https://careers.yourcompany.com
```

---

## 🧪 Testing

### Local Testing (Simulating Subdomains)

Edit `/etc/hosts`:

```bash
sudo nano /etc/hosts
```

Add:

```
127.0.0.1   admin.localhost
127.0.0.1   careers.localhost
```

Access:

- Admin: `http://admin.localhost:3001`
- Career: `http://careers.localhost:3002`

### Production Testing

1. **Login to Admin Portal**

   ```
   https://admin.yourcompany.com
   ```

2. **Check Cookie**

   ```javascript
   // Browser console
   document.cookie;
   // Should see: auth_token=xxx
   ```

3. **Visit Career Portal**

   ```
   https://careers.yourcompany.com
   ```

4. **Verify Auto-Login**
   ```javascript
   // Career Portal console
   import { cookieAuth } from "./utils/cookieAuth";
   cookieAuth.getToken();
   // Should return token automatically! ✅
   ```

---

## 📊 How It Works

### Localhost (Current Setup)

```
Admin Portal (3001)  ←  postMessage  →  Career Portal (3002)
        ↓                                         ↓
  localStorage                            localStorage
```

### Production (Subdomain Setup)

```
admin.yourcompany.com          careers.yourcompany.com
        ↓                                    ↓
  Cookie (domain=.yourcompany.com)
        ↓                                    ↓
   Auto-shared automatically! ✅
```

---

## ✅ Verification Checklist

- [ ] Install `js-cookie` in both frontends
- [ ] Cookie helper utilities created (already done!)
- [ ] DNS configured for subdomains
- [ ] SSL certificates obtained
- [ ] Nginx configured and tested
- [ ] Environment variables updated
- [ ] Docker containers rebuilt
- [ ] Cookie sharing tested in production

---

## 🎯 Benefits

| Feature         | Localhost   | Production |
| --------------- | ----------- | ---------- |
| Token Sharing   | postMessage | Cookies    |
| Complexity      | Medium      | Low        |
| Auto-sync       | Manual      | Automatic  |
| Security        | Good        | Excellent  |
| Browser Support | Good        | Excellent  |

---

## 💡 Pro Tips

1. **Keep Both Methods**: postMessage for localhost, cookies for production
2. **Test Locally First**: Use `/etc/hosts` to simulate subdomains
3. **Monitor Cookies**: Use browser DevTools → Application → Cookies
4. **Security First**: Always use HTTPS in production
5. **Domain Flexibility**: Update domain in `cookieAuth.getDomain()`

---

## 🆘 Troubleshooting

### Cookies Not Working

1. **Check domain**:

   ```javascript
   cookieAuth.getDomain();
   // Should return: .yourcompany.com
   ```

2. **Check HTTPS**:

   - Cookies with `secure: true` only work over HTTPS
   - Use `secure: false` for testing (NOT for production!)

3. **Check sameSite**:
   - Use `sameSite: 'lax'` for most cases
   - Use `sameSite: 'none'` only if needed (requires `secure: true`)

### Token Not Syncing

1. **Verify both apps use same root domain**:

   - admin.yourcompany.com ✅
   - careers.yourcompany.com ✅
   - admin.example.com ❌ (different domain!)

2. **Check browser console** for cookie-related errors

3. **Inspect cookies**:
   - DevTools → Application → Cookies
   - Look for `auth_token` cookie
   - Verify domain is `.yourcompany.com`

---

## 🚀 Next Steps

1. Install dependencies
2. Test with current postMessage setup (already working)
3. Deploy to production with subdomains
4. Cookies automatically work! 🎉

No code changes needed until production deployment!
