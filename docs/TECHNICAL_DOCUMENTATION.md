# ATS System Technical Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Application Features](#application-features)
3. [Database Schema](#database-schema)
4. [Job Management System](#job-management-system)
5. [Application Processing System](#application-processing-system)
6. [Interview Management System](#interview-management-system)
7. [Email Notification System](#email-notification-system)
8. [Enhanced Admin UI](#enhanced-admin-ui)
9. [API Documentation](#api-documentation)
10. [Authentication & Security](#authentication--security)
11. [Password Management](#password-management)
12. [Deployment](#deployment)

## System Overview

The Applicant Tracking System (ATS) is a comprehensive solution designed to streamline the recruitment process. It provides tools for job posting, candidate management, interview scheduling, evaluation, and comprehensive application tracking with automated email notifications.

### Technology Stack
- **Backend**: Spring Boot 3.2.3
- **Frontend**: React with TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT with role-based access
- **API Documentation**: Swagger/OpenAPI
- **Containerization**: Docker
- **UI Framework**: Tailwind CSS with enhanced animations
- **Email System**: Thymeleaf templates with failure tracking

## Application Features

### 1. User Management
- User registration and authentication
- Role-based access control (Admin, Recruiter, Interviewer, Candidate)
- Comprehensive profile management with extended user attributes
- LinkedIn integration
- User preferences and settings
- Default admin account system
- User profile deactivation/reactivation
- Password reset and recovery
- Email verification

### 2. Job Management
- Create and manage job postings
- Custom job fields and questions
- Job status tracking (Draft, Published, Expired, Closed, Reopened)
- Work setting management (Remote, Onsite, Hybrid)
- Application deadline management
- Job analytics and reporting
- Department and skill-based categorization
- Salary range specification

### 3. Enhanced Application Processing
- **Comprehensive Application Submission System**:
  - Resume upload (PDF/DOC support)
  - Cover letter upload
  - Portfolio URL submission
  - Experience years specification
  - Current company/position details
  - Expected salary input
- Custom question responses

- **Advanced Application Status Management**:
  - 8-stage application workflow: APPLIED → REVIEWED → SHORTLISTED → INTERVIEWING → OFFERED → ACCEPTED/REJECTED/WITHDRAWN
  - Real-time status updates with email notifications
  - Application history tracking
  - Candidate dashboard view
  - Admin application management interface

- **Application Analytics**:
  - Comprehensive application statistics
  - Status breakdown reporting
  - Application trends analysis
  - Candidate source tracking

- **Auto-flagging System**:
  - Automatic `is_shortlisted` flag setting when status changes to SHORTLISTED
  - Enhanced filtering and search capabilities
  - Integration with interview assignment system

### 4. Advanced Interview Management System
- **Interview Assignment**:
  - Interview assignment to specific interviewers
  - Interview skeleton/template system
  - Automatic email notifications to both interviewer and candidate
  - Scheduled interview tracking
  - Re-assignment capabilities
  - De-assignment with confirmation

- **Interview Scheduling**:
  - Flexible scheduling with date/time selection
  - Multiple interview rounds support
  - Interview status tracking (ASSIGNED, IN_PROGRESS, COMPLETED)
  - Calendar integration support

- **Interview Evaluation**:
- Structured evaluation forms
  - Scoring system implementation
- Feedback collection
- Decision tracking
- Performance analytics

- **Interview Skeletons**:
  - Reusable interview templates
  - Focus area definitions
  - Standardized evaluation criteria
  - Template management system

### 5. Comprehensive Email Notification System
- **Automated Email Triggers**:
  - Application received confirmation
  - Application status updates (reviewed, shortlisted)
  - Interview assignment notifications
  - User account creation notifications
  - Password reset emails

- **Email Template Management**:
  - Thymeleaf-based HTML templates
  - Dynamic variable substitution
  - Professional email designs
  - Mobile-responsive templates

- **Email Failure Handling**:
  - Failed email tracking and storage
  - Automatic retry mechanisms
  - Manual resend capabilities
  - Email delivery status monitoring

- **Event-based Email System**:
  - Centralized email service architecture
  - Event-driven notifications
  - Template routing system
  - Recipient type management

### 6. Enhanced Admin Dashboard
- **Beautiful Modern UI**:
  - Glassmorphism design with backdrop blur effects
  - Gradient backgrounds and animations
  - Custom CSS animations and transitions
  - Mobile-responsive sidebar with hamburger menu

- **Enhanced Sidebar Navigation**:
  - Animated menu items with staggered loading
  - Gradient icon backgrounds
  - Active state indicators with glow effects
  - Hover animations and smooth transitions
  - Custom scrollbar styling

- **Real-time Status Indicators**:
  - Online status with pulsing animations
  - User profile integration
  - Status badges and notifications

- **Advanced Job Management Interface**:
  - Enhanced job details page with application management
  - Interview assignment column in applications table
  - Re-assign and de-assign functionality
  - Comprehensive application status tracking

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
    email_verification_token VARCHAR(255),
    email_verification_token_expiry TIMESTAMP,
    birth_date DATE,
    phone_number VARCHAR(20),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    bio TEXT,
    deactivation_reason TEXT,
    deactivation_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Password Reset Tokens Table
```sql
CREATE TABLE password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Jobs Table
```sql
CREATE TABLE jobs (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL,           -- JobStatus enum: DRAFT, PUBLISHED, EXPIRED, CLOSED, REOPENED
    work_setting VARCHAR(50) NOT NULL,     -- WorkSetting enum: REMOTE, ONSITE, HYBRID
    department VARCHAR(255),
    location VARCHAR(255),                 -- Added in V18 migration
    posted_date DATE,
    salary_range VARCHAR(255),
    employment_type VARCHAR(255),          -- Full-time, Part-time, Contract, etc.
    skills TEXT[],                         -- Array of required skills
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_jobs_title ON jobs(title);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_department ON jobs(department);
CREATE INDEX idx_jobs_work_setting ON jobs(work_setting);
CREATE INDEX idx_jobs_location ON jobs(location);
```

#### Job Status Enum Values:
- **DRAFT**: Job is being prepared and not visible to candidates
- **PUBLISHED**: Job is live and accepting applications
- **EXPIRED**: Job posting has passed its deadline
- **CLOSED**: Job is closed for applications
- **REOPENED**: Previously closed job that has been reopened

#### Work Setting Enum Values:
- **REMOTE**: Fully remote work
- **ONSITE**: Work from company office
- **HYBRID**: Combination of remote and onsite work

### Job Custom Questions Table
```sql
CREATE TABLE job_custom_questions (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT REFERENCES jobs(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL,    -- text, multiple_choice, boolean, etc.
    options TEXT[],                        -- For multiple choice questions
    is_required BOOLEAN DEFAULT true,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_job_custom_questions_job_id ON job_custom_questions(job_id);
```

#### Question Types:
- **text**: Free text input
- **multiple_choice**: Select from predefined options
- **boolean**: Yes/No questions
- **number**: Numeric input
- **date**: Date selection

### Enhanced Applications Table
```sql
CREATE TABLE applications (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'APPLIED',
    is_shortlisted BOOLEAN DEFAULT FALSE,           -- Auto-set when status = SHORTLISTED
    shortlisted_at TIMESTAMP WITH TIME ZONE,       -- Timestamp when shortlisted
    shortlisted_by BIGINT REFERENCES users(id),    -- Admin who shortlisted
    resume_url VARCHAR(255),
    cover_letter_url VARCHAR(255),
    portfolio_url VARCHAR(255),
    experience_years DECIMAL(4,1),
    current_company VARCHAR(255),
    current_position VARCHAR(255),
    expected_salary DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced indexes
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_is_shortlisted ON applications(is_shortlisted);
CREATE INDEX idx_applications_candidate_id ON applications(candidate_id);
```

#### Application Status Enum Values:
- **APPLIED**: Application has been submitted by candidate
- **REVIEWED**: Application has been viewed by a recruiter
- **SHORTLISTED**: Application has been shortlisted for interview
- **INTERVIEWING**: Candidate is currently in interview process
- **OFFERED**: Candidate has been offered the position
- **ACCEPTED**: Candidate has accepted the offer
- **REJECTED**: Application has been rejected
- **WITHDRAWN**: Candidate has withdrawn their application

### Application Answers Table
```sql
CREATE TABLE application_answers (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT REFERENCES applications(id),
    question_id BIGINT,                    -- References job_custom_questions.id
    answer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_application_answers_application_id ON application_answers(application_id);
```

### Interview Skeletons Table
```sql
CREATE TABLE interview_skeletons (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    focus_areas JSONB,                             -- Array of focus areas with titles and descriptions
    is_active BOOLEAN DEFAULT TRUE,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_interview_skeletons_is_active ON interview_skeletons(is_active);
```

### Enhanced Interviews Table
```sql
CREATE TABLE interviews (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT REFERENCES applications(id) ON DELETE CASCADE,
    interviewer_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    skeleton_id BIGINT REFERENCES interview_skeletons(id),
    status VARCHAR(50) DEFAULT 'ASSIGNED',          -- ASSIGNED, IN_PROGRESS, COMPLETED
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    responses JSONB,                                -- Interview responses array
    assigned_by BIGINT REFERENCES users(id),       -- Admin who assigned
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced indexes
CREATE INDEX idx_interviews_application_id ON interviews(application_id);
CREATE INDEX idx_interviews_interviewer_id ON interviews(interviewer_id);
CREATE INDEX idx_interviews_status ON interviews(status);
CREATE INDEX idx_interviews_assigned_by ON interviews(assigned_by);
CREATE INDEX idx_interviews_skeleton_id ON interviews(skeleton_id);
```

### Evaluations Table
```sql
CREATE TABLE evaluations (
    id BIGSERIAL PRIMARY KEY,
    interview_id BIGINT REFERENCES interviews(id),
    interviewer_id BIGINT REFERENCES users(id),
    technical_score INTEGER,
    presentation_score INTEGER,
    understanding_score INTEGER,
    total_score INTEGER,
    recommendation TEXT,
    strengths TEXT,
    improvements TEXT,
    examples TEXT,
    team_fit TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_evaluations_interview_id ON evaluations(interview_id);
```

### Experience Calculations Table
```sql
CREATE TABLE experience_calculations (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT REFERENCES applications(id),
    employment_history JSONB,
    full_time_years DECIMAL(4,1),
    part_time_years DECIMAL(4,1),
    total_years DECIMAL(4,1),
    calculation_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Email Templates Table
```sql
CREATE TABLE email_templates (
    id BIGSERIAL PRIMARY KEY,
    template_type VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    variables JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Communications Table
```sql
CREATE TABLE communications (
    id BIGSERIAL PRIMARY KEY,
    template_id BIGINT REFERENCES email_templates(id),
    sender_id BIGINT REFERENCES users(id),
    recipient_id BIGINT REFERENCES users(id),
    subject VARCHAR(255),
    body TEXT,
    status VARCHAR(50) DEFAULT 'SENT',
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_communications_status ON communications(status);
```

### Enhanced Email Notifications Table
```sql
CREATE TABLE email_notifications (
    id BIGSERIAL PRIMARY KEY,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    template_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, SENT, FAILED
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    last_retry_at TIMESTAMP,
    related_user_id BIGINT REFERENCES users(id),
    related_application_id BIGINT REFERENCES applications(id),
    related_interview_id BIGINT REFERENCES interviews(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced indexes
CREATE INDEX idx_email_notifications_status ON email_notifications(status);
CREATE INDEX idx_email_notifications_template ON email_notifications(template_name);
CREATE INDEX idx_email_notifications_recipient ON email_notifications(recipient_email);
```

## Job Management System

### Enhanced Job Creation and Management
The job management system provides comprehensive tools for creating, editing, and managing job postings with enhanced application tracking.

#### Features:
1. **Advanced Job Posting Creation**:
   - Rich text description with auto-formatting
   - Department and location specification
   - Employment type and work setting selection
   - Salary range definition
   - Skills requirements array
   - Custom application questions
   - Application deadline management

2. **Enhanced Job Status Management**:
   - Draft jobs for preparation
   - Published jobs visible to candidates
   - Expired jobs past their deadline
   - Closed jobs no longer accepting applications
   - Reopened jobs for extending application periods
   - Status change notifications

3. **Application Integration**:
   - Real-time application counts
   - Status breakdown analytics
   - Direct application management from job details
   - Interview assignment capabilities

## Enhanced Application Processing System

### Advanced Application Management
The application system handles the complete candidate application workflow with enhanced tracking and automation.

#### Enhanced Features:
1. **Comprehensive Application Submission**:
   - Multi-file upload support (resume, cover letter, portfolio)
   - Structured data collection (experience, salary expectations)
   - Custom question responses
   - Real-time validation and feedback

2. **Advanced Status Tracking**:
   - 8-stage application workflow
   - Automatic flag setting for shortlisted applications
   - Email notifications at each status change
   - Application history with timestamps

3. **Enhanced Admin Interface**:
   - Sortable application tables
   - Advanced filtering options
   - Bulk status updates
   - Interview assignment integration
   - Re-assignment capabilities

#### Application Status Flow:
1. **APPLIED** → Application submitted by candidate (auto-email sent)
2. **REVIEWED** → Application reviewed by recruiter (email notification)
3. **SHORTLISTED** → Application shortlisted (auto-flag set, email sent)
4. **INTERVIEWING** → Interview process initiated
5. **OFFERED** → Job offer extended
6. **ACCEPTED/REJECTED/WITHDRAWN** → Final status

### Application Analytics Dashboard
- Real-time application statistics
- Status distribution charts
- Application trends over time
- Candidate source analysis
- Performance metrics

## Interview Management System

### Comprehensive Interview Assignment System
The interview system provides end-to-end interview management with automated notifications and tracking.

#### Core Features:
1. **Interview Assignment**:
   - Assign interviews to specific interviewers
   - Select from available interview skeletons/templates
   - Set scheduled date/time or leave as TBD
   - Automatic email notifications to both parties
   - Assignment tracking and history

2. **Interview Skeletons/Templates**:
   - Reusable interview structures
   - Predefined focus areas
   - Standardized evaluation criteria
   - Template management and creation

3. **Interview Tracking**:
   - Real-time status updates (ASSIGNED, IN_PROGRESS, COMPLETED)
   - Response collection and storage
   - Completion tracking with timestamps
   - Performance analytics

4. **Interview Management Interface**:
   - Enhanced admin job details page with interview column
   - Interview assignment page with shortlisted applications
   - Re-assignment and de-assignment capabilities
   - Confirmation dialogs for critical actions

#### Interview Assignment Workflow:
1. **Application Shortlisted** → Available for interview assignment
2. **Interview Assigned** → Emails sent to interviewer and candidate
3. **Interview Started** → Status updated to IN_PROGRESS
4. **Interview Completed** → Responses collected, status updated
5. **Evaluation** → Feedback and scoring system

### Interview Assignment Page Features:
- Display all shortlisted applications across jobs
- Show current interview assignments
- Assign/re-assign/de-assign interviews
- Real-time status updates
- Automatic data refresh

### Candidate Interview Dashboard:
- Upcoming interviews section
- Interview status tracking
- Interview details (date, interviewer, job)
- Interview preparation resources

## Enhanced Email Notification System

### Event-Driven Email Architecture
The email system uses an event-driven architecture for reliable and scalable email delivery.

#### Email Events:
1. **APPLICATION_RECEIVED** → Confirmation email to candidate
2. **APPLICATION_REVIEWED** → Status update email
3. **APPLICATION_SHORTLISTED** → Congratulations email
4. **INTERVIEW_ASSIGNED_TO_INTERVIEWER** → Assignment notification
5. **INTERVIEW_ASSIGNED_TO_CANDIDATE** → Interview notification

#### Email Templates:
1. **application-received.html** - Professional confirmation template
2. **application-reviewed.html** - Status update notification
3. **application-shortlisted.html** - Congratulations message
4. **interview-assigned-interviewer.html** - Assignment details for interviewer
5. **interview-assigned-candidate.html** - Interview notification for candidate

#### Email Features:
- **Thymeleaf Templates**: Professional HTML email design
- **Variable Substitution**: Dynamic content insertion
- **Mobile Responsive**: Optimized for all devices
- **Error Handling**: Failed email tracking and retry
- **Status Tracking**: PENDING, SENT, FAILED statuses

### Email Failure Handling:
- Failed emails stored in database with error messages
- Manual resend capabilities for administrators
- Automatic retry mechanisms
- Email delivery analytics and reporting

## Enhanced Admin UI

### Modern Glassmorphism Design
The admin interface features a modern, beautiful design with advanced CSS animations and effects.

#### UI Features:
1. **Enhanced Sidebar**:
   - Glassmorphism effect with backdrop blur
   - Gradient backgrounds and icon animations
   - Staggered menu item animations
   - Custom scrollbar styling
   - Mobile-responsive with hamburger menu

2. **Beautiful Navigation**:
   - Floating animations for icons
   - Gradient text effects
   - Shimmer effects on headers
   - Pulse animations for status indicators
   - Smooth hover transitions

3. **Advanced Animations**:
   - Slide-in animations for sidebar
   - Fade-up animations for menu items
   - Pulse glow effects for active items
   - Status indicator animations
   - Custom CSS keyframe animations

4. **Responsive Design**:
   - Mobile-first approach
   - Touch-friendly interface
   - Adaptive layouts
   - Progressive enhancement

### CSS Animation Features:
- Custom keyframe animations
- Glassmorphism effects
- Gradient backgrounds
- Backdrop blur filters
- Status pulse animations
- Floating icon effects
- Shimmer text effects

## API Documentation

### Enhanced Interview Management APIs

#### Interview Assignment APIs:
1. **Assign Interview**: `POST /api/interviews/assign`
   ```json
   {
     "applicationId": 123,
     "interviewerId": 456,
     "skeletonId": 789,
     "scheduledAt": "2024-01-15T10:00:00Z"
   }
   ```

2. **Get Shortlisted Applications**: `GET /api/interviews/applications/shortlisted`
   - Returns: All shortlisted applications across jobs

3. **Get Interviews by Interviewer**: `GET /api/interviews/interviewer/{interviewerId}`
   - Returns: Interviews assigned to specific interviewer

4. **Get Candidate Interviews**: `GET /api/interviews/my-candidate-interviews`
   - Returns: Interviews for authenticated candidate

5. **Cancel Interview**: `DELETE /api/interviews/{interviewId}`
   - Returns: Success status

#### Interview Skeleton APIs:
1. **Get All Skeletons**: `GET /api/interview-skeletons`
2. **Create Skeleton**: `POST /api/interview-skeletons`
3. **Update Skeleton**: `PUT /api/interview-skeletons/{id}`
4. **Delete Skeleton**: `DELETE /api/interview-skeletons/{id}`

### Enhanced Application APIs:

#### Application Status Management:
1. **Update Application Status**: `PATCH /api/applications/{id}/status`
```json
{
     "status": "SHORTLISTED"
   }
   ```
   - Automatically sets `is_shortlisted` flag for SHORTLISTED status
   - Sends appropriate email notifications

2. **Get Shortlisted Applications**: `GET /api/applications/shortlisted`
   - Query Parameters: `jobId` (optional)
   - Returns: Applications with `is_shortlisted=true`

#### Application Analytics:
1. **Get Application Statistics**: `GET /api/applications/job/{jobId}/stats`
   - Returns: Comprehensive status breakdown

2. **Get Application Trends**: `GET /api/applications/trends`
   - Returns: Time-series application data

### Email Notification APIs:

1. **Get All Email Notifications**: `GET /api/admin/emails`
   - Query Parameters: `status`, `template`, `recipient`
   - Returns: Paginated email notifications

2. **Resend Failed Email**: `POST /api/admin/emails/{id}/resend`
   - Returns: Updated email notification

3. **Get Email Statistics**: `GET /api/admin/emails/stats`
   - Returns: Email delivery statistics

### User Management APIs:

1. **Get Available Interviewers**: `GET /api/interviews/interviewers`
   - Returns: Users with INTERVIEWER role

2. **Get User by Role**: `GET /api/users/role/{role}`
   - Returns: Users with specified role

## Authentication & Security

### Enhanced Security Features
- JWT-based authentication with role-based access
- Protected routes for admin, interviewer, and candidate areas
- File upload security with type validation
- CSRF protection and XSS prevention
- Rate limiting for API endpoints
- Email verification for account security

### Role-Based Access Control:
- **ADMIN**: Full system access, user management, job management
- **INTERVIEWER**: Interview management, evaluation access
- **CANDIDATE**: Application submission, interview tracking
- **RECRUITER**: Application review, candidate management

## Password Management

### Password Security Features
- BCrypt password hashing
- Configurable password complexity requirements
- Password reset with time-limited tokens
- Secure token generation and validation
- Password change tracking
- Account lockout protection

## Deployment

### Docker Configuration
The system is fully containerized with Docker Compose for easy deployment:

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=docker
      - SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/ats_database
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "3001:3001"
    depends_on:
      - backend

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=ats_database
      - POSTGRES_USER=ats_user
      - POSTGRES_PASSWORD=ats_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

### Environment Configuration:
- Development, staging, and production profiles
- Environment-specific database configurations
- Email service configuration
- File upload directory management
- JWT secret configuration

### Health Checks:
- Database connectivity monitoring
- Application health endpoints
- Container health verification
- Service dependency checking

---

*This documentation is maintained to reflect the latest system capabilities and should be updated with each major feature release.* 