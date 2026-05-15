'use client'
import { useState, useEffect } from 'react'
import { MessageSquare, BookOpen, Star, TrendingUp, AlertTriangle, Heart, Loader2 } from 'lucide-react'

const typeConfig = {
  strength:    { icon: '⭐', label: 'Strength',    bg: 'bg-green-50',  border: 'border-green-200', text: 'text-green-700',  badge: 'bg-green-100 text-green-700' },
  weakness:    { icon: '⚠️', label: 'Needs Work',  bg: 'bg-red-50',    border: 'border-red-200',   text: 'text-red-700',    badge: 'bg-red-100 text-red-700' },
  improvement: { icon: '📈', label: 'Improving',   bg: 'bg-blue-50',   border: 'border-blue-200',  text: 'text-blue-700',   badge: 'bg-blue-100 text-blue-700' },
  praise:      { icon: '💪', label: 'Excellent',   bg: 'bg-yellow-50', border: 'border-yellow-200',text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700' },
  concern:     { icon: '🚨', label: 'Concern',     bg: 'bg-orange-50', border: 'border-orange-200',text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700' },
}

const subjectEmoji = {
  Python: '🐍', Networks: '🌐', Database: '🗄️', AI: '🤖', General: '📚'
}

export default function StudentRemarks() {
  const [remarks, setRemarks]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('All')

  useEffect(() => {
    fetch('/api/remarks')
      .then(r => r.json())
      .then(d => { setRemarks(d.remarks || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const subjects = ['All', ...new Set(remarks.map(r => r.subject))]
  const filtered = filter === 'All' ? remarks : remarks.filter(r => r.subject === filter)

  // Group by subject
  const grouped = {}
  filtered.forEach(r => {
    if (!grouped[r.subject]) grouped[r.subject] = []
    grouped[r.subject].push(r)
  })

  // Summary stats
  const stats = {
    total:      remarks.length,
    strengths:  remarks.filter(r => r.type === 'strength' || r.type === 'praise').length,
    improving:  remarks.filter(r => r.type === 'improvement').length,
    needsWork:  remarks.filter(r => r.type === 'weakness' || r.type === 'concern').length,
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-['Poppins',sans-serif] text-2xl font-bold text-slate-800 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-purple-600" /> My Remarks
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Topic-wise feedback from your teacher — use this to improve! 📚
        </p>
      </div>

      {/* Stats */}
      {remarks.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
            <p className="text-3xl font-['Poppins',sans-serif] font-bold text-green-600">{stats.strengths}</p>
            <p className="text-green-700 text-sm font-medium mt-1">⭐ Strengths</p>
            <p className="text-green-500 text-xs">Things you do well</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
            <p className="text-3xl font-['Poppins',sans-serif] font-bold text-blue-600">{stats.improving}</p>
            <p className="text-blue-700 text-sm font-medium mt-1">📈 Improving</p>
            <p className="text-blue-500 text-xs">Getting better</p>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
            <p className="text-3xl font-['Poppins',sans-serif] font-bold text-red-500">{stats.needsWork}</p>
            <p className="text-red-700 text-sm font-medium mt-1">⚠️ Needs Work</p>
            <p className="text-red-500 text-xs">Focus here more</p>
          </div>
        </div>
      )}

      {/* Subject filter */}
      {subjects.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {subjects.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                filter === s
                  ? 'bg-brand-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}>
              {s !== 'All' ? subjectEmoji[s] + ' ' : ''}{s}
            </button>
          ))}
        </div>
      )}

      {/* Remarks */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading your remarks...
        </div>
      ) : remarks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-200" />
          <p className="text-slate-500 font-medium">No remarks yet</p>
          <p className="text-slate-400 text-sm mt-1">
            Your teacher will add topic-wise feedback here soon. Keep studying! 📚
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([subject, subjectRemarks]) => (
            <div key={subject} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              {/* Subject header */}
              <div className="px-5 py-3 bg-slate-50 border-b flex items-center gap-2">
                <span className="text-lg">{subjectEmoji[subject] || '📚'}</span>
                <h3 className="font-['Poppins',sans-serif] font-semibold text-slate-700">{subject}</h3>
                <span className="text-xs text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200 ml-auto">
                  {subjectRemarks.length} remark{subjectRemarks.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="divide-y divide-slate-50">
                {subjectRemarks.map(r => {
                  const config = typeConfig[r.type] || typeConfig.improvement
                  return (
                    <div key={r._id} className={`p-5 ${config.bg} border-l-4 ${config.border}`}>
                      <div className="flex items-start gap-3">
                        <span className="text-xl flex-shrink-0">{config.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.badge}`}>
                              {config.label}
                            </span>
                            <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                              📌 {r.topic}
                            </span>
                            <span className="text-xs text-slate-400 ml-auto">
                              {new Date(r.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })}
                            </span>
                          </div>
                          <p className="text-slate-700 text-sm leading-relaxed">{r.remark}</p>
                          <p className="text-slate-400 text-xs mt-2">
                            — {r.teacherName || r.teacherId?.name || 'Shivam Sir'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Motivation box */}
      {remarks.length > 0 && (
        <div className="bg-gradient-to-r from-brand-600 to-brand-500 rounded-2xl p-5 text-white">
          <div className="flex items-start gap-3">
            <Heart className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-['Poppins',sans-serif] font-semibold mb-1">Message from Shivam Sir 🙏</p>
              <p className="text-brand-100 text-sm leading-relaxed">
                These remarks are written with care to help you grow. Focus on the "Needs Work" topics — 
                read those notes again, practice, and ask in class. Every great result starts with honest feedback. 
                You can do this! 💪
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
