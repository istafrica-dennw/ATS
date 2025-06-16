# ATS System - Test Makefile

.PHONY: test test-unit test-setup test-cleanup test-coverage test-coverage-report test-coverage-view help dev-setup dev-backend dev-frontend dev-full dev-cleanup prod-build prod-up prod-down prod-logs prod-cleanup clean-all

# Default target
help:
	@echo "Available targets:"
	@echo "  🧪 TEST COMMANDS"
	@echo "  test-setup         - Start test database"
	@echo "  test-unit          - Run unit tests"
	@echo "  test               - Run all tests (setup + unit tests)"
	@echo "  test-coverage      - Run tests with coverage report"
	@echo "  test-coverage-report - Generate and extract coverage report"
	@echo "  test-coverage-view - Open coverage report in browser"
	@echo "  test-cleanup       - Stop and cleanup test environment"
	@echo ""
	@echo "  🚀 DEVELOPMENT COMMANDS"
	@echo "  dev-setup          - Start development environment"
	@echo "  dev-backend        - Start backend in development mode"
	@echo "  dev-frontend       - Start frontend in development mode"
	@echo "  dev-full           - Start full development environment"
	@echo "  dev-cleanup        - Clean up development environment"
	@echo ""
	@echo "  🏭 PRODUCTION COMMANDS"
	@echo "  prod-build         - Build production images"
	@echo "  prod-up            - Start production environment"
	@echo "  prod-down          - Stop production environment"
	@echo "  prod-logs          - View production logs"
	@echo "  prod-cleanup       - Clean up production environment"
	@echo ""
	@echo "  🧹 UTILITY COMMANDS"
	@echo "  clean-all          - Clean up all environments and volumes"

# Start test database
test-setup:
	@echo "🚀 Starting test database..."
	docker-compose -f docker-compose.test.yml up -d postgres-test

# Run unit tests using standard Spring Boot testing
test-unit:
	@echo "🧪 Running Spring Boot integration tests..."
	docker-compose -f docker-compose.test.yml up --build backend-test

# Run tests with coverage
test-coverage:
	@echo "🧪 Running tests with coverage reporting..."
	docker-compose -f docker-compose.test.yml up --build backend-test
	@echo "📊 Coverage report generated in backend/target/site/jacoco/"

# Generate coverage report and show summary
test-coverage-report: test-setup
	@echo "📊 Generating detailed coverage report..."
	docker-compose -f docker-compose.test.yml run --rm backend-test mvn clean test jacoco:report
	@echo "📈 Extracting coverage report..."
	@docker cp ats-backend-test:/app/target/site/jacoco ./coverage-report 2>/dev/null || echo "⚠️  Coverage report extraction skipped (container may have exited)"
	@echo "📋 Coverage report available at: ./coverage-report/index.html"
	@echo "🌐 Open in browser: open ./coverage-report/index.html"

# View coverage report in browser (macOS)
test-coverage-view:
	@echo "🌐 Opening coverage report in browser..."
	@if [ -f ./coverage-report/index.html ]; then \
		open ./coverage-report/index.html; \
	else \
		echo "❌ Coverage report not found. Run 'make test-coverage-report' first."; \
	fi

# Run all tests (setup + tests)
test: test-setup test-unit

# Cleanup test environment
test-cleanup:
	@echo "🧹 Cleaning up test environment..."
	docker-compose -f docker-compose.test.yml down

# Development Environment Commands
dev-setup:
	@echo "🚀 Starting development environment..."
	docker-compose up -d postgres

dev-backend:
	@echo "🏃‍♂️ Starting backend in development mode..."
	cd backend && ./mvnw spring-boot:run

dev-frontend:
	@echo "🎨 Starting frontend in development mode..."
	cd frontend && npm start

dev-full:
	@echo "🚀 Starting full development environment..."
	docker-compose up --build

dev-cleanup:
	@echo "🧹 Cleaning up development environment..."
	docker-compose down

# Production Environment Commands
prod-build:
	@echo "🏭 Building production images..."
	docker-compose -f docker-compose.prod.yml build --no-cache

prod-up:
	@echo "🚀 Starting production environment..."
	docker-compose -f docker-compose.prod.yml up -d

prod-down:
	@echo "🛑 Stopping production environment..."
	docker-compose -f docker-compose.prod.yml down

prod-logs:
	@echo "📋 Viewing production logs..."
	docker-compose -f docker-compose.prod.yml logs -f

prod-cleanup:
	@echo "🧹 Cleaning up production environment..."
	docker-compose -f docker-compose.prod.yml down -v

# Utility Commands
clean-all:
	@echo "🧹 Cleaning up all environments..."
	docker-compose down -v 2>/dev/null || true
	docker-compose -f docker-compose.test.yml down -v 2>/dev/null || true
	docker-compose -f docker-compose.prod.yml down -v 2>/dev/null || true
	@echo "🗑️  Removing unused Docker resources..."
	docker system prune -f
	@echo "✅ Cleanup complete!" 