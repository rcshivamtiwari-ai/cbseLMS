'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Users, BookOpen, ClipboardList, TrendingUp, AlertTriangle, Activity, Video, BarChart2 } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [inactive, setInactive] = useState([])
  const [cls, setCls] = useState('XII')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`/api/admin?type=dashboard&class=${cls}&days=7`).then(r=>r.json()),
      fetch(`/api/admin?type=inactive&class=${cls}`).then(r=>r.json()),
    ]).then(([s,i]) => { setStats(s); setInactive(i.inactive||[]); setLoading(false) })
  }, [cls])

  const kpis = stats ? [
    { label:'Total Students', value:stats.totalStudents, icon:Users, color:'text-blue-600', bg:'bg-blue-50' },
    { label:'Active (7 days)', value:stats.activeStudents, icon:Activity, color:'text-green-600', bg:'bg-green-50' },
    { label:'Tests Submitted', value:stats.submissions, icon:ClipboardList, color:'text-orange-600', bg:'bg-orange-50' },
    { label:'Class Avg Score', value:stats.avgScore+'%', icon:TrendingUp, color:'text-purple-600', bg:'bg-purple-50' },
  ] : []

  const subjectData = stats?.subjectStats
    ? Object.entries(stats.subjectStats).map(([s,d]) => ({ subject:s, avg:Math.round(d.sum/d.count), tests:d.count }))
    : []

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-['Poppins',sans-serif] text-2xl font-bold text-slate-800">👨‍🏫 Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Monitor your students' progress and activities</p>
        </div>
        <div className="flex gap-2">
          {['X','XII'].map(c => (
            <button key={c} onClick={()=>setCls(c)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${cls===c?'bg-brand-600 text-white':'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              Class {c}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? [...Array(4)].map((_,i)=><div key={i} className="h-28 bg-white rounded-2xl border border-slate-100 animate-pulse"/>)
          : kpis.map(({ label, value, icon:Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`}/>
              </div>
              <p className="font-['Poppins',sans-serif] font-bold text-2xl text-slate-800">{value}</p>
              <p className="text-slate-500 text-sm">{label}</p>
            </div>
          ))
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Daily active students */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h3 className="font-['Poppins',sans-serif] font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-500"/> Daily Active Students (7 days)
          </h3>
          {stats?.dailyActivity && (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={stats.dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                <XAxis dataKey="date" tick={{fontSize:11}} tickFormatter={d=>d.slice(5)}/>
                <YAxis tick={{fontSize:11}} allowDecimals={false}/>
                <Tooltip contentStyle={{fontSize:12}}/>
                <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} dot={{r:4}} name="Active"/>
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Subject-wise avg */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h3 className="font-['Poppins',sans-serif] font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-green-500"/> Subject-Wise Average Score
          </h3>
          {subjectData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                <XAxis dataKey="subject" tick={{fontSize:11}}/>
                <YAxis domain={[0,100]} tick={{fontSize:11}}/>
                <Tooltip contentStyle={{fontSize:12}} formatter={v=>[v+'%','Avg Score']}/>
                <Bar dataKey="avg" fill="#0ea5e9" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">No test data yet</div>
          )}
        </div>
      </div>

      {/* Inactive alert */}
      {inactive.length > 0 && (
        <div className="bg-red-50 rounded-2xl border border-red-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-500"/>
            <h3 className="font-['Poppins',sans-serif] font-semibold text-red-800">
              ⚠️ {inactive.length} Students Inactive for 3+ Days
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {inactive.map(s => (
              <div key={s._id} className="bg-white rounded-xl p-3 border border-red-100">
                <p className="font-semibold text-slate-800 text-sm truncate">{s.name}</p>
                <p className="text-slate-500 text-xs">Roll {s.rollNumber} • Class {s.class}</p>
                <p className="text-red-400 text-xs mt-1">
                  Last seen: {s.lastLogin ? new Date(s.lastLogin).toLocaleDateString('en-IN') : 'Never'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href:'/admin/students', icon:Users, label:'Manage Students', color:'bg-blue-500' },
          { href:'/admin/notes', icon:BookOpen, label:'Add Notes', color:'bg-green-500' },
          { href:'/admin/tests', icon:ClipboardList, label:'Create Test', color:'bg-orange-500' },
          { href:'/admin/classes', icon:Video, label:'Schedule Class', color:'bg-red-500' },
        ].map(({ href, icon:Icon, label, color }) => (
          <Link key={href} href={href} className="bg-white rounded-2xl p-4 border border-slate-100 card-hover flex items-center gap-3">
            <div className={`${color} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-5 h-5 text-white"/>
            </div>
            <span className="font-medium text-slate-800 text-sm">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
