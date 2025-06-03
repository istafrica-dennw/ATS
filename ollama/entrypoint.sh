#!/bin/bash

echo "🚀 Starting Ollama with automatic phi3 setup..."

# Start Ollama in the background
ollama serve &
OLLAMA_PID=$!

# Function to cleanup on exit
cleanup() {
    echo "🛑 Shutting down Ollama..."
    kill $OLLAMA_PID 2>/dev/null
    wait $OLLAMA_PID 2>/dev/null
    exit 0
}

# Setup signal handlers
trap cleanup SIGTERM SIGINT

# Wait for Ollama to be ready
echo "⏳ Waiting for Ollama to be ready..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    # Use ollama list command to check if service is ready
    if ollama list >/dev/null 2>&1; then
        echo "✅ Ollama is ready!"
        break
    fi
    attempt=$((attempt + 1))
    echo "   Attempt $attempt/$max_attempts..."
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo "❌ Ollama failed to start after $((max_attempts * 2)) seconds"
    echo "🔍 Checking if Ollama process is running..."
    if kill -0 $OLLAMA_PID 2>/dev/null; then
        echo "✅ Ollama process is running, continuing anyway..."
    else
        echo "❌ Ollama process has died"
        exit 1
    fi
fi

# Check if phi3 model exists
echo "🔍 Checking for phi3 model..."
if ollama list | grep -q "phi3"; then
    echo "✅ phi3 model already exists"
else
    echo "📥 Downloading phi3 model (2.3GB)..."
    echo "   This will take a few minutes on first startup..."
    
    if ollama pull phi3; then
        echo "✅ phi3 model downloaded successfully!"
    else
        echo "❌ Failed to download phi3 model"
        echo "💡 You can manually download it later with: docker exec ats-ollama ollama pull phi3"
    fi
fi

echo "🎉 Ollama setup complete!"
echo "📋 Available models:"
ollama list

# Keep the script running and forward signals to Ollama
wait $OLLAMA_PID 