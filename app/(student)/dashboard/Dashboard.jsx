'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { BookOpen, Code2, Database, ClipboardList, Video, Trophy, TrendingUp, Flame, CheckCircle, AlertCircle, Star, Activity } from 'lucide-react'

export default function Dashboard({ user }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/progress?type=my').then(r => r.json()).then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const quickLinks = [
    { href:'/notes', icon:BookOpen, label:'Study Notes', color:'bg-blue-500', desc:'Read topic notes' },
    { href:'/practice', icon:Code2, label:'Python Practice', color:'bg-green-500', desc:'Write & run code' },
    { href:'/sql', icon:Database, label:'SQL Practice', color:'bg-purple-500', desc:'Practice queries' },
    { href:'/tests', icon:ClipboardList, label:'Tests & Exams', color:'bg-orange-500', desc:'Check knowledge' },
    { href:'/classes', icon:Video, label:'Live Classes', color:'bg-red-500', desc:'Join live sessions' },
    { href:'/leaderboard', icon:Trophy, label:'Leaderboard', color:'bg-yellow-500', desc:'See your rank' },
  ]

  const subjectColors = { Python:'#0ea5e9', Networks:'#8b5cf6', Database:'#10b981', AI:'#f97316', General:'#64748b' }
  const timeOfDay = () => { const h = new Date().getHours(); return h<12?'Morning':h<17?'Afternoon':'Evening' }

  const avgScore = data?.submissions?.length > 0
    ? Math.round(data.submissions.reduce((a, b) => a + b.percentage, 0) / data.submissions.length)
    : null

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-brand-800 to-brand-600 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-brand-200 text-sm font-medium">Good {timeOfDay()} 👋</p>
            <h1 className="font-['Poppins',sans-serif] text-2xl font-bold mt-1">{user?.name}</h1>
            <p className="text-brand-200 text-sm mt-1">Class {user?.class} • Roll No. {user?.rollNumber}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-xs text-brand-200 mb-1">Avg Score</p>
            <p className="font-['Poppins',sans-serif] font-bold text-2xl">{avgScore !== null ? `${avgScore}%` : '—'}</p>
          </div>
        </div>
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label:'Tests Taken', value:data?.submissions?.length || 0, icon:ClipboardList },
            { label:'Notes Read', value:data?.progress?.reduce((a,p) => a + (p.activities?.filter(x=>x.activityType==='note_read').length||0), 0) || 0, icon:BookOpen },
            { label:'Active Days', value:data?.progress?.length || 0, icon:Activity },
          ].map(({ label, value, icon:Icon }) => (
            <div key={label} className="bg-white/10 rounded-xl p-3">
              <Icon className="w-4 h-4 text-brand-200 mb-1" />
              <p className="font-['Poppins',sans-serif] font-bold text-xl">{value}</p>
              <p className="text-brand-200 text-xs">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="font-['Poppins',sans-serif] font-semibold text-slate-800 mb-3">Quick Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {quickLinks.map(({ href, icon:Icon, label, color, desc }) => (
            <Link key={href} href={href} className="bg-white rounded-xl p-4 border border-slate-100 card-hover flex items-start gap-3 group">
              <div className={`${color} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-slate-800 text-sm group-hover:text-brand-600 transition-colors">{label}</p>
                <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Subject performance radar */}
        {data?.topicGPA?.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <h3 className="font-['Poppins',sans-serif] font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" /> Subject Performance
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={data.topicGPA.map(t => ({ subject: t.subject, score: t.avgScore }))}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize:11, fill:'#64748b' }} />
                <Radar dataKey="score" fill="#0ea5e9" fillOpacity={0.25} stroke="#0ea5e9" strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {data.topicGPA.map(t => (
                <div key={t.subject} className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 w-20 flex-shrink-0">{t.subject}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width:`${t.avgScore}%`, backgroundColor:subjectColors[t.subject]||'#0ea5e9' }} />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 w-9 text-right">{t.avgScore}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent tests */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <h3 className="font-['Poppins',sans-serif] font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-orange-500" /> Recent Tests
          </h3>
          {loading ? (
            <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse"/>)}</div>
          ) : data?.submissions?.length > 0 ? (
            <div className="space-y-2">
              {data.submissions.slice(0,5).map(s => (
                <div key={s._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-slate-800 truncate max-w-40">{s.testId?.title || 'Test'}</p>
                    <p className="text-xs text-slate-500">{s.testId?.subject} • {new Date(s.submittedAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-bold font-['Poppins',sans-serif] ${s.percentage>=80?'text-green-600':s.percentage>=33?'text-yellow-600':'text-red-500'}`}>
                      {s.percentage}%
                    </span>
                    <p className="text-xs text-slate-400">Grade: {s.grade}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <ClipboardList className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No tests taken yet</p>
              <Link href="/tests" className="text-brand-600 text-xs mt-1 inline-block hover:underline">Take your first test →</Link>
            </div>
          )}
        </div>
      </div>

      {/* Weak subjects alert */}
      {data?.topicGPA?.filter(t => t.avgScore < 60).length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
          <h3 className="font-semibold text-red-800 text-sm mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Subjects Needing More Attention (below 60%)
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.topicGPA.filter(t => t.avgScore < 60).map(t => (
              <Link key={t.subject} href={`/notes?subject=${t.subject}`}
                className="bg-white text-red-700 text-xs px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
                📚 {t.subject} ({t.avgScore}%) — Read Notes
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
