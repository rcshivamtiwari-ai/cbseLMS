import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Setting } from '@/models/index'

// GET — public check if enrollment is open
export async function GET() {
  try {
    await connectDB()
    const setting = await Setting.findOne({ key: 'enrollmentOpen' })
    const open = setting?.value === true

    return NextResponse.json({ open })
  } catch (error) {
    console.error('Enroll check error:', error)
    return NextResponse.json({ open: false })
  }
}
