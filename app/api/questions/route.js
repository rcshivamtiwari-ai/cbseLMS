import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import { Question } from '@/models/index'
import { authOptions } from '@/lib/auth'

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const body = await request.json()
  await connectDB()
  // Rename 'type' to 'questionType' to avoid Mongoose reserved field conflict
  const { type, ...rest } = body
  const q = await Question.create({ ...rest, questionType: type || body.questionType, isActive:true })
  return NextResponse.json({ id: q._id }, { status:201 })
}

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  await connectDB()
  const { searchParams } = new URL(request.url)
  const cls = searchParams.get('class') || session.user.class
  const subject = searchParams.get('subject')
  const query = { isActive:true, $or:[{ class:cls }, { class:'Both' }] }
  if (subject) query.subject = subject
  const questions = await Question.find(query).sort({ difficulty:1 })
  return NextResponse.json({ questions })
}
