"use client"

import { Github } from "lucide-react"
import { useEffect, useState } from "react"

export function GitHubStars() {
  const [stars, setStars] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStars() {
      try {
        const response = await fetch("https://api.github.com/repos/archestraai/archestra")
        if (response.ok) {
          const data = await response.json()
          setStars(data.stargazers_count)
        }
      } catch (error) {
        console.error("Failed to fetch GitHub stars:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStars()
  }, [])

  return (
    <a
      href="https://github.com/archestraai/archestra"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-3 py-2 border border-dashed rounded-md hover:bg-gray-50 transition-colors"
    >
      <Github size={16} />
      <span>GitHub</span>
      <span className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"
          />
        </svg>
        <span>{loading ? "..." : stars || "0"}</span>
      </span>
    </a>
  )
}
