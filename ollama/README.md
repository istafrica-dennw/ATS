# Custom Ollama Docker Setup

This directory contains a custom Ollama Docker image that automatically downloads the `phi3` model on first startup.

## 🚀 **What it does:**

1. **Starts Ollama service** on container startup
2. **Checks for phi3 model** existence  
3. **Downloads phi3 automatically** if not present (2.3GB, ~2-5 minutes on first run)
4. **Ready to use** - no manual setup needed!

## 📁 **Files:**

- `Dockerfile` - Custom image extending `ollama/ollama:latest`
- `entrypoint.sh` - Smart startup script with automatic model download
- `README.md` - This file

## 🔧 **Usage:**

### **Start with Docker Compose (Recommended):**
```bash
# Single command - everything automatic!
docker-compose up --build
```

### **First Startup Output:**
```
🚀 Starting Ollama with automatic phi3 setup...
⏳ Waiting for Ollama to be ready...
✅ Ollama is ready!
🔍 Checking for phi3 model...
📥 Downloading phi3 model (2.3GB)...
   This will take a few minutes on first startup...
✅ phi3 model downloaded successfully!
🎉 Ollama setup complete!
```

### **Subsequent Startups:**
```
🚀 Starting Ollama with automatic phi3 setup...
⏳ Waiting for Ollama to be ready...
✅ Ollama is ready!
🔍 Checking for phi3 model...
✅ phi3 model already exists
🎉 Ollama setup complete!
```

## 🎯 **Benefits:**

- ✅ **Zero manual setup** - just run `docker-compose up --build`
- ✅ **Smart caching** - model downloads only once
- ✅ **Fast restarts** - subsequent startups are quick
- ✅ **Persistent storage** - models saved in Docker volume
- ✅ **Graceful shutdown** - proper signal handling

## 🔄 **Adding More Models:**

```bash
# Add more models anytime
docker exec ats-ollama ollama pull llama3
docker exec ats-ollama ollama pull codellama

# List available models  
docker exec ats-ollama ollama list

# Test a model
docker exec ats-ollama ollama run phi3 "Hello world"
```

## 🐛 **Troubleshooting:**

```bash
# View Ollama logs
docker logs ats-ollama

# Check if model exists
docker exec ats-ollama ollama list

# Manually download model if needed
docker exec ats-ollama ollama pull phi3

# Test Ollama API
curl http://localhost:11434/api/tags
```

## 🔧 **Changing Default Model:**

To use a different model by default, edit `entrypoint.sh` and change `phi3` to your preferred model (e.g., `llama3`, `codellama`, `mistral`). 