# Docker Instructions

## Prerequisites
- Docker Desktop installed and running.
- A Docker Hub account.

## Running Locally
To run the application locally using Docker Compose:

1. Ensure you have a `.env` file in the `backend` directory with your API keys (OpenAI, etc.).
2. Run the following command in this directory:
   ```bash
   docker-compose up --build
   ```
3. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:5000

## Uploading to Docker Hub
To build and upload the images to your Docker Hub account:

1. Run the `push_to_dockerhub.bat` script.
2. Enter your Docker Hub username when prompted.
3. The script will build, tag, and push the images.

## Deployment
To deploy on another machine, you can use a `docker-compose.yml` that references your pushed images:

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    volumes:
      - mongodb_data:/data/db
  
  backend:
    image: YOUR_USERNAME/paper-reviewer-backend:latest
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/paper_reviewer
      # Add other env vars here
  
  frontend:
    image: YOUR_USERNAME/paper-reviewer-frontend:latest
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```
