# 🍪 Subdomain Authentication - Shared Cookie Approach

## 🎯 Overview

Since Career Portal will be a **subdomain** of your main domain, we can use **shared cookies** for authentication. This is the **recommended production approach**.

### Domain Structure

```
Admin Portal:   admin.yourcompany.com    (or app.yourcompany.com)
Career Portal:  careers.yourcompany.com  (or jobs.yourcompany.com)
API Backend:    api.yourcompany.com
```

By setting cookies with `domain=.yourcompany.com`, both subdomains can access the same authentication token!

---

## ✅ Benefits Over postMessage

| Feature          | postMessage     | Shared Cookies      |
| ---------------- | --------------- | ------------------- |
| Production Ready | ⚠️ Complex      | ✅ Standard         |
| Browser Support  | ✅ Good         | ✅ Excellent        |
| Security         | ✅ Origin check | ✅ HttpOnly, Secure |
| Implementation   | 🔴 Complex      | 🟢 Simple           |
| Auto-sync        | ⚠️ Manual       | ✅ Automatic        |
| SSR Support      | ❌ No           | ✅ Yes              |

---

## 🔧 Implementation

### Option 1: Frontend Cookie Management (Quick Start)

Update your axios configuration to use cookies:

#### For Admin Portal (`frontend/src/utils/axios.ts`)

```typescript
import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true, // Important for cookies!
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Get token from cookie
axiosInstance.interceptors.request.use(
  (config) => {
    // Try to get token from cookie first
    let token = Cookies.get("auth_token");

    // Fallback to localStorage for local development
    if (!token && window.location.hostname === "localhost") {
      token = localStorage.getItem("token");
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear cookie and localStorage
      Cookies.remove("auth_token", { domain: ".yourcompany.com" });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

#### Store token in cookie after login (`AuthContext.tsx`)

```typescript
import Cookies from "js-cookie";

const login = async (email: string, password: string) => {
  const response = await authService.login({ email, password });

  // Get domain for cookie
  const domain =
    window.location.hostname === "localhost" ? "localhost" : ".yourcompany.com"; // Leading dot shares with subdomains

  // Store token in cookie (accessible by all subdomains)
  Cookies.set("auth_token", response.accessToken, {
    domain: domain,
    secure: window.location.protocol === "https:", // Only over HTTPS in production
    sameSite: "lax", // CSRF protection
    expires: 7, // 7 days
  });

  // Also store in localStorage as backup
  localStorage.setItem("token", response.accessToken);
  localStorage.setItem("user", JSON.stringify(response.user));

  setToken(response.accessToken);
  setUser(response.user);
};

