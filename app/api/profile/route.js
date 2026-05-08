import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import { User } from '@/models/index'
import { authOptions } from '@/lib/auth'

export async function PUT(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const { type, currentPassword, newPassword } = await request.json()
  await connectDB()
  if (type === 'password') {
    const user = await User.findById(session.user.id)
    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) return NextResponse.json({ error:'Current password is wrong' }, { status:400 })
    if (!newPassword || newPassword.length < 6) return NextResponse.json({ error:'New password too short' }, { status:400 })
    const hashed = await bcrypt.hash(newPassword, 12)
    await User.findByIdAndUpdate(session.user.id, { password:hashed })
    return NextResponse.json({ message:'Password changed!' })
  }
  return NextResponse.json({ error:'Invalid type' }, { status:400 })
}
