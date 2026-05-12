import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import { Question, Progress } from '@/models/index'
import { authOptions } from '@/lib/auth'

// GET - fetch today's 5 questions (or check if already done)
export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  const today = new Date().toISOString().split('T')[0]

  // Check if student already did today's quiz
  const progress = await Progress.findOne({ studentId: session.user.id, date: today })
  const quizActivity = progress?.activities?.find(a => a.activityType === 'daily_quiz_done')

  if (quizActivity) {
    return NextResponse.json({
      alreadyDone: true,
      score: { score: quizActivity.score, total: quizActivity.details },
    })
  }

  // Get questions for student's class
  const cls = session.user.class || 'XII'
  const questions = await Question.find({
    isActive: true,
    $or: [{ class: cls }, { class: 'Both' }],
  })

  if (questions.length === 0) {
    return NextResponse.json({ questions: [], message: 'No questions available yet' })
  }

  // Pick 5 random questions
  const shuffled = questions.sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, Math.min(5, shuffled.length))

  // Return questions with options but hide explanation until answered
  const clean = selected.map(q => ({
    _id: q._id,
    question: q.question,
    options: q.questionType === 'TrueFalse' ? ['True', 'False'] : q.options.filter(o => o),
    correctAnswer: q.correctAnswer,
    explanation: q.hint || '',
    subject: q.subject,
    difficulty: q.difficulty,
    topic: q.topic,
    questionType: q.questionType,
  }))

  return NextResponse.json({ questions: clean, alreadyDone: false })
}

// POST - save quiz result
export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { score, total, answers } = await request.json()
  await connectDB()

  const today = new Date().toISOString().split('T')[0]
  const percentage = Math.round((score / total) * 100)

  await Progress.findOneAndUpdate(
    { studentId: session.user.id, date: today },
    {
      $push: {
        activities: {
          activityType: 'daily_quiz_done',
          subject: 'General',
          topic: 'Daily Quiz',
          score: percentage,
          details: total.toString(),
          timestamp: new Date(),
        }
      },
      lastActive: new Date(),
    },
    { upsert: true }
  )

  return NextResponse.json({ saved: true, score, total, percentage })
}
