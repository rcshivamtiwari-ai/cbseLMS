import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { Progress } from '@/models/index'

const SYSTEM_PROMPT = `You are a friendly and expert Computer Science teacher for Indian CBSE Class X and XII students. Your name is "Study AI" and you work for Chinmaya Vidyalaya NTPC Unchahar. Your teacher is Shivam Tiwari Sir.

You ONLY answer questions related to the CBSE Class X and XII Computer Science syllabus:

CLASS XII TOPICS:
- Python: functions, parameters, scope, return values, default parameters, recursion
- Exception Handling: try, except, finally, else, ZeroDivisionError, ValueError, FileNotFoundError
- File Handling: text files (r, w, a, r+ modes), binary files (pickle: dump, load), CSV files (csv module: writer, reader, writerow, writerows)
- Data Structures: Stack using list (push=append, pop=pop, peek=items[-1], isEmpty, LIFO, overflow, underflow)
- Computer Networks: ARPANET, NSFNET, Internet, transmission media (twisted pair UTP/STP, coaxial, fiber optic, radio waves, microwave, infrared), network devices (hub, switch, router, modem, repeater, gateway, NIC), topologies (bus, star, tree), network types (PAN, LAN, MAN, WAN), protocols (HTTP, HTTPS, FTP, SMTP, POP3, TCP/IP, VoIP, TELNET), web services (WWW, HTML, XML, URL, domain names, web hosting)
- Database: relational model, keys (candidate, primary, alternate, foreign), SQL (DDL, DML, SELECT, INSERT, UPDATE, DELETE, WHERE, ORDER BY, GROUP BY, HAVING, LIKE, IN, BETWEEN, aggregate functions, joins)
- Python-MySQL: connect(), cursor(), execute(), fetchone(), fetchall(), commit(), rowcount

CLASS X TOPICS:
- AI Project Cycle: Problem Scoping, Data Acquisition, Data Exploration, Modelling, Evaluation
- AI vs ML vs DL: nested relationship, rule-based vs learning-based
- Types of ML: Supervised (Classification, Regression), Unsupervised (Clustering, Association), Reinforcement Learning
- Neural Networks: layers, weights, backpropagation, training
- Model Evaluation: accuracy, precision, recall, F1 score, confusion matrix, bias
- Computer Vision: pixel, grayscale, RGB, convolution, CNN layers
- AI Ethics: bias, transparency, privacy, bioethics (Beneficence, Non-maleficence, Autonomy, Justice)

RULES:
1. Answer ONLY CBSE syllabus questions
2. Use simple clear language for Class X-XII students
3. Include code examples for Python/SQL questions
4. Use bullet points for clarity
5. End with a memory tip when possible
6. Be encouraging and positive
7. Understand Hindi questions but answer in English
8. Keep answers under 350 words unless code is needed`

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { question } = await request.json()

    if (!question?.trim()) {
      return NextResponse.json({ error: 'Please type your question' }, { status: 400 })
    }

    // Get Gemini API key from environment variable
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('GEMINI_API_KEY not set in environment variables!')
      return NextResponse.json({
        answer: '⚠️ AI service not configured. Sir needs to add GEMINI_API_KEY to Vercel environment variables. Meanwhile, please check your Study Notes! 📚'
      })
    }

    // Build the prompt — Gemini uses contents array
    const prompt = `${SYSTEM_PROMPT}\n\nStudent Question: ${question}`

    // Call Google Gemini API (gemini-1.5-flash is FREE with 1500 req/day)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature:     0.7,
          maxOutputTokens: 1024,
          topP:            0.8,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Gemini API error:', response.status, errText)

      if (response.status === 400) {
        return NextResponse.json({
          answer: '⚠️ API key issue. Sir please check GEMINI_API_KEY in Vercel settings and make sure it is a valid Google AI Studio key. 📚'
        })
      }
      if (response.status === 429) {
        return NextResponse.json({
          answer: '⏳ Too many questions right now! Please wait 1 minute and try again. The free plan allows 1500 questions per day.'
        })
      }
      throw new Error(`Gemini API returned ${response.status}`)
    }

    const data = await response.json()

    // Extract text from Gemini response
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!answer) {
      // Check if blocked by safety filters
      const blockReason = data?.candidates?.[0]?.finishReason
      if (blockReason === 'SAFETY') {
        return NextResponse.json({
          answer: 'I cannot answer that question. Please ask something from your CBSE Computer Science syllabus! 📚'
        })
      }
      throw new Error('Empty response from Gemini')
    }

    // Track activity in background
    connectDB().then(() => {
      const today = new Date().toISOString().split('T')[0]
      Progress.findOneAndUpdate(
        { studentId: session.user.id, date: today },
        {
          $push: {
            activities: {
              activityType: 'doubt_asked',
              subject:      'General',
              topic:        'AI Doubt Solver',
              details:      question.substring(0, 100),
              timestamp:    new Date(),
            }
          },
          lastActive: new Date(),
        },
        { upsert: true }
      ).catch(e => console.error('Progress tracking:', e))
    }).catch(e => console.error('DB:', e))

    return NextResponse.json({ answer })

  } catch (error) {
    console.error('AI Doubt Solver error:', error.message)
    return NextResponse.json({
      answer: '😔 Something went wrong. Please try again in a moment, or check your Study Notes for this topic! 📚'
    })
  }
}
