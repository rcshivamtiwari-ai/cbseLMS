'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  MessageSquare, Plus, Search, X, Loader2, Star,
  AlertTriangle, TrendingUp, Heart, AlertCircle, Eye, EyeOff
} from 'lucide-react'

const SUBJECTS = ['Python', 'Networks', 'Database', 'AI', 'General']

const TOPICS_BY_SUBJECT = {
  Python: ['Functions', 'Exception Handling', 'Text File Handling', 'Binary File Handling', 'CSV File Handling', 'Stack', 'General Python'],
  Networks: ['Evolution of Networking', 'Transmission Media', 'Network Devices', 'Topologies', 'Protocols', 'Web Services', 'General Networks'],
  Database: ['Database Concepts', 'Keys', 'SQL Commands', 'Python MySQL Connectivity', 'General Database'],
  AI: ['AI Project Cycle', 'AI vs ML vs DL', 'Types of ML', 'Neural Networks', 'Model Evaluation', 'Computer Vision', 'CNN', 'AI Ethics', 'General AI'],
  General: ['Attendance', 'Participation', 'Exam Preparation', 'Behavior', 'Overall Progress'],
}

const REMARK_TYPES = [
  { value: 'strength',     label: '⭐ Strength',     color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'weakness',     label: '⚠️ Needs Work',   color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'improvement',  label: '📈 Improving',    color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'praise',       label: '💪 Excellent',    color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'concern',      label: '🚨 Concern',      color: 'bg-orange-100 text-orange-700 border-orange-200' },
]

const typeColor = {
  strength:    'bg-green-100 text-green-700',
  weakness:    'bg-red-100 text-red-700',
  improvement: 'bg-blue-100 text-blue-700',
  praise:      'bg-yellow-100 text-yellow-700',
  concern:     'bg-orange-100 text-orange-700',
}

const typeIcon = {
  strength:    '⭐',
  weakness:    '⚠️',
  improvement: '📈',
  praise:      '💪',
  concern:     '🚨',
}

