"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { CodeBlock } from "@/components/code-block"

interface CodeFileType {
  content: string
  language: string
}

interface DockerResultsProps {
  dockerfile: CodeFileType | string
  dockerCompose: CodeFileType | string
}

export function DockerResults({ dockerfile, dockerCompose }: DockerResultsProps) {
  const [copiedDockerfile, setCopiedDockerfile] = useState(false)
  const [copiedCompose, setCopiedCompose] = useState(false)

  // Get content and language from props, handling both new and old format
  const getDockerfileContent = (): string => {
    return typeof dockerfile === 'string' ? dockerfile : dockerfile.content
  }

  const getDockerfileLanguage = (): string => {
    return typeof dockerfile === 'string' ? 'dockerfile' : dockerfile.language
  }

  const getComposeContent = (): string => {
    return typeof dockerCompose === 'string' ? dockerCompose : dockerCompose.content
  }

  const getComposeLanguage = (): string => {
    return typeof dockerCompose === 'string' ? 'yaml' : dockerCompose.language
  }

  const copyToClipboard = async (text: string, type: "dockerfile" | "compose") => {
    await navigator.clipboard.writeText(text)

    if (type === "dockerfile") {
      setCopiedDockerfile(true)
      setTimeout(() => setCopiedDockerfile(false), 2000)
    } else {
      setCopiedCompose(true)
      setTimeout(() => setCopiedCompose(false), 2000)
    }
  }

  return (
    <Tabs defaultValue="dockerfile" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-gray-800">
        <TabsTrigger value="dockerfile" className="data-[state=active]:bg-gray-700">
          Dockerfile
        </TabsTrigger>
        <TabsTrigger value="docker-compose" className="data-[state=active]:bg-gray-700">
          docker-compose.yaml
        </TabsTrigger>
      </TabsList>

      <TabsContent value="dockerfile" className="mt-4">
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 z-10 text-gray-400 hover:text-white hover:bg-gray-700"
            onClick={() => copyToClipboard(getDockerfileContent(), "dockerfile")}
          >
            {copiedDockerfile ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="ml-2">{copiedDockerfile ? "Copied!" : "Copy"}</span>
          </Button>
          <div className="mt-2">
            <CodeBlock code={getDockerfileContent()} language={getDockerfileLanguage()} />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="docker-compose" className="mt-4">
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 z-10 text-gray-400 hover:text-white hover:bg-gray-700"
            onClick={() => copyToClipboard(getComposeContent(), "compose")}
          >
            {copiedCompose ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="ml-2">{copiedCompose ? "Copied!" : "Copy"}</span>
          </Button>
          <div className="mt-2">
            <CodeBlock code={getComposeContent()} language={getComposeLanguage()} />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}
