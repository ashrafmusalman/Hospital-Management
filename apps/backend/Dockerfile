FROM python:3.11-slim-bookworm

RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*

# Prevent Python from creating .pyc files
ENV PYTHONDONTWRITEBYTECODE=1

# Prevent Python buffering
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Copy dependencies
COPY requirements.txt .

# Install dependencies, then upgrade pip's own toolchain again last —
# some packages in requirements.txt pull in an older setuptools/wheel as
# a transitive dependency, which would otherwise downgrade the earlier
# upgrade and reintroduce CVEs from setuptools' bundled _vendor copies.
RUN pip install --no-cache-dir --upgrade pip setuptools wheel \
    && pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir --upgrade pip setuptools wheel

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run FastAPI
# Start FastAPI
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]