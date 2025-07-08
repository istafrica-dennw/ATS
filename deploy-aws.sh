#!/bin/bash

# AWS EC2 Deployment Script for ATS System (4GB RAM Optimized)
# ================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
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

# Check if running on EC2
check_ec2_instance() {
    print_info "Checking if running on EC2..."
    
    # Check if running on Ubuntu
    if ! grep -q "Ubuntu" /etc/os-release; then
        print_error "This script is designed for Ubuntu. Current OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'=' -f2)"
        print_info "For Amazon Linux, use 'yum' instead of 'apt' commands"
        exit 1
    fi
    
    if curl -s --connect-timeout 5 http://169.254.169.254/latest/meta-data/instance-id > /dev/null; then
        INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
        INSTANCE_TYPE=$(curl -s http://169.254.169.254/latest/meta-data/instance-type)
        PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
        
        print_success "Running on EC2 Ubuntu instance: $INSTANCE_ID ($INSTANCE_TYPE)"
        print_info "Public IP: $PUBLIC_IP"
        
        # Check if instance has enough memory
        TOTAL_RAM=$(free -m | awk 'NR==2{print $2}')
        if [ "$TOTAL_RAM" -lt 3500 ]; then
            print_error "Instance has only ${TOTAL_RAM}MB RAM. Minimum 4GB (3500MB) required."
            exit 1
        fi
        
        print_success "Memory check passed: ${TOTAL_RAM}MB RAM available"
    else
        print_warning "Not running on EC2 (local Ubuntu deployment)"
    fi
}

# Install Docker if not present
install_docker() {
    if ! command -v docker &> /dev/null; then
        print_info "Installing Docker..."
        
        # Update system
        sudo apt update -y
        
        # Install required packages
        sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
        
        # Add Docker's official GPG key
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        
        # Add Docker repository
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        
        # Update package database
        sudo apt update -y
        
        # Install Docker
        sudo apt install -y docker-ce docker-ce-cli containerd.io
        
        # Start and enable Docker
        sudo systemctl start docker
        sudo systemctl enable docker
        
        # Add ubuntu user to docker group
        sudo usermod -aG docker ubuntu
        
        print_success "Docker installed successfully"
        print_warning "Please log out and log back in for docker group changes to take effect"
    else
        print_success "Docker already installed"
    fi
}

# Install Docker Compose if not present
install_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_info "Installing Docker Compose..."
        
        # Get the latest version
        COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d'"' -f4)
        
        # Download and install Docker Compose
        sudo curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        
        # Make it executable
        sudo chmod +x /usr/local/bin/docker-compose
        
        # Create symlink for global access
        sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
        
        # Verify installation
        if docker-compose --version; then
            print_success "Docker Compose installed successfully"
        else
            print_error "Docker Compose installation failed"
            exit 1
        fi
    else
        print_success "Docker Compose already installed"
    fi
}

# Setup environment variables
setup_environment() {
    print_info "Setting up environment variables..."
    
    # Check if .env exists
    if [ ! -f .env ]; then
        print_info "Creating .env file..."
        
        # Generate secure passwords
        JWT_SECRET=$(openssl rand -base64 32)
        POSTGRES_PASSWORD=$(openssl rand -base64 16)
        SPRING_SECURITY_PASSWORD=$(openssl rand -base64 12)
        
        cat > .env << EOF
# Database Configuration
POSTGRES_DB=ats_db
POSTGRES_USER=ats_user
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/ats_db

# Security Configuration
JWT_SECRET=$JWT_SECRET
SPRING_SECURITY_USER_NAME=admin
SPRING_SECURITY_USER_PASSWORD=$SPRING_SECURITY_PASSWORD
SPRING_SECURITY_USER_ROLES=ADMIN

# Email Configuration (Update with your SMTP details)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=your-email@gmail.com

# OAuth Configuration (Update with your LinkedIn app details)
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# Gemini AI Configuration
AI_PROVIDER=gemini
AI_BASE_URL=https://generativelanguage.googleapis.com
AI_MODEL=gemini-1.5-flash
AI_API_KEY=your-gemini-api-key
AI_AUTH_TYPE=api-key
AI_AUTH_HEADER=x-goog-api-key
AI_REQUEST_FORMAT=gemini
AI_GENERATION_ENDPOINT=/v1beta/models/gemini-1.5-flash:generateContent
AI_HEALTH_ENDPOINT=/v1beta/models
AI_RESPONSE_FIELD=candidates
AI_MAX_TOKENS=1000
AI_TEMPERATURE=0.1

# Application Configuration
REACT_APP_API_URL=http://localhost:8080
REACT_APP_SOCKET_URL=http://localhost:9092
UPLOADS_DIRECTORY=uploads
EOF
        
        print_success ".env file created with secure defaults"
        print_warning "Please update .env file with your actual credentials before deployment"
    else
        print_success ".env file already exists"
    fi
}

