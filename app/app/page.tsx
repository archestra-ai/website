import { Linkedin } from "lucide-react"
import { EmailForm } from "../components/email-form"
import { SlackButton } from "../components/slack-button"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container flex items-center px-4 md:px-6 justify-between h-16">
          <div className="flex items-center gap-2">
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
          <div className="flex flex-col items-center justify-center space-y-4">
            <p className="text-sm text-gray-500">Founded with conviction and urgency by</p>
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
              <a
                href="https://www.linkedin.com/in/josephorlando1/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-700 hover:text-yellow-600 transition-colors"
              >
                <Linkedin size={18} />
                <span>Joey Orlando</span>
              </a>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="w-full max-w-lg">
                <SlackButton />
                
              </div>
              <div className="w-full max-w-lg">
                <EmailForm />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer with Founder Links */}
      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center">
            <p className="text-xs text-gray-400">© 2025 Archestra.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
