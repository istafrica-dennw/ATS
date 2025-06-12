#!/bin/bash

echo "🚀 Deploying ATS System to Local Kubernetes"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Kubernetes is running
print_status "Checking Kubernetes cluster..."
if ! kubectl cluster-info &> /dev/null; then
    print_error "Kubernetes cluster is not running!"
    print_warning "Please enable Kubernetes in Docker Desktop:"
    echo "  1. Open Docker Desktop"
    echo "  2. Go to Settings > Kubernetes"
    echo "  3. Enable Kubernetes"
    echo "  4. Apply & Restart"
    exit 1
fi

print_success "Kubernetes cluster is running"

# Stop Docker Compose if running
print_status "Stopping Docker Compose (if running)..."
docker-compose down 2>/dev/null || true

# Build Docker images
print_status "Building Docker images..."

# Build Ollama image
print_status "Building Ollama image..."
docker build -t ats-ollama:local ./ollama/
if [ $? -eq 0 ]; then
    print_success "Ollama image built successfully"
else
    print_error "Failed to build Ollama image"
    exit 1
fi

# Build Backend image
print_status "Building Backend image..."
docker build -t ats-backend:local ./backend/
if [ $? -eq 0 ]; then
    print_success "Backend image built successfully"
else
    print_error "Failed to build Backend image"
    exit 1
fi

# Build Frontend image
print_status "Building Frontend image..."
docker build -t ats-frontend:local -f ./frontend/Dockerfile.dev ./frontend/
if [ $? -eq 0 ]; then
    print_success "Frontend image built successfully"
else
    print_error "Failed to build Frontend image"
    exit 1
fi

# Deploy to Kubernetes
print_status "Deploying to Kubernetes..."

# Apply manifests in order
kubectl apply -f k8s-local/namespace.yaml
kubectl apply -f k8s-local/configmap-secrets.yaml
kubectl apply -f k8s-local/postgres-deployment.yaml
kubectl apply -f k8s-local/ollama-deployment.yaml
kubectl apply -f k8s-local/backend-deployment.yaml
kubectl apply -f k8s-local/frontend-deployment.yaml

print_success "Kubernetes manifests applied"

# Wait for deployments
print_status "Waiting for deployments to be ready..."

# Wait for PostgreSQL
print_status "Waiting for PostgreSQL..."
kubectl wait --for=condition=ready pod -l app=postgres -n ats-system --timeout=300s

# Wait for Ollama (this takes longer due to model download)
print_status "Waiting for Ollama (this may take several minutes for model download)..."
kubectl wait --for=condition=ready pod -l app=ollama -n ats-system --timeout=600s

# Wait for Backend
print_status "Waiting for Backend..."
kubectl wait --for=condition=ready pod -l app=backend -n ats-system --timeout=300s

# Wait for Frontend
print_status "Waiting for Frontend..."
kubectl wait --for=condition=ready pod -l app=frontend -n ats-system --timeout=300s

print_success "All deployments are ready!"

# Show access information
echo ""
echo "🎉 ATS System is now running on Kubernetes!"
echo ""
echo "📋 Access Information:"
echo "  Frontend: http://localhost:30001"
echo "  Backend API: http://localhost:30080"
echo "  WebSocket: http://localhost:30092"
echo ""
echo "🔧 Useful Commands:"
echo "  View pods: kubectl get pods -n ats-system"
echo "  View services: kubectl get services -n ats-system"
echo "  View logs: kubectl logs -f deployment/[service-name] -n ats-system"
echo "  Delete deployment: kubectl delete namespace ats-system"
echo ""
echo "📊 Resource Usage:"
kubectl top pods -n ats-system 2>/dev/null || echo "  (Install metrics-server to see resource usage)" 