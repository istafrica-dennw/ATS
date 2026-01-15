# ✅ Production Deployment Checklist

Use this checklist to ensure a smooth deployment to production.

---

## 📋 Pre-Deployment

### Code Preparation
- [ ] All features tested locally
- [ ] No console.log or debug statements in production code
- [ ] All dependencies up to date
- [ ] No security vulnerabilities (`npm audit`, `mvn dependency:check`)
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Git repository up to date

### Environment Setup
- [ ] Render account created
- [ ] Vercel account created
- [ ] AWS SES account created (or alternative email service)
- [ ] PostgreSQL database plan selected
- [ ] Domain names registered (if using custom domains)

### Secrets Generated
- [ ] JWT_SECRET generated (64+ characters)
- [ ] Strong admin password created
- [ ] Database password created
- [ ] Email SMTP credentials obtained
- [ ] IAA credentials configured (if applicable)

---

## 🗄️ Database Setup (Render)

- [ ] PostgreSQL database created on Render
- [ ] Database name: `ats_db`
- [ ] Database user created
- [ ] Database password saved securely
- [ ] Connection string copied
- [ ] Database accessible from backend service
- [ ] Flyway migrations tested locally
- [ ] Backup schedule configured

**Database Connection String Format:**
```
postgresql://<user>:<password>@<host>:<port>/<database>
```

---

## 🖥️ Backend Deployment (Render)

### Service Configuration
- [ ] Web service created
- [ ] Service name: `ats-backend`
- [ ] Region selected (same as database)
- [ ] Runtime: Java
- [ ] Root directory: `backend`
- [ ] Build command: `mvn clean install -DskipTests`
- [ ] Start command: `java -Xmx512m -Xms256m -jar target/ats-backend-0.0.1-SNAPSHOT.jar`
- [ ] Health check path: `/actuator/health`

### Environment Variables Configured
- [ ] `SERVER_PORT=8080`
- [ ] `FRONTEND_URL` (will update after frontend deploy)
- [ ] `BACKEND_URL` (Render provides this)
- [ ] `SPRING_DATASOURCE_URL`
- [ ] `POSTGRES_USER`
- [ ] `POSTGRES_PASSWORD`
- [ ] `SPRING_SECURITY_USER_NAME`
- [ ] `SPRING_SECURITY_USER_PASSWORD`
- [ ] `SPRING_SECURITY_USER_ROLES`
- [ ] `JWT_SECRET`
- [ ] `JWT_EXPIRATION=86400000`
- [ ] `MAIL_HOST`
- [ ] `MAIL_PORT=587`
- [ ] `MAIL_USERNAME`
- [ ] `MAIL_PASSWORD`
- [ ] `MAIL_FROM`
- [ ] `MAIL_AWS_ENABLED=true`
- [ ] `SOCKETIO_HOST=0.0.0.0`
- [ ] `SOCKETIO_PORT=9092`
- [ ] `UPLOADS_DIRECTORY=/opt/render/project/src/uploads`

### Optional Variables
- [ ] `AI_PROVIDER` (if using AI features)
- [ ] `AI_BASE_URL` (if using AI features)
- [ ] `OPENAI_API_KEY` (if using OpenAI)
- [ ] `IAA_CLIENT_SECRET` (if using IAA)
- [ ] `IAA_TOKEN_URL` (if using IAA)
- [ ] `IAA_PUBLIC_KEY` (if using IAA)

### Deployment
- [ ] Service deployed successfully
- [ ] No build errors
- [ ] Health check passing
- [ ] Backend URL noted: `https://___________.onrender.com`

### Verification
- [ ] Health endpoint accessible: `/actuator/health`
- [ ] Swagger UI accessible: `/swagger-ui.html`
- [ ] Test login endpoint works
- [ ] Database connection confirmed
- [ ] Logs show no errors

**Test Backend:**
```bash
curl https://your-backend.onrender.com/actuator/health
```

---

## 🌐 Frontend Deployment (Vercel)

### Repository Configuration
- [ ] `vercel.json` created
- [ ] Backend URL updated in `vercel.json` rewrites
- [ ] `proxy` removed from `package.json` (or commented out)
- [ ] All changes committed and pushed

### Vercel Project Setup
- [ ] GitHub repository connected
- [ ] Project created
- [ ] Framework detected: Create React App
- [ ] Root directory: `frontend`
- [ ] Build command: `npm run build`
- [ ] Output directory: `build`

