# Frontend Career Portal - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Navigate to the career portal directory

```bash
cd /Users/richardmazimpaka/Documents/ist-projects/ATS
```

### Step 2: Start the career portal with Docker

```bash
# Start only the career portal with backend
docker-compose up backend frontend-career

# Or start all services
docker-compose up
```

### Step 3: Access the application

Open your browser and go to:

- **Career Portal**: http://localhost:3002
- **API Backend**: http://localhost:8080
- **Admin Portal**: http://localhost:3001

## 📖 What You'll See

### Homepage (/)

- Hero section with call-to-action
- Feature highlights
- "Get Started" button leading to jobs page

### Jobs Page (/jobs)

- Search bar for job titles/descriptions
- Location filter
- Grid of job cards with:
  - Job title
  - Location
  - Salary range
  - Job type (Full-time, Part-time, etc.)
  - Status badges

### Job Details (/jobs/:id)

- Complete job description
- Requirements
- Responsibilities
- Application button

### Apply Page (/jobs/:id/apply)

- Application form with:
  - Personal information (first name, last name, email, phone)
  - Resume upload (PDF, DOC, DOCX - max 5MB)
  - Optional cover letter
  - Submit button

## 🎨 Features

- ✅ **Dark Mode**: Automatically follows your system preference
- ✅ **Responsive**: Works on mobile, tablet, and desktop
- ✅ **Animations**: Smooth transitions with Framer Motion
- ✅ **Notifications**: Toast messages for user feedback
- ✅ **Form Validation**: Client-side validation with error messages

## 🔧 Development

### Without Docker (Alternative)

```bash
cd frontend-career
npm install
npm start
```

### Build for Production

```bash
# With Docker
docker build -t career-portal .

# Without Docker
npm run build
```

## 🐛 Troubleshooting

### Port 3002 already in use

```bash
# Stop the container
docker-compose down

# Or change the port in docker-compose.yml
```

### API not connecting

1. Make sure backend is running on port 8080
2. Check `REACT_APP_API_URL` in `.env`
3. Verify CORS is configured in backend

### Module not found errors

```bash
# Rebuild with clean node_modules
docker-compose build --no-cache frontend-career
```

### Dark mode not working

- Check your system dark mode settings
- Verify `darkMode: 'media'` in `tailwind.config.js`

## 📝 Making Changes

### Update Job Listing

1. Pages are in `src/pages/`
2. Modify `JobsPage.tsx`
3. Changes auto-reload in development

### Customize Styling

1. Colors are in `tailwind.config.js`
2. Change `primary` color values
3. Update dark mode variants as needed

### Add New Page

1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation links

## 🎯 Next Steps

1. **Backend Integration**:

   - Ensure `/api/jobs` endpoint returns job data
   - Implement `/api/jobs/:id/apply` endpoint
   - Test file upload functionality

2. **Customization**:

   - Update branding/logo
   - Customize color scheme
   - Add company information

3. **Testing**:

   - Test all pages
   - Try dark mode toggle
   - Test on mobile devices

4. **Deployment**:
   - Set production environment variables
   - Build production Docker image
   - Deploy to hosting service

## 📚 Resources

- [Full Documentation](./README.md)
- [Setup Guide](../FRONTEND_CAREER_SETUP.md)
- [Dark Mode Guidelines](../.cursor/rules/dark-mode-theme.mdc)
- [Main Project README](../README.md)

## ✅ Verification Checklist

- [ ] Application loads at http://localhost:3002
- [ ] Homepage displays correctly
- [ ] Can navigate to Jobs page
- [ ] Dark mode works (try toggling system preference)
- [ ] Responsive on mobile (resize browser)
- [ ] Forms validate input
- [ ] File upload works

## 💡 Tips

- Use Chrome DevTools to test responsive design
- Check browser console for any errors
- Monitor Docker logs: `docker-compose logs -f frontend-career`
- Use React DevTools extension for debugging

## 🆘 Getting Help

If you encounter issues:

1. Check Docker logs: `docker-compose logs frontend-career`
2. Verify all services are running: `docker-compose ps`
3. Check environment variables in `.env`
4. Review the main documentation in `README.md`

---

**Happy coding! 🎉**
