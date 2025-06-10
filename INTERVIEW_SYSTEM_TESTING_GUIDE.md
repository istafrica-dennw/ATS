# Interview System Testing Guide

## Overview
This guide provides comprehensive testing instructions for the interview management system implemented in the ATS application. The system supports complete interview workflows for ADMIN and INTERVIEWER roles.

## Prerequisites

### Backend Setup
1. **Database Migration**: Ensure V22 migration is applied
   ```bash
   cd backend
   ./mvnw flyway:migrate
   ```

2. **Start Backend Server**
   ```bash
   ./mvnw spring-boot:run
   ```

3. **Verify Database Schema**
   - Check that `interview_skeletons`, `interviews`, and `focus_areas` tables exist
   - Verify foreign key constraints are properly named

### Frontend Setup
1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Frontend Server**
   ```bash
   npm start
   ```

## Test Data Setup

### 1. Create Test Users
Create users with appropriate roles using the admin interface or database:

```sql
-- Admin User
INSERT INTO users (email, password, first_name, last_name, role, is_verified) 
VALUES ('admin@test.com', '$2a$10$...', 'Admin', 'User', 'ADMIN', true);

-- Interviewer Users
INSERT INTO users (email, password, first_name, last_name, role, is_verified) 
VALUES ('interviewer1@test.com', '$2a$10$...', 'Alice', 'Johnson', 'INTERVIEWER', true);

INSERT INTO users (email, password, first_name, last_name, role, is_verified) 
VALUES ('interviewer2@test.com', '$2a$10$...', 'Bob', 'Wilson', 'INTERVIEWER', true);
```

### 2. Create Test Jobs
```sql
INSERT INTO jobs (title, description, requirements, location, salary_min, salary_max, job_type, status, created_by_id) 
VALUES ('Software Engineer', 'Full-stack development role', 'React, Java, Spring Boot', 'Remote', 80000, 120000, 'FULL_TIME', 'ACTIVE', 1);
```

### 3. Create Test Applications
```sql
INSERT INTO applications (job_id, candidate_name, candidate_email, resume_url, cover_letter, status) 
VALUES (1, 'John Doe', 'john@example.com', 'https://example.com/resume.pdf', 'I am interested...', 'SHORTLISTED');
```

## Testing Scenarios

### Admin Workflow Testing

#### 1. Interview Skeleton Management
**URL**: `/admin/interview-skeletons`

**Test Cases**:
1. **Create Interview Skeleton**
   - Click "Create Skeleton"
   - Fill in name: "Technical Interview"
   - Add description: "Technical assessment for software engineers"
   - Add focus areas:
     - "Coding Skills" - "Assess programming abilities"
     - "System Design" - "Evaluate architecture knowledge"
     - "Problem Solving" - "Test analytical thinking"
   - Submit and verify creation

2. **Edit Interview Skeleton**
   - Click "Edit" on existing skeleton
   - Modify name and focus areas
   - Verify changes are saved

3. **Delete Interview Skeleton**
   - Click "Delete" on skeleton
   - Confirm deletion
   - Verify skeleton is removed

**Expected Results**:
- ✅ CRUD operations work correctly
- ✅ Focus areas are properly managed
- ✅ Validation prevents empty required fields
- ✅ Error handling for API failures

#### 2. Interview Assignment
**URL**: `/admin/interview-assignments`

**Test Cases**:
1. **Assign Interview**
   - View shortlisted applications
   - Click "Assign Interview" on candidate
   - Select interviewer from dropdown
   - Select interview template
   - Set scheduled date/time (optional)
   - Add notes (optional)
   - Submit assignment

2. **Validation Testing**
   - Try submitting without required fields
   - Verify error messages appear

**Expected Results**:
- ✅ Applications are listed correctly
- ✅ Interviewers and templates populate dropdowns
- ✅ Assignment creates interview record
- ✅ Validation prevents incomplete submissions

### Interviewer Workflow Testing

#### 1. Dashboard Overview
**URL**: `/interviewer`

**Test Cases**:
1. **View Dashboard Stats**
   - Check assigned interviews count
   - Check in-progress interviews count
   - Check completed interviews count

2. **Quick Actions**
   - Click "View All Interviews"
   - Click "Start Interview" on assigned interview

**Expected Results**:
- ✅ Stats display correctly
- ✅ Navigation works properly
- ✅ Only interviewer's interviews are shown

#### 2. Interview List Management
**URL**: `/interviewer/interviews`

**Test Cases**:
1. **Filter Interviews**
   - Test "All" filter
   - Test "Assigned" filter
   - Test "In Progress" filter
   - Test "Completed" filter

2. **Search Functionality**
   - Search by candidate name
   - Search by job title
   - Search by interview type

3. **Interview Actions**
   - Click "Start" on assigned interview
   - Click "View" on any interview

**Expected Results**:
- ✅ Filters work correctly
- ✅ Search returns relevant results
- ✅ Status counts are accurate
- ✅ Actions are available based on status

