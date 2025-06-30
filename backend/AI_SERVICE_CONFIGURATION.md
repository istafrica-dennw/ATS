# Generic AI Service Configuration Guide

The Resume Analysis service has been updated to be **generic** and can work with multiple AI providers including Ollama, OpenAI, Claude, and any REST-based AI service.

## Overview

The generic AI service supports:
- **Multiple AI Providers**: Ollama, OpenAI, Claude, or any custom REST API
- **Flexible Authentication**: Bearer tokens, API keys, custom headers, or no auth
- **Configurable Request/Response Formats**: Different providers use different API structures
- **Automatic Fallback**: Falls back to traditional NLP when AI service is unavailable

## Configuration Properties

### Basic Configuration
```properties
# Enable generic provider
app.resume-analysis.provider=generic

# Provider-specific settings
ai.service.provider=ollama                    # Provider name (for logging)
ai.service.base-url=http://localhost:11434   # Base URL
ai.service.model=llama3                       # Model name
ai.service.request-format=ollama              # Request format: ollama, openai, claude
```

### Authentication Settings
```properties
ai.service.auth-type=none                     # none, bearer, api-key, custom
ai.service.api-key=                           # API key (if required)
ai.service.auth-header=Authorization          # Header name for custom auth
```

### Endpoint Configuration
```properties
ai.service.generation-endpoint=/api/generate  # Text generation endpoint
ai.service.health-endpoint=/api/tags          # Health check endpoint
ai.service.response-field=response            # Response field containing text
```

### Model Parameters
```properties
ai.service.max-tokens=1000                    # Maximum tokens to generate
ai.service.temperature=0.1                    # Temperature for generation
```

## Provider-Specific Configurations

### 1. Ollama (Local/Remote)

**Local Ollama:**
```properties
ai.service.provider=ollama
ai.service.base-url=http://localhost:11434
ai.service.model=llama3
ai.service.auth-type=none
ai.service.request-format=ollama
ai.service.generation-endpoint=/api/generate
ai.service.health-endpoint=/api/tags
ai.service.response-field=response
```

**Remote Ollama (Public IP):**
```properties
ai.service.provider=ollama
ai.service.base-url=http://your-server-ip:11434
ai.service.model=llama3
ai.service.auth-type=none
ai.service.request-format=ollama
```

### 2. OpenAI GPT

```properties
ai.service.provider=openai
ai.service.base-url=https://api.openai.com
ai.service.model=gpt-4
ai.service.api-key=sk-your-openai-api-key
ai.service.auth-type=bearer
ai.service.request-format=openai
ai.service.generation-endpoint=/v1/chat/completions
ai.service.health-endpoint=/v1/models
ai.service.response-field=choices
```

### 3. Anthropic Claude

```properties
ai.service.provider=claude
ai.service.base-url=https://api.anthropic.com
ai.service.model=claude-3-sonnet-20240229
ai.service.api-key=your-claude-api-key
ai.service.auth-type=api-key
ai.service.auth-header=x-api-key
ai.service.request-format=claude
ai.service.generation-endpoint=/v1/messages
ai.service.health-endpoint=/v1/messages
ai.service.response-field=content
```

### 4. Google Gemini

```properties
ai.service.provider=gemini
ai.service.base-url=https://generativelanguage.googleapis.com
ai.service.model=gemini-pro
ai.service.api-key=your-gemini-api-key
ai.service.auth-type=api-key
ai.service.auth-header=x-goog-api-key
ai.service.request-format=generic
ai.service.generation-endpoint=/v1/models/gemini-pro:generateContent
```

### 5. Custom AI Service

```properties
ai.service.provider=custom
ai.service.base-url=https://your-ai-service.com
ai.service.model=your-model
ai.service.api-key=your-api-key
ai.service.auth-type=bearer
ai.service.request-format=openai  # Use existing format or implement custom
ai.service.generation-endpoint=/your-endpoint
ai.service.response-field=your-response-field
```

## Environment Variables

You can use environment variables for sensitive data:

