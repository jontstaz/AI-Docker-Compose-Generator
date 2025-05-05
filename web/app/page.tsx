import { GitHubRepoForm } from "@/components/github-repo-form"
import { ThemeProvider } from "@/components/theme-provider"

export default function Home() {
  return (
    <ThemeProvider defaultTheme="dark" forcedTheme="dark">
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-12 text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
              AI Docker Generator
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Generate optimized Docker configurations for any GitHub repository with AI-powered analysis
            </p>
          </header>

          <GitHubRepoForm />
        </div>
      </main>
    </ThemeProvider>
  )
}
