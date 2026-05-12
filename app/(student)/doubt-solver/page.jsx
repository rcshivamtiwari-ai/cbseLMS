'use client'
import { useState, useRef, useEffect } from 'react'
import { Brain, Send, Loader2, Bot, User, Lightbulb, BookOpen, Code2 } from 'lucide-react'

const QUICK_QUESTIONS = [
  'What is the difference between list and tuple in Python?',
  'Explain try-except-finally with an example',
  'What is LIFO in Stack? Give real life example',
  'Difference between Hub and Switch in networking',
  'What is Primary Key and Foreign Key?',
  'Explain supervised vs unsupervised learning',
  'What is a pixel in computer vision?',
  'How does CNN work? Explain simply',
]

export default function DoubtSolverPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Namaste! 🙏 I am your AI Study Assistant for Class X and XII Computer Science.\n\nI can help you with:\n• 🐍 **Python** — functions, files, exceptions, stack\n• 🌐 **Networks** — devices, protocols, topologies\n• 🗄️ **Database** — SQL commands, keys, joins\n• 🤖 **AI** — ML types, neural networks, CNN, ethics\n\nAsk me anything from your syllabus — in English or Hindi! 😊`,
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    const question = (text || input).trim()
    if (!question) return

    const userMsg = { role: 'user', content: question, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai-doubt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      const data = await res.json()

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer || 'Sorry, I could not answer that. Please try again.',
        timestamp: new Date(),
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was a network error. Please check your internet and try again.',
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatMessage = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.*?)`/g, '<code style="background:#f0f9ff;color:#0369a1;padding:2px 6px;border-radius:4px;font-size:0.85em;font-family:monospace">$1</code>')
      .replace(/\n/g, '<br/>')
      .replace(/•/g, '<span style="color:#0ea5e9">•</span>')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-700 to-brand-600 rounded-2xl p-4 mb-4 text-white flex items-center gap-3">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-['Poppins',sans-serif] text-lg font-bold">AI Doubt Solver</h1>
          <p className="text-brand-200 text-xs">Powered by Claude AI • Available 24/7 • Ask anything from your syllabus</p>
        </div>
        <div className="ml-auto flex items-center gap-2 bg-white/10 rounded-xl px-3 py-1.5">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-white font-medium">Online</span>
        </div>
      </div>

      {/* Quick question chips */}
      <div className="flex gap-2 flex-wrap mb-3">
        {QUICK_QUESTIONS.slice(0, 4).map(q => (
          <button key={q} onClick={() => sendMessage(q)}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-full text-xs hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700 transition-colors">
            {q.length > 40 ? q.slice(0, 40) + '...' : q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
              msg.role === 'assistant' ? 'bg-brand-100' : 'bg-saffron-500'
            }`}>
              {msg.role === 'assistant'
                ? <Bot className="w-4 h-4 text-brand-600" />
                : <User className="w-4 h-4 text-white" />
              }
            </div>

            {/* Message bubble */}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === 'assistant'
                ? 'bg-white border border-slate-100 text-slate-800'
                : 'bg-brand-600 text-white'
            }`}>
              <div
                className="text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
              />
              <p className={`text-xs mt-1.5 ${msg.role === 'assistant' ? 'text-slate-400' : 'text-brand-200'}`}>
                {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-brand-600" />
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3">
              <div className="flex gap-1 items-center">
                <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 flex gap-3 items-end shadow-sm">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask any doubt from your syllabus... (Enter to send, Shift+Enter for new line)"
          rows={2}
          className="flex-1 resize-none text-sm text-slate-800 focus:outline-none leading-relaxed"
          disabled={loading}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="w-10 h-10 flex items-center justify-center bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white rounded-xl transition-colors flex-shrink-0"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>

      <p className="text-center text-slate-400 text-xs mt-2">
        💡 Ask in English or Hindi • Press Enter to send • Shift+Enter for new line
      </p>
    </div>
  )
}
