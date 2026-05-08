import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import { Test } from '@/models/index'
import { authOptions } from '@/lib/auth'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  await connectDB()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (id) {
    const test = await Test.findById(id).populate('questions')
    return NextResponse.json({ test })
  }
  const query = session.user.role === 'admin' ? {} : { class:session.user.class, status:{ $in:['live','completed'] } }
  const tests = await Test.find(query).sort({ createdAt:-1 })
  return NextResponse.json({ tests })
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const body = await request.json()
  await connectDB()
  const test = await Test.create({ ...body, createdBy:session.user.id })
  return NextResponse.json({ test }, { status:201 })
}

export async function PUT(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const { id, ...updates } = await request.json()
  await connectDB()
  const test = await Test.findByIdAndUpdate(id, updates, { new:true })
  return NextResponse.json({ test })
}
