'use client'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { BookOpen, Search, Code2, Lightbulb, AlertTriangle, ChevronRight, X, Tag } from 'lucide-react'

const SUBJECTS = ['All','Python','Networks','Database','AI','General']
const diffColor = { Basic:'bg-green-100 text-green-700', Intermediate:'bg-yellow-100 text-yellow-700', Advanced:'bg-red-100 text-red-700' }
const subjectEmoji = { Python:'🐍', Networks:'🌐', Database:'🗄️', AI:'🤖', General:'📚' }
const subjectColor = { Python:'border-l-green-400', Networks:'border-l-purple-400', Database:'border-l-blue-400', AI:'border-l-orange-400', General:'border-l-slate-400' }

export default function NotesPage() {
  const [notes, setNotes] = useState([])
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState({ subject:'All', search:'' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/notes').then(r=>r.json()).then(d=>{ setNotes(d.notes||[]); setLoading(false) })
  }, [])

  const filtered = notes.filter(n => {
    const mSub = filter.subject === 'All' || n.subject === filter.subject
    const mSearch = !filter.search || n.title.toLowerCase().includes(filter.search.toLowerCase()) || n.topic.toLowerCase().includes(filter.search.toLowerCase())
    return mSub && mSearch
  })

  const openNote = (note) => {
    setSelected(note)
    fetch('/api/progress', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ type:'note_read', details:{ subject:note.subject, topic:note.topic, duration:5 } }) })
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Poppins',sans-serif] text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-brand-600" /> Study Notes
          </h1>
          <p className="text-slate-500 text-sm mt-1">Topic-wise notes with syntax, tips and common mistakes — {filtered.length} topics</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={filter.search} onChange={e=>setFilter(f=>({...f,search:e.target.value}))}
            placeholder="Search notes by title or topic..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {SUBJECTS.map(s => (
            <button key={s} onClick={()=>setFilter(f=>({...f,subject:s}))}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${filter.subject===s?'bg-brand-600 text-white':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {s !== 'All' ? subjectEmoji[s]+' ' : ''}{s}
            </button>
          ))}
        </div>
      </div>

      {/* Notes grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_,i) => <div key={i} className="h-44 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-200" />
          <p className="text-slate-500 font-medium">No notes found</p>
          <p className="text-slate-400 text-sm">Try a different subject or search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(note => (
            <button key={note._id} onClick={()=>openNote(note)}
              className={`bg-white rounded-2xl p-5 border-l-4 ${subjectColor[note.subject]||'border-l-slate-300'} border border-slate-100 card-hover text-left w-full`}>
              <div className="flex items-start justify-between mb-2">
                <span className="text-2xl">{subjectEmoji[note.subject]||'📚'}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${diffColor[note.difficulty]}`}>{note.difficulty}</span>
              </div>
              <h3 className="font-['Poppins',sans-serif] font-semibold text-slate-800 text-sm mb-1 line-clamp-2">{note.title}</h3>
              <p className="text-slate-500 text-xs mb-3">{note.subject} • {note.topic}</p>
              {note.keyPoints?.slice(0,2).map((kp,i) => (
                <div key={i} className="flex items-start gap-1.5 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0 mt-1.5" />
                  <p className="text-xs text-slate-600 line-clamp-1">{kp}</p>
                </div>
              ))}
              <div className="mt-3 flex items-center text-brand-600 text-xs font-medium">
                Read Full Note <ChevronRight className="w-3 h-3 ml-1" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Note Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl my-4 shadow-2xl">
            <div className="flex items-start justify-between p-5 border-b sticky top-0 bg-white rounded-t-2xl z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-brand-100 text-brand-700 text-xs px-2 py-0.5 rounded-full">{selected.subject}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${diffColor[selected.difficulty]}`}>{selected.difficulty}</span>
                </div>
                <h2 className="font-['Poppins',sans-serif] font-bold text-xl text-slate-800">{selected.title}</h2>
                <p className="text-slate-500 text-sm">{selected.topic}</p>
              </div>
              <button onClick={()=>setSelected(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto max-h-[72vh]">
              {/* Main content */}
              <div className="prose max-w-none text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{selected.content}</ReactMarkdown>
              </div>

              {/* Syntax */}
              {selected.syntax && (
                <div className="bg-slate-900 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-800">
                    <Code2 className="w-4 h-4 text-brand-400" />
                    <span className="text-brand-300 text-sm font-medium">Code Example / Syntax</span>
                  </div>
                  <pre className="text-green-300 text-sm overflow-x-auto p-4 leading-relaxed"><code>{selected.syntax}</code></pre>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tips */}
                {selected.tips?.length > 0 && (
                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-yellow-600" />
                      <span className="text-yellow-800 font-semibold text-sm">Tips & Tricks</span>
                    </div>
                    <ul className="space-y-1.5">
                      {selected.tips.map((t,i) => <li key={i} className="text-yellow-700 text-sm flex items-start gap-1.5"><span className="text-yellow-500 mt-0.5">→</span>{t}</li>)}
                    </ul>
                  </div>
                )}

                {/* Common mistakes */}
                {selected.commonMistakes?.length > 0 && (
                  <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-red-800 font-semibold text-sm">Common Mistakes</span>
                    </div>
                    <ul className="space-y-1.5">
                      {selected.commonMistakes.map((m,i) => <li key={i} className="text-red-700 text-sm flex items-start gap-1.5"><span className="text-red-400 mt-0.5">✗</span>{m}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              {/* Key points */}
              {selected.keyPoints?.length > 0 && (
                <div className="bg-brand-50 rounded-xl p-4 border border-brand-100">
                  <h4 className="font-semibold text-brand-800 text-sm mb-2">📌 Key Points to Remember</h4>
                  <ul className="space-y-1.5">
                    {selected.keyPoints.map((kp,i) => (
                      <li key={i} className="text-brand-700 text-sm flex items-start gap-2">
                        <span className="text-brand-400 font-bold mt-0.5">✓</span>{kp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags */}
              {selected.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selected.tags.map(t => (
                    <span key={t} className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full">{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
