import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import { Progress } from '@/models/index'
import { authOptions } from '@/lib/auth'

// Primary and fallback Piston API endpoints
const PISTON_URLS = [
  'https://emkc.org/api/v2/piston/execute',
  'https://piston.aepl.dev/api/v2/execute', // backup
]

// Normalize output for comparison — removes extra spaces, newlines, case
function normalize(str) {
  if (!str) return ''
  return str
    .toString()
    .trim()
    .replace(/\r\n/g, '\n')   // Windows line endings
    .replace(/\r/g, '\n')     // Mac line endings
    .replace(/[ \t]+\n/g, '\n') // trailing spaces before newline
    .replace(/\n[ \t]+/g, '\n') // leading spaces after newline
    .trim()
}

// Smart comparison — handles minor whitespace differences
function outputMatches(actual, expected) {
  if (!expected) return true // no expected = just run, don't check
  const a = normalize(actual)
  const e = normalize(expected)
  if (a === e) return true

  // Also try case-insensitive comparison
  if (a.toLowerCase() === e.toLowerCase()) return true

  // Try comparing without any whitespace (for simple outputs)
  if (a.replace(/\s/g, '') === e.replace(/\s/g, '')) return true

  return false
}

async function runOnPiston(code, language, stdin = '') {
  const langMap = {
    python: { language: 'python', version: '3.10.0' },
    python3: { language: 'python', version: '3.10.0' },
    sql: { language: 'sqlite', version: '3.36.0' },
  }

  const lang = langMap[language?.toLowerCase()] || langMap.python

  const body = JSON.stringify({
    language: lang.language,
    version: lang.version,
    files: [{ name: 'main.py', content: code }],
    stdin: stdin || '',
    args: [],
    compile_timeout: 10000,
    run_timeout: 5000,
  })

  // Try each Piston URL
  for (const url of PISTON_URLS) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: AbortSignal.timeout(15000), // 15 second timeout
      })

      if (!response.ok) continue

      const data = await response.json()

      // Check for piston error
      if (data.message) {
        return { output: '', error: data.message, success: false }
      }

      const output = data.run?.stdout || ''
      const error = data.run?.stderr || ''
      const exitCode = data.run?.code ?? 0

      return { output, error, exitCode, success: exitCode === 0 || output.length > 0 }
    } catch (err) {
      console.error(`Piston URL ${url} failed:`, err.message)
      continue // try next URL
    }
  }

  return {
    output: '',
    error: 'Code execution service is temporarily unavailable. Please try again in a moment.',
    success: false
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { code, language = 'python', topic, testCases } = body

  if (!code || !code.trim()) {
    return NextResponse.json({ error: 'Please write some code first!' }, { status: 400 })
  }

  try {
    let results = []

    if (testCases && testCases.length > 0) {
      // Run against each test case
      for (const tc of testCases) {
        const { output, error, exitCode } = await runOnPiston(code, language, tc.input || '')

        const actualOutput = normalize(output)
        const expectedOutput = normalize(tc.expectedOutput)
        const passed = outputMatches(output, tc.expectedOutput)

        results.push({
          input: tc.input || '',
          expected: tc.expectedOutput || '',
          actual: actualOutput,
          rawOutput: output,
          error: error || '',
          passed,
          exitCode,
        })
      }
    } else {
      // Just run the code — no test cases
      const { output, error, exitCode, success } = await runOnPiston(code, language, '')
      results = [{
        output: output || '',
        error: error || '',
        exitCode,
        success,
      }]
    }

    // Track activity in progress (non-blocking)
    try {
      await connectDB()
      const today = new Date().toISOString().split('T')[0]
      await Progress.findOneAndUpdate(
        { studentId: session.user.id, date: today },
        {
          $push: {
            activities: {
              activityType: language === 'python' ? 'code_run' : 'sql_run',
              subject: language === 'python' ? 'Python' : 'Database',
              topic: topic || 'Practice',
              timestamp: new Date(),
            }
          },
          lastActive: new Date(),
        },
        { upsert: true }
      )
    } catch (dbErr) {
      // Don't fail the request if DB tracking fails
      console.error('Progress tracking error:', dbErr)
    }

    return NextResponse.json({ results, success: true })
  } catch (error) {
    console.error('Code execution error:', error)
    return NextResponse.json({
      error: 'Code execution failed. Please try again.',
      results: []
    }, { status: 500 })
  }
}
