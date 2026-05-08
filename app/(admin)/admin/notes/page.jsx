'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { BookOpen, Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react'

const emptyForm = { title:'', subject:'Python', class:'XII', unit:'', topic:'', content:'', syntax:'', keyPoints:'', tips:'', commonMistakes:'', difficulty:'Basic', tags:'', isPublished:true }
const SUBJECTS = ['Python','Networks','Database','AI','General']
const diffColor = { Basic:'bg-green-100 text-green-700', Intermediate:'bg-yellow-100 text-yellow-700', Advanced:'bg-red-100 text-red-700' }
const subjectEmoji = { Python:'🐍', Networks:'🌐', Database:'🗄️', AI:'🤖', General:'📚' }

export default function AdminNotes() {
  const [notes, setNotes] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filterSub, setFilterSub] = useState('All')
  const [filterCls, setFilterCls] = useState('All')

  useEffect(() => { loadNotes() }, [])

  const loadNotes = async () => {
    const r = await fetch('/api/notes?class=Both'); const d = await r.json(); setNotes(d.notes||[])
  }

  const saveNote = async (e) => {
    e.preventDefault()
    if (!form.title||!form.topic||!form.content) { toast.error('Fill required fields: Title, Topic, Content'); return }
    setSaving(true)
    const payload = {
      ...form,
      keyPoints: form.keyPoints.split('\n').map(s=>s.trim()).filter(Boolean),
      tips: form.tips.split('\n').map(s=>s.trim()).filter(Boolean),
      commonMistakes: form.commonMistakes.split('\n').map(s=>s.trim()).filter(Boolean),
      tags: form.tags.split(',').map(s=>s.trim()).filter(Boolean),
    }
    const method = editing ? 'PUT' : 'POST'
    if (editing) payload.id = editing
    const r = await fetch('/api/notes', { method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
    setSaving(false)
    if (r.ok) { toast.success(editing?'Note updated!':'Note created!'); setShowForm(false); setForm(emptyForm); setEditing(null); loadNotes() }
    else toast.error('Failed to save note')
  }

  const editNote = (note) => {
    setForm({
      ...note,
      keyPoints: (note.keyPoints||[]).join('\n'),
      tips: (note.tips||[]).join('\n'),
      commonMistakes: (note.commonMistakes||[]).join('\n'),
      tags: (note.tags||[]).join(', '),
    })
    setEditing(note._id); setShowForm(true)
  }

  const deleteNote = async (id) => {
    if (!confirm('Delete this note? Students will no longer see it.')) return
    await fetch(`/api/notes?id=${id}`, { method:'DELETE' })
    toast.success('Note deleted'); loadNotes()
  }

  const filtered = notes.filter(n => {
    const ms = filterSub==='All'||n.subject===filterSub
    const mc = filterCls==='All'||n.class===filterCls||n.class==='Both'
    return ms && mc
  })

  const TA = ({ label, k, rows=4, placeholder='', mono=false }) => (
    <div>
      <label className="text-xs font-medium text-slate-600 mb-1 block">{label}</label>
      <textarea value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} rows={rows} placeholder={placeholder}
        className={`w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none ${mono?'font-mono bg-slate-50':''}`}/>
    </div>
  )

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-['Poppins',sans-serif] text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-green-600"/> Notes & Topics
          </h1>
          <p className="text-slate-500 text-sm">{notes.length} notes uploaded</p>
        </div>
        <button onClick={()=>{setShowForm(true);setEditing(null);setForm(emptyForm)}}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-medium">
          <Plus className="w-4 h-4"/> Add Note
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['All',...SUBJECTS].map(s => (
          <button key={s} onClick={()=>setFilterSub(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${filterSub===s?'bg-brand-600 text-white':'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {s!=='All'?subjectEmoji[s]+' ':''}{s}
          </button>
        ))}
        <div className="border-l border-slate-200 ml-1 pl-3 flex gap-2">
          {['All','X','XII'].map(c => (
            <button key={c} onClick={()=>setFilterCls(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${filterCls===c?'bg-saffron-500 text-white':'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {c==='All'?'Both Classes':`Class ${c}`}
            </button>
          ))}
        </div>
      </div>

      {/* Notes list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-200"/>
            <p className="text-slate-500">No notes yet. Click "Add Note" to create your first note!</p>
          </div>
        ) : filtered.map(note => (
          <div key={note._id} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">{subjectEmoji[note.subject]||'📚'}</span>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-medium text-slate-800 text-sm">{note.title}</h3>
                  {!note.isPublished&&<span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Draft</span>}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-500">{note.subject}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500">Class {note.class}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500">{note.topic}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${diffColor[note.difficulty]}`}>{note.difficulty}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={()=>editNote(note)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"><Pencil className="w-4 h-4"/></button>
              <button onClick={()=>deleteNote(note._id)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
            </div>
          </div>
        ))}
      </div>

      {/* Note form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl my-4 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="font-['Poppins',sans-serif] font-bold text-slate-800">{editing?'Edit Note':'Add New Note'}</h2>
              <button onClick={()=>{setShowForm(false);setEditing(null)}}><X className="w-5 h-5 text-slate-400"/></button>
            </div>
            <form onSubmit={saveNote} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Title *</label>
                  <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g., Functions in Python — Complete Guide"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"/>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Subject *</label>
                  <select value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                    {SUBJECTS.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Class *</label>
                  <select value={form.class} onChange={e=>setForm(f=>({...f,class:e.target.value}))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                    <option value="X">Class X</option><option value="XII">Class XII</option><option value="Both">Both Classes</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Topic *</label>
                  <input value={form.topic} onChange={e=>setForm(f=>({...f,topic:e.target.value}))} placeholder="e.g., User Defined Functions"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"/>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Difficulty</label>
                  <select value={form.difficulty} onChange={e=>setForm(f=>({...f,difficulty:e.target.value}))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                    <option>Basic</option><option>Intermediate</option><option>Advanced</option>
                  </select>
                </div>
              </div>
              <TA label="Content * (Markdown supported — use ## for headings, **bold**, `code`)" k="content" rows={9} placeholder="Write the main content here. Markdown is supported!"/>
              <TA label="Code Syntax / Example (paste Python or SQL code here)" k="syntax" rows={6} placeholder="# Python code example..." mono/>
              <div className="grid grid-cols-3 gap-3">
                <TA label="Key Points (one per line)" k="keyPoints" placeholder="def keyword defines function&#10;return sends value back"/>
                <TA label="Tips & Tricks (one per line)" k="tips" placeholder="Use lowercase_underscores&#10;One function = one task"/>
                <TA label="Common Mistakes (one per line)" k="commonMistakes" placeholder="Calling before defining&#10;Forgetting return"/>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isPublished} onChange={e=>setForm(f=>({...f,isPublished:e.target.checked}))} className="rounded text-brand-600"/>
                  <span className="text-sm text-slate-700">Publish immediately (visible to students)</span>
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={()=>{setShowForm(false);setEditing(null)}} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 disabled:bg-brand-300 flex items-center justify-center gap-2">
                  {saving?<><Loader2 className="w-4 h-4 animate-spin"/>Saving...</>:(editing?'✅ Update Note':'✅ Save Note')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
