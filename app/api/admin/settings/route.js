import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import { Setting } from '@/models/index'
import { authOptions } from '@/lib/auth'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  await connectDB()
  const all = await Setting.find({})
  const result = { enrollmentOpen:false, openToPublic:false }
  all.forEach(s => { result[s.key] = s.value })
  return NextResponse.json(result)
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const body = await request.json()
  await connectDB()
  for (const [key, value] of Object.entries(body)) {
    await Setting.findOneAndUpdate({ key }, { key, value, updatedAt:new Date() }, { upsert:true })
  }
  return NextResponse.json({ ok:true })
}
