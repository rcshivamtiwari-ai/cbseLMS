// ════════════════════════════════════════════════════════════════
// MULTI-TEACHER SUPPORT
// Add these to your project:
// 1. app/api/teachers/route.js  ← this file
// 2. app/(admin)/admin/teachers/page.jsx  ← teacher management UI
// ════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import { User } from '@/models/index'
import { authOptions } from '@/lib/auth'

// GET — list all teachers
export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await connectDB()
  const teachers = await User.find({ role: 'admin' }).select('-password').sort({ createdAt: 1 })
  return NextResponse.json({ teachers })
}

// POST — create a new teacher account
export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, email, password, subject, phone } = await request.json()

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 })
  }

  await connectDB()

  const exists = await User.findOne({ email: email.toLowerCase() })
  if (exists) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 12)
  const teacher = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashed,
    role: 'admin',           // teachers get admin role = full access
    class: 'XII',            // default, not really used for teachers
    rollNumber: `TCH-${Date.now()}`,
    phone: phone || '',
    isActive: true,
    createdAt: new Date(),
  })

  return NextResponse.json({
    message: 'Teacher account created!',
    teacher: {
      id: teacher._id,
      name: teacher.name,
      email: teacher.email,
    }
  }, { status: 201 })
}

// DELETE — deactivate a teacher
export async function DELETE(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  // Prevent deleting yourself
  if (id === session.user.id) {
    return NextResponse.json({ error: 'You cannot deactivate your own account' }, { status: 400 })
  }

  await connectDB()
  await User.findByIdAndUpdate(id, { isActive: false })
  return NextResponse.json({ message: 'Teacher deactivated' })
}
