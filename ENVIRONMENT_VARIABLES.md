# 🔐 Environment Variables Quick Reference

## Backend Environment Variables (Render)

### Copy-Paste Template for Render Dashboard

```bash
# ========================================
# CORE CONFIGURATION
# ========================================
SERVER_PORT=8080
FRONTEND_URL=https://your-frontend.vercel.app
BACKEND_URL=https://your-backend.onrender.com

# ========================================
# DATABASE (PostgreSQL)
# ========================================
SPRING_DATASOURCE_URL=postgresql://hostname:5432/database_name
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password

# ========================================
# SECURITY & AUTHENTICATION
# ========================================
SPRING_SECURITY_USER_NAME=admin
SPRING_SECURITY_USER_PASSWORD=ChangeMe123!Secure
SPRING_SECURITY_USER_ROLES=ADMIN
JWT_SECRET=generate_with_openssl_rand_base64_64
JWT_EXPIRATION=86400000

# ========================================
# EMAIL CONFIGURATION
# ========================================
MAIL_HOST=email-smtp.eu-north-1.amazonaws.com
MAIL_PORT=587
MAIL_USERNAME=your_aws_smtp_username
MAIL_PASSWORD=your_aws_smtp_password
MAIL_FROM=no-reply@yourdomain.com
MAIL_AWS_ENABLED=true

# ========================================
# OPTIONAL: POSTAL MAIL (Nordic)
# ========================================
MAIL_POSTAL_ENABLED=false
MAIL_POSTAL_API_URL=https://postal.ist.com
MAIL_POSTAL_API_KEY=your_postal_key
MAIL_POSTAL_FROM=no-reply@ats.ist.com
MAIL_POSTAL_SEND_ENDPOINT=/api/v1/send/message

# ========================================
# SOCKET.IO
# ========================================
SOCKETIO_HOST=0.0.0.0
SOCKETIO_PORT=9092
SOCKETIO_PING_TIMEOUT=60000
SOCKETIO_PING_INTERVAL=25000

# ========================================
# FILE UPLOADS
# ========================================
UPLOADS_DIRECTORY=/opt/render/project/src/uploads

# ========================================
# AI CONFIGURATION (Optional)
# ========================================
AI_PROVIDER=ollama
AI_BASE_URL=http://your-ollama:11434
AI_MODEL=llama3
AI_API_KEY=
OPENAI_API_KEY=

# ========================================
# IAA AUTHENTICATION (Optional)
# ========================================
IAA_CLIENT_SECRET=your_iaa_client_secret
IAA_TOKEN_URL=https://your-iaa.com/api/auth/tokens
```

---

## Frontend Environment Variables (Vercel)

### Copy-Paste Template for Vercel Dashboard

```bash
# Backend API URL (NO /api suffix)
REACT_APP_API_URL=https://your-backend.onrender.com

# Socket.IO URL (same as backend)
REACT_APP_SOCKET_URL=https://your-backend.onrender.com

# IAA Configuration (Optional)
REACT_APP_IAA_URL=https://your-iaa-server.com
REACT_APP_IAA_FRONTEND_URL=https://your-iaa-frontend.com
REACT_APP_IAA_CLIENT_ID=your_iaa_client_id
REACT_APP_IAA_CLIENT_SECRET=your_iaa_client_secret
```

---

## How to Generate Secure Values

### 1. JWT Secret (Required)

**Using OpenSSL** (Linux/Mac/Git Bash):
```bash
openssl rand -base64 64
```

**Using Node.js**:
```javascript
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

**Using Python**:
```python
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

**Using Online Tool**:
- Visit: https://randomkeygen.com/
- Use "CodeIgniter Encryption Keys" section

### 2. Strong Admin Password

Use a password manager or:
```bash
openssl rand -base64 20
```

---

## Variable Descriptions

### Backend

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `SERVER_PORT` | Port for backend server | `8080` | ✅ |
| `FRONTEND_URL` | Your Vercel frontend URL | `https://ats.vercel.app` | ✅ |
| `BACKEND_URL` | Your Render backend URL | `https://ats.onrender.com` | ✅ |
| `SPRING_DATASOURCE_URL` | PostgreSQL connection string | `postgresql://...` | ✅ |
| `POSTGRES_USER` | Database username | `ats_user` | ✅ |
| `POSTGRES_PASSWORD` | Database password | `securePass123` | ✅ |
| `JWT_SECRET` | Secret key for JWT tokens | 64+ random chars | ✅ |
| `JWT_EXPIRATION` | Token expiry in milliseconds | `86400000` (24h) | ✅ |
| `MAIL_HOST` | SMTP server hostname | `email-smtp...` | ✅ |
| `MAIL_PORT` | SMTP server port | `587` | ✅ |
| `MAIL_USERNAME` | SMTP username | `AKIAIO...` | ✅ |
| `MAIL_PASSWORD` | SMTP password | `secure_pass` | ✅ |
| `MAIL_FROM` | From email address | `no-reply@...` | ✅ |
| `SOCKETIO_HOST` | Socket.IO bind address | `0.0.0.0` | ❌ |
| `SOCKETIO_PORT` | Socket.IO port | `9092` | ❌ |
| `AI_PROVIDER` | AI service provider | `ollama`/`openai` | ❌ |
| `AI_BASE_URL` | AI service URL | `http://...` | ❌ |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` | ❌ |
| `IAA_CLIENT_SECRET` | IAA client secret | `secret_key` | ❌ |
| `IAA_TOKEN_URL` | IAA token endpoint | `https://...` | ❌ |
| `UPLOADS_DIRECTORY` | File upload directory | `/opt/render/...` | ❌ |

