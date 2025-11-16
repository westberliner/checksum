# Deployment Scripts

This directory contains scripts for building and deploying the Checksum app.

## deploy.sh

Comprehensive deployment script that:

### Checks Performed (in order):

1. **PHP Syntax Check** - Validates all PHP files for syntax errors
2. **PHP Code Style** - Checks code style with PHP-CS-Fixer (auto-fixes if needed)
3. **PHP Static Analysis** - Runs Psalm to catch potential bugs
4. **PHP Unit Tests** - Runs PHPUnit tests (8 tests)
5. **TypeScript Type Check** - Validates TypeScript types with vue-tsc
6. **JavaScript Linting** - Checks code quality with ESLint (auto-fixes if needed)
7. **Code Formatting** - Validates formatting with Prettier (auto-fixes if needed)
8. **Node Unit Tests** - Runs Vitest tests (32 tests)
9. **Production Build** - Builds optimized production assets

### Package Creation

After all checks pass, the script:
- Cleans the `js/` directory
- Installs dependencies
- Builds production assets with Vite
- Creates `checksum.tar.gz` in the parent directory

### Usage

```bash
# From project root
npm run deploy

# Or directly
./scripts/deploy.sh
```

### Exit Codes

- `0` - Success: All checks passed and package created
- `1` - Failure: One or more checks failed

### Features

- ✨ Color-coded output for easy reading
- 🛑 Stops on first error
- 🔧 Auto-fixes code style and formatting issues when possible
- 📊 Summary of all checks at the end
- 📦 Automated package creation

### Notes

- The script must be run from the project root or will change to it automatically
- All checks must pass before the build proceeds
- The created package excludes development files (node_modules, src, tests, etc.)

