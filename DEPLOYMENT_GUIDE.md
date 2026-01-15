# 🚀 ATS Production Deployment Guide

Complete guide for deploying the ATS (Applicant Tracking System) to production using **Render** (backend) and **Vercel** (frontend).

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Deployment (Render)](#backend-deployment-render)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Post-Deployment Configuration](#post-deployment-configuration)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts
- ✅ [Render.com](https://render.com) account (free tier available)
- ✅ [Vercel.com](https://vercel.com) account (free tier available)
- ✅ GitHub account with repository access
- ✅ PostgreSQL database (Render provides free tier)

### Required Services
- ✅ AWS SES or SMTP email service
- ✅ (Optional) IAA authentication server
- ✅ (Optional) Ollama/OpenAI for AI features
- ✅ (Optional) Postal mail service

### Required Tools
- ✅ Git installed locally
- ✅ Node.js 16+ and npm
- ✅ Java 17+ and Maven

---

## Backend Deployment (Render)

### Step 1: Prepare Your Repository

1. **Commit all changes**:
   ```bash
   cd backend
   git add .
   git commit -m "Prepare backend for Render deployment"
   git push origin main
   ```

2. **Verify `render.yaml` exists** in the `backend/` directory.

### Step 2: Create PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure database:
   - **Name**: `ats-postgres`
   - **Database**: `ats_db`
   - **User**: `ats_user`
   - **Region**: Choose closest to your users
   - **Plan**: Free (or paid for production)
4. Click **"Create Database"**
5. **Save the connection details**:
   - Internal Database URL
   - External Database URL
   - Username
   - Password

### Step 3: Create Web Service on Render

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure service:
   - **Name**: `ats-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Java`
   - **Build Command**:
     ```bash
     mvn clean install -DskipTests
     ```
   - **Start Command**:
     ```bash
     java -Xmx512m -Xms256m -jar target/ats-backend-0.0.1-SNAPSHOT.jar
     ```
   - **Plan**: Free (or paid)

### Step 4: Configure Environment Variables

In the Render dashboard, go to **Environment** tab and add these variables:

#### 🔐 **Critical Variables (Required)**

```bash
# Server
SERVER_PORT=8080

# Frontend URL (you'll update this after deploying frontend)
FRONTEND_URL=https://your-frontend.vercel.app

# Backend URL (Render will provide this)
BACKEND_URL=https://your-backend.onrender.com

# Database (from Step 2)
SPRING_DATASOURCE_URL=postgresql://...
POSTGRES_USER=ats_user
POSTGRES_PASSWORD=your_password

# Security
SPRING_SECURITY_USER_NAME=admin
SPRING_SECURITY_USER_PASSWORD=ChangeThisSecurePassword123!
SPRING_SECURITY_USER_ROLES=ADMIN

# JWT (generate with: openssl rand -base64 64)
JWT_SECRET=your_very_long_secure_random_jwt_secret_key_here
JWT_EXPIRATION=86400000

# Email (AWS SES)
MAIL_HOST=email-smtp.eu-north-1.amazonaws.com
MAIL_PORT=587
MAIL_USERNAME=your_aws_smtp_username
MAIL_PASSWORD=your_aws_smtp_password
MAIL_FROM=no-reply@yourdomain.com
MAIL_AWS_ENABLED=true
```

#### 📧 **Email Configuration (Choose One)**

**Option A: AWS SES (Recommended for production)**
```bash
MAIL_HOST=email-smtp.eu-north-1.amazonaws.com
MAIL_PORT=587
MAIL_USERNAME=AKIAIOSFODNN7EXAMPLE
MAIL_PASSWORD=your_aws_smtp_password
MAIL_FROM=no-reply@yourdomain.com
MAIL_AWS_ENABLED=true
```

**Option B: Postal (for Nordic region)**
```bash
MAIL_POSTAL_ENABLED=true
MAIL_POSTAL_API_URL=https://postal.ist.com
MAIL_POSTAL_API_KEY=your_api_key
MAIL_POSTAL_FROM=no-reply@ats.ist.com
MAIL_POSTAL_SEND_ENDPOINT=/api/v1/send/message
```

#### 🤖 **AI Configuration (Optional)**

**For Ollama:**
```bash
AI_PROVIDER=ollama
AI_BASE_URL=http://your-ollama-service:11434
AI_MODEL=llama3
AI_AUTH_TYPE=none
```

**For OpenAI:**
```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
AI_MODEL=gpt-4
```

#### 🔌 **Socket.IO Configuration**
```bash
SOCKETIO_HOST=0.0.0.0
SOCKETIO_PORT=9092
SOCKETIO_PING_TIMEOUT=60000
SOCKETIO_PING_INTERVAL=25000
```

#### 🔑 **IAA Configuration (Optional)**
```bash
IAA_CLIENT_SECRET=your_iaa_client_secret
IAA_TOKEN_URL=https://your-iaa-server.com/api/auth/tokens
IAA_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\nYOUR_KEY_HERE\n-----END PUBLIC KEY-----
```

#### 📁 **File Uploads**
```bash
UPLOADS_DIRECTORY=/opt/render/project/src/uploads
```

### Step 5: Deploy Backend

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Run the build command
   - Start your application
3. Monitor logs in the **Logs** tab
4. Once deployed, note your backend URL: `https://your-backend.onrender.com`

### Step 6: Verify Backend Deployment

1. **Health Check**:
   ```bash
   curl https://your-backend.onrender.com/actuator/health
   ```
   Expected response:
   ```json
   {"status":"UP"}
   ```

2. **API Documentation**:
   Visit: `https://your-backend.onrender.com/swagger-ui.html`

3. **Test Login**:
   ```bash
   curl -X POST https://your-backend.onrender.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@ats.istafrica","password":"admin@atsafrica"}'
   ```

---

## Frontend Deployment (Vercel)

### Step 1: Prepare Frontend Repository

1. **Update `vercel.json`**:
   ```bash
   cd frontend
   ```

2. **Edit `vercel.json`** and replace the backend URL:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://your-actual-backend.onrender.com/api/:path*"
       }
     ]
   }
   ```

3. **Remove proxy from `package.json`**:
   ```json
   {
     // Remove or comment out this line:
     // "proxy": "http://127.0.0.1:8080"
   }
   ```

4. **Commit changes**:
   ```bash
   git add .
   git commit -m "Configure frontend for Vercel deployment"
   git push origin main
   ```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   cd frontend
   vercel --prod
   ```

