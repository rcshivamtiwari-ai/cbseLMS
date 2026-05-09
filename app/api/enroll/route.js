import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import { User, Setting } from '@/models/index'

// POST — register a new student (public, no auth needed)
export async function POST(request) {
  try {
    await connectDB()

    // Check if enrollment is open
    const setting = await Setting.findOne({ key: 'enrollmentOpen' })
    if (!setting || !setting.value) {
      return NextResponse.json(
        { error: 'Enrollment is currently closed. Contact your teacher.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name, email, password, class: cls, rollNumber,
      section, fatherName, phone, village, distanceFromSchool,
    } = body

    // Validate required fields
    if (!name || !email || !password || !cls || !rollNumber) {
      return NextResponse.json(
        { error: 'Name, email, password, class and roll number are required.' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters.' },
        { status: 400 }
      )
    }

    if (!['X', 'XII'].includes(cls)) {
      return NextResponse.json(
        { error: 'Class must be X or XII.' },
        { status: 400 }
      )
    }

    // Check duplicate email
    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() })
    if (existingEmail) {
      return NextResponse.json(
        { error: 'This email is already registered. Try logging in instead.' },
        { status: 409 }
      )
    }

    // Check duplicate roll number in same class
    const existingRoll = await User.findOne({ rollNumber: rollNumber.trim(), class: cls })
    if (existingRoll) {
      return NextResponse.json(
        { error: `Roll number ${rollNumber} is already registered for Class ${cls}. Contact your teacher.` },
        { status: 409 }
      )
    }

    // Hash password and create user
    const hashed = await bcrypt.hash(password, 12)
    const student = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      class: cls,
      rollNumber: rollNumber.trim(),
      section: section?.trim() || 'A',
      fatherName: fatherName?.trim() || '',
      phone: phone?.trim() || '',
      village: village?.trim() || '',
      distanceFromSchool: Number(distanceFromSchool) || 0,
      role: 'student',
      isActive: true,
    })

    return NextResponse.json(
      { message: 'Account created successfully!', id: student._id.toString() },
      { status: 201 }
    )
  } catch (error) {
    console.error('Enrollment error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
