'use client'
import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { Database, Play, Loader2, Table, RefreshCw, BookOpen, CheckCircle, AlertCircle } from 'lucide-react'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center bg-slate-900 text-slate-400 text-sm" style={{ height: '220px' }}>
      <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading editor...
    </div>
  ),
})

const PRESETS = [
  {
    label: '📋 Step 1: Create students table',
    query: `-- First run this to create and fill the table
CREATE TABLE IF NOT EXISTS students (
  rollno INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  class TEXT,
  marks INTEGER,
  city TEXT
);

INSERT OR IGNORE INTO students VALUES(1,'Rahul Sharma','XII',85,'Unchahar');
INSERT OR IGNORE INTO students VALUES(2,'Priya Singh','XII',92,'Raebareli');
INSERT OR IGNORE INTO students VALUES(3,'Amit Kumar','X',78,'Unchahar');
INSERT OR IGNORE INTO students VALUES(4,'Sneha Gupta','X',88,'Lucknow');
INSERT OR IGNORE INTO students VALUES(5,'Rohit Verma','XII',65,'Allahabad');
INSERT OR IGNORE INTO students VALUES(6,'Kavya Rao','X',95,'Varanasi');

SELECT * FROM students;`
  },
  {
    label: '🔍 SELECT with WHERE',
    query: `SELECT name, marks, city
FROM students
WHERE marks > 80
ORDER BY marks DESC;`
  },
  {
    label: '📊 GROUP BY + Aggregate',
    query: `SELECT class,
       COUNT(*) AS total_students,
       AVG(marks) AS avg_marks,
       MAX(marks) AS highest,
       MIN(marks) AS lowest
FROM students
GROUP BY class;`
  },
  {
    label: '🔤 LIKE pattern search',
    query: `-- Find names starting with R
SELECT * FROM students WHERE name LIKE 'R%';`
  },
  {
    label: '📌 IN and BETWEEN',
    query: `SELECT name, marks, city FROM students
WHERE city IN ('Unchahar', 'Lucknow')
  AND marks BETWEEN 70 AND 100;`
  },
  {
    label: '✏️ UPDATE a record',
    query: `-- Update Priya's marks to 95
UPDATE students SET marks = 95 WHERE rollno = 2;

-- Check the update worked
SELECT * FROM students WHERE rollno = 2;`
  },
  {
    label: '🗑️ DELETE a record',
    query: `-- Delete roll number 5
DELETE FROM students WHERE rollno = 5;

-- Check remaining records
SELECT * FROM students;`
  },
  {
    label: '🔗 JOIN two tables',
    query: `-- Create a second table
CREATE TABLE IF NOT EXISTS subjects (
  rollno INTEGER,
  subject TEXT,
  score INTEGER
);
INSERT OR IGNORE INTO subjects VALUES(1,'Python',90);
INSERT OR IGNORE INTO subjects VALUES(2,'Python',95);
INSERT OR IGNORE INTO subjects VALUES(3,'AI',80);
INSERT OR IGNORE INTO subjects VALUES(4,'Database',88);

-- Join both tables
SELECT s.name, sub.subject, sub.score
FROM students s
JOIN subjects sub ON s.rollno = sub.rollno
ORDER BY sub.score DESC;`
  },
  {
    label: '➕ ALTER TABLE',
    query: `-- Add a new column
ALTER TABLE students ADD COLUMN phone TEXT;

-- Update some phone numbers
UPDATE students SET phone = '9876543210' WHERE rollno = 1;
UPDATE students SET phone = '9876543211' WHERE rollno = 2;

-- View the updated table
SELECT rollno, name, marks, phone FROM students;`
  },
]

