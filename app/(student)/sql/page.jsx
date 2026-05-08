'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { Database, Play, Loader2, Table, RefreshCw, BookOpen } from 'lucide-react'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false, loading: () => <div className="flex items-center justify-center h-full bg-slate-900 text-slate-400 text-sm">Loading editor...</div> })

const PRESETS = [
  { label:'📋 Create Students Table', query:`CREATE TABLE IF NOT EXISTS students (\n  rollno INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  class TEXT,\n  marks INTEGER,\n  city TEXT\n);\n\nINSERT INTO students VALUES(1,'Rahul Sharma','XII',85,'Unchahar');\nINSERT INTO students VALUES(2,'Priya Singh','XII',92,'Raebareli');\nINSERT INTO students VALUES(3,'Amit Kumar','X',78,'Unchahar');\nINSERT INTO students VALUES(4,'Sneha Gupta','X',88,'Lucknow');\nINSERT INTO students VALUES(5,'Rohit Verma','XII',65,'Allahabad');\n\nSELECT * FROM students;` },
  { label:'🔍 WHERE clause', query:`SELECT name, marks FROM students\nWHERE marks > 80\nORDER BY marks DESC;` },
  { label:'📊 GROUP BY + AVG', query:`SELECT class,\n       COUNT(*) AS total,\n       AVG(marks) AS avg_marks,\n       MAX(marks) AS highest,\n       MIN(marks) AS lowest\nFROM students\nGROUP BY class;` },
  { label:'🔤 LIKE pattern', query:`SELECT * FROM students\nWHERE name LIKE 'R%';` },
  { label:'📌 IN + BETWEEN', query:`SELECT * FROM students\nWHERE city IN ('Unchahar','Lucknow')\n  AND marks BETWEEN 70 AND 95;` },
  { label:'✏️ UPDATE record', query:`UPDATE students\nSET marks = 95\nWHERE rollno = 2;\n\nSELECT * FROM students WHERE rollno = 2;` },
  { label:'🗑️ DELETE record', query:`DELETE FROM students WHERE rollno = 5;\nSELECT * FROM students;` },
  { label:'🔗 JOIN two tables', query:`CREATE TABLE IF NOT EXISTS subjects (\n  rollno INTEGER,\n  subject TEXT,\n  score INTEGER\n);\nINSERT INTO subjects VALUES(1,'Python',90);\nINSERT INTO subjects VALUES(2,'Python',95);\nINSERT INTO subjects VALUES(3,'AI',80);\n\nSELECT s.name, sub.subject, sub.score\nFROM students s\nJOIN subjects sub ON s.rollno = sub.rollno;` },
]

