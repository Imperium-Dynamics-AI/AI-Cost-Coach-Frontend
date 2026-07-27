# Use official lightweight Python image
FROM python:3.11-slim

# Prevent Python from writing .pyc files & enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory inside container
WORKDIR /app

# Copy requirements file first for layer caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source files
COPY . .

# Expose port 8000 for Uvicorn
EXPOSE 8000

# Start Uvicorn app server
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
