'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { ClipboardList, Plus, Play, Square, X, Loader2, Users, Trash2 } from 'lucide-react'

const emptyTest = { title:'', class:'XII', subject:'Python', description:'', duration:30, totalMarks:0 }
const emptyQ = { questionType:'MCQ', question:'', options:['','','',''], correctAnswer:'', marks:1, hint:'', difficulty:'Easy', topic:'' }

export default function AdminTests() {
  const [tests, setTests] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [testForm, setTestForm] = useState(emptyTest)
  const [questions, setQuestions] = useState([{...emptyQ}])
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState(null)
  const [submissions, setSubmissions] = useState([])

  useEffect(() => { loadTests() }, [])

  const loadTests = async () => { const r = await fetch('/api/tests'); const d = await r.json(); setTests(d.tests||[]) }

  const viewResults = async (test) => {
    setSelected(test)
    const r = await fetch(`/api/tests/submit?testId=${test._id}`)
    const d = await r.json(); setSubmissions(d.submissions||[])
  }

  const updateStatus = async (testId, status) => {
    await fetch('/api/tests', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ id:testId, status }) })
    toast.success(status==='live'?'Test is now LIVE! 🔴':status==='completed'?'Test ended':'Updated')
    loadTests()
  }

  const addQuestion = () => setQuestions(qs => [...qs, { ...emptyQ, options:['','','',''] }])
  const removeQuestion = (i) => setQuestions(qs => qs.filter((_,idx)=>idx!==i))
  const updateQ = (i, k, v) => setQuestions(qs => qs.map((q,idx) => idx===i ? {...q,[k]:v} : q))
  const updateOpt = (qi, oi, v) => setQuestions(qs => qs.map((q,i) => { if(i!==qi)return q; const opts=[...q.options]; opts[oi]=v; return {...q,options:opts} }))

  const saveTest = async () => {
    if (!testForm.title||questions.length===0) { toast.error('Add a title and at least one question'); return }
    const badQ = questions.find(q => !q.question||!q.correctAnswer)
    if (badQ) { toast.error('All questions need question text and correct answer'); return }
    setSaving(true)
    try {
      const qIds = []
      for (const q of questions) {
        const r = await fetch('/api/questions', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ ...q, class:testForm.class, subject:testForm.subject }) })
        const d = await r.json(); if (d.id) qIds.push(d.id)
      }
      const totalMarks = questions.reduce((a,q) => a+Number(q.marks), 0)
      await fetch('/api/tests', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ ...testForm, questions:qIds, totalMarks }) })
      toast.success('Test created! Click "Go Live" when ready.')
      setShowCreate(false); setTestForm(emptyTest); setQuestions([{...emptyQ}]); loadTests()
    } catch { toast.error('Failed to create test') }
    finally { setSaving(false) }
  }

  const statusColor = { draft:'bg-slate-100 text-slate-600', live:'bg-red-100 text-red-700', completed:'bg-green-100 text-green-700' }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Poppins',sans-serif] text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-orange-500"/> Tests & Exams
          </h1>
          <p className="text-slate-500 text-sm">{tests.length} tests created</p>
        </div>
        <button onClick={()=>setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-medium">
          <Plus className="w-4 h-4"/> Create Test
        </button>
      </div>

      <div className="space-y-3">
        {tests.length===0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <ClipboardList className="w-16 h-16 mx-auto mb-4 text-slate-200"/>
            <p className="text-slate-500">No tests yet. Create your first test!</p>
          </div>
        ) : tests.map(test => (
          <div key={test._id} className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-['Poppins',sans-serif] font-semibold text-slate-800">{test.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[test.status]}`}>
                    {test.status==='live'?'🔴 LIVE':test.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>Class {test.class}</span><span>•</span>
                  <span>{test.subject}</span><span>•</span>
                  <span>{test.duration} min</span><span>•</span>
                  <span>{test.totalMarks} marks</span><span>•</span>
                  <span>{test.questions?.length||0} questions</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={()=>viewResults(test)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs hover:bg-slate-100 transition-colors">
                  <Users className="w-3.5 h-3.5"/> View Results
                </button>
                {test.status==='draft' && (
                  <button onClick={()=>updateStatus(test._id,'live')} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs">
                    <Play className="w-3.5 h-3.5"/> Go Live
                  </button>
                )}
                {test.status==='live' && (
                  <button onClick={()=>updateStatus(test._id,'completed')} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs">
                    <Square className="w-3.5 h-3.5"/> End Test
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Results modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-4 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h2 className="font-['Poppins',sans-serif] font-bold text-slate-800">Results: {selected.title}</h2>
                <p className="text-slate-500 text-sm">{submissions.length} submissions</p>
              </div>
              <button onClick={()=>setSelected(null)}><X className="w-5 h-5 text-slate-400"/></button>
            </div>
            <div className="p-5">
              {submissions.length===0 ? (
                <p className="text-center text-slate-400 py-8">No submissions yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-slate-50">
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Student</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Roll No</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Score</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Grade</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Time</th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-50">
                      {submissions.sort((a,b)=>b.percentage-a.percentage).map((s,i) => (
                        <tr key={s._id} className={i===0?'bg-yellow-50':''}>
                          <td className="px-3 py-2 font-medium text-slate-800">{s.studentId?.name}</td>
                          <td className="px-3 py-2 text-slate-500 font-mono text-xs">{s.studentId?.rollNumber}</td>
                          <td className="px-3 py-2"><span className={`font-bold ${s.percentage>=80?'text-green-600':s.percentage>=33?'text-yellow-600':'text-red-500'}`}>{s.percentage}%</span><span className="text-slate-400 text-xs ml-1">({s.marksObtained}/{s.totalMarks})</span></td>
                          <td className="px-3 py-2"><span className="bg-brand-100 text-brand-700 text-xs px-2 py-0.5 rounded-full">{s.grade}</span></td>
                          <td className="px-3 py-2 text-slate-500 text-xs">{s.timeUsed?`${Math.round(s.timeUsed/60)} min`:'—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create test modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl my-4 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="font-['Poppins',sans-serif] font-bold text-slate-800">Create New Test</h2>
              <button onClick={()=>setShowCreate(false)}><X className="w-5 h-5 text-slate-400"/></button>
            </div>
            <div className="p-5 space-y-5">
              {/* Test details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Test Title *</label>
                  <input value={testForm.title} onChange={e=>setTestForm(f=>({...f,title:e.target.value}))} placeholder="e.g., Unit Test 1 — Python Functions"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"/>
                </div>
                {[
                  { k:'class', label:'Class', type:'select', opts:['X','XII'] },
                  { k:'subject', label:'Subject', type:'select', opts:['Python','Networks','Database','AI','General'] },
                  { k:'duration', label:'Duration (minutes)', type:'number' },
                  { k:'description', label:'Description (optional)', type:'text' },
                ].map(({ k, label, type, opts }) => (
                  <div key={k}>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">{label}</label>
                    {type==='select'
                      ? <select value={testForm[k]} onChange={e=>setTestForm(f=>({...f,[k]:e.target.value}))}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                          {opts.map(o=><option key={o}>{o}</option>)}
                        </select>
                      : <input type={type} value={testForm[k]} onChange={e=>setTestForm(f=>({...f,[k]:e.target.value}))}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"/>
                    }
                  </div>
                ))}
              </div>

              {/* Questions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-700 text-sm">Questions ({questions.length}) — Total: {questions.reduce((a,q)=>a+Number(q.marks),0)} marks</h3>
                  <button onClick={addQuestion} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 border border-brand-200 rounded-xl text-xs hover:bg-brand-100">
                    <Plus className="w-3 h-3"/> Add Question
                  </button>
                </div>
                <div className="space-y-4">
                  {questions.map((q, qi) => (
                    <div key={qi} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-slate-700">Question {qi+1}</span>
                        {questions.length>1 && (
                          <button onClick={()=>removeQuestion(qi)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <div>
                          <label className="text-xs text-slate-500 mb-1 block">Type</label>
                          <select value={q.questionType} onChange={e=>updateQ(qi,'questionType',e.target.value)}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white">
                            {['MCQ','TrueFalse','ShortAnswer'].map(t=><option key={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 mb-1 block">Marks</label>
                          <input type="number" min="1" value={q.marks} onChange={e=>updateQ(qi,'marks',Number(e.target.value))}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"/>
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 mb-1 block">Topic</label>
                          <input value={q.topic} onChange={e=>updateQ(qi,'topic',e.target.value)} placeholder="e.g., Functions"
                            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"/>
                        </div>
                      </div>
                      <div className="mb-2">
                        <label className="text-xs text-slate-500 mb-1 block">Question *</label>
                        <textarea value={q.question} onChange={e=>updateQ(qi,'question',e.target.value)} rows={2} placeholder="Type your question here..."
                          className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white resize-none"/>
                      </div>
                      {q.questionType==='MCQ' && (
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          {q.options.map((opt,oi) => (
                            <input key={oi} value={opt} onChange={e=>updateOpt(qi,oi,e.target.value)} placeholder={`Option ${oi+1}`}
                              className="px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"/>
                          ))}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-slate-500 mb-1 block">Correct Answer *</label>
                          {q.questionType==='TrueFalse'
                            ? <select value={q.correctAnswer} onChange={e=>updateQ(qi,'correctAnswer',e.target.value)}
                                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white">
                                <option value="">Select...</option><option>True</option><option>False</option>
                              </select>
                            : <input value={q.correctAnswer} onChange={e=>updateQ(qi,'correctAnswer',e.target.value)}
                                placeholder={q.questionType==='MCQ'?'Copy exact option text':'Expected answer'}
                                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"/>
                          }
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 mb-1 block">Hint (optional)</label>
                          <input value={q.hint} onChange={e=>updateQ(qi,'hint',e.target.value)} placeholder="Give students a hint..."
                            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"/>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={()=>setShowCreate(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600">Cancel</button>
                <button onClick={saveTest} disabled={saving}
                  className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 disabled:bg-brand-300 flex items-center justify-center gap-2">
                  {saving?<><Loader2 className="w-4 h-4 animate-spin"/>Saving...</>:'✅ Create Test'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
