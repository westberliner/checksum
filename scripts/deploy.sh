#!/bin/bash

# Nextcloud Checksum App - Build and Deploy Script
# This script runs all checks and builds the app for production

set -e  # Exit on error

echo "🚀 Starting deployment process..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print section headers
print_section() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${GREEN}$1${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print error
print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Change to project root
cd "$(dirname "$0")/.."

# ============================================================================
# PHP CHECKS
# ============================================================================
print_section "1/9 PHP Syntax Check"
if composer lint > /dev/null 2>&1; then
    print_success "PHP syntax check passed"
else
    print_error "PHP syntax check failed"
    exit 1
fi

print_section "2/9 PHP Code Style Check"
if composer cs:check > /dev/null 2>&1; then
    print_success "PHP code style check passed"
else
    print_warning "PHP code style issues found, attempting auto-fix..."
    composer cs:fix
    print_success "PHP code style fixed"
fi

print_section "3/9 PHP Static Analysis (Psalm)"
if composer psalm; then
    print_success "Psalm static analysis passed"
else
    print_error "Psalm static analysis failed"
    exit 1
fi

print_section "4/9 PHP Unit Tests"
if composer test:unit; then
    print_success "PHP unit tests passed"
else
    print_error "PHP unit tests failed"
    exit 1
fi

# ============================================================================
# NODE/TYPESCRIPT CHECKS
# ============================================================================
print_section "5/9 TypeScript Type Check"
if npm run type-check; then
    print_success "TypeScript type check passed"
else
    print_error "TypeScript type check failed"
    exit 1
fi

print_section "6/9 JavaScript/TypeScript Linting"
if npm run lint > /dev/null 2>&1; then
    print_success "ESLint check passed"
else
    print_warning "ESLint issues found, attempting auto-fix..."
    npm run lint:fix
    print_success "ESLint issues fixed"
fi

print_section "7/9 Code Formatting Check"
if npm run format > /dev/null 2>&1; then
    print_success "Prettier formatting check passed"
else
    print_warning "Formatting issues found, attempting auto-fix..."
    npm run format:fix
    print_success "Code formatted"
fi

print_section "8/9 Node Unit Tests"
if npm run test; then
    print_success "Node unit tests passed"
else
    print_error "Node unit tests failed"
    exit 1
fi

# ============================================================================
# BUILD AND PACKAGE
# ============================================================================
print_section "9/9 Building Production Assets"
echo "Cleaning old build..."
rm -rf js/*

echo "Installing dependencies..."
npm install

echo "Building assets..."
npm run build

print_success "Build completed successfully"

# ============================================================================
# CREATE RELEASE PACKAGE
# ============================================================================
print_section "Creating Release Package"
cd ..
echo "Creating checksum.tar.gz..."
tar -czf checksum.tar.gz -X checksum/.exclude checksum
cd checksum

print_success "Package created: ../checksum.tar.gz"

# ============================================================================
# SUMMARY
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✓ DEPLOYMENT SUCCESSFUL${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Summary:"
echo "  ✓ PHP syntax check"
echo "  ✓ PHP code style"
echo "  ✓ PHP static analysis"
echo "  ✓ PHP unit tests"
echo "  ✓ TypeScript type check"
echo "  ✓ JavaScript linting"
echo "  ✓ Code formatting"
echo "  ✓ Node unit tests"
echo "  ✓ Production build"
echo ""
echo "Package: ../checksum.tar.gz"
echo ""

