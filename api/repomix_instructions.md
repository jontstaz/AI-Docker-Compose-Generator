# Repomix Instructions for Docker Config Generation

## Focus Areas
Focus on files and code structures that are essential for containerizing the application:

1. **Prioritize Build and Dependency Files:**
   - Package managers: `package.json`, `requirements.txt`, `Gemfile`, `build.gradle`, `pom.xml`, etc.
   - Lock files: `package-lock.json`, `yarn.lock`, `Pipfile.lock`, `poetry.lock`, etc.
   - Project config: `tsconfig.json`, `pyproject.toml`, `.csproj`, etc.

2. **Application Structure:**
   - Entry point files: `main.py`, `index.js`, `server.js`, `Program.cs`, `Main.java`, etc.
   - Application config: `.env.example`, `config.js`, `settings.py`, `application.properties`, etc.

3. **Runtime Environment Requirements:**
   - Node.js version (`.nvmrc`, `package.json` engines)
   - Python version (`runtime.txt`, `.python-version`)
   - Other runtime specifications

## Content Processing
When processing file content:

1. **Simplify Large Files:**
   - For large source files, include only imports/includes and function/class declarations
   - For data models, include schema definitions but not example data
   - For configuration files, include structure but omit lengthy comments

2. **Prioritize Non-Third-Party Code:**
   - Focus on custom application code rather than library/framework code
   - Include enough context to understand dependencies but not their implementations

3. **Extract Architectural Information:**
   - Database connections and configurations
   - Network service dependencies
   - Environment variables
   - Volume/persistent storage needs

## Special Handling
If these specific files exist, prioritize them as they might contain containerization info:

- Any existing `Dockerfile`, `docker-compose.yml`, or `.dockerignore`
- Scripts with `docker` or `container` in name or content
- `Procfile`, `app.yaml`, `manifest.yml`, or other cloud deployment configs
- READMEs that might contain deployment instructions

## Output Format Guidance
In the XML output:
- Ensure file paths are clearly indicated
- Include inline indicators for where content was truncated
- Preserve directory structure to understand the application organization 