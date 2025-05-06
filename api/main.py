import os
import json
import tempfile
import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from repomix import RepoProcessor, RepomixConfig, RepomixConfigOutput, RepomixOutputStyle, RepomixConfigIgnore
from dotenv import load_dotenv
import openai  # Use OpenAI SDK instead of Anthropic

# --- Configuration & Setup ---
load_dotenv() # Load environment variables from .env file

# Basic Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Environment Variable Validation ---
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    logger.error("FATAL: OPENAI_API_KEY environment variable not set.")
    # You might want to exit here in a real application or raise a startup error
    # For simplicity in example, we proceed, but API calls will fail.

# --- Pydantic Models for Request/Response ---
class RepoRequest(BaseModel):
    repo_url: str = Field(..., description="Public URL of the GitHub repository")
    openai_api_key: str = Field(..., description="OpenAI API key for making LLM requests")
    model: str = Field("gpt-4.1-mini-2025-04-14", description="OpenAI model to use for generation")

class TechStack(BaseModel):
    languages: list[str] = []
    frameworks: list[str] = []
    databases: list[str] = []
    packageManager: str | None = None
    runtime: str | None = None

class CodeFile(BaseModel):
    content: str
    language: str  # Syntax highlighting language identifier

class DockerConfigResponse(BaseModel):
    techStack: TechStack
    dockerfile: CodeFile
    dockerCompose: CodeFile

# --- LLM Prompt ---
LLM_PROMPT_TEMPLATE = """
Analyze the following project context, provided in XML format, which represents the structure and content of a GitHub repository.

Context:
---BEGIN CONTEXT---
{repo_context}
---END CONTEXT---

Based *only* on the provided project context, generate a production-ready docker-compose.yaml and, if necessary, a corresponding Dockerfile configuration suitable for deploying this project.

Follow these instructions precisely:
1.  Identify the likely tech stack (languages, frameworks, databases, package manager, runtime).
2.  Create a multi-stage Dockerfile if beneficial for optimizing the final image size (e.g., separate build and runtime stages).
3.  Include sensible defaults for environment variables (use placeholders like `YOUR_VARIABLE_HERE` if specific values aren't known), volumes for persistent data (if applicable), and basic networking in the docker-compose.yaml.
4.  If a Dockerfile is not necessary (e.g., the compose file uses a pre-built public image directly), provide an empty string for the "dockerfile" field.
"""

# --- FastAPI App Instance ---
app = FastAPI(
    title="Docker Config Generator API",
    description="Generates Docker config using Repomix and an LLM via OpenAI GPT-4.1.",
)

