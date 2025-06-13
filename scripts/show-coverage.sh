#!/bin/bash

# Script to show test coverage summary
echo "📊 Test Coverage Summary"
echo "========================"

if [ ! -f "./coverage-report/index.html" ]; then
    echo "❌ Coverage report not found. Run 'make test-coverage-report' first."
    exit 1
fi

# Extract coverage data from HTML report
if command -v grep >/dev/null 2>&1; then
    echo ""
    echo "📈 Coverage Metrics:"
    echo "-------------------"
    
    # Extract line coverage
    line_coverage=$(grep -o "Total.*of.*" ./coverage-report/index.html | head -1 | sed 's/<[^>]*>//g' | sed 's/Total/Line Coverage:/')
    if [ ! -z "$line_coverage" ]; then
        echo "✅ $line_coverage"
    fi
    
    # Extract branch coverage  
    branch_coverage=$(grep -o "Total.*of.*" ./coverage-report/index.html | tail -1 | sed 's/<[^>]*>//g' | sed 's/Total/Branch Coverage:/')
    if [ ! -z "$branch_coverage" ]; then
        echo "🌿 $branch_coverage"
    fi
    
    echo ""
    echo "📁 Detailed report: ./coverage-report/index.html"
    echo "🌐 Open with: open ./coverage-report/index.html"
else
    echo "📁 Coverage report generated at: ./coverage-report/index.html"
    echo "🌐 Open with: open ./coverage-report/index.html"
fi

echo ""
echo "🎯 Coverage Thresholds:"
echo "  • Line Coverage: ≥60% (configured in pom.xml)"
echo "  • Branch Coverage: ≥50% (configured in pom.xml)" 