FROM python:3.11-slim

WORKDIR /app

# Install system dependencies required by OpenCV
RUN apt-get update && apt-get install -y libgl1-mesa-glx libglib2.0-0 && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Hugging Face Spaces expose port 7860
ENV PORT=7860
EXPOSE 7860

# Start the FastAPI app
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
