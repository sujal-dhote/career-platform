// NRsolution4u Q&A Fallback — used when Gemini API is busy/overloaded

interface QA {
  keywords: string[]
  answer: string
}

export const NRSOLUTION_QA: QA[] = [
  // General
  {
    keywords: ['what is nrsolution4u', 'nrsolution4u services', 'about nrsolution', 'nrsolution kya hai'],
    answer: `NRsolution4u is an IT solutions and training organization based in Nagpur that provides:
• Software & Website Development
• Educational ERP Systems
• Digital Marketing
• Student Skill Development Programs (Internship, Training, Placement)

📞 Contact: 8411064860 | 🌐 https://www.nrsolution4u.com/prayatn/`
  },
  {
    keywords: ['founder', 'who started', 'nilesh', 'kisne banaya'],
    answer: `NRsolution4u was founded by **Mr. Nilesh Gupta** — a technology entrepreneur with 12+ years of experience, MCA from Hitkarni Engineering College (2008), and expert speaker at 30+ colleges.
🌐 https://www.nileshsir.com`
  },
  {
    keywords: ['core domain', 'courses offered', 'what do you teach', 'kya sikhate'],
    answer: `Core domains at NRsolution4u:
• Full Stack Development
• .NET Development (C#, ASP.NET, SQL Server)
• Python & Data Analytics
• Java Development
• Digital Marketing`
  },
  {
    keywords: ['student skill', 'skill development', 'support student', 'student ko kaise'],
    answer: `NRsolution4u supports students through:
• Hands-on training with real-time projects
• Internships with live project experience
• Workshops at 30+ colleges
• Industrial exposure and placement support
• PRAYATN initiative — free/subsidized training`
  },
  {
    keywords: ['different', 'unique', 'better than', 'kyun choose', 'why nrsolution'],
    answer: `What makes NRsolution4u different:
• Real-time project experience
• Industry-focused training
• Internship + Placement support
• Personalized mentoring
• Practical learning approach
• 11 MOU partner institutions`
  },

  // Internship
  {
    keywords: ['internship program', 'internship available', 'internship kya hai', 'which internship'],
    answer: `Internship programs available at NRsolution4u:
• Full Stack Development
• .NET (C#, ASP.NET, SQL Server)
• Python & Data Analytics
• Java Development

Duration: 2 to 6 months | 📞 8411064860`
  },
  {
    keywords: ['.net internship', 'dotnet internship', 'dot net technologies', '.net technologies covered'],
    answer: `.NET Internship covers:
• C# Programming
• ASP.NET Web Development
• SQL Server
• ADO.NET / Entity Framework
• Web Application Development with real projects`
  },
  {
    keywords: ['duration', 'kitne mahine', 'how long', 'internship duration'],
    answer: `Internship duration at NRsolution4u is typically **2 to 6 months** depending on the program chosen.`
  },
  {
    keywords: ['project assigned', 'what projects', 'kaunse project', 'project during internship'],
    answer: `Projects assigned during internship include:
• ERP Systems
• Web Portals
• E-commerce Websites
• Resume Analyzers
• College Management Systems`
  },
  {
    keywords: ['evaluated', 'assessment', 'marks', 'grading', 'evaluation'],
    answer: `Students are evaluated through:
• Weekly assessments
• Project work
• Assignments
• Viva and final project evaluation`
  },
  {
    keywords: ['certification', 'certificate', 'certificate milega', 'certificate provided'],
    answer: `Yes! A **certificate is provided** after successful completion of the internship program at NRsolution4u.`
  },
  {
    keywords: ['eligibility', 'criteria', 'who can join', 'kaun join kar sakta', 'qualification'],
    answer: `Eligibility for NRsolution4u internship:
• Basic programming knowledge
• Interest in IT field
• Students from BCA, MCA, B.Tech, BSc (CS/IT) or similar backgrounds`
  },
  {
    keywords: ['placement', 'job after internship', 'placement opportunity', 'placement milega'],
    answer: `Yes! NRsolution4u provides placement assistance after internship. Notable placements:
• Mphasis — 16 LPA
• LTIMindtree — 15.9 LPA
• Infosys — 10.5 LPA
• TCS, HCL, Cognizant, and many more!`
  },

  // Technical
  {
    keywords: ['.net framework', 'what is .net', 'dotnet framework', '.net kya hai'],
    answer: `.NET Framework is a software development platform by Microsoft used to build Windows applications, web applications, and services using languages like C# and VB.NET.`
  },
  {
    keywords: ['difference between c# and asp', 'c# vs asp', 'csharp vs aspnet'],
    answer: `**C#** is a programming language used to write logic.
**ASP.NET** is a web framework built on .NET that provides structure for building web applications.
C# is used inside ASP.NET to write the backend code.`
  },
  {
    keywords: ['sql server', 'what is sql', 'sql kya hai', 'sql in web development'],
    answer: `SQL Server is a relational database management system by Microsoft. In web development, it stores and manages application data like user info, products, and transactions.`
  },
  {
    keywords: ['crud', 'create read update delete', 'crud operations'],
    answer: `CRUD stands for:
• **C**reate — Insert new records
• **R**ead — Fetch/display records
• **U**pdate — Modify existing records
• **D**elete — Remove records
These are the four basic database operations in any web application.`
  },
  {
    keywords: ['three tier', '3 tier', 'three-tier architecture', 'tier architecture'],
    answer: `Three-tier architecture separates an application into:
• **Presentation Layer** — UI (what user sees)
• **Business Logic Layer** — Processing and rules
• **Data Access Layer** — Database interaction
This improves maintainability and scalability.`
  },
  {
    keywords: ['entity framework', 'what is entity', 'orm', 'entity framework kya hai'],
    answer: `Entity Framework is an ORM (Object-Relational Mapper) for .NET that allows developers to interact with databases using C# objects instead of writing raw SQL queries.`
  },
  {
    keywords: ['connect c#', 'connect csharp', 'sql connection', 'database connection c#'],
    answer: `Connect C# with SQL Server using:
• **ADO.NET** — SqlConnection class with connection string
• **Entity Framework** — DbContext with connection string in appsettings.json
Connection string format: Server=myServer;Database=myDB;User Id=myUser;Password=myPass;`
  },
  {
    keywords: ['mvc', 'model view controller', 'mvc architecture', 'mvc kya hai'],
    answer: `MVC stands for Model-View-Controller:
• **Model** — Handles data and business logic
• **View** — Handles UI/display
• **Controller** — Handles user input and connects Model & View
It separates concerns for cleaner, maintainable code.`
  },

  // Project
  {
    keywords: ['explain project', 'your project', 'internship project', 'project explain karo'],
    answer: `The internship project is an **AI-Powered Career Guidance Platform** built using:
• Next.js 16, React 19, TypeScript
• Tailwind CSS for UI
• SQL Server + Prisma ORM for database
• Google Gemini AI for intelligent responses
• NextAuth.js for authentication
It provides career guidance through specialized AI agents.`
  },
  {
    keywords: ['problem solve', 'what problem', 'project solve', 'kya problem solve'],
    answer: `The platform solves the problem of students lacking personalized career guidance. It provides:
• Resume analysis with scoring
• Internship discovery
• Job search assistance
• Career consultation — all through AI agents`
  },
  {
    keywords: ['technologies used', 'tech stack', 'which technology', 'kaunsi technology'],
    answer: `Technologies used in the project:
• **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
• **Backend:** Next.js API Routes
• **Database:** SQL Server + Prisma ORM
• **AI:** Google Gemini API
• **Auth:** NextAuth.js`
  },
  {
    keywords: ['challenges', 'problems faced', 'difficulties', 'kya challenges'],
    answer: `Challenges faced and solutions:
• **AI response optimization** → API key rotation + model fallback
• **Multi-language support** → Batch translation API
• **Database integration** → Prisma ORM with SQL Server
• **File analysis** → Gemini multimodal API for PDF/image processing`
  },
  {
    keywords: ['test application', 'how tested', 'testing', 'kaise test kiya'],
    answer: `Application was tested through:
• Manual testing of all features and user flows
• API endpoint testing
• Cross-browser compatibility checks
• User scenario validation`
  },
  {
    keywords: ['improvements', 'future scope', 'what can improve', 'aur kya add kar sakte'],
    answer: `Possible improvements:
• Voice input support
• Mobile app version
• More specialized AI agents
• Real-time job listings integration
• Advanced ML-based resume scoring`
  },

  // AI Agent / Resume
  {
    keywords: ['what is ai agent', 'ai agent kya hai', 'how does agent work'],
    answer: `An AI Agent is an intelligent software system that uses large language models (like Google Gemini) to understand user queries and provide contextual, helpful responses in a specific domain.`
  },
  {
    keywords: ['resume analyzer', 'how resume analyzer', 'resume analysis kaise', 'resume analyzer work'],
    answer: `The Resume Analyzer evaluates your resume across 8 key areas:
1. Structure & Formatting (20 pts)
2. Career Objective (10 pts)
3. Technical Skills (20 pts)
4. Projects & Experience (20 pts)
5. Education (10 pts)
6. Achievements & Certifications (10 pts)
7. Language Quality (10 pts)
8. ATS Compatibility (10 pts)
Total Score: 100 points`
  },
  {
    keywords: ['input required', 'what to upload', 'resume input', 'kya upload karna'],
    answer: `For resume analysis, upload your resume in:
• PDF format
• Word (.doc/.docx) format
• Text (.txt) format
You can also mention the target job role for more relevant analysis.`
  },
  {
    keywords: ['evaluate candidate', 'how evaluate', 'skills evaluate', 'kaise evaluate'],
    answer: `The system evaluates candidates by:
• Analyzing resume content against industry standards
• Checking for relevant keywords and ATS compatibility
• Scoring completeness of each section
• Using Google Gemini AI for intelligent assessment`
  },
  {
    keywords: ['ai in recruitment', 'benefits of ai', 'ai recruitment benefits', 'ai ke fayde'],
    answer: `Benefits of AI in recruitment:
• Faster candidate screening
• Unbiased and consistent evaluation
• Keyword optimization feedback
• Actionable improvement suggestions
• 24/7 availability for candidates`
  },

  // Client / Business
  {
    keywords: ['services for college', 'college services', 'college ko kya dete', 'college ke liye'],
    answer: `NRsolution4u services for colleges:
• Custom website development
• ERP systems (attendance, fees, results)
• Training programs for students
• Workshops and seminars
📞 Contact: 8411064860`
  },
  {
    keywords: ['website development', 'website banate ho', 'educational website', 'college website'],
    answer: `Yes! NRsolution4u provides customized website development for colleges and educational institutes including responsive design, CMS, and student portals.`
  },
  {
    keywords: ['cost', 'price', 'kitna lagega', 'charges', 'fees for development'],
    answer: `Cost depends on features, design complexity, and requirements. Contact for a quote:
📞 8411064860
📧 contact.nrsolution4u@gmail.com`
  },
  {
    keywords: ['how long website', 'website kitne din', 'development time', 'time to develop'],
    answer: `A college website typically takes **2 to 6 weeks** to develop depending on scope and requirements.`
  },
  {
    keywords: ['maintenance', 'support service', 'after delivery', 'maintenance milega'],
    answer: `Yes! NRsolution4u provides ongoing maintenance and support services after project delivery.`
  },
  {
    keywords: ['erp', 'custom erp', 'erp solution', 'erp develop'],
    answer: `Yes! NRsolution4u develops custom ERP solutions tailored to specific client requirements including college ERP, attendance systems, and fee management.`
  },

  // HR / Soft Skills
  {
    keywords: ['tell me about yourself', 'apne bare mein batao', 'introduce yourself', 'self introduction'],
    answer: `I am a motivated student with strong interest in software development. I have knowledge of programming languages like C# and database systems like SQL Server. I completed my internship at NRsolution4u where I worked on real-time projects. I am eager to learn and apply my skills in real-world environments.`
  },
  {
    keywords: ['why join nrsolution', 'kyun join karna', 'why nrsolution4u', 'why do you want to join'],
    answer: `I want to join NRsolution4u to gain practical experience, work on real-time projects, and enhance my technical and professional skills under expert guidance from Mr. Nilesh Gupta and the team.`
  },
  {
    keywords: ['strength', 'weakness', 'strengths and weaknesses', 'apni weakness'],
    answer: `**Strengths:** Quick learner, strong problem-solving skills, dedicated and hardworking.
**Weakness:** Sometimes I focus too much on details, but I am actively improving my time management skills.`
  },
  {
    keywords: ['2 years', 'five years', 'future goal', 'where do you see', 'future mein'],
    answer: `In 2 years, I see myself as a skilled software developer working on advanced projects, contributing meaningfully to the organization, and continuously growing my technical expertise.`
  },
  {
    keywords: ['deadline', 'pressure', 'handle pressure', 'pressure kaise handle', 'stress'],
    answer: `I handle deadlines and pressure by:
• Prioritizing tasks based on urgency
• Breaking work into smaller milestones
• Managing time effectively with a schedule
• Staying focused and calm under pressure`
  },
]

