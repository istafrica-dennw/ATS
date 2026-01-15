# 🚀 Deployment Commands Quick Reference

Quick copy-paste commands for deploying your ATS application.

---

## 🔑 Generate Secrets

### JWT Secret (64+ characters)
```bash
openssl rand -base64 64
```

### Strong Password
```bash
openssl rand -base64 20
```

---

## 🗄️ Database Commands

### Test Database Connection (Local)
```bash
psql "postgresql://username:password@hostname:5432/database"
```

### Run Migrations Locally
```bash
cd backend
mvn flyway:migrate
```

### Check Migration Status
```bash
mvn flyway:info
```

---

## 🖥️ Backend Commands

### Build Backend (Local Test)
```bash
cd backend
mvn clean install
```

### Build Without Tests
```bash
mvn clean install -DskipTests
```

### Run Locally
```bash
java -jar target/ats-backend-0.0.1-SNAPSHOT.jar
```

### Run with Custom Port
```bash
java -jar -Dserver.port=8080 target/ats-backend-0.0.1-SNAPSHOT.jar
```

### Check Health
```bash
curl http://localhost:8080/actuator/health
```

### Test API Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ats.istafrica","password":"admin@atsafrica"}'
```

---

## 🌐 Frontend Commands

### Install Dependencies
```bash
cd frontend
npm install
```

### Run Development Server
```bash
npm start
```

### Build for Production
```bash
npm run build
```

### Test Production Build Locally
```bash
npm run build
npx serve -s build
```

### Clean Install
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📦 Render Deployment

### Connect via Render Dashboard
```
1. Go to https://dashboard.render.com
2. New → Web Service
3. Connect GitHub repository
4. Configure:
   - Root: backend
   - Build: mvn clean install -DskipTests
   - Start: java -Xmx512m -jar target/ats-backend-0.0.1-SNAPSHOT.jar
```

### Manual Deploy via Render CLI (Optional)
```bash
# Install Render CLI
npm install -g render

# Login
render login

# Deploy
render deploy
```

### Check Render Logs
```bash
# Via dashboard: Logs tab
# Or via CLI:
render logs -s your-service-name
```

---

## 🚀 Vercel Deployment

### Install Vercel CLI
```bash
npm install -g vercel
```

### Login to Vercel
```bash
vercel login
```

### Deploy to Production
```bash
cd frontend
vercel --prod
```

### Deploy with Force Rebuild
```bash
vercel --prod --force
```

### Check Deployment Status
```bash
vercel ls
```

### View Logs
```bash
vercel logs your-deployment-url
```

### Set Environment Variables (CLI)
```bash
vercel env add REACT_APP_API_URL production
# Then enter the value when prompted
```

---

## 🧪 Testing Commands

### Test Backend Health (Production)
```bash
curl https://your-backend.onrender.com/actuator/health
```

Expected Response:
```json
{"status":"UP"}
```

### Test Backend API (Production)
```bash
curl -X POST https://your-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ats.istafrica","password":"admin@atsafrica"}'
```

### Test Database Connection (Production)
```bash
# Get connection string from Render dashboard
psql "your-render-database-url"
```

### Check Frontend Build
```bash
cd frontend
npm run build
ls -lh build/static/js/
# Check bundle sizes
```

---

## 🔍 Debugging Commands

### View Backend Logs (Render)
```
Go to: https://dashboard.render.com
→ Your Service → Logs tab
```

### View Frontend Logs (Vercel)
```
Go to: https://vercel.com/dashboard
→ Your Project → Deployments → Select deployment → View Function Logs
```

### Check Database Connections
```bash
# In Render backend shell
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"
```

### Monitor Memory Usage
```bash
# In Render backend shell
free -h
```

### Check Disk Space
```bash
# In Render backend shell
df -h
```

---

## 🔄 Update & Redeploy

### Update Backend (Git Push)
```bash
cd backend
git add .
git commit -m "Update backend"
git push origin main
# Render auto-deploys on push
```

### Update Frontend (Git Push)
```bash
cd frontend
git add .
git commit -m "Update frontend"
git push origin main
# Vercel auto-deploys on push
```

### Manual Redeploy (Render)
```
Dashboard → Your Service → Manual Deploy → Deploy latest commit
```

### Manual Redeploy (Vercel)
```bash
cd frontend
vercel --prod
```

---

## 🗑️ Rollback Commands

### Rollback to Previous Deployment (Vercel)
```
1. Go to Vercel Dashboard
2. Deployments tab
3. Find previous working deployment
4. Click "..." → "Promote to Production"
```

### Rollback Backend (Render)
```
1. Go to Render Dashboard
2. Your Service → Events tab
3. Find previous successful deploy
4. Click "Rollback"
```

### Rollback via Git
```bash
# View history
git log --oneline

