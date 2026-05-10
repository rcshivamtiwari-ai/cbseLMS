import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import { Setting } from '@/models/index'
import { authOptions } from '@/lib/auth'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await connectDB()
  const all = await Setting.find({})
  const result = { enrollmentOpen: false, openToPublic: false }
  all.forEach(s => {
    // Normalize to real boolean when reading
    result[s.key] = s.value === true || s.value === 'true'
  })
  return NextResponse.json(result)
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await request.json()
  await connectDB()

  for (const [key, value] of Object.entries(body)) {
    // Always save as real boolean — fixes the "true" string problem
    const boolValue = value === true || value === 'true'
    await Setting.findOneAndUpdate(
      { key },
      { key, value: boolValue, updatedAt: new Date() },
      { upsert: true, new: true }
    )
  }
  return NextResponse.json({ ok: true })
}
