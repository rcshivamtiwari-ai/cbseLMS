'use client'
import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { Video, Calendar, Clock, Users, ExternalLink, Play, Loader2, BookOpen } from 'lucide-react'

export default function ClassesPage() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeClass, setActiveClass] = useState(null)
  const jitsiRef = useRef(null)

  useEffect(() => {
    fetch('/api/classes').then(r => r.json()).then(d => { setClasses(d.classes||[]); setLoading(false) })
  }, [])

  const joinClass = async (cls) => {
    await fetch('/api/classes', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ classId:cls._id, action:'join' }) })
    setActiveClass(cls)
    setTimeout(() => {
      if (window.JitsiMeetExternalAPI) { initJitsi(cls) }
      else {
        const s = document.createElement('script')
        s.src = 'https://meet.jit.si/external_api.js'
        s.onload = () => initJitsi(cls)
        document.head.appendChild(s)
      }
    }, 200)
  }

  const initJitsi = (cls) => {
    if (jitsiRef.current) { try { jitsiRef.current.dispose() } catch {} }
    jitsiRef.current = new window.JitsiMeetExternalAPI('meet.jit.si', {
      roomName: cls.meetingId,
      parentNode: document.getElementById('jitsi-container'),
      width: '100%', height: '500px',
      configOverwrite: { prejoinPageEnabled:false, startWithAudioMuted:true, startWithVideoMuted:true, disableDeepLinking:true },
      interfaceConfigOverwrite: { TOOLBAR_BUTTONS:['microphone','camera','chat','raisehand','tileview','hangup'], SHOW_JITSI_WATERMARK:false },
    })
    jitsiRef.current.on('readyToClose', () => { setActiveClass(null) })
  }

  const leaveClass = () => {
    if (jitsiRef.current) { try { jitsiRef.current.dispose() } catch {} jitsiRef.current = null }
    setActiveClass(null)
  }

  const fmt = (d) => new Date(d).toLocaleString('en-IN', { weekday:'short', day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })
  const statusColor = { scheduled:'bg-blue-100 text-blue-700', live:'bg-red-100 text-red-700', ended:'bg-slate-100 text-slate-500' }

  if (activeClass) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-['Poppins',sans-serif] font-bold text-xl text-slate-800">{activeClass.title}</h2>
            <p className="text-slate-500 text-sm">{activeClass.subject}{activeClass.topic ? ` • ${activeClass.topic}` : ''}</p>
          </div>
          <button onClick={leaveClass} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors">
            Leave Class
          </button>
        </div>
        <div id="jitsi-container" className="w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 min-h-[120px] flex items-center justify-center">
          <div className="text-slate-400 flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin"/><span className="text-sm">Loading classroom...</span>
          </div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-blue-800 text-sm">💡 <strong>Tips:</strong> Keep mic muted unless asked to speak. Raise your hand ✋ to ask questions. Use chat for written questions.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-['Poppins',sans-serif] text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Video className="w-6 h-6 text-red-500"/> Live Classes
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">Join live classes by Shivam Sir • Free video via Jitsi Meet — no downloads needed</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-28 bg-white rounded-2xl border border-slate-100 animate-pulse"/>)}</div>
      ) : classes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <Video className="w-16 h-16 mx-auto mb-4 text-slate-200"/>
          <p className="text-slate-500 font-medium">No classes scheduled yet</p>
          <p className="text-slate-400 text-sm">Shivam Sir will schedule classes soon</p>
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map(cls => (
            <div key={cls._id} className={`bg-white rounded-2xl border p-5 flex items-center justify-between gap-3 ${cls.status==='live'?'border-red-200 bg-red-50/20':'border-slate-100'}`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${cls.status==='live'?'bg-red-100':cls.status==='ended'?'bg-slate-100':'bg-brand-100'}`}>
                  <Video className={`w-6 h-6 ${cls.status==='live'?'text-red-600':cls.status==='ended'?'text-slate-400':'text-brand-600'}`}/>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <h3 className="font-['Poppins',sans-serif] font-semibold text-slate-800">{cls.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[cls.status]}`}>
                      {cls.status==='live'?<><span className="live-dot"/>LIVE</>:cls.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm">{cls.subject}{cls.topic?` • ${cls.topic}`:''}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/>{fmt(cls.scheduledAt)}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{cls.duration} min</span>
                    {cls.attendees?.length>0&&<span className="flex items-center gap-1"><Users className="w-3 h-3"/>{cls.attendees.length} joined</span>}
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                {cls.status==='live'&&(
                  <button onClick={()=>joinClass(cls)}
                    className="flex items-center gap-2 px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors">
                    <Play className="w-4 h-4"/>Join Now
                  </button>
                )}
                {cls.status==='scheduled'&&(
                  <button disabled className="px-5 py-2 bg-slate-100 text-slate-400 rounded-xl text-sm cursor-not-allowed">Not Started Yet</button>
                )}
                {cls.status==='ended'&&cls.recordingUrl&&(
                  <a href={cls.recordingUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 border border-brand-200 rounded-xl text-sm hover:bg-brand-100 transition-colors">
                    <BookOpen className="w-4 h-4"/>Watch Recording
                  </a>
                )}
                {cls.status==='ended'&&!cls.recordingUrl&&<span className="text-xs text-slate-400 px-3">Class Ended</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-brand-50 rounded-2xl p-4 border border-brand-100">
        <h3 className="font-semibold text-brand-800 text-sm mb-2">📌 Class Conduct Rules</h3>
        <ul className="text-brand-700 text-sm space-y-1">
          <li>• Keep microphone muted when not speaking</li>
          <li>• Use the Raise Hand ✋ button to ask questions</li>
          <li>• Use chat for written questions or messages</li>
          <li>• Joining the class counts as your attendance</li>
          <li>• Be respectful to Sir and fellow classmates</li>
        </ul>
      </div>
    </div>
  )
}
