# Custom Ollama image with automatic phi3 model download
FROM ollama/ollama:latest

# Set environment variables
ENV OLLAMA_HOST=0.0.0.0

# Create entrypoint script that downloads model on first run
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose the default Ollama port
EXPOSE 11434

# Use our custom entrypoint
ENTRYPOINT ["/entrypoint.sh"] 