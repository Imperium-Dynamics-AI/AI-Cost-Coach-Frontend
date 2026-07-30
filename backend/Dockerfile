# Use official lightweight Python image
FROM python:3.11-slim

# Prevent Python from writing .pyc files & enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory inside container
WORKDIR /app

# Install PDM package manager
RUN pip install --no-cache-dir pdm

# Copy PDM dependency metadata for caching
COPY pyproject.toml pdm.lock* ./

# Install dependencies into container via PDM (--no-self skips building project root as a library package)
RUN pdm install --prod --no-editable --no-self

# Copy backend source code
COPY . .

# Expose port 8000 for Uvicorn
EXPOSE 8000

# Start Uvicorn app server via PDM
CMD ["pdm", "run", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
