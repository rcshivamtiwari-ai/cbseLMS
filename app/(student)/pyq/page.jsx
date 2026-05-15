'use client'
import { useState, useEffect } from 'react'
import { BookOpen, Search, ChevronDown, ChevronUp, Star, Clock, Filter } from 'lucide-react'

// Built-in PYQ bank — CBSE Board Questions
const PYQ_DATA = [
  // ═══ CLASS XII — PYTHON ═══
  {
    year: '2024', class: 'XII', subject: 'Python', topic: 'Functions',
    marks: 2, type: 'SA1',
    question: 'What is the difference between a local variable and a global variable in Python? Give an example of each.',
    answer: 'Local variable: Defined inside a function, accessible only within that function.\nGlobal variable: Defined outside all functions, accessible throughout the program.\n\nExample:\ncount = 10  # global variable\ndef show():\n    name = "Rahul"  # local variable\n    print(name)\n    print(count)  # can access global',
    tags: ['functions', 'scope', 'local', 'global'],
  },
  {
    year: '2023', class: 'XII', subject: 'Python', topic: 'Functions',
    marks: 3, type: 'SA2',
    question: 'Write a Python function factorial(n) that returns the factorial of a given number n using recursion.',
    answer: 'def factorial(n):\n    if n == 0 or n == 1:\n        return 1\n    else:\n        return n * factorial(n - 1)\n\nprint(factorial(5))  # Output: 120',
    tags: ['functions', 'recursion', 'user-defined'],
  },
  {
    year: '2024', class: 'XII', subject: 'Python', topic: 'Exception Handling',
    marks: 3, type: 'SA2',
    question: 'Write a Python program to handle ZeroDivisionError and ValueError exceptions. The program should ask the user to enter two numbers and display their quotient.',
    answer: 'try:\n    a = int(input("Enter numerator: "))\n    b = int(input("Enter denominator: "))\n    result = a / b\n    print("Result:", result)\nexcept ZeroDivisionError:\n    print("Error: Cannot divide by zero!")\nexcept ValueError:\n    print("Error: Please enter valid integers!")\nfinally:\n    print("Program completed.")',
    tags: ['exception', 'try-except', 'ZeroDivisionError', 'ValueError'],
  },
  {
    year: '2023', class: 'XII', subject: 'Python', topic: 'Exception Handling',
    marks: 2, type: 'SA1',
    question: 'What is the purpose of the finally block in exception handling? When does it execute?',
    answer: 'The finally block always executes regardless of whether an exception occurred or not.\n\nPurpose:\n• Used for cleanup operations\n• Closing files or database connections\n• Releasing resources\n\nIt executes:\n• When no exception occurs (after try block)\n• When exception occurs and is handled (after except block)\n• When exception occurs and is NOT handled (before propagating)',
    tags: ['finally', 'exception', 'cleanup'],
  },
  {
    year: '2024', class: 'XII', subject: 'Python', topic: 'Text File Handling',
    marks: 4, type: 'LA',
    question: 'Write a Python program to read a text file "data.txt" line by line and display each word separated by a # symbol. Also count and display the total number of vowels in the file.',
    answer: 'with open("data.txt", "r") as f:\n    content = f.read()\n\n# Words separated by #\nfor line in content.split("\\n"):\n    words = line.strip().split()\n    if words:\n        print("#".join(words))\n\n# Count vowels\nvowels = sum(1 for c in content.lower() if c in "aeiou")\nprint("Total vowels:", vowels)',
    tags: ['text file', 'read', 'vowels', 'split'],
  },
  {
    year: '2023', class: 'XII', subject: 'Python', topic: 'Text File Handling',
    marks: 3, type: 'SA2',
    question: 'Differentiate between the file opening modes "w", "a" and "r+" in Python with examples.',
    answer: '"w" (Write mode):\n• Creates new file or OVERWRITES existing\n• Only writing allowed\nopen("file.txt", "w")\n\n"a" (Append mode):\n• Creates new or ADDS to existing file\n• New data added at end\nopen("file.txt", "a")\n\n"r+" (Read+Write mode):\n• File MUST exist\n• Both reading and writing allowed\nopen("file.txt", "r+")',
    tags: ['file modes', 'w', 'a', 'r+', 'text file'],
  },
  {
    year: '2024', class: 'XII', subject: 'Python', topic: 'Binary File Handling',
    marks: 4, type: 'LA',
    question: 'Write a Python program using pickle module to: (i) Create a binary file storing student records (roll, name, marks). (ii) Search for a student by roll number and display their details.',
    answer: 'import pickle\n\n# Write records\nstudents = [\n    {"roll": 1, "name": "Rahul", "marks": 85},\n    {"roll": 2, "name": "Priya", "marks": 92}\n]\nwith open("students.dat", "wb") as f:\n    pickle.dump(students, f)\n\n# Search by roll number\ndef search(roll_no):\n    with open("students.dat", "rb") as f:\n        records = pickle.load(f)\n    for s in records:\n        if s["roll"] == roll_no:\n            print("Name:", s["name"])\n            print("Marks:", s["marks"])\n            return\n    print("Not found!")\n\nsearch(2)',
    tags: ['pickle', 'binary file', 'dump', 'load', 'search'],
  },
  {
    year: '2023', class: 'XII', subject: 'Python', topic: 'CSV File Handling',
    marks: 3, type: 'SA2',
    question: 'Write a Python program to create a CSV file "users.csv" with columns user_id and password. Then write a function to search and display the password for a given user_id.',
    answer: 'import csv\n\n# Create CSV\nwith open("users.csv", "w", newline="") as f:\n    writer = csv.writer(f)\n    writer.writerow(["user_id", "password"])\n    writer.writerow(["admin", "admin123"])\n    writer.writerow(["rahul01", "pass456"])\n\n# Search function\ndef search_password(user_id):\n    with open("users.csv", "r") as f:\n        reader = csv.reader(f)\n        next(reader)  # skip header\n        for row in reader:\n            if row[0] == user_id:\n                print("Password:", row[1])\n                return\n    print("User not found!")\n\nsearch_password("rahul01")',
    tags: ['csv', 'writer', 'reader', 'search'],
  },
  {
    year: '2024', class: 'XII', subject: 'Python', topic: 'Stack',
    marks: 4, type: 'LA',
    question: 'Write a Python program to implement a stack using a list. Include push(), pop(), peek(), isEmpty() and display() methods. Show push of 10,20,30 and then pop twice.',
    answer: 'class Stack:\n    def __init__(self):\n        self.items = []\n\n    def push(self, item):\n        self.items.append(item)\n\n    def pop(self):\n        if not self.is_empty():\n            return self.items.pop()\n        return "Underflow!"\n\n    def peek(self):\n        if not self.is_empty():\n            return self.items[-1]\n        return None\n\n    def is_empty(self):\n        return len(self.items) == 0\n\n    def display(self):\n        print("Stack:", self.items[::-1])\n\ns = Stack()\ns.push(10); s.push(20); s.push(30)\ns.display()  # [30, 20, 10]\nprint(s.pop())  # 30\nprint(s.pop())  # 20',
    tags: ['stack', 'LIFO', 'push', 'pop', 'peek'],
  },

  // ═══ CLASS XII — NETWORKS ═══
  {
    year: '2024', class: 'XII', subject: 'Networks', topic: 'Network Devices',
    marks: 2, type: 'SA1',
    question: 'Differentiate between a Hub and a Switch with respect to data transmission.',
    answer: 'Hub:\n• Broadcasts data to ALL connected devices\n• Does not check destination address\n• Dumb device — no intelligence\n• Creates network congestion\n• Old technology, being replaced\n\nSwitch:\n• Sends data ONLY to target device using MAC address\n• Intelligent — maintains MAC address table\n• Reduces network traffic\n• More efficient than hub\n• Used in modern LANs',
    tags: ['hub', 'switch', 'MAC address', 'network devices'],
  },
  {
    year: '2023', class: 'XII', subject: 'Networks', topic: 'Protocols',
    marks: 2, type: 'SA1',
    question: 'What is the difference between SMTP and POP3 protocols? State one use of each.',
    answer: 'SMTP (Simple Mail Transfer Protocol):\n• Used for SENDING emails\n• Works on port 25\n• Pushes email from sender to mail server\n• Use: When you click "Send" in Gmail\n\nPOP3 (Post Office Protocol v3):\n• Used for RECEIVING/DOWNLOADING emails\n• Works on port 110\n• Downloads email from server to local device\n• Use: When you check your inbox in email client',
    tags: ['SMTP', 'POP3', 'email', 'protocols'],
  },
  {
    year: '2024', class: 'XII', subject: 'Networks', topic: 'Topologies',
    marks: 3, type: 'SA2',
    question: 'Compare Bus, Star and Tree network topologies. State one advantage and one disadvantage of each.',
    answer: 'Bus Topology:\n✓ Advantage: Simple and cheap to install\n✗ Disadvantage: If backbone cable breaks, entire network fails\n\nStar Topology:\n✓ Advantage: Failure of one computer does not affect others\n✗ Disadvantage: If central hub/switch fails, entire network fails\n\nTree Topology:\n✓ Advantage: Scalable — easy to expand by adding branches\n✗ Disadvantage: If root node fails, whole section is affected',
    tags: ['bus', 'star', 'tree', 'topology'],
  },
  {
    year: '2023', class: 'XII', subject: 'Networks', topic: 'Transmission Media',
    marks: 3, type: 'SA2',
    question: 'Explain the following transmission media: (i) Twisted Pair Cable (ii) Fiber Optic Cable. State one advantage of fiber optic over twisted pair.',
    answer: 'Twisted Pair Cable:\n• Two copper wires twisted together\n• UTP (Unshielded) and STP (Shielded) types\n• Speed: 10 Mbps to 1 Gbps\n• Range: up to 100 metres\n• Used in LAN, telephone lines\n• Cheapest wired media\n\nFiber Optic Cable:\n• Transmits data using LIGHT pulses\n• Not affected by electromagnetic interference\n• Speed: up to 100 Gbps\n• Used in internet backbone, hospitals\n• Most expensive wired media\n\nAdvantage of fiber over twisted pair:\nFiber optic is much faster (100 Gbps vs 1 Gbps) and immune to electromagnetic interference.',
    tags: ['twisted pair', 'fiber optic', 'transmission media'],
  },

  // ═══ CLASS XII — DATABASE ═══
  {
    year: '2024', class: 'XII', subject: 'Database', topic: 'Keys',
    marks: 2, type: 'SA1',
    question: 'Define Primary Key and Foreign Key. Give one example of each.',
    answer: 'Primary Key:\n• Uniquely identifies each row in a table\n• Cannot be NULL\n• Only ONE primary key per table\nExample: rollno in Students table\n\nForeign Key:\n• Attribute in one table that references Primary Key of another table\n• Creates a relationship between two tables\n• Can be NULL\nExample: rollno in Marks table referencing rollno in Students table',
    tags: ['primary key', 'foreign key', 'keys', 'database'],
  },
  {
    year: '2024', class: 'XII', subject: 'Database', topic: 'SQL Commands',
    marks: 4, type: 'LA',
    question: 'Consider the table STUDENTS(RollNo, Name, Class, Marks, City). Write SQL queries to:\n(i) Display all students with marks > 80 ordered by marks descending\n(ii) Display class-wise average, maximum and minimum marks\n(iii) Update marks of RollNo 5 to 95\n(iv) Delete records where marks < 33',
    answer: '-- (i)\nSELECT * FROM STUDENTS\nWHERE Marks > 80\nORDER BY Marks DESC;\n\n-- (ii)\nSELECT Class, AVG(Marks), MAX(Marks), MIN(Marks)\nFROM STUDENTS\nGROUP BY Class;\n\n-- (iii)\nUPDATE STUDENTS\nSET Marks = 95\nWHERE RollNo = 5;\n\n-- (iv)\nDELETE FROM STUDENTS\nWHERE Marks < 33;',
    tags: ['SQL', 'SELECT', 'UPDATE', 'DELETE', 'GROUP BY', 'ORDER BY'],
  },
  {
    year: '2023', class: 'XII', subject: 'Database', topic: 'SQL Commands',
    marks: 3, type: 'SA2',
    question: 'What is the difference between WHERE and HAVING clause in SQL? Give one example of each.',
    answer: 'WHERE clause:\n• Filters INDIVIDUAL ROWS before grouping\n• Used with SELECT, UPDATE, DELETE\n• Cannot use aggregate functions\nExample:\nSELECT * FROM students WHERE marks > 80;\n\nHAVING clause:\n• Filters GROUPS after GROUP BY\n• Used only with GROUP BY\n• CAN use aggregate functions\nExample:\nSELECT class, AVG(marks)\nFROM students\nGROUP BY class\nHAVING AVG(marks) > 75;',
    tags: ['WHERE', 'HAVING', 'GROUP BY', 'SQL'],
  },
  {
    year: '2024', class: 'XII', subject: 'Database', topic: 'Python MySQL Connectivity',
    marks: 4, type: 'LA',
    question: 'Write a Python program to connect to MySQL database "school" and display all records from table "students" where marks > 75. Use cursor(), execute(), fetchall() methods.',
    answer: 'import mysql.connector\n\nconn = mysql.connector.connect(\n    host="localhost",\n    user="root",\n    password="your_password",\n    database="school"\n)\ncursor = conn.cursor()\n\ncursor.execute(\n    "SELECT * FROM students WHERE marks > %s",\n    (75,)\n)\n\nrows = cursor.fetchall()\nfor row in rows:\n    print(row)\n\nprint("Rows fetched:", cursor.rowcount)\ncursor.close()\nconn.close()',
    tags: ['python mysql', 'connectivity', 'fetchall', 'execute'],
  },

  // ═══ CLASS X — AI ═══
  {
    year: '2024', class: 'X', subject: 'AI', topic: 'AI Project Cycle',
    marks: 3, type: 'SA2',
    question: 'List and briefly explain the five stages of the AI Project Cycle.',
    answer: '1. Problem Scoping:\nDefine the problem clearly. Identify who is affected and what success looks like.\n\n2. Data Acquisition:\nCollect relevant data (images, text, numbers). Quality matters more than quantity.\n\n3. Data Exploration:\nUnderstand collected data. Find patterns, missing values. Visualize using charts.\n\n4. Modelling:\nChoose appropriate ML algorithm. Train the model on collected data.\n\n5. Evaluation:\nTest trained model with NEW unseen data. Measure accuracy. If poor, go back to improve.',
    tags: ['AI project cycle', '5 stages', 'problem scoping', 'modelling', 'evaluation'],
  },
  {
    year: '2023', class: 'X', subject: 'AI', topic: 'AI vs ML vs DL',
    marks: 2, type: 'SA1',
    question: 'What is the relationship between Artificial Intelligence, Machine Learning and Deep Learning? Draw a diagram to show this relationship.',
    answer: 'AI (Artificial Intelligence): Broadest concept — making machines intelligent\nML (Machine Learning): Subset of AI — learns from data\nDL (Deep Learning): Subset of ML — uses neural networks\n\nRelationship: AI ⊃ ML ⊃ DL\n\nDiagram (nested circles):\n┌─────────────────────────────┐\n│  AI                         │\n│  ┌──────────────────────┐   │\n│  │  ML                  │   │\n│  │  ┌───────────────┐   │   │\n│  │  │  DL           │   │   │\n│  │  └───────────────┘   │   │\n│  └──────────────────────┘   │\n└─────────────────────────────┘',
    tags: ['AI', 'ML', 'DL', 'relationship', 'nested circles'],
  },
  {
    year: '2024', class: 'X', subject: 'AI', topic: 'Types of ML',
    marks: 3, type: 'SA2',
    question: 'Differentiate between Supervised and Unsupervised Learning. Give two examples of each.',
    answer: 'Supervised Learning:\n• Trains on LABELED data (data with correct answers)\n• Like studying with answer key\nExamples:\n1. Email spam detection (spam/not spam labels)\n2. Image classification (cat/dog/bird labels)\n\nUnsupervised Learning:\n• Trains on UNLABELED data (no correct answers)\n• Model finds patterns on its own\nExamples:\n1. Customer segmentation (grouping by buying habits)\n2. News article clustering (grouping similar articles)',
    tags: ['supervised', 'unsupervised', 'labeled', 'unlabeled'],
  },
  {
    year: '2023', class: 'X', subject: 'AI', topic: 'Model Evaluation',
    marks: 3, type: 'SA2',
    question: 'Define Accuracy, Precision and Recall in model evaluation. State when Recall is more important than Precision with an example.',
    answer: 'Accuracy = (TP + TN) / Total — overall correct predictions\n\nPrecision = TP / (TP + FP)\nOf all predicted positives, how many were actually positive?\n\nRecall = TP / (TP + FN)\nOf all actual positives, how many did we correctly identify?\n\nRecall is more important when False Negatives are costly:\nExample — Disease Detection:\nIf our model misses a sick patient (FN), that person does not get treatment.\nMissing a sick patient is much worse than a false alarm.\nSo Recall must be maximized in medical diagnosis.',
    tags: ['accuracy', 'precision', 'recall', 'confusion matrix', 'evaluation'],
  },
  {
    year: '2024', class: 'X', subject: 'AI', topic: 'Computer Vision',
    marks: 2, type: 'SA1',
    question: 'Explain the difference between a Grayscale image and an RGB image. What are the pixel values for black, white and red in RGB?',
    answer: 'Grayscale Image:\n• Each pixel has ONE value: 0 to 255\n• 0 = Black, 255 = White, 128 = Gray\n• Simpler to process (1 channel)\n\nRGB Image:\n• Each pixel has THREE values: Red, Green, Blue (each 0-255)\n• 3 channels — full color image\n• More data than grayscale\n\nRGB values:\n• Black = (0, 0, 0)    — all channels zero\n• White = (255, 255, 255) — all channels maximum\n• Red   = (255, 0, 0)  — only red channel maximum',
    tags: ['grayscale', 'RGB', 'pixel values', 'black', 'white', 'red'],
  },
  {
    year: '2023', class: 'X', subject: 'AI', topic: 'CNN',
    marks: 3, type: 'SA2',
    question: 'Explain the architecture of a Convolutional Neural Network (CNN). Name and describe any three layers.',
    answer: 'CNN Architecture (for image processing):\n\n1. Convolutional Layer:\n• Core layer of CNN\n• Applies filters/kernels to detect features\n• Each filter detects one feature (edge, curve, color)\n• Output is called Feature Map\n\n2. Pooling Layer (Max Pooling):\n• Reduces size of feature maps\n• Takes maximum value from each region\n• Makes model faster, reduces overfitting\n\n3. Fully Connected Layer:\n• Takes flattened feature maps as input\n• Makes final classification decision\n• Connects all neurons to all neurons of next layer\n\n4. Output Layer:\n• Final predictions\n• One neuron per class\n\nFlow: Input → Conv → Pooling → Conv → Pooling → Flatten → FC → Output',
    tags: ['CNN', 'convolutional', 'pooling', 'fully connected', 'architecture'],
  },
  {
    year: '2024', class: 'X', subject: 'AI', topic: 'AI Ethics',
    marks: 2, type: 'SA1',
    question: 'What is Bias in AI systems? Give one real-life example and suggest one way to reduce it.',
    answer: 'Bias in AI:\nWhen an AI model treats different groups of people unfairly, giving better results for some groups than others.\n\nCause: Biased or unrepresentative training data\n\nReal-life Example:\nFace recognition systems trained mostly on light-skinned faces work less accurately for dark-skinned people. This is racial bias.\n\nAnother example: A hiring AI trained on past male-dominated data may unfairly rank female candidates lower.\n\nHow to reduce bias:\n• Use DIVERSE training data representing all groups equally\n• Test model performance separately for each group\n• Regularly audit AI models for fairness',
    tags: ['bias', 'AI ethics', 'fairness', 'training data'],
  },
]