export default function AdminRemarks() {
  const [students, setStudents] = useState([])
  const [remarks, setRemarks] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [filterSubject, setFilterSubject] = useState('All')
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'student'

  const [form, setForm] = useState({
    studentId: '',
    subject: 'Python',
    topic: 'Functions',
    type: 'improvement',
    remark: '',
    isPrivate: false,
  })

  useEffect(() => { loadStudents(); loadRemarks() }, [])
  useEffect(() => {
    if (form.subject) setForm(f => ({ ...f, topic: TOPICS_BY_SUBJECT[f.subject]?.[0] || '' }))
  }, [form.subject])

  const loadStudents = async () => {
    const r = await fetch('/api/students')
    const d = await r.json()
    setStudents(d.students || [])
  }

  const loadRemarks = async (studentId = null) => {
    setLoading(true)
    const url = studentId ? `/api/remarks?studentId=${studentId}` : '/api/remarks'
    const r = await fetch(url)
    const d = await r.json()
    setRemarks(d.remarks || [])
    setLoading(false)
  }

  const addRemark = async (e) => {
    e.preventDefault()
    if (!form.studentId || !form.remark.trim()) {
      toast.error('Select a student and write a remark')
      return
    }
    setSaving(true)
    try {
      const r = await fetch('/api/remarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const d = await r.json()
      if (r.ok) {
        toast.success('Remark added successfully!')
        setShowAdd(false)
        setForm({ studentId: '', subject: 'Python', topic: 'Functions', type: 'improvement', remark: '', isPrivate: false })
        loadRemarks(selectedStudent?._id || null)
      } else {
        toast.error(d.error || 'Failed to add remark')
      }
    } catch {
      toast.error('Network error. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const deleteRemark = async (id) => {
    if (!confirm('Delete this remark?')) return
    await fetch(`/api/remarks?id=${id}`, { method: 'DELETE' })
    toast.success('Remark deleted')
    loadRemarks(selectedStudent?._id || null)
  }

  const selectStudent = (student) => {
    setSelectedStudent(student)
    setViewMode('student')
    loadRemarks(student._id)
  }

  const filteredRemarks = remarks.filter(r => {
    const ms = filterSubject === 'All' || r.subject === filterSubject
    return ms
  })

  // Group by subject for student view
  const bySubject = {}
  filteredRemarks.forEach(r => {
    if (!bySubject[r.subject]) bySubject[r.subject] = []
    bySubject[r.subject].push(r)
  })

  // Stats for student
  const stats = {
    total: remarks.length,
    strengths: remarks.filter(r => r.type === 'strength' || r.type === 'praise').length,
    concerns: remarks.filter(r => r.type === 'weakness' || r.type === 'concern').length,
    improving: remarks.filter(r => r.type === 'improvement').length,
  }

  const filteredStudents = students.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.rollNumber.includes(search)
  )

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-['Poppins',sans-serif] text-2xl font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-purple-600" /> Student Remarks
          </h1>
          <p className="text-slate-500 text-sm">Topic-wise remarks for tracking student performance</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Remark
        </button>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Students list */}
        <div className="col-span-4">
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search student..."
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
              {/* All remarks option */}
              <button
                onClick={() => { setSelectedStudent(null); setViewMode('list'); loadRemarks() }}
                className={`w-full p-3 text-left hover:bg-slate-50 transition-colors ${!selectedStudent ? 'bg-brand-50' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">All Remarks</p>
                    <p className="text-slate-400 text-xs">{remarks.length} total</p>
                  </div>
                </div>
              </button>

              {filteredStudents.map(s => {
                const studentRemarkCount = remarks.filter(r => r.studentId?._id === s._id || r.studentId === s._id).length
                return (
                  <button
                    key={s._id}
                    onClick={() => selectStudent(s)}
                    className={`w-full p-3 text-left hover:bg-slate-50 transition-colors ${selectedStudent?._id === s._id ? 'bg-brand-50' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs flex-shrink-0">
                        {s.name[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-800 truncate">{s.name}</p>
                        <p className="text-slate-400 text-xs">Roll {s.rollNumber} • Class {s.class}</p>
                      </div>
                      {studentRemarkCount > 0 && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full flex-shrink-0">
                          {studentRemarkCount}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Remarks panel */}
        <div className="col-span-8">
          {/* Student header if selected */}
          {selectedStudent && (
            <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center font-bold text-brand-700 text-lg">
                    {selectedStudent.name[0]}
                  </div>
                  <div>
                    <h3 className="font-['Poppins',sans-serif] font-bold text-slate-800">{selectedStudent.name}</h3>
                    <p className="text-slate-500 text-sm">Class {selectedStudent.class} • Roll {selectedStudent.rollNumber}</p>
                  </div>
                </div>
                {/* Quick stats */}
                <div className="flex gap-3">
                  <div className="text-center">
                    <p className="font-bold text-green-600 text-lg">{stats.strengths}</p>
                    <p className="text-xs text-slate-400">Strengths</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-blue-600 text-lg">{stats.improving}</p>
                    <p className="text-xs text-slate-400">Improving</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-red-500 text-lg">{stats.concerns}</p>
                    <p className="text-xs text-slate-400">Concerns</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subject filter */}
          <div className="flex gap-2 flex-wrap mb-4">
            {['All', ...SUBJECTS].map(s => (
              <button key={s} onClick={() => setFilterSubject(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  filterSubject === s ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}>
                {s}
              </button>
            ))}
          </div>

          {/* Remarks */}
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading remarks...
            </div>
          ) : filteredRemarks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-200" />
              <p className="text-slate-500 font-medium">No remarks yet</p>
              <p className="text-slate-400 text-sm">Click "Add Remark" to write your first remark</p>
            </div>
          ) : selectedStudent ? (
            // Subject-wise grouped view for individual student
            <div className="space-y-4">
              {Object.entries(bySubject).map(([subject, subjectRemarks]) => (
                <div key={subject} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                  <div className="px-4 py-3 bg-slate-50 border-b flex items-center justify-between">
                    <h3 className="font-semibold text-slate-700 text-sm">{subject}</h3>
                    <span className="text-xs text-slate-400">{subjectRemarks.length} remarks</span>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {subjectRemarks.map(r => (
                      <div key={r._id} className="p-4 flex items-start gap-3">
                        <span className="text-lg flex-shrink-0">{typeIcon[r.type]}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor[r.type]}`}>
                              {REMARK_TYPES.find(t => t.value === r.type)?.label}
                            </span>
                            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{r.topic}</span>
                            {r.isPrivate && <span className="text-xs text-slate-400 flex items-center gap-1"><EyeOff className="w-3 h-3" /> Private</span>}
                          </div>
                          <p className="text-slate-700 text-sm leading-relaxed">{r.remark}</p>
                          <p className="text-slate-400 text-xs mt-1">
                            By {r.teacherName || r.teacherId?.name || 'Teacher'} •{' '}
                            {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <button onClick={() => deleteRemark(r._id)}
                          className="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0 p-1">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // All remarks list view
            <div className="space-y-2">
              {filteredRemarks.map(r => (
                <div key={r._id} className="bg-white rounded-xl border border-slate-100 p-4 flex items-start gap-3">
                  <span className="text-lg flex-shrink-0">{typeIcon[r.type]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-semibold text-slate-800">
                        {r.studentId?.name || 'Student'}
                      </span>
                      <span className="text-xs text-slate-400">Roll {r.studentId?.rollNumber}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor[r.type]}`}>
                        {REMARK_TYPES.find(t => t.value === r.type)?.label}
                      </span>
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{r.subject} › {r.topic}</span>
                    </div>
                    <p className="text-slate-600 text-sm">{r.remark}</p>
                    <p className="text-slate-400 text-xs mt-1">
                      {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <button onClick={() => deleteRemark(r._id)}
                    className="text-slate-300 hover:text-red-500 transition-colors p-1 flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Remark Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white rounded-t-2xl">
              <h2 className="font-['Poppins',sans-serif] font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-600" /> Add Remark
              </h2>
              <button onClick={() => setShowAdd(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={addRemark} className="p-5 space-y-4">
              {/* Student */}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Student *</label>
                <select
                  value={form.studentId}
                  onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">— Select Student —</option>
                  {students.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.name} (Roll {s.rollNumber} • Class {s.class})
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject & Topic */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Subject *</label>
                  <select
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Topic *</label>
                  <select
                    value={form.topic}
                    onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {(TOPICS_BY_SUBJECT[form.subject] || []).map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-2 block">Remark Type *</label>
                <div className="grid grid-cols-3 gap-2">
                  {REMARK_TYPES.map(rt => (
                    <button
                      key={rt.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, type: rt.value }))}
                      className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                        form.type === rt.value ? rt.color + ' border-2' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {rt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Remark text */}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Remark *</label>
                <textarea
                  value={form.remark}
                  onChange={e => setForm(f => ({ ...f, remark: e.target.value }))}
                  rows={4}
                  placeholder={
                    form.type === 'strength' ? 'e.g., Rahul has a very good understanding of stack operations...' :
                    form.type === 'weakness' ? 'e.g., Priya is struggling with file handling modes, needs extra practice...' :
                    form.type === 'praise'   ? 'e.g., Excellent work on the SQL assignment! Scored 95% in database...' :
                    form.type === 'concern'  ? 'e.g., Amit has not submitted last 3 assignments. Please follow up...' :
                    'e.g., Showing improvement in exception handling. Practice more try-except...'
                  }
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
                <p className="text-xs text-slate-400 mt-1">{form.remark.length}/500 characters</p>
              </div>

              {/* Private toggle */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <label className="flex items-center gap-2 cursor-pointer flex-1">
                  <div
                    onClick={() => setForm(f => ({ ...f, isPrivate: !f.isPrivate }))}
                    className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${f.isPrivate ? 'bg-brand-600' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isPrivate ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-sm text-slate-700">Private remark (only teacher sees, not student)</span>
                </label>
                {form.isPrivate ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAdd(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 disabled:bg-brand-300 flex items-center justify-center gap-2">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : '✅ Save Remark'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
