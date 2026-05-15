// models/Remark.js — Add this to your models/index.js

// ── Remark ────────────────────────────────────────────────────
// RemarkSchema to add at end of models/index.js:
/*
const RemarkSchema = new mongoose.Schema({
  studentId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacherId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject:    { type: String, enum: ['Python','Networks','Database','AI','General'], required: true },
  topic:      { type: String, required: true },
  type:       { type: String, enum: ['strength','weakness','improvement','praise','concern'], required: true },
  remark:     { type: String, required: true },
  isPrivate:  { type: Boolean, default: false }, // private = only teacher sees
  createdAt:  { type: Date, default: Date.now },
});
export const Remark = mongoose.models.Remark || mongoose.model('Remark', RemarkSchema);
*/

// ── API: app/api/remarks/route.js ──────────────────────────────
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import mongoose from 'mongoose'
import { authOptions } from '@/lib/auth'

// Inline model definition so it works without touching models/index.js
const RemarkSchema = new mongoose.Schema({
  studentId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacherId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacherName:{ type: String },
  subject:    { type: String, required: true },
  topic:      { type: String, required: true },
  type:       { type: String, enum: ['strength','weakness','improvement','praise','concern'], default: 'improvement' },
  remark:     { type: String, required: true },
  isPrivate:  { type: Boolean, default: false },
  createdAt:  { type: Date, default: Date.now },
})
const Remark = mongoose.models.Remark || mongoose.model('Remark', RemarkSchema)

// GET — fetch remarks
// Admin: get all or by studentId
// Student: get their own non-private remarks
export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get('studentId')
  const subject   = searchParams.get('subject')

  let query = {}

  if (session.user.role === 'admin') {
    // Teacher sees all remarks
    if (studentId) query.studentId = studentId
    if (subject)   query.subject   = subject
  } else {
    // Student sees only their own, non-private remarks
    query.studentId = session.user.id
    query.isPrivate = false
    if (subject) query.subject = subject
  }

  const remarks = await Remark.find(query)
    .populate('studentId', 'name rollNumber class')
    .populate('teacherId', 'name')
    .sort({ createdAt: -1 })
    .limit(100)

  // Group by subject for topic-wise view
  const bySubject = {}
  for (const r of remarks) {
    if (!bySubject[r.subject]) bySubject[r.subject] = []
    bySubject[r.subject].push(r)
  }

  return NextResponse.json({ remarks, bySubject })
}

// POST — add a remark (admin/teacher only)
export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Only teachers can add remarks' }, { status: 401 })
  }

  const body = await request.json()
  const { studentId, subject, topic, type, remark, isPrivate } = body

  if (!studentId || !subject || !topic || !remark) {
    return NextResponse.json({ error: 'studentId, subject, topic and remark are required' }, { status: 400 })
  }

  await connectDB()

  const newRemark = await Remark.create({
    studentId,
    teacherId:   session.user.id,
    teacherName: session.user.name,
    subject,
    topic,
    type: type || 'improvement',
    remark,
    isPrivate: isPrivate || false,
  })

  return NextResponse.json({ remark: newRemark }, { status: 201 })
}

// DELETE — remove a remark (only teacher who wrote it)
export async function DELETE(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await connectDB()
  await Remark.findOneAndDelete({ _id: id, teacherId: session.user.id })
  return NextResponse.json({ deleted: true })
}
