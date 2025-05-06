"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Loader2, Github, RefreshCw, Key } from "lucide-react"
import { DockerResults } from "@/components/docker-results"
import { TechStackDisplay } from "@/components/tech-stack-display"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TechStack {
  languages: string[]
  frameworks: string[]
  databases: string[]
  packageManager: string | null
  runtime: string | null
}

interface DockerfileInfo {
  content: string
  language: string
  location: string
  service: string
}

interface DockerConfigResponse {
  techStack: TechStack
  dockerfiles: DockerfileInfo[]
  dockerCompose: {
    content: string
    language: string
  }
}

interface Model {
  id: string
  name: string
}

export function GitHubRepoForm() {
  const [repoUrl, setRepoUrl] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dockerConfig, setDockerConfig] = useState<DockerConfigResponse | null>(null)
  const [models, setModels] = useState<Model[]>([])
  const [selectedModel, setSelectedModel] = useState<string>("gpt-4.1-mini-2025-04-14")
  const [isLoadingModels, setIsLoadingModels] = useState(false)

  const fetchModels = async (key: string) => {
    if (!key || key.length < 10) return;
    
    setIsLoadingModels(true);
    try {
      const response = await fetch("/api/list-models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey: key }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch models");
      }

      const data = await response.json();
      setModels(data.models);
    } catch (err) {
      console.error("Failed to fetch models:", err);
    } finally {
      setIsLoadingModels(false);
    }
  };

  // When API key changes and is valid length, fetch available models
  useEffect(() => {
    if (apiKey.length > 30) {
      fetchModels(apiKey);
    }
  }, [apiKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!repoUrl.trim()) {
      setError("Please enter a GitHub repository URL")
      return
    }

    if (!repoUrl.includes("github.com")) {
      setError("Please enter a valid GitHub repository URL")
      return
    }

    if (!apiKey.trim()) {
      setError("Please enter your OpenAI API key")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-docker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoUrl, apiKey, model: selectedModel }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Error: ${response.status}`)
      }

      const data = await response.json()
      setDockerConfig(data)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate Docker configuration. Please try again."
      setError(errorMessage)
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setDockerConfig(null)
    setError(null)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-6 bg-gray-800/50 border-gray-700 shadow-xl mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Github className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Enter GitHub repository URL"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="pl-10 bg-gray-900 border-gray-700 text-white"
            />
          </div>
          
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Key className="h-5 w-5 text-gray-400 my-auto" style={{ marginTop: '8px' }} />
            </div>
            <Input
              type="password"
              placeholder="Enter your OpenAI API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="pl-10 bg-gray-900 border-gray-700 text-white"
            />
            <p className="text-xs text-gray-400 mt-1">
              Your API key is never stored on our servers and is only used to make the request to OpenAI.
            </p>
          </div>
          
          {models.length > 0 && (
            <div className="flex-grow">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id} className="hover:bg-gray-700">
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400 mt-1">
                Select which OpenAI model to use for generating Docker configurations
              </p>
            </div>
          )}
          
          {isLoadingModels && (
            <div className="text-center text-sm text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
              Loading available models...
            </div>
          )}
          
          <Button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Generate Docker Config"
            )}
          </Button>

          {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
        </form>
      </Card>

      {dockerConfig && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Generated Configuration</h2>
            <Button variant="outline" onClick={handleReset} className="border-gray-700 text-gray-300 hover:bg-gray-700">
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate New
            </Button>
          </div>

          <TechStackDisplay techStack={dockerConfig.techStack} />
          <DockerResults dockerfiles={dockerConfig.dockerfiles} dockerCompose={dockerConfig.dockerCompose} />
        </div>
      )}
    </div>
  )
}
