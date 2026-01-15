# 🚀 ATS Deployment - Quick Start

This document provides a **quick overview** of deploying your ATS application to production.

---

## 📚 Documentation Files

1. **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Complete step-by-step deployment guide
2. **[ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)** - All environment variables explained
3. **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Comprehensive deployment checklist
4. **[backend/.env.render.template](./backend/.env.render.template)** - Backend environment template
5. **[frontend/.env.production.template](./frontend/.env.production.template)** - Frontend environment template

---

## 🎯 Quick Deploy (5 Steps)

### Step 1: Create Render Database (5 minutes)
1. Go to [Render Dashboard](https://dashboard.render.com)
2. New → PostgreSQL
3. Name: `ats-postgres`, Region: Oregon, Plan: Free
4. Save connection details

### Step 2: Deploy Backend to Render (10 minutes)
1. New → Web Service
2. Connect GitHub repo
3. Root: `backend`, Runtime: Java
4. Build: `mvn clean install -DskipTests`
5. Start: `java -Xmx512m -jar target/ats-backend-0.0.1-SNAPSHOT.jar`
6. Add environment variables (see template)
7. Deploy

### Step 3: Deploy Frontend to Vercel (5 minutes)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. New Project → Import from GitHub
3. Root: `frontend`, Framework: Create React App
4. Add environment variables
5. Deploy

### Step 4: Update URLs (2 minutes)
1. In Render: Update `FRONTEND_URL` with Vercel URL
2. In `frontend/vercel.json`: Update backend URL
3. Redeploy both

### Step 5: Test (5 minutes)
1. Visit frontend URL
2. Test login: `admin@ats.istafrica` / `admin@atsafrica`
3. Verify all features work

---

## 🔑 Required Environment Variables

### Backend (Render) - Minimum Required
```bash
SPRING_DATASOURCE_URL=postgresql://...
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
JWT_SECRET=generate_64_char_random_string
MAIL_HOST=email-smtp.eu-north-1.amazonaws.com
MAIL_PORT=587
MAIL_USERNAME=your_smtp_user
MAIL_PASSWORD=your_smtp_pass
MAIL_FROM=no-reply@yourdomain.com
FRONTEND_URL=https://your-frontend.vercel.app
BACKEND_URL=https://your-backend.onrender.com
```

### Frontend (Vercel) - Minimum Required
```bash
REACT_APP_API_URL=https://your-backend.onrender.com
REACT_APP_SOCKET_URL=https://your-backend.onrender.com
```

---

## 🛠️ Configuration Files Created

### Backend
- ✅ `backend/.env.render.template` - Environment variable template
- ✅ `backend/render.yaml` - Render service configuration

### Frontend
- ✅ `frontend/.env.production.template` - Environment variable template
- ✅ `frontend/vercel.json` - Vercel deployment configuration

---

## 📋 Pre-Deployment Checklist

- [ ] Generate JWT secret: `openssl rand -base64 64`
- [ ] Create strong admin password
- [ ] Get AWS SES SMTP credentials
- [ ] Commit all code changes
- [ ] Test locally first

---

## 🔧 Generate Secure JWT Secret

**Option 1 - OpenSSL** (Recommended):
```bash
openssl rand -base64 64
```

**Option 2 - Node.js**:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

**Option 3 - Python**:
```bash
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

**Option 4 - Online**:
Visit: https://randomkeygen.com/

---

## 📧 Email Setup (AWS SES)

### Quick Setup
1. Create AWS account
2. Go to SES (Simple Email Service)
3. Verify your domain or email
4. Create SMTP credentials
5. Request production access (sandbox limits: 200 emails/day)

### Configuration
```bash
MAIL_HOST=email-smtp.eu-north-1.amazonaws.com
MAIL_PORT=587
MAIL_USERNAME=<from_aws_ses>
MAIL_PASSWORD=<from_aws_ses>
MAIL_FROM=no-reply@yourdomain.com
```

---

## 🚨 Common Issues & Solutions

### Backend Won't Start
**Error**: Build fails or service won't start
**Solutions**:
- Check all required env vars are set
- Verify database connection string format
- Check logs in Render dashboard
- Ensure JWT_SECRET is set

### Frontend Can't Connect to Backend
**Error**: CORS errors or 404 on API calls
**Solutions**:
- Update `FRONTEND_URL` in backend env vars
- Check `vercel.json` has correct backend URL
- Verify `REACT_APP_API_URL` has NO `/api` suffix
- Clear cache and redeploy

### Database Connection Fails
**Error**: Connection refused
**Solutions**:
- Verify PostgreSQL is running (Render dashboard)
- Check connection string format: `postgresql://...`
- Ensure backend and database in same region
- Test connection string locally

### Email Not Sending
**Error**: Emails not received
**Solutions**:
- Check AWS SES is out of sandbox mode
- Verify SMTP credentials are correct
- Check email address is verified in SES
- Review backend logs for email errors

---

## 📊 Cost Estimate

### Free Tier (Development/Testing)
- **Render**: Free PostgreSQL + Free Web Service
- **Vercel**: Free tier
- **Total**: $0/month
- **Limitations**: Services spin down, limited resources

### Production (Recommended)
- **Render Database**: $7/month (Starter PostgreSQL)
- **Render Web Service**: $7/month (Starter plan - Always on)
- **Vercel**: $0-20/month (Pro optional)
- **AWS SES**: ~$0.10 per 1000 emails
- **Total**: ~$14-34/month

---

## 🧪 Testing Deployment

### Backend Health Check
```bash
curl https://your-backend.onrender.com/actuator/health
```
Expected: `{"status":"UP"}`

### Frontend Test
Visit: `https://your-frontend.vercel.app`

### API Test
```bash
curl -X POST https://your-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ats.istafrica","password":"admin@atsafrica"}'
```

---

## 🎓 Next Steps After Deployment

1. **Change default admin password**
2. **Setup custom domains** (optional)
3. **Configure monitoring** (uptime, errors)
4. **Enable database backups**
5. **Setup CI/CD** (auto-deploy on push)
6. **Add error tracking** (Sentry, LogRocket)
7. **Optimize performance** (caching, CDN)

---

## 📱 Mobile Responsiveness

The frontend is fully responsive and works on:
- ✅ Desktop (1920px+)
- ✅ Laptop (1366px+)
- ✅ Tablet (768px+)
- ✅ Mobile (375px+)

---

## 🔐 Security Features

- ✅ HTTPS enforced (automatic)
- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ CORS protection
- ✅ SQL injection protection (JPA)
- ✅ XSS protection
- ✅ File upload size limits
- ✅ Rate limiting ready

---

## 📞 Support Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Spring Boot**: https://spring.io/guides
- **React**: https://reactjs.org/docs
- **PostgreSQL**: https://www.postgresql.org/docs/

---

## 🎯 Deployment Timeline

| Task | Time | Responsible |
|------|------|-------------|
| Generate secrets | 5 min | Dev |
| Setup AWS SES | 15 min | Dev |
| Create Render DB | 5 min | DevOps |
| Deploy backend | 15 min | DevOps |
| Deploy frontend | 10 min | DevOps |
| Update URLs | 5 min | DevOps |
| Testing | 15 min | QA |
| **Total** | **~70 min** | |

---

## ✅ Success Criteria

Your deployment is successful when:
- [ ] Backend health check returns `{"status":"UP"}`
- [ ] Frontend loads without errors
- [ ] Can login as admin
- [ ] Can create job posting
- [ ] Can register new user
- [ ] Email notifications work
- [ ] No CORS errors
- [ ] SSL certificates valid

---

## 🚀 Deploy Now!

1. **Read**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) (detailed guide)
2. **Use**: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) (track progress)
3. **Reference**: [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) (all env vars)
4. **Deploy**: Follow Step 1-5 above

---

## 📝 Quick Reference

### URLs After Deployment
```
Backend:  https://ats-backend.onrender.com
Frontend: https://ats-frontend.vercel.app
Swagger:  https://ats-backend.onrender.com/swagger-ui.html
Health:   https://ats-backend.onrender.com/actuator/health
```

### Default Credentials
```
Email:    admin@ats.istafrica
Password: admin@atsafrica
```
**⚠️ Change immediately after first login!**

### Tech Stack
```
Backend:  Spring Boot 3.2.3 + Java 17 + PostgreSQL
Frontend: React 18 + TypeScript + TailwindCSS
Deploy:   Render (backend) + Vercel (frontend)
```

---

**Need help?** Check the detailed [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) or [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

**🎉 Happy Deploying!**
