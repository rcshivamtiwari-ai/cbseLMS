import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/dashboard')
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto p-6">{children}</div>
      </main>
    </div>
  )
}