### Environment Variables Configured
- [ ] `REACT_APP_API_URL` (backend URL, NO /api suffix)
- [ ] `REACT_APP_SOCKET_URL` (backend URL)

### Optional Variables (IAA)
- [ ] `REACT_APP_IAA_URL`
- [ ] `REACT_APP_IAA_FRONTEND_URL`
- [ ] `REACT_APP_IAA_CLIENT_ID`
- [ ] `REACT_APP_IAA_CLIENT_SECRET`

### Deployment
- [ ] Frontend deployed successfully
- [ ] No build errors
- [ ] No TypeScript errors
- [ ] Frontend URL noted: `https://___________.vercel.app`

### Verification
- [ ] Website loads without errors
- [ ] No console errors in browser
- [ ] Assets loading correctly
- [ ] Routing works (test multiple pages)
- [ ] Dark mode toggle works

**Test Frontend:**
Visit: `https://your-frontend.vercel.app`

---

## 🔗 Post-Deployment Configuration

### Update Backend with Frontend URL
- [ ] Go to Render backend service
- [ ] Navigate to Environment tab
- [ ] Update `FRONTEND_URL` with actual Vercel URL
- [ ] Save changes (triggers automatic redeploy)
- [ ] Wait for redeploy to complete

### Update Frontend with Backend URL
- [ ] Verify `vercel.json` has correct backend URL
- [ ] If changed, redeploy frontend

### CORS Verification
- [ ] Test API calls from frontend
- [ ] No CORS errors in browser console
- [ ] Login works from frontend
- [ ] File uploads work
- [ ] All API endpoints accessible

---

## 🧪 End-to-End Testing

### User Registration & Authentication
- [ ] Can register new user
- [ ] Email verification works
- [ ] Can login with email/password
- [ ] JWT token stored correctly
- [ ] Can logout
- [ ] Password reset works
- [ ] LinkedIn OAuth works (if configured)
- [ ] IAA login works (if configured)

### Admin Functions
- [ ] Can login as admin
- [ ] Can create job postings
- [ ] Can edit job postings
- [ ] Can delete job postings
- [ ] Can view applications
- [ ] Can change application status
- [ ] Can assign interviewers
- [ ] Can manage users

### Candidate Functions
- [ ] Can view job listings
- [ ] Can apply to jobs
- [ ] Can upload resume
- [ ] Can track application status
- [ ] Can respond to job offers
- [ ] Can withdraw applications

### Interviewer Functions
- [ ] Can view assigned interviews
- [ ] Can update interview notes
- [ ] Can submit interview feedback
- [ ] Can schedule interviews

### Real-time Features
- [ ] Chat works
- [ ] Notifications appear
- [ ] Socket.IO connected
- [ ] No connection errors

### Email Notifications
- [ ] Registration emails sent
- [ ] Password reset emails sent
- [ ] Application confirmation emails sent
- [ ] Interview invitation emails sent

---

## 🔒 Security Verification

### SSL/HTTPS
- [ ] Backend uses HTTPS (automatic on Render)
- [ ] Frontend uses HTTPS (automatic on Vercel)
- [ ] No mixed content warnings
- [ ] Secure cookies enabled

### Authentication
- [ ] JWT tokens expire correctly
- [ ] Refresh token flow works
- [ ] Unauthorized requests blocked
- [ ] Role-based access working

### Data Protection
- [ ] Passwords hashed (bcrypt)
- [ ] Sensitive data encrypted
- [ ] No secrets in logs
- [ ] SQL injection protected (JPA)
- [ ] XSS protection enabled

### API Security
- [ ] Rate limiting configured (if applicable)
- [ ] CORS properly configured
- [ ] API endpoints protected
- [ ] File upload size limits enforced

---

## 📊 Monitoring Setup

### Render
- [ ] Auto-deploy enabled from GitHub
- [ ] Health check alerts configured
- [ ] Log retention configured
- [ ] Uptime monitoring enabled

### Vercel
- [ ] Deployment notifications enabled
- [ ] Analytics enabled (if using)
- [ ] Error monitoring configured
- [ ] Build notifications configured

### Database
- [ ] Backup schedule enabled
- [ ] Backup retention configured
- [ ] Connection pool monitoring
- [ ] Slow query logging

---

## 🚀 Optional: Custom Domains

### Backend (Render)
- [ ] Custom domain added: `api.yourdomain.com`
- [ ] DNS CNAME record created
- [ ] SSL certificate issued
- [ ] Domain verified and working