4. **Follow prompts**:
   - Set up and deploy? `Y`
   - Which scope? Choose your account
   - Link to existing project? `N`
   - What's your project's name? `ats-frontend`
   - In which directory is your code located? `./`
   - Want to override settings? `N`

#### Option B: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. **Import Git Repository**:
   - Connect your GitHub account
   - Select your ATS repository
4. **Configure Project**:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. **Environment Variables** (add these):

### Step 3: Configure Environment Variables on Vercel

In Vercel dashboard, go to **Settings** → **Environment Variables**:

```bash
# Backend API URL (your Render backend)
REACT_APP_API_URL=https://your-backend.onrender.com

# Socket.IO URL (same as backend)
REACT_APP_SOCKET_URL=https://your-backend.onrender.com

# IAA Configuration (if using)
REACT_APP_IAA_URL=https://your-iaa-server.com
REACT_APP_IAA_FRONTEND_URL=https://your-iaa-frontend.com
REACT_APP_IAA_CLIENT_ID=your_iaa_client_id
REACT_APP_IAA_CLIENT_SECRET=your_iaa_client_secret
```

### Step 4: Deploy Frontend

1. Click **"Deploy"**
2. Vercel will:
   - Install dependencies
   - Build your React app
   - Deploy to CDN
3. Note your frontend URL: `https://your-frontend.vercel.app`

### Step 5: Verify Frontend Deployment

1. Visit your Vercel URL: `https://your-frontend.vercel.app`
2. Test login with default credentials
3. Check browser console for errors
4. Test API connectivity

---

## Post-Deployment Configuration

### 1. Update Backend with Frontend URL

Go back to Render dashboard:
1. Navigate to your backend service
2. Go to **Environment** tab
3. Update `FRONTEND_URL`:
   ```bash
   FRONTEND_URL=https://your-actual-frontend.vercel.app
   ```
4. Click **"Save Changes"**
5. Backend will automatically redeploy

### 2. Configure CORS (if needed)

The application already has CORS configured via `application.properties`:
```properties
app.frontend.cors.allowed-origins=*
```

For production, you might want to restrict this:
```bash
# In Render environment variables
FRONTEND_URL=https://your-frontend.vercel.app,https://www.yourdomain.com
```

