# ATS System - Applicant Tracking System

A comprehensive Applicant Tracking System built with Spring Boot and React, designed to streamline the recruitment process for organizations.

## 🌐 Live Site

**Access the live application at: [https://ist.africa](https://ist.africa)**

The application is hosted on AWS and ready for production use.

## Features

### 📋 Job Management
- **Job Posting Creation**: Rich job descriptions with formatting support
- **Status Management**: Draft, Published, Expired, Closed, and Reopened statuses
- **Work Settings**: Remote, Onsite, and Hybrid work arrangements
- **Custom Questions**: Add job-specific application questions
- **Skills Tracking**: Array-based skill requirements
- **Department & Location**: Organized job categorization

### 👥 Application Processing
- **File Uploads**: Resume, cover letter, and portfolio support
- **Status Tracking**: 8-stage application workflow (Applied → Accepted/Rejected)
- **Custom Responses**: Answers to job-specific questions
- **Experience Tracking**: Years of experience with detailed breakdown
- **Salary Expectations**: Expected salary tracking
- **Application Analytics**: Comprehensive statistics and reporting
- **🤖 AI Resume Analysis**: Automatic resume parsing with experience extraction, skills matching, and job-specific scoring (powered by free Ollama models)

### 🤖 AI Resume Analysis
- **Automatic Analysis**: AI-powered resume parsing and scoring
- **Experience Extraction**: Years of experience and company history
- **Skills Matching**: Job-specific skill compatibility scoring
- **Scoring System**: Overall, experience, and skills match percentages
- **Free AI Models**: Powered by Ollama (phi3, llama3, codellama)
- **Rescore Functionality**: Re-analyze resumes against different jobs
- **Detailed Insights**: Work history, education, and comprehensive analysis

### 🎯 User Management
- **Role-Based Access**: Admin, Recruiter, Interviewer, Candidate roles
- **Authentication**: JWT-based with LinkedIn OAuth integration
- **Profile Management**: Extended user profiles with pictures
- **Email Verification**: Secure account verification system
- **Password Management**: Reset, change, and recovery features

### 📊 Interview & Evaluation
- **Interview Scheduling**: Multiple rounds with participant management
- **Evaluation System**: Structured scoring and feedback collection
- **Meeting Integration**: Meeting links and scheduling
- **Performance Tracking**: Comprehensive evaluation metrics

### 📧 Communication
- **Email Notifications**: Automated email system with templates
- **Status Updates**: Real-time application status notifications
- **Template Management**: Customizable email templates
- **Retry Mechanism**: Failed email retry system

## 🏗️ Technology Stack

### Backend
- **Spring Boot 3.2.3** - Main framework
- **PostgreSQL** - Primary database
- **JWT** - Authentication and security
- **Flyway** - Database migrations
- **Swagger/OpenAPI** - API documentation
- **Lombok** - Code generation

### Frontend
- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Router** - Navigation

### DevOps & Deployment
- **Docker & Docker Compose** - Containerization
- **Multi-stage builds** - Optimized container images
- **Health checks** - Container monitoring
- **AWS EC2** - Production hosting
- **GitHub Actions** - CI/CD pipeline
- **Nginx** - Production web server
- **Ollama + phi3** - Local AI models for resume analysis

## Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd ats-system
```

2. **Start with Docker Compose**
```bash
docker-compose up -d
```

3. **Access the application**
- **Production**: [https://ist.africa](https://ist.africa)
- **Local Frontend**: http://localhost:3001 (development)
- **Local Backend**: http://localhost:8080
- **API Documentation**: http://localhost:8080/swagger-ui.html

### Default Admin Account
- Email: `admin@ist.africa`
- Password: `admin@atsafrica`

## 📊 Database Schema

The system uses PostgreSQL with the following key tables:

### Core Tables
- **users** - User accounts and profiles
- **jobs** - Job postings with status and settings
- **job_custom_questions** - Job-specific application questions
- **applications** - Candidate applications with status tracking
- **application_answers** - Responses to custom questions

### Process Tables
- **interviews** - Interview scheduling and management
- **interview_participants** - Interview attendees
- **evaluations** - Interview feedback and scoring
- **experience_calculations** - Experience analysis

### Communication
- **email_notifications** - Email delivery tracking
- **email_templates** - Template management
- **communications** - Message history

## 🔧 Configuration

### Environment Variables

```bash
# Database
POSTGRES_DB=ats_database
POSTGRES_USER=ats_user
POSTGRES_PASSWORD=ats_password

# Backend
SPRING_DATASOURCE_URL=jdbc:postgresql://ats-database:5432/ats_database
JWT_SECRET=your-jwt-secret

# Email (Optional)
MAIL_USERNAME=your-email@example.com
MAIL_PASSWORD=your-email-password

# LinkedIn OAuth (Optional)
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
```

## 📝 API Documentation

The system provides comprehensive REST APIs:

### Key Endpoints
- **Jobs**: `/api/jobs/*` - Job management
- **Applications**: `/api/applications/*` - Application processing
- **Users**: `/api/users/*` - User management
- **Auth**: `/api/auth/*` - Authentication
- **Files**: `/api/files/*` - File uploads

### Documentation
- **Production API**: https://ist.africa:8080/swagger-ui.html
- **Local Development**: http://localhost:8080/swagger-ui.html
- **OpenAPI Spec**: http://localhost:8080/api-docs

## 🎨 User Interface

### Admin Dashboard
- Job management with status controls
- Application review and status updates
- User management and role assignment
- Analytics and reporting

### Candidate Portal
- Job browsing and search
- Application submission and tracking
- Profile management
- Application history

### Responsive Design
- Mobile-friendly interface
- Consistent navigation
- Accessible components
- Modern UI with Tailwind CSS

## 🔐 Security Features

- **JWT Authentication** with configurable expiration
- **Role-based authorization** (RBAC)
- **Password encryption** using BCrypt
- **File upload security** with type validation
- **CSRF protection** and XSS prevention
- **Rate limiting** for API endpoints

## 📈 Application Flow

### Job Application Process
1. **Job Creation** → Admin creates job with custom questions
2. **Job Publishing** → Job becomes visible to candidates
3. **Application Submission** → Candidate applies with documents
4. **Review Process** → Recruiter reviews applications
5. **Interview Scheduling** → Selected candidates invited
6. **Evaluation** → Interview feedback and scoring
7. **Decision** → Offer, rejection, or further rounds
8. **Communication** → Automated status notifications

## 🧪 Development

### Local Development Setup

1. **Backend Development**
```bash
cd backend
./mvnw spring-boot:run
```

2. **Frontend Development**
```bash
cd frontend
npm install
npm start
```

3. **Database**
```bash
docker run -d --name ats-db \
  -e POSTGRES_DB=ats_database \
  -e POSTGRES_USER=ats_user \
  -e POSTGRES_PASSWORD=ats_password \
  -p 5432:5432 postgres:15
```

### Testing
- Backend: `./mvnw test`
- Frontend: `npm test`

## 📄 Documentation

- [Technical Documentation](docs/TECHNICAL_DOCUMENTATION.md) - Detailed system documentation
- [Production API Docs](https://ist.africa:8080/swagger-ui.html) - Live interactive API docs
- [Local API Documentation](http://localhost:8080/swagger-ui.html) - Development API docs
- [Database Schema](docs/TECHNICAL_DOCUMENTATION.md#database-schema) - Complete schema reference

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions or issues:
- Check the [Technical Documentation](docs/TECHNICAL_DOCUMENTATION.md)
- Review the API documentation
- Check existing issues
- Create a new issue with detailed information

## 📅 Roadmap

- [ ] Advanced search and filtering
- [ ] Email template customization
- [ ] Calendar integration
- [ ] Bulk operations
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] Integration with external job boards

---

**Built with ❤️ for modern recruitment workflows**
# Trigger deployment with latest workflow changes
