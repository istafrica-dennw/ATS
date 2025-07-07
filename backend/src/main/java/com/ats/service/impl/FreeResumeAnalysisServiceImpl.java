package com.ats.service.impl;

import com.ats.dto.ResumeAnalysisDTO;
import com.ats.model.Application;
import com.ats.model.Job;
import com.ats.repository.ApplicationRepository;
import com.ats.service.ResumeAnalysisService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service("genericResumeAnalysisService")
@RequiredArgsConstructor
@Slf4j
public class FreeResumeAnalysisServiceImpl implements ResumeAnalysisService {

    private final ApplicationRepository applicationRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();
    private final Tika tika = new Tika();

    // Generic AI Service Configuration
    @Value("${ai.service.provider:ollama}")
    private String aiProvider;

    @Value("${ai.service.base-url:http://localhost:11434}")
    private String aiBaseUrl;

    @Value("${ai.service.model:llama3}")
    private String aiModel;

    @Value("${ai.service.api-key:}")
    private String apiKey;

    @Value("${ai.service.auth-type:none}")
    private String authType; // none, bearer, api-key, custom

    @Value("${ai.service.auth-header:Authorization}")
    private String authHeader;

    @Value("${ai.service.generation-endpoint:/api/generate}")
    private String generationEndpoint;

    @Value("${ai.service.health-endpoint:/api/tags}")
    private String healthEndpoint;

    @Value("${ai.service.request-format:ollama}")
    private String requestFormat; // ollama, openai, claude, generic

    @Value("${ai.service.response-field:response}")
    private String responseField; // Field name in response containing the text

    @Value("${ai.service.max-tokens:1000}")
    private Integer maxTokens;

    @Value("${ai.service.temperature:0.1}")
    private Double temperature;

    @Value("${app.uploads.directory:uploads}")
    private String uploadsDirectory;

    // Supported file types for resume parsing
    private static final List<String> SUPPORTED_TYPES = Arrays.asList(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain"
    );

    @Override
    public ResumeAnalysisDTO analyzeResume(MultipartFile resumeFile, Job job) {
        log.info("Starting resume analysis using {} provider for job: {}", aiProvider, job.getTitle());
        
        try {
            // Extract text from the resume file
            String resumeText = extractTextFromResume(resumeFile);
            
            // Perform AI analysis using configured provider
            return performGenericAiAnalysis(resumeText, job);
            
        } catch (Exception e) {
            log.error("Error analyzing resume: {}", e.getMessage(), e);
            return createErrorAnalysis(e.getMessage());
        }
    }

    @Override
    public ResumeAnalysisDTO analyzeResume(String resumeFilePath, Job job) {
        log.info("Starting resume analysis from file path: {} using provider: {}", resumeFilePath, aiProvider);
        
        try {
            // Extract filename from URL if it's a full URL path
            String actualFilePath = resumeFilePath;
            if (resumeFilePath.startsWith("/api/files/")) {
                // Extract filename: /api/files/resumes/filename.pdf -> resumes/filename.pdf
                actualFilePath = resumeFilePath.substring("/api/files/".length());
            }
            
            // Read file from path
            File resumeFile = new File(uploadsDirectory + "/" + actualFilePath);
            String resumeText = tika.parseToString(resumeFile);
            
            // Perform AI analysis
            return performGenericAiAnalysis(resumeText, job);
            
        } catch (Exception e) {
            log.error("Error analyzing resume from path {}: {}", resumeFilePath, e.getMessage(), e);
            return createErrorAnalysis(e.getMessage());
        }
    }

    @Override
    @Async("resumeAnalysisExecutor")
    public CompletableFuture<ResumeAnalysisDTO> analyzeResumeAsync(String resumeFilePath, Job job) {
        return CompletableFuture.supplyAsync(() -> analyzeResume(resumeFilePath, job));
    }

    @Override
    public Application updateApplicationWithAnalysis(Application application, ResumeAnalysisDTO analysis) {
        application.setResumeAnalysis(analysis);
        return applicationRepository.save(application);
    }

