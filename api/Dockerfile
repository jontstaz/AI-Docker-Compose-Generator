FROM python:3.12-slim

WORKDIR /app

# Install git and other dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends git && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all application code
COPY . .

# Ensure our start.py is the latest version by copying it last
COPY start.py .

# Expose port
EXPOSE 8000

# Set Python path explicitly
ENV PYTHONPATH="/app:${PYTHONPATH}"

# Start the application with our startup script
CMD ["python", "start.py"] 