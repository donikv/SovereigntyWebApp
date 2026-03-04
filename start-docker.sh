#!/bin/bash

# Digital Sovereignty Evaluation Tool - Docker Quick Start Script

set -e

echo "=================================="
echo "Digital Sovereignty Evaluation Tool"
echo "Docker Deployment"
echo "=================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✓ Docker is installed"
echo "✓ Docker Compose is installed"
echo ""

# Check if .env file exists, if not copy from .env.docker
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.docker..."
    cp .env.docker .env
    echo "✓ .env file created"
    echo ""
    echo "⚠️  Please review .env and update passwords if needed"
    echo "   Default passwords are set for development only!"
    echo ""
else
    echo "✓ .env file exists"
    echo ""
fi

# Ask user if they want to start fresh or keep existing data
if docker volume ls | grep -q sovereignty; then
    echo "⚠️  Existing data volumes found."
    read -p "Do you want to keep existing data? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Removing existing volumes..."
        docker-compose down -v
        echo "✓ Volumes removed"
        echo ""
    fi
fi

# Build and start services
echo "🏗️  Building Docker images..."
docker-compose build

echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 5

# Check service health
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker-compose ps | grep -q "healthy"; then
        MONGODB_HEALTHY=$(docker-compose ps mongodb | grep -c "healthy" || echo "0")
        APP_HEALTHY=$(docker-compose ps app | grep -c "healthy" || echo "0")
        
        if [ "$MONGODB_HEALTHY" -eq "1" ] && [ "$APP_HEALTHY" -eq "1" ]; then
            echo "✓ All services are healthy!"
            break
        fi
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "  Attempt $RETRY_COUNT/$MAX_RETRIES..."
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "⚠️  Services are taking longer than expected to start."
    echo "   Check logs with: docker-compose logs"
else
    echo ""
    echo "=================================="
    echo "🎉 Application is ready!"
    echo "=================================="
    echo ""
    echo "📱 Access the application at:"
    echo "   http://localhost:3000"
    echo ""
    echo "📊 MongoDB is available at:"
    echo "   mongodb://localhost:27017"
    echo ""
    echo "Useful commands:"
    echo "  docker-compose logs -f        # View logs"
    echo "  docker-compose ps             # Check status"
    echo "  docker-compose stop           # Stop services"
    echo "  docker-compose down           # Stop and remove containers"
    echo "  docker-compose down -v        # Stop and remove all data"
    echo ""
    echo "For more information, see DOCKER.md"
fi
