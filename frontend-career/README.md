# IST Career Portal (frontend-career)

A modern, public-facing career site for IST, built with React, TypeScript, and Tailwind CSS. This application displays job openings and company information, inspired by [career.ist.com](https://career.ist.com/).

## Features

- 🏠 **Home Page**: Hero section, company introduction, featured jobs, values, and locations preview
- 💼 **Jobs Page**: Full job listing with search and filters (work setting, department, location)
- 📄 **Job Details Page**: Detailed view of individual jobs with apply button
- 📍 **Locations Page**: Overview of all office locations across Europe
- 👥 **People Page**: Company culture, values, benefits, and testimonials

## Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling with automatic dark mode support
- **React Router** for navigation
- **Framer Motion** for animations
- **Axios** for API calls
- **Heroicons** for icons
- **HeadlessUI** for accessible UI components

## Getting Started

### Using Docker (Recommended)

```bash
# From the project root directory
docker-compose up frontend-career
```

The application will be available at `http://localhost:3002`.

### Local Development

```bash
# Navigate to the frontend-career directory
cd frontend-career

# Install dependencies
npm install

# Start the development server
npm start
```

## Project Structure

```
frontend-career/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── jobs/
│   │   │   ├── JobCard.tsx
│   │   │   └── JobFilters.tsx
│   │   └── layout/
│   │       ├── Footer.tsx
│   │       ├── Header.tsx
│   │       └── Layout.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── JobDetailsPage.tsx
│   │   ├── JobsPage.tsx
│   │   ├── LocationsPage.tsx
│   │   └── PeoplePage.tsx
│   ├── services/
│   │   ├── api.ts
│   │   └── jobService.ts
│   ├── styles/
│   │   └── index.css
│   ├── types/
│   │   └── job.ts
│   ├── App.tsx
│   └── index.tsx
├── Dockerfile
├── Dockerfile.dev
├── nginx.conf
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## API Integration

The application fetches job data from the backend API:

- `GET /api/jobs` - Get all published jobs
- `GET /api/jobs/:id` - Get a specific job by ID
- `GET /api/jobs/:id/custom-questions` - Get custom questions for a job

The API is automatically proxied through the development server (port 3002) or nginx in production.

## Environment Variables

| Variable            | Description             | Default              |
| ------------------- | ----------------------- | -------------------- |
| `REACT_APP_API_URL` | Backend API URL         | (empty - uses proxy) |
| `PORT`              | Development server port | `3002`               |

## Dark Mode

The application automatically detects the user's system preference for dark mode using `darkMode: 'media'` in Tailwind CSS configuration.

## Deployment

### Production Build

```bash
npm run build
```

The build output will be in the `build/` directory.

### Docker Production

```bash
docker build -t ats-frontend-career .
docker run -p 80:80 ats-frontend-career
```

## Related Projects

- `frontend/` - Main ATS admin dashboard
- `backend/` - Spring Boot API server
