import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import { Progress } from '@/models/index'
import { authOptions } from '@/lib/auth'

const PISTON = 'https://emkc.org/api/v2/piston/execute'

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const { code, language, topic, testCases } = await request.json()
  if (!code) return NextResponse.json({ error:'Code required' }, { status:400 })

  const langMap = {
    python: { language:'python', version:'3.10.0' },
    sql: { language:'sqlite', version:'3.36.0' },
  }
  const lang = langMap[language?.toLowerCase()] || langMap.python

  try {
    let results = []
    if (testCases && testCases.length > 0) {
      for (const tc of testCases) {
        const r = await fetch(PISTON, { method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ ...lang, files:[{ name:'main.py', content:code }], stdin:tc.input||'' }) })
        const d = await r.json()
        const output = (d.run?.stdout||'').trim()
        const error = (d.run?.stderr||'').trim()
        results.push({ input:tc.input, expected:tc.expectedOutput, actual:output, passed:output===tc.expectedOutput?.trim(), error })
      }
    } else {
      const r = await fetch(PISTON, { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ ...lang, files:[{ name:'main.py', content:code }] }) })
      const d = await r.json()
      results = [{ output:d.run?.stdout||'', error:d.run?.stderr||'', exitCode:d.run?.code }]
    }

    await connectDB()
    const today = new Date().toISOString().split('T')[0]
    await Progress.findOneAndUpdate(
      { studentId:session.user.id, date:today },
      { $push:{ activities:{ activityType:'code_run', subject:language==='python'?'Python':'Database', topic:topic||'Practice', timestamp:new Date() } }, lastActive:new Date() },
      { upsert:true }
    )
    return NextResponse.json({ results })
  } catch (e) {
    return NextResponse.json({ error:'Execution failed. Try again.' }, { status:500 })
  }
}
