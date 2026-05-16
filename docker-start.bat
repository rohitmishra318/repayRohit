@echo off
REM Docker Quick Start Script for RepaySignal

echo.
echo ====================================
echo   RepaySignal Docker Quick Start
echo ====================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed or not in PATH
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker Compose is not installed
    echo Please install Docker Compose from https://docs.docker.com/compose/install/
    pause
    exit /b 1
)

echo Docker and Docker Compose are installed.
echo.

REM Check for .env file
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo .env file created. Please update it with your settings.
    echo.
)

REM Menu
:menu
echo.
echo Select an option:
echo 1. Start services (background)
echo 2. Start services (foreground with logs)
echo 3. Stop services
echo 4. View logs
echo 5. Rebuild and start
echo 6. Clean up (remove containers and volumes)
echo 7. Exit
echo.

set /p choice="Enter your choice (1-7): "

if "%choice%"=="1" (
    echo Starting services in background...
    docker-compose up -d
    echo.
    echo Services started!
    echo Frontend: http://localhost:3000
    echo Backend API: http://localhost:8000
    echo API Docs: http://localhost:8000/docs
    echo.
) else if "%choice%"=="2" (
    echo Starting services with logs...
    docker-compose up
) else if "%choice%"=="3" (
    echo Stopping services...
    docker-compose down
    echo Services stopped!
) else if "%choice%"=="4" (
    echo Viewing logs (Ctrl+C to exit)...
    docker-compose logs -f
) else if "%choice%"=="5" (
    echo Rebuilding and starting services...
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    echo.
    echo Services rebuilt and started!
    echo Frontend: http://localhost:3000
    echo Backend API: http://localhost:8000
    echo API Docs: http://localhost:8000/docs
    echo.
) else if "%choice%"=="6" (
    echo WARNING: This will remove all containers, networks, and volumes!
    set /p confirm="Are you sure? (yes/no): "
    if /i "%confirm%"=="yes" (
        docker-compose down -v
        echo Cleanup complete!
    )
) else if "%choice%"=="7" (
    echo Exiting...
    exit /b 0
) else (
    echo Invalid choice. Please try again.
    goto menu
)

goto menu