    @Override
    @Async("resumeAnalysisExecutor")
    public CompletableFuture<Application> analyzeAndUpdateApplication(Application application, Job job) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                // Analyze the resume
                ResumeAnalysisDTO analysis = analyzeResume(application.getResumeUrl(), job);
                
                // Update application
                return updateApplicationWithAnalysis(application, analysis);
                
            } catch (Exception e) {
                log.error("Error in analyzeAndUpdateApplication: {}", e.getMessage(), e);
                // Return application with error analysis
                ResumeAnalysisDTO errorAnalysis = createErrorAnalysis(e.getMessage());
                return updateApplicationWithAnalysis(application, errorAnalysis);
            }
        });
    }

    @Override
    public ResumeAnalysisDTO rescoreForJob(ResumeAnalysisDTO existingAnalysis, Job job) {
        try {
            // Create a new scoring based on the job
            ResumeAnalysisDTO.ResumeScoreDTO newScore = calculateJobMatchScore(existingAnalysis, job);
            
            // Update the analysis with new score
            existingAnalysis.setResumeScore(newScore);
            
            // Update metadata
            ResumeAnalysisDTO.AnalysisMetadataDTO metadata = existingAnalysis.getAnalysisMetadata();
            if (metadata != null) {
                metadata.setProcessedAt(LocalDateTime.now());
                metadata.getProcessingNotes().add("Re-scored for job: " + job.getTitle());
            }
            
            return existingAnalysis;
            
        } catch (Exception e) {
            log.error("Error rescoring resume for job: {}", e.getMessage(), e);
            return existingAnalysis; // Return original on error
        }
    }

    @Override
    public String extractTextFromResume(MultipartFile resumeFile) {
        try {
            return tika.parseToString(resumeFile.getInputStream());
        } catch (IOException | TikaException e) {
            log.error("Error extracting text from resume: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to extract text from resume", e);
        }
    }

    @Override
    public boolean isSupportedResumeFormat(MultipartFile file) {
        try {
            String detectedType = tika.detect(file.getInputStream());
            return SUPPORTED_TYPES.contains(detectedType);
        } catch (IOException e) {
            log.error("Error detecting file type: {}", e.getMessage(), e);
            return false;
        }
    }

    // Generic AI analysis methods

    private ResumeAnalysisDTO performGenericAiAnalysis(String resumeText, Job job) {
        long startTime = System.currentTimeMillis();
        
        try {
            // Check if AI service is available, fallback to traditional NLP if not
            if (isAiServiceAvailable()) {
                return performAiAnalysis(resumeText, job, startTime);
            } else {
                log.warn("{} AI service not available, using traditional NLP analysis", aiProvider);
                return performTraditionalNlpAnalysis(resumeText, job, startTime);
            }
            
        } catch (Exception e) {
            log.error("Error in {} AI analysis, falling back to traditional NLP: {}", aiProvider, e.getMessage());
            return performTraditionalNlpAnalysis(resumeText, job, startTime);
        }
    }

    private ResumeAnalysisDTO performAiAnalysis(String resumeText, Job job, long startTime) {
        try {
            // Create analysis prompt
            String prompt = createAnalysisPrompt(resumeText, job.getDescription());
            
            // Call AI service
            String response = callGenericAiApi(prompt);
            
            // Parse response
            ResumeAnalysisDTO analysis = parseAiResponse(response);
            
            // Calculate job-specific scoring
            ResumeAnalysisDTO.ResumeScoreDTO score = calculateJobMatchScore(analysis, job);
            analysis.setResumeScore(score);
            
            // Add metadata
            long processingTime = System.currentTimeMillis() - startTime;
            ResumeAnalysisDTO.AnalysisMetadataDTO metadata = createMetadata(processingTime, aiProvider + "/" + aiModel);
            analysis.setAnalysisMetadata(metadata);
            
            log.info("AI analysis completed using {} in {}ms", aiProvider, processingTime);
            return analysis;
            
        } catch (Exception e) {
            log.error("AI analysis failed: {}", e.getMessage());
            throw e;
        }
    }

    private boolean isAiServiceAvailable() {
        try {
            String url = aiBaseUrl + healthEndpoint;
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            log.debug("{} AI service not available: {}", aiProvider, e.getMessage());
            return false;
        }
    }

    private String callGenericAiApi(String prompt) {
        String url = aiBaseUrl + generationEndpoint;
        
        // Create request based on format
        Map<String, Object> request = createRequestPayload(prompt);
        
        // Create headers with authentication
        HttpHeaders headers = createHttpHeaders();
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
        
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            Map<String, Object> responseBody = response.getBody();
            return extractResponseText(responseBody);
        } catch (Exception e) {
            throw new RuntimeException("Failed to call " + aiProvider + " API: " + e.getMessage(), e);
        }
    }

    private Map<String, Object> createRequestPayload(String prompt) {
        Map<String, Object> request = new HashMap<>();
        
        switch (requestFormat.toLowerCase()) {
            case "openai":
                request.put("model", aiModel);
                request.put("messages", List.of(Map.of("role", "user", "content", prompt)));
                request.put("temperature", temperature);
                request.put("max_tokens", maxTokens);
                break;
                
            case "claude":
                request.put("model", aiModel);
                request.put("messages", List.of(Map.of("role", "user", "content", prompt)));
                request.put("temperature", temperature);
                request.put("max_tokens", maxTokens);
                break;
                
            case "ollama":
            default:
                request.put("model", aiModel);
                request.put("prompt", prompt);
                request.put("stream", false);
                request.put("options", Map.of("temperature", temperature, "num_predict", maxTokens));
                break;
        }
        
        return request;
    }

    private HttpHeaders createHttpHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        // Add authentication based on auth type
        switch (authType.toLowerCase()) {
            case "bearer":
                if (!apiKey.isEmpty()) {
                    headers.setBearerAuth(apiKey);
                }
                break;
                
            case "api-key":
                if (!apiKey.isEmpty()) {
                    headers.set(authHeader, apiKey);
                }
                break;
                
            case "custom":
                if (!apiKey.isEmpty()) {
                    headers.set(authHeader, apiKey);
                }
                break;
                
            case "none":
            default:
                // No authentication
                break;
        }
        
        return headers;
    }

    private String extractResponseText(Map<String, Object> responseBody) {
        try {
            switch (requestFormat.toLowerCase()) {
                case "openai":
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                    if (choices != null && !choices.isEmpty()) {
                        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                        return (String) message.get("content");
                    }
                    break;
                    
                case "claude":
                    // Claude typically has a 'content' field in the response
                    Object content = responseBody.get("content");
                    if (content instanceof List) {
                        List<Map<String, Object>> contentList = (List<Map<String, Object>>) content;
                        if (!contentList.isEmpty()) {
                            return (String) contentList.get(0).get("text");
                        }
                    }
                    break;
                    
                case "ollama":
                default:
                    return (String) responseBody.get(responseField);
            }
        } catch (Exception e) {
            log.error("Error extracting response text: {}", e.getMessage());
        }
        
        // Fallback: try the configured response field
        return (String) responseBody.get(responseField);
    }

    private ResumeAnalysisDTO performTraditionalNlpAnalysis(String resumeText, Job job, long startTime) {
        log.info("Performing traditional NLP analysis (100% free fallback)");
        
        try {
            // Extract information using traditional NLP techniques
            ResumeAnalysisDTO analysis = ResumeAnalysisDTO.builder()
                    .totalExperienceYears(extractExperienceYears(resumeText))
                    .totalCompaniesWorked(extractCompanyCount(resumeText))
                    .currentCompany(extractCurrentCompany(resumeText))
                    .currentPosition(extractCurrentPosition(resumeText))
                    .skillsExtracted(extractSkills(resumeText))
                    .education(extractEducation(resumeText))
                    .previousPositions(extractPreviousPositions(resumeText))
                    .build();
            
            // Add metadata
            long processingTime = System.currentTimeMillis() - startTime;
            analysis.setAnalysisMetadata(createMetadata(processingTime, "traditional-nlp"));
            
            // Calculate job-specific scoring
            ResumeAnalysisDTO.ResumeScoreDTO score = calculateJobMatchScore(analysis, job);
            analysis.setResumeScore(score);
            
            log.info("Traditional NLP analysis completed in {} ms", processingTime);
            return analysis;
            
        } catch (Exception e) {
            log.error("Traditional NLP analysis failed: {}", e.getMessage());
            return createErrorAnalysis(e.getMessage());
        }
    }

    private String createAnalysisPrompt(String resumeText, String jobDescription) {
        return String.format("""
            Analyze this resume and extract structured information. Respond ONLY with valid JSON:
            
            {
                "total_experience_years": <decimal>,
                "total_companies_worked": <integer>,
                "current_company": "<company or null>",
                "current_position": "<position or null>",
                "previous_positions": [{"company": "<name>", "position": "<title>", "duration_months": <num>, "start_date": "<YYYY-MM>", "end_date": "<YYYY-MM>", "responsibilities": ["<item>"]}],
                "skills_extracted": ["<skill1>", "<skill2>"],
                "education": [{"degree": "<degree>", "institution": "<school>", "graduation_year": <year>, "grade": "<gpa>"}]
            }
            
            Resume text:
            %s
            
            Job context:
            %s
            
            Extract skills that match the job requirements. Return valid JSON only.
            """, resumeText.substring(0, Math.min(resumeText.length(), 2000)), 
                jobDescription.substring(0, Math.min(jobDescription.length(), 500)));
    }

    private ResumeAnalysisDTO parseAiResponse(String response) {
        try {
            // Clean the response
            String cleanResponse = response.trim();
            
            // Extract JSON from response if wrapped in text
            Pattern jsonPattern = Pattern.compile("\\{.*\\}", Pattern.DOTALL);
            Matcher matcher = jsonPattern.matcher(cleanResponse);
            
            if (matcher.find()) {
                cleanResponse = matcher.group();
            }
            
            return objectMapper.readValue(cleanResponse, ResumeAnalysisDTO.class);
            
        } catch (Exception e) {
            log.error("Error parsing {} AI response: {}", aiProvider, e.getMessage());
            // Return basic analysis on parse error
            return ResumeAnalysisDTO.builder()
                    .totalExperienceYears(BigDecimal.valueOf(2))
                    .totalCompaniesWorked(1)
                    .currentCompany("Unknown")
                    .currentPosition("Unknown")
                    .skillsExtracted(Arrays.asList("General skills"))
                    .build();
        }
    }

    // Traditional NLP extraction methods (100% free)
    
    private BigDecimal extractExperienceYears(String text) {
        // Simple regex to find experience mentions
        Pattern yearPattern = Pattern.compile("(\\d+)\\s*(?:years?|yrs?)\\s*(?:of\\s*)?(?:experience|exp)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = yearPattern.matcher(text);
        
        if (matcher.find()) {
            return new BigDecimal(matcher.group(1));
        }
        
        // Count date ranges as fallback
        Pattern datePattern = Pattern.compile("(20\\d{2})\\s*[-–]\\s*(20\\d{2}|present|current)", Pattern.CASE_INSENSITIVE);
        Matcher dateMatcher = datePattern.matcher(text);
        
        int totalYears = 0;
        while (dateMatcher.find()) {
            int startYear = Integer.parseInt(dateMatcher.group(1));
            int endYear = dateMatcher.group(2).toLowerCase().contains("present") || dateMatcher.group(2).toLowerCase().contains("current") 
                    ? LocalDateTime.now().getYear() 
                    : Integer.parseInt(dateMatcher.group(2));
            totalYears += Math.max(0, endYear - startYear);
        }
        
        return BigDecimal.valueOf(Math.max(totalYears, 1));
    }

    private Integer extractCompanyCount(String text) {
        // Count company names (simple heuristic)
        Pattern companyPattern = Pattern.compile("(?:at|@)\\s+([A-Z][a-zA-Z\\s&.,-]+(?:Inc|LLC|Corp|Ltd|Company))", Pattern.CASE_INSENSITIVE);
        Matcher matcher = companyPattern.matcher(text);
        
        Set<String> companies = new HashSet<>();
        while (matcher.find()) {
            companies.add(matcher.group(1).trim());
        }
        
        return Math.max(companies.size(), 1);
    }

    private String extractCurrentCompany(String text) {
        // Look for current company indicators
        Pattern currentPattern = Pattern.compile("(?:currently|present)\\s+(?:at|@)\\s+([A-Z][a-zA-Z\\s&.,-]+)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = currentPattern.matcher(text);
        
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        
        return "Unknown";
    }

    private String extractCurrentPosition(String text) {
        // Look for current position
        Pattern positionPattern = Pattern.compile("(?:currently|present)\\s+(?:working\\s+as|as\\s+a?)\\s+([A-Z][a-zA-Z\\s]+)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = positionPattern.matcher(text);
        
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        
        return "Unknown";
    }

    private List<String> extractSkills(String text) {
        // Common technical skills
        List<String> allSkills = Arrays.asList(
                "Java", "Python", "JavaScript", "React", "Angular", "Vue", "Spring", "Node.js",
                "SQL", "PostgreSQL", "MySQL", "MongoDB", "Docker", "Kubernetes", "AWS", "Azure",
                "Git", "HTML", "CSS", "TypeScript", "C++", "C#", ".NET", "PHP", "Ruby", "Go",
                "Machine Learning", "AI", "Data Science", "DevOps", "Agile", "Scrum"
        );
        
        return allSkills.stream()
                .filter(skill -> text.toLowerCase().contains(skill.toLowerCase()))
                .toList();
    }

    private List<ResumeAnalysisDTO.EducationDTO> extractEducation(String text) {
        List<ResumeAnalysisDTO.EducationDTO> education = new ArrayList<>();
        
        // Simple degree extraction
        Pattern degreePattern = Pattern.compile("(Bachelor|Master|PhD|B\\.?S\\.?|M\\.?S\\.?|M\\.?A\\.?)\\s+(?:of\\s+|in\\s+)?([A-Za-z\\s]+)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = degreePattern.matcher(text);
        
        while (matcher.find()) {
            education.add(ResumeAnalysisDTO.EducationDTO.builder()
                    .degree(matcher.group(1) + " " + matcher.group(2))
                    .institution("Unknown")
                    .graduationYear(2020) // Default
                    .grade("N/A")
                    .build());
        }
        
        return education;
    }

    private List<ResumeAnalysisDTO.WorkExperienceDTO> extractPreviousPositions(String text) {
        // This would be more complex in a real implementation
        return Arrays.asList(
                ResumeAnalysisDTO.WorkExperienceDTO.builder()
                        .company("Previous Company")
                        .position("Software Developer")
                        .durationMonths(24)
                        .startDate("2022-01")
                        .endDate("2024-01")
                        .responsibilities(Arrays.asList("Software development", "Code review"))
                        .build()
        );
    }

    // Helper methods
    
    private ResumeAnalysisDTO.AnalysisMetadataDTO createMetadata(long processingTime, String model) {
        return ResumeAnalysisDTO.AnalysisMetadataDTO.builder()
                .processedAt(LocalDateTime.now())
                .aiModelUsed(model)
                .confidenceScore(BigDecimal.valueOf(0.85))
                .processingTimeMs(processingTime)
                .processingNotes(new ArrayList<>())
                .build();
    }

    private ResumeAnalysisDTO.ResumeScoreDTO calculateJobMatchScore(ResumeAnalysisDTO analysis, Job job) {
        try {
            // Extract required skills from job description
            List<String> requiredSkills = extractRequiredSkills(job.getDescription());
            List<String> candidateSkills = analysis.getSkillsExtracted() != null ? 
                analysis.getSkillsExtracted() : new ArrayList<>();
            
            // Calculate various scoring metrics
            BigDecimal skillsMatchRatio = calculateSkillsMatchRatio(requiredSkills, candidateSkills);
            BigDecimal experienceMatch = calculateExperienceMatch(analysis.getTotalExperienceYears(), job);
            
            // Calculate scores (0-100)
            int skillsScore = (int) (skillsMatchRatio.doubleValue() * 100);
            int experienceScore = (int) (experienceMatch.doubleValue() * 100);
            int overallScore = (int) ((skillsScore * 0.4) + (experienceScore * 0.6));
            
            return ResumeAnalysisDTO.ResumeScoreDTO.builder()
                    .overallScore(overallScore)
                    .jobMatchScore((int) ((skillsScore + experienceScore) / 2.0))
                    .experienceScore(experienceScore)
                    .skillsMatchScore(skillsScore)
                    .scoringCriteria(ResumeAnalysisDTO.ScoringCriteriaDTO.builder()
                            .requiredSkillsMatch(skillsMatchRatio)
                            .experienceLevelMatch(experienceMatch)
                            .industryRelevance(BigDecimal.valueOf(0.75))
                            .educationLevelMatch(BigDecimal.valueOf(0.80))
                            .build())
                    .build();
                    
        } catch (Exception e) {
            log.error("Error calculating job match score: {}", e.getMessage());
            return createDefaultScoring();
        }
    }

    private List<String> extractRequiredSkills(String jobDescription) {
        // Simple skill extraction from job description
        List<String> commonSkills = Arrays.asList(
                "Java", "Python", "JavaScript", "React", "Angular", "Spring", "Node.js", "SQL", "AWS", "Docker"
        );
        
        return commonSkills.stream()
                .filter(skill -> jobDescription.toLowerCase().contains(skill.toLowerCase()))
                .collect(Collectors.toList());
    }

    private BigDecimal calculateSkillsMatchRatio(List<String> requiredSkills, List<String> candidateSkills) {
        if (requiredSkills.isEmpty()) {
            return BigDecimal.valueOf(0.8); // Default if no specific skills required
        }
        
        long matchingSkills = requiredSkills.stream()
                .mapToLong(required -> candidateSkills.stream()
                        .anyMatch(candidate -> candidate.toLowerCase().contains(required.toLowerCase())) ? 1 : 0)
                .sum();
                
        return BigDecimal.valueOf((double) matchingSkills / requiredSkills.size());
    }

    private BigDecimal calculateExperienceMatch(BigDecimal totalExperience, Job job) {
        // Simple experience matching logic
        if (totalExperience == null) {
            return BigDecimal.valueOf(0.5);
        }
        
        double experienceYears = totalExperience.doubleValue();
        
        // Assume job requires 2-5 years experience (could be extracted from job description)
        if (experienceYears >= 2 && experienceYears <= 8) {
            return BigDecimal.valueOf(0.9);
        } else if (experienceYears > 8) {
            return BigDecimal.valueOf(0.85); // Slightly lower for overqualified
        } else {
            return BigDecimal.valueOf(0.6); // Lower for underqualified
        }
    }

    private ResumeAnalysisDTO.ResumeScoreDTO createDefaultScoring() {
        return ResumeAnalysisDTO.ResumeScoreDTO.builder()
                .overallScore(60)
                .jobMatchScore(60)
                .experienceScore(60)
                .skillsMatchScore(60)
                .scoringCriteria(ResumeAnalysisDTO.ScoringCriteriaDTO.builder()
                        .requiredSkillsMatch(BigDecimal.valueOf(0.6))
                        .experienceLevelMatch(BigDecimal.valueOf(0.6))
                        .industryRelevance(BigDecimal.valueOf(0.6))
                        .educationLevelMatch(BigDecimal.valueOf(0.6))
                        .build())
                .build();
    }

    private ResumeAnalysisDTO createErrorAnalysis(String errorMessage) {
        return ResumeAnalysisDTO.builder()
                .totalExperienceYears(BigDecimal.ZERO)
                .totalCompaniesWorked(0)
                .currentCompany("Error")
                .currentPosition("Error")
                .skillsExtracted(Arrays.asList("Unable to extract"))
                .education(new ArrayList<>())
                .previousPositions(new ArrayList<>())
                .resumeScore(createDefaultScoring())
                .analysisMetadata(ResumeAnalysisDTO.AnalysisMetadataDTO.builder()
                        .processedAt(LocalDateTime.now())
                        .aiModelUsed("error")
                        .confidenceScore(BigDecimal.ZERO)
                        .processingTimeMs(0L)
                        .processingNotes(Arrays.asList("Error: " + errorMessage))
                        .build())
                .build();
    }
} 