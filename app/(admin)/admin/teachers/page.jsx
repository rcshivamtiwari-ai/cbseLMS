'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useSession } from 'next-auth/react'
import {
  Users, Plus, X, Loader2, Mail, Lock,
  User, Phone, Shield, Trash2, CheckCircle
} from 'lucide-react'

const emptyForm = { name: '', email: '', password: '', phone: '' }

export default function AdminTeachers() {
  const { data: session } = useSession()
  const [teachers, setTeachers] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadTeachers() }, [])

  const loadTeachers = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/teachers')
      const d = await r.json()
      setTeachers(d.teachers || [])
    } catch {
      toast.error('Failed to load teachers')
    } finally {
      setLoading(false)
    }
  }

  const addTeacher = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      toast.error('Name, email and password are required')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setSaving(true)
    try {
      const r = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const d = await r.json()
      if (r.ok) {
        toast.success(`✅ ${form.name}'s teacher account created!`)
        setShowAdd(false)
        setForm(emptyForm)
        loadTeachers()
      } else {
        toast.error(d.error || 'Failed to create teacher account')
      }
    } catch {
      toast.error('Network error. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const deactivateTeacher = async (id, name) => {
    if (id === session?.user?.id) {
      toast.error('You cannot deactivate your own account!')
      return
    }
    if (!confirm(`Deactivate ${name}'s teacher account? They will not be able to login.`)) return
    const r = await fetch(`/api/teachers?id=${id}`, { method: 'DELETE' })
    if (r.ok) {
      toast.success(`${name} deactivated`)
      loadTeachers()
    }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-['Poppins',sans-serif] text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-600" /> Teacher Accounts
          </h1>
          <p className="text-slate-500 text-sm">
            {teachers.length} teacher{teachers.length !== 1 ? 's' : ''} •
            All teachers have full admin access
          </p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setForm(emptyForm) }}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Teacher
        </button>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-800 text-sm font-medium">About Teacher Accounts</p>
            <p className="text-blue-700 text-xs mt-1 leading-relaxed">
              Each teacher gets full admin access — they can add students, create notes, create tests,
              schedule live classes, add remarks, and monitor students. All remarks are tagged with
              the teacher's name so you can see who wrote what.
            </p>
          </div>
        </div>
      </div>

      {/* Teachers list */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachers.map(t => {
            const isYou = t._id === session?.user?.id
            return (
              <div key={t._id} className={`bg-white rounded-2xl border p-5 ${isYou ? 'border-brand-300' : 'border-slate-100'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      isYou ? 'bg-saffron-500 text-white' : 'bg-brand-100 text-brand-700'
                    }`}>
                      {t.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-['Poppins',sans-serif] font-semibold text-slate-800 text-sm">
                        {t.name}
                        {isYou && <span className="ml-2 text-xs bg-saffron-100 text-saffron-600 px-2 py-0.5 rounded-full">You</span>}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        t.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {t.isActive ? '✓ Active' : '✗ Inactive'}
                      </span>
                    </div>
                  </div>
                  {!isYou && (
                    <button
                      onClick={() => deactivateTeacher(t._id, t.name)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1"
                      title="Deactivate teacher"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{t.email}</span>
                  </div>
                  {t.phone && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{t.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Full Admin Access</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <User className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Joined {new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  {t.lastLogin && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Last login: {new Date(t.lastLogin).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Teacher Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-['Poppins',sans-serif] font-bold text-slate-800 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" /> Add New Teacher
              </h2>
              <button onClick={() => setShowAdd(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={addTeacher} className="p-5 space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="priya.sharma@cv.edu"
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Share this password with the teacher. They can change it from Settings after login.
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Phone (optional)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    placeholder="9876543210"
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Warning */}
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                <p className="text-amber-700 text-xs">
                  ⚠️ This teacher will have <strong>full admin access</strong> — they can add/remove
                  students, create tests, add remarks, and see all student data. Only add trusted teachers.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 disabled:bg-brand-300 flex items-center justify-center gap-2"
                >
                  {saving
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Creating...</>
                    : '✅ Create Teacher Account'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
