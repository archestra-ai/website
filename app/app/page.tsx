import { Linkedin } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container flex items-center px-4 md:px-6 justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="bg-yellow-400 p-2 rounded">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="4" y1="20" x2="20" y2="4" stroke="black" strokeWidth="2" strokeLinecap="round" />
                <circle cx="20" cy="4" r="2" fill="black" />
              </svg>
            </div>
            <span className="font-mono text-2xl text-black">archestra.ai</span>
          </div>
          <div className="flex items-center gap-2"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col">
        {/* Grid Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="container relative z-10 px-4 md:px-6 flex flex-col items-center justify-center flex-1">
          <div className="flex flex-col items-center justify-center text-center max-w-4xl w-full">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-6 text-center">
                Orchestration Platform for Agentic Apps
              </h1>
              <p className="text-xl text-gray-700 mb-8 max-w-md mx-auto">
                Archestra enables enterprises to manage agentic actions with robust guardrails, security, and
                enterprise-grade controls.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer with Founder Links */}
      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <p className="text-sm text-gray-500">Founded by</p>
            <div className="flex flex-wrap gap-6 justify-center">
              <a
                href="https://www.linkedin.com/in/ildari/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-700 hover:text-yellow-600 transition-colors"
              >
                <Linkedin size={18} />
                <span>Ildar Iskhakov</span>
              </a>
              <a
                href="https://www.linkedin.com/in/motakuk/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-700 hover:text-yellow-600 transition-colors"
              >
                <Linkedin size={18} />
                <span>Matvey Kukuy</span>
              </a>
            </div>
            <p className="text-xs text-gray-400 mt-4">© 2025 Archestra.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