```bash
# Ollama
export AI_PROVIDER=ollama
export AI_BASE_URL=http://ollama:11434
export AI_MODEL=llama3

# OpenAI
export AI_PROVIDER=openai
export AI_BASE_URL=https://api.openai.com
export AI_MODEL=gpt-4
export AI_API_KEY=sk-your-key
export AI_AUTH_TYPE=bearer
export AI_REQUEST_FORMAT=openai
export AI_GENERATION_ENDPOINT=/v1/chat/completions

# Claude
export AI_PROVIDER=claude
export AI_BASE_URL=https://api.anthropic.com
export AI_MODEL=claude-3-sonnet-20240229
export AI_API_KEY=your-claude-key
export AI_AUTH_TYPE=api-key
export AI_AUTH_HEADER=x-api-key
export AI_REQUEST_FORMAT=claude
```

## Docker Compose Configuration

### With Ollama (Local)
```yaml
services:
  ats-backend:
    environment:
      - AI_PROVIDER=ollama
      - AI_BASE_URL=http://ollama:11434
      - AI_MODEL=llama3
      - AI_AUTH_TYPE=none
      - AI_REQUEST_FORMAT=ollama
  
  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
```

### With OpenAI
```yaml
services:
  ats-backend:
    environment:
      - AI_PROVIDER=openai
      - AI_BASE_URL=https://api.openai.com
      - AI_MODEL=gpt-4
      - AI_API_KEY=${OPENAI_API_KEY}
      - AI_AUTH_TYPE=bearer
      - AI_REQUEST_FORMAT=openai
      - AI_GENERATION_ENDPOINT=/v1/chat/completions
```

## Request/Response Formats

The service automatically formats requests based on the `ai.service.request-format` setting:

### Ollama Format
```json
{
  "model": "llama3",
  "prompt": "Analyze this resume...",
  "stream": false,
  "options": {
    "temperature": 0.1,
    "num_predict": 1000
  }
}
```

### OpenAI Format
```json
{
  "model": "gpt-4",
  "messages": [
    {"role": "user", "content": "Analyze this resume..."}
  ],
  "temperature": 0.1,
  "max_tokens": 1000
}
```

### Claude Format
```json
{
  "model": "claude-3-sonnet-20240229",
  "messages": [
    {"role": "user", "content": "Analyze this resume..."}
  ],
  "temperature": 0.1,
  "max_tokens": 1000
}
```

## Authentication Methods

### Bearer Token (OpenAI, many APIs)
```
Authorization: Bearer sk-your-api-key
```

### API Key Header (Claude, Gemini)
```
x-api-key: your-api-key
```

### Custom Header
```properties
ai.service.auth-type=custom
ai.service.auth-header=X-Custom-Auth
ai.service.api-key=your-custom-key
```

## Fallback Behavior

When the AI service is unavailable, the system automatically falls back to:
1. **Traditional NLP Analysis**: Uses regex patterns and keyword matching
2. **Error Handling**: Graceful degradation with meaningful error messages
3. **Retry Logic**: Built-in retry for transient failures

## Testing Your Configuration

1. **Check Service Health**: The service automatically tests connectivity using the health endpoint
2. **View Logs**: Check application logs for AI service connection status
3. **Test Analysis**: Upload a resume to trigger analysis and verify results

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if `ai.service.base-url` is correct
   - Verify the AI service is running and accessible

2. **Authentication Failed**
   - Verify `ai.service.api-key` is correct
   - Check `ai.service.auth-type` matches the provider requirements

3. **Invalid Response Format**
   - Ensure `ai.service.request-format` matches your provider
   - Check `ai.service.response-field` is correct for your provider

4. **Model Not Found**
   - Verify `ai.service.model` exists on your provider
   - For Ollama, run `ollama list` to see available models

### Debug Mode

Enable debug logging to see detailed AI service interactions:

```properties
logging.level.com.ats.service.impl.FreeResumeAnalysisServiceImpl=DEBUG
```

## Performance Considerations

- **Response Times**: AI services can take 2-10 seconds per analysis
- **Rate Limits**: Consider API rate limits for cloud providers
- **Costs**: Monitor usage costs for paid AI services
- **Concurrency**: Adjust thread pool size for high-volume scenarios

## Security

- **API Keys**: Never commit API keys to version control
- **Environment Variables**: Use environment variables for sensitive data
- **Network Security**: Secure communication between services
- **Data Privacy**: Be aware of data processing policies for cloud AI services 