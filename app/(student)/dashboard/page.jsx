import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Dashboard from './Dashboard'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  // Pass only plain serializable values
  const user = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    class: session.user.class,
    rollNumber: session.user.rollNumber,
    section: session.user.section,
    role: session.user.role,
  }
  return <Dashboard user={user} />
}
