import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Setting } from '@/models/index'

export async function GET() {
  try {
    await connectDB()
    const setting = await Setting.findOne({ key: 'enrollmentOpen' })

    // Handle both boolean true AND string "true" — fixes the toggle save bug
    const open = setting?.value === true
      || setting?.value === 'true'
      || setting?.value === 1
      || setting?.value === '1'

    return NextResponse.json({ open })
  } catch (error) {
    console.error('Enroll check error:', error)
    return NextResponse.json({ open: false })
  }
}
