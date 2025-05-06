import uvicorn
import sys
import os

# Add the current directory to the path to ensure proper module resolution
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import the app from main.py
try:
    from main import app
    print("Successfully imported the FastAPI app")
except Exception as e:
    print(f"Error importing app from main.py: {e}")
    # Print all paths in sys.path for debugging
    print("Python path:")
    for p in sys.path:
        print(f"  - {p}")
    sys.exit(1)

if __name__ == "__main__":
    # Run the FastAPI app with uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")