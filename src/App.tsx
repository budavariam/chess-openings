import React, { useState } from 'react'
import { ToastContainer } from 'react-toastify'
import ChessPractice from './components/ChessPractice'
import 'react-toastify/dist/ReactToastify.css'

export default function App() {
  const [dark, setDark] = useState(() => { 
    try { 
      return localStorage.getItem('theme') !== 'light' 
    } catch(e) { 
      return true 
    } 
  })

  return (
    <div className={dark ? 'dark' : ''}>
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
                  } catch(e) {}
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
          position="top-right"
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
    </div>
  )
}
