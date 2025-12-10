# Frontend Career Portal - Setup Complete ✅

## Overview

The **frontend-career** is now set up as a completely independent frontend application for the ATS career portal. It's separate from the admin frontend (`/frontend`) and designed for public-facing job seekers.

## 📁 Project Structure

```
frontend-career/
├── public/                   # Static assets
│   ├── index.html
│   ├── manifest.json
│   ├── robots.txt
│   └── favicon files
├── src/
│   ├── pages/               # Page components
│   │   ├── HomePage.tsx         # Landing page
│   │   ├── JobsPage.tsx         # Job listings
│   │   ├── JobDetailsPage.tsx   # Job details
│   │   └── ApplyPage.tsx        # Application form
│   ├── services/            # API services
│   │   ├── api.ts               # Axios instance
│   │   ├── jobService.ts        # Job-related APIs
│   │   └── applicationService.ts # Application APIs
│   ├── types/               # TypeScript definitions
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   └── formatters.ts
│   ├── App.tsx              # Root component
│   ├── index.tsx            # Entry point
│   └── index.css            # Global styles
├── Dockerfile               # Production build
├── Dockerfile.dev           # Development build
├── nginx.conf               # Nginx configuration
├── package.json
├── tailwind.config.js       # Tailwind CSS config
├── tsconfig.json
├── .env                     # Environment variables
├── .env.example
└── README.md
```

## 🎨 Features Implemented

### Pages

1. **Home Page** - Landing page with hero section and features
2. **Jobs Page** - Browse and search job listings
3. **Job Details Page** - Detailed job information
4. **Apply Page** - Application submission form with resume upload

### Key Features

- ✅ Full dark mode support (follows system preference)
- ✅ Responsive design for all screen sizes
- ✅ Smooth animations with Framer Motion
- ✅ Toast notifications for user feedback
- ✅ File upload support for resumes
- ✅ Form validation
- ✅ API integration ready
- ✅ Optimized production build with Nginx

## 🐳 Docker Configuration

### Development

```yaml
frontend-career:
  build:
    context: ./frontend-career
    dockerfile: Dockerfile.dev
  ports:
    - "3002:3002"
  volumes:
    - ./frontend-career:/app
    - /app/node_modules
```

### Production

```yaml
frontend-career:
  build:
    context: ./frontend-career
    dockerfile: Dockerfile
  ports:
    - "80:80"
  environment:
    - NODE_ENV=production
```

## 🚀 Running the Application

### With Docker (Recommended)

**Development:**

```bash
# Start career portal only
docker-compose up frontend-career

# Start with backend
docker-compose up backend frontend-career

# Start all services
docker-compose up
```

**Production:**

```bash
# Build and run production version
docker-compose -f docker-compose.prod.yml up frontend-career
```

### Without Docker

**Development:**

```bash
cd frontend-career
npm install
npm start
```

**Production:**

```bash
cd frontend-career
npm install
npm run build
# Serve the build folder
```

## 🌐 Ports

- **Development:** `http://localhost:3002`
- **Production:** `http://localhost:80` (or configured domain)

## 🎯 Environment Variables

Create a `.env` file (see `.env.example`):

```env
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_NAME=Career Portal
REACT_APP_VERSION=1.0.0
PORT=3002
```

## 📦 Dependencies

### Core

- React 18
- TypeScript
- React Router DOM

### UI/UX

- Tailwind CSS
- Framer Motion
- Heroicons
- React Toastify

### Utilities

- Axios (API calls)
- date-fns (Date formatting)

## 🎨 Dark Mode Implementation

Following the workspace rules:

- Uses `darkMode: 'media'` in Tailwind config
- Automatically follows system dark mode preference
- Comprehensive dark mode classes on all components
- Consistent color patterns:
  - Text: `text-gray-900 dark:text-gray-100`
  - Backgrounds: `bg-white dark:bg-gray-800`
  - Borders: `border-gray-200 dark:border-gray-700`

## 🔌 API Integration

The frontend connects to the backend API at `REACT_APP_API_URL`:

### Endpoints Used

- `GET /api/jobs` - List all jobs
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs/:id/apply` - Submit application (multipart/form-data)

## 📱 Responsive Design

All pages are fully responsive:

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🔒 Security Features

- Nginx security headers configured
- File upload size limits (5MB)
- Input validation on forms
- XSS protection with React
- CORS handling via backend

## 🚢 Deployment

### Standalone Deployment

The career portal can be deployed independently:

```bash
# Build Docker image
docker build -t career-portal -f Dockerfile .

# Run container
docker run -p 80:80 \
  -e REACT_APP_API_URL=https://api.yourcompany.com \
  career-portal
```

### With Docker Compose

```bash
docker-compose -f docker-compose.prod.yml up -d frontend-career
```

## 🔄 Integration with Main ATS

- **Independent:** Runs separately from admin frontend
- **Shared Backend:** Uses same backend API
- **Different Port:** Dev on 3002, Admin on 3001
- **Separate Domain:** Can be deployed to `careers.company.com`

## 📝 Next Steps

1. **Add Backend Endpoints:**

   - Ensure `/api/jobs` returns job listings
   - Implement `/api/jobs/:id/apply` for application submission
   - Add file upload handling in backend

2. **Customization:**

   - Update logo/branding in `public/` folder
   - Customize colors in `tailwind.config.js`
   - Update company information in pages

3. **Testing:**

   - Run `npm test` for unit tests
   - Test dark mode in different browsers
   - Test responsive design on mobile devices

4. **Production:**
   - Set production environment variables
   - Configure SSL/TLS certificates
   - Set up domain/subdomain
   - Configure CDN for static assets (optional)

## 📚 Documentation

- Main README: `/frontend-career/README.md`
- API Documentation: See backend docs
- Dark Mode Guidelines: `/.cursor/rules/dark-mode-theme.mdc`

## ✅ Checklist

- [x] Project structure created
- [x] All pages implemented
- [x] Dark mode support added
- [x] API services configured
- [x] Docker configuration added
- [x] Production build optimized
- [x] Nginx configured
- [x] Environment variables set
- [x] Documentation written
- [x] Added to docker-compose.yml
- [x] Added to docker-compose.prod.yml

## 🎉 Status

**The frontend-career is now fully set up and ready for development!**

You can start it with:

```bash
docker-compose up frontend-career
```

Or access it directly at `http://localhost:3002` after running the command.
