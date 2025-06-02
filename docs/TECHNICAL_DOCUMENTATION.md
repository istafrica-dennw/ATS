# ATS System Technical Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Application Features](#application-features)
3. [Database Schema](#database-schema)
4. [Job Management System](#job-management-system)
5. [Application Processing System](#application-processing-system)
6. [API Documentation](#api-documentation)
7. [Email Notification System](#email-notification-system)
8. [Authentication & Security](#authentication--security)
9. [Password Management](#password-management)
10. [Deployment](#deployment)

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

### 3. Application Processing
- Comprehensive application submission system
- Resume, cover letter, and portfolio uploads
- Custom question responses
- Application status tracking through multiple stages
- Experience calculation and validation
- Expected salary tracking
- Application analytics and statistics

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

### Applications Table
```sql
CREATE TABLE applications (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'APPLIED',  -- ApplicationStatus enum
    resume_url VARCHAR(255),
    cover_letter_url VARCHAR(255),
    portfolio_url VARCHAR(255),
    experience_years DECIMAL(4,1),         -- e.g., 5.5 years
    current_company VARCHAR(255),
    current_position VARCHAR(255),
    expected_salary DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_status ON applications(status);
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

### Interviews Table
```sql
CREATE TABLE interviews (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT REFERENCES applications(id),
    interview_type VARCHAR(50) NOT NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    meeting_link VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_interviews_status ON interviews(status);
```

### Interview Participants Table
```sql
CREATE TABLE interview_participants (
    id BIGSERIAL PRIMARY KEY,
    interview_id BIGINT REFERENCES interviews(id),
    user_id BIGINT REFERENCES users(id),
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
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

## Job Management System

### Job Creation and Management
The job management system provides comprehensive tools for creating, editing, and managing job postings.

#### Features:
1. **Job Posting Creation**:
   - Rich text description with auto-formatting
   - Department and location specification
   - Employment type and work setting selection
   - Salary range definition
   - Skills requirements array
   - Custom application questions

2. **Job Status Management**:
   - Draft jobs for preparation
   - Published jobs visible to candidates
   - Expired jobs past their deadline
   - Closed jobs no longer accepting applications
   - Reopened jobs for extending application periods

3. **Custom Questions**:
   - Text input questions
   - Multiple choice questions
   - Boolean (Yes/No) questions
   - Required/optional question flags
   - Question visibility controls

#### API Endpoints:
- `GET /api/jobs` - Get all jobs with filtering
- `POST /api/jobs` - Create new job
- `GET /api/jobs/{id}` - Get job by ID
- `PUT /api/jobs/{id}` - Update job
- `PATCH /api/jobs/{id}/status` - Update job status
- `DELETE /api/jobs/{id}` - Delete job
- `GET /api/jobs/{id}/custom-questions` - Get job custom questions
- `POST /api/jobs/{id}/custom-questions` - Add custom question

#### Frontend Components:
- `JobManagementPage.tsx` - Main job management interface
- `AdminJobDetailsPage.tsx` - Detailed job view with applications
- `JobDetailsPage.tsx` - Public job viewing for candidates

## Application Processing System

### Application Submission
The application system handles the complete candidate application workflow.

#### Features:
1. **Application Submission**:
   - Resume upload (PDF/DOC support)
   - Cover letter upload
   - Portfolio URL submission
   - Experience years specification
   - Current company/position details
   - Expected salary input
   - Custom question responses

2. **Application Status Tracking**:
   - Real-time status updates
   - Email notifications for status changes
   - Application history tracking
   - Candidate dashboard view

3. **File Management**:
   - Secure file uploads to `/uploads/` directory
   - File URL generation for database storage
   - Support for multiple file types
   - File access control and security

#### Application Flow:
1. **Candidate applies** → Status: `APPLIED`
2. **Recruiter reviews** → Status: `REVIEWED`
3. **Application shortlisted** → Status: `SHORTLISTED`
4. **Interview scheduled** → Status: `INTERVIEWING`
5. **Offer extended** → Status: `OFFERED`
6. **Candidate accepts** → Status: `ACCEPTED`
7. **Alternative outcomes** → Status: `REJECTED` or `WITHDRAWN`

#### API Endpoints:
- `POST /api/applications` - Submit new application
- `GET /api/applications/{id}` - Get application by ID
- `GET /api/applications/job/{jobId}` - Get applications for job
- `GET /api/applications/candidate/{candidateId}` - Get candidate's applications
- `PATCH /api/applications/{id}` - Update application status
- `GET /api/applications/{id}/answers` - Get application answers
- `POST /api/files/upload/resume` - Upload resume file
- `POST /api/files/upload/cover-letter` - Upload cover letter

#### Frontend Components:
- `JobApplicationForm.tsx` - Application submission form
- `JobApplicationPage.tsx` - Main application page
- `CandidateDashboardPage.tsx` - Candidate application tracking
- `AdminJobDetailsPage.tsx` - Admin application management

### Application Statistics
The system provides comprehensive statistics for applications:

#### Statistics Available:
- Total applications per job
- Applications by status breakdown
- Application trends over time
- Candidate source tracking
- Response rate analytics

#### Implementation:
```java
// ApplicationRepository query for statistics
@Query("SELECT a.status as status, COUNT(a) as count FROM Application a WHERE a.job.id = :jobId GROUP BY a.status")
List<Object[]> getApplicationStatsByJobId(@Param("jobId") Long jobId);
```

### Experience Calculation
Advanced experience calculation system for accurate candidate assessment:

#### Features:
- Employment history parsing
- Full-time vs part-time calculation
- Total experience computation
- Industry-specific experience tracking
- Experience verification workflow

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
2. Signup: `POST /api/auth/signup`
3. Logout: `POST /api/auth/logout`
4. Get Current User: `GET /api/auth/me`
5. Update Current User: `PUT /api/auth/me`
6. Verify Email: `GET /api/auth/verify-email?token={token}`
7. Forgot Password: `POST /api/auth/forgot-password`
8. Reset Password: `POST /api/auth/reset-password`
9. Change Password: `POST /api/auth/change-password`
10. Deactivate Account: `POST /api/auth/deactivate`
11. LinkedIn Login: `GET /oauth2/authorization/linkedin`

### Job Management APIs
1. **Get All Jobs**: `GET /api/jobs`
   - Query Parameters: `jobStatuses`, `workSetting`, `description`
   - Returns: List of jobs with filtering options

2. **Create Job**: `POST /api/jobs`
   - Body: JobDTO with title, description, department, etc.
   - Returns: Created job with ID

3. **Get Job by ID**: `GET /api/jobs/{id}`
   - Returns: Complete job details including custom questions

4. **Update Job**: `PUT /api/jobs/{id}`
   - Body: Updated JobDTO
   - Returns: Updated job

5. **Update Job Status**: `PATCH /api/jobs/{id}/status`
   - Body: `{ "status": "PUBLISHED" }`
   - Returns: Updated job with new status

6. **Delete Job**: `DELETE /api/jobs/{id}`
   - Returns: Success/failure status

7. **Get Active Jobs**: `GET /api/jobs/active`
   - Returns: Jobs with status PUBLISHED or REOPENED

8. **Search Jobs**: `GET /api/jobs/search?keyword={keyword}&filter={filter}`
   - Returns: Jobs matching search criteria

### Job Custom Questions APIs
1. **Get Job Questions**: `GET /api/jobs/{jobId}/custom-questions`
   - Returns: List of custom questions for the job

2. **Add Custom Question**: `POST /api/jobs/{jobId}/custom-questions`
   - Body: JobCustomQuestionDTO
   - Returns: Created question

3. **Update Question**: `PUT /api/jobs/custom-questions/{questionId}`
   - Body: Updated question data
   - Returns: Updated question

4. **Delete Question**: `DELETE /api/jobs/custom-questions/{questionId}`
   - Returns: Success/failure status

### Application Management APIs
1. **Submit Application**: `POST /api/applications`
   - Body: ApplicationDTO with job details and answers
   - Returns: Created application with ID

2. **Get Application by ID**: `GET /api/applications/{id}`
   - Returns: Complete application details including answers

3. **Get Applications by Job**: `GET /api/applications/job/{jobId}`
   - Query Parameters: `page`, `size`, `status`
   - Returns: Paginated list of applications for the job

4. **Get Applications by Candidate**: `GET /api/applications/candidate/{candidateId}`
   - Query Parameters: `page`, `size`
   - Returns: Paginated list of candidate's applications

5. **Update Application Status**: `PATCH /api/applications/{id}`
   - Body: `{ "status": "REVIEWED" }`
   - Returns: Updated application

6. **Update Application**: `PUT /api/applications/{id}`
   - Body: Updated ApplicationDTO
   - Returns: Updated application

7. **Delete Application**: `DELETE /api/applications/{id}`
   - Returns: Success/failure status

8. **Get Application Statistics**: `GET /api/applications/job/{jobId}/stats`
   - Returns: Status breakdown and counts

9. **Check if Applied**: `GET /api/applications/job/{jobId}/candidate/{candidateId}/exists`
   - Returns: Boolean indicating if candidate has applied

### File Upload APIs
1. **Upload Resume**: `POST /api/files/upload/resume`
   - Body: Multipart file
   - Returns: File URL

2. **Upload Cover Letter**: `POST /api/files/upload/cover-letter`
   - Body: Multipart file
   - Returns: File URL

3. **Upload Portfolio**: `POST /api/files/upload/portfolio`
   - Body: Multipart file
   - Returns: File URL

4. **Upload Profile Picture**: `POST /api/files/upload/profile-picture`
   - Body: Multipart file
   - Returns: File URL

5. **Get File**: `GET /api/files/{category}/{filename}`
   - Returns: File content with appropriate headers

### Interview Management APIs
1. **Schedule Interview**: `POST /api/interviews`
   - Body: Interview details with application ID
   - Returns: Created interview

2. **Get Interview by ID**: `GET /api/interviews/{id}`
   - Returns: Interview details with participants

3. **Update Interview**: `PUT /api/interviews/{id}`
   - Body: Updated interview data
   - Returns: Updated interview

4. **Add Interview Participant**: `POST /api/interviews/{id}/participants`
   - Body: Participant details
   - Returns: Success status

5. **Get Interviews by Application**: `GET /api/interviews/application/{applicationId}`
   - Returns: List of interviews for the application

### Evaluation APIs
1. **Submit Evaluation**: `POST /api/evaluations`
   - Body: Evaluation details with scores and feedback
   - Returns: Created evaluation

2. **Get Evaluation by Interview**: `GET /api/evaluations/interview/{interviewId}`
   - Returns: List of evaluations for the interview

3. **Update Evaluation**: `PUT /api/evaluations/{id}`
   - Body: Updated evaluation data
   - Returns: Updated evaluation

### API Response Format
All APIs follow a consistent response format:

#### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Job not found with ID: 123",
    "details": { ... }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Pagination Response
```json
{
  "content": [ ... ],
  "pageable": {
    "page": 0,
    "size": 20,
    "sort": "id,desc"
  },
  "totalElements": 150,
  "totalPages": 8,
  "first": true,
  "last": false
}
```

### Status Codes
- `200 OK` - Successful operation
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate application)
- `422 Unprocessable Entity` - Validation errors
- `500 Internal Server Error` - Server error

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
   - Expires after 24 hours
   - Single-use token (invalidated after use)

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

## Authentication & Security

### Authentication
- JWT-based authentication
- Role-based authorization
- Password hashing using BCrypt
- LinkedIn OAuth integration
- Email verification system
- Session-based security context

### Token Management
- JWT tokens with customizable expiration
- Token validation on protected endpoints
- Token invalidation on logout
- Refresh token mechanism

### Security Features
- CSRF protection
- XSS prevention
- SQL injection prevention
- Rate limiting
- Session management
- Aspect-oriented security annotations
- Custom authentication exception handling

### Default Admin Account System

The ATS system implements a default admin account mechanism for system initialization and recovery:

1. **Default Admin Creation**:
   - A system administrator account (admin@ats.istafrica) is automatically created on first application startup if no admin exists
   - Credentials are configurable via application properties
   - This account has full administrative privileges

2. **Dynamic Account Management**:
   - When other admin accounts are created, the default admin is automatically disabled
   - If all other admin accounts are removed, the default admin can be reactivated
   - This prevents system lockout scenarios while maintaining security

3. **Configuration Properties**:
   - Default admin email: `app.admin.email=admin@ats.istafrica`
   - Default admin password: `app.admin.password=admin@atsafrica`
   - These can be overridden in the application.properties file

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

## Password Management

The ATS system implements comprehensive password management features that prioritize security and user convenience:

### 1. Password Change Feature
   - **Authenticated Users**:
     - Change password while logged in
     - Requires current password verification
     - Password complexity enforcement
     - Supports both email/password and social login users
   - **API Endpoint**: `POST /api/auth/change-password`
   - **Implementation**:
     - Controller method with @RequiresAuthentication annotation
     - Password complexity validation (8+ chars, mixed case, numbers, special chars)
     - Secure verification of current password
     - Password encryption using BCrypt
     - Failure handling with descriptive error messages
   - **UI Components**:
     - Modal interface accessible from profile settings
     - Form validation with password strength indicator
     - Success/failure feedback with toast notifications

### 2. Forgot Password Feature
   - **Password Reset Request**:
     - Public endpoint (no authentication required)
     - Email-based recovery flow
     - Security measures to prevent email enumeration
     - Support for both email/password users and social login users
     - API Endpoint: `POST /api/auth/forgot-password`
   - **Password Reset Confirmation**:
     - Token-based verification
     - 24-hour expiration window
     - Single-use tokens (invalidated after use)
     - Password complexity enforcement
     - API Endpoint: `POST /api/auth/reset-password`
   - **Token Management**:
     - Secure token generation using UUID
     - Database tracking of token status
     - Automatic token expiration
     - Token usage tracking to prevent reuse
   - **Email Notifications**:
     - HTML email template with branded styling
     - Direct password reset link with embedded token
     - Clear instructions for user
     - Fallback text link for email clients that block buttons
   - **Implementation**:
     - PasswordResetToken entity for secure token tracking
     - TokenUtil helper class for token generation
     - PasswordResetService for business logic
     - Repository for data access
     - Email integration with templates
   - **UI Components**:
     - "Forgot Password" link on login page
     - Email input modal with validation
     - Reset password page with token validation
     - Password strength requirements display
     - Validation feedback for all user actions

### 3. Password Security Features
   - **Password Complexity Requirements**:
     - Minimum 8 characters
     - At least one uppercase letter
     - At least one lowercase letter
     - At least one number
     - At least one special character
   - **Storage Security**:
     - One-way hashing using BCrypt
     - No plaintext or recoverable storage
     - Secure comparison for validation
   - **Rate Limiting**:
     - Protection against brute force attacks
     - Temporary lockouts after failed attempts
   - **Behavioral Analysis**:
     - Logging of password change attempts
     - Unusual activity detection
   - **Audit Trail**:
     - All password-related actions are logged
     - Administrator visibility into password change/reset events

### 4. Social Login Integration
   - **LinkedIn Authentication**:
     - OAuth 2.0 integration
     - Profile data synchronization
     - Automatic account creation
   - **Hybrid Authentication**:
     - Users can use both social login and password authentication
     - Password can be set for LinkedIn users via forgot password flow
     - Seamless account linking

## User Profile Features

The ATS system provides comprehensive user profile management capabilities:

1. **Extended User Attributes**:
   - Standard fields: First name, last name, email
   - Extended fields: Birthdate, address, phone number, biography, profile picture
   - Contact preferences and notification settings

2. **Profile Management Interface**:
   - User profile dropdown in header navigation
   - Dedicated profile settings page
   - Form-based profile editing with validation
   - Profile picture upload and preview

3. **Account Management**:
   - Account deactivation with confirmation
   - Password change functionality
   - Email verification status
   - Authentication method preferences

4. **Components**:
   - UserProfileDropdown - Header navigation component
   - ProfilePage - Public profile view
   - ProfileSettingsPage - Private settings interface
   - Custom form components with validation

5. **Routing**:
   - `/profile` - User's own profile view
   - `/profile/settings` - Profile settings page
   - `/profile/:id` - View specific user profile (with proper authorization)

## Layout Structure

The application implements a consistent user experience through structured layouts:

1. **Main Layout**:
   - Top navigation bar with user profile dropdown
   - Sidebar navigation (context-sensitive based on user role)
   - Content area with responsive design
   - Consistent header and footer

2. **Admin Layout**:
   - Extends main layout
   - Admin-specific navigation items
   - Quick action buttons
   - Advanced filter options

3. **Authentication Layouts**:
   - Clean, minimal design for login, signup, and password reset
   - Responsive for mobile and desktop use
   - Clear validation messaging
   - Social login options

4. **Component Organization**:
   - Reusable UI components in `/components` directory
   - Layouts in `/layouts` directory
   - Page components in `/pages` directory

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