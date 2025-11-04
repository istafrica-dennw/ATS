# Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy only the pom.xml first
COPY pom.xml .

# Download dependencies and keep them in the cache
RUN mvn dependency:resolve-plugins dependency:resolve

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jdk-jammy 
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Set timezone
ENV TZ=UTC
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Create uploads directory with proper permissions
RUN mkdir -p /uploads/profile-pictures && chmod -R 777 /uploads

# For development, mount the source code as a volume
# and use spring-boot-devtools for hot reloading
ENV SPRING_DEVTOOLS_REMOTE_DEBUG=true
ENV SPRING_DEVTOOLS_RESTART_ENABLED=true

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"] 