#### 3. Interview Detail Management
**URL**: `/interviewer/interviews/:id`

**Test Cases**:
1. **Start Interview**
   - Navigate to assigned interview
   - Click "Start Interview"
   - Verify status changes to "IN_PROGRESS"

2. **Conduct Interview**
   - Fill in feedback for each focus area
   - Set ratings (0-100) for each area
   - Save progress (data should persist)

3. **Submit Interview**
   - Complete all focus areas
   - Click "Submit Interview"
   - Verify status changes to "COMPLETED"
   - Verify completion timestamp is set

4. **View Completed Interview**
   - Navigate to completed interview
   - Verify all data is read-only
   - Check completion status display

**Expected Results**:
- ✅ Status transitions work correctly
- ✅ Form data persists during editing
- ✅ Submission validates required fields
- ✅ Completed interviews are read-only

### API Testing

#### Backend Endpoints
Test these endpoints using Postman or curl:

1. **Interview Skeleton Endpoints**
   ```bash
   # Get all skeletons
   GET /api/interview-skeletons
   
   # Create skeleton
   POST /api/interview-skeletons
   {
     "jobId": 1,
     "name": "Technical Interview",
     "description": "Technical assessment",
     "focusAreas": [
       {"title": "Coding", "description": "Programming skills"}
     ]
   }
   
   # Delete skeleton
   DELETE /api/interview-skeletons/{id}
   ```

2. **Interview Management Endpoints**
   ```bash
   # Assign interview
   POST /api/interviews/assign
   {
     "applicationId": 1,
     "interviewerId": 2,
     "skeletonId": 1,
     "scheduledAt": "2024-02-01T10:00:00Z"
   }
   
   # Start interview
   POST /api/interviews/{id}/start
   
   # Submit interview
   POST /api/interviews/{id}/submit
   {
     "responses": [
       {
         "title": "Coding Skills",
         "feedback": "Strong programming abilities",
         "rating": 85
       }
     ]
   }
   
   # Get interviewer's interviews
   GET /api/interviews/my-interviews
   ```

### Error Handling Testing

#### 1. Network Errors
- Disconnect internet during operations
- Verify error messages appear
- Test retry functionality

#### 2. Validation Errors
- Submit forms with missing required fields
- Test field length limits
- Verify client-side validation

#### 3. Permission Errors
- Try accessing interviewer pages as admin
- Try accessing admin pages as interviewer
- Verify proper redirects

### Performance Testing

#### 1. Large Data Sets
- Create 100+ interview skeletons
- Assign 50+ interviews to single interviewer
- Test pagination and filtering performance

#### 2. Concurrent Users
- Have multiple interviewers use system simultaneously
- Test data consistency

## Browser Compatibility

Test on:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## Mobile Responsiveness

Test on:
- ✅ Mobile phones (320px-768px)
- ✅ Tablets (768px-1024px)
- ✅ Desktop (1024px+)

## Security Testing

1. **Authentication**
   - Verify JWT tokens are required
   - Test token expiration handling
   - Verify role-based access control

2. **Authorization**
   - Interviewers can only see their interviews
   - Admins can manage all interviews
   - Proper API endpoint protection

3. **Data Validation**
   - SQL injection prevention
   - XSS protection
   - Input sanitization

## Troubleshooting Common Issues

### Backend Issues
1. **Database Connection Errors**
   - Check database is running
   - Verify connection string
   - Check migration status

2. **API Errors**
   - Check server logs
   - Verify JWT token validity
   - Check user permissions

### Frontend Issues
1. **Page Not Loading**
   - Check browser console for errors
   - Verify API endpoints are accessible
   - Check network tab for failed requests

2. **Authentication Issues**
   - Clear browser storage
   - Check token expiration
   - Verify user role

### Data Issues
1. **Missing Data**
   - Verify test data is properly inserted
   - Check foreign key relationships
   - Validate data integrity

## Success Criteria

The interview system is working correctly when:

- ✅ Admins can create and manage interview templates
- ✅ Admins can assign interviews to candidates and interviewers
- ✅ Interviewers receive assigned interviews
- ✅ Interviewers can start, conduct, and submit interviews
- ✅ Status transitions work properly (ASSIGNED → IN_PROGRESS → COMPLETED)
- ✅ All data persists correctly
- ✅ Role-based permissions are enforced
- ✅ UI is responsive and user-friendly
- ✅ Error handling works gracefully
- ✅ API endpoints return proper responses

## Next Steps

After successful testing:

1. **Production Deployment**
   - Set up production database
   - Configure environment variables
   - Deploy backend and frontend

2. **User Training**
   - Create user documentation
   - Train admin users on interview management
   - Train interviewers on system usage

3. **Monitoring**
   - Set up application monitoring
   - Configure error tracking
   - Monitor system performance

4. **Future Enhancements**
   - Email notifications for interview assignments
   - Calendar integration
   - Interview scheduling automation
   - Reporting and analytics dashboard 