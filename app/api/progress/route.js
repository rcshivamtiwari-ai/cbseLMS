import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import { Progress, Submission, User } from '@/models/index'
import { authOptions } from '@/lib/auth'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  await connectDB()
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'my'
  const cls = searchParams.get('class') || session.user.class

  if (type === 'leaderboard') {
    const students = await User.find({ role:'student', class:cls, isActive:true }).select('name rollNumber section')
    const submissions = await Submission.find({ studentId:{ $in:students.map(s=>s._id) } })
    const board = students.map(s => {
      const subs = submissions.filter(sub => sub.studentId.toString() === s._id.toString())
      const avg = subs.length > 0 ? Math.round(subs.reduce((a,b)=>a+b.percentage,0)/subs.length) : 0
      return { student:s, avgScore:avg, tests:subs.length, totalMarks:subs.reduce((a,b)=>a+(b.marksObtained||0),0) }
    }).sort((a,b) => b.avgScore - a.avgScore || b.tests - a.tests)
    board.forEach((e,i) => { e.rank = i+1 })
    return NextResponse.json({ leaderboard:board })
  }

  if (type === 'my') {
    const [progress, submissions] = await Promise.all([
      Progress.find({ studentId:session.user.id }).sort({ date:-1 }).limit(30),
      Submission.find({ studentId:session.user.id }).populate('testId','title subject').sort({ submittedAt:-1 })
    ])
    const topicStats = {}
    for (const s of submissions) {
      const key = s.testId?.subject || 'General'
      if (!topicStats[key]) topicStats[key] = { sum:0, count:0 }
      topicStats[key].sum += s.percentage; topicStats[key].count++
    }
    const topicGPA = Object.entries(topicStats).map(([subject,d]) => ({ subject, avgScore:Math.round(d.sum/d.count), tests:d.count }))
    return NextResponse.json({ progress, submissions, topicGPA })
  }

  if (type === 'admin' && session.user.role === 'admin') {
    const today = new Date(); today.setHours(0,0,0,0)
    const [activeToday, allStudents] = await Promise.all([
      Progress.distinct('studentId', { lastActive:{ $gte:today } }),
      User.find({ role:'student' }).select('name rollNumber class lastLogin isActive')
    ])
    return NextResponse.json({ activeToday:activeToday.length, allStudents })
  }

  return NextResponse.json({ error:'Invalid type' }, { status:400 })
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const { type, details } = await request.json()
  await connectDB()
  const today = new Date().toISOString().split('T')[0]
  await Progress.findOneAndUpdate(
    { studentId:session.user.id, date:today },
    { $push:{ activities:{ activityType:type, ...details, timestamp:new Date() } }, $inc:{ dailyMinutes:details?.duration||0 }, lastActive:new Date() },
    { upsert:true }
  )
  return NextResponse.json({ ok:true })
}
