'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Zap, CheckCircle, XCircle, Trophy, Flame, Clock, ChevronRight, RotateCcw } from 'lucide-react'

export default function DailyQuizPage() {
  const { data: session } = useSession()
  const [quiz, setQuiz] = useState(null)
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [showResult, setShowResult] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [alreadyDone, setAlreadyDone] = useState(false)
  const [todayScore, setTodayScore] = useState(null)

  useEffect(() => {
    loadDailyQuiz()
  }, [])

  const loadDailyQuiz = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/daily-quiz')
      const data = await res.json()
      if (data.alreadyDone) {
        setAlreadyDone(true)
        setTodayScore(data.score)
      } else {
        setQuiz(data.questions)
      }
    } catch {
      // Fallback: use hardcoded questions if API fails
      setQuiz(FALLBACK_QUESTIONS.sort(() => Math.random() - 0.5).slice(0, 5))
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (option) => {
    if (submitted) return
    setSelected(option)
  }

  const handleNext = () => {
    if (!selected) return
    const q = quiz[current]
    const isCorrect = selected.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
    const newAnswers = [...answers, { question: q.question, selected, correct: q.correctAnswer, isCorrect }]
    setAnswers(newAnswers)
    if (isCorrect) setScore(s => s + 1)

    setSubmitted(true)
    setTimeout(() => {
      if (current + 1 >= quiz.length) {
        setShowResult(true)
        // Save result
        const finalScore = newAnswers.filter(a => a.isCorrect).length
        fetch('/api/daily-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score: finalScore,
            total: quiz.length,
            answers: newAnswers,
          }),
        }).catch(() => {})
      } else {
        setCurrent(c => c + 1)
        setSelected(null)
        setSubmitted(false)
      }
    }, 1200)
  }

  const q = quiz?.[current]
  const progress = quiz ? ((current + (submitted ? 1 : 0)) / quiz.length) * 100 : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading today's quiz...</p>
        </div>
      </div>
    )
  }

  if (alreadyDone) {
    return (
      <div className="max-w-lg mx-auto text-center py-12 animate-slide-up">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="font-['Poppins',sans-serif] text-2xl font-bold text-slate-800 mb-2">
          Today's Quiz Done! ✅
        </h2>
        <p className="text-slate-500 mb-4">You already completed today's daily quiz.</p>
        <div className="bg-green-50 rounded-2xl p-5 border border-green-100 mb-6">
          <p className="text-green-700 text-3xl font-bold font-['Poppins',sans-serif]">
            {todayScore?.score}/{todayScore?.total}
          </p>
          <p className="text-green-600 text-sm mt-1">Your score today</p>
        </div>
        <p className="text-slate-400 text-sm">Come back tomorrow for new questions! 🌟</p>
        <div className="mt-6 bg-brand-50 rounded-2xl p-4 border border-brand-100">
          <p className="text-brand-700 text-sm font-medium">While you wait, try:</p>
          <div className="flex gap-2 mt-2 flex-wrap justify-center">
            {[['Python Practice', '/practice'], ['SQL Practice', '/sql'], ['Study Notes', '/notes']].map(([label, href]) => (
              <a key={href} href={href}
                className="px-3 py-1.5 bg-brand-600 text-white rounded-xl text-xs font-medium hover:bg-brand-700 transition-colors">
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (showResult) {
    const finalScore = answers.filter(a => a.isCorrect).length
    const pct = Math.round((finalScore / quiz.length) * 100)
    return (
      <div className="max-w-lg mx-auto animate-slide-up">
        <div className="text-center py-8">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5 ${
            pct >= 80 ? 'bg-green-100' : pct >= 60 ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            {pct >= 80 ? <Trophy className="w-12 h-12 text-yellow-500" /> : <Zap className="w-12 h-12 text-brand-500" />}
          </div>
          <h2 className="font-['Poppins',sans-serif] text-2xl font-bold text-slate-800 mb-1">Quiz Complete!</h2>
          <div className={`inline-block px-8 py-4 rounded-2xl my-4 ${
            pct >= 80 ? 'bg-green-50 border border-green-200' : pct >= 60 ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`text-4xl font-['Poppins',sans-serif] font-black ${
              pct >= 80 ? 'text-green-600' : pct >= 60 ? 'text-yellow-600' : 'text-red-500'
            }`}>{finalScore}/{quiz.length}</p>
            <p className="text-slate-500 text-sm">{pct}% correct</p>
          </div>
          <p className="text-slate-500 text-sm mb-6">
            {pct >= 80 ? '🌟 Excellent! You are ready for the exam!' :
             pct >= 60 ? '👍 Good effort! Review the wrong answers.' :
             '📚 Keep studying — you will improve!'}
          </p>
        </div>

        {/* Review answers */}
        <div className="space-y-3 mb-6">
          <h3 className="font-['Poppins',sans-serif] font-semibold text-slate-700">Review Your Answers:</h3>
          {answers.map((a, i) => (
            <div key={i} className={`p-4 rounded-xl border ${a.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-start gap-2">
                {a.isCorrect
                  ? <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  : <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                }
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800 mb-1">Q{i+1}: {a.question}</p>
                  {!a.isCorrect && (
                    <>
                      <p className="text-xs text-red-600">Your answer: {a.selected}</p>
                      <p className="text-xs text-green-700 font-medium">Correct: {a.correct}</p>
                    </>
                  )}
                  {a.isCorrect && <p className="text-xs text-green-600">✓ {a.selected}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-slate-400 text-sm">Come back tomorrow for new questions! 🌟</p>
      </div>
    )
  }

  if (!quiz || !q) return null

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Poppins',sans-serif] text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" /> Daily Quiz
          </h1>
          <p className="text-slate-500 text-sm">5 new questions every day • Builds your exam preparation</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1.5 text-orange-500 font-bold">
            <Flame className="w-5 h-5" />
            <span className="font-['Poppins',sans-serif] text-lg">Daily</span>
          </div>
          <p className="text-slate-400 text-xs">{new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'short' })}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-slate-100 rounded-full h-2 mb-2">
        <div className="bg-brand-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-xs text-slate-400 text-right mb-6">Question {current + 1} of {quiz.length}</p>

      {/* Question card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mb-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium">
            {q.subject}
          </span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
            {q.difficulty || 'Medium'}
          </span>
        </div>
        <h2 className="text-slate-800 font-medium text-base leading-relaxed mb-6">{q.question}</h2>

        <div className="space-y-3">
          {(q.options || ['True', 'False']).filter(o => o).map((option, i) => {
            let bg = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
            if (selected === option) {
              if (!submitted) {
                bg = 'bg-brand-50 border-brand-400 text-brand-700'
              } else {
                bg = option === q.correctAnswer
                  ? 'bg-green-50 border-green-400 text-green-700'
                  : 'bg-red-50 border-red-400 text-red-700'
              }
            } else if (submitted && option === q.correctAnswer) {
              bg = 'bg-green-50 border-green-400 text-green-700'
            }

            return (
              <button key={i} onClick={() => handleSelect(option)} disabled={submitted}
                className={`w-full text-left p-3.5 rounded-xl border-2 transition-all text-sm font-medium ${bg} ${!submitted ? 'cursor-pointer' : 'cursor-default'}`}>
                <span className="inline-flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    selected === option ? 'border-current bg-current/10' : 'border-slate-300'
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {option}
                  {submitted && option === q.correctAnswer && <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />}
                  {submitted && option === selected && option !== q.correctAnswer && <XCircle className="w-4 h-4 text-red-500 ml-auto" />}
                </span>
              </button>
            )
          })}
        </div>

        {/* Explanation after submit */}
        {submitted && q.explanation && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-blue-800 text-sm"><strong>💡 Explanation:</strong> {q.explanation}</p>
          </div>
        )}
      </div>

      {/* Next button */}
      <button onClick={handleNext} disabled={!selected || submitted}
        className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-200 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2">
        {current + 1 >= quiz?.length ? 'See Results 🎉' : 'Next Question'}
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

// Fallback questions if API fails
const FALLBACK_QUESTIONS = [
  { question: 'Which keyword defines a function in Python?', options: ['fun', 'function', 'def', 'define'], correctAnswer: 'def', subject: 'Python', explanation: 'Python uses def keyword to define functions.' },
  { question: 'What does LIFO stand for in Stack?', options: ['Last In First Out', 'Last In First Order', 'Linear In First Out', 'List In File Out'], correctAnswer: 'Last In First Out', subject: 'Python', explanation: 'Stack follows LIFO — Last In First Out principle.' },
  { question: 'Which SQL command retrieves data from a table?', options: ['GET', 'FETCH', 'SELECT', 'RETRIEVE'], correctAnswer: 'SELECT', subject: 'Database', explanation: 'SELECT is used to retrieve data from database tables.' },
  { question: 'Which device connects two different networks?', options: ['Hub', 'Switch', 'Router', 'Repeater'], correctAnswer: 'Router', subject: 'Networks', explanation: 'Router connects different networks and routes data packets.' },
  { question: 'Which type of ML uses labeled training data?', options: ['Unsupervised', 'Reinforcement', 'Supervised', 'Deep'], correctAnswer: 'Supervised', subject: 'AI', explanation: 'Supervised Learning trains on labeled data with correct answers.' },
  { question: 'What does HTTP stand for?', options: ['HyperText Transfer Protocol', 'High Transfer Text Protocol', 'HyperText Transport Program', 'Home Transfer Text Protocol'], correctAnswer: 'HyperText Transfer Protocol', subject: 'Networks', explanation: 'HTTP = HyperText Transfer Protocol, used for web pages.' },
  { question: 'Which file mode deletes existing content in Python?', options: ['"r"', '"a"', '"w"', '"r+"'], correctAnswer: '"w"', subject: 'Python', explanation: '"w" mode creates new or overwrites existing file content.' },
  { question: 'PRIMARY KEY can contain NULL values — True or False?', options: ['True', 'False'], correctAnswer: 'False', subject: 'Database', explanation: 'PRIMARY KEY enforces NOT NULL + UNIQUE — it can never be NULL.' },
  { question: 'In grayscale images, what value represents BLACK?', options: ['255', '128', '0', '100'], correctAnswer: '0', subject: 'AI', explanation: 'In grayscale: 0 = black, 255 = white, values in between are grays.' },
  { question: 'Which layer of CNN applies filters to detect features?', options: ['Fully Connected', 'Pooling', 'Convolutional', 'Output'], correctAnswer: 'Convolutional', subject: 'AI', explanation: 'Convolutional Layer applies filters/kernels to extract image features.' },
]