### Frontend

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `REACT_APP_API_URL` | Backend API base URL | `https://backend.com` | ✅ |
| `REACT_APP_SOCKET_URL` | Socket.IO server URL | `https://backend.com` | ✅ |
| `REACT_APP_IAA_URL` | IAA server URL | `https://iaa.com` | ❌ |
| `REACT_APP_IAA_FRONTEND_URL` | IAA frontend URL | `https://iaa-ui.com` | ❌ |
| `REACT_APP_IAA_CLIENT_ID` | IAA OAuth client ID | `client_id_123` | ❌ |
| `REACT_APP_IAA_CLIENT_SECRET` | IAA OAuth secret | `secret_abc` | ❌ |

---

## Default Values Reference

These are the default values from `application.properties`:

```properties
SERVER_PORT=8080 (default)
JWT_EXPIRATION=86400000 (24 hours)
SOCKETIO_HOST=localhost (use 0.0.0.0 for Render)
SOCKETIO_PORT=9092
SOCKETIO_PING_TIMEOUT=60000
SOCKETIO_PING_INTERVAL=25000
AI_PROVIDER=ollama
AI_MODEL=llama3
MAIL_PORT=587
MAIL_AWS_ENABLED=true
```

---

## AWS SES Setup Guide

### 1. Create AWS Account
1. Go to [AWS Console](https://console.aws.amazon.com/)
2. Navigate to **SES (Simple Email Service)**
3. Choose your region (e.g., `eu-north-1`)

### 2. Verify Email Domain
1. Go to **Verified identities**
2. Click **Create identity**
3. Choose **Domain**
4. Enter your domain
5. Follow DNS verification steps

### 3. Create SMTP Credentials
1. Go to **SMTP settings**
2. Click **Create SMTP credentials**
3. Save the username and password
4. Use these for `MAIL_USERNAME` and `MAIL_PASSWORD`

### 4. Request Production Access
1. Go to **Account dashboard**
2. Click **Request production access**
3. Fill out the form (usually approved within 24 hours)

### 5. SES Configuration
```bash
MAIL_HOST=email-smtp.eu-north-1.amazonaws.com
MAIL_PORT=587
MAIL_USERNAME=AKIAIOSFODNN7EXAMPLE
MAIL_PASSWORD=<your_smtp_password>
MAIL_FROM=no-reply@yourdomain.com
```

---

## Common Mistakes to Avoid

### ❌ Backend Mistakes

1. **Wrong database URL format**:
   ```bash
   # Wrong
   SPRING_DATASOURCE_URL=postgres://...

   # Correct
   SPRING_DATASOURCE_URL=postgresql://...
   ```

2. **Missing JWT secret**:
   - Must be 32+ characters long
   - Should be random and secure

3. **Wrong CORS origin**:
   ```bash
   # Must match exactly (no trailing slash)
   FRONTEND_URL=https://ats.vercel.app
   ```

4. **Socket.IO host binding**:
   ```bash
   # Local
   SOCKETIO_HOST=localhost

   # Render (MUST use 0.0.0.0)
   SOCKETIO_HOST=0.0.0.0
   ```

### ❌ Frontend Mistakes

1. **Wrong API URL format**:
   ```bash
   # Wrong - has /api suffix
   REACT_APP_API_URL=https://backend.com/api

   # Correct - NO /api suffix
   REACT_APP_API_URL=https://backend.com
   ```

2. **Missing REACT_APP_ prefix**:
   ```bash
   # Wrong
   API_URL=https://backend.com

   # Correct
   REACT_APP_API_URL=https://backend.com
   ```

3. **Not redeploying after adding vars**:
   - Must redeploy for new env vars to take effect

---

## Testing Environment Variables

### Backend (Render)
```bash
# Check if backend can connect to database
curl https://your-backend.onrender.com/actuator/health

# Expected response:
# {"status":"UP","components":{"db":{"status":"UP"}}}
```

### Frontend (Vercel)
```javascript
// In browser console
console.log(process.env.REACT_APP_API_URL);
// Should print your backend URL
```

---

## Security Checklist

- [ ] JWT_SECRET is 64+ random characters
- [ ] Admin password is strong and unique
- [ ] Database password is strong
- [ ] Email credentials are secure
- [ ] No secrets committed to Git
- [ ] `.env` files in `.gitignore`
- [ ] HTTPS enabled (automatic on Render/Vercel)
- [ ] CORS configured correctly
- [ ] IAA secrets are secure (if used)
- [ ] Regular credential rotation scheduled

---

## Quick Deploy Commands

### Backend (Render)
```bash
# Render deploys automatically from Git
# To force rebuild:
# 1. Go to Render Dashboard
# 2. Click "Manual Deploy" → "Clear build cache & deploy"
```

### Frontend (Vercel)
```bash
# Option 1: Auto-deploy from Git (push to main)
git push origin main

# Option 2: Manual deploy with CLI
cd frontend
vercel --prod

# Option 3: Force rebuild
vercel --prod --force
```

---

## Support

If you encounter issues:
1. Check Render/Vercel logs
2. Verify all required env vars are set
3. Test locally first with same env vars
4. Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) troubleshooting section