/**
 * Normalize text — lowercase, remove punctuation, extra spaces
 */
function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

/**
 * Tokenize into individual words, removing common stop words
 */
function tokenize(text: string): string[] {
  const stopWords = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
    'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'it', 'they',
    'this', 'that', 'these', 'those', 'what', 'which', 'who', 'whom',
    'how', 'when', 'where', 'why', 'and', 'or', 'but', 'if', 'in', 'on',
    'at', 'to', 'for', 'of', 'with', 'by', 'from', 'about', 'as', 'into',
    'through', 'during', 'before', 'after', 'above', 'below', 'up', 'down',
    'out', 'off', 'over', 'under', 'again', 'then', 'so', 'than', 'too',
    'very', 'just', 'also', 'not', 'no', 'nor', 'both', 'either', 'neither',
    'me', 'tell', 'please', 'give', 'want', 'know', 'get', 'let', 'make',
    'kya', 'hai', 'hain', 'karo', 'karo', 'mujhe', 'batao', 'bata', 'de',
    'ka', 'ki', 'ke', 'ko', 'se', 'mein', 'par', 'aur', 'ya', 'nahi', 'koi'
  ])
  return normalize(text).split(' ').filter(w => w.length > 1 && !stopWords.has(w))
}

/**
 * Compute word overlap score between two token arrays
 */
