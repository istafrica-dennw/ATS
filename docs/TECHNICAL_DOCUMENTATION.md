# ATS System Technical Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Application Features](#application-features)
3. [Database Schema](#database-schema)
4. [API Documentation](#api-documentation)
5. [Email Notification System](#email-notification-system)
6. [Security](#security)
7. [Deployment](#deployment)

## System Overview

The Applicant Tracking System (ATS) is a comprehensive solution designed to streamline the recruitment process. It provides tools for job posting, candidate management, interview scheduling, and evaluation.

### Technology Stack
- **Backend**: Spring Boot 3.2.3
- **Frontend**: React
- **Database**: PostgreSQL
- **Authentication**: JWT
- **API Documentation**: Swagger/OpenAPI
- **Containerization**: Docker

## Application Features

### 1. User Management
- User registration and authentication
- Role-based access control (Admin, Recruiter, Interviewer, Candidate)
- Profile management
- LinkedIn integration
- User preferences and settings

### 2. Job Management
- Create and manage job postings
- Custom job fields
- Job status tracking
- Application deadline management
- Job analytics and reporting

### 3. Candidate Management
- Application tracking
- Resume parsing
- Candidate profiles
- Application status tracking
- Communication history

### 4. Interview Management
- Interview scheduling
- Multiple interview rounds
- Interview feedback collection
- Interviewer assignment
- Calendar integration

### 5. Evaluation System
- Structured evaluation forms
- Scoring system
- Feedback collection
- Decision tracking
- Performance analytics

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    department VARCHAR(100),
    linkedin_id VARCHAR(255) UNIQUE,
    linkedin_profile_url VARCHAR(255),
    profile_picture_url VARCHAR(255),
    is_email_password_enabled BOOLEAN,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    is_email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Jobs Table
```sql
CREATE TABLE jobs (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    department VARCHAR(100),
    location VARCHAR(255),
    employment_type VARCHAR(50),
    experience_level VARCHAR(50),
    education_required VARCHAR(100),
    skills_required TEXT[],
    salary_range VARCHAR(100),
    application_deadline TIMESTAMP,
    status VARCHAR(50) DEFAULT 'DRAFT',
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Applications Table
```sql
CREATE TABLE applications (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT REFERENCES jobs(id),
    candidate_id BIGINT REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'SUBMITTED',
    resume_url VARCHAR(255),
    cover_letter TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Interviews Table
```sql
CREATE TABLE interviews (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT REFERENCES applications(id),
    round_number INTEGER NOT NULL,
    scheduled_date TIMESTAMP NOT NULL,
    duration_minutes INTEGER,
    interview_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Interview Participants Table
```sql
CREATE TABLE interview_participants (
    id BIGSERIAL PRIMARY KEY,
    interview_id BIGINT REFERENCES interviews(id),
    user_id BIGINT REFERENCES users(id),
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Evaluations Table
```sql
CREATE TABLE evaluations (
    id BIGSERIAL PRIMARY KEY,
    interview_id BIGINT REFERENCES interviews(id),
    evaluator_id BIGINT REFERENCES users(id),
    technical_score INTEGER,
    communication_score INTEGER,
    problem_solving_score INTEGER,
    cultural_fit_score INTEGER,
    overall_score INTEGER,
    feedback TEXT,
    recommendation VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Email Notifications Table
```sql
CREATE TABLE email_notifications (
    id BIGSERIAL PRIMARY KEY,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    template_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    last_retry_at TIMESTAMP,
    related_user_id BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Documentation

The API documentation is available at:
- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI documentation: http://localhost:8080/api-docs

### User Management APIs
1. Create User: `POST /api/users`
2. Update User: `PUT /api/users/{id}`
3. Get User by ID: `GET /api/users/{id}`
4. Get User by Email: `GET /api/users/email/{email}`
5. Get All Users: `GET /api/users`
6. Delete User: `DELETE /api/users/{id}`
7. Update User Status: `PATCH /api/users/{id}/status`
8. Update User Role: `PATCH /api/users/{id}/role`

### Authentication APIs
1. Login: `POST /api/auth/login`
2. LinkedIn Login: `GET /oauth2/authorization/linkedin`
3. Get Current User: `GET /api/auth/me`

## Email Notification System

The ATS System includes a comprehensive email notification system that ensures reliable delivery of important system notifications to users.

### Features
1. **Email Templates**
   - User registration verification emails
   - Admin-created user account notifications
   - Password reset requests
   - Interview scheduling notifications
   - Application status updates

2. **Failure Handling**
   - Failed emails are stored in the database
   - Automatic retry mechanism
   - Manual resend functionality for administrators
   - Email status tracking (PENDING, SENT, FAILED)

3. **Admin Dashboard**
   - View all sent and failed emails
   - Filter emails by status, recipient, and type
   - Resend individual failed emails
   - Batch resend all failed emails
   - View email delivery statistics

### Email Templates
1. **User Registration Verification**
   - Sent when a user self-registers
   - Contains verification link with token
   - Expires after 24 hours

2. **Admin-Created Account Notification**
   - Sent when an admin creates a new user account
   - Contains verification link and temporary password
   - Prompts user to update password on first login

3. **Password Reset**
   - Sent when a user requests a password reset
   - Contains reset link with token
   - Expires after 1 hour

### API Endpoints
1. `GET /api/admin/emails` - Get all email notifications (with filtering)
2. `GET /api/admin/emails/{id}` - Get specific email notification
3. `POST /api/admin/emails/{id}/resend` - Resend a specific email
4. `POST /api/admin/emails/resend-all-failed` - Resend all failed emails

### Email Flow
1. Email notification is created and saved to database with PENDING status
2. System attempts to send the email
3. If successful, status is updated to SENT
4. If failed, status is updated to FAILED with error message
5. Failed emails can be manually resent by administrators

## Security

### Authentication
- JWT-based authentication
- Role-based authorization
- Password hashing using BCrypt
- LinkedIn OAuth integration

### Security Features
- CSRF protection
- XSS prevention
- SQL injection prevention
- Rate limiting
- Session management

### Role-Based Access Control

The ATS system implements role-based access control with automated redirection:

1. **Admin**: 
   - Access to administration features
   - User management
   - System settings
   - Redirected to Admin Dashboard on login

2. **Recruiter/Hiring Manager**: 
   - Access to recruitment functions
   - Job management
   - Candidate evaluation
   - Redirected to Recruiter Dashboard on login

3. **Candidate**: 
   - Access to application tracking
   - Profile management
   - Redirected to Candidate Dashboard on login

## Deployment

### Docker Configuration
The application is containerized using Docker Compose with three main services:
1. Frontend (React)
2. Backend (Spring Boot)
3. Database (PostgreSQL)

### Environment Variables
Required environment variables:
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `SPRING_DATASOURCE_URL`
- `JWT_SECRET`
- `SPRING_SECURITY_USER_NAME`
- `REACT_APP_API_URL`
- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`

### Health Checks
- Database connection health check
- Application health check
- API endpoint health check

## Development Guidelines

### Code Style
- Follow Spring Boot best practices
- Use Lombok for boilerplate code reduction
- Implement proper exception handling
- Write comprehensive unit tests
- Follow REST API design principles

### Database Migrations
- Use Flyway for database migrations
- Version control all database changes
- Include rollback scripts
- Test migrations in development environment

### API Versioning
- Use URL versioning (e.g., /api/v1/users)
- Maintain backward compatibility
- Document breaking changes
- Provide migration guides

## Support and Maintenance

### Monitoring
- Application logs
- Database performance metrics
- API response times
- Error tracking

### Backup and Recovery
- Regular database backups
- Point-in-time recovery
- Disaster recovery plan
- Data retention policy

### Updates and Patches
- Regular security updates
- Feature releases
- Bug fixes
- Performance improvements 