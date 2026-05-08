import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import { User } from '@/models/index'
import { authOptions } from '@/lib/auth'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  await connectDB()
  const { searchParams } = new URL(request.url)
  const cls = searchParams.get('class')
  const query = { role:'student' }
  if (cls) query.class = cls
  const students = await User.find(query).select('-password').sort({ class:1, rollNumber:1 })
  return NextResponse.json({ students })
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const body = await request.json()
  const { name, email, password, class:cls, rollNumber, section, fatherName, phone, village, distanceFromSchool } = body
  if (!name || !email || !password || !cls || !rollNumber) return NextResponse.json({ error:'Missing required fields' }, { status:400 })
  await connectDB()
  const exists = await User.findOne({ email: email.toLowerCase() })
  if (exists) return NextResponse.json({ error:'Email already exists' }, { status:409 })
  const hashed = await bcrypt.hash(password, 12)
  const student = await User.create({ name, email:email.toLowerCase(), password:hashed, class:cls, rollNumber, section:section||'A', fatherName, phone, village, distanceFromSchool:distanceFromSchool||0, role:'student' })
  return NextResponse.json({ message:'Student created', id:student._id }, { status:201 })
}

export async function PUT(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const { students } = await request.json()
  await connectDB()
  let success = 0, failed = 0, errors = []
  for (const s of students) {
    try {
      const exists = await User.findOne({ email: s.email.toLowerCase() })
      if (exists) { failed++; errors.push(`${s.email} already exists`); continue }
      const hashed = await bcrypt.hash(s.password || `${s.rollNumber}@Vidyalaya`, 12)
      await User.create({ ...s, email:s.email.toLowerCase(), password:hashed, role:'student' })
      success++
    } catch (e) { failed++; errors.push(`${s.email}: ${e.message}`) }
  }
  return NextResponse.json({ success, failed, errors })
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  await connectDB()
  await User.findByIdAndUpdate(id, { isActive: false })
  return NextResponse.json({ message:'Student deactivated' })
}
