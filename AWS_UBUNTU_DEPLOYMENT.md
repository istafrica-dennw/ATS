# AWS Ubuntu EC2 Deployment Guide

## 🚀 **Quick Start**

Deploy your ATS system on AWS EC2 Ubuntu with just one command:

```bash
chmod +x deploy-aws.sh && ./deploy-aws.sh
```

## 📋 **Prerequisites**

### **EC2 Instance Requirements**
- **OS**: Ubuntu 22.04 LTS or Ubuntu 20.04 LTS
- **Instance Type**: t3.medium (4GB RAM) or higher
- **Storage**: 20GB minimum, 50GB recommended
- **Security Group**: Ports 22, 3001, 8080 open

### **AWS Instance Setup**
1. **Launch EC2 Instance**:
   ```bash
   # Choose Ubuntu Server 22.04 LTS
   # Instance type: t3.medium (2 vCPU, 4GB RAM)
   # Storage: 20GB gp3 (or more for production)
   ```

2. **Configure Security Group**:
   ```bash
   # Inbound Rules:
   SSH (22)     - Your IP
   HTTP (3001)  - 0.0.0.0/0    # Frontend
   HTTP (8080)  - 0.0.0.0/0    # Backend API
   ```

3. **Connect to Instance**:
   ```bash
   ssh -i your-key.pem ubuntu@your-instance-ip
   ```

## 🔧 **Manual Installation Steps**

If you prefer manual installation over the automated script:

### **Step 1: Update System**
```bash
sudo apt update -y
sudo apt upgrade -y
```

### **Step 2: Install Docker**
```bash
# Install required packages
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Add Docker's GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update and install Docker
sudo apt update -y
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# Log out and back in for group changes to take effect
```

### **Step 3: Install Docker Compose**
```bash
# Get latest version
COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d'"' -f4)

# Download and install
sudo curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make executable
sudo chmod +x /usr/local/bin/docker-compose

# Create symlink
sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Verify installation
docker-compose --version
```

### **Step 4: Deploy Application**
```bash
# Clone your repository
git clone your-repo-url
cd ats-system

# Use the AWS-optimized configuration
docker-compose -f docker-compose.aws.yml up -d --build
```

## 🎯 **Memory Optimization for 4GB RAM**

The `docker-compose.aws.yml` is specifically optimized for 4GB RAM:

| Component | Memory Limit | Memory Reserved | Details |
|-----------|-------------|----------------|---------|
| **Backend** | 1600M | 800M | JVM heap: 1200M |
| **PostgreSQL** | 640M | 256M | Shared buffers: 128M |
| **Frontend** | 128M | 64M | Nginx + static files |
| **System** | ~1632M | - | OS + Docker overhead |

### **JVM Optimizations**
```bash
# Optimized JVM settings for 4GB instance
JAVA_OPTS="-Xmx1200m -Xms600m -XX:+UseG1GC -XX:+UseStringDeduplication -XX:MaxGCPauseMillis=100 -XX:+DisableExplicitGC"
```

### **PostgreSQL Optimizations**
```bash
# Memory-optimized PostgreSQL settings
POSTGRES_SHARED_BUFFERS=128MB
POSTGRES_EFFECTIVE_CACHE_SIZE=512MB
POSTGRES_WORK_MEM=4MB
```

## 🔐 **Security Configuration**

### **Environment Variables**
The script automatically generates secure passwords:
```bash
# These are auto-generated
JWT_SECRET=<random-32-byte-key>
POSTGRES_PASSWORD=<random-16-byte-password>
SPRING_SECURITY_USER_PASSWORD=<random-12-byte-password>
```

### **Required Manual Configuration**
Update `.env` file with your actual credentials:
```bash
# Email Configuration
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# OAuth Configuration
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# Gemini AI Configuration
AI_API_KEY=your-gemini-api-key
```

## 📊 **Monitoring & Maintenance**

### **Memory Monitoring**
```bash
# Check system memory
free -h

# Monitor container memory usage
docker stats

# Check memory usage over time
watch -n 5 "docker stats --no-stream"
```

### **Log Monitoring**
```bash
# View all logs
docker-compose -f docker-compose.aws.yml logs -f

# View specific service logs
docker-compose -f docker-compose.aws.yml logs -f backend
docker-compose -f docker-compose.aws.yml logs -f postgres
```

### **Health Checks**
```bash
# Check service health
curl http://localhost:8080/actuator/health    # Backend
curl http://localhost:3001                     # Frontend
docker exec ats-postgres-aws pg_isready -U ats_user -d ats_db  # Database
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Out of Memory Errors**
   ```bash
   # Check memory usage
   docker stats
   
   # Reduce JVM heap size if needed
   JAVA_OPTS="-Xmx1000m -Xms500m ..."
   ```

2. **Permission Denied (Docker)**
   ```bash
   # Log out and back in after adding user to docker group
   exit
   ssh -i your-key.pem ubuntu@your-instance-ip
   ```

3. **Port Already in Use**
   ```bash
   # Check what's using the port
   sudo netstat -tulpn | grep :8080
   
   # Stop conflicting services
   sudo systemctl stop apache2  # if running
   ```

4. **Database Connection Issues**
   ```bash
   # Check PostgreSQL container
   docker logs ats-postgres-aws
   
   # Test database connection
   docker exec ats-postgres-aws psql -U ats_user -d ats_db -c "SELECT 1;"
   ```

## 🎯 **Performance Tuning**

### **For Higher Traffic**
If you need to handle more than 200 users/day:

1. **Upgrade Instance**:
   ```bash
   # t3.large (8GB RAM) - 500+ users/day
   # t3.xlarge (16GB RAM) - 1000+ users/day
   ```

2. **Increase JVM Heap**:
   ```bash
   # For 8GB instance
   JAVA_OPTS="-Xmx2400m -Xms1200m ..."
   
   # For 16GB instance
   JAVA_OPTS="-Xmx4800m -Xms2400m ..."
   ```

3. **Database Optimization**:
   ```bash
   # For larger instances
   POSTGRES_SHARED_BUFFERS=256MB    # 8GB instance
   POSTGRES_SHARED_BUFFERS=512MB    # 16GB instance
   ```

## 💰 **Cost Optimization**

### **Monthly Costs (us-east-1)**
- **t3.medium**: $30.37/month
- **t3.large**: $60.74/month
- **EBS Storage**: $0.08/GB/month
- **Data Transfer**: $0.09/GB (first 1GB free)

### **Cost Savings Tips**
```bash
# Use Reserved Instances (save 30-60%)
# Use Spot Instances for development (save 90%)
# Stop instances during off-hours
# Use S3 for file storage instead of EBS
```

## 🔄 **Backup & Updates**

### **Database Backup**
```bash
# Create backup
docker exec ats-postgres-aws pg_dump -U ats_user ats_db > backup.sql

# Restore backup
docker exec -i ats-postgres-aws psql -U ats_user ats_db < backup.sql
```

### **Application Updates**
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.aws.yml up -d --build
```

## 🆘 **Support**

### **Quick Commands**
```bash
# Restart all services
docker-compose -f docker-compose.aws.yml restart

# Stop all services
docker-compose -f docker-compose.aws.yml down

# View resource usage
docker system df
docker stats --no-stream
```

### **Emergency Recovery**
```bash
# If system becomes unresponsive
sudo systemctl restart docker
docker-compose -f docker-compose.aws.yml down
docker-compose -f docker-compose.aws.yml up -d --build
```

This setup will run efficiently on a 4GB Ubuntu EC2 instance and handle 200+ users per day with Gemini AI integration! 