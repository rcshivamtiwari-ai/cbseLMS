import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import { LiveClass, Attendance, Progress } from '@/models/index'
import { authOptions } from '@/lib/auth'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  await connectDB()
  const query = session.user.role === 'admin' ? {} : { $or:[{ class:session.user.class },{ class:'Both' }] }
  const classes = await LiveClass.find(query).sort({ scheduledAt:-1 }).limit(20)
  return NextResponse.json({ classes })
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const body = await request.json()
  await connectDB()
  const meetingId = `cv-${body.class}-${Date.now()}`.toLowerCase()
  const cls = await LiveClass.create({ ...body, meetingId })
  return NextResponse.json({ class:cls }, { status:201 })
}

export async function PUT(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const { classId, action } = await request.json()
  await connectDB()
  if (action === 'join') {
    await Attendance.findOneAndUpdate({ classId, studentId:session.user.id }, { classId, studentId:session.user.id, date:new Date(), joinedAt:new Date(), status:'present' }, { upsert:true })
    await LiveClass.findByIdAndUpdate(classId, { $addToSet:{ attendees:session.user.id } })
    const today = new Date().toISOString().split('T')[0]
    await Progress.findOneAndUpdate({ studentId:session.user.id, date:today }, { $push:{ activities:{ activityType:'class_joined', subject:'General', timestamp:new Date() } }, lastActive:new Date() }, { upsert:true })
  }
  if (action === 'start' && session.user.role === 'admin') await LiveClass.findByIdAndUpdate(classId, { status:'live' })
  if (action === 'end' && session.user.role === 'admin') await LiveClass.findByIdAndUpdate(classId, { status:'ended' })
  return NextResponse.json({ ok:true })
}
