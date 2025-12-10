# ⚡ Quick Test Guide - Career Portal Application Submission

## 🎯 What to Test

All features are now implemented. Follow this guide to test the complete flow.

---

## 🚀 Quick Start (5 minutes)

### Step 1: Restart Career Portal

```bash
docker-compose restart frontend-career
```

Wait 30 seconds for rebuild.

### Step 2: Login to Admin Portal

```
URL: http://localhost:3001
Email: kidemana@gmail.com
Password: student@123
```

**Expected Console Messages:**

```
🔗 Admin Portal token bridge initialized
🔗 Token broadcasted to Career Portal
```

### Step 3: Open Career Portal

```
URL: http://localhost:3002
```

**Open Browser Console (F12) and check:**

```javascript
localStorage.getItem("token");
// Should return: "eyJhbGciOiJIUzI1NiIs..." ✅
```

**Expected Console Messages:**

```
🔗 Career Portal token bridge initialized - auto-syncing with Admin Portal
[TokenBridge] Received token from Admin Portal: ✅
```

### Step 4: Browse Jobs

```
Click on any job card
```

**Expected:**

- ✅ Clean description (no HTML tags)
- ✅ Three badges: [Full Time] [ONSITE] [PUBLISHED]
- ✅ All information displays correctly

### Step 5: Apply to Job

```
Click "Apply Now" button
```

**Expected:**

- ✅ Loading skeleton appears briefly
- ✅ Blue banner: "Welcome back! We've pre-filled..."
- ✅ Form pre-filled with your data:
  - First Name: (your name)
  - Last Name: (your last name)
  - Email: kidemana@gmail.com
  - Phone: (your phone if set)

**Console Messages:**

```
[CookieAuth] Token retrieved from localStorage
Pre-filling form with cached user data: kidemana@gmail.com
Pre-filling form with API user data: kidemana@gmail.com
```

### Step 6: Submit Application

```
1. Upload a resume (PDF/DOC/DOCX)
2. (Optional) Add cover letter
3. Click "Submit Application"
```

**Expected Console Messages:**

```
[API] Request to /applications - Token: ✅ Added
Submitting application for job: 1
Form data: {...}
[API] Response from /applications - Status: 201 ✅
Application submitted successfully: {...}
```

**Expected UI:**

```
✅ Success toast: "Application submitted successfully! 🎉"
→ Redirects to /jobs after 2 seconds
```

### Step 7: Verify in Admin Portal

```
1. Go back to: http://localhost:3001
2. Navigate to: Admin → Jobs → [Your Job]
3. Click "View Applications"
```

**Expected:**

- ✅ See your new application listed
- ✅ Status: APPLIED
- ✅ All information correct

---

## 🧪 Test Scenarios

### ✅ Test 1: Authenticated User (Happy Path)

```
1. Login to Admin → Token synced ✅
2. Browse jobs → Display correct ✅
3. Click Apply → Form pre-filled ✅
4. Upload resume → File accepted ✅
5. Submit → Success! ✅
6. Redirected → Back to jobs ✅
```

### ✅ Test 2: Guest User (No Token)

```
1. Clear localStorage: localStorage.clear()
2. Refresh Career Portal
3. Browse jobs → Works ✅
4. Click Apply → Yellow banner shows ✅
5. Try submit → Error: "Login required" ✅
```

### ✅ Test 3: Duplicate Application

```
1. Apply to same job twice
2. Expected error: "You have already applied" ✅
3. HTTP 409 Conflict ✅
```

### ✅ Test 4: Token Expiration

```
1. Wait for token to expire OR
2. Manually set invalid token
3. Try to apply
4. Expected: 401 error, auth data cleared ✅
5. User redirected or shown error ✅
```

---

## 🔍 Debug Checklist

### Backend Running?

```bash
docker-compose ps
# Should show:
# ats-backend    Up    0.0.0.0:8080->8080/tcp ✅
```

### Token Synced?

```javascript
// Career Portal console:
localStorage.getItem("token");
// Should return token ✅
```

### Token in Request?

```javascript
// Career Portal console → Network tab:
// Click on /applications request
// Headers → Authorization: Bearer eyJhbG... ✅
```

### User Profile Loaded?

```javascript
// Career Portal console:
localStorage.getItem("user");
// Should return user JSON ✅
```

---

## 🆘 Common Issues

### Issue: Token not syncing

**Solution:**

1. Make sure both tabs open in **same browser**
2. Check console for error messages
3. Try manual sync:
   ```javascript
   // Admin Portal console:
   window.open(`http://localhost:3002?token=${localStorage.getItem("token")}`);
   ```

### Issue: Form not pre-filling

**Solution:**

1. Check token exists: `localStorage.getItem('token')`
2. Check user data: `localStorage.getItem('user')`
3. Check console for API errors
4. Verify backend is running

### Issue: 401 Unauthorized on submit

**Solution:**

1. Token expired - login again
2. Check token format in request headers
3. Verify backend accepts token

### Issue: 409 Already Applied

**Solution:**

- You've already applied to this job
- Check admin portal for your application
- This is expected behavior ✅

---

## 📊 Success Metrics

After testing, you should see:

- [x] ✅ Backend running (8080)
- [x] ✅ Admin Portal running (3001)
- [x] ✅ Career Portal running (3002)
- [x] ✅ Token synced automatically
- [x] ✅ Job cards display correctly
- [x] ✅ Form auto-fills
- [x] ✅ Application submits successfully
- [x] ✅ Application visible in admin portal

---

## 🎉 Summary

**What's Working:**

- ✅ Complete authentication flow
- ✅ Automatic token syncing
- ✅ Form auto-fill from profile
- ✅ Correct API integration
- ✅ Error handling
- ✅ User-friendly messages

**Test it now:**

```bash
# 1. Restart
docker-compose restart frontend-career

# 2. Login to Admin Portal
http://localhost:3001

# 3. Test in Career Portal
http://localhost:3002/jobs

# 4. Apply to a job
Click job → Apply → Upload → Submit ✅
```

**Everything is ready!** 🚀
