'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Users, Plus, Upload, Search, Trash2, X, Loader2, Download, AlertCircle } from 'lucide-react'

const emptyForm = { name:'', email:'', password:'', class:'XII', rollNumber:'', section:'A', fatherName:'', phone:'', village:'', distanceFromSchool:'' }

export default function AdminStudents() {
  const [students, setStudents] = useState([])
  const [filter, setFilter] = useState({ search:'', class:'All' })
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [csvText, setCsvText] = useState('')
  const [showBulk, setShowBulk] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => { loadStudents() }, [])

  const loadStudents = async () => {
    const r = await fetch('/api/students'); const d = await r.json(); setStudents(d.students||[])
  }

  const addStudent = async (e) => {
    e.preventDefault()
    if (!form.name||!form.email||!form.password||!form.rollNumber) { toast.error('Fill all required fields'); return }
    setSaving(true)
    const r = await fetch('/api/students', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    const d = await r.json()
    setSaving(false)
    if (r.ok) { toast.success('Student added!'); setShowAdd(false); setForm(emptyForm); loadStudents() }
    else toast.error(d.error||'Failed to add student')
  }

  const bulkUpload = async () => {
    if (!csvText.trim()) { toast.error('Paste CSV data first'); return }
    setUploading(true)
    try {
      const lines = csvText.trim().split('\n').slice(1)
      const students = lines.map(line => {
        const [name,email,cls,rollNumber,section,fatherName,phone,village,distance] = line.split(',').map(s=>s.trim())
        return { name, email, class:cls, rollNumber, section:section||'A', fatherName, phone, village, distanceFromSchool:Number(distance)||0 }
      }).filter(s=>s.name&&s.email)
      const r = await fetch('/api/students', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ students }) })
      const d = await r.json()
      toast.success(`✅ ${d.success} added, ${d.failed} failed`)
      setShowBulk(false); setCsvText(''); loadStudents()
    } catch { toast.error('Failed to parse CSV') }
    finally { setUploading(false) }
  }

  const deactivate = async (id) => {
    if (!confirm('Deactivate this student? They will not be able to login.')) return
    await fetch(`/api/students?id=${id}`, { method:'DELETE' })
    toast.success('Student deactivated')
    loadStudents()
  }

  const downloadTemplate = () => {
    const csv = 'name,email,class,rollNumber,section,fatherName,phone,village,distanceFromSchool\nRahul Sharma,rahul@example.com,XII,001,A,Ramesh Sharma,9876543210,Unchahar,5\nPriya Singh,priya@example.com,X,002,A,Suresh Singh,9876543211,Raebareli,40'
    const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,'+encodeURIComponent(csv)
    a.download = 'students_template.csv'; a.click()
  }

  const filtered = students.filter(s => {
    const mc = filter.class==='All'||s.class===filter.class
    const ms = !filter.search||s.name.toLowerCase().includes(filter.search.toLowerCase())||s.rollNumber.includes(filter.search)
    return mc && ms
  })

  const Field = ({ label, k, type='text', placeholder='' }) => (
    <div>
      <label className="text-xs font-medium text-slate-600 mb-1 block">{label}</label>
      <input type={type} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} placeholder={placeholder}
        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"/>
    </div>
  )

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-['Poppins',sans-serif] text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600"/> Students
          </h1>
          <p className="text-slate-500 text-sm">{students.length} total students enrolled</p>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>setShowBulk(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50">
            <Upload className="w-4 h-4"/> Bulk Upload CSV
          </button>
          <button onClick={()=>setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-medium">
            <Plus className="w-4 h-4"/> Add Student
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
          <input value={filter.search} onChange={e=>setFilter(f=>({...f,search:e.target.value}))} placeholder="Search name or roll number..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"/>
        </div>
        {['All','X','XII'].map(c => (
          <button key={c} onClick={()=>setFilter(f=>({...f,class:c}))}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter.class===c?'bg-brand-600 text-white':'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {c==='All'?'All Classes':`Class ${c}`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Roll No','Name','Class','Email','Village','Distance','Last Login','Status',''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-slate-400">No students found</td></tr>
              ) : filtered.map(s => (
                <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-sm text-slate-600">{s.rollNumber}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm flex-shrink-0">{s.name[0]}</div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{s.name}</p>
                        {s.fatherName && <p className="text-xs text-slate-400">{s.fatherName}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="bg-brand-100 text-brand-700 text-xs px-2 py-0.5 rounded-full">Class {s.class}{s.section}</span></td>
                  <td className="px-4 py-3 text-sm text-slate-600 max-w-[140px] truncate">{s.email}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{s.village||'—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{s.distanceFromSchool?`${s.distanceFromSchool} km`:'—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{s.lastLogin?new Date(s.lastLogin).toLocaleDateString('en-IN'):'Never'}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${s.isActive?'bg-green-100 text-green-700':'bg-red-100 text-red-600'}`}>{s.isActive?'Active':'Inactive'}</span></td>
                  <td className="px-4 py-3">
                    <button onClick={()=>deactivate(s._id)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add student modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-['Poppins',sans-serif] font-bold text-slate-800">Add New Student</h2>
              <button onClick={()=>setShowAdd(false)}><X className="w-5 h-5 text-slate-400"/></button>
            </div>
            <form onSubmit={addStudent} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Full Name *" k="name" placeholder="Rahul Sharma"/>
                <Field label="Email *" k="email" type="email" placeholder="rahul@example.com"/>
                <Field label="Password *" k="password" type="password" placeholder="Min 6 characters"/>
                <Field label="Roll Number *" k="rollNumber" placeholder="001"/>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Class *</label>
                  <select value={form.class} onChange={e=>setForm(f=>({...f,class:e.target.value}))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                    <option value="X">Class X</option><option value="XII">Class XII</option>
                  </select>
                </div>
                <Field label="Section" k="section" placeholder="A"/>
                <Field label="Father's Name" k="fatherName" placeholder="Ramesh Sharma"/>
                <Field label="Phone" k="phone" placeholder="9876543210"/>
                <Field label="Village/Town" k="village" placeholder="Unchahar"/>
                <Field label="Distance (km)" k="distanceFromSchool" type="number" placeholder="5"/>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={()=>setShowAdd(false)} className="flex-1 py-2 border border-slate-200 rounded-xl text-sm text-slate-600">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 disabled:bg-brand-300 flex items-center justify-center gap-2">
                  {saving?<><Loader2 className="w-4 h-4 animate-spin"/>Adding...</>:'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk upload modal */}
      {showBulk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-['Poppins',sans-serif] font-bold text-slate-800">Bulk Upload Students via CSV</h2>
              <button onClick={()=>setShowBulk(false)}><X className="w-5 h-5 text-slate-400"/></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-slate-600 text-sm">Paste your CSV data below</p>
                <button onClick={downloadTemplate} className="flex items-center gap-1.5 px-3 py-1.5 text-brand-600 border border-brand-200 rounded-xl text-sm hover:bg-brand-50 transition-colors">
                  <Download className="w-4 h-4"/> Download Template
                </button>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border text-xs text-slate-500 font-mono">
                name,email,class,rollNumber,section,fatherName,phone,village,distanceFromSchool
              </div>
              <textarea value={csvText} onChange={e=>setCsvText(e.target.value)} rows={8} placeholder="Paste CSV data here..."
                className="w-full p-3 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"/>
              <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-100 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5"/>
                <p className="text-yellow-700 text-xs">Default password = rollNumber@Vidyalaya (e.g., 001@Vidyalaya). Students can change after first login.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={()=>setShowBulk(false)} className="flex-1 py-2 border border-slate-200 rounded-xl text-sm text-slate-600">Cancel</button>
                <button onClick={bulkUpload} disabled={uploading}
                  className="flex-1 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 disabled:bg-brand-300 flex items-center justify-center gap-2">
                  {uploading?<><Loader2 className="w-4 h-4 animate-spin"/>Uploading...</>:'📤 Upload All Students'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
