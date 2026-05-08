import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import { Test, Submission, Progress } from '@/models/index'
import { authOptions } from '@/lib/auth'

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const { testId, answers, timeUsed } = await request.json()
  await connectDB()
  const test = await Test.findById(testId).populate('questions')
  if (!test) return NextResponse.json({ error:'Test not found' }, { status:404 })

  let marksObtained = 0
  const evaluated = answers.map(a => {
    const q = test.questions.find(q => q._id.toString() === a.questionId)
    if (!q) return a
    const isCorrect = q.correctAnswer.trim().toLowerCase() === (a.answer||'').trim().toLowerCase()
    const marksAwarded = isCorrect ? q.marks : 0
    marksObtained += marksAwarded
    return { ...a, isCorrect, marksAwarded }
  })

  const percentage = Math.round((marksObtained / test.totalMarks) * 100)
  const grade = percentage>=90?'A+':percentage>=80?'A':percentage>=70?'B':percentage>=60?'C':percentage>=33?'D':'F'

  const submission = await Submission.create({
    testId, studentId:session.user.id, answers:evaluated,
    totalMarks:test.totalMarks, marksObtained, percentage, grade,
    timeUsed, status:'evaluated'
  })

  const today = new Date().toISOString().split('T')[0]
  await Progress.findOneAndUpdate(
    { studentId:session.user.id, date:today },
    { $push:{ activities:{ activityType:'test_taken', subject:test.subject, score:percentage, details:test.title, timestamp:new Date() } }, lastActive:new Date() },
    { upsert:true }
  )

  return NextResponse.json({ submission, percentage, grade, marksObtained, totalMarks:test.totalMarks })
}

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  await connectDB()
  const { searchParams } = new URL(request.url)
  const testId = searchParams.get('testId')
  const query = session.user.role === 'admin'
    ? (testId ? { testId } : {})
    : { studentId:session.user.id, ...(testId ? { testId } : {}) }
  const submissions = await Submission.find(query)
    .populate('testId','title subject totalMarks')
    .populate('studentId','name rollNumber class section')
    .sort({ submittedAt:-1 })
  return NextResponse.json({ submissions })
}
