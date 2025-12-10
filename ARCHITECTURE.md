# ATS System Architecture - Dual Frontend Design

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         ATS SYSTEM                              │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐    ┌──────────────────────────┐
│   ADMIN FRONTEND         │    │   CAREER PORTAL          │
│   (Internal Users)       │    │   (Public Users)         │
├──────────────────────────┤    ├──────────────────────────┤
│ Port: 3001               │    │ Port: 3002               │
│ Path: /frontend          │    │ Path: /frontend-career   │
│                          │    │                          │
│ Features:                │    │ Features:                │
│ • Job Management         │    │ • Browse Jobs            │
│ • Application Review     │    │ • Search & Filter        │
│ • Interview Scheduling   │    │ • Job Details            │
│ • User Administration    │    │ • Submit Applications    │
│ • Analytics              │    │ • Resume Upload          │
│ • Email Templates        │    │                          │
│                          │    │                          │
│ Users:                   │    │ Users:                   │
│ • HR Staff               │    │ • Job Seekers            │
│ • Recruiters             │    │ • Anonymous Visitors     │
│ • Interviewers           │    │ • Candidates             │
│ • Admins                 │    │                          │
└────────────┬─────────────┘    └────────────┬─────────────┘
             │                               │
             │                               │
             └───────────┬───────────────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │   BACKEND API          │
            │   Spring Boot          │
            ├────────────────────────┤
            │ Port: 8080             │
            │                        │
            │ Endpoints:             │
            │ • /api/jobs            │
            │ • /api/applications    │
            │ • /api/users           │
            │ • /api/auth            │
            │ • /api/interviews      │
            │ • /api/emails          │
            │                        │
            │ Features:              │
            │ • JWT Authentication   │
            │ • Role-Based Access    │
            │ • File Upload          │
            │ • Email Service        │
            │ • AI Resume Analysis   │
            └───────────┬────────────┘
                        │
                        ▼
            ┌────────────────────────┐
            │   DATABASE             │
            │   PostgreSQL           │
            ├────────────────────────┤
            │ Port: 5432             │
            │                        │
            │ Tables:                │
            │ • users                │
            │ • jobs                 │
            │ • applications         │
            │ • interviews           │
            │ • email_notifications  │
            │ • evaluations          │
            └────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION ENVIRONMENT                    │
└─────────────────────────────────────────────────────────────┘

        ┌──────────────────────────────────────┐
        │         Load Balancer / Nginx        │
        └──────────────┬───────────────────────┘
                       │
        ┌──────────────┼───────────────┐
        │              │               │
        ▼              ▼               ▼
┌───────────┐  ┌──────────────┐  ┌──────────┐
│   Admin   │  │   Career     │  │   API    │
│  Frontend │  │   Portal     │  │ Backend  │
│           │  │              │  │          │
│ Subdomain │  │  Subdomain   │  │ Subdomain│
│ admin.    │  │  careers.    │  │ api.     │
│ company.  │  │  company.    │  │ company. │
│ com       │  │  com         │  │ com      │
│           │  │              │  │          │
│ Container │  │  Container   │  │ Container│
│ (Nginx)   │  │  (Nginx)     │  │ (Spring) │
└───────────┘  └──────────────┘  └────┬─────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │   PostgreSQL    │
                              │   Database      │
                              │   (RDS/Managed) │
                              └─────────────────┘
```

## Request Flow

### Admin User Flow

```
Admin User
    │
    ├─1─→ Access admin.company.com
    │
    ├─2─→ Login with credentials
    │     (JWT token issued)
    │
    ├─3─→ Create/Edit Job
    │     POST /api/jobs
    │     (JWT in header)
    │
    ├─4─→ Review Applications
    │     GET /api/applications
    │
    ├─5─→ Schedule Interview
    │     POST /api/interviews
    │
    └─6─→ Send Email Notifications
          POST /api/emails
