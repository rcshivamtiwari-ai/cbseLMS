'use client'
import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import {
  Play, RotateCcw, Lightbulb, CheckCircle, XCircle,
  Loader2, Code2, Trophy, BookOpen, Zap
} from 'lucide-react'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center bg-slate-900 text-slate-400 text-sm" style={{ height: '300px' }}>
      <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading editor...
    </div>
  ),
})

const CHALLENGES = [
  {
    id: 1, title: 'Hello, World!', difficulty: 'Easy', topic: 'Basics',
    desc: 'Write a Python program to print "Hello, World!" on screen.',
    code: '# Write your code below\n\n',
    // No test cases — just run and check output contains the text
    testCases: [{ input: '', expectedOutput: 'Hello, World!' }],
    hint: 'Use the print() function. Type: print("Hello, World!")',
    solution: 'print("Hello, World!")',
  },
  {
    id: 2, title: 'Add Two Numbers', difficulty: 'Easy', topic: 'Functions',
    desc: 'Complete the function add(a, b) that returns the sum of two numbers. The program already calls add(3, 5) — it should print 8.',
    code: 'def add(a, b):\n    # Write your code here\n    pass\n\nprint(add(3, 5))',
    testCases: [{ input: '', expectedOutput: '8' }],
    hint: 'Inside the function, use: return a + b',
    solution: 'def add(a, b):\n    return a + b\n\nprint(add(3, 5))',
  },
  {
    id: 3, title: 'Count Vowels', difficulty: 'Easy', topic: 'Strings',
    desc: 'Count how many vowels (a, e, i, o, u) are in the word "programming" and print the count.',
    code: 'word = "programming"\ncount = 0\nvowels = "aeiou"\n\n# Loop through each letter and count vowels\n# Your code here\n\nprint(count)',
    testCases: [{ input: '', expectedOutput: '3' }],
    hint: 'Use a for loop: for letter in word: and check if letter in vowels',
    solution: 'word = "programming"\ncount = 0\nvowels = "aeiou"\n\nfor letter in word:\n    if letter in vowels:\n        count += 1\n\nprint(count)',
  },
  {
    id: 4, title: 'Even or Odd', difficulty: 'Easy', topic: 'Conditionals',
    desc: 'Check if the number 42 is even or odd. Print "Even" if even, "Odd" if odd.',
    code: 'number = 42\n\n# Use % operator to check even/odd\n# Your code here\n',
    testCases: [{ input: '', expectedOutput: 'Even' }],
    hint: 'If number % 2 == 0, it is even. Use if/else to print the result.',
    solution: 'number = 42\n\nif number % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")',
  },
  {
    id: 5, title: 'Sum of List', difficulty: 'Easy', topic: 'Lists',
    desc: 'Find the sum of all numbers in the list [10, 20, 30, 40, 50] and print it.',
    code: 'numbers = [10, 20, 30, 40, 50]\ntotal = 0\n\n# Add all numbers to total\n# Your code here\n\nprint(total)',
    testCases: [{ input: '', expectedOutput: '150' }],
    hint: 'Use a for loop to add each number: total = total + num',
    solution: 'numbers = [10, 20, 30, 40, 50]\ntotal = 0\n\nfor num in numbers:\n    total += num\n\nprint(total)',
  },
  {
    id: 6, title: 'Exception Handling', difficulty: 'Medium', topic: 'Exceptions',
    desc: 'Handle the ZeroDivisionError. Try to divide 100 by 0, catch the error, and print "Error: Cannot divide by zero".',
    code: '# Use try-except to handle the error\ntry:\n    result = 100 / 0\n    print(result)\nexcept ZeroDivisionError:\n    # Print the error message here\n    pass',
    testCases: [{ input: '', expectedOutput: 'Error: Cannot divide by zero' }],
    hint: 'Replace pass with: print("Error: Cannot divide by zero")',
    solution: 'try:\n    result = 100 / 0\n    print(result)\nexcept ZeroDivisionError:\n    print("Error: Cannot divide by zero")',
  },
  {
    id: 7, title: 'Reverse a String', difficulty: 'Medium', topic: 'Strings',
    desc: 'Reverse the string "Python" and print it. Output should be: nohtyP',
    code: 'text = "Python"\n\n# Reverse the string and print it\n# Your code here\n',
    testCases: [{ input: '', expectedOutput: 'nohtyP' }],
    hint: 'In Python you can reverse a string using: text[::-1]',
    solution: 'text = "Python"\nprint(text[::-1])',
  },
  {
    id: 8, title: 'Stack - Push and Pop', difficulty: 'Medium', topic: 'Data Structures',
    desc: 'Complete the Stack class. Push 10, 20, 30 into the stack. Then pop once and print what was popped.',
    code: 'class Stack:\n    def __init__(self):\n        self.items = []\n\n    def push(self, item):\n        # Add item to top of stack\n        pass\n\n    def pop(self):\n        # Remove and return top item\n        # Check if empty first!\n        pass\n\n    def is_empty(self):\n        return len(self.items) == 0\n\n\ns = Stack()\ns.push(10)\ns.push(20)\ns.push(30)\nprint(s.pop())',
    testCases: [{ input: '', expectedOutput: '30' }],
    hint: 'push uses self.items.append(item). pop uses self.items.pop(). Stack is LIFO!',
    solution: 'class Stack:\n    def __init__(self):\n        self.items = []\n\n    def push(self, item):\n        self.items.append(item)\n\n    def pop(self):\n        if not self.is_empty():\n            return self.items.pop()\n        return None\n\n    def is_empty(self):\n        return len(self.items) == 0\n\n\ns = Stack()\ns.push(10)\ns.push(20)\ns.push(30)\nprint(s.pop())',
  },
  {
    id: 9, title: 'Fibonacci Series', difficulty: 'Medium', topic: 'Loops',
    desc: 'Print the first 8 Fibonacci numbers separated by spaces.\nHint: 0 1 1 2 3 5 8 13',
    code: 'a, b = 0, 1\nresult = []\n\n# Generate 8 Fibonacci numbers\nfor i in range(8):\n    # Add a to result, then update a and b\n    pass\n\nprint(" ".join(map(str, result)))',
    testCases: [{ input: '', expectedOutput: '0 1 1 2 3 5 8 13' }],
    hint: 'result.append(a) then a, b = b, a + b',
    solution: 'a, b = 0, 1\nresult = []\n\nfor i in range(8):\n    result.append(a)\n    a, b = b, a + b\n\nprint(" ".join(map(str, result)))',
  },
  {
    id: 10, title: 'File Simulation - Word Count', difficulty: 'Hard', topic: 'File Handling',
    desc: 'Count words in each line of text and print each line\'s words separated by #.\n\nText:\nHello World\nPython is fun',
    code: 'content = "Hello World\\nPython is fun"\n\n# Process each line\n# Split into words\n# Join with #\nfor line in content.split("\\n"):\n    words = line.split()\n    # print words joined by #\n    pass',
    testCases: [{ input: '', expectedOutput: 'Hello#World\nPython#is#fun' }],
    hint: 'Use print("#".join(words)) inside the loop',
    solution: 'content = "Hello World\\nPython is fun"\n\nfor line in content.split("\\n"):\n    words = line.split()\n    print("#".join(words))',
  },
]

