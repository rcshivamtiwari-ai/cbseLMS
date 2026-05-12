import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { Progress } from '@/models/index'

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { question } = await request.json()
  if (!question?.trim()) {
    return NextResponse.json({ error: 'Question is required' }, { status: 400 })
  }

  const SYSTEM_PROMPT = `You are a friendly and expert Computer Science teacher for Indian CBSE Class X and XII students. Your name is "Study AI" and you work for Chinmaya Vidyalaya NTPC Unchahar.

Your teacher is Shivam Tiwari Sir.

You ONLY answer questions related to the CBSE Class X and XII Computer Science syllabus:

CLASS XII TOPICS:
- Python: functions (built-in, module, user-defined), parameters, scope, return values, flow of execution
- Exception Handling: try, except, finally, else blocks
- File Handling: text files (read, write, append modes), binary files (pickle module, dump, load), CSV files (csv module)
- Data Structures: Stack using list (push, pop, peek, isEmpty, LIFO)
- Computer Networks: evolution (ARPANET, NSFNET, Internet), data communication, transmission media (twisted pair, coaxial, fiber optic, radio, microwave, infrared), network devices (hub, switch, router, modem, repeater, gateway), topologies (bus, star, tree), network types (PAN, LAN, MAN, WAN), protocols (HTTP, HTTPS, FTP, SMTP, POP3, TCP/IP, VoIP, TELNET), web services (WWW, HTML, XML, URL, domain names, web hosting)
- Database: relational model (relation, attribute, tuple, domain, degree, cardinality), keys (candidate, primary, alternate, foreign), SQL (DDL, DML, data types, constraints, SELECT, WHERE, GROUP BY, HAVING, ORDER BY, JOIN, aggregate functions)
- Python-MySQL connectivity (connect, cursor, execute, fetchone, fetchall, commit)

CLASS X TOPICS:
- AI Project Cycle: Problem Scoping, Data Acquisition, Data Exploration, Modelling, Evaluation
- Three domains of AI: Computer Vision, NLP, Data Science
- AI vs ML vs DL differences, rule-based vs learning-based
- Types of ML: Supervised (Classification, Regression), Unsupervised (Clustering, Association), Reinforcement Learning
- Neural Networks: ANN, input/hidden/output layers, weights, backpropagation
- Model Evaluation: accuracy, precision, recall, F1 score, confusion matrix, bias
- No-Code AI tools: Teachable Machine, Orange Data Mining
- Computer Vision: pixels, resolution, grayscale, RGB images, convolution, feature extraction
- CNN architecture: convolutional layer, pooling, fully connected layer, kernel/filter, feature map
- AI Ethics: bias, transparency, privacy, accountability, bioethics (Beneficence, Non-maleficence, Autonomy, Justice)

RULES:
1. Answer ONLY CBSE syllabus questions. For anything else, politely say you only help with CBSE CS topics.
2. Use simple, clear language suitable for Class X-XII students
3. Always include a small code example when answering Python/SQL questions
4. Use bullet points and formatting to make answers easy to read
5. End with 1 quick tip or memory trick when possible
6. Keep answers focused and not too long (max 300 words unless code is needed)
7. Be encouraging and positive — these students travel far to study!
8. You can understand Hindi questions but always answer in English`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: question }
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic API error:', err)
      throw new Error('AI service unavailable')
    }

    const data = await response.json()
    const answer = data.content?.[0]?.text || 'Sorry, I could not generate an answer. Please try again.'

    // Track activity
    try {
      await connectDB()
      const today = new Date().toISOString().split('T')[0]
      await Progress.findOneAndUpdate(
        { studentId: session.user.id, date: today },
        {
          $push: {
            activities: {
              activityType: 'doubt_asked',
              subject: 'General',
              topic: 'AI Doubt Solver',
              details: question.substring(0, 100),
              timestamp: new Date(),
            }
          },
          lastActive: new Date(),
        },
        { upsert: true }
      )
    } catch (dbErr) {
      console.error('Progress tracking error:', dbErr)
    }

    return NextResponse.json({ answer })
  } catch (error) {
    console.error('AI Doubt error:', error)
    return NextResponse.json({
      answer: 'Sorry, the AI service is temporarily unavailable. Please try again in a moment, or refer to your study notes! 📚'
    })
  }
}