export default function SQLPage() {
  const [query, setQuery] = useState('-- Welcome to SQL Practice!\n-- Click a preset above, or write your own SQL.\n\nSELECT "Hello from SQL!" AS greeting;')
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [running, setRunning] = useState(false)
  const [db, setDb] = useState(null)
  const [dbLoaded, setDbLoaded] = useState(false)

  useEffect(() => {
    const s = document.createElement('script')
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.js'
    s.onload = async () => {
      try {
        const SQL = await window.initSqlJs({ locateFile: f => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${f}` })
        setDb(new SQL.Database())
        setDbLoaded(true)
        toast.success('SQL engine ready! ✅')
      } catch { toast.error('Failed to load SQL engine') }
    }
    document.head.appendChild(s)
    return () => { try { document.head.removeChild(s) } catch {} }
  }, [])

  const runQuery = () => {
    if (!db) { toast.error('SQL engine loading...'); return }
    setRunning(true); setError(null); setResults(null)
    try {
      const stmts = query.split(';').map(s => s.trim()).filter(s => s && !s.startsWith('--'))
      let last = null
      for (const stmt of stmts) {
        if (!stmt) continue
        const res = db.exec(stmt)
        if (res.length > 0) last = res[0]
      }
      if (last) {
        setResults(last)
        toast.success(`${last.values.length} row${last.values.length !== 1 ? 's' : ''} returned`)
      } else {
        setResults({ columns:['Status'], values:[['Query executed — no rows returned (INSERT/UPDATE/DELETE)']] })
        toast.success('Query executed!')
      }
      fetch('/api/progress', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ type:'sql_run', details:{ subject:'Database', topic:'SQL Practice', duration:2 } }) })
    } catch (e) {
      setError(e.message)
    } finally { setRunning(false) }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-['Poppins',sans-serif] text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Database className="w-6 h-6 text-purple-600" /> SQL Practice
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Full SQLite engine in browser — no installation needed.
            {!dbLoaded && <span className="ml-2 text-orange-500">⏳ Loading engine...</span>}
            {dbLoaded && <span className="ml-2 text-green-600">✅ Ready</span>}
          </p>
        </div>
      </div>

      {/* Presets */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5"/> Click to load example</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button key={p.label} onClick={()=>{setQuery(p.query);setResults(null);setError(null)}}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-colors">
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="p-3 bg-slate-50 border-b flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">SQL Editor</span>
          <div className="flex gap-2">
            <button onClick={()=>{setQuery('');setResults(null);setError(null)}}
              className="flex items-center gap-1 px-3 py-1.5 text-slate-600 bg-white border border-slate-200 rounded-lg text-xs hover:bg-slate-50 transition-colors">
              <RefreshCw className="w-3 h-3"/>Clear
            </button>
            <button onClick={runQuery} disabled={running||!dbLoaded}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-lg text-xs font-medium transition-colors">
              {running?<><Loader2 className="w-3.5 h-3.5 animate-spin"/>Running...</>:<><Play className="w-3.5 h-3.5"/>Run Query</>}
            </button>
          </div>
        </div>
        <MonacoEditor height="220px" language="sql" value={query} onChange={setQuery} theme="vs-dark"
          options={{ fontSize:14, minimap:{enabled:false}, scrollBeyondLastLine:false, automaticLayout:true, fontFamily:"'Fira Code','Courier New',monospace" }} />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-red-700 text-sm font-medium mb-1">❌ SQL Error:</p>
          <code className="text-red-600 text-sm">{error}</code>
          <p className="text-red-400 text-xs mt-2">💡 Check your SQL syntax and try again</p>
        </div>
      )}

      {/* Results table */}
      {results && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="p-3 bg-slate-50 border-b flex items-center gap-2">
            <Table className="w-4 h-4 text-purple-600"/>
            <span className="text-sm font-medium text-slate-700">Results — {results.values.length} row{results.values.length!==1?'s':''}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-purple-50">
                  {results.columns.map(c => <th key={c} className="px-4 py-2.5 text-left text-xs font-semibold text-purple-700 uppercase border-b border-purple-100">{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {results.values.map((row,i) => (
                  <tr key={i} className={i%2===0?'bg-white':'bg-slate-50/50'}>
                    {row.map((cell,j) => (
                      <td key={j} className="px-4 py-2 text-slate-700 border-b border-slate-50 font-mono text-xs">
                        {cell===null?<span className="text-slate-300 italic">NULL</span>:String(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick reference */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          {cmd:'SELECT * FROM t',desc:'Get all rows'},
          {cmd:'WHERE col = val',desc:'Filter rows'},
          {cmd:'ORDER BY col DESC',desc:'Sort results'},
          {cmd:'GROUP BY col',desc:'Group rows'},
          {cmd:'COUNT(*)',desc:'Count rows'},
          {cmd:'AVG(col)',desc:'Average value'},
          {cmd:'UPDATE t SET...',desc:'Modify row'},
          {cmd:'DELETE FROM t WHERE...',desc:'Remove row'},
        ].map(({cmd,desc})=>(
          <div key={cmd} className="bg-white rounded-xl p-3 border border-slate-100">
            <code className="text-purple-700 text-xs font-mono block mb-1">{cmd}</code>
            <p className="text-slate-500 text-xs">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