# --- API Endpoint ---
@app.post("/generate-docker-config", response_model=DockerConfigResponse)
async def generate_docker_config(request: RepoRequest):
    """
    Accepts a GitHub repository URL and OpenAI API key, processes it with Repomix,
    queries GPT-4.1-mini via OpenAI API, and returns generated Docker configurations.
    """
    # Use API key from request instead of environment variable
    api_key = request.openai_api_key
    
    if not api_key:
         raise HTTPException(status_code=400, detail="OpenAI API key is required.")

    repo_url = request.repo_url
    logger.info(f"Processing request for repository: {repo_url}")

    # Set RepomixConfigIgnore
    ignore = RepomixConfigIgnore(
        custom_patterns=["**/node_modules/**", "**/.git/**", "**/venv/**", "**/__pycache__/**",
                               "**/test/**", "**/tests/**", "**/*.test.*", "**/*.spec.*", 
                               "**/dist/**", "**/build/**", "**/target/**", "**/docs/**", 
                               "**/*.md", "**/*.jpg", "**/*.png", "**/*.gif", "**/*.svg", 
                               "**/*.ico", "**/*.pdf", "**/*.zip", "**/*.tar.gz"],
        use_gitignore=True,
        use_default_ignore=True
    )
    # --- 1. Process Repository with Repomix ---
    repo_context = ""
    # Use a temporary file for repomix output
    # We choose XML format as it's often better for LLM structure parsing
    with tempfile.NamedTemporaryFile(mode="w+", suffix=".repomix.xml", delete=False) as temp_output_file:
        temp_file_path = temp_output_file.name
        logger.info(f"Using temporary file for repomix output: {temp_file_path}")
        try:
            config = RepomixConfig(
                output=RepomixConfigOutput(
                    file_path=temp_file_path,
                    remove_comments=True,
                    remove_empty_lines=True,
                    include_empty_directories=False,
                    _style=RepomixOutputStyle.XML,
                    instruction_file_path="repomix_instructions.md"
                ),
                # Define include/exclude patterns to further reduce context size
                include=["**/*.py", "**/*.js", "**/*.ts", "**/*.java", "**/*.go", "**/*.rb", 
                                  "**/*.php", "**/*.cs", "**/*.rs", "**/*.c", "**/*.cpp", "**/*.h",
                                  "**/package.json", "**/requirements.txt", "**/Gemfile", "**/build.gradle",
                                  "**/pom.xml", "**/.env.example", "**/docker*", "**/Dockerfile*", 
                                  "**/docker-compose*", "**/*.toml", "**/*.yaml", "**/*.yml", 
                                  "**/Cargo.toml", "**/go.mod", "**/go.sum", "**/README.md"],
                ignore=ignore
            )
            processor = RepoProcessor(repo_url=repo_url, config=config)

            # Note: Repomix's process() might be synchronous.
            # For long-running tasks in async FastAPI, consider running sync code
            # in a thread pool: await asyncio.get_event_loop().run_in_executor(None, processor.process)
            # Keeping it simple for now:
            result = processor.process()

            logger.info(f"Repomix processing complete for {repo_url}. Tokens: {result.total_tokens}, Files processed: {result.total_files}")

            # Read the generated context (rewind file pointer first)
            temp_output_file.seek(0)
            repo_context = temp_output_file.read()

        except Exception as e:
            logger.error(f"Repomix processing failed for {repo_url}: {str(e)}", exc_info=True)
            # Clean up temp file on error before raising HTTP exception
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
            
            # Provide better error messages based on common failure modes
            if "instruction_file_path" in str(e):
                raise HTTPException(status_code=500, 
                                  detail="Failed to process repository: Custom instruction file could not be loaded.")
            elif "rate limit" in str(e).lower():
                raise HTTPException(status_code=429, 
                                  detail="Repository processing rate limit exceeded. Please try again later.")
            elif "not found" in str(e).lower() or "404" in str(e):
                raise HTTPException(status_code=404, 
                                  detail=f"Repository not found: {repo_url}. Please check the URL and ensure it's a public repository.")
            else:
                raise HTTPException(status_code=500, detail=f"Failed to process repository: {str(e)}")

    if not repo_context:
         raise HTTPException(status_code=500, detail="Repomix generated empty context.")

    # --- 2. Query GPT-4.1-mini via OpenAI API ---
    final_prompt = LLM_PROMPT_TEMPLATE.format(repo_context=repo_context)
    
    try:
        # Initialize OpenAI client with API key from request
        client = openai.OpenAI(api_key=api_key)
        
        logger.info(f"Sending request to OpenAI {request.model} for {repo_url}")
        
        # Make the API call to OpenAI with the specified model
        response = client.chat.completions.create(
            model=request.model,
            max_tokens=8000,
            messages=[
                {"role": "user", "content": final_prompt}
            ],
            temperature=0.2,  # Lower temperature for more deterministic outputs
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "DockerConfigResponse",
                    "schema": {
                        "type": "object",
                        "properties": {
                            "techStack": {
                                "type": "object",
                                "properties": {
                                    "languages": {
                                        "type": "array",
                                        "items": {"type": "string"},
                                        "description": "Programming languages used in the project"
                                    },
                                    "frameworks": {
                                        "type": "array",
                                        "items": {"type": "string"},
                                        "description": "Frameworks used in the project"
                                    },
                                    "databases": {
                                        "type": "array",
                                        "items": {"type": "string"},
                                        "description": "Databases used in the project"
                                    },
                                    "packageManager": {
                                        "type": ["string", "null"],
                                        "description": "Package manager used in the project"
                                    },
                                    "runtime": {
                                        "type": ["string", "null"],
                                        "description": "Runtime environment for the project"
                                    }
                                },
                                "required": ["languages", "frameworks", "databases", "packageManager", "runtime"],
                                "additionalProperties": False
                            },
                            "dockerfile": {
                                "type": "object",
                                "properties": {
                                    "content": {
                                        "type": "string",
                                        "description": "Complete Dockerfile content"
                                    },
                                    "language": {
                                        "type": "string",
                                        "description": "Language identifier for syntax highlighting",
                                        "enum": ["dockerfile"]
                                    }
                                },
                                "required": ["content", "language"],
                                "additionalProperties": False
                            },
                            "dockerCompose": {
                                "type": "object",
                                "properties": {
                                    "content": {
                                        "type": "string",
                                        "description": "Complete docker-compose.yaml content"
                                    },
                                    "language": {
                                        "type": "string",
                                        "description": "Language identifier for syntax highlighting",
                                        "enum": ["yaml"]
                                    }
                                },
                                "required": ["content", "language"],
                                "additionalProperties": False
                            }
                        },
                        "required": ["techStack", "dockerfile", "dockerCompose"],
                        "additionalProperties": False
                    },
                    "strict": True
                }
            }
        )
        
        # Extract content from response
        llm_content_raw = response.choices[0].message.content
        logger.info(f"Received response from OpenAI GPT-4.1-mini for {repo_url}")

        if not llm_content_raw:
            raise HTTPException(status_code=500, detail="GPT-4.1-mini returned an empty response.")

        # --- 3. Parse LLM Response ---
        try:
            # Clean the response - remove markdown code blocks if present
            cleaned_content = llm_content_raw
            if cleaned_content.startswith("```") and "```" in cleaned_content[3:]:
                # Extract content between markdown code block delimiters
                first_delimiter_end = cleaned_content.find("\n", 3)
                last_delimiter_start = cleaned_content.rfind("```")
                if first_delimiter_end != -1 and last_delimiter_start > first_delimiter_end:
                    cleaned_content = cleaned_content[first_delimiter_end + 1:last_delimiter_start].strip()
            
            # The LLM should return a JSON string matching the format requested
            llm_json_data = json.loads(cleaned_content)
            
            # Check if we need to convert from old format to new format with CodeFile
            if isinstance(llm_json_data.get("dockerfile"), str):
                llm_json_data["dockerfile"] = {
                    "content": llm_json_data["dockerfile"],
                    "language": "dockerfile"
                }
            
            if isinstance(llm_json_data.get("dockerCompose"), str):
                llm_json_data["dockerCompose"] = {
                    "content": llm_json_data["dockerCompose"],
                    "language": "yaml"
                }
            
            # Validate the structure using the Pydantic model
            validated_response = DockerConfigResponse(**llm_json_data)
            logger.info(f"Successfully parsed and validated LLM response for {repo_url}")
            return validated_response # FastAPI will serialize this Pydantic model to JSON

        except json.JSONDecodeError as e:
            logger.error(f"Failed to decode JSON from LLM response: {e}\nRaw response: {llm_content_raw}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"LLM response was not valid JSON: {e}")
        except Exception as e: # Catch Pydantic validation errors etc.
             logger.error(f"Failed to validate LLM response structure: {e}", exc_info=True)
             raise HTTPException(status_code=500, detail=f"LLM response did not match required format: {e}")

    except openai.RateLimitError as e:
        logger.error(f"OpenAI rate limit exceeded: {e}", exc_info=True)
        raise HTTPException(status_code=429, detail=f"Rate limit exceeded: {e}")
    except openai.APIError as e:
        logger.error(f"OpenAI API error: {e}", exc_info=True)
        raise HTTPException(status_code=502, detail=f"Failed to get a response from OpenAI: {e}")
    except openai.APIConnectionError as e:
        logger.error(f"Connection to OpenAI API failed: {e}", exc_info=True)
        raise HTTPException(status_code=503, detail=f"Failed to connect to OpenAI API: {e}")
    except Exception as e:
        logger.error(f"An unexpected error occurred during LLM interaction: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")


# --- Add basic root endpoint for health check ---
@app.get("/")
async def root():
    return {"message": "Docker Config Generator API is running"}

# --- Run with Uvicorn (for local development) ---
# You would typically run this using: uvicorn main:app --reload
# In production, use a process manager like Gunicorn with Uvicorn workers.