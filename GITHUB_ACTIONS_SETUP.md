# GitHub Actions CI/CD Pipeline Setup Guide

## 🚀 **Overview**

This guide will help you set up a fully automated CI/CD pipeline that deploys your ATS system to AWS EC2 Ubuntu instances using GitHub Actions.

## 📋 **Pipeline Features**

✅ **Automated Testing** - Runs backend (Maven) and frontend (npm) tests  
✅ **Manual & Automatic Deployment** - Deploy on push to main or manually trigger  
✅ **Environment Support** - Production and staging environments  
✅ **Security** - All credentials stored as GitHub Secrets  
✅ **Health Checks** - Verifies deployment success  
✅ **Resource Monitoring** - Shows memory and CPU usage  
✅ **Rollback Ready** - Easy rollback with previous deployments  

## 🔧 **Setup Instructions**

### **Step 1: Configure GitHub Secrets**

Go to your GitHub repository → Settings → Secrets and Variables → Actions → New repository secret

#### **Required Secrets:**

| Secret Name | Description | Example |
|-------------|-------------|---------|
| **AWS_ACCESS_KEY_ID** | AWS access key for your account | `AKIAIOSFODNN7EXAMPLE` |
| **AWS_SECRET_ACCESS_KEY** | AWS secret key for your account | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| **AWS_REGION** | AWS region where your EC2 instance is located | `us-east-1` |
| **EC2_HOST** | Public IP address of your EC2 instance | `54.123.45.67` |
| **EC2_SSH_KEY** | Private SSH key content (entire .pem file) | `-----BEGIN RSA PRIVATE KEY-----...` |

#### **Application Secrets:**

| Secret Name | Description | Example |
|-------------|-------------|---------|
| **POSTGRES_PASSWORD** | Database password | `` |
| **JWT_SECRET** | JWT signing secret | `` |
| **ADMIN_PASSWORD** | Admin user password | `` |
| **MAIL_USERNAME** | Email username for SMTP | `` |
| **MAIL_PASSWORD** | Email password (app password) | `` |
| **MAIL_FROM** | Email from address | `` |
| **LINKEDIN_CLIENT_ID** | LinkedIn OAuth client ID | `` |
| **LINKEDIN_CLIENT_SECRET** | LinkedIn OAuth client secret | `` |
| **GEMINI_API_KEY** | Google Gemini API key | `` |

### **Step 2: Prepare EC2 Instance**

#### **Launch EC2 Instance:**
```bash
# 1. Go to AWS Console → EC2 → Launch Instance
# 2. Choose Ubuntu Server 22.04 LTS
# 3. Instance type: t3.medium (4GB RAM minimum)
# 4. Key pair: Create or select existing
# 5. Security group: Allow SSH (22), HTTP (3001, 8080)
# 6. Storage: 20GB minimum, 50GB recommended
# 7. Launch instance
```

#### **Security Group Rules:**
```bash
# Inbound Rules:
Type        Port    Source      Description
SSH         22      Your IP     SSH access
Custom TCP  3001    0.0.0.0/0   Frontend application
Custom TCP  8080    0.0.0.0/0   Backend API
```

#### **Get SSH Key Content:**
```bash
# To get the SSH key content for EC2_SSH_KEY secret:
cat your-key.pem
# Copy the entire content including BEGIN/END lines
```

### **Step 3: Configure GitHub Environments (Optional)**

For production deployments, set up GitHub Environments:

1. Go to Settings → Environments
2. Create "production" environment
3. Add protection rules:
   - Required reviewers
   - Deployment branches (main only)
   - Environment secrets (if different from production)

### **Step 4: Test SSH Connection**

Before running the pipeline, test SSH connection:

```bash
# Test SSH access to your instance
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Check if instance meets requirements
free -h  # Should show 4GB+ RAM
df -h    # Should show 20GB+ storage
```

## 🎯 **How to Use the Pipeline**

### **Method 1: Manual Deployment**

1. Go to your GitHub repository
2. Click "Actions" tab
3. Select "Deploy ATS to AWS EC2" workflow
4. Click "Run workflow"
5. Choose options:
   - **Environment**: production or staging
   - **Skip tests**: true/false
6. Click "Run workflow"

### **Method 2: Automatic Deployment**

The pipeline automatically runs when:
- **Push to main branch** (excluding .md files)
- **Pull request merge** to main branch

### **Method 3: API Trigger**

```bash
# Trigger deployment via GitHub API
curl -X POST \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/actions/workflows/deploy-aws.yml/dispatches \
  -d '{"ref":"main","inputs":{"environment":"production","skip_tests":"false"}}'
```

## 📊 **Pipeline Stages**

