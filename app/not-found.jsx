import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center p-8">
        <div className="text-8xl mb-4">📚</div>
        <h1 className="font-['Poppins',sans-serif] text-4xl font-bold text-slate-800 mb-2">404</h1>
        <p className="text-slate-500 text-lg mb-6">Oops! Page not found.</p>
        <Link href="/" className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-medium transition-colors inline-block">
          Go to Dashboard →
        </Link>
      </div>
    </div>
  )
}
