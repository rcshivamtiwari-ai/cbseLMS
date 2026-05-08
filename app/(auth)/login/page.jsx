'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { BookOpen, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Fill all fields'); return }
    setLoading(true)
    const res = await signIn('credentials', { ...form, redirect: false })
    setLoading(false)
    if (res?.error) toast.error('Invalid email or password')
    else { toast.success('Welcome! 🎉'); router.push('/'); router.refresh() }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 p-4">
      <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:`url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff'%3E%3Cpath d='M20 20.5V18H0v5h5v5H0v5h20v-9.5zm-2 5.5h-1v-2h1v2z'/%3E%3C/g%3E%3C/svg%3E")`}} />
      <div className="relative w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-xl mb-4">
            <BookOpen className="w-10 h-10 text-brand-600" />
          </div>
          <h1 className="text-white font-['Poppins',sans-serif] text-2xl font-bold">Chinmaya Vidyalaya</h1>
          <p className="text-brand-200 text-sm mt-1">NTPC Unchahar — Computer Science Portal</p>
          <p className="text-brand-300 text-xs mt-0.5">Class X & XII</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="font-['Poppins',sans-serif] text-xl font-bold text-slate-800 mb-1">Welcome Back! 👋</h2>
          <p className="text-slate-500 text-sm mb-6">Login with your school credentials</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}
                  placeholder="your.email@school.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type={show?'text':'password'} value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition" />
                <button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {show ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin"/>Signing in...</> : 'Sign In →'}
            </button>
          </form>
          <div className="mt-5 p-3.5 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-xs text-slate-600 text-center leading-relaxed">
              🎓 Use email & password given by <strong>Shivam Sir</strong>.<br/>Forgot password? Ask sir to reset it.
            </p>
          </div>
        </div>
        <p className="text-center text-brand-400 text-xs mt-5">Made with ❤️ for students of Chinmaya Vidyalaya</p>
      </div>
    </div>
  )
}
