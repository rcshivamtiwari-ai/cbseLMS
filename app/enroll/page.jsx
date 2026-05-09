'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { BookOpen, User, Mail, Lock, Eye, EyeOff, Phone, MapPin, Hash, Loader2, CheckCircle } from 'lucide-react'

export default function EnrollPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    class: 'XII', rollNumber: '', section: 'A',
    fatherName: '', phone: '', village: '', distanceFromSchool: '',
  })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [closed, setClosed] = useState(false)
  const [checking, setChecking] = useState(true)

  // Check if enrollment is open
  useState(() => {
    fetch('/api/enroll/check')
      .then(r => r.json())
      .then(d => { if (!d.open) setClosed(true) })
      .catch(() => setClosed(true))
      .finally(() => setChecking(false))
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password || !form.rollNumber) {
      toast.error('Please fill all required fields (*)'); return
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match'); return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters'); return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setDone(true)
      } else {
        toast.error(data.error || 'Registration failed. Try again.')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 to-brand-700">
        <div className="text-center text-white">
          <div className="w-10 h-10 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm opacity-70">Loading...</p>
        </div>
      </div>
    )
  }

  if (closed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 to-brand-700 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="font-['Poppins',sans-serif] text-xl font-bold text-slate-800 mb-2">
            Enrollment is Closed
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            New student registration is currently closed.<br />
            Please contact <strong>Shivam Sir</strong> to get your account created.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 to-brand-700 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-slide-up">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="font-['Poppins',sans-serif] text-2xl font-bold text-slate-800 mb-2">
            Registration Successful! 🎉
          </h2>
          <p className="text-slate-500 text-sm mb-2">
            Your account has been created.
          </p>
          <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left border border-slate-100">
            <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Your login details</p>
            <p className="text-sm text-slate-700"><span className="font-medium">Email:</span> {form.email}</p>
            <p className="text-sm text-slate-700 mt-1"><span className="font-medium">Password:</span> the one you set</p>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-brand-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            Go to Login →
          </button>
        </div>
      </div>
    )
  }

  const Input = ({ icon: Icon, label, k, type = 'text', placeholder, required = false, half = false }) => (
    <div className={half ? '' : 'col-span-2 md:col-span-2'}>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />}
        <input
          type={type}
          value={form[k]}
          onChange={e => set(k, e.target.value)}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2.5 border border-slate-200 rounded-xl text-sm
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition bg-white`}
        />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 py-8 px-4">
      <div className="max-w-xl mx-auto animate-slide-up">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-xl mb-4">
            <BookOpen className="w-8 h-8 text-brand-600" />
          </div>
          <h1 className="font-['Poppins',sans-serif] text-white text-xl font-bold">
            Chinmaya Vidyalaya NTPC Unchahar
          </h1>
          <p className="text-brand-200 text-sm mt-1">Student Registration — Class X &amp; XII</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="font-['Poppins',sans-serif] text-lg font-bold text-slate-800 mb-1">
            Create Your Account
          </h2>
          <p className="text-slate-500 text-xs mb-5">
            Fields marked with <span className="text-red-500">*</span> are required
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Personal info */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Personal Information</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                      placeholder="e.g. Rahul Sharma" required
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Class <span className="text-red-500">*</span></label>
                  <select value={form.class} onChange={e => set('class', e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
                    <option value="X">Class X</option>
                    <option value="XII">Class XII</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Roll Number <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" value={form.rollNumber} onChange={e => set('rollNumber', e.target.value)}
                      placeholder="e.g. 001"
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Section</label>
                  <input type="text" value={form.section} onChange={e => set('section', e.target.value)}
                    placeholder="A"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Father's Name</label>
                  <input type="text" value={form.fatherName} onChange={e => set('fatherName', e.target.value)}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                      placeholder="9876543210"
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Village / Town</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" value={form.village} onChange={e => set('village', e.target.value)}
                      placeholder="e.g. Unchahar"
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Distance from School (km)</label>
                  <input type="number" value={form.distanceFromSchool} onChange={e => set('distanceFromSchool', e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white" />
                </div>
              </div>
            </div>

            {/* Login credentials */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Login Credentials</p>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type={show ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white" />
                    <button type="button" onClick={() => setShow(!show)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirm Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                      placeholder="Type password again"
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white" />
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white
                font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm mt-2">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account...</>
                : '✅ Create My Account'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-slate-400 text-xs">
              Already have an account?{' '}
              <button onClick={() => router.push('/login')} className="text-brand-600 hover:underline font-medium">
                Login here
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-brand-400 text-xs mt-4">
          Made with ❤️ for students of Chinmaya Vidyalaya NTPC Unchahar
        </p>
      </div>
    </div>
  )
}