const logout = () => {
  const domain =
    window.location.hostname === "localhost" ? "localhost" : ".yourcompany.com";

  // Clear cookie from all subdomains
  Cookies.remove("auth_token", { domain: domain });

  // Clear localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  setToken(null);
  setUser(null);
};
```

#### Same for Career Portal (`frontend-career/src/services/api.ts`)

```typescript
import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8080/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Get token from cookie
api.interceptors.request.use(
  (config) => {
    // Try cookie first (works across subdomains)
    let token = Cookies.get("auth_token");

    // Fallback to localStorage for localhost
    if (!token && window.location.hostname === "localhost") {
      token = localStorage.getItem("token");
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
```

---

### Option 2: Backend Cookie Management (More Secure)

Let backend handle cookies using **HttpOnly** cookies (can't be accessed by JavaScript - more secure).

#### Update Backend to Send Cookies

```java
// AuthController.java
@PostMapping("/login")
public ResponseEntity<?> login(
    @Valid @RequestBody LoginRequest authRequest,
    HttpServletResponse response
) {
    // ... existing login logic ...

    // Create cookie
    Cookie authCookie = new Cookie("auth_token", jwt);
    authCookie.setPath("/");
    authCookie.setHttpOnly(true); // Can't be accessed by JavaScript (XSS protection)
    authCookie.setSecure(true);   // Only over HTTPS
    authCookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
    authCookie.setDomain(".yourcompany.com"); // Share with all subdomains

    response.addCookie(authCookie);

    return ResponseEntity.ok(new AuthResponse(jwt, convertToDTO(user)));
}

@PostMapping("/logout")
public ResponseEntity<?> logout(HttpServletResponse response) {
    // Clear cookie
    Cookie authCookie = new Cookie("auth_token", null);
    authCookie.setPath("/");
    authCookie.setMaxAge(0); // Delete immediately
    authCookie.setDomain(".yourcompany.com");

    response.addCookie(authCookie);

    return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
}
```

#### Update Security Config

```java
// SecurityConfig.java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();

    configuration.setAllowedOrigins(Arrays.asList(
        "https://admin.yourcompany.com",
        "https://careers.yourcompany.com",
        "http://localhost:3001", // For local dev
        "http://localhost:3002"
    ));

    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true); // Important for cookies!
    configuration.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

---

## 📦 Install js-cookie (Frontend)

```bash
# In both frontend and frontend-career
npm install js-cookie
npm install --save-dev @types/js-cookie
```

---

## 🏗️ Local Development Setup

For **localhost** development (different ports):

```typescript
// utils/cookieHelper.ts
import Cookies from "js-cookie";

export const cookieHelper = {
  getDomain: () => {
    const hostname = window.location.hostname;

    if (hostname === "localhost") {
      return "localhost"; // For local dev
    }

    // Extract root domain (e.g., yourcompany.com from admin.yourcompany.com)
    const parts = hostname.split(".");
    if (parts.length > 2) {
      return `.${parts.slice(-2).join(".")}`; // .yourcompany.com
    }
    return hostname;
  },

  setAuthToken: (token: string) => {
    Cookies.set("auth_token", token, {
      domain: cookieHelper.getDomain(),
      secure: window.location.protocol === "https:",
      sameSite: "lax",
      expires: 7,
    });
  },

  getAuthToken: () => {
    return Cookies.get("auth_token");
  },

  removeAuthToken: () => {
    Cookies.remove("auth_token", {
      domain: cookieHelper.getDomain(),
    });
  },
};
```

---

## 🌐 Production Deployment

### DNS Configuration

```
admin.yourcompany.com    -> Your frontend (port 3001)
careers.yourcompany.com  -> Your frontend-career (port 3002)
api.yourcompany.com      -> Your backend (port 8080)
```

### Nginx Configuration

```nginx
# Admin Portal
server {
    listen 443 ssl http2;
    server_name admin.yourcompany.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Career Portal
server {
    listen 443 ssl http2;
    server_name careers.yourcompany.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# API Backend
server {
    listen 443 ssl http2;
    server_name api.yourcompany.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🔒 Security Best Practices

### Cookie Attributes

```typescript
Cookies.set("auth_token", token, {
  domain: ".yourcompany.com", // Share with subdomains
  secure: true, // HTTPS only
  httpOnly: true, // Can't be accessed by JS (backend sets this)
  sameSite: "lax", // CSRF protection
  expires: 7, // 7 days
});
```

### Attribute Explanations

| Attribute  | Value              | Purpose                            |
| ---------- | ------------------ | ---------------------------------- |
| `domain`   | `.yourcompany.com` | Share cookie with all subdomains   |
| `secure`   | `true`             | Only send over HTTPS               |
| `httpOnly` | `true`             | Prevent XSS attacks (backend only) |
| `sameSite` | `lax`              | CSRF protection                    |
| `expires`  | `7` days           | Auto-logout after 7 days           |

---

## 🧪 Testing

### Test Shared Cookies

1. **Login to Admin Portal**

   ```
   https://admin.yourcompany.com/login
   ```

2. **Check Cookie**

   ```javascript
   // Browser console
   document.cookie;
   // Should see: auth_token=xxx; domain=.yourcompany.com
   ```

3. **Visit Career Portal**

   ```
   https://careers.yourcompany.com
   ```

4. **Verify Cookie Access**
   ```javascript
   // Career Portal console
   import Cookies from "js-cookie";
   Cookies.get("auth_token");
   // Should return the same token! ✅
   ```

---

## 📊 Comparison: Cookie vs postMessage

### For localhost (different ports)

- ✅ **postMessage** - Works great
- ⚠️ **Cookies** - Limited (different ports = different origins)

### For production (subdomains)

- ⚠️ **postMessage** - Complex, requires iframe tricks
- ✅ **Cookies** - Perfect, automatic sharing

---

## 🎯 Recommended Approach

### Development (localhost)

Use **postMessage** (already implemented) ✅

### Production (subdomains)

Use **Shared Cookies** (implement this) ✅

### Migration Path

1. Keep postMessage for local dev
2. Add cookie support with domain detection
3. In production, cookies automatically work
4. Both methods coexist peacefully!

---

## 💡 Quick Win: Hybrid Approach

```typescript
// utils/authStorage.ts
import Cookies from "js-cookie";

export const authStorage = {
  setToken: (token: string) => {
    // Method 1: Cookie (works in production)
    const domain =
      window.location.hostname === "localhost"
        ? undefined
        : `.${window.location.hostname.split(".").slice(-2).join(".")}`;

    Cookies.set("auth_token", token, {
      domain,
      secure: window.location.protocol === "https:",
      sameSite: "lax",
      expires: 7,
    });

    // Method 2: localStorage (fallback for localhost)
    localStorage.setItem("token", token);
  },

  getToken: (): string | null => {
    // Try cookie first
    return Cookies.get("auth_token") || localStorage.getItem("token");
  },

  removeToken: () => {
    const domain =
      window.location.hostname === "localhost"
        ? undefined
        : `.${window.location.hostname.split(".").slice(-2).join(".")}`;

    Cookies.remove("auth_token", { domain });
    localStorage.removeItem("token");
  },
};
```

---

## ✅ Next Steps

1. **Install js-cookie** in both frontends
2. **Update axios interceptors** to check cookies
3. **Update login/logout** to use cookies
4. **Test locally** (fallback to localStorage)
5. **Deploy to subdomains** (cookies automatically shared!)

---

## 🚀 Result

```
Login at admin.yourcompany.com
  ↓
Cookie set with domain=.yourcompany.com
  ↓
Visit careers.yourcompany.com
  ↓
Cookie automatically available!
  ↓
Authenticated without any sync code! ✅
```

Perfect for production! 🎉
