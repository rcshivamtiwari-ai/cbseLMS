'use client'
import { useState, useEffect } from 'react'
import { BarChart2, Search, TrendingDown, AlertTriangle, Activity, ClipboardList, BookOpen } from 'lucide-react'

export default function AdminMonitoring() {
  const [students, setStudents] = useState([])
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [search, setSearch] = useState('')
  const [filterClass, setFilterClass] = useState('All')
  const [inactive, setInactive] = useState([])

  useEffect(() => {
    fetch('/api/students').then(r=>r.json()).then(d=>setStudents(d.students||[]))
    fetch('/api/admin?type=inactive').then(r=>r.json()).then(d=>setInactive(d.inactive||[]))
  }, [])

  const loadDetail = async (student) => {
    setSelected(student); setDetail(null)
    const r = await fetch(`/api/admin?type=student&studentId=${student._id}`)
    const d = await r.json(); setDetail(d)
  }

  const actIcon = (type) => ({ note_read:'📖', code_run:'💻', sql_run:'🗄️', test_taken:'📝', class_joined:'🎥', question_attempted:'❓' }[type]||'•')

  const filtered = students.filter(s => {
    const mc = filterClass==='All'||s.class===filterClass
    const ms = !search||s.name.toLowerCase().includes(search.toLowerCase())||s.rollNumber.includes(search)
    return mc && ms
  })

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-['Poppins',sans-serif] text-2xl font-bold text-slate-800 flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-purple-600"/> Student Monitoring
        </h1>
        <p className="text-slate-500 text-sm">Track every student's activities, progress, and skill gaps</p>
      </div>

      {/* Inactive alert */}
      {inactive.length > 0 && (
        <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
          <p className="text-red-800 text-sm font-semibold flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4"/> {inactive.length} students not active in last 3 days
          </p>
          <div className="flex flex-wrap gap-2">
            {inactive.map(s => (
              <button key={s._id} onClick={()=>loadDetail(s)}
                className="bg-white text-red-700 text-xs px-3 py-1 rounded-full border border-red-200 hover:bg-red-50 transition-colors">
                {s.name} (Roll {s.rollNumber})
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-4">
        {/* Student list panel */}
        <div className="col-span-4">
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="p-3 border-b space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search student..."
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"/>
              </div>
              <div className="flex gap-1">
                {['All','X','XII'].map(c => (
                  <button key={c} onClick={()=>setFilterClass(c)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${filterClass===c?'bg-brand-600 text-white':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {c==='All'?'All':`Class ${c}`}
                  </button>
                ))}
              </div>
            </div>
            <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
              {filtered.map(s => {
                const isInactive = inactive.some(i=>i._id===s._id)
                return (
                  <button key={s._id} onClick={()=>loadDetail(s)}
                    className={`w-full p-3 text-left hover:bg-slate-50 transition-colors ${selected?._id===s._id?'bg-brand-50':''}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isInactive?'bg-red-100 text-red-700':'bg-brand-100 text-brand-700'}`}>
                        {s.name[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-800 truncate">{s.name}</p>
                        <p className="text-slate-400 text-xs">Roll {s.rollNumber} • Class {s.class}</p>
                      </div>
                      {isInactive && <span className="text-red-400 text-xs flex-shrink-0">⚠️</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Detail panel */}
        <div className="col-span-8">
          {!selected ? (
            <div className="bg-white rounded-2xl border border-slate-100 flex items-center justify-center min-h-64">
              <div className="text-center text-slate-400">
                <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-20"/>
                <p className="text-sm">Select a student to view their details</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center font-bold text-brand-700 text-lg">{selected.name[0]}</div>
                    <div>
                      <h2 className="font-['Poppins',sans-serif] font-bold text-slate-800">{selected.name}</h2>
                      <p className="text-slate-500 text-sm">Roll {selected.rollNumber} • Class {selected.class}{selected.section}</p>
                      <p className="text-slate-400 text-xs">{selected.village||'Village not set'}{selected.distanceFromSchool?` • ${selected.distanceFromSchool} km from school`:''}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Last Login</p>
                    <p className="text-sm font-medium text-slate-700">{selected.lastLogin?new Date(selected.lastLogin).toLocaleDateString('en-IN'):'Never logged in'}</p>
                  </div>
                </div>
              </div>

              {!detail ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-8 flex items-center justify-center">
                  <div className="text-center text-slate-400">
                    <Activity className="w-8 h-8 mx-auto mb-2 animate-spin"/>
                    <p className="text-sm">Loading activity data...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Skill gaps */}
                  {detail.skillGaps?.length > 0 && (
                    <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
                      <h3 className="font-semibold text-red-800 text-sm mb-2 flex items-center gap-2">
                        <TrendingDown className="w-4 h-4"/> Skill Gaps — Below 60%
                      </h3>
                      <div className="space-y-2">
                        {detail.skillGaps.map(g => (
                          <div key={g.subject} className="flex items-center gap-2">
                            <span className="text-xs text-red-700 w-20 flex-shrink-0">{g.subject}</span>
                            <div className="flex-1 bg-red-100 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-red-500" style={{width:`${g.avg}%`}}/>
                            </div>
                            <span className="text-xs font-semibold text-red-700">{g.avg}%</span>
                            <span className="text-xs text-red-400">⚠️ Needs help</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Test history */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-4">
                    <h3 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-orange-500"/> Test History ({detail.submissions?.length||0})
                    </h3>
                    {!detail.submissions?.length ? (
                      <p className="text-slate-400 text-sm">No tests taken yet</p>
                    ) : (
                      <div className="space-y-1.5 max-h-52 overflow-y-auto">
                        {detail.submissions.map(s => (
                          <div key={s._id} className="flex items-center justify-between py-1.5 border-b border-slate-50">
                            <div>
                              <p className="text-xs font-medium text-slate-700">{s.testId?.title}</p>
                              <p className="text-xs text-slate-400">{new Date(s.submittedAt).toLocaleDateString('en-IN')}</p>
                            </div>
                            <span className={`text-sm font-bold ${s.percentage>=80?'text-green-600':s.percentage>=33?'text-yellow-600':'text-red-500'}`}>
                              {s.percentage}% ({s.grade})
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Activity log */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-4">
                    <h3 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-brand-500"/> Recent Activities
                    </h3>
                    {!detail.progress?.length ? (
                      <p className="text-slate-400 text-sm">No activity recorded yet</p>
                    ) : (
                      <div className="space-y-1 max-h-64 overflow-y-auto">
                        {detail.progress
                          .flatMap(p => p.activities||[])
                          .sort((a,b) => new Date(b.timestamp)-new Date(a.timestamp))
                          .slice(0,25)
                          .map((act, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs py-1 border-b border-slate-50">
                              <span className="flex-shrink-0">{actIcon(act.activityType)}</span>
                              <span className="text-slate-600 capitalize">{(act.activityType||'').replace('_',' ')}</span>
                              {act.subject&&<span className="text-slate-400">— {act.subject}</span>}
                              {act.score&&<span className="text-green-600 font-medium">{act.score}%</span>}
                              <span className="text-slate-300 ml-auto flex-shrink-0">
                                {act.timestamp?new Date(act.timestamp).toLocaleDateString('en-IN'):''}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
