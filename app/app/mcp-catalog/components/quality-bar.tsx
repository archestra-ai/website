"use client"

import { useEffect, useState } from "react"

interface QualityBarProps {
  score: number | null
  className?: string
}

export function QualityBar({ score, className = "" }: QualityBarProps) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    if (score !== null) {
      const timer = setTimeout(() => {
        setAnimatedScore(score)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [score])
  
  if (score === null) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-700">Quality Score</span>
          <span className="text-xs text-gray-400 italic">Pending</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-gray-300 rounded-full animate-pulse" />
        </div>
      </div>
    )
  }

  const getColor = (score: number) => {
    if (score >= 90) return "bg-green-600"
    if (score >= 80) return "bg-green-500"
    if (score >= 70) return "bg-green-400"
    if (score >= 60) return "bg-emerald-400"
    if (score >= 50) return "bg-teal-400"
    if (score >= 40) return "bg-yellow-500"
    if (score >= 30) return "bg-orange-500"
    return "bg-red-500"
  }

  const getGlow = (score: number) => {
    if (score >= 90) return "shadow-green-600/50"
    if (score >= 80) return "shadow-green-500/50"
    if (score >= 70) return "shadow-green-400/50"
    if (score >= 60) return "shadow-emerald-400/50"
    if (score >= 50) return "shadow-teal-400/50"
    if (score >= 40) return "shadow-yellow-500/50"
    if (score >= 30) return "shadow-orange-500/50"
    return "shadow-red-500/50"
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-700">Quality Score</span>
        <span className="text-xs font-semibold text-gray-900">{score}/100</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${getColor(score)} ${getGlow(score)}`}
          style={{ 
            width: `${animatedScore}%`,
            boxShadow: animatedScore > 0 ? `0 0 8px var(--tw-shadow-color)` : 'none'
          }}
        />
      </div>
    </div>
  )
}