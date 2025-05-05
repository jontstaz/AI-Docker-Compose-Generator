"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code2, Database, Package, Terminal, Code } from "lucide-react"

interface TechStack {
  languages: string[]
  frameworks: string[]
  databases: string[]
  packageManager: string | null
  runtime: string | null
}

interface TechStackDisplayProps {
  techStack: TechStack
}

export function TechStackDisplay({ techStack }: TechStackDisplayProps) {
  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4 text-gray-200">Detected Technology Stack</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center mb-2">
              <Code2 className="h-5 w-5 mr-2 text-emerald-400" />
              <h4 className="text-sm font-medium text-gray-300">Languages</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {techStack.languages.length > 0 ? (
                techStack.languages.map((lang) => (
                  <Badge key={lang} variant="outline" className="bg-gray-700/50 text-emerald-300 border-emerald-800">
                    {lang}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-gray-400">None detected</span>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center mb-2">
              <Code className="h-5 w-5 mr-2 text-cyan-400" />
              <h4 className="text-sm font-medium text-gray-300">Frameworks</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {techStack.frameworks.length > 0 ? (
                techStack.frameworks.map((framework) => (
                  <Badge key={framework} variant="outline" className="bg-gray-700/50 text-cyan-300 border-cyan-800">
                    {framework}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-gray-400">None detected</span>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center mb-2">
              <Database className="h-5 w-5 mr-2 text-purple-400" />
              <h4 className="text-sm font-medium text-gray-300">Databases</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {techStack.databases.length > 0 ? (
                techStack.databases.map((db) => (
                  <Badge key={db} variant="outline" className="bg-gray-700/50 text-purple-300 border-purple-800">
                    {db}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-gray-400">None detected</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {techStack.packageManager && (
              <div>
                <div className="flex items-center mb-2">
                  <Package className="h-5 w-5 mr-2 text-yellow-400" />
                  <h4 className="text-sm font-medium text-gray-300">Package Manager</h4>
                </div>
                <Badge variant="outline" className="bg-gray-700/50 text-yellow-300 border-yellow-800">
                  {techStack.packageManager}
                </Badge>
              </div>
            )}

            {techStack.runtime && (
              <div>
                <div className="flex items-center mb-2">
                  <Terminal className="h-5 w-5 mr-2 text-red-400" />
                  <h4 className="text-sm font-medium text-gray-300">Runtime</h4>
                </div>
                <Badge variant="outline" className="bg-gray-700/50 text-red-300 border-red-800">
                  {techStack.runtime}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
