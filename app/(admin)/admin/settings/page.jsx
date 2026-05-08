'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Settings, Users, Globe, Shield, Loader2, Save } from 'lucide-react'

export default function AdminSettings() {
  const [settings, setSettings] = useState({ enrollmentOpen:false, openToPublic:false })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pwForm, setPwForm] = useState({ current:'', newPw:'', confirm:'' })
  const [changingPw, setChangingPw] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings').then(r=>r.json()).then(d=>{ setSettings(d); setLoading(false) })
  }, [])

  const saveSettings = async () => {
    setSaving(true)
    const r = await fetch('/api/admin/settings', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(settings) })
    setSaving(false)
    if (r.ok) toast.success('Settings saved!')
    else toast.error('Failed to save settings')
  }

  const changePassword = async (e) => {
    e.preventDefault()
    if (!pwForm.current||!pwForm.newPw) { toast.error('Fill all password fields'); return }
    if (pwForm.newPw !== pwForm.confirm) { toast.error('New passwords do not match'); return }
    if (pwForm.newPw.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setChangingPw(true)
    const r = await fetch('/api/profile', { method:'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ type:'password', currentPassword:pwForm.current, newPassword:pwForm.newPw }) })
    const d = await r.json()
    setChangingPw(false)
    if (r.ok) { toast.success('Password changed successfully! 🎉'); setPwForm({ current:'', newPw:'', confirm:'' }) }
    else toast.error(d.error||'Failed to change password')
  }

  const Toggle = ({ value, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={value} onChange={e=>onChange(e.target.checked)} className="sr-only peer"/>
      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
    </label>
  )

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="font-['Poppins',sans-serif] text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-600"/> Settings
        </h1>
        <p className="text-slate-500 text-sm">Control platform access and your account</p>
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2].map(i=><div key={i} className="h-24 bg-white rounded-2xl border border-slate-100 animate-pulse"/>)}</div>
      ) : (
        <>
          {/* Enrollment control */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-blue-600"/>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">New Student Enrollment</h3>
                  <p className="text-slate-500 text-sm mt-1">
                    When <strong>OFF</strong>: Only you can add students (recommended).<br/>
                    When <strong>ON</strong>: Students can self-register with a link.
                  </p>
                  <p className={`text-xs mt-2 px-3 py-1.5 rounded-lg inline-block ${settings.enrollmentOpen?'bg-green-50 text-green-700':'bg-orange-50 text-orange-700'}`}>
                    {settings.enrollmentOpen ? '🟢 Open — anyone can register' : '🔒 Closed — only admin can add students'}
                  </p>
                </div>
              </div>
              <Toggle value={settings.enrollmentOpen} onChange={v=>setSettings(s=>({...s,enrollmentOpen:v}))}/>
            </div>
          </div>

          {/* Public access */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-green-600"/>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Open to Public</h3>
                  <p className="text-slate-500 text-sm mt-1">
                    For <strong>future use</strong> — allow students from other schools.<br/>
                    Keep <strong>OFF</strong> now to keep it only for Chinmaya Vidyalaya.
                  </p>
                  <p className={`text-xs mt-2 px-3 py-1.5 rounded-lg inline-block ${settings.openToPublic?'bg-green-50 text-green-700':'bg-brand-50 text-brand-700'}`}>
                    {settings.openToPublic ? '🌍 Open to all schools' : '🏫 Chinmaya Vidyalaya only (private)'}
                  </p>
                </div>
              </div>
              <Toggle value={settings.openToPublic} onChange={v=>setSettings(s=>({...s,openToPublic:v}))}/>
            </div>
          </div>

          <button onClick={saveSettings} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white rounded-xl font-medium text-sm">
            {saving?<><Loader2 className="w-4 h-4 animate-spin"/>Saving...</>:<><Save className="w-4 h-4"/>Save Settings</>}
          </button>

          {/* Change password */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-orange-600"/>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Change Your Password</h3>
                <p className="text-slate-500 text-sm">Update your admin account password</p>
              </div>
            </div>
            <form onSubmit={changePassword} className="space-y-3">
              {[
                { label:'Current Password', k:'current' },
                { label:'New Password', k:'newPw' },
                { label:'Confirm New Password', k:'confirm' },
              ].map(({ label, k }) => (
                <div key={k}>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">{label}</label>
                  <input type="password" value={pwForm[k]} onChange={e=>setPwForm(f=>({...f,[k]:e.target.value}))}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"/>
                </div>
              ))}
              <button type="submit" disabled={changingPw}
                className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                {changingPw?<><Loader2 className="w-4 h-4 animate-spin"/>Changing...</>:'🔐 Change Password'}
              </button>
            </form>
          </div>

          {/* Security info */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5"/>
              <div>
                <h4 className="font-medium text-slate-700 text-sm mb-2">Platform Security</h4>
                <ul className="text-slate-500 text-sm space-y-1">
                  <li>✅ All passwords encrypted with bcrypt</li>
                  <li>✅ Sessions expire after 30 days automatically</li>
                  <li>✅ All API routes are authenticated</li>
                  <li>✅ Admin routes protected by role check</li>
                  <li>✅ MongoDB Atlas with IP whitelisting</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