### 3. Setup Custom Domains (Optional)

#### For Backend (Render):
1. Go to **Settings** → **Custom Domains**
2. Add your domain: `api.yourdomain.com`
3. Configure DNS:
   ```
   Type: CNAME
   Name: api
   Value: your-backend.onrender.com
   ```

#### For Frontend (Vercel):
1. Go to **Settings** → **Domains**
2. Add your domain: `www.yourdomain.com`
3. Configure DNS (Vercel provides instructions)

### 4. Enable HTTPS (Automatic)

Both Render and Vercel provide free SSL certificates automatically.

### 5. Setup Database Backups

In Render PostgreSQL settings:
1. Enable **Daily Backups**
2. Set retention period
3. Configure backup notifications

### 6. Setup Monitoring

#### Render:
- Enable **Auto-Deploy** from GitHub
- Set up **Health Check Alerts**
- Configure **Log Retention**

#### Vercel:
- Enable **Analytics** (free tier available)
- Set up **Deployment Notifications**
- Configure **Error Monitoring**

---

## Environment Variables Reference

### Backend (Render) - Complete List

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SERVER_PORT` | ✅ | Server port | `8080` |
| `FRONTEND_URL` | ✅ | Frontend URL | `https://ats.vercel.app` |
| `BACKEND_URL` | ✅ | Backend URL | `https://ats.onrender.com` |
| `SPRING_DATASOURCE_URL` | ✅ | Database URL | `postgresql://...` |
| `POSTGRES_USER` | ✅ | DB username | `ats_user` |
| `POSTGRES_PASSWORD` | ✅ | DB password | `secure_pass` |
| `JWT_SECRET` | ✅ | JWT secret key | `random_64_chars` |
| `JWT_EXPIRATION` | ✅ | Token expiry (ms) | `86400000` |
| `MAIL_HOST` | ✅ | SMTP host | `email-smtp...` |
| `MAIL_PORT` | ✅ | SMTP port | `587` |
| `MAIL_USERNAME` | ✅ | SMTP username | `AKIAIO...` |
| `MAIL_PASSWORD` | ✅ | SMTP password | `secure_pass` |
| `MAIL_FROM` | ✅ | From email | `no-reply@...` |
| `SOCKETIO_HOST` | ❌ | Socket host | `0.0.0.0` |
| `SOCKETIO_PORT` | ❌ | Socket port | `9092` |
| `AI_PROVIDER` | ❌ | AI provider | `ollama` |
| `IAA_CLIENT_SECRET` | ❌ | IAA secret | `secret_key` |

### Frontend (Vercel) - Complete List

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `REACT_APP_API_URL` | ✅ | Backend API URL | `https://ats.onrender.com` |
| `REACT_APP_SOCKET_URL` | ✅ | Socket.IO URL | `https://ats.onrender.com` |
| `REACT_APP_IAA_URL` | ❌ | IAA server | `https://iaa.com` |
| `REACT_APP_IAA_FRONTEND_URL` | ❌ | IAA frontend | `https://iaa-ui.com` |
| `REACT_APP_IAA_CLIENT_ID` | ❌ | IAA client ID | `client_id` |
| `REACT_APP_IAA_CLIENT_SECRET` | ❌ | IAA secret | `secret` |

---

## Troubleshooting

### Backend Issues

#### 1. Build Fails on Render
```
❌ Error: Tests failed
```
**Solution**: Use `-DskipTests` flag:
```bash
mvn clean install -DskipTests
```

#### 2. Database Connection Fails
```
❌ Error: Connection refused
```
**Solutions**:
- Verify `SPRING_DATASOURCE_URL` format
- Check database is in same region
- Ensure database is running
- Test connection string locally

#### 3. Out of Memory Error
```
❌ Error: Java heap space
```
**Solution**: Add to environment variables:
```bash
JAVA_TOOL_OPTIONS=-Xmx512m -Xms256m
```

#### 4. Flyway Migration Fails
```
❌ Error: Flyway validation failed
```
**Solutions**:
- Check migration files are in `src/main/resources/db/migration`
- Verify migration naming: `V1__Description.sql`
- Clear Flyway schema history table if needed

### Frontend Issues

#### 1. API Calls Fail (CORS)
```
❌ Error: CORS policy blocked
```
**Solutions**:
- Update `FRONTEND_URL` in backend env vars
- Check `vercel.json` rewrites
- Verify backend CORS configuration

