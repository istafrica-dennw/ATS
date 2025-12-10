# ATS Career Portal Frontend

This is the public-facing career portal frontend for the Applicant Tracking System (ATS). It allows job seekers to browse open positions and submit applications.

## Features

- 🔍 Browse and search job openings
- 📄 View detailed job descriptions
- 📝 Submit job applications with resume upload
- 🌓 Dark mode support (follows system preference)
- 📱 Fully responsive design
- ⚡ Fast and optimized performance

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Axios** - HTTP client
- **React Toastify** - Toast notifications
- **Heroicons** - Icon library
- **date-fns** - Date formatting

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (recommended)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Copy environment file:

```bash
cp .env.example .env
```

3. Update `.env` with your configuration

### Development

#### Using Docker (Recommended)

```bash
# Start the development server
docker-compose up frontend-career

# Or build and start
docker-compose up --build frontend-career
```

The application will be available at `http://localhost:3002`

#### Without Docker

```bash
# Start development server
npm start
```

### Building for Production

#### Using Docker

```bash
# Build production image
docker build -t ats-career-frontend .

# Run production container
docker run -p 80:80 ats-career-frontend
```

#### Without Docker

```bash
# Build production bundle
npm run build

# Serve the build folder with a static server
npx serve -s build
```

## Project Structure

```
frontend-career/
├── public/              # Static files
├── src/
│   ├── pages/          # Page components
│   │   ├── HomePage.tsx
│   │   ├── JobsPage.tsx
│   │   ├── JobDetailsPage.tsx
│   │   └── ApplyPage.tsx
│   ├── components/     # Reusable components
│   ├── services/       # API services
│   │   ├── api.ts
│   │   ├── jobService.ts
│   │   └── applicationService.ts
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Root component
│   ├── index.tsx       # Entry point
│   └── index.css       # Global styles
├── Dockerfile          # Production build
├── Dockerfile.dev      # Development build
├── nginx.conf          # Nginx configuration
└── package.json
```

## Environment Variables

| Variable            | Description             | Default                     |
| ------------------- | ----------------------- | --------------------------- |
| `REACT_APP_API_URL` | Backend API URL         | `http://localhost:8080/api` |
| `REACT_APP_NAME`    | Application name        | `Career Portal`             |
| `PORT`              | Development server port | `3002`                      |

## API Endpoints

The frontend communicates with the backend API:

- ✅ `GET /api/jobs?jobStatuses=PUBLISHED` - List all published jobs (working)
- ✅ `GET /api/jobs/:id` - Get job details (working)
- ⚠️ `POST /api/applications/public` - Submit application (needs backend implementation)

**Note**: See [../CAREER_PORTAL_BACKEND_REQUIREMENTS.md](../CAREER_PORTAL_BACKEND_REQUIREMENTS.md) for backend implementation details.

## Dark Mode

The application supports dark mode following the system preference:

- Uses `darkMode: 'media'` in Tailwind config
- Automatically switches based on OS settings
- All components are styled for both light and dark modes

## Docker Configuration

### Development

- Port: 3002
- Hot reload enabled
- Development dependencies included

### Production

- Multi-stage build for optimized size
- Nginx for static file serving
- Gzip compression enabled
- Security headers configured

## Scripts

- `npm start` - Start development server (port 3002)
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (one-way operation)

## Integration with Main ATS

This frontend is independent from the admin frontend (`/frontend`) but shares the same backend API. It's designed to be deployed separately with its own domain/subdomain (e.g., `careers.company.com`).

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the project's code style
2. Write meaningful commit messages
3. Test dark mode compatibility
4. Ensure responsive design works on all screen sizes
5. Use TypeScript types properly

## License

Proprietary - All rights reserved
