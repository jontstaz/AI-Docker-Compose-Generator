# DockerComposeAIGenerator

DockerComposeAIGenerator is an AI-powered tool that automatically generates Dockerfile and docker-compose.yaml files for any GitHub repository, making containerization and deployment quick and easy.

## Overview

This project takes a GitHub repository URL as input, analyzes its structure and content, and uses an AI model to generate appropriate Docker configuration files tailored to that specific project. It's perfect for developers who want to quickly containerize and deploy projects without spending time manually crafting Docker configurations.

## Features

- **One-Click Generation**: Simply provide a GitHub URL and get ready-to-use Docker configurations
- **Intelligent Analysis**: Automatically identifies programming languages, frameworks, databases, and dependencies
- **Production-Ready Outputs**: Generates optimized multi-stage Dockerfiles when beneficial
- **Smart Defaults**: Includes sensible default configurations for environment variables, volumes, and networking

## Architecture

The project consists of two main components:

1. **API Backend** (Python/FastAPI):
   - Processes GitHub repositories using Repomix
   - Communicates with OpenAI's GPT models
   - Generates and returns Docker configurations

2. **Web Frontend** (Next.js):
   - Provides user interface for entering GitHub URLs
   - Displays generated Docker configurations
   - Allows copying or downloading of configuration files

## Requirements

- Python 3.9+
- Node.js 18+
- OpenAI API key

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/DockerComposeAIGenerator.git
   cd DockerComposeAIGenerator
   ```

2. Set up the API:
   ```bash
   cd api
   # Create a virtual environment (optional but recommended)
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Create a .env file with your OpenAI API key
   echo "OPENAI_API_KEY=your_api_key_here" > .env
   ```

3. Set up the web frontend:
   ```bash
   cd ../web
   npm install
   # or if you use bun
   bun install
   ```

## Usage

1. Start the API server:
   ```bash
   cd api
   uvicorn main:app --reload
   ```

2. Start the web frontend:
   ```bash
   cd web
   npm run dev
   # or if you use bun
   bun run dev
   ```

3. Open your browser and navigate to http://localhost:3000

4. Enter a GitHub repository URL and click "Generate"

5. Review the generated Dockerfile and docker-compose.yaml

6. Copy or download the configuration files and use them in your project

## How It Works

1. The tool fetches and analyzes the GitHub repository using Repomix, which creates a semantic map of the project's structure and content
2. This map is used as context for an AI/LLM model (GPT-4.1-mini) that identifies the technologies used and the requirements for containerization
3. The AI generates appropriate Docker configuration files based on the project's specific needs
4. The generated files are presented to the user through the web interface

## License

[MIT License](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 