const diffColor = {
  Easy: 'bg-green-100 text-green-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Hard: 'bg-red-100 text-red-700'
}

export default function PracticePage() {
  const [challenge, setChallenge] = useState(CHALLENGES[0])
  const [code, setCode] = useState(CHALLENGES[0].code)
  const [results, setResults] = useState(null)
  const [running, setRunning] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [freeCode, setFreeCode] = useState('# Free Python Practice Area\n# Write any Python code here and run it!\n\nname = "Chinmaya Vidyalaya"\nprint(f"Welcome to {name}!")\nprint("Python is awesome!")\n\n# Try changing the name above and run again\n')
  const [freeOutput, setFreeOutput] = useState('')
  const [freeError, setFreeError] = useState('')
  const [freeRunning, setFreeRunning] = useState(false)
  const [tab, setTab] = useState('challenges')
  const [solvedCount, setSolvedCount] = useState(0)
  const [solved, setSolved] = useState(new Set())

  const selectChallenge = (c) => {
    setChallenge(c)
    setCode(c.code)
    setResults(null)
    setShowHint(false)
    setShowSolution(false)
  }

  const runCode = async () => {
    if (!code.trim()) { toast.error('Write some code first!'); return }
    setRunning(true)
    setResults(null)
    try {
      const res = await fetch('/api/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language: 'python',
          topic: challenge.topic,
          testCases: challenge.testCases,
        }),
      })
      const data = await res.json()

      if (data.error && !data.results?.length) {
        toast.error(data.error)
        setResults([{ error: data.error, passed: false, actual: '', expected: challenge.testCases[0]?.expectedOutput || '' }])
        return
      }

      setResults(data.results || [])
      const allPassed = data.results?.every(r => r.passed)

      if (allPassed) {
        toast.success('All tests passed! 🎉 Great job!')
        if (!solved.has(challenge.id)) {
          setSolved(prev => new Set([...prev, challenge.id]))
          setSolvedCount(c => c + 1)
        }
      } else {
        const hasError = data.results?.some(r => r.error)
        if (hasError) {
          toast.error('Your code has an error. Check the output below.')
        } else {
          toast.error('Output does not match expected. Check carefully!')
        }
      }
    } catch (e) {
      toast.error('Connection error. Please check internet and try again.')
    } finally {
      setRunning(false)
    }
  }

  const runFreeCode = async () => {
    if (!freeCode.trim()) { toast.error('Write some code first!'); return }
    setFreeRunning(true)
    setFreeOutput('')
    setFreeError('')
    try {
      const res = await fetch('/api/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: freeCode, language: 'python', topic: 'Free Practice' }),
      })
      const data = await res.json()
      if (data.results?.[0]) {
        setFreeOutput(data.results[0].output || '')
        setFreeError(data.results[0].error || '')
      } else if (data.error) {
        setFreeError(data.error)
      }
    } catch {
      setFreeError('Connection error. Please try again.')
    } finally {
      setFreeRunning(false)
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-['Poppins',sans-serif] text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Code2 className="w-6 h-6 text-green-600" /> Python Practice
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {solvedCount > 0
              ? `🎉 ${solvedCount}/${CHALLENGES.length} challenges solved! Keep going!`
              : 'Solve challenges to practice your Python skills'
            }
          </p>
        </div>
        <div className="flex gap-2">
          {['challenges', 'free'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                tab === t ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}>
              {t === 'free' ? '🆓 Free Code' : '🏆 Challenges'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'challenges' ? (
        <div className="grid grid-cols-12 gap-4">
          {/* Challenge list */}
          <div className="col-span-3 space-y-1.5">
            <div className="flex items-center justify-between px-1 mb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {CHALLENGES.length} Challenges
              </p>
              <div className="flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                <span className="text-xs font-bold text-yellow-600">{solvedCount}</span>
              </div>
            </div>
            {CHALLENGES.map(c => (
              <button key={c.id} onClick={() => selectChallenge(c)}
                className={`w-full text-left p-3 rounded-xl border transition-all text-sm ${
                  challenge.id === c.id
                    ? 'border-brand-400 bg-brand-50'
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-slate-800 text-xs pr-2 leading-snug">{c.title}</p>
                  {solved.has(c.id) && <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />}
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${diffColor[c.difficulty]}`}>
                    {c.difficulty}
                  </span>
                  <span className="text-slate-400 text-xs truncate">• {c.topic}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Editor area */}
          <div className="col-span-9 space-y-3">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              {/* Problem statement */}
              <div className="p-4 bg-slate-50 border-b">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h2 className="font-['Poppins',sans-serif] font-semibold text-slate-800">
                    {challenge.id}. {challenge.title}
                  </h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${diffColor[challenge.difficulty]}`}>
                    {challenge.difficulty}
                  </span>
                  <span className="text-xs text-slate-400">Topic: {challenge.topic}</span>
                  {solved.has(challenge.id) && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium ml-auto">
                      ✓ Solved
                    </span>
                  )}
                </div>
                <p className="text-slate-600 text-sm whitespace-pre-line">{challenge.desc}</p>

                {/* Hint */}
                {showHint && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                    <p className="text-yellow-800 text-sm">
                      💡 <strong>Hint:</strong> {challenge.hint}
                    </p>
                  </div>
                )}

                {/* Solution */}
                {showSolution && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-blue-800 text-xs font-semibold mb-2">📖 Solution (try yourself first!):</p>
                    <pre className="text-blue-700 text-xs font-mono whitespace-pre-wrap">{challenge.solution}</pre>
                  </div>
                )}
              </div>

              {/* Monaco Editor */}
              <MonacoEditor
                height="280px"
                language="python"
                value={code}
                onChange={v => setCode(v || '')}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 4,
                  fontFamily: "'Fira Code', 'Courier New', monospace",
                  wordWrap: 'on',
                  renderWhitespace: 'boundary',
                }}
              />

              {/* Action bar */}
              <div className="p-3 bg-slate-50 border-t flex items-center justify-between gap-2 flex-wrap">
                <div className="flex gap-2">
                  <button onClick={() => setShowHint(!showHint)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg text-xs hover:bg-yellow-100 transition-colors">
                    <Lightbulb className="w-3.5 h-3.5" />
                    {showHint ? 'Hide Hint' : 'Hint'}
                  </button>
                  <button onClick={() => setShowSolution(!showSolution)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-blue-700 bg-blue-50 border border-blue-200 rounded-lg text-xs hover:bg-blue-100 transition-colors">
                    <BookOpen className="w-3.5 h-3.5" />
                    {showSolution ? 'Hide Solution' : 'Show Solution'}
                  </button>
                  <button onClick={() => { setCode(challenge.code); setResults(null); setShowHint(false); setShowSolution(false) }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 bg-white border border-slate-200 rounded-lg text-xs hover:bg-slate-50 transition-colors">
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
                </div>
                <button onClick={runCode} disabled={running}
                  className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-xl text-sm font-medium transition-colors">
                  {running
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Running...</>
                    : <><Play className="w-4 h-4" />Run Code</>
                  }
                </button>
              </div>
            </div>

            {/* Test Results */}
            {results && (
              <div className="bg-white rounded-2xl border border-slate-100 p-4">
                <h3 className="font-medium text-slate-800 text-sm mb-3">Test Results</h3>
                <div className="space-y-2">
                  {results.map((r, i) => (
                    <div key={i} className={`p-3 rounded-xl border text-sm ${
                      r.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        {r.passed
                          ? <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          : <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        }
                        <span className={`font-medium text-sm ${r.passed ? 'text-green-700' : 'text-red-700'}`}>
                          {r.passed ? '✅ Test Passed!' : '❌ Test Failed'}
                        </span>
                      </div>

                      {/* Show error if any */}
                      {r.error && (
                        <div className="mt-2 ml-6">
                          <p className="text-xs font-medium text-red-700 mb-1">Error in your code:</p>
                          <pre className="text-xs bg-red-100 text-red-800 p-2 rounded-lg overflow-x-auto whitespace-pre-wrap">
                            {r.error}
                          </pre>
                        </div>
                      )}

                      {/* Show expected vs actual only on failure */}
                      {!r.passed && !r.error && (
                        <div className="mt-2 ml-6 space-y-1">
                          <div className="flex items-start gap-2">
                            <span className="text-xs text-slate-500 w-20 flex-shrink-0">Expected:</span>
                            <code className="text-xs bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                              {r.expected}
                            </code>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-xs text-slate-500 w-20 flex-shrink-0">Your output:</span>
                            <code className="text-xs bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                              {r.actual || '(nothing printed)'}
                            </code>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            💡 Check for extra spaces, spelling, or missing print() statement
                          </p>
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
        /* Free Code Area */
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b flex items-center justify-between">
            <div>
              <h2 className="font-['Poppins',sans-serif] font-semibold text-slate-800 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" /> Free Python Playground
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Write any Python code and run it! Great for experimenting.
              </p>
            </div>
            <button onClick={runFreeCode} disabled={freeRunning}
              className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-xl text-sm font-medium transition-colors">
              {freeRunning
                ? <><Loader2 className="w-4 h-4 animate-spin" />Running...</>
                : <><Play className="w-4 h-4" />Run</>
              }
            </button>
          </div>

          <MonacoEditor
            height="380px"
            language="python"
            value={freeCode}
            onChange={v => setFreeCode(v || '')}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              fontFamily: "'Fira Code', 'Courier New', monospace",
              wordWrap: 'on',
            }}
          />

          {/* Output */}
          {(freeOutput || freeError) && (
            <div className="bg-slate-900 border-t border-slate-800">
              <div className="px-4 py-2 border-b border-slate-800 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${freeError ? 'bg-red-400' : 'bg-green-400'}`} />
                <span className="text-xs text-slate-400 font-mono">
                  {freeError ? 'ERROR' : 'OUTPUT'}
                </span>
              </div>
              {freeOutput && (
                <pre className="text-green-300 text-sm font-mono p-4 whitespace-pre-wrap overflow-x-auto">
                  {freeOutput}
                </pre>
              )}
              {freeError && (
                <pre className="text-red-400 text-sm font-mono p-4 whitespace-pre-wrap overflow-x-auto">
                  {freeError}
                </pre>
              )}
            </div>
          )}

          {/* Quick reference */}
          <div className="p-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-2">Quick Reference — Common Python:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { code: 'print("Hello")', desc: 'Print output' },
                { code: 'x = int(input())', desc: 'Take input' },
                { code: 'for i in range(5):', desc: 'Loop 5 times' },
                { code: 'if x > 0:', desc: 'Condition' },
                { code: 'def greet(name):', desc: 'Function' },
                { code: '[1, 2, 3]', desc: 'List' },
                { code: 'len(my_list)', desc: 'Length' },
                { code: 'import math', desc: 'Import module' },
              ].map(({ code: c, desc }) => (
                <div key={c} className="bg-slate-50 rounded-lg p-2 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => setFreeCode(prev => prev + '\n' + c)}>
                  <code className="text-brand-700 text-xs font-mono block mb-0.5">{c}</code>
                  <p className="text-slate-400 text-xs">{desc}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">💡 Click any snippet above to add it to your code!</p>
          </div>
        </div>
      )}
    </div>
  )
}
