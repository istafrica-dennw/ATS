# Career Portal - Backend API Requirements

## Overview

The **frontend-career** portal requires a public-facing API endpoint for job applications that doesn't require authentication (since job seekers won't have accounts in the system).

---

## ✅ Existing APIs (Already Working)

### 1. Get All Jobs

```
GET /api/jobs?jobStatuses=PUBLISHED
```

- **Access**: Public (no auth required)
- **Used by**: JobsPage to list all published jobs
- **Filters**:
  - `jobStatuses`: Array of statuses (use `PUBLISHED` for career portal)
  - `workSetting`: Array of work settings (REMOTE, ONSITE, HYBRID)
  - `description`: Search keyword

### 2. Get Job by ID

```
GET /api/jobs/{id}
```

- **Access**: Public (no auth required)
- **Used by**: JobDetailsPage to show job details

---

## ⚠️ Required: Public Application Submission Endpoint

The current `/api/applications` endpoint requires authentication, which won't work for anonymous job seekers. We need a new public endpoint.

### Recommended Implementation

Create a new endpoint in the backend:

```java
// In ApplicationController.java

@PostMapping("/public")
@Operation(
    summary = "Submit a public job application",
    description = "Submit a job application without authentication (for career portal)"
)
@ApiResponses(value = {
    @ApiResponse(responseCode = "201", description = "Application submitted successfully"),
    @ApiResponse(responseCode = "400", description = "Invalid input data"),
    @ApiResponse(responseCode = "404", description = "Job not found"),
    @ApiResponse(responseCode = "500", description = "Internal server error")
})
public ResponseEntity<?> submitPublicApplication(
    @RequestParam("jobId") Long jobId,
    @RequestParam("firstName") String firstName,
    @RequestParam("lastName") String lastName,
    @RequestParam("email") String email,
    @RequestParam("phone") String phone,
    @RequestPart(value = "resume", required = true) MultipartFile resume,
    @RequestParam(value = "coverLetter", required = false) String coverLetter
) {
    try {
        // Validate inputs
        if (jobId == null || firstName == null || lastName == null ||
            email == null || phone == null || resume == null) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Missing required fields"));
        }

        // Validate file type and size
        if (!isValidResumeFile(resume)) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Invalid file type. Only PDF, DOC, DOCX allowed"));
        }

        if (resume.getSize() > 5 * 1024 * 1024) { // 5MB
            return ResponseEntity.badRequest()
                .body(Map.of("error", "File size exceeds 5MB limit"));
        }

        // Check if job exists and is published
        JobDTO job = jobService.getJobById(jobId);
        if (job.getStatus() != JobStatus.PUBLISHED) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Job is not accepting applications"));
        }

        // Create application DTO
        ApplicationDTO applicationDTO = new ApplicationDTO();
        applicationDTO.setJobId(jobId);
        applicationDTO.setFirstName(firstName);
        applicationDTO.setLastName(lastName);
        applicationDTO.setEmail(email);
        applicationDTO.setPhone(phone);
        applicationDTO.setCoverLetter(coverLetter);
        applicationDTO.setStatus(ApplicationStatus.APPLIED);

        // Submit application
        MultipartFile[] files = {resume};
        ApplicationDTO submittedApplication = applicationService
            .submitPublicApplication(applicationDTO, files);

        log.info("Public application submitted for job {} by {}",
            jobId, email);

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(submittedApplication);

    } catch (NotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(Map.of("error", e.getMessage()));
    } catch (Exception e) {
        log.error("Error submitting public application", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error", "Failed to submit application"));
    }
}

private boolean isValidResumeFile(MultipartFile file) {
    String contentType = file.getContentType();
    return contentType != null && (
        contentType.equals("application/pdf") ||
        contentType.equals("application/msword") ||
        contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    );
}
```

### Service Layer Addition

Add to `ApplicationService.java`:

```java
/**
 * Submit a public application (no authentication required)
 * Creates a candidate user record if email doesn't exist
 */
public ApplicationDTO submitPublicApplication(
    ApplicationDTO applicationDTO,
    MultipartFile[] files
) {
    // Check if user with this email exists
    Optional<User> existingUser = userRepository.findByEmail(applicationDTO.getEmail());

    Long candidateId;
    if (existingUser.isPresent()) {
        candidateId = existingUser.get().getId();
    } else {
        // Create a new candidate user
        User newCandidate = new User();
        newCandidate.setEmail(applicationDTO.getEmail());
        newCandidate.setFirstName(applicationDTO.getFirstName());
        newCandidate.setLastName(applicationDTO.getLastName());
        newCandidate.setPhone(applicationDTO.getPhone());
        newCandidate.setRole(UserRole.CANDIDATE);
        newCandidate.setEnabled(true);

        User savedCandidate = userRepository.save(newCandidate);
        candidateId = savedCandidate.getId();

        log.info("Created new candidate user with email: {}", applicationDTO.getEmail());
    }

    // Submit the application
    return submitApplication(applicationDTO, candidateId, files);
}
```

