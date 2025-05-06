"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Loader2, Github, RefreshCw } from "lucide-react"
import { DockerResults } from "@/components/docker-results"
import { TechStackDisplay } from "@/components/tech-stack-display"

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

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-docker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoUrl }),
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
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Generate Docker Config"
              )}
            </Button>
          </div>

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
