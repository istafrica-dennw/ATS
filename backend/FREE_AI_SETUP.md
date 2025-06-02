# FREE AI Resume Analysis Setup

## 🆓 **100% Free Options Available**

### **Option 1: Ollama (Recommended) - Completely Free**

Ollama runs powerful LLMs locally on your machine with **zero cost**.

#### **Installation**

1. **Install Ollama**:
   ```bash
   # On macOS
   brew install ollama
   
   # On Linux
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # On Windows
   # Download from https://ollama.ai/download
   ```

2. **Pull a model**:
   ```bash
   # Recommended models (pick one)
   ollama pull llama3        # 4.7GB - Best balance
   ollama pull codellama     # 3.8GB - Good for technical resumes
   ollama pull mistral       # 4.1GB - Alternative option
   ollama pull phi3          # 2.3GB - Lightweight option
   ```

3. **Start Ollama**:
   ```bash
   ollama serve
   ```

4. **Configure your app**:
   ```properties
   # In application.properties
   app.resume-analysis.provider=ollama
   ollama.base-url=http://localhost:11434
   ollama.model=llama3
   ```

**✅ Cost: $0 forever**  
**✅ Privacy: Data never leaves your machine**  
**✅ Performance: 3-8 seconds per resume**

---

### **Option 2: Traditional NLP (Fallback) - Also Free**

If Ollama isn't available, the system automatically falls back to traditional NLP.

**Features**:
- ✅ Experience years extraction
- ✅ Company counting
- ✅ Skills matching
- ✅ Education parsing
- ✅ Basic scoring

**✅ Cost: $0 forever**  
**✅ No setup required**  
**⚠️ Lower accuracy than AI models**

---

### **Option 3: Google Gemini (Free Tier)**

Google offers generous free tier for Gemini API.

#### **Setup**

1. **Get API Key**:
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create free API key
   - **Free tier**: 60 requests/minute

2. **Add dependency**:
   ```xml
   <dependency>
       <groupId>dev.langchain4j</groupId>
       <artifactId>langchain4j-vertex-ai-gemini</artifactId>
       <version>0.25.0</version>
   </dependency>
   ```

3. **Configure**:
   ```properties
   app.resume-analysis.provider=gemini
   google.ai.api-key=${GOOGLE_AI_API_KEY}
   ```

**✅ Cost: Free tier (15 requests/minute)**  
**✅ Cloud-based (no local setup)**  
**⚠️ Rate limited**

---

## **Comparison Table**

| Option | Cost | Setup | Accuracy | Privacy | Speed |
|--------|------|-------|----------|---------|-------|
| **Ollama** | $0 | Medium | High | 100% | Fast |
| **Traditional NLP** | $0 | None | Medium | 100% | Very Fast |
| **Google Gemini** | $0* | Easy | High | Cloud | Fast |
| **OpenAI GPT-4** | $0.12/resume | Easy | Highest | Cloud | Fast |

*Free tier has limits

---

## **Recommended Setup**

### **For Development/Testing**
```bash
# Install Ollama
brew install ollama

# Pull lightweight model
ollama pull phi3

# Start service
ollama serve
```

### **For Production**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull production model
ollama pull llama3

# Create systemd service (Linux)
sudo systemctl enable ollama
sudo systemctl start ollama
```

### **Docker Setup**
```yaml
version: '3.8'
services:
  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    environment:
      - OLLAMA_HOST=0.0.0.0
      
  ats-backend:
    # ... your app config
    environment:
      - OLLAMA_BASE_URL=http://ollama:11434
      - OLLAMA_MODEL=llama3
      
volumes:
  ollama_data:
```

---

## **Performance Comparison**

| Model | Size | RAM Usage | Speed | Quality |
|-------|------|-----------|-------|---------|
| `phi3` | 2.3GB | 4GB | ~2s | Good |
| `llama3` | 4.7GB | 8GB | ~4s | Excellent |
| `codellama` | 3.8GB | 6GB | ~3s | Great for tech |
| `mistral` | 4.1GB | 6GB | ~3s | Very Good |

---

## **Environment Variables**

```bash
# .env file
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
UPLOADS_DIRECTORY=uploads

# Optional (for premium features)
OPENAI_API_KEY=
GOOGLE_AI_API_KEY=
```

---

## **Testing Your Setup**

```bash
# Test Ollama is running
curl http://localhost:11434/api/tags

# Test model is available
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model":"llama3","prompt":"Hello","stream":false}'
```

---

## **Switching Between Options**

Change provider in `application.properties`:

```properties
# Option 1: Free Ollama
app.resume-analysis.provider=ollama

# Option 2: Free Traditional NLP (always works)
app.resume-analysis.provider=traditional

# Option 3: Premium OpenAI (costs money)
app.resume-analysis.provider=openai
```

**The system automatically falls back to traditional NLP if the selected provider fails!** 