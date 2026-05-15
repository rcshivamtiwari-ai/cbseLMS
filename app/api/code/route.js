import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import { Progress } from '@/models/index'
import { authOptions } from '@/lib/auth'

// Normalize output for comparison
function normalize(str) {
  if (!str && str !== 0) return ''
  return String(str)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+$/gm, '')   // trailing spaces per line
    .replace(/^\n+|\n+$/g, '')  // leading/trailing blank lines
    .trim()
}

function outputMatches(actual, expected) {
  if (!expected) return true
  const a = normalize(actual)
  const e = normalize(expected)
  if (a === e) return true
  if (a.toLowerCase() === e.toLowerCase()) return true
  // Allow if actual CONTAINS expected (handles extra newlines)
  if (a.includes(e)) return true
  if (e.includes(a)) return true
  return false
}

// Run via Piston API
async function runViaPiston(code, stdin = '') {
  const PISTON_ENDPOINTS = [
    'https://emkc.org/api/v2/piston/execute',
    'https://piston.aepl.dev/api/v2/execute',
  ]

  const body = {
    language: 'python',
    version: '3.10.0',
    files: [{ name: 'solution.py', content: code }],
    stdin: stdin || '',
    args: [],
    compile_timeout: 10000,
    run_timeout: 8000,
  }

  for (const url of PISTON_ENDPOINTS) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 12000)

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (!res.ok) continue

      const data = await res.json()
      if (data.message) continue // piston error

      return {
        output: data.run?.stdout || '',
        error: data.run?.stderr || '',
        exitCode: data.run?.code ?? 0,
        ok: true,
      }
    } catch (e) {
      console.error(`Piston ${url} failed:`, e.message)
      continue
    }
  }
  return null
}

// Run via Glot.io (another free service)
async function runViaGlot(code) {
  try {
    const res = await fetch('https://glot.io/api/run/python/latest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: [{ name: 'main.py', content: code }] }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return {
      output: data.stdout || '',
      error: data.stderr || data.error || '',
      exitCode: data.error ? 1 : 0,
      ok: !data.error,
    }
  } catch {
    return null
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { code, language = 'python', topic, testCases } = body

  if (!code?.trim()) {
    return NextResponse.json({ error: 'Please write some code first!' }, { status: 400 })
  }

  // For SQL — use browser-side sql.js, not server
  if (language === 'sql') {
    return NextResponse.json({
      error: 'SQL runs in browser directly — no server needed. Please use the SQL Practice page.',
    }, { status: 400 })
  }

  try {
    let results = []

    if (testCases && testCases.length > 0) {
      for (const tc of testCases) {
        // Try Piston first
        let run = await runViaPiston(code, tc.input || '')

        // Fallback to Glot if Piston fails
        if (!run) {
          run = await runViaGlot(code)
        }

        if (!run) {
          results.push({
            input: tc.input || '',
            expected: tc.expectedOutput || '',
            actual: '',
            passed: false,
            error: 'Code execution service is temporarily down. Please try again in 1 minute.',
          })
          continue
        }

        const passed = outputMatches(run.output, tc.expectedOutput)
        results.push({
          input: tc.input || '',
          expected: tc.expectedOutput || '',
          actual: normalize(run.output),
          rawOutput: run.output,
          error: run.error || '',
          passed,
          exitCode: run.exitCode,
        })
      }
    } else {
      let run = await runViaPiston(code, '')
      if (!run) run = await runViaGlot(code)

      if (!run) {
        results = [{
          output: '',
          error: 'Code execution service is temporarily unavailable. Please try again in a moment.',
          passed: false,
        }]
      } else {
        results = [{
          output: run.output || '',
          error: run.error || '',
          exitCode: run.exitCode,
          passed: run.exitCode === 0,
        }]
      }
    }

    // Track progress in background
    connectDB().then(() => {
      const today = new Date().toISOString().split('T')[0]
      Progress.findOneAndUpdate(
        { studentId: session.user.id, date: today },
        {
          $push: {
            activities: {
              activityType: 'code_run',
              subject: 'Python',
              topic: topic || 'Practice',
              timestamp: new Date(),
            }
          },
          lastActive: new Date(),
        },
        { upsert: true }
      ).catch(console.error)
    }).catch(console.error)

    return NextResponse.json({ results, success: true })
  } catch (error) {
    console.error('Code execution error:', error)
    return NextResponse.json({
      error: 'Unexpected error. Please try again.',
      results: [],
    }, { status: 500 })
  }
}
