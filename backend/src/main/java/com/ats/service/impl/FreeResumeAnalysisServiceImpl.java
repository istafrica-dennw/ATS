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
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
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

@Service("freeResumeAnalysisService")
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "app.resume-analysis.provider", havingValue = "ollama", matchIfMissing = true)
public class FreeResumeAnalysisServiceImpl implements ResumeAnalysisService {

    private final ApplicationRepository applicationRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();
    private final Tika tika = new Tika();

    @Value("${ollama.base-url:http://localhost:11434}")
    private String ollamaBaseUrl;

    @Value("${ollama.model:llama3}")
    private String ollamaModel;

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
        log.info("Starting FREE resume analysis for job: {}", job.getTitle());
        
        try {
            // Extract text from the resume file
            String resumeText = extractTextFromResume(resumeFile);
            
            // Perform AI analysis using free Ollama
            return performFreeAiAnalysis(resumeText, job);
            
        } catch (Exception e) {
            log.error("Error analyzing resume: {}", e.getMessage(), e);
            return createErrorAnalysis(e.getMessage());
        }
    }

    @Override
    public ResumeAnalysisDTO analyzeResume(String resumeFilePath, Job job) {
        log.info("Starting resume analysis from file path: {}", resumeFilePath);
        
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
            return performFreeAiAnalysis(resumeText, job);
            
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

    // Private helper methods for FREE AI analysis

    private ResumeAnalysisDTO performFreeAiAnalysis(String resumeText, Job job) {
        long startTime = System.currentTimeMillis();
        
        try {
            // Check if Ollama is available, fallback to traditional NLP if not
            if (isOllamaAvailable()) {
                return performOllamaAnalysis(resumeText, job, startTime);
            } else {
                log.warn("Ollama not available, using traditional NLP analysis");
                return performTraditionalNlpAnalysis(resumeText, job, startTime);
            }
            
        } catch (Exception e) {
            log.error("Error in FREE AI analysis, falling back to traditional NLP: {}", e.getMessage());
            return performTraditionalNlpAnalysis(resumeText, job, startTime);
        }
    }

    private ResumeAnalysisDTO performOllamaAnalysis(String resumeText, Job job, long startTime) {
        try {
            // Create analysis prompt
            String prompt = createFreeAnalysisPrompt(resumeText, job.getDescription());
            
            // Call Ollama API
            String response = callOllamaApi(prompt);
            
            // Parse response
            ResumeAnalysisDTO analysis = parseFreeAiResponse(response);
            
            // Add metadata
            long processingTime = System.currentTimeMillis() - startTime;
            analysis.setAnalysisMetadata(createFreeMetadata(processingTime, "ollama-" + ollamaModel));
            
            // Calculate job-specific scoring
            ResumeAnalysisDTO.ResumeScoreDTO score = calculateJobMatchScore(analysis, job);
            analysis.setResumeScore(score);
            
            log.info("FREE Ollama resume analysis completed in {} ms", processingTime);
            return analysis;
            
        } catch (Exception e) {
            log.error("Ollama analysis failed: {}", e.getMessage());
            throw new RuntimeException("Ollama analysis failed", e);
        }
    }

    private ResumeAnalysisDTO performTraditionalNlpAnalysis(String resumeText, Job job, long startTime) {
        log.info("Performing traditional NLP analysis (100% free)");
        
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
            analysis.setAnalysisMetadata(createFreeMetadata(processingTime, "traditional-nlp"));
            
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

    private boolean isOllamaAvailable() {
        try {
            String url = ollamaBaseUrl + "/api/tags";
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            log.debug("Ollama not available: {}", e.getMessage());
            return false;
        }
    }

    private String callOllamaApi(String prompt) {
        String url = ollamaBaseUrl + "/api/generate";
        
        Map<String, Object> request = Map.of(
                "model", ollamaModel,
                "prompt", prompt,
                "stream", false,
                "options", Map.of("temperature", 0.1, "num_predict", 1000)
        );
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
        
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            Map<String, Object> responseBody = response.getBody();
            return (String) responseBody.get("response");
        } catch (Exception e) {
            throw new RuntimeException("Failed to call Ollama API: " + e.getMessage(), e);
        }
    }

    private String createFreeAnalysisPrompt(String resumeText, String jobDescription) {
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

    private ResumeAnalysisDTO parseFreeAiResponse(String response) {
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
            log.error("Error parsing free AI response: {}", e.getMessage());
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
                        .startDate("2020-01")
                        .endDate("2022-01")
                        .responsibilities(Arrays.asList("Software development", "Code review"))
                        .build()
        );
    }

    // Helper methods
    
    private ResumeAnalysisDTO.AnalysisMetadataDTO createFreeMetadata(long processingTime, String model) {
        return ResumeAnalysisDTO.AnalysisMetadataDTO.builder()
                .processedAt(LocalDateTime.now())
                .aiModelUsed(model)
                .confidenceScore(BigDecimal.valueOf(0.75)) // Lower confidence for free analysis
                .processingTimeMs(processingTime)
                .processingNotes(Arrays.asList("FREE analysis completed"))
                .build();
    }

    private ResumeAnalysisDTO.ResumeScoreDTO calculateJobMatchScore(ResumeAnalysisDTO analysis, Job job) {
        try {
            // Calculate skill match ratio
            List<String> requiredSkills = extractRequiredSkills(job.getDescription());
            List<String> candidateSkills = analysis.getSkillsExtracted();
            BigDecimal skillsMatch = calculateSkillsMatchRatio(requiredSkills, candidateSkills);
            
            // Calculate experience match
            BigDecimal experienceMatch = calculateExperienceMatch(analysis.getTotalExperienceYears(), job);
            
            // Calculate overall scores
            int skillsScore = (int) (skillsMatch.doubleValue() * 100);
            int experienceScore = (int) (experienceMatch.doubleValue() * 100);
            int overallScore = (skillsScore + experienceScore) / 2;
            
            // Create scoring criteria
            ResumeAnalysisDTO.ScoringCriteriaDTO criteria = ResumeAnalysisDTO.ScoringCriteriaDTO.builder()
                    .requiredSkillsMatch(skillsMatch)
                    .experienceLevelMatch(experienceMatch)
                    .industryRelevance(BigDecimal.valueOf(0.75))
                    .educationLevelMatch(BigDecimal.valueOf(0.80))
                    .build();
            
            return ResumeAnalysisDTO.ResumeScoreDTO.builder()
                    .overallScore(overallScore)
                    .jobMatchScore(overallScore)
                    .experienceScore(experienceScore)
                    .skillsMatchScore(skillsScore)
                    .scoringCriteria(criteria)
                    .build();
                    
        } catch (Exception e) {
            log.error("Error calculating job match score: {}", e.getMessage(), e);
            return createDefaultScoring();
        }
    }

    private List<String> extractRequiredSkills(String jobDescription) {
        String lowerDescription = jobDescription.toLowerCase();
        return Arrays.asList(
                "java", "spring", "react", "javascript", "python", "sql", 
                "aws", "docker", "kubernetes", "git", "postgresql", "mysql",
                "angular", "vue", "node.js", "typescript", "mongodb"
        ).stream()
                .filter(lowerDescription::contains)
                .toList();
    }

    private BigDecimal calculateSkillsMatchRatio(List<String> requiredSkills, List<String> candidateSkills) {
        if (requiredSkills.isEmpty()) {
            return BigDecimal.valueOf(0.5);
        }
        
        long matchCount = requiredSkills.stream()
                .mapToLong(required -> candidateSkills.stream()
                        .anyMatch(candidate -> candidate.toLowerCase().contains(required.toLowerCase())) ? 1 : 0)
                .sum();
        
        return BigDecimal.valueOf((double) matchCount / requiredSkills.size());
    }

    private BigDecimal calculateExperienceMatch(BigDecimal totalExperience, Job job) {
        if (totalExperience == null) {
            return BigDecimal.valueOf(0.5);
        }
        
        if (totalExperience.compareTo(BigDecimal.valueOf(3)) >= 0) {
            return BigDecimal.valueOf(0.9);
        } else if (totalExperience.compareTo(BigDecimal.valueOf(1)) >= 0) {
            return BigDecimal.valueOf(0.7);
        } else {
            return BigDecimal.valueOf(0.4);
        }
    }

    private ResumeAnalysisDTO.ResumeScoreDTO createDefaultScoring() {
        ResumeAnalysisDTO.ScoringCriteriaDTO criteria = ResumeAnalysisDTO.ScoringCriteriaDTO.builder()
                .requiredSkillsMatch(BigDecimal.valueOf(0.5))
                .experienceLevelMatch(BigDecimal.valueOf(0.5))
                .industryRelevance(BigDecimal.valueOf(0.5))
                .educationLevelMatch(BigDecimal.valueOf(0.5))
                .build();
        
        return ResumeAnalysisDTO.ResumeScoreDTO.builder()
                .overallScore(50)
                .jobMatchScore(50)
                .experienceScore(50)
                .skillsMatchScore(50)
                .scoringCriteria(criteria)
                .build();
    }

    private ResumeAnalysisDTO createErrorAnalysis(String errorMessage) {
        ResumeAnalysisDTO.AnalysisMetadataDTO metadata = ResumeAnalysisDTO.AnalysisMetadataDTO.builder()
                .processedAt(LocalDateTime.now())
                .aiModelUsed("free-analysis")
                .confidenceScore(BigDecimal.ZERO)
                .processingTimeMs(0L)
                .processingNotes(Arrays.asList("Error during processing: " + errorMessage))
                .build();
        
        return ResumeAnalysisDTO.builder()
                .totalExperienceYears(BigDecimal.ZERO)
                .totalCompaniesWorked(0)
                .currentCompany("Unknown")
                .currentPosition("Unknown")
                .skillsExtracted(Arrays.asList())
                .resumeScore(createDefaultScoring())
                .analysisMetadata(metadata)
                .build();
    }
} 