#### 2. Environment Variables Not Loading
```
❌ Error: undefined
```
**Solutions**:
- Ensure vars start with `REACT_APP_`
- Redeploy after adding env vars
- Clear build cache: `vercel --prod --force`

#### 3. Build Fails on Vercel
```
❌ Error: Build exceeded maximum duration
```
**Solutions**:
- Check for circular dependencies
- Optimize build: remove unused imports
- Upgrade Vercel plan if needed

#### 4. Blank Page After Deployment
```
❌ White screen, no errors
```
**Solutions**:
- Check browser console for errors
- Verify `REACT_APP_API_URL` is set
- Check routing configuration
- Test locally: `npm run build && serve -s build`

### Common Issues

#### 1. 404 on API Endpoints
**Check**:
- Backend is deployed and running
- `REACT_APP_API_URL` is correct
- `vercel.json` rewrites are configured
- Backend health endpoint works

#### 2. 500 Internal Server Error
**Check backend logs**:
```bash
# In Render dashboard, go to Logs tab
# Look for Java stack traces
```

#### 3. WebSocket Connection Fails
**Solutions**:
- Check `SOCKETIO_HOST=0.0.0.0`
- Verify `REACT_APP_SOCKET_URL`
- Ensure port 9092 is accessible
- Check Render allows WebSocket connections

---

## Deployment Checklist

### Before Deployment
- [ ] All code committed and pushed
- [ ] Environment variables documented
- [ ] Database migrations tested
- [ ] Tests passing locally
- [ ] Security credentials generated

### Backend (Render)
- [ ] PostgreSQL database created
- [ ] Web service created
- [ ] Environment variables configured
- [ ] Build and deployment successful
- [ ] Health check endpoint accessible
- [ ] Swagger UI accessible
- [ ] Test API login works

### Frontend (Vercel)
- [ ] vercel.json configured
- [ ] Environment variables set
- [ ] Build successful
- [ ] Frontend accessible
- [ ] Test login from frontend
- [ ] Check browser console for errors

### Post-Deployment
- [ ] Update backend with frontend URL
- [ ] Test complete user flow
- [ ] Configure custom domains (optional)
- [ ] Enable monitoring and alerts
- [ ] Setup database backups
- [ ] Document production credentials (securely!)

---

## Security Best Practices

1. **Never commit sensitive data**:
   - Use `.gitignore` for `.env` files
   - Use environment variables for secrets
   - Rotate credentials regularly

2. **Use strong passwords**:
   - JWT_SECRET: 64+ random characters
   - Admin password: Strong, unique
   - Database password: Strong, unique

3. **Enable HTTPS only**:
   - Both platforms provide free SSL
   - Redirect HTTP to HTTPS
   - Use secure cookies

4. **Regular updates**:
   - Keep dependencies updated
   - Monitor security advisories
   - Apply patches promptly

5. **Database security**:
   - Enable backups
   - Restrict IP access if possible
   - Use read replicas for scaling

---

## Cost Estimation

### Free Tier (Development/Testing)
- **Render**: Free PostgreSQL + Free Web Service
  - Limitations: Spins down after inactivity, 512MB RAM
- **Vercel**: Free tier
  - Limitations: 100GB bandwidth/month

### Production (Recommended)
- **Render**:
  - Database: $7/month (Starter PostgreSQL)
  - Web Service: $7/month (Starter plan)
- **Vercel**:
  - Pro: $20/month (team collaboration, analytics)

**Total**: ~$34/month for production-ready setup

---

## Support & Resources

- 📚 [Render Documentation](https://render.com/docs)
- 📚 [Vercel Documentation](https://vercel.com/docs)
- 📚 [Spring Boot Deployment](https://spring.io/guides/gs/spring-boot/)
- 📚 [React Deployment](https://create-react-app.dev/docs/deployment/)

---

## Next Steps

1. **Monitor your deployments**:
   - Set up error tracking (Sentry, LogRocket)
   - Configure uptime monitoring
   - Set up alerts for failures

2. **Optimize performance**:
   - Enable CDN caching
   - Optimize database queries
   - Implement Redis caching

3. **Scale as needed**:
   - Upgrade Render/Vercel plans
   - Add database replicas
   - Implement load balancing

---

**🎉 Congratulations! Your ATS is now deployed to production!**