### Frontend (Vercel)
- [ ] Custom domain added: `www.yourdomain.com`
- [ ] DNS configured per Vercel instructions
- [ ] SSL certificate issued
- [ ] Domain verified and working

### Update Configuration
- [ ] Backend `FRONTEND_URL` updated with custom domain
- [ ] Frontend `REACT_APP_API_URL` updated with custom domain
- [ ] Both services redeployed with new URLs

---

## 📱 Performance Optimization

### Backend
- [ ] Database indexes created
- [ ] Query optimization done
- [ ] Caching configured (if applicable)
- [ ] Connection pool tuned
- [ ] Log levels appropriate (INFO for production)

### Frontend
- [ ] Build optimized (minified, tree-shaken)
- [ ] Images optimized
- [ ] Code splitting enabled
- [ ] Lazy loading implemented
- [ ] CDN caching configured

---

## 📝 Documentation

### Internal Documentation
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Rollback procedure documented
- [ ] Troubleshooting guide created
- [ ] Admin credentials stored securely

### User Documentation
- [ ] User guide available
- [ ] FAQ created
- [ ] Support contact provided
- [ ] Terms of service published
- [ ] Privacy policy published

---

## 💾 Backup & Recovery

### Database Backups
- [ ] Daily automated backups enabled
- [ ] Backup retention policy set
- [ ] Backup restoration tested
- [ ] Off-site backup configured (if critical)

### Code Backups
- [ ] Code in Git version control
- [ ] Protected branches configured
- [ ] Multiple team members have access
- [ ] Repository backed up externally

### Disaster Recovery Plan
- [ ] Recovery time objective (RTO) defined
- [ ] Recovery point objective (RPO) defined
- [ ] Disaster recovery procedure documented
- [ ] Regular DR drills scheduled

---

## 🎯 Go-Live Checklist

### Final Verification (1 hour before)
- [ ] All tests passing
- [ ] No open critical bugs
- [ ] All team members notified
- [ ] Support team ready
- [ ] Rollback plan ready

### Go-Live
- [ ] DNS changes made (if applicable)
- [ ] All services running
- [ ] Health checks passing
- [ ] Monitoring active
- [ ] Test critical user flows

### Post-Launch (First 24 hours)
- [ ] Monitor error logs
- [ ] Monitor performance metrics
- [ ] Monitor user activity
- [ ] Respond to support tickets
- [ ] Document any issues

---

## 🐛 Known Issues & Workarounds

### Render Free Tier
- **Issue**: Service spins down after 15 minutes of inactivity
- **Workaround**: Use a paid plan or set up external pinging service
- **Impact**: First request after inactivity may take 30-60 seconds

### Vercel Build Timeout
- **Issue**: Build exceeds time limit
- **Workaround**: Optimize build, remove unused dependencies
- **Impact**: Deployment may fail

### PostgreSQL Connection Pool
- **Issue**: Connection pool exhausted
- **Workaround**: Tune `hikari.maximum-pool-size`
- **Impact**: Requests may timeout

---

## 📞 Support Contacts

### Services
- **Render Support**: https://render.com/docs/support
- **Vercel Support**: https://vercel.com/support
- **AWS SES Support**: AWS Support Console

### Team
- **Backend Lead**: ___________
- **Frontend Lead**: ___________
- **DevOps**: ___________
- **Database Admin**: ___________

---

## 🎉 Success Criteria

All items below should be ✅ before considering deployment successful:

- [ ] Backend deployed and healthy
- [ ] Frontend deployed and accessible
- [ ] Database connected and migrations applied
- [ ] All critical user flows tested
- [ ] No errors in logs (first hour)
- [ ] Email notifications working
- [ ] Real-time features working
- [ ] Admin can perform all functions
- [ ] Users can register and login
- [ ] SSL certificates valid
- [ ] Monitoring configured
- [ ] Backups enabled
- [ ] Team notified of go-live

---

## 📅 Post-Deployment Schedule

### Day 1
- [ ] Monitor logs continuously
- [ ] Test all features
- [ ] Respond to issues immediately

### Week 1
- [ ] Daily log review
- [ ] Performance monitoring
- [ ] User feedback collection
- [ ] Bug fix deployment if needed

### Month 1
- [ ] Review monitoring data
- [ ] Optimize performance
- [ ] Plan feature updates
- [ ] Review and rotate credentials

---

**Deployment Date**: ___________
**Deployed By**: ___________
**Backend URL**: ___________
**Frontend URL**: ___________
**Database**: ___________

---

**🎊 Congratulations on your successful deployment!**
