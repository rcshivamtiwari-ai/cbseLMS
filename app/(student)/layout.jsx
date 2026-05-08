import Sidebar from '@/components/Sidebar'

export default function StudentLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto p-6">{children}</div>
      </main>
    </div>
  )
}
