"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Loader2, Github, RefreshCw, Server } from "lucide-react"
import { DockerResults } from "@/components/docker-results"
import { TechStackDisplay } from "@/components/tech-stack-display"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

export function GitHubRepoForm() {
  const [repoUrl, setRepoUrl] = useState("")
  const [apiProvider, setApiProvider] = useState("openai")
  const [apiEndpoint, setApiEndpoint] = useState("http://localhost:11434/v1")
  const [modelName, setModelName] = useState("gpt-4.1-mini-2025-04-14")
  const [ollamaModelName, setOllamaModelName] = useState("llama3")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dockerConfig, setDockerConfig] = useState<DockerConfigResponse | null>(null)

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

    // Validate Ollama endpoint if Ollama is selected
    if (apiProvider === "ollama" && !apiEndpoint) {
      setError("Please enter the Ollama API endpoint URL")
      return
    }

    setIsLoading(true)
    setError(null)

    // Determine which model name to use based on provider
    const effectiveModelName = apiProvider === "openai" ? modelName : ollamaModelName

    try {
      const response = await fetch("/api/generate-docker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          repoUrl,
          apiProvider,
          apiEndpoint: apiProvider === "ollama" ? apiEndpoint : null,
          modelName: effectiveModelName
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      setDockerConfig(data)
    } catch (err) {
      setError("Failed to generate Docker configuration. Please try again.")
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3">
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
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-300">Model Provider</h3>
            <Tabs
              value={apiProvider}
              onValueChange={setApiProvider}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 bg-gray-900 border border-gray-800 p-1 rounded-lg">
                <TabsTrigger 
                  value="openai" 
                  className="py-2 px-4 rounded-md transition-all duration-200
                    text-gray-400 hover:text-gray-200 hover:bg-gray-800
                    data-[state=active]:bg-emerald-700 data-[state=active]:text-white
                    data-[state=active]:shadow-md"
                >
                  OpenAI
                </TabsTrigger>
                <TabsTrigger 
                  value="ollama" 
                  className="py-2 px-4 rounded-md transition-all duration-200
                    text-gray-400 hover:text-gray-200 hover:bg-gray-800
                    data-[state=active]:bg-emerald-700 data-[state=active]:text-white
                    data-[state=active]:shadow-md"
                >
                  Local Ollama
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="openai" className="mt-4 space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">OpenAI Model</p>
                  <Input
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    className="mt-1 bg-gray-900 border-gray-700 text-white"
                    placeholder="gpt-4.1-mini-2025-04-14"
                  />
                  <p className="mt-1 text-xs text-gray-500">Requires OPENAI_API_KEY to be set on the server</p>
                </div>
              </TabsContent>
              
              <TabsContent value="ollama" className="mt-4 space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Ollama API Endpoint</p>
                  <Input
                    value={apiEndpoint}
                    onChange={(e) => setApiEndpoint(e.target.value)}
                    className="mt-1 bg-gray-900 border-gray-700 text-white"
                    placeholder="http://localhost:11434/v1"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Ollama Model</p>
                  <Input
                    value={ollamaModelName}
                    onChange={(e) => setOllamaModelName(e.target.value)}
                    className="mt-1 bg-gray-900 border-gray-700 text-white"
                    placeholder="llama3"
                  />
                  <p className="mt-1 text-xs text-gray-500">Must be a model you have pulled in Ollama</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
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
