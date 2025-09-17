import React, { useState, useEffect } from 'react'
import { ToastContainer } from 'react-toastify'
import ChessPractice from './ChessPractice'
import 'react-toastify/dist/ReactToastify.css'

export default function App() {
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem('theme')
      if (saved !== null) {
        return saved === 'dark'
      }
      // Default to system preference instead of true
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch (e) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  })


  // Apply dark class to document element on mount and when dark state changes
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [dark])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <header className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
        <h1 className="text-2xl font-semibold">Chess Openings Trainer</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setDark(d => {
                const next = !d
                try {
                  localStorage.setItem('theme', next ? 'dark' : 'light')
                } catch (e) { }
                return next
              })
            }}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            title="Toggle dark mode"
          >
            {dark ? '☀️' : '🌙'}
          </button>
        </div>
      </header>
      <main className="p-6">
        <ChessPractice />
      </main>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={dark ? 'dark' : 'light'}
      />
    </div>
  )
}
