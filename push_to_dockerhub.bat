@echo off
set /p DOCKER_USERNAME="Enter your Docker Hub username: "

echo Logging in to Docker Hub...
docker login

echo Building Backend Image...
docker build -t %DOCKER_USERNAME%/paper-reviewer-backend:latest ./backend

echo Building Frontend Image...
docker build -t %DOCKER_USERNAME%/paper-reviewer-frontend:latest ./frontend

echo Pushing Backend Image...
docker push %DOCKER_USERNAME%/paper-reviewer-backend:latest

echo Pushing Frontend Image...
docker push %DOCKER_USERNAME%/paper-reviewer-frontend:latest

echo Done! Images uploaded to Docker Hub.
pause
