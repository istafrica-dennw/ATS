# ATS System Technical Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Application Features](#application-features)
3. [AI Resume Analysis System](#ai-resume-analysis-system)
4. [Real-time Chat Support System](#real-time-chat-support-system)
5. [File Upload and Storage System](#file-upload-and-storage-system)
6. [Database Schema](#database-schema)
7. [Job Management System](#job-management-system)
8. [Application Processing System](#application-processing-system)
9. [Interview Management System](#interview-management-system)
10. [Email Notification System](#email-notification-system)
11. [Enhanced Admin UI](#enhanced-admin-ui)
12. [Analytics and Dashboard](#analytics-and-dashboard)
13. [API Documentation](#api-documentation)
14. [Authentication & Security](#authentication--security)
15. [Password Management](#password-management)
16. [Deployment](#deployment)

## System Overview

The Applicant Tracking System (ATS) is a comprehensive solution designed to streamline the recruitment process. It provides tools for job posting, candidate management, interview scheduling, evaluation, comprehensive application tracking with automated email notifications, AI-powered resume analysis, and real-time chat support.

### Technology Stack
- **Backend**: Spring Boot 3.2.3
- **Frontend**: React with TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT with role-based access and LinkedIn OAuth
- **API Documentation**: Swagger/OpenAPI
- **Containerization**: Docker
- **UI Framework**: Tailwind CSS with enhanced animations
- **Email System**: Thymeleaf templates with failure tracking
- **AI Integration**: Generic AI service supporting Ollama, OpenAI, Gemini, Claude
- **Real-time Communication**: Socket.IO for WebSocket connections
- **File Storage**: Multi-format file upload and management system

## Application Features

### 1. User Management
- User registration and authentication
- Role-based access control (Admin, Recruiter, Interviewer, Candidate)
- Comprehensive profile management with extended user attributes
- **LinkedIn OAuth Integration**: Social login with profile synchronization
- **Profile Picture Management**: Upload, display, and fallback to initials
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

## AI Resume Analysis System

### Overview
The ATS includes a comprehensive AI-powered resume analysis system that automatically extracts structured data from uploaded resumes and provides job-specific scoring and insights.

### Core Features

#### 1. Multi-Provider AI Support
- **Generic AI Service Architecture**: Supports multiple AI providers
- **Supported Providers**:
  - **Ollama** (Local/Remote): Free, privacy-focused LLM hosting
  - **OpenAI GPT-4**: Premium accuracy with cost per analysis
  - **Google Gemini**: Free tier with rate limits
  - **Claude (Anthropic)**: Advanced reasoning capabilities
  - **Custom REST APIs**: Extensible to any AI service

#### 2. Resume Processing Capabilities
- **File Format Support**: PDF, DOC, DOCX, TXT
- **Text Extraction**: Apache Tika for robust document parsing
- **Language Processing**: Both AI and traditional NLP fallback
- **Async Processing**: Non-blocking analysis with progress tracking

#### 3. Data Extraction Features
- **Experience Calculation**: Total years of work experience (excluding overlaps)
- **Company History**: Number of companies worked for
- **Current Employment**: Current company and position
- **Skills Extraction**: Technical and soft skills identification
- **Education Details**: Degrees, institutions, graduation years
- **Previous Positions**: Detailed work history with durations

#### 4. Job-Specific Scoring
- **Overall Match Score**: 0-100 compatibility rating
- **Skills Match**: Percentage of required skills found
- **Experience Score**: Years of experience vs. job requirements
- **Industry Relevance**: Domain-specific experience weighting
- **Education Match**: Degree requirements alignment

#### 5. Analysis Metadata
- **Processing Time**: Performance metrics
- **AI Model Used**: Provider and model information
- **Confidence Score**: Analysis reliability indicator
- **Error Handling**: Graceful fallback to traditional NLP

### Implementation Architecture

#### Database Integration
```sql
-- Resume analysis stored as JSONB in applications table
ALTER TABLE applications 
ADD COLUMN resume_analysis JSONB;

-- Optimized indexing for analysis queries
CREATE INDEX idx_applications_resume_analysis ON applications USING GIN (resume_analysis);
```

#### API Endpoints
- `POST /api/resume-analysis/analyze` - Analyze uploaded resume file
- `POST /api/resume-analysis/analyze-async` - Start async analysis
- `POST /api/resume-analysis/applications/{id}/analyze` - Analyze existing application

#### Configuration Options
```properties
# AI Service Configuration
ai.service.provider=ollama|openai|gemini|claude
ai.service.base-url=http://localhost:11434
ai.service.model=llama3|gpt-4|gemini-pro|claude-3
ai.service.api-key=${AI_API_KEY}
ai.service.auth-type=none|bearer|api-key
```

### Free vs Premium Options

#### Free Tier (Ollama + Traditional NLP)
- **Cost**: $0 forever
- **Privacy**: 100% local processing
- **Setup**: Self-hosted Ollama instance
- **Models**: phi3 (2.3GB), llama3 (4.7GB), codellama (3.8GB)
- **Performance**: 2-8 seconds per resume

#### Premium Tier (Cloud AI)
- **OpenAI GPT-4**: ~$0.12 per resume analysis
- **Google Gemini**: Free tier (15 requests/minute)
- **High Accuracy**: Advanced language understanding
- **Cloud Processing**: No local setup required

## Real-time Chat Support System

### Overview
The ATS includes a comprehensive real-time chat support system using Socket.IO, enabling candidates to communicate with admin support staff in real-time.

### Core Features

#### 1. WebSocket Architecture
- **Socket.IO Server**: Runs on port 9092
- **Real-time Messaging**: Instant message delivery
- **Connection Management**: Automatic reconnection and error handling
- **Room-based Communication**: Isolated conversation channels

#### 2. User Roles and Access
- **Candidates**: Can initiate chat conversations
- **Admins**: Can take and manage multiple conversations
- **Conversation Assignment**: Admins can claim unassigned conversations
- **Conversation Monitoring**: Real-time conversation oversight

#### 3. Chat Widget (Candidate Side)
- **Floating Chat Widget**: Non-intrusive interface
- **Auto-connection**: Connects when widget is opened
- **Message History**: Persistent conversation history
- **Typing Indicators**: Real-time interaction feedback
- **Connection Status**: Visual connection state indicators

#### 4. Admin Chat Panel
- **Conversation Dashboard**: Overview of all conversations
- **Unassigned Queue**: New conversations awaiting assignment
- **Active Conversations**: Currently handled conversations
- **Multi-conversation Support**: Handle multiple chats simultaneously
- **Conversation Taking**: Claim unassigned conversations

#### 5. Conversation Management
- **Automatic Conversation Creation**: When candidates open chat
- **Admin Assignment**: Manual conversation claiming
- **Conversation Closure**: End conversations with confirmation
- **Message Broadcasting**: Real-time message distribution
- **Conversation Status**: UNASSIGNED, ACTIVE, CLOSED

### Database Schema
```sql
-- Conversations table
CREATE TABLE conversations (
    id BIGSERIAL PRIMARY KEY,
    candidate_id BIGINT REFERENCES users(id),
    admin_id BIGINT REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'UNASSIGNED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages table
CREATE TABLE chat_messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT REFERENCES conversations(id),
    sender_id BIGINT REFERENCES users(id),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Socket.IO Events
- **Connection Events**: `connect`, `disconnect`
- **Chat Events**: `join_chat`, `send_message`, `close_conversation`
- **Admin Events**: `admin_take_conversation`, `join_admin_room`
- **Notification Events**: `new_unassigned_conversation`, `conversation_taken`

### UI Components
- **ChatWidget**: Floating chat interface for candidates
- **AdminChatPanel**: Conversation management for admins
- **ChatModal**: Dedicated chat windows for admins
- **AdminChatNotifications**: Real-time conversation alerts

## File Upload and Storage System

### Overview
Comprehensive file management system supporting multiple file types with organized storage, security validation, and URL-based access.

### Supported File Types

#### 1. Profile Pictures
- **Formats**: JPEG, PNG, GIF
- **Storage Path**: `/uploads/profile-pictures/`
- **Validation**: Image MIME type checking
- **Naming**: UUID-based to prevent conflicts
- **Access URL**: `/api/files/profile-pictures/{filename}`

#### 2. Resume Documents
- **Formats**: PDF, DOC, DOCX, TXT
- **Storage Path**: `/uploads/resumes/`
- **Integration**: Connected to AI resume analysis
- **Validation**: Document MIME type checking
- **Security**: File content validation

#### 3. Cover Letters
- **Formats**: PDF, DOC, DOCX, TXT
- **Storage Path**: `/uploads/cover-letters/`
- **Purpose**: Application supporting documents
- **Validation**: Document format verification

### Storage Features

#### 1. File Organization
- **Directory Structure**: Organized by file type
- **Auto-creation**: Directories created on-demand
- **Permissions**: Configurable file permissions
- **Cleanup**: Scheduled cleanup for orphaned files

#### 2. Security Features
- **MIME Type Validation**: Server-side format verification
- **File Size Limits**: Configurable upload limits (default 10MB)
- **Filename Sanitization**: UUID prefix for security
- **Access Control**: URL-based controlled access

#### 3. API Endpoints
- `POST /api/files/upload/profile-picture` - Upload profile picture
- `POST /api/files/upload/resume` - Upload resume document
- `POST /api/files/upload/cover-letter` - Upload cover letter
- `GET /api/files/profile-pictures/{filename}` - Access profile picture
- `GET /api/files/info` - File storage system information

#### 4. Error Handling
- **Storage Failures**: Graceful error handling
- **Format Validation**: Clear error messages
- **Retry Mechanisms**: Built-in upload retry logic
- **File Verification**: Post-upload integrity checks

### Configuration
```properties
# File Upload Configuration
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
file.upload-dir=uploads
```

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
    resume_analysis JSONB,                          -- AI-extracted resume analysis data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced indexes
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_is_shortlisted ON applications(is_shortlisted);
CREATE INDEX idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX idx_applications_resume_analysis ON applications USING GIN (resume_analysis);
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

### Real-time Chat Tables
```sql
-- Conversations table for chat support
CREATE TABLE conversations (
    id BIGSERIAL PRIMARY KEY,
    candidate_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    admin_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'UNASSIGNED',        -- UNASSIGNED, ACTIVE, CLOSED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages table
CREATE TABLE chat_messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',        -- text, system, file
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for chat performance
CREATE INDEX idx_conversations_candidate_id ON conversations(candidate_id);
CREATE INDEX idx_conversations_admin_id ON conversations(admin_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
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
   - **Automatic AI Resume Analysis**: Triggered on resume upload

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
   - **Resume Analysis Display**: AI-extracted data in application details

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
- **AI Analysis Insights**: Resume scoring distributions and skill matching analytics

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

5. **Profile Picture Integration**:
   - **ProfilePicture Component**: Reusable component with fallback to initials
   - **Lazy Loading**: Performance-optimized image loading
   - **Error Handling**: Graceful fallback when images fail to load
   - **Responsive Sizing**: Multiple size variants (small, medium, large)

### CSS Animation Features:
- Custom keyframe animations
- Glassmorphism effects
- Gradient backgrounds
- Backdrop blur filters
- Status pulse animations
- Floating icon effects
- Shimmer text effects

## Analytics and Dashboard

### Admin Dashboard Statistics
The admin dashboard provides real-time insights into system usage and recruitment metrics.

#### Core Metrics:
1. **User Statistics**:
   - Total users count
   - Users by role (Admin, Recruiter, Interviewer, Candidate)
   - Active users tracking
   - User growth trends

2. **Job Statistics**:
   - Active jobs count
   - Jobs by status breakdown
   - Application per job metrics
   - Job performance analytics

3. **Interview Metrics**:
   - Upcoming interviews count
   - Interview completion rates
   - Interviewer performance metrics
   - Interview outcome statistics

4. **Conversion Analytics**:
   - Application to interview conversion rate
   - Interview to offer conversion rate
   - Overall hiring funnel metrics
   - Time-to-hire analytics

#### Dashboard Features:
- **Real-time Updates**: Live data refresh
- **Visual Charts**: Status breakdown visualizations
- **Quick Actions**: Direct access to key functions
- **Performance Indicators**: KPI tracking and trends
- **Responsive Design**: Mobile and desktop optimized

#### API Endpoints:
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/applications/job/{jobId}/stats` - Job-specific application stats
- `GET /api/applications/trends` - Application trends over time

## API Documentation

### AI Resume Analysis APIs

#### Resume Analysis Endpoints:
1. **Analyze Resume File**: `POST /api/resume-analysis/analyze`
   ```json
   {
     "file": "multipart/form-data",
     "jobId": 123
   }
   ```
   - Returns: Complete `ResumeAnalysisDTO` with AI-extracted data

2. **Async Resume Analysis**: `POST /api/resume-analysis/analyze-async`
   ```json
   {
     "filePath": "/api/files/resumes/uuid-filename.pdf",
     "jobId": 123
   }
   ```
   - Returns: Async processing confirmation

3. **Analyze Application Resume**: `POST /api/resume-analysis/applications/{applicationId}/analyze`
   - Triggers analysis for existing application
   - Returns: Processing status

#### Resume Analysis Response Format:
```json
{
  "total_experience_years": 5.5,
  "total_companies_worked": 3,
  "current_company": "Tech Corp",
  "current_position": "Senior Software Engineer",
  "previous_positions": [
    {
      "company": "StartupXYZ",
      "position": "Software Engineer",
      "duration_months": 18,
      "start_date": "2020-01",
      "end_date": "2021-06",
      "responsibilities": ["Backend development", "API design"]
    }
  ],
  "skills_extracted": ["Java", "Spring Boot", "React", "PostgreSQL"],
  "education": [
    {
      "degree": "Bachelor of Computer Science",
      "institution": "University ABC",
      "graduation_year": 2019,
      "grade": "3.8 GPA"
    }
  ],
  "resume_score": {
    "overall_score": 85,
    "job_match_score": 78,
    "experience_score": 90,
    "skills_match_score": 82,
    "scoring_criteria": {
      "required_skills_match": 0.85,
      "experience_level_match": 0.90,
      "industry_relevance": 0.75,
      "education_level_match": 0.80
    }
  },
  "analysis_metadata": {
    "processed_at": "2024-06-02T10:30:00Z",
    "ai_model_used": "gpt-4",
    "confidence_score": 0.92,
    "processing_time_ms": 2500,
    "processing_notes": ["High confidence analysis", "Complete skill extraction"]
  }
}
```

### Real-time Chat APIs

#### WebSocket Events:
1. **Connection Management**:
   - `connect` - Client connects to server
   - `disconnect` - Client disconnects from server
   - `join_chat` - Candidate joins chat conversation
   - `join_admin_room` - Admin joins conversation for monitoring

2. **Conversation Management**:
   - `admin_take_conversation` - Admin claims unassigned conversation
   - `close_conversation` - End conversation
   - `send_message` - Send message in conversation

3. **Real-time Notifications**:
   - `new_unassigned_conversation` - New conversation available
   - `conversation_taken` - Conversation claimed by admin
   - `new_message` - New message in conversation
   - `admin_assigned` - Admin assigned to conversation

#### Chat REST APIs:
1. **Get Conversations**: `GET /api/chat/conversations`
   - Query Parameters: `status`, `adminId`
   - Returns: List of conversations

2. **Get Conversation Messages**: `GET /api/chat/conversations/{id}/messages`
   - Returns: Message history for conversation

3. **Update Conversation Status**: `PATCH /api/chat/conversations/{id}/status`
   - Body: `{"status": "CLOSED"}`

### File Upload APIs

#### File Upload Endpoints:
1. **Upload Profile Picture**: `POST /api/files/upload/profile-picture`
   - Content-Type: `multipart/form-data`
   - Body: `file` (JPEG, PNG, GIF)
   - Returns: `{"url": "/api/files/profile-pictures/uuid-filename.jpg"}`

2. **Upload Resume**: `POST /api/files/upload/resume`
   - Content-Type: `multipart/form-data`
   - Body: `file` (PDF, DOC, DOCX, TXT)
   - Returns: `{"url": "/api/files/resumes/uuid-filename.pdf"}`

3. **Upload Cover Letter**: `POST /api/files/upload/cover-letter`
   - Content-Type: `multipart/form-data`
   - Body: `file` (PDF, DOC, DOCX, TXT)
   - Returns: `{"url": "/api/files/cover-letters/uuid-filename.pdf"}`

#### File Access Endpoints:
1. **Get Profile Picture**: `GET /api/files/profile-pictures/{filename}`
   - Returns: Image binary data
   - Content-Type: `image/jpeg`

2. **Get File Storage Info**: `GET /api/files/info`
   - Returns: Storage system status and file listings

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

3. **Update Profile Picture**: `PATCH /api/users/{id}/profile-picture`
   - Body: `{"profilePictureUrl": "/api/files/profile-pictures/filename"}`

## Authentication & Security

### Enhanced Security Features
- **JWT-based authentication** with role-based access
- **LinkedIn OAuth Integration**: Social login with profile synchronization
- **Protected routes** for admin, interviewer, and candidate areas
- **File upload security** with MIME type validation and size limits
- **CSRF protection** and XSS prevention
- **Rate limiting** for API endpoints
- **Email verification** for account security
- **WebSocket authentication** for real-time chat security

### LinkedIn OAuth Configuration:
```properties
# LinkedIn OAuth Configuration
spring.security.oauth2.client.registration.linkedin.client-id=${LINKEDIN_CLIENT_ID}
spring.security.oauth2.client.registration.linkedin.client-secret=${LINKEDIN_CLIENT_SECRET}
spring.security.oauth2.client.registration.linkedin.scope=openid,profile,email
spring.security.oauth2.client.registration.linkedin.authorization-grant-type=authorization_code
spring.security.oauth2.client.registration.linkedin.redirect-uri=${BACKEND_URL}/api/auth/oauth2/callback/linkedin
```

### Role-Based Access Control:
- **ADMIN**: Full system access, user management, job management, chat support
- **INTERVIEWER**: Interview management, evaluation access
- **CANDIDATE**: Application submission, interview tracking, chat support access
- **RECRUITER**: Application review, candidate management

### Security Features:
- **File Upload Validation**: MIME type checking, file size limits
- **AI Service Security**: API key protection, request validation
- **WebSocket Security**: Connection authentication, room-based access control
- **Data Privacy**: Resume text handling, GDPR compliance considerations

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
      # AI Configuration
      - AI_PROVIDER=ollama
      - AI_BASE_URL=http://ollama:11434
      - AI_MODEL=llama3
      # WebSocket Configuration
      - SOCKETIO_HOST=0.0.0.0
      - SOCKETIO_PORT=9092
    depends_on:
      - postgres
      - ollama

  frontend:
    build: ./frontend
    ports:
      - "3001:3001"
    environment:
      - REACT_APP_API_URL=http://localhost:8080/api
      - REACT_APP_SOCKET_URL=http://localhost:9092
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

  # AI Service (Optional - can use external providers)
  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    environment:
      - OLLAMA_HOST=0.0.0.0
```

### Environment Configuration:
- Development, staging, and production profiles
- Environment-specific database configurations
- Email service configuration
- File upload directory management
- JWT secret configuration
- **AI service configuration** (multiple provider support)
- **WebSocket configuration** for real-time features
- **LinkedIn OAuth configuration**

### Production Deployment Features:
- **AWS EC2 optimization** for 4GB RAM instances
- **GitHub Actions CI/CD** pipeline
- **Docker multi-stage builds** for optimized images
- **Health checks** for all services
- **Memory optimization** for resource-constrained environments


### Health Checks:
- Database connectivity monitoring
- Application health endpoints
- Container health verification
- Service dependency checking
- **AI service availability** monitoring
- **WebSocket service** health checks

---

*This documentation is maintained to reflect the latest system capabilities and should be updated with each major feature release.* 