'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { Play, RotateCcw, Lightbulb, CheckCircle, XCircle, Loader2, Code2 } from 'lucide-react'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false, loading: () => <div className="flex items-center justify-center h-full bg-slate-900 text-slate-400 text-sm">Loading editor...</div> })

const CHALLENGES = [
  { id:1, title:'Hello World', difficulty:'Easy', topic:'Basics',
    desc:'Print "Hello, World!" on screen.',
    code:'# Write your code here\n\n',
    testCases:[{ input:'', expectedOutput:'Hello, World!' }],
    hint:'Use the print() function' },
  { id:2, title:'Sum of Two Numbers', difficulty:'Easy', topic:'Functions',
    desc:'Write a function add(a,b) that returns sum of a and b. Then print add(3,5).',
    code:'def add(a, b):\n    # write your code here\n    pass\n\nprint(add(3, 5))',
    testCases:[{ input:'', expectedOutput:'8' }],
    hint:'Use the + operator inside the function and return the result' },
  { id:3, title:'Read File — Words with #', difficulty:'Medium', topic:'File Handling',
    desc:'Given content (simulating a file), read each line and print words separated by #.',
    code:'content = "Hello World\\nPython is fun\\nI love coding"\n\nfor line in content.split("\\n"):\n    # split line into words and join with #\n    pass',
    testCases:[{ input:'', expectedOutput:'Hello#World\nPython#is#fun\nI#love#coding' }],
    hint:'Use .split() to get words, then "#".join(words) to combine' },
  { id:4, title:'Implement Stack', difficulty:'Medium', topic:'Data Structures',
    desc:'Complete the Stack class. Push 10, 20, 30 then pop and print the result.',
    code:'class Stack:\n    def __init__(self):\n        self.items = []\n    def push(self, item):\n        pass  # add to top\n    def pop(self):\n        pass  # remove from top\n    def is_empty(self):\n        pass  # return True if empty\n\ns = Stack()\ns.push(10)\ns.push(20)\ns.push(30)\nprint(s.pop())',
    testCases:[{ input:'', expectedOutput:'30' }],
    hint:'LIFO — use list.append() for push, list.pop() for pop' },
  { id:5, title:'Count Vowels', difficulty:'Easy', topic:'Strings',
    desc:'Count vowels in "Hello World Python Programming" and print the count.',
    code:'text = "Hello World Python Programming"\nvowels = "aeiouAEIOU"\ncount = 0\n# count vowels in text\n\nprint(count)',
    testCases:[{ input:'', expectedOutput:'7' }],
    hint:'Loop through each character and check if it is in the vowels string' },
  { id:6, title:'Exception Handling', difficulty:'Medium', topic:'Exceptions',
    desc:'Handle ZeroDivisionError when dividing 10 by 0. Print "Cannot divide by zero".',
    code:'try:\n    result = 10 / 0\nexcept:\n    pass  # print the error message',
    testCases:[{ input:'', expectedOutput:'Cannot divide by zero' }],
    hint:'Use except ZeroDivisionError:' },
  { id:7, title:'Fibonacci Series', difficulty:'Medium', topic:'Loops',
    desc:'Print the first 8 Fibonacci numbers on one line separated by spaces.',
    code:'# Fibonacci: 0 1 1 2 3 5 8 13\na, b = 0, 1\nresult = []\nfor i in range(8):\n    pass  # append a to result and update a, b\n\nprint(" ".join(map(str, result)))',
    testCases:[{ input:'', expectedOutput:'0 1 1 2 3 5 8 13' }],
    hint:'a, b = b, a+b updates both values simultaneously' },
  { id:8, title:'CSV — Store and Search', difficulty:'Hard', topic:'CSV Files',
    desc:'Simulate CSV: store user-id and password pairs, then search for "user2".',
    code:'import csv\nimport io\n\n# Create in-memory CSV\noutput = io.StringIO()\nwriter = csv.writer(output)\nwriter.writerow(["user1","pass123"])\nwriter.writerow(["user2","secret456"])\nwriter.writerow(["user3","mypassword"])\n\n# Read and search for "user2"\noutput.seek(0)\nreader = csv.reader(output)\nsearch_id = "user2"\nfor row in reader:\n    if row[0] == search_id:\n        print(f"Password: {row[1]}")\n        break',
    testCases:[{ input:'', expectedOutput:'Password: secret456' }],
    hint:'csv.reader() returns each row as a list, row[0] is the user-id' },
]