---

## API Endpoint Summary for Frontend

| Endpoint                   | Method | Auth Required | Purpose                               |
| -------------------------- | ------ | ------------- | ------------------------------------- |
| `/api/jobs`                | GET    | No            | List all jobs (filter by PUBLISHED)   |
| `/api/jobs/{id}`           | GET    | No            | Get job details                       |
| `/api/applications/public` | POST   | No            | Submit application from career portal |

---

## Frontend Integration

The frontend is already configured to use these endpoints:

```typescript
// frontend-career/src/services/applicationService.ts
export const applicationService = {
  submitApplication: async (
    jobId: string,
    formData: ApplicationFormData
  ): Promise<Application> => {
    const data = new FormData();
    data.append("jobId", jobId);
    data.append("firstName", formData.firstName);
    data.append("lastName", formData.lastName);
    data.append("email", formData.email);
    data.append("phone", formData.phone);

    if (formData.resumeFile) {
      data.append("resume", formData.resumeFile);
    }

    if (formData.coverLetter) {
      data.append("coverLetter", formData.coverLetter);
    }

    // Uses public endpoint (no authentication)
    const response = await api.post("/applications/public", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },
};
```

---

## Security Considerations

### Rate Limiting

Implement rate limiting on the public endpoint to prevent spam:

- Max 5 applications per email per day
- Max 3 applications per IP per hour

### File Validation

- Max file size: 5MB
- Allowed types: PDF, DOC, DOCX
- Scan for malware (optional but recommended)

### Email Validation

- Validate email format
- Consider email verification (send confirmation email)

### Duplicate Prevention

- Check if the same email has already applied to this job
- Return appropriate error message

---

## Testing the Endpoint

### Using cURL

```bash
curl -X POST http://localhost:8080/api/applications/public \
  -F "jobId=1" \
  -F "firstName=John" \
  -F "lastName=Doe" \
  -F "email=john.doe@example.com" \
  -F "phone=+1234567890" \
  -F "resume=@/path/to/resume.pdf" \
  -F "coverLetter=I am very interested in this position..."
```

### Expected Response

```json
{
  "id": 123,
  "jobId": 1,
  "candidateId": 456,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "resumePath": "/uploads/resumes/uuid-resume.pdf",
  "coverLetter": "I am very interested in this position...",
  "status": "APPLIED",
  "createdAt": "2024-12-10T10:30:00",
  "updatedAt": "2024-12-10T10:30:00"
}
```

---

## CORS Configuration

Make sure CORS is configured to allow requests from the career portal domain:

```java
// In SecurityConfig.java or WebConfig.java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList(
        "http://localhost:3001",  // Admin frontend
        "http://localhost:3002",  // Career portal
        "https://careers.yourcompany.com"  // Production career portal
    ));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

---

## Email Notifications

After successful application submission, consider sending:

1. **To Candidate**: Confirmation email

   - Thank you for applying
   - Application reference number
   - What to expect next

2. **To Recruiters**: New application notification
   - Job title
   - Candidate name and email
   - Link to review application in admin portal

---

## Next Steps

1. ✅ Frontend is ready and configured
2. ⚠️ **TODO**: Implement `POST /api/applications/public` endpoint in backend
3. ⚠️ **TODO**: Add `submitPublicApplication` method to `ApplicationService`
4. ⚠️ **TODO**: Configure CORS for career portal domain
5. ⚠️ **TODO**: Test the complete flow end-to-end
6. ⚠️ **TODO**: Add rate limiting and security measures
7. ⚠️ **TODO**: Set up email notifications

---

## Alternative: Make Existing Endpoint Public

If you prefer to modify the existing endpoint instead of creating a new one:

```java
@PostMapping(consumes = { "multipart/form-data" })
public ResponseEntity<?> submitApplication(
    @Valid @RequestPart("applicationDTO") ApplicationDTO applicationDTO,
    @AuthenticationPrincipal UserDetails userDetails,  // Make this optional
    @RequestPart(value = "files", required = false) MultipartFile[] files
) {
    try {
        Long candidateId;

        // Check if user is authenticated
        if (userDetails != null) {
            // Authenticated user (admin portal)
            candidateId = extractUserIdFromUserDetails(userDetails);
        } else {
            // Public submission (career portal)
            candidateId = getOrCreateCandidateFromEmail(applicationDTO.getEmail());
        }

        ApplicationDTO submittedApplication = applicationService
            .submitApplication(applicationDTO, candidateId, files);

        return new ResponseEntity<>(submittedApplication, HttpStatus.CREATED);

    } catch (Exception e) {
        // Error handling...
    }
}
```

This approach keeps one endpoint but handles both authenticated and public submissions.