# Deploy application
deploy_application() {
    print_info "Deploying ATS application..."
    
    # Stop any existing containers
    docker-compose -f docker-compose.aws.yml down 2>/dev/null || true
    
    # Clean up unused resources
    docker system prune -f
    
    # Deploy with AWS-optimized configuration
    print_info "Starting services with memory optimization..."
    docker-compose -f docker-compose.aws.yml up -d --build
    
    # Wait for services to be healthy
    print_info "Waiting for services to be ready..."
    
    # Check PostgreSQL
    echo -n "Waiting for PostgreSQL: "
    until docker exec ats-postgres-aws pg_isready -U ats_user -d ats_db 2>/dev/null; do
        echo -n "."
        sleep 2
    done
    echo " ✓"
    
    # Check Backend
    echo -n "Waiting for Backend: "
    until curl -s http://localhost:8080/actuator/health > /dev/null; do
        echo -n "."
        sleep 5
    done
    echo " ✓"
    
    # Check Frontend
    echo -n "Waiting for Frontend: "
    until curl -s http://localhost:3001 > /dev/null; do
        echo -n "."
        sleep 3
    done
    echo " ✓"
    
    print_success "All services are running!"
}

# Monitor memory usage
monitor_memory() {
    print_info "Memory usage monitoring:"
    
    echo "System Memory:"
    free -h
    
    echo ""
    echo "Container Memory Usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
    
    echo ""
    echo "Disk Usage:"
    df -h / /var/lib/docker
}

# Show deployment summary
show_deployment_summary() {
    echo ""
    echo "🎉 AWS Deployment Complete!"
    echo "=========================="
    
    if [ ! -z "$PUBLIC_IP" ]; then
        echo "🌐 Public Access URLs:"
        echo "  Frontend: http://$PUBLIC_IP:3001"
        echo "  Backend API: http://$PUBLIC_IP:8080"
        echo "  API Documentation: http://$PUBLIC_IP:8080/swagger-ui.html"
    else
        echo "🌐 Local Access URLs:"
        echo "  Frontend: http://localhost:3001"
        echo "  Backend API: http://localhost:8080"
        echo "  API Documentation: http://localhost:8080/swagger-ui.html"
    fi
    
    echo ""
    echo "👤 Default Admin Account:"
    echo "  Username: admin"
    echo "  Password: $(grep SPRING_SECURITY_USER_PASSWORD .env | cut -d'=' -f2)"
    
    echo ""
    echo "🔧 Management Commands:"
    echo "  View logs: docker-compose -f docker-compose.aws.yml logs -f"
    echo "  Stop services: docker-compose -f docker-compose.aws.yml down"
    echo "  Restart services: docker-compose -f docker-compose.aws.yml restart"
    echo "  Monitor memory: docker stats"
    
    echo ""
    echo "📊 Current Resource Usage:"
    monitor_memory
}

# Main execution
main() {
    echo "🚀 AWS EC2 Deployment Script for ATS System"
    echo "============================================="
    
    check_ec2_instance
    install_docker
    install_docker_compose
    setup_environment
    deploy_application
    show_deployment_summary
    
    echo ""
    print_success "Deployment completed successfully!"
    print_info "The application is optimized for 4GB RAM and uses Gemini AI for resume analysis."
}

# Handle script interruption
trap 'echo ""; print_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@" 