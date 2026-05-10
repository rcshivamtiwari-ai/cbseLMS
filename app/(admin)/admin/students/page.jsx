'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'
import { Users, Plus, Upload, Search, Trash2, X, Loader2, Download, AlertCircle, CheckCircle } from 'lucide-react'

const emptyForm = {
  name: '', email: '', password: '', class: 'XII',
  rollNumber: '', section: 'A', fatherName: '',
  phone: '', village: '', distanceFromSchool: ''
}

export default function AdminStudents() {
  const [students, setStudents] = useState([])
  const [filterSearch, setFilterSearch] = useState('')
  const [filterClass, setFilterClass] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [showBulk, setShowBulk] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)

  // KEY FIX: csvText is managed by a ref + separate state
  // This prevents re-render from losing textarea focus
  const csvRef = useRef('')
  const [csvDisplay, setCsvDisplay] = useState('')

  useEffect(() => { loadStudents() }, [])

  const loadStudents = async () => {
    try {
      const r = await fetch('/api/students')
      const d = await r.json()
      setStudents(d.students || [])
    } catch {
      toast.error('Failed to load students')
    }
  }

  // KEY FIX: use ref to store CSV value — no re-render on each keystroke
  const handleCsvChange = useCallback((e) => {
    csvRef.current = e.target.value
    setCsvDisplay(e.target.value)
  }, [])

  const addStudent = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password || !form.rollNumber) {
      toast.error('Please fill: Name, Email, Password, Roll Number')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setSaving(true)
    try {
      const r = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const d = await r.json()
      if (r.ok) {
        toast.success(`✅ ${form.name} added successfully!`)
        setShowAdd(false)
        setForm(emptyForm)
        loadStudents()
      } else {
        toast.error(d.error || 'Failed to add student')
      }
    } catch {
      toast.error('Network error. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const bulkUpload = async () => {
    const csv = csvRef.current.trim()
    if (!csv) {
      toast.error('Please paste CSV data first')
      return
    }
    setUploading(true)
    setUploadResult(null)
    try {
      const lines = csv.split('\n').filter(l => l.trim())
      // Skip header row if it starts with "name"
      const dataLines = lines[0].toLowerCase().startsWith('name') ? lines.slice(1) : lines

      if (dataLines.length === 0) {
        toast.error('No student data found. Make sure you have data rows below the header.')
        return
      }

      const students = dataLines.map((line, idx) => {
        const parts = line.split(',').map(s => s.trim())
        return {
          name: parts[0] || '',
          email: parts[1] || '',
          class: parts[2] || 'XII',
          rollNumber: parts[3] || '',
          section: parts[4] || 'A',
          fatherName: parts[5] || '',
          phone: parts[6] || '',
          village: parts[7] || '',
          distanceFromSchool: Number(parts[8]) || 0,
        }
      }).filter(s => s.name && s.email && s.rollNumber)

      if (students.length === 0) {
        toast.error('No valid rows found. Check that name, email and rollNumber columns are filled.')
        return
      }

      const r = await fetch('/api/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students }),
      })
      const d = await r.json()

      setUploadResult(d)
      if (d.success > 0) {
        toast.success(`✅ ${d.success} students added!`)
        loadStudents()
      }
      if (d.failed > 0) {
        toast.error(`${d.failed} students failed (may already exist)`)
      }
    } catch (err) {
      toast.error('Failed to parse CSV. Check the format.')
    } finally {
      setUploading(false)
    }
  }

  const deactivate = async (id, name) => {
    if (!confirm(`Deactivate ${name}? They will not be able to login.`)) return
    await fetch(`/api/students?id=${id}`, { method: 'DELETE' })
    toast.success(`${name} deactivated`)
    loadStudents()
  }

  const downloadTemplate = () => {
    const csv = [
      'name,email,class,rollNumber,section,fatherName,phone,village,distanceFromSchool',
      'Rahul Sharma,rahul.sharma@cv.edu,XII,001,A,Ramesh Sharma,9876543210,Unchahar,5',
      'Priya Singh,priya.singh@cv.edu,XII,002,A,Suresh Singh,9876543211,Raebareli,40',
      'Amit Kumar,amit.kumar@cv.edu,X,003,A,Raj Kumar,9876543212,Lucknow,15',
    ].join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = 'students_template.csv'
    a.click()
    toast.success('Template downloaded!')
  }

  const filtered = students.filter(s => {
    const mc = filterClass === 'All' || s.class === filterClass
    const ms = !filterSearch ||
      s.name.toLowerCase().includes(filterSearch.toLowerCase()) ||
      s.rollNumber.includes(filterSearch) ||
      s.email.toLowerCase().includes(filterSearch.toLowerCase())
    return mc && ms
  })

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-['Poppins',sans-serif] text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" /> Students
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {students.length} total enrolled •{' '}
            {students.filter(s => s.isActive).length} active
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowBulk(true); setUploadResult(null); csvRef.current = ''; setCsvDisplay('') }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <Upload className="w-4 h-4" /> Bulk Upload CSV
          </button>
          <button
            onClick={() => { setShowAdd(true); setForm(emptyForm) }}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Student
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={filterSearch}
            onChange={e => setFilterSearch(e.target.value)}
            placeholder="Search by name, roll number, or email..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm
              focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          />
        </div>
        {['All', 'X', 'XII'].map(c => (
          <button key={c} onClick={() => setFilterClass(c)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filterClass === c
                ? 'bg-brand-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
            {c === 'All' ? 'All Classes' : `Class ${c}`}
          </button>
        ))}
      </div>

      {/* Students table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 mx-auto mb-4 text-slate-200" />
            <p className="text-slate-500 font-medium">No students found</p>
            <p className="text-slate-400 text-sm">Add students using the buttons above</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Roll No', 'Name', 'Class', 'Email', 'Village', 'Distance', 'Last Login', 'Status', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(s => (
                  <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-sm text-slate-600 font-medium">{s.rollNumber}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm flex-shrink-0">
                          {s.name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{s.name}</p>
                          {s.fatherName && <p className="text-xs text-slate-400">{s.fatherName}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-brand-100 text-brand-700 text-xs px-2 py-0.5 rounded-full font-medium">
                        Class {s.class}{s.section !== 'A' ? s.section : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 max-w-[150px] truncate">{s.email}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{s.village || '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {s.distanceFromSchool ? `${s.distanceFromSchool} km` : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {s.lastLogin
                        ? new Date(s.lastLogin).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                        : 'Never'
                      }
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        s.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {s.isActive ? '✓ Active' : '✗ Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deactivate(s._id, s.name)}
                        className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Deactivate student"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══ ADD STUDENT MODAL ═══ */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white rounded-t-2xl">
              <h2 className="font-['Poppins',sans-serif] font-bold text-slate-800">Add New Student</h2>
              <button onClick={() => setShowAdd(false)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={addStudent} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {/* Full Name */}
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Full Name *</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                {/* Email */}
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="rahul@example.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                {/* Password */}
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Password *</label>
                  <input
                    type="text"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Min 6 characters — student will use this to login"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                {/* Class */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Class *</label>
                  <select
                    value={form.class}
                    onChange={e => setForm(f => ({ ...f, class: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="X">Class X</option>
                    <option value="XII">Class XII</option>
                  </select>
                </div>
                {/* Roll Number */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Roll Number *</label>
                  <input
                    value={form.rollNumber}
                    onChange={e => setForm(f => ({ ...f, rollNumber: e.target.value }))}
                    placeholder="001"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                {/* Section */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Section</label>
                  <input
                    value={form.section}
                    onChange={e => setForm(f => ({ ...f, section: e.target.value }))}
                    placeholder="A"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                {/* Father Name */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Father's Name</label>
                  <input
                    value={form.fatherName}
                    onChange={e => setForm(f => ({ ...f, fatherName: e.target.value }))}
                    placeholder="Ramesh Sharma"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                {/* Phone */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Phone Number</label>
                  <input
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                {/* Village */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Village / Town</label>
                  <input
                    value={form.village}
                    onChange={e => setForm(f => ({ ...f, village: e.target.value }))}
                    placeholder="Unchahar"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                {/* Distance */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Distance from School (km)</label>
                  <input
                    type="number"
                    value={form.distanceFromSchool}
                    onChange={e => setForm(f => ({ ...f, distanceFromSchool: e.target.value }))}
                    placeholder="5"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
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
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Adding...</> : '✅ Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ BULK UPLOAD — NOT A MODAL, opens as a section below ═══ */}
      {showBulk && (
        <div className="bg-white rounded-2xl border border-brand-200 shadow-lg p-5 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-['Poppins',sans-serif] font-bold text-slate-800 flex items-center gap-2">
                <Upload className="w-5 h-5 text-brand-600" /> Bulk Upload Students via CSV
              </h3>
              <p className="text-slate-500 text-sm mt-0.5">
                Paste your CSV data below. You can type freely — no focus loss issue.
              </p>
            </div>
            <button
              onClick={() => { setShowBulk(false); setUploadResult(null) }}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Template and instructions */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 mb-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">CSV Format (columns in order):</p>
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-1.5 px-3 py-1.5 text-brand-600 border border-brand-200 rounded-xl text-xs hover:bg-brand-50 transition-colors font-medium"
              >
                <Download className="w-3.5 h-3.5" /> Download Template
              </button>
            </div>
            <code className="text-xs text-slate-600 font-mono block">
              name, email, class, rollNumber, section, fatherName, phone, village, distanceFromSchool
            </code>
            <p className="text-xs text-slate-400 mt-1.5">
              Example: <span className="font-mono">Rahul Sharma, rahul@cv.edu, XII, 001, A, Ramesh Sharma, 9876543210, Unchahar, 5</span>
            </p>
          </div>

          {/* KEY FIX: Textarea is NOT inside any component that re-renders on change */}
          {/* Using uncontrolled textarea with ref to prevent focus loss */}
          <div className="mb-3">
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
              Paste CSV data here (include header row OR just data rows):
            </label>
            <textarea
              defaultValue=""
              onChange={handleCsvChange}
              rows={10}
              placeholder={`name,email,class,rollNumber,section,fatherName,phone,village,distanceFromSchool\nRahul Sharma,rahul@cv.edu,XII,001,A,Ramesh Sharma,9876543210,Unchahar,5\nPriya Singh,priya@cv.edu,XII,002,A,Suresh Singh,9876543211,Raebareli,40\nAmit Kumar,amit@cv.edu,X,003,A,Raj Kumar,9876543212,Lucknow,15`}
              className="w-full p-3 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y bg-white"
              style={{ minHeight: '200px' }}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>

          <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 flex items-start gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-700">
              <strong>Default password:</strong> Each student's password will be set as{' '}
              <code className="bg-amber-100 px-1 rounded">RollNumber@Vidyalaya</code> (e.g., Roll 001 → password is{' '}
              <code className="bg-amber-100 px-1 rounded">001@Vidyalaya</code>).
              Students should change it after first login.
            </div>
          </div>

          {/* Upload result */}
          {uploadResult && (
            <div className={`rounded-xl p-3 mb-4 border flex items-start gap-2 ${
              uploadResult.success > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              {uploadResult.success > 0
                ? <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                : <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              }
              <div className="text-xs">
                {uploadResult.success > 0 && (
                  <p className="text-green-700 font-semibold">✅ {uploadResult.success} students added successfully!</p>
                )}
                {uploadResult.failed > 0 && (
                  <p className="text-red-600 mt-0.5">{uploadResult.failed} failed (duplicate email/roll number)</p>
                )}
                {uploadResult.errors?.slice(0, 3).map((e, i) => (
                  <p key={i} className="text-red-500 mt-0.5 font-mono">{e}</p>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => { setShowBulk(false); setUploadResult(null) }}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50"
            >
              Close
            </button>
            <button
              onClick={bulkUpload}
              disabled={uploading}
              className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 disabled:bg-brand-300 flex items-center justify-center gap-2"
            >
              {uploading
                ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading...</>
                : '📤 Upload All Students'
              }
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