export default function PracticePage() {
  const [challenge, setChallenge] = useState(CHALLENGES[0])
  const [code, setCode] = useState(CHALLENGES[0].code)
  const [results, setResults] = useState(null)
  const [running, setRunning] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [freeCode, setFreeCode] = useState('# Free Python Practice\n# Write any code here and click Run!\n\nprint("Welcome to Chinmaya Vidyalaya!")\nprint("Python is awesome!")\n')
  const [freeOutput, setFreeOutput] = useState('')
  const [freeRunning, setFreeRunning] = useState(false)
  const [tab, setTab] = useState('challenges')

  const selectChallenge = (c) => { setChallenge(c); setCode(c.code); setResults(null); setShowHint(false) }

  const runCode = async () => {
    setRunning(true); setResults(null)
    try {
      const res = await fetch('/api/code', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ code, language:'python', topic:challenge.topic, testCases:challenge.testCases }) })
      const data = await res.json()
      if (data.error) { toast.error(data.error); return }
      setResults(data.results)
      if (data.results.every(r => r.passed)) toast.success('All tests passed! 🎉')
      else toast.error('Some tests failed. Check output.')
    } catch { toast.error('Failed to run code. Try again.') }
    finally { setRunning(false) }
  }

  const runFreeCode = async () => {
    setFreeRunning(true); setFreeOutput('')
    try {
      const res = await fetch('/api/code', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ code:freeCode, language:'python', topic:'Free Practice' }) })
      const data = await res.json()
      if (data.results?.[0]) setFreeOutput(data.results[0].output || data.results[0].error || '(no output)')
    } catch { toast.error('Failed to run code') }
    finally { setFreeRunning(false) }
  }

  const diffBadge = { Easy:'bg-green-100 text-green-700', Medium:'bg-yellow-100 text-yellow-700', Hard:'bg-red-100 text-red-700' }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-['Poppins',sans-serif] text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Code2 className="w-6 h-6 text-green-600" /> Python Practice
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Code in your browser — no installation needed. Powered by Piston API (free).</p>
        </div>
        <div className="flex gap-2">
          {['challenges','free'].map(t => (
            <button key={t} onClick={()=>setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${tab===t?'bg-brand-600 text-white':'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
              {t === 'free' ? '🆓 Free Code' : '🏆 Challenges'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'challenges' ? (
        <div className="grid grid-cols-12 gap-4">
          {/* Challenge list */}
          <div className="col-span-3 space-y-1.5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-1 mb-2">Challenges ({CHALLENGES.length})</p>
            {CHALLENGES.map(c => (
              <button key={c.id} onClick={()=>selectChallenge(c)}
                className={`w-full text-left p-3 rounded-xl border transition-all text-sm ${challenge.id===c.id?'border-brand-400 bg-brand-50':'border-slate-100 bg-white hover:border-slate-200'}`}>
                <p className="font-medium text-slate-800 text-xs mb-1">{c.title}</p>
                <div className="flex items-center gap-1">
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${diffBadge[c.difficulty]}`}>{c.difficulty}</span>
                  <span className="text-slate-400 text-xs truncate">• {c.topic}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Editor */}
          <div className="col-span-9 space-y-3">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              {/* Problem statement */}
              <div className="p-4 bg-slate-50 border-b">
                <div className="flex items-center gap-2 mb-1.5">
                  <h2 className="font-['Poppins',sans-serif] font-semibold text-slate-800">{challenge.title}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${diffBadge[challenge.difficulty]}`}>{challenge.difficulty}</span>
                  <span className="text-xs text-slate-400">Topic: {challenge.topic}</span>
                </div>
                <p className="text-slate-600 text-sm">{challenge.desc}</p>
                {showHint && (
                  <div className="mt-3 p-2.5 bg-yellow-50 rounded-xl border border-yellow-100">
                    <p className="text-yellow-800 text-sm">💡 <strong>Hint:</strong> {challenge.hint}</p>
                  </div>
                )}
              </div>

              {/* Monaco Editor */}
              <MonacoEditor height="300px" language="python" value={code} onChange={setCode} theme="vs-dark"
                options={{ fontSize:14, minimap:{enabled:false}, lineNumbers:'on', scrollBeyondLastLine:false, automaticLayout:true, tabSize:4, fontFamily:"'Fira Code','Courier New',monospace" }} />

              {/* Actions */}
              <div className="p-3 bg-slate-50 border-t flex items-center justify-between">
                <div className="flex gap-2">
                  <button onClick={()=>setShowHint(!showHint)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg text-xs hover:bg-yellow-100 transition-colors">
                    <Lightbulb className="w-3.5 h-3.5" />{showHint?'Hide Hint':'Show Hint'}
                  </button>
                  <button onClick={()=>{setCode(challenge.code);setResults(null)}}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 bg-white border border-slate-200 rounded-lg text-xs hover:bg-slate-50 transition-colors">
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
                </div>
                <button onClick={runCode} disabled={running}
                  className="flex items-center gap-2 px-5 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg text-sm font-medium transition-colors">
                  {running ? <><Loader2 className="w-4 h-4 animate-spin"/>Running...</> : <><Play className="w-4 h-4"/>Run Code</>}
                </button>
              </div>
            </div>

            {/* Results */}
            {results && (
              <div className="bg-white rounded-2xl border border-slate-100 p-4">
                <h3 className="font-medium text-slate-800 text-sm mb-3">Test Results</h3>
                <div className="space-y-2">
                  {results.map((r,i) => (
                    <div key={i} className={`p-3 rounded-xl border text-sm ${r.passed?'bg-green-50 border-green-100':'bg-red-50 border-red-100'}`}>
                      <div className="flex items-center gap-2">
                        {r.passed ? <CheckCircle className="w-4 h-4 text-green-600"/> : <XCircle className="w-4 h-4 text-red-500"/>}
                        <span className={`font-medium ${r.passed?'text-green-700':'text-red-700'}`}>
                          Test {i+1}: {r.passed ? 'Passed ✓' : 'Failed ✗'}
                        </span>
                      </div>
                      {!r.passed && (
                        <div className="mt-2 ml-6 space-y-1 text-xs">
                          <p className="text-slate-600">Expected: <code className="bg-white px-1 rounded border">{r.expected}</code></p>
                          <p className="text-slate-600">Got: <code className="bg-white px-1 rounded border">{r.actual||r.error||'(empty)'}</code></p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Free practice */
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b flex items-center justify-between">
            <div>
              <h2 className="font-['Poppins',sans-serif] font-semibold text-slate-800">Free Python Playground</h2>
              <p className="text-slate-500 text-xs mt-0.5">Write any Python code and run it instantly!</p>
            </div>
            <button onClick={runFreeCode} disabled={freeRunning}
              className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-xl text-sm font-medium transition-colors">
              {freeRunning ? <><Loader2 className="w-4 h-4 animate-spin"/>Running...</> : <><Play className="w-4 h-4"/>Run</>}
            </button>
          </div>
          <MonacoEditor height="380px" language="python" value={freeCode} onChange={setFreeCode} theme="vs-dark"
            options={{ fontSize:14, minimap:{enabled:false}, scrollBeyondLastLine:false, automaticLayout:true, tabSize:4, fontFamily:"'Fira Code','Courier New',monospace" }} />
          {freeOutput && (
            <div className="bg-slate-900 p-4 border-t border-slate-800">
              <p className="text-slate-400 text-xs font-mono mb-2">▶ OUTPUT:</p>
              <pre className="text-green-300 text-sm font-mono whitespace-pre-wrap">{freeOutput}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
