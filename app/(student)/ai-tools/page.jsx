'use client'
import { Brain, ExternalLink, Layers } from 'lucide-react'

const TOOLS = [
  { name:'Teachable Machine', cat:'Machine Learning', emoji:'🤖', desc:'Build your own AI model with no code! Train it to recognise images, sounds, or poses using your webcam.', url:'https://teachablemachine.withgoogle.com/', color:'from-orange-400 to-orange-600', topics:['Supervised Learning','Classification','Model Training'], cbse:'Class X — AI Unit 2' },
  { name:'TensorFlow Playground', cat:'Neural Networks', emoji:'🧠', desc:'Visualise how a neural network learns. Change layers, neurons, and watch training happen live!', url:'https://playground.tensorflow.org/', color:'from-blue-400 to-blue-600', topics:['Neural Networks','ANN','Deep Learning'], cbse:'Class X — Artificial Neural Networks' },
  { name:'Orange Data Mining', cat:'Data Science', emoji:'🍊', desc:'Drag-and-drop data science. Load datasets, build models, see results visually. No coding needed!', url:'https://orangedatamining.com/', color:'from-green-400 to-green-600', topics:['Data Science','No-Code AI','Model Evaluation'], cbse:'Class X — No Code AI Tool' },
  { name:'Emoji Scavenger Hunt', cat:'Computer Vision', emoji:'🔍', desc:'Find real-world objects that look like emojis using your camera. See Computer Vision AI in action!', url:'https://emojiscavengerhunt.withgoogle.com/', color:'from-yellow-400 to-yellow-600', topics:['Computer Vision','Object Detection','CNN'], cbse:'Class X — Computer Vision' },
  { name:'Image Kernels (Convolution)', cat:'Computer Vision', emoji:'🖼️', desc:'See how convolution filters/kernels work on images interactively. Understand CNN step by step!', url:'http://setosa.io/ev/image-kernels/', color:'from-purple-400 to-purple-600', topics:['CNN','Convolution Operator','Feature Extraction'], cbse:'Class X — CNN Architecture' },
  { name:'Piskel — Pixel Art', cat:'Computer Vision', emoji:'🎨', desc:'Create pixel art and understand how images are made of pixels. Learn resolution and pixel values.', url:'https://www.piskelapp.com/', color:'from-pink-400 to-pink-600', topics:['Pixels','Resolution','Image Representation'], cbse:'Class X — Basics of Images' },
  { name:'RGB Color Calculator', cat:'Computer Vision', emoji:'🌈', desc:'Experiment with RGB values (0-255). Understand how all colours are formed from Red, Green, Blue.', url:'https://www.w3schools.com/colors/colors_rgb.asp', color:'from-red-400 to-red-600', topics:['RGB Images','Grayscale','Pixel Values'], cbse:'Class X — RGB and Grayscale' },
  { name:'Google Drum Machine', cat:'Machine Learning', emoji:'🥁', desc:'AI-powered drum machine that learns from your rhythm. Demonstrates unsupervised learning patterns.', url:'https://experiments.withgoogle.com/ai/drum-machine/view/', color:'from-teal-400 to-teal-600', topics:['Unsupervised Learning','Pattern Recognition'], cbse:'Class X — Unsupervised Learning' },
  { name:'My Goodness — AI Ethics', cat:'AI Ethics', emoji:'⚖️', desc:'Explore ethical decision-making scenarios. Understand AI ethics through interactive activities.', url:'https://www.my-goodness.net/', color:'from-slate-400 to-slate-600', topics:['AI Ethics','Ethical Frameworks','Bias'], cbse:'Class X — Ethical Frameworks of AI' },
]

const ROADMAP = [
  { unit:'Unit 1', topic:'AI Project Cycle + Ethics', tools:['My Goodness — AI Ethics'] },
  { unit:'Unit 2', topic:'AI, ML, DL — Types of Learning', tools:['TensorFlow Playground','Teachable Machine','Google Drum Machine'] },
  { unit:'Unit 3', topic:'Model Evaluation & Metrics', tools:['Orange Data Mining'] },
  { unit:'Unit 4', topic:'No-Code AI Tools & Statistics', tools:['Orange Data Mining'] },
  { unit:'Unit 5', topic:'Computer Vision & CNN', tools:['Emoji Scavenger Hunt','Image Kernels (Convolution)','Piskel — Pixel Art','RGB Color Calculator'] },
]

export default function AIToolsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-['Poppins',sans-serif] text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Brain className="w-6 h-6 text-orange-500"/> Free AI Tools
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">CBSE-aligned free tools for Class X AI curriculum • All work in your browser • No account needed</p>
      </div>

      <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
        <p className="text-orange-800 text-sm">
          🎯 <strong>Class X Students:</strong> These tools are directly from your CBSE syllabus. Use them before exams to understand AI practically — it makes concepts much easier to remember!
        </p>
      </div>

      {/* Tools grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map(tool => (
          <a key={tool.name} href={tool.url} target="_blank" rel="noopener noreferrer"
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden card-hover group block">
            <div className={`bg-gradient-to-r ${tool.color} p-4 flex items-center justify-between`}>
              <span className="text-3xl">{tool.emoji}</span>
              <span className="text-white/80 text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">{tool.cat}</span>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-1.5">
                <h3 className="font-['Poppins',sans-serif] font-semibold text-slate-800 group-hover:text-brand-600 transition-colors text-sm">{tool.name}</h3>
                <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-brand-400 flex-shrink-0 ml-2 mt-0.5 transition-colors"/>
              </div>
              <p className="text-slate-500 text-xs mb-3 leading-relaxed">{tool.desc}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {tool.topics.map(t => <span key={t} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{t}</span>)}
              </div>
              <p className="text-xs text-orange-600 font-medium">📚 {tool.cbse}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Syllabus roadmap */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <h2 className="font-['Poppins',sans-serif] font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-brand-500"/> Class X AI Syllabus — Which Tool to Use When
        </h2>
        <div className="space-y-2.5">
          {ROADMAP.map(item => (
            <div key={item.unit} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <span className="text-xs font-bold text-brand-700 bg-brand-100 px-2 py-1 rounded-lg w-16 text-center flex-shrink-0">{item.unit}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800 mb-1">{item.topic}</p>
                <div className="flex gap-1 flex-wrap">
                  {item.tools.map(t => <span key={t} className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{t}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
