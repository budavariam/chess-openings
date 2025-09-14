import React, { useState } from 'react'
import ChessPractice from './components/ChessPractice'

export default function App() {
  const [dark, setDark] = useState(() => { try { return localStorage.getItem('theme') !== 'light'; } catch(e) { return true } })
  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        <header className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-2xl font-semibold">Chess Openings Trainer</h1>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={dark} onChange={() => { setDark(d => { const next = !d; try { localStorage.setItem('theme', next ? 'dark' : 'light') } catch(e){}; return next }) }} />
              Dark
            </label>
          </div>
        </header>
        <main className="p-6">
          <ChessPractice />
        </main>
      </div>
    </div>
  )
}