const SUBJECTS = ['All', 'Python', 'Networks', 'Database', 'AI']
const YEARS    = ['All', '2024', '2023', '2022']
const MARKS    = ['All', '1-2 marks', '3-4 marks', '5+ marks']

export default function PYQPage() {
  const [search,  setSearch]  = useState('')
  const [cls,     setCls]     = useState('XII')
  const [subject, setSubject] = useState('All')
  const [year,    setYear]    = useState('All')
  const [marks,   setMarks]   = useState('All')
  const [open,    setOpen]    = useState(null)   // expanded question id

  const filtered = PYQ_DATA.filter(q => {
    if (q.class !== cls) return false
    if (subject !== 'All' && q.subject !== subject) return false
    if (year !== 'All' && q.year !== year) return false
    if (marks !== 'All') {
      if (marks === '1-2 marks' && q.marks > 2) return false
      if (marks === '3-4 marks' && (q.marks < 3 || q.marks > 4)) return false
      if (marks === '5+ marks'  && q.marks < 5) return false
    }
    if (search) {
      const s = search.toLowerCase()
      return (
        q.question.toLowerCase().includes(s) ||
        q.topic.toLowerCase().includes(s) ||
        q.tags.some(t => t.toLowerCase().includes(s))
      )
    }
    return true
  })

  const marksColor = (m) =>
    m <= 2 ? 'bg-green-100 text-green-700'
    : m <= 4 ? 'bg-yellow-100 text-yellow-700'
    : 'bg-red-100 text-red-700'

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-700 to-brand-600 rounded-2xl p-5 text-white">
        <h1 className="font-['Poppins',sans-serif] text-2xl font-bold flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-300" /> Previous Year Questions
        </h1>
        <p className="text-brand-200 text-sm mt-1">
          CBSE Board Questions 2023–2024 with complete answers • Study smart for exams!
        </p>
        <div className="flex items-center gap-3 mt-3">
          <div className="bg-white/10 rounded-xl px-3 py-1.5 text-xs">
            📝 {PYQ_DATA.filter(q => q.class === cls).length} questions
          </div>
          <div className="bg-white/10 rounded-xl px-3 py-1.5 text-xs">
            ✅ All answers included
          </div>
          <div className="bg-white/10 rounded-xl px-3 py-1.5 text-xs">
            🎯 Board exam pattern
          </div>
        </div>
      </div>

      {/* Class toggle */}
      <div className="flex gap-2">
        {['X', 'XII'].map(c => (
          <button key={c} onClick={() => { setCls(c); setSubject('All') }}
            className={`px-5 py-2 rounded-xl font-medium text-sm transition-colors ${
              cls === c ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
            Class {c}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by topic, keyword or question..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400">Filter:</span>
          </div>
          {SUBJECTS.map(s => (
            <button key={s} onClick={() => setSubject(s)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                subject === s ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>{s}</button>
          ))}
          <span className="text-slate-200">|</span>
          {YEARS.map(y => (
            <button key={y} onClick={() => setYear(y)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                year === y ? 'bg-saffron-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>{y}</button>
          ))}
          <span className="text-slate-200">|</span>
          {MARKS.map(m => (
            <button key={m} onClick={() => setMarks(m)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                marks === m ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>{m}</button>
          ))}
        </div>

        <p className="text-xs text-slate-400">
          Showing {filtered.length} question{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Questions list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-200" />
          <p className="text-slate-500 font-medium">No questions match your filters</p>
          <p className="text-slate-400 text-sm">Try changing the subject or year filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q, i) => {
            const id = `${q.year}-${q.subject}-${i}`
            const isOpen = open === id
            return (
              <div key={id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                {/* Question header */}
                <button
                  onClick={() => setOpen(isOpen ? null : id)}
                  className="w-full text-left p-5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium">
                          {q.subject}
                        </span>
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          📌 {q.topic}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${marksColor(q.marks)}`}>
                          {q.marks} mark{q.marks !== 1 ? 's' : ''}
                        </span>
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {q.year}
                        </span>
                        <span className="text-xs text-slate-400">{q.type}</span>
                      </div>
                      <p className="text-slate-800 text-sm font-medium leading-relaxed">{q.question}</p>
                    </div>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isOpen ? 'bg-brand-100' : 'bg-slate-100'
                    }`}>
                      {isOpen
                        ? <ChevronUp className="w-4 h-4 text-brand-600" />
                        : <ChevronDown className="w-4 h-4 text-slate-400" />
                      }
                    </div>
                  </div>
                </button>

                {/* Answer */}
                {isOpen && (
                  <div className="border-t border-slate-100 p-5 bg-green-50/50">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-5 bg-green-500 rounded-full" />
                      <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Model Answer</p>
                    </div>
                    <pre className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                      {q.answer}
                    </pre>
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-green-100">
                      {q.tags.map(t => (
                        <span key={t}
                          className="text-xs bg-white text-slate-500 px-2 py-0.5 rounded-full border border-slate-200 cursor-pointer hover:bg-slate-50"
                          onClick={() => setSearch(t)}>
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Exam tip box */}
      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
        <p className="text-amber-800 text-sm font-semibold mb-1">📋 Exam Tips from Shivam Sir:</p>
        <ul className="text-amber-700 text-xs space-y-1">
          <li>• 4-mark questions need proper headings and examples — don't skip them</li>
          <li>• For SQL questions, always write comments before each query</li>
          <li>• Draw diagrams wherever possible — topologies, stack, CNN layers</li>
          <li>• For Python programs, show sample output too</li>
          <li>• Keywords like LIFO, pickle, normalize matter — use them correctly</li>
        </ul>
      </div>
    </div>
  )
}
