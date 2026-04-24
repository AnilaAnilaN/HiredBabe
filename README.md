# HiredBabe 🎤✨
### The Elite AI-Powered Interview Mentor for Global Talent

**HiredBabe** is a cutting-edge, multimodal interview simulation platform designed to bridge the gap between "knowing the answer" and "nailing the delivery." Built with a neo-brutalist aesthetic and powered by **Google Gemini 3.1 Flash**, HiredBabe transforms your device into a personal career coach that tracks your progress, analyzes your "vibe," and perfects your speech.

---

## 🌟 Vision
In today's competitive market, communication is the ultimate differentiator. **HiredBabe** empowers professionals to practice in a high-fidelity environment, ensuring they enter every interview with confidence, clarity, and a data-backed strategy for success.

## 🚀 Key Features

### 1. Multimodal AI Analysis
Analyzes micro-expressions, audio tonality, and speech transcripts simultaneously using **Gemini 3.1 Flash Lite**. Get real-time feedback on your confidence, pacing, and technical depth.

### 2. Personal Career Dashboard
Your interview history is now persistent. Track your growth across multiple sessions, visualize your "Skill Radar," and identify patterns in your weaknesses through automated trend analysis.

### 3. Secure Authentication & Persistence
Powered by **Supabase Auth**, your data is encrypted and accessible across devices. Guest users can practice instantly, while logged-in users unlock career-long analytics.

### 4. AI Perfect Answers & STAR Check
- **STAR Structure Check:** Automated analysis of Situation, Task, Action, and Result.
- **AI Perfect Answers:** Receive a tailored "Perfect Answer" after every response to learn exactly how to improve.

### 5. Custom Mission Control
Tailor your session with specific Job Descriptions, Resume highlights, and role-specific tracks. Choose between **Coach Mode** for guided help or **Real Round** for a high-pressure simulation.

## 🛠️ Tech Stack
- **Framework:** Next.js 16 (App Router + TypeScript)
- **Styling:** Tailwind CSS v4 (Neo-Brutalist Aesthetic)
- **Database & Auth:** Supabase (PostgreSQL + RLS)
- **AI Engine:** Google Gemini 3.1 Flash Lite
- **Email/OTP:** Brevo SMTP
- **Speech:** Web Speech API (Neural Voice Synthesis & Real-time Recognition)

## 📦 Getting Started

### 1. Prerequisites
- Node.js 20+
- A Supabase Project
- A Google Gemini API Key

### 2. Setup
1. **Clone the repository**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up Environment Variables:**
   Create a `.env.local` file:
   ```env
   GEMINI_API_KEY=your_gemini_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   BREVO_API_KEY=your_brevo_key
   ```
4. **Run Database Migrations:**
   Copy the contents of `supabase-migration.sql` into your Supabase SQL Editor and run it to initialize your tables and RLS policies.

### 3. Launch
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) and start nailing your interviews!

---

## 👩‍💻 Author
**Anila Nawaz**  
*Passionate about building AI solutions that empower the next generation of global talent.*

---

## 🔗 Program Reference
This project is a proud submission for:
**#AISeekho #VibeKaregaPakistan**  
*A Google program fostering AI innovation in Pakistan.*

#GooglePakistan #AI #Gemini #aiseekho #VibeKaregaPakistan
