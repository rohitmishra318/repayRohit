#!/bin/bash

# Docker Quick Start Script for RepaySignal

echo ""
echo "===================================="
echo "   RepaySignal Docker Quick Start"
echo "===================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed or not in PATH"
    echo "Please install Docker from https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "ERROR: Docker Compose is not installed"
    echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
    exit 1
fi

echo "Docker and Docker Compose are installed."
echo ""

# Check for .env file
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo ".env file created. Please update it with your settings."
    echo ""
fi

# Menu
show_menu() {
    echo ""
    echo "Select an option:"
    echo "1. Start services (background)"
    echo "2. Start services (foreground with logs)"
    echo "3. Stop services"
    echo "4. View logs"
    echo "5. Rebuild and start"
    echo "6. Clean up (remove containers and volumes)"
    echo "7. Access backend shell"
    echo "8. Access frontend shell"
    echo "9. Exit"
    echo ""
}

# Main loop
while true; do
    show_menu
    read -p "Enter your choice (1-9): " choice
    
    case $choice in
        1)
            echo "Starting services in background..."
            docker-compose up -d
            echo ""
            echo "Services started!"
            echo "Frontend: http://localhost:3000"
            echo "Backend API: http://localhost:8000"
            echo "API Docs: http://localhost:8000/docs"
            echo ""
            ;;
        2)
            echo "Starting services with logs..."
            docker-compose up
            ;;
        3)
            echo "Stopping services..."
            docker-compose down
            echo "Services stopped!"
            ;;
        4)
            echo "Viewing logs (Ctrl+C to exit)..."
            docker-compose logs -f
            ;;
        5)
            echo "Rebuilding and starting services..."
            docker-compose down
            docker-compose build --no-cache
            docker-compose up -d
            echo ""
            echo "Services rebuilt and started!"
            echo "Frontend: http://localhost:3000"
            echo "Backend API: http://localhost:8000"
            echo "API Docs: http://localhost:8000/docs"
            echo ""
            ;;
        6)
            echo "WARNING: This will remove all containers, networks, and volumes!"
            read -p "Are you sure? (yes/no): " confirm
            if [ "$confirm" = "yes" ]; then
                docker-compose down -v
                echo "Cleanup complete!"
            fi
            ;;
        7)
            echo "Accessing backend shell..."
            docker-compose exec backend bash
            ;;
        8)
            echo "Accessing frontend shell..."
            docker-compose exec frontend sh
            ;;
        9)
            echo "Exiting..."
            exit 0
            ;;
        *)
            echo "Invalid choice. Please try again."
            ;;
    esac
done