```

### Job Seeker Flow

```
Job Seeker
    │
    ├─1─→ Visit careers.company.com
    │     (No authentication required)
    │
    ├─2─→ Browse Jobs
    │     GET /api/jobs
    │
    ├─3─→ View Job Details
    │     GET /api/jobs/:id
    │
    ├─4─→ Submit Application
    │     POST /api/jobs/:id/apply
    │     (multipart/form-data with resume)
    │
    └─5─→ Receive Confirmation Email
          (Automated)
```

## Technology Stack by Layer

### Frontend Layer (Admin)

```
┌─────────────────────────────┐
│ React 18 + TypeScript       │
│ React Router DOM            │
│ Tailwind CSS                │
│ React Query                 │
│ Axios                       │
│ React Quill (Rich Editor)   │
│ React Toastify              │
└─────────────────────────────┘
```

### Frontend Layer (Career)

```
┌─────────────────────────────┐
│ React 18 + TypeScript       │
│ React Router DOM            │
│ Tailwind CSS                │
│ Framer Motion               │
│ Axios                       │
│ date-fns                    │
│ Heroicons                   │
│ React Toastify              │
└─────────────────────────────┘
```

### Backend Layer

```
┌─────────────────────────────┐
│ Spring Boot 3.2.3           │
│ Spring Security + JWT       │
│ Spring Data JPA             │
│ PostgreSQL Driver           │
│ Flyway (Migrations)         │
│ Lombok                      │
│ Swagger/OpenAPI             │
│ JavaMail                    │
└─────────────────────────────┘
```

### Database Layer

```
┌─────────────────────────────┐
│ PostgreSQL 15               │
│ Flyway Migrations           │
│ Connection Pooling          │
│ Indexes & Constraints       │
└─────────────────────────────┘
```

### Infrastructure Layer

```
┌─────────────────────────────┐
│ Docker + Docker Compose     │
│ Nginx (Reverse Proxy)       │
│ SSL/TLS (Let's Encrypt)     │
│ AWS EC2 / VPS               │
│ GitHub Actions (CI/CD)      │
└─────────────────────────────┘
```

## Data Flow

### Job Creation Flow

```
Admin (Browser)
      │
      ├──1──→ Fill Job Form
      │
      ├──2──→ Submit (POST /api/jobs)
      │       {
      │         "title": "Software Engineer",
      │         "description": "<html>...",
      │         "status": "PUBLISHED",
      │         ...
      │       }
      │
      ▼
Backend (Spring Boot)
      │
      ├──3──→ Validate JWT
      │
      ├──4──→ Check Permissions (ROLE_ADMIN)
      │
      ├──5──→ Save to Database
      │
      ▼
Database (PostgreSQL)
      │
      ├──6──→ INSERT INTO jobs (...)
      │
      └──7──→ Return Job ID
                    │
                    ▼
            ┌───────────────┐
            │ Job Published │
            │ & Visible on  │
            │ Career Portal │
            └───────────────┘
```

### Application Submission Flow

```
Job Seeker (Browser)
      │
      ├──1──→ Fill Application Form
      │       + Upload Resume
      │
      ├──2──→ Submit (POST /api/jobs/:id/apply)
      │       FormData:
      │         firstName, lastName, email, phone
      │         resume: File (PDF)
      │         coverLetter: text
      │
      ▼
Backend (Spring Boot)
      │
      ├──3──→ Validate Input
      │       (file size, format, required fields)
      │
      ├──4──→ Save Resume File
      │       → /uploads/resumes/uuid.pdf
      │
      ├──5──→ Create Application Record
      │       → applications table
      │
      ├──6──→ Trigger AI Resume Analysis (Optional)
      │       → Ollama API
      │
      ├──7──→ Send Confirmation Email
      │       → JavaMail
      │
      ▼
Database (PostgreSQL)
      │
      ├──8──→ INSERT INTO applications (...)
      │       status = 'APPLIED'
      │
      └──9──→ Return Application ID
                    │
                    ▼
            ┌─────────────────┐
            │ Application     │
            │ Created         │
            │ Visible to      │
            │ Admins          │
            └─────────────────┘
```

## Security Architecture

### Authentication & Authorization

```
┌──────────────────────────────────────────┐
│  SECURITY LAYERS                         │
├──────────────────────────────────────────┤
│                                          │
│  1. Frontend Layer                       │
│     • JWT stored in memory/localStorage  │
│     • Axios interceptors add token       │
│     • Route guards for protected pages   │
│                                          │
│  2. API Gateway                          │
│     • CORS configuration                 │
│     • Rate limiting                      │
│     • Request validation                 │
│                                          │
│  3. Backend Layer                        │
│     • JWT validation on each request     │
│     • Role-based access control (RBAC)   │
│     • Method-level security (@Secured)   │
│     • Input sanitization                 │
│     • File upload validation             │
│                                          │
│  4. Database Layer                       │
│     • Encrypted connections              │
│     • SQL injection prevention (JPA)     │
│     • Row-level security (future)        │
│                                          │
└──────────────────────────────────────────┘
```

### User Roles & Permissions

```
┌────────────┬──────────┬───────────┬─────────────┬───────────┐
│ Feature    │ Admin    │ Recruiter │ Interviewer │ Candidate │
├────────────┼──────────┼───────────┼─────────────┼───────────┤
│ Create Job │    ✓     │     ✓     │      ✗      │     ✗     │
│ Edit Job   │    ✓     │     ✓     │      ✗      │     ✗     │
│ Delete Job │    ✓     │     ✗     │      ✗      │     ✗     │
│ View Apps  │    ✓     │     ✓     │      ✓      │     ✗     │
│ Review App │    ✓     │     ✓     │      ✗      │     ✗     │
│ Schedule   │    ✓     │     ✓     │      ✗      │     ✗     │
│ Interview  │    ✓     │     ✓     │      ✓      │     ✗     │
│ Evaluate   │    ✓     │     ✓     │      ✓      │     ✗     │
│ User Mgmt  │    ✓     │     ✗     │      ✗      │     ✗     │
│ Apply Job  │    ✗     │     ✗     │      ✗      │     ✓     │
└────────────┴──────────┴───────────┴─────────────┴───────────┘
```

## Scalability Considerations

### Horizontal Scaling

```
┌─────────────────────────────────────────┐
│  Load Balancer                          │
└────┬──────────┬──────────┬──────────────┘
     │          │          │
     ▼          ▼          ▼
  ┌────┐    ┌────┐    ┌────┐
  │App1│    │App2│    │App3│  ← Backend instances
  └─┬──┘    └─┬──┘    └─┬──┘
    │         │         │
    └─────────┼─────────┘
              ▼
    ┌──────────────────┐
    │ Database Cluster │
    │ (Master/Replica) │
    └──────────────────┘
```

### Caching Strategy (Future)

```
Browser Cache
    ↓
CDN (Static Assets)
    ↓
Redis (Sessions, Jobs)
    ↓
Database (Source of Truth)
```

---

## Summary

### Key Architectural Decisions

1. **Dual Frontend Architecture**

   - Separation of concerns (admin vs public)
   - Independent deployment and scaling
   - Different user experiences optimized for each audience

2. **Shared Backend API**

   - Single source of truth
   - Consistent business logic
   - Easier maintenance

3. **Containerized Deployment**

   - Easy replication
   - Environment consistency
   - Simplified orchestration

4. **RESTful API Design**

   - Stateless communication
   - Standard HTTP methods
   - Clear resource hierarchy

5. **JWT Authentication**
   - Stateless auth
   - Scalable across instances
   - Secure token-based access

This architecture supports:

- ✅ Independent scaling of components
- ✅ Easy deployment and updates
- ✅ Clear separation of concerns
- ✅ Security at multiple layers
- ✅ Future enhancements (caching, microservices, etc.)
