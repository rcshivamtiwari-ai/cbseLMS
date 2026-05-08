import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
export default async function Home() {
  const s = await getServerSession(authOptions)
  if (!s) redirect('/login')
  if (s.user.role === 'admin') redirect('/admin')
  redirect('/dashboard')
}
