"use client"

import type React from "react"

import { useState } from "react"

interface NameEntryProps {
  onNameSubmit: (name: string) => void
}

export function NameEntry({ onNameSubmit }: NameEntryProps) {
  const [name, setName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onNameSubmit(name.trim())
    }
  }

  return (
    <div className="w-full max-w-md p-8 space-y-6 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-xl">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-balance text-gray-900 dark:text-white">Card Flip Game</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Enter your name to begin</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
            autoFocus
          />
        </div>
        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full h-12 text-lg font-semibold rounded-md bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Start Game
        </button>
      </form>
    </div>
  )
}
