'use client'
import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { ClipboardList, Clock, Trophy, AlertCircle, Send, Loader2, XCircle, CheckCircle } from 'lucide-react'

export default function TestsPage() {
  const [tests, setTests] = useState([])
  const [mySubmissions, setMySubmissions] = useState([])
  const [activeTest, setActiveTest] = useState(null)
  const [testData, setTestData] = useState(null)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [tab, setTab] = useState('available')
  const timerRef = useRef(null)

  useEffect(() => { fetchTests(); fetchSubmissions() }, [])

  useEffect(() => {
    if (timeLeft > 0 && activeTest) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); handleSubmit(); return 0 } return t - 1 })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [timeLeft, activeTest])

  const fetchTests = async () => { const r = await fetch('/api/tests'); const d = await r.json(); setTests(d.tests||[]) }
  const fetchSubmissions = async () => { const r = await fetch('/api/tests/submit'); const d = await r.json(); setMySubmissions(d.submissions||[]) }

  const startTest = async (test) => {
    const r = await fetch(`/api/tests?id=${test._id}`)
    const d = await r.json()
    if (!d.test?.questions?.length) { toast.error('This test has no questions yet'); return }
    setTestData(d.test); setActiveTest(test); setAnswers({}); setResult(null)
    setTimeLeft(test.duration * 60)
  }

  const handleSubmit = async () => {
    if (submitting) return
    clearInterval(timerRef.current)
    setSubmitting(true)
    const submittedAnswers = testData.questions.map(q => ({ questionId:q._id, answer:answers[q._id]||'' }))
    const r = await fetch('/api/tests/submit', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ testId:activeTest._id, answers:submittedAnswers, timeUsed:(activeTest.duration*60)-timeLeft }) })
    const d = await r.json()
    setSubmitting(false); setResult(d); setActiveTest(null); setTestData(null)
    fetchSubmissions()
    toast.success(`Test submitted! Score: ${d.percentage}%`)
  }

  const fmt = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`
  const alreadyDone = (id) => mySubmissions.some(s => s.testId?._id === id || s.testId === id)

  // Active test UI
  if (activeTest && testData) {
    const answered = Object.keys(answers).length
    const total = testData.questions.length
    return (
      <div className="max-w-3xl mx-auto animate-fade-in">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-4 sticky top-0 z-10 shadow">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-['Poppins',sans-serif] font-bold text-slate-800">{testData.title}</h1>
              <p className="text-slate-500 text-sm">{answered}/{total} answered</p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 font-['Poppins',sans-serif] font-bold text-xl ${timeLeft<300?'text-red-500 animate-pulse':'text-slate-700'}`}>
                <Clock className="w-5 h-5"/>{fmt(timeLeft)}
              </div>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium text-sm">
                {submitting?<><Loader2 className="w-4 h-4 animate-spin"/>Submitting...</>:<><Send className="w-4 h-4"/>Submit</>}
              </button>
            </div>
          </div>
          <div className="mt-2 bg-slate-100 rounded-full h-1.5">
            <div className="bg-brand-500 h-1.5 rounded-full transition-all" style={{width:`${(answered/total)*100}%`}} />
          </div>
        </div>

        <div className="space-y-4">
          {testData.questions.map((q,idx) => (
            <div key={q._id} className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className="flex items-start gap-3 mb-4">
                <span className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{idx+1}</span>
                <div>
                  <p className="text-slate-800 font-medium text-sm">{q.question}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{q.marks} mark{q.marks!==1?'s':''} • {q.questionType}</p>
                </div>
              </div>

              {q.questionType === 'MCQ' && (
                <div className="space-y-2 ml-10">
                  {q.options.filter(o=>o).map((opt,oi) => (
                    <label key={oi} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${answers[q._id]===opt?'border-brand-500 bg-brand-50':'border-slate-100 hover:border-slate-200 bg-white'}`}>
                      <input type="radio" name={q._id} value={opt} checked={answers[q._id]===opt} onChange={()=>setAnswers(a=>({...a,[q._id]:opt}))} className="text-brand-600"/>
                      <span className="text-slate-700 text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.questionType === 'TrueFalse' && (
                <div className="flex gap-3 ml-10">
                  {['True','False'].map(opt => (
                    <label key={opt} className={`flex items-center gap-2 px-5 py-2 rounded-xl border cursor-pointer transition-all font-medium text-sm ${answers[q._id]===opt?'border-brand-500 bg-brand-50 text-brand-700':'border-slate-200 text-slate-700 hover:border-slate-300'}`}>
                      <input type="radio" name={q._id} value={opt} checked={answers[q._id]===opt} onChange={()=>setAnswers(a=>({...a,[q._id]:opt}))} className="text-brand-600"/>
                      {opt}
                    </label>
                  ))}
                </div>
              )}

              {q.questionType === 'ShortAnswer' && (
                <textarea className="w-full ml-10 mt-1 p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                  rows={3} placeholder="Type your answer here..."
                  value={answers[q._id]||''} onChange={e=>setAnswers(a=>({...a,[q._id]:e.target.value}))} style={{width:'calc(100% - 2.5rem)'}} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-center pb-8">
          <button onClick={handleSubmit} disabled={submitting}
            className="flex items-center gap-2 px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold">
            {submitting?<><Loader2 className="w-5 h-5 animate-spin"/>Submitting...</>:<><Send className="w-5 h-5"/>Submit Test ({answered}/{total})</>}
          </button>
        </div>
      </div>
    )
  }

  // Result screen
  if (result) {
    return (
      <div className="max-w-md mx-auto text-center py-12 animate-slide-up">
        <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${result.percentage>=80?'bg-green-100':result.percentage>=33?'bg-yellow-100':'bg-red-100'}`}>
          {result.percentage>=80?<Trophy className="w-12 h-12 text-green-600"/>:result.percentage>=33?<AlertCircle className="w-12 h-12 text-yellow-600"/>:<XCircle className="w-12 h-12 text-red-500"/>}
        </div>
        <h2 className="font-['Poppins',sans-serif] text-3xl font-bold text-slate-800 mb-3">Test Submitted!</h2>
        <div className={`inline-block px-8 py-4 rounded-2xl mb-4 ${result.percentage>=80?'bg-green-50':result.percentage>=33?'bg-yellow-50':'bg-red-50'}`}>
          <p className={`text-5xl font-['Poppins',sans-serif] font-black ${result.percentage>=80?'text-green-600':result.percentage>=33?'text-yellow-600':'text-red-500'}`}>{result.percentage}%</p>
          <p className="text-slate-500 text-sm mt-1">Grade: {result.grade} • {result.marksObtained}/{result.totalMarks} marks</p>
        </div>
        <p className="text-slate-500 text-sm mb-6">
          {result.percentage>=80?'🏆 Excellent work! Keep it up!':result.percentage>=60?'👍 Good effort! Review weak areas.':result.percentage>=33?'📚 Practice more — read your notes.':'💪 Don\'t give up! Review notes and try again.'}
        </p>
        <button onClick={()=>setResult(null)} className="bg-brand-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-brand-700 transition-colors">
          Back to Tests
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-['Poppins',sans-serif] text-2xl font-bold text-slate-800 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-orange-500"/> Tests & Exams
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">Tests assigned by Shivam Sir</p>
      </div>

      <div className="flex gap-2">
        {['available','my-results'].map(t => (
          <button key={t} onClick={()=>setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab===t?'bg-brand-600 text-white':'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {t==='available'?'📋 Available Tests':'📊 My Results'}
          </button>
        ))}
      </div>

      {tab === 'available' ? (
        <div className="space-y-3">
          {tests.filter(t=>['live','scheduled'].includes(t.status)).length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <ClipboardList className="w-16 h-16 mx-auto mb-4 text-slate-200"/>
              <p className="text-slate-500 font-medium">No tests available right now</p>
              <p className="text-slate-400 text-sm">Shivam Sir will schedule tests soon</p>
            </div>
          ) : tests.filter(t=>['live','scheduled'].includes(t.status)).map(test => (
            <div key={test._id} className={`bg-white rounded-2xl border p-5 flex items-center justify-between ${test.status==='live'?'border-red-200 bg-red-50/20':'border-slate-100'}`}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-['Poppins',sans-serif] font-semibold text-slate-800">{test.title}</h3>
                  {test.status==='live'&&<span className="flex items-center gap-1 text-red-600 text-xs font-medium"><span className="live-dot"/>LIVE NOW</span>}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>{test.subject}</span><span>•</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{test.duration} min</span><span>•</span>
                  <span>{test.totalMarks} marks</span>
                </div>
              </div>
              {alreadyDone(test._id)
                ? <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium"><CheckCircle className="w-4 h-4"/>Submitted</span>
                : <button onClick={()=>startTest(test)} className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors">
                    Start Test →
                  </button>
              }
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {mySubmissions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-slate-200"/>
              <p className="text-slate-500">No test results yet — take a test!</p>
            </div>
          ) : mySubmissions.map(s => (
            <div key={s._id} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center justify-between">
              <div>
                <h3 className="font-['Poppins',sans-serif] font-semibold text-slate-800">{s.testId?.title}</h3>
                <p className="text-slate-500 text-sm">{s.testId?.subject} • {new Date(s.submittedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>
              </div>
              <div className="text-right">
                <p className={`font-['Poppins',sans-serif] font-bold text-2xl ${s.percentage>=80?'text-green-600':s.percentage>=33?'text-yellow-600':'text-red-500'}`}>{s.percentage}%</p>
                <p className="text-slate-400 text-sm">Grade: {s.grade} • {s.marksObtained}/{s.totalMarks}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