function overlapScore(tokensA: string[], tokensB: string[]): number {
  const setB = new Set(tokensB)
  return tokensA.filter(t => setB.has(t)).length
}

/**
 * Partial word match — checks if any token from A is a substring of any token in B or vice versa
 */
function partialMatchScore(tokensA: string[], tokensB: string[]): number {
  let score = 0
  for (const a of tokensA) {
    for (const b of tokensB) {
      if (a.length >= 3 && b.length >= 3) {
        if (a.includes(b) || b.includes(a)) score += 1
      }
    }
  }
  return score
}

/**
 * Find best matching Q&A for a given user message using multi-layer matching:
 * 1. Exact keyword phrase match (highest priority)
 * 2. Word token overlap match
 * 3. Partial/substring word match (grammar-tolerant)
 * Returns answer string if match found, null otherwise
 */
export function findQAMatch(userMessage: string): string | null {
  const msg = normalize(userMessage)
  const msgTokens = tokenize(userMessage)

  let bestMatch: QA | null = null
  let bestScore = 0

  for (const qa of NRSOLUTION_QA) {
    let score = 0

    for (const keyword of qa.keywords) {
      const kw = normalize(keyword)
      const kwTokens = tokenize(keyword)

      // Layer 1: Exact phrase match — highest weight
      if (msg.includes(kw)) {
        score += kw.length * 3
        continue
      }

      // Layer 2: All tokens of keyword found in message
      const fullOverlap = overlapScore(kwTokens, msgTokens)
      if (fullOverlap === kwTokens.length && kwTokens.length > 0) {
        score += fullOverlap * 4
        continue
      }

      // Layer 3: Partial token overlap
      const partialOverlap = overlapScore(kwTokens, msgTokens)
      score += partialOverlap * 2

      // Layer 4: Substring/partial word match (handles typos, grammar variations)
      score += partialMatchScore(msgTokens, kwTokens)
    }

    if (score > bestScore) {
      bestScore = score
      bestMatch = qa
    }
  }

  // Threshold: must have meaningful match
  return bestScore >= 4 ? bestMatch!.answer : null
}
