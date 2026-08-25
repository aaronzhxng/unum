#!/bin/bash

# Unum Development Environment Setup Script
# Standardizes development across all devices using Docker

echo "🐳 Unum Development Environment Setup"
echo "======================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop first:"
    echo "   - macOS: https://docs.docker.com/desktop/install/mac-install/"
    echo "   - Windows: https://docs.docker.com/desktop/install/windows-install/"
    echo "   - Linux: https://docs.docker.com/desktop/install/linux-install/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please update Docker Desktop."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Build images if they don't exist
echo ""
echo "Building Docker images..."
docker compose build --no-cache

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build complete!"
    echo ""
    echo "To start developing:"
    echo "  docker compose up -d"
    echo ""
    echo "To view logs:"
    echo "  docker compose logs -f app"
    echo "  docker compose logs -f backend"
    echo ""
    echo "To run shell commands in the app container:"
    echo "  docker compose exec app bash"
    echo ""
    echo "To stop all services:"
    echo "  docker compose down"
else
    echo "❌ Build failed. Check the output above for details."
    exit 1
fi