export default function SQLPage() {
  const [query, setQuery] = useState(`-- Welcome to SQL Practice! 🗄️
-- Click any preset above to load an example
-- Or write your own SQL below

SELECT 'Hello from SQL!' AS greeting, 'Ready to learn!' AS message;`)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [running, setRunning] = useState(false)
  const [dbReady, setDbReady] = useState(false)
  const [dbLoading, setDbLoading] = useState(true)
  const [selectedPreset, setSelectedPreset] = useState(null)
  const [queryHistory, setQueryHistory] = useState([])
  const dbRef = useRef(null)

  useEffect(() => {
    loadSQLJS()
  }, [])

  const loadSQLJS = async () => {
    setDbLoading(true)
    try {
      // Load sql.js script
      await new Promise((resolve, reject) => {
        if (window.initSqlJs) { resolve(); return }
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.js'
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })

      // Initialize SQL.js with WASM
      const SQL = await window.initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}`
      })

      dbRef.current = new SQL.Database()
      setDbReady(true)
      toast.success('SQL engine loaded! ✅ Ready to run queries.')
    } catch (err) {
      console.error('SQL.js load error:', err)
      toast.error('SQL engine failed to load. Check internet connection.')
    } finally {
      setDbLoading(false)
    }
  }

  const loadPreset = (preset) => {
    setQuery(preset.query)
    setSelectedPreset(preset.label)
    setResults(null)
    setError(null)
  }

  const runQuery = () => {
    if (!dbRef.current) {
      toast.error('SQL engine not ready yet. Please wait...')
      return
    }
    if (!query.trim()) {
      toast.error('Please write a SQL query first')
      return
    }

    setRunning(true)
    setError(null)
    setResults(null)

    try {
      // Split by semicolon to handle multiple statements
      // Filter out empty and comment-only lines
      const statements = query
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.replace(/--.*$/gm, '').trim().match(/^$/))

      if (statements.length === 0) {
        toast.error('No valid SQL statements found')
        setRunning(false)
        return
      }

      let lastResult = null
      let executedCount = 0

      for (const stmt of statements) {
        const cleanStmt = stmt.replace(/--.*$/gm, '').trim()
        if (!cleanStmt) continue

        try {
          const res = dbRef.current.exec(stmt)
          executedCount++
          if (res && res.length > 0) {
            lastResult = res[res.length - 1] // take last SELECT result
          }
        } catch (stmtErr) {
          setError(`SQL Error: ${stmtErr.message}\n\nIn statement: ${stmt.substring(0, 100)}...`)
          setRunning(false)
          return
        }
      }

      // Add to history
      const historyEntry = {
        query: query.substring(0, 60) + (query.length > 60 ? '...' : ''),
        timestamp: new Date().toLocaleTimeString('en-IN'),
        success: true,
        rows: lastResult?.values?.length || 0,
      }
      setQueryHistory(h => [historyEntry, ...h.slice(0, 4)])

      if (lastResult) {
        setResults(lastResult)
        toast.success(`Query ran successfully! ${lastResult.values.length} row${lastResult.values.length !== 1 ? 's' : ''} returned.`)
      } else {
        // Non-SELECT query success
        setResults({
          columns: ['Result'],
          values: [['✅ Query executed successfully. No rows to display (INSERT/UPDATE/DELETE/CREATE/ALTER).']],
          isMessage: true,
        })
        toast.success(`${executedCount} statement${executedCount > 1 ? 's' : ''} executed successfully!`)
      }

      // Track progress (non-blocking)
      fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'sql_run',
          details: { subject: 'Database', topic: 'SQL Practice', duration: 2 }
        })
      }).catch(() => {})

    } catch (err) {
      setError(`Unexpected error: ${err.message}`)
    } finally {
      setRunning(false)
    }
  }

  const handleKeyDown = (e) => {
    // Ctrl+Enter to run
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault()
      runQuery()
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-['Poppins',sans-serif] text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Database className="w-6 h-6 text-purple-600" /> SQL Practice
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Full SQLite database runs in your browser — no server needed!
            {dbLoading && <span className="ml-2 text-orange-500 animate-pulse">⏳ Loading SQL engine...</span>}
            {dbReady && <span className="ml-2 text-green-600">✅ Ready</span>}
          </p>
        </div>
        {!dbReady && !dbLoading && (
          <button onClick={loadSQLJS}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium">
            <RefreshCw className="w-4 h-4" /> Reload SQL Engine
          </button>
        )}
      </div>

      {/* Preset examples */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" /> Click any example to load it:
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button key={p.label} onClick={() => loadPreset(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                selectedPreset === p.label
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700'
              }`}>
              {p.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-2">
          💡 <strong>Start with "Step 1: Create students table"</strong> — run it first, then try other examples!
        </p>
      </div>

      {/* Editor */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="p-3 bg-slate-50 border-b flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">SQL Editor</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Ctrl+Enter to run</span>
            <button onClick={() => { setQuery(''); setResults(null); setError(null); setSelectedPreset(null) }}
              className="flex items-center gap-1 px-3 py-1.5 text-slate-600 bg-white border border-slate-200 rounded-lg text-xs hover:bg-slate-50 transition-colors">
              <RefreshCw className="w-3 h-3" /> Clear
            </button>
            <button onClick={runQuery} disabled={running || !dbReady}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-lg text-xs font-medium transition-colors">
              {running
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Running...</>
                : <><Play className="w-3.5 h-3.5" />Run Query</>
              }
            </button>
          </div>
        </div>
        <div onKeyDown={handleKeyDown}>
          <MonacoEditor
            height="220px"
            language="sql"
            value={query}
            onChange={v => setQuery(v || '')}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              fontFamily: "'Fira Code', 'Courier New', monospace",
              wordWrap: 'on',
              suggest: { showKeywords: true },
            }}
          />
        </div>
      </div>

      {/* Error message — friendly and helpful */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-start gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm font-medium">SQL Error</p>
          </div>
          <pre className="text-red-600 text-sm font-mono whitespace-pre-wrap bg-red-100 p-3 rounded-xl">
            {error}
          </pre>
          <div className="mt-3 text-xs text-red-500 space-y-1">
            <p>Common fixes:</p>
            <p>• Did you run "Create students table" first? (required before SELECT/UPDATE)</p>
            <p>• Check spelling of table name (students) and column names</p>
            <p>• Make sure each statement ends with a semicolon ;</p>
            <p>• Use single quotes for text values: 'Rahul' not "Rahul"</p>
          </div>
        </div>
      )}

      {/* Results table */}
      {results && !error && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="p-3 bg-slate-50 border-b flex items-center gap-2">
            {results.isMessage
              ? <CheckCircle className="w-4 h-4 text-green-600" />
              : <Table className="w-4 h-4 text-purple-600" />
            }
            <span className="text-sm font-medium text-slate-700">
              {results.isMessage
                ? 'Query Executed'
                : `Results — ${results.values.length} row${results.values.length !== 1 ? 's' : ''}`
              }
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-purple-50">
                  {results.columns.map(col => (
                    <th key={col} className="px-4 py-2.5 text-left text-xs font-semibold text-purple-700 uppercase tracking-wide border-b border-purple-100">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.values.map((row, i) => (
                  <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-purple-50/30 transition-colors`}>
                    {row.map((cell, j) => (
                      <td key={j} className="px-4 py-2.5 text-slate-700 border-b border-slate-50 font-mono text-xs">
                        {cell === null
                          ? <span className="text-slate-300 italic">NULL</span>
                          : String(cell)
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Query history */}
      {queryHistory.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Recent Queries</p>
          <div className="space-y-1">
            {queryHistory.map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-500 py-1 border-b border-slate-50">
                <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                <span className="font-mono truncate flex-1">{h.query}</span>
                <span className="text-slate-300 flex-shrink-0">{h.timestamp}</span>
                {h.rows > 0 && <span className="text-purple-500 flex-shrink-0">{h.rows} rows</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SQL Quick Reference */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">SQL Quick Reference</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { cmd: 'SELECT * FROM t', desc: 'Get all rows' },
            { cmd: 'WHERE col = val', desc: 'Filter rows' },
            { cmd: 'ORDER BY col DESC', desc: 'Sort results' },
            { cmd: 'GROUP BY col', desc: 'Group rows' },
            { cmd: 'COUNT(*)', desc: 'Count rows' },
            { cmd: 'AVG(col)', desc: 'Average value' },
            { cmd: 'UPDATE t SET col=val', desc: 'Modify data' },
            { cmd: 'DELETE FROM t WHERE', desc: 'Remove rows' },
            { cmd: 'LIKE \'R%\'', desc: 'Pattern match' },
            { cmd: 'BETWEEN a AND b', desc: 'Range filter' },
            { cmd: 'IN (v1, v2)', desc: 'Match list' },
            { cmd: 'JOIN ON col=col', desc: 'Join tables' },
          ].map(({ cmd, desc }) => (
            <div key={cmd}
              className="bg-slate-50 rounded-xl p-2.5 cursor-pointer hover:bg-purple-50 transition-colors"
              onClick={() => setQuery(prev => prev + '\n' + cmd)}>
              <code className="text-purple-700 text-xs font-mono block mb-0.5">{cmd}</code>
              <p className="text-slate-400 text-xs">{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-2">💡 Click any command to add it to your query editor!</p>
      </div>
    </div>
  )
}
