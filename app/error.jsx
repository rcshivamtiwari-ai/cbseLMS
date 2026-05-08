'use client'
import { useEffect } from 'react'

export default function Error({ error, reset }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center p-8 max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="font-['Poppins',sans-serif] text-2xl font-bold text-slate-800 mb-2">Something went wrong</h2>
        <p className="text-slate-500 mb-6 text-sm">{error?.message || 'An unexpected error occurred. Please try again.'}</p>
        <button onClick={reset} className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">
          Try Again
        </button>
      </div>
    </div>
  )
}
