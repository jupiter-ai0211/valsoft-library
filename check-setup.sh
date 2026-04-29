#!/bin/bash
# LibraFlow Project Initialization Checklist

echo "📋 LibraFlow Project Setup Checklist"
echo "===================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if files exist
echo "Checking project structure..."
echo ""

files=(
    "package.json"
    "vite.config.ts"
    "tsconfig.json"
    "tailwind.config.js"
    "src/App.tsx"
    "src/main.tsx"
    "src/index.css"
    "src/pages/Login.tsx"
    "src/pages/Dashboard.tsx"
    "src/pages/Books.tsx"
    "src/components/Navbar.tsx"
    "src/services/bookService.ts"
    "src/store/authStore.ts"
    "supabase/schema.sql"
    "README.md"
    "SETUP.md"
)

missing=0

for file in "${files[@]}"
do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file"
        ((missing++))
    fi
done

echo ""
echo "Checking directories..."
echo ""

dirs=(
    "src"
    "src/components"
    "src/pages"
    "src/services"
    "src/store"
    "src/lib"
    "src/types"
    "supabase"
)

for dir in "${dirs[@]}"
do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $dir/"
    else
        echo -e "${RED}✗${NC} $dir/"
        ((missing++))
    fi
done

echo ""
echo "Checking dependencies..."
echo ""

if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules installed"
else
    echo -e "${YELLOW}⚠${NC} node_modules not found (run: npm install)"
fi

if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
else
    echo -e "${YELLOW}⚠${NC} .env file needed (copy from .env.example)"
fi

echo ""
echo "===================================="
if [ $missing -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Configure Supabase credentials in .env"
    echo "2. Run database schema (supabase/schema.sql)"
    echo "3. Create test accounts in Supabase"
    echo "4. Run: npm run dev"
else
    echo -e "${YELLOW}⚠️  Some files or directories are missing${NC}"
    echo "This may cause issues when running the project."
fi

echo ""