### **Stage 1: Testing** (Optional)
- ✅ Java 17 setup
- ✅ Node.js 18 setup
- ✅ Maven dependency caching
- ✅ Backend tests (Spring Boot)
- ✅ Frontend tests (React)
- ✅ Test results upload

### **Stage 2: Deployment**
- ✅ SSH connection test
- ✅ Instance resource check
- ✅ Application file sync
- ✅ Environment setup
- ✅ Docker installation
- ✅ Application deployment
- ✅ Health verification

### **Stage 3: Verification**
- ✅ Container status check
- ✅ Memory usage monitoring
- ✅ Health endpoint tests
- ✅ Deployment summary

## 🔍 **Monitoring Deployments**

### **GitHub Actions Dashboard**
- View deployment status in Actions tab
- See detailed logs for each step
- Download artifacts (test results)
- View deployment summaries

### **On EC2 Instance**
```bash
# SSH to your instance
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Check deployment status
cd /home/ubuntu/ats-system
docker-compose -f docker-compose.aws.yml ps

# View logs
docker-compose -f docker-compose.aws.yml logs -f

# Check resource usage
docker stats
```

## 🚨 **Troubleshooting**

### **Common Issues:**

#### **1. SSH Connection Failed**
```bash
# Check if EC2_SSH_KEY secret is correct
# Ensure security group allows SSH from GitHub Actions IPs
# Verify EC2_HOST is the correct public IP
```

#### **2. Out of Memory Errors**
```bash
# Upgrade EC2 instance type
# Monitor memory usage: docker stats
# Reduce JVM heap size in docker-compose.aws.yml
```

#### **3. Docker Installation Failed**
```bash
# Check if instance is Ubuntu (not Amazon Linux)
# Verify internet connectivity on instance
# Check instance storage space
```

#### **4. Application Won't Start**
```bash
# Check application logs:
docker-compose -f docker-compose.aws.yml logs backend
docker-compose -f docker-compose.aws.yml logs postgres

# Verify environment variables
cat .env
```

### **Debug Commands:**
```bash
# Test secrets are properly set
echo "Testing secrets..." && \
curl -s http://169.254.169.254/latest/meta-data/instance-id

# Check Docker status
systemctl status docker
docker --version
docker-compose --version

# Check application health
curl http://localhost:8080/actuator/health
curl -I http://localhost:3001
```

## 🔄 **Rollback Strategy**

### **Manual Rollback:**
```bash
# SSH to instance
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Stop current deployment
cd /home/ubuntu/ats-system
docker-compose -f docker-compose.aws.yml down

# Restore previous version (if you have git history)
git checkout previous-working-commit
docker-compose -f docker-compose.aws.yml up -d --build
```

### **Automated Rollback:**
You can create a rollback workflow by copying the deploy workflow and modifying it to:
- Checkout a specific commit/tag
- Skip tests
- Deploy the previous version

## 📈 **Performance Optimization**

### **Speed Up Deployments:**
- Use Docker layer caching
- Implement rsync for faster file transfers
- Cache Maven/npm dependencies
- Use multi-stage builds

### **Resource Optimization:**
- Monitor memory usage during deployment
- Adjust JVM heap sizes based on instance type
- Use health checks to prevent premature traffic routing

## 🔒 **Security Best Practices**

### **Secrets Management:**
- Rotate secrets regularly
- Use environment-specific secrets
- Never commit secrets to code
- Use GitHub's dependabot for dependency updates

### **Access Control:**
- Restrict SSH access to specific IPs
- Use IAM roles instead of access keys when possible
- Enable EC2 instance connect for emergency access
- Regular security updates on EC2 instances

## 📝 **Example Workflow Triggers**

### **Push to Main:**
```yaml
on:
  push:
    branches: [ main ]
```

### **Schedule Deployments:**
```yaml
on:
  schedule:
    - cron: '0 2 * * 1'  # Every Monday at 2 AM
```

### **Tag-based Deployments:**
```yaml
on:
  push:
    tags:
      - 'v*'  # Trigger on version tags
```

## 🎉 **Success Indicators**

After successful deployment, you should see:
- ✅ All GitHub Actions steps completed
- ✅ Deployment summary with access URLs
- ✅ Application accessible via public IP
- ✅ Health checks passing
- ✅ Reasonable memory usage (<80% of available RAM)

## 📞 **Support**

If you encounter issues:
1. Check GitHub Actions logs for detailed error messages
2. SSH to EC2 instance and check Docker logs
3. Verify all secrets are correctly configured
4. Test SSH connection manually
5. Check EC2 instance resources and security groups

This pipeline provides a robust, automated deployment solution for your ATS system on AWS EC2! 