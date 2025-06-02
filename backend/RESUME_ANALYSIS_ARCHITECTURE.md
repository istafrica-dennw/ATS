# Resume Analysis System Architecture

## System Flow

```
1. Resume Upload (FileUploadController)
   ↓
2. File Storage (FileStorageService)  
   ↓
3. Application Creation (ApplicationService)
   ↓
4. **[NEW] Resume Analysis Trigger**
   ↓
5. AI Processing (ResumeAnalysisService)
   ↓
6. Update Application with Analysis Data
```

## Integration Points

### 1. FileUploadController Enhancement
```java
@PostMapping("/upload/resume")
public ResponseEntity<Map<String, String>> uploadResume(
    @RequestParam("file") MultipartFile file,
    @RequestParam("jobId") Long jobId) {
    
    // Existing file storage
    String fileUrl = fileStorageService.storeResume(file);
    
    // NEW: Trigger async resume analysis
    if (resumeAnalysisService.isSupportedResumeFormat(file)) {
        Job job = jobService.getJobById(jobId);
        resumeAnalysisService.analyzeResumeAsync(file, job)
            .thenAccept(analysis -> {
                // Update application with analysis results
                applicationService.updateResumeAnalysis(applicationId, analysis);
            });
    }
    
    return ResponseEntity.ok(response);
}
```

### 2. ApplicationService Enhancement
```java
public class ApplicationService {
    
    // NEW method to update resume analysis
    public void updateResumeAnalysis(Long applicationId, ResumeAnalysisDTO analysis) {
        Application application = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new NotFoundException("Application not found"));
        
        application.setResumeAnalysis(analysis);
        applicationRepository.save(application);
        
        // Optional: Send notification about completed analysis
        notificationService.notifyResumeAnalysisComplete(application);
    }
    
    // Enhanced application retrieval with analysis data
    public ApplicationDTO getApplicationWithAnalysis(Long id) {
        Application application = applicationRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Application not found"));
        
        ApplicationDTO dto = convertToDTO(application);
        dto.setResumeAnalysis(application.getResumeAnalysis());
        return dto;
    }
}
```

## Database Schema Integration

### Applications Table (Updated)
```sql
CREATE TABLE applications (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT NOT NULL,
    candidate_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL,
    resume_url VARCHAR(500),
    cover_letter_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    experience_years DECIMAL(4,1),
    current_company VARCHAR(255),
    current_position VARCHAR(255),
    expected_salary DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    resume_analysis JSONB,  -- NEW FIELD
    
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (candidate_id) REFERENCES users(id)
);

-- Index for querying by analysis data
CREATE INDEX idx_applications_resume_analysis ON applications USING GIN (resume_analysis);
```

## AI Processing Pipeline

### 1. Document Processing
```
Resume File → Apache Tika → Plain Text → Clean & Normalize
```

### 2. AI Analysis
```
Plain Text + Job Description → GPT-4 → Structured JSON Response
```

### 3. Data Extraction Prompt Template
```
Analyze this resume and extract the following information:

RESUME TEXT:
{resume_text}

JOB DESCRIPTION:
{job_description}

Please extract and return a JSON object with:
1. total_experience_years (calculate excluding overlaps)
2. total_companies_worked 
3. current_company
4. current_position
5. previous_positions (array with company, position, duration)
6. skills_extracted (array)
7. education (array)
8. resume_score (overall score 0-100 based on job match)

Format: Valid JSON only, no explanations.
```

## Frontend Integration

### 1. Admin Dashboard Enhancement
- Add resume analysis data to application details view
- Show AI-extracted information alongside application
- Display scoring breakdown with visual indicators
- Add filtering/sorting by AI scores

### 2. New UI Components
```typescript
// Resume Analysis Display Component
interface ResumeAnalysisProps {
  analysis: ResumeAnalysisDTO;
  showDetailed?: boolean;
}

// Scoring Visualization Component  
interface ScoreVisualizationProps {
  scores: ResumeScoreDTO;
  jobRequirements: JobRequirement[];
}
```

## Error Handling & Fallbacks

### 1. AI Service Failures
- Graceful degradation when AI service is unavailable
- Retry mechanism with exponential backoff
- Manual analysis trigger for failed cases

### 2. File Processing Errors
- Unsupported file formats → Store without analysis
- Corrupted files → Log error, continue without analysis
- Large files → Process in chunks or reject with message

## Performance Considerations

### 1. Async Processing
- All AI analysis runs asynchronously 
- Frontend shows "Analysis in progress..." status
- WebSocket/SSE updates when complete

### 2. Caching Strategy
- Cache analysis results to avoid re-processing
- Cache extracted text for quick re-analysis
- Cache job descriptions for scoring comparisons

### 3. Rate Limiting
- Limit concurrent AI requests
- Queue system for high-volume periods
- Priority processing for premium accounts

## Monitoring & Analytics

### 1. Metrics to Track
- Analysis processing time
- Success/failure rates
- AI costs per resume
- Score distribution patterns

### 2. Logging
- All AI requests/responses (sanitized)
- Processing times and errors
- User interactions with analysis data

## Security Considerations

### 1. Data Privacy
- Resume text never stored permanently
- AI requests include only necessary data
- GDPR compliance for AI processing

### 2. API Security
- Secure OpenAI API key storage
- Request signing and validation
- Rate limiting to prevent abuse

## Future Enhancements

1. **Custom Scoring Models**: Train domain-specific models
2. **Skills Ontology**: Map extracted skills to standardized taxonomy
3. **Bias Detection**: Analyze and flag potential hiring biases
4. **Candidate Matching**: AI-powered job recommendation engine
5. **Interview Questions**: Generate custom questions based on resume analysis 