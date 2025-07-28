#!/bin/bash

# GitHub Secrets Setup Script for ATS System
# ==========================================

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

# Check if GitHub CLI is installed
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI (gh) is not installed!"
        echo "Install it first:"
        echo "  macOS: brew install gh"
        echo "  Ubuntu: https://cli.github.com/manual/installation"
        echo "  Windows: winget install --id GitHub.cli"
        exit 1
    fi
    
    # Check if logged in
    if ! gh auth status &> /dev/null; then
        print_warning "You need to login to GitHub CLI first"
        echo "Run: gh auth login"
        exit 1
    fi
    
    print_success "GitHub CLI is ready!"
}

# Function to prompt for secret value
prompt_secret() {
    local secret_name=$1
    local description=$2
    local example=$3
    local is_multiline=$4
    
    echo ""
    print_info "Setting: $secret_name"
    echo "Description: $description"
    if [[ $example ]]; then
        echo "Example: $example"
    fi
    
    if [[ $is_multiline == "true" ]]; then
        echo "Enter the value (paste entire content, then press Ctrl+D):"
        local value=$(cat)
    else
        echo -n "Enter value: "
        read -r value
    fi
    
    if [[ -z "$value" ]]; then
        print_warning "Skipping $secret_name (empty value)"
        return
    fi
    
    # Set the secret
    echo "$value" | gh secret set "$secret_name"
    print_success "$secret_name set successfully!"
}

# Function to prompt for secret from file
prompt_secret_file() {
    local secret_name=$1
    local description=$2
    local file_pattern=$3
    
    echo ""
    print_info "Setting: $secret_name"
    echo "Description: $description"
    echo -n "Enter path to $file_pattern file: "
    read -r file_path
    
    if [[ ! -f "$file_path" ]]; then
        print_warning "File not found: $file_path. Skipping $secret_name"
        return
    fi
    
    gh secret set "$secret_name" < "$file_path"
    print_success "$secret_name set from file successfully!"
}

# Function to generate secure password
generate_password() {
    openssl rand -base64 24 | tr -d "=+/" | cut -c1-16
}

# Function to generate JWT secret
generate_jwt_secret() {
    openssl rand -base64 32
}

# Main setup function
setup_secrets() {
    echo "🚀 GitHub Secrets Setup for ATS System"
    echo "======================================"
    echo ""
    echo "This script will help you set up all required GitHub secrets."
    echo "You can skip any secret by pressing Enter without typing a value."
    echo ""
    
    print_warning "SECURITY NOTE: Never share these values or commit them to git!"
    echo ""
    
    read -p "Continue? (y/N): " confirm
    if [[ $confirm != [yY] ]]; then
        echo "Setup cancelled."
        exit 0
    fi
    
    # AWS Configuration
    echo ""
    print_info "=== AWS Configuration ==="
    prompt_secret "AWS_ACCESS_KEY_ID" "AWS IAM user access key" "AKIAIOSFODNN7EXAMPLE"
    prompt_secret "AWS_SECRET_ACCESS_KEY" "AWS IAM user secret key" "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
    prompt_secret "AWS_REGION" "AWS region for your EC2 instance" "us-east-1"
    prompt_secret "EC2_HOST" "Public IP address of your EC2 instance" "54.123.45.67"
    
    # SSH Key
    echo ""
    print_info "=== SSH Configuration ==="
    prompt_secret_file "EC2_SSH_KEY" "Private SSH key for EC2 access" "*.pem"
    
    # Application Configuration
    echo ""
    print_info "=== Application Configuration ==="
    
    # Generate secure passwords
    db_password=$(generate_password)
    jwt_secret=$(generate_jwt_secret)
    admin_password=$(generate_password)
    
    echo ""
    print_info "Generated secure passwords:"
    echo "Database password: $db_password"
    echo "JWT secret: $jwt_secret"
    echo "Admin password: $admin_password"
    echo ""
    print_warning "SAVE THESE PASSWORDS! You'll need the admin password to login."
    echo ""
    
    read -p "Use generated passwords? (Y/n): " use_generated
    if [[ $use_generated == [nN] ]]; then
        prompt_secret "POSTGRES_PASSWORD" "Database password" "$db_password"
        prompt_secret "JWT_SECRET" "JWT signing secret" "$jwt_secret"
        prompt_secret "ADMIN_PASSWORD" "Admin user password" "$admin_password"
    else
        echo "$db_password" | gh secret set "POSTGRES_PASSWORD"
        echo "$jwt_secret" | gh secret set "JWT_SECRET"
        echo "$admin_password" | gh secret set "ADMIN_PASSWORD"
        print_success "Generated passwords set successfully!"
    fi
    
    # Email Configuration
    echo ""
    print_info "=== Email Configuration (Optional) ==="
    prompt_secret "MAIL_USERNAME" "SMTP username (Gmail address)" "your-email@gmail.com"
    prompt_secret "MAIL_PASSWORD" "SMTP password (Gmail app password)" "your-gmail-app-password"
    prompt_secret "MAIL_FROM" "From email address" "noreply@istafrica.com"
    
    # OAuth Configuration
    echo ""
    print_info "=== LinkedIn OAuth (Optional) ==="
    prompt_secret "LINKEDIN_CLIENT_ID" "LinkedIn app client ID" "your-linkedin-client-id"
    prompt_secret "LINKEDIN_CLIENT_SECRET" "LinkedIn app client secret" "your-linkedin-client-secret"
    
    # AI Configuration
    echo ""
    print_info "=== AI Configuration (Optional) ==="
    prompt_secret "GEMINI_API_KEY" "Google Gemini API key"
}

# Show final summary
show_summary() {
    echo ""
    print_success "🎉 GitHub Secrets Setup Complete!"
    echo ""
    echo "📋 Summary of configured secrets:"
    gh secret list
    
    echo ""
    print_info "Next Steps:"
    echo "1. Go to your GitHub repository"
    echo "2. Navigate to Actions tab"
    echo "3. Run the 'Deploy ATS to AWS EC2' workflow"
    echo "4. Your application will be deployed automatically!"
    
    echo ""
    print_warning "Important Notes:"
    echo "- Save your admin password: Use it to login at http://your-ec2-ip:80"
    echo "- Never commit secrets to your repository"
    echo "- Rotate secrets regularly for security"
}

# Main execution
main() {
    check_gh_cli
    setup_secrets
    show_summary
}

# Run the script
main "$@" 