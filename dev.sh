#!/bin/bash

# Development server startup script
# Builds the project, starts Docker, and watches for changes

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting development environment...${NC}\n"

# Check if .env.php exists
if [ ! -f ".env.php" ]; then
    echo -e "${RED}❌ Error: .env.php not found${NC}"
    echo -e "${YELLOW}Create .env.php in the root directory with your configuration${NC}"
    exit 1
fi

# Run initial build
echo -e "${BLUE}📦 Building project...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build completed${NC}\n"

# Start Docker containers
echo -e "${BLUE}🐳 Starting Docker containers...${NC}"
docker-compose up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to start Docker containers${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker containers started${NC}"
echo -e "${BLUE}⏳ Waiting for database to be ready...${NC}"
sleep 5  # Give database time to fully initialize

echo -e "${GREEN}✓ Docker running at http://localhost:8000${NC}\n"

# Start file watcher (which starts browser-sync)
echo -e "${BLUE}👀 Starting file watcher and browser sync...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop${NC}\n"

# Open browser at Docker URL (OAuth works here)
(
  sleep 3

  # Open browser
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open http://localhost:8000
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open http://localhost:8000 &>/dev/null
  elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    # Windows
    start http://localhost:8000
  fi
) &

# Trap Ctrl+C to show cleanup message
trap 'echo -e "\n${YELLOW}⚠️  File watcher stopped${NC}"; echo -e "${BLUE}ℹ️  Docker is still running. Use \"docker-compose down\" to stop it${NC}"; exit 0' INT

npm run watch
