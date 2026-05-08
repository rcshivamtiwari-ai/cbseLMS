# 🏫 Chinmaya Vidyalaya LMS
## Complete Learning Management System — Class X & XII Computer Science

**Built by  Shivam Tiwari, Chinmaya Vidyalaya NTPC Unchahar**

---

## ⚡ FASTEST WAY TO GET STARTED (3 Steps)

### Step 1 — Create MongoDB Atlas (free database)
1. Go to **https://cloud.mongodb.com** → Sign up free
2. Create cluster → choose **M0 FREE** → Provider: **AWS** → Region: **Mumbai**
3. Create user: username `vidyalaya_admin`, password (write it down!)
4. Network Access → Add IP → **Allow Access from Anywhere** (0.0.0.0/0)
5. Connect → Drivers → Copy connection string → replace `<password>` with your password
6. Add `vidyalaya` before the `?`: `...mongodb.net/vidyalaya?retryWrites...`

### Step 2 — Deploy to Vercel (free hosting)
1. Upload this entire folder to **https://github.com** (new private repo)
2. Go to **https://vercel.com** → Sign up with GitHub → Import your repo
3. Add these Environment Variables:
   - `MONGODB_URI` = your MongoDB connection string from Step 1
   - `NEXTAUTH_SECRET` = go to https://generate-secret.vercel.app/32 and copy the result
   - `NEXTAUTH_URL` = https://YOUR-PROJECT.vercel.app (your Vercel URL after deploy)
4. Click **Deploy** → wait 3 minutes

### Step 3 — Create Admin Account + Load All Data
Visit this URL in your browser (replace with your actual URL):
```
https://YOUR-PROJECT.vercel.app/api/setup-all
```

You will see a success message with:
- **Email**: shivam@vidyalaya.edu
- **Password**: Admin@Vidyalaya123

**Login at**: https://YOUR-PROJECT.vercel.app/login

---

## 🔒 IMPORTANT AFTER FIRST LOGIN
1. Go to **Admin → Settings** → Change your password immediately!
2. Go to GitHub → delete `app/api/setup-all/route.js` (security)
3. Add students from **Admin → Students**

---

## 📁 What's Included

### Student Features
- 📖 **Study Notes** — 22 complete notes covering full Class X & XII syllabus
- 💻 **Python Practice** — 8 challenges + free code editor (runs real Python)
- 🗄️ **SQL Practice** — Full SQLite in browser with 8 preset examples
- 📝 **Tests** — Live timer, MCQ/True-False, auto-graded
- 🎥 **Live Classes** — Jitsi Meet video (100% free)
- 🏆 **Leaderboard** — Class-wise ranking
- 🤖 **AI Tools** — 9 free CBSE tools for Class X

### Teacher/Admin Features
- 📊 **Dashboard** — Active students chart, subject performance, daily activity
- ⚠️ **Auto-alerts** — Students inactive 3+ days shown prominently
- 👥 **Students** — Add one-by-one or bulk CSV upload
- 📚 **Notes Manager** — Create/edit notes with Markdown, syntax, tips
- 📝 **Test Manager** — Create tests, go LIVE, view all results
- 📡 **Class Scheduler** — Schedule Jitsi classes
- 🔍 **Deep Monitoring** — Click any student → see all activities + skill gaps
- ⚙️ **Settings** — Toggle enrollment open/closed, future public access

### Pre-loaded Content (via /api/setup-all)
**Class XII Notes**: Functions, Exception Handling, Text Files, Binary Files, CSV Files, Stack, Networks Evolution, Transmission Media, Network Devices, Topologies, Protocols, Web Services, Database Concepts, SQL Commands, Python-MySQL Connectivity

**Class X Notes**: AI Project Cycle, AI vs ML vs DL, Types of ML, Neural Networks, Model Evaluation, Computer Vision, CNN Architecture, AI Ethics

**30 MCQ/True-False Questions** across all topics for both classes

---

## 💰 Cost: ₹0/month Forever
| Service | Free Limit |
|---------|-----------|
| Vercel | 100GB bandwidth/month |
| MongoDB Atlas | 512MB storage |
| Jitsi Meet | Unlimited video calls |
| Piston API | Unlimited code execution |

---

## 🆘 Troubleshooting

**"Invalid email or password"** → Run /api/setup-all first to create admin account

**Site shows error after deploy** → Check MONGODB_URI is correct in Vercel settings

**Students can't join class** → Browser needs camera/mic permission. Click Allow.

**Can't run Python code** → Piston API (emkc.org) may be temporarily down. Try again in 2 min.

---

*Made with ❤️ for students of Chinmaya Vidyalaya who travel 40km to learn*