# Rollback to specific commit
git reset --hard <commit-hash>
git push -f origin main
```

---

## 📊 Monitoring Commands

### Check Backend Response Time
```bash
time curl https://your-backend.onrender.com/actuator/health
```

### Check Frontend Load Time
```bash
curl -w "@-" -o /dev/null -s https://your-frontend.vercel.app <<'EOF'
time_namelookup:  %{time_namelookup}\n
time_connect:  %{time_connect}\n
time_starttransfer:  %{time_starttransfer}\n
time_total:  %{time_total}\n
EOF
```

### Monitor Database Size
```bash
psql $DATABASE_URL -c "
SELECT
    pg_size_pretty(pg_database_size(current_database())) as db_size;
"
```

---

## 🔐 Security Commands

### Check for Security Vulnerabilities (Backend)
```bash
cd backend
mvn org.owasp:dependency-check-maven:check
```

### Check for Security Vulnerabilities (Frontend)
```bash
cd frontend
npm audit
```

### Fix Vulnerabilities (Frontend)
```bash
npm audit fix
# Or force fix (may break things)
npm audit fix --force
```

### Update Dependencies (Backend)
```bash
mvn versions:display-dependency-updates
```

### Update Dependencies (Frontend)
```bash
npm outdated
npm update
```

---

## 📝 Environment Variable Commands

### List Environment Variables (Local)
```bash
# Linux/Mac
env | grep REACT_APP

# Windows
set | findstr REACT_APP
```

### Load .env File (Local Testing)
```bash
# Install dotenv-cli
npm install -g dotenv-cli

# Run with .env
dotenv -e .env.production npm start
```

### Export Variables (Linux/Mac)
```bash
export REACT_APP_API_URL=https://your-backend.com
export REACT_APP_SOCKET_URL=https://your-backend.com
```

### Set Variables (Windows)
```cmd
set REACT_APP_API_URL=https://your-backend.com
set REACT_APP_SOCKET_URL=https://your-backend.com
```

---

## 🧹 Cleanup Commands

### Clean Backend Build
```bash
cd backend
mvn clean
```

### Clean Frontend Build
```bash
cd frontend
rm -rf build node_modules
npm install
```

### Clear Vercel Cache
```bash
vercel --prod --force
```

### Clear Render Cache
```
Dashboard → Service → Settings → Clear Build Cache
```

---

## 📦 Backup Commands

### Backup Database (Render)
```
Dashboard → Database → Backups → Create Manual Backup
```

### Export Database
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
psql $DATABASE_URL < backup_20240101.sql
```

### Backup Code
```bash
git archive --format=zip --output=../backup_$(date +%Y%m%d).zip main
```

---

## 🚨 Emergency Commands

### Stop Service (Render)
```
Dashboard → Service → Settings → Suspend Service
```

### Delete All Environment Variables (Vercel)
```bash
vercel env rm REACT_APP_API_URL production
```

### Force Restart (Render)
```
Dashboard → Service → Manual Deploy → Clear build cache & deploy
```

### Check Service Status
```bash
# Backend
curl -I https://your-backend.onrender.com/actuator/health

# Frontend
curl -I https://your-frontend.vercel.app
```

---

## 📊 Performance Testing

### Load Test Backend
```bash
# Install Apache Bench
apt-get install apache2-utils

# Test with 100 requests, 10 concurrent
ab -n 100 -c 10 https://your-backend.onrender.com/actuator/health
```

### Lighthouse Performance Test (Frontend)
```bash
# Install Lighthouse
npm install -g lighthouse

# Run test
lighthouse https://your-frontend.vercel.app --view
```

---

## 🔗 Quick Links

### Render Dashboard
```
https://dashboard.render.com
```

### Vercel Dashboard
```
https://vercel.com/dashboard
```

### AWS SES Console
```
https://console.aws.amazon.com/ses/
```

### Generate JWT Secret Online
```
https://randomkeygen.com/
```

---

## 📞 Service Status Pages

### Check Render Status
```
https://status.render.com/
```

### Check Vercel Status
```
https://www.vercel-status.com/
```

### Check AWS Status
```
https://health.aws.amazon.com/health/status
```

---

## 💡 Useful One-Liners

### Get Public IP
```bash
curl ifconfig.me
```

### Test SMTP Connection
```bash
openssl s_client -connect email-smtp.eu-north-1.amazonaws.com:587 -starttls smtp
```

### Generate Random Password
```bash
openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
```

### Check SSL Certificate
```bash
openssl s_client -connect your-domain.com:443 -showcerts
```

### Pretty Print JSON Response
```bash
curl https://your-backend.onrender.com/actuator/health | jq '.'
```

### Check DNS Propagation
```bash
dig your-domain.com
```

---

**📌 Bookmark this page for quick reference during deployment!**
