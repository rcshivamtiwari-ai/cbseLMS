import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import { User, Progress, Submission, Attendance } from '@/models/index'
import { authOptions } from '@/lib/auth'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  await connectDB()
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const cls = searchParams.get('class')
  const studentId = searchParams.get('studentId')

  if (type === 'dashboard') {
    const days = parseInt(searchParams.get('days')||'7')
    const since = new Date(); since.setDate(since.getDate()-days)
    const studentQ = cls ? { role:'student', class:cls } : { role:'student' }
    const [totalStudents, allSubs] = await Promise.all([
      User.countDocuments(studentQ),
      Submission.find({ submittedAt:{ $gte:since } }).populate('testId','subject')
    ])
    const activeStudents = await Progress.distinct('studentId', { lastActive:{ $gte:since } })
    const avgScore = allSubs.length>0 ? Math.round(allSubs.reduce((a,b)=>a+b.percentage,0)/allSubs.length) : 0
    const dailyActivity = []
    for (let i=days-1; i>=0; i--) {
      const d = new Date(); d.setDate(d.getDate()-i); d.setHours(0,0,0,0)
      const next = new Date(d); next.setDate(next.getDate()+1)
      const count = await Progress.countDocuments({ lastActive:{ $gte:d, $lt:next } })
      dailyActivity.push({ date:d.toISOString().split('T')[0], count })
    }
    const subjectStats = {}
    for (const s of allSubs) {
      const sub = s.testId?.subject||'General'
      if (!subjectStats[sub]) subjectStats[sub] = { sum:0, count:0 }
      subjectStats[sub].sum += s.percentage; subjectStats[sub].count++
    }
    return NextResponse.json({ totalStudents, activeStudents:activeStudents.length, submissions:allSubs.length, avgScore, dailyActivity, subjectStats })
  }

  if (type === 'student' && studentId) {
    const [student, progress, submissions, attendance] = await Promise.all([
      User.findById(studentId).select('-password'),
      Progress.find({ studentId }).sort({ date:-1 }).limit(30),
      Submission.find({ studentId }).populate('testId','title subject totalMarks').sort({ submittedAt:-1 }),
      Attendance.find({ studentId }).sort({ date:-1 }).limit(30)
    ])
    const subMap = {}
    for (const s of submissions) {
      const k = s.testId?.subject||'General'
      if (!subMap[k]) subMap[k] = { sum:0, count:0 }
      subMap[k].sum+=s.percentage; subMap[k].count++
    }
    const skillGaps = Object.entries(subMap)
      .map(([subject,d]) => ({ subject, avg:Math.round(d.sum/d.count) }))
      .filter(s => s.avg < 60).sort((a,b) => a.avg-b.avg)
    return NextResponse.json({ student, progress, submissions, attendance, skillGaps })
  }

  if (type === 'inactive') {
    const since = new Date(); since.setDate(since.getDate()-3)
    const activeIds = await Progress.distinct('studentId', { lastActive:{ $gte:since } })
    const q = cls ? { class:cls, role:'student', isActive:true } : { role:'student', isActive:true }
    const inactive = await User.find({ ...q, _id:{ $nin:activeIds } }).select('name email class rollNumber lastLogin village distanceFromSchool')
    return NextResponse.json({ inactive })
  }

  return NextResponse.json({ error:'Invalid type' }, { status:400 })
}
