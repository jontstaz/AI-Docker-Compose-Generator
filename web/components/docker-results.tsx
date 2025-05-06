"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { CodeBlock } from "@/components/code-block"

interface DockerfileInfo {
  content: string
  language: string
  location: string
  service: string
}

interface DockerResultsProps {
  dockerfiles: DockerfileInfo[]
  dockerCompose: {
    content: string
    language: string
  }
}

export function DockerResults({ dockerfiles, dockerCompose }: DockerResultsProps) {
  const [copiedDockerfile, setCopiedDockerfile] = useState<Record<string, boolean>>({})
  const [copiedCompose, setCopiedCompose] = useState(false)

  // Sort dockerfiles by service name for consistent display
  const sortedDockerfiles = [...dockerfiles].sort((a, b) => a.service.localeCompare(b.service))

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text)

    if (type === "compose") {
      setCopiedCompose(true)
      setTimeout(() => setCopiedCompose(false), 2000)
    } else {
      // For Dockerfiles, use the service name as the key
      setCopiedDockerfile(prev => ({ ...prev, [type]: true }))
      setTimeout(() => {
        setCopiedDockerfile(prev => ({ ...prev, [type]: false }))
      }, 2000)
    }
  }

  // Create tab values for all Dockerfiles plus docker-compose
  const allTabValues = [
    ...sortedDockerfiles.map(df => df.service),
    "docker-compose"
  ]

  return (
    <Tabs defaultValue={allTabValues[0]} className="w-full">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-white">
          Docker Configurations 
          {sortedDockerfiles.length > 1 && (
            <span className="ml-2 text-xs font-medium bg-emerald-800 text-emerald-100 px-2 py-0.5 rounded-full">
              {sortedDockerfiles.length} Dockerfiles
            </span>
          )}
        </h3>
      </div>
      <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${allTabValues.length}, minmax(0, 1fr))` }}>
        {sortedDockerfiles.map(df => {
          return (
            <TabsTrigger 
              key={df.service} 
              value={df.service} 
              className="data-[state=active]:bg-gray-700 truncate"
              title={`${df.service} (${df.location})`}
            >
              {df.service}
            </TabsTrigger>
          );
        })}
        <TabsTrigger value="docker-compose" className="data-[state=active]:bg-gray-700">
          docker-compose
        </TabsTrigger>
      </TabsList>

      {/* Dockerfile tabs */}
      {sortedDockerfiles.map(df => (
        <TabsContent key={df.service} value={df.service} className="mt-4">
          <div className="relative">
            <div className="mb-3 flex flex-col">
              <span className="text-sm text-gray-400 mb-1">
                <span className="font-semibold">Service:</span> {df.service}
              </span>
              <span className="text-sm text-gray-400">
                <span className="font-semibold">Path:</span> <code className="bg-gray-800 px-1 py-0.5 rounded">{df.location}</code>
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 text-gray-400 hover:text-white hover:bg-gray-700"
              onClick={() => copyToClipboard(df.content, df.service)}
            >
              {copiedDockerfile[df.service] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="ml-2">{copiedDockerfile[df.service] ? "Copied!" : "Copy"}</span>
            </Button>
            <CodeBlock code={df.content} language={df.language} />
          </div>
        </TabsContent>
      ))}

      {/* Docker Compose tab */}
      <TabsContent value="docker-compose" className="mt-4">
        <div className="relative">
          <div className="mb-3">
            <span className="text-sm text-gray-400">
              <span className="font-semibold">File:</span> <code className="bg-gray-800 px-1 py-0.5 rounded">docker-compose.yaml</code>
            </span>
            {sortedDockerfiles.length > 1 && (
              <div className="mt-1 text-xs text-gray-500">
                References {sortedDockerfiles.length} services: {sortedDockerfiles.map(df => df.service).join(', ')}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 text-gray-400 hover:text-white hover:bg-gray-700"
            onClick={() => copyToClipboard(dockerCompose.content, "compose")}
          >
            {copiedCompose ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="ml-2">{copiedCompose ? "Copied!" : "Copy"}</span>
          </Button>
          <CodeBlock code={dockerCompose.content} language={dockerCompose.language} />
        </div>
      </TabsContent>
    </Tabs>
  )
}
