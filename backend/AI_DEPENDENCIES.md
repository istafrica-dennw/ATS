# AI Resume Analysis Dependencies

## Required Maven Dependencies

Add these dependencies to your `pom.xml`:

```xml
<!-- LangChain4j for AI integration -->
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-spring-boot-starter</artifactId>
    <version>0.25.0</version>
</dependency>

<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-open-ai</artifactId>
    <version>0.25.0</version>
</dependency>

<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-document-parser-apache-tika</artifactId>
    <version>0.25.0</version>
</dependency>

<!-- Apache Tika for document parsing -->
<dependency>
    <groupId>org.apache.tika</groupId>
    <artifactId>tika-core</artifactId>
    <version>2.9.1</version>
</dependency>

<dependency>
    <groupId>org.apache.tika</groupId>
    <artifactId>tika-parsers-standard-package</artifactId>
    <version>2.9.1</version>
</dependency>

<!-- JSON processing for resume analysis data -->
<dependency>
    <groupId>io.hypersistence</groupId>
    <artifactId>hypersistence-utils-hibernate-62</artifactId>
    <version>3.6.0</version>
</dependency>

<!-- Async processing -->
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-context</artifactId>
</dependency>
```

## Configuration Properties

Add these to your `application.properties`:

```properties
# OpenAI Configuration
langchain4j.open-ai.chat-model.api-key=${OPENAI_API_KEY}
langchain4j.open-ai.chat-model.model-name=gpt-4
langchain4j.open-ai.chat-model.temperature=0.1
langchain4j.open-ai.chat-model.max-tokens=2000

# Resume Analysis Configuration
app.resume-analysis.enabled=true
app.resume-analysis.async-processing=true
app.resume-analysis.max-file-size=10MB
app.resume-analysis.supported-formats=pdf,doc,docx,txt
app.resume-analysis.cache-results=true
```

## Environment Variables Required

```bash
OPENAI_API_KEY=your-openai-api-key-here
```

## Alternative AI Providers

### Azure OpenAI (Enterprise Option)
```xml
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-azure-open-ai</artifactId>
    <version>0.25.0</version>
</dependency>
```

### Google Vertex AI
```xml
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-vertex-ai-gemini</artifactId>
    <version>0.25.0</version>
</dependency>
```

## Cost Considerations

- **OpenAI GPT-4**: ~$0.03 per 1K tokens input, ~$0.06 per 1K tokens output
- **Average resume analysis**: ~2K tokens input + 1K tokens output = ~$0.12 per resume
- **Monthly cost estimate**: 1000 resumes = ~$120/month

## Processing Time Estimates

- **PDF text extraction**: 1-3 seconds
- **AI analysis**: 3-8 seconds
- **Total per resume**: 4-11 seconds
- **Recommended**: Use async processing for better user experience 

## Environment Variables Required

Add these environment variables to your `.env` file:

```bash
# OpenAI API Key for resume analysis
OPENAI_API_KEY=your_openai_api_key_here

# Directory for uploaded files
UPLOADS_DIRECTORY=uploads
```

## Cost Estimation

- **OpenAI GPT-4**: ~$0.03 per 1K tokens input, ~$0.06 per 1K tokens output
- **Average resume analysis**: ~2K tokens input + 1K tokens output = ~$0.12 per resume
- **Monthly cost for 100 resumes**: ~$12

## Features Enabled

1. **AI-powered resume parsing** - Extract structured data from PDF/DOC files
2. **Job matching scores** - Calculate compatibility between resume and job requirements
3. **Skills extraction** - Identify technical and soft skills automatically
4. **Experience calculation** - Calculate total years of experience avoiding overlaps
5. **Async processing** - Non-blocking resume analysis
6. **Error handling** - Graceful fallbacks for analysis failures

## API Endpoints

- `POST /api/resume-analysis/analyze` - Analyze uploaded resume file
- `POST /api/resume-analysis/analyze-async` - Start async analysis
- `POST /api/resume-analysis/applications/{id}/analyze` - Analyze application resume
- `GET /api/resume-analysis/applications/{id}` - Get analysis results
- `POST /api/resume-analysis/rescore` - Re-score for